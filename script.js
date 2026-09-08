/**
 * knowabhishekrai — Minimal Cinematic Interactions
 * Vanilla JavaScript (ES6+)
 * No external dependencies or build tools.
 */

// Shared coordinate offsets for blended mouse & horizontal scroll parallax
let heroMouseX = 0;
let heroMouseY = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Check user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize all modular behaviors
  initLiveTimecode();
  initScrollHeader();
  initHorizontalScroll(prefersReducedMotion);

  if (!prefersReducedMotion) {
    initCustomCursor();
    initHeroMouseParallax();
    initEcosystemOrbit();
  }

  // Remove initial loading state
  document.body.classList.remove('is-loading');
});

/**
 * 1. Live SMPTE Timecode (24 FPS) & Frame Counter
 */
function initLiveTimecode() {
  const tcElement = document.getElementById('liveTimecode');
  if (!tcElement) return;

  let frame = 0;
  const fps = 24;

  setInterval(() => {
    frame = (frame + 1) % 86400; // 1 hr loop
    const totalSeconds = Math.floor(frame / fps);
    const ff = String(frame % fps).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    const mm = String(Math.floor(totalSeconds / 60) % 60).padStart(2, '0');
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');

    tcElement.textContent = `TC ${hh}:${mm}:${ss}:${ff}`;
  }, 1000 / fps);
}

/**
 * 2. Minimal Sticky Header on Scroll
 */
function initScrollHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/**
 * 3. High-Precision Smooth Horizontal Reel + Vertical Downward Scroll Engine
 */
function initHorizontalScroll(prefersReducedMotion) {
  const container = document.getElementById('horizontalScrollSection');
  const track = document.getElementById('horizontalTrack');
  const progressBar = document.getElementById('frameProgressFill');
  const frameIndicator = document.getElementById('currentFrameNum');
  const heroBg = document.getElementById('heroBgImage');
  const panels = document.querySelectorAll('.horizontal-panel');

  if (!container || !track || !panels.length) return;

  let maxScroll = 0;
  let targetX = 0;
  let currentX = 0;
  let isTicking = false;
  const ease = prefersReducedMotion ? 1 : 0.08; // Filmic inertia

  // Calculate container height so vertical scroll drives full horizontal track length
  function updateDimensions() {
    const trackWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    maxScroll = Math.max(0, trackWidth - viewportWidth);
    container.style.height = `${maxScroll + window.innerHeight}px`;
  }

  // Update target on scroll
  function onScroll() {
    targetX = window.scrollY;
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(renderLoop);
    }
  }

  // Also handle horizontal wheel gestures on trackpads
  window.addEventListener('wheel', (e) => {
    // If trackpad horizontal gesture is stronger than vertical, route to scroll while in reel
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 1 && window.scrollY <= maxScroll + 50) {
      window.scrollBy({ top: e.deltaX, behavior: 'auto' });
    }
  }, { passive: true });

  // Main Render Loop (Linear Interpolation)
  function renderLoop() {
    // Only lerp the horizontal target up to maxScroll
    const horizontalTarget = Math.min(maxScroll, Math.max(0, targetX));
    const diff = horizontalTarget - currentX;

    if (prefersReducedMotion || Math.abs(diff) < 0.1) {
      currentX = horizontalTarget;
    } else {
      currentX += diff * ease;
    }

    // Translate horizontal track to glide pages sideways from the right
    track.style.transform = `translate3d(${-currentX}px, 0, 0)`;

    // Keep background same with subtle camera lag on hero doorway silhouette
    if (heroBg && currentX < window.innerWidth * 1.5) {
      const scrollLag = currentX * 0.25;
      heroBg.style.transform = `scale(1.03) translate3d(${scrollLag + heroMouseX}px, ${heroMouseY}px, 0)`;
    }

    // Update bottom transport progress bar (tracks total document progress)
    if (progressBar) {
      const totalDocScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const overallProgress = Math.min(1, Math.max(0, window.scrollY / totalDocScroll));
      progressBar.style.transform = `scaleX(${overallProgress})`;
    }

    // Determine current active panel frame or vertical section
    if (frameIndicator) {
      if (window.scrollY > maxScroll + 50) {
        const vertSecs = document.querySelectorAll('.vertical-section');
        let vertIndex = 1;
        vertSecs.forEach((sec, idx) => {
          if (sec.getBoundingClientRect().top <= window.innerHeight * 0.5) {
            vertIndex = idx + 1;
          }
        });
        frameIndicator.textContent = `↓ 0${vertIndex}`;
      } else {
        let activeIndex = 1;
        const viewportWidth = window.innerWidth;
        panels.forEach((panel, idx) => {
          const rect = panel.getBoundingClientRect();
          if (rect.left <= viewportWidth * 0.5 && rect.right >= viewportWidth * 0.5) {
            activeIndex = idx + 1;
          }
        });
        frameIndicator.textContent = String(activeIndex).padStart(2, '0');
      }
    }

    // Trigger reveal classes both horizontally and vertically
    checkReveals();

    if (Math.abs(horizontalTarget - currentX) > 0.05 || (targetX > maxScroll && window.scrollY > maxScroll)) {
      // Continue loop if still animating or moving
      if (Math.abs(horizontalTarget - currentX) > 0.05) {
        requestAnimationFrame(renderLoop);
      } else {
        isTicking = false;
      }
    } else {
      isTicking = false;
    }
  }

  // Reveal elements when entering the viewport horizontally or vertically
  function checkReveals() {
    const revealEls = document.querySelectorAll('.reveal-on-scroll:not(.is-visible)');
    const triggerX = window.innerWidth * 0.95;
    const triggerY = window.innerHeight * 0.92;
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.left < triggerX && rect.right > 0 && rect.top < triggerY && rect.bottom > 0) {
        el.classList.add('is-visible');
      }
    });
  }

  // Handle in-page anchor links (e.g. logo, scroll cue)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#' || !href) return;
      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        let targetScroll = 0;
        if (targetEl.closest('.horizontal-track')) {
          targetScroll = targetEl.offsetLeft;
        } else {
          // Inside vertical content
          targetScroll = targetEl.offsetTop;
        }
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    });
  });

  // Setup listeners
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    updateDimensions();
    onScroll();
  }, { passive: true });

  // Initial calculations and reveal triggers
  updateDimensions();
  checkReveals();
  onScroll();
}

/**
 * 4. Cinematic Custom Cursor (Desktop Only)
 */
function initCustomCursor() {
  // Check if device supports fine hover pointer
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return;
  }

  const dot = document.getElementById('cursorDot');
  const lens = document.getElementById('cursorLens');
  const label = document.getElementById('cursorLabel');
  if (!dot || !lens) return;

  let mouseX = -100;
  let mouseY = -100;
  let lensX = -100;
  let lensY = -100;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  // Smooth lerp loop for outer lens
  function renderCursor() {
    lensX += (mouseX - lensX) * 0.22;
    lensY += (mouseY - lensY) * 0.22;

    lens.style.transform = `translate(${lensX}px, ${lensY}px) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Dynamic label & activation on hoverable elements
  const interactiveElements = document.querySelectorAll('a, button, [data-cursor], .orbit-satellite');

  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      const customTag = el.getAttribute('data-cursor') || 'VIEW';
      label.textContent = customTag;
      lens.classList.add('is-active');
    });

    el.addEventListener('mouseleave', () => {
      lens.classList.remove('is-active');
      label.textContent = '';
    });
  });

  // Hide cursor on leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    lens.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    lens.style.opacity = '1';
  });
}

/**
 * 5. Subtle Hero Subject Mouse Parallax (Blended with Horizontal Scroll)
 */
function initHeroMouseParallax() {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  heroSection.addEventListener('mousemove', e => {
    const rect = heroSection.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;

    // Subtle mouse offset blended into horizontal scroll loop
    heroMouseX = xRatio * -14;
    heroMouseY = yRatio * -10;
  });

  heroSection.addEventListener('mouseleave', () => {
    heroMouseX = 0;
    heroMouseY = 0;
  });
}

/**
 * 6. Subtle Ecosystem Orbit Interaction
 */
function initEcosystemOrbit() {
  const stage = document.getElementById('orbitStage');
  const satellites = document.querySelectorAll('.orbit-satellite');
  if (!stage || !satellites.length) return;

  stage.addEventListener('mousemove', e => {
    const rect = stage.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;

    satellites.forEach((sat, index) => {
      const factor = (index + 1) * 8;
      const offsetX = xPos * factor;
      const offsetY = yPos * factor;
      sat.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
  });

  stage.addEventListener('mouseleave', () => {
    satellites.forEach(sat => {
      sat.style.transform = 'translate(0px, 0px)';
    });
  });
}
