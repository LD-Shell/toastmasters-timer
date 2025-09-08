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

// Timing input selectors
const greenHrInput = document.getElementById('greenHr');
const greenMinInput = document.getElementById('greenMin');
const greenSecInput = document.getElementById('greenSec');
const yellowHrInput = document.getElementById('yellowHr');
const yellowMinInput = document.getElementById('yellowMin');
const yellowSecInput = document.getElementById('yellowSec');
const redHrInput = document.getElementById('redHr');
const redMinInput = document.getElementById('redMin');
const redSecInput = document.getElementById('redSec');

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
    
    greenSoundPlayed = false;
    yellowSoundPlayed = false;
    redSoundPlayed = false;

    startBtn.disabled = true;
    stopBtn.disabled = false;
    cancelBtn.disabled = false;
    exportBtn.disabled = true;

    const greenMarker = (parseInt(greenHrInput.value) * 3600 + parseInt(greenMinInput.value) * 60 + parseInt(greenSecInput.value)) * 1000;
    const yellowMarker = (parseInt(yellowHrInput.value) * 3600 + parseInt(yellowMinInput.value) * 60 + parseInt(yellowSecInput.value)) * 1000;
    const redMarker = (parseInt(redHrInput.value) * 3600 + parseInt(redMinInput.value) * 60 + parseInt(redSecInput.value)) * 1000;

    document.body.style.backgroundColor = "var(--bg)";
    document.body.style.setProperty('--dynamic-text-color', 'var(--text)');

    interval = setInterval(() => {
        let elapsed = Date.now() - start;
        timerDisplay.innerHTML = formatTime(elapsed);

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
                <span class="name">${speakerName || 'Unnamed Speaker'}</span>
            </div>
            <div class="speaker-entry-controls">
                <span class="time">${formatTime(finalTime, false)}</span>
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
    timerDisplay.innerHTML = `00 <i class="unit">hr</i> : 00 <i class="unit">min</i> : 00 <i class="unit">sec</i>`;
    document.body.style.backgroundColor = "var(--bg)";
    document.body.style.setProperty('--dynamic-text-color', 'var(--text)');
    speakerNameInput.value = "";
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    cancelBtn.disabled = true;
}

function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    
    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");
    
    return `${hours} <i class="unit">hr</i> : ${minutes} <i class="unit">min</i> : ${seconds} <i class="unit">sec</i>`;
}

function deleteEntry(btn) {
    const entry = btn.closest('.speaker-entry');
    if (entry) {
        entry.remove();
        reorderEntries();
        if (speakersList.children.length <= 1) {
            noSpeakersMsg.style.display = 'block';
            exportBtn.disabled = true;
        }
    }
}

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

function exportToPDF() {
    if (speakersList.querySelectorAll('.speaker-entry').length === 0) {
        alert("There are no recorded times to export!");
        return;
    }

    const doc = new jsPDF();
    let yPos = 20;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Timer's report", 20, yPos);
    yPos += 15;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += 10;
    
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("No.", 20, yPos);
    doc.text("Speaker Name", 40, yPos);
    doc.text("Time", 150, yPos);
    yPos += 8;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    const entries = speakersList.querySelectorAll('.speaker-entry');
    entries.forEach((entry) => {
        const number = entry.querySelector('.number').textContent.trim();
        const name = entry.querySelector('.name').textContent.trim();
        const time = entry.querySelector('.time').textContent.trim()
            .replace(/hr/g, 'h')
            .replace(/min/g, 'm')
            .replace(/sec/g, 's')
            .replace(/\s*:\s*/g, ' ');

        doc.text(number, 20, yPos);
        doc.text(name, 40, yPos);
        doc.text(time, 150, yPos);
        yPos += 8;
    });

    doc.save("presentation-timer-report.pdf");
}

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopAndRecord);
cancelBtn.addEventListener('click', cancelTimer);
exportBtn.addEventListener('click', exportToPDF);

// --- MODIFIED SECTION START ---

// Helper function to format an input to always have two digits
function formatToTwoDigits(inputElement) {
    if (isNaN(parseInt(inputElement.value))) {
        inputElement.value = "00";
    } else {
        inputElement.value = String(inputElement.value).padStart(2, '0');
    }
}

function setupInputListeners(hrInput, minInput, secInput) {
    hrInput.addEventListener('input', () => {
        if (hrInput.value < 0) hrInput.value = 0;
    });

    minInput.addEventListener('input', () => {
        if (minInput.value < 0) minInput.value = 0;
        if (minInput.value >= 60) {
            let hoursToAdd = Math.floor(minInput.value / 60);
            hrInput.value = parseInt(hrInput.value || 0) + hoursToAdd;
            minInput.value = minInput.value % 60;
            formatToTwoDigits(hrInput); // Format after auto-update
        }
    });
    
    secInput.addEventListener('input', () => {
        if (secInput.value < 0) secInput.value = 0;
        if (secInput.value >= 60) {
            let minutesToAdd = Math.floor(secInput.value / 60);
            minInput.value = parseInt(minInput.value || 0) + minutesToAdd;
            secInput.value = secInput.value % 60;
            // Re-check minutes in case seconds pushed it over 60
            if (minInput.value >= 60) {
                let hoursToAdd = Math.floor(minInput.value / 60);
                hrInput.value = parseInt(hrInput.value || 0) + hoursToAdd;
                minInput.value = minInput.value % 60;
                formatToTwoDigits(hrInput); // Format after auto-update
            }
            formatToTwoDigits(minInput); // Format after auto-update
        }
    });

    // Add blur event listeners to format the inputs when the user clicks away
    const inputs = [hrInput, minInput, secInput];
    inputs.forEach(input => {
        input.addEventListener('blur', () => formatToTwoDigits(input));
    });
}

// --- NEW FUNCTION ---
// Function to format all time inputs when the page loads
function formatInitialValues() {
    const allTimeInputs = document.querySelectorAll('.time-input-group input[type="number"]');
    allTimeInputs.forEach(input => formatToTwoDigits(input));
}

// --- MODIFIED SECTION END ---

setupInputListeners(greenHrInput, greenMinInput, greenSecInput);
setupInputListeners(yellowHrInput, yellowMinInput, yellowSecInput);
setupInputListeners(redHrInput, redMinInput, redSecInput);

// Run the initial formatting once the page content is loaded
document.addEventListener('DOMContentLoaded', formatInitialValues);
