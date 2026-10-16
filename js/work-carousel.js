/**
 * Work Carousel Integration - FlexCarousel (Liquid Glass Preset)
 * Connects the WebGL liquid glass stream to Thabang Dikotope's authenticated portfolio projects.
 */

import { initFlexCarousel } from './FlexCarousel.js';

const PROJECTS = [
  {
    src: 'assets/images/projects images/fuellinkpro.png',
    alt: 'FuelLinkPro on-demand logistics dispatch and payment systems architecture',
    title: 'FuelLinkPro',
    subtitle: 'Distributed Logistics · Sole Backend Engineer · Python & Celery',
    domain: 'Distributed Logistics · Commercial Platform',
    category: 'backend logistics',
    badge: 'Live in Production',
    badgeClass: 'pulse-indicator',
    caseStudyUrl: 'work/fuellinkpro/index.html',
    caseStudyText: 'Read Case Study',
    liveUrl: 'https://fuellinkpro.com/',
    liveText: 'Visit Platform',
    desc: 'Co-founded and sole-engineered the backend platform in Python/Flask with PostgreSQL. Engineered real-time driver tracking via Socket.IO, payment webhooks via PayFast with SHA-256 signature verification, and Celery/Redis background worker queues.',
    stack: ['Python', 'Flask', 'PostgreSQL', 'Celery', 'Redis', 'PayFast', 'Socket.IO']
  },
  {
    src: 'assets/images/projects images/skillsmappingsystem.png',
    alt: 'Wits Skills Mapping Platform semantic occupational ontology and telemetry interface',
    title: 'Wits Skills Mapping Platform',
    subtitle: 'Future of Learning · Institutional AI · FastAPI & Next.js',
    domain: 'Future of Learning · Institutional Intelligence',
    category: 'ai research',
    badge: 'Active Research',
    badgeClass: 'status-pulse-cyan',
    caseStudyUrl: 'work/skills-mapping/index.html',
    caseStudyText: 'Read Case Study',
    liveUrl: 'research/index.html',
    liveText: 'Research Context',
    desc: 'Built within the Wits–merSETA Darkroom Project at Wits Enterprise. Architected backend microservices in FastAPI, Next.js frontend interfaces, and relational schemas matching candidate competencies against the South African Organizing Framework for Occupations (OFO).',
    stack: ['FastAPI', 'Python', 'Next.js', 'Supabase', 'PostgreSQL', 'REST APIs']
  },
  {
    src: 'assets/images/bg4.jpg',
    alt: 'Darkroom DataForge structured multi-page document parsing and coordinate audit pipeline',
    title: 'Darkroom DataForge',
    subtitle: 'Data Engineering · Provenance Pipelines · 8-Stage OCR',
    domain: 'Data Engineering · Provenance Pipelines',
    category: 'data ai backend',
    badge: 'Under Engineering',
    badgeClass: 'status-pulse-cyan',
    caseStudyUrl: 'work/darkroom-dataforge/index.html',
    caseStudyText: 'Read Case Study',
    liveUrl: 'work/darkroom-dataforge/index.html',
    liveText: 'System Blueprint',
    desc: 'Engineered around the core principle: "Every extracted record must be traceable to its source." Built an 8-stage extraction pipeline with cross-page table reconstruction and record-level bounding box provenance for academic and legal auditing.',
    stack: ['Python', 'FastAPI', 'OCR Engines', 'Pydantic', 'Docker', 'SQLAlchemy']
  },
  {
    src: 'assets/images/projects images/verifysa.png',
    alt: 'VerifySA autonomous identity document verification interface and Luhn checksum validation',
    title: 'VerifySA',
    subtitle: 'AI Governance · Hackathon Winner (1st Place) · GPT-4o & Luhn',
    domain: 'AI Governance · 5-Hour Rapid Sprint',
    category: 'ai backend',
    badge: 'Hackathon Winner',
    badgeClass: 'pulse-indicator',
    caseStudyUrl: 'work/verifysa/index.html',
    caseStudyText: 'Read Case Study',
    liveUrl: 'https://verify-sa.vercel.app/',
    liveText: 'Open Demo',
    desc: 'Led a 10-person developer cohort during a high-intensity 5-hour hackathon. Implemented a hybrid architecture pairing OpenAI GPT-4o multimodal vision parsing with deterministic rule validation (Luhn checksum algorithms).',
    stack: ['Next.js 15', 'TypeScript', 'GPT-4o API', 'Supabase', 'Luhn Algorithm']
  },
  {
    src: 'assets/images/projects images/mytutEvents.png',
    alt: 'TUT Event Management campus ticketing portal and cryptographic QR code validation system',
    title: 'TUT Event Management System',
    subtitle: 'Campus Logistics · Team Lead · Cryptographic QR Engine',
    domain: 'Campus Logistics · High-Concurrency',
    category: 'backend logistics',
    badge: 'Deployed & Live',
    badgeClass: 'pulse-indicator',
    caseStudyUrl: 'work/tut-event-management/index.html',
    caseStudyText: 'Read Case Study',
    liveUrl: 'https://mytutevents.vercel.app/',
    liveText: 'Visit Platform',
    desc: 'Led the TriTech Solutions team (3 developers) and engineered the backend: PostgreSQL schema, Flask REST APIs, tamper-evident cryptographic QR ticket generation, and automated RSVP notifications via WhatsApp and email.',
    stack: ['Python', 'Flask', 'PostgreSQL', 'QR Tokenizer', 'WhatsApp API', 'Vercel']
  },
  {
    src: 'assets/images/projects images/fitzonegym.png',
    alt: 'FitZone Gym Management System academic software engineering project',
    title: 'FitZone Gym Management',
    subtitle: 'Academic Distinction · SDLC Lead (6 Developers) · PHP & MySQL',
    domain: 'Academic Distinction · Software Engineering',
    category: 'backend',
    badge: 'Distinction Grade',
    badgeClass: 'status-pulse-cyan',
    caseStudyUrl: 'https://fitzone-gym-fitness.free.nf/',
    caseStudyText: 'Visit Platform',
    liveUrl: 'https://github.com/Drey780822/Fitzone-Gym-Fitness',
    liveText: 'GitHub Repo',
    desc: 'Led a 6-person team through the full SDLC for a final-year academic software engineering project at TUT, graded with Distinction. Architected relational membership workflows, trainer schedules, and secure administrative dashboards.',
    stack: ['PHP', 'MySQL', 'JavaScript', 'HTML5/CSS3', 'Git', 'Bootstrap']
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('flexCarouselContainer');
  if (!container) return;

  // Dossier elements
  const dossier = document.getElementById('carouselDossier');
  const domainEl = document.getElementById('dossierDomain');
  const titleEl = document.getElementById('dossierTitle');
  const badgeEl = document.getElementById('dossierBadge');
  const badgeTextEl = document.getElementById('dossierBadgeText');
  const descEl = document.getElementById('dossierDesc');
  const tagsEl = document.getElementById('dossierTags');
  const caseStudyBtn = document.getElementById('dossierCaseStudyBtn');
  const liveBtn = document.getElementById('dossierLiveBtn');

  let currentCategory = 'all';
  let activeList = [...PROJECTS];

  function updateDossier(project) {
    if (!project || !dossier) return;

    if (domainEl) domainEl.textContent = project.domain || '';
    if (titleEl) titleEl.textContent = project.title || '';

    if (badgeEl && badgeTextEl) {
      badgeTextEl.textContent = project.badge || '';
      const dot = badgeEl.querySelector('span:first-child');
      if (dot) {
        dot.className = project.badgeClass || 'pulse-indicator';
      }
    }

    if (descEl) descEl.textContent = project.desc || '';

    if (tagsEl && Array.isArray(project.stack)) {
      tagsEl.innerHTML = '';
      project.stack.forEach(tech => {
        const tag = document.createElement('span');
        tag.className = 'tech-tag';
        tag.textContent = tech;
        tagsEl.appendChild(tag);
      });
    }

    if (caseStudyBtn) {
      caseStudyBtn.href = project.caseStudyUrl || '#';
      caseStudyBtn.innerHTML = `<span>${project.caseStudyText || 'Read Case Study'}</span><span aria-hidden="true">→</span>`;
      if (project.caseStudyUrl.startsWith('http')) {
        caseStudyBtn.target = '_blank';
        caseStudyBtn.rel = 'noopener';
      } else {
        caseStudyBtn.removeAttribute('target');
        caseStudyBtn.removeAttribute('rel');
      }
    }

    if (liveBtn) {
      if (project.liveUrl) {
        liveBtn.style.display = 'inline-flex';
        liveBtn.href = project.liveUrl;
        liveBtn.innerHTML = `<span>${project.liveText || 'Live Platform'}</span><span aria-hidden="true">↗</span>`;
      } else {
        liveBtn.style.display = 'none';
      }
    }
  }

  // Initialize FlexCarousel with liquid preset
  let carousel = null;
  try {
    carousel = initFlexCarousel(container, {
      items: activeList,
      preset: 'liquid',
      intro: 'rise',
      cardHeight: 0.52,
      gap: 16,
      radius: 16,
      squeeze: 0.2,
      focusOnClick: true,
      captions: true,
      captureWheel: true,
      onChange: (index, item) => {
        updateDossier(item);
      },
      onSelect: (index, item) => {
        updateDossier(item);
      }
    });

    // Populate initial dossier with first project
    if (activeList.length > 0) {
      updateDossier(activeList[0]);
    }
  } catch (err) {
    console.error('Failed to initialize FlexCarousel:', err);
  }

  // 1. Filter Bar Integration
  const filterBtns = document.querySelectorAll('.notion-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';
      currentCategory = filter;

      if (filter === 'all') {
        activeList = [...PROJECTS];
      } else {
        activeList = PROJECTS.filter(p => p.category && p.category.includes(filter));
      }

      if (carousel) {
        carousel.setItems(activeList);
        if (activeList.length > 0) {
          updateDossier(activeList[0]);
        }
      }

      // Also filter classic grid cards if visible
      const gridCards = document.querySelectorAll('.editorial-projects-grid .editorial-project-card');
      gridCards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        if (filter === 'all' || cat.includes(filter)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 2. View Mode Toggle (Liquid Stream vs Editorial Grid)
  const viewBtns = document.querySelectorAll('.view-mode-btn');
  const carouselStageWrapper = document.getElementById('carouselStageWrapper');
  const editorialGridWrapper = document.getElementById('editorialGridContainer');

  viewBtns.forEach(vBtn => {
    vBtn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      vBtn.classList.add('active');
      const view = vBtn.getAttribute('data-view');

      if (view === 'grid') {
        if (carouselStageWrapper) carouselStageWrapper.style.display = 'none';
        if (editorialGridWrapper) editorialGridWrapper.style.display = 'grid';
      } else {
        if (carouselStageWrapper) carouselStageWrapper.style.display = 'block';
        if (editorialGridWrapper) editorialGridWrapper.style.display = 'none';
        if (carousel) {
          carousel.step(0);
        }
      }
    });
  });
});
