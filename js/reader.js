/* ==========================================
   MOBILE-FIRST NATIVE READING MODE ENGINE
   v2 — Full Feature Implementation
   ========================================== */

/* ==========================================
   UNIFIED READER PREFERENCES (localStorage)
   Single object, single key — easy to extend
   ========================================== */
const READER_PREFS_KEY = "readerPrefs";

const DEFAULT_READER_PREFS = {
  theme:      "sepia",
  flow:       "scroll",
  fontFamily: "sans",
  fontSize:   1.1,
  lineHeight: "comfortable",
};

const LINE_HEIGHT_VALUES = {
  compact:     1.45,
  comfortable: 1.60,
  relaxed:     1.80,
};

let readerPrefs = { ...DEFAULT_READER_PREFS };
let readerWakeLockSentinel = null;
let activeReaderChapterIdx = 0;

let userHasOverriddenTheme = false;
const osDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");

let _progressRafId = null;
let _lastScrollProgress = -1;
let _saveDebounceTimer = null;
let _lastSavedProgress = -1;
let _lastTapTime = 0;
let _immersiveMode = false;

/* ------------------------------------------
   LOAD / SAVE PREFERENCES
   ------------------------------------------ */
function loadReaderPrefs() {
  try {
    const raw = localStorage.getItem(READER_PREFS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      readerPrefs = { ...DEFAULT_READER_PREFS, ...saved };
    }
  } catch (e) {
    console.warn("Could not load reader prefs:", e);
  }
}

function saveReaderPrefs() {
  try {
    localStorage.setItem(READER_PREFS_KEY, JSON.stringify(readerPrefs));
  } catch (e) {
    console.warn("Could not save reader prefs:", e);
  }
}

/* ------------------------------------------
   READING PROGRESS PERSISTENCE
   ------------------------------------------ */
function getProgressKey(chapterId) {
  return "readerProgress_" + chapterId;
}

function saveReadingProgress(chapterId) {
  const vp = document.getElementById("reader-viewport");
  if (!vp || !chapterId) return;

  let progress;
  if (readerPrefs.flow === "paginated") {
    const pageWidth = vp.clientWidth;
    const page = pageWidth > 0 ? Math.round(vp.scrollLeft / pageWidth) + 1 : 1;
    progress = { flow: "paginated", page: page };
  } else {
    progress = { flow: "scroll", scrollTop: vp.scrollTop };
  }

  const newVal = progress.scrollTop || progress.page || 0;
  if (Math.abs(newVal - _lastSavedProgress) < 10) return;
  _lastSavedProgress = newVal;

  try {
    localStorage.setItem(getProgressKey(chapterId), JSON.stringify(progress));
  } catch (e) {
    console.warn("Could not save reading progress:", e);
  }
}

function restoreReadingProgress(chapterId) {
  try {
    const raw = localStorage.getItem(getProgressKey(chapterId));
    if (!raw) return;
    const progress = JSON.parse(raw);
    const vp = document.getElementById("reader-viewport");
    if (!vp) return;

    setTimeout(function() {
      if (progress.flow === "paginated" && readerPrefs.flow === "paginated") {
        vp.scrollLeft = (progress.page - 1) * vp.clientWidth;
      } else if (progress.flow === "scroll" && readerPrefs.flow === "scroll") {
        vp.scrollTop = progress.scrollTop || 0;
      }
    }, 120);
  } catch (e) {
    console.warn("Could not restore reading progress:", e);
  }
}

function scheduleSaveProgress(chapterId) {
  clearTimeout(_saveDebounceTimer);
  _saveDebounceTimer = setTimeout(function() {
    saveReadingProgress(chapterId);
  }, 400);
}

/* ------------------------------------------
   READING TIME ESTIMATE (~200 wpm)
   ------------------------------------------ */
function estimateReadingTime(htmlString) {
  var tmp = document.createElement("div");
  tmp.innerHTML = htmlString;
  var text = tmp.textContent || tmp.innerText || "";
  var wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / 200);
}

/* ------------------------------------------
   OPEN READING MODE
   ------------------------------------------ */
function openReadingMode(chapterIdx) {
  if (typeof CHAPTERS === "undefined" || !CHAPTERS[chapterIdx]) return;

  loadReaderPrefs();
  activeReaderChapterIdx = chapterIdx;
  _lastSavedProgress = -1;
  _immersiveMode = false;

  var ch = CHAPTERS[chapterIdx];
  var modal = document.getElementById("reading-mode-modal");
  var titleEl = document.getElementById("reader-chapter-title");
  var bodyEl = document.getElementById("reader-content-body");

  if (!modal || !bodyEl) return;

  titleEl.innerText = ch.title;

  var rawMarkdown = (typeof TEXTBOOK_CONTENT !== "undefined" && TEXTBOOK_CONTENT[ch.id])
    ? TEXTBOOK_CONTENT[ch.id]
    : "### Content loading...";

  var html = (typeof marked !== "undefined" && marked.parse)
    ? marked.parse(rawMarkdown)
    : rawMarkdown;

  if (ch.labId) {
    html += '<div style="margin-top:2.5rem;margin-bottom:2rem;padding-top:1.5rem;border-top:1px solid rgba(0,0,0,0.1);text-align:center;clear:both;">'
      + '<button class="btn-action-lab" onclick="closeReadingMode();goToLab(\'' + ch.labId + '\')">'
      + '<i class="fa-solid fa-flask"></i> Try in Lab Simulator! \uD83E\uDDEA</button></div>';
  }

  bodyEl.innerHTML = html;
  bodyEl.style.fontSize = readerPrefs.fontSize + "rem";

  var timeBadge = document.getElementById("reader-time-badge");
  if (timeBadge) {
    timeBadge.textContent = "~" + estimateReadingTime(html) + " min read";
  }

  var endBanner = document.getElementById("reader-chapter-end-banner");
  if (endBanner) {
    var filteredChapters = CHAPTERS.filter(function(c) { return c.subject === (ch.subject || "ca"); });
    var isLast = filteredChapters.indexOf(ch) === filteredChapters.length - 1;
    endBanner.style.display = isLast ? "none" : "none"; // start hidden; reveal at 90% scroll
  }

  setTimeout(function() {
    if (window.renderMathInElement) {
      renderMathInElement(bodyEl, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$",  right: "$",  display: false }
        ],
        throwOnError: false
      });
    }
    requestAnimationFrame(scaleReaderMath);
  }, 50);

  applyReaderTheme(readerPrefs.theme);
  applyFontFamily(readerPrefs.fontFamily);
  applyLineHeight(readerPrefs.lineHeight);
  toggleReaderFlow(readerPrefs.flow);
  updateFontSizeIndicator();
  updateFontFamilyButtons(readerPrefs.fontFamily);
  updateLineHeightButtons(readerPrefs.lineHeight);

  if (!userHasOverriddenTheme) {
    var autoTheme = osDarkQuery.matches ? "dark" : "sepia";
    applyReaderTheme(autoTheme);
    readerPrefs.theme = autoTheme;
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  restoreReadingProgress(ch.id);
  setupScrollListeners(ch.id);
  requestWakeLock();
}

/* ------------------------------------------
   CLOSE READING MODE
   ------------------------------------------ */
function closeReadingMode() {
  var ch = CHAPTERS[activeReaderChapterIdx];
  if (ch) saveReadingProgress(ch.id);

  var modal = document.getElementById("reading-mode-modal");
  if (modal) modal.classList.remove("active");

  if (_progressRafId) {
    cancelAnimationFrame(_progressRafId);
    _progressRafId = null;
  }

  // Reset immersive mode top bar
  var topBar = document.querySelector(".reader-top-bar");
  if (topBar) {
    topBar.style.opacity = "1";
    topBar.style.pointerEvents = "auto";
    topBar.style.transform = "translateY(0)";
  }

  toggleReaderDrawer(false);
  document.body.style.overflow = "";
  releaseWakeLock();
}

/* ------------------------------------------
   SCROLL LISTENERS
   ------------------------------------------ */
function setupScrollListeners(chapterId) {
  var vp = document.getElementById("reader-viewport");
  if (!vp) return;

  var newVp = vp.cloneNode(true);
  vp.parentNode.replaceChild(newVp, vp);

  var freshVp = document.getElementById("reader-viewport");
  if (!freshVp) return;

  freshVp.addEventListener("scroll", function() {
    scheduleSaveProgress(chapterId);
    scheduleProgressBarUpdate();
    checkChapterEndVisibility();
    if (readerPrefs.flow === "paginated") updatePageCounter();
  }, { passive: true });

  freshVp.addEventListener("click", function(e) {
    if (e.target.closest("button, a, input, select, .reader-top-bar, .reader-drawer-overlay")) return;
    if (readerPrefs.flow !== "paginated") return;

    var width = window.innerWidth;
    var clickX = e.clientX;

    if (clickX > width * 0.7) {
      freshVp.scrollBy({ left: width * 0.85, behavior: "smooth" });
      setTimeout(updatePageCounter, 400);
    } else if (clickX < width * 0.3) {
      freshVp.scrollBy({ left: -width * 0.85, behavior: "smooth" });
      setTimeout(updatePageCounter, 400);
    } else {
      toggleReaderDrawer();
    }
  });

  setupDoubleTap(freshVp);
  scheduleProgressBarUpdate();
}

/* ------------------------------------------
   SCROLL PROGRESS BAR (rAF)
   ------------------------------------------ */
function scheduleProgressBarUpdate() {
  if (_progressRafId) return;
  _progressRafId = requestAnimationFrame(updateProgressBar);
}

function updateProgressBar() {
  _progressRafId = null;
  var vp = document.getElementById("reader-viewport");
  var bar = document.getElementById("reader-progress-bar");
  if (!vp || !bar || readerPrefs.flow === "paginated") {
    if (bar) bar.style.width = "0%";
    return;
  }

  var scrollable = vp.scrollHeight - vp.clientHeight;
  var pct = scrollable > 0 ? Math.min(100, (vp.scrollTop / scrollable) * 100) : 0;

  if (Math.abs(pct - _lastScrollProgress) > 0.2) {
    bar.style.width = pct.toFixed(1) + "%";
    _lastScrollProgress = pct;
  }
}

/* ------------------------------------------
   PAGE COUNTER
   ------------------------------------------ */
function updatePageCounter() {
  var vp = document.getElementById("reader-viewport");
  var counter = document.getElementById("reader-page-counter");
  if (!vp || !counter) return;

  if (readerPrefs.flow !== "paginated") {
    counter.style.display = "none";
    return;
  }

  var pageWidth = vp.clientWidth;
  if (pageWidth === 0) return;

  var currentPage = Math.round(vp.scrollLeft / pageWidth) + 1;
  var totalPages = Math.ceil(vp.scrollWidth / pageWidth);

  counter.style.display = "inline";
  counter.textContent = currentPage + " / " + totalPages;
}

/* ------------------------------------------
   CHAPTER END BANNER
   ------------------------------------------ */
function checkChapterEndVisibility() {
  if (readerPrefs.flow === "paginated") return;

  var vp = document.getElementById("reader-viewport");
  var banner = document.getElementById("reader-chapter-end-banner");
  if (!vp || !banner) return;

  var scrollable = vp.scrollHeight - vp.clientHeight;
  var pct = scrollable > 0 ? vp.scrollTop / scrollable : 0;

  if (pct >= 0.9) {
    banner.style.display = "flex";
  }
}

/* ------------------------------------------
   READER NEXT CHAPTER
   ------------------------------------------ */
function readerNextChapter() {
  if (typeof CHAPTERS === "undefined") return;
  var ch = CHAPTERS[activeReaderChapterIdx];
  if (!ch) return;

  var filteredChapters = CHAPTERS.filter(function(c) { return c.subject === (ch.subject || "ca"); });
  var currentIdx = filteredChapters.indexOf(ch);

  if (currentIdx !== -1 && currentIdx < filteredChapters.length - 1) {
    var nextCh = filteredChapters[currentIdx + 1];
    var globalIdx = CHAPTERS.indexOf(nextCh);
    closeReadingMode();
    setTimeout(function() {
      if (typeof selectChapter === "function") selectChapter(globalIdx);
      openReadingMode(globalIdx);
    }, 150);
  }
}

/* ------------------------------------------
   DOUBLE TAP — IMMERSIVE MODE
   ------------------------------------------ */
function setupDoubleTap(viewport) {
  viewport.addEventListener("touchend", function(e) {
    if (e.target.closest("button, a, input, select, .reader-top-bar, .reader-drawer-overlay")) return;
    var now = Date.now();
    if (now - _lastTapTime < 300) {
      toggleImmersiveMode();
      e.preventDefault();
    }
    _lastTapTime = now;
  }, { passive: false });
}

function toggleImmersiveMode() {
  _immersiveMode = !_immersiveMode;
  var topBar = document.querySelector(".reader-top-bar");
  var progressBar = document.getElementById("reader-progress-bar");

  if (topBar) {
    topBar.style.transition = "opacity 200ms ease, transform 200ms ease";
    topBar.style.opacity = _immersiveMode ? "0" : "1";
    topBar.style.pointerEvents = _immersiveMode ? "none" : "auto";
    topBar.style.transform = _immersiveMode ? "translateY(-100%)" : "translateY(0)";
  }
  if (progressBar) {
    progressBar.style.top = _immersiveMode ? "0" : "54px";
  }
}

/* ------------------------------------------
   KEYBOARD NAVIGATION (Desktop)
   ------------------------------------------ */
document.addEventListener("keydown", function(e) {
  var modal = document.getElementById("reading-mode-modal");
  if (!modal || !modal.classList.contains("active")) return;

  var vp = document.getElementById("reader-viewport");
  if (!vp) return;

  if (e.key === "ArrowRight" || (readerPrefs.flow === "paginated" && e.key === " ")) {
    if (readerPrefs.flow === "paginated") {
      e.preventDefault();
      vp.scrollBy({ left: vp.clientWidth * 0.85, behavior: "smooth" });
      setTimeout(updatePageCounter, 400);
    }
  } else if (e.key === "ArrowLeft") {
    if (readerPrefs.flow === "paginated") {
      e.preventDefault();
      vp.scrollBy({ left: -vp.clientWidth * 0.85, behavior: "smooth" });
      setTimeout(updatePageCounter, 400);
    }
  } else if (e.key === "PageDown" || (readerPrefs.flow === "scroll" && e.key === " ")) {
    e.preventDefault();
    if (readerPrefs.flow === "paginated") {
      vp.scrollBy({ left: vp.clientWidth * 0.85, behavior: "smooth" });
    } else {
      vp.scrollBy({ top: vp.clientHeight * 0.85, behavior: "smooth" });
    }
  } else if (e.key === "PageUp") {
    e.preventDefault();
    if (readerPrefs.flow === "paginated") {
      vp.scrollBy({ left: -vp.clientWidth * 0.85, behavior: "smooth" });
    } else {
      vp.scrollBy({ top: -vp.clientHeight * 0.85, behavior: "smooth" });
    }
  } else if (e.key === "Escape") {
    closeReadingMode();
  }
});

/* ------------------------------------------
   DRAWER TOGGLE
   ------------------------------------------ */
function toggleReaderDrawer(open) {
  var overlay = document.getElementById("reader-drawer-overlay");
  if (!overlay) return;

  if (typeof open === "boolean") {
    if (open) overlay.classList.add("active");
    else overlay.classList.remove("active");
  } else {
    overlay.classList.toggle("active");
  }
}

function handleDrawerOverlayClick(e) {
  if (e.target.id === "reader-drawer-overlay") toggleReaderDrawer(false);
}

/* ------------------------------------------
   THEME (direct colors, no CSS filter)
   ------------------------------------------ */
function selectThemeAndClose(theme) {
  userHasOverriddenTheme = true;
  applyReaderTheme(theme);
  readerPrefs.theme = theme;
  saveReaderPrefs();
  setTimeout(function() { toggleReaderDrawer(false); }, 220);
}

function applyReaderTheme(theme) {
  var modal = document.getElementById("reading-mode-modal");
  if (!modal) return;

  modal.classList.remove("theme-paper", "theme-sepia", "theme-dark");
  modal.classList.add("theme-" + theme);

  document.querySelectorAll(".theme-option-card").forEach(function(c) { c.classList.remove("active"); });
  var activeCard = document.getElementById("theme-card-" + theme);
  if (activeCard) activeCard.classList.add("active");
}

osDarkQuery.addEventListener("change", function(e) {
  var modal = document.getElementById("reading-mode-modal");
  if (!modal || !modal.classList.contains("active")) return;
  if (userHasOverriddenTheme) return;

  var autoTheme = e.matches ? "dark" : "sepia";
  applyReaderTheme(autoTheme);
  readerPrefs.theme = autoTheme;
  saveReaderPrefs();
});

/* ------------------------------------------
   FONT FAMILY
   ------------------------------------------ */
function selectFontFamilyAndClose(family) {
  applyFontFamily(family);
  readerPrefs.fontFamily = family;
  saveReaderPrefs();
  updateFontFamilyButtons(family);
  setTimeout(function() { toggleReaderDrawer(false); }, 220);
}

function applyFontFamily(family) {
  var modal = document.getElementById("reading-mode-modal");
  if (!modal) return;
  modal.classList.remove("reader-font-sans", "reader-font-serif");
  modal.classList.add("reader-font-" + family);
}

function updateFontFamilyButtons(family) {
  ["sans", "serif"].forEach(function(f) {
    var btn = document.getElementById("font-btn-" + f);
    if (btn) btn.classList.toggle("active", f === family);
  });
}

/* ------------------------------------------
   LINE HEIGHT PRESETS
   ------------------------------------------ */
function selectLineHeightAndClose(preset) {
  applyLineHeight(preset);
  readerPrefs.lineHeight = preset;
  saveReaderPrefs();
  updateLineHeightButtons(preset);
  setTimeout(function() { toggleReaderDrawer(false); }, 220);
}

function applyLineHeight(preset) {
  var modal = document.getElementById("reading-mode-modal");
  if (!modal) return;
  modal.classList.remove("reader-lh-compact", "reader-lh-comfortable", "reader-lh-relaxed");
  modal.classList.add("reader-lh-" + preset);
}

function updateLineHeightButtons(preset) {
  ["compact", "comfortable", "relaxed"].forEach(function(p) {
    var btn = document.getElementById("lh-btn-" + p);
    if (btn) btn.classList.toggle("active", p === preset);
  });
}

/* ------------------------------------------
   FONT SIZE
   ------------------------------------------ */
function changeReaderFontSize(delta) {
  readerPrefs.fontSize = Math.min(Math.max(readerPrefs.fontSize + delta, 0.9), 1.6);
  var bodyEl = document.getElementById("reader-content-body");
  if (bodyEl) bodyEl.style.fontSize = readerPrefs.fontSize + "rem";
  updateFontSizeIndicator();
  saveReaderPrefs();
  requestAnimationFrame(scaleReaderMath);
}

function updateFontSizeIndicator() {
  var indicator = document.getElementById("font-size-indicator");
  if (indicator) {
    var pct = Math.round((readerPrefs.fontSize / 1.1) * 100);
    indicator.innerText = pct + "%";
  }
}

/* ------------------------------------------
   FLOW MODE
   ------------------------------------------ */
function selectFlowAndClose(flowMode) {
  toggleReaderFlow(flowMode);
  readerPrefs.flow = flowMode;
  saveReaderPrefs();
  setTimeout(function() { toggleReaderDrawer(false); }, 220);
}

function toggleReaderFlow(flowMode) {
  readerPrefs.flow = flowMode;
  var viewport = document.getElementById("reader-viewport");
  if (!viewport) return;

  var btnScroll = document.getElementById("flow-btn-scroll");
  var btnPaginated = document.getElementById("flow-btn-paginated");
  var bar = document.getElementById("reader-progress-bar");
  var counter = document.getElementById("reader-page-counter");

  if (flowMode === "paginated") {
    viewport.classList.remove("flow-scroll");
    viewport.classList.add("flow-paginated");
    viewport.scrollLeft = 0;
    if (btnScroll) btnScroll.classList.remove("active");
    if (btnPaginated) btnPaginated.classList.add("active");
    if (bar) bar.style.width = "0%";
    if (counter) counter.style.display = "inline";
    setTimeout(updatePageCounter, 200);
  } else {
    viewport.classList.remove("flow-paginated");
    viewport.classList.add("flow-scroll");
    if (btnScroll) btnScroll.classList.add("active");
    if (btnPaginated) btnPaginated.classList.remove("active");
    if (counter) counter.style.display = "none";
    scheduleProgressBarUpdate();
  }
}

/* ------------------------------------------
   KATEX SCALING
   ------------------------------------------ */
function scaleReaderMath() {
  var bodyEl = document.getElementById("reader-content-body");
  if (!bodyEl) return;

  var containerWidth = bodyEl.clientWidth;
  if (!containerWidth) return;

  bodyEl.querySelectorAll(".katex-display").forEach(function(display) {
    var inner = display.querySelector(".katex-html") || display.querySelector(".katex");
    if (!inner) return;

    inner.style.fontSize = "";
    inner.style.transform = "";
    display.style.overflowX = "";

    var naturalWidth = inner.scrollWidth;
    var available = containerWidth - 8;

    if (naturalWidth > available && available > 0) {
      var ratio = Math.max(0.45, available / naturalWidth);
      inner.style.fontSize = ratio + "em";
      display.style.overflowX = "hidden";
    }
  });
}

/* ------------------------------------------
   WAKE LOCK
   ------------------------------------------ */
async function requestWakeLock() {
  if (!("wakeLock" in navigator)) {
    updateWakeLockBadge(false);
    return;
  }
  try {
    readerWakeLockSentinel = await navigator.wakeLock.request("screen");
    updateWakeLockBadge(true);
    readerWakeLockSentinel.addEventListener("release", function() { updateWakeLockBadge(false); });
  } catch (err) {
    console.error("Wake Lock error: " + err.name + ", " + err.message);
    updateWakeLockBadge(false);
  }
}

async function releaseWakeLock() {
  if (readerWakeLockSentinel !== null) {
    try {
      await readerWakeLockSentinel.release();
      readerWakeLockSentinel = null;
    } catch (e) {
      console.warn("Error releasing wake lock:", e);
    }
  }
  updateWakeLockBadge(false);
}

function updateWakeLockBadge(active) {
  var badge = document.getElementById("wake-lock-badge");
  if (!badge) return;
  if (active) {
    badge.className = "wake-lock-badge";
    badge.innerHTML = '<i class="fa-solid fa-sun"></i> Screen Awake Lock Active';
  } else {
    badge.className = "wake-lock-badge inactive";
    badge.innerHTML = '<i class="fa-solid fa-moon"></i> Normal Dim';
  }
}

document.addEventListener("visibilitychange", async function() {
  var modal = document.getElementById("reading-mode-modal");
  if (document.visibilityState === "visible" && modal && modal.classList.contains("active")) {
    await requestWakeLock();
  }
});
