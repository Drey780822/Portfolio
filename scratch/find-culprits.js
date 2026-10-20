const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3080;
const CDP_PORT = 9226;
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

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

async function inspect() {
  try {
    await fetchJson(`http://localhost:${PORT}/`);
  } catch (e) {
    spawn('node', [path.join(__dirname, '..', 'scripts', 'serve.js')], {
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'ignore'
    });
    await new Promise(r => setTimeout(r, 1200));
  }

  const tmpProfile = path.join(__dirname, 'edge_temp_9226');
  const edgeProc = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpProfile}`,
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:3080/'
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    try {
      targets = await fetchJson(`http://localhost:${CDP_PORT}/json`);
      if (targets && targets.length > 0 && targets.find(t => t.type === 'page')) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  ws.send(JSON.stringify({
    id: 1,
    method: 'Emulation.setDeviceMetricsOverride',
    params: { width: 360, height: 780, deviceScaleFactor: 2, mobile: true }
  }));
  await new Promise(r => setTimeout(r, 1200));

  const expression = `(() => {
    const culprits = [];
    const docW = document.documentElement.clientWidth;
    document.querySelectorAll('*').forEach(el => {
      // Find non-html and non-body elements whose offsetWidth or bounding box extends beyond docW
      if (el.tagName !== 'HTML' && el.tagName !== 'BODY') {
        const rect = el.getBoundingClientRect();
        if (rect.right > docW + 1 || el.offsetWidth > docW) {
          culprits.push({
            tag: el.tagName.toLowerCase(),
            id: el.id,
            cls: (el.className || '').toString().slice(0, 50),
            offsetWidth: el.offsetWidth,
            rectRight: Math.round(rect.right),
            parentTag: el.parentElement?.tagName.toLowerCase(),
            parentCls: (el.parentElement?.className || '').toString().slice(0, 40)
          });
        }
      }
    });
    return culprits;
  })()`;

  ws.send(JSON.stringify({
    id: 2,
    method: 'Runtime.evaluate',
    params: { expression, returnByValue: true }
  }));

  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    if (data.id === 2) {
      if (data.result.exceptionDetails) {
        console.error('JS Error:', data.result.exceptionDetails);
      } else {
        const val = data.result.result?.value;
        console.log('Found culprits count:', val?.length);
        console.log('First 15 culprits:', JSON.stringify(val?.slice(0, 15), null, 2));
      }
      edgeProc.kill();
      process.exit(0);
    }
  };
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
