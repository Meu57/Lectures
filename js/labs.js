/* ==========================================
   INTERACTIVE LABS METADATA INDEX
   ========================================== */

const LABS = [
  {
    id: "lab-bit",
    title: "Bit & Switch Simulator",
    subtitle: "See how transistor channel states block or allow voltage signals.",
    prediction: {
      question: "If we close the circuit switch, what state will register stored value update to?",
      options: ["0 (Low State)", "1 (High State)", "Nothing (No change)"],
      correct: 1
    },
    hardware: "Silicon transistors act as microscopic gates using voltage barriers to code bits.",
    setup: function(container) {
      if (typeof setupLabBit === "function") {
        setupLabBit(container);
      }
    }
  },
  {
    id: "lab-latch",
    title: "Storing a Bit (NAND Latch Memory)",
    subtitle: "Watch cross-coupled logic feedback loops hold state infinitely.",
    prediction: {
      question: "What happens if we disconnect main power supply VCC from NAND gate circuit?",
      options: ["Saved bit collapses to 0", "Stored state remains intact", "Output turns negative"],
      correct: 0
    },
    hardware: "Static RAM (SRAM) flip-flop cells use cross-coupled transistors to hold data.",
    setup: function(container) {
      if (typeof setupLabLatch === "function") {
        setupLabLatch(container);
      }
    }
  },
  {
    id: "lab-comb",
    title: "Combinations & Power (2<sup>n</sup>) Grid",
    subtitle: "Toggle switches or click coordinates in the 16-state grid map.",
    prediction: {
      question: "With 4 switches, how many total unique numeric states can we represent?",
      options: ["8 states", "12 states", "16 states"],
      correct: 2
    },
    hardware: "Digital address buses select memory slots by matching bit combination coordinates.",
    setup: function(container) {
      if (typeof setupLabComb === "function") {
        setupLabComb(container);
      }
    }
  },
  {
    id: "lab-builder",
    title: "8-Bit Byte Builder & Cognitive Challenge",
    subtitle: "Toggle 8 switches to map binary nibbles directly to Hexadecimal values.",
    prediction: {
      question: "Why do software developers prefer Hexadecimal (0x) representation over Binary?",
      options: ["Binary uses too much CPU power", "Hex collapses bits into 75% fewer human characters", "Hex values are faster for computers"],
      correct: 1
    },
    hardware: "CPU registers collapse 8-bit parallel byte buses into 2 hex characters.",
    setup: function(container) {
      if (typeof setupLabBuilder === "function") {
        setupLabBuilder(container);
      }
    }
  },
  {
    id: "lab-ripple",
    title: "PDP-8 Retro Register Switch Panel",
    subtitle: "Toggle the 12-bit register switches to decode instructions in legacy 3-bit Octal groups.",
    prediction: {
      question: "Why did legacy 12-bit systems like PDP-8 use Octal instead of Hexadecimal?",
      options: ["12 bits is perfectly divisible by 3", "Hexadecimal wasn't invented yet", "It saved physical panel space"],
      correct: 0
    },
    hardware: "Vintage computer registers group bits into 3s (Octal) to map instruction sets perfectly.",
    setup: function(container) {
      if (typeof setupLabRipple === "function") {
        setupLabRipple(container);
      }
    }
  },
  {
    id: "lab-system",
    title: "Keyboard-to-Screen CPU System Flow Tracer",
    subtitle: "Trace how character signals route dynamic binary bits inside execution pathways.",
    prediction: {
      question: "When tracing data path, where does CPU ALU load the registers from?",
      options: ["Keyboard Input", "System RAM / registers", "Hard disk directly"],
      correct: 1
    },
    hardware: "Busses transceiver gates trace bits pipelines across physical layers this way.",
    setup: function(container) {
      if (typeof setupLabSystem === "function") {
        setupLabSystem(container);
      }
    }
  },
  {
    id: "lab-numconv",
    title: "Number System Conversion Lab",
    subtitle: "Visually convert between Binary, Decimal, Octal & Hexadecimal with animated step-by-step breakdowns.",
    prediction: {
      question: "Why does Binary → Octal conversion group bits in sets of 3?",
      options: ["Because Octal = Base 8 = 2³ (3 bits exactly represent 0–7)", "Because binary has 3 digits", "Because octal is used in groups of 3 for historical reasons"],
      correct: 0
    },
    hardware: "CPUs internally group binary bus signals into octal or hex for compact representation in registers.",
    setup: function(container) {
      if (typeof setupLabNumConverter === "function") {
        setupLabNumConverter(container);
      }
    }
  }
];
