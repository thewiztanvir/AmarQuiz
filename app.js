/* =====================================================
   AmarQuiz – app.js
   AI Quiz Generator  |  Gemini · OpenAI · Claude
   ===================================================== */

// ── State ──────────────────────────────────────────────
var state = {
  provider: 'gemini',
  apiKey: '',
  model: '',
  questionType: 'mcq',
  quiz: null,
  userAnswers: [],
  submitted: false,
};

// ── DOM refs ────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

var screenApi       = $('screen-api');
var screenGenerate  = $('screen-generate');

var providerPills   = document.querySelectorAll('.pill[data-provider]');
var apiKeyInput     = $('apiKeyInput');
var toggleVis       = $('toggleVis');
var modelSelect     = $('modelSelect');
var customModelWrap = $('customModelWrap');
var modelInput      = $('modelInput');
var modelFieldGroup = $('modelFieldGroup');
var btnContinue     = $('btnContinue');

var headerMeta      = $('headerMeta');
var btnChangeKey    = $('btnChangeKey');

var topicInput      = $('topicInput');
var numQuestions    = $('numQuestions');
var difficulty      = $('difficulty');
var typePills       = document.querySelectorAll('.type-pill[data-type]');
var btnGenerate     = $('btnGenerate');
var genBtnText      = $('genBtnText');
var genBtnIcon      = $('genBtnIcon');
var spinner         = $('spinner');

var quizContainer   = $('quizContainer');
var quizMeta        = $('quizMeta');
var questionsWrap   = $('questionsWrap');
var btnSubmitQuiz   = $('btnSubmitQuiz');
var btnNewQuiz      = $('btnNewQuiz');

var resultsContainer    = $('resultsContainer');
var ringFill            = $('ringFill');
var scoreText           = $('scoreText');
var resultTitle         = $('resultTitle');
var resultMsg           = $('resultMsg');
var btnRetakeQuiz       = $('btnRetakeQuiz');
var btnNewQuizFromResult = $('btnNewQuizFromResult');
var reviewWrap          = $('reviewWrap');

// ── Toast container ────────────────────────────────────
var toastWrap = document.createElement('div');
toastWrap.className = 'toast-wrap';
document.body.appendChild(toastWrap);

// ── SVG gradient for score ring ────────────────────────
(function injectRingGradient() {
  var svg = document.querySelector('svg.score-ring');
  if (!svg) return;
  var ns   = 'http://www.w3.org/2000/svg';
  var defs = document.createElementNS(ns, 'defs');
  defs.innerHTML =
    '<linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%"   stop-color="#7c3aed"/>' +
      '<stop offset="100%" stop-color="#06b6d4"/>' +
    '</linearGradient>';
  svg.prepend(defs);
}());

// ── Model presets by provider ──────────────────────────
var MODEL_PRESETS = {
  gemini: [
    { value: 'gemini-2.5-flash', text: 'Gemini 2.5 Flash (Recommended)' },
    { value: 'gemini-2.5-pro', text: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.0-flash', text: 'Gemini 2.0 Flash' },
    { value: 'custom', text: 'Custom Model ID...' }
  ],
  openai: [
    { value: 'gpt-4o-mini', text: 'GPT-4o Mini (Recommended)' },
    { value: 'gpt-4o', text: 'GPT-4o' },
    { value: 'o3-mini', text: 'o3 Mini' },
    { value: 'custom', text: 'Custom Model ID...' }
  ],
  claude: [
    { value: 'claude-3-5-haiku-20241022', text: 'Claude 3.5 Haiku (Recommended)' },
    { value: 'claude-3-5-sonnet-20241022', text: 'Claude 3.5 Sonnet' },
    { value: 'custom', text: 'Custom Model ID...' }
  ]
};

// ══════════════════════════════════════════════════════
//   PROVIDER SELECTION
// ══════════════════════════════════════════════════════
function setProvider(provider) {
  // Toggle active pill
  providerPills.forEach(function(p) { p.classList.remove('active'); });
  var pill = $('pill-' + provider);
  if (pill) pill.classList.add('active');

  state.provider = provider;

  // Clear stale model data
  modelInput.value = '';
  state.model = '';

  // Populate models dropdown for the chosen provider
  populateModelDropdown(provider);

  updateModelPlaceholder();
  clearApiKeyError();
}

// Wire every pill via addEventListener — no inline onclick needed
providerPills.forEach(function(pill) {
  pill.addEventListener('click', function() {
    setProvider(pill.dataset.provider);
  });
});

function populateModelDropdown(provider) {
  modelSelect.innerHTML = '';
  var models = MODEL_PRESETS[provider] || [];
  models.forEach(function(m) {
    var opt = document.createElement('option');
    opt.value = m.value;
    opt.textContent = m.text;
    modelSelect.appendChild(opt);
  });
  
  // Trigger change handler to show/hide custom field
  handleModelSelectChange();
}

function handleModelSelectChange() {
  if (modelSelect.value === 'custom') {
    customModelWrap.style.display = 'block';
    modelInput.focus();
  } else {
    customModelWrap.style.display = 'none';
  }
}

modelSelect.addEventListener('change', handleModelSelectChange);

function updateModelPlaceholder() {
  var map = {
    openai: 'e.g. gpt-4o, gpt-3.5-turbo...',
    claude: 'e.g. claude-3-5-sonnet-20241022...',
    gemini: 'e.g. gemini-2.5-pro...'
  };
  modelInput.placeholder = map[state.provider] || '';
}

// ══════════════════════════════════════════════════════
//   INLINE API-KEY VALIDATION
// ══════════════════════════════════════════════════════
function showApiKeyError(msg) {
  var errEl = $('apiKeyError');
  if (!errEl) {
    errEl = document.createElement('p');
    errEl.id = 'apiKeyError';
    errEl.className = 'field-error';
    var wrap = apiKeyInput.closest('.field-group');
    var hint = wrap.querySelector('.field-hint');
    wrap.insertBefore(errEl, hint);
  }
  errEl.textContent = msg;
  errEl.style.display = 'flex';
  apiKeyInput.classList.add('input-error');
  apiKeyInput.focus();
}

function clearApiKeyError() {
  var errEl = $('apiKeyError');
  if (errEl) errEl.style.display = 'none';
  apiKeyInput.classList.remove('input-error');
}

// ══════════════════════════════════════════════════════
//   TOGGLE KEY VISIBILITY
// ══════════════════════════════════════════════════════
toggleVis.addEventListener('click', function() {
  var isPass = apiKeyInput.type === 'password';
  apiKeyInput.type = isPass ? 'text' : 'password';
  toggleVis.innerHTML = isPass
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94' +
        'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19' +
        'm-6.72-1.07a3 3 0 1 1-4.24-4.24"/>' +
        '<line x1="1" y1="1" x2="23" y2="23"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
        '<circle cx="12" cy="12" r="3"/></svg>';
});

// ══════════════════════════════════════════════════════
//   CONTINUE (API KEY → QUIZ SCREEN)
// ══════════════════════════════════════════════════════
function handleContinue() {
  var key = apiKeyInput.value.trim();

  if (!key) {
    showApiKeyError('Please enter your API key before continuing.');
    return;
  }
  if (key.length < 10) {
    showApiKeyError('That key looks too short. Please check and try again.');
    return;
  }

  clearApiKeyError();

  state.apiKey = key;

  // Retrieve selected model
  var selVal = modelSelect.value;
  if (selVal === 'custom') {
    state.model = modelInput.value.trim();
  } else {
    state.model = selVal;
  }

  var names = { gemini: 'Gemini', openai: 'OpenAI', claude: 'Claude' };
  headerMeta.innerHTML =
    '<span class="provider-badge">' + (names[state.provider] || state.provider) + '</span>';

  showScreen(screenGenerate);
}

btnContinue.addEventListener('click', handleContinue);

// Enter key triggers continue
apiKeyInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handleContinue();
});

// Clear inline error as soon as user starts typing
apiKeyInput.addEventListener('input', function() {
  if (apiKeyInput.value.trim()) clearApiKeyError();
});

// ── Change key ─────────────────────────────────────────
btnChangeKey.addEventListener('click', function() {
  showScreen(screenApi);
  resetQuizUI();
});

// ══════════════════════════════════════════════════════
//   QUESTION TYPE PILLS
// ══════════════════════════════════════════════════════
typePills.forEach(function(pill) {
  pill.addEventListener('click', function() {
    typePills.forEach(function(p) { p.classList.remove('active'); });
    pill.classList.add('active');
    state.questionType = pill.dataset.type;
  });
});

// ── Enter key on topic input ───────────────────────────
topicInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') btnGenerate.click();
});

// ══════════════════════════════════════════════════════
//   GENERATE QUIZ
// ══════════════════════════════════════════════════════
btnGenerate.addEventListener('click', function() {
  var topic = topicInput.value.trim();
  if (!topic) {
    toast('Please enter a topic first!', 'error');
    topicInput.focus();
    return;
  }

  setGenerating(true);
  resetQuizUI();

  var prompt = buildPrompt(topic, +numQuestions.value, difficulty.value, state.questionType);

  callAI(prompt).then(function(raw) {
    var quiz = parseQuiz(raw);
    if (!quiz || quiz.questions.length === 0) {
      throw new Error('Could not parse quiz data.');
    }
    state.quiz        = quiz;
    state.userAnswers = new Array(quiz.questions.length).fill(null);
    state.submitted   = false;
    renderQuiz(quiz);
    toast(quiz.questions.length + ' questions generated!', 'success');
  }).catch(function(err) {
    console.error(err);
    toast(err.message || 'Something went wrong. Check your API key and try again.', 'error');
  }).finally(function() {
    setGenerating(false);
  });
});

// ══════════════════════════════════════════════════════
//   SUBMIT QUIZ
// ══════════════════════════════════════════════════════
btnSubmitQuiz.addEventListener('click', function() {
  if (state.submitted) return;
  var unanswered = state.userAnswers.filter(function(a) { return a === null; }).length;
  if (unanswered > 0) {
    toast('Please answer all questions (' + unanswered + ' remaining).', 'error');
    return;
  }
  state.submitted = true;
  revealAnswers();
  showResults();
});

// ── New quiz ────────────────────────────────────────────
btnNewQuiz.addEventListener('click', resetQuizUI);

// ── Retake quiz ─────────────────────────────────────────
btnRetakeQuiz.addEventListener('click', function() {
  state.userAnswers = new Array(state.quiz.questions.length).fill(null);
  state.submitted   = false;
  resultsContainer.classList.add('hidden');
  renderQuiz(state.quiz);
});

// ── New topic from results ──────────────────────────────
btnNewQuizFromResult.addEventListener('click', function() {
  topicInput.value = '';
  resetQuizUI();
  topicInput.focus();
});

// ══════════════════════════════════════════════════════
//   PROMPT BUILDER
// ══════════════════════════════════════════════════════
function buildPrompt(topic, n, diff, type) {
  var typeDesc = {
    mcq:       'multiple-choice (4 options each, exactly one correct)',
    truefalse: 'true/false (only 2 options: "True" and "False")',
    mixed:     'a mix of multiple-choice and true/false questions',
  }[type] || 'multiple-choice';

  return (
    'You are a professional quiz maker. Generate ' + n + ' ' + typeDesc +
    ' quiz questions about "' + topic + '" at ' + diff + ' difficulty.\n\n' +
    'STRICT JSON FORMAT - respond with ONLY valid JSON, no markdown, no code fences, no extra text:\n\n' +
    '{\n' +
    '  "topic": "' + topic + '",\n' +
    '  "questions": [\n' +
    '    {\n' +
    '      "id": 1,\n' +
    '      "question": "Question text here?",\n' +
    '      "options": ["Option A", "Option B", "Option C", "Option D"],\n' +
    '      "correct": 0,\n' +
    '      "explanation": "Brief explanation of why this is correct."\n' +
    '    }\n' +
    '  ]\n' +
    '}\n\n' +
    'Rules:\n' +
    '- "correct" is the 0-based index of the correct option.\n' +
    '- For true/false, options must be exactly ["True", "False"].\n' +
    '- Explanations must be concise (1-2 sentences).\n' +
    '- Questions must be clear, unambiguous, and factually accurate.\n' +
    '- Return ONLY the JSON object, nothing else.'
  );
}

// ══════════════════════════════════════════════════════
//   AI CALLERS
// ══════════════════════════════════════════════════════
function callAI(prompt) {
  if (state.provider === 'gemini') return callGemini(prompt);
  if (state.provider === 'openai') return callOpenAI(prompt);
  if (state.provider === 'claude') return callClaude(prompt);
  return Promise.reject(new Error('Unknown provider: ' + state.provider));
}

// ── Gemini ─────────────────────────────────────────────
function callGemini(prompt) {
  var model = state.model || 'gemini-2.0-flash';
  var url   = 'https://generativelanguage.googleapis.com/v1beta/models/' +
              model + ':generateContent?key=' + state.apiKey;

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  }).then(function(res) {
    if (!res.ok) {
      return res.json().catch(function() { return {}; }).then(function(err) {
        throw new Error((err.error && err.error.message) || ('Gemini error (' + res.status + ')'));
      });
    }
    return res.json();
  }).then(function(data) {
    return data.candidates[0].content.parts[0].text || '';
  });
}

// ── OpenAI ─────────────────────────────────────────────
function callOpenAI(prompt) {
  var model = state.model || 'gpt-4o-mini';

  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + state.apiKey,
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  }).then(function(res) {
    if (!res.ok) {
      return res.json().catch(function() { return {}; }).then(function(err) {
        throw new Error((err.error && err.error.message) || ('OpenAI error (' + res.status + ')'));
      });
    }
    return res.json();
  }).then(function(data) {
    return data.choices[0].message.content || '';
  });
}

// ── Claude ─────────────────────────────────────────────
function callClaude(prompt) {
  var model = state.model || 'claude-3-5-haiku-20241022';

  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': state.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  }).then(function(res) {
    if (!res.ok) {
      return res.json().catch(function() { return {}; }).then(function(err) {
        throw new Error((err.error && err.error.message) || ('Claude error (' + res.status + ')'));
      });
    }
    return res.json();
  }).then(function(data) {
    return data.content[0].text || '';
  });
}

// ══════════════════════════════════════════════════════
//   QUIZ PARSER
// ══════════════════════════════════════════════════════
function parseQuiz(raw) {
  var clean = raw.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  var start = clean.indexOf('{');
  var end   = clean.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in AI response.');

  return JSON.parse(clean.slice(start, end + 1));
}

// ══════════════════════════════════════════════════════
//   RENDER QUIZ
// ══════════════════════════════════════════════════════
function renderQuiz(quiz) {
  var diffLabel = difficulty.value.charAt(0).toUpperCase() + difficulty.value.slice(1);
  var letters   = ['A','B','C','D','E','F'];

  quizMeta.innerHTML =
    '<strong>' + escHtml(quiz.topic) + '</strong>' +
    '<span class="quiz-badge">' + quiz.questions.length + ' Questions</span>' +
    '<span class="quiz-badge">' + diffLabel + '</span>' +
    '<span class="quiz-badge">' + state.questionType.toUpperCase() + '</span>';

  questionsWrap.innerHTML = '';

  quiz.questions.forEach(function(q, qi) {
    var card = document.createElement('div');
    card.className = 'question-card';
    card.id = 'q-card-' + qi;
    card.style.animationDelay = (qi * 0.06) + 's';

    var optionsHTML = q.options.map(function(opt, oi) {
      return '<li>' +
        '<button class="option-btn" id="opt-' + qi + '-' + oi + '"' +
          ' data-qi="' + qi + '" data-oi="' + oi + '">' +
          '<span class="option-letter">' + letters[oi] + '</span>' +
          '<span>' + escHtml(opt) + '</span>' +
        '</button>' +
        '</li>';
    }).join('');

    card.innerHTML =
      '<p class="q-number">Question ' + (qi + 1) + ' of ' + quiz.questions.length + '</p>' +
      '<p class="q-text">' + escHtml(q.question) + '</p>' +
      '<ul class="options-list">' + optionsHTML + '</ul>';

    questionsWrap.appendChild(card);
  });

  // Attach option click handlers
  questionsWrap.querySelectorAll('.option-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (state.submitted) return;
      var qi   = +btn.dataset.qi;
      var oi   = +btn.dataset.oi;
      var card = $('q-card-' + qi);
      card.querySelectorAll('.option-btn').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      state.userAnswers[qi] = oi;
    });
  });

  quizContainer.classList.remove('hidden');
  quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Reveal correct / wrong answers ─────────────────────
function revealAnswers() {
  state.quiz.questions.forEach(function(q, qi) {
    var userAns    = state.userAnswers[qi];
    var correctAns = q.correct;
    var card       = $('q-card-' + qi);

    card.querySelectorAll('.option-btn').forEach(function(btn) {
      var oi = +btn.dataset.oi;
      btn.disabled = true;
      if      (oi === correctAns && oi === userAns) btn.classList.add('correct');
      else if (oi === userAns)                      btn.classList.add('wrong');
      else if (oi === correctAns)                   btn.classList.add('reveal-correct');
    });
  });
}

// ══════════════════════════════════════════════════════
//   SHOW RESULTS
// ══════════════════════════════════════════════════════
function showResults() {
  var total   = state.quiz.questions.length;
  var correct = state.quiz.questions.filter(function(q, i) {
    return state.userAnswers[i] === q.correct;
  }).length;
  var pct = Math.round((correct / total) * 100);

  // Score ring
  var circumference = 2 * Math.PI * 50;
  var offset = circumference - (pct / 100) * circumference;
  setTimeout(function() { ringFill.style.strokeDashoffset = offset; }, 100);
  scoreText.textContent = pct + '%';

  // Title and message — NO apostrophes in single-quoted strings
  var title, msg;
  if      (pct === 100) { title = 'Perfect Score!';  msg = 'Flawless! You nailed every question.'; }
  else if (pct >= 80)   { title = 'Excellent!';       msg = 'Great job! You really know your stuff.'; }
  else if (pct >= 60)   { title = 'Good Work!';       msg = 'Solid performance. Keep practicing!'; }
  else if (pct >= 40)   { title = 'Keep Learning';    msg = 'You got ' + correct + '/' + total + '. Review and try again!'; }
  else                  { title = 'Keep Going!';       msg = 'Every attempt teaches you more. Keep at it!'; }

  resultTitle.textContent = title;
  resultMsg.textContent   = msg;

  // Review section
  var letters = ['A','B','C','D','E','F'];
  reviewWrap.innerHTML = '<h3 style="font-size:1.1rem;font-weight:700;color:var(--text);margin-bottom:4px;">Review Answers</h3>';

  state.quiz.questions.forEach(function(q, i) {
    var userAns   = state.userAnswers[i];
    var isCorrect = userAns === q.correct;

    var rc = document.createElement('div');
    rc.className = 'review-card';

    var html =
      '<p class="review-q-num ' + (isCorrect ? 'correct' : 'wrong') + '">' +
        (isCorrect ? '\u2713' : '\u2717') + ' Question ' + (i + 1) +
      '</p>' +
      '<p class="review-q-text">' + escHtml(q.question) + '</p>' +
      '<div class="review-answers">' +
        '<p class="review-answer your-answer' + (!isCorrect ? ' wrong' : '') + '">' +
          '<span>Your answer:</span> ' +
          '<strong>' +
            (userAns !== null
              ? letters[userAns] + '. ' + escHtml(q.options[userAns])
              : 'No answer') +
          '</strong>' +
        '</p>';

    if (!isCorrect) {
      html +=
        '<p class="review-answer correct-answer">' +
          '<span>\u2713 Correct:</span> ' +
          '<strong>' + letters[q.correct] + '. ' + escHtml(q.options[q.correct]) + '</strong>' +
        '</p>';
    }

    html += '</div>';

    if (q.explanation) {
      html += '<p class="review-explanation"><strong style="color: var(--accent); margin-right: 4px;">Explanation:</strong> ' + escHtml(q.explanation) + '</p>';
    }

    rc.innerHTML = html;
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
  [screenApi, screenGenerate].forEach(function(s) { s.classList.remove('active'); });
  target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setGenerating(on) {
  btnGenerate.disabled = on;
  genBtnText.textContent = on ? 'Generating...' : 'Generate Quiz';
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
  ringFill.style.strokeDashoffset = 314;
}

function toast(msg, type, duration) {
  type     = type     || 'info';
  duration = duration || 3500;
  var el = document.createElement('div');
  el.className  = 'toast ' + type;
  el.textContent = msg;
  toastWrap.appendChild(el);
  setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, duration);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

// ── Init ────────────────────────────────────────────────
setProvider('gemini');
showScreen(screenApi);
