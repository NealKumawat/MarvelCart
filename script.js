/* ============================================================
   POINT BLANK — script.js
   Shared JavaScript used across every page.

   Contains:
     1. Mobile nav (hamburger) toggle — runs on every page
     2. Generic card filter helper — used by Events, Members,
        Achievements, OSS, Placements, and Talks pages
     3. Season filter (visual only) — used by Hustle Results
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
  });
}


/* ── 2. GENERIC CARD FILTER ──────────────────────────────────
   Reusable filter logic for any page with:
     - a row of buttons with class "filter-btn" and a
       data-filter attribute (the category to show)
     - a set of cards with a matching data-* attribute

   Usage example (Events page):
     initCardFilter({
       buttonSelector: '.filter-btn',
       cardSelector:   '.event-card',
       cardAttribute:  'cat'   // matches data-cat on each card
     });

   Usage example (Members page):
     initCardFilter({
       buttonSelector: '.filter-btn',
       cardSelector:   '#membersGrid .member-card',
       cardAttribute:  'domain' // matches data-domain on each card
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

      // Show only the cards whose data attribute matches,
      // or show everything if "all" was selected
      cards.forEach(function (card) {
        const cardValue = card.dataset[cardAttribute];
        const matches    = selected === 'all' || cardValue === selected;
        card.style.display = matches ? '' : 'none';
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


/* ── 4. RUN ON PAGE LOAD ──────────────────────────────────────
   Hamburger menu runs everywhere automatically.
   Card filters and the season filter only do something if
   the relevant elements exist on the current page — see the
   guard clauses above — so this same script.js file is safe
   to include on every page without errors.
   ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initHamburgerMenu();

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
