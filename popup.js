document.addEventListener("DOMContentLoaded", () => {
  const seedInput = document.getElementById("seed");
  const topKInput = document.getElementById("top_k");
  const saveBtn = document.getElementById("save");

  chrome.storage.sync.get(["seed", "top_k"], (data) => {
    seedInput.value = data.seed || "";
    topKInput.value = data.top_k || "";
  });

  saveBtn.addEventListener("click", () => {
    const seed = parseInt(seedInput.value) || undefined;
    const top_k = parseInt(topKInput.value) || undefined;

    chrome.storage.sync.set({ seed, top_k }, () => {
      alert("Settings saved!");

      // Broadcast the updated config to all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.url && tab.url.startsWith("http")) {
            chrome.tabs.sendMessage(tab.id, {
              action: "broadcastConfig",
              config: { seed, top_k }
            }).catch(() => {
              // Ignore errors (e.g. content script not loaded)
            });
          }
        });
      });
    });
  });
});