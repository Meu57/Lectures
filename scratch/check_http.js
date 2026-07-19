const http = require("http");
const vm = require("vm");

http.get("http://localhost:8000/textbook_content.js", (res) => {
  let data = "";
  res.on("data", (chunk) => { data += chunk; });
  res.on("end", () => {
    console.log("Fetched textbook_content.js, length:", data.length);
    try {
      new vm.Script(data);
      console.log("VM Compilation Successful! No syntax errors.");
    } catch (e) {
      console.error("VM Compilation Failed:", e);
      console.error("Stack trace:", e.stack);
    }
  });
}).on("error", (err) => {
  console.error("HTTP error:", err);
});
