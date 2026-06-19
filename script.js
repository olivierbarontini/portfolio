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
