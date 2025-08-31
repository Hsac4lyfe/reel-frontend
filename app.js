const API_URL = "http://127.0.0.1:5000"; // replace with Railway URL later
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

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    const data = await res.json();
    document.getElementById("result").value = data.transcript;
    document.getElementById("status").innerText = "";
  } catch (e) {
    document.getElementById("status").innerText = "Error: " + e.message;
  }
}





