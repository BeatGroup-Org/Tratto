(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;
  // true while the preload copyright-line travel animation is running, so
  // align() below doesn't re-measure the role text mid-transit and corrupt
  // the divider height
  var preloadSettling = false;

  /* ---------------- divider -> "Designer & Developer", logo -> "Based in Kyiv" ---------------- */
  (function () {
    var role = document.querySelector('.hero-role');
    var mark = document.querySelector('.hero-mark');
    var divider = document.querySelector('.hero-divider');
    var basedInKyiv = document.querySelector('.hero-meta-row .line-mask');
    if (!role || !mark || !divider) return;

    function align() {
      if (preloadSettling) return;

      // logo, role and the statement all share the same left inset (set in
      // CSS via --hero-inset), so no horizontal JS positioning is needed here.
      mark.style.transform = 'none';
      var markTop0 = mark.getBoundingClientRect().top;
      var markDy = basedInKyiv ? (basedInKyiv.getBoundingClientRect().top - markTop0) : 0;
      mark.style.transform = 'translateY(' + markDy + 'px)';

      // divider stops at the bottom of "Designer & Developer"
      var topRect = divider.getBoundingClientRect();
      var roleRect = role.getBoundingClientRect();
      divider.style.height = (roleRect.bottom - topRect.top) + 'px';
    }

    align();
    window.addEventListener('resize', align);
    window.addEventListener('load', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 400);
  })();

  /* ---------------- manifesto: decorative marks sit left of each item's line ---------------- */
  (function () {
    var items = document.querySelectorAll('.manifesto-qa-item');
    if (!items.length) return;

    function align() {
      items.forEach(function (item) {
        var img = item.querySelector('.manifesto-qa-mark');
        var line = item.querySelector('.manifesto-qa-item-line');
        var answer = item.querySelector('.manifesto-qa-answer');
        if (!img || !line || !answer) return;
        var itemRect = item.getBoundingClientRect();
        var lineRect = line.getBoundingClientRect();
        var aRect = answer.getBoundingClientRect();
        var imgRect = img.getBoundingClientRect();
        var gap = 24;
        var edge = Math.min(lineRect.left, aRect.left);
        var left = edge - imgRect.width - gap - itemRect.left;
        var top = aRect.top + aRect.height / 2 - imgRect.height / 2 - itemRect.top;
        img.style.left = left + 'px';
        img.style.top = top + 'px';
      });
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 400);
  })();

  /* ---------------- manifesto: item lines extend past the answer, like the menu line ---------------- */
  (function () {
    var items = document.querySelectorAll('.manifesto-qa-item');
    if (!items.length) return;

    function align() {
      items.forEach(function (item, i) {
        var line = item.querySelector('.manifesto-qa-item-line');
        if (!line) return;
        var lineTop = line.getBoundingClientRect().top;
        var itemBottom = item.getBoundingClientRect().bottom;
        var extend = 280;
        var desiredBottom = itemBottom + extend;
        var nextItem = items[i + 1];
        if (nextItem) {
          var clearance = 24;
          var maxBottom = nextItem.getBoundingClientRect().top - clearance;
          desiredBottom = Math.min(desiredBottom, maxBottom);
        }
        line.style.height = (desiredBottom - lineTop) + 'px';
      });
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 400);
  })();

  /* ---------------- nav overlay line: stops at the bottom of the nav links, like the home hero divider ---------------- */
  (function () {
    var line = document.querySelector('.nav-overlay-line');
    var navList = document.querySelector('.nav-list');
    if (!line || !navList) return;

    function align() {
      var lineTop = line.getBoundingClientRect().top;
      var listBottom = navList.getBoundingClientRect().bottom;
      line.style.height = ((listBottom - lineTop + 140) * 2) + 'px';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 400);
  })();

  /* ---------------- align "parte" ("p") to the "n" of "Ogni" ---------------- */
  (function () {
    var ogniN = document.getElementById('ogniN');
    var parteP = document.getElementById('parteP');
    var parteDaLine = document.getElementById('parteDaLine');
    if (!ogniN || !parteP || !parteDaLine) return;

    function align() {
      parteDaLine.style.transform = 'none';
      var shift = ogniN.getBoundingClientRect().left - parteP.getBoundingClientRect().left;
      parteDaLine.style.transform = 'translateX(' + shift + 'px)';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
  })();

  /* ---------------- align "un" ("u") to the "d" of "da" ---------------- */
  (function () {
    var daD = document.getElementById('daD');
    var unU = document.getElementById('unU');
    var unTrattoLine = document.getElementById('unTrattoLine');
    if (!daD || !unU || !unTrattoLine) return;

    function align() {
      unTrattoLine.style.transform = 'none';
      var shift = daD.getBoundingClientRect().left - unU.getBoundingClientRect().left;
      unTrattoLine.style.transform = 'translateX(' + shift + 'px)';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
  })();

  /* ---------------- footer socials: sit a fixed gap below "made with..." ---------------- */
  (function () {
    var socials = document.querySelector('.footer-socials');
    var meta = document.querySelector('.footer-meta');
    if (!socials || !meta) return;

    function align() {
      socials.style.marginTop = '0px';
      var gap = 100;
      var dy = meta.getBoundingClientRect().bottom + gap - socials.getBoundingClientRect().top;
      socials.style.marginTop = dy + 'px';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 400);
  })();

  /* ---------------- preloader: big bottom-left counter, fades out ---------------- */
  var preloaderCount = document.getElementById('preloaderCount');
  var loadState = { n: 0 };

  function startHero() { playHeroIntro(); }

  if (reduce || !window.gsap) {
    preloaderCount.style.display = 'none';
    document.body.classList.remove('is-preloading');
    document.querySelectorAll('.line').forEach(function (l) { l.style.transform = 'none'; });
  } else {
    var preMark = document.querySelector('.hero-mark');
    var preRole = document.querySelector('.hero-role');
    var preRoleLine = preRole ? preRole.querySelector('.line') : null;
    var preCtaLine = document.querySelector('.hero-cta-line');
    var preMetaLines = document.querySelectorAll('.hero-meta-row .line');

    // everything stays hidden except the divider (grows in) and the
    // copyright line, which starts where the logo sits and travels down
    // to its own resting spot as the page loads; the date/location on the
    // right is shown right away instead of waiting for the hero intro
    gsap.set('.hero-divider', { scaleY: 0, transformOrigin: 'top' });
    if (preMark) gsap.set(preMark, { opacity: 0 });
    if (preCtaLine) gsap.set(preCtaLine, { opacity: 0 });
    if (preMetaLines.length) gsap.set(preMetaLines, { y: '0%' });

    var startDy = 0;
    if (preMark && preRole) {
      startDy = preMark.getBoundingClientRect().top - preRole.getBoundingClientRect().top;
    }
    if (preRoleLine) gsap.set(preRoleLine, { y: '0%' });
    if (preRole) gsap.set(preRole, { y: startDy });
    preloadSettling = true;

    gsap.to(loadState, {
      n: 100,
      duration: 1.6,
      ease: 'power1.inOut',
      onUpdate: function () {
        preloaderCount.textContent = Math.round(loadState.n) + '%';
        var p = loadState.n / 100;
        gsap.set('.hero-divider', { scaleY: p });
        if (preRole) gsap.set(preRole, { y: startDy * (1 - p) });
      },
      onComplete: function () {
        preloadSettling = false;
        document.body.classList.remove('is-preloading');
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

  var navToggleLabel = navToggle.querySelector('.nav-toggle-label');

  function setNav(open) {
    navOpen = open;
    navToggle.setAttribute('aria-expanded', open);
    navToggle.classList.toggle('is-open', open);
    if (navToggleLabel) navToggleLabel.textContent = open ? 'Chiudi' : 'Menu';
    navOverlay.setAttribute('aria-hidden', !open);
    navOverlay.classList.toggle('is-open', open);
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
      .fromTo('.hero-mark', { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .5 }, '-=.2')
      .to('.hero-meta-row .line', { y: '0%', duration: .7, stagger: .06 }, '-=.2')
      .fromTo('.hero-name .line', { filter: 'blur(18px)' }, { filter: 'blur(0px)', y: '0%', duration: .9, stagger: .07 }, '-=.45')
      .fromTo('.hero-statement .line', { filter: 'blur(18px)' }, { filter: 'blur(0px)', y: '0%', duration: .8, stagger: .05 }, '-=.5')
      .to('.hero-cta-line', { opacity: 1, duration: .4 }, '-=.3')
      .to('.hero-cta .line', { y: '0%', duration: .7, stagger: .08 }, '-=.2')
      .to('.hero-second-question .line', { y: '0%', duration: .7, stagger: .06 }, '-=.3')
      .to('.ospiti-header .line', { y: '0%', duration: .6 }, '-=.2');
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

  var grid = document.getElementById('ospitiGrid');
  var empty = document.getElementById('ospitiEmpty');
  if (!grid) return;

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

  fetch(SUPABASE_URL + '/rest/v1/guests?select=name,role,bio_short,photo_url&featured=eq.true&order=sort_order.asc,created_at.desc', {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + SUPABASE_ANON_KEY
    }
  })
    .then(function (res) { return res.ok ? res.json() : []; })
    .then(function (guests) {
      if (!guests || !guests.length) {
        if (empty) empty.hidden = false;
        return;
      }
      grid.innerHTML = guests.map(renderCard).join('');
    })
    .catch(function () {
      if (empty) empty.hidden = false;
    });
})();

/* ---------------- contact form: submit messages to Supabase ---------------- */
(function () {
  var SUPABASE_URL = 'https://mtunqzrmozbbhxezxmmc.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dW5xenJtb3piYmh4ZXp4bW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTYxNDUsImV4cCI6MjEwNDUzMjE0NX0.JKdcWHs3Ex_UZWKhYMv0Dzsu0mstTDOusyyr0jmqfCY';

  var form = document.getElementById('contactForm');
  var status = document.getElementById('contactFormStatus');
  if (!form) return;

  var button = form.querySelector('button');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();
    if (!name || !email || !message) return;

    button.disabled = true;
    if (status) { status.hidden = true; status.classList.remove('is-error'); }

    fetch(SUPABASE_URL + '/rest/v1/contact_messages', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ name: name, email: email, message: message })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('request failed');
        form.reset();
        if (status) {
          status.textContent = 'Messaggio inviato, grazie.';
          status.hidden = false;
        }
      })
      .catch(function () {
        if (status) {
          status.textContent = 'Errore nell\'invio, riprova.';
          status.classList.add('is-error');
          status.hidden = false;
        }
      })
      .then(function () {
        button.disabled = false;
      });
  });
})();

/* ---------------- privacy policy modal ---------------- */
(function () {
  var modal = document.getElementById('privacyModal');
  if (!modal) return;

  var openers = document.querySelectorAll('[data-privacy-open]');
  var closers = modal.querySelectorAll('[data-privacy-close]');

  function open() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }
  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  openers.forEach(function (btn) { btn.addEventListener('click', open); });
  closers.forEach(function (el) { el.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();
