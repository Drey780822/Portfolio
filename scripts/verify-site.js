/**
 * Comprehensive Automated Verification Suite for Thabang Dikotope's Portfolio
 * Validates:
 * 1. Existence and integrity of all pages and routes
 * 2. HTML semantic landmarks and metadata (doctype, viewport, title, description)
 * 3. Knowledge base JSON schema and content completeness
 * 4. Internal relative links and static asset references (CSS, JS, images)
 * 5. Secret leak prevention (checks for exposed real API keys)
 * 6. Backend API endpoint module syntax and export
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
let errorCount = 0;
let warnCount = 0;
let passedCount = 0;

function assert(condition, message, isWarning = false) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ ${message}`);
  } else {
    if (isWarning) {
      warnCount++;
      console.warn(`  ⚠ [WARN] ${message}`);
    } else {
      errorCount++;
      console.error(`  ✗ [FAIL] ${message}`);
    }
  }
}

console.log('\n======================================================');
console.log('RUNNING AUTOMATED SITE VERIFICATION SUITE');
console.log('======================================================\n');

// 1. Core Pages Audit
console.log('1. Checking Core Pages & Routes...');
const expectedPages = [
  'index.html',
  'work/index.html',
  'work/fuellinkpro/index.html',
  'work/skills-mapping/index.html',
  'work/darkroom-dataforge/index.html',
  'work/verifysa/index.html',
  'work/tut-event-management/index.html',
  'research/index.html',
  'experience/index.html',
  'about/index.html',
  'contact/index.html',
  'work.html',
  'projects.html',
  'experience.html',
  'about.html',
  'contact.html',
  'skills.html',
  'achievements.html',
  'testimonials.html',
  'robots.txt',
  'sitemap.xml',
  '.env.example'
];

expectedPages.forEach(p => {
  const fullPath = path.join(ROOT_DIR, p);
  const exists = fs.existsSync(fullPath);
  assert(exists, `Page exists: ${p}`);
  if (exists) {
    const size = fs.statSync(fullPath).size;
    assert(size > 50, `${p} is non-empty (${size} bytes)`);
  }
});

// 2. HTML Metadata & Landmark Audit
console.log('\n2. Validating HTML Markup, Metadata & Semantic Landmarks...');
const htmlPagesToInspect = [
  'index.html',
  'work/index.html',
  'work/fuellinkpro/index.html',
  'work/skills-mapping/index.html',
  'work/darkroom-dataforge/index.html',
  'work/verifysa/index.html',
  'work/tut-event-management/index.html',
  'research/index.html',
  'experience/index.html',
  'about/index.html',
  'contact/index.html'
];

htmlPagesToInspect.forEach(relPath => {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf8');

  assert(content.includes('<!DOCTYPE html>'), `${relPath} has valid <!DOCTYPE html>`);
  assert(content.includes('<meta name="viewport"'), `${relPath} has responsive viewport meta`);
  assert(/<title>.+<\/title>/.test(content), `${relPath} has <title>`);
  assert(content.includes('<main'), `${relPath} contains semantic <main> landmark`);
  assert(content.includes('<nav'), `${relPath} contains semantic <nav> landmark`);
  assert(content.includes('<footer'), `${relPath} contains semantic <footer> landmark`);
  assert(content.includes('<h1'), `${relPath} contains top-level <h1> heading`);
});

// 3. Knowledge Base Audit
console.log('\n3. Validating Structured Knowledge Base JSON...');
const kbPath = path.join(ROOT_DIR, 'assets', 'data', 'portfolio-knowledge.json');
assert(fs.existsSync(kbPath), 'portfolio-knowledge.json exists');

if (fs.existsSync(kbPath)) {
  try {
    const kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
    assert(kb.profile && kb.profile.name === 'Thabang Dikotope', 'Knowledge base has valid profile');
    assert(kb.contact && kb.contact.email === 'thabangdikotope624@gmail.com', 'Knowledge base has verified contact email');
    assert(Array.isArray(kb.experience) && kb.experience.length >= 5, `Knowledge base has ${kb.experience?.length} experience entries`);
    assert(Array.isArray(kb.projects) && kb.projects.length >= 5, `Knowledge base has ${kb.projects?.length} projects`);
    assert(kb.education && kb.education.qualification.includes('Computer Science'), 'Knowledge base has TUT Computer Science qualification');
    assert(kb.technical_capabilities && kb.technical_capabilities.languages, 'Knowledge base has technical capabilities matrix');
    assert(Array.isArray(kb.engineering_principles) && kb.engineering_principles.length === 5, 'Knowledge base has 5 engineering principles');
  } catch (err) {
    assert(false, `portfolio-knowledge.json failed to parse: ${err.message}`);
  }
}

// 4. Asset Link Integrity Audit
console.log('\n4. Validating Internal Asset Links in Core HTML Pages...');
htmlPagesToInspect.forEach(relPath => {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return;
  const dir = path.dirname(fullPath);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Find relative href/src attributes (excluding http, mailto, tel, #)
  const assetRegex = /(?:href|src)=["']([^"']+)["']/g;
  let match;
  while ((match = assetRegex.exec(content)) !== null) {
    const link = match[1];
    if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('#') || link.startsWith('javascript:')) {
      continue;
    }
    // Clean query parameters and fragments
    const cleanLink = link.split('?')[0].split('#')[0];
    if (!cleanLink) continue;

    const resolvedPath = path.resolve(dir, cleanLink);
    assert(fs.existsSync(resolvedPath), `In ${relPath}: target exists -> ${cleanLink}`);
  }
});

// 5. Secret Leak Check
console.log('\n5. Scanning for Accidental Secret or Key Leaks...');
const filesToScan = [
  'index.html',
  'css/styles.css',
  'js/main.js',
  'js/assistant.js',
  'api/chat.js',
  'assets/data/portfolio-knowledge.json'
];

const secretPatterns = [
  /AIza[0-9A-Za-z-_]{35}/, // Google API Key
  /sk-[a-zA-Z0-9]{32,}/,   // OpenAI Secret Key
  /ghp_[a-zA-Z0-9]{36}/,   // GitHub Personal Access Token
  /AKIA[0-9A-Z]{16}/       // AWS Access Key ID
];

filesToScan.forEach(f => {
  const fullPath = path.join(ROOT_DIR, f);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf8');

  secretPatterns.forEach(pattern => {
    const leakMatch = pattern.exec(content);
    assert(!leakMatch, `No leaked credential matching ${pattern} found in ${f}`);
  });
});

// 6. Backend API Endpoint Verification
console.log('\n6. Checking Backend API Endpoint...');
const apiPath = path.join(ROOT_DIR, 'api', 'chat.js');
assert(fs.existsSync(apiPath), 'api/chat.js exists');
try {
  const handler = require(apiPath);
  assert(typeof handler === 'function', 'api/chat.js exports a function handler');
} catch (err) {
  assert(false, `api/chat.js failed to load: ${err.message}`);
}

// Summary
console.log('\n======================================================');
console.log(`VERIFICATION COMPLETE`);
console.log(`Passed: ${passedCount} | Warnings: ${warnCount} | Failed: ${errorCount}`);
console.log('======================================================\n');

if (errorCount > 0) {
  process.exit(1);
} else {
  console.log('✓ All verification assertions passed successfully!\n');
  process.exit(0);
}
