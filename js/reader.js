/* ==========================================
   MOBILE-FIRST NATIVE READING MODE ENGINE
   ========================================== */

let readerWakeLockSentinel = null;
let currentReaderFontSize = 1.1; // rem
let currentReaderTheme = "sepia"; // paper | sepia | dark
let currentReaderFlow = "scroll"; // scroll | paginated
let activeReaderChapterIdx = 0;

/* OPEN READING MODE */
function openReadingMode(chapterIdx) {
  if (typeof CHAPTERS === "undefined" || !CHAPTERS[chapterIdx]) return;

  activeReaderChapterIdx = chapterIdx;
  const ch = CHAPTERS[chapterIdx];
  const modal = document.getElementById("reading-mode-modal");
  const titleEl = document.getElementById("reader-chapter-title");
  const bodyEl = document.getElementById("reader-content-body");

  if (!modal || !bodyEl) return;

  titleEl.innerText = ch.title;

  // Load raw Markdown from TEXTBOOK_CONTENT
  const rawMarkdown = (typeof TEXTBOOK_CONTENT !== "undefined" && TEXTBOOK_CONTENT[ch.id])
    ? TEXTBOOK_CONTENT[ch.id]
    : "### Content loading...";

  let html = (typeof marked !== "undefined" && marked.parse)
    ? marked.parse(rawMarkdown)
    : rawMarkdown;

  // Inject Try in Lab CTA if chapter has lab
  if (ch.labId) {
    html += `
      <div style="margin-top: 2.5rem; margin-bottom: 2rem; text-align: center;">
        <button class="btn-action-lab" onclick="closeReadingMode(); goToLab('${ch.labId}')">
          <i class="fa-solid fa-flask"></i> Try in Lab Simulator! 🧪
        </button>
      </div>
    `;
  }

  bodyEl.innerHTML = html;
  bodyEl.style.fontSize = `${currentReaderFontSize}rem`;

  // Render KaTeX Math
  setTimeout(() => {
    if (window.renderMathInElement) {
      renderMathInElement(bodyEl, {
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false}
        ],
        throwOnError: false
      });
    }
  }, 50);

  // Restore saved theme preference
  try {
    const savedTheme = localStorage.getItem("readerTheme");
    if (savedTheme) currentReaderTheme = savedTheme;
  } catch (e) {
    console.warn("Storage access warning:", e);
  }

  setReaderTheme(currentReaderTheme);
  toggleReaderFlow(currentReaderFlow);
  updateFontSizeIndicator();

  modal.classList.add("active");
  document.body.style.overflow = "hidden"; // Block background scroll

  // Acquire Screen Wake Lock to prevent mobile dimming
  requestWakeLock();
}

/* CLOSE READING MODE */
function closeReadingMode() {
  const modal = document.getElementById("reading-mode-modal");
  if (modal) modal.classList.remove("active");

  toggleReaderDrawer(false);
  document.body.style.overflow = "";

  // Release Wake Lock
  releaseWakeLock();
}

/* TOGGLE SLIDE-UP READING PREFERENCES DRAWER */
function toggleReaderDrawer(open) {
  const overlay = document.getElementById("reader-drawer-overlay");
  if (!overlay) return;

  if (typeof open === "boolean") {
    if (open) overlay.classList.add("active");
    else overlay.classList.remove("active");
  } else {
    overlay.classList.toggle("active");
  }
}

function handleDrawerOverlayClick(e) {
  if (e.target.id === "reader-drawer-overlay") {
    toggleReaderDrawer(false);
  }
}

/* SET READING THEME & AUTO-CLOSE DRAWER */
function selectThemeAndClose(theme) {
  setReaderTheme(theme);
  setTimeout(() => {
    toggleReaderDrawer(false);
  }, 220);
}

function setReaderTheme(theme) {
  currentReaderTheme = theme;
  const modal = document.getElementById("reading-mode-modal");
  if (!modal) return;

  modal.classList.remove("theme-paper", "theme-sepia", "theme-dark");
  modal.classList.add(`theme-${theme}`);

  // Highlight active theme card in drawer
  const themeCards = document.querySelectorAll(".theme-option-card");
  themeCards.forEach(c => c.classList.remove("active"));
  const activeCard = document.getElementById(`theme-card-${theme}`);
  if (activeCard) activeCard.classList.add("active");

  try {
    localStorage.setItem("readerTheme", theme);
  } catch (e) {
    console.warn("Storage access warning:", e);
  }
}

/* CHANGE FONT SIZE */
function changeReaderFontSize(delta) {
  currentReaderFontSize = Math.min(Math.max(currentReaderFontSize + delta, 0.9), 1.6);
  const bodyEl = document.getElementById("reader-content-body");
  if (bodyEl) {
    bodyEl.style.fontSize = `${currentReaderFontSize}rem`;
  }
  updateFontSizeIndicator();
}

function updateFontSizeIndicator() {
  const indicator = document.getElementById("font-size-indicator");
  if (indicator) {
    const pct = Math.round((currentReaderFontSize / 1.1) * 100);
    indicator.innerText = `${pct}%`;
  }
}

/* TOGGLE FLOW MODE (SCROLL VS BOOK PAGINATED) & AUTO-CLOSE DRAWER */
function selectFlowAndClose(flowMode) {
  toggleReaderFlow(flowMode);
  setTimeout(() => {
    toggleReaderDrawer(false);
  }, 220);
}

function toggleReaderFlow(flowMode) {
  currentReaderFlow = flowMode;
  const viewport = document.getElementById("reader-viewport");
  if (!viewport) return;

  const btnScroll = document.getElementById("flow-btn-scroll");
  const btnPaginated = document.getElementById("flow-btn-paginated");

  if (flowMode === "paginated") {
    viewport.classList.remove("flow-scroll");
    viewport.classList.add("flow-paginated");
    viewport.scrollLeft = 0; // Reset scroll position to page 1
    if (btnScroll) btnScroll.classList.remove("active");
    if (btnPaginated) btnPaginated.classList.add("active");
  } else {
    viewport.classList.remove("flow-paginated");
    viewport.classList.add("flow-scroll");
    if (btnScroll) btnScroll.classList.add("active");
    if (btnPaginated) btnPaginated.classList.remove("active");
  }
}

/* SCREEN WAKE LOCK API CONTROLLER */
async function requestWakeLock() {
  if (!("wakeLock" in navigator)) {
    console.warn("Screen Wake Lock API is not supported on this browser.");
    updateWakeLockBadge(false);
    return;
  }

  try {
    readerWakeLockSentinel = await navigator.wakeLock.request("screen");
    console.log("Screen Wake Lock acquired successfully.");
    updateWakeLockBadge(true);

    readerWakeLockSentinel.addEventListener("release", () => {
      console.log("Screen Wake Lock was released by the OS.");
      updateWakeLockBadge(false);
    });
  } catch (err) {
    console.error(`Wake Lock error: ${err.name}, ${err.message}`);
    updateWakeLockBadge(false);
  }
}

async function releaseWakeLock() {
  if (readerWakeLockSentinel !== null) {
    try {
      await readerWakeLockSentinel.release();
      readerWakeLockSentinel = null;
      console.log("Screen Wake Lock released manually.");
    } catch (e) {
      console.warn("Error releasing wake lock:", e);
    }
  }
  updateWakeLockBadge(false);
}

function updateWakeLockBadge(active) {
  const badge = document.getElementById("wake-lock-badge");
  if (!badge) return;

  if (active) {
    badge.className = "wake-lock-badge";
    badge.innerHTML = `<i class="fa-solid fa-sun"></i> Screen Awake Lock Active`;
  } else {
    badge.className = "wake-lock-badge inactive";
    badge.innerHTML = `<i class="fa-solid fa-moon"></i> Normal Dim`;
  }
}

/* RE-ACQUIRE WAKE LOCK ON TAB VISIBILITY CHANGE */
document.addEventListener("visibilitychange", async () => {
  const modal = document.getElementById("reading-mode-modal");
  if (document.visibilityState === "visible" && modal && modal.classList.contains("active")) {
    await requestWakeLock();
  }
});

/* TAP TO TURN PAGES IN BOOK VIEW & TAP CENTER TO OPEN PREFERENCES */
document.addEventListener("DOMContentLoaded", () => {
  const viewport = document.getElementById("reader-viewport");
  if (!viewport) return;

  viewport.addEventListener("click", (e) => {
    if (e.target.closest("button, a, input, select, .reader-top-bar, .reader-drawer-overlay")) return;

    const width = window.innerWidth;
    const clickX = e.clientX;

    if (currentReaderFlow === "paginated") {
      if (clickX > width * 0.7) {
        // Tap right 30% -> turn page forward
        viewport.scrollBy({ left: width * 0.85, behavior: "smooth" });
      } else if (clickX < width * 0.3) {
        // Tap left 30% -> turn page backward
        viewport.scrollBy({ left: -width * 0.85, behavior: "smooth" });
      } else {
        // Tap center -> toggle preferences drawer
        toggleReaderDrawer();
      }
    }
  });
});
