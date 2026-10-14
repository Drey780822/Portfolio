/**
 * Ambient Generative Visual for Thabang Dikotope's Portfolio
 * Inspired by quiet confidence: organic, deep-field energy with electric blue & pale cyan.
 * 
 * Performance & Accessibility:
 * - 60fps lightweight canvas rendering using requestAnimationFrame
 * - 3 soft Gaussian energy nodes with lerped pointer interaction
 * - Zero external libraries / dependencies (< 1% CPU utilization)
 * - Automatic pause via IntersectionObserver when not in viewport
 * - Respects prefers-reduced-motion (renders single static frame)
 */

(function () {
  'use strict';

  function initAmbientVisual() {
    const canvas = document.getElementById('ambientHeroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const heroSection = canvas.closest('.hero-deepmind') || canvas.parentElement;

    // Accessibility check: prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animationFrameId = null;
    let isVisible = true;

    // Pointer coordinates with smooth spring interpolation
    let mouse = {
      x: 0.5,
      y: 0.4,
      targetX: 0.5,
      targetY: 0.4
    };

    // Color definitions (DeepMind-inspired electric blue & pale cyan)
    const NODES = [
      {
        baseX: 0.28,
        baseY: 0.38,
        radiusMult: 0.55,
        colorInner: 'rgba(66, 133, 244, 0.45)', // Electric Blue #4285F4
        colorMid: 'rgba(26, 86, 196, 0.22)',
        colorOuter: 'rgba(16, 17, 20, 0)',
        speedX: 0.00065,
        speedY: 0.0005,
        influence: 0.18
      },
      {
        baseX: 0.72,
        baseY: 0.32,
        radiusMult: 0.48,
        colorInner: 'rgba(138, 216, 232, 0.35)', // Pale Cyan #8AD8E8
        colorMid: 'rgba(66, 133, 244, 0.18)',
        colorOuter: 'rgba(16, 17, 20, 0)',
        speedX: -0.00055,
        speedY: 0.0007,
        influence: 0.28
      },
      {
        baseX: 0.50,
        baseY: 0.65,
        radiusMult: 0.62,
        colorInner: 'rgba(26, 86, 196, 0.28)', // Deep Sapphire #1A56C4
        colorMid: 'rgba(16, 28, 54, 0.15)',
        colorOuter: 'rgba(16, 17, 20, 0)',
        speedX: 0.00045,
        speedY: -0.0004,
        influence: 0.12
      }
    ];

    function resize() {
      if (!canvas) return;
      const rect = heroSection ? heroSection.getBoundingClientRect() : canvas.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      if (prefersReducedMotion) {
        drawFrame(0);
      }
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Pointer move tracking on hero
    if (heroSection) {
      heroSection.addEventListener('pointermove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          mouse.targetX = (e.clientX - rect.left) / rect.width;
          mouse.targetY = (e.clientY - rect.top) / rect.height;
        }
      }, { passive: true });

      heroSection.addEventListener('pointerleave', () => {
        mouse.targetX = 0.5;
        mouse.targetY = 0.4;
      }, { passive: true });
    }

    function drawFrame(timestamp) {
      if (!ctx || width === 0 || height === 0) return;

      // Smooth lerp pointer coords
      mouse.x += (mouse.targetX - mouse.x) * 0.035;
      mouse.y += (mouse.targetY - mouse.y) * 0.035;

      // Clear with foundation near-black #101114
      ctx.fillStyle = '#101114';
      ctx.fillRect(0, 0, width, height);

      const maxDim = Math.max(width, height);

      // Render Gaussian energy fields
      NODES.forEach((node, i) => {
        const time = timestamp || 0;
        const offsetX = Math.sin(time * node.speedX + i * 1.8) * 0.08;
        const offsetY = Math.cos(time * node.speedY + i * 2.2) * 0.08;

        const posX = (node.baseX + offsetX + (mouse.x - 0.5) * node.influence) * width;
        const posY = (node.baseY + offsetY + (mouse.y - 0.5) * node.influence) * height;
        const radius = maxDim * node.radiusMult;

        const gradient = ctx.createRadialGradient(posX, posY, 0, posX, posY, radius);
        gradient.addColorStop(0, node.colorInner);
        gradient.addColorStop(0.45, node.colorMid);
        gradient.addColorStop(1, node.colorOuter);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(posX, posY, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle atmospheric noise / texture overlay for organic depth
      ctx.fillStyle = 'rgba(16, 17, 20, 0.45)';
      ctx.fillRect(0, 0, width, height);

      // Soft vignette around edges for pristine text legibility
      const vignette = ctx.createRadialGradient(
        width * 0.5, height * 0.45, width * 0.2,
        width * 0.5, height * 0.5, maxDim * 0.8
      );
      vignette.addColorStop(0, 'rgba(16, 17, 20, 0)');
      vignette.addColorStop(0.7, 'rgba(16, 17, 20, 0.65)');
      vignette.addColorStop(1, '#101114');

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    }

    function animate(timestamp) {
      if (!isVisible) return;
      drawFrame(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    }

    // Observer to pause canvas when offscreen
    if ('IntersectionObserver' in window && heroSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !prefersReducedMotion) {
            if (!animationFrameId) {
              animationFrameId = requestAnimationFrame(animate);
            }
          } else {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
          }
        });
      }, { threshold: 0.05 });

      observer.observe(heroSection);
    }

    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      drawFrame(0);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAmbientVisual);
  } else {
    initAmbientVisual();
  }
})();
