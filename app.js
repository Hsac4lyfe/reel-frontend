const API_URL = "http://localhost:5000"; // replace with server URL later

async function go() {
  const url = document.getElementById("url").value.trim();
  if (!url) return alert("Paste a URL first");

  document.getElementById("status").innerText = "Transcribing…";

  try {
    const res = await fetch(API_URL + "/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await res.json();

    if (res.ok) {
      const resultBox = document.getElementById("result");
      resultBox.value = data.transcript;
      autoResize(resultBox);
      document.getElementById("status").innerText = "";
    } else {
      document.getElementById("status").innerText = "Error: " + data.detail;
    }
  } catch (e) {
    document.getElementById("status").innerText = "Error: " + e.message;
  }
}

function copyText() {
  const result = document.getElementById("result");
  result.select();
  result.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(result.value);

  const copyStatus = document.getElementById("copyStatus");
  copyStatus.innerText = "Copied.";
  copyStatus.style.display = "block";

  setTimeout(() => {
    copyStatus.style.display = "none";
  }, 2000);
}

function autoResize(textarea) {
  textarea.style.height = "auto"; // reset
  textarea.style.height = textarea.scrollHeight + "px"; // expand
}

window.addEventListener("DOMContentLoaded", () => {
  const resultBox = document.getElementById("result");
  resultBox.addEventListener("input", () => autoResize(resultBox));
});
