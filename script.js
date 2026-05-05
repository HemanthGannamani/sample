/**
 * TypeTester Logic
 * Handles game state, typing mechanics, and results calculation
 */

// Collection of varied paragraphs for the test
const paragraphs = [
    "The art of programming is the art of organizing complexity, of mastering multitude and avoiding its bastard chaos as effectively as possible.",
    "Design is not just what it looks like and feels like. Design is how it works. Good design is obvious. Great design is transparent.",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    "Web development is an ever-evolving field. Staying updated with the latest technologies, frameworks, and best practices is crucial for success.",
    "Typography is the work of typesetters, compositors, typographers, graphic designers, art directors, and anyone who arranges words, letters, numbers, and symbols for publication.",
    "Continuous learning is the minimum requirement for success in any field. The mind is just like a muscle - the more you exercise it, the stronger it gets and the more it can expand.",
    "Innovation distinguishes between a leader and a follower. Your time is limited, so don't waste it living someone else's life."
];

// DOM Element References
const textDisplay = document.getElementById('text-display');
const textInput = document.getElementById('text-input');
const typingArea = document.getElementById('typing-area');
const timeElement = document.getElementById('time');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const restartBtn = document.getElementById('restart-btn');
const modalRestartBtn = document.getElementById('modal-restart-btn');
const resultsModal = document.getElementById('results-modal');
const finalWpmElement = document.getElementById('final-wpm');
const finalAccuracyElement = document.getElementById('final-accuracy');
const finalTimeElement = document.getElementById('final-time');

// Application State
let timer = null;
let timeElapsed = 0;
let isTyping = false;
let currentParagraph = "";
let characterArray = [];

/**
 * Initializes or resets the typing test.
 * Selects a new paragraph, resets timers, and clears input.
 */
function initTest() {
    // Reset internal state
    isTyping = false;
    timeElapsed = 0;
    clearInterval(timer);
    
    // Reset UI elements
    textInput.value = "";
    timeElement.innerText = "0s";
    wpmElement.innerText = "0";
    accuracyElement.innerText = "100%";
    resultsModal.classList.add('hidden');
    
    // Select a random paragraph ensuring it's different from the previous if possible
    let newParagraph = currentParagraph;
    while(newParagraph === currentParagraph) {
        const randomIndex = Math.floor(Math.random() * paragraphs.length);
        newParagraph = paragraphs[randomIndex];
    }
    currentParagraph = newParagraph;
    
    // Clear display and render text with individual <span> elements per character
    textDisplay.innerHTML = "";
    currentParagraph.split('').forEach(char => {
        const span = document.createElement('span');
        span.innerText = char;
        textDisplay.appendChild(span);
    });
    
    // Cache the spans array for faster access during typing
    characterArray = textDisplay.querySelectorAll('span');
    
    // Highlight the first character to show the user where to start
    if (characterArray.length > 0) {
        characterArray[0].classList.add('active');
    }
    
    // Automatically focus the hidden input field
    textInput.focus();
}

/**
 * Handles input events fired when the user types in the textarea.
 * Calculates correctness, updates UI classes, and calculates real-time metrics.
 */
function handleTyping() {
    const typedText = textInput.value;
    const typedArray = typedText.split('');
    
    // Start the timer on the very first keystroke
    if (!isTyping && typedText.length > 0) {
        isTyping = true;
        startTimer();
    }
    
    let correctCount = 0;
    let mistakes = 0;

    // Iterate through all characters to evaluate correctness
    characterArray.forEach((charSpan, index) => {
        const typedChar = typedArray[index];
        
        // Remove the active cursor class from all characters
        charSpan.classList.remove('active');

        if (typedChar == null) {
            // Character has not been typed yet
            charSpan.classList.remove('correct');
            charSpan.classList.remove('incorrect');
        } else if (typedChar === charSpan.innerText) {
            // Character typed correctly
            charSpan.classList.add('correct');
            charSpan.classList.remove('incorrect');
            correctCount++;
        } else {
            // Character typed incorrectly
            charSpan.classList.add('incorrect');
            charSpan.classList.remove('correct');
            mistakes++;
        }
    });

    // Move the active cursor class to the current typing position
    if (typedText.length < characterArray.length) {
        characterArray[typedText.length].classList.add('active');
    } else if (typedText.length >= characterArray.length) {
        // If typed text length matches the paragraph length, the test is complete
        // We prevent the input from exceeding the text length
        textInput.value = typedText.substring(0, characterArray.length);
    }

    // --- Calculate Accuracy ---
    let totalTyped = typedText.length;
    let accuracy = 100;
    if (totalTyped > 0) {
        accuracy = Math.round(((totalTyped - mistakes) / totalTyped) * 100);
    }
    accuracyElement.innerText = `${accuracy}%`;

    // --- Calculate WPM (Words Per Minute) ---
    // Standard metric assumes 5 characters = 1 word
    if (timeElapsed > 0) {
        const wordsTyped = totalTyped / 5;
        const minutes = timeElapsed / 60;
        const wpm = Math.round(wordsTyped / minutes);
        wpmElement.innerText = wpm;
    }

    // Check completion condition
    if (typedText.length === characterArray.length) {
        endTest(totalTyped, accuracy);
    }
}

/**
 * Starts the interval timer for tracking elapsed time and real-time WPM
 */
function startTimer() {
    timer = setInterval(() => {
        timeElapsed++;
        timeElement.innerText = `${timeElapsed}s`;
        
        // Recalculate WPM every second to keep it updating even if user pauses
        const typedText = textInput.value;
        if (typedText.length > 0) {
            const wordsTyped = typedText.length / 5;
            const minutes = timeElapsed / 60;
            const wpm = Math.round(wordsTyped / minutes);
            wpmElement.innerText = wpm;
        }
    }, 1000);
}

/**
 * Ends the test, calculates final metrics, and displays the results modal
 * @param {number} totalTyped - Total number of characters typed
 * @param {number} accuracy - Final accuracy percentage
 */
function endTest(totalTyped, accuracy) {
    clearInterval(timer);
    isTyping = false;
    textInput.blur(); // Remove focus so keyboard hides on mobile

    // Calculate final WPM
    const wordsTyped = totalTyped / 5;
    const minutes = timeElapsed / 60;
    const finalWpm = timeElapsed > 0 ? Math.round(wordsTyped / minutes) : 0;

    // Populate modal with final results
    finalWpmElement.innerText = finalWpm;
    finalAccuracyElement.innerText = accuracy;
    finalTimeElement.innerText = timeElapsed;
    
    // Show the results modal
    resultsModal.classList.remove('hidden');
}

// --- Event Listeners Setup ---

// Listen for typing input
textInput.addEventListener('input', handleTyping);

// Listen for restart clicks
restartBtn.addEventListener('click', initTest);
modalRestartBtn.addEventListener('click', initTest);

// Ensure the invisible input keeps focus when the user clicks the typing area
typingArea.addEventListener('click', () => {
    textInput.focus();
});

// Prevent backspace from navigating back in some browsers if it bubbles up
document.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && e.target !== textInput) {
        e.preventDefault();
        textInput.focus();
    }
});

// Initialize the app when the window loads
window.addEventListener('load', initTest);
