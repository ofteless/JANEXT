document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("save");
  const inputs = document.querySelectorAll("#options input[data-key]");

  // load tuah! localstorage on that thang
  chrome.storage.sync.get(null, (data) => {
    inputs.forEach(input => {
      const key = input.getAttribute("data-key");
      if (data[key] !== undefined) {
        input.value = data[key];
      }
    });
  });

  saveBtn.addEventListener("click", () => {
    const config = {};
    inputs.forEach(input => {
      const key = input.getAttribute("data-key");
      let val = input.value.trim();

      if (val === "") {
        val = input.getAttribute("placeholder") || "";
      }

      if (val === "") {
        config[key] = undefined;
      } else {
        const type = input.type;
        if (type === "number") {
          let num = parseFloat(val);
          if (key === "max_tokens" && num === 0) {
            num = 9999;
          }
          config[key] = isNaN(num) ? undefined : num;
        } else {
          config[key] = val;
        }
      }

        // this will return nothing unless the val is > 0
        config["logprobs"] = true;
    });

    chrome.storage.sync.set(config, () => {
      // todo: replace this
      alert("Settings saved!");

      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.url && tab.url.startsWith("http")) {
            chrome.tabs.sendMessage(tab.id, { action: "broadcastConfig", config }, (response) => {
              if (chrome.runtime.lastError) {
                // who gaf
              }
            });
          }
        });
      });
    });
  });
});