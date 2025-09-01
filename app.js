const API_URL = "http://127.0.0.1:5000"; 
async function go() {
  const url = document.getElementById("url").value.trim();
  if (!url) return alert("Paste a URL first");

  document.getElementById("status").innerText = "Transcribing…";
  document.getElementById("copyStatus").style.display = "none";

  try {
    const res = await fetch(API_URL + "/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(JSON.stringify(err));
    }

    const data = await res.json();
    document.getElementById("result").value = data.transcript;
    document.getElementById("status").innerText = "";
  } catch (e) {
    document.getElementById("status").innerText = "Error: " + e.message;
  }
}

function copyText() {
  const resultBox = document.getElementById("result");
  resultBox.select();
  resultBox.setSelectionRange(0, 99999); // for mobile
  navigator.clipboard.writeText(resultBox.value);

  // Show "Copied." message
  const copyStatus = document.getElementById("copyStatus");
  copyStatus.style.display = "block";
  copyStatus.innerText = "Copied.";
}





