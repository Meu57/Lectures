const fs = require("fs");

const content = fs.readFileSync("C:/Users/ameen/OneDrive/Desktop/INTERACTIONS/textbook_content.js", "utf8");
const lines = content.split("\n");

console.log("=== ASCII Box Drawing Characters Locations ===");
lines.forEach((line, idx) => {
  if (/[┌┐└┘├┤┬┴┼─│═║╔╗╚╝╠╣╦╩╬]/.test(line)) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
