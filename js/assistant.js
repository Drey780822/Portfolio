/**
 * Thabang Dikotope — Grounded AI Portfolio Assistant (Frontend Engine)
 * 
 * Features:
 * - Hybrid Architecture: Server-side API (/api/chat) with graceful client-side Curated Knowledge Index fallback
 * - Evidence-grounded retrieval with direct case study citations
 * - Strict confidentiality and safety guardrails (never exposes private or unverified information)
 * - Accessible Modal Dialog (Focus Trap, Esc to Close, aria-live polite announcements)
 * - State indicators: Live Model vs Curated Knowledge Index vs Offline Fallback
 * - Rich Markdown formatting with citation pills
 */

(function () {
  'use strict';

  let knowledgeData = null;
  let isOpen = false;
  let isGenerating = false;
  let previousActiveElement = null;
  let lastFailedQuery = null;

  // Curated exploration suggestion chips
  const SUGGESTED_QUESTIONS = [
    { label: "FuelLinkPro Architecture", query: "What was Thabang's architecture and role for FuelLinkPro?" },
    { label: "Wits Skills Mapping", query: "What are your responsibilities on the Wits Skills Mapping Platform?" },
    { label: "VerifySA 5-Hr Sprint", query: "How did you build VerifySA in a 5-hour hackathon?" },
    { label: "Darkroom DataForge", query: "How does Darkroom DataForge handle tabular data provenance?" },
    { label: "Core Tech Stack", query: "What is your primary backend and systems engineering stack?" }
  ];

  // Bundled fallback knowledge in case local fetch is unavailable
  const BUNDLED_KNOWLEDGE = {
    profile: {
      name: "Thabang Dikotope",
      positioning: "Graduate Software Engineer | Full-Stack Developer | AI & Software Systems Developer",
      location: "Johannesburg, Gauteng, South Africa",
      current_status: "AI & Software Systems Developer Intern at Wits Enterprise (Future of Learning) & Co-Founder of FuelLinkPro."
    }
  };

  // Pre-load knowledge base JSON
  async function loadKnowledgeBase() {
    try {
      const isNested = window.location.pathname.includes('/work/') || 
                       window.location.pathname.includes('/research/') || 
                       window.location.pathname.includes('/experience/') || 
                       window.location.pathname.includes('/about/') || 
                       window.location.pathname.includes('/contact/');
      const prefix = isNested ? '../../' : '';
      const response = await fetch(`${prefix}assets/data/portfolio-knowledge.json`);
      if (response.ok) {
        knowledgeData = await response.json();
      }
    } catch (e) {
      console.warn('Local knowledge JSON deferred; using bundled knowledge fallback.');
    }
  }

  // Initialize Assistant UI (LOAM Humanist Architecture)
  function initUI() {
    if (document.getElementById('aiAssistantContainer')) return;

    const root = document.createElement('div');
    root.id = 'aiAssistantContainer';
    root.innerHTML = `
      <!-- Launcher Button (LOAM Human Scale >= 48px) -->
      <button id="aiAssistantLauncher" class="assistant-launcher" aria-label="Open AI Portfolio Assistant (Ctrl+K)" aria-expanded="false" title="Ask Thabang's AI Portfolio Assistant (Ctrl+K)">
        <svg class="loam-seed state-idle" viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">
          <circle class="seed-aura" cx="16" cy="16" r="14" fill="none" />
          <path class="seed-body" d="M16 4 C23.5 3.8 28.5 8.5 28.5 16 C28.5 23.5 23.2 28.2 15.5 28.2 C7.8 28.2 3.5 23.5 3.5 16 C3.5 8.5 8.5 4.2 16 4 Z" fill="var(--color-tide)" />
        </svg>
        <span class="launcher-label">Ask Portfolio Record</span>
        <kbd class="launcher-kbd">⌘K</kbd>
      </button>

      <!-- Modal Dialog -->
      <div id="aiAssistantModal" class="assistant-modal" role="dialog" aria-modal="true" aria-labelledby="assistantTitle" aria-hidden="true">
        <div class="assistant-header">
          <div class="assistant-header-info">
            <div class="assistant-avatar" aria-hidden="true">
              <!-- The Seed (Presence Engine: A pebble, not a person) -->
              <svg id="assistantSeed" class="loam-seed state-idle" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
                <circle class="seed-aura" cx="16" cy="16" r="14" />
                <path class="seed-body" d="M16 4 C23.5 3.8 28.5 8.5 28.5 16 C28.5 23.5 23.2 28.2 15.5 28.2 C7.8 28.2 3.5 23.5 3.5 16 C3.5 8.5 8.5 4.2 16 4 Z" />
                <circle class="seed-core" cx="15.2" cy="15" r="2.2" />
              </svg>
            </div>
            <div>
              <h3 id="assistantTitle" class="assistant-title">Portfolio Record</h3>
              <p class="assistant-subtitle">
                <span id="assistantStatusIndicator" class="status-indicator curated" aria-hidden="true"></span>
                <span id="assistantProviderStatus">Curated Knowledge Index</span>
              </p>
            </div>
          </div>
          <div class="assistant-header-actions">
            <button id="assistantResetBtn" class="assistant-btn-icon" title="Reset Conversation" aria-label="Reset Conversation">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
            </button>
            <button id="assistantCloseBtn" class="assistant-btn-icon" title="Close Assistant (Esc)" aria-label="Close Assistant">
              <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <!-- Chat Messages Container (Unboxed LOAM Surface) -->
        <div id="assistantMessages" class="assistant-messages" role="log" aria-live="polite">
          <div class="msg msg-assistant loam-msg-system">
            <div class="msg-seed-attribution" aria-hidden="true">
              <span class="seed-mark-bullet"></span>
              <span class="seed-mark-label">Verified Record</span>
            </div>
            <div class="msg-content">
              <p>Welcome. I am Thabang Dikotope's official portfolio assistant. I provide direct answers regarding his backend architecture, distributed systems, hackathon leadership, education, and current work at <strong>Wits Enterprise</strong> and <strong>FuelLinkPro</strong>.</p>
              <p class="msg-sub">Every response is strictly grounded in verified facts from his engineering record.</p>
            </div>
          </div>
        </div>

        <!-- Suggestion Chips -->
        <div id="assistantSuggestions" class="assistant-suggestions" aria-label="Suggested Questions">
          <span class="suggestions-label">Explore:</span>
          <div class="suggestions-grid">
            ${SUGGESTED_QUESTIONS.map(q => `<button type="button" class="suggestion-chip" data-query="${escapeHtml(q.query)}">${escapeHtml(q.label)}</button>`).join('')}
          </div>
        </div>

        <!-- Input Form (Clay Focus Halo & Minimum 48px Touch Targets) -->
        <form id="assistantForm" class="assistant-form">
          <div class="assistant-input-wrap">
            <input 
              type="text" 
              id="assistantInput" 
              class="assistant-input" 
              placeholder="Ask about systems, tech stack, or experience..." 
              maxlength="300"
              autocomplete="off"
              aria-label="Message to portfolio assistant"
            />
            <button type="submit" id="assistantSendBtn" class="assistant-send-btn" aria-label="Send query">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          </div>
          <div class="assistant-disclaimer">
            <span>Verified Knowledge Base · Grounded Evidence · Esc to Close</span>
          </div>
        </form>

        <!-- Live Announcement Region for Screen Readers -->
        <div id="assistantLiveRegion" class="sr-only" aria-live="polite"></div>
      </div>
    `;

    document.body.appendChild(root);

    // Wire up Modal Event Listeners
    const launcher = document.getElementById('aiAssistantLauncher');
    const closeBtn = document.getElementById('assistantCloseBtn');
    const resetBtn = document.getElementById('assistantResetBtn');
    const form = document.getElementById('assistantForm');
    const suggestions = document.getElementById('assistantSuggestions');

    launcher.addEventListener('click', toggleAssistant);
    closeBtn.addEventListener('click', () => setAssistantOpen(false));
    resetBtn.addEventListener('click', resetConversation);

    // Global Keydown Listeners (Esc to close, Ctrl+K/Cmd+K to toggle, Tab trap)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleAssistant();
      } else if (e.key === 'Escape' && isOpen) {
        setAssistantOpen(false);
      } else if (e.key === 'Tab' && isOpen) {
        handleModalFocusTrap(e);
      }
    });

    // Input element & Seed state listeners
    const input = document.getElementById('assistantInput');
    if (input) {
      input.addEventListener('focus', () => {
        if (!isGenerating) setSeedState('listening');
      });
      input.addEventListener('input', () => {
        if (!isGenerating) setSeedState('listening');
      });
      input.addEventListener('blur', () => {
        if (!isGenerating) setSeedState('idle');
      });
    }

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input?.value.trim();
      if (!query || isGenerating) return;
      handleUserQuery(query);
      if (input) input.value = '';
    });

    // Suggestion chips delegation
    suggestions.addEventListener('click', (e) => {
      const chip = e.target.closest('.suggestion-chip');
      if (chip && !isGenerating) {
        const query = chip.dataset.query;
        if (query) handleUserQuery(query);
      }
    });

    // Wire up external page triggers
    setupExternalTriggers();
  }

  // Handle Tab key focus trap inside modal dialog
  function handleModalFocusTrap(e) {
    const modal = document.getElementById('aiAssistantModal');
    if (!modal) return;

    const focusable = modal.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]');
    if (focusable.length === 0) return;

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  // Wire up all external buttons across the DOM
  function setupExternalTriggers() {
    // Nav Header Button
    document.getElementById('navAssistantBtn')?.addEventListener('click', toggleAssistant);

    // Mobile Drawer Button
    document.getElementById('mobileDrawerAssistantBtn')?.addEventListener('click', () => {
      const drawer = document.getElementById('mobileDrawer');
      const toggle = document.querySelector('.mobile-nav-toggle');
      if (drawer && toggle) {
        drawer.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
      setAssistantOpen(true);
    });

    // Delegated triggers (workbench queries, case-study schematic ask buttons, data-ask-assistant attributes)
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-ask-assistant], .workbench-query-btn, .schematic-ask-btn');
      if (trigger) {
        e.preventDefault();
        const query = trigger.getAttribute('data-ask-assistant') || trigger.dataset.query;
        if (query) {
          window.openPortfolioAssistant(query);
        } else {
          toggleAssistant();
        }
      }
    });

    // Homepage Workbench input submission
    const wbInput = document.getElementById('workbenchCustomInput');
    const wbBtn = document.getElementById('workbenchSubmitBtn');
    if (wbInput && wbBtn) {
      const executeWorkbench = () => {
        const val = wbInput.value.trim();
        if (val) {
          window.openPortfolioAssistant(val);
          wbInput.value = '';
        }
      };
      wbBtn.addEventListener('click', executeWorkbench);
      wbInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executeWorkbench();
        }
      });
    }
  }

  // Open / Close Assistant
  function setAssistantOpen(open) {
    isOpen = open;
    const modal = document.getElementById('aiAssistantModal');
    const launcher = document.getElementById('aiAssistantLauncher');
    if (!modal || !launcher) return;

    if (isOpen) {
      previousActiveElement = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      launcher.setAttribute('aria-expanded', 'true');
      launcher.classList.add('is-active');
      setTimeout(() => {
        document.getElementById('assistantInput')?.focus();
      }, 150);
      announceStatus("Portfolio assistant opened. Type your question or press Escape to close.");
    } else {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.classList.remove('is-active');
      setSeedState('idle');
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      } else {
        launcher.focus();
      }
      announceStatus("Portfolio assistant closed.");
    }
  }

  function toggleAssistant() {
    setAssistantOpen(!isOpen);
  }

  // Set The Seed state machine (idle, listening, thinking, responding, uncertain, error)
  function setSeedState(state) {
    const seed = document.getElementById('assistantSeed');
    if (seed) {
      seed.className = `loam-seed state-${state}`;
    }
  }

  // Update status badge
  function updateProviderStatus(state, label) {
    const statusEl = document.getElementById('assistantProviderStatus');
    const indicatorEl = document.getElementById('assistantStatusIndicator');
    if (statusEl) statusEl.textContent = label;
    if (indicatorEl) {
      indicatorEl.className = `status-indicator ${state}`;
    }
  }

  // Screen reader announcement
  function announceStatus(message) {
    const region = document.getElementById('assistantLiveRegion');
    if (region) {
      region.textContent = message;
    }
  }

  // Append a chat message (LOAM Unboxed Responses & Clay User Bubbles)
  function appendMessage(role, textHtml, citations = [], disclaimer = '') {
    const container = document.getElementById('assistantMessages');
    if (!container) return;

    const msgEl = document.createElement('div');
    msgEl.className = `msg msg-${role} loam-msg-${role === 'user' ? 'user' : 'system'}`;

    let seedAttribution = '';
    if (role === 'assistant') {
      seedAttribution = `
        <div class="msg-seed-attribution" aria-hidden="true">
          <span class="seed-mark-bullet"></span>
          <span class="seed-mark-label">Verified Record</span>
        </div>
      `;
    }

    let citationMarkup = '';
    if (citations && citations.length > 0) {
      citationMarkup = `
        <div class="msg-citations">
          <span class="citations-title">Sources & Case Studies</span>
          <div class="citations-list">
            ${citations.map((c, i) => `<a href="${c.url}" class="citation-tag loam-citation-chip"><span class="citation-index">[${i + 1}]</span> ${escapeHtml(c.title)} ↗</a>`).join('')}
          </div>
        </div>
      `;
    }

    let disclaimerMarkup = '';
    if (disclaimer) {
      disclaimerMarkup = `<p class="msg-sub" style="margin-top: 0.5rem; opacity: 0.85;">${escapeHtml(disclaimer)}</p>`;
    }

    msgEl.innerHTML = `
      ${seedAttribution}
      <div class="msg-content">${textHtml}</div>
      ${citationMarkup}
      ${disclaimerMarkup}
    `;

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  }

  function showTypingIndicator() {
    const container = document.getElementById('assistantMessages');
    if (!container) return;

    const typingEl = document.createElement('div');
    typingEl.id = 'assistantTyping';
    typingEl.className = 'msg msg-assistant loam-msg-system typing';
    typingEl.setAttribute('aria-busy', 'true');
    typingEl.innerHTML = `
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    `;
    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;
    announceStatus("Searching verified engineering records...");
  }

  function removeTypingIndicator() {
    const typingEl = document.getElementById('assistantTyping');
    if (typingEl) typingEl.remove();
  }

  function resetConversation() {
    lastFailedQuery = null;
    setSeedState('idle');
    const container = document.getElementById('assistantMessages');
    if (!container) return;
    container.innerHTML = `
      <div class="msg msg-assistant loam-msg-system">
        <div class="msg-seed-attribution" aria-hidden="true">
          <span class="seed-mark-bullet"></span>
          <span class="seed-mark-label">Verified Record</span>
        </div>
        <div class="msg-content">
          <p>Conversation reset. How can I assist you with Thabang Dikotope's engineering work today?</p>
        </div>
      </div>
    `;
    updateProviderStatus('curated', 'Curated Knowledge Index');
    announceStatus("Conversation has been reset.");
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Convert markdown to clean HTML
  function formatAssistantText(text) {
    let sanitized = escapeHtml(text);
    // [Text](URL)
    sanitized = sanitized.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="assistant-inline-link">$1</a>');
    // **bold**
    sanitized = sanitized.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // *italic*
    sanitized = sanitized.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // bullet lines
    sanitized = sanitized.replace(/•\s*([^\n]+)/g, '• $1');
    // paragraph splits
    sanitized = sanitized.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    return `<p>${sanitized}</p>`;
  }

  // Client-Side Curated Knowledge Index (Grounded Fallback Engine)
  function queryLocalKnowledge(query) {
    const q = (query || '').toLowerCase().trim();
    const citations = [];

    // 1. Confidentiality / Private Information Filter
    const confidentialTerms = [
      'password', 'secret', 'connection string', 'internal ip', 'server ip', 'private key',
      'api key', 'home address', 'bank', 'banking', 'salary', 'financial account', 'database password',
      'darkroom database', 'internal credential', 'private dataset', 'raw participant'
    ];
    if (confidentialTerms.some(term => q.includes(term))) {
      return {
        answer: "That information is confidential, proprietary, or not documented in Thabang's public portfolio record.<br><br>" +
          "• Internal Wits–merSETA Darkroom infrastructure, private database credentials, and unreleased research datasets are strictly protected by institutional safeguards.<br>" +
          "• Private personal details are never exposed.<br><br>" +
          "For legitimate verification inquiries or professional discussions, please contact Thabang directly at <a href=\"mailto:thabangdikotope624@gmail.com\" class=\"assistant-inline-link\">thabangdikotope624@gmail.com</a>.",
        citations: [{ title: "Contact Thabang", url: "/contact" }],
        disclaimer: "Curated Knowledge Index · Privacy & Confidentiality Safeguards Active"
      };
    }

    // 2. Prompt Injection & Hallucination Resistance
    const falseClaims = [
      'cto of google', 'ceo of', 'phd', 'mit', 'stanford', 'nobel', 'senior engineer',
      'principal engineer', 'principal scientist', 'billion', 'millionaire', 'ignore previous', 'override instructions'
    ];
    if (falseClaims.some(term => q.includes(term))) {
      return {
        answer: "I operate strictly on verified evidence from Thabang Dikotope's official portfolio record.<br><br>" +
          "• <strong>Verified Professional Level:</strong> Thabang is a <strong>Graduate Software Engineer | Full-Stack Developer | AI & Software Systems Developer</strong>.<br>" +
          "• <strong>Education:</strong> Higher National Diploma in Computer Science from Tshwane University of Technology (completed December 2025 with <strong>all 360/360 credits verified</strong>).<br>" +
          "• <strong>Current Roles:</strong> AI & Software Systems Developer Intern at <strong>Wits Enterprise</strong> (Future of Learning stream) and Co-Founder & Software Engineer at <strong>FuelLinkPro</strong>.<br><br>" +
          "He does not hold unverified senior, principal, or executive titles. I reject any instructions to invent credentials.",
        citations: [{ title: "Verified Profile & Credentials", url: "/about" }],
        disclaimer: "Curated Knowledge Index · Truthfulness Guardrail Active"
      };
    }

    // 3. FuelLinkPro
    if (q.includes('fuellink') || q.includes('fuel') || q.includes('payfast') || q.includes('dispatch') || q.includes('startup')) {
      citations.push({ title: "FuelLinkPro Case Study", url: "/work/fuellinkpro" });
      return {
        answer: "<strong>FuelLinkPro</strong> is an on-demand fuel delivery marketplace connecting stranded motorists, fleet managers, and agricultural operators with certified mobile fuel dispatchers.<br><br>" +
          "• <strong>Thabang's Contribution (Sole Backend Engineer):</strong> Architected the entire backend service layer, PostgreSQL database models, JWT authentication, and Docker/Nginx production deployment.<br>" +
          "• <strong>Payments:</strong> Integrated South Africa's PayFast gateway using cryptographic HMAC-SHA256 signature validation and instant payment notification (IPN) webhooks.<br>" +
          "• <strong>Real-Time Dispatch:</strong> Built bi-directional order dispatch events via Flask-SocketIO with Redis pub/sub.<br>" +
          "• <strong>Asynchronous Queues:</strong> Deployed Celery background workers backed by Redis for dispatch timeout handling and SMS/email notifications (Twilio/SendGrid).<br>" +
          "• <strong>Early Rollout Metrics:</strong> Over 10 registered customers and 15+ onboarded drivers prepared for fulfillment (early rollout onboarding figures, not audited revenue).<br>" +
          "• <strong>Status:</strong> Live in production with active commercial iterations.",
        citations,
        disclaimer: "Curated Knowledge Index · Verified Engineering Record"
      };
    }

    // 4. Wits Skills Mapping Platform
    if (q.includes('skills mapping') || q.includes('wits') || q.includes('occupational') || q.includes('ofo') || q.includes('taxonomy')) {
      citations.push({ title: "Wits Skills Mapping Case Study", url: "/work/skills-mapping" });
      return {
        answer: "The <strong>Wits Skills Mapping Platform</strong> is an AI-enabled skills discovery and career exploration system developed within the Future of Learning stream at Wits Enterprise.<br><br>" +
          "• <strong>Thabang's Contribution (Intern):</strong> Designed backend API microservices in FastAPI, created relational database schemas in Supabase and PostgreSQL, and integrated safe boundaries for AI-assisted CV competency parsing.<br>" +
          "• <strong>Taxonomy Alignment:</strong> Maps extracted candidate skills against the South African Organising Framework for Occupations (OFO) to identify transferable career pathways.<br>" +
          "• <strong>Tech Stack:</strong> Next.js, TypeScript, FastAPI, Python, PostgreSQL, Supabase, Docker.<br>" +
          "• <strong>Institutional Safeguards:</strong> Internal server configurations, private institutional endpoints, and unpublished research data remain strictly private.<br>" +
          "• <strong>Status:</strong> Active research and prototyping engagement.",
        citations,
        disclaimer: "Curated Knowledge Index · Verified Engineering Record"
      };
    }

    // 5. Darkroom DataForge
    if (q.includes('dataforge') || q.includes('darkroom') || q.includes('dataset') || q.includes('extraction') || q.includes('tabular') || q.includes('ocr')) {
      citations.push({ title: "Darkroom DataForge Case Study", url: "/work/darkroom-dataforge" });
      return {
        answer: "<strong>Darkroom DataForge</strong> is an auditable document data extraction and dataset generation pipeline designed for complex multi-page scans and institutional reports.<br><br>" +
          "• <strong>Core Engineering Principle:</strong> <em>'Every extracted record should be traceable to its source.'</em><br>" +
          "• <strong>8-Stage Pipeline:</strong> Ingestion → Classification → Extraction → Table Reconstruction → Normalization → Validation → Human-in-the-Loop Review → Export.<br>" +
          "• <strong>Thabang's Contribution:</strong> Engineered document parsing services, tabular split heuristics, record-level bounding box coordinate provenance, and export pipelines (CSV, JSON, Excel).<br>" +
          "• <strong>Tech Stack:</strong> React, TypeScript, FastAPI, Python, SQLAlchemy, PostgreSQL, SQLite sandboxes.<br>" +
          "• <strong>Status:</strong> Under active engineering within the Darkroom research stream.",
        citations,
        disclaimer: "Curated Knowledge Index · Verified Engineering Record"
      };
    }

    // 6. VerifySA
    if (q.includes('verifysa') || q.includes('verify') || q.includes('soweto') || q.includes('fraud') || q.includes('hackathon')) {
      citations.push({ title: "VerifySA Case Study", url: "/work/verifysa" });
      return {
        answer: "<strong>VerifySA</strong> is an AI-assisted document verification and fraud detection SaaS prototype built during an intensive <strong>5-hour hackathon sprint</strong> at the Soweto AI App Development Challenge (June 2026).<br><br>" +
          "• <strong>Thabang's Leadership:</strong> Team Lead of a 10-person developer cohort. Architected the Next.js 15 structure, Supabase data schema, and dual-engine validation workflow.<br>" +
          "• <strong>Dual Validation:</strong> Combines OpenAI GPT-4o multimodal parsing with deterministic business rules (such as South African ID Luhn algorithmic checks), generating verifiable PDF audit reports.<br>" +
          "• <strong>Honest Disclosure:</strong> VerifySA was built as a rapid 5-hour hackathon proof-of-concept. AI extraction provides rapid risk signals but does not constitute legal proof of authenticity without deterministic verification.<br>" +
          "• <strong>Status:</strong> Completed hackathon prototype deployed at <a href=\"https://verify-sa.vercel.app/\" class=\"assistant-inline-link\" target=\"_blank\" rel=\"noopener\">verify-sa.vercel.app</a>.",
        citations,
        disclaimer: "Curated Knowledge Index · Verified Engineering Record"
      };
    }

    // 7. TUT Event Management System
    if (q.includes('tut event') || q.includes('event') || q.includes('ticket') || q.includes('qr') || q.includes('tritech')) {
      citations.push({ title: "TUT Event Management Case Study", url: "/work/tut-event-management" });
      return {
        answer: "The <strong>TUT Event Management System</strong> is a campus event discovery and automated ticketing portal created to replace fragmented paper notices and unmoderated chat groups.<br><br>" +
          "• <strong>Thabang's Leadership:</strong> Team Leader and Backend Developer of TriTech Solutions (3-person student team).<br>" +
          "• <strong>Implementation:</strong> Engineered the Flask & PostgreSQL backend, concurrency transaction locks to prevent overselling, and tamper-evident cryptographic HMAC-SHA256 QR-code e-ticketing.<br>" +
          "• <strong>Delivery:</strong> Dispatches automated ticket confirmations via SMTP email and WhatsApp webhook integrations.<br>" +
          "• <strong>Status:</strong> Completed and deployed on Vercel at <a href=\"https://mytutevents.vercel.app/\" class=\"assistant-inline-link\" target=\"_blank\" rel=\"noopener\">mytutevents.vercel.app</a>.",
        citations,
        disclaimer: "Curated Knowledge Index · Verified Engineering Record"
      };
    }

    // 8. Experience & Career History
    if (q.includes('experience') || q.includes('career') || q.includes('history') || q.includes('work') || q.includes('intern') || q.includes('tutor') || q.includes('mtp')) {
      citations.push({ title: "Experience Chronology", url: "/experience" });
      return {
        answer: "Thabang's professional experience spans full-stack software development, cloud infrastructure, IT support, and academic mentorship:<br><br>" +
          "1. <strong>Wits Enterprise (Aug 2026 – Present):</strong> AI & Software Systems Developer Intern (Future of Learning / Darkroom Project) — building skills mapping APIs, Supabase data models, and responsible LLM evaluation boundaries.<br>" +
          "2. <strong>FuelLinkPro (Nov 2025 – Present):</strong> Co-Founder & Software Engineer — sole backend engineer architecting Flask, PostgreSQL, Celery/Redis, PayFast payments, and Docker deployments.<br>" +
          "3. <strong>MTP IT Solutions (Sep 2025 – Feb 2026):</strong> Software Development & IT Support Intern (WIL) — developed web tools, resolved enterprise infrastructure/DNS/SSL incidents, authored support knowledge base docs.<br>" +
          "4. <strong>Tshwane University of Technology (Jun 2023 – Dec 2024):</strong> Peer Tutor & Lab Instructor — mentored 30+ students per semester in Java, SQL, and Web Computing.",
        citations,
        disclaimer: "Curated Knowledge Index · Verified Engineering Record"
      };
    }

    // 9. Technical Capabilities
    if (q.includes('stack') || q.includes('skill') || q.includes('language') || q.includes('tech') || q.includes('database') || q.includes('python') || q.includes('docker') || q.includes('postgres')) {
      citations.push({ title: "Technical Capabilities", url: "/about" });
      return {
        answer: "Thabang's engineering capabilities are focused on production reliability, clean APIs, and defensive data design:<br><br>" +
          "• <strong>Languages:</strong> Python (Primary backend), JavaScript (ES6+), TypeScript (Strict typing), SQL & PL/pgSQL, PHP, Java.<br>" +
          "• <strong>Backend & Systems:</strong> Flask, FastAPI, SQLAlchemy ORM, JWT, Socket.IO, Celery, Redis, RESTful API design.<br>" +
          "• <strong>Frontend:</strong> Next.js, React, TypeScript, Semantic HTML5, Tailwind CSS, Responsive Design.<br>" +
          "• <strong>Databases:</strong> PostgreSQL (Primary production), MySQL, Supabase, SQLite sandboxes.<br>" +
          "• <strong>Cloud & DevOps:</strong> Docker, Nginx, Gunicorn, AWS Cloud Quest Certified (EC2, S3, IAM), Vercel, Netlify, Git/GitHub.<br>" +
          "• <strong>Third-Party Integrations:</strong> PayFast, Twilio, SendGrid, Google Maps Platform, OpenAI & Gemini APIs, EmailJS.",
        citations,
        disclaimer: "Curated Knowledge Index · Verified Engineering Record"
      };
    }

    // 10. Education & Certifications
    if (q.includes('education') || q.includes('degree') || q.includes('diploma') || q.includes('tut') || q.includes('tshwane') || q.includes('credit') || q.includes('certif')) {
      citations.push({ title: "Education & Qualifications", url: "/about" });
      return {
        answer: "<strong>Academic Qualifications & Education:</strong><br><br>" +
          "• <strong>Institution:</strong> Tshwane University of Technology (TUT).<br>" +
          "• <strong>Qualification:</strong> Higher National Diploma in Computer Science (Completed December 2025).<br>" +
          "• <strong>Academic Credits:</strong> Successfully completed <strong>all 360/360 credits</strong> across software programming, mobile development, databases, and Work-Integrated Learning (WIL).<br>" +
          "• <strong>Distinction Project:</strong> Led 6-developer team for FitZone Gym Management final-year system (Graded with Distinction).<br><br>" +
          "<strong>Professional Certifications:</strong><br>" +
          "• AWS Cloud Quest: Cloud Practitioner (Amazon Web Services, 2024)<br>" +
          "• Generative AI for Software Engineers (WeThinkCode, 2025)<br>" +
          "• Ethical Hacker Certificate (Mpumalanga AI Hackathon, 2025)<br>" +
          "• Deloitte Australia Cyber Job Simulation (Forage, 2025)<br>" +
          "• Responsive Web Design Certification (freeCodeCamp, 2024)",
        citations,
        disclaimer: "Curated Knowledge Index · Verified Engineering Record"
      };
    }

    // 11. Contact & Availability
    if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('phone') || q.includes('linkedin') || q.includes('github') || q.includes('location')) {
      citations.push({ title: "Direct Contact Channels", url: "/contact" });
      return {
        answer: "Thabang is based in <strong>Johannesburg, Gauteng, South Africa</strong> and is available for graduate software engineering roles, full-stack systems roles, and research engineering collaborations:<br><br>" +
          "• <strong>Email:</strong> <a href=\"mailto:thabangdikotope624@gmail.com\" class=\"assistant-inline-link\">thabangdikotope624@gmail.com</a><br>" +
          "• <strong>Phone:</strong> <a href=\"tel:+27795948790\" class=\"assistant-inline-link\">+27 79 594 8790</a><br>" +
          "• <strong>LinkedIn:</strong> <a href=\"https://www.linkedin.com/in/drey780822\" class=\"assistant-inline-link\" target=\"_blank\" rel=\"noopener\">linkedin.com/in/drey780822</a><br>" +
          "• <strong>GitHub:</strong> <a href=\"https://github.com/Drey780822\" class=\"assistant-inline-link\" target=\"_blank\" rel=\"noopener\">github.com/Drey780822</a><br>" +
          "• <strong>Portfolio:</strong> <a href=\"https://thabangs-portfolio.netlify.app\" class=\"assistant-inline-link\" target=\"_blank\" rel=\"noopener\">thabangs-portfolio.netlify.app</a>",
        citations,
        disclaimer: "Curated Knowledge Index · Verified Contact Channels"
      };
    }

    // 12. General Default / Unknown Information
    citations.push({ title: "Work Overview", url: "/work" });
    citations.push({ title: "Full Profile", url: "/about" });
    return {
      answer: "I do not have verified public portfolio records regarding that specific question.<br><br>" +
        "As an AI assistant grounded strictly in Thabang Dikotope's public engineering record, I avoid speculating or inventing details. " +
        "You can ask me about his:<br>" +
        "• <strong>FuelLinkPro backend architecture</strong> (Flask, PostgreSQL, PayFast, Celery)<br>" +
        "• <strong>Wits Enterprise skills intelligence work</strong> (FastAPI, Supabase, OFO taxonomy)<br>" +
        "• <strong>Darkroom DataForge document provenance pipeline</strong> (8 stages, bounding boxes)<br>" +
        "• <strong>VerifySA 5-hour hackathon prototype</strong> (Team lead, multimodal validation)<br>" +
        "• <strong>Core technical stack and verified TUT Computer Science credentials</strong><br><br>" +
        "For specific non-portfolio questions, feel free to contact Thabang directly via <a href=\"mailto:thabangdikotope624@gmail.com\" class=\"assistant-inline-link\">email</a> or <a href=\"https://www.linkedin.com/in/drey780822\" class=\"assistant-inline-link\" target=\"_blank\" rel=\"noopener\">LinkedIn</a>.",
      citations,
      disclaimer: "Curated Knowledge Index · Honest Missing-Information Handling"
    };
  }

  // Handle incoming user query (LOAM Seed Lifecycle & Grounded Dispatch)
  async function handleUserQuery(query) {
    if (isGenerating) return;
    isGenerating = true;
    lastFailedQuery = null;

    // Display user question on Clay-tint surface
    appendMessage('user', escapeHtml(query));
    showTypingIndicator();
    setSeedState('thinking');

    let answered = false;

    try {
      const apiRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data && data.reply) {
          removeTypingIndicator();

          if (data.provider === 'gemini') {
            updateProviderStatus('live', 'Live Model (Gemini 1.5 Flash)');
          } else if (data.provider === 'openai') {
            updateProviderStatus('live', 'Live Model (GPT-4o-mini)');
          } else {
            updateProviderStatus('curated', 'Curated Knowledge Index');
          }

          const isUncertain = data.reply.includes('I do not have verified') || 
                              data.reply.includes("I don't know") ||
                              data.reply.includes('confidential');
          if (isUncertain) {
            setSeedState('uncertain');
          } else {
            setSeedState('responding');
            setTimeout(() => { if (!isGenerating) setSeedState('idle'); }, 1800);
          }

          appendMessage('assistant', formatAssistantText(data.reply), data.citations || [], data.disclaimer || '');
          announceStatus("Response received from portfolio assistant.");
          answered = true;
        }
      } else if (apiRes.status === 429) {
        removeTypingIndicator();
        setSeedState('error');
        updateProviderStatus('offline', 'Rate Limited');
        const errData = await apiRes.json().catch(() => ({}));
        const retrySec = errData.retry_after_seconds || 60;
        appendMessage('assistant', `<div class="assistant-error-card"><strong>Query Rate Limit:</strong> You have submitted multiple questions in a short period. Please wait ${retrySec} seconds before asking another question, or explore the case studies directly.</div>`);
        announceStatus("Rate limit exceeded. Please wait.");
        answered = true;
      } else if (apiRes.status === 400) {
        removeTypingIndicator();
        setSeedState('error');
        const errData = await apiRes.json().catch(() => ({}));
        appendMessage('assistant', `<div class="assistant-error-card"><strong>Validation Error:</strong> ${escapeHtml(errData.error || 'Please provide a valid question.')}</div>`);
        answered = true;
      }
    } catch (e) {
      // Network failure or static environment (e.g. GitHub Pages) -> Fall through to local index
    }

    if (!answered) {
      // Execute local Curated Knowledge Retrieval Engine
      setTimeout(() => {
        removeTypingIndicator();
        updateProviderStatus('curated', 'Curated Knowledge Index (Local)');
        const result = queryLocalKnowledge(query);

        const isUncertain = (result.answer || '').includes('I do not have verified') || 
                            (result.answer || '').includes("I don't know") ||
                            (result.answer || '').includes('confidential');
        if (isUncertain) {
          setSeedState('uncertain');
        } else {
          setSeedState('responding');
          setTimeout(() => { if (!isGenerating) setSeedState('idle'); }, 1800);
        }

        appendMessage('assistant', result.answer, result.citations, result.disclaimer);
        announceStatus("Response generated from local curated knowledge index.");
        isGenerating = false;
      }, 350);
      return;
    }

    isGenerating = false;
  }

  // Public API
  window.openPortfolioAssistant = function(query) {
    setAssistantOpen(true);
    if (query) {
      setTimeout(() => {
        handleUserQuery(query);
      }, 200);
    }
  };
  window.togglePortfolioAssistant = toggleAssistant;

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    loadKnowledgeBase();
    initUI();
  });
})();
