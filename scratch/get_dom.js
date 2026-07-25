const wsUrl = "ws://localhost:9222/devtools/page/FCBC8E73A6CBC40671AB3750ED50D17A";

async function run() {
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
    ws.send(JSON.stringify({
      id: 2,
      method: "Runtime.evaluate",
      params: {
        expression: `
          JSON.stringify({
            url: window.location.href,
            activeSubject: typeof activeSubject !== 'undefined' ? activeSubject : 'undefined',
            currentChapterIndex: typeof currentChapterIndex !== 'undefined' ? currentChapterIndex : 'undefined',
            articleHtml: document.getElementById("learn-article") ? document.getElementById("learn-article").innerHTML : 'Not Found',
            sidebarHtml: document.getElementById("learn-menu") ? document.getElementById("learn-menu").innerHTML : 'Not Found',
            localStorage: JSON.stringify(localStorage)
          })
        `
      }
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id === 2) {
      if (data.result && data.result.result) {
        const state = JSON.parse(data.result.result.value);
        console.log("Current Browser State:");
        console.log("----------------------");
        console.log("URL:", state.url);
        console.log("activeSubject:", state.activeSubject);
        console.log("currentChapterIndex:", state.currentChapterIndex);
        console.log("localStorage:", state.localStorage);
        console.log("\nArticle HTML:\n", state.articleHtml);
        console.log("\nSidebar HTML:\n", state.sidebarHtml);
      } else {
        console.log("Error querying DOM:", data);
      }
      ws.close();
      process.exit(0);
    }
  };
}

run();
