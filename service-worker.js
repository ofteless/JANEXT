chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "injectMainWorldScript") {
    if (!sender.tab?.id) {
      sendResponse({ success: false, error: "No tab ID" });
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id, allFrames: true },
      world: "MAIN",
      func: () => {
        try {
          window.JANEXT_HOOKED = true
          console.log("Main world context:", window.location.href);
          console.log("JANEXT: Main world script running (injected via scripting.executeScript)");

          const originalFetch = window.fetch;
          window.fetch = function(url, options = {}) {
            console.log("JANEXT: fetch called with", url, options);
            if (typeof url === 'string' &&
                url.includes('openrouter.ai/api/v1/chat/completions') &&
                options.method?.toUpperCase() === 'POST') {

              if (options.body && typeof options.body === 'string') {
                try {
                  const json = JSON.parse(options.body);
                  // set params here
                  json.seed = 10;
                  json.top_k = 1;
                  options.body = JSON.stringify(json);
                  console.log("JANEXT: Added seed=10 to fetch request");
                  console.log("Modified body:", JSON.stringify(json, null, 2));
                } catch (e) {
                  console.error("JANEXT: Fetch parsing error:", e);
                }
              }
            }
            return originalFetch.call(this, url, options);
          };

          // get this weak stuff outta here!!!
          const originalOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url) {
            this._janext_url = url;
            this._janext_method = method;
            console.log("JANEXT: XHR open called with", method, url);
            return originalOpen.apply(this, arguments);
          };

          const originalSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.send = function(body) {
            console.log("JANEXT: XHR send called with body", body);
            if (this._janext_url &&
                this._janext_url.includes('openrouter.ai/api/v1/chat/completions') &&
                this._janext_method?.toUpperCase() === 'POST') {

              if (body && typeof body === 'string') {
                try {
                  const json = JSON.parse(body);
                  if (json.seed === undefined) {
                    json.seed = 10;
                    body = JSON.stringify(json);
                    console.log("JANEXT: Added seed=10 to XHR request");
                    console.log("Modified body:", JSON.stringify(json, null, 2));
                  }
                } catch (e) {
                  console.error("JANEXT: XHR parsing error:", e);
                }
              }
            }
            return originalSend.call(this, body);
          };
        } catch (e) {
          console.error("JANEXT: Main world script failed!", e);
        }
      }
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("JANEXT: Script injection failed:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log("JANEXT: CSP-safe script injected via scripting.executeScript");
        sendResponse({ success: true });
      }
    });

    return true;
  }
});