const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3080;
const CDP_PORT = 9222;
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'scratch');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function sendCdpCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (e) {
        // ignore other messages
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  // Ensure local server is running
  let serverProc = null;
  try {
    await fetchJson(`http://localhost:${PORT}/`);
  } catch (e) {
    console.log(`Starting local server on port ${PORT}...`);
    serverProc = spawn('node', [path.join(__dirname, 'serve.js')], {
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'ignore'
    });
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('Launching Edge with CDP on port', CDP_PORT);
  const edgeProc = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  // Wait for CDP to be up
  let targets = null;
  for (let i = 0; i < 20; i++) {
    try {
      targets = await fetchJson(`http://localhost:${CDP_PORT}/json`);
      if (targets && targets.length > 0) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  if (!targets) {
    console.error('Failed to connect to CDP');
    edgeProc.kill();
    process.exit(1);
  }

  // Find a page target or create one
  let pageTarget = targets.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  console.log('Connected to CDP WebSocket');
  await sendCdpCommand(ws, 'Page.enable');
  await sendCdpCommand(ws, 'DOM.enable');

  const tests = [
    { name: 'shot_mobile_home_true_v2.png', url: `http://localhost:${PORT}/`, width: 390, height: 844, mobile: true, scale: 2 },
    { name: 'shot_mobile_fuellink_true_v2.png', url: `http://localhost:${PORT}/work/fuellinkpro/index.html`, width: 390, height: 844, mobile: true, scale: 2 },
    { name: 'shot_tablet_home_true_v2.png', url: `http://localhost:${PORT}/`, width: 768, height: 1024, mobile: true, scale: 2 },
    { name: 'shot_desktop_home_true_v2.png', url: `http://localhost:${PORT}/`, width: 1440, height: 900, mobile: false, scale: 1 },
    { name: 'shot_desktop_filter_bar.png', url: `http://localhost:${PORT}/`, width: 1440, height: 900, mobile: false, scale: 1, scrollTo: '#selectedWorkHeading', block: 'start' },
    { name: 'shot_desktop_about_section.png', url: `http://localhost:${PORT}/`, width: 1440, height: 900, mobile: false, scale: 1, scrollTo: '#aboutHeading', block: 'start' },
    { name: 'shot_desktop_contact_section.png', url: `http://localhost:${PORT}/`, width: 1440, height: 900, mobile: false, scale: 1, scrollTo: '#contactHeading', block: 'start' }
  ];

  for (const t of tests) {
    console.log(`\nNavigating to ${t.url} (${t.width}x${t.height}, mobile=${t.mobile})`);
    
    // Set device metrics
    await sendCdpCommand(ws, 'Emulation.setDeviceMetricsOverride', {
      width: t.width,
      height: t.height,
      deviceScaleFactor: t.scale,
      mobile: t.mobile
    });

    await sendCdpCommand(ws, 'Page.navigate', { url: t.url });
    await new Promise(r => setTimeout(r, 1500)); // wait for layout/render

    if (t.scrollTo) {
      await sendCdpCommand(ws, 'Runtime.evaluate', {
        expression: `document.querySelector('${t.scrollTo}')?.scrollIntoView({ behavior: 'instant', block: '${t.block || 'start'}' })`
      });
      await new Promise(r => setTimeout(r, 800));
    }

    // Diagnose overflows
    const evalRes = await sendCdpCommand(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const overflows = [];
        document.querySelectorAll('*').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.right > docW + 1) {
            overflows.push({
              tag: el.tagName,
              cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 40) : '',
              id: el.id || '',
              right: Math.round(r.right),
              width: Math.round(r.width)
            });
          }
        });
        return {
          clientWidth: docW,
          scrollWidth: scrollW,
          hasOverflow: scrollW > docW,
          overflowCount: overflows.length,
          sample: overflows.slice(0, 6)
        };
      })()`,
      returnByValue: true
    });

    console.log('Layout diagnostics for', t.name, ':', JSON.stringify(evalRes.result.value, null, 2));

    // Capture screenshot
    const shotRes = await sendCdpCommand(ws, 'Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shotRes.data, 'base64');
    const outPath = path.join(OUTPUT_DIR, t.name);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot to ${outPath} (${buffer.length} bytes)`);
  }

  // Interactive Assistant Verification Test
  console.log('\nTesting Interactive AI Portfolio Assistant on desktop...');
  await sendCdpCommand(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sendCdpCommand(ws, 'Page.navigate', { url: `http://localhost:${PORT}/` });
  await new Promise(r => setTimeout(r, 1200));

  // Trigger assistant query
  await sendCdpCommand(ws, 'Runtime.evaluate', {
    expression: `window.openPortfolioAssistant("What was Thabang's architecture for FuelLinkPro?")`
  });
  await new Promise(r => setTimeout(r, 2500)); // wait for grounding and rendering

  const modalShot = await sendCdpCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  const modalBuffer = Buffer.from(modalShot.data, 'base64');
  const modalOutPath = path.join(OUTPUT_DIR, 'shot_assistant_modal_active.png');
  fs.writeFileSync(modalOutPath, modalBuffer);
  console.log(`Saved assistant modal screenshot to ${modalOutPath} (${modalBuffer.length} bytes)`);

  ws.close();
  edgeProc.kill();
  if (serverProc) serverProc.kill();
  console.log('\nAll responsive captures and diagnostics completed successfully.');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
