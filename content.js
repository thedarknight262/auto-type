chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "typeCode") {
    insertCode(request.code, request.slow, request.speed, request.clearFirst);
    sendResponse({ status: "success" });
  }
  return true;
});

function insertCode(code, slow = false, speed = 35, clearFirst = true) {
  waitForEditor(() => {
    let editor = null;

    // Try to get Ace editor instance
    if (window.ace) {
      const editors = document.querySelectorAll(".ace_editor");
      for (const el of editors) {
        try {
          editor = ace.edit(el);
          if (editor) break;
        } catch (e) {}
      }
    }

    const textarea = document.querySelector(".ace_text-input");

    if (!editor && !textarea) {
      alert("❌ Could not find the Ace Editor.\nMake sure the Code Editor tab is selected.");
      return;
    }

    // ===== Clear first if requested =====
    if (clearFirst) {
      if (editor) {
        editor.setValue("", -1);
        editor.focus();
      } else if (textarea) {
        textarea.focus();
        textarea.value = "";
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    // ===== Instant mode =====
    if (!slow) {
      if (editor) {
        editor.setValue(code, -1);
        editor.focus();
        editor.clearSelection();
        editor.navigateFileEnd();
        console.log("✅ Instant insert via Ace API");
        return;
      }

      if (textarea) {
        textarea.focus();
        textarea.value = code;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        console.log("✅ Instant insert via textarea");
        return;
      }
    }

    // ===== Slow typing mode =====
    typeSlowly(code, speed, editor, textarea);
  });
}

function typeSlowly(code, speed, editor, textarea) {
  let i = 0;

  function typeNextChar() {
    if (i >= code.length) {
      console.log("✅ Slow typing finished");
      return;
    }

    const char = code[i];

    if (editor) {
      editor.insert(char);
    } else if (textarea) {
      textarea.value += char;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }

    i++;
    const randomDelay = speed + Math.floor(Math.random() * 18) - 7;
    setTimeout(typeNextChar, Math.max(12, randomDelay));
  }

  typeNextChar();
}

function waitForEditor(callback, maxTries = 30) {
  let tries = 0;
  const check = setInterval(() => {
    tries++;
    if (window.ace || document.querySelector(".ace_editor") || document.querySelector(".ace_text-input")) {
      clearInterval(check);
      callback();
    } else if (tries >= maxTries) {
      clearInterval(check);
      alert("Editor not found. Make sure Code Editor tab is selected.");
    }
  }, 200);
}