chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "injectMainWorldScript") {
    if (!sender.tab?.id) {
      sendResponse({ success: false, error: "No tab ID" });
      return;
    }

    chrome.storage.sync.get(null, (config) => {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id, allFrames: true },
        world: "MAIN",
        func: (initialConfig) => {
          try {
            window.JANEXT_HOOKED = true;
            window.JANEXT_CONFIG = initialConfig;
            console.log("JANEXT: Main world script running with config:", initialConfig);

            window.addEventListener('message', (event) => {
              if (event.data?.type === 'JANEXT_UPDATE_CONFIG') {
                window.JANEXT_CONFIG = event.data.config;
                console.log("JANEXT: Config updated:", window.JANEXT_CONFIG);
              }
            });

            const originalFetch = window.fetch;
            window.fetch = function (url, options = {}) {
              if (typeof url === 'string' &&
                url.includes('openrouter.ai/api/v1/chat/completions') &&
                options.method?.toUpperCase() === 'POST') {
                if (options.body && typeof options.body === 'string') {
                  try {
                    const json = JSON.parse(options.body);
                    Object.assign(json, window.JANEXT_CONFIG);
                    options.body = JSON.stringify(json);
                    console.log("JANEXT Modified body:", json);
                  } catch (e) {
                    console.error("JANEXT Fetch parsing error:", e);
                  }
                }
              }
              return originalFetch.call(this, url, options);
            };

            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function (method, url) {
              this._janext_url = url;
              this._janext_method = method;
              return originalOpen.apply(this, arguments);
            };

            const originalSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.send = function (body) {
              if (this._janext_url &&
                this._janext_url.includes('openrouter.ai/api/v1/chat/completions') &&
                this._janext_method?.toUpperCase() === 'POST') {
                if (body && typeof body === 'string') {
                  try {
                    const json = JSON.parse(body);
                    Object.assign(json, window.JANEXT_CONFIG);
                    body = JSON.stringify(json);
                    console.log("JANEXT XHR Modified body:", json);
                  } catch (e) {
                    console.error("JANEXT XHR parsing error:", e);
                  }
                }
              }
              return originalSend.call(this, body);
            };
          } catch (e) {
            console.error("JANEXT Main world script failed!", e);
          }
        },
        args: [config]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Script injection failed:", chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true });
        }
      });
    });

    return true;
  }
});