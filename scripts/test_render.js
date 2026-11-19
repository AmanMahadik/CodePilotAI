const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testRender() {
  console.log('Testing Mermaid to PNG render...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1800, height: 1200, deviceScaleFactor: 2 });

  const mermaidJs = fs.readFileSync(path.resolve('c:/CodePilotAI/scripts/mermaid.min.js'), 'utf8');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body {
        margin: 0;
        padding: 40px;
        background: #F8FAFC;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
      }
      .title {
        font-size: 20px;
        font-weight: 700;
        color: #0F172A;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 2px solid #3B82F6;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .badge {
        font-size: 11px;
        font-family: monospace;
        background: #EFF6FF;
        color: #1D4ED8;
        border: 1px solid #3B82F6;
        border-radius: 6px;
        padding: 4px 10px;
      }
    </style>
    <script>${mermaidJs}</script>
  </head>
  <body>
    <div class="card" id="diagram-container">
      <div class="title">
        <span>Assignment 2: Use Case Diagram</span>
        <span class="badge">UML 2.5 Standard</span>
      </div>
      <div class="mermaid">
        flowchart LR
          A[Student Developer] --> B(GitHub OAuth)
          B --> C[Workspace]
      </div>
    </div>
    <script>
      mermaid.initialize({
        startOnLoad: true,
        theme: 'neutral',
        flowchart: { useMaxWidth: false, htmlLabels: true }
      });
    </script>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.mermaid svg');

  const container = await page.$('#diagram-container');
  await container.screenshot({ path: 'c:/CodePilotAI/test_render.png' });

  await browser.close();
  console.log('✅ Render successful: test_render.png created!');
}

testRender().catch(err => {
  console.error('Render test error:', err);
  process.exit(1);
});
