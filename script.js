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
const cancelBtn = document['getElementById']('cancelBtn');
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

    // Get values from new minute/second inputs and calculate total milliseconds
    const greenTimeMin = parseInt(document.getElementById("greenMin").value) || 0;
    const greenTimeSec = parseInt(document.getElementById("greenSec").value) || 0;
    const greenMarker = (greenTimeMin * 60 + greenTimeSec) * 1000;

    const yellowTimeMin = parseInt(document.getElementById("yellowMin").value) || 0;
    const yellowTimeSec = parseInt(document.getElementById("yellowSec").value) || 0;
    const yellowMarker = (yellowTimeMin * 60 + yellowTimeSec) * 1000;

    const redTimeMin = parseInt(document.getElementById("redMin").value) || 0;
    const redTimeSec = parseInt(document.getElementById("redSec").value) || 0;
    const redMarker = (redTimeMin * 60 + redTimeSec) * 1000;

    // Set a default background and text color on start
    document.body.style.backgroundColor = "var(--bg)";
    document.body.style.setProperty('--dynamic-text-color', 'var(--text)');

    interval = setInterval(() => {
        let elapsed = Date.now() - start;
        timerDisplay.innerHTML = formatTime(elapsed); // Use innerHTML for italics

        // Check conditions in the correct order
        if (elapsed >= redMarker) {
            document.body.style.backgroundColor = "var(--darkred)";
            document.body.style.setProperty('--dynamic-text-color', 'var(--text)');
            if (!redSoundPlayed && soundToggle.checked) {
                redBell.play();
                redSoundPlayed = true;
            }
        }
        else if (elapsed >= yellowMarker) {
            document.body.style.backgroundColor = "var(--yellow)";
            document.body.style.setProperty('--dynamic-text-color', '#0f172a');
            if (!yellowSoundPlayed && soundToggle.checked) {
                greenBell.play();
                yellowSoundPlayed = true;
            }
        }
        else if (elapsed >= greenMarker) {
            document.body.style.backgroundColor = "var(--green)";
            document.body.style.setProperty('--dynamic-text-color', 'var(--text)');
            if (!greenSoundPlayed && soundToggle.checked) {
                greenBell.play();
                greenSoundPlayed = true;
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
    timerDisplay.innerHTML = `00 <i>hr</i> : 00 <i>min</i> : 00 <i>sec</i>`;
    document.body.style.backgroundColor = "var(--bg)";
    document.body.style.setProperty('--dynamic-text-color', 'var(--text)');
    speakerNameInput.value = "";
    document.getElementById("greenMin").value = 1;
    document.getElementById("greenSec").value = 0;
    document.getElementById("yellowMin").value = 1;
    document.getElementById("yellowSec").value = 30;
    document.getElementById("redMin").value = 2;
    document.getElementById("redSec").value = 0;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    cancelBtn.disabled = true;
}

// New: Formats time for the main timer and recorded entries (HH hr : MM min : SS sec)
function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    
    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");
    
    // Using <i> tag for italics
    return `${hours} <i>hr</i> : ${minutes} <i>min</i> : ${seconds} <i>sec</i>`;
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
    doc.text("Presentation Report", 20, yPos);
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
        const rawTimeHTML = entry.querySelector('.time').innerHTML; // Get HTML
        const timeText = rawTimeHTML.replace(/<\/?i>/g, ''); // Remove <i> tags for PDF

        doc.text(number, 20, yPos);
        doc.text(name, 40, yPos);
        doc.text(timeText, 150, yPos); // Use plain text for PDF
        yPos += 8;
    });

    doc.save("presentation-timer-report.pdf");
}

// Event listeners
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopAndRecord);
cancelBtn.addEventListener('click', cancelTimer);
exportBtn.addEventListener('click', exportToPDF);
