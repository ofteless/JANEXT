chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (details.method === "POST" && details.url.includes("/api/v1/chat/completions")) {
      let requestBody = details.requestBody;
      console.log("janext - Found matching post request")

      if (requestBody && requestBody.raw && requestBody.raw.length) {
        let decoder = new TextDecoder("utf-8");
        let encoder = new TextEncoder();

        let rawData = requestBody.raw[0].bytes;
        let jsonString = decoder.decode(rawData);

        try {
          let json = JSON.parse(jsonString);

          // Add new parameter
          json.seed = 10;

          let newJsonString = JSON.stringify(json);
          let newRaw = encoder.encode(newJsonString);

          console.log("janext - Added param");

          return { 
            requestBody: {
              raw: [{ bytes: newRaw }]
            }
          };
        } catch (e) {
          console.error("janext - Failed to parse JSON body:", e);
          // just return nothing to skip modification if parse fails
        }
      }
    }
  },
  {urls: ["https://openrouter.ai/*"]},
  ["blocking", "requestBody"]
);