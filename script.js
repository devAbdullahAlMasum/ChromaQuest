let timer = document.getElementsByClassName("timer")[0];
let quizContainer = document.getElementById("container");
let nextButton = document.getElementById("next-button");
let numOfQuestions = document.getElementsByClassName("number-of-questions")[0];
let displayContainer = document.getElementById("display-container");
let scoreContainer = document.querySelector(".score-container");
let restart = document.getElementById("restart");
let userScore = document.getElementById("user-score");
let startScreen = document.querySelector(".start-screen");
let startButton = document.getElementById("start-button");
let difficultyButtons = document.querySelectorAll('.difficulty-btn');
let streakCounter = document.querySelector('.streak-counter');

// Game Variables
let questionCount = 0;
let scoreCount = 0;
let count = 10;
let countdown;
let streak = 0;
let quizArray = [];
let currentDifficulty = 'medium';

// Game configuration
const DIFFICULTY_LEVELS = {
    easy: {
        time: 15,
        colors: 4,
        variation: 60,
        baseScore: 10,
        timeBonus: 1,    // Points per second remaining
        streakBonus: 2   // Points per streak level
    },
    medium: {
        time: 10,
        colors: 4,
        variation: 40,
        baseScore: 15,
        timeBonus: 2,
        streakBonus: 3
    },
    hard: {
        time: 7,
        colors: 6,
        variation: 20,
        baseScore: 20,
        timeBonus: 3,
        streakBonus: 4
    }
};

// Color Generation Functions
const generateHexColor = () => {
    const hex = Math.floor(Math.random() * 16777216).toString(16);
    return '#' + '0'.repeat(6 - hex.length) + hex;
};

const clamp = (num) => Math.min(255, Math.max(0, Math.round(num)));

const hexToRGB = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
};

const rgbToHex = ({ r, g, b }) =>
    '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

const generateSimilarColors = (baseColor, count) => {
    const colors = [baseColor];
    const rgb = hexToRGB(baseColor);
    const variation = DIFFICULTY_LEVELS[currentDifficulty].variation;

    while (colors.length < count) {
        const newColor = {
            r: clamp(rgb.r + (Math.random() - 0.5) * variation * 2),
            g: clamp(rgb.g + (Math.random() - 0.5) * variation * 2),
            b: clamp(rgb.b + (Math.random() - 0.5) * variation * 2)
        };
        colors.push(rgbToHex(newColor));
    }

    // Shuffle the array to randomize the position of the correct answer
    return colors.sort(() => Math.random() - 0.5);
};

// Quiz Functions
const populateQuiz = () => {
    quizArray = [];
    for (let i = 0; i < 10; i++) {
        const correctColor = generateHexColor();
        const options = generateSimilarColors(correctColor, DIFFICULTY_LEVELS[currentDifficulty].colors);
        quizArray.push({
            correct: correctColor,
            options: options
        });
    }
};

const quizDisplay = (questionCount) => {
    const quizCards = document.querySelectorAll(".container-mid");
    quizCards.forEach(card => {
        card.classList.add("hide");
        const options = card.querySelectorAll(".option-div");
        options.forEach(option => {
            option.classList.remove("correct", "incorrect");
            option.style.pointerEvents = 'auto';
        });
    });

    if (quizCards[questionCount]) {
        quizCards[questionCount].classList.remove("hide");
    }
};

function quizCreator() {
    quizContainer.innerHTML = "";
    quizArray.forEach((question, index) => {
        const div = document.createElement("div");
        div.classList.add("container-mid");
        if (index !== 0) div.classList.add("hide");

        const questionDiv = document.createElement("p");
        questionDiv.classList.add("question");
        questionDiv.innerHTML = `<div class="question-color">${question.correct}</div>`;
        div.appendChild(questionDiv);

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        // Create all buttons first and store them in an array
        const buttons = question.options.map(color => {
            const button = document.createElement("button");
            button.classList.add("option-div");
            button.setAttribute("data-option", color);
            button.style.backgroundColor = color;
            button.addEventListener('click', function() {
                checker(this);
            });
            return button;
        });

        // Shuffle the buttons array
        buttons.sort(() => Math.random() - 0.5);

        // Append the shuffled buttons
        buttons.forEach(button => buttonContainer.appendChild(button));

        div.appendChild(buttonContainer);
        quizContainer.appendChild(div);
    });

    updateQuestionNumber();
}

function updateQuestionNumber() {
    numOfQuestions.textContent = `${questionCount + 1} of ${quizArray.length} Question`;
}

function updateStreakDisplay() {
    streakCounter.textContent = `Streak: ${streak}`;
}

// Timer Function
const timerDisplay = () => {
    clearInterval(countdown);
    count = DIFFICULTY_LEVELS[currentDifficulty].time;

    countdown = setInterval(() => {
        timer.innerHTML = `<span>Time Left: </span>${count}s`;
        if (count === 0) {
            clearInterval(countdown);
            displayNext();
        }
        count--;
    }, 1000);
};

// Game Logic Functions
function checker(userOption) {
    clearInterval(countdown);
    const userSolution = userOption.getAttribute("data-option");
    const correctAnswer = quizArray[questionCount].correct;
    const currentQuestion = document.querySelector(".container-mid:not(.hide)");
    const options = currentQuestion.querySelectorAll(".option-div");
    const difficultyConfig = DIFFICULTY_LEVELS[currentDifficulty];

    options.forEach(option => {
        option.style.pointerEvents = 'none';
        if (option.getAttribute("data-option") === correctAnswer) {
            option.classList.add("correct");
        }
    });

    if (userSolution === correctAnswer) {
        userOption.classList.add("correct");
        streak++;

        // Calculate bonuses
        const baseScore = difficultyConfig.baseScore;
        const timeBonus = Math.floor(count * difficultyConfig.timeBonus);
        const streakBonus = Math.floor(streak * difficultyConfig.streakBonus);
        const totalScore = baseScore + timeBonus + streakBonus;

        scoreCount += totalScore;
        showBonus(`+${totalScore} (Base: ${baseScore}, Time: +${timeBonus}, Streak: +${streakBonus})`);
    } else {
        userOption.classList.add("incorrect");
        streak = 0;
    }

    updateStreakDisplay();
    nextButton.classList.remove("hide");
}

function showBonus(text) {
    const bonusDiv = document.createElement('div');
    bonusDiv.classList.add('bonus-text');
    bonusDiv.textContent = text;
    quizContainer.appendChild(bonusDiv);
    setTimeout(() => bonusDiv.remove(), 1500);
}

function displayNext() {
    questionCount++;
    if (questionCount >= quizArray.length) {
        displayContainer.classList.add("hide");
        scoreContainer.classList.remove("hide");

        // Check for high score
        if (scoreCount > highScores[currentDifficulty]) {
            highScores[currentDifficulty] = scoreCount;
            localStorage.setItem('colorGameHighScores', JSON.stringify(highScores));
            userScore.textContent = `New High Score: ${scoreCount}! 🎉`;
        } else {
            userScore.textContent = `Your score is ${scoreCount} (High Score: ${highScores[currentDifficulty]})`;
        }
    } else {
        quizDisplay(questionCount);
        count = DIFFICULTY_LEVELS[currentDifficulty].time;
        clearInterval(countdown);
        timerDisplay();
        updateQuestionNumber();
        nextButton.classList.add("hide");

        const currentOptions = document.querySelectorAll(".container-mid:not(.hide) .option-div");
        currentOptions.forEach(option => {
            option.classList.remove("correct", "incorrect");
            option.style.pointerEvents = 'auto';
        });
    }
}

function initial() {
    quizContainer.innerHTML = "";
    questionCount = 0;
    scoreCount = 0;
    streak = 0;
    clearInterval(countdown);
    populateQuiz();
    quizCreator();
    timerDisplay();
    updateStreakDisplay();
}

// Event Listeners
nextButton.addEventListener("click", displayNext);

startButton.addEventListener("click", () => {
    startScreen.classList.add("hide");
    displayContainer.classList.remove("hide");
    initial();
});

restart.addEventListener("click", () => {
    scoreContainer.classList.add("hide");
    displayContainer.classList.remove("hide");
    initial();
});

difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentDifficulty = button.dataset.difficulty;
        difficultyButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        initial();
    });
});

// Initialize game
window.onload = () => {
    const mediumButton = document.querySelector('[data-difficulty="medium"]');
    if (mediumButton) {
        mediumButton.classList.add('active');
    }
};

// Add a high score system
let highScores = JSON.parse(localStorage.getItem('colorGameHighScores')) || {
    easy: 0,
    medium: 0,
    hard: 0
};

// Add this event listener after your other event listeners
document.querySelector('.logo-link').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default link behavior

    // Reset game state
    scoreContainer.classList.add("hide");
    displayContainer.classList.add("hide");
    startScreen.classList.remove("hide");

    // Reset scores and counters
    scoreCount = 0;
    questionCount = 0;
    streak = 0;

    // Clear any running timers
    clearInterval(countdown);

    // Reset difficulty to medium
    currentDifficulty = 'medium';
    difficultyButtons.forEach(btn => btn.classList.remove('active'));
    const mediumButton = document.querySelector('[data-difficulty="medium"]');
    if (mediumButton) {
        mediumButton.classList.add('active');
    }

    // Update displays
    updateStreakDisplay();
});
