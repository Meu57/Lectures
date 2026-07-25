const fs = require('fs');

// Read raw file content to search for occurrences of single backslashes
const content = fs.readFileSync('textbook_content.js', 'utf8');

// A regex to look for potential single backslashes in the raw content
// In JS template strings, raw file contains '\\' for double backslashes,
// and single '\' for escapes. 
// Let's count occurrences of '\\' vs single '\'
let doubleCount = 0;
let singleCount = 0;

// Scan character by character
let i = 0;
while (i < content.length) {
  if (content[i] === '\\') {
    if (content[i+1] === '\\') {
      doubleCount++;
      i += 2;
    } else {
      singleCount++;
      // Print context of single backslash
      console.log(`Single backslash context: "${content.substring(Math.max(0, i-20), Math.min(content.length, i+20)).replace(/\n/g, '\\n')}"`);
      i++;
    }
  } else {
    i++;
  }
}

console.log(`Double backslash count: ${doubleCount}`);
console.log(`Single backslash count: ${singleCount}`);
