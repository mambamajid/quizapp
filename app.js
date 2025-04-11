// --------- Template Compilation ---------
const homeTemplateSrc = document.getElementById('home-template').innerHTML;
const questionMCTemplateSrc = document.getElementById('question-mc-template').innerHTML;
const questionTextTemplateSrc = document.getElementById('question-text-template').innerHTML;
const questionImgTemplateSrc = document.getElementById('question-img-template').innerHTML;
const resultTemplateSrc = document.getElementById('result-template').innerHTML;

const homeTemplate = Handlebars.compile(homeTemplateSrc);
const questionMCTemplate = Handlebars.compile(questionMCTemplateSrc);
const questionTextTemplate = Handlebars.compile(questionTextTemplateSrc);
const questionImgTemplate = Handlebars.compile(questionImgTemplateSrc);
const resultTemplate = Handlebars.compile(resultTemplateSrc);

// --------- Global Variables ---------
let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let questionsAnswered = 0;
let timerInterval = null;
let startTime = null;
let userName = "";

// Data for home template (quiz titles)
const homeData = {
  quiz1Name: "JavaScript Basics",
  quiz2Name: "Python Basics"
};

// --------- Initialization ---------
function init() {
  renderHome();
}
  
// Render Home Screen and bind events
function renderHome() {
  document.getElementById('app').innerHTML = homeTemplate(homeData);
  // Hide scoreboard until quiz starts
  document.getElementById('scoreboard').classList.add('d-none');
  
  // Bind event for quiz start
  const nameInput = document.getElementById('username');
  document.querySelectorAll('.start-quiz-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedQuizId = btn.getAttribute('data-quiz');
      const nameVal = nameInput.value.trim();
      if (!nameVal) {
        alert("Please enter your name to start the quiz.");
        return;
      }
      startQuiz(selectedQuizId, nameVal);
    });
  });
}

// --------- Quiz Functions ---------
function startQuiz(quizId, name) {
  userName = name;
  // Fetch quiz data from JSONPlaceholder; replace 'your-username' with your GitHub username
  fetch(`https://my-json-server.typicode.com/your-username/quiz-data/quizzes/${quizId}`)
    .then(response => response.json())
    .then(data => {
      currentQuiz = data;
      currentQuestionIndex = 0;
      score = 0;
      questionsAnswered = 0;
      // Update scoreboard total questions
      document.getElementById('total').innerText = currentQuiz.questions.length;
      document.getElementById('score').innerText = 0;
      document.getElementById('count').innerText = 0;
      document.getElementById('time').innerText = "0:00";
      // Show scoreboard
      document.getElementById('scoreboard').classList.remove('d-none');
      // Start timer
      startTime = Date.now();
      timerInterval = setInterval(updateTime, 1000);
      // Show first question
      showQuestion();
    })
    .catch(err => {
      console.error("Failed to load quiz data:", err);
      alert("Oops, unable to load quiz data. Please try again later.");
    });
}

function updateTime() {
  if (!startTime) return;
  const elapsedMs = Date.now() - startTime;
  const seconds = Math.floor(elapsedMs / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${mins}:${secs < 10 ? "0" + secs : secs}`;
  document.getElementById('time').innerText = formatted;
}

function showQuestion() {
  const questionObj = currentQuiz.questions[currentQuestionIndex];
  let html = "";
  if (questionObj.type === "multiple-choice") {
    html = questionMCTemplate(questionObj);
  } else if (questionObj.type === "text") {
    html = questionTextTemplate(questionObj);
  } else if (questionObj.type === "image") {
    html = questionImgTemplate(questionObj);
  }
  document.getElementById('app').innerHTML = html;
  
  // Bind answer events
  if (questionObj.type === "multiple-choice") {
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn.getAttribute('data-value')));
    });
  } else if (questionObj.type === "text") {
    document.getElementById('submit-answer').addEventListener('click', () => {
      const answerVal = document.getElementById('text-answer').value.trim();
      handleAnswer(answerVal);
    });
    // Submit on Enter key
    document.getElementById('text-answer').addEventListener('keyup', (e) => {
      if (e.key === "Enter") {
        const answerVal = e.target.value.trim();
        handleAnswer(answerVal);
      }
    });
  } else if (questionObj.type === "image") {
    document.querySelectorAll('.img-option').forEach(img => {
      img.addEventListener('click', () => handleAnswer(img.getAttribute('data-value')));
    });
  }
}

function handleAnswer(userAnswer) {
  const questionObj = currentQuiz.questions[currentQuestionIndex];
  questionsAnswered++;
  document.getElementById('count').innerText = questionsAnswered;
  const correctAnswer = questionObj.answer;
  const isCorrect = (userAnswer + "").toLowerCase() === (correctAnswer + "").toLowerCase();
  
  if (isCorrect) {
    score++;
    document.getElementById('score').innerText = score;
    const feedbackElem = document.getElementById('feedback-text');
    if (feedbackElem) {
      feedbackElem.innerText = "✅ Awesome! That's correct.";
      feedbackElem.classList.add('text-success');
      document.getElementById('feedback').style.display = 'block';
    }
    // Move to next question automatically after 1 second
    setTimeout(() => {
      nextStep();
    }, 1000);
  } else {
    const feedbackElem = document.getElementById('feedback-text');
    if (feedbackElem) {
      feedbackElem.innerHTML = `❌ Not quite. ${questionObj.explanation}`;
      feedbackElem.classList.add('text-danger');
      document.getElementById('feedback').style.display = 'block';
      const gotItBtn = document.getElementById('feedback-button');
      if (gotItBtn) {
        gotItBtn.addEventListener('click', () => {
          nextStep();
        });
      }
    }
  }
  // Disable answer inputs
  if (questionObj.type === "multiple-choice") {
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
  } else if (questionObj.type === "text") {
    document.getElementById('submit-answer').disabled = true;
  } else if (questionObj.type === "image") {
    document.querySelectorAll('.img-option').forEach(img => {
      img.style.pointerEvents = 'none';
    });
  }
}

function nextStep() {
  if (currentQuestionIndex < currentQuiz.questions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  clearInterval(timerInterval);
  timerInterval = null;
  const totalQuestions = currentQuiz.questions.length;
  const percent = Math.round((score / totalQuestions) * 100);
  let heading = "";
  let message = "";
  
  if (percent >= 80) {
    heading = "🎉 Congratulations!";
    message = "You passed the quiz.";
  } else {
    heading = "Quiz Completed";
    message = "Better luck next time. You did not reach 80%.";
  }
  
  const resultData = {
    name: userName,
    score: score,
    total: totalQuestions,
    percent: percent,
    resultHeading: heading,
    resultMessage: message
  };
  
  document.getElementById('app').innerHTML = resultTemplate(resultData);
  document.getElementById('scoreboard').classList.add('d-none');
  
  // Bind result screen buttons
  document.getElementById('retake-btn').addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;
    questionsAnswered = 0;
    document.getElementById('scoreboard').classList.remove('d-none');
    document.getElementById('score').innerText = 0;
    document.getElementById('count').innerText = 0;
    startTime = Date.now();
    timerInterval = setInterval(updateTime, 1000);
    showQuestion();
  });
  
  document.getElementById('home-btn').addEventListener('click', () => {
    currentQuiz = null;
    currentQuestionIndex = 0;
    score = 0;
    questionsAnswered = 0;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    document.getElementById('scoreboard').classList.add('d-none');
    renderHome();
  });
}

// --------- Start the App ---------
init();
