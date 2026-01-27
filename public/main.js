/* Landing interactions (index.html) */
(function () {
  const i18n = window.i18n;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Helpers
  const getQS = () => new URLSearchParams(location.search);

  function setHashPreservingQuery(hash) {
    const u = new URL(location.href);
    u.hash = hash;
    history.replaceState(null, "", u.pathname + u.search + u.hash);
  }

  let cookbookBallsCleanup = null;

  // Decorative "color balls" background (book-inspired)
  function setupCookbookBalls() {
    // If called multiple times (langchange, hot reload, etc.), cleanup previous loop/listeners.
    if (typeof cookbookBallsCleanup === "function") {
      cookbookBallsCleanup();
      cookbookBallsCleanup = null;
    }

    const root =
      document.getElementById("bgBalls") ||
      (() => {
        const bg = document.querySelector(".bg");
        const div = document.createElement("div");
        div.className = "bg__balls bg__balls--flow";
        div.id = "bgBalls";
        div.setAttribute("aria-hidden", "true");
        if (bg && bg.parentNode) {
          bg.parentNode.insertBefore(div, bg.nextSibling);
        } else {
          document.body.appendChild(div);
        }
        return div;
      })();

    if (!root) return;

    const isLowPower = () =>
      !!(
        window.matchMedia &&
        window.matchMedia("(max-width: 768px), (pointer: coarse)").matches
      );

    const palette = [
      ["rgba(255,122,73,0.95)", "rgba(202,161,92,0.75)"],
      ["rgba(111,125,75,0.85)", "rgba(202,161,92,0.55)"],
      ["rgba(162,78,122,0.78)", "rgba(255,122,73,0.55)"],
      ["rgba(202,161,92,0.80)", "rgba(245,241,232,0.20)"],
    ];

    const balls = [];

    function getDocHeight() {
      const b = document.body;
      const e = document.documentElement;
      return Math.max(
        b?.scrollHeight || 0,
        b?.offsetHeight || 0,
        e?.scrollHeight || 0,
        e?.offsetHeight || 0,
        e?.clientHeight || 0
      );
    }

    function rebuildBalls() {
      const lowPower = isLowPower();
      root.classList.toggle("is-lite", lowPower);

      const docH = getDocHeight();
      root.style.height = `${docH}px`;
      root.textContent = "";
      balls.length = 0;

      const screens = Math.max(
        1,
        Math.ceil(docH / Math.max(1, window.innerHeight))
      );
      const perScreen = lowPower ? 3 : window.innerWidth < 520 ? 5 : 7;

      const minCount = lowPower ? 10 : 18;
      const maxCount = lowPower ? 32 : 64;
      const count = Math.min(maxCount, Math.max(minCount, screens * perScreen));

      for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.className = "ball";
        const [c1, c2] = palette[i % palette.length];

        const side = Math.random() < 0.5 ? "left" : "right";
        const x =
          side === "left" ? -5 + Math.random() * 22 : 105 - Math.random() * 22;

        const t = (i + Math.random()) / count;
        const y = 90 + t * Math.max(0, docH - 180);

        const s = (lowPower ? 80 : 90) + Math.random() * (lowPower ? 180 : 240);

        el.style.setProperty("--x", `${x.toFixed(2)}vw`);
        el.style.setProperty("--y", `${y.toFixed(0)}px`);
        el.style.setProperty("--s", `${s.toFixed(0)}px`);
        el.style.setProperty("--c1", c1);
        el.style.setProperty("--c2", c2);
        el.style.setProperty(
          "--a",
          (0.11 + Math.random() * (lowPower ? 0.12 : 0.16)).toFixed(2)
        );

        // Slower + smaller wandering on low-power devices
        el.style.setProperty(
          "--d",
          `${(lowPower
            ? 14 + Math.random() * 16
            : 8 + Math.random() * 10
          ).toFixed(2)}s`
        );
        el.style.setProperty("--delay", `${(-Math.random() * 10).toFixed(2)}s`);
        el.style.setProperty(
          "--mx",
          `${(lowPower
            ? -26 + Math.random() * 52
            : -44 + Math.random() * 88
          ).toFixed(0)}px`
        );
        el.style.setProperty(
          "--my",
          `${(lowPower
            ? -52 + Math.random() * 104
            : -84 + Math.random() * 168
          ).toFixed(0)}px`
        );

        root.appendChild(el);
        balls.push(el);
      }
    }

    rebuildBalls();

    let resizeT = 0;
    const onResize = () => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(rebuildBalls, 160);
    };
    window.addEventListener("resize", onResize, { passive: true });

    const onLoad = () => window.setTimeout(rebuildBalls, 50);
    window.addEventListener("load", onLoad, { once: true });

    const enableParallax = !prefersReducedMotion && !isLowPower();
    if (!enableParallax) {
      cookbookBallsCleanup = () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("load", onLoad);
        window.clearTimeout(resizeT);
      };
      return;
    }

    // Tiny parallax that makes the balls feel "alive" (desktop only)
    let tx = 0,
      ty = 0,
      px = 0,
      py = 0;
    const onPointerMove = (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let rafId = 0;
    const tick = () => {
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      for (let i = 0; i < balls.length; i++) {
        const depth = ((i % 6) + 1) / 6;
        balls[i].style.setProperty("--px", `${(px * depth * 22).toFixed(2)}px`);
        balls[i].style.setProperty("--py", `${(py * depth * 16).toFixed(2)}px`);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    cookbookBallsCleanup = () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("pointermove", onPointerMove);
      window.clearTimeout(resizeT);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }
  function updateProgressLabel() {
    const el = document.getElementById("progressLabel");
    if (!el || !i18n) return;
    const pct = 72;
    el.textContent = i18n.t("index.print.progress", { pct });
  }

  function updatePageCount() {
    const qs = getQS();
    const DEFAULT_PAGES = 66;
    const pagesFromQS = Number(qs.get("pages"));
    const pages =
      Number.isFinite(pagesFromQS) && pagesFromQS > 0
        ? pagesFromQS
        : DEFAULT_PAGES;
    const pageCount = document.getElementById("pageCount");
    if (pageCount) pageCount.textContent = String(pages);
  }

  function updateReaderLinks() {
    const qs = getQS();
    const readerLinks = [
      "readerLinkTop",
      "readerLinkHero",
      "readerLinkGallery",
      "readerLinkCta",
      "readerLinkMobile",
    ];
    for (const id of readerLinks) {
      const a = document.getElementById(id);
      if (!a) continue;
      const url = new URL(
        a.getAttribute("href") || "reader.html",
        location.href
      );
      // Keep all query params (to, pages, lang, etc)
      for (const [k, v] of qs.entries()) url.searchParams.set(k, v);
      a.setAttribute("href", url.pathname + url.search);
    }
  }

  function applyPersonalization() {
    const qs = getQS();
    const to = qs.get("to")?.trim();

    const heroTo = document.getElementById("heroTo");
    if (heroTo && i18n)
      heroTo.textContent = i18n.t("dyn.heroTo", { name: to || "" });

    const giftText = document.getElementById("giftText");
    if (giftText && i18n)
      giftText.textContent = i18n.t("dyn.giftText", { name: to || "" });
  }

  // Apply translations ASAP (defer scripts run after DOM is parsed)
  try {
    i18n?.apply();
  } catch {
    // ignore
  }

  updatePageCount();
  updateReaderLinks();
  updateProgressLabel();
  applyPersonalization();

  setupCookbookBalls();

  // Re-apply dynamic strings on language change
  window.addEventListener("langchange", () => {
    // i18n already updated the DOM strings; we update dynamic ones + derived
    updateReaderLinks();
    updateProgressLabel();
    applyPersonalization();

    setupCookbookBalls();
  });

  // Remove loading veil
  requestAnimationFrame(() => {
    document.body.classList.remove("is-loading");
  });

  // Mobile menu
  const burger = document.getElementById("burger");
  const navmobile = document.getElementById("navmobile");
  const closeMobile = document.getElementById("closeMobile");
  function openMobile(open) {
    if (!navmobile) return;
    navmobile.classList.toggle("is-open", open);
    navmobile.setAttribute("aria-hidden", open ? "false" : "true");
  }
  burger?.addEventListener("click", () =>
    openMobile(!navmobile?.classList.contains("is-open"))
  );
  closeMobile?.addEventListener("click", () => openMobile(false));
  navmobile
    ?.querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", () => openMobile(false)));

  // Smooth anchor scroll (preserve query params)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setHashPreservingQuery(href);
    });
  });

  // Scroll progress bar
  const navprogress = document.getElementById("navprogress");
  function updateProgress() {
    if (!navprogress) return;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const p = Math.max(0, Math.min(1, window.scrollY / max));
    navprogress.style.transform = `scaleX(${p})`;
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  // Hero spotlight follow
  const hero = document.querySelector(".hero");
  if (hero && !prefersReducedMotion) {
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      hero.style.setProperty("--mx", `${x}%`);
      hero.style.setProperty("--my", `${y}%`);
    });
  }

  // QR modal
  const modal = document.getElementById("qrModal");
  const qrBox = document.getElementById("qrBox");
  let qrRenderedKey = "";

  function renderQr(targetUrl) {
    if (!qrBox) return;

    const opts = {
      width: 260,
      margin: 2,
      color: { dark: "#111318", light: "#f5f1e8" },
    };
    qrBox.innerHTML = "";

    if (!window.QRCode || typeof window.QRCode.toCanvas !== "function") {
      qrBox.textContent =
        i18n?.t("qr.error") || "Couldn't generate the QR code.";
      return;
    }

    const canvas = document.createElement("canvas");
    const done = (err) => {
      if (!err) {
        canvas.style.borderRadius = "16px";
        canvas.style.boxShadow = "0 18px 55px rgba(0,0,0,.35)";
        qrBox.appendChild(canvas);
        qrRenderedKey = targetUrl;
      } else {
        qrBox.textContent =
          i18n?.t("qr.error") || "Couldn't generate the QR code.";
      }
    };

    try {
      // Most browser builds: toCanvas(canvas, text, options, cb)
      if (window.QRCode.toCanvas.length >= 4) {
        window.QRCode.toCanvas(canvas, targetUrl, opts, done);
      } else {
        // Some builds: toCanvas(text, options, cb)
        window.QRCode.toCanvas(targetUrl, opts, (err, maybeCanvas) => {
          if (!err && maybeCanvas instanceof HTMLCanvasElement) {
            maybeCanvas.style.borderRadius = "16px";
            maybeCanvas.style.boxShadow = "0 18px 55px rgba(0,0,0,.35)";
            qrBox.appendChild(maybeCanvas);
            qrRenderedKey = targetUrl;
          } else {
            // Fallback to our canvas (if library wrote into it)
            if (!err && canvas.width) {
              qrBox.appendChild(canvas);
              qrRenderedKey = targetUrl;
            } else done(err);
          }
        });
      }
    } catch (e) {
      done(e);
    }
  }

  function openQr() {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const url = location.href;
    if (qrBox && url !== qrRenderedKey) renderQr(url);
  }

  function closeQr() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.getElementById("btnQr")?.addEventListener("click", openQr);
  document.getElementById("btnQr2")?.addEventListener("click", openQr);
  document.getElementById("btnQr3")?.addEventListener("click", openQr);
  modal?.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.hasAttribute("data-close")) closeQr();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("is-open")) closeQr();
  });

  // Copy link
  document
    .getElementById("btnCopyLink")
    ?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        toast(i18n?.t("toast.linkCopied") || "Link copied ✨");
      } catch {
        toast(i18n?.t("toast.copyFailed") || "Copy failed (browser).");
      }
    });

  // Swiper gallery
  if (window.Swiper) {
    // eslint-disable-next-line no-new
    new Swiper("#swiper", {
      loop: true,
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 1,
      spaceBetween: 10,
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      keyboard: { enabled: true },
    });
  }

  // Simple 3D tilt on mockup
  const tilt = document.getElementById("tilt");
  if (tilt && !prefersReducedMotion) {
    const strength = 10;
    tilt.addEventListener("mousemove", (e) => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `perspective(1200px) rotateY(${
        -12 + x * strength
      }deg) rotateX(${6 - y * strength}deg)`;
    });
    tilt.addEventListener("mouseleave", () => {
      tilt.style.transform =
        "perspective(1200px) rotateY(-12deg) rotateX(6deg)";
    });
  }

  // GSAP reveal animations
  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    gsap.fromTo(
      ".kicker, .hero__title, .hero__lead, .hero__actions, .stats, .mock",
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.06 }
    );

    gsap.utils
      .toArray(".panel, .timeline__item, .gallery__card, .miniCard, .cta__card")
      .forEach((el) => {
        gsap.fromTo(
          el,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 86%" },
          }
        );
      });
  }

  // Confetti FX
  const fx = document.getElementById("fx");
  const ctx = fx?.getContext("2d");
  let particles = [];
  let raf = 0;

  function resizeFx() {
    if (!fx) return;
    fx.width = window.innerWidth * devicePixelRatio;
    fx.height = window.innerHeight * devicePixelRatio;
  }
  window.addEventListener("resize", resizeFx);
  resizeFx();

  function burst() {
    if (!fx || !ctx) return;
    const count = 140;
    const originX = fx.width / 2;
    const originY = fx.height * 0.25;
    const colors = ["#ff7a49", "#caa15c", "#f2f4fb", "#6f7d4b"];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 7;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        g: 0.12 + Math.random() * 0.08,
        size: 4 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        life: 120 + Math.random() * 80,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    if (!fx || !ctx) return;
    ctx.clearRect(0, 0, fx.width, fx.height);
    particles = particles.filter((p) => p.life > 0);

    for (const p of particles) {
      p.life -= 1;
      p.vy += p.g;
      p.x += p.vx * devicePixelRatio;
      p.y += p.vy * devicePixelRatio;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 120));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
      ctx.restore();
    }

    if (particles.length) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
    }
  }

  document.getElementById("btnConfetti")?.addEventListener("click", () => {
    burst();
    toast(i18n?.t("toast.bday") || "✨ Happy birthday!");
  });

  // Optional: tiny initial burst when personalized
  if (!prefersReducedMotion) {
    const qs = getQS();
    if (
      qs.get("party") === "1" ||
      (qs.get("to") && !sessionStorage.getItem("partyBurstDone"))
    ) {
      sessionStorage.setItem("partyBurstDone", "1");
      setTimeout(() => burst(), 650);
    }
  }

  // tiny toast

  let toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => {
      toastEl.classList.remove("is-show");
    }, 1400);
  }
})();
