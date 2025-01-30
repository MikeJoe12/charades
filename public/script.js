// Game state
let categories = {};
let currentWord = '';
let timerInterval;
let isPlaying = false;

// DOM elements
const categorySelect = document.getElementById('category-select');
const timerSlider = document.getElementById('timer-slider');
const timerValue = document.getElementById('timer-value');
const currentWordDisplay = document.getElementById('current-word');
const timerDisplay = document.getElementById('timer');
const shuffleBtn = document.getElementById('shuffle-btn');
const timerBtn = document.getElementById('timer-btn');

// Function to send timer update to server
function sendTimerUpdate(timeString) {
    fetch('/api/timer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer: timeString })
    });
}

// Detailed fetch with error handling
async function fetchWords() {
    try {
        const response = await fetch('/api/words', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        categories = await response.json();
        
        // Enable controls once words are loaded
        categorySelect.disabled = false;
        shuffleBtn.disabled = false;
        currentWordDisplay.textContent = '...';
    } catch (error) {
        currentWordDisplay.textContent = `Error loading words: ${error.message}
        
        Troubleshooting:
        1. Ensure server is running
        2. Check network connection
        3. Verify Excel file exists`;
    }
}

// Load words when page loads
window.addEventListener('load', fetchWords);

// Timer slider handling
timerSlider.addEventListener('input', (e) => {
    const seconds = e.target.value;
    timerValue.textContent = seconds;
    timerDisplay.textContent = formatTime(seconds);
    
    // Send timer update to server
    sendTimerUpdate(formatTime(seconds));
});

// Shuffle button handling
shuffleBtn.addEventListener('click', () => {
    const selectedCategory = categorySelect.value;
    if (selectedCategory && categories[selectedCategory]?.length > 0) {
        const randomIndex = Math.floor(Math.random() * categories[selectedCategory].length);
        currentWord = categories[selectedCategory][randomIndex];
        currentWordDisplay.textContent = currentWord;
        
        // Reset timer
        stopTimer();
        timerDisplay.textContent = formatTime(timerSlider.value);
        timerBtn.disabled = false;
        
        // Send timer update to server
        sendTimerUpdate(formatTime(timerSlider.value));
    } else {
        currentWordDisplay.textContent = 'Please select a category first';
    }
});

// Timer button handling
timerBtn.addEventListener('click', () => {
    if (!isPlaying) {
        startTimer();
        timerBtn.textContent = 'Pause';
    } else {
        stopTimer();
        timerBtn.textContent = 'Start';
    }
    isPlaying = !isPlaying;
});

// Timer functions
function startTimer() {
    let timeLeft = parseInt(timerSlider.value);
    timerDisplay.textContent = formatTime(timeLeft);
    
    // Send initial timer update to server
    sendTimerUpdate(formatTime(timeLeft));
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);
        
        // Send timer update to server
        sendTimerUpdate(formatTime(timeLeft));
        
        if (timeLeft <= 0) {
            stopTimer();
            timerBtn.textContent = 'Start';
            isPlaying = false;
            
            // Send final timer update to server
            sendTimerUpdate(formatTime(0));
            
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}