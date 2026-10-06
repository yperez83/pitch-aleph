import { NextResponse } from 'next/server';

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pitch Aleph API — Interactive Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <style>
    body {
      margin: 0;
      background: #0b1120;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .topbar-header {
      background: #030712;
      border-bottom: 1px solid #1f2937;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .topbar-title {
      font-weight: 700;
      font-size: 16px;
      letter-spacing: -0.02em;
      color: #10b981;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .topbar-badge {
      font-size: 11px;
      font-family: monospace;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .topbar-links a {
      color: #94a3b8;
      text-decoration: none;
      font-size: 13px;
      margin-left: 16px;
      transition: color 0.2s;
    }
    .topbar-links a:hover {
      color: #f1f5f9;
    }
    /* Swagger UI Dark Mode Adaptations */
    .swagger-ui {
      filter: invert(88%) hue-rotate(180deg);
    }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div class="topbar-header">
    <div class="topbar-title">
      <span>ℵ Pitch Aleph API Reference</span>
      <span class="topbar-badge">v1.0.0</span>
    </div>
    <div class="topbar-links">
      <a href="/api/openapi.json" target="_blank">Raw OpenAPI JSON</a>
      <a href="/">← Back to App</a>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
