const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 3080;
const CDP_PORT = 9222;
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'scratch');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
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
      } catch (e) {}
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  // Ensure local server
  try {
    await fetchJson(`http://localhost:${PORT}/`);
  } catch (e) {
    console.log(`Starting local server on port ${PORT}...`);
    spawn('node', [path.join(__dirname, '..', 'scripts', 'serve.js')], {
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'ignore'
    });
    await new Promise(r => setTimeout(r, 1200));
  }

  const tmpProfile = path.join(OUTPUT_DIR, 'edge_cdp_profile');
  const edgeProc = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpProfile}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

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

  let pageTarget = targets.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  await sendCdpCommand(ws, 'Page.enable');
  await sendCdpCommand(ws, 'DOM.enable');

  const pages = [
    '/',
    '/about/index.html',
    '/work/index.html',
    '/experience/index.html',
    '/research/index.html',
    '/contact/index.html',
    '/work/fuellinkpro/index.html',
    '/work/skills-mapping/index.html',
    '/work/darkroom-dataforge/index.html',
    '/work/verifysa/index.html',
    '/work/tut-event-management/index.html'
  ];

  const viewports = [
    { name: '320x568 (iPhone SE / Ultra Small)', width: 320, height: 568 },
    { name: '360x780 (Small Android/Galaxy S8)', width: 360, height: 780 },
    { name: '390x844 (iPhone 12/13/14/15)', width: 390, height: 844 },
    { name: '412x915 (Pixel 7 / Samsung S21)', width: 412, height: 915 }
  ];

  const results = [];

  for (const page of pages) {
    console.log(`\n======================================================`);
    console.log(`Auditing Page: ${page}`);
    console.log(`======================================================`);

    for (const vp of viewports) {
      await sendCdpCommand(ws, 'Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: true
      });

      await sendCdpCommand(ws, 'Page.navigate', { url: `http://localhost:${PORT}${page}` });
      await new Promise(r => setTimeout(r, 1200));

      const evalRes = await sendCdpCommand(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const docW = document.documentElement.clientWidth;
          const scrollW = document.documentElement.scrollWidth;
          const bodyScrollW = document.body.scrollWidth;
          const effectiveScrollW = Math.max(scrollW, bodyScrollW);
          const hasHorizontalOverflow = effectiveScrollW > docW + 1;

          const overflowingElements = [];
          document.querySelectorAll('*').forEach(el => {
            const rect = el.getBoundingClientRect();
            // Check elements extending past the viewport edge
            if (rect.right > docW + 2) {
              overflowingElements.push({
                tag: el.tagName.toLowerCase(),
                cls: (typeof el.className === 'string' ? el.className.trim() : '').slice(0, 50),
                id: el.id || '',
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                overflowAmount: Math.round(rect.right - docW)
              });
            }
          });

          // Sort by highest overflow
          overflowingElements.sort((a, b) => b.overflowAmount - a.overflowAmount);

          return {
            page: location.pathname,
            clientWidth: docW,
            effectiveScrollW: effectiveScrollW,
            hasHorizontalOverflow,
            totalOverflowingElements: overflowingElements.length,
            topOverflows: overflowingElements.slice(0, 8)
          };
        })()`,
        returnByValue: true
      });

      const report = evalRes.result.value;
      results.push({ vp: vp.name, ...report });
      console.log(`  [${vp.name}] - clientWidth: ${report.clientWidth}px | scrollWidth: ${report.effectiveScrollW}px | Overflow: ${report.hasHorizontalOverflow ? 'YES (FAIL)' : 'NO (PASS)'}`);
      if (report.hasHorizontalOverflow || report.totalOverflowingElements > 0) {
        console.log(`    Total overflowing nodes: ${report.totalOverflowingElements}`);
        report.topOverflows.forEach((item, idx) => {
          console.log(`    #${idx+1}: <${item.tag}${item.id ? '#' + item.id : ''}${item.cls ? '.' + item.cls.split(' ').join('.') : ''}> width=${item.width}px right=${item.right}px (+${item.overflowAmount}px)`);
        });
      }
    }
  }

  edgeProc.kill();
  console.log('\nAudit complete.');
}

run().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
