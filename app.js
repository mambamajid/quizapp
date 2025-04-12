let currentQuestionIndex = 0;
let quizData = [];
let studentName = '';
let score = 0;
let totalQuestions = 0;
let timerInterval;
let startTime;

// Register 'eq' helper for Handlebars
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

// Utility: Format timer as mm:ss
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Timer Setup
function startTimer() {
  const timerDisplay = document.getElementById('timer');
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = formatTime(elapsed);
  }, 1000);
}

// Load and Compile Handlebars Template
async function loadTemplate(name) {
  const res = await fetch(`${name}.handlebars`);
  const src = await res.text();
  return Handlebars.compile(src);
}

// Load Quiz from JSONPlaceholder
async function loadQuizData() {
  const response = await fetch('https://my-json-server.typicode.com/YOUR_USERNAME/YOUR_REPO/quiz1');
  quizData = await response.json();
  totalQuestions = quizData.length;
  document.getElementById('total-questions').textContent = totalQuestions;
}

// Show Welcome Screen
async function renderWelcome() {
  const template = await loadTemplate('welcome');
  document.getElementById('app').innerHTML = template();
}

// Show Quiz Question
async function renderQuestion() {
  const template = await loadTemplate('quiz');
  const question = quizData[currentQuestionIndex];
  const html = template(question);
  document.getElementById('app').innerHTML = html;
  document.getElementById('current-question').textContent = currentQuestionIndex + 1;
}

// Show Result Screen
async function renderResult() {
  clearInterval(timerInterval);
  const template = await loadTemplate('result');
  const passed = (score / totalQuestions) >= 0.8;
  const html = template({ name: studentName, passed });
  document.getElementById('app').innerHTML = html;
  document.getElementById('scoreboard').classList.add('d-none');
}

// Handle Answer Logic
function handleAnswer(isCorrect, explanation = '') {
  if (isCorrect) {
    score++;
    document.getElementById('score').textContent = score;
    const message = document.createElement('div');
    message.className = 'correct-message';
    message.textContent = 'Awesome!';
    document.getElementById('app').appendChild(message);

    setTimeout(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < quizData.length) {
        renderQuestion();
      } else {
        renderResult();
      }
    }, 1000);
  } else {
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.innerHTML = `<p>${explanation}</p><button class="btn btn-primary mt-2">Got it</button>`;
    document.getElementById('app').appendChild(feedback);

    feedback.querySelector('button').addEventListener('click', () => {
      currentQuestionIndex++;
      if (currentQuestionIndex < quizData.length) {
        renderQuestion();
      } else {
        renderResult();
      }
    });
  }
}

// Global Event Delegation
document.addEventListener('click', async (e) => {
  // Start Quiz
  if (e.target.matches('#startQuiz')) {
    e.preventDefault();
    studentName = document.getElementById('studentName').value.trim();
    if (!studentName) return alert('Please enter your name');

    await loadQuizData();
    document.getElementById('scoreboard').classList.remove('d-none');
    document.getElementById('score').textContent = 0;
    currentQuestionIndex = 0;
    score = 0;
    startTimer();
    renderQuestion();
  }

  // Multiple Choice Answer
  if (e.target.matches('.choice-btn')) {
    const selected = e.target.dataset.value;
    const correct = quizData[currentQuestionIndex].answer;
    handleAnswer(selected === correct, `Correct answer: ${correct}`);
  }

  // Narrative Answer
  if (e.target.matches('#submitNarrative')) {
    const input = document.getElementById('narrativeInput').value.trim().toLowerCase();
    const correct = quizData[currentQuestionIndex].answer.toLowerCase();
    handleAnswer(input === correct, `The right answer was: ${quizData[currentQuestionIndex].answer}`);
  }

  // Image Option Answer
  if (e.target.matches('.img-option')) {
    const selected = e.target.dataset.value;
    const correct = quizData[currentQuestionIndex].answer;
    handleAnswer(selected === correct, `Correct image was for: ${correct}`);
  }

  // Retake Quiz
  if (e.target.matches('#retake')) {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('score').textContent = 0;
    startTimer();
    renderQuestion();
  }

  // Return Home
  if (e.target.matches('#goHome')) {
    clearInterval(timerInterval);
    currentQuestionIndex = 0;
    score = 0;
    renderWelcome();
  }
});

// Start App
renderWelcome();
