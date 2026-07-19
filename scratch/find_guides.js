const fs = require("fs");

function findInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  console.log(`\n=== Occurrences in ${filePath} ===`);
  lines.forEach((line, idx) => {
    if (/guide/i.test(line)) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
}

findInFile("C:/Users/ameen/OneDrive/Desktop/INTERACTIONS/binary_visual_labs.html");
findInFile("C:/Users/ameen/OneDrive/Desktop/INTERACTIONS/textbook_content.js");
