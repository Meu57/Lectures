const fs = require("fs");
const path = require("path");

// Load textbook_content.js
const textbookJs = fs.readFileSync("C:/Users/ameen/OneDrive/Desktop/INTERACTIONS/textbook_content.js", "utf8");

// Simple evaluation of TEXTBOOK_CONTENT
const sandbox = {};
require("vm").runInNewContext(textbookJs + "\nthis.TEXTBOOK_CONTENT = TEXTBOOK_CONTENT;", sandbox);
const TEXTBOOK_CONTENT = sandbox.TEXTBOOK_CONTENT;

// Load binary_visual_labs.html and extract CHAPTERS array
const html = fs.readFileSync("C:/Users/ameen/OneDrive/Desktop/INTERACTIONS/binary_visual_labs.html", "utf8");
const chaptersMatch = html.match(/const CHAPTERS = (\[[\s\S]*?\]);/);

if (!chaptersMatch) {
  console.error("Could not find CHAPTERS array in HTML!");
  process.exit(1);
}

// Evaluate CHAPTERS array safely
const sandboxChapters = {};
require("vm").runInNewContext("const CHAPTERS = " + chaptersMatch[1] + "; this.CHAPTERS = CHAPTERS;", sandboxChapters);
const CHAPTERS = sandboxChapters.CHAPTERS;

console.log("Checking CHAPTERS keys in TEXTBOOK_CONTENT:");
let errors = 0;
CHAPTERS.forEach((ch, idx) => {
  if (ch.id in TEXTBOOK_CONTENT) {
    console.log(`[OK] Chapter ${idx + 1}: ${ch.id} (${ch.title})`);
  } else {
    console.error(`[ERROR] Chapter ${idx + 1}: ${ch.id} (${ch.title}) is missing in TEXTBOOK_CONTENT!`);
    errors++;
  }
});

console.log(`\nValidation complete. Errors found: ${errors}`);
if (errors > 0) process.exit(1);
process.exit(0);
