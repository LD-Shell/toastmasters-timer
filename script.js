let interval, start, isRunning = false;
let greenSoundPlayed = false;
let yellowSoundPlayed = false;
let redSoundPlayed = false;
let speakerCount = 0;

// Element selectors
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const cancelBtn = document.getElementById('cancelBtn');
const timerDisplay = document.getElementById('timer');
const speakerNameInput = document.getElementById('speakerName');
const speakersList = document.getElementById('speakersList');
const noSpeakersMsg = document.getElementById('noSpeakersMsg');
const soundToggle = document.getElementById('soundToggle');

// Audio elements
const greenBell = new Audio('bell_1.mp3');
const redBell = new Audio('bell_2.mp3');

// Initially disable the stop and cancel buttons
stopBtn.disabled = true;
cancelBtn.disabled = true;

function startTimer() {
    if (isRunning) return;

    const speakerName = speakerNameInput.value.trim();
    if (!speakerName) {
        alert("Please enter a speaker's name to begin!");
        return;
    }

    clearInterval(interval);
    start = Date.now();
    isRunning = true;
    
    // Reset sound flags
    greenSoundPlayed = false;
    yellowSoundPlayed = false;
    redSoundPlayed = false;

    startBtn.disabled = true;
    stopBtn.disabled = false;
    cancelBtn.disabled = false;

    const greenTime = parseInt(document.getElementById("greenTime").value) * 1000;
    const yellowTime = greenTime + parseInt(document.getElementById("yellowTime").value) * 1000;
    const redTime = yellowTime + parseInt(document.getElementById("redTime").value) * 1000;

    document.body.style.backgroundColor = "var(--bg)";

    interval = setInterval(() => {
        let elapsed = Date.now() - start;
        timerDisplay.textContent = formatTime(elapsed);

        // Green phase
        if (elapsed < greenTime) {
            document.body.style.backgroundColor = "var(--green)";
            document.body.style.color = "#fff";
        }
        // Yellow phase
        else if (elapsed >= greenTime && elapsed < yellowTime) {
            document.body.style.backgroundColor = "var(--yellow)";
            document.body.style.color = "#000";
            if (!greenSoundPlayed && soundToggle.checked) {
                greenBell.play();
                greenSoundPlayed = true;
            }
        }
        // Red phase
        else if (elapsed >= yellowTime && elapsed < redTime) {
            document.body.style.backgroundColor = "var(--red)";
            document.body.style.color = "#fff";
            if (!yellowSoundPlayed && soundToggle.checked) {
                greenBell.play();
                yellowSoundPlayed = true;
            }
        }
        // Overtime (Red)
        else {
            document.body.style.backgroundColor = "var(--darkred)";
            document.body.style.color = "#fff";
            if (!redSoundPlayed && soundToggle.checked) {
                redBell.play();
                redSoundPlayed = true;
            }
        }
    }, 200);
}

function stopAndRecord() {
    if (!isRunning) return;

    clearInterval(interval);
    isRunning = false;
    const finalTime = Date.now() - start;
    const speakerName = speakerNameInput.value.trim();

    if (finalTime > 0) {
        speakerCount++;
        const newEntry = document.createElement('div');
        newEntry.classList.add('speaker-entry');
        newEntry.innerHTML = `
            <div class="speaker-entry-info">
                <span class="number">${speakerCount}.</span>
                <span>${speakerName || 'Unnamed Speaker'}</span>
            </div>
            <div class="speaker-entry-controls">
                <span class="time">${formatTime(finalTime)}</span>
                <button class="delete-btn" onclick="deleteEntry(this)">&times;</button>
            </div>
        `;
        speakersList.appendChild(newEntry);
        noSpeakersMsg.style.display = 'none';
    }

    resetTimerState();
}

function cancelTimer() {
    if (!isRunning) return;
    clearInterval(interval);
    isRunning = false;
    resetTimerState();
}

function resetTimerState() {
    timerDisplay.textContent = "00:00";
    document.body.style.backgroundColor = "var(--bg)";
    speakerNameInput.value = "";
    startBtn.disabled = false;
    stopBtn.disabled = true;
    cancelBtn.disabled = true;
}

function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    let seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function deleteEntry(btn) {
    const entry = btn.closest('.speaker-entry');
    if (entry) {
        entry.remove();
        if (speakersList.children.length === 1) {
            noSpeakersMsg.style.display = 'block';
        }
    }
}

// Event listeners
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopAndRecord);
cancelBtn.addEventListener('click', cancelTimer);
