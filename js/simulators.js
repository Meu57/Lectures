/* ==========================================
   INTERACTIVE LAB SIMULATORS & DRIVERS
   ========================================== */

/* WORK IN PROGRESS SCREEN RENDERER */
function renderWipScreen(container, title) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3rem; text-align:center; background-color:#0b0f19; border-radius:12px; border:1px solid #1e293b; color:#cbd5e1; width:100%; min-height:350px; gap:1.5rem;">
      <div style="font-size:3.5rem; animation: pulse 2s infinite; color:#38bdf8;">
        <i class="fa-solid fa-screwdriver-wrench"></i>
      </div>
      <div>
        <h3 style="font-size:1.6rem; font-weight:700; color:#f8fafc; margin-bottom:0.75rem; letter-spacing:0.05em;">WORK IN PROGRESS</h3>
        <p style="font-size:0.95rem; color:#94a3b8; max-width:420px; margin:0 auto; line-height:1.6;">
          The interactive laboratory simulation for <strong>${title}</strong> is currently under academic design and will be available soon.
        </p>
      </div>
      <div style="display:inline-block; padding:0.4rem 1rem; background-color:#1e293b; border-radius:20px; font-size:0.8rem; font-weight:600; color:#38bdf8; border:1px solid #334155;">
        Educational Content is Fully Active
      </div>
    </div>
  `;
  if (typeof updateObservations === "function") {
    updateObservations([
      "✔ Educational theory content loaded successfully.",
      "⚠ Interactive simulator state: WORK IN PROGRESS. Under development."
    ]);
  }
  const hw = document.getElementById("hardware-text");
  if (hw) hw.innerText = "This simulation is currently under development to align with core syllabus requirements.";
}

/* 1. LAB BIT & TRANSISTOR VOLTAGE SIMULATOR */
function setupLabBit(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:1.5rem; width:100%;">
      <svg class="circuit-svg" viewBox="0 0 420 200" style="background-color:#0b0f19; border-radius:8px;">
        <text x="10" y="20" fill="#94a3b8" font-size="10" font-weight="700">MACRO CIRCUIT VIEW</text>
        <rect x="15" y="80" width="30" height="40" fill="#1e293b" stroke="#60a5fa" stroke-width="2" rx="4"/>
        <text x="30" y="105" fill="#60a5fa" font-size="10" font-weight="700" text-anchor="middle">5V</text>
        <path d="M 45 100 L 95 100" stroke="#475569" stroke-width="3" id="wire-1"/>
        <path d="M 95 100 L 115 70" stroke="#475569" stroke-width="3" id="wire-switch"/>
        <path d="M 135 100 L 185 100" stroke="#475569" stroke-width="3" id="wire-2"/>
        <path d="M 45 100 L 185 100" stroke="#a78bfa" stroke-width="3" stroke-dasharray="6,6" id="electron-dash" class="electron-flow" style="display:none;"/>
        <rect x="185" y="85" width="30" height="30" fill="#1e293b" stroke="#94a3b8" stroke-width="2" rx="4"/>
        <circle cx="200" cy="100" r="12" fill="#475569" id="bulb-globe"/>
        <circle cx="200" cy="100" r="18" fill="#fef08a" class="bulb-glow-circle" id="bulb-glow" style="display:none;"/>
        <text x="200" y="130" fill="#94a3b8" font-size="9" text-anchor="middle">Bulb</text>
        <line x1="230" y1="10" x2="230" y2="190" stroke="#334155" stroke-dasharray="4,4"/>
        <text x="245" y="20" fill="#38bdf8" font-size="10" font-weight="700">TRANSISTOR ZOOM (NPN)</text>
        <rect x="245" y="60" width="160" height="100" fill="#1e293b" stroke="#334155" stroke-width="2" rx="4"/>
        <text x="325" y="150" fill="#475569" font-size="10" font-weight="700" text-anchor="middle">P-Substrate</text>
        <rect x="255" y="60" width="40" height="40" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.5" rx="2"/>
        <text x="275" y="85" fill="#60a5fa" font-size="9" text-anchor="middle">N+ Source</text>
        <rect x="355" y="60" width="40" height="40" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.5" rx="2"/>
        <text x="375" y="85" fill="#60a5fa" font-size="9" text-anchor="middle">N+ Drain</text>
        <rect x="300" y="55" width="50" height="5" fill="#e2e8f0"/>
        <rect x="300" y="45" width="50" height="10" fill="#f59e0b" id="metal-gate-c"/>
        <text x="325" y="38" fill="#f59e0b" font-size="9" text-anchor="middle" font-weight="700" id="gate-v-lbl">0V</text>
        <rect x="295" y="60" width="60" height="40" fill="#ef4444" opacity="0.6" id="depletion-layer" rx="2"/>
        <text x="325" y="85" fill="#fca5a5" font-size="9" font-weight="700" text-anchor="middle" id="barrier-text">Barrier [0]</text>
        <g id="silicon-electrons" style="display:none;">
          <line x1="295" y1="80" x2="355" y2="80" stroke="#34d399" stroke-width="4" stroke-dasharray="4,4" class="electron-flow"/>
        </g>
      </svg>
      <div style="display:flex; gap:2rem; align-items:center; flex-wrap:wrap; justify-content:center;">
        <div class="switch-ui">
          <span style="font-size:0.8rem; font-weight:700; color:#94a3b8;">GATE CONTROL SWITCH</span>
          <label class="toggle-switch">
            <input type="checkbox" id="switch-l1" onchange="runLab1Simulation()">
            <span class="slider"></span>
          </label>
        </div>
        <div class="switch-ui">
          <span style="font-size:0.8rem; font-weight:700; color:#94a3b8;">VOLATILE POWER BUS</span>
          <label class="toggle-switch">
            <input type="checkbox" id="power-l1" checked onchange="runLab1Simulation()">
            <span class="slider"></span>
          </label>
        </div>
        <div style="background-color:#1e293b; padding:1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.1); min-width:120px; text-align:center;">
          <span style="font-size:0.75rem; color:#94a3b8; display:block;">LATCHED STATE</span>
          <strong style="font-size:2rem; color:#34d399;" id="bit-state-l1">0</strong>
        </div>
      </div>
      <div class="interaction-explainer" id="lab-bit-explainer"></div>
    </div>
  `;

  window.runLab1Simulation = function() {
    const swEl = document.getElementById("switch-l1");
    const powEl = document.getElementById("power-l1");
    if (!swEl || !powEl) return;

    const sw = swEl.checked;
    const power = powEl.checked;
    const bulb = document.getElementById("bulb-globe");
    const glow = document.getElementById("bulb-glow");
    const eDash = document.getElementById("electron-dash");
    const swLine = document.getElementById("wire-switch");
    const bit = document.getElementById("bit-state-l1");
    const explainer = document.getElementById("lab-bit-explainer");
    
    const gateV = document.getElementById("gate-v-lbl");
    const metalGate = document.getElementById("metal-gate-c");
    const barrier = document.getElementById("depletion-layer");
    const barrierTxt = document.getElementById("barrier-text");
    const silElectrons = document.getElementById("silicon-electrons");
    
    if (sw) {
      swLine.setAttribute("d", "M 95 100 L 135 100");
    } else {
      swLine.setAttribute("d", "M 95 100 L 115 70");
    }

    if (sw && power) {
      glow.style.display = "block";
      bulb.setAttribute("fill", "#fef08a");
      eDash.style.display = "block";
      bit.innerText = "1";
      
      gateV.innerText = "5V";
      gateV.setAttribute("fill", "#34d399");
      metalGate.setAttribute("fill", "#34d399");
      barrier.setAttribute("opacity", "0");
      barrierTxt.innerText = "Channel [1]";
      barrierTxt.setAttribute("fill", "#34d399");
      silElectrons.style.display = "block";
      
      explainer.innerHTML = `
        <h6>⚡ Saturation Mode (Logic 1 State)</h6>
        <p>Gate switch <strong>ON</strong>: 5V potential P-substrate depletion barrier ko collapse karta hai aur N-channel conductivity path kholta hai. Current free-flow logic <strong>1</strong> memory state lock karta hai.</p>
      `;
      if (typeof updateObservations === "function") {
        updateObservations([
          "✔ Gate switch ON applied 5V potential voltage.",
          "✔ Microscopic silicon depletion barrier collapsed.",
          "✔ Active current flows: Latch bit locked to logic 1."
        ]);
      }
    } else {
      glow.style.display = "none";
      bulb.setAttribute("fill", "#475569");
      eDash.style.display = "none";
      bit.innerText = "0";
      
      gateV.innerText = "0V";
      gateV.setAttribute("fill", "#f59e0b");
      metalGate.setAttribute("fill", "#f59e0b");
      barrier.setAttribute("opacity", "0.6");
      barrierTxt.innerText = "Barrier [0]";
      barrierTxt.setAttribute("fill", "#fca5a5");
      silElectrons.style.display = "none";
      
      if (!power) {
        explainer.innerHTML = `
          <h6>🔋 Chip Power Loss (Ground State)</h6>
          <p>System voltage cut-off hone se semiconductor channel collapse drop ho jata hai aur stored bit <strong>0</strong> state mein lock ho jata hai.</p>
        `;
        if (typeof updateObservations === "function") {
          updateObservations([
            "⚠ Latch chip supply voltage cut off (0V).",
            "✔ State feedback collapsed. Stored value ground to 0."
          ]);
        }
      } else {
        explainer.innerHTML = `
          <h6>🔌 Cutoff Mode (Logic 0 State)</h6>
          <p>Gate switch <strong>OFF</strong>: 0V potential barrier form karta hai, current flow interrupt ho kar state <strong>0</strong> hold karti hai.</p>
        `;
        if (typeof updateObservations === "function") {
          updateObservations([
            "✔ Gate switch OFF applied 0V potential voltage.",
            "✔ Depletion barrier formed blocking conductivity channel.",
            "✔ No current flows: Latch bit locked to logic 0."
          ]);
        }
      }
    }
  };
  window.runLab1Simulation();
}

/* 2. LAB LATCH SIMULATOR */
function setupLabLatch(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:1rem; width:100%;">
      <svg class="gate-diagram-svg" viewBox="0 0 400 180" style="background-color:#0b0f19; border-radius:8px;">
        <rect x="150" y="20" width="80" height="40" fill="#334155" stroke="#8a2be2" stroke-width="2" rx="4" id="nd-gate1"/>
        <text x="190" y="45" fill="#fff" font-size="12" font-weight="700" text-anchor="middle">NAND 1</text>
        <rect x="150" y="110" width="80" height="40" fill="#334155" stroke="#8a2be2" stroke-width="2" rx="4" id="nd-gate2"/>
        <text x="190" y="135" fill="#fff" font-size="12" font-weight="700" text-anchor="middle">NAND 2</text>
        <path d="M 80 30 L 150 30" class="nand-path" id="nand-path-s" stroke="#475569" stroke-width="3"/>
        <path d="M 80 140 L 150 140" class="nand-path" id="nand-path-r" stroke="#475569" stroke-width="3"/>
        <path d="M 230 40 L 320 40" class="nand-path" id="nand-path-q" stroke="#475569" stroke-width="3"/>
        <path d="M 230 130 L 320 130" class="nand-path" id="nand-path-qb" stroke="#475569" stroke-width="3"/>
        <path d="M 270 40 L 270 80 L 110 80 L 110 120 L 150 120" class="nand-path" id="nand-path-fb1" stroke="#475569" stroke-width="2" fill="none"/>
        <path d="M 280 130 L 280 90 L 120 90 L 120 50 L 150 50" class="nand-path" id="nand-path-fb2" stroke="#475569" stroke-width="2" fill="none"/>
        <text x="70" y="35" fill="#a78bfa" font-size="12" font-weight="700">S</text>
        <text x="70" y="145" fill="#a78bfa" font-size="12" font-weight="700">R</text>
        <text x="335" y="45" fill="#34d399" font-size="14" font-weight="700" id="latch-lbl-q">Q = 0</text>
        <text x="335" y="135" fill="#f87171" font-size="14" font-weight="700" id="latch-lbl-qb">Q' = 1</text>
      </svg>
      <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; justify-content:center;">
        <button class="prediction-btn" onclick="toggleInputS()">Toggle S</button>
        <button class="prediction-btn" onclick="toggleInputR()">Toggle R</button>
        <button class="btn-action-lab" onclick="triggerClockPulse()" style="margin:0;"><i class="fa-solid fa-clock"></i> Pulse CLK</button>
        <button class="prediction-btn" id="latch-slow-btn" onclick="toggleLatchSlowMo()" style="background-color:#475569;">Slow-Mo: OFF</button>
        <button class="prediction-btn" id="latch-pow-btn" onclick="toggleLatchPower()" style="background-color:#7f1d1d;">Power: ON</button>
      </div>
      <div class="interaction-explainer" id="lab-latch-explainer"></div>
    </div>
  `;

  let S = 0; let R = 1; let Q = 0; let Qb = 1;
  let pow = true; let slowMo = false;
  const delay = ms => new Promise(res => setTimeout(res, ms));

  window.toggleLatchSlowMo = function() {
    slowMo = !slowMo;
    const btn = document.getElementById("latch-slow-btn");
    if (btn) {
      btn.innerText = slowMo ? "Slow-Mo: ON" : "Slow-Mo: OFF";
      btn.style.backgroundColor = slowMo ? "#8a2be2" : "#475569";
    }
  };

  window.toggleInputS = function() {
    if (!pow) return;
    S = S === 0 ? 1 : 0;
    updateLatchUI();
  };

  window.toggleInputR = function() {
    if (!pow) return;
    R = R === 0 ? 1 : 0;
    updateLatchUI();
  };

  window.triggerClockPulse = async function() {
    if (!pow) return;
    const delayTime = slowMo ? 650 : 50;
    const explainer = document.getElementById("lab-latch-explainer");
    if (explainer) {
      explainer.innerHTML = `
        <h6>🔒 Signal Propagation: CLK Triggered</h6>
        <p>Clock pulse line High. Signals logic wires ke path par propagate kar rahe hain...</p>
      `;
    }
    
    document.getElementById("nand-path-s").style.stroke = S ? "#8a2be2" : "#475569";
    document.getElementById("nand-path-r").style.stroke = R ? "#8a2be2" : "#475569";
    await delay(delayTime);
    
    let nextQ = Q; let nextQb = Qb;
    if (S === 1 && R === 0) { nextQ = 1; nextQb = 0; }
    else if (S === 0 && R === 1) { nextQ = 0; nextQb = 1; }
    
    Q = nextQ; Qb = nextQb;
    updateLatchUI();
  };

  window.toggleLatchPower = function() {
    pow = !pow;
    const btn = document.getElementById("latch-pow-btn");
    if (btn) {
      btn.innerText = pow ? "Power: ON" : "Power: OFF";
      btn.style.backgroundColor = pow ? "#7f1d1d" : "#475569";
    }
    if (!pow) { Q = 0; Qb = 0; S = 0; R = 0; }
    updateLatchUI();
  };

  function updateLatchUI() {
    const qLbl = document.getElementById("latch-lbl-q");
    const qbLbl = document.getElementById("latch-lbl-qb");
    if (qLbl) qLbl.innerText = `Q = ${Q}`;
    if (qbLbl) qbLbl.innerText = `Q' = ${Qb}`;
    const explainer = document.getElementById("lab-latch-explainer");
    if (explainer) {
      explainer.innerHTML = `
        <h6>🔒 Circuit Status: Active Latch [S=${S}, R=${R}]</h6>
        <p>Memory State: <strong>Q = ${Q}</strong>, <strong>Q' = ${Qb}</strong>.</p>
      `;
    }
  }
  updateLatchUI();
}

/* 3. LAB COMBINATIONS GRID SIMULATOR */
function setupLabComb(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:1.5rem; width:100%;">
      <span style="font-size:0.8rem; font-weight:700; color:#38bdf8;">16-STATE SPACE GRID MAP</span>
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:0.5rem; width:100%; max-width:320px;" id="comb-matrix-grid"></div>
      <div style="display:flex; gap:1rem; flex-wrap:wrap; justify-content:center;">
        <div class="switch-ui"><span>BIT 3</span><label class="toggle-switch"><input type="checkbox" id="cb-3" onchange="calcComb()"><span class="slider"></span></label></div>
        <div class="switch-ui"><span>BIT 2</span><label class="toggle-switch"><input type="checkbox" id="cb-2" onchange="calcComb()"><span class="slider"></span></label></div>
        <div class="switch-ui"><span>BIT 1</span><label class="toggle-switch"><input type="checkbox" id="cb-1" onchange="calcComb()"><span class="slider"></span></label></div>
        <div class="switch-ui"><span>BIT 0</span><label class="toggle-switch"><input type="checkbox" id="cb-0" onchange="calcComb()"><span class="slider"></span></label></div>
      </div>
      <div style="display:flex; gap:1rem; width:100%; justify-content:space-around; flex-wrap:wrap;">
        <div style="background-color:#1e293b; padding:0.75rem; border-radius:8px; text-align:center;"><span style="font-size:0.7rem; color:#94a3b8;">BINARY</span><strong style="font-size:1.2rem; color:#60a5fa;" id="comb-bin">0000</strong></div>
        <div style="background-color:#1e293b; padding:0.75rem; border-radius:8px; text-align:center;"><span style="font-size:0.7rem; color:#94a3b8;">DECIMAL</span><strong style="font-size:1.2rem; color:#34d399;" id="comb-dec">0</strong></div>
        <div style="background-color:#1e293b; padding:0.75rem; border-radius:8px; text-align:center;"><span style="font-size:0.7rem; color:#94a3b8;">HEX</span><strong style="font-size:1.2rem; color:#f59e0b;" id="comb-hex">0</strong></div>
      </div>
      <div class="interaction-explainer" id="lab-comb-explainer"></div>
    </div>
  `;

  const grid = document.getElementById("comb-matrix-grid");
  grid.innerHTML = "";
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement("button");
    cell.innerText = i;
    cell.style.cssText = "background:#1e293b; border:1px solid #334155; color:#94a3b8; padding:0.4rem; border-radius:4px; font-weight:700; cursor:pointer;";
    cell.setAttribute("id", `comb-grid-cell-${i}`);
    cell.setAttribute("onclick", `selectCombCell(${i})`);
    grid.appendChild(cell);
  }

  window.selectCombCell = function(val) {
    document.getElementById("cb-3").checked = (val >> 3) & 1;
    document.getElementById("cb-2").checked = (val >> 2) & 1;
    document.getElementById("cb-1").checked = (val >> 1) & 1;
    document.getElementById("cb-0").checked = (val >> 0) & 1;
    calcComb();
  };

  window.calcComb = function() {
    const b3 = document.getElementById("cb-3").checked ? 1 : 0;
    const b2 = document.getElementById("cb-2").checked ? 1 : 0;
    const b1 = document.getElementById("cb-1").checked ? 1 : 0;
    const b0 = document.getElementById("cb-0").checked ? 1 : 0;
    const bin = `${b3}${b2}${b1}${b0}`;
    const dec = (b3 * 8) + (b2 * 4) + (b1 * 2) + b0;
    const hex = dec.toString(16).toUpperCase();

    document.getElementById("comb-bin").innerText = bin;
    document.getElementById("comb-dec").innerText = dec;
    document.getElementById("comb-hex").innerText = hex;

    for (let i = 0; i < 16; i++) {
      const cell = document.getElementById(`comb-grid-cell-${i}`);
      if (cell) {
        cell.style.background = (i === dec) ? "#8a2be2" : "#1e293b";
        cell.style.color = (i === dec) ? "#ffffff" : "#94a3b8";
      }
    }
  };
  window.calcComb();
}

/* 4. LAB BUILDER SIMULATOR */
function setupLabBuilder(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:1.5rem; width:100%;">
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; justify-content:center;">
        ${[7,6,5,4,3,2,1,0].map(i => `
          <div class="switch-ui">
            <span style="font-size:0.65rem; color:#94a3b8;">BIT ${i}</span>
            <label class="toggle-switch"><input type="checkbox" id="bb-${i}" onchange="calcBuilderHex()"><span class="slider"></span></label>
          </div>
        `).join('')}
      </div>
      <div style="display:flex; gap:2rem; justify-content:center;">
        <div><span style="font-size:0.75rem; color:#94a3b8;">BINARY BYTE</span><strong style="font-size:1.2rem; color:#60a5fa; display:block;" id="bb-lbl-bin">00000000</strong></div>
        <div><span style="font-size:0.75rem; color:#94a3b8;">HEXADECIMAL</span><strong style="font-size:1.2rem; color:#34d399; display:block;" id="bb-lbl-hex">00</strong></div>
      </div>
    </div>
  `;
  window.calcBuilderHex = function() {
    let bin = "";
    for (let i = 7; i >= 0; i--) {
      const el = document.getElementById(`bb-${i}`);
      bin += (el && el.checked) ? "1" : "0";
    }
    const dec = parseInt(bin, 2);
    const hex = dec.toString(16).toUpperCase().padStart(2, '0');
    document.getElementById("bb-lbl-bin").innerText = bin;
    document.getElementById("bb-lbl-hex").innerText = hex;
  };
  window.calcBuilderHex();
}

/* 5. LAB RIPPLE PDP-8 REGISTER PANEL SIMULATOR */
function setupLabRipple(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:1.5rem; width:100%;">
      <div style="background:#1e293b; border:3px solid #475569; padding:1rem; border-radius:12px; width:100%;">
        <div style="text-align:center; margin-bottom:0.75rem;"><strong style="color:#f8fafc; font-size:0.85rem;">DECISION REGISTER PANEL (PDP-8 TYPE)</strong></div>
        <div style="display:flex; justify-content:center; gap:0.5rem; flex-wrap:wrap;">
          ${[11,10,9,8,7,6,5,4,3,2,1,0].map(i => `
            <label class="toggle-switch"><input type="checkbox" id="ps-${i}" onchange="calcPdpRegister()"><span class="slider"></span></label>
          `).join('')}
        </div>
        <div style="display:flex; justify-content:space-around; margin-top:1rem; flex-wrap:wrap;">
          <div><span style="font-size:0.7rem; color:#94a3b8;">12-BIT BINARY</span><strong style="color:#60a5fa; display:block;" id="pdp-bin-lbl">000000000000</strong></div>
          <div><span style="font-size:0.7rem; color:#94a3b8;">OCTAL CODE</span><strong style="color:#ff8c00; display:block;" id="pdp-oct-lbl">0000</strong></div>
        </div>
      </div>
    </div>
  `;
  window.calcPdpRegister = function() {
    let binStr = "";
    for (let i = 11; i >= 0; i--) {
      const el = document.getElementById(`ps-${i}`);
      binStr += (el && el.checked) ? "1" : "0";
    }
    const octDigit3 = parseInt(binStr.substring(0, 3), 2);
    const octDigit2 = parseInt(binStr.substring(3, 6), 2);
    const octDigit1 = parseInt(binStr.substring(6, 9), 2);
    const octDigit0 = parseInt(binStr.substring(9), 2);
    document.getElementById("pdp-bin-lbl").innerText = binStr;
    document.getElementById("pdp-oct-lbl").innerText = `${octDigit3}${octDigit2}${octDigit1}${octDigit0}`;
  };
  window.calcPdpRegister();
}

/* 6. LAB SYSTEM DATAPATH TRACER SIMULATOR */
function setupLabSystem(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:1.5rem; width:100%;">
      <button class="prediction-btn" onclick="startSystemDatapathTrace()">Trace Keypress 'A' ($65 \\rightarrow 66$)</button>
      <div style="background:#070a13; border:1px solid #1e293b; padding:1.5rem; border-radius:12px; width:100%; text-align:center;">
        <span style="font-size:0.9rem; color:#38bdf8; font-weight:700;">SYSTEM BUS DATAPATH ACTIVE</span>
      </div>
    </div>
  `;
  window.startSystemDatapathTrace = function() {
    if (typeof updateObservations === "function") {
      updateObservations([
        "✔ Keyboard press 'A' registered.",
        "✔ ASCII code 65 loaded into accumulator register.",
        "✔ ALU incremented value to 66 ('B') rendered on display."
      ]);
    }
  };
}
