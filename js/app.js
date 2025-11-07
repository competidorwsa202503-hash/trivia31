// app.js
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

const matchesEl = document.getElementById('matches');
const correctsEl = document.getElementById('corrects');
const wrongsEl = document.getElementById('wrongs');

const qNumberEl = document.getElementById('q-number');
const questionText = document.getElementById('question-text');
const questionCategory = document.getElementById('question-category');
const answersEl = document.getElementById('answers');
const timerEl = document.getElementById('timer');
const timerFill = document.getElementById('timer-fill');
const nextBtn = document.getElementById('next-btn');
const hintBtn = document.getElementById('hint-btn');

const rMatches = document.getElementById('r-matches');
const rCorrects = document.getElementById('r-corrects');
const rWrongs = document.getElementById('r-wrongs');
const playAgain = document.getElementById('play-again');

const LOCAL_KEY = 'xx_trivia_stats_v1';

let questions = [];
let selectedQuestions = [];
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let matches = 0;
let timerSeconds = 20;
let timerInterval = null;
let answered = false;

function loadStats(){
  const raw = localStorage.getItem(LOCAL_KEY);
  if(raw){
    const obj = JSON.parse(raw);
    matches = obj.matches || 0;
    correctCountTotal = obj.corrects || 0;
    wrongCountTotal = obj.wrongs || 0;
    matchesEl.textContent = matches;
    correctsEl.textContent = correctCountTotal;
    wrongsEl.textContent = wrongCountTotal;
  } else {
    matches = 0;
    localStorage.setItem(LOCAL_KEY, JSON.stringify({matches:0,corrects:0,wrongs:0}));
    matchesEl.textContent = 0;
    correctsEl.textContent = 0;
    wrongsEl.textContent = 0;
  }
}
loadStats();

async function fetchQuestions(){
  try{
    const res = await fetch('questions.json');
    questions = await res.json();
  }catch(e){
    console.error('No se pudo cargar questions.json:', e);
    questions = [];
  }
}

function pickRandomQuestions(n = 6){
  const copy = [...questions];
  for(let i = copy.length -1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]] = [copy[j],copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

function startGame(){
  if(questions.length === 0){
    alert('No hay preguntas cargadas. Revisa questions.json');
    return;
  }
  selectedQuestions = pickRandomQuestions(6);
  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  startScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  renderQuestion();
  incrementMatchesStart();
  playSound('start'); // 🎵 sonido de inicio
}

function incrementMatchesStart(){
  matches++;
  const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  raw.matches = matches;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(raw));
  matchesEl.textContent = matches;
}

function renderQuestion(){
  answered = false;
  nextBtn.disabled = true;
  const q = selectedQuestions[currentIndex];
  qNumberEl.textContent = `${currentIndex+1} / ${selectedQuestions.length}`;
  questionCategory.textContent = q.category;
  questionText.textContent = q.question;
  answersEl.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'answer';
    btn.textContent = opt; // ✅ evita interpretar HTML
    btn.dataset.index = idx;
    btn.addEventListener('click', onSelectAnswer);
    answersEl.appendChild(btn);
  });
  startTimer();
}

function startTimer(){
  clearInterval(timerInterval);
  let timeLeft = timerSeconds;
  updateTimerUI(timeLeft);
  timerInterval = setInterval(()=>{
    timeLeft--;
    if(timeLeft < 0){
      clearInterval(timerInterval);
      onTimeUp();
    } else {
      updateTimerUI(timeLeft);
    }
  },1000);
}

function updateTimerUI(timeLeft){
  timerEl.textContent = String(timeLeft).padStart(2,'0');
  const pct = (timeLeft / timerSeconds) * 100;
  timerFill.style.width = pct + '%';
}

function onTimeUp(){
  if(answered) return;
  answered = true;
  revealCorrectAndMark(null, true);
  nextBtn.disabled = false;
}

function onSelectAnswer(e){
  if(answered) return;
  answered = true;
  clearInterval(timerInterval);
  const chosen = parseInt(e.currentTarget.dataset.index,10);
  revealCorrectAndMark(chosen, false);
  nextBtn.disabled = false;
}

function revealCorrectAndMark(chosen, byTimeout){
  const q = selectedQuestions[currentIndex];
  const buttons = Array.from(answersEl.children);
  buttons.forEach((b, idx) => {
    b.classList.add('disabled');
    if(idx === q.answer){
      b.classList.add('correct');
    }
    if(chosen !== null && idx === chosen && idx !== q.answer){
      b.classList.add('wrong');
    }
  });

  if(chosen === q.answer){
    correctCount++;
    playSound('correct'); // ✅ sonido de acierto
  } else {
    wrongCount++;
    playSound('wrong'); // ❌ sonido de error
  }

  const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  raw.corrects = (raw.corrects || 0) + (chosen === q.answer ? 1 : 0);
  raw.wrongs = (raw.wrongs || 0) + (chosen === q.answer ? 0 : 1);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(raw));

  correctsEl.textContent = raw.corrects || 0;
  wrongsEl.textContent = raw.wrongs || 0;
}

nextBtn.addEventListener('click', ()=>{
  currentIndex++;
  if(currentIndex >= selectedQuestions.length){
    finishGame();
  } else {
    renderQuestion();
  }
});

hintBtn.addEventListener('click', ()=>{
  const q = selectedQuestions[currentIndex];
  alert('Pista: la respuesta correcta es la opción ' + (q.answer+1));
});

function finishGame(){
  clearInterval(timerInterval);
  playSound('end'); // 🔔 sonido de fin de partida
  gameScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  rMatches.textContent = matches;

  const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  rCorrects.textContent = (raw.corrects || 0);
  rWrongs.textContent = (raw.wrongs || 0);

  const sessionCorrect = correctCount;
  const sessionWrong = wrongCount;
  console.log('Session result', {sessionCorrect, sessionWrong});
}

playAgain.addEventListener('click', ()=>{
  resultScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
});

startBtn.addEventListener('click', async ()=>{
  await fetchQuestions();
  startGame();
});

// 🎶 función de sonidos
function playSound(type){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);

    switch(type){
      case 'start': // 🎵 inicio del juego
        o.frequency.value = 440;
        g.gain.value = 0.07;
        o.type = 'triangle';
        break;
      case 'end': // 🔔 fin del juego
        o.frequency.value = 660;
        g.gain.value = 0.07;
        o.type = 'sawtooth';
        break;
      case 'correct': // ✅ acierto
        o.frequency.value = 880;
        g.gain.value = 0.06;
        o.type = 'sine';
        break;
      case 'wrong': // ❌ error
        o.frequency.value = 220;
        g.gain.value = 0.06;
        o.type = 'square';
        break;
      default:
        o.frequency.value = 400;
        g.gain.value = 0.05;
    }

    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 200); // duración del sonido

  } catch(e){
    console.warn('No se pudo reproducir sonido:', e);
  }
}

// Prefetch inicial
fetchQuestions().then(()=>console.log('Preguntas cargadas:', questions.length));