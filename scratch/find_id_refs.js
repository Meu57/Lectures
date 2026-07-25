const fs = require("fs");

function findRefs(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  console.log(`\n=== References to underbrace-guide in ${filePath} ===`);
  lines.forEach((line, idx) => {
    if (line.includes("underbrace-guide")) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
}

findRefs("C:/Users/ameen/OneDrive/Desktop/INTERACTIONS/binary_visual_labs.html");
findRefs("C:/Users/ameen/OneDrive/Desktop/INTERACTIONS/textbook_content.js");
