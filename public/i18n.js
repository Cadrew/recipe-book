/* i18n — tiny static-site translation helper (en default, fr + da supported) */
(() => {
  const SUPPORTED = ["en", "fr", "da"];

  const STRINGS = {
    en: {
      // Meta
      "meta.index.title": "Mes recettes personnelles — Happy birthday",
      "meta.index.description": "A little gift page (landing/portfolio style) + a flipbook reader for the recipe book PDF.",
      "meta.reader.title": "Reader — Mes recettes personnelles",
      "meta.reader.description": "Flipbook reader for the recipe book PDF.",

      // Common
      "common.qr": "QR",
      "common.pdf": "PDF",
      "common.download": "Download",
      "common.open": "Open",
      "common.close": "Close",
      "common.back": "Back",
      "common.language": "Language",

      // Nav / brand
      "index.brandTitle": "Mes recettes personnelles",
      "index.brandSub": "A family recipe book",

      "index.nav.gift": "The gift",
      "index.nav.inside": "Inside",
      "index.nav.preview": "Preview",
      "index.nav.read": "Read",
      "index.nav.qrTitle": "QR code for this page",

      "index.nav.flip": "Flip through",
      "index.nav.burger": "Open menu",
      "index.nav.close": "Close",

      // QR modal
      "qr.title": "QR code",
      "qr.subtitle": "Handy for a gift card.",
      "qr.tip": "Tip: add <code>?to=FirstName</code> in the URL to personalize the message.",
      "qr.error": "Couldn't generate the QR code.",

      // Hero
      "index.hero.kicker": "A homemade gift — a bit early",
      "index.hero.toDefault": "Happy birthday",
      "index.hero.lead":
        "I put together a little book with <strong>my favorite recipes</strong> — the ones I cook all the time, from comfort food to “wow” desserts.",
      "index.hero.note":
        "The printed version is coming a bit later (the printer betrayed me 😅), but you can already flip through it here.",
      "index.hero.openBook": "Open the book",
      "index.hero.previewBtn": "Preview",
      "index.hero.magic": "A little magic",

      "index.stats.pages": "pages",
      "index.stats.format": "format",
      "index.stats.homemade": "homemade",
      "index.mock.badge": "digital edition",
      "index.scroll": "Scroll",

      // About
      "index.about.eyebrow": "The gift",
      "index.about.title": "A recipe book — like a tiny heirloom",
      "index.about.text":
        "The idea is simple: a collection of recipes I truly love, with clear steps, tips, and that “we cook and laugh” vibe.",
      "index.about.b1": "Read in <strong>book</strong> mode (page turn, single/double page)",
      "index.about.b2": "Download the PDF to print or keep",
      "index.about.b3": "Printed version on the way: <strong>coming soon</strong> 🎁",
      "index.about.noteTitle": "A little “printer” teaser",
      "index.about.noteText": "The PDF is already here. Paper is coming soon (promise). 😄",

      // Quote
      "index.quote.title": "Happy birthday!",
      "index.quote.sig": "— signed: me 😇",
      "index.actions.copy": "Copy link",
      "index.actions.qr": "QR code",

      // Chapters
      "index.chapters.eyebrow": "Inside",
      "index.chapters.title": "A clear structure — like a real book",
      "index.chapters.text": "A few signposts to get a feel before diving in.",
      "index.ch1.title": "Starters & small pleasures",
      "index.ch1.text": "To start a meal… or just snack “for tasting”.",
      "index.ch2.title": "Comfort food mains",
      "index.ch2.text": "The kind of recipes that fix a day (or a week).",
      "index.ch3.title": "Desserts & wow factor",
      "index.ch3.text": "Simple — with that tiny twist that makes it feel serious.",
      "index.ch4.title": "Notes & tips",
      "index.ch4.text": "Little details that change everything: timing, texture, heat…",

      // Gallery
      "index.gallery.eyebrow": "Preview",
      "index.gallery.title": "A few pages to get a feel",
      "index.gallery.text": "Click to enlarge, or jump straight into reading mode.",
      "index.gallery.cardTitle": "Want to read it “like a real book”?",
      "index.gallery.cardText": "The reader has page-turn animation, single/double page, zoom and fullscreen.",
      "index.gallery.flip": "Flip through",

      // CTA
      "index.cta.eyebrow": "Let’s go",
      "index.cta.title": "Ready to turn the pages?",
      "index.cta.text":
        "Flip through the digital version now. And when the printed version arrives… you get the “real book” experience as a bonus.",
      "index.cta.openReader": "Open reader",
      "index.print.badge": "printed edition",
      "index.print.title": "Coming soon",
      "index.print.text":
        "Paper takes a bit longer, but it’s on the way. Meanwhile: the digital version is ready and very pleasant to read.",
      "index.print.progress": "Progress (very scientific): {pct}%",
      "index.footer.text": "Made with ❤️, butter, and a slightly unhealthy obsession for details.",
      "index.footer.toTop": "Back to top",

      // Dynamic templates
      "dyn.heroTo": ({ name }) => `Happy birthday${name ? " " + name : ""}`,
      "dyn.giftText": ({ name }) =>
        `I hope this book makes you want to cook tasty, simple, slightly dangerous things. And most of all: that we make them together.${name ? " Happy birthday " + name + " 💛" : ""}`,

      // Reader
      "reader.back": "Back",
      "reader.subtitle": "Reader",
      "reader.open": "Open",
      "reader.nav": "Navigation",
      "reader.prevTitle": "Previous page (←)",
      "reader.nextTitle": "Next page (→)",
      "reader.goto": "Go to page",
      "reader.toggleTitle": "Switch single / two-page",
      "reader.toggleLabel.two": "Two-page",
      "reader.toggleLabel.single": "Single page",
      "reader.zoomOutTitle": "Zoom out",
      "reader.zoomInTitle": "Zoom in",
      "reader.fullscreenTitle": "Fullscreen",
      "reader.hint":
        "Tips: ← → • click a corner • double-click to zoom.",
      "reader.info": "Info",
      "reader.info.pages": "Pages",
      "reader.info.mode": "Mode",
      "reader.mode.single": "Single page",
      "reader.mode.two": "Two-page",
      "reader.loading.title": "Preparing the book…",
      "reader.loading.sub": "Loading PDF",
      "reader.loading.done": "Ready",
      "reader.error.libs": "Failed to load reader dependencies.",
      "reader.error.pdf": "Failed to load the PDF.",
      "reader.pageLabel": ({ cur, total }) => `Page ${cur} / ${total}`,
      // Toasts
      "toast.linkCopied": "Link copied ✨",
      "toast.copyFailed": "Copy failed (browser).",
      "toast.bday": "✨ Happy birthday!",

    },

    fr: {
      "meta.index.title": "Mes recettes personnelles — Joyeux anniversaire",
      "meta.index.description":
        "Une page cadeau (style landing/portfolio) + un lecteur pour feuilleter le livre de recettes (PDF).",
      "meta.reader.title": "Lecture — Mes recettes personnelles",
      "meta.reader.description": "Lecteur flipbook pour le PDF du livre de recettes.",

      "common.qr": "QR",
      "common.pdf": "PDF",
      "common.download": "Télécharger",
      "common.open": "Ouvrir",
      "common.close": "Fermer",
      "common.back": "Retour",
      "common.language": "Langue",

      "index.brandTitle": "Mes recettes personnelles",
      "index.brandSub": "A family recipe book",

      "index.nav.gift": "Le cadeau",
      "index.nav.inside": "À l’intérieur",
      "index.nav.preview": "Aperçu",
      "index.nav.read": "Lire",
      "index.nav.qrTitle": "QR code de cette page",

      "index.nav.flip": "Feuilleter",
      "index.nav.burger": "Ouvrir le menu",
      "index.nav.close": "Fermer",

      "qr.title": "QR code",
      "qr.subtitle": "Pratique pour une carte cadeau.",
      "qr.tip": "Astuce : ajoute <code>?to=Prénom</code> dans l’URL pour personnaliser le message.",
      "qr.error": "Impossible de générer le QR code.",

      "index.hero.kicker": "Un cadeau maison — en avance",
      "index.hero.toDefault": "Joyeux anniversaire",
      "index.hero.lead":
        "J’ai écrit un petit livre avec <strong>mes recettes préférées</strong> — celles que je refais tout le temps, du comfort food aux desserts “wow”.",
      "index.hero.note":
        "La version imprimée arrive un peu plus tard (l’imprimeur m’a trahi 😅), mais tu peux déjà le feuilleter ici.",
      "index.hero.openBook": "Ouvrir le livre",
      "index.hero.previewBtn": "Aperçu",
      "index.hero.magic": "Un peu de magie",

      "index.stats.pages": "pages",
      "index.stats.format": "format",
      "index.stats.homemade": "fait maison",
      "index.mock.badge": "édition digitale",
      "index.scroll": "Scroll",

      "index.about.eyebrow": "Le cadeau",
      "index.about.title": "Un livre de recettes, comme un petit héritage",
      "index.about.text":
        "L’idée est simple : un recueil de recettes que j’aime vraiment, avec des explications claires, des astuces, et cette vibe “on cuisine et on rigole”.",
      "index.about.b1": "Lecture en mode <strong>livre</strong> (page turn, double/single page)",
      "index.about.b2": "Téléchargement du PDF pour imprimer ou garder",
      "index.about.b3": "Version imprimée en route : <strong>arrive après</strong> 🎁",
      "index.about.noteTitle": "Teasing “imprimeur”",
      "index.about.noteText": "Le PDF est déjà là. Le papier arrive bientôt (promis). 😄",

      "index.quote.title": "Joyeux anniversaire !",
      "index.quote.sig": "— signé : moi 😇",
      "index.actions.copy": "Copier le lien",
      "index.actions.qr": "QR code",

      "index.chapters.eyebrow": "À l’intérieur",
      "index.chapters.title": "Une structure claire, comme un vrai livre",
      "index.chapters.text": "Quelques repères pour “feel” le contenu avant de plonger.",
      "index.ch1.title": "Entrées & petits plaisirs",
      "index.ch1.text": "De quoi lancer un repas ou juste grignoter “pour goûter”.",
      "index.ch2.title": "Plats “doudou”",
      "index.ch2.text": "Le genre de recettes qui réparent une journée (ou une semaine).",
      "index.ch3.title": "Desserts & “wow factor”",
      "index.ch3.text": "Simple, mais avec ce petit twist qui fait dire “ok, c’est sérieux”.",
      "index.ch4.title": "Notes & astuces",
      "index.ch4.text": "Des détails qui changent tout : cuisson, texture, timing…",

      "index.gallery.eyebrow": "Aperçu",
      "index.gallery.title": "Quelques pages pour se faire une idée",
      "index.gallery.text": "Clique pour agrandir, ou passe direct en mode lecture.",
      "index.gallery.cardTitle": "Envie de le lire “comme un vrai livre” ?",
      "index.gallery.cardText": "Le lecteur a une animation de pages, un mode 1 page / double page, zoom et plein écran.",
      "index.gallery.flip": "Feuilleter",

      "index.cta.eyebrow": "Let’s go",
      "index.cta.title": "Prête à tourner les pages ?",
      "index.cta.text":
        "Feuillette la version digitale maintenant. Et quand la version imprimée arrive… c’est l’expérience “livre” en bonus.",
      "index.cta.openReader": "Ouvrir le lecteur",
      "index.print.badge": "édition imprimée",
      "index.print.title": "Bientôt livrée",
      "index.print.text":
        "Le papier met un peu plus de temps, mais il arrive. En attendant : la version digitale est déjà prête et super agréable à lire.",
      "index.print.progress": "Progression (très scientifique) : {pct}%",
      "index.footer.text": "Fait avec ❤️, du beurre, et un peu trop d’obsession pour les détails.",
      "index.footer.toTop": "Retour en haut",

      "dyn.heroTo": ({ name }) => `Joyeux anniversaire${name ? " " + name : ""}`,
      "dyn.giftText": ({ name }) =>
        `J’espère que ce livre te donnera envie de cuisiner des trucs bons, simples, et un peu dangereux. Et surtout : qu’on en fasse ensemble.${name ? " Joyeux anniversaire " + name + " 💛" : ""}`,

      "reader.back": "Retour",
      "reader.subtitle": "Lecteur",
      "reader.open": "Ouvrir",
      "reader.nav": "Navigation",
      "reader.prevTitle": "Page précédente (←)",
      "reader.nextTitle": "Page suivante (→)",
      "reader.goto": "Aller à la page",
      "reader.toggleTitle": "Basculer 1 page / double page",
      "reader.toggleLabel.two": "Double page",
      "reader.toggleLabel.single": "1 page",
      "reader.zoomOutTitle": "Zoom -",
      "reader.zoomInTitle": "Zoom +",
      "reader.fullscreenTitle": "Plein écran",
      "reader.hint":
        "Astuces : ← → • clique sur un coin • double-clic pour zoom.",
      "reader.info": "Info",
      "reader.info.pages": "Pages",
      "reader.info.mode": "Mode",
      "reader.mode.single": "1 page",
      "reader.mode.two": "Double page",
      "reader.loading.title": "Préparation du livre…",
      "reader.loading.sub": "Chargement du PDF",
      "reader.loading.done": "Prêt",
      "reader.error.libs": "Impossible de charger les dépendances du lecteur.",
      "reader.error.pdf": "Impossible de charger le PDF.",
      "reader.pageLabel": ({ cur, total }) => `Page ${cur} / ${total}`,
      // Toasts
      "toast.linkCopied": "Lien copié ✨",
      "toast.copyFailed": "Copie impossible (navigateur).",
      "toast.bday": "✨ Joyeux anniversaire !",

    },

    da: {
      "meta.index.title": "Mes recettes personnelles — Tillykke med fødselsdagen",
      "meta.index.description":
        "En lille gaveside (landing/portfolio-stil) + en flipbook-læser til opskriftbogens PDF.",
      "meta.reader.title": "Læser — Mes recettes personnelles",
      "meta.reader.description": "Flipbook-læser til opskriftbogens PDF.",

      "common.qr": "QR",
      "common.pdf": "PDF",
      "common.download": "Download",
      "common.open": "Åbn",
      "common.close": "Luk",
      "common.back": "Tilbage",
      "common.language": "Sprog",

      "index.brandTitle": "Mes recettes personnelles",
      "index.brandSub": "A family recipe book",

      "index.nav.gift": "Gaven",
      "index.nav.inside": "Indeni",
      "index.nav.preview": "Forhåndsvisning",
      "index.nav.read": "Læs",
      "index.nav.qrTitle": "QR-kode til denne side",

      "index.nav.flip": "Bladr",
      "index.nav.burger": "Åbn menu",
      "index.nav.close": "Luk",

      "qr.title": "QR-kode",
      "qr.subtitle": "Praktisk til et gavekort.",
      "qr.tip": "Tip: tilføj <code>?to=Fornavn</code> i URL’en for at personliggøre beskeden.",
      "qr.error": "Kunne ikke generere QR-koden.",

      "index.hero.kicker": "En hjemmelavet gave — lidt på forskud",
      "index.hero.toDefault": "Tillykke med fødselsdagen",
      "index.hero.lead":
        "Jeg har lavet en lille bog med <strong>mine yndlingsopskrifter</strong> — dem jeg laver hele tiden, fra comfort food til “wow”-desserter.",
      "index.hero.note":
        "Den trykte version kommer lidt senere (trykkeriet forrådte mig 😅), men du kan allerede bladre i den her.",
      "index.hero.openBook": "Åbn bogen",
      "index.hero.previewBtn": "Forhåndsvisning",
      "index.hero.magic": "Lidt magi",

      "index.stats.pages": "sider",
      "index.stats.format": "format",
      "index.stats.homemade": "hjemmelavet",
      "index.mock.badge": "digital udgave",
      "index.scroll": "Scroll",

      "index.about.eyebrow": "Gaven",
      "index.about.title": "En opskriftbog — som et lille arvestykke",
      "index.about.text":
        "Idéen er enkel: en samling opskrifter jeg virkelig elsker, med klare trin, tips og den der “vi laver mad og griner” vibe.",
      "index.about.b1": "Læs i <strong>bog</strong>-tilstand (sidevending, enkelt/to-sidet)",
      "index.about.b2": "Download PDF’en for at printe eller gemme",
      "index.about.b3": "Trykt version på vej: <strong>kommer snart</strong> 🎁",
      "index.about.noteTitle": "Et lille “trykkeri”-teaser",
      "index.about.noteText": "PDF’en er allerede klar. Papir kommer snart (lover). 😄",

      "index.quote.title": "Tillykke med fødselsdagen!",
      "index.quote.sig": "— underskrevet: mig 😇",
      "index.actions.copy": "Kopiér link",
      "index.actions.qr": "QR-kode",

      "index.chapters.eyebrow": "Indeni",
      "index.chapters.title": "En klar struktur — som en rigtig bog",
      "index.chapters.text": "Et par pejlemærker, før du dykker ned.",
      "index.ch1.title": "Forretter & små fristelser",
      "index.ch1.text": "Til at starte et måltid… eller bare snacke “for at smage”.",
      "index.ch2.title": "Comfort food",
      "index.ch2.text": "Opskrifter der kan redde en dag (eller en uge).",
      "index.ch3.title": "Desserter & wow-effekt",
      "index.ch3.text": "Enkelt — med et lille twist der siger “okay, det her er seriøst”.",
      "index.ch4.title": "Noter & tips",
      "index.ch4.text": "Små detaljer der ændrer alt: timing, tekstur, varme…",

      "index.gallery.eyebrow": "Forhåndsvisning",
      "index.gallery.title": "Et par sider for at få en fornemmelse",
      "index.gallery.text": "Klik for at forstørre, eller hop direkte i læsetilstand.",
      "index.gallery.cardTitle": "Vil du læse den “som en rigtig bog”?",
      "index.gallery.cardText": "Læseren har sidevending, enkelt/to-sidet, zoom og fuld skærm.",
      "index.gallery.flip": "Bladr",

      "index.cta.eyebrow": "Let’s go",
      "index.cta.title": "Klar til at vende siderne?",
      "index.cta.text":
        "Bladr i den digitale version nu. Og når den trykte udgave kommer… får du “rigtig bog”-oplevelsen som bonus.",
      "index.cta.openReader": "Åbn læseren",
      "index.print.badge": "trykt udgave",
      "index.print.title": "Kommer snart",
      "index.print.text":
        "Papir tager lidt længere, men det er på vej. Imens: den digitale version er klar og virkelig behagelig at læse.",
      "index.print.progress": "Fremskridt (meget videnskabeligt): {pct}%",
      "index.footer.text": "Lavet med ❤️, smør og en lidt for stor kærlighed til detaljer.",
      "index.footer.toTop": "Til toppen",

      "dyn.heroTo": ({ name }) => `Tillykke med fødselsdagen${name ? " " + name : ""}`,
      "dyn.giftText": ({ name }) =>
        `Jeg håber, at den her bog får dig til at få lyst til at lave noget lækkert, enkelt og lidt farligt. Og vigtigst: at vi laver det sammen.${name ? " Tillykke med fødselsdagen " + name + " 💛" : ""}`,

      "reader.back": "Tilbage",
      "reader.subtitle": "Læser",
      "reader.open": "Åbn",
      "reader.nav": "Navigation",
      "reader.prevTitle": "Forrige side (←)",
      "reader.nextTitle": "Næste side (→)",
      "reader.goto": "Gå til side",
      "reader.toggleTitle": "Skift enkelt / to-sidet",
      "reader.toggleLabel.two": "To-sidet",
      "reader.toggleLabel.single": "Enkelt side",
      "reader.zoomOutTitle": "Zoom ud",
      "reader.zoomInTitle": "Zoom ind",
      "reader.fullscreenTitle": "Fuld skærm",
      "reader.hint":
        "Tips: ← → • klik på et hjørne • dobbeltklik for zoom.",
      "reader.info": "Info",
      "reader.info.pages": "Sider",
      "reader.info.mode": "Visning",
      "reader.mode.single": "Enkelt side",
      "reader.mode.two": "To-sidet",
      "reader.loading.title": "Gør bogen klar…",
      "reader.loading.sub": "Indlæser PDF",
      "reader.loading.done": "Klar",
      "reader.error.libs": "Kunne ikke indlæse læserens afhængigheder.",
      "reader.error.pdf": "Kunne ikke indlæse PDF\u0027en.",
      "reader.pageLabel": ({ cur, total }) => `Side ${cur} / ${total}`,
      // Toasts
      "toast.linkCopied": "Link kopieret ✨",
      "toast.copyFailed": "Kunne ikke kopiere (browser).",
      "toast.bday": "✨ Tillykke med fødselsdagen!",

    },
  };

  const normalize = (v) => (v ? v.toLowerCase().split("-")[0] : null);

  const getInitialLang = () => {
    const qs = new URLSearchParams(location.search);
    const q = normalize(qs.get("lang"));
    if (q && SUPPORTED.includes(q)) return q;

    const stored = normalize(localStorage.getItem("lang"));
    if (stored && SUPPORTED.includes(stored)) return stored;
    // Default language is English for first visit.

    return "en";
  };

  let lang = getInitialLang();

  const t = (key, params) => {
    let val = STRINGS[lang]?.[key];
    if (val === undefined) val = STRINGS.en?.[key];
    if (val === undefined) return key;

    if (typeof val === "function") {
      val = val(params || {});
    } else if (params) {
      for (const [k, v] of Object.entries(params)) {
        val = val.split(`{${k}}`).join(String(v));
      }
    }
    return val;
  };

  const apply = (root = document) => {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    root.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
    root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });

    const titleKey = document.documentElement.getAttribute("data-i18n-doc-title");
    if (titleKey) document.title = t(titleKey);

    const meta = document.querySelector('meta[name="description"][data-i18n-meta]');
    if (meta) meta.setAttribute("content", t(meta.getAttribute("data-i18n-meta")));

    updateLangUI();
  };

  const updateLangUI = () => {
    document.querySelectorAll("[data-lang-label]").forEach((el) => {
      el.textContent = lang.toUpperCase();
    });
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      const active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-checked", active ? "true" : "false");
    });
  };

  const setLang = (next, { pushState = false } = {}) => {
    const n = normalize(next);
    if (!n || !SUPPORTED.includes(n) || n === lang) return;

    lang = n;
    document.documentElement.lang = lang;

    try {
      localStorage.setItem("lang", lang);
    } catch {
      // ignore
    }

    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    if (pushState) history.pushState(null, "", url.pathname + url.search + url.hash);
    else history.replaceState(null, "", url.pathname + url.search + url.hash);

    apply();
    window.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  };

  const bindMenu = () => {
    const btn = document.getElementById("langBtn");
    const menu = document.getElementById("langMenu");
    if (!btn || !menu) return;

    const close = () => {
      menu.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    };
    const toggle = () => {
      const open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    };

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });

    menu.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const item = target.closest("[data-lang]");
      if (!item) return;
      setLang(item.getAttribute("data-lang"));
      close();
    });

    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    updateLangUI();
  };

  // Init
  document.documentElement.lang = lang;

  window.i18n = { t, apply, setLang, getLang: () => lang, supported: SUPPORTED };

  document.addEventListener("DOMContentLoaded", () => {
    apply();
    bindMenu();
    window.dispatchEvent(new CustomEvent("langready", { detail: { lang } }));
  });
})();
