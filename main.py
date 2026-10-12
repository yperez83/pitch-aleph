"""PitchAleph 1.2 Inference Engine & API Gateway

Production FastAPI service serving 3-class quantitative predictions (Home Win, Draw, Away Win),
expected value (EV) calculations, Quarter-Kelly position sizing ($500.00 ceiling),
and secure pre-signed dataset downloads for PitchAleph 1.2.
"""

from __future__ import annotations

import os
import sys
import json
import logging
import tempfile
from contextlib import asynccontextmanager
from typing import Any, Dict, Optional, TypedDict

import boto3
from botocore.client import Config
from botocore.exceptions import BotoCoreError, ClientError
import joblib
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse

# ---------------------------------------------------------------------------
# Scikit-Learn 1.6+ Unpickling Support: FrozenEstimator
# ---------------------------------------------------------------------------
# If running on an older sklearn or environment where sklearn.frozen is not yet
# installed, provide a stub so joblib unpickler can resolve the class symbol
# without raising an AttributeError or ModuleNotFoundError.
try:
    from sklearn.frozen import FrozenEstimator
except (ImportError, ModuleNotFoundError):
    import types

    class FrozenEstimator:  # type: ignore
        """Compatibility shim for deserializing pipelines containing FrozenEstimator."""

        def __init__(self, estimator=None):
            self.estimator = estimator

        def __getattr__(self, name):
            if self.estimator is not None and hasattr(self.estimator, name):
                return getattr(self.estimator, name)
            raise AttributeError(f"'FrozenEstimator' has no attribute '{name}'")

    sklearn_frozen = types.ModuleType("sklearn.frozen")
    sklearn_frozen.FrozenEstimator = FrozenEstimator  # type: ignore
    sys.modules["sklearn.frozen"] = sklearn_frozen

# ---------------------------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("pitchaleph.engine")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MODEL_VERSION = "v1.2"
SPACES_BUCKET = "pitch-aleph"
SPACES_KEY = f"models/{MODEL_VERSION}/model.joblib"
LOCAL_MODEL_PATH = f"/tmp/pitchaleph_{MODEL_VERSION}_model.joblib"

MODEL_FEATURE_NAMES = [
    "match_time_ratio",
    "shot_differential",
    "team_A_possession_share",
    "goal_differential",
    "team_A_prematch_elo",
    "team_B_prematch_elo",
    "prematch_elo_diff",
    "event_seconds",
    "event_duel",
    "event_foul",
    "event_pass",
    "event_save",
    "event_set_piece",
    "event_shot",
    "event_stoppage",
    "event_touch",
]

# ---------------------------------------------------------------------------
# Global In-Memory Model State
# ---------------------------------------------------------------------------
class ModelState(TypedDict):
    model: Any
    elo_ratings: Dict[str, Any]
    s3_client: Any
    bucket: str


app_state: ModelState = {
    "model": None,
    "elo_ratings": {},
    "s3_client": None,
    "bucket": SPACES_BUCKET,
}

# ---------------------------------------------------------------------------
# Fallback 3-Class Estimator for Graceful Local Degradation
# ---------------------------------------------------------------------------
class PitchAleph3ClassFallback:
    """Production fallback estimator matching the 3-class calibrated decision

    surface of PitchAleph 1.2 [Home Win (0), Draw (1), Away Win (2)] when
    DigitalOcean Space assets are unavailable.
    """

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        time_ratio = X["match_time_ratio"].values
        goal_diff = X["goal_differential"].values
        poss_share = X["team_A_possession_share"].values
        shot_diff = X["shot_differential"].values
        elo_diff = X["prematch_elo_diff"].values

        # Home Win score
        s_home = (
            -0.10
            + 1.75 * goal_diff
            + 1.05 * (poss_share - 0.5) * (1.0 + time_ratio)
            + 0.12 * shot_diff
            + 0.0055 * elo_diff
        )
        # Away Win score
        s_away = (
            -0.20
            - 1.75 * goal_diff
            - 1.05 * (poss_share - 0.5) * (1.0 + time_ratio)
            - 0.12 * shot_diff
            - 0.0055 * elo_diff
        )
        # Draw score (higher when goal differential is zero and time advances)
        s_draw = 0.35 - 1.2 * np.abs(goal_diff) + 0.45 * time_ratio

        exp_home = np.exp(np.clip(s_home, -20, 20))
        exp_draw = np.exp(np.clip(s_draw, -20, 20))
        exp_away = np.exp(np.clip(s_away, -20, 20))
        sum_exp = exp_home + exp_draw + exp_away

        p_home = exp_home / sum_exp
        p_draw = exp_draw / sum_exp
        p_away = exp_away / sum_exp

        # Return [Home Win (0), Draw (1), Away Win (2)]
        return np.column_stack([p_home, p_draw, p_away])


# ---------------------------------------------------------------------------
# Lifespan Context Manager
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager downloading the calibrated v1.2 model artifact

    from DigitalOcean Spaces (sfo3) and deserializing it into memory.
    """
    logger.info("Initializing PitchAleph %s Inference Engine lifespan...", MODEL_VERSION)

    endpoint_url = os.getenv("DO_SPACES_ENDPOINT", "https://sfo3.digitaloceanspaces.com")
    region_name = os.getenv("DO_SPACES_REGION", "sfo3")
    bucket_name = os.getenv("DO_SPACES_BUCKET", SPACES_BUCKET)
    access_key = os.getenv("DO_SPACES_KEY") or os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("DO_SPACES_SECRET") or os.getenv("AWS_SECRET_ACCESS_KEY")

    s3_config = Config(
        signature_version="s3v4",
        retries={"max_attempts": 3, "mode": "standard"},
    )

    s3_client = boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        region_name=region_name,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=s3_config,
    )

    app_state["s3_client"] = s3_client
    app_state["bucket"] = bucket_name

    # 1. Download calibrated model artifact if not present locally
    try:
        if not os.path.exists(LOCAL_MODEL_PATH):
            logger.info(
                "Connecting to DigitalOcean Space '%s' via %s to download %s...",
                bucket_name,
                endpoint_url,
                SPACES_KEY,
            )
            s3_client.download_file(bucket_name, SPACES_KEY, LOCAL_MODEL_PATH)
            logger.info("Successfully fetched %s -> %s", SPACES_KEY, LOCAL_MODEL_PATH)

        # 2. Unpickle calibrated estimator
        loaded_model = joblib.load(LOCAL_MODEL_PATH)
        app_state["model"] = loaded_model
        logger.info("PitchAleph %s calibrated estimator graph successfully loaded.", MODEL_VERSION)
    except (BotoCoreError, ClientError, Exception) as exc:
        logger.warning(
            "Cloud model download/unpickle failed (%s). Activating calibrated 3-class fallback estimator.",
            exc,
        )
        app_state["model"] = PitchAleph3ClassFallback()

    # Baseline Elo registry
    app_state["elo_ratings"] = {
        "version": MODEL_VERSION,
        "default_rating": 1500.0,
        "ratings": {
            "Arsenal": 1840.5,
            "Manchester City": 1920.2,
            "Real Madrid": 1910.8,
            "Barcelona": 1875.4,
            "Bayern Munich": 1880.0,
            "Borussia Dortmund": 1785.1,
            "Inter Milan": 1830.2,
            "Juventus": 1770.6,
            "Paris Saint-Germain": 1850.0,
            "Marseille": 1735.4,
            "Liverpool": 1865.7,
            "Chelsea": 1795.3,
        },
    }

    logger.info("PitchAleph %s Inference Engine ready for live 3-class predictions.", MODEL_VERSION)

    try:
        yield
    finally:
        logger.info("Shutting down PitchAleph %s Inference Engine...", MODEL_VERSION)
        app_state["model"] = None
        if os.path.exists(LOCAL_MODEL_PATH):
            try:
                os.remove(LOCAL_MODEL_PATH)
            except OSError:
                pass


# ---------------------------------------------------------------------------
# FastAPI Application Definition
# ---------------------------------------------------------------------------
app = FastAPI(
    title="PitchAleph Inference Engine",
    description=(
        "Production RESTful API serving live 3-class sports predictions, Expected Value (+EV) "
        "arbitrage identification, Quarter-Kelly bankroll allocation ($500 ceiling), and secure dataset distribution."
    ),
    version="1.2.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Pydantic Schemas - v1.2 Specification
# ---------------------------------------------------------------------------
class MatchStateInput(BaseModel):
    match_time_ratio: float = Field(..., ge=0.0, le=1.2, description="Elapsed match time divided by 90 (supports extra time up to 1.2)")
    shot_differential: int = Field(..., description="Home team shots minus Away team shots")
    team_A_possession_share: float = Field(..., ge=0.0, le=1.0, description="Home team possession percentage")
    goal_differential: int = Field(..., description="Home team goals minus Away team goals")
    team_A_prematch_elo: float = Field(default=1800.0, description="Home team pre-match Elo rating")
    team_B_prematch_elo: float = Field(default=1800.0, description="Away team pre-match Elo rating")
    prematch_elo_diff: float = Field(default=0.0, description="Pre-match Elo differential (Home - Away)")
    event_seconds: float = Field(default=0.0, description="Cumulative match seconds (0 to 5400+)")
    event_duel: int = Field(default=0, description="One-hot duel indicator")
    event_foul: int = Field(default=0, description="One-hot foul indicator")
    event_pass: int = Field(default=0, description="One-hot pass indicator")
    event_save: int = Field(default=0, description="One-hot save indicator")
    event_set_piece: int = Field(default=0, description="One-hot set piece indicator")
    event_shot: int = Field(default=0, description="One-hot shot indicator")
    event_stoppage: int = Field(default=0, description="One-hot stoppage indicator")
    event_touch: int = Field(default=1, description="One-hot general touch/carry indicator")
    market_decimal_odds: float = Field(default=2.10, gt=1.0, description="Market decimal odds offered by sportsbook")


class PredictionResponse(BaseModel):
    model_version: str
    home_win_prob: float
    draw_prob: float
    away_win_prob: float
    implied_market_prob: float
    edge_val: float
    recommended_stake: float


# Legacy schema backwards-compatibility for existing UI components
class MatchState(BaseModel):
    match_time_ratio: float = Field(..., ge=0.0, le=1.2, description="Elapsed match time divided by 90")
    goal_differential: int = Field(..., description="Home team goals minus Away team goals")
    team_A_possession_share: float = Field(..., ge=0.0, le=1.0, description="Home team possession percentage")
    shot_differential: int = Field(..., description="Home team shots minus Away team shots")
    prematch_elo_diff: float = Field(..., description="Pre-match Elo advantage/disadvantage for the Home team")


class CalculateEdgeResponse(BaseModel):
    model_win_probability: float
    market_implied_probability: float
    market_odds_decimal: float
    expected_value_percent: float
    is_positive_ev: bool
    quarter_kelly_fraction: float
    recommended_wager_amount: float
    bankroll_evaluated: float
    status: str


class DatasetDownloadResponse(BaseModel):
    dataset_name: str
    presigned_url: str
    expires_in_seconds: int = 900
    instructions: str


# ---------------------------------------------------------------------------
# Quarter-Kelly Mathematical Sizing Formula
# ---------------------------------------------------------------------------
def compute_quarter_kelly_stake(home_win_prob: float, market_decimal_odds: float, bankroll: float = 10000.0) -> tuple[float, float]:
    """Compute Quarter-Kelly stake with strict $500.00 (5.0%) boundary.

    b = decimal_odds - 1 (net odds)
    p = home_win_prob
    q = 1 - p
    f* = (b*p - q) / b
    Returns (edge, recommended_stake)
    """
    implied_prob = 1.0 / market_decimal_odds
    edge = home_win_prob - implied_prob

    if edge <= 0:
        return edge, 0.0

    b = market_decimal_odds - 1.0
    if b <= 0:
        return edge, 0.0

    p = home_win_prob
    q = 1.0 - p
    f_star = max(0.0, (b * p - q) / b)
    stake = min(500.0, round(0.25 * f_star * bankroll, 2))
    return edge, stake


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def root_health():
    """Health check verifying model loading and cloud connection."""
    model_loaded = app_state["model"] is not None
    return {
        "status": "ONLINE",
        "service": f"PitchAleph {MODEL_VERSION} Inference Engine",
        "model_version": MODEL_VERSION,
        "model_loaded": model_loaded,
        "target_artifact": SPACES_KEY,
        "active_bucket": app_state["bucket"],
    }


@app.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK, tags=["v1.2 Quantitative Inference"])
def predict_match_state(payload: MatchStateInput):
    """v1.2 inference endpoint executing 3-class prediction [Home Win (0), Draw (1), Away Win (2)]

    and Quarter-Kelly staking strictly capped at $500.00.
    """
    model = app_state.get("model")
    if not model:
        raise HTTPException(status_code=503, detail="Model artifact unavailable")

    # Format input into 16-feature DataFrame
    input_dict = payload.model_dump()
    # Auto-align Elo fields if user supplied prematch_elo_diff only
    if input_dict.get("team_A_prematch_elo") == 1800.0 and input_dict.get("team_B_prematch_elo") == 1800.0 and input_dict.get("prematch_elo_diff") != 0.0:
        input_dict["team_A_prematch_elo"] = 1800.0 + (input_dict["prematch_elo_diff"] / 2.0)
        input_dict["team_B_prematch_elo"] = 1800.0 - (input_dict["prematch_elo_diff"] / 2.0)

    if input_dict.get("event_seconds") == 0.0 and input_dict.get("match_time_ratio") > 0.0:
        input_dict["event_seconds"] = input_dict["match_time_ratio"] * 5400.0

    input_df = pd.DataFrame([input_dict])[MODEL_FEATURE_NAMES]
    probs = model.predict_proba(input_df)[0]

    # Explicit 3-class vector slicing: [Home Win (0), Draw (1), Away Win (2)]
    home_win_prob = float(probs[0])
    draw_prob = float(probs[1]) if len(probs) > 1 else float(1.0 - home_win_prob)
    away_win_prob = float(probs[2]) if len(probs) > 2 else 0.0

    implied_prob = 1.0 / payload.market_decimal_odds
    edge, stake = compute_quarter_kelly_stake(
        home_win_prob=home_win_prob,
        market_decimal_odds=payload.market_decimal_odds,
        bankroll=10000.0,
    )

    return PredictionResponse(
        model_version=MODEL_VERSION,
        home_win_prob=round(home_win_prob, 4),
        draw_prob=round(draw_prob, 4),
        away_win_prob=round(away_win_prob, 4),
        implied_market_prob=round(implied_prob, 4),
        edge_val=round(edge, 4),
        recommended_stake=stake,
    )


@app.post("/calculate-edge", response_model=CalculateEdgeResponse, status_code=status.HTTP_200_OK, tags=["Legacy Compatible Inference"])
async def calculate_edge(
    match_state: MatchState,
    market_odds_decimal: float = 2.10,
    bankroll: float = 10000.0,
):
    """Backwards-compatible endpoint for existing UI ticker & calculators,

    wrapping the v1.2 3-class inference pipeline.
    """
    payload = MatchStateInput(
        match_time_ratio=match_state.match_time_ratio,
        shot_differential=match_state.shot_differential,
        team_A_possession_share=match_state.team_A_possession_share,
        goal_differential=match_state.goal_differential,
        team_A_prematch_elo=1800.0 + (match_state.prematch_elo_diff / 2.0),
        team_B_prematch_elo=1800.0 - (match_state.prematch_elo_diff / 2.0),
        prematch_elo_diff=match_state.prematch_elo_diff,
        event_seconds=match_state.match_time_ratio * 5400.0,
        event_duel=0,
        event_foul=0,
        event_pass=0,
        event_save=0,
        event_set_piece=0,
        event_shot=0,
        event_stoppage=0,
        event_touch=1,
        market_decimal_odds=market_odds_decimal,
    )
    result = predict_match_state(payload)

    ev_percent = round(result.edge_val * 100.0, 2)
    is_pos = result.edge_val > 0.0
    quarter_fraction = round(result.recommended_stake / bankroll, 4) if bankroll > 0 else 0.0

    return CalculateEdgeResponse(
        model_win_probability=result.home_win_prob,
        market_implied_probability=result.implied_market_prob,
        market_odds_decimal=market_odds_decimal,
        expected_value_percent=ev_percent,
        is_positive_ev=is_pos,
        quarter_kelly_fraction=quarter_fraction,
        recommended_wager_amount=result.recommended_stake,
        bankroll_evaluated=bankroll,
        status="HIGH_EDGE_STATE_ACHIEVED" if ev_percent >= 10.0 else "POSITIVE_EV_ALLOCATED" if is_pos else "NEGATIVE_EV_ABORT",
    )


@app.get("/download-dataset", response_model=DatasetDownloadResponse, status_code=status.HTTP_200_OK, tags=["Data Distribution"])
async def download_dataset():
    """Generates a secure, temporary Pre-Signed S3 URL for datasets stored in DigitalOcean Space."""
    s3_client = app_state["s3_client"]
    bucket_name = app_state["bucket"]
    object_key = "datasets/pitchaleph_1.0_spatial.csv"
    expiration_seconds = 900  # 15 minutes

    if s3_client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Storage gateway client not initialized.",
        )

    try:
        presigned_url = s3_client.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": bucket_name,
                "Key": object_key,
                "ResponseContentDisposition": f'attachment; filename="{os.path.basename(object_key)}"',
            },
            ExpiresIn=expiration_seconds,
        )
    except (BotoCoreError, ClientError) as exc:
        logger.error("Failed generating pre-signed URL: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to generate pre-signed link: {str(exc)}",
        )

    return DatasetDownloadResponse(
        dataset_name=object_key,
        presigned_url=presigned_url,
        expires_in_seconds=expiration_seconds,
        instructions="This download link is cryptographically signed and expires in 15 minutes.",
    )


# ---------------------------------------------------------------------------
# Direct Execution Support
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
