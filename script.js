/* ============================================================
   POINT BLANK — script.js
   Shared JavaScript used across every page.

   Contains:
     1. Mobile nav (hamburger) toggle — runs on every page
     2. Generic card filter helper — used by Events, Members,
        Achievements, OSS, Placements, and Talks pages
     3. Season filter (visual only) — used by Hustle Results
     4. Scroll-reveal animations — fades/slides sections and
        cards into view as the user scrolls (this is the big
        "smoothness" upgrade — the real Point Blank site does
        this on every section)
     5. Staggered grid entrance — makes cards in a grid animate
        in one after another instead of all at once
     6. Sticky navbar scroll state (shrink + deeper shadow)
     7. Button press ripple feedback
   ============================================================ */


/* ── 1. MOBILE NAV TOGGLE ────────────────────────────────────
   Every page has:
     <div class="hamburger" id="hamburger">...</div>
     <ul class="nav-links" id="navLinks">...</ul>
   Clicking the hamburger toggles the "open" class on the list,
   which CSS uses to show/hide the mobile menu.
   ──────────────────────────────────────────────────────────── */
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');

  // Guard clause — not every page may have these elements
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', function () {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open'); // lets CSS turn the icon into an X
  });

  // Close the mobile menu automatically after a link is tapped
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });
}


/* ── 2. GENERIC CARD FILTER ──────────────────────────────────
   Reusable filter logic for any page with:
     - a row of buttons with class "filter-btn" and a
       data-filter attribute (the category to show)
     - a set of cards with a matching data-* attribute

   Usage example (Events page):
     initCardFilter({
       cardSelector:  '.event-card',
       cardAttribute: 'cat'   // matches data-cat on each card
     });
   ──────────────────────────────────────────────────────────── */
function initCardFilter(options) {
  const buttonSelector = options.buttonSelector || '.filter-btn';
  const cardSelector    = options.cardSelector;
  const cardAttribute   = options.cardAttribute; // e.g. "cat", "domain", "role", "program", "topic"

  const filterButtons = document.querySelectorAll(buttonSelector);
  const cards          = document.querySelectorAll(cardSelector);

  // Guard clause — skip silently if this page has no filter UI
  if (filterButtons.length === 0 || cards.length === 0) return;

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const selected = btn.dataset.filter;

      // Update which button looks "active"
      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      // Show/hide with a quick fade instead of an instant snap —
      // makes filtering feel like a transition, not a hard cut
      cards.forEach(function (card) {
        const cardValue = card.dataset[cardAttribute];
        const matches    = selected === 'all' || cardValue === selected;

        if (matches) {
          card.style.display = '';
          // Re-trigger the fade-in on the card that's reappearing
          requestAnimationFrame(function () {
            card.style.opacity   = '0';
            card.style.transform = 'translateY(8px)';
            requestAnimationFrame(function () {
              card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              card.style.opacity    = '1';
              card.style.transform  = 'translateY(0)';
            });
          });
        } else {
          card.style.transition = 'opacity 0.2s ease';
          card.style.opacity    = '0';
          setTimeout(function () { card.style.display = 'none'; }, 200);
        }
      });
    });
  });
}


/* ── 3. SEASON FILTER (Hustle Results page) ──────────────────
   The Hustle Results page's season buttons only toggle which
   button looks active for now — they don't swap real podium/
   leaderboard data, since that would need a backend or
   per-season JSON files.

   When real per-season data is available, replace the
   commented TODO line below with logic that re-renders the
   podium and leaderboard based on btn.dataset.season.
   ──────────────────────────────────────────────────────────── */
function initSeasonFilter() {
  const seasonButtons = document.querySelectorAll('#filterBar .filter-btn[data-season]');

  if (seasonButtons.length === 0) return;

  seasonButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      seasonButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      // TODO: fetch/display the podium + leaderboard for btn.dataset.season
    });
  });
}


/* ── 4. SCROLL-REVEAL ANIMATIONS ──────────────────────────────
   This is the main "smoothness" upgrade. Instead of every
   section just being visible immediately on load, sections
   fade and slide into place as they enter the viewport —
   exactly like the real Point Blank site does.

   HOW TO USE IT IN YOUR HTML:
   Add the class "reveal" to any element you want to animate in.
   Optionally add one of these modifier classes to change the
   direction it animates from:
     reveal-up    (default) — slides up slightly while fading in
     reveal-left            — slides in from the left
     reveal-right           — slides in from the right
     reveal-scale            — scales up slightly while fading in

   You can also stagger a group of children automatically by
   adding "reveal-group" to their shared parent — see section 5.

   Example:
     <div class="mission-text reveal">...</div>
     <div class="img-block reveal reveal-right">...</div>

   NOTE: the actual opacity/transform starting states and the
   "visible" end state are defined in CSS (styles.css), under
   a section called SCROLL REVEAL ANIMATIONS. This script only
   toggles the "visible" class at the right time — it does not
   set any styles directly, so it stays easy to restyle.
   ──────────────────────────────────────────────────────────── */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length === 0) return;

  // Respect users who've asked their OS/browser to reduce motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Skip the animation entirely — just show everything immediately
    revealEls.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once revealed, we don't need to keep watching this element
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,                  // trigger once 15% of the element is visible
    rootMargin: '0px 0px -40px 0px'   // trigger slightly before it's fully in view
  });

  revealEls.forEach(function (el) { observer.observe(el); });
}


/* ── 5. STAGGERED GRID ENTRANCE ───────────────────────────────
   For card grids (Domains, Activities, Founders, Members, etc.)
   a uniform fade-in for every card at once looks flat. This
   adds a small increasing delay to each child inside a
   ".reveal-group" container so they animate in one after another
   like dominoes, left-to-right / top-to-bottom.

   HOW TO USE IT IN YOUR HTML:
     <div class="domains-grid reveal-group">
       <div class="domain-card reveal">...</div>
       <div class="domain-card reveal">...</div>
       ...
     </div>

   Each ".reveal" child inside a ".reveal-group" automatically
   gets a staggered transition-delay set via inline style —
   no extra classes needed per card.
   ──────────────────────────────────────────────────────────── */
function initStaggeredGroups() {
  const groups = document.querySelectorAll('.reveal-group');

  groups.forEach(function (group) {
    const children = group.querySelectorAll('.reveal');
    children.forEach(function (child, index) {
      // 70ms between each card — fast enough to not feel slow,
      // slow enough to visibly cascade
      child.style.transitionDelay = (index * 70) + 'ms';
    });
  });
}


/* ── 6. NAVBAR SCROLL BEHAVIOUR ───────────────────────────────
   Adds a "scrolled" class to the navbar once the user scrolls
   past the hero, used in CSS to slightly shrink the navbar
   height and deepen its shadow — a small touch that makes the
   page feel alive while scrolling instead of static.
   ──────────────────────────────────────────────────────────── */
function initNavbarScrollState() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function updateNavbarState() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Run once on load (in case the page is reloaded mid-scroll)
  updateNavbarState();
  window.addEventListener('scroll', updateNavbarState, { passive: true });
}


/* ── 7. BUTTON PRESS FEEDBACK (RIPPLE) ───────────────────────
   Small interaction polish: clicking any .btn shows a quick
   expanding ripple from the click point, similar to material-
   style feedback. Purely visual — does not affect navigation.
   ──────────────────────────────────────────────────────────── */
function initButtonRipple() {
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);

      ripple.style.width  = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left   = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top    = (e.clientY - rect.top - size / 2) + 'px';

      btn.appendChild(ripple);

      // Clean up the ripple element after the animation finishes
      ripple.addEventListener('animationend', function () {
        ripple.remove();
      });
    });
  });
}


/* ── 8. RUN ON PAGE LOAD ──────────────────────────────────────
   Hamburger menu and scroll-based effects run everywhere.
   Card filters and the season filter only do something if
   the relevant elements exist on the current page — see the
   guard clauses above — so this same script.js file is safe
   to include on every page without errors.
   ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initHamburgerMenu();
  initNavbarScrollState();
  initButtonRipple();

  // Stagger card groups BEFORE observing them, so the delay
  // is already set by the time each card becomes visible
  initStaggeredGroups();
  initScrollReveal();

  // Events page — filters by category (cp, hack, oss, web, cyber, ml)
  initCardFilter({
    cardSelector:  '.event-card',
    cardAttribute: 'cat'
  });

  // Members page — filters by domain (core, cp, oss, web, ml, cyber)
  initCardFilter({
    cardSelector:  '#membersGrid .member-card',
    cardAttribute: 'domain'
  });

  // Achievements page — filters timeline items by category
  initCardFilter({
    cardSelector:  '.timeline-item',
    cardAttribute: 'cat'
  });

  // OSS page — filters contributors by program (gsoc, lfx, extern, mlh)
  initCardFilter({
    cardSelector:  '.contributor-card',
    cardAttribute: 'program'
  });

  // Placements page — filters by role (sde, ml, intern, compiler)
  initCardFilter({
    cardSelector:  '.placement-card',
    cardAttribute: 'role'
  });

  // Talks page — filters by topic (cp, web, oss, ml, cyber, career)
  initCardFilter({
    cardSelector:  '.talk-card',
    cardAttribute: 'topic'
  });

  // Hustle Results page — season buttons (visual toggle only)
  initSeasonFilter();
});