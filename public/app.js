/* global pdfjsLib, St, gsap, QRCode */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  const state = {
    pdfUrl: "book.pdf",
    pdf: null,
    pageFlip: null,
    pages: [],
    rendered: new Set(),
    basePageW: 420,
    basePageH: 595,
    zoom: 1,
    isSingle: false,
    renderScale: 1.35, // canvas render scale; keep reasonable to avoid huge memory
    preRenderCount: 6,
  };

  // --- Personalisation: ?to=Prénom
  const params = new URLSearchParams(location.search);
  const to = (params.get("to") || "").trim();
  if (to) {
    $("#heroTo").textContent = `Bon anniversaire, ${to} ✨`;
    $("#heroKicker").textContent = "Une petite surprise (très) maison";
    document.title = `Mes recettes personnelles — Bon anniversaire, ${to}`;
  }

  // --- Fancy entrance
  window.addEventListener("load", () => {
    if (window.gsap) {
      gsap.from(".hero__badge", {
        y: 10,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
      });
      gsap.from(".hero__title", {
        y: 14,
        opacity: 0,
        duration: 0.85,
        delay: 0.1,
        ease: "power2.out",
      });
      gsap.from(".hero__lead", {
        y: 10,
        opacity: 0,
        duration: 0.85,
        delay: 0.2,
        ease: "power2.out",
      });
      gsap.from(".hero__actions .btn", {
        y: 8,
        opacity: 0,
        duration: 0.5,
        delay: 0.25,
        stagger: 0.07,
        ease: "power2.out",
      });
      gsap.from(".hero__cards .card", {
        y: 10,
        opacity: 0,
        duration: 0.6,
        delay: 0.35,
        stagger: 0.08,
        ease: "power2.out",
      });
    }
  });

  // --- QR modal
  const qrModal = $("#qrModal");
  const qrBox = $("#qrBox");
  const openQr = () => {
    qrBox.innerHTML = "";
    qrModal.classList.add("is-open");
    qrModal.setAttribute("aria-hidden", "false");
    const url = location.href;
    // Generate a nice crisp QR into a canvas then append
    QRCode.toCanvas(url, { width: 280, margin: 1 }, (err, canvas) => {
      if (err) return;
      canvas.style.borderRadius = "14px";
      canvas.style.background = "#fff";
      canvas.style.padding = "10px";
      qrBox.appendChild(canvas);
    });
  };
  const closeQr = () => {
    qrModal.classList.remove("is-open");
    qrModal.setAttribute("aria-hidden", "true");
  };
  $("#btnQr")?.addEventListener("click", openQr);
  qrModal?.addEventListener("click", (e) => {
    const t = e.target;
    if (t?.matches?.("[data-close]")) closeQr();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && qrModal?.classList.contains("is-open")) closeQr();
  });

  // --- Confetti / sparkle (canvas)
  const fx = $("#fx");
  const fxc = fx.getContext("2d");
  const fitFx = () => {
    fx.width = Math.floor(window.innerWidth * devicePixelRatio);
    fx.height = Math.floor(window.innerHeight * devicePixelRatio);
    fx.style.width = window.innerWidth + "px";
    fx.style.height = window.innerHeight + "px";
    fxc.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };
  fitFx();
  window.addEventListener("resize", fitFx);

  function burstConfetti() {
    const W = window.innerWidth,
      H = window.innerHeight;
    const pieces = Array.from({ length: 160 }, () => {
      const a = Math.random() * Math.PI * 2;
      const s = 3 + Math.random() * 6;
      return {
        x: W * 0.5,
        y: H * 0.35,
        vx: Math.cos(a) * (2 + Math.random() * 6),
        vy: Math.sin(a) * (2 + Math.random() * 6) - 4,
        r: 2 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        g: 0.2 + Math.random() * 0.25,
        life: 0,
        ttl: 90 + Math.random() * 50,
        hue: 20 + Math.random() * 70, // warm palette
      };
    });

    let frame = 0;
    function tick() {
      frame++;
      fxc.clearRect(0, 0, W, H);
      for (const p of pieces) {
        p.life++;
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        const t = 1 - p.life / p.ttl;
        const alpha = Math.max(0, Math.min(1, t));
        fxc.save();
        fxc.translate(p.x, p.y);
        fxc.rotate(p.rot);
        fxc.globalAlpha = alpha;
        fxc.fillStyle = `hsl(${p.hue} 85% 65%)`;
        fxc.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
        fxc.restore();
      }
      if (frame < 140) requestAnimationFrame(tick);
      else fxc.clearRect(0, 0, W, H);
    }
    tick();
  }
  $("#btnConfetti")?.addEventListener("click", burstConfetti);

  // --- Reader controls
  const loadingEl = $("#loading");
  const loadingSub = $("#loadingSub");
  const loadingBar = $("#loadingBar");

  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const pageLabel = $("#pageLabel");
  const pageSlider = $("#pageSlider");
  const pageCountTag = $("#pageCountTag");
  const toggleLayout = $("#toggleLayout");
  const zoomOut = $("#zoomOut");
  const zoomIn = $("#zoomIn");
  const fullscreenBtn = $("#fullscreen");
  const readerRoot = $("#reader");
  const stage = $("#readerStage");
  const bookEl = $("#book");
  const bookShell = $("#bookShell");

  function setLoading(progress01, text) {
    if (typeof text === "string") loadingSub.textContent = text;
    loadingBar.style.width = `${Math.round(progress01 * 100)}%`;
  }

  function showLoading(show) {
    loadingEl.classList.toggle("is-hidden", !show);
  }

  function setZoom(z) {
    state.zoom = Math.max(0.75, Math.min(1.75, z));
    bookShell.style.transform = `scale(${state.zoom})`;
    bookShell.style.transformOrigin = "center top";
  }

  zoomOut?.addEventListener("click", () => setZoom(state.zoom - 0.1));
  zoomIn?.addEventListener("click", () => setZoom(state.zoom + 0.1));
  bookShell?.addEventListener("dblclick", () => {
    setZoom(state.zoom > 1 ? 1 : 1.35);
  });

  function toggleSingle() {
    state.isSingle = !state.isSingle;
    readerRoot.classList.toggle("single", state.isSingle);
    // Force re-calc; page-flip reacts to resize/orientation
    state.pageFlip
      ? state.pageFlip.updateFromHtml
        ? state.pageFlip.updateFromHtml(state.pages)
        : state.pageFlip.updateFromHTML
        ? state.pageFlip.updateFromHTML(state.pages)
        : void 0
      : void 0;
  }
  toggleLayout?.addEventListener("click", toggleSingle);

  function enterFullscreen() {
    const el = stage;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
  fullscreenBtn?.addEventListener("click", enterFullscreen);

  function updateUi() {
    if (!state.pageFlip) return;
    const idx = state.pageFlip.getCurrentPageIndex();
    const total = state.pageFlip.getPageCount();
    pageLabel.textContent = `Page ${idx + 1} / ${total}`;
    pageSlider.max = String(Math.max(0, total - 1));
    pageSlider.value = String(idx);
  }

  pageSlider?.addEventListener("input", (e) => {
    if (!state.pageFlip) return;
    const v = Number(e.target.value);
    state.pageFlip.flip(v, "top");
  });

  prevBtn?.addEventListener("click", () => state.pageFlip?.flipPrev("top"));
  nextBtn?.addEventListener("click", () => state.pageFlip?.flipNext("top"));

  window.addEventListener("keydown", (e) => {
    if (!state.pageFlip) return;
    if (e.key === "ArrowLeft") state.pageFlip.flipPrev("top");
    if (e.key === "ArrowRight") state.pageFlip.flipNext("top");
  });

  // --- PDF -> canvases (lazy)
  function makePageDiv(i, hard = false) {
    const div = document.createElement("div");
    div.className = "page";
    if (hard) div.setAttribute("data-density", "hard");
    div.setAttribute("data-page", String(i));
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", `Page ${i}`);
    div.appendChild(canvas);
    return div;
  }

  async function renderPdfPage(pageIndex0) {
    if (!state.pdf) return;
    const pageNum = pageIndex0 + 1;
    if (state.rendered.has(pageNum)) return;

    const pageDiv = state.pages[pageIndex0];
    if (!pageDiv) return;
    const canvas = pageDiv.querySelector("canvas");
    if (!canvas) return;

    const page = await state.pdf.getPage(pageNum);
    // Keep aspect ratio but render at a reasonable size
    const viewport = page.getViewport({ scale: state.renderScale });
    const ctx = canvas.getContext("2d", { alpha: false });

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    // crisp
    ctx.imageSmoothingEnabled = true;
    await page.render({ canvasContext: ctx, viewport }).promise;

    state.rendered.add(pageNum);
  }

  async function renderAround(pageIndex0) {
    const around = [
      pageIndex0,
      pageIndex0 - 1,
      pageIndex0 + 1,
      pageIndex0 + 2,
      pageIndex0 - 2,
    ].filter((x) => x >= 0 && x < state.pages.length);

    // Render sequentially to avoid spikes
    for (const i of around) {
      await renderPdfPage(i);
    }
  }

  async function initFlipbook() {
    // pdf.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    setLoading(0.05, "Ouverture du PDF…");
    const loadingTask = pdfjsLib.getDocument(state.pdfUrl);

    loadingTask.onProgress = (p) => {
      if (!p || !p.total) return;
      const pct = Math.min(0.35, 0.05 + (p.loaded / p.total) * 0.3);
      setLoading(pct, "Téléchargement du PDF…");
    };

    state.pdf = await loadingTask.promise;

    const numPages = state.pdf.numPages;
    pageCountTag.textContent = `${numPages} pages`;

    setLoading(0.4, "Préparation des pages…");

    // Base size from first page
    const firstPage = await state.pdf.getPage(1);
    const firstViewport = firstPage.getViewport({ scale: 1 });
    state.basePageW = Math.round(firstViewport.width);
    state.basePageH = Math.round(firstViewport.height);

    // Create all page placeholders
    bookEl.innerHTML = "";
    state.pages = [];
    state.rendered.clear();

    for (let i = 1; i <= numPages; i++) {
      const hard = i === 1 || i === numPages;
      const div = makePageDiv(i, hard);
      bookEl.appendChild(div);
      state.pages.push(div);
    }

    setLoading(0.55, "Initialisation du flipbook…");

    // Create PageFlip
    state.pageFlip = new St.PageFlip(bookEl, {
      width: state.basePageW,
      height: state.basePageH,
      size: "stretch",
      minWidth: 320,
      maxWidth: 1000,
      minHeight: 420,
      maxHeight: 1400,
      maxShadowOpacity: 0.35,
      showCover: true,
      mobileScrollSupport: true,
      usePortrait: true,
      flippingTime: 900,
      autoSize: true,
      startZIndex: 0,
    });

    state.pageFlip.loadFromHtml
      ? state.pageFlip.loadFromHtml(state.pages)
      : state.pageFlip.loadFromHTML(state.pages);

    // Render first pages
    setLoading(0.7, "Rendu des premières pages…");
    const firstBatch = [];
    for (let i = 0; i < Math.min(state.preRenderCount, numPages); i++)
      firstBatch.push(i);

    for (let i = 0; i < firstBatch.length; i++) {
      await renderPdfPage(firstBatch[i]);
      setLoading(
        0.7 + ((i + 1) / firstBatch.length) * 0.2,
        "Rendu des premières pages…"
      );
    }

    // Events
    state.pageFlip.on("flip", async (e) => {
      const idx = e.data;
      updateUi();
      // Render nearby pages lazily
      renderAround(idx).catch(() => {});
    });

    state.pageFlip.on("changeOrientation", () => {
      // Keep UI stable
      setTimeout(updateUi, 50);
    });

    // Initial UI
    updateUi();
    setLoading(0.95, "Prêt ✨");
    setTimeout(() => showLoading(false), 300);

    // Kick off background rendering gradually (so it feels "pro" without freezing)
    let bgIndex = state.preRenderCount;
    const bgTick = async () => {
      if (bgIndex >= numPages) return;
      await renderPdfPage(bgIndex);
      bgIndex++;
      // Spread work out
      setTimeout(bgTick, 30);
    };
    setTimeout(bgTick, 500);

    // Controls can now act
    pageSlider.min = "0";
    pageSlider.max = String(Math.max(0, numPages - 1));
  }

  // Start when reader section is near (lazy init)
  let started = false;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !started) {
          started = true;
          initFlipbook().catch((err) => {
            console.error(err);
            setLoading(
              1,
              "Oups — impossible de charger le PDF. Vérifie que book.pdf est bien présent à côté de index.html."
            );
          });
        }
      }
    },
    { rootMargin: "250px" }
  );

  io.observe($("#reader"));
})();
