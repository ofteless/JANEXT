console.log("✅ JANEXT: Content script injected (isolated world)!");

// Inject script into PAGE CONTEXT (where actual requests originate)
const script = document.createElement('script');
script.type = 'text/javascript';
script.textContent = `
  console.log("✅ JANEXT: Main world script injected!");

  // Override fetch in PAGE CONTEXT
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    if (typeof url === 'string' && 
        url.includes('openrouter.ai/api/v1/chat/completions') && 
        options.method?.toUpperCase() === 'POST') {
      
      if (options.body && typeof options.body === 'string') {
        try {
          const json = JSON.parse(options.body);
          
          // ONLY MODIFY IF SEED ISN'T ALREADY PRESENT
          if (json.seed === undefined) {
            json.seed = 10;
            options.body = JSON.stringify(json);
            console.log("✅ JANEXT: Added seed=10 to fetch request");
          }
        } catch (e) {
          console.error("❌ JANEXT: Failed to parse fetch body:", e);
        }
      }
    }
    return originalFetch(url, options);
  };

  // Override XHR in PAGE CONTEXT
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
          
          // ONLY MODIFY IF SEED ISN'T ALREADY PRESENT
          if (json.seed === undefined) {
            json.seed = 10;
            body = JSON.stringify(json);
            console.log("✅ JANEXT: Added seed=10 to XHR request");
          }
        } catch (e) {
          console.error("❌ JANEXT: Failed to parse XHR body:", e);
        }
      }
    }
    return originalSend.call(this, body);
  };
`;

(document.head || document.documentElement).appendChild(script);
script.remove(); // Cleanup