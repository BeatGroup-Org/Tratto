(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;

  /* ---------------- align "i"->line, "Designer & Developer"->"Design", logo->"Designer & Developer" ---------------- */
  (function () {
    var group = document.querySelector('.hero-group:not(.offset)');
    var role = document.querySelector('.hero-role');
    var mark = document.querySelector('.hero-mark');
    var designI = document.getElementById('designI');
    var divider = document.querySelector('.hero-divider');
    var divider2 = document.querySelector('.hero-divider-2');
    var offsetGroup = document.querySelector('.hero-group.offset');
    var heroEl = document.querySelector('.hero');
    if (!group || !role || !mark || !designI || !divider) return;

    function align() {
      group.style.transform = 'none';
      var iRect = designI.getBoundingClientRect();
      var dRect = divider.getBoundingClientRect();
      var iCenter = iRect.left + iRect.width / 2;
      var dCenter = dRect.left + dRect.width / 2;
      group.style.transform = 'translateX(' + (dCenter - iCenter) + 'px)';

      role.style.transform = 'none';
      var groupLeft = group.getBoundingClientRect().left;
      var roleLeft = role.getBoundingClientRect().left;
      role.style.transform = 'translateX(' + (groupLeft - roleLeft) + 'px)';

      mark.style.transform = 'translateY(-16px)';
      var roleLeft2 = role.getBoundingClientRect().left;
      var markLeft = mark.getBoundingClientRect().left;
      mark.style.transform = 'translateY(-16px) translateX(' + (roleLeft2 - markLeft) + 'px)';

      // first segment stops at the bottom of "Designer & Developer"
      var heroRect = heroEl.getBoundingClientRect();
      var topRect = divider.getBoundingClientRect();
      var roleRect = role.getBoundingClientRect();
      divider.style.height = (roleRect.bottom - topRect.top) + 'px';

      // second segment resumes at the top of "UX/UI & Web-flow dev.", same x
      if (divider2 && offsetGroup) {
        var offRect = offsetGroup.getBoundingClientRect();
        divider2.style.top = (offRect.top - heroRect.top) + 'px';
        divider2.style.height = (offRect.bottom - offRect.top) + 'px';
      }
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
  })();

  /* ---------------- align "more" ("m") to the "t" of "nothing" ---------------- */
  (function () {
    var nothingT = document.getElementById('nothingT');
    var moreLine = document.getElementById('moreLine');
    if (!nothingT || !moreLine) return;

    function align() {
      moreLine.style.transform = 'none';
      var tRect = nothingT.getBoundingClientRect();
      var mRect = moreLine.getBoundingClientRect();
      moreLine.style.transform = 'translateX(' + (tRect.left - mRect.left) + 'px)';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
  })();

  /* ---------------- align "than a" ("t") to the "e" of "more" ---------------- */
  (function () {
    var moreE = document.getElementById('moreE');
    var thanT = document.getElementById('thanT');
    var offsetEl = document.querySelector('.footer-statement-offset');
    if (!moreE || !thanT || !offsetEl) return;

    function align() {
      offsetEl.style.transform = 'none';
      var eRect = moreE.getBoundingClientRect();
      var tRect = thanT.getBoundingClientRect();
      offsetEl.style.transform = 'translateX(' + (eRect.left - tRect.left) + 'px)';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
  })();

  /* ---------------- align "sentence." to start under the "m" of "more" ---------------- */
  (function () {
    var moreM = document.getElementById('moreM');
    var sentenceLine = document.getElementById('sentenceLine');
    if (!moreM || !sentenceLine) return;

    function align() {
      sentenceLine.style.transform = 'none';
      var mRect = moreM.getBoundingClientRect();
      var sRect = sentenceLine.getBoundingClientRect();
      sentenceLine.style.transform = 'translateX(' + (mRect.left - sRect.left) + 'px)';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
  })();

  /* ---------------- align footer-contact top to "than a" top, shifted right ---------------- */
  (function () {
    var contact = document.querySelector('.footer-contact');
    var target = document.getElementById('thanT');
    if (!contact || !target) return;

    function align() {
      contact.style.transform = 'none';
      var cRect = contact.getBoundingClientRect();
      var tRect = target.getBoundingClientRect();
      var dy = tRect.top - cRect.top - 52;
      contact.style.transform = 'translate(350px, ' + dy + 'px)';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
  })();

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

    gsap.utils.toArray('.footer .line').forEach(function (l, i) {
      gsap.to(l, {
        y: '0%', duration: .7, delay: i * .04,
        scrollTrigger: { trigger: '.footer-statement', start: 'top 85%', toggleActions: 'play none none reverse' }
      });
    });
    gsap.from('.footer-socials', {
      opacity: 0, y: 16, duration: .6, stagger: .1,
      scrollTrigger: { trigger: '.footer-statement', start: 'top 75%', toggleActions: 'play none none reverse' }
    });

    /* ---------------- watermark merges into "bleibtgleich" once it passes the social circles ---------------- */
    (function () {
      var wmLeft = document.querySelector('.watermark-half.left');
      var wmRight = document.querySelector('.watermark-half.right');
      var watermarkEl = document.querySelector('.watermark');
      var socialsEl = document.querySelector('.footer-socials');
      if (!wmLeft || !wmRight || !watermarkEl || !socialsEl) return;

      function mergeIn() {
        gsap.set([wmLeft, wmRight], { clearProps: 'transform' });
        var wRect = watermarkEl.getBoundingClientRect();
        var lRect = wmLeft.getBoundingClientRect();
        var rRect = wmRight.getBoundingClientRect();
        var centerX = wRect.left + wRect.width / 2;
        var totalW = lRect.width + rRect.width;
        var targetLeftX = centerX - totalW / 2;
        var targetRightX = targetLeftX + lRect.width;
        gsap.to(wmLeft, { x: targetLeftX - lRect.left, opacity: 1, duration: .6, ease: 'power3.out' });
        gsap.to(wmRight, { x: targetRightX - rRect.left, opacity: 1, duration: .6, ease: 'power3.out' });
      }
      function mergeOut() {
        gsap.to([wmLeft, wmRight], { x: 0, opacity: .1, duration: .5, ease: 'power3.out' });
      }

      function getStart() {
        var wmH = watermarkEl.getBoundingClientRect().height;
        return 'bottom bottom-=' + (wmH + 24);
      }

      ScrollTrigger.create({
        trigger: socialsEl,
        start: getStart,
        onEnter: mergeIn,
        onLeaveBack: mergeOut
      });
    })();
  } else {
    document.querySelectorAll('.line').forEach(function (l) { l.style.transform = 'none'; });
  }


  /* ---------------- page blob: goo trail following the cursor across the whole page ---------------- */
  if (fine && !reduce) {
    var pageBlobDots = document.getElementById('pageBlobDots');
    var SVG_NS_PAGE = 'http://www.w3.org/2000/svg';
    var P_MAX_OPACITY = 0.55;

    if (pageBlobDots) {
      var P_LIFETIME = 2600;
      var P_BASE_R = 120;
      var P_MIN_GAP = 20;
      var P_POOL_SIZE = 40;
      var pTrail = [];
      var pLastSpawn = 0;
      var pPool = [];

      for (var pi = 0; pi < P_POOL_SIZE; pi++) {
        var pc = document.createElementNS(SVG_NS_PAGE, 'circle');
        pc.setAttribute('fill', '#dcdcda');
        pc.setAttribute('fill-opacity', '0');
        pc.setAttribute('r', '0');
        pageBlobDots.appendChild(pc);
        pPool.push(pc);
      }

      function pAddPoint(x, y, born, rf, life) {
        pTrail.push({ x: x, y: y, born: born, rf: rf, life: life });
        if (pTrail.length > P_POOL_SIZE) pTrail.shift();
      }

      function pRandomLife() { return P_LIFETIME * (0.5 + Math.random() * 1.1); }

      // idle pool circles default to (0,0); left untouched, they can sit far
      // from the cursor once the page is scrolled, inflating the <g>'s
      // bounding box enough to break the goo filter's region. Snap every
      // circle to the first real cursor position before anything spawns.
      var pInitialized = false;
      function pSyncPoolTo(x, y) {
        for (var k = 0; k < pPool.length; k++) {
          pPool[k].setAttribute('cx', x.toFixed(1));
          pPool[k].setAttribute('cy', y.toFixed(1));
        }
        pInitialized = true;
      }

      window.addEventListener('mousemove', function (e) {
        var now = performance.now();
        if (now - pLastSpawn < P_MIN_GAP) return;
        pLastSpawn = now;
        var bx = e.clientX + window.scrollX, by = e.clientY + window.scrollY;
        if (!pInitialized) pSyncPoolTo(bx, by);

        pAddPoint(bx, by, now, 0.7 + Math.random() * 0.55, pRandomLife());
        var satellites = 2 + Math.floor(Math.random() * 3);
        for (var s = 0; s < satellites; s++) {
          var ang = Math.random() * Math.PI * 2;
          var dist = 10 + Math.random() * 46;
          pAddPoint(
            bx + Math.cos(ang) * dist,
            by + Math.sin(ang) * dist * 0.8,
            now + Math.random() * 8,
            0.22 + Math.random() * 0.45,
            pRandomLife() * 0.7
          );
        }
      });

      function pRevealFrame() {
        var now = performance.now();
        pTrail = pTrail.filter(function (p) { return now - p.born < p.life; });

        for (var i = 0; i < P_POOL_SIZE; i++) {
          var p = pTrail[i];
          var circle = pPool[i];
          if (!p) {
            circle.setAttribute('fill-opacity', '0');
            continue;
          }
          var t = (now - p.born) / p.life;
          var eased = 1 - Math.pow(1 - t, 2);
          var r = P_BASE_R * p.rf * (0.9 + 0.35 * eased);
          var a = Math.pow(1 - t, 0.6);
          circle.setAttribute('cx', p.x.toFixed(1));
          circle.setAttribute('cy', p.y.toFixed(1));
          circle.setAttribute('r', r.toFixed(1));
          circle.setAttribute('fill-opacity', (a * P_MAX_OPACITY).toFixed(2));
        }

        requestAnimationFrame(pRevealFrame);
      }
      pRevealFrame();
    }
  }

  /* ---------------- hero reveal: goo-mask trail unmasking hidden project tiles ---------------- */
  if (fine && !reduce) {
    var heroReveal = document.getElementById('heroReveal');
    var heroEl = document.querySelector('.hero');
    var maskDots = document.getElementById('maskDots');
    var SVG_NS = 'http://www.w3.org/2000/svg';

    if (heroReveal && heroEl && maskDots) {
      var LIFETIME = 2600;
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
          var a = Math.pow(1 - t, 0.6);
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

/* ---------------- ospiti: load guest cards from Supabase ---------------- */
(function () {
  var SUPABASE_URL = 'https://mtunqzrmozbbhxezxmmc.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dW5xenJtb3piYmh4ZXp4bW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTYxNDUsImV4cCI6MjEwNDUzMjE0NX0.JKdcWHs3Ex_UZWKhYMv0Dzsu0mstTDOusyyr0jmqfCY';

  var section = document.getElementById('ospiti');
  var grid = document.getElementById('ospitiGrid');
  if (!section || !grid) return;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function initials(name) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(function (part) { return part[0].toUpperCase(); })
      .join('');
  }

  function renderCard(guest) {
    var photo = guest.photo_url
      ? '<img src="' + escapeHtml(guest.photo_url) + '" alt="' + escapeHtml(guest.name) + '" loading="lazy">'
      : '<span class="initials">' + escapeHtml(initials(guest.name)) + '</span>';

    return (
      '<div class="ospiti-card">' +
        '<div class="ospiti-card-photo">' + photo + '</div>' +
        '<p class="ospiti-card-name">' + escapeHtml(guest.name) + '</p>' +
        (guest.role ? '<p class="ospiti-card-role">' + escapeHtml(guest.role) + '</p>' : '') +
        (guest.bio_short ? '<p class="ospiti-card-bio">' + escapeHtml(guest.bio_short) + '</p>' : '') +
      '</div>'
    );
  }

  fetch(SUPABASE_URL + '/rest/v1/guests?select=name,role,bio_short,photo_url&order=sort_order.asc,created_at.desc', {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + SUPABASE_ANON_KEY
    }
  })
    .then(function (res) { return res.ok ? res.json() : []; })
    .then(function (guests) {
      if (!guests || !guests.length) return;
      grid.innerHTML = guests.map(renderCard).join('');
      section.hidden = false;
    })
    .catch(function () {});
})();
