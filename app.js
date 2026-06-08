/* =====================================================
   AmarQuiz – app.js
   AI Quiz Generator  |  Gemini · OpenAI · Claude
   ===================================================== */

// ── State ──────────────────────────────────────────────
const state = {
  provider: 'gemini',
  apiKey: '',
  model: '',
  questionType: 'mcq',
  quiz: null,
  userAnswers: [],
  submitted: false,
};

// ── DOM refs ────────────────────────────────────────────
const $ = id => document.getElementById(id);

const screenApi      = $('screen-api');
const screenGenerate = $('screen-generate');

const providerPills  = document.querySelectorAll('.pill[data-provider]');
const apiKeyInput    = $('apiKeyInput');
const toggleVis      = $('toggleVis');
const modelInput     = $('modelInput');
const modelFieldGroup= $('modelFieldGroup');
const btnContinue    = $('btnContinue');

const headerMeta     = $('headerMeta');
const btnChangeKey   = $('btnChangeKey');

const topicInput     = $('topicInput');
const numQuestions   = $('numQuestions');
const difficulty     = $('difficulty');
const typePills      = document.querySelectorAll('.type-pill[data-type]');
const btnGenerate    = $('btnGenerate');
const genBtnText     = $('genBtnText');
const genBtnIcon     = $('genBtnIcon');
const spinner        = $('spinner');

const quizContainer  = $('quizContainer');
const quizMeta       = $('quizMeta');
const questionsWrap  = $('questionsWrap');
const btnSubmitQuiz  = $('btnSubmitQuiz');
const btnNewQuiz     = $('btnNewQuiz');

const resultsContainer = $('resultsContainer');
const ringFill         = $('ringFill');
const scoreText        = $('scoreText');
const resultTitle      = $('resultTitle');
const resultMsg        = $('resultMsg');
const btnRetakeQuiz    = $('btnRetakeQuiz');
const btnNewQuizFromResult = $('btnNewQuizFromResult');
const reviewWrap       = $('reviewWrap');

// Toast container
const toastWrap = document.createElement('div');
toastWrap.className = 'toast-wrap';
document.body.appendChild(toastWrap);

// ── SVG gradient for score ring ────────────────────────
(function injectRingGradient() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.querySelector('svg.score-ring');
  if (!svg) return;
  const defs = document.createElementNS(ns, 'defs');
  defs.innerHTML = `
    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>`;
  svg.prepend(defs);
})();

// ── Provider pills ─────────────────────────────────────
providerPills.forEach(pill => {
  pill.addEventListener('click', () => {
    providerPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.provider = pill.dataset.provider;
    // Show model field for OpenAI / Claude only
    modelFieldGroup.style.display = (state.provider === 'openai' || state.provider === 'claude') ? 'flex' : 'none';
    updateModelPlaceholder();
  });
});

function updateModelPlaceholder() {
  const map = { openai: 'e.g. gpt-4o, gpt-3.5-turbo…', claude: 'e.g. claude-3-5-sonnet-20241022…', gemini: '' };
  modelInput.placeholder = map[state.provider] || '';
}

// ── Toggle API key visibility ──────────────────────────
toggleVis.addEventListener('click', () => {
  const isPass = apiKeyInput.type === 'password';
  apiKeyInput.type = isPass ? 'text' : 'password';
  toggleVis.innerHTML = isPass
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
});

// ── Continue button ────────────────────────────────────
btnContinue.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key) { toast('Please enter your API key.', 'error'); return; }
  if (key.length < 10) { toast('That doesn\'t look like a valid API key.', 'error'); return; }

  state.apiKey  = key;
  state.model   = modelInput.value.trim();

  // Update header badge
  const labels = { gemini: '✦ Gemini', openai: '⬡ OpenAI', claude: '✕ Claude' };
  headerMeta.innerHTML = `<span class="provider-badge">${labels[state.provider]}</span>`;

  showScreen(screenGenerate);
});

// ── Change key ─────────────────────────────────────────
btnChangeKey.addEventListener('click', () => {
  showScreen(screenApi);
  resetQuizUI();
});

// ── Type pills ─────────────────────────────────────────
typePills.forEach(pill => {
  pill.addEventListener('click', () => {
    typePills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.questionType = pill.dataset.type;
  });
});

// ── Enter key shortcut ─────────────────────────────────
topicInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') btnGenerate.click();
});

// ── Generate quiz ──────────────────────────────────────
btnGenerate.addEventListener('click', async () => {
  const topic = topicInput.value.trim();
  if (!topic) { toast('Please enter a topic first!', 'error'); topicInput.focus(); return; }

  setGenerating(true);
  resetQuizUI();

  try {
    const prompt = buildPrompt(topic, +numQuestions.value, difficulty.value, state.questionType);
    const raw    = await callAI(prompt);
    const quiz   = parseQuiz(raw);

    if (!quiz || quiz.questions.length === 0) throw new Error('Could not parse quiz data.');

    state.quiz        = quiz;
    state.userAnswers = new Array(quiz.questions.length).fill(null);
    state.submitted   = false;

    renderQuiz(quiz);
    toast(`${quiz.questions.length} questions generated!`, 'success');
  } catch (err) {
    console.error(err);
    toast(err.message || 'Something went wrong. Check your API key & try again.', 'error');
  } finally {
    setGenerating(false);
  }
});

// ── Submit quiz ────────────────────────────────────────
btnSubmitQuiz.addEventListener('click', () => {
  if (state.submitted) return;
  const unanswered = state.userAnswers.filter(a => a === null).length;
  if (unanswered > 0) {
    toast(`Please answer all questions (${unanswered} remaining).`, 'error');
    return;
  }
  state.submitted = true;
  revealAnswers();
  showResults();
});

// ── New quiz (from quiz) ───────────────────────────────
btnNewQuiz.addEventListener('click', resetQuizUI);

// ── Retake quiz ────────────────────────────────────────
btnRetakeQuiz.addEventListener('click', () => {
  state.userAnswers = new Array(state.quiz.questions.length).fill(null);
  state.submitted   = false;
  resultsContainer.classList.add('hidden');
  renderQuiz(state.quiz);
});

// ── New topic (from results) ───────────────────────────
btnNewQuizFromResult.addEventListener('click', () => {
  topicInput.value = '';
  resetQuizUI();
  topicInput.focus();
});

// ══════════════════════════════════════════════════════
//   PROMPT BUILDER
// ══════════════════════════════════════════════════════
function buildPrompt(topic, n, diff, type) {
  const typeDesc = {
    mcq:       'multiple-choice (4 options each, exactly one correct)',
    truefalse: 'true/false (only 2 options: "True" and "False")',
    mixed:     'a mix of multiple-choice and true/false questions',
  }[type] || 'multiple-choice';

  return `You are a professional quiz maker. Generate ${n} ${typeDesc} quiz questions about "${topic}" at ${diff} difficulty.

STRICT JSON FORMAT – respond with ONLY valid JSON, no markdown, no code fences, no extra text:

{
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this is correct."
    }
  ]
}

Rules:
- "correct" is the 0-based index of the correct option in the "options" array.
- For true/false questions, options must be exactly ["True", "False"].
- Explanations must be concise (1-2 sentences).
- Questions must be clear, unambiguous, and factually accurate.
- Vary question difficulty if ${diff} is "mixed".
- Return ONLY the JSON object, nothing else.`;
}

// ══════════════════════════════════════════════════════
//   AI CALLERS
// ══════════════════════════════════════════════════════
async function callAI(prompt) {
  switch (state.provider) {
    case 'gemini':  return callGemini(prompt);
    case 'openai':  return callOpenAI(prompt);
    case 'claude':  return callClaude(prompt);
    default:        throw new Error('Unknown provider.');
  }
}

// ── Gemini ─────────────────────────────────────────────
async function callGemini(prompt) {
  const model = state.model || 'gemini-2.0-flash';
  const url   = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini error (${res.status})`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── OpenAI ─────────────────────────────────────────────
async function callOpenAI(prompt) {
  const model = state.model || 'gpt-4o-mini';
  const res   = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI error (${res.status})`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ── Claude ─────────────────────────────────────────────
async function callClaude(prompt) {
  const model = state.model || 'claude-3-5-haiku-20241022';
  const res   = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': state.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Claude error (${res.status})`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

// ══════════════════════════════════════════════════════
//   QUIZ PARSER
// ══════════════════════════════════════════════════════
function parseQuiz(raw) {
  // Strip markdown fences if present
  let clean = raw.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  // Extract first JSON object
  const start = clean.indexOf('{');
  const end   = clean.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in AI response.');

  return JSON.parse(clean.slice(start, end + 1));
}

// ══════════════════════════════════════════════════════
//   RENDER QUIZ
// ══════════════════════════════════════════════════════
function renderQuiz(quiz) {
  const diffLabel = difficulty.value.charAt(0).toUpperCase() + difficulty.value.slice(1);
  quizMeta.innerHTML = `
    <strong>${quiz.topic}</strong>
    <span class="quiz-badge">${quiz.questions.length} Questions</span>
    <span class="quiz-badge">${diffLabel}</span>
    <span class="quiz-badge">${state.questionType.toUpperCase()}</span>`;

  questionsWrap.innerHTML = '';
  quiz.questions.forEach((q, qi) => {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `q-card-${qi}`;
    card.style.animationDelay = `${qi * 0.06}s`;

    const letters = ['A','B','C','D','E','F'];
    const optionsHTML = q.options.map((opt, oi) => `
      <li>
        <button class="option-btn" id="opt-${qi}-${oi}" data-qi="${qi}" data-oi="${oi}">
          <span class="option-letter">${letters[oi]}</span>
          <span>${escHtml(opt)}</span>
        </button>
      </li>`).join('');

    card.innerHTML = `
      <p class="q-number">Question ${qi + 1} of ${quiz.questions.length}</p>
      <p class="q-text">${escHtml(q.question)}</p>
      <ul class="options-list">${optionsHTML}</ul>`;

    questionsWrap.appendChild(card);
  });

  // Attach option click handlers
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.submitted) return;
      const qi = +btn.dataset.qi;
      const oi = +btn.dataset.oi;
      // Deselect previous
      const card = $(`q-card-${qi}`);
      card.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.userAnswers[qi] = oi;
    });
  });

  quizContainer.classList.remove('hidden');
  quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Reveal correct / wrong answers ─────────────────────
function revealAnswers() {
  state.quiz.questions.forEach((q, qi) => {
    const userAns   = state.userAnswers[qi];
    const correctAns = q.correct;

    document.querySelectorAll(`[id^="opt-${qi}-"]`).forEach(btn => {
      const oi = +btn.id.split('-')[2];
      btn.disabled = true;
      if (oi === correctAns && oi === userAns) btn.classList.add('correct');
      else if (oi === userAns)                  btn.classList.add('wrong');
      else if (oi === correctAns)               btn.classList.add('reveal-correct');
    });
  });
}

// ══════════════════════════════════════════════════════
//   SHOW RESULTS
// ══════════════════════════════════════════════════════
function showResults() {
  const total   = state.quiz.questions.length;
  const correct = state.quiz.questions.filter((q, i) => state.userAnswers[i] === q.correct).length;
  const pct     = Math.round((correct / total) * 100);

  // Ring animation
  const circumference = 2 * Math.PI * 50; // r=50 → 314
  const offset = circumference - (pct / 100) * circumference;
  setTimeout(() => { ringFill.style.strokeDashoffset = offset; }, 100);
  scoreText.textContent = `${pct}%`;

  // Title & message
  let title, msg;
  if (pct === 100) { title = '🏆 Perfect Score!';    msg = 'Flawless! You nailed every question.'; }
  else if (pct >= 80) { title = '🌟 Excellent!';    msg = 'Great job! You really know your stuff.'; }
  else if (pct >= 60) { title = '👍 Good Work!';    msg = 'Solid performance. Keep practicing!'; }
  else if (pct >= 40) { title = '📚 Keep Learning'; msg = `You got ${correct}/${total}. Review and try again!`; }
  else               { title = '💪 Keep Going!';    msg = 'Don't give up — every attempt teaches you more.'; }

  resultTitle.textContent = title;
  resultMsg.textContent   = msg;

  // Review section
  reviewWrap.innerHTML = `<h3 style="font-size:1.1rem;font-weight:700;color:var(--text);margin-bottom:4px;">Review Answers</h3>`;
  state.quiz.questions.forEach((q, i) => {
    const userAns    = state.userAnswers[i];
    const isCorrect  = userAns === q.correct;
    const letters    = ['A','B','C','D','E','F'];

    const rc = document.createElement('div');
    rc.className = 'review-card';
    rc.innerHTML = `
      <p class="review-q-num ${isCorrect ? 'correct' : 'wrong'}">
        ${isCorrect ? '✓' : '✗'} Question ${i + 1}
      </p>
      <p class="review-q-text">${escHtml(q.question)}</p>
      <div class="review-answers">
        <p class="review-answer your-answer ${!isCorrect ? 'wrong' : ''}">
          <span>Your answer:</span>
          <strong>${userAns !== null ? letters[userAns] + '. ' + escHtml(q.options[userAns]) : 'No answer'}</strong>
        </p>
        ${!isCorrect ? `
        <p class="review-answer correct-answer">
          <span>✓ Correct:</span>
          <strong>${letters[q.correct]}. ${escHtml(q.options[q.correct])}</strong>
        </p>` : ''}
      </div>
      ${q.explanation ? `<p class="review-explanation">💡 ${escHtml(q.explanation)}</p>` : ''}`;
    reviewWrap.appendChild(rc);
  });

  resultsContainer.classList.remove('hidden');
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  quizContainer.classList.add('hidden');
}

// ══════════════════════════════════════════════════════
//   HELPERS
// ══════════════════════════════════════════════════════
function showScreen(target) {
  [screenApi, screenGenerate].forEach(s => s.classList.remove('active'));
  target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setGenerating(on) {
  btnGenerate.disabled = on;
  genBtnText.textContent = on ? 'Generating…' : 'Generate Quiz';
  genBtnIcon.classList.toggle('hidden', on);
  spinner.classList.toggle('hidden', !on);
}

function resetQuizUI() {
  quizContainer.classList.add('hidden');
  resultsContainer.classList.add('hidden');
  questionsWrap.innerHTML = '';
  quizMeta.innerHTML      = '';
  reviewWrap.innerHTML    = '';
  state.quiz        = null;
  state.userAnswers = [];
  state.submitted   = false;
  // Reset ring
  ringFill.style.strokeDashoffset = 314;
}

function toast(msg, type = 'info', duration = 3500) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  toastWrap.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ── Init ────────────────────────────────────────────────
showScreen(screenApi);
