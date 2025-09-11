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
    statusEl.textContent = "Processing...";

    // Start timer
    timerInterval = setInterval(() => {
      secondsElapsed++;
      timerEl.textContent = `Time: ${secondsElapsed}s`;
    }, 1000);

    // Step 2: Poll for result with real progress updates
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/result/${taskId}`);
        const resultData = await res.json();

        // Update progress bar + status text
        if (resultData.progress !== undefined) {
          progressBar.style.width = resultData.progress + "%";
        }
        if (resultData.step) {
          statusEl.textContent = `Status: ${resultData.step}`;
        }

        if (resultData.status === "done") {
          clearInterval(interval);
          clearInterval(timerInterval);

          progressBar.style.width = "100%";
          statusEl.textContent = "Transcription complete!";

          // ✅ Handle transcript correctly (string or object)
          if (typeof resultData.transcript === "string") {
            resultEl.value = resultData.transcript;
          } else if (
            resultData.transcript &&
            typeof resultData.transcript === "object" &&
            resultData.transcript.transcript
          ) {
            resultEl.value = resultData.transcript.transcript;
          } else {
            resultEl.value = JSON.stringify(resultData.transcript, null, 2);
          }

          // Re-enable button
          transcribeBtn.disabled = false;
        }

        if (resultData.status === "error") {
          clearInterval(interval);
          clearInterval(timerInterval);

          progressBar.style.width = "100%";
          statusEl.textContent = `Error: ${resultData.error}`;

          // Re-enable button
          transcribeBtn.disabled = false;
        }
      } catch (err) {
        clearInterval(interval);
        clearInterval(timerInterval);
        statusEl.textContent = "Error fetching progress.";
        console.error(err);
        transcribeBtn.disabled = false;
      }
    }, 2000); // poll every 2s

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
