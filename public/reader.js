/* Reader interactions (reader.html) */
(function () {
  const $ = (id) => document.getElementById(id);

  const bookEl = $("book");
  const bookWrap = $("bookWrap");
  const loading = $("loading");
  const loadingSub = $("loadingSub");
  const loadingBar = $("loadingBar");

  const prevBtn = $("prevBtn");
  const nextBtn = $("nextBtn");
  const pageSlider = $("pageSlider");
  const pageLabel = $("pageLabel");

  const toggleLayout = $("toggleLayout");
  const layoutLabel = $("layoutLabel");
  const modeLabel = $("modeLabel");
  const pageCountEl = $("pageCount");

  const zoomInBtn = $("zoomIn");
  const zoomOutBtn = $("zoomOut");
  const fullscreenBtn = $("fullscreen");

  const stage = $("stage");

  // pdf.js worker
  function ensurePdfWorker() {
    if (!window.pdfjsLib) return;
    // pdf.js needs a worker src when loaded via CDN
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  }

  // PageFlip constructor lookup
  function PageFlipCtor() {
    if (window.St && window.St.PageFlip) return window.St.PageFlip;
    if (window.PageFlip) return window.PageFlip;
    return null;
  }

  // State
  const state = {
    pdf: null,
    pages: [],
    pageFlip: null,
    total: 0,
    zoom: 1,
    forcedOrientation: null, // 'portrait' | 'landscape' | null
    isReady: false,
  };

  function setProgress(pct, text) {
    if (loadingBar) loadingBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    if (loadingSub && text) loadingSub.textContent = text;
  }

  function setModeUI(mode) {
    if (!modeLabel) return;
    modeLabel.textContent = mode === "portrait" ? "1 page" : "double page";
  }

  function setLayoutButton(mode) {
    if (!layoutLabel) return;
    layoutLabel.textContent = mode === "portrait" ? "1 page" : "Double page";
    toggleLayout?.classList.toggle("is-portrait", mode === "portrait");
    if (bookWrap) bookWrap.classList.toggle("is-portrait", mode === "portrait");
  }

  function currentOrientation() {
    try {
      if (state.pageFlip && typeof state.pageFlip.getOrientation === "function") {
        return state.pageFlip.getOrientation(); // 'portrait' | 'landscape'
      }
    } catch {}
    // fallback to forced or screen
    if (state.forcedOrientation) return state.forcedOrientation;
    return window.innerWidth < 860 ? "portrait" : "landscape";
  }

  function applyOrientation(mode) {
    if (!state.pageFlip) return;
    try {
      if (typeof state.pageFlip.updateOrientation === "function") {
        state.pageFlip.updateOrientation(mode); // 'portrait' | 'landscape'
        // ensure reflow
        setTimeout(() => {
          try { state.pageFlip.update(); } catch {}
        }, 0);
      }
    } catch {}
    setModeUI(mode);
    setLayoutButton(mode);
  }

  function updatePageUI(index) {
    const current = index + 1;
    const total = state.total;
    if (pageLabel) pageLabel.textContent = `Page ${current} / ${total}`;
    if (pageSlider) pageSlider.value = String(index);
  }

  function setZoom(next) {
    state.zoom = Math.max(0.8, Math.min(2.2, next));
    if (bookEl) {
      bookEl.style.transformOrigin = "center center";
      bookEl.style.transform = `scale(${state.zoom})`;
    }
  }

  async function renderPdfPage(pageIndex, scale = 1.55) {
    const pdf = state.pdf;
    const page = await pdf.getPage(pageIndex + 1);

    const viewport = page.getViewport({ scale });
    const canvas = state.pages[pageIndex]?.querySelector("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    canvas.width = Math.floor(viewport.width * devicePixelRatio);
    canvas.height = Math.floor(viewport.height * devicePixelRatio);
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    await page.render({
      canvasContext: ctx,
      viewport,
      intent: "display",
    }).promise;
  }

  function buildPageElements(total) {
    if (!bookEl) return;

    bookEl.innerHTML = "";
    state.pages = [];

    for (let i = 0; i < total; i++) {
      const page = document.createElement("div");
      page.className = "page";
      // Make first/last hard to match a book
      if (i === 0 || i === total - 1) page.dataset.density = "hard";

      const content = document.createElement("div");
      content.className = "pageContent";

      const canvas = document.createElement("canvas");
      canvas.className = "pageCanvas";

      const footer = document.createElement("div");
      footer.className = "pageFooter";
      footer.textContent = String(i + 1);

      content.appendChild(canvas);
      content.appendChild(footer);
      page.appendChild(content);

      bookEl.appendChild(page);
      state.pages.push(page);
    }
  }

  function initFlipbook() {
    const Ctor = PageFlipCtor();
    if (!Ctor || !bookEl) {
      throw new Error("PageFlip indisponible.");
    }

    // If re-init, cleanup
    try { state.pageFlip?.destroy?.(); } catch {}

    state.pageFlip = new Ctor(bookEl, {
      width: 595, // A4 ratio base
      height: 842,
      size: "stretch",
      minWidth: 320,
      maxWidth: 1200,
      minHeight: 420,
      maxHeight: 980,
      maxShadowOpacity: 0.35,
      showCover: true,
      usePortrait: true,
      mobileScrollSupport: true,
      flippingTime: 780,
      startZIndex: 0,
    });

    // Load pages (different spellings exist across versions)
    const load = state.pageFlip.loadFromHtml || state.pageFlip.loadFromHTML;
    load.call(state.pageFlip, state.pages);

    // Events
    state.pageFlip.on("flip", (e) => {
      const idx = Number(e?.data ?? 0);
      updatePageUI(idx);
    });
    state.pageFlip.on("changeOrientation", (e) => {
      const mode = String(e?.data || "");
      if (!state.forcedOrientation && (mode === "portrait" || mode === "landscape")) {
        setModeUI(mode);
        setLayoutButton(mode);
      }
    });

    // initial UI
    const total = state.pageFlip.getPageCount ? state.pageFlip.getPageCount() : state.total;
    state.total = total;
    pageCountEl && (pageCountEl.textContent = String(total));
    pageSlider && (pageSlider.max = String(Math.max(0, total - 1)));

    const mode = state.forcedOrientation || currentOrientation();
    applyOrientation(mode);
    updatePageUI(state.pageFlip.getCurrentPageIndex ? state.pageFlip.getCurrentPageIndex() : 0);

    // Remove overlay
    loading?.classList.add("is-hidden");
    state.isReady = true;
  }

  async function boot() {
    ensurePdfWorker();

    setProgress(6, "Chargement du PDF…");
    const doc = await pdfjsLib.getDocument({
      url: "book.pdf",
      withCredentials: false,
    }).promise;

    state.pdf = doc;
    state.total = doc.numPages;
    pageCountEl && (pageCountEl.textContent = String(state.total));
    setProgress(12, `Création des pages… (${state.total})`);

    buildPageElements(state.total);

    // Render first pages quickly for a fast "ready" feeling
    const FIRST_BATCH = Math.min(10, state.total);
    for (let i = 0; i < FIRST_BATCH; i++) {
      setProgress(12 + (i / FIRST_BATCH) * 28, `Rendu des premières pages… (${i + 1}/${FIRST_BATCH})`);
      await renderPdfPage(i);
    }

    setProgress(42, "Initialisation du lecteur…");
    initFlipbook();

    // Render remaining pages in background
    (async () => {
      for (let i = FIRST_BATCH; i < state.total; i++) {
        const pct = 42 + ((i - FIRST_BATCH) / Math.max(1, state.total - FIRST_BATCH)) * 58;
        setProgress(pct, `Rendu du livre… (${i + 1}/${state.total})`);
        await renderPdfPage(i);

        // Every few pages, refresh rendering area (lightweight)
        if (state.pageFlip && (i % 6 === 0)) {
          try {
            const upd = state.pageFlip.updateFromHtml || state.pageFlip.updateFromHTML;
            upd?.call(state.pageFlip, state.pages);
            state.pageFlip.update?.();
          } catch {}
        }
      }
      setProgress(100, "Prêt ✅");
      // Keep overlay hidden, but this ends progress.
    })().catch(() => {});
  }

  // Controls
  prevBtn?.addEventListener("click", () => {
    if (!state.pageFlip) return;
    try {
      state.pageFlip.flipPrev ? state.pageFlip.flipPrev("top") : state.pageFlip.turnToPrevPage();
    } catch {
      try { state.pageFlip.turnToPrevPage(); } catch {}
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (!state.pageFlip) return;
    try {
      state.pageFlip.flipNext ? state.pageFlip.flipNext("top") : state.pageFlip.turnToNextPage();
    } catch {
      try { state.pageFlip.turnToNextPage(); } catch {}
    }
  });

  pageSlider?.addEventListener("input", () => {
    if (!state.pageFlip) return;
    const idx = Number(pageSlider.value);
    try { state.pageFlip.turnToPage(idx); } catch {}
    updatePageUI(idx);
  });

  toggleLayout?.addEventListener("click", () => {
    const current = currentOrientation();
    const next = current === "portrait" ? "landscape" : "portrait";
    state.forcedOrientation = next; // force it, so it won't auto-switch on resize
    applyOrientation(next);
  });

  zoomInBtn?.addEventListener("click", () => setZoom(state.zoom + 0.1));
  zoomOutBtn?.addEventListener("click", () => setZoom(state.zoom - 0.1));

  // Double-click to toggle zoom
  stage?.addEventListener("dblclick", () => {
    setZoom(state.zoom < 1.4 ? 1.6 : 1);
  });

  // Fullscreen
  fullscreenBtn?.addEventListener("click", async () => {
    if (!stage) return;
    try {
      if (!document.fullscreenElement) {
        await stage.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      // Recompute rendering area after fullscreen transition
      setTimeout(() => {
        try { state.pageFlip?.update?.(); } catch {}
      }, 250);
    } catch {}
  });

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (!state.pageFlip || !state.isReady) return;
    if (e.key === "ArrowLeft") prevBtn?.click();
    if (e.key === "ArrowRight") nextBtn?.click();
    if (e.key === "+") setZoom(state.zoom + 0.1);
    if (e.key === "-") setZoom(state.zoom - 0.1);
    if (e.key === "Escape" && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  });

  // Resize: keep forced orientation, update render area
  window.addEventListener("resize", () => {
    if (!state.pageFlip) return;
    const mode = state.forcedOrientation || currentOrientation();
    applyOrientation(mode);
    try { state.pageFlip.update?.(); } catch {}
  });

  // Boot
  window.addEventListener("load", () => {
    // ensure libs are present
    if (!window.pdfjsLib) {
      setProgress(10, "pdf.js introuvable.");
      return;
    }
    if (!PageFlipCtor()) {
      setProgress(10, "page-flip introuvable.");
      return;
    }
    boot().catch((err) => {
      console.error(err);
      setProgress(10, "Erreur de chargement du PDF.");
    });
  });
})();
