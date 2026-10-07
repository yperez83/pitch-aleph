export const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'Pitch Aleph Quantitative Betting Engine API',
    version: '1.0.0',
    description:
      'Public RESTful API for Pitch Aleph. Exposes programmatic access to the Data Vault matches, 1,000-Match Backtest ledger, and the mathematical Bet Simulator engine. Note: This environment operates as an interactive sandbox/demo; create, update, and delete mutations persist in-memory for the active runtime instance.',
    contact: {
      name: 'Pitch Aleph Engineering',
      url: 'https://pitchaleph.com'
    }
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Current Environment API v1'
    }
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Provide your Pitch Aleph API Key. Example: `aleph_demo_key_2026`'
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Alternative Bearer token authentication header.'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'UNAUTHORIZED' },
              message: { type: 'string', example: 'API Key is missing or invalid.' },
              details: { type: 'string' }
            },
            required: ['code', 'message']
          }
        }
      },
      MatchStoryStep: {
        type: 'object',
        properties: {
          title: { type: 'string', example: '1. Regime Shift Detection' },
          text: { type: 'string', example: 'Defensive block collapsed by 15 meters.' },
          code: { type: 'string', example: 'select_halfspaces = df[...]' }
        },
        required: ['title', 'text', 'code']
      },
      Match: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '3857276' },
          title: { type: 'string', example: 'Canada vs Morocco' },
          status: { type: 'string', enum: ['PASS', 'FAIL'], example: 'PASS' },
          ev: { type: 'string', example: '+16.8% EV' },
          minute: { type: 'string', example: "84' Decision" },
          date: { type: 'string', example: '2022-12-01' },
          story: {
            type: 'array',
            items: { $ref: '#/components/schemas/MatchStoryStep' }
          }
        },
        required: ['id', 'title', 'status', 'ev', 'date']
      },
      CreateMatchInput: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '3857999' },
          title: { type: 'string', example: 'Brazil vs Croatia' },
          status: { type: 'string', enum: ['PASS', 'FAIL'], example: 'PASS' },
          ev: { type: 'string', example: '+19.4% EV' },
          minute: { type: 'string', example: "78' Decision" },
          date: { type: 'string', example: '2022-12-09' },
          story: {
            type: 'array',
            items: { $ref: '#/components/schemas/MatchStoryStep' }
          }
        },
        required: ['title', 'status', 'ev']
      },
      UpdateMatchInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          status: { type: 'string', enum: ['PASS', 'FAIL'] },
          ev: { type: 'string' },
          minute: { type: 'string' },
          date: { type: 'string' }
        }
      },
      BacktestTrade: {
        type: 'object',
        properties: {
          trade: { type: 'integer', example: 1 },
          bankroll: { type: 'number', example: 9906 }
        },
        required: ['trade', 'bankroll']
      },
      SimulationRequest: {
        type: 'object',
        properties: {
          stake: { type: 'number', example: 1000, description: 'Base stake in USD' },
          matchId: { type: 'string', example: '3857276', description: 'Target match ID from Data Vault' },
          caseKey: { type: 'string', enum: ['2022', '2018', 'ksa', 'ned'], example: '2022' },
          strategy: { type: 'string', enum: ['kelly_fractional', 'flat', 'aggressive'], default: 'kelly_fractional' }
        },
        required: ['stake']
      },
      SimulationResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              simulationId: { type: 'string', example: 'sim_1728212400000_a1b2c' },
              timestamp: { type: 'string', example: '2026-10-06T11:20:00.000Z' },
              stake: { type: 'number', example: 1000 },
              scenario: { type: 'string', example: 'ARG vs FRA (2022 Final)' },
              status: { type: 'string', enum: ['PASS', 'FAIL', 'HEDGE'], example: 'PASS' },
              marketOdds: { type: 'string', example: '+150 (40.0% implied)' },
              modelExpectedValue: { type: 'string', example: '+25.0%' },
              modelProbability: { type: 'string', example: '65.0%' },
              publicOutcome: {
                type: 'object',
                properties: {
                  pnl: { type: 'number', example: 1500 },
                  description: { type: 'string', example: 'Wins $1,500 (Lucky bet, negative long-term EV)' }
                }
              },
              pitchAlephOutcome: {
                type: 'object',
                properties: {
                  pnl: { type: 'number', example: 1500 },
                  description: { type: 'string', example: 'Wins $1,500 (Secured massive +EV mathematical edge)' }
                }
              }
            }
          }
        }
      }
    }
  },
  security: [
    { ApiKeyAuth: [] },
    { BearerAuth: [] }
  ],
  paths: {
    '/matches': {
      get: {
        summary: 'List all Data Vault matches',
        description: 'Returns all analyzed match scenarios with optional status and text search filtering.',
        parameters: [
          {
            name: 'status',
            in: 'query',
            description: 'Filter by model signal status (PASS or FAIL)',
            schema: { type: 'string', enum: ['ALL', 'PASS', 'FAIL'] }
          },
          {
            name: 'search',
            in: 'query',
            description: 'Case-insensitive search query matching team names or match ID',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'List of match scenarios retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 20 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Match' }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Missing or invalid API key',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          '500': {
            description: 'Internal server error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      },
      post: {
        summary: 'Register a new match scenario',
        description: 'Creates a new match backtest scenario in the Data Vault. (Sandbox Demo: changes are stored in-memory for the active runtime instance).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMatchInput' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Match scenario created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Match created successfully.' },
                    data: { $ref: '#/components/schemas/Match' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad Request - Validation failure or malformed payload',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          '401': {
            description: 'Unauthorized - Missing or invalid API key',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          '500': {
            description: 'Internal server error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/matches/{id}': {
      get: {
        summary: 'Get match by ID',
        description: 'Returns granular quantitative details and tactical breakdown steps for a specific match.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The unique Match ID',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Match details retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Match' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Missing or invalid API key',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          '404': {
            description: 'Match not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          '500': {
            description: 'Internal server error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      },
      put: {
        summary: 'Update match scenario',
        description: 'Updates properties of an existing match scenario. (Sandbox Demo: updates persist in-memory for the active runtime instance).',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The unique Match ID',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMatchInput' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Match updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Match updated successfully.' },
                    data: { $ref: '#/components/schemas/Match' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad Request',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          '404': {
            description: 'Match not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      },
      delete: {
        summary: 'Delete match scenario',
        description: 'Removes a match scenario from the active Data Vault ledger. (Sandbox Demo: deletions apply in-memory for the active runtime instance).',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The unique Match ID',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Match deleted successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Match with ID deleted successfully.' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          '404': {
            description: 'Match not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/backtest': {
      get: {
        summary: 'Get backtest P&L ledger',
        description: 'Returns the trade-by-trade cumulative bankroll performance ledger across 522 executions.',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Number of trade records to return (default: all 522 trades)',
            schema: { type: 'integer', example: 50 }
          }
        ],
        responses: {
          '200': {
            description: 'Backtest ledger returned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 522 },
                    initialBankroll: { type: 'number', example: 10000 },
                    currentBankroll: { type: 'number', example: 38450 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/BacktestTrade' }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/simulate': {
      post: {
        summary: 'Run mathematical bet simulator',
        description:
          'Evaluates a user base stake against Pitch Aleph quantitative expectation models and returns comparative expected outcome vs public bettor outcome.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SimulationRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Simulation calculation succeeded.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SimulationResponse' }
              }
            }
          },
          '400': {
            description: 'Bad Request - Missing or invalid stake parameter',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          '401': {
            description: 'Unauthorized - Missing or invalid API key',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    }
  }
};
