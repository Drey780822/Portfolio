/**
 * Thabang Dikotope — Main Site Interactive Script
 * - Navigation header scroll state
 * - Mobile navigation drawer with focus management
 * - Active section link tracking
 * - Live Johannesburg (SAST) time clock
 * - Copy to clipboard helper
 * - Contact form validation & EmailJS / Mailto dispatch
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Navigation Header Scroll Effect
  const header = document.querySelector('.site-header');
  if (header) {
    const handleScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 2. Mobile Navigation Toggle & Accessible Drawer
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');

  if (navToggle && mobileDrawer) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        navToggle.focus();
      }
    });
  }

  // 3. Live Johannesburg (SAST) Clock
  const sastClocks = document.querySelectorAll('.live-sast-time, .live-sast-clock');
  function updateSastTime() {
    if (!sastClocks.length) return;
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-ZA', {
        timeZone: 'Africa/Johannesburg',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      sastClocks.forEach(el => {
        el.textContent = `${timeStr} SAST`;
      });
    } catch (e) {
      sastClocks.forEach(el => {
        el.textContent = 'Johannesburg (UTC+2)';
      });
    }
  }
  updateSastTime();
  setInterval(updateSastTime, 1000);

  // 4. Reading Progress Indicator
  const readingProgressBar = document.getElementById('readingProgress');
  if (readingProgressBar) {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      readingProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    updateReadingProgress();
  }

  // 5. Notion Toast Notification Helper
  let toastTimeout = null;
  function showNotionToast(message, icon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>') {
    let toast = document.getElementById('notionToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'notionToast';
      toast.className = 'notion-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="notion-toast-icon">${icon}</span><span>${message}</span>`;
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }
  window.showNotionToast = showNotionToast;

  // 6. Interactive Notion Project Category Filtering
  const filterButtons = document.querySelectorAll('.notion-filter-btn');
  const projectCards = document.querySelectorAll('.project-feature[data-category]');

  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedCategory = btn.getAttribute('data-filter') || 'all';

        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        projectCards.forEach(card => {
          const cardCategories = (card.getAttribute('data-category') || '').toLowerCase().split(' ');
          if (selectedCategory === 'all' || cardCategories.includes(selectedCategory.toLowerCase())) {
            card.style.display = '';
            card.style.opacity = '1';
          } else {
            card.style.display = 'none';
            card.style.opacity = '0';
          }
        });
      });
    });
  }

  // 7. Copy to Clipboard Utility with Notion Toast
  const copyButtons = document.querySelectorAll('[data-copy]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        showNotionToast(`Copied "${textToCopy}" to clipboard`);
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(textarea);
        showNotionToast(`Copied to clipboard`);
      }
    });
  });

  // 8. Contact Form Handler (EmailJS + Mailto Fallback)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    // Initialize EmailJS if library loaded
    if (window.emailjs) {
      try {
        emailjs.init('1p9HBSo5fJ6fUKWfx');
      } catch (e) {
        console.warn('EmailJS init skipped:', e);
      }
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const nameEl = document.getElementById('contactName');
      const emailEl = document.getElementById('contactEmail');
      const messageEl = document.getElementById('contactMessage');
      const statusEl = document.getElementById('contactFormStatus');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const name = (nameEl?.value || '').trim();
      const email = (emailEl?.value || '').trim();
      const message = (messageEl?.value || '').trim();

      if (!name || !email || !message) {
        if (statusEl) {
          statusEl.textContent = 'Please complete all required fields.';
          statusEl.style.color = 'var(--accent-amber)';
        }
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (statusEl) {
          statusEl.textContent = 'Please provide a valid email address.';
          statusEl.style.color = 'var(--accent-amber)';
        }
        return;
      }

      if (statusEl) {
        statusEl.textContent = 'Sending message...';
        statusEl.style.color = 'var(--accent-secondary)';
      }
      if (submitBtn) submitBtn.disabled = true;

      // Try EmailJS
      if (window.emailjs) {
        emailjs.sendForm('service_myxkzgt', 'template_oypxfhg', this)
          .then(() => {
            if (statusEl) {
              statusEl.textContent = 'Thank you! Your message has been sent successfully.';
              statusEl.style.color = 'var(--accent-emerald)';
            }
            contactForm.reset();
            if (submitBtn) submitBtn.disabled = false;
          })
          .catch((err) => {
            console.warn('EmailJS delivery fallback to mailto:', err);
            sendViaMailto(name, email, message, statusEl, submitBtn);
          });
      } else {
        sendViaMailto(name, email, message, statusEl, submitBtn);
      }
    });
  }

  function sendViaMailto(name, email, message, statusEl, submitBtn) {
    const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:thabangdikotope624@gmail.com?subject=${subject}&body=${body}`;

    if (statusEl) {
      statusEl.textContent = 'Opening your email client to send message...';
      statusEl.style.color = 'var(--accent-secondary)';
    }
    if (submitBtn) submitBtn.disabled = false;
  }

  // 9. Scroll-Driven Reveal Observer (Staggered Motion)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll(
      '.section-header, .editorial-project-card, .editorial-about-profile, .editorial-about-narrative, .editorial-channel-card, .editorial-form-card, .editorial-principles-grid .editorial-principle-card'
    );

    revealTargets.forEach((el, index) => {
      el.classList.add('scroll-reveal');
      const delayNum = (index % 4) + 1;
      el.classList.add(`delay-${delayNum}`);
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.06
    });

    revealTargets.forEach(el => revealObserver.observe(el));
  }

  // 10. Subtle Parallax for Overflowing Gradient Orbs
  const ambientOrbs = document.querySelectorAll('.ambient-orb');
  if (ambientOrbs.length && !prefersReducedMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          ambientOrbs.forEach((orb, i) => {
            const speed = 0.035 + (i * 0.015);
            orb.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // 11. Interactive Spotlight on Project Cards
  const cards = document.querySelectorAll('.editorial-project-card');
  cards.forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    }, { passive: true });
  });
});