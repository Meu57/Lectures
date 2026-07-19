const fs = require("fs");

const filePath = "C:/Users/ameen/OneDrive/Desktop/INTERACTIONS/textbook_content.js";
let content = fs.readFileSync(filePath, "utf8");

// replace "jag" with "jab" as a standalone word (boundary check)
const regex = /\bjag\b/g;
const count = (content.match(regex) || []).length;
if (count > 0) {
  content = content.replace(regex, "jab");
  console.log(`Replaced "jag" with "jab" ${count} times.`);
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Done!");
