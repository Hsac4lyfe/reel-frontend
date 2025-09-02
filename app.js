async function go() {
  const url = document.getElementById("url").value;
  const statusEl = document.getElementById("status");
  const resultEl = document.getElementById("result");
  const copyStatus = document.getElementById("copyStatus");

  if (!url) {
    statusEl.textContent = "Please enter a link.";
    return;
  }

  statusEl.textContent = "Submitting job...";
  resultEl.value = "";
  copyStatus.style.display = "none";

  try {
    // Step 1: Submit transcription job
    const response = await fetch("http://127.0.0.1:5000/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await response.json();
    if (!data.task_id) {
      statusEl.textContent = "Error: No task_id returned.";
      return;
    }

    const taskId = data.task_id;
    statusEl.textContent = "Processing... please wait.";

    // Step 2: Poll for result
    const interval = setInterval(async () => {
      const res = await fetch(`http://127.0.0.1:5000/result/${taskId}`);
      const resultData = await res.json();

      if (resultData.status === "done") {
        clearInterval(interval);
        statusEl.textContent = "Transcription complete!";
        resultEl.value = resultData.transcript;
      }
    }, 3000); // poll every 3s

  } catch (err) {
    statusEl.textContent = "Error submitting job.";
    console.error(err);
  }
}

function copyText() {
  const resultEl = document.getElementById("result");
  const copyStatus = document.getElementById("copyStatus");

  resultEl.select();
  document.execCommand("copy");

  copyStatus.textContent = "Copied.";
  copyStatus.style.display = "block";

  setTimeout(() => {
    copyStatus.style.display = "none";
  }, 2000);
}
