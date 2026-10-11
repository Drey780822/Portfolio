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
  const sastClocks = document.querySelectorAll('.live-sast-time');
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

  // 4. Copy to Clipboard Utility
  const copyButtons = document.querySelectorAll('[data-copy]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>Copied!</span>';
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2000);
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
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>Copied!</span>';
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2000);
      }
    });
  });

  // 5. Contact Form Handler (EmailJS + Mailto Fallback)
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
});