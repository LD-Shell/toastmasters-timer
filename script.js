// window.jsPDF is a global object from the CDN script
const { jsPDF } = window.jspdf;

let interval, start, isRunning = false;
let greenSoundPlayed = false;
let yellowSoundPlayed = false;
let redSoundPlayed = false;
let speakerCount = 0;

// Element selectors
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const cancelBtn = document.getElementById('cancelBtn');
const exportBtn = document.getElementById('exportBtn');
const timerDisplay = document.getElementById('timer');
const speakerNameInput = document.getElementById('speakerName');
const speakersList = document.getElementById('speakersList');
const noSpeakersMsg = document.getElementById('noSpeakersMsg');
const soundToggle = document.getElementById('soundToggle');

// Audio elements
const greenBell = new Audio('bell_1.mp3');
const redBell = new Audio('bell_2.mp3');

// Initially disable the stop, cancel, and export buttons
stopBtn.disabled = true;
cancelBtn.disabled = true;
exportBtn.disabled = true;

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
    exportBtn.disabled = true;

    const greenTime = parseInt(document.getElementById("greenTime").value) * 1000;
    const yellowTime = greenTime + parseInt(document.getElementById("yellowTime").value) * 1000;
    const redTime = yellowTime + parseInt(document.getElementById("redTime").value) * 1000;

    document.body.style.backgroundColor = "var(--bg)";

    interval = setInterval(() => {
        let elapsed = Date.now() - start;
        timerDisplay.textContent = formatTime_old(elapsed); // The main timer uses the mm:ss format

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
                <span class="time">${formatTime_readable(finalTime)}</span>
                <button class="delete-btn" onclick="deleteEntry(this)">&times;</button>
            </div>
        `;
        speakersList.appendChild(newEntry);
        noSpeakersMsg.style.display = 'none';
        exportBtn.disabled = false;
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

// Formats time for the main timer display (MM:SS)
function formatTime_old(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    let seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}

// New: Formats time for the recorded entries (more readable)
function formatTime_readable(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    
    let parts = [];
    if (hours > 0) {
        parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
    }
    if (seconds > 0) {
        parts.push(`${seconds} sec${seconds > 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
        return "0 secs";
    }
    
    return parts.join(" ");
}

function deleteEntry(btn) {
    const entry = btn.closest('.speaker-entry');
    if (entry) {
        entry.remove();
        reorderEntries();
        if (speakersList.children.length === 1) {
            noSpeakersMsg.style.display = 'block';
            exportBtn.disabled = true;
        }
    }
}

// Reorders the speaker numbers after an entry is deleted
function reorderEntries() {
    const entries = speakersList.querySelectorAll('.speaker-entry');
    speakerCount = 0;
    entries.forEach((entry, index) => {
        const numberSpan = entry.querySelector('.number');
        if (numberSpan) {
            numberSpan.textContent = `${index + 1}.`;
        }
    });
    speakerCount = entries.length;
}

// New function to export the recorded times as a PDF
function exportToPDF() {
    if (speakersList.querySelectorAll('.speaker-entry').length === 0) {
        alert("There are no recorded times to export!");
        return;
    }

    const doc = new jsPDF();
    let yPos = 20;

    // Report Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Timer's Report", 20, yPos);
    yPos += 15;

    // Date
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += 10;
    
    // Horizontal line
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // Column Headers
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("No.", 20, yPos);
    doc.text("Speaker Name", 40, yPos);
    doc.text("Time", 150, yPos);
    yPos += 8;

    // Speaker entries
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    const entries = speakersList.querySelectorAll('.speaker-entry');
    entries.forEach((entry) => {
        const number = entry.querySelector('.number').textContent.trim();
        const name = entry.querySelector('span:not(.time):not(.number)').textContent.trim();
        const time = entry.querySelector('.time').textContent.trim();

        doc.text(number, 20, yPos);
        doc.text(name, 40, yPos);
        doc.text(time, 150, yPos);
        yPos += 8;
    });

    doc.save("presentation-timer-report.pdf");
}

// Event listeners
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopAndRecord);
cancelBtn.addEventListener('click', cancelTimer);
exportBtn.addEventListener('click', exportToPDF);

