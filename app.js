let timerInterval;
let secondsElapsed = 0;

async function go() {
  const url = document.getElementById("url").value;
  const statusEl = document.getElementById("status");
  const resultEl = document.getElementById("result");
  const copyStatus = document.getElementById("copyStatus");
  const transcribeBtn = document.getElementById("transcribeBtn");
  const progressBar = document.getElementById("progress-bar");
  const timerEl = document.getElementById("timer");

  if (!url) {
    statusEl.textContent = "Please enter a link.";
    return;
  }

  // Reset UI
  statusEl.textContent = "Submitting job...";
  resultEl.value = "";
  copyStatus.style.display = "none";
  progressBar.style.width = "0%";
  secondsElapsed = 0;
  timerEl.textContent = "Time: 0s";

  // Disable button
  transcribeBtn.disabled = true;

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
      transcribeBtn.disabled = false;
      return;
    }

    const taskId = data.task_id;
    statusEl.textContent = "Processing... please wait.";

    // Start timer
    timerInterval = setInterval(() => {
      secondsElapsed++;
      timerEl.textContent = `Time: ${secondsElapsed}s`;
    }, 1000);

    // Fake progress fill (until done)
    let progress = 0;
    const fakeProgress = setInterval(() => {
      if (progress < 95) {
        progress += 5;
        progressBar.style.width = progress + "%";
      }
    }, 2000);

    // Step 2: Poll for result
    const interval = setInterval(async () => {
      const res = await fetch(`http://127.0.0.1:5000/result/${taskId}`);
      const resultData = await res.json();

      if (resultData.status === "done") {
        clearInterval(interval);
        clearInterval(fakeProgress);
        clearInterval(timerInterval);

        progressBar.style.width = "100%";
        statusEl.textContent = "Transcription complete!";
        resultEl.value = resultData.transcript;

        // Re-enable button
        transcribeBtn.disabled = false;
      }
    }, 3000); // poll every 3s

  } catch (err) {
    statusEl.textContent = "Error submitting job.";
    console.error(err);
    transcribeBtn.disabled = false;
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
