// ===================== MODE SOMBRE =====================
// Respecte la préférence système au premier chargement, puis mémorise
// le choix de la personne dans localStorage pour ses visites suivantes.

(function () {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const STORAGE_KEY = 'theme';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      toggle.setAttribute('aria-pressed', 'true');
      toggle.textContent = 'mode clair';
    } else {
      document.documentElement.removeAttribute('data-theme');
      toggle.setAttribute('aria-pressed', 'false');
      toggle.textContent = 'mode sombre';
    }
  }

  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    // localStorage indisponible (navigation privée stricte) : on ignore, pas de mémorisation
  }

  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (systemPrefersDark ? 'dark' : 'light'));

  toggle.addEventListener('click', function () {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // pas grave si on ne peut pas mémoriser, le mode s'applique quand même pour la session
    }
  });
})();


// ===================== HORLOGE LIVE =====================
// Format repris des fichiers sources du 18/06 : "HH'H'MM [France]" + date en toutes lettres.
// Mise à jour chaque seconde. N'affecte que le desktop (masqué en CSS sur mobile).

(function () {
  const clockEl = document.getElementById('heure-locale');
  const dateEl = document.getElementById('date-locale');
  if (!clockEl || !dateEl) return;

  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = h + 'H' + m + ' [France]';
    dateEl.textContent = now.getDate() + ' ' + mois[now.getMonth()] + ' ' + now.getFullYear();
  }

  update();
  setInterval(update, 1000);
})();


// ===================== MENU BURGER + FOCUS TRAP =====================
// Choix du 19/06/2026 : JS plutôt que CSS pur, pour permettre un piège à
// focus (focus trap) fiable dans l'overlay mobile, jugé prioritaire sur
// la robustesse "fonctionne sans JS". Voir commentaire dans index.html.
// Le logo, lui, est animé en CSS pur (aucune dépendance JS) : voir style.css.

(function () {
  const burgerBtn = document.getElementById('burger-btn');
  const navOverlay = document.getElementById('nav-overlay');
  const closeBtn = document.getElementById('nav-close-btn');

  if (!burgerBtn || !navOverlay || !closeBtn) return;

  const focusableSelector = 'a[href], button:not([disabled])';
  let lastFocused = null;

  function getFocusable() {
    return Array.from(navOverlay.querySelectorAll(focusableSelector));
  }

  function openMenu() {
    lastFocused = document.activeElement;
    navOverlay.classList.add('is-open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
    document.addEventListener('keydown', handleKeydown);
  }

  function closeMenu() {
    navOverlay.classList.remove('is-open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleKeydown);
    if (lastFocused) {
      lastFocused.focus();
    } else {
      burgerBtn.focus();
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  burgerBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  // Fermer le menu si on clique un lien (anchor de navigation)
  navOverlay.querySelectorAll('a[href]').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
})();


// ===================== MOTS-CLÉS SURLIGNÉS — RÉVÉLATION AU SCROLL =====================
// Idée du 20/06 : chaque <mark> du bloc À propos reste transparent par défaut, puis se
// surligne brièvement (comme un curseur qui passe) au moment où il entre dans le champ de
// vision en scrollant, avant de s'effacer pour laisser place au mot suivant.
// Repli accessible : si JS absent OU prefers-reduced-motion actif, le mark reste surligné
// en permanence (style statique défini dans style.css), jamais d'animation forcée.

(function () {
  var section = document.getElementById('a-propos');
  var marks = section ? section.querySelectorAll('mark') : [];
  if (!section || !marks.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return; // on garde le surlignage statique, pas d'animation

  document.documentElement.classList.add('has-mark-animation');

  if (!('IntersectionObserver' in window)) {
    document.documentElement.classList.remove('has-mark-animation');
    return;
  }

  var STAGGER_SECONDS = 0.7; // décalage entre chaque mot pour un balayage séquentiel

  // On observe la section entière (pas chaque mark séparément) : sur un grand écran où
  // tous les mots sont déjà visibles en même temps, ça évite qu'ils se déclenchent tous
  // ensemble — le décalage (--pulse-delay) recrée l'effet "un mot après l'autre".
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        marks.forEach(function (mark, index) {
          mark.style.setProperty('--pulse-delay', (index * STAGGER_SECONDS) + 's');
          mark.classList.add('mark-pulse');
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(section);
})();


// ===================== RETOUR EN HAUT DE PAGE =====================
// Le bouton apparaît une fois le hero entièrement quitté (pas avant, pour éviter la
// redondance avec le hero lui-même). Le scroll fluide est géré par le CSS global
// (html { scroll-behavior: smooth }), qui respecte déjà prefers-reduced-motion —
// pas besoin de dupliquer cette logique ici.

(function () {
  var btn = document.getElementById('back-to-top');
  var hero = document.getElementById('accueil');
  if (!btn || !hero) return;

  btn.addEventListener('click', function () {
    hero.scrollIntoView({ block: 'start' });
  });

  if ('IntersectionObserver' in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        btn.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    heroObserver.observe(hero);
  } else {
    // Pas d'IntersectionObserver disponible : on affiche le bouton en permanence
    // plutôt que de le priver de cette fonctionnalité.
    btn.classList.add('is-visible');
  }
})();


