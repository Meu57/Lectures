/* ==========================================
   MAIN APPLICATION ROUTER & STATE MANAGER
   ========================================== */

let currentChapterIndex = 0;
let currentView = "learn"; // learn | experiment
let highContrastActive = false;
let reducedMotionActive = false;
let activeLabId = "lab-bit";
let activeSubject = "ca";
let isUpdatingHashInternally = false;
let isInitialized = false;

/* APPLICATION INITIALIZATION */
function initApp() {
  if (isInitialized) return;
  isInitialized = true;

  let savedChapter = null;
  let savedLab = null;
  let savedSubject = null;
  
  try {
    savedChapter = localStorage.getItem("activeChapterIndex");
    savedLab = localStorage.getItem("activeLabId");
    savedSubject = localStorage.getItem("activeSubject");
  } catch (e) {
    console.warn("Storage access not allowed or supported:", e);
  }

  if (savedSubject && ["ca", "daa", "dbms"].includes(savedSubject)) {
    activeSubject = savedSubject;
  } else {
    activeSubject = "ca";
  }

  // Sync selector dropdowns
  const selector = document.getElementById("subject-select");
  if (selector) selector.value = activeSubject;
  const mobileSelector = document.getElementById("mobile-subject-select");
  if (mobileSelector) mobileSelector.value = activeSubject;
  
  if (savedChapter !== null) {
    const parsed = parseInt(savedChapter, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed < CHAPTERS.length) {
      if (CHAPTERS[parsed].subject === activeSubject) {
        currentChapterIndex = parsed;
      } else {
        const firstCh = CHAPTERS.findIndex(ch => ch.subject === activeSubject);
        if (firstCh !== -1) currentChapterIndex = firstCh;
      }
    }
  } else {
    const firstCh = CHAPTERS.findIndex(ch => ch.subject === activeSubject);
    if (firstCh !== -1) currentChapterIndex = firstCh;
  }
  
  if (savedLab !== null && LABS.some(l => l.id === savedLab)) {
    activeLabId = savedLab;
  } else {
    // Show all labs if none have a subject field assigned
    const firstLab = LABS.find(l => l.subject === activeSubject) || LABS[0];
    if (firstLab) activeLabId = firstLab.id;
  }

  renderSidebarMenu();
  loadChapter(currentChapterIndex);
  setupAccessibility();

  // CRITICAL MOBILE FIX: Check URL Hash Route FIRST before applying localStorage savedView!
  // If user opens a direct URL (e.g. #lab/lab-numconv), URL Hash route MUST take precedence.
  const hasRouted = handleUrlHashRoute();
  if (!hasRouted) {
    let savedView = null;
    try {
      savedView = localStorage.getItem("activeView");
    } catch (e) {}

    let viewToSwitch = "learn";
    if (savedView === "learn" || savedView === "experiment") {
      viewToSwitch = savedView;
    }
    switchView(viewToSwitch);
    updateUrlHash(true);
  }

  // Handle browser Back/Forward navigation & URL Hash changes dynamically
  window.addEventListener("hashchange", function() {
    if (!isUpdatingHashInternally) {
      handleUrlHashRoute();
    }
  });
}

// Trigger initialization on DOMReady or Window Load (whichever happens first)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
window.onload = initApp;

/* URL HASH ROUTING & DEEP LINKING SYSTEM */
function updateUrlHash(replace = false) {
  isUpdatingHashInternally = true;
  let targetHash = "";
  if (currentView === "experiment") {
    targetHash = `#lab/${activeLabId}`;
  } else {
    const ch = CHAPTERS[currentChapterIndex];
    const chId = (ch && ch.id) ? ch.id : currentChapterIndex;
    targetHash = `#learn/${chId}`;
  }

  if (window.location.hash !== targetHash) {
    if (replace && window.history.replaceState) {
      window.history.replaceState(null, "", targetHash);
    } else {
      window.location.hash = targetHash;
    }
  }

  setTimeout(() => { isUpdatingHashInternally = false; }, 50);
}

function handleUrlHashRoute() {
  const hash = (window.location.hash || "").trim();
  if (!hash || hash === "#" || hash === "#/") return false;

  // Clean hash string: remove leading # and slashes
  const clean = hash.replace(/^#\/?/, "");
  const parts = clean.split("/").filter(Boolean);
  if (parts.length === 0) return false;

  let routeType = parts[0].toLowerCase();
  let routeParam = parts[1] ? decodeURIComponent(parts[1].trim()) : "";

  // Support single-part hash formats (e.g. #lab-numconv or #conversions-dec-bin)
  if (parts.length === 1) {
    const singleParam = parts[0];
    const directLab = LABS.find(l => l.id === singleParam);
    if (directLab) {
      routeType = "lab";
      routeParam = singleParam;
    } else {
      const directChIdx = CHAPTERS.findIndex(c => c.id === singleParam);
      if (directChIdx !== -1) {
        routeType = "learn";
        routeParam = singleParam;
      }
    }
  }

  if (routeType === "lab" || routeType === "experiment") {
    const targetLabId = routeParam || activeLabId;
    const lab = LABS.find(l => l.id === targetLabId);
    if (lab) {
      activeLabId = lab.id;
      if (lab.subject && ["ca", "daa", "dbms"].includes(lab.subject)) {
        activeSubject = lab.subject;
        const selector = document.getElementById("subject-select");
        if (selector) selector.value = activeSubject;
        const mobileSelector = document.getElementById("mobile-subject-select");
        if (mobileSelector) mobileSelector.value = activeSubject;
      }
      switchView("experiment");
      loadLab(activeLabId);
      renderSidebarMenu();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }
  } else if (routeType === "learn" || routeType === "chapter" || routeType === "module") {
    if (routeParam) {
      let idx = -1;
      const numParsed = parseInt(routeParam, 10);
      if (!isNaN(numParsed) && numParsed >= 0 && numParsed < CHAPTERS.length) {
        idx = numParsed;
      } else {
        idx = CHAPTERS.findIndex(c => c.id === routeParam);
      }

      if (idx !== -1) {
        currentChapterIndex = idx;
        const ch = CHAPTERS[idx];
        if (ch && ch.subject) {
          activeSubject = ch.subject;
          const selector = document.getElementById("subject-select");
          if (selector) selector.value = activeSubject;
          const mobileSelector = document.getElementById("mobile-subject-select");
          if (mobileSelector) mobileSelector.value = activeSubject;
        }
        switchView("learn");
        loadChapter(currentChapterIndex);
        renderSidebarMenu();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return true;
      }
    }
  }

  return false;
}

/* SUBJECT SELECTION */
function changeSubject(subject) {
  activeSubject = subject;
  try {
    localStorage.setItem("activeSubject", subject);
  } catch (e) {
    console.warn("Could not save activeSubject to storage:", e);
  }

  // Sync selector dropdowns
  const selector = document.getElementById("subject-select");
  if (selector) selector.value = subject;
  const mobileSelector = document.getElementById("mobile-subject-select");
  if (mobileSelector) mobileSelector.value = subject;

  // Select first chapter of subject
  const firstChapterIdx = CHAPTERS.findIndex(ch => ch.subject === subject);
  if (firstChapterIdx !== -1) {
    currentChapterIndex = firstChapterIdx;
    try {
      localStorage.setItem("activeChapterIndex", firstChapterIdx);
    } catch (e) {
      console.warn("Could not save activeChapterIndex to storage:", e);
    }
  }

  // Select first lab — fallback to first lab overall if none have subject field
  const firstLab = LABS.find(l => l.subject === subject) || LABS[0];
  if (firstLab) {
    activeLabId = firstLab.id;
    try {
      localStorage.setItem("activeLabId", firstLab.id);
    } catch (e) {
      console.warn("Could not save activeLabId to storage:", e);
    }
  }

  renderSidebarMenu();
  loadChapter(currentChapterIndex);
  if (currentView === "experiment") {
    loadLab(activeLabId);
  }
  updateUrlHash();
}

/* VIEW SWITCHING (LEARN VS EXPERIMENT) */
function switchView(view) {
  currentView = view;
  try {
    localStorage.setItem("activeView", view);
  } catch (e) {
    console.warn("Could not save activeView to storage:", e);
  }

  const viewL = document.getElementById("view-learn");
  const viewE = document.getElementById("view-experiment");
  const sideL = document.getElementById("sidebar-learn");
  const sideE = document.getElementById("sidebar-experiment");
  
  const btnL = document.getElementById("btn-learn");
  const btnE = document.getElementById("btn-experiment");

  if (view === "learn") {
    if (viewL) viewL.style.display = "flex";
    if (viewE) viewE.style.display = "none";
    if (sideL) sideL.style.display = "flex";
    if (sideE) sideE.style.display = "none";
    if (btnL) btnL.classList.add("active");
    if (btnE) btnE.classList.remove("active");
  } else {
    if (viewL) viewL.style.display = "none";
    if (viewE) viewE.style.display = "flex";
    if (sideL) sideL.style.display = "none";
    if (sideE) sideE.style.display = "flex";
    if (btnL) btnL.classList.remove("active");
    if (btnE) btnE.classList.add("active");
    loadLab(activeLabId);
  }

  renderSidebarMenu();
  updateUrlHash();
}

/* SIDEBAR & MOBILE DRAWER MENU RENDERER */
function renderSidebarMenu() {
  const menu = document.getElementById("learn-menu");
  if (menu) {
    menu.innerHTML = "";
    const filteredChapters = CHAPTERS.filter(ch => ch.subject === activeSubject);
    filteredChapters.forEach((ch) => {
      const globalIdx = CHAPTERS.indexOf(ch);
      const li = document.createElement("li");
      li.innerHTML = `
        <button class="menu-item ${currentView === 'learn' && globalIdx === currentChapterIndex ? 'active' : ''}" onclick="selectChapter(${globalIdx})">
          <i class="fa-solid fa-circle-check"></i> ${ch.shortLabel || ch.title.split(":")[0]}
        </button>
      `;
      menu.appendChild(li);
    });
  }

  const labMenu = document.getElementById("lab-menu");
  if (labMenu) {
    labMenu.innerHTML = "";
    // Filter labs by subject; if none have a subject field, show all labs
    let filteredLabs = LABS.filter(l => l.subject === activeSubject);
    if (filteredLabs.length === 0) filteredLabs = LABS;
    filteredLabs.forEach(lab => {
      const li = document.createElement("li");
      li.innerHTML = `
        <button class="menu-item ${currentView === 'experiment' && lab.id === activeLabId ? 'active' : ''}" onclick="selectLab('${lab.id}')" id="btn-lab-item-${lab.id}">
          <i class="fa-solid fa-flask"></i> ${lab.title}
        </button>
      `;
      labMenu.appendChild(li);
    });
  }

  // Also sync mobile drawer menu
  renderMobileDrawerMenu();
}

function renderMobileDrawerMenu() {
  const drawerList = document.getElementById("mobile-menu-list");
  if (!drawerList) return;
  drawerList.innerHTML = "";

  // 1. Chapters/Modules section
  const modHeader = document.createElement("li");
  modHeader.style.cssText = "font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin:0.5rem 0 0.35rem 0;";
  modHeader.innerHTML = "📖 Modules (Textbook)";
  drawerList.appendChild(modHeader);

  const filteredChapters = CHAPTERS.filter(ch => ch.subject === activeSubject);
  filteredChapters.forEach((ch) => {
    const globalIdx = CHAPTERS.indexOf(ch);
    const li = document.createElement("li");
    li.innerHTML = `
      <button class="menu-item ${currentView === 'learn' && globalIdx === currentChapterIndex ? 'active' : ''}" onclick="selectChapter(${globalIdx}); toggleMobileDrawer(false);">
        <i class="fa-solid fa-book"></i> ${ch.shortLabel || ch.title.split(":")[0]}
      </button>
    `;
    drawerList.appendChild(li);
  });

  // 2. Interactive Labs section
  const labHeader = document.createElement("li");
  labHeader.style.cssText = "font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin:1.25rem 0 0.35rem 0;";
  labHeader.innerHTML = "🧪 Interactive Labs";
  drawerList.appendChild(labHeader);

  let filteredLabs = LABS.filter(l => l.subject === activeSubject);
  if (filteredLabs.length === 0) filteredLabs = LABS;
  filteredLabs.forEach((lab) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <button class="menu-item ${currentView === 'experiment' && lab.id === activeLabId ? 'active' : ''}" onclick="selectLab('${lab.id}'); toggleMobileDrawer(false);">
        <i class="fa-solid fa-flask"></i> ${lab.title}
      </button>
    `;
    drawerList.appendChild(li);
  });
}

/* MOBILE DRAWER TOGGLE */
function toggleMobileDrawer(open) {
  const overlay = document.getElementById("mobile-drawer-overlay");
  if (!overlay) return;

  if (typeof open === "boolean") {
    if (open) overlay.classList.add("active");
    else overlay.classList.remove("active");
  } else {
    overlay.classList.toggle("active");
  }
}

/* CHAPTER NAVIGATION & LOADING */
function selectChapter(idx) {
  currentChapterIndex = idx;
  loadChapter(idx);
  switchView("learn");
  renderSidebarMenu();
  updateUrlHash();
}

function loadChapter(idx) {
  currentChapterIndex = idx;
  try {
    localStorage.setItem("activeChapterIndex", idx);
  } catch (e) {
    console.warn("Could not save activeChapterIndex to storage:", e);
  }

  const ch = CHAPTERS[idx];
  if (!ch) return;

  const article = document.getElementById("learn-article");
  if (!article) return;
  
  const rawMarkdown = (typeof TEXTBOOK_CONTENT !== "undefined" && TEXTBOOK_CONTENT[ch.id])
    ? TEXTBOOK_CONTENT[ch.id]
    : "### Content loading...";

  let html = (typeof marked !== "undefined" && marked.parse)
    ? marked.parse(rawMarkdown)
    : rawMarkdown;
  
  // Inject Reading Mode Launch Header Button
  let headerCta = `
    <div class="reading-mode-cta-banner">
      <span class="cta-badge">
        <i class="fa-solid fa-mobile-screen-button"></i> Mobile Reading Mode
      </span>
      <button class="btn-action-lab" onclick="openReadingMode(${idx})">
        <i class="fa-solid fa-book-open-reader"></i> Open Book View
      </button>
    </div>
  `;

  html = headerCta + html;

  if (ch.labId) {
    html += `
      <div style="margin-top: 2.5rem; margin-bottom: 1rem; padding-top: 1.5rem; padding-bottom: 0.5rem; border-top: 1px solid var(--border-color); display: flex; gap: 1rem; flex-wrap: wrap; clear: both;">
        <button class="btn-action-lab" onclick="goToLab('${ch.labId}')">
          <i class="fa-solid fa-flask"></i> Try in Lab! 🧪
        </button>
        <button class="btn-action-lab" onclick="openReadingMode(${idx})" style="background-color: var(--bg-dark);">
          <i class="fa-solid fa-book-open-reader"></i> Reading Mode 📖
        </button>
      </div>
    `;
  }

  
  article.innerHTML = html;
  
  // Update progress bar
  const progressPercent = ch.progress || 0;
  const percentEl = document.getElementById("progress-percent");
  const fillEl = document.getElementById("progress-fill");
  const skillEl = document.getElementById("progress-skill");

  if (percentEl) percentEl.innerText = `${progressPercent}%`;
  if (fillEl) fillEl.style.width = `${progressPercent}%`;
  
  if (skillEl) {
    let skillName = "Foundation";
    if (progressPercent > 40 && progressPercent <= 70) skillName = "Binary Base";
    else if (progressPercent > 70 && progressPercent <= 90) skillName = "Bases Bridge";
    else if (progressPercent > 90) skillName = "System logic";
    skillEl.innerText = skillName;
  }

  // Update navigation buttons
  const filteredChapters = CHAPTERS.filter(c => c.subject === activeSubject);
  const currentFilteredIdx = filteredChapters.indexOf(ch);
  const prevBtn = document.getElementById("btn-prev");
  const nextBtn = document.getElementById("btn-next");

  if (prevBtn) prevBtn.disabled = currentFilteredIdx === 0;
  if (nextBtn) {
    nextBtn.disabled = currentFilteredIdx === filteredChapters.length - 1;
    const isLast = currentFilteredIdx === filteredChapters.length - 1;
    nextBtn.innerHTML = isLast
      ? `<i class="fa-solid fa-flag-checkered"></i> <span class="btn-label">Finish</span>`
      : `<span class="btn-label">Next</span> <i class="fa-solid fa-arrow-right"></i>`;
  }

  // Render KaTeX markup
  setTimeout(() => {
    if (window.renderMathInElement) {
      renderMathInElement(article, {
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false}
        ],
        throwOnError: false
      });
    }
  }, 50);

  renderSidebarMenu();
}

function nextChapter() {
  const filteredChapters = CHAPTERS.filter(ch => ch.subject === activeSubject);
  const ch = CHAPTERS[currentChapterIndex];
  const currentFilteredIdx = filteredChapters.indexOf(ch);
  if (currentFilteredIdx !== -1 && currentFilteredIdx < filteredChapters.length - 1) {
    const nextCh = filteredChapters[currentFilteredIdx + 1];
    selectChapter(CHAPTERS.indexOf(nextCh));
  }
}

function prevChapter() {
  const filteredChapters = CHAPTERS.filter(ch => ch.subject === activeSubject);
  const ch = CHAPTERS[currentChapterIndex];
  const currentFilteredIdx = filteredChapters.indexOf(ch);
  if (currentFilteredIdx !== -1 && currentFilteredIdx > 0) {
    const prevCh = filteredChapters[currentFilteredIdx - 1];
    selectChapter(CHAPTERS.indexOf(prevCh));
  }
}

/* LAB SELECTION & DRIVER */
function selectLab(labId) {
  activeLabId = labId;
  try {
    localStorage.setItem("activeLabId", labId);
  } catch (e) {
    console.warn("Could not save activeLabId to storage:", e);
  }
  loadLab(labId);
  switchView("experiment");
  renderSidebarMenu();
  updateUrlHash();
}

function loadLab(labId) {
  const lab = LABS.find(l => l.id === labId);
  if (!lab) return;

  activeLabId = labId;
  const titleEl = document.getElementById("lab-title");
  const subEl = document.getElementById("lab-subtitle");
  const hwEl = document.getElementById("hardware-text");

  if (titleEl) titleEl.innerText = lab.title;
  if (subEl) subEl.innerText = lab.subtitle;
  if (hwEl) hwEl.innerText = lab.hardware;

  // Clear observation panel so previous lab's steps don't persist
  const obsList = document.getElementById("observation-list");
  if (obsList) obsList.innerHTML = "";

  const container = document.getElementById("sim-container");
  if (!container) return;

  container.innerHTML = "";

  if (lab.prediction) {
    const overlay = document.createElement("div");
    overlay.className = "prediction-overlay";
    overlay.id = "pred-overlay";
    
    let optionsHtml = "";
    lab.prediction.options.forEach((opt, idx) => {
      optionsHtml += `<button class="prediction-btn" onclick="checkPrediction(${idx})">${opt}</button>`;
    });

    overlay.innerHTML = `
      <div class="prediction-title"><i class="fa-solid fa-circle-question" style="color:#60a5fa;"></i> Prediction Step: ${lab.prediction.question}</div>
      <div class="prediction-options">${optionsHtml}</div>
    `;
    container.appendChild(overlay);

    window.checkPrediction = function(ans) {
      overlay.remove();
      const correct = ans === lab.prediction.correct;
      updateObservations([
        correct 
          ? "✔ Prediction was Correct! Aaiye ab simulation run karke verification dekhte hain."
          : "⚠ Prediction is Incorrect. Let's run simulation to discover system behavior."
      ]);
    };
  }

  lab.setup(container);
}

function updateObservations(stepsList) {
  const panel = document.getElementById("observation-list");
  if (!panel) return;
  panel.innerHTML = "";
  stepsList.forEach(step => {
    const li = document.createElement("li");
    li.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${step}</span>`;
    panel.appendChild(li);
  });
}

function goToLab(labId) {
  activeLabId = labId;
  try {
    localStorage.setItem("activeLabId", labId);
  } catch (e) {
    console.warn("Could not save activeLabId to storage:", e);
  }
  loadLab(labId);
  switchView("experiment");
  renderSidebarMenu();
  updateUrlHash();
}

function jumpToTheory() {
  const idx = CHAPTERS.findIndex(ch => ch.labId === activeLabId);
  if (idx !== -1) {
    selectChapter(idx);
  }
}

/* ACCESSIBILITY & SHORTCUTS */
function toggleContrast() {
  highContrastActive = !highContrastActive;
  document.body.classList.toggle("high-contrast", highContrastActive);
  const btn = document.getElementById("btn-contrast");
  if (btn) btn.style.color = highContrastActive ? "var(--color-math)" : "var(--text-secondary)";
}

function toggleMotion() {
  reducedMotionActive = !reducedMotionActive;
  document.body.classList.toggle("reduced-motion", reducedMotionActive);
  const btn = document.getElementById("btn-motion");
  if (btn) btn.style.color = reducedMotionActive ? "var(--color-math)" : "var(--text-secondary)";
}

function setupAccessibility() {
  document.addEventListener("keydown", function(e) {
    const modal = document.getElementById("reading-mode-modal");
    const readerActive = modal && modal.classList.contains("active");

    if (e.key === "Escape" && readerActive) {
      closeReadingMode();
    } else if (e.key === "ArrowRight" && currentView === "learn" && !readerActive) {
      nextChapter();
    } else if (e.key === "ArrowLeft" && currentView === "learn" && !readerActive) {
      prevChapter();
    }
  });
}
