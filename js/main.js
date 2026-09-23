document.addEventListener('DOMContentLoaded', () => {
  // 1. Preloader
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 500);
  });

  // 2 & 3. Canvas Animations
  initCanvasAnimations();

  // 4. Scroll Reveal
  initScrollReveal();

  // 5. Typing Effect
  initTypingEffect();

  // 6. Counter Animation
  initCounters();

  // 7. Navigation
  initNavigation();

  // 8. Back to Top Button
  initBackToTop();

  // 9. Project Card 3D Tilt Effect
  initTiltEffect();

  // 10. Custom Cursor
  initCustomCursor();
});

/* ==========================================================================
   Canvas Animations (Starfield & Trail)
   ========================================================================== */
function initCanvasAnimations() {
  const starfieldCanvas = document.getElementById('starfield');
  const trailCanvas = document.getElementById('trail');
  if (!starfieldCanvas || !trailCanvas) return;

  const ctxStars = starfieldCanvas.getContext('2d');
  const ctxTrail = trailCanvas.getContext('2d');

  let width, height;
  let scrollY = window.scrollY;

  // Resize handler with debounce
  let resizeTimeout;
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    starfieldCanvas.width = width;
    starfieldCanvas.height = height;
    trailCanvas.width = width;
    trailCanvas.height = height;
    initStars();
  }
  
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 200);
  });
  
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // --- Starfield Setup ---
  let stars = [];
  let shootingStar = null;
  const starColors = ['#ffffff', '#b0d4ff', '#c4b5fd'];

  function initStars() {
    stars = [];
    const layers = [
      { count: 200, size: [0.5, 1], opacity: [0.3, 0.6], speed: 0.02 }, // Far
      { count: 100, size: [1, 2], opacity: [0.5, 0.8], speed: 0.05 },   // Mid
      { count: 50, size: [1.5, 3], opacity: [0.7, 1.0], speed: 0.1 }    // Near
    ];

    layers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        stars.push({
          x: Math.random() * width,
          baseY: Math.random() * height,
          size: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
          baseOpacity: layer.opacity[0] + Math.random() * (layer.opacity[1] - layer.opacity[0]),
          speed: layer.speed,
          phase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)]
        });
      }
    });
  }

  function spawnShootingStar() {
    shootingStar = {
      x: Math.random() * width,
      y: 0,
      vx: (Math.random() - 0.5) * 10 + 5, // move mostly right/down
      vy: Math.random() * 5 + 5,
      life: 1.0,
      length: Math.random() * 80 + 40
    };
    // Schedule next
    setTimeout(spawnShootingStar, Math.random() * 5000 + 3000); // 3-8 seconds
  }
  setTimeout(spawnShootingStar, Math.random() * 5000 + 3000);

  // --- Trail Setup ---
  let trailParticles = [];
  let mouse = { x: -1000, y: -1000 };
  let isMouseMoving = false;
  let lastMoveTime = 0;

  function handleMove(e) {
    const now = Date.now();
    if (now - lastMoveTime > 30) {
      if (e.touches && e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      } else {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
      isMouseMoving = true;
      spawnTrailParticle();
      lastMoveTime = now;
    }
  }

  window.addEventListener('mousemove', handleMove, { passive: true });
  window.addEventListener('touchmove', handleMove, { passive: true });
  
  window.addEventListener('mouseout', () => { isMouseMoving = false; });
  window.addEventListener('touchend', () => { isMouseMoving = false; });

  function spawnTrailParticle() {
    if (!isMouseMoving) return;
    
    const maxLife = Math.random() * 70 + 80; // 80-150 frames
    trailParticles.push({
      x: mouse.x,
      y: mouse.y,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      life: 1.0,
      maxLife: maxLife,
      size: Math.random() * 1.5 + 1,
      hue: Math.floor(Math.random() * 40) + 240 // 240-280 (blue to purple)
    });

    if (trailParticles.length > 120) {
      trailParticles.shift(); // Remove oldest
    }
  }

  // --- Animation Loop ---
  function animate(time) {
    // 1. Draw Starfield
    ctxStars.clearRect(0, 0, width, height);
    
    stars.forEach(star => {
      // Parallax Y calculation
      let currentY = star.baseY - scrollY * star.speed;
      // Wrap around
      currentY = ((currentY % height) + height) % height;
      
      // Twinkling
      const twinkle = Math.sin(time * 0.002 + star.phase) * 0.3 + 0.7; // 0.4 to 1.0 multiplier
      const opacity = Math.min(Math.max(star.baseOpacity * twinkle, 0.1), 1);
      
      ctxStars.beginPath();
      ctxStars.arc(star.x, currentY, star.size, 0, Math.PI * 2);
      ctxStars.fillStyle = star.color;
      ctxStars.globalAlpha = opacity;
      ctxStars.shadowBlur = star.size * 2;
      ctxStars.shadowColor = star.color;
      ctxStars.fill();
    });
    ctxStars.globalAlpha = 1.0;
    ctxStars.shadowBlur = 0;

    // Draw Shooting Star
    if (shootingStar) {
      shootingStar.x += shootingStar.vx;
      shootingStar.y += shootingStar.vy;
      shootingStar.life -= 0.015;

      if (shootingStar.life <= 0 || shootingStar.x > width || shootingStar.x < 0 || shootingStar.y > height) {
        shootingStar = null;
      } else {
        ctxStars.beginPath();
        ctxStars.moveTo(shootingStar.x, shootingStar.y);
        ctxStars.lineTo(
          shootingStar.x - (shootingStar.vx / Math.abs(shootingStar.vx)) * shootingStar.length, 
          shootingStar.y - (shootingStar.vy / Math.abs(shootingStar.vy)) * shootingStar.length
        );
        ctxStars.strokeStyle = `rgba(255, 255, 255, ${shootingStar.life})`;
        ctxStars.lineWidth = 1.5;
        ctxStars.stroke();
      }
    }

    // 2. Draw Trail
    ctxTrail.clearRect(0, 0, width, height);
    
    // Update and draw particles
    for (let i = trailParticles.length - 1; i >= 0; i--) {
      const p = trailParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1 / p.maxLife;

      if (p.life <= 0) {
        trailParticles.splice(i, 1);
        continue;
      }

      ctxTrail.beginPath();
      ctxTrail.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctxTrail.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.life * 0.6})`;
      ctxTrail.shadowBlur = 6;
      ctxTrail.shadowColor = `hsla(${p.hue}, 80%, 70%, 1)`;
      ctxTrail.fill();
    }
    ctxTrail.shadowBlur = 0;

    // Draw Constellation Lines
    ctxTrail.lineWidth = 0.5;
    const maxLinesCheck = Math.min(trailParticles.length, 100); // Optimization
    for (let i = 0; i < maxLinesCheck; i++) {
      for (let j = i + 1; j < maxLinesCheck; j++) {
        const p1 = trailParticles[i];
        const p2 = trailParticles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 10000) { // 100px squared
          const alpha = Math.min(p1.life, p2.life) * 0.15;
          ctxTrail.beginPath();
          ctxTrail.moveTo(p1.x, p1.y);
          ctxTrail.lineTo(p2.x, p2.y);
          ctxTrail.strokeStyle = `hsla(260, 60%, 60%, ${alpha})`;
          ctxTrail.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  resize();
  requestAnimationFrame(animate);
}

/* ==========================================================================
   Scroll Reveal (IntersectionObserver)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay');
        if (delay) {
          entry.target.style.transitionDelay = `${delay}ms`;
        }
        entry.target.classList.add('active');
      } else {
        // Remove class when leaving viewport to repeat animation
        entry.target.classList.remove('active');
        entry.target.style.transitionDelay = '0ms';
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   Typing Effect
   ========================================================================== */
function initTypingEffect() {
  const typedEl = document.querySelector('.typed');
  if (!typedEl) return;

  const strings = [
    'Full-Stack Developer', 
    'Data Science Enthusiast', 
    'Backend Engineer', 
    'AI Explorer', 
    'Problem Solver'
  ];
  
  let stringIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  function type() {
    const currentString = strings[stringIndex];
    
    if (isDeleting) {
      typedEl.textContent = currentString.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typedEl.textContent = currentString.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = 80;
    if (isDeleting) typeSpeed = 40;

    if (!isDeleting && charIndex === currentString.length) {
      typeSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      stringIndex = (stringIndex + 1) % strings.length;
      typeSpeed = 500; // Pause before typing next
    }

    setTimeout(type, typeSpeed);
  }

  setTimeout(type, 1000); // Initial delay
}

/* ==========================================================================
   Counter Animation
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  const easeOutQuad = t => t * (2 - t);

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target'), 10);
        if (isNaN(target)) return;

        const duration = 2000;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          let progress = elapsed / duration;
          
          if (progress > 1) progress = 1;
          
          const currentVal = Math.floor(target * easeOutQuad(progress));
          entry.target.textContent = currentVal;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            entry.target.textContent = target; // Ensure exact final value
          }
        }
        
        requestAnimationFrame(updateCounter);
        obs.unobserve(entry.target); // Trigger only once
      }
    });
  }, { threshold: 0.1 });

  counters.forEach(counter => observer.observe(counter));
}

/* ==========================================================================
   Navigation (Scroll, Active States, Mobile Menu)
   ========================================================================== */
function initNavigation() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinksList = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Scroll style for nav
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinksList.classList.toggle('active');
    });
  }

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (hamburger && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
        navLinksList.classList.remove('active');
      }
    });
  });

  // Active section highlighting
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.3, rootMargin: "-50px 0px -50px 0px" });

  sections.forEach(section => sectionObserver.observe(section));
}

/* ==========================================================================
   Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const btt = document.getElementById('btt');
  if (!btt) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btt.classList.add('visible');
    } else {
      btt.classList.remove('visible');
    }
  }, { passive: true });

  btt.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   Project Card 3D Tilt Effect
   ========================================================================== */
function initTiltEffect() {
  const cards = document.querySelectorAll('.project-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      // Calculate mouse position relative to card center
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Calculate rotation (max 5 degrees)
      const rotateX = -(y / (rect.height / 2)) * 5;
      const rotateY = (x / (rect.width / 2)) * 5;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.transition = 'none'; // Disable transition for smooth tracking
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
      card.style.transition = 'transform 0.5s ease-out'; // Re-enable transition for smooth reset
    });
  });
}

/* ==========================================================================
   Custom Cursor
   ========================================================================== */
function initCustomCursor() {
  // Skip on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.body.style.cursor = 'auto';
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
    return;
  }

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot follows instantly
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // Ring follows with slight lag for smooth feel
  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, .btn, .glass, .tag, .social-icon, .contact-card');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Hide cursor when mouse leaves window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}
