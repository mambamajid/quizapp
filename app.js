// Simple quiz data - you can replace with API calls later
const quizData = {
    questions: [
        {
            number: 1,
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correct: 1
        },
        {
            number: 2,
            question: "Which language runs in browsers?",
            options: ["Java", "C", "Python", "JavaScript"],
            correct: 3
        }
    ]
};

// App state
const state = {
    currentQuestion: 0,
    score: 0,
    startTime: null,
    studentName: ""
};

// Initialize app
function init() {
    document.getElementById('app-container').innerHTML = templates.mainMenu();
    document.getElementById('start-form').addEventListener('submit', startQuiz);
}

// Start quiz handler
function startQuiz(e) {
    e.preventDefault();
    state.studentName = document.getElementById('student-name').value;
    state.startTime = Date.now();
    state.currentQuestion = 0;
    state.score = 0;
    showQuestion();
    startTimer();
}

// Show current question
function showQuestion() {
    const question = quizData.questions[state.currentQuestion];
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    
    document.getElementById('app-container').innerHTML = templates.quizQuestion({
        ...question,
        time: elapsed,
        score: state.score
    });

    // Add event listeners to options
    document.querySelectorAll('.btn-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            checkAnswer(parseInt(e.target.dataset.option));
        });
    });
}

// Check answer
function checkAnswer(selectedIndex) {
    const question = quizData.questions[state.currentQuestion];
    if (selectedIndex === question.correct) {
        state.score += 50; // 50 points per question
        alert("Correct!");
    } else {
        alert(`Wrong! The correct answer was: ${question.options[question.correct]}`);
    }
    
    state.currentQuestion++;
    if (state.currentQuestion < quizData.questions.length) {
        showQuestion();
    } else {
        endQuiz();
    }
}

// Timer
function startTimer() {
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const timer = document.querySelector('.timer-display');
        if (timer) timer.textContent = `${elapsed}s`;
    }, 1000);
}

// End quiz
function endQuiz() {
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const passed = state.score >= 80;
    
    document.getElementById('app-container').innerHTML = `
        <div class="quiz-card card">
            <div class="card-header ${passed ? 'bg-success' : 'bg-danger'} text-white">
                <h2>Quiz Complete!</h2>
            </div>
            <div class="card-body text-center">
                <h3>${passed ? 'Congratulations' : 'Sorry'}, ${state.studentName}!</h3>
                <p>Your score: ${state.score}%</p>
                <p>Time: ${elapsed} seconds</p>
                <button class="btn btn-primary" onclick="window.location.reload()">
                    Try Again
                </button>
            </div>
        </div>
    `;
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
