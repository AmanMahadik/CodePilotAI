const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DIAGRAMS = [
  {
    input: path.join(__dirname, '..', 'UML_Practicals', 'class_diagram.mmd'),
    output: path.join(__dirname, '..', 'UML_Practicals', 'CodePilot_AI_Class_Diagram.png'),
    name: 'Class Diagram',
  },
  {
    input: path.join(__dirname, '..', 'UML_Practicals', 'state_machine_diagram.mmd'),
    output: path.join(__dirname, '..', 'UML_Practicals', 'CodePilot_AI_State_Machine_Diagram.png'),
    name: 'State Machine Diagram',
  },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const mermaidJs = fs.readFileSync(path.join(__dirname, 'mermaid.min.js'), 'utf-8');

  for (const diagram of DIAGRAMS) {
    console.log(`Rendering ${diagram.name}...`);
    const mmdContent = fs.readFileSync(diagram.input, 'utf-8');

    const page = await browser.newPage();
    await page.setViewport({ width: 3200, height: 2400, deviceScaleFactor: 2 });

    const html = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #ffffff; display: flex; justify-content: center; align-items: flex-start; padding: 40px; min-height: 100vh; }
  #container { background: #ffffff; padding: 20px; }
</style>
</head>
<body>
  <div id="container">
    <pre class="mermaid">${mmdContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </div>
  <script>${mermaidJs}</script>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      themeVariables: {
        background: '#ffffff',
        primaryColor: '#dbeafe',
        primaryTextColor: '#1e293b',
        primaryBorderColor: '#3b82f6',
        lineColor: '#475569',
        secondaryColor: '#e0e7ff',
        tertiaryColor: '#f0f9ff',
        mainBkg: '#dbeafe',
        nodeBorder: '#3b82f6',
        clusterBkg: '#f0f9ff',
        clusterBorder: '#94a3b8',
        titleColor: '#0f172a',
        edgeLabelBackground: '#ffffff',
        textColor: '#1e293b',
        classText: '#1e293b',
        labelTextColor: '#1e293b',
        composit: '#f0f9ff',
        compositBorder: '#94a3b8',
        compositTitleBackground: '#dbeafe',
        innerEndBackground: '#dbeafe',
        specialStateColor: '#1e293b'
      },
      securityLevel: 'loose',
      fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif',
      fontSize: 14,
      class: { useMaxWidth: false },
      state: { useMaxWidth: false },
    });
  </script>
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for mermaid to render
    await page.waitForFunction(() => {
      const svgs = document.querySelectorAll('svg.mermaid');
      return svgs.length > 0 || document.querySelector('[id^="mermaid-"]');
    }, { timeout: 15000 });

    await new Promise(r => setTimeout(r, 2000));

    // Get the rendered SVG bounding box
    const svgElement = await page.$('svg') || await page.$('[id^="mermaid-"]');
    if (!svgElement) {
      console.error(`No SVG found for ${diagram.name}`);
      await page.close();
      continue;
    }

    const bbox = await svgElement.boundingBox();
    if (!bbox) {
      console.error(`No bounding box for ${diagram.name}`);
      await page.close();
      continue;
    }

    // Add padding around the diagram
    const padding = 60;
    await page.screenshot({
      path: diagram.output,
      type: 'png',
      clip: {
        x: Math.max(0, bbox.x - padding),
        y: Math.max(0, bbox.y - padding),
        width: bbox.width + padding * 2,
        height: bbox.height + padding * 2,
      },
    });

    console.log(`  ✓ Saved: ${diagram.output}`);
    console.log(`  Dimensions: ${Math.round(bbox.width)}x${Math.round(bbox.height)}px`);
    await page.close();
  }

  await browser.close();
  console.log('\nAll diagrams rendered successfully!');
})();
