console.log("✅ JANEXT: Content script injected!");

// Intercept all fetch requests
(function() {
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    // Normalize input to get URL and method
    let url, method;
    
    if (typeof input === 'string') {
      url = input;
      method = init?.method || 'GET';
    } else if (input instanceof Request) {
      url = input.url;
      method = input.method;
    } else {
      return originalFetch(input, init);
    }

    // ✅ Handle both openrouter.ai and api.openrouter.ai domains
    const isTargetRequest = (
      typeof url === 'string' && 
      url.includes('openrouter') &&
      method.toUpperCase() === 'POST'
    );

    if (isTargetRequest) {
      console.log("janext - Target request detected:", url);
      
      // Create clone to safely read body without affecting original
      const request = input instanceof Request ? input : new Request(url, init);
      const requestClone = request.clone();
      
      try {
        // ✅ Only parse if content-type is JSON
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const originalBody = await requestClone.text();
          const json = JSON.parse(originalBody);
          
          // ✅ Only modify if body is valid JSON
          if (json && typeof json === 'object') {
            json.seed = 10;
            console.log("janext - Modified request body (fetch):", json);
            
            // Create new request with modified body
            return originalFetch(request, {
              ...init,
              body: JSON.stringify(json),
              headers: {
                ...init?.headers,
                'Content-Type': 'application/json'
              }
            });
          }
        }
      } catch (e) {
        console.error("janext - Fetch modification failed:", e);
      }
    }
    
    return originalFetch(input, init);
  };
})();

// Intercept all XHR requests
(function() {
  const open = XMLHttpRequest.prototype.open;
  const send = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._janext_url = url;
    this._janext_method = method;
    open.call(this, method, url, ...args);
  };

  XMLHttpRequest.prototype.send = function(body) {
    const isTargetRequest = (
      this._janext_url &&
      this._janext_url.includes('openrouter') &&
      this._janext_method.toUpperCase() === 'POST'
    );

    if (isTargetRequest) {
      console.log("janext - Target XHR request detected:", this._janext_url);
      
      // ✅ Only handle string bodies (common case for JSON)
      if (body && typeof body === 'string') {
        try {
          // ✅ Check Content-Type before parsing
          const contentType = this.getRequestHeader('Content-Type') || '';
          if (contentType.includes('application/json')) {
            const json = JSON.parse(body);
            json.seed = 10;
            console.log("janext - Modified XHR body:", json);
            
            // ✅ Re-set modified body and content-type header
            this.setRequestHeader('Content-Type', 'application/json');
            body = JSON.stringify(json);
          }
        } catch (e) {
          console.error("janext - XHR modification failed:", e);
        }
      }
    }
    
    send.call(this, body);
  };
})();