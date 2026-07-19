const fs = require("fs");

const filePath = "C:/Users/ameen/OneDrive/Desktop/INTERACTIONS/textbook_content.js";
let content = fs.readFileSync(filePath, "utf8");

// Define replacements (longest/most specific first)
const replacements = [
  ["ke karan", "ki wajah se"],
  ["is karan", "is wajah se"],
  ["Is karan", "Is wajah se"],
  ["ganna se", "calculation se"],
  ["ganna", "calculation"],
  ["anusaran", "follow"],
  ["kaksha", "class"],
  ["namumkin", "impossible"],
  ["swayam को", "itself"],
  ["swayam ko", "itself"],
  ["swayam", "itself"],
  ["sthan par", "place par"],
  ["sthan", "place"],
  ["mool", "basic"],
  ["vyavaharik", "practical"],
  ["zaroori", "important"],
  ["zaruri", "important"],
  ["Zaroori", "Important"],
  ["Zaruri", "Important"],
  ["pukaaroge", "call karoge"],
  ["pukaarna", "call karna"],
  ["pukaar", "call"],
  ["nirantar", "continuously"],
  ["galti ke chances", "error ke chances"],
  ["aamtaur par", "normally"],
  ["Aamtaur par", "Normally"],
  ["aamtaur", "normally"],
  ["Aamtaur", "Normally"],
  ["vishleshan", "analysis"],
  ["kram", "order"]
];

let count = 0;
for (const [hindi, english] of replacements) {
  const regex = new RegExp("\\b" + hindi + "\\b", "g");
  const matches = (content.match(regex) || []).length;
  if (matches > 0) {
    content = content.replace(regex, english);
    console.log(`Replaced "${hindi}" with "${english}" ${matches} times`);
    count += matches;
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log(`Done! Made ${count} replacements.`);
