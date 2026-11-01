  const navShell = document.getElementById('navShell');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navShell.style.boxShadow = '0 20px 50px -14px rgba(20,45,60,0.32), 0 8px 20px -8px rgba(20,45,60,0.18)';
    } else {
      navShell.style.removeProperty('box-shadow'); // let the CSS floating shadow show at rest
    }
  });

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // mouse parallax on hero
  const heroSection = document.getElementById('heroSection');
  const heroParallax = document.getElementById('heroParallax');
  heroSection.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 18;
    const y = (e.clientY / window.innerHeight - 0.5) * 18;
    heroParallax.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(1.05)';
  });

  // burger menu (mobile) toggles nav links visibility
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  burger.addEventListener('click', () => {
    const open = navLinks.style.display === 'flex';
    navLinks.style.cssText = open ? '' : 'display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:rgba(255,255,255,0.9);backdrop-filter:blur(20px);border-radius:20px;padding:20px;gap:16px;box-shadow:0 20px 40px -10px rgba(0,0,0,0.2);';
  });

  /* ================= PHIL CARD BORDER GLOW (adapted from React Bits BorderGlow component) ================= */
  (function () {
    var cards = document.querySelectorAll('.phil-card');

    function getCenter(el) {
      var r = el.getBoundingClientRect();
      return [r.width / 2, r.height / 2];
    }
    function getEdgeProximity(el, x, y) {
      var c = getCenter(el), cx = c[0], cy = c[1];
      var dx = x - cx, dy = y - cy;
      var kx = Infinity, ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    }
    function getCursorAngle(el, x, y) {
      var c = getCenter(el), cx = c[0], cy = c[1];
      var dx = x - cx, dy = y - cy;
      if (dx === 0 && dy === 0) return 0;
      var degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (degrees < 0) degrees += 360;
      return degrees;
    }

    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var edge = getEdgeProximity(card, x, y);
        var angle = getCursorAngle(card, x, y);
        card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
        card.style.setProperty('--cursor-angle', angle.toFixed(3) + 'deg');
      }, { passive: true });
    });
  })();

  /* ================= TESTIMONIAL GLASS STACK ================= */
  (function () {
    const viewport = document.getElementById('testViewport');
    const cards = Array.from(viewport.querySelectorAll('.test-card'));
    const dotsWrap = document.getElementById('testDots');
    const prevBtn = document.getElementById('testPrev');
    const nextBtn = document.getElementById('testNext');
    const stack = document.getElementById('testStack');
    const total = cards.length;
    let active = 0;
    let autoplayId = null;
    let resumeId = null;

    // build dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'test-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function sizeStack() {
      let maxH = 0;
      cards.forEach(card => {
        card.style.position = 'static';
        card.style.visibility = 'hidden';
        card.style.width = getComputedStyle(card).width;
        maxH = Math.max(maxH, card.offsetHeight);
      });
      cards.forEach(card => {
        card.style.position = '';
        card.style.visibility = '';
        card.style.width = '';
        card.style.height = maxH + 'px';
      });
      viewport.style.height = maxH + 'px';
    }

    function render() {
      cards.forEach((card, i) => {
        card.style.removeProperty("transform"); // clear any stray inline transform left by dragging
        let diff = i - active;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;

        if (diff === 0) {
          card.style.setProperty('--tx', '0%');
          card.style.setProperty('--sc', '1');
          card.style.opacity = '1';
          card.style.zIndex = '3';
          card.classList.add('is-active');
        } else if (diff === -1 || (total <= 3 && diff === total - 1)) {
          card.style.setProperty('--tx', '-62%');
          card.style.setProperty('--sc', '0.86');
          card.style.opacity = '0.55';
          card.style.zIndex = '2';
          card.classList.remove('is-active');
        } else if (diff === 1 || (total <= 3 && diff === -(total - 1))) {
          card.style.setProperty('--tx', '62%');
          card.style.setProperty('--sc', '0.86');
          card.style.opacity = '0.55';
          card.style.zIndex = '2';
          card.classList.remove('is-active');
        } else {
          const side = diff < 0 ? -1 : 1;
          card.style.setProperty('--tx', (side * 115) + '%');
          card.style.setProperty('--sc', '0.7');
          card.style.opacity = '0';
          card.style.zIndex = '1';
          card.classList.remove('is-active');
        }
        card.style.pointerEvents = diff === 0 ? 'auto' : 'none';
      });
      dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
    }

    function goTo(index) {
      active = (index + total) % total;
      render();
    }
    function next() { goTo(active + 1); }
    function prev() { goTo(active - 1); }

    function startAutoplay() {
      stopAutoplay();
      autoplayId = setInterval(next, 5000);
    }
    function stopAutoplay() {
      if (autoplayId) clearInterval(autoplayId);
      autoplayId = null;
    }
    function pauseThenResume() {
      stopAutoplay();
      if (resumeId) clearTimeout(resumeId);
      resumeId = setTimeout(startAutoplay, 6000);
    }

    prevBtn.addEventListener('click', () => { prev(); pauseThenResume(); });
    nextBtn.addEventListener('click', () => { next(); pauseThenResume(); });
    stack.addEventListener('mouseenter', stopAutoplay);
    stack.addEventListener('mouseleave', startAutoplay);

    // drag / swipe support on the active card
    let dragging = false, startX = 0, deltaX = 0, activeEl = null;

    function dragStart(e) {
      const card = e.currentTarget;
      if (card.dataset.index != active) return;
      dragging = true;
      activeEl = card;
      startX = ('touches' in e ? e.touches[0].clientX : e.clientX);
      card.classList.add('is-dragging');
      stopAutoplay();
    }
    function dragMove(e) {
      if (!dragging) return;
      const clientX = ('touches' in e ? e.touches[0].clientX : e.clientX);
      deltaX = clientX - startX;
      activeEl.style.transform = 'translateX(-50%) translateX(' + deltaX + 'px) scale(1)';
    }
    function dragEnd() {
      if (!dragging) return;
      activeEl.classList.remove('is-dragging');
      if (Math.abs(deltaX) > 60) {
        deltaX < 0 ? next() : prev();
      } else {
        render();
      }
      dragging = false;
      deltaX = 0;
      pauseThenResume();
    }

    cards.forEach(card => {
      card.addEventListener('mousedown', dragStart);
      card.addEventListener('touchstart', dragStart, { passive: true });
    });
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', dragMove, { passive: true });
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);

    sizeStack();
    render();
    startAutoplay();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sizeStack, 150);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(sizeStack);
    }
  })();

  /* ================= EXPERIENCE EXPLORER ================= */
  (function () {
    const stage = document.getElementById('explrStage');
    const track = document.getElementById('explrTrack');
    const cards = Array.from(track.querySelectorAll('.explr-card'));
    const prevBtn = document.getElementById('explrPrev');
    const nextBtn = document.getElementById('explrNext');
    const navWrap = document.getElementById('explrNav');
    const total = cards.length;
    let active = 0, autoplayId = null, resumeId = null, lastWheel = 0;

    // build floating thumbnail nav from each card's photo + name
    cards.forEach((card, i) => {
      const photoSrc = card.querySelector('.photo-frame img').getAttribute('src');
      const name = card.querySelector('h3').textContent;
      const btn = document.createElement('button');
      btn.className = 'explr-thumb' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', 'Focus ' + name);
      btn.innerHTML = '<span class="explr-thumb-photo"><img src="' + photoSrc + '" alt=""></span><span class="explr-thumb-name">' + name + '</span>';
      btn.addEventListener('click', () => { goTo(i); pauseThenResume(); });
      navWrap.appendChild(btn);
    });
    const thumbs = Array.from(navWrap.children);

    function render() {
      cards.forEach((card, i) => {
        let diff = i - active;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;
        const abs = Math.abs(diff);
        card.classList.toggle('is-active', diff === 0);

        if (diff === 0) {
          card.style.transform = 'translate(-50%,-50%) scale(1) rotateY(0deg)';
          card.style.opacity = '1'; card.style.zIndex = '5'; card.style.filter = 'blur(0px)';
        } else if (abs === 1) {
          const side = diff < 0 ? -1 : 1;
          card.style.transform = 'translate(-50%,-50%) translateX(' + (side * 46) + '%) scale(0.82) rotateY(' + (side * -9) + 'deg)';
          card.style.opacity = '0.6'; card.style.zIndex = '4'; card.style.filter = 'blur(0.5px)';
        } else {
          const side = diff < 0 ? -1 : 1;
          card.style.transform = 'translate(-50%,-50%) translateX(' + (side * 72) + '%) scale(0.64) rotateY(' + (side * -14) + 'deg)';
          card.style.opacity = '0.2'; card.style.zIndex = '3'; card.style.filter = 'blur(1px)';
        }
        card.style.pointerEvents = diff === 0 ? 'auto' : 'none';
      });
      thumbs.forEach((t, i) => t.classList.toggle('active', i === active));
    }

    function goTo(index) { active = (index + total) % total; render(); }
    function next() { goTo(active + 1); }
    function prev() { goTo(active - 1); }

    function startAutoplay() { stopAutoplay(); autoplayId = setInterval(next, 6000); }
    function stopAutoplay() { if (autoplayId) clearInterval(autoplayId); autoplayId = null; }
    function pauseThenResume() {
      stopAutoplay();
      if (resumeId) clearTimeout(resumeId);
      resumeId = setTimeout(startAutoplay, 7000);
    }

    prevBtn.addEventListener('click', () => { prev(); pauseThenResume(); });
    nextBtn.addEventListener('click', () => { next(); pauseThenResume(); });
    stage.addEventListener('mouseenter', stopAutoplay);
    stage.addEventListener('mouseleave', startAutoplay);
    stage.addEventListener('focusin', stopAutoplay);
    stage.addEventListener('focusout', startAutoplay);

    // keyboard arrows
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { next(); pauseThenResume(); }
      if (e.key === 'ArrowLeft') { prev(); pauseThenResume(); }
    });

    // mouse wheel navigation (throttled)
    stage.addEventListener('wheel', (e) => {
      const now = Date.now();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 12) return;
      e.preventDefault();
      if (now - lastWheel < 700) return;
      lastWheel = now;
      delta > 0 ? next() : prev();
      pauseThenResume();
    }, { passive: false });

    // drag / swipe on the featured card
    let dragging = false, startX = 0, deltaX = 0, activeEl = null;
    function dragStart(e) {
      const card = e.currentTarget;
      if (!card.classList.contains('is-active')) return;
      dragging = true; activeEl = card;
      startX = ('touches' in e ? e.touches[0].clientX : e.clientX);
      card.classList.add('is-dragging'); stopAutoplay();
    }
    function dragMove(e) {
      if (!dragging) return;
      const clientX = ('touches' in e ? e.touches[0].clientX : e.clientX);
      deltaX = clientX - startX;
      activeEl.style.transform = 'translate(-50%,-50%) translateX(' + deltaX + 'px) scale(1) rotateY(0deg)';
    }
    function dragEnd() {
      if (!dragging) return;
      activeEl.classList.remove('is-dragging');
      if (Math.abs(deltaX) > 70) { deltaX < 0 ? next() : prev(); } else { render(); }
      dragging = false; deltaX = 0; pauseThenResume();
    }
    cards.forEach(card => {
      card.addEventListener('mousedown', dragStart);
      card.addEventListener('touchstart', dragStart, { passive: true });
    });
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', dragMove, { passive: true });
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);

    // subtle magnetic pull on the CTA links
    document.querySelectorAll('.explr-cta').forEach(cta => {
      cta.addEventListener('mousemove', (e) => {
        const r = cta.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.25;
        cta.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      cta.addEventListener('mouseleave', () => { cta.style.transform = ''; });
    });

    render();
    startAutoplay();
  })();

  /* ================= JOURNAL FLOW GALLERY ================= */
  (function () {
    const stories = [
      { loc:'Maldives', day:'Day 02', title:'Into the Blue',
        story:'The reef starts just past the house corals — a wall of yellow snapper parting for us like a curtain, then closing again as if we were never there.',
        img:'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1400&q=80' },
      { loc:'Maldives', day:'Day 03', title:'Where Water Meets Sky',
        story:'The villas curve out over water so still it doubles the sunrise — the first page of a journey that everything else was measured against.',
        img:'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1400&q=80' },
      { loc:'Dolomites, Italy', day:'Day 05', title:'Calm in the Mountains',
        story:'A rowboat, a glass-still lake, and peaks that seem too sharp to be real — we let the oars rest and just floated for a while.',
        img:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80' },
      { loc:'Bahamas', day:'Day 04', title:'Sailing into Blue',
        story:'From the air the marina looks like a postcard — from the deck it just feels like the trip finally slowed down.',
        img:'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1400&q=80' },
      { loc:'Iceland', day:'Day 06', title:'Land of Silence',
        story:'A canyon carved so slowly that moss has had centuries to soften every edge of the rock — nothing moved except the light.',
        img:'https://images.unsplash.com/photo-1531168556467-80aace0d0144?auto=format&fit=crop&w=1400&q=80' },
      { loc:'Bali', day:'Day 01', title:'Evenings Like These',
        story:'The last hour before dinner, spent watching the sky change colour over water that never once rippled.',
        img:'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1400&q=80' }
    ];

    const cards = Array.from(document.querySelectorAll('.jflow-card'));
    const lightbox = document.getElementById('jflowLightbox');
    const backdrop = document.getElementById('jflowLightboxBackdrop');
    const closeBtn = document.getElementById('jflowLightboxClose');
    const jlImg = document.getElementById('jlImg');
    const jlLoc = document.getElementById('jlLoc');
    const jlDay = document.getElementById('jlDay');
    const jlTitle = document.getElementById('jlTitle');
    const jlStory = document.getElementById('jlStory');

    function openLightbox(index) {
      const s = stories[index];
      jlImg.src = s.img;
      jlImg.alt = s.title;
      jlLoc.textContent = s.loc;
      jlDay.textContent = s.day;
      jlTitle.textContent = s.title;
      jlStory.textContent = s.story;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    cards.forEach((card) => {
      card.addEventListener('click', () => openLightbox(parseInt(card.dataset.index, 10)));
    });
    backdrop.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  })();

  /* ================= DESTINATION EXPLORER ================= */
  const destinations = [
    {
      emoji:'🏝', name:'Maldives', country:'Indian Ocean',
      photo:'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1000&q=80',
      gallery:['https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=500&q=80','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80','https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=500&q=80'],
      desc:'Private atolls, overwater villas, and water so clear the horizon disappears. Built for travelers who want the ocean to themselves.',
      season:'Nov – Apr', duration:'7–10 Days', price:'$18,400', rating:'4.9',
      highlights:['Private overwater villa with a plunge pool','Sunset sail with a local dive master','A reef entirely to yourselves at dawn'],
      itinerary:['Days 1–3 · Arrival & private atoll villa','Days 4–6 · Diving, sandbanks & spa days','Days 7–10 · Sunset cruise & farewell dinner at sea']
    },
    {
      emoji:'🏛', name:'Rome', country:'Italy',
      photo:'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
      gallery:['https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=500&q=80','https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?auto=format&fit=crop&w=500&q=80','https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=500&q=80'],
      desc:'A private historian, a rooftop over the Colosseum at golden hour, and pasta made by hand in a kitchen that doesn\'t take reservations.',
      season:'Apr – Jun, Sep – Oct', duration:'5–8 Days', price:'$12,900', rating:'4.8',
      highlights:['After-hours entry to the Colosseum','Rooftop dinner overlooking the Forum','A trattoria that has no sign, only a door'],
      itinerary:['Days 1–2 · Ancient Rome, guided after-hours','Days 3–5 · Trastevere, food, and hidden courtyards','Days 6–8 · Day trip to Tivoli & farewell rooftop dinner']
    },
    {
      emoji:'🏔', name:'Switzerland', country:'The Alps',
      photo:'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1000&q=80',
      gallery:['https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=500&q=80','https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&q=80','https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=500&q=80'],
      desc:'Alpine chalets, private funicular rides above the cloud line, and a stillness that only high altitude can give a place.',
      season:'Dec – Mar, Jun – Sep', duration:'6–9 Days', price:'$16,200', rating:'4.9',
      highlights:['Private chalet with a resident chef','Sunrise gondola, ahead of the crowds','A glacier picnic arranged just for two'],
      itinerary:['Days 1–3 · Zermatt & the Matterhorn','Days 4–6 · Lake Geneva & vineyard villages','Days 7–9 · Interlaken & alpine farewell dinner']
    },
    {
      emoji:'🌋', name:'Iceland', country:'Nordic Highlands',
      photo:'https://images.unsplash.com/photo-1531168556467-80aace0d0144?auto=format&fit=crop&w=1000&q=80',
      gallery:['https://images.unsplash.com/photo-1531168556467-80aace0d0144?auto=format&fit=crop&w=500&q=80','https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=500&q=80','https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&q=80'],
      desc:'Black sand, private hot springs, and skies that turn green after midnight. A landscape that feels like it belongs to no one.',
      season:'Jun – Aug, Sep – Mar (aurora)', duration:'6–8 Days', price:'$11,300', rating:'4.7',
      highlights:['A private hot spring, booked for the evening','Northern Lights chase with a photographer guide','Glacier hike on the south coast'],
      itinerary:['Days 1–3 · Reykjavík & the Golden Circle','Days 4–6 · South Coast, glaciers & black sand','Days 7–8 · Highlands & aurora farewell night']
    },
    {
      emoji:'🌴', name:'Bali', country:'Indonesia',
      photo:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
      gallery:['https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=500&q=80','https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=500&q=80','https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=500&q=80'],
      desc:'Rice terraces, a private villa with its own rice-paddy view, and a temple ceremony arranged through a family we\'ve known for a decade.',
      season:'Apr – Oct', duration:'7–10 Days', price:'$7,800', rating:'4.8',
      highlights:['Private villa with an infinity pool over the paddies','A sunrise temple ceremony, arranged personally','In-villa Balinese cooking class with a local family'],
      itinerary:['Days 1–3 · Ubud & the rice terraces','Days 4–6 · Temples, waterfalls & wellness days','Days 7–10 · Uluwatu coastline & farewell sunset']
    },
    {
      emoji:'🌊', name:'Santorini', country:'Greece',
      photo:'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
      gallery:['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=500&q=80','https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=500&q=80','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80'],
      desc:'Cliffside suites, a private catamaran around the caldera, and a sunset in Oia watched from a table set for no one but you.',
      season:'May – Oct', duration:'5–7 Days', price:'$9,200', rating:'4.8',
      highlights:['Cliffside suite with a private plunge pool','Sunset catamaran sail around the caldera','A closed-door dinner in a cliffside wine cave'],
      itinerary:['Days 1–2 · Oia & the caldera villages','Days 3–5 · Catamaran sail & volcanic beaches','Days 6–7 · Wine caves & farewell sunset dinner']
    }
  ];

  let active = 0;
  let bgToggle = false;
  const voyStage = document.getElementById('voyStage');
  const voyThumbs = document.getElementById('voyThumbs');
  const voyBgA = document.getElementById('voyBgA');
  const voyBgB = document.getElementById('voyBgB');
  const isMobile = () => window.innerWidth <= 560;

  function buildStage(){
    voyStage.innerHTML = '';
    destinations.forEach((d, i) => {
      const card = document.createElement('div');
      card.className = 'voy-card';
      card.dataset.index = i;
      card.innerHTML =
        '<div class="photo-frame"><img src="' + d.photo + '" alt="' + d.name + '" onerror="this.style.display=\'none\'"></div>' +
        '<div class="voy-card-shade"></div>' +
        '<div class="voy-card-rating glass">★ ' + d.rating + '</div>' +
        '<div class="voy-card-body"><div class="voy-card-country">' + d.country + '</div><div class="voy-card-name">' + d.name + '</div></div>';
      card.addEventListener('click', () => {
        if (parseInt(card.dataset.index) === active) { openModal(active); }
        else { active = i; renderAll(true); }
      });
      voyStage.appendChild(card);
    });
  }

  function positionCards(){
    const cards = voyStage.querySelectorAll('.voy-card');
    const len = destinations.length;
    cards.forEach((card) => {
      const i = parseInt(card.dataset.index);
      let diff = i - active;
      if (diff > len / 2) diff -= len;
      if (diff < -len / 2) diff += len;

      const mobile = isMobile();
      const stepX = mobile ? 0 : 260;
      const stepRot = mobile ? 0 : 20;

      let opacity, scale, blur, z, pe;
      if (diff === 0){ opacity = 1; scale = 1; blur = 0; z = 50; pe = 'auto'; card.classList.add('is-active'); }
      else if (Math.abs(diff) === 1){ opacity = mobile ? 0 : 0.55; scale = 0.78; blur = 2; z = 30; pe = 'auto'; card.classList.remove('is-active'); }
      else { opacity = 0; scale = 0.6; blur = 4; z = 10; pe = 'none'; card.classList.remove('is-active'); }

      const tx = diff * stepX;
      const rot = diff === 0 ? 0 : (diff > 0 ? -stepRot : stepRot);

      card.style.transform =
        'translateX(-50%) translateX(' + tx + 'px) scale(' + scale + ') rotateY(' + rot + 'deg)';
      card.style.opacity = opacity;
      card.style.filter = 'blur(' + blur + 'px)';
      card.style.zIndex = z;
      card.style.pointerEvents = pe;
    });
  }

  function updateBackground(){
    const d = destinations[active];
    const layers = [voyBgA, voyBgB];
    const showLayer = bgToggle ? voyBgB : voyBgA;
    const hideLayer = bgToggle ? voyBgA : voyBgB;
    showLayer.style.backgroundImage = 'url(' + d.photo + ')';
    requestAnimationFrame(() => {
      showLayer.style.opacity = '1';
      hideLayer.style.opacity = '0';
    });
    bgToggle = !bgToggle;
  }

  function updateInfo(){
    const d = destinations[active];
    const filled = Math.round(parseFloat(d.rating));
    const stars = '★★★★★'.slice(0, filled) + '☆☆☆☆☆'.slice(0, 5 - filled);
    const voyInfo = document.getElementById('voyInfo');
    voyInfo.innerHTML =
      '<div class="voy-info-country">' + d.country + '</div>' +
      '<div class="voy-info-name">' + d.name + '</div>' +
      '<p class="voy-info-story">' + d.desc + '</p>' +
      '<div class="voy-info-stars">' + stars + '<span>' + d.rating + ' / 5</span></div>' +
      '<div class="voy-info-facts">' +
        '<div class="voy-info-fact"><small>Best Season</small><strong>' + d.season + '</strong></div>' +
        '<div class="voy-info-fact"><small>Duration</small><strong>' + d.duration + '</strong></div>' +
        '<div class="voy-info-fact"><small>Starting From</small><strong>' + d.price + '</strong></div>' +
        '<div class="voy-info-fact"><small>Rating</small><strong>★ ' + d.rating + '</strong></div>' +
      '</div>' +
      '<button class="voy-info-cta" id="voyInfoCta">Begin Your Journey →</button>';
    document.getElementById('voyInfoCta').addEventListener('click', () => openModal(active));
  }

  function buildThumbs(){
    voyThumbs.innerHTML = '';
    destinations.forEach((d, i) => {
      const t = document.createElement('div');
      t.className = 'voy-thumb glass' + (i === active ? ' active' : '');
      t.innerHTML = '<span class="voy-thumb-photo"><img src="' + d.photo + '" alt="" onerror="this.style.display=\'none\'"></span>' + d.emoji + ' ' + d.name;
      t.addEventListener('click', () => { active = i; renderAll(true); });
      voyThumbs.appendChild(t);
    });
  }

  function renderAll(animateBg){
    positionCards();
    updateInfo();
    document.querySelectorAll('.voy-thumb').forEach((t, i) => t.classList.toggle('active', i === active));
    if (animateBg) updateBackground();
  }

  function next(){ active = (active + 1) % destinations.length; renderAll(true); }
  function prev(){ active = (active - 1 + destinations.length) % destinations.length; renderAll(true); }

  document.querySelector('.voy-next').addEventListener('click', next);
  document.querySelector('.voy-prev').addEventListener('click', prev);

  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('destinations')) return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // touch swipe support
  let touchStartX = 0;
  const voyPanelEl = document.querySelector('.voy-panel');
  if (voyPanelEl){
    voyPanelEl.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, {passive:true});
    voyPanelEl.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40){ dx < 0 ? next() : prev(); }
    }, {passive:true});
  }

  // modal
  const voyModal = document.getElementById('voyModal');
  function openModal(i){
    const d = destinations[i];
    document.getElementById('voyModalHeroPhoto').innerHTML = '<img src="' + d.photo + '" alt="' + d.name + '" onerror="this.style.display=\'none\'" style="width:100%;height:100%;object-fit:cover;">';
    document.getElementById('voyModalCountry').textContent = d.country;
    document.getElementById('voyModalName').textContent = d.name;
    document.getElementById('voyModalDesc').textContent = d.desc;
    document.getElementById('voyModalHighlights').innerHTML = d.highlights.map(h => '<li><span>◆</span>' + h + '</li>').join('');
    document.getElementById('voyModalItinerary').innerHTML = d.itinerary.map(h => '<li><span>◆</span>' + h + '</li>').join('');
    document.getElementById('voyModalGallery').innerHTML = d.gallery.map(g => '<div class="photo-frame"><img src="' + g + '" alt="' + d.name + '" onerror="this.style.display=\'none\'"></div>').join('');
    voyModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    voyModal.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.getElementById('voyModalClose').addEventListener('click', closeModal);
  document.getElementById('voyModalBackdrop').addEventListener('click', closeModal);
  document.getElementById('voyModalCta').addEventListener('click', () => {
    closeModal();
    document.getElementById('enquiry').scrollIntoView({behavior:'smooth'});
  });

  // init
  buildStage();
  buildThumbs();
  voyBgA.style.backgroundImage = 'url(' + destinations[0].photo + ')';
  voyBgA.style.opacity = '1';
  renderAll(false);
  window.addEventListener('resize', () => positionCards());


(function(){
  'use strict';

  /* ---- kill-switches: decide up front whether this should run at all ---- */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  var isLowPower = !!navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  var MOBILE_BREAKPOINT = 768;
  var TABLET_BREAKPOINT = 1100;

  if (prefersReduced || isTouch || isLowPower || window.innerWidth <= MOBILE_BREAKPOINT) return;

  var canvas = document.getElementById('ghostCursor');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d', {alpha:true});

  /* ---- brand settings (per spec) ---- */
  var PALETTE = ['#DDEEFF', '#F8FBFF', '#CBE6F4'];
  var TRAIL_LENGTH_DESKTOP = 18;
  var TRAIL_LENGTH_TABLET  = 10;   // "Tablet: reduced trail"
  var INERTIA           = 0.18;
  var BRIGHTNESS        = 0.9;
  var GRAIN_INTENSITY   = 0.015;
  var BLOOM_STRENGTH    = 0.05;
  var BLOOM_RADIUS      = 0.6;
  var BLOOM_THRESHOLD   = 0.08;
  var FADE_DELAY        = 300;     // ms of stillness before the trail starts fading
  var FADE_DURATION     = 900;     // ms for that fade to complete

  function paletteRgb(hex){
    var v = parseInt(hex.slice(1), 16);
    return {r:(v>>16)&255, g:(v>>8)&255, b:v&255};
  }
  var palette = PALETTE.map(paletteRgb);

  /* ---- canvas sizing ---- */
  var dpr = 1, trailLength = TRAIL_LENGTH_DESKTOP, points = [];

  function currentTrailLength(){
    return window.innerWidth <= TABLET_BREAKPOINT ? TRAIL_LENGTH_TABLET : TRAIL_LENGTH_DESKTOP;
  }

  function resize(){
    // live mobile check: hide gracefully if resized narrow (e.g. devtools, rotation)
    if (window.innerWidth <= MOBILE_BREAKPOINT){
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var newLength = currentTrailLength();
    if (newLength !== trailLength){
      trailLength = newLength;
      var last = points[points.length - 1] || {x:window.innerWidth/2, y:window.innerHeight/2};
      while (points.length < trailLength) points.push({x:last.x, y:last.y});
      points.length = trailLength;
    }
  }

  /* ---- interaction state, eased toward targets each frame ---- */
  var state = {
    scale:1, targetScale:1,
    brightness:BRIGHTNESS, targetBrightness:BRIGHTNESS,
    trailMul:1, targetTrailMul:1,
    speedMul:1, targetSpeedMul:1
  };
  function setHover(scale, brightnessAdd, trailMul, speedMul){
    state.targetScale = scale;
    state.targetBrightness = Math.min(1, BRIGHTNESS + brightnessAdd);
    state.targetTrailMul = trailMul;
    state.targetSpeedMul = speedMul;
  }
  function resetHover(){ setHover(1, 0, 1, 1); }

  /* ---- hover wiring: buttons, cards, gallery images — text is left alone ---- */
  var BUTTON_SELECTOR  = 'button, a.nav-cta, [class*="cta"]';
  var CARD_SELECTOR    = '.explr-card, .voy-card, .dest-card, .journey-card, .exp-card, .phil-card, .test-card';
  var GALLERY_SELECTOR = '.jflow-card, .gallery .photo-frame, .story-photo';

  function wire(selector, onEnter){
    document.querySelectorAll(selector).forEach(function(el){
      el.addEventListener('mouseenter', onEnter, {passive:true});
      el.addEventListener('mouseleave', resetHover, {passive:true});
    });
  }
  wire(BUTTON_SELECTOR,  function(){ setHover(1.13, 0.10, 1.0, 1.0); });   // grows, brightens, stays snappy
  wire(CARD_SELECTOR,    function(){ setHover(1.08, 0.04, 1.25, 1.0); });  // softly expands, trail lengthens
  wire(GALLERY_SELECTOR, function(){ setHover(1.05, 0.08, 1.15, 1.4); });  // brighter, slower, softer

  /* ---- pointer tracking ---- */
  var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  var lastMoveTime = performance.now();

  window.addEventListener('mousemove', function(e){
    mouseX = e.clientX; mouseY = e.clientY;
    lastMoveTime = performance.now();
  }, {passive:true});

  for (var i = 0; i < trailLength; i++) points.push({x:mouseX, y:mouseY});
  resize();
  window.addEventListener('resize', resize);

  /* ---- render loop ---- */
  var grainSeed = 0;

  function draw(now){
    state.scale      += (state.targetScale      - state.scale)      * 0.12;
    state.brightness += (state.targetBrightness - state.brightness) * 0.12;
    state.trailMul    += (state.targetTrailMul    - state.trailMul)    * 0.12;
    state.speedMul    += (state.targetSpeedMul    - state.speedMul)    * 0.12;

    var activeInertia = INERTIA / state.speedMul;

    points[0].x += (mouseX - points[0].x) * activeInertia;
    points[0].y += (mouseY - points[0].y) * activeInertia;
    for (var i = 1; i < points.length; i++){
      points[i].x += (points[i-1].x - points[i].x) * activeInertia;
      points[i].y += (points[i-1].y - points[i].y) * activeInertia;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    var idleFor = now - lastMoveTime;
    var idleFade = 1;
    if (idleFor > FADE_DELAY){
      idleFade = Math.max(0, 1 - (idleFor - FADE_DELAY) / FADE_DURATION);
    }
    if (idleFade <= 0){ requestAnimationFrame(draw); return; }

    var activeLength = Math.round(points.length * Math.min(state.trailMul, 1.4));
    var baseRadius = 16 * state.scale;

    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < Math.min(activeLength, points.length); i++){
      var p = points[i];
      var t = 1 - i / points.length; // 1 at head, fading toward the tail
      if (t <= BLOOM_THRESHOLD) continue;

      var alpha = t * state.brightness * idleFade * 0.5;
      var radius = baseRadius * (0.5 + t * 0.9);
      var c = palette[i % palette.length];

      var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      grad.addColorStop(0, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha.toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)');

      ctx.shadowBlur = 22 * BLOOM_RADIUS * state.scale;
      ctx.shadowColor = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (BLOOM_STRENGTH * t).toFixed(3) + ')';

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';

    // a breath of grain right at the head — never enough to read as "texture", just presence
    if (GRAIN_INTENSITY > 0 && idleFade > 0){
      grainSeed++;
      var head = points[0];
      ctx.globalAlpha = GRAIN_INTENSITY * idleFade;
      ctx.fillStyle = '#ffffff';
      for (var g = 0; g < 6; g++){
        ctx.fillRect(
          head.x + Math.sin(grainSeed * 13.1 + g) * 20,
          head.y + Math.cos(grainSeed * 7.7 + g) * 20,
          1, 1
        );
      }
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
