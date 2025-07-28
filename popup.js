document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("save");
    const inputs = document.querySelectorAll("#options input[data-key]");
    const outputs = document.querySelectorAll("output");

    // load tuah! localstorage on that thang
    chrome.storage.sync.get(null, (data) => {
        inputs.forEach(input => {
            const key = input.getAttribute("data-key");
            if (data[key] !== undefined) {
                input.value = data[key];

                const output = document.querySelector(`output[for="${key}"]`);
                if (output) {
                    output.textContent = input.value;
                }
            }
        });
    });

    inputs.forEach(input => {
        const key = input.getAttribute("data-key");
        const output = document.querySelector(`output[for="${key}"]`);

        if (output) {
            input.addEventListener("input", () => {
                output.textContent = input.value;
            });
        }
    });

    saveBtn.addEventListener("click", () => {
        const config = {};
        inputs.forEach(input => {
            const key = input.getAttribute("data-key");
            let val = input.value.trim();

            if (val === "") {
                val = input.getAttribute("placeholder") || "0"; // fallback
            }

            if (input.type === "range") {
                let num = parseFloat(val);
                if (isNaN(num)) num = 0; // fallback

                if (key === "max_tokens" && num === 0) {
                    num = 9999;
                }

                console.log(`JANEXT - ${key} set to ${num}.`);
                config[key] = num;
            } else {
                config[key] = val;
            }

            config["logprobs"] = true;
        });

        chrome.storage.sync.set(config, () => {
            alert("Settings saved!");

            chrome.tabs.query({}, (tabs) => {
                tabs.forEach((tab) => {
                    if (tab.url && tab.url.startsWith("http")) {
                        chrome.tabs.sendMessage(tab.id, {
                            action: "broadcastConfig",
                            config
                        }, (response) => {
                            if (chrome.runtime.lastError) {
                                // we dont care about this just fail peacefully
                            }
                        });
                    }
                });
            });
        });
    });
});