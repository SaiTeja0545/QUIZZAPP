
const API_URL = "https://quizzapp-9l86.onrender.com";

let questions = [];
let currentIndex = 0;
let score = 0;
let responses = [];
let totalTime = 300; // 5 minutes
let timerInterval;

// Elements
const instructionBox = document.getElementById("instructionBox");
const quizBox = document.getElementById("quizBox");
const startBtn = document.getElementById("startBtn");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const timerEl = document.getElementById("timer");
const questionNumberEl = document.getElementById("questionNumber");
const progressBar = document.getElementById("progressBar");

/* ---------------- START QUIZ ---------------- */
startBtn.addEventListener("click", async () => {
  // require a logged-in user before starting
  let user = null;
  try { if (typeof getCurrentUser === 'function') user = getCurrentUser(); } catch (e) {}
  if (!user) {
    try { user = JSON.parse(localStorage.getItem('quiz_user')); } catch (e) { user = null; }
  }
  if (!user) {
    // redirect to login if not authenticated
    try { location.href = 'quiz.html'; } catch (e) { window.location.href = 'quiz.html'; }
    return;
  }

  instructionBox.classList.add("hidden");
  quizBox.classList.remove("hidden");

  await fetchQuestions();
  responses = new Array(questions.length).fill(null);
  currentIndex = 0;
  score = 0;
  totalTime = 300;

  startTimer();
  loadQuestion();
});

/* ---------------- FETCH QUESTIONS ---------------- */
async function fetchQuestions() {
  const res = await fetch(API_URL);
  const data = await res.json();
  questions = data;
}

/* ---------------- LOAD QUESTION ---------------- */
function loadQuestion() {
  optionsEl.innerHTML = "";
  nextBtn.disabled = true;

  // Update Next/Submit button text using remaining unanswered count
  const unanswered = responses.filter(r => r === null).length;
  nextBtn.textContent = unanswered === 0 ? 'Submit' : 'Next';

  const q = questions[currentIndex];
  questionEl.innerText = q.question;
  questionNumberEl.innerText = `Question ${currentIndex + 1} of ${questions.length}`;

  progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.innerText = option;
    btn.onclick = () => selectAnswer(btn, option);
    optionsEl.appendChild(btn);
  });
}

/* Skip button removed: no-op */

/* ---------------- SELECT ANSWER ---------------- */
function selectAnswer(btn, selected) {
  // Record the user's selected answer and show immediate feedback
  responses[currentIndex] = selected;
  const buttons = optionsEl.querySelectorAll("button");
  buttons.forEach(b => {
    b.disabled = true;
    // highlight the correct answer
    if (b.innerText === questions[currentIndex].answer) {
      b.classList.add('correct');
    }
    // if user's selection is wrong, highlight it
    if (b.innerText === selected && selected !== questions[currentIndex].answer) {
      b.classList.add('wrong');
    }
  });
  nextBtn.disabled = false;
}

/* ---------------- NEXT BUTTON ---------------- */
nextBtn.addEventListener("click", () => {
  if (nextBtn.textContent === 'Submit') {
    showResult();
  } else {
    goNext();
  }
});

/* ---------------- QUESTION FLOW ---------------- */
function goNext() {
  currentIndex++;

  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

/* ---------------- SCORING / PERSIST ---------------- */
function calculateScore() {
  let s = 0;
  for (let i = 0; i < questions.length; i++) {
    if (responses[i] !== null && responses[i] === questions[i].answer) s++;
  }
  score = s;
}

function saveAttempt() {
  calculateScore();

  let user = null;
  try { if (typeof getCurrentUser === 'function') user = getCurrentUser(); } catch (e) {}
  if (!user) {
    try { user = JSON.parse(localStorage.getItem('quiz_user')); } catch (e) { user = null; }
  }
  const username = user && user.username ? user.username : '__anonymous';

  const all = JSON.parse(localStorage.getItem('quiz_attempts') || '{}');
  if (!all[username]) all[username] = [];

  const answers = questions.map((q, i) => ({
    question: q.question,
    selected: responses[i] === null ? null : responses[i],
    skipped: responses[i] === null,
    correct: responses[i] === questions[i].answer
  }));

  const attempt = {
    timestamp: new Date().toISOString(),
    username,
    score,
    total: questions.length,
    answers
  };

  all[username].push(attempt);
  localStorage.setItem('quiz_attempts', JSON.stringify(all));
}

/* ---------------- TIMER ---------------- */
function startTimer() {
  updateTimer();

  timerInterval = setInterval(() => {
    totalTime--;
    updateTimer();

    if (totalTime <= 0) {
      clearInterval(timerInterval);
      showResult();
    }
  }, 1000);
}

function updateTimer() {
  const m = Math.floor(totalTime / 60);
  const s = totalTime % 60;
  timerEl.innerText = `Time: ${m}:${s < 10 ? "0" : ""}${s}`;
}

/* ---------------- RESULT ---------------- */
function showResult() {
  clearInterval(timerInterval);
  saveAttempt();

   localStorage.setItem("quiz_completed", "true");
   
  

quizBox.innerHTML = `
  <h2>Quiz Completed</h2>
  <p>Your Score: <strong>${score} / ${questions.length}</strong></p>

  <div class="result-actions">
    <button class="btn-restart" onclick="location.href='index.html?start=1'">
      Restart Quiz
    </button>
    <button class="btn-score" onclick="location.href='score.html'">
      View Scorecard
    </button>
    <button class="btn-logout" onclick="logout()">
      Logout
    </button>
  </div>
`;
}

  // Render the most recent saved attempt for the current user (used when navigating back from score page)
  function renderLastResult() {
    try { clearInterval(timerInterval); } catch (e) {}

    let user = null;
    try { if (typeof getCurrentUser === 'function') user = getCurrentUser(); } catch (e) {}
    if (!user) {
      try { user = JSON.parse(localStorage.getItem('quiz_user')); } catch (e) { user = null; }
    }
    const username = user && user.username ? user.username : '__anonymous';

    const all = JSON.parse(localStorage.getItem('quiz_attempts') || '{}');
    const attempts = Array.isArray(all[username]) ? all[username] : [];
    const last = attempts.length ? attempts[attempts.length - 1] : null;

    if (!last) {
      instructionBox.classList.remove('hidden');
      quizBox.classList.add('hidden');
      return;
    }

    instructionBox.classList.add('hidden');
    quizBox.classList.remove('hidden');
    quizBox.innerHTML = `
      <h2>Quiz Result</h2>
      <p>Your Score: <strong>${last.score} / ${last.total}</strong></p>
      <button onclick="location.href='index.html?start=1'">Restart Quiz</button>
      <button onclick="history.back()">Back to Scorecard</button>
      <button onclick="location.href='score.html'">View Scorecard</button>
      <button onclick="logout()">Logout</button>
      `;
  }

// Auto-start when `?start=1` present in URL
try {
  const params = new URLSearchParams(window.location.search);
  if (params.get('start') === '1') {
    // only auto-start when a user is logged in
    const stored = localStorage.getItem('quiz_user');
    if (stored) {
      // small timeout to ensure handlers are registered and DOM is ready
      setTimeout(() => startBtn.click(), 50);
    }
  }
} catch (e) {}
// If loaded with #result hash, render the last saved attempt
try {
  if (window.location.hash === '#result') {
    setTimeout(renderLastResult, 50);
  }
} catch (e) {}
