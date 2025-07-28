console.log("JANEXT: Content script running");

// inject main
chrome.runtime.sendMessage({ action: "injectMainWorldScript" }, (response) => {
  if (response?.success) {
    console.log("JANEXT: Injection request sent");
  } else {
    console.error("JANEXT: Injection request failed", response?.error);
  }
});

// config broadcasts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "broadcastConfig") {
    console.log("JANEXT: Broadcasting config update to main world");
    // forward to main world
    window.postMessage({
      type: 'JANEXT_UPDATE_CONFIG',
      config: message.config
    }, '*');
  }
});