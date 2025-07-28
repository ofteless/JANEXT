console.log("✅ JANEXT: Content script injected (isolated world)!");

// Create Blob script that bypasses CSP
const scriptContent = `
  try {
    console.log("✅ JANEXT: Main world script running (CSP-safe)");

    // Override fetch with CSP-safe method
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
      if (typeof url === 'string' && 
          url.includes('openrouter.ai/api/v1/chat/completions') && 
          options.method?.toUpperCase() === 'POST') {
        
        if (options.body && typeof options.body === 'string') {
          try {
            const json = JSON.parse(options.body);
            if (json.seed === undefined) {
              json.seed = 10;
              options.body = JSON.stringify(json);
              console.log("✅ JANEXT: Added seed=10 to fetch request");
              console.log("Modified body:", JSON.stringify(json, null, 2));
            }
          } catch (e) {
            console.error("❌ JANEXT: Fetch parsing error:", e);
          }
        }
      }
      return originalFetch(url, options);
    };

    // Override XHR with CSP-safe method
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      this._janext_url = url;
      this._janext_method = method;
      return originalOpen.apply(this, arguments);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
      if (this._janext_url && 
          this._janext_url.includes('openrouter.ai/api/v1/chat/completions') && 
          this._janext_method?.toUpperCase() === 'POST') {
        
        if (body && typeof body === 'string') {
          try {
            const json = JSON.parse(body);
            if (json.seed === undefined) {
              json.seed = 10;
              body = JSON.stringify(json);
              console.log("✅ JANEXT: Added seed=10 to XHR request");
              console.log("Modified body:", JSON.stringify(json, null, 2));
            }
          } catch (e) {
            console.error("❌ JANEXT: XHR parsing error:", e);
          }
        }
      }
      return originalSend.call(this, body);
    };
  } catch (e) {
    console.error("❌ JANEXT: Main world script failed!", e);
  }
`;

// SAFE INJECTION: Wait for <head> to be available
function injectScript() {
  // 1. Use MutationObserver to wait for <head>
  const observer = new MutationObserver(() => {
    if (document.head) {
      inject();
      observer.disconnect();
    }
  });

  // 2. Start observing for DOM changes
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // 3. Check immediately in case <head> already exists
  if (document.head) {
    inject();
    observer.disconnect();
    return;
  }

  function inject() {
    const blob = new Blob([scriptContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      URL.revokeObjectURL(url);
      script.remove();
    };
    
    // Safely append to head (now guaranteed to exist)
    document.head.appendChild(script);
    console.log("✅ JANEXT: CSP-safe script injected");
  }
}

// Start the injection process
injectScript();

const parent = document.head || document.documentElement;
if (parent) {
  parent.appendChild(script);
} else {
  window.addEventListener('DOMContentLoaded', () => {
    (document.head || document.documentElement).appendChild(script);
  });
}