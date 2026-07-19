const fs = require('fs');

// Read current file
let fileContent = fs.readFileSync('textbook_content.js', 'utf8');

// We want to replace underscores inside the string literals.
// To be perfectly safe, we can match:
// 1. Underbrace subscripts: `_{` -> `\\_{`
// 2. Base subscripts: `_2` -> `\\_2`, `_8` -> `\\_8`, `_10` -> `\\_10`, `_16` -> `\\_16`, `_3` -> `\\_3`, `_5` -> `\\_5`
// Let's use a regex that matches `_` if it is followed by `{`, or digits (like 2, 8, 10, 16, 3, 5, etc.) or words in LaTeX subscripts.
// A safe pattern is: `_` followed by either `{` or a digit.
// Let's replace any `_` that is not part of JS variables (JS variables are TEXTBOOK_CONTENT).
// Since the string template literals are the ones containing math, we can match:
// `_` when it's followed by `{` or digits, e.g. `_` matches `_(?=\{|\d|\\text)`
// Let's test this regex on the file contents.

const replaced = fileContent.replace(/_(?=\{|\d|\\text)/g, '\\\\_');

fs.writeFileSync('textbook_content.js', replaced, 'utf8');
console.log('Underscores successfully escaped!');
