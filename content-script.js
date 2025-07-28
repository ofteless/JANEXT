console.log("JANEXT: Content script running");

chrome.runtime.sendMessage({ action: "injectMainWorldScript" }, (response) => {
  if (response?.success) {
    console.log("JANEXT: Injection request sent");
  } else {
    console.error("JANEXT: Injection request failed", response?.error);
  }
});