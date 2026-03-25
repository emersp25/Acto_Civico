/* ════════════════════════════════════════════
   ACTO CÍVICO — SLIDESHOW SCRIPT
   4to Bachillerato · Computación y Diseño
════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── STATE ──────────────────────────────────
  const slides      = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  const progressBar = document.getElementById('progressBar');
  const slideCounter= document.getElementById('slideCounter');
  const btnPrev     = document.getElementById('btnPrev');
  const btnNext     = document.getElementById('btnNext');
  const keyHint     = document.getElementById('keyHint');

  let current   = 0;
  let isAnimating = false;

  // ── INIT ───────────────────────────────────
  function init() {
    goTo(0, 'none');
    hideHintAfterDelay();
  }

  // ── GO TO SLIDE ────────────────────────────
  function goTo(index, direction) {
    if (index < 0 || index >= totalSlides) return;
    if (isAnimating) return;

    isAnimating = true;

    // Remove classes from old slide
    const oldSlide = slides[current];
    if (oldSlide) {
      oldSlide.classList.remove('active');
      if (direction === 'next') oldSlide.classList.add('exit-left');
    }

    // After transition, clean up old slide
    setTimeout(() => {
      if (oldSlide) oldSlide.classList.remove('exit-left');
      isAnimating = false;
    }, 520);

    current = index;

    // Show new slide
    const newSlide = slides[current];
    newSlide.classList.add('active');

    // Update UI
    updateProgress();
    updateCounter();
    updateButtons();
  }

  function nextSlide() {
    if (current < totalSlides - 1) goTo(current + 1, 'next');
  }

  function prevSlide() {
    if (current > 0) goTo(current - 1, 'prev');
  }

  // ── PROGRESS ───────────────────────────────
  function updateProgress() {
    const pct = ((current) / (totalSlides - 1)) * 100;
    progressBar.style.width = pct + '%';
  }

  // ── COUNTER ────────────────────────────────
  function updateCounter() {
    slideCounter.textContent = (current + 1) + ' / ' + totalSlides;
  }

  // ── BUTTONS STATE ──────────────────────────
  function updateButtons() {
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === totalSlides - 1;
  }

  // ── ANSWER REVEAL ──────────────────────────
  window.toggleAnswer = function (slideIndex) {
    const slideEl  = document.querySelector('.slide[data-index="' + slideIndex + '"]');
    const answerEl = document.getElementById('a' + slideIndex);
    const btnEl    = slideEl.querySelector('.reveal-btn');

    if (!answerEl || !btnEl) return;

    const alreadyRevealed = slideEl.getAttribute('data-answered') === 'true';

    if (!alreadyRevealed) {
      answerEl.classList.add('revealed');
      btnEl.classList.add('hidden');
      slideEl.setAttribute('data-answered', 'true');

      // Confetti burst on correct answer
      if (window.confettiBurst) confettiBurst();
    }
  };

  // ── CONFETTI ───────────────────────────────
  function confettiBurst() {
    const colors = ['#FFD700','#FF6B00','#FF006E','#00FF88','#00C9FF','#8B00FF','#fff'];
    const container = document.body;

    for (let i = 0; i < 32; i++) {
      const c = document.createElement('div');
      c.style.cssText = `
        position:fixed;
        pointer-events:none;
        z-index:9999;
        width:${6 + Math.random() * 8}px;
        height:${6 + Math.random() * 8}px;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        background:${colors[Math.floor(Math.random() * colors.length)]};
        top:${40 + Math.random() * 20}%;
        left:${20 + Math.random() * 60}%;
        transform:rotate(${Math.random()*360}deg);
        animation:confettiDrop ${0.8 + Math.random() * 0.8}s ease-out forwards;
      `;
      container.appendChild(c);
      setTimeout(() => c.remove(), 1600);
    }
  }

  // ── INJECT CONFETTI KEYFRAMES ───────────────
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes confettiDrop {
      0%   { opacity:1; transform:translateY(0) rotate(0deg) scale(1); }
      100% { opacity:0; transform:translateY(180px) rotate(${Math.random()*720}deg) scale(0.4); }
    }
  `;
  document.head.appendChild(styleSheet);
  window.confettiBurst = true;

  // ── KEYBOARD NAVIGATION ────────────────────
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goTo(0, 'prev');
        break;
      case 'End':
        e.preventDefault();
        goTo(totalSlides - 1, 'next');
        break;
    }
  });

  // ── TOUCH / SWIPE ──────────────────────────
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    // Only swipe if horizontal is dominant
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });

  // ── CLICK ON SLIDE (not buttons) ───────────
  document.getElementById('slidesContainer').addEventListener('click', (e) => {
    // Don't trigger if clicking buttons or answers
    const tag = e.target.tagName;
    if (tag === 'BUTTON') return;
    if (e.target.closest('.q-answer')) return;

    // On question slides, clicking slide (not button) also reveals if unreviewed
    const slideEl = e.target.closest('.slide-question');
    if (slideEl) {
      const idx = parseInt(slideEl.getAttribute('data-index'));
      const answered = slideEl.getAttribute('data-answered') === 'true';
      if (!answered) {
        toggleAnswer(idx);
        return;
      }
    }

    // Otherwise advance
    const rect = document.getElementById('slidesContainer').getBoundingClientRect();
    if (e.clientX > rect.width / 2) nextSlide();
    else prevSlide();
  });

  // ── HIDE KEYBOARD HINT ────────────────────
  function hideHintAfterDelay() {
    setTimeout(() => {
      keyHint.style.opacity = '0';
    }, 4000);
  }

  // ── EXPOSE GLOBALS ────────────────────────
  window.nextSlide = nextSlide;
  window.prevSlide = prevSlide;

  // ── START ────────────────────────────────
  init();

})();
