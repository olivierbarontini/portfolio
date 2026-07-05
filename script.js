document.documentElement.classList.add("js-ready");

// ===================== MODE SOMBRE =====================
// Respecte la préférence système au premier chargement, puis mémorise
// le choix de la personne dans localStorage pour ses visites suivantes.

(function () {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  const STORAGE_KEY = "theme";

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      toggle.setAttribute("aria-pressed", "true");
      toggle.setAttribute("aria-label", "Activer le mode clair");
    } else {
      document.documentElement.removeAttribute("data-theme");
      toggle.setAttribute("aria-pressed", "false");
      toggle.setAttribute("aria-label", "Activer le mode sombre");
    }
  }

  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    // localStorage indisponible (navigation privée stricte) : on ignore, pas de mémorisation
  }

  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  applyTheme(saved || (systemPrefersDark ? "dark" : "light"));

  toggle.addEventListener("click", function () {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
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
  const clockEl = document.getElementById("heure-locale");
  const dateEl = document.getElementById("date-locale");
  if (!clockEl || !dateEl) return;

  const mois = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    clockEl.textContent = h + "H" + m + " [France]";
    dateEl.textContent =
      now.getDate() + " " + mois[now.getMonth()] + " " + now.getFullYear();
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
  const burgerBtn = document.getElementById("burger-btn");
  const navOverlay = document.getElementById("nav-overlay");
  const closeBtn = document.getElementById("nav-close-btn");

  if (!burgerBtn || !navOverlay || !closeBtn) return;

  const focusableSelector = "a[href], button:not([disabled])";
  let lastFocused = null;

  function getFocusable() {
    return Array.from(navOverlay.querySelectorAll(focusableSelector));
  }

  function openMenu() {
    lastFocused = document.activeElement;
    navOverlay.classList.add("is-open");
    burgerBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
    document.addEventListener("keydown", handleKeydown);
  }

  function closeMenu() {
    navOverlay.classList.remove("is-open");
    burgerBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleKeydown);
    if (lastFocused) {
      lastFocused.focus();
    } else {
      burgerBtn.focus();
    }
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === "Tab") {
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

  burgerBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);

  // Fermer le menu si on clique un lien (anchor de navigation)
  navOverlay.querySelectorAll("a[href]").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
})();

// ===================== LOGO — RÉVÉLATION SEP + SCROLL HINT =====================
(function () {
  var svg = document.querySelector(".hero-logo svg");
  if (!svg) return;
  if (window.matchMedia("(max-width: 899px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setTimeout(function () {
    svg.classList.add("logo-sep-visible");
  }, 5000);
})();

// ===================== EFFET CORRESPONDANCE NAV PROJETS ↔ PROJ-NUM =====================
// Au hover sur "projets" dans la nav, les numéros de projets s'illuminent en accent.
// Réciproque : au hover sur un proj-num, le lien "projets" s'illumine aussi.

(function () {
  var navProjets = document.getElementById("nav-projets");
  var projNums = document.getElementById("nav-projets-nums");
  var hero = document.querySelector(".hero");
  if (!navProjets || !projNums || !hero) return;

  // Nav → proj-num
  navProjets.addEventListener("mouseenter", function () {
    hero.classList.add("projets-active");
  });
  navProjets.addEventListener("mouseleave", function () {
    hero.classList.remove("projets-active");
  });
  navProjets.addEventListener("focusin", function () {
    hero.classList.add("projets-active");
  });
  navProjets.addEventListener("focusout", function () {
    hero.classList.remove("projets-active");
  });

  // Proj-num → nav (réciproque)
  projNums.addEventListener("mouseenter", function () {
    hero.classList.add("nums-active");
  });
  projNums.addEventListener("mouseleave", function () {
    hero.classList.remove("nums-active");
  });
  projNums.addEventListener("focusin", function () {
    hero.classList.add("nums-active");
  });
  projNums.addEventListener("focusout", function () {
    hero.classList.remove("nums-active");
  });
})();

// ===================== MOTS-CLÉS SURLIGNÉS — RÉVÉLATION AU SCROLL + AU CLIC NAV =====================
// Idée du 20/06 : chaque <mark> des blocs À propos et Mon Parcours reste transparent par
// défaut, puis se surligne brièvement (comme un curseur qui passe) avant de s'effacer pour
// laisser place au mot suivant. Chaque section anime ses propres <mark> indépendamment.
//
// Deux déclencheurs distincts, une seule fonction d'animation (animateMarks) :
//  1. Clic sur un lien de nav vers #a-propos ou #parcours → déclenchement explicite et
//     garanti, indépendant du scroll (on sait exactement quelle section est visée).
//  2. Scroll → un IntersectionObserver détecte le passage par une bande centrale de l'écran
//     (rootMargin réduit la zone d'observation à ~30% au milieu du viewport), plutôt que la
//     simple entrée dans le viewport entier. Ça force un vrai cycle sortie/entrée à chaque
//     passage, dans les deux sens de scroll — corrige le cas où une section reste
//     partiellement visible en haut ou en bas de l'écran sans jamais "sortir" complètement,
//     ce qui empêchait un nouveau déclenchement avec l'ancienne détection plein viewport.
//
// Repli accessible : si JS absent OU prefers-reduced-motion actif, le mark reste surligné
// en permanence (style statique défini dans style.css), jamais d'animation forcée.

(function () {
  var groups = ["a-propos", "parcours"]
    .map(function (id) {
      var section = document.getElementById(id);
      if (!section) return null;
      var marks = section.querySelectorAll("mark");
      if (!marks.length) return null;
      return { id: id, section: section, marks: marks };
    })
    .filter(Boolean);

  if (!groups.length) return;

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduceMotion) return; // on garde le surlignage statique, pas d'animation

  if (!("IntersectionObserver" in window)) return; // idem : pas de support, pas d'animation

  document.documentElement.classList.add("has-mark-animation");

  var STAGGER_SECONDS = 0.7; // décalage entre chaque mot pour un balayage séquentiel

  function animateMarks(marks) {
    marks.forEach(function (mark, index) {
      // Retirer puis remettre la classe pour forcer le redémarrage de l'animation
      mark.classList.remove("mark-pulse");
      // Force reflow pour réinitialiser l'animation
      void mark.offsetWidth;
      mark.style.setProperty("--pulse-delay", index * STAGGER_SECONDS + "s");
      mark.classList.add("mark-pulse");
    });
  }

  function triggerById(id) {
    var group = groups.filter(function (g) {
      return g.id === id;
    })[0];
    if (group) animateMarks(group.marks);
  }

  // ---- Déclencheur 1 : clic sur un lien de nav vers #a-propos ou #parcours ----
  document
    .querySelectorAll('a[href="#a-propos"], a[href="#parcours"]')
    .forEach(function (link) {
      link.addEventListener("click", function () {
        triggerById(link.getAttribute("href").slice(1));
      });
    });

  // ---- Déclencheur 2 : passage par la bande centrale de l'écran au scroll ----
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var group = groups.filter(function (g) {
          return g.section === entry.target;
        })[0];
        if (group) animateMarks(group.marks);
        // Ne pas unobserve : on veut que ça redémarre à chaque passage
      });
    },
    { threshold: 0, rootMargin: "-35% 0px -35% 0px" },
  );

  groups.forEach(function (group) {
    observer.observe(group.section);
  });
})();

// ===================== FORMULAIRE DE CONTACT (Web3Forms) =====================
// Le formulaire fonctionne déjà sans JS (POST natif vers Web3Forms, voir index.html).
// Ici on intercepte l'envoi pour rester sur la page et afficher le retour dans
// #form-status (role="status" : annoncé par les lecteurs d'écran sans déplacer le focus).

(function () {
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  if (!form || !status) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    status.textContent = "Envoi en cours…";

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.success) {
          status.textContent =
            "Message envoyé, merci ! Je vous répondrai rapidement.";
          form.reset();
        } else {
          status.textContent =
            "Une erreur est survenue. Vous pouvez réessayer ou m'écrire directement par email.";
        }
      })
      .catch(function () {
        status.textContent =
          "Une erreur est survenue. Vous pouvez réessayer ou m'écrire directement par email.";
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();

// ===================== PROJETS — TOGGLE "[ EN SAVOIR + ]" =====================
// Un bouton par projet (aligné avec le numéro) ouvre/ferme un panneau de détails
// affiché plus bas, sous la carte. Même logique que le bouton burger : aria-expanded
// + attribut hidden natif, pas de librairie, pas d'animation forcée.

(function () {
  var toggles = document.querySelectorAll(".projet-toggle");
  if (!toggles.length) return;

  toggles.forEach(function (toggle) {
    var panel = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!panel) return;

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
      toggle.textContent = isOpen ? "[ en savoir + ]" : "[ replier − ]";
    });
  });
})();

// ===================== COMPÉTENCES — ANIMATION STAGGER =====================
(function () {
  var items = document.querySelectorAll(".comp-item");
  if (!items.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var idx = parseInt(el.getAttribute("data-idx"), 10);
          setTimeout(function () {
            el.classList.add("is-visible");
          }, idx * 90);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.2 },
  );

  items.forEach(function (el, i) {
    el.setAttribute("data-idx", i);
    observer.observe(el);
  });
})();

// ===================== RETOUR EN HAUT DE PAGE =====================
// Le bouton apparaît une fois le hero entièrement quitté (pas avant, pour éviter la
// redondance avec le hero lui-même). Le scroll fluide est géré par le CSS global
// (html { scroll-behavior: smooth }), qui respecte déjà prefers-reduced-motion —
// pas besoin de dupliquer cette logique ici.

(function () {
  var btn = document.getElementById("back-to-top");
  var hero = document.getElementById("accueil");
  if (!btn || !hero) return;

  btn.addEventListener("click", function () {
    hero.scrollIntoView({ block: "start" });
  });

  if ("IntersectionObserver" in window) {
    var heroObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          btn.classList.toggle("is-visible", !entry.isIntersecting);
        });
      },
      { threshold: 0 },
    );
    heroObserver.observe(hero);
  } else {
    // Pas d'IntersectionObserver disponible : on affiche le bouton en permanence
    // plutôt que de le priver de cette fonctionnalité.
    btn.classList.add("is-visible");
  }
})();
