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

  /* ---------------- manifesto: decorative marks sit left of the shared line ---------------- */
  (function () {
    var items = document.querySelectorAll('.manifesto-qa-item');
    var line = document.querySelector('.manifesto-qa-line');
    if (!items.length || !line) return;

    function align() {
      items.forEach(function (item) {
        var img = item.querySelector('.manifesto-qa-mark');
        var answer = item.querySelector('.manifesto-qa-answer');
        if (!img || !answer) return;
        // some items push their text down (so it reads lower on the page,
        // closer to where the shared line ends) before the mark below
        // anchors itself to the text's first line, so the two move
        // together; reset first, or a previous run's push would compound
        answer.style.transform = '';
        if (item.hasAttribute('data-push-down')) {
          var pushAdjust = parseFloat(item.getAttribute('data-push-down-adjust')) || 0;
          var pushBy = answer.getBoundingClientRect().height * parseFloat(item.getAttribute('data-push-down')) + pushAdjust;
          answer.style.transform = 'translateY(' + pushBy + 'px)';
        }
        var itemRect = item.getBoundingClientRect();
        var lineRect = line.getBoundingClientRect();
        var aRect = answer.getBoundingClientRect();
        var imgRect = img.getBoundingClientRect();
        var isReversed = item.classList.contains('manifesto-qa-item-reverse');
        var left;
        if (isReversed) {
          // mirrored layout: no line runs beside this item (see the line-a/
          // line-b split below), so the text isn't pinned to a line column
          // like the others; it's centered in the row instead (full size,
          // like the other items' marks - the mark's transparent background
          // means it can share bounding-box space near the text without the
          // two visibly colliding, same as in the reference PDF), with the
          // mark following to its right
          var gapR = 24;
          // the -314/-470 numbers below are fixed px tuned for the wide
          // desktop column; on a narrow mobile column they'd push the
          // text off the left edge of the viewport entirely, so fall back
          // to a safe "just centered, never negative" position there
          var centerLeft = window.innerWidth > 760
            ? Math.max(-314, (itemRect.width - aRect.width) / 2 - 470)
            : Math.max(0, (itemRect.width - aRect.width) / 2);
          // safety net for widths in between (e.g. tablets around 768px):
          // the -314 desktop cap above assumes a wide desktop column, and
          // can still push the text left of the viewport on a narrower one
          // that's just above the 760 cutoff; never let it go past the
          // same 16px edge margin used elsewhere
          var minCenterLeft = 16 - itemRect.left;
          if (centerLeft < minCenterLeft) centerLeft = minCenterLeft;
          answer.style.marginLeft = centerLeft + 'px';
          aRect = answer.getBoundingClientRect();
          if (window.innerWidth > 760) {
            var desiredLeft = aRect.right + gapR - itemRect.left;
            var maxLeft = window.innerWidth - 16 - imgRect.width - itemRect.left;
            left = Math.min(desiredLeft, maxLeft);
          } else {
            // in the single-column mobile layout the text fills the row,
            // so there's no gap beside it to put the mark into without
            // overlapping (it used to get squeezed into the text here);
            // center it below the text instead
            left = Math.max(16 - itemRect.left, (itemRect.width - imgRect.width) / 2);
          }
        } else {
          // the draft layout pushes the illustration further from the line/text
          // (kept where they already were) for more breathing room, echoing
          // the reference image's spacious illustration-left composition;
          // capped so the image never gets pushed past the viewport's edge
          // on narrow screens
          var edge = Math.min(lineRect.left, aRect.left);
          var gap = 24;
          if (item.closest('.manifesto-qa-draft')) {
            var maxGap = edge - imgRect.width - 16;
            gap = Math.max(8, Math.min(140, maxGap));
          }
          left = edge - imgRect.width - gap - itemRect.left;
          // per-item nudge left/right from that default position - a fixed
          // px value tuned for the wide desktop column, so it's skipped on
          // narrow viewports where it would push the mark into the text
          if (window.innerWidth > 760) {
            left += parseFloat(img.getAttribute('data-mark-left-adjust')) || 0;
          }
          // a large mark can otherwise be pushed off the left edge of the
          // viewport entirely when there isn't enough room before the line
          var minLeftEdge = 16 - itemRect.left;
          if (left < minLeftEdge) left = minLeftEdge;
        }
        // offset from a reference line, not centered on the whole
        // (multi-paragraph) answer block; the reference line and the offset
        // both come from the reference PDF layout and differ per item
        // (an item can flag a specific line as the anchor via
        // [data-mark-anchor], e.g. the mark sits beside a later paragraph
        // instead of the first one)
        var top;
        if (isReversed && window.innerWidth <= 760) {
          // follows the mark below the text (see the left calc above),
          // instead of the firstLine+offset anchor used everywhere else,
          // which was tuned for the mark sitting beside the first line
          top = aRect.bottom + 24 - itemRect.top;
        } else {
          var firstLine = answer.querySelector('[data-mark-anchor]') || answer.querySelector('.draft-line') || answer.querySelector('p');
          var refTop = firstLine ? firstLine.getBoundingClientRect().top : aRect.top;
          var offset = parseFloat(img.getAttribute('data-mark-offset'));
          if (isNaN(offset)) offset = 79;
          top = refTop + offset - itemRect.top;
        }
        img.style.left = left + 'px';
        img.style.top = top + 'px';
        // the mark is absolutely positioned, so it doesn't naturally push
        // the item's own box taller; when it's big enough to hang below
        // the text, stretch the item so the flex gap actually clears it
        // instead of the next item overlapping it
        item.style.minHeight = Math.max(itemRect.height, top + imgRect.height + 8) + 'px';
      });
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 400);
    // the marks are large PNGs that can still be loading when the timers
    // above fire, and an unloaded img has no natural height yet, so its
    // rect (and the minHeight computed from it) undershoots until this fires
    items.forEach(function (item) {
      var img = item.querySelector('.manifesto-qa-mark');
      if (img && !img.complete) img.addEventListener('load', align);
    });
  })();

  /* ---------------- manifesto: the shared line stops beside the reversed item, then resumes ---------------- */
  // the reference PDF's line isn't one unbroken run: it covers the first
  // item + decor, leaves a gap beside the reversed item (whose text sits
  // centered instead, with no line to align to), then resumes partway
  // through the gap before the last item
  (function () {
    var list = document.querySelector('.manifesto-qa-list');
    var lineA = document.querySelector('.manifesto-qa-line-a');
    var lineB = document.querySelector('.manifesto-qa-line-b');
    var decor = document.querySelector('.manifesto-qa-decor');
    var reversedItem = document.querySelector('.manifesto-qa-item-reverse');
    if (!list || !lineA || !lineB || !decor || !reversedItem) return;
    var revAnswer = reversedItem.querySelector('.manifesto-qa-answer');
    var allItems = document.querySelectorAll('.manifesto-qa-item');
    var lastItem = allItems[allItems.length - 1];
    var lastLines = lastItem.querySelectorAll('.draft-line');
    var lastLine = lastLines[lastLines.length - 1];

    function align() {
      var listTop = list.getBoundingClientRect().top;
      var decorBottom = decor.getBoundingClientRect().bottom;
      var answerRect = revAnswer.getBoundingClientRect();
      // line-b starts below the reversed item's text, leaving the same gap
      // there was above it (between line-a's end and the text's own top)
      var gapAboveText = answerRect.top - decorBottom;
      var resumeAt = answerRect.bottom + gapAboveText;
      lineA.style.top = '0px';
      lineA.style.height = Math.max(0, decorBottom - listTop) + 'px';
      var lineBTop = Math.max(0, resumeAt - listTop);
      lineB.style.top = lineBTop + 'px';
      // ends at the last item's own last line of text ("progettuali che li
      // attraversano."), not at the item's full box (which the mark, being
      // taller than the text, otherwise stretches well past that line)
      var lastLineBottom = lastLine ? lastLine.getBoundingClientRect().bottom : list.getBoundingClientRect().bottom;
      lineB.style.bottom = 'auto';
      lineB.style.height = Math.max(0, (lastLineBottom - listTop) - lineBTop) + 'px';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 400);
    setTimeout(align, 700);
    var revMark = reversedItem.querySelector('.manifesto-qa-mark');
    if (revMark && !revMark.complete) revMark.addEventListener('load', align);
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

  /* ---------------- shift "un tratto" one more step past "parte" (same step size as "Ogni" -> "parte") ---------------- */
  (function () {
    var parteDaLine = document.getElementById('parteDaLine');
    var unTrattoLine = document.getElementById('unTrattoLine');
    if (!parteDaLine || !unTrattoLine) return;

    function align() {
      // read the step "align parte" already applied, rather than
      // re-deriving it from the letters' current (already-aligned)
      // positions, which would just measure a zero gap
      var match = /translateX\(([-\d.]+)px\)/.exec(parteDaLine.style.transform);
      var step = match ? parseFloat(match[1]) : 0;
      unTrattoLine.style.transform = 'translateX(' + (step * 2) + 'px)';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 400);
  })();

  /* ---------------- stagger Q1's words with the same step as "Ogni" -> "parte" ---------------- */
  (function () {
    var parteDaLine = document.getElementById('parteDaLine');
    var heroCta = document.querySelector('.hero-cta');
    var q1Container = document.querySelector('.hero-cta-question-right');
    var q1Lines = q1Container ? q1Container.querySelectorAll(':scope > .line-mask') : [];
    if (!parteDaLine || !q1Lines.length) return;

    // each line inherits its container's own max-width by default; shrink
    // it by the applied shift so a shifted line's right edge never
    // reaches further than an unshifted line's would, avoiding horizontal
    // overflow on the last (most-shifted) word. getComputedStyle can't
    // reliably serialize a max-width that mixes min()/calc() with a %
    // term back into a pixel number, so each boundary is recomputed here
    // from the same values the CSS itself uses.
    function q1BaseMaxWidth() {
      if (!heroCta) return Infinity;
      return Math.min(850, heroCta.getBoundingClientRect().width - 48);
    }

    function stagger(lines, step, baseMaxWidth) {
      if (!lines.length) return;
      lines.forEach(function (line, i) {
        // "significasse" and "possibilità?" share the same indent; "Se
        // progettare" and "immaginare" stay flush left
        var shift = (i === 1 || i === 3) ? step : 0;
        line.style.transform = 'translateX(' + shift + 'px)';
        if (isFinite(baseMaxWidth)) {
          line.style.maxWidth = Math.max(0, baseMaxWidth - shift) + 'px';
        }
      });
    }

    // the desktop step is shared with an unrelated footer element (see the
    // name of this IIFE), tied to that element's own letter-kerning, not
    // to hero-cta's width - it happens to read as ~13.8% of the text
    // column's own max-width at desktop sizes. Reusing that same *pixel*
    // value verbatim at mobile widths doesn't preserve that proportion
    // (a much narrower column made the identical shift read as ~19.6% of
    // its own max-width instead - a visibly more aggressive stagger than
    // desktop's), so mobile instead re-derives the shift from the same
    // ratio applied to its own (much narrower) max-width.
    var DESKTOP_STEP_RATIO = 117 / 850;

    function align() {
      var baseMaxWidth = q1BaseMaxWidth();
      var step;
      if (window.innerWidth > 760) {
        var match = /translateX\(([-\d.]+)px\)/.exec(parteDaLine.style.transform);
        step = match ? parseFloat(match[1]) : 0;
      } else {
        step = isFinite(baseMaxWidth) ? baseMaxWidth * DESKTOP_STEP_RATIO : 0;
      }
      stagger(q1Lines, step, baseMaxWidth);
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 400);
  })();

  /* ---------------- Q2: "Come" stays left, "si dà forma" and "che ancora" shift 156px right, rest returns left ---------------- */
  (function () {
    var q2Container = document.querySelector('.hero-second-question');
    if (!q2Container) return;
    var q2Lines = q2Container.querySelectorAll(':scope > .line-mask');
    if (q2Lines.length < 4) return;
    var shiftedLines = [q2Lines[1], q2Lines[3]];

    function align() {
      q2Lines.forEach(function (line) { line.style.transform = 'none'; line.style.maxWidth = ''; });
      var containerRight = q2Container.getBoundingClientRect().right;
      var shift = 156;
      shiftedLines.forEach(function (line) {
        var rect = line.getBoundingClientRect();
        var maxWidth = Math.max(0, containerRight - (rect.left + shift));
        line.style.maxWidth = maxWidth + 'px';
        line.style.transform = 'translateX(' + shift + 'px)';
      });
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 400);
  })();

  /* ---------------- Q1: align "possibilità?" (last line) to the bottom of the vertical line ---------------- */
  (function () {
    var heroCtaLine = document.querySelector('.hero-cta-line');
    var q1Container = document.querySelector('.hero-cta-question-right');
    if (!heroCtaLine || !q1Container) return;
    var q1Lines = q1Container.querySelectorAll(':scope > .line-mask');
    var lastLine = q1Lines.length ? q1Lines[q1Lines.length - 1] : null;
    if (!lastLine) return;

    function align() {
      q1Container.style.transform = 'none';
      var lineBottom = heroCtaLine.getBoundingClientRect().bottom;
      var lastLineBottom = lastLine.getBoundingClientRect().bottom;
      var dy = lineBottom - lastLineBottom;
      q1Container.style.transform = 'translateY(' + dy + 'px)';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 450);
  })();

  /* ---------------- Q2: drop down so "Come" starts where "si dà forma" used to be ---------------- */
  (function () {
    var q2Container = document.querySelector('.hero-second-question');
    if (!q2Container) return;
    var q2Lines = q2Container.querySelectorAll(':scope > .line-mask');
    if (q2Lines.length < 2) return;
    var firstLine = q2Lines[0];
    var secondLine = q2Lines[1];

    function align() {
      q2Container.style.transform = 'none';
      q2Container.style.marginBottom = '';
      var baseMarginBottom = parseFloat(getComputedStyle(q2Container).marginBottom) || 0;
      var step = secondLine.getBoundingClientRect().top - firstLine.getBoundingClientRect().top;
      var dy = step * 2;
      q2Container.style.transform = 'translateY(' + dy + 'px)';
      // extra breathing room before the section-rule/partners strip below;
      // kept in JS (not as that rule's own margin-top) because it would
      // otherwise collapse against this element's own margin-bottom and
      // get silently swallowed by the larger of the two
      var extraGap = Math.min(200, Math.max(96, window.innerWidth * 0.12));
      // the transform doesn't reserve layout space, so the next sibling
      // (the section-rule before the partners strip) needs the shift added
      // back as margin, or it renders over the visually-dropped text
      q2Container.style.marginBottom = (baseMarginBottom + dy + extraGap) + 'px';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 450);
  })();

  /* ---------------- Q1 line extension: bridge down to just above Q2 ---------------- */
  // .hero-cta-line lives inside <section class="hero">, which clips its
  // own overflow (needed elsewhere for the cursor-blob effect) - so it
  // can't just be stretched past the section's own bottom edge to reach
  // Q2, which sits entirely outside that section. Growing the line's own
  // height in flow doesn't work either: it's the only normal-flow content
  // inside .hero-cta, so its height IS what drives the whole hero
  // section's height - taller line, section grows to match, and Q2 (a
  // sibling right after </section>) gets pushed down by the exact same
  // amount, leaving the visual gap unchanged. Instead this is a second,
  // separate line segment - absolutely positioned against <main> (see
  // "main, header, footer, section{position:relative}" - the same
  // approach the manifesto page uses for its own two-segment line) -
  // that bridges the two without touching either one's layout.
  (function () {
    var line = document.querySelector('.hero-cta-line');
    var ext = document.querySelector('.hero-cta-line-ext');
    var q2 = document.querySelector('.hero-second-question');
    var main = document.querySelector('main');
    if (!line || !ext || !q2 || !main) return;

    function align() {
      var mainRect = main.getBoundingClientRect();
      var lineRect = line.getBoundingClientRect();
      var q2Top = q2.getBoundingClientRect().top;
      var gap = 40;
      var height = q2Top - lineRect.bottom - gap;
      ext.style.left = (lineRect.left - mainRect.left) + 'px';
      ext.style.top = (lineRect.bottom - mainRect.top) + 'px';
      ext.style.height = Math.max(0, height) + 'px';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 500);
  })();

  /* ---------------- Q1/Q2 hover marks: mark-q1 left of Q1, mark-q2 right of Q2 ---------------- */
  (function () {
    var heroCta = document.querySelector('.hero-cta');
    var heroCtaLine = document.querySelector('.hero-cta-line');
    var q1Container = document.querySelector('.hero-cta-question-right');
    var q1Mark = document.querySelector('.hero-cta-mark');
    var q2Container = document.querySelector('.hero-second-question');
    var q2Mark = document.querySelector('.hero-second-mark');

    function alignQ1() {
      if (!heroCta || !heroCtaLine || !q1Container || !q1Mark) return;
      var heroCtaRect = heroCta.getBoundingClientRect();
      var lineRect = heroCtaLine.getBoundingClientRect();
      var q1Rect = q1Container.getBoundingClientRect();
      var markRect = q1Mark.getBoundingClientRect();
      var edgeMargin = 12;
      var gap = 54;
      var left = lineRect.left - heroCtaRect.left - markRect.width - gap;
      // keep the mark on-screen (only visible on hover, but it still
      // occupies layout space, so it must not push the page wider) even
      // where there isn't much room to the left of the line
      var minLeft = edgeMargin - heroCtaRect.left;
      if (left < minLeft) left = minLeft;
      var top = q1Rect.top + q1Rect.height / 2 - markRect.height / 2 - heroCtaRect.top;
      q1Mark.style.left = left + 'px';
      q1Mark.style.top = top + 'px';
    }

    function alignQ2() {
      if (!q2Container || !q2Mark) return;
      var q2Rect = q2Container.getBoundingClientRect();
      var lines = q2Container.querySelectorAll(':scope > .line-mask');
      var markRect = q2Mark.getBoundingClientRect();
      var textRight = q2Rect.left;
      lines.forEach(function (line) {
        textRight = Math.max(textRight, line.getBoundingClientRect().right);
      });
      var edgeMargin = 12;
      var gap = -48;
      var left = textRight - q2Rect.left + gap;
      // same on-screen safeguard as Q1, on the right edge this time
      var maxLeft = window.innerWidth - edgeMargin - markRect.width - q2Rect.left;
      if (left > maxLeft) left = maxLeft;
      var top = q2Rect.height / 2 - markRect.height / 2;
      q2Mark.style.left = left + 'px';
      q2Mark.style.top = top + 'px';
    }

    function align() {
      alignQ1();
      alignQ2();
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 500);
  })();

  /* ---------------- Q1/Q2 marks: uncovered by a growing circle centered on the cursor ---------------- */
  // no blur, no partial opacity: clip-path is a hard edge, so whatever's
  // inside the circle shows at full, native quality. The circle grows
  // from wherever the cursor enters (like pulling a cover back) instead
  // of the whole image just switching on, and shrinks back to wherever
  // the cursor leaves.
  if (fine) {
    (function () {
      var marks = Array.prototype.slice.call(
        document.querySelectorAll('.hero-cta-mark, .hero-second-mark')
      );
      if (!marks.length) return;

      // hysteresis: a smaller radius to reveal, a larger one to cover back
      // up, so sitting near the edge doesn't flicker on and off
      var SHOW_RADIUS = 90;
      var HIDE_RADIUS = 140;
      var visible = marks.map(function () { return false; });

      function setClip(mark, radius, x, y) {
        var val = 'circle(' + radius.toFixed(0) + 'px at ' + x.toFixed(0) + 'px ' + y.toFixed(0) + 'px)';
        mark.style.clipPath = val;
        mark.style.webkitClipPath = val;
      }

      window.addEventListener('mousemove', function (e) {
        marks.forEach(function (mark, i) {
          var r = mark.getBoundingClientRect();
          var cx = r.left + r.width / 2;
          var cy = r.top + r.height / 2;
          var dist = Math.hypot(e.clientX - cx, e.clientY - cy);
          var localX = e.clientX - r.left;
          var localY = e.clientY - r.top;
          if (!visible[i] && dist <= SHOW_RADIUS) {
            visible[i] = true;
            // big enough to cover the mark from any entry point
            setClip(mark, Math.hypot(r.width, r.height), localX, localY);
          } else if (visible[i] && dist > HIDE_RADIUS) {
            visible[i] = false;
            setClip(mark, 0, localX, localY);
          }
        });
      });
    })();
  }

  /* ---------------- center the footer-contact + footer-statement group on the page ---------------- */
  (function () {
    var footerTop = document.querySelector('.footer-top');
    var footer = document.querySelector('.footer');
    var contact = document.querySelector('.footer-contact');
    var unTrattoLine = document.getElementById('unTrattoLine');
    if (!footerTop || !footer || !contact || !unTrattoLine) return;

    function align() {
      footerTop.style.transform = 'none';
      if (window.innerWidth <= 760) return;
      var footerRect = footer.getBoundingClientRect();
      var cRect = contact.getBoundingClientRect();
      // footer-statement's own box is sized from its children's natural
      // (untransformed) widths, so it doesn't grow to include "parte da"
      // / "un tratto" sliding right via transform — measure the actual
      // rightmost visible line ("un tratto") instead of the container
      var unRect = unTrattoLine.querySelector('.line').getBoundingClientRect();
      var unionLeft = cRect.left;
      var unionRight = unRect.right;
      var unionCenter = (unionLeft + unionRight) / 2;
      var footerCenter = (footerRect.left + footerRect.right) / 2;
      var shift = footerCenter - unionCenter;
      footerTop.style.transform = 'translateX(' + shift + 'px)';
    }

    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }
    setTimeout(align, 400);
  })();

  /* ---------------- footer socials: sit a fixed gap below the lower of "made with..." and the statement ---------------- */
  (function () {
    var socials = document.querySelector('.footer-socials');
    var meta = document.querySelector('.footer-meta');
    var statement = document.querySelector('.footer-statement');
    if (!socials || !meta) return;

    function align() {
      socials.style.marginTop = '0px';
      var gap = 100;
      // on mobile, footer-contact stacks above footer-statement instead of
      // sitting beside it, so the statement can end lower than "made
      // with..." — anchor to whichever one actually ends further down
      var referenceBottom = meta.getBoundingClientRect().bottom;
      if (statement) {
        referenceBottom = Math.max(referenceBottom, statement.getBoundingClientRect().bottom);
      }
      var dy = referenceBottom + gap - socials.getBoundingClientRect().top;
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
  // the full counter/hero-intro animation is only for a genuine cold load
  // (typed URL, external link, first visit); arriving here by clicking an
  // internal nav link should feel instant, not replay a 1.6s intro
  var cameFromInternalNav = document.referrer && document.referrer.indexOf(location.origin) === 0;

  function startHero() { playHeroIntro(); }

  if (!preloaderCount) {
    // pages without the hero (e.g. manifesto) don't ship the counter markup
    // or play the intro, but still share the footer's .line-mask reveal
    // primitive - without resetting it here too, those lines stayed
    // hidden until scrolled into view (the scroll-triggered reveal
    // further below), instead of being visible right away like on the
    // pages that DO have the counter/intro
    document.body.classList.remove('is-preloading');
    document.querySelectorAll('.line').forEach(function (l) { l.style.transform = 'none'; });
  } else if (reduce || !window.gsap) {
    preloaderCount.style.display = 'none';
    document.body.classList.remove('is-preloading');
    document.querySelectorAll('.line').forEach(function (l) { l.style.transform = 'none'; });
  } else if (cameFromInternalNav) {
    // skip the counter AND the hero-intro fade/blur-in entirely: nothing
    // was ever hidden by JS on this load, so the page is already showing
    // its resting (fully visible) state the instant it paints
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
    a.addEventListener('click', function () {
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) === '#') {
        // stays on this page (e.g. "Home" -> #top): close normally
        setNav(false);
        return;
      }
      // leaves for another page: DON'T close here. Closing would fade the
      // overlay out (revealing this page's own content) while the browser
      // is still loading the next document - that gap is exactly the
      // flash this is meant to avoid. Instead leave the overlay open/
      // opaque as-is and let the destination page take over the same
      // covered look (see the inline <head> script + the block below),
      // fading out only once it's actually ready to be seen.
      sessionStorage.setItem('navTransition', '1');
    });
  });

  /* ---------------- nav overlay: reveal after a handoff from another page ---------------- */
  // the inline <head> script (see index.html/manifesto.html) already
  // covered this page with the same opaque overlay, with no transition,
  // before anything else painted - so there's no gap where raw/unstyled
  // content could show through. Coordinated with cameFromInternalNav
  // above (same referrer check the <head> script uses to decide whether
  // to cover in the first place) rather than a separate timer: by the
  // time this runs, the preloader branches above have already settled
  // this page into its resting, fully-visible state (or skipped the
  // intro entirely), so it's safe to lift the cover right away.
  if (document.documentElement.classList.contains('nav-transition-incoming')) {
    // this is a page-arrival handoff, not the user manually closing an
    // open menu - the destination page's own content should appear
    // instantly, with the nav-list never visibly shown here at all.
    // Closing it the normal way (setNav's usual fade) made the nav-list
    // text cross-fade visibly over this page's own text for about a
    // second instead, so the close stays instant too (no-transition held
    // through the whole handoff, not just lifting the CSS-only cover).
    navOverlay.classList.add('no-transition');
    document.documentElement.classList.remove('nav-transition-incoming');
    setNav(false);
    // force a style flush so the instant close above is actually
    // committed before no-transition comes off - reading an element's
    // geometry is a synchronous, guaranteed way to do that (unlike
    // requestAnimationFrame, which a backgrounded/inactive tab can defer
    // indefinitely), so this works the same regardless of tab visibility
    navOverlay.offsetHeight;
    navOverlay.classList.remove('no-transition');
  }

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
