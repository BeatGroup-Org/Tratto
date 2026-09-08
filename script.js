(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;

  /* ---------------- preloader: big bottom-left counter, fades out ---------------- */
  var preloaderCount = document.getElementById('preloaderCount');
  var loadState = { n: 0 };

  function startHero() { playHeroIntro(); }

  if (reduce || !window.gsap) {
    preloaderCount.style.display = 'none';
    document.querySelectorAll('.line').forEach(function (l) { l.style.transform = 'none'; });
  } else {
    gsap.to(loadState, {
      n: 100,
      duration: 1.1,
      ease: 'power1.inOut',
      onUpdate: function () { preloaderCount.textContent = Math.round(loadState.n) + '%'; },
      onComplete: function () {
        gsap.to(preloaderCount, {
          opacity: 0,
          duration: .5,
          ease: 'power2.out',
          onComplete: function () { preloaderCount.style.display = 'none'; }
        });
        startHero();
      }
    });
  }

  /* ---------------- nav overlay ---------------- */
  var navToggle = document.getElementById('navToggle');
  var navOverlay = document.getElementById('navOverlay');
  var navOpen = false;

  function setNav(open) {
    navOpen = open;
    navToggle.setAttribute('aria-expanded', open);
    navToggle.textContent = open ? 'Close' : 'Menu';
    navOverlay.setAttribute('aria-hidden', !open);
    navOverlay.classList.toggle('is-open', open);
    if (window.gsap && !reduce) {
      gsap.to(navOverlay.querySelectorAll('.nav-col'), {
        scaleY: open ? 1 : 0,
        duration: .55,
        ease: open ? 'power4.out' : 'power3.in',
        stagger: open ? .07 : .04
      });
    }
  }
  navToggle.addEventListener('click', function () { setNav(!navOpen); });
  navOverlay.querySelectorAll('[data-nav-link]').forEach(function (a) {
    a.addEventListener('click', function () { setNav(false); });
  });

  /* ---------------- hero intro ---------------- */
  function playHeroIntro() {
    if (!window.gsap) return;
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.nav', { y: -14, opacity: 0, duration: .5 })
      .from('.hero-mark', { opacity: 0, scale: .6, duration: .5 }, '-=.2')
      .to('.hero-role .line', { y: '0%', duration: .6 }, '-=.2')
      .to('.hero-meta-row .line', { y: '0%', duration: .7, stagger: .06 }, '-=.3')
      .to('.hero-name .line', { y: '0%', duration: .9, stagger: .07 }, '-=.45')
      .from('.hero-divider', { scaleY: 0, transformOrigin: 'top', duration: .8 }, '-=.9')
      .to('.hero-group .line', { y: '0%', duration: .8, stagger: .05 }, '-=.3');
  }
  if (reduce) { document.body.classList.add('loaded'); }

  /* ---------------- scroll-triggered reveals ---------------- */
  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.hero-bigwords .line').forEach(function (l, i) {
      gsap.to(l, {
        y: '0%', duration: .8, ease: 'power4.out', delay: i * .04,
        scrollTrigger: { trigger: '.hero-bigwords', start: 'top 85%', toggleActions: 'play none none reverse' }
      });
    });
    gsap.to('.hero-copyright .line', {
      y: '0%', duration: .6,
      scrollTrigger: { trigger: '.hero-copyright', start: 'top 90%', toggleActions: 'play none none reverse' }
    });

    gsap.from('.ring-section', {
      opacity: 0, y: 40, duration: .9,
      scrollTrigger: { trigger: '.ring-section', start: 'top 80%', toggleActions: 'play none none reverse' }
    });

    gsap.utils.toArray('.featured-head .line').forEach(function (l, i) {
      gsap.to(l, {
        y: '0%', duration: .7, delay: i * .05,
        scrollTrigger: { trigger: '.featured-head', start: 'top 85%', toggleActions: 'play none none reverse' }
      });
    });
    gsap.from('.strip-item', {
      opacity: 0, x: 30, duration: .6, stagger: .08,
      scrollTrigger: { trigger: '.strip', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    gsap.utils.toArray('.ledger-head .line').forEach(function (l, i) {
      gsap.to(l, {
        y: '0%', duration: .7, delay: i * .05,
        scrollTrigger: { trigger: '.ledger-head', start: 'top 85%', toggleActions: 'play none none reverse' }
      });
    });
    gsap.from('.ledger-row', {
      opacity: 0, y: 16, duration: .5, stagger: .06,
      scrollTrigger: { trigger: '.ledger-table', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    gsap.utils.toArray('.footer .line').forEach(function (l, i) {
      gsap.to(l, {
        y: '0%', duration: .7, delay: i * .04,
        scrollTrigger: { trigger: '.footer-statement', start: 'top 85%', toggleActions: 'play none none reverse' }
      });
    });
    gsap.from('.footer-socials, .footer-wordmark', {
      opacity: 0, y: 16, duration: .6, stagger: .1,
      scrollTrigger: { trigger: '.footer-statement', start: 'top 75%', toggleActions: 'play none none reverse' }
    });
  } else {
    document.querySelectorAll('.line').forEach(function (l) { l.style.transform = 'none'; });
  }

  /* ---------------- ring: 3D orbit of tiles, drag + auto-rotate ---------------- */
  (function () {
    var wrap = document.getElementById('ringWrap');
    var tiles = Array.from(wrap.querySelectorAll('.ring-tile'));
    var n = tiles.length;
    var radius = Math.min(window.innerWidth * .34, 460);
    var rotation = 0;
    var autoSpeed = reduce ? 0 : .05;
    var dragging = false;
    var lastX = 0;

    function layout() {
      radius = Math.min(window.innerWidth * .34, 460);
      tiles.forEach(function (tile, i) {
        var angle = (360 / n) * i;
        tile.style.transform =
          'translate(-50%,-50%) rotateY(' + angle + 'deg) translateZ(' + radius + 'px)';
      });
    }

    function render() {
      wrap.style.transform = 'rotateY(' + rotation + 'deg)';
    }

    function frame() {
      if (!dragging) rotation += autoSpeed;
      render();
      requestAnimationFrame(frame);
    }

    wrap.addEventListener('pointerdown', function (e) {
      dragging = true; lastX = e.clientX; wrap.setPointerCapture(e.pointerId);
    });
    wrap.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      rotation += (e.clientX - lastX) * .3;
      lastX = e.clientX;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
      wrap.addEventListener(evt, function () { dragging = false; });
    });

    layout();
    window.addEventListener('resize', layout);
    frame();
  })();

  /* ---------------- fluid-ish canvas ripple ---------------- */
  (function () {
    var canvas = document.getElementById('fluidCanvas');
    var ctx = canvas.getContext('2d');
    var ripples = [];
    var section = document.getElementById('ringSection');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = section.clientWidth * dpr;
      canvas.height = section.clientHeight * dpr;
      canvas.style.width = section.clientWidth + 'px';
      canvas.style.height = section.clientHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    section.addEventListener('pointermove', function (e) {
      var rect = section.getBoundingClientRect();
      ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 0, a: .18 });
      if (ripples.length > 40) ripples.shift();
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ripples.forEach(function (p) {
        p.r += 2.4;
        p.a *= .96;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(13,13,12,' + p.a + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ripples = ripples.filter(function (p) { return p.a > .01; });
      requestAnimationFrame(draw);
    }
    if (!reduce) draw();
  })();

  /* ---------------- custom scrollbar thumb ---------------- */
  (function () {
    var thumb = document.getElementById('scrollThumb');
    var dragging = false;
    var startY = 0, startScroll = 0;

    function layout() {
      var doc = document.documentElement;
      var viewport = window.innerHeight;
      var total = doc.scrollHeight;
      var ratio = viewport / total;
      var h = Math.max(viewport * ratio, 40);
      var scrollable = total - viewport;
      var progress = scrollable > 0 ? doc.scrollTop / scrollable : 0;
      thumb.style.height = h + 'px';
      thumb.style.top = progress * (viewport - h) + 'px';
    }

    thumb.addEventListener('pointerdown', function (e) {
      dragging = true; startY = e.clientY; startScroll = window.scrollY;
      thumb.setPointerCapture(e.pointerId);
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var doc = document.documentElement;
      var viewport = window.innerHeight;
      var scrollable = doc.scrollHeight - viewport;
      var thumbTrack = viewport - parseFloat(thumb.style.height || 40);
      var dy = e.clientY - startY;
      var deltaScroll = thumbTrack > 0 ? (dy / thumbTrack) * scrollable : 0;
      window.scrollTo(0, startScroll + deltaScroll);
    });
    window.addEventListener('pointerup', function () { dragging = false; });

    window.addEventListener('scroll', layout, { passive: true });
    window.addEventListener('resize', layout);
    layout();
  })();

  /* ---------------- hero reveal: goo-mask trail unmasking hidden project tiles ---------------- */
  if (fine && !reduce) {
    var heroReveal = document.getElementById('heroReveal');
    var heroEl = document.querySelector('.hero');
    var maskDots = document.getElementById('maskDots');
    var SVG_NS = 'http://www.w3.org/2000/svg';

    if (heroReveal && heroEl && maskDots) {
      var LIFETIME = 1400;
      var BASE_R = 120;
      var MIN_GAP = 20;
      var POOL_SIZE = 40;
      var trail = [];
      var lastSpawn = 0;
      var rect = heroEl.getBoundingClientRect();
      var pool = [];

      for (var i = 0; i < POOL_SIZE; i++) {
        var c = document.createElementNS(SVG_NS, 'circle');
        c.setAttribute('fill', '#fff');
        c.setAttribute('fill-opacity', '0');
        c.setAttribute('r', '0');
        maskDots.appendChild(c);
        pool.push(c);
      }

      window.addEventListener('resize', function () { rect = heroEl.getBoundingClientRect(); });

      function addPoint(x, y, born, rf, life) {
        trail.push({ x: x, y: y, born: born, rf: rf, life: life });
        if (trail.length > POOL_SIZE) trail.shift();
      }

      // each piece gets its own lifespan, so a still cluster doesn't shrink
      // as one clean circle — pieces with a shorter life peel off and vanish
      // first, breaking the shape apart before the rest fades.
      function randomLife() { return LIFETIME * (0.5 + Math.random() * 1.1); }

      heroEl.addEventListener('mousemove', function (e) {
        var now = performance.now();
        if (now - lastSpawn < MIN_GAP) return;
        lastSpawn = now;
        var bx = e.clientX - rect.left, by = e.clientY - rect.top;

        // spawn an irregular little cluster, not a single clean circle —
        // this is what gives the shape a blot-like silhouette even when
        // the cursor briefly stalls in one spot.
        addPoint(bx, by, now, 0.7 + Math.random() * 0.55, randomLife());
        var satellites = 2 + Math.floor(Math.random() * 3);
        for (var s = 0; s < satellites; s++) {
          var ang = Math.random() * Math.PI * 2;
          var dist = 10 + Math.random() * 46;
          addPoint(
            bx + Math.cos(ang) * dist,
            by + Math.sin(ang) * dist * 0.8,
            now + Math.random() * 8,
            0.22 + Math.random() * 0.45,
            randomLife() * 0.7
          );
        }
      });

      function revealFrame() {
        var now = performance.now();
        trail = trail.filter(function (p) { return now - p.born < p.life; });

        for (var i = 0; i < POOL_SIZE; i++) {
          var p = trail[i];
          var circle = pool[i];
          if (!p) {
            circle.setAttribute('fill-opacity', '0');
            continue;
          }
          var t = (now - p.born) / p.life;
          var eased = 1 - Math.pow(1 - t, 2);
          var r = BASE_R * p.rf * (0.9 + 0.35 * eased);
          var a = 1 - eased;
          circle.setAttribute('cx', p.x.toFixed(1));
          circle.setAttribute('cy', p.y.toFixed(1));
          circle.setAttribute('r', r.toFixed(1));
          circle.setAttribute('fill-opacity', a.toFixed(2));
        }

        heroReveal.classList.toggle('is-active', trail.length > 0);
        requestAnimationFrame(revealFrame);
      }
      revealFrame();
    }
  }

  /* ---------------- cursor note: press "/" ---------------- */
  if (fine) {
    var note = document.getElementById('cursorNote');
    var noteActive = false;
    var noteText = '';
    var mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX; mouseY = e.clientY;
      if (noteActive) positionNote();
    });

    function positionNote() {
      note.style.transform = 'translate(' + (mouseX + 14) + 'px,' + (mouseY + 18) + 'px)';
    }

    window.addEventListener('keydown', function (e) {
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (!noteActive && e.key === '/') {
        e.preventDefault();
        noteActive = true;
        noteText = '';
        note.textContent = '|';
        note.classList.add('is-active');
        positionNote();
        return;
      }
      if (!noteActive) return;

      if (e.key === 'Escape' || e.key === 'Enter') {
        noteActive = false;
        note.classList.remove('is-active');
        return;
      }
      if (e.key === 'Backspace') {
        noteText = noteText.slice(0, -1);
      } else if (e.key.length === 1) {
        noteText += e.key;
      }
      note.textContent = noteText + '|';
    });
  }
})();
