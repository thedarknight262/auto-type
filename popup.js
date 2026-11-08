const slowModeCheckbox = document.getElementById("slowMode");
const clearFirstCheckbox = document.getElementById("clearFirst");
const speedRow = document.getElementById("speedRow");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const status = document.getElementById("status");

slowModeCheckbox.addEventListener("change", () => {
  speedRow.style.display = slowModeCheckbox.checked ? "flex" : "none";
});

speedSlider.addEventListener("input", () => {
  speedValue.textContent = speedSlider.value + "ms";
});

document.getElementById("typeBtn").addEventListener("click", async () => {
  const code = document.getElementById("codeInput").value;

  if (!code.trim()) {
    status.textContent = "Please paste some code first!";
    status.className = "status error";
    return;
  }

  status.textContent = "Working...";
  status.className = "status";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes("guvi.in/code-kata")) {
      status.textContent = "Please open a CodeKata problem page first!";
      status.className = "status error";
      return;
    }

    const message = {
      action: "typeCode",
      code: code,
      slow: slowModeCheckbox.checked,
      speed: parseInt(speedSlider.value),
      clearFirst: clearFirstCheckbox.checked
    };

    try {
      await chrome.tabs.sendMessage(tab.id, message);
    } catch (err) {
      // Content script not loaded → inject it
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });

      await new Promise(r => setTimeout(r, 400));
      await chrome.tabs.sendMessage(tab.id, message);
    }

    if (slowModeCheckbox.checked) {
      status.textContent = "⏳ Typing slowly...";
    } else {
      status.textContent = "✅ Code typed successfully!";
    }
    status.className = "status success";

  } catch (err) {
    console.error(err);
    status.textContent = "Failed. Try refreshing the page and try again.";
    status.className = "status error";
  }
});