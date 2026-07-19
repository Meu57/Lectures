const fs = require("fs");

const filePath = "C:/Users/ameen/OneDrive/Desktop/INTERACTIONS/textbook_content.js";
let content = fs.readFileSync(filePath, "utf8");

// Define case-insensitive replacements
// Note: We replace longer phrases first to avoid partial matching issues
const replacements = [
  // Phrases
  ["spasht roop se", "clearly"],
  ["dainik jeevan", "daily life"],
  ["manav shreni", "humans"],
  ["nimnlikhit", "niche diye gaye"],
  ["shaikshanik parikshao", "exams"],
  ["tivra niyam", "fast method"],
  ["visual dhang se", "visually"],
  ["asali sachai", "reality"],
  ["galti ki sambhavna", "galti ke chances"],
  ["akarshak", "attractive"],
  ["aam taur par", "normally"],
  ["dhasu hardware analysis", "great hardware analysis"],
  ["bahut saare", "bahut sare"],

  // Single words
  ["prarambhik", "starting"],
  ["mahatvapurna", "important"],
  ["aadharbhoot", "basic"],
  ["adhyay", "chapter"],
  ["prabhav", "effect"],
  ["shuruaat", "starting"],
  ["vyavasthit", "systematic"],
  ["shaikshanik", "educational"],
  ["upyogi", "useful"],
  ["upayogi", "useful"],
  ["sahayak", "helpful"],
  ["adharit", "based"],
  ["avishkar", "invention"],
  ["sankshipt", "short"],
  ["gannayein", "calculations"],
  ["aasan", "easy"],
  ["sankalpna", "concept"],
  ["avadharna", "concept"],
  ["vishesh", "special"],
  ["prakriya", "process"],
  ["parinam", "result"],
  ["upabhokta", "user"],
  ["aavashyakta", "need"],
  ["chhatra", "student"],
  ["chhatro", "students"],
  ["shikshak", "teacher"],
  ["upasthiti", "attendance"],
  ["sadharan", "simple"],
  ["parivartan", "change"],
  ["sthir", "constant"],
  ["sakriya", "active"],
  ["nirdharit", "set"],
  ["sankhep", "short"],
  ["matra", "quantity"],
  ["itihas", "history"],
  ["purani", "old"],
  ["antim", "last"],
  ["buniyaadi", "basic"],
  ["samarth", "capable"],
  ["asamarth", "incapable"],
  ["nirnay", "decision"],
  ["jatil", "complex"],
  ["niyam", "rule"],
  ["Niyam", "Rule"],
  ["karan", "wajah"],
  ["bhasha", "language"],
  ["bhashaon", "languages"],
  ["ank", "digit"],
  ["anko", "digits"],
  ["vikalp", "option"],
  ["vikalpon", "options"],
  ["ginti", "counting"],
  ["antar", "difference"],
  ["samanya", "normal"],
  ["koshish", "try"],
  ["pariksha", "exam"],
  ["parikshayein", "exams"],
  ["udaharan", "example"],
  ["Udaharan", "Example"],
  ["udaharanon", "examples"],
  ["takneeki", "technical"],
  ["bhadha", "block"],
  ["bhadhayein", "blocks"],
  ["shabdo", "words"],
  ["shabd", "word"],
  ["sankhya", "count"],
  ["gati", "speed"],
  ["samay", "time"],
  ["tarika", "way"],
  ["tarike", "ways"],
  ["dimaag-hila dene wale", "mind-blowing"],
  ["sachai", "reality"],
  ["farq", "difference"],
  ["kabil", "capable"],
  ["kabilat", "capability"],
  ["avashyakta", "need"],
  ["aavashyak", "necessary"],
  ["avashyak", "necessary"],
  ["chhota", "small"],
  ["chhote", "small"],
  ["chhoti", "small"],
  ["chhotey", "small"],
  ["bada", "big"],
  ["bade", "big"],
  ["badi", "big"],
  ["badhi", "big"],
  ["nirdesh", "instruction"],
  ["nirdesho", "instructions"],
  ["smaran", "memorize"],
  ["bhed", "difference"]
];

let totalReplacements = 0;

for (const [hindi, english] of replacements) {
  // Use regex with word boundary matching or literal templates
  // Note: Since Hinglish can have variations, we match general substrings or boundaries
  const regex = new RegExp("\\b" + hindi + "\\b", "g");
  const count = (content.match(regex) || []).length;
  if (count > 0) {
    content = content.replace(regex, english);
    console.log(`Replaced "${hindi}" with "${english}" ${count} times`);
    totalReplacements += count;
  }
}

// Let's do a case-insensitive check for some words that might start with capital letters
const capitalizedReplacements = [
  ["Mahatvapurna", "Important"],
  ["Sankalpna", "Concept"],
  ["Adhyay", "Chapter"],
  ["Niyam", "Rule"]
];

for (const [hindi, english] of capitalizedReplacements) {
  const regex = new RegExp("\\b" + hindi + "\\b", "g");
  const count = (content.match(regex) || []).length;
  if (count > 0) {
    content = content.replace(regex, english);
    console.log(`Replaced "${hindi}" with "${english}" ${count} times`);
    totalReplacements += count;
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log(`\nDone! Total replacements made: ${totalReplacements}`);
