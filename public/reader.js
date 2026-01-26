(() => {
  const $ = (id) => document.getElementById(id);
  const i18n = () => window.i18n;

  // Elements
  const bookEl = $("book");
  const bookWrap = $("bookWrap");
  const stage = $("stage");

  const loading = $("loading");
  const loadingSub = $("loadingSub");
  const loadingBarFill = $("loadingBarFill");

  const prevBtn = $("prevBtn");
  const nextBtn = $("nextBtn");
  const pageInput = $("pageInput");
  const pageLabel = $("pageLabel");

  const toggleLayout = $("toggleLayout");
  const layoutLabel = $("layoutLabel");
  const zoomOutBtn = $("zoomOut");
  const zoomInBtn = $("zoomIn");
  const fullscreenBtn = $("fullscreen");

  const totalPagesEl = $("totalPages");
  const modeLabelEl = $("modeLabel");
  const backLink = $("backLink");
  const openGallery = $("openGallery");

  // State
  const state = {
    pdf: null,
    total: 0,
    pageFlip: null,
    layout: "two", // 'two' | 'single'
    zoom: 1,
    isReady: false,
    isFlipping: false,
    lastFlipAt: 0,
    base: { w: 420, h: 560 },
    renderScale: 1.2,
  };

  // --- Helpers ---
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function setLoading(on) {
    document.body.classList.toggle("is-loading", !!on);
    if (loading) loading.style.display = on ? "" : "none";
  }

  function setProgress(pct, text) {
    if (loadingBarFill) loadingBarFill.style.width = `${clamp(pct, 0, 100)}%`;
    if (loadingSub && text) loadingSub.textContent = text;
  }

  function ensurePdfWorker() {
    if (!window.pdfjsLib) return;
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  }

  function getPageFlipCtor() {
    return (window.St && window.St.PageFlip) || window.PageFlip || null;
  }

  function debounce(fn, ms = 120) {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  function parseScaleFromTransform(tr) {
    if (!tr || tr === "none") return 1;
    // matrix(a, b, c, d, e, f) or matrix3d(...)
    const m = tr.match(/matrix\(([^)]+)\)/);
    if (m) {
      const parts = m[1].split(",").map((x) => parseFloat(x.trim()));
      const a = parts[0], b = parts[1];
      return Math.sqrt(a * a + b * b) || 1;
    }
    const m3 = tr.match(/matrix3d\(([^)]+)\)/);
    if (m3) {
      const parts = m3[1].split(",").map((x) => parseFloat(x.trim()));
      const a = parts[0], b = parts[1];
      return Math.sqrt(a * a + b * b) || 1;
    }
    return 1;
  }

  function sanityCheckZoom() {
    if (!bookWrap) return;
    const scale = parseScaleFromTransform(getComputedStyle(bookWrap).transform);
    if (scale > 2.6 || scale < 0.45) {
      state.zoom = 1;
      applyZoom();
    }
  }

  function applyZoom() {
    if (!bookWrap) return;
    state.zoom = clamp(state.zoom, 0.85, 1.85);
    bookWrap.style.transform = `scale(${state.zoom})`;
  }

  function setZoom(next) {
    state.zoom = next;
    applyZoom();
  }

  function toggleZoom() {
    setZoom(state.zoom < 1.2 ? 1.35 : 1);
  }

  function canFlip() {
    if (!state.pageFlip || !state.isReady) return false;
    if (state.isFlipping) return false;
    const now = Date.now();
    if (now - state.lastFlipAt < 230) return false;
    state.lastFlipAt = now;
    return true;
  }

  function flipPrev() {
    if (!canFlip()) return;
    try {
      if (state.pageFlip.flipPrev) state.pageFlip.flipPrev("top");
      else if (state.pageFlip.turnToPrevPage) state.pageFlip.turnToPrevPage();
    } catch {}
  }

  function flipNext() {
    if (!canFlip()) return;
    try {
      if (state.pageFlip.flipNext) state.pageFlip.flipNext("top");
      else if (state.pageFlip.turnToNextPage) state.pageFlip.turnToNextPage();
    } catch {}
  }

  function getCurrentIndex() {
    try {
      if (state.pageFlip && state.pageFlip.getCurrentPageIndex) return state.pageFlip.getCurrentPageIndex();
    } catch {}
    // fallback: parse from input
    const n = Number(pageInput?.value || 1);
    return clamp((Number.isFinite(n) ? n : 1) - 1, 0, Math.max(0, state.total - 1));
  }

  function goTo(idx) {
    if (!state.pageFlip || !state.isReady) return;
    const target = clamp(idx, 0, Math.max(0, state.total - 1));
    try {
      if (state.pageFlip.turnToPage) state.pageFlip.turnToPage(target);
      else if (state.pageFlip.flip) state.pageFlip.flip(target);
    } catch {}
    updatePageUI(target);
  }

  function updatePageUI(idx0) {
    const current = clamp(idx0, 0, Math.max(0, state.total - 1));
    if (pageInput) pageInput.value = String(current + 1);
    if (pageLabel) pageLabel.textContent = `${current + 1} / ${state.total || "—"}`;
  }

  function setLayoutUI(layout) {
    document.body.classList.toggle("layout-single", layout === "single");
    document.body.classList.toggle("layout-two", layout !== "single");

    // Update labels (some are i18n-driven, but these two are dynamic)
    const t = i18n()?.t;
    if (modeLabelEl) modeLabelEl.textContent = t ? t(layout === "single" ? "reader.mode.single" : "reader.mode.two") : (layout === "single" ? "Single page" : "Two-page");
    if (layoutLabel) layoutLabel.textContent = t ? t(layout === "single" ? "reader.toggleLabel.two" : "reader.toggleLabel.single") : (layout === "single" ? "Two-page" : "Single page");
  }

  function bindPageFlipEvents(pf) {
    if (!pf || !pf.on) return;

    try {
      pf.on("flip", (e) => {
        // e.data is the new page index in StPageFlip
        const idx = typeof e?.data === "number" ? e.data : getCurrentIndex();
        updatePageUI(idx);
        sanityCheckZoom();
      });

      pf.on("changeState", (e) => {
        const s = e?.data;
        state.isFlipping = s && s !== "read";
        if (!state.isFlipping) sanityCheckZoom();
      });

      pf.on("changeOrientation", () => {
        // Keep our forced layout stable
        requestAnimationFrame(() => {
          try {
            if (pf.updateOrientation) pf.updateOrientation(state.layout === "single" ? "portrait" : "landscape");
            if (pf.update) pf.update();
          } catch {}
        });
      });
    } catch {}
  }

  function buildSettings() {
    const { w, h } = state.base;
    const portraitForced = state.layout === "single";
    const common = {
      width: w,
      height: h,
      size: "stretch",
      minWidth: Math.max(260, Math.round(w * 0.6)),
      maxWidth: Math.round(w * 1.5),
      minHeight: Math.max(360, Math.round(h * 0.6)),
      maxHeight: Math.round(h * 1.5),
      maxShadowOpacity: 0.28,
      showCover: true,
      mobileScrollSupport: false,
      useMouseEvents: true,
      swipeDistance: 25,
      clickEventForward: true,
      drawShadow: true,
      usePortrait: true,
      flippingTime: 650,
      startPage: 0,
    };

    // If supported by library, portrait orientation can be enforced after init with updateOrientation.
    // Keeping usePortrait true also allows it to behave on small screens.
    // We'll force orientation explicitly in rebuild().
    common.startPage = clamp(getCurrentIndex(), 0, Math.max(0, state.total - 1));
    common.showCover = !portraitForced; // nicer in two-page, less confusing in single
    return common;
  }

  function destroyPageFlip() {
    if (!state.pageFlip) return;
    try {
      // PageFlip keeps listeners internally; destroy is safest.
      state.pageFlip.destroy();
    } catch {}
    state.pageFlip = null;
  }

  function rebuildPageFlip({ keepPage = true } = {}) {
    const ctor = getPageFlipCtor();
    if (!ctor || !bookEl) return;

    const idx = keepPage ? getCurrentIndex() : 0;

    destroyPageFlip();

    // Create new instance
    const settings = buildSettings();
    settings.startPage = idx;

    const pf = new ctor(bookEl, settings);

    // Load pages
    const pages = bookEl.querySelectorAll(".page");
    pf.loadFromHTML(pages);

    // Force orientation to match selected layout (this is the key fix for single-page mode)
    requestAnimationFrame(() => {
      try {
        if (pf.updateOrientation) pf.updateOrientation(state.layout === "single" ? "portrait" : "landscape");
        if (pf.update) pf.update();
      } catch {}
      // Go back to index (some builds ignore startPage)
      try {
        if (pf.turnToPage) pf.turnToPage(idx);
      } catch {}
      updatePageUI(idx);
    });

    state.pageFlip = pf;
    bindPageFlipEvents(pf);
  }

  async function renderPdfToPages(url) {
    ensurePdfWorker();

    const lib = window.pdfjsLib;
    if (!lib || !bookEl) throw new Error("pdfjsLib missing");

    setLoading(true);
    setProgress(4, i18n()?.t("reader.loading.sub") || "Loading PDF…");

    const task = lib.getDocument(url);
    const pdf = await task.promise;
    state.pdf = pdf;
    state.total = pdf.numPages || 0;

    if (totalPagesEl) totalPagesEl.textContent = String(state.total || "—");
    updatePageUI(0);

    // Render scale tuned for quality/perf
    const dpr = window.devicePixelRatio || 1;
    state.renderScale = clamp(1.05 * dpr, 1.1, 1.8);

    // Clear previous pages
    bookEl.innerHTML = "";

    const frag = document.createDocumentFragment();

    // First page defines ratio
    const firstPage = await pdf.getPage(1);
    const vp0 = firstPage.getViewport({ scale: state.renderScale });
    const ratio = vp0.width / vp0.height || (3 / 4);
    state.base.h = 620;
    state.base.w = Math.round(state.base.h * ratio);

    // Helper to render a page
    const renderOne = async (n) => {
      const page = await pdf.getPage(n);
      const viewport = page.getViewport({ scale: state.renderScale });

      const pageEl = document.createElement("div");
      pageEl.className = "page";

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: false });

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      // CSS sizing — PageFlip will handle layout, canvas follows
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      pageEl.appendChild(canvas);

      const footer = document.createElement("div");
      footer.className = "pageFooter";
      footer.textContent = String(n);
      pageEl.appendChild(footer);

      await page.render({ canvasContext: ctx, viewport }).promise;
      return pageEl;
    };

    // Render sequentially (stable + shows progress)
    for (let n = 1; n <= state.total; n++) {
      const pct = 8 + Math.round((n / Math.max(1, state.total)) * 84);
      setProgress(pct, (i18n()?.t("reader.loading.sub") || "Rendering…") + ` (${n}/${state.total})`);
      frag.appendChild(await renderOne(n));
    }

    bookEl.appendChild(frag);
    setProgress(96, i18n()?.t("reader.loading.sub") || "Building the book…");
  }

  function patchLinksWithLang() {
    const qs = new URLSearchParams(location.search);
    const lang = qs.get("lang");
    if (!lang) return;

    const patch = (a) => {
      try {
        const u = new URL(a.getAttribute("href"), location.href);
        u.searchParams.set("lang", lang);
        a.setAttribute("href", u.pathname + u.search + u.hash);
      } catch {}
    };

    if (backLink) patch(backLink);
    if (openGallery) patch(openGallery);
  }

  function bindUI() {
    // Buttons
    prevBtn?.addEventListener("click", flipPrev);
    nextBtn?.addEventListener("click", flipNext);

    // Page input
    pageInput?.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const n = Number(pageInput.value);
      if (!Number.isFinite(n)) return;
      goTo(n - 1);
    });
    pageInput?.addEventListener("blur", () => {
      const n = Number(pageInput.value);
      if (!Number.isFinite(n)) return;
      goTo(n - 1);
    });

    toggleLayout?.addEventListener("click", () => {
      state.layout = state.layout === "single" ? "two" : "single";
      setLayoutUI(state.layout);
      rebuildPageFlip({ keepPage: true });
    });

    zoomInBtn?.addEventListener("click", () => setZoom(state.zoom + 0.1));
    zoomOutBtn?.addEventListener("click", () => setZoom(state.zoom - 0.1));

    // Double-click zoom (but safe)
    stage?.addEventListener(
      "dblclick",
      (e) => {
        // Prevent browser-level smart-zoom and keep it consistent
        e.preventDefault();
        e.stopPropagation();
        if (state.isFlipping) return;
        toggleZoom();
      },
      { passive: false }
    );

    // Prevent drag artifacts
    stage?.addEventListener("dragstart", (e) => e.preventDefault());

    // Fullscreen
    fullscreenBtn?.addEventListener("click", async () => {
      if (!stage) return;
      try {
        if (!document.fullscreenElement) await stage.requestFullscreen();
        else await document.exitFullscreen();
      } catch {}
    });

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (!state.isReady) return;
      if (e.key === "ArrowLeft") flipPrev();
      if (e.key === "ArrowRight") flipNext();
      if (e.key === "+") setZoom(state.zoom + 0.1);
      if (e.key === "-") setZoom(state.zoom - 0.1);
      if (e.key === "Escape" && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    });

    // Resize
    window.addEventListener(
      "resize",
      debounce(() => {
        try {
          if (state.pageFlip?.updateOrientation) state.pageFlip.updateOrientation(state.layout === "single" ? "portrait" : "landscape");
          if (state.pageFlip?.update) state.pageFlip.update();
        } catch {}
        applyZoom();
        sanityCheckZoom();
      }, 140)
    );

    // Update dynamic labels on language change
    window.addEventListener("langchange", () => {
      setLayoutUI(state.layout);
      updatePageUI(getCurrentIndex());
      // Keep subtext in sync (apply() already updated DOM)
    });
  }

  async function start() {
    patchLinksWithLang();
    bindUI();

    // Ensure layout classes exist
    setLayoutUI(state.layout);
    applyZoom();

    // Wait for libs if needed (defer keeps order, but safe for slow networks)
    const waitFor = (test, timeout = 12000) =>
      new Promise((resolve, reject) => {
        const start = Date.now();
        const tick = () => {
          if (test()) return resolve();
          if (Date.now() - start > timeout) return reject(new Error("timeout"));
          requestAnimationFrame(tick);
        };
        tick();
      });

    try {
      await waitFor(() => window.pdfjsLib && getPageFlipCtor() && bookEl, 15000);
    } catch {
      setLoading(false);
      if (loadingSub) loadingSub.textContent = (i18n()?.t("reader.error.libs") || "Failed to load reader dependencies.");
      return;
    }

    try {
      await renderPdfToPages("book.pdf");
      rebuildPageFlip({ keepPage: false });
      state.isReady = true;
      setProgress(100, i18n()?.t("reader.loading.done") || "Ready");
      setTimeout(() => setLoading(false), 260);
      // Small delayed sanity check (some browsers apply transforms late)
      setTimeout(sanityCheckZoom, 700);
    } catch (e) {
      setLoading(false);
      if (loadingSub) loadingSub.textContent = (i18n()?.t("reader.error.pdf") || "Failed to load the PDF.");
      console.error(e);
    }
  }

  // Init
  document.addEventListener("DOMContentLoaded", start);
})();
