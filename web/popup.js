document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("save");

    // note that this alone does not include the text input
    const inputs = document.querySelectorAll("#options input[data-key]");
    // but this does :D
    const inputExclusions = ["targetadr"]; 
    const inputExclusionsPlaceholders = ["*"]; 
    const inputsExc = document.querySelectorAll(inputExclusions.map(id => `#${id}`).join(', '));

    // load tuah! localstorage on that thang
    chrome.storage.sync.get(null, (data) => {
        [...inputs, ...inputsExc].forEach(input => {
            const key = input.getAttribute("data-key");
            if (data[key] !== undefined) {
                input.value = data[key];

                const output = document.querySelector(`output[for="${key}"]`);
                if (output) {
                    output.textContent = input.value;
                } else {
                    input.innerHTML = data[key];
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
        console.log(inputsExc);
        [...inputs, ...inputsExc].forEach(input => {
            const key = input.getAttribute("data-key");
            let val = input.value.trim();

            if (val === "") {
                if (input.type == "range") {
                    val = input.getAttribute("placeholder") || "0"; // fallback
                } else {
                    val = inputExclusionsPlaceholders[inputExclusions.indexOf(key)];
                }
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
        });

        // specialcaseland
        config["logprobs"] = true;


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