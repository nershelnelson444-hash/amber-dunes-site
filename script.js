/* ============================================================
   AMBER DUNES — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAVBAR always solid black ── */
  // Sync hero margin-top to exact navbar height — eliminates any gap
  function syncHeroMargin() {
    const nav  = document.getElementById('navbar');
    const hero = document.getElementById('home');
    if (!nav || !hero) return;
    const h = Math.ceil(nav.getBoundingClientRect().height);
    hero.style.setProperty('margin-top', h + 'px', 'important');
  }
  // Run immediately, on load, on resize, and after delays
  syncHeroMargin();
  window.addEventListener('resize', syncHeroMargin);
  window.addEventListener('load', () => {
    syncHeroMargin();
    setTimeout(syncHeroMargin, 200);
    setTimeout(syncHeroMargin, 600);
  });

  /* ── MOBILE MENU ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  /* ── HERO CAROUSEL (elegant crossfade) ── */
  const heroTrack  = document.getElementById('heroTrack');
  const heroDots   = document.getElementById('heroDots');
  const realSlides = Array.from(heroTrack.querySelectorAll('.hero-slide'));
  const total      = realSlides.length;
  let heroIndex    = 0;
  let heroTimer;
  let animating    = false;

  // Stack all slides on top of each other via absolute positioning
  heroTrack.style.position = 'relative';
  heroTrack.style.width    = '100%';
  heroTrack.style.height   = '100%';

  realSlides.forEach((slide, i) => {
    slide.style.position   = 'absolute';
    slide.style.inset      = '0';
    slide.style.width      = '100%';
    slide.style.height     = '100%';
    slide.style.opacity    = i === 0 ? '1' : '0';
    slide.style.transition = 'opacity 1200ms cubic-bezier(0.4, 0, 0.2, 1)';
    slide.style.zIndex     = i === 0 ? '1' : '0';
  });

  // Build dots
  realSlides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'hero-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goToHero(i));
    heroDots.appendChild(d);
  });

  function updateDots() {
    document.querySelectorAll('.hero-dot').forEach((d, i) => {
      d.classList.toggle('active', i === heroIndex);
    });
  }

  function goToHero(target) {
    if (animating) return;
    const next = ((target % total) + total) % total;
    if (next === heroIndex) return;

    animating = true;

    const current = realSlides[heroIndex];
    const incoming = realSlides[next];

    // Bring incoming slide up, start transparent
    incoming.style.transition = 'none';
    incoming.style.opacity    = '0';
    incoming.style.zIndex     = '2';

    // Force reflow
    incoming.getBoundingClientRect();

    // Fade in incoming
    incoming.style.transition = 'opacity 1200ms cubic-bezier(0.4, 0, 0.2, 1)';
    incoming.style.opacity    = '1';

    // After fade completes, reset current slide underneath
    setTimeout(() => {
      current.style.zIndex  = '0';
      current.style.opacity = '0';
      incoming.style.zIndex = '1';
      heroIndex = next;
      updateDots();
      animating = false;
    }, 1200);

    resetHeroTimer();
  }

  function resetHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => goToHero(heroIndex + 1), 6000);
  }

  document.getElementById('heroPrev').addEventListener('click', () => goToHero(heroIndex - 1));
  document.getElementById('heroNext').addEventListener('click', () => goToHero(heroIndex + 1));

  resetHeroTimer();

  /* ── SIGNATURE CAROUSEL ── */
  const sigTrack   = document.getElementById('sigTrack');
  const sigCards   = Array.from(sigTrack.querySelectorAll('.sig-card'));
  let sigIndex     = 0;

  function isMobile() { return window.innerWidth < 768; }

  function getSigVisible() {
    if (window.innerWidth < 400) return 1;
    if (window.innerWidth < 768) return 3;
    return 3;
  }

  function setSigSizes() {
    if (isMobile()) {
      // On mobile: reset all JS styles — CSS native scroll handles it
      sigCards.forEach(c => { c.style.minWidth = ''; c.style.width = ''; });
      sigTrack.style.width = '';
      sigTrack.style.transform = '';
      sigTrack.style.transition = '';
      return;
    }
    const visible = getSigVisible();
    const outerW  = sigTrack.parentElement.offsetWidth;
    const cardW   = outerW / visible;
    sigCards.forEach(c => c.style.minWidth = cardW + 'px');
    sigTrack.style.width = (sigCards.length * cardW) + 'px';
  }
  setSigSizes();
  updateSig(false);

  function updateSig(animate = true) {
    if (isMobile()) return; // handled by CSS scroll on mobile
    const visible = getSigVisible();
    const outerW  = sigTrack.parentElement.offsetWidth;
    const cardW   = outerW / visible;
    const maxIdx  = Math.max(0, sigCards.length - Math.floor(visible));
    sigIndex      = Math.min(Math.max(sigIndex, 0), maxIdx);
    sigTrack.style.transition = animate ? 'transform 700ms cubic-bezier(0.65,0,0.35,1)' : 'none';
    sigTrack.style.transform  = `translateX(-${sigIndex * cardW}px)`;
    // Arrow visibility
    const sigPrevBtn = document.getElementById('sigPrev');
    const sigNextBtn = document.getElementById('sigNext');
    if (sigPrevBtn) sigPrevBtn.style.visibility = sigIndex <= 0       ? 'hidden' : 'visible';
    if (sigNextBtn) sigNextBtn.style.visibility = sigIndex >= maxIdx  ? 'hidden' : 'visible';
  }

  document.getElementById('sigPrev').addEventListener('click', () => {
    if (isMobile()) {
      const outer = sigTrack.parentElement;
      const cardW = (outer.querySelector('.sig-card')?.offsetWidth || 90) + 8;
      outer.scrollBy({ left: -cardW, behavior: 'smooth' });
    } else { sigIndex--; updateSig(); }
  });
  document.getElementById('sigNext').addEventListener('click', () => {
    if (isMobile()) {
      const outer = sigTrack.parentElement;
      const cardW = (outer.querySelector('.sig-card')?.offsetWidth || 90) + 8;
      outer.scrollBy({ left: cardW, behavior: 'smooth' });
    } else { sigIndex++; updateSig(); }
  });



  window.addEventListener('resize', () => { setSigSizes(); if (!isMobile()) updateSig(false); });

  /* ── UNIFIED SCROLL REVEAL ── */

  // Elements that reveal as a group (children stagger slightly)
  const revealGroups = [
    '.signature-section',
    '.collection-section',
    '.how-section',
    '.about-section',
  ];

  // Add reveal class to section titles and key child elements
  document.querySelectorAll('.section-title, .about-title').forEach(el => {
    el.classList.add('reveal');
  });

  revealGroups.forEach(sel => {
    const section = document.querySelector(sel);
    if (!section) return;

    // Mark direct card children for staggered reveal
    const cards = section.querySelectorAll(
      '.sig-card, .coll-card, .how-step, .about-img, .about-text'
    );

    // Wrap cards in a reveal-group span context via class
    const parent = cards[0]?.parentElement;
    if (parent) parent.classList.add('reveal-group');

    cards.forEach(el => el.classList.add('reveal'));
  });

  // Single IntersectionObserver — fires once per section
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const section = entry.target;

      // Reveal title first
      const title = section.querySelector('.reveal');
      if (title) title.classList.add('in-view');

      // Then reveal all cards together with slight stagger
      const cards = section.querySelectorAll('.reveal-group .reveal');
      cards.forEach((el, i) => {
        setTimeout(() => el.classList.add('in-view'), i * 100);
      });

      // Reveal any standalone reveals (titles not in groups)
      section.querySelectorAll('.section-title.reveal, .about-title.reveal').forEach(el => {
        el.classList.add('in-view');
      });

      // If section itself has reveal class (e.g. faq-section), animate it directly
      if (section.classList.contains('reveal')) {
        section.classList.add('in-view');
      }

      revealObserver.unobserve(section);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -80px 0px'
  });

  // Observe each section as a whole unit
  document.querySelectorAll(
    '.signature-section, .collection-section, .how-section, .about-section'
  ).forEach(s => revealObserver.observe(s));



  /* ── EXPLORE THE COLLECTION MODAL ── */
  const modal       = document.getElementById('collectionModal');
  const modalSlides = document.getElementById('modalSlides');
  const modalDots   = document.getElementById('modalDots');
  const slides      = Array.from(modalSlides.querySelectorAll('.modal-slide'));
  let modalIndex    = 0;

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'modal-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goToModal(i));
    modalDots.appendChild(d);
  });

  function goToModal(idx) {
    // Clamp to boundaries — no looping
    modalIndex = Math.max(0, Math.min(slides.length - 1, idx));
    modalSlides.style.transform = `translateX(-${modalIndex * 100}%)`;
    document.querySelectorAll('.modal-dot').forEach((d, i) => {
      d.classList.toggle('active', i === modalIndex);
    });
    updateModalArrows();
  }

  function updateModalArrows() {
    const prev = document.getElementById('modalPrev');
    const next = document.getElementById('modalNext');
    if (!prev || !next) return;
    prev.style.visibility = modalIndex === 0                  ? 'hidden' : 'visible';
    next.style.visibility = modalIndex === slides.length - 1  ? 'hidden' : 'visible';
  }

  window.openModal = function(idx) {
    modalIndex = idx;
    modalSlides.style.transition = 'none';
    modalSlides.style.transform  = `translateX(-${idx * 100}%)`;
    document.querySelectorAll('.modal-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
    setTimeout(() => {
      modalSlides.style.transition = 'transform .5s cubic-bezier(0.4,0,0.2,1)';
    }, 50);
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    updateModalArrows();
  };

  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    // Reset scroll position inside modal
    document.querySelectorAll('.modal-content').forEach(el => el.scrollTop = 0);
  }

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalPrev').addEventListener('click', () => goToModal(modalIndex - 1));
  document.getElementById('modalNext').addEventListener('click', () => goToModal(modalIndex + 1));

  // Close on overlay click (outside modal box)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft' && document.getElementById('collectionModal').classList.contains('open')) goToModal(modalIndex - 1);
    if (e.key === 'ArrowRight' && document.getElementById('collectionModal').classList.contains('open')) goToModal(modalIndex + 1);
  });




  /* ── ENQUIRE MODAL ── */
  const enquireModal = document.getElementById('enquireModal');
  const enquireClose = document.getElementById('enquireClose');

  window.openEnquire = function(e) {
    e.preventDefault();
    const btn      = e.currentTarget;
    const perfume  = btn.dataset.perfume || '';
    const waBtn    = enquireModal.querySelector('.enquire-btn--wa');

    if (perfume && waBtn) {
      const msg = `Hi, I'd like to know if you have stock of ${perfume}. I'd also like to know more about it.`;
      waBtn.href = `https://wa.me/919778542502?text=${encodeURIComponent(msg)}`;
    } else if (waBtn) {
      waBtn.href = 'https://wa.me/919778542502?text=Hello%2C%20I%E2%80%99m%20interested%20in%20exploring%20your%20range%20of%20fragrances';
    }

    enquireModal.classList.add('open');
    document.body.classList.add('modal-open');
  };

  function closeEnquire() {
    enquireModal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  enquireClose.addEventListener('click', closeEnquire);

  enquireModal.addEventListener('click', (e) => {
    if (e.target === enquireModal) closeEnquire();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && enquireModal.classList.contains('open')) closeEnquire();
  });




  /* ── CURRENCY DETECTION ── */
  (async function detectCurrency() {
    const RATES = {
      INR: { symbol: '₹',   rate: 1      },
      AED: { symbol: 'AED ', rate: 0.044  },
      QAR: { symbol: 'QAR ', rate: 0.044  },
    };

    let currency = 'INR';

    try {
      const res  = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      const cc   = data.country_code;
      if      (cc === 'AE') currency = 'AED';
      else if (cc === 'QA') currency = 'QAR';
      else                  currency = 'INR';
    } catch (e) {
      currency = 'INR'; // default on error
    }

    const { symbol, rate } = RATES[currency];

    // Update all price elements
    document.querySelectorAll('.mpcard-price[data-price]').forEach(el => {
      const low  = parseInt(el.dataset.inrLow  || el.dataset.price);
      const high = parseInt(el.dataset.inrHigh || el.dataset.price);

      if (rate === 1) {
        // INR — show original range with commas
        el.textContent = `₹${low.toLocaleString('en-IN')} – ₹${high.toLocaleString('en-IN')}`;
      } else {
        const convLow  = Math.round(low  * rate);
        const convHigh = Math.round(high * rate);
        el.textContent = `${symbol}${convLow.toLocaleString()} – ${symbol}${convHigh.toLocaleString()}`;
      }

      el.dataset.currency = currency;
    });
  })();




  /* ── PERFUME NOTES POPUP ── */
  const notesModal   = document.getElementById('notesModal');
  const notesClose   = document.getElementById('notesClose');
  const notesName    = document.getElementById('notesName');
  const notesContent = document.getElementById('notesContent');

  const COLLECTION_NOTES = {
    'Sauvage Elixir': {
      top:   'Cinnamon, Nutmeg, Cardamom, Grapefruit',
      heart: 'Lavender',
      base:  'Licorice, Sandalwood, Amber, Patchouli, Vetiver'
    },
    'Noir Extreme': {
      top:   'Mandarin Orange, Neroli, Cardamom, Nutmeg, Saffron',
      heart: 'Kulfi, Rose, Mastic, Orange Blossom, Jasmine',
      base:  'Vanilla, Amber, Woody Notes, Sandalwood'
    },
    '9PM Night Out': {
      top:   'Dragon Fruit, Bergamot, Cognac, Lavender, Apple',
      heart: 'Cardamom, Mahonial, Suede, Toffee, Cedar',
      base:  'Tonka Bean, Akigalawood, Ambrofix, Patchouli'
    },
    'Stronger With You Intensely': {
      top:   'Spices, Pink Pepper, Juniper, Violet',
      heart: 'Lavender, Toffee Caramel, Cinnamon',
      base:  'Suede, Vanilla, Amber, Tonka Bean, Musk'
    },
    'Spicebomb Extreme': {
      top:   'Lavender, Cinnamon, Black Pepper',
      heart: 'Cinnamon, Cumin, Saffron',
      base:  'Tobacco, Vanilla, Bourbon, Amber'
    },
    "La Nuit de L'Homme": {
      top:   'Cardamom, Bergamot, Lemon',
      heart: 'Lavender, Cedarwood',
      base:  'Vetiver, Caraway, Tonka Bean, Amber'
    },
    'Bleu de Chanel EDT': {
      top:   'Lemon, Grapefruit, Mint, Pink Pepper',
      heart: 'Ginger, Jasmine, Nutmeg',
      base:  'Incense, Vetiver, Cedar, Sandalwood, Patchouli'
    },
    'Acqua di Gio Profondo': {
      top:   'Bergamot, Green Mandarin, Marine Notes',
      heart: 'Rosemary, Geranium, Lavender, Cypress',
      base:  'Patchouli, Musk, Ambroxan'
    },
    'Light Blue Pour Homme': {
      top:   'Sicilian Mandarin, Juniper, Grapefruit',
      heart: 'Rosemary, Sichuan Pepper, Brazilian Rosewood',
      base:  'Musk, Oakmoss, Incense, Amber'
    },
    'Versace Pour Homme': {
      top:   'Lemon, Bergamot, Neroli, Rose de Mai',
      heart: 'Hyacinth, Clary Sage, Cedar, Geranium',
      base:  'Tonka Bean, Musk, Amber'
    },
    'Hawas for Him': {
      top:   'Bergamot, Lemon, Pineapple, Apple',
      heart: 'Jasmine, Violet, Lily',
      base:  'Cedarwood, Amber, Musk'
    },
    'CK One': {
      top:   'Bergamot, Lemon, Pineapple, Green Notes',
      heart: 'Nutmeg, Violet, Orris, Jasmine',
      base:  'Musk, Amber, Cedar, Green Tea'
    },
    'Aventus': {
      top:   'Pineapple, Bergamot, Black Currant, Apple',
      heart: 'Birch, Patchouli, Rose, Jasmine',
      base:  'Musk, Oakmoss, Ambergris, Vanilla'
    },
    'Baccarat Rouge 540': {
      top:   'Saffron, Jasmine',
      heart: 'Amberwood, Ambergris',
      base:  'Fir Resin, Cedar'
    },
    'Armani Code Absolu': {
      top:   'Green Mandarin, Orange Blossom',
      heart: 'Tuberose, Heliotrope, Tonka Bean',
      base:  'Vanilla, Sandalwood, Leather'
    },
    'Le Male Le Parfum': {
      top:   'Bergamot, Cardamom',
      heart: 'Lavender, Cinnamon',
      base:  'Tonka Bean, Vanilla, Woods'
    },
    'Y EDP': {
      top:   'Bergamot, Ginger, Apple',
      heart: 'Sage, Geranium, Violet Leaf',
      base:  'Cedar, Amberwood, Tonka Bean'
    },
    '9PM': {
      top:   'Nutmeg, Cardamom, Elemi',
      heart: 'Pimento, Lavandin, Leather',
      base:  'Ciste, Labdanum, Patchouli, Vanilla'
    },
    'The Most Wanted EDP': {
      top:   'Bergamot, Lemon, Lavender',
      heart: 'Cardamom, Jasmine, Orange Blossom',
      base:  'Amber, Vanilla, Cedar, Tonka Bean'
    },
    'Oud & Roses': {
      top:   'Turkish Rose, Lavender, Lemon, Peony',
      heart: 'Sandalwood, White Flowers, Frankincense',
      base:  'Agarwood (Oud), Guaiac Wood, Oak Moss, Musk, Amber'
    },
    'Invictus Victory': {
      top:   'Pink Pepper, Grapefruit, Artemisia',
      heart: 'Bay Leaf, Jasmine',
      base:  'Patchouli, Ambergris, Tonka Bean'
    },
    '1 Million': {
      top:   'Blood Mandarin, Grapefruit, Mint',
      heart: 'Rose, Cinnamon, Spices',
      base:  'Leather, Amber, Woody Notes, Patchouli'
    },
    'Ombre Leather': {
      top:   'Cardamom, Pink Pepper',
      heart: 'Jasmine, Leather',
      base:  'Patchouli, Amber, Moss'
    },
    'Club de Nuit Intense Man': {
      top:   'Lemon, Black Currant, Apple, Bergamot',
      heart: 'Rose, Jasmine, Birch',
      base:  'Musk, Ambergris, Vanilla, Patchouli, Cedar'
    }
  };

  /* Open notes from collection modal product cards */
  window.openCardNotes = function(btn) {
    const perfume = btn.dataset.perfume;
    const notes   = COLLECTION_NOTES[perfume] || COLLECTION_NOTES[perfume.replace('&amp;','&')];
    if (!notes) return;

    notesName.textContent = perfume;
    notesContent.innerHTML =
      '<div class="notes-rows visible">' +
        '<div class="notes-row"><span class="notes-label">Top</span><span class="notes-value">' + notes.top + '</span></div>' +
        '<div class="notes-row"><span class="notes-label">Heart</span><span class="notes-value">' + notes.heart + '</span></div>' +
        '<div class="notes-row"><span class="notes-label">Base</span><span class="notes-value">' + notes.base + '</span></div>' +
      '</div>';

    notesModal.classList.add('open');
    document.body.classList.add('modal-open');
  };

  const PERFUME_NOTES = {
    'Afnan 9pm': {
      top:   'Nutmeg, Cardamom, Elemi',
      heart: 'Pimento, Lavandin, Leather',
      base:  'Ciste, Labdanum, Patchouli, Vanilla'
    },
    'Oud & Roses': {
      top:   'Turkish Rose, Lavender, Lemon, Peony',
      heart: 'Sandalwood, White Flowers, Frankincense',
      base:  'Agarwood (Oud), Guaiac Wood, Oak Moss, Musk, Amber'
    },
    'Sauvage Elixir': {
      top:   'Cinnamon, Nutmeg, Cardamom, Grapefruit',
      heart: 'Lavender',
      base:  'Licorice, Sandalwood, Amber, Patchouli, Vetiver'
    },
    'Le Male Elixir': {
      top:   'Plum, Bergamot, Cinnamon, Cardamom',
      heart: 'Lavender, Davana, Artemisia',
      base:  'Tonka Bean, Benzoin, Ambrette, Patchouli, Labdanum'
    },
    'Ahmed Al Maghribi': {
      top:   'Black Pepper, Nutmeg, Cardamom, Tobacco, Pineapple, Grapefruit',
      heart: 'Lavender, Iris, Patchouli, Coffee',
      base:  'Labdanum, Sandalwood, Haitian Vetiver, Amber, Benzoin, Vanilla'
    }
  };

  /* openNotesPopup — shows notes directly, no toggle */
  window.openNotesPopup = function(e) {
    e.preventDefault();
    const btn     = e.currentTarget;
    const perfume = btn.dataset.perfume || '';
    const notes   = PERFUME_NOTES[perfume];
    if (!notes) return;

    notesName.textContent = perfume;
    notesContent.innerHTML =
      '<div class="notes-rows visible">' +
        '<div class="notes-row"><span class="notes-label">Top</span><span class="notes-value">' + notes.top + '</span></div>' +
        '<div class="notes-row"><span class="notes-label">Heart</span><span class="notes-value">' + notes.heart + '</span></div>' +
        '<div class="notes-row"><span class="notes-label">Base</span><span class="notes-value">' + notes.base + '</span></div>' +
      '</div>';

    notesModal.classList.add('open');
    document.body.classList.add('modal-open');
  };

  /* Save original enquire (for fallback) */
  const _origOpenEnquire = window.openEnquire;

  /* Main notes popup opener */
  window.openEnquire = function(e) {
    e.preventDefault();
    const btn     = e.currentTarget;
    const perfume = btn.dataset.perfume || '';
    const notes   = PERFUME_NOTES[perfume];

    if (!notes) {
      _origOpenEnquire(e);
      return;
    }

    const waMsg = encodeURIComponent("Hi, I'd like to know if you have stock of " + perfume + ". I'd also like to know more about it.");

    notesName.textContent = perfume;
    notesContent.innerHTML =
      '<button class="notes-view-btn" id="notesViewBtn" onclick="toggleNotes()">VIEW NOTES</button>' +
      '<div class="notes-rows" id="notesRows">' +
        '<div class="notes-row"><span class="notes-label">Top</span><span class="notes-value">' + notes.top + '</span></div>' +
        '<div class="notes-row"><span class="notes-label">Heart</span><span class="notes-value">' + notes.heart + '</span></div>' +
        '<div class="notes-row"><span class="notes-label">Base</span><span class="notes-value">' + notes.base + '</span></div>' +
      '</div>' +
      '<div class="notes-divider"></div>' +
      '<div class="notes-icon-row">' +
        '<a href="https://www.instagram.com/amberdunes_perfumes?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" class="notes-icon-btn">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>' +
          '<span>Instagram</span>' +
        '</a>' +
        '<a href="https://wa.me/919778542502?text=' + waMsg + '" target="_blank" class="notes-icon-btn">' +
          '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.886a.5.5 0 0 0 .609.61l6.098-1.598A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 0 1-5.028-1.383l-.36-.215-3.733.978.997-3.645-.235-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>' +
          '<span>WhatsApp</span>' +
        '</a>' +
      '</div>';

    notesModal.classList.add('open');
    document.body.classList.add('modal-open');
  };

  window.toggleNotes = function() {
    const rows = document.getElementById('notesRows');
    const btn  = document.getElementById('notesViewBtn');
    if (!rows || !btn) return;
    const visible = rows.classList.toggle('visible');
    btn.textContent = visible ? 'HIDE NOTES' : 'VIEW NOTES';
  };

  function closeNotes() {
    notesModal.classList.remove('open');
    document.body.classList.remove('modal-open');
    /* reset for next open */
    const rows = document.getElementById('notesRows');
    const btn  = document.getElementById('notesViewBtn');
    if (rows) rows.classList.remove('visible');
    if (btn)  btn.textContent = 'VIEW NOTES';
  }

  notesClose.addEventListener('click', closeNotes);
  notesModal.addEventListener('click', function(e) {
    if (e.target === notesModal) closeNotes();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && notesModal.classList.contains('open')) closeNotes();
  });



  /* ── KNOW MORE POPUP ── */
  const knowMoreModal = document.getElementById('knowMoreModal');
  const knowMoreClose = document.getElementById('knowMoreClose');

  window.openKnowMore = function(e) {
    e.preventDefault();
    knowMoreModal.classList.add('open');
    document.body.classList.add('modal-open');
  };

  function closeKnowMore() {
    knowMoreModal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  knowMoreClose.addEventListener('click', closeKnowMore);
  knowMoreModal.addEventListener('click', function(e) {
    if (e.target === knowMoreModal) closeKnowMore();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && knowMoreModal.classList.contains('open')) closeKnowMore();
  });




  /* ── FAQ ACCORDION ── */
  window.toggleFaq = function(btn) {
    const item   = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const isOpen = btn.classList.contains('open');

    // Close all open items first
    document.querySelectorAll('.faq-q.open').forEach(function(openBtn) {
      openBtn.classList.remove('open');
      openBtn.closest('.faq-item').querySelector('.faq-a').classList.remove('open');
    });

    // Open clicked one if it was closed
    if (!isOpen) {
      btn.classList.add('open');
      answer.classList.add('open');
    }
  };












});