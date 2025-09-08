// A global object from the jspdf CDN script for PDF generation
const { jsPDF } = window.jspdf;

// --- STATE VARIABLES ---
let interval;                 // Holds the setInterval timer
let start;                    // Stores the timestamp when the timer starts
let isRunning = false;        // Flag to track if the timer is active
let speakerCount = 0;         // Counter for the speaker list
// Flags to ensure sounds only play once per phase
let greenSoundPlayed = false;
let yellowSoundPlayed = false;
let redSoundPlayed = false;

// --- DOM ELEMENT SELECTORS ---
const mainActionBtn = document.getElementById('mainActionBtn');
const cancelBtn = document.getElementById('cancelBtn');
const exportBtn = document.getElementById('exportBtn');
const timerDisplay = document.getElementById('timer');
const speakerNameInput = document.getElementById('speakerName');
const speakersList = document.getElementById('speakersList');
const noSpeakersMsg = document.getElementById('noSpeakersMsg');
const soundToggle = document.getElementById('soundToggle');
const greenHrInput = document.getElementById('greenHr');
const greenMinInput = document.getElementById('greenMin');
const greenSecInput = document.getElementById('greenSec');
const yellowHrInput = document.getElementById('yellowHr');
const yellowMinInput = document.getElementById('yellowMin');
const yellowSecInput = document.getElementById('yellowSec');
const redHrInput = document.getElementById('redHr');
const redMinInput = document.getElementById('redMin');
const redSecInput = document.getElementById('redSec');

// --- AUDIO SETUP ---
const greenBell = new Audio('bell_1.mp3');
const redBell = new Audio('bell_2.mp3');

// --- INITIAL UI STATE ---
cancelBtn.style.display = 'none'; // Hide cancel button by default
exportBtn.disabled = true;

// Starts the timer and updates the UI to the "running" state
function startTimer() {
    if (isRunning) return;

    // A speaker name is required to start
    const speakerName = speakerNameInput.value.trim();
    if (!speakerName) {
        alert("Please enter a speaker's name to begin!");
        return;
    }

    clearInterval(interval); // Clear any previous timer
    start = Date.now();
    isRunning = true;
    
    // Reset sound flags for the new run
    greenSoundPlayed = false;
    yellowSoundPlayed = false;
    redSoundPlayed = false;

    // Update button states and styles
    mainActionBtn.textContent = 'Stop & Record';
    mainActionBtn.classList.add('stop-mode');
    cancelBtn.style.display = 'inline-block';
    exportBtn.disabled = true;

    // Calculate time markers in milliseconds from user inputs
    const greenMarker = (parseInt(greenHrInput.value) * 3600 + parseInt(greenMinInput.value) * 60 + parseInt(greenSecInput.value)) * 1000;
    const yellowMarker = (parseInt(yellowHrInput.value) * 3600 + parseInt(yellowMinInput.value) * 60 + parseInt(yellowSecInput.value)) * 1000;
    const redMarker = (parseInt(redHrInput.value) * 3600 + parseInt(redMinInput.value) * 60 + parseInt(redSecInput.value)) * 1000;

    // Reset background color at the start of each run
    document.body.style.backgroundColor = "var(--bg)";
    document.body.style.setProperty('--dynamic-text-color', 'var(--text)');

    // The main timer loop, runs every 200ms
    interval = setInterval(() => {
        const elapsed = Date.now() - start;
        timerDisplay.innerHTML = formatTime(elapsed);

        // Check elapsed time against markers and update background/play sounds
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

// Stops the timer, records the entry, and resets the UI
function stopAndRecord() {
    if (!isRunning) return;

    clearInterval(interval);
    const finalTime = Date.now() - start;
    const speakerName = speakerNameInput.value.trim();

    // Only add an entry if the timer actually ran
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
                <span class="time">${formatTime(finalTime)}</span>
                <button class="delete-btn" onclick="deleteEntry(this)">&times;</button>
            </div>
        `;
        speakersList.appendChild(newEntry);
        noSpeakersMsg.style.display = 'none';
        exportBtn.disabled = false;
    }
    
    isRunning = false;
    resetTimerState();
}

// Stops the timer without recording and resets the UI
function cancelTimer() {
    if (!isRunning) return;
    clearInterval(interval);
    isRunning = false;
    resetTimerState();
}

// Resets the UI to its initial, non-running state
function resetTimerState() {
    timerDisplay.innerHTML = `00 <i class="unit">hr</i> : 00 <i class="unit">min</i> : 00 <i class="unit">sec</i>`;
    document.body.style.backgroundColor = "var(--bg)";
    document.body.style.setProperty('--dynamic-text-color', 'var(--text)');
    speakerNameInput.value = "";
    
    // Reset button states and styles
    mainActionBtn.textContent = 'Start';
    mainActionBtn.classList.remove('stop-mode');
    cancelBtn.style.display = 'none';
}

// Formats milliseconds into a HH:MM:SS string for display
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const paddedHours = String(hours).padStart(2, "0");
    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");
    
    return `${paddedHours} <i class="unit">hr</i> : ${paddedMinutes} <i class="unit">min</i> : ${paddedSeconds} <i class="unit">sec</i>`;
}

// Deletes a speaker entry from the list
function deleteEntry(btn) {
    const entry = btn.closest('.speaker-entry');
    if (entry) {
        entry.remove();
        reorderEntries(); // Renumber the list after deletion
        if (speakersList.querySelectorAll('.speaker-entry').length === 0) {
            noSpeakersMsg.style.display = 'block';
            exportBtn.disabled = true;
        }
    }
}

// Updates the speaker numbers after a deletion to maintain order
function reorderEntries() {
    const entries = speakersList.querySelectorAll('.speaker-entry');
    entries.forEach((entry, index) => {
        const numberSpan = entry.querySelector('.number');
        if (numberSpan) {
            numberSpan.textContent = `${index + 1}.`;
        }
    });
    speakerCount = entries.length;
}

// Generates and saves a PDF of the recorded speaker times
function exportToPDF() {
    if (speakersList.querySelectorAll('.speaker-entry').length === 0) {
        alert("There are no recorded times to export!");
        return;
    }

    const doc = new jsPDF();
    let yPos = 20;

    // Add title and date
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

    // Add table headers
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("No.", 20, yPos);
    doc.text("Speaker Name", 40, yPos);
    doc.text("Time", 150, yPos);
    yPos += 8;

    // Add table rows by looping through speaker entries
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    const entries = speakersList.querySelectorAll('.speaker-entry');
    entries.forEach((entry) => {
        const number = entry.querySelector('.number').textContent.trim();
        const name = entry.querySelector('.name').textContent.trim();
        const time = entry.querySelector('.time').textContent.trim()
            .replace(/hr/g, 'h').replace(/min/g, 'm').replace(/sec/g, 's')
            .replace(/\s*:\s*/g, ' ');

        doc.text(number, 20, yPos);
        doc.text(name, 40, yPos);
        doc.text(time, 150, yPos);
        yPos += 8;
    });

    doc.save("presentation-timer-report.pdf");
}

// --- INPUT VALIDATION & FORMATTING ---

// Helper function to format an input to always have two digits (e.g., 5 -> 05)
function formatToTwoDigits(inputElement) {
    if (isNaN(parseInt(inputElement.value))) {
        inputElement.value = "00";
    } else {
        inputElement.value = String(inputElement.value).padStart(2, '0');
    }
}

// Sets up listeners for a set of hr/min/sec inputs for validation and auto-carryover
function setupInputListeners(hrInput, minInput, secInput) {
    // Basic validation: no negative numbers
    hrInput.addEventListener('input', () => {
        if (hrInput.value < 0) hrInput.value = 0;
    });

    // Auto-carryover from minutes to hours (e.g., 70 min -> 1 hr 10 min)
    minInput.addEventListener('input', () => {
        if (minInput.value < 0) minInput.value = 0;
        if (minInput.value >= 60) {
            const hoursToAdd = Math.floor(minInput.value / 60);
            hrInput.value = parseInt(hrInput.value || 0) + hoursToAdd;
            minInput.value = minInput.value % 60;
            formatToTwoDigits(hrInput);
        }
    });
    
    // Auto-carryover from seconds to minutes, and potentially to hours
    secInput.addEventListener('input', () => {
        if (secInput.value < 0) secInput.value = 0;
        if (secInput.value >= 60) {
            const minutesToAdd = Math.floor(secInput.value / 60);
            minInput.value = parseInt(minInput.value || 0) + minutesToAdd;
            secInput.value = secInput.value % 60;
            // Re-check minutes in case seconds pushed it over 60
            if (minInput.value >= 60) {
                const hoursToAdd = Math.floor(minInput.value / 60);
                hrInput.value = parseInt(hrInput.value || 0) + hoursToAdd;
                minInput.value = minInput.value % 60;
                formatToTwoDigits(hrInput);
            }
            formatToTwoDigits(minInput);
        }
    });

    // Format inputs to two digits when the user clicks away
    const inputs = [hrInput, minInput, secInput];
    inputs.forEach(input => {
        input.addEventListener('blur', () => formatToTwoDigits(input));
    });
}

// Formats all time inputs on the page to have two digits
function formatInitialValues() {
    const allTimeInputs = document.querySelectorAll('.time-input-group input[type="number"]');
    allTimeInputs.forEach(input => formatToTwoDigits(input));
}

// --- SCRIPT INITIALIZATION ---

// Main event listener for the Start/Stop button
mainActionBtn.addEventListener('click', () => {
    // Decides which function to call based on the timer's current state
    if (isRunning) {
        stopAndRecord();
    } else {
        startTimer();
    }
});
cancelBtn.addEventListener('click', cancelTimer);
exportBtn.addEventListener('click', exportToPDF);

// Set up validation for all three time input groups
setupInputListeners(greenHrInput, greenMinInput, greenSecInput);
setupInputListeners(yellowHrInput, yellowMinInput, yellowSecInput);
setupInputListeners(redHrInput, redMinInput, redSecInput);

// Format the default time values when the page has finished loading
document.addEventListener('DOMContentLoaded', formatInitialValues);
