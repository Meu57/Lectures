/* ==========================================================================
   NUMBER SYSTEM CONVERSION LABORATORY — num-converter.js
   ==========================================================================

   Clean 4-layer separation of concerns:

     [1] Validation + Input Normalizer
             ↓
     [2] Algorithm Engine (10 pure functions, no UI)
             ↓ returns standardized { type, steps, result } objects
     [3] Conversion Dispatcher (lookup table, zero nested ifs)
             ↓
     [4] Renderers (3 independent) + Animation Queue (async loop)

   Standardized result schemas:
     Division:  { type:"division",  divisor, steps:[{dividend,quotient,remainder}], result }
     Grouping:  { type:"grouping",  groupSize, paddedInput, groups:[{bits,value}], result }
     Weights:   { type:"weights",   base, digits:[{digit,power,weight}], result }
     Expansion: { type:"expansion", expandSize, expansions:[{digit,bits}], result }
   ========================================================================== */

// ─── SECTION 1: CSS INJECTION ─────────────────────────────────────────────────

function injectNumConverterStyles() {
  if (document.getElementById("numconv-styles")) return;
  const style = document.createElement("style");
  style.id = "numconv-styles";
  style.textContent = `
    .numconv-lab { width:100%; font-family:'Inter','Segoe UI',sans-serif; color:#e2e8f0; }

    /* Input Panel */
    .numconv-input-panel {
      background:#1e293b; border:1px solid #334155; border-radius:16px;
      padding:1.25rem; margin-bottom:1.25rem;
    }
    .numconv-input-wrap { display:flex; margin-bottom:1rem; }
    .numconv-input {
      flex:1; background:#0f172a; border:2px solid #334155; border-radius:10px;
      padding:0.7rem 1rem; font-size:1.1rem; font-family:'Fira Code',monospace;
      font-weight:600; color:#f8fafc; outline:none; width:100%;
      transition:border-color 200ms ease; letter-spacing:0.05em;
    }
    .numconv-input:focus { border-color:#38bdf8; }
    .numconv-input::placeholder {
      color:#475569; font-weight:400; font-family:'Inter',sans-serif;
      font-size:0.88rem; letter-spacing:0;
    }
    .numconv-selectors {
      display:flex; align-items:flex-end; gap:0.5rem;
      margin-bottom:1rem; flex-wrap:wrap;
    }
    .numconv-selector-group { flex:1; min-width:130px; }
    .numconv-selector-group label {
      display:block; font-size:0.7rem; font-weight:700;
      text-transform:uppercase; letter-spacing:0.08em;
      color:#94a3b8; margin-bottom:0.3rem;
    }
    .numconv-select {
      width:100%; background:#0f172a; border:2px solid #334155; border-radius:10px;
      padding:0.55rem 0.8rem; font-size:0.88rem; font-weight:600;
      color:#e2e8f0; outline:none; cursor:pointer;
      transition:border-color 200ms ease; -webkit-appearance:none; appearance:none;
    }
    .numconv-select:focus { border-color:#38bdf8; }
    .numconv-swap-btn {
      background:#0f172a; border:2px solid #334155; border-radius:50%;
      width:38px; height:38px; display:flex; align-items:center; justify-content:center;
      font-size:1.1rem; cursor:pointer; color:#38bdf8; flex-shrink:0;
      transition:all 250ms ease;
    }
    .numconv-swap-btn:hover { background:#38bdf8; color:#0f172a; transform:rotate(180deg); }
    .numconv-convert-btn {
      width:100%; background:linear-gradient(135deg,#0ea5e9,#6366f1);
      border:none; border-radius:12px; padding:0.9rem; font-size:1rem;
      font-weight:800; color:#fff; cursor:pointer; transition:all 200ms ease;
      letter-spacing:0.03em;
    }
    .numconv-convert-btn:hover {
      transform:translateY(-2px);
      box-shadow:0 8px 25px rgba(14,165,233,0.4);
    }

    /* Error */
    .numconv-error {
      background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.4);
      border-radius:10px; padding:0.75rem 1rem; font-size:0.9rem;
      color:#fca5a5; font-weight:600; display:none; margin-bottom:1rem;
    }
    .numconv-error.visible { display:block; }

    /* Steps area */
    .numconv-steps { display:flex; flex-direction:column; gap:1rem; }

    /* Step Card */
    .nc-card {
      background:#1e293b; border:1px solid #334155; border-radius:14px;
      padding:1.15rem; opacity:0; transform:translateY(16px);
      transition:opacity 350ms ease, transform 350ms ease;
    }
    .nc-card.visible { opacity:1; transform:translateY(0); }
    .nc-card-badge {
      font-size:0.7rem; font-weight:800; text-transform:uppercase;
      letter-spacing:0.08em; color:#38bdf8; margin-bottom:0.5rem;
      display:flex; align-items:center; gap:0.4rem;
    }
    .nc-card-title { font-size:0.98rem; font-weight:700; color:#f8fafc; margin-bottom:0.25rem; }
    .nc-card-sub { font-size:0.82rem; color:#94a3b8; line-height:1.55; margin-bottom:0.85rem; }

    /* Result Banner */
    .nc-result-banner {
      background:linear-gradient(135deg,rgba(14,165,233,0.12),rgba(99,102,241,0.12));
      border:2px solid #38bdf8; border-radius:14px; padding:1.25rem; text-align:center;
    }
    .nc-result-label {
      font-size:0.72rem; font-weight:800; text-transform:uppercase;
      letter-spacing:0.1em; color:#38bdf8; margin-bottom:0.5rem;
    }
    .nc-result-value {
      font-size:1.9rem; font-weight:900; font-family:'Fira Code',monospace;
      color:#f8fafc; letter-spacing:0.08em; word-break:break-all;
    }
    .nc-result-sub { font-size:0.83rem; color:#94a3b8; font-weight:600; margin-top:0.3rem; }

    /* ── DIVISION TABLE ─────────────────────────────────────────────── */
    .div-table { width:100%; border-collapse:collapse; font-size:0.87rem; font-family:'Fira Code',monospace; }
    .div-table th {
      background:#0f172a; color:#64748b; font-size:0.7rem; font-weight:800;
      text-transform:uppercase; letter-spacing:0.06em; padding:0.45rem 0.6rem;
      text-align:center; border:1px solid #0b0f19;
    }
    .div-table td { padding:0.5rem 0.65rem; text-align:center; border:1px solid #0b0f19; color:#e2e8f0; font-weight:600; }
    .div-table tr:nth-child(odd) td { background:#0f172a; }
    .div-row { opacity:0; transition:opacity 280ms ease; }
    .div-row.visible { opacity:1; }
    .rem-lsb { color:#4ade80; font-weight:900; }
    .rem-msb { color:#f472b6; font-weight:900; }
    .div-note { font-size:0.77rem; color:#64748b; margin-top:0.6rem; text-align:center; font-style:italic; }

    /* ── GROUPING (BINARY ↔ OCT/HEX) ──────────────────────────────── */
    .padded-display {
      font-family:'Fira Code',monospace; font-size:1rem; font-weight:700;
      text-align:center; letter-spacing:0.15em; margin-bottom:0.6rem;
    }
    .pad-zero { color:#334155; text-decoration:underline dotted #475569; }
    .orig-bit { color:#e2e8f0; }
    .grouping-row { display:flex; gap:0.5rem; flex-wrap:wrap; justify-content:center; }
    .bit-group {
      display:flex; flex-direction:column; align-items:center; gap:0.3rem;
      opacity:0; transform:scale(0.82); transition:opacity 300ms ease, transform 300ms ease;
    }
    .bit-group.visible { opacity:1; transform:scale(1); }
    .bit-group-bits { display:flex; gap:2px; }
    .bit-cell {
      width:28px; height:32px; display:flex; align-items:center; justify-content:center;
      font-family:'Fira Code',monospace; font-size:0.95rem; font-weight:800;
      border-radius:6px; border:2px solid transparent;
    }
    .bit-group-value {
      font-family:'Fira Code',monospace; font-size:1.25rem; font-weight:900;
      padding:0.18rem 0.5rem; border-radius:6px; min-width:28px; text-align:center;
    }
    .bit-arrow { font-size:0.75rem; color:#475569; }

    /* Group colour palette (5 rotating) */
    .gc-0 .bit-cell { background:rgba(56,189,248,0.14); border-color:#38bdf8; color:#38bdf8; }
    .gc-0 .bit-group-value { background:rgba(56,189,248,0.14); color:#38bdf8; }
    .gc-1 .bit-cell { background:rgba(167,139,250,0.14); border-color:#a78bfa; color:#a78bfa; }
    .gc-1 .bit-group-value { background:rgba(167,139,250,0.14); color:#a78bfa; }
    .gc-2 .bit-cell { background:rgba(74,222,128,0.14); border-color:#4ade80; color:#4ade80; }
    .gc-2 .bit-group-value { background:rgba(74,222,128,0.14); color:#4ade80; }
    .gc-3 .bit-cell { background:rgba(251,191,36,0.14); border-color:#fbbf24; color:#fbbf24; }
    .gc-3 .bit-group-value { background:rgba(251,191,36,0.14); color:#fbbf24; }
    .gc-4 .bit-cell { background:rgba(248,113,113,0.14); border-color:#f87171; color:#f87171; }
    .gc-4 .bit-group-value { background:rgba(248,113,113,0.14); color:#f87171; }

    /* ── POSITIONAL WEIGHTS GRID ────────────────────────────────────── */
    .weights-grid { display:flex; gap:4px; flex-wrap:wrap; justify-content:center; margin-bottom:0.6rem; }
    .w-cell {
      display:flex; flex-direction:column; align-items:center; gap:3px;
      opacity:0; transform:translateY(8px); transition:opacity 280ms ease, transform 280ms ease;
      min-width:48px;
    }
    .w-cell.visible { opacity:1; transform:translateY(0); }
    .w-pos { font-size:0.62rem; font-weight:700; color:#475569; text-transform:uppercase; }
    .w-power { font-size:0.7rem; font-weight:600; color:#64748b; font-family:'Fira Code',monospace; }
    .w-digit {
      width:34px; height:34px; border-radius:8px; display:flex; align-items:center;
      justify-content:center; font-family:'Fira Code',monospace; font-size:1.1rem;
      font-weight:900; border:2px solid transparent;
    }
    .w-digit.hi { background:rgba(56,189,248,0.14); border-color:#38bdf8; color:#38bdf8; }
    .w-digit.lo { background:rgba(71,85,105,0.1); border-color:#334155; color:#475569; }
    .w-weight { font-size:0.82rem; font-weight:800; font-family:'Fira Code',monospace; }
    .w-weight.hi { color:#4ade80; }
    .w-weight.lo { color:#334155; }
    .weights-sum {
      text-align:center; font-size:0.9rem; color:#94a3b8;
      margin-top:0.4rem; font-family:'Fira Code',monospace;
    }
    .weights-sum .sum-val { color:#4ade80; font-weight:900; font-size:1.1rem; }

    /* ── EXPANSION (OCT/HEX → BINARY) ──────────────────────────────── */
    .exp-grid { display:flex; gap:0.75rem; flex-wrap:wrap; justify-content:center; }
    .exp-item {
      display:flex; flex-direction:column; align-items:center; gap:0.25rem;
      opacity:0; transform:translateY(8px); transition:opacity 300ms ease, transform 300ms ease;
    }
    .exp-item.visible { opacity:1; transform:translateY(0); }
    .exp-digit {
      font-family:'Fira Code',monospace; font-size:1.35rem; font-weight:900;
      padding:0.25rem 0.55rem; border-radius:8px; min-width:40px; text-align:center;
    }
    .exp-arrow { font-size:0.9rem; color:#475569; }
    .exp-bits { display:flex; gap:2px; }

    /* Division table scroll wrapper — prevents horizontal overflow on mobile */
    .div-table-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; margin:0 -0.25rem; }
    .div-table { min-width:280px; }

    /* ── MOBILE ≤ 480px ─────────────────────────────────────────────── */
    @media (max-width:480px) {
      .weights-grid { gap:3px; }
      .w-cell { min-width:40px; }
      .nc-card { padding:0.9rem; }
    }

    /* ── MOBILE ≤ 400px ─────────────────────────────────────────────── */
    @media (max-width:400px) {
      .bit-cell { width:20px; height:24px; font-size:0.78rem; }
      .bit-group-value { font-size:0.95rem; }
      .w-cell { min-width:32px; }
      .w-digit { width:26px; height:26px; font-size:0.85rem; }
      .div-table { font-size:0.72rem; min-width:240px; }
      .div-table th, .div-table td { padding:0.28rem 0.3rem; }
      .nc-result-value { font-size:1.3rem; }
      .exp-digit { font-size:0.95rem; min-width:28px; }
      .numconv-input { font-size:1rem; }
    }
  `;
  document.head.appendChild(style);
}

// ─── SECTION 2: VALIDATION ────────────────────────────────────────────────────

const VALIDATORS = {
  bin: { regex: /^[01]+$/,        label: "Binary",      allowed: "0 and 1 only" },
  dec: { regex: /^[0-9]+$/,       label: "Decimal",     allowed: "digits 0–9" },
  oct: { regex: /^[0-7]+$/,       label: "Octal",       allowed: "digits 0–7" },
  hex: { regex: /^[0-9A-Fa-f]+$/, label: "Hexadecimal", allowed: "digits 0–9 and A–F" }
};

function validateInput(raw, base) {
  if (!raw || raw.trim() === "")
    return { valid: false, message: "Please enter a number to convert." };
  const v = VALIDATORS[base];
  if (!v.regex.test(raw.trim()))
    return { valid: false, message: `⚠ Invalid ${v.label} number. Allowed characters: ${v.allowed}.` };
  return { valid: true };
}

// ─── SECTION 3: INPUT NORMALIZER ──────────────────────────────────────────────

function normalizeInput(raw, base) {
  let v = raw.trim();
  if (base === "hex") v = v.toUpperCase();     // hex always uppercase
  v = v.replace(/^0+/, "") || "0";             // strip leading zeros, keep "0"
  return v;
}

// ─── SECTION 4: ALGORITHM ENGINE ──────────────────────────────────────────────
// Pure functions — no UI calls. Each returns one standardized result object.

/* 4.1 Binary → Decimal  (positional weights, base 2) */
function convertBinaryToDecimal(bin) {
  const digs = bin.split("").reverse(); // index i = power i
  return {
    type: "weights", base: 2, baseLabel: "2",
    title: "Positional Weight Expansion",
    subtitle: "Multiply each bit by 2 raised to its position, then sum all contributions.",
    digits: digs.map((d, i) => ({ digit: d, power: i, weight: parseInt(d) * Math.pow(2, i) })).reverse(),
    result: String(digs.reduce((s, d, i) => s + parseInt(d) * Math.pow(2, i), 0)),
    resultBase: 10, resultLabel: "Decimal"
  };
}

/* 4.2 Decimal → Binary  (repeated division by 2) */
function convertDecimalToBinary(dec) {
  let n = parseInt(dec, 10);
  if (n === 0) return _divResult(2, [{ dividend:0, quotient:0, remainder:0, remHex:"0" }], "0", 2, "Binary");
  const steps = [];
  while (n > 0) { steps.push({ dividend:n, quotient:Math.floor(n/2), remainder:n%2, remHex:String(n%2) }); n = Math.floor(n/2); }
  return _divResult(2, steps, steps.map(s=>s.remainder).reverse().join(""), 2, "Binary");
}

/* 4.3 Binary → Octal  (group by 3) */
function convertBinaryToOctal(bin) {
  const pad = (3 - bin.length % 3) % 3;
  const padded = "0".repeat(pad) + bin;
  const groups = [];
  for (let i = 0; i < padded.length; i += 3) {
    const chunk = padded.slice(i, i+3);
    groups.push({ bits: chunk.split(""), value: parseInt(chunk, 2).toString(8) });
  }
  return _groupResult(3, bin, padded, pad, groups, groups.map(g=>g.value).join("").replace(/^0+/,"")||"0", 8, "Octal");
}

/* 4.4 Octal → Binary  (expansion: each digit → 3 bits) */
function convertOctalToBinary(oct) {
  const exps = oct.split("").map(d => ({ digit:d, bits:parseInt(d,8).toString(2).padStart(3,"0").split("") }));
  const raw  = exps.map(e=>e.bits.join("")).join("").replace(/^0+/,"")||"0";
  return _expResult(3, exps, raw, 2, "Binary");
}

/* 4.5 Octal → Decimal  (positional weights, base 8) */
function convertOctalToDecimal(oct) {
  const digs = oct.split("").reverse();
  return {
    type:"weights", base:8, baseLabel:"8",
    title:"Positional Weight Expansion (Base 8)",
    subtitle:"Multiply each octal digit by 8 raised to its position, then sum all contributions.",
    digits: digs.map((d,i) => ({ digit:d, power:i, weight:parseInt(d,8)*Math.pow(8,i) })).reverse(),
    result: String(digs.reduce((s,d,i) => s + parseInt(d,8)*Math.pow(8,i), 0)),
    resultBase:10, resultLabel:"Decimal"
  };
}

/* 4.6 Decimal → Octal  (repeated division by 8) */
function convertDecimalToOctal(dec) {
  let n = parseInt(dec, 10);
  if (n === 0) return _divResult(8, [{ dividend:0, quotient:0, remainder:0, remHex:"0" }], "0", 8, "Octal");
  const steps = [];
  while (n > 0) { steps.push({ dividend:n, quotient:Math.floor(n/8), remainder:n%8, remHex:String(n%8) }); n = Math.floor(n/8); }
  return _divResult(8, steps, steps.map(s=>s.remainder).reverse().join(""), 8, "Octal");
}

/* 4.7 Binary → Hex  (group by 4) */
function convertBinaryToHex(bin) {
  const pad = (4 - bin.length % 4) % 4;
  const padded = "0".repeat(pad) + bin;
  const groups = [];
  for (let i = 0; i < padded.length; i += 4) {
    const chunk = padded.slice(i, i+4);
    groups.push({ bits: chunk.split(""), value: parseInt(chunk,2).toString(16).toUpperCase() });
  }
  return _groupResult(4, bin, padded, pad, groups, groups.map(g=>g.value).join("").replace(/^0+/,"")||"0", 16, "Hexadecimal");
}

/* 4.8 Hex → Binary  (expansion: each digit → 4 bits) */
function convertHexToBinary(hex) {
  const exps = hex.toUpperCase().split("").map(d => ({ digit:d, bits:parseInt(d,16).toString(2).padStart(4,"0").split("") }));
  const raw  = exps.map(e=>e.bits.join("")).join("").replace(/^0+/,"")||"0";
  return _expResult(4, exps, raw, 2, "Binary");
}

/* 4.9 Hex → Decimal  (positional weights, base 16) */
function convertHexToDecimal(hex) {
  const digs = hex.toUpperCase().split("").reverse();
  return {
    type:"weights", base:16, baseLabel:"16",
    title:"Positional Weight Expansion (Base 16)",
    subtitle:"Multiply each hex digit by 16 raised to its position, then sum all contributions.",
    digits: digs.map((d,i) => ({ digit:d, power:i, weight:parseInt(d,16)*Math.pow(16,i) })).reverse(),
    result: String(digs.reduce((s,d,i) => s + parseInt(d,16)*Math.pow(16,i), 0)),
    resultBase:10, resultLabel:"Decimal"
  };
}

/* 4.10 Decimal → Hex  (repeated division by 16) */
function convertDecimalToHex(dec) {
  const HEX = "0123456789ABCDEF";
  let n = parseInt(dec, 10);
  if (n === 0) return _divResult(16, [{ dividend:0, quotient:0, remainder:0, remHex:"0" }], "0", 16, "Hexadecimal");
  const steps = [];
  while (n > 0) {
    const rem = n % 16;
    steps.push({ dividend:n, quotient:Math.floor(n/16), remainder:rem, remHex:HEX[rem] });
    n = Math.floor(n/16);
  }
  return _divResult(16, steps, steps.map(s=>s.remHex).reverse().join(""), 16, "Hexadecimal");
}

/* Algorithm helper factories */
function _divResult(divisor, steps, result, resultBase, resultLabel) {
  const subtitles = {
    2:"Divide by 2 repeatedly. Collect remainders. Read them bottom-to-top (bottom = MSB).",
    8:"Divide by 8 repeatedly. Collect remainders. Read them bottom-to-top (bottom = MSB).",
    16:"Divide by 16. Remainders ≥ 10 become A–F. Read them bottom-to-top."
  };
  return { type:"division", title:`Repeated Division by ${divisor}`, subtitle:subtitles[divisor], divisor, steps, result, resultBase, resultLabel };
}

function _groupResult(groupSize, originalInput, paddedInput, padBits, groups, result, resultBase, resultLabel) {
  return {
    type:"grouping",
    title:`Group Binary Bits into ${groupSize}s (${resultLabel})`,
    subtitle:`Pad left with zeros so bit count is divisible by ${groupSize}. Each group of ${groupSize} bits = one ${resultLabel} digit.`,
    groupSize, originalInput, paddedInput, padBits, groups, result, resultBase, resultLabel
  };
}

function _expResult(expandSize, expansions, result, resultBase, resultLabel) {
  return {
    type:"expansion",
    title:`Expand Each Digit to ${expandSize} Binary Bits`,
    subtitle:`Every input digit maps to a unique ${expandSize}-bit binary pattern. Concatenate left to right.`,
    expandSize, expansions, result, resultBase, resultLabel
  };
}

// ─── SECTION 5: CONVERSION DISPATCHER (lookup table) ─────────────────────────

const NUM_CONVERTERS = {
  "bin-dec": convertBinaryToDecimal,
  "dec-bin": convertDecimalToBinary,
  "bin-oct": convertBinaryToOctal,
  "oct-bin": convertOctalToBinary,
  "oct-dec": convertOctalToDecimal,
  "dec-oct": convertDecimalToOctal,
  "bin-hex": convertBinaryToHex,
  "hex-bin": convertHexToBinary,
  "hex-dec": convertHexToDecimal,
  "dec-hex": convertDecimalToHex
};

function dispatchConversion(fromBase, toBase, input) {
  if (fromBase === toBase)
    return { type:"same", result:input, resultBase:fromBase, resultLabel:fromBase.toUpperCase() };
  const fn = NUM_CONVERTERS[`${fromBase}-${toBase}`];
  return fn ? fn(input) : { type:"error", message:"Conversion not supported." };
}

// ─── SECTION 6: ANIMATION QUEUE (async, consistent delay) ────────────────────

async function animateQueue(elements, delayMs = 250) {
  for (const el of elements) {
    await new Promise(r => setTimeout(r, delayMs));
    if (el) el.classList.add("visible");
  }
}

// ─── SECTION 7: RENDERERS ─────────────────────────────────────────────────────
// Each renderer only understands its own data type. No math inside renderers.

/* 7.1 Division Renderer */
function renderDivision(data, container) {
  // Step 1 — Division table
  const card1 = makeCard(`⚙️ Step 1 — Repeated Division by ${data.divisor}`, data.title, data.subtitle);
  const hasHex = data.divisor === 16;
  card1.innerHTML += `
    <div class="div-table-scroll">
    <table class="div-table">
      <thead><tr>
        <th>Dividend</th>
        <th>÷ ${data.divisor} = Quotient</th>
        <th>Remainder</th>
        ${hasHex ? "<th>Hex Digit</th>" : ""}
      </tr></thead>
      <tbody id="div-tbody"></tbody>
    </table>
    </div>
    <div class="div-note">↑ Read remainders from bottom row (MSB) up to top row (LSB)</div>
  `;
  container.appendChild(card1);

  // Step 2 — Reading order card
  const rems = data.steps.map(s => hasHex ? s.remHex : String(s.remainder)).reverse();
  const card2 = makeCard("📖 Step 2 — Read Remainders Bottom → Top", "Collect in reverse order (bottom = Most Significant Bit)", "");
  card2.innerHTML += `
    <div class="grouping-row" style="margin-top:0.75rem; align-items:flex-end;">
      ${rems.map((r, i) => `
        <div class="bit-group gc-${i%5}">
          <div class="bit-group-value">${r}</div>
          <div class="bit-arrow" style="font-size:0.65rem;">${i===0?"MSB":i===rems.length-1?"LSB":""}</div>
        </div>
      `).join('<div style="color:#334155;align-self:center;font-size:1.1rem;padding:0 2px;">→</div>')}
    </div>
  `;
  container.appendChild(card2);

  const card3 = makeResultCard(data);
  container.appendChild(card3);

  // Animate
  setTimeout(() => card1.classList.add("visible"), 100);

  const tbody = card1.querySelector("#div-tbody");
  const rows = [];
  data.steps.forEach((step, i) => {
    const tr = document.createElement("tr");
    tr.className = "div-row";
    const isFirst = i === 0, isLast = i === data.steps.length - 1;
    const remCls = isFirst ? "rem-lsb" : isLast ? "rem-msb" : "";
    const remNote = isFirst ? " ← LSB" : isLast ? " ← MSB" : "";
    tr.innerHTML = `
      <td>${step.dividend}</td>
      <td>${step.quotient}</td>
      <td class="${remCls}">${step.remainder}${hasHex ? "" : remNote}</td>
      ${hasHex ? `<td style="font-weight:900;color:#fbbf24;">${step.remHex}${remNote}</td>` : ""}
    `;
    tbody.appendChild(tr);
    rows.push(tr);
  });

  animateQueue(rows, 200).then(() => {
    setTimeout(() => { card2.classList.add("visible"); animateQueue(card2.querySelectorAll(".bit-group"), 100); }, 300);
    setTimeout(() => card3.classList.add("visible"), 700);
  });
}

/* 7.2 Grouping Renderer */
function renderGrouping(data, container) {
  // Step 1 — Padding
  const padHtml = data.paddedInput.split("").map((bit, i) =>
    `<span class="${i < data.padBits ? "pad-zero" : "orig-bit"}">${bit}</span>`
  ).join("");

  const card1 = makeCard("🔢 Step 1 — Pad with Leading Zeros", `Make bit count divisible by ${data.groupSize}`, `Original: ${data.originalInput.length} bits → Padded: ${data.paddedInput.length} bits`);
  card1.innerHTML += `
    <div class="padded-display">${padHtml}</div>
    <div style="font-size:0.75rem;color:#475569;text-align:center;">
      <span style="border-bottom:1px dotted #334155;">Underlined zeros</span> = added padding (zero value)
    </div>
  `;
  container.appendChild(card1);

  // Step 2 — Groups
  const card2 = makeCard(`🗂️ Step 2 — Split into Groups of ${data.groupSize}`, `Each group of ${data.groupSize} bits converts to one ${data.resultLabel} digit`, "Convert each group independently");
  card2.innerHTML += `<div class="grouping-row" id="grp-display" style="margin-top:0.75rem;"></div>`;
  container.appendChild(card2);

  // Step 3 — Join
  const card3 = makeCard("🔗 Step 3 — Join Digits Left → Right", "Write each converted digit in order to form the final result", "");
  card3.innerHTML += `
    <div class="grouping-row" style="margin-top:0.75rem; align-items:center;">
      ${data.groups.map((g, i) => `
        <div class="bit-group gc-${i%5}" style="opacity:1;transform:none;">
          <div class="bit-group-value">${g.value}</div>
        </div>
        ${i < data.groups.length-1 ? '<div style="color:#334155;font-size:1.3rem;align-self:center;padding:0 3px;">|</div>' : ""}
      `).join("")}
    </div>
    <div style="text-align:center;margin-top:0.6rem;font-family:'Fira Code',monospace;font-size:0.9rem;color:#94a3b8;">
      Result: <span style="color:#4ade80;font-weight:900;">${data.result}₍${data.resultBase}₎</span>
    </div>
  `;
  container.appendChild(card3);

  const card4 = makeResultCard(data);
  container.appendChild(card4);

  // Animate
  setTimeout(() => card1.classList.add("visible"), 100);
  setTimeout(() => {
    card2.classList.add("visible");
    const display = card2.querySelector("#grp-display");
    const groupEls = [];
    data.groups.forEach((g, i) => {
      const div = document.createElement("div");
      div.className = `bit-group gc-${i%5}`;
      div.innerHTML = `
        <div class="bit-group-bits">${g.bits.map(b=>`<div class="bit-cell">${b}</div>`).join("")}</div>
        <div class="bit-arrow">↓</div>
        <div class="bit-group-value">${g.value}</div>
      `;
      display.appendChild(div);
      groupEls.push(div);
    });
    animateQueue(groupEls, 240);
  }, 500);
  setTimeout(() => card3.classList.add("visible"), 500 + data.groups.length * 240 + 300);
  setTimeout(() => card4.classList.add("visible"), 500 + data.groups.length * 240 + 700);
}

/* 7.3 Positional Weights Renderer */
function renderWeights(data, container) {
  const card1 = makeCard("⚖️ Step 1 — Assign Positional Weights", data.title, data.subtitle);
  card1.innerHTML += `
    <div class="weights-grid" id="wgrid"></div>
    <div class="weights-sum" id="wsum" style="display:none;"></div>
  `;
  container.appendChild(card1);

  const card2 = makeResultCard(data);
  container.appendChild(card2);

  setTimeout(() => {
    card1.classList.add("visible");
    const grid = card1.querySelector("#wgrid");
    const cells = [];
    data.digits.forEach(d => {
      const isHi = parseInt(d.digit, 16) !== 0;
      const cell = document.createElement("div");
      cell.className = "w-cell";
      cell.innerHTML = `
        <div class="w-pos">Pos ${d.power}</div>
        <div class="w-power">${data.baseLabel}<sup>${d.power}</sup></div>
        <div class="w-digit ${isHi?"hi":"lo"}">${d.digit}</div>
        <div class="w-weight ${isHi?"hi":"lo"}">${isHi ? d.weight : "0"}</div>
      `;
      grid.appendChild(cell);
      cells.push(cell);
    });

    animateQueue(cells, 190).then(() => {
      const sumEl = card1.querySelector("#wsum");
      const parts = data.digits.filter(d => parseInt(d.digit,16) !== 0).map(d => String(d.weight));
      sumEl.innerHTML = `${parts.join(" + ")} = <span class="sum-val">${data.result}</span>`;
      sumEl.style.display = "block";
      setTimeout(() => card2.classList.add("visible"), 450);
    });
  }, 150);
}

/* 7.4 Expansion Renderer */
function renderExpansion(data, container) {
  const card1 = makeCard(`🔓 Step 1 — Expand Each Digit to ${data.expandSize} Bits`, data.title, data.subtitle);
  card1.innerHTML += `<div class="exp-grid" id="exp-display" style="margin-top:0.75rem;"></div>`;
  container.appendChild(card1);

  const card2 = makeCard("🔗 Step 2 — Concatenate All Bit Groups", "Join all expanded groups from left to right (no gaps)", "");
  card2.innerHTML += `
    <div class="grouping-row" style="margin-top:0.75rem; align-items:center;">
      ${data.expansions.map((e, i) => `
        <div class="bit-group gc-${i%5}" style="opacity:1;transform:none;">
          <div class="bit-group-bits">${e.bits.map(b=>`<div class="bit-cell">${b}</div>`).join("")}</div>
        </div>
        ${i < data.expansions.length-1 ? '<div style="color:#334155;font-size:1.5rem;align-self:center;margin-bottom:0.4rem;">|</div>' : ""}
      `).join("")}
    </div>
    <div style="text-align:center;margin-top:0.65rem;font-family:'Fira Code',monospace;font-size:0.9rem;color:#94a3b8;">
      Result: <span style="color:#4ade80;font-weight:900;">${data.result}₂</span>
    </div>
  `;
  container.appendChild(card2);

  const card3 = makeResultCard(data);
  container.appendChild(card3);

  setTimeout(() => {
    card1.classList.add("visible");
    const grid = card1.querySelector("#exp-display");
    const items = [];
    data.expansions.forEach((e, i) => {
      const item = document.createElement("div");
      item.className = `exp-item gc-${i%5}`;
      item.innerHTML = `
        <div class="exp-digit">${e.digit}</div>
        <div class="exp-arrow">↓</div>
        <div class="exp-bits">${e.bits.map(b=>`<div class="bit-cell">${b}</div>`).join("")}</div>
      `;
      grid.appendChild(item);
      items.push(item);
    });
    animateQueue(items, 270).then(() => {
      setTimeout(() => card2.classList.add("visible"), 300);
      setTimeout(() => card3.classList.add("visible"), 700);
    });
  }, 150);
}

// ─── SECTION 8: CARD FACTORIES ────────────────────────────────────────────────

function makeCard(badge, title, subtitle) {
  const div = document.createElement("div");
  div.className = "nc-card";
  div.innerHTML = `
    <div class="nc-card-badge">${badge}</div>
    <div class="nc-card-title">${title}</div>
    ${subtitle ? `<div class="nc-card-sub">${subtitle}</div>` : ""}
  `;
  return div;
}

const BASE_NAMES = { 2:"Binary", 8:"Octal", 10:"Decimal", 16:"Hexadecimal" };
const BASE_SUBS  = { 2:"₂", 8:"₈", 10:"₁₀", 16:"₁₆" };

function makeResultCard(data) {
  const card = document.createElement("div");
  card.className = "nc-card";
  const name = BASE_NAMES[data.resultBase] || data.resultLabel || "";
  const sub  = BASE_SUBS[data.resultBase] || "";
  card.innerHTML = `
    <div class="nc-card-badge">✅ Final Answer</div>
    <div class="nc-result-banner">
      <div class="nc-result-label">Converted Result — ${name}</div>
      <div class="nc-result-value">${data.result}</div>
      <div class="nc-result-sub">${data.result}${sub} (${name})</div>
    </div>
  `;
  return card;
}

// ─── SECTION 9: MAIN RENDER DISPATCHER ───────────────────────────────────────

function renderConversionResult(data, container) {
  container.innerHTML = "";
  if (data.type === "same") {
    const c = makeCard("ℹ️ No Conversion Needed", "Input and output base are the same.", "");
    c.innerHTML += `<div class="nc-result-banner" style="margin-top:0.75rem;"><div class="nc-result-label">Output</div><div class="nc-result-value">${data.result}</div></div>`;
    container.appendChild(c);
    setTimeout(() => c.classList.add("visible"), 100);
    return;
  }
  if (data.type === "error") {
    const c = makeCard("❌ Error", data.message, "");
    container.appendChild(c);
    setTimeout(() => c.classList.add("visible"), 100);
    return;
  }
  const renderers = { division: renderDivision, grouping: renderGrouping, weights: renderWeights, expansion: renderExpansion };
  const fn = renderers[data.type];
  if (fn) fn(data, container);
}

// ─── SECTION 10: UI ENTRY POINTS ──────────────────────────────────────────────

function runNumConversion() {
  const inputEl = document.getElementById("numconv-input");
  const fromEl  = document.getElementById("numconv-from");
  const toEl    = document.getElementById("numconv-to");
  const errEl   = document.getElementById("numconv-error");
  const stepsEl = document.getElementById("numconv-steps");
  if (!inputEl || !fromEl || !toEl) return;

  const raw      = inputEl.value;
  const fromBase = fromEl.value;
  const toBase   = toEl.value;

  // Validate
  const v = validateInput(raw, fromBase);
  if (!v.valid) {
    errEl.textContent = v.message;
    errEl.classList.add("visible");
    stepsEl.innerHTML = "";
    return;
  }
  errEl.classList.remove("visible");

  // Normalize → Dispatch → Render
  const normalized = normalizeInput(raw, fromBase);
  const result     = dispatchConversion(fromBase, toBase, normalized);
  renderConversionResult(result, stepsEl);

  stepsEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function swapNumConvBases() {
  const fromEl = document.getElementById("numconv-from");
  const toEl   = document.getElementById("numconv-to");
  if (!fromEl || !toEl) return;
  const tmp = fromEl.value;
  fromEl.value = toEl.value;
  toEl.value = tmp;
}

// ─── SECTION 11: LAB SETUP ────────────────────────────────────────────────────

function setupLabNumConverter(container) {
  injectNumConverterStyles();

  container.innerHTML = `
    <div class="numconv-lab">
      <div class="numconv-input-panel">
        <div class="numconv-input-wrap">
          <input class="numconv-input" id="numconv-input" type="text"
            placeholder="Enter a number (e.g. 1010, 255, FF, 377) …"
            autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false"/>
        </div>

        <div class="numconv-selectors">
          <div class="numconv-selector-group">
            <label>From Number System</label>
            <select class="numconv-select" id="numconv-from">
              <option value="bin">Binary (Base 2)</option>
              <option value="dec" selected>Decimal (Base 10)</option>
              <option value="oct">Octal (Base 8)</option>
              <option value="hex">Hexadecimal (Base 16)</option>
            </select>
          </div>

          <div class="numconv-swap-btn" onclick="swapNumConvBases()" title="Swap ↔">⇄</div>

          <div class="numconv-selector-group">
            <label>To Number System</label>
            <select class="numconv-select" id="numconv-to">
              <option value="bin" selected>Binary (Base 2)</option>
              <option value="dec">Decimal (Base 10)</option>
              <option value="oct">Octal (Base 8)</option>
              <option value="hex">Hexadecimal (Base 16)</option>
            </select>
          </div>
        </div>

        <button class="numconv-convert-btn" onclick="runNumConversion()">
          ▶ Convert — Show Step by Step
        </button>
      </div>

      <div class="numconv-error" id="numconv-error"></div>
      <div class="numconv-steps" id="numconv-steps"></div>
    </div>
  `;

  // Enter key shortcut
  const inp = container.querySelector("#numconv-input");
  if (inp) inp.addEventListener("keydown", e => { if (e.key === "Enter") runNumConversion(); });
}
