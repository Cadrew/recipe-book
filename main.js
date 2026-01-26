/* Landing interactions (index.html) */

(function () {
  const qs = new URLSearchParams(location.search);
  const to = qs.get("to")?.trim();

  // Personalization
  if (to) {
    const heroTo = document.getElementById("heroTo");
    if (heroTo) heroTo.textContent = `Bon anniversaire ${to}`;
    const giftText = document.getElementById("giftText");
    if (giftText) {
      giftText.textContent =
        `J’espère que ce livre te donnera envie de cuisiner des trucs bons, simples, et un peu dangereux. ` +
        `Et surtout : qu’on en fasse ensemble. Bon anniversaire ${to} 💛`;
    }
  }

  // Keep query params when going to reader
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
    const url = new URL(a.getAttribute("href") || "reader.html", location.href);
    for (const [k, v] of qs.entries()) url.searchParams.set(k, v);
    a.setAttribute("href", url.pathname + url.search);
  }

  // Page count display (update this if you swap the PDF)
  const DEFAULT_PAGES = 66;
  const pageCount = document.getElementById("pageCount");
  if (pageCount) pageCount.textContent = String(DEFAULT_PAGES);

  // Mobile menu
  const burger = document.getElementById("burger");
  const navmobile = document.getElementById("navmobile");
  const closeMobile = document.getElementById("closeMobile");
  function openMobile(open) {
    if (!navmobile) return;
    navmobile.classList.toggle("is-open", open);
    navmobile.setAttribute("aria-hidden", open ? "false" : "true");
  }
  burger?.addEventListener("click", () => openMobile(!navmobile?.classList.contains("is-open")));
  closeMobile?.addEventListener("click", () => openMobile(false));
  navmobile?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => openMobile(false)));

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", href);
    });
  });

  // QR modal
  const modal = document.getElementById("qrModal");
  const qrBox = document.getElementById("qrBox");
  let qrRendered = false;

  function openQr() {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (!qrRendered && qrBox && window.QRCode) {
      const url = location.href;
      qrBox.innerHTML = "";
      QRCode.toCanvas(
        url,
        { width: 260, margin: 2, color: { dark: "#111318", light: "#f5f1e8" } },
        (err, canvas) => {
          if (!err && canvas) {
            canvas.style.borderRadius = "16px";
            canvas.style.boxShadow = "0 18px 55px rgba(0,0,0,.35)";
            qrBox.appendChild(canvas);
            qrRendered = true;
          } else {
            qrBox.textContent = "Impossible de générer le QR code.";
          }
        }
      );
    }
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
  document.getElementById("btnCopyLink")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      toast("Lien copié ✨");
    } catch {
      toast("Copie impossible (navigateur).");
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
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      keyboard: { enabled: true },
    });
  }

  // Simple 3D tilt on mockup
  const tilt = document.getElementById("tilt");
  if (tilt) {
    const strength = 10;
    tilt.addEventListener("mousemove", (e) => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `perspective(1200px) rotateY(${(-12 + x * strength)}deg) rotateX(${(6 - y * strength)}deg)`;
    });
    tilt.addEventListener("mouseleave", () => {
      tilt.style.transform = "perspective(1200px) rotateY(-12deg) rotateX(6deg)";
    });
  }

  // GSAP reveal animations
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray(".panel, .timeline__item, .gallery__card, .miniCard, .cta__card").forEach((el) => {
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
    toast("✨ Bon anniversaire !");
  });

  // tiny toast
  let toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.style.position = "fixed";
      toastEl.style.left = "50%";
      toastEl.style.bottom = "18px";
      toastEl.style.transform = "translateX(-50%)";
      toastEl.style.padding = "10px 12px";
      toastEl.style.borderRadius = "999px";
      toastEl.style.border = "1px solid rgba(255,255,255,.14)";
      toastEl.style.background = "rgba(7,10,18,.55)";
      toastEl.style.backdropFilter = "blur(10px)";
      toastEl.style.boxShadow = "0 18px 55px rgba(0,0,0,.35)";
      toastEl.style.color = "rgba(255,255,255,.92)";
      toastEl.style.fontSize = ".95rem";
      toastEl.style.zIndex = "120";
      toastEl.style.opacity = "0";
      toastEl.style.transition = "opacity .18s ease, transform .18s ease";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = "1";
    toastEl.style.transform = "translateX(-50%) translateY(0)";
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => {
      toastEl.style.opacity = "0";
      toastEl.style.transform = "translateX(-50%) translateY(6px)";
    }, 1400);
  }
})();
