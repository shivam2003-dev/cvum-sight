(() => {
  'use strict';

  const DATA_URL = '/gate1/data/questions.json';
  const SOLUTIONS_URL = '/gate1/data/worked-solutions.json';
  const STORE_KEY = 'gate-da-2027-progress-v1';
  const THEME_KEY = 'gate-da-2027-theme';

  const state = {
    data: null,
    solutions: null,
    year: 2026,
    question: 1,
    view: 'dashboard',
    progress: loadProgress(),
    draftAnswers: {},
    examStartedAt: null,
    examInterval: null,
    paletteFilter: 'all',
  };

  const main = document.querySelector('#main-content');
  const sidebar = document.querySelector('#sidebar');
  const paperSelector = document.querySelector('#paper-selector');
  const palette = document.querySelector('#question-palette');
  const searchDialog = document.querySelector('#search-dialog');
  const searchInput = document.querySelector('#global-search');
  const searchResults = document.querySelector('#search-results');
  const sourceDialog = document.querySelector('#source-dialog');

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch { return {}; }
  }

  function saveProgress() {
    localStorage.setItem(STORE_KEY, JSON.stringify(state.progress));
    updateProgressChrome();
  }

  function recordFor(question) {
    return state.progress[question.id] || (state.progress[question.id] = {
      learned: false, bookmarked: false, attempts: 0, correct: null, selected: [], needsReview: false,
    });
  }

  function esc(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  function compact(value = '', length = 170) {
    const text = String(value).replace(/\s+/g, ' ').trim();
    return text.length > length ? `${text.slice(0, length - 1)}…` : text;
  }

  function currentPaperQuestions() {
    return state.data.questions.filter(q => q.year === state.year);
  }

  function currentQuestion() {
    return state.data.questions.find(q => q.year === state.year && q.questionNumber === state.question) || currentPaperQuestions()[0];
  }

  function questionPath(question, view = 'learn') {
    if (view === 'paper') return `/gate1/${question.year}/paper/question-${question.questionNumber}`;
    if (view === 'practice') return `/gate1/${question.year}/practice/question-${question.questionNumber}`;
    if (view === 'exam') return `/gate1/${question.year}/exam/question-${question.questionNumber}`;
    return `/gate1/${question.year}/question-${question.questionNumber}`;
  }

  function parseRoute(pathname = location.pathname) {
    const path = pathname.replace(/\/+$/, '') || '/gate1';
    let match;
    if (path === '/gate1') return {view: 'dashboard'};
    if (path === '/gate1/cheat-sheet') return {view: 'cheat'};
    if (path === '/gate1/shortcuts') return {view: 'shortcuts'};
    if (path === '/gate1/mistakes') return {view: 'mistakes'};
    if (path === '/gate1/bookmarks') return {view: 'bookmarks'};
    if ((match = path.match(/^\/gate1\/(2024|2025|2026)\/paper(?:\/question-(\d+))?$/))) return {view: 'paper', year: +match[1], question: +(match[2] || 1)};
    if ((match = path.match(/^\/gate1\/(2024|2025|2026)\/practice\/question-(\d+)$/))) return {view: 'practice', year: +match[1], question: +match[2]};
    if ((match = path.match(/^\/gate1\/(2024|2025|2026)\/exam\/question-(\d+)$/))) return {view: 'exam', year: +match[1], question: +match[2]};
    if ((match = path.match(/^\/gate1\/(2024|2025|2026)\/question-(\d+)$/))) return {view: 'learn', year: +match[1], question: +match[2]};
    return {view: 'dashboard'};
  }

  function navigate(path, replace = false) {
    if (replace) history.replaceState({}, '', path);
    else history.pushState({}, '', path);
    applyRoute();
  }

  function applyRoute() {
    const route = parseRoute();
    state.view = route.view;
    if (route.year) state.year = route.year;
    if (route.question) state.question = Math.min(65, Math.max(1, route.question));
    paperSelector.value = String(state.year);
    clearInterval(state.examInterval);
    state.examInterval = null;
    render();
    updateChrome();
    window.scrollTo({top: 0, behavior: 'instant'});
  }

  function render() {
    if (!state.data) return;
    if (state.view === 'dashboard') renderDashboard();
    else if (['learn', 'paper', 'practice', 'exam'].includes(state.view)) renderQuestionView();
    else if (state.view === 'cheat') renderLibrary('cheat');
    else if (state.view === 'shortcuts') renderLibrary('shortcuts');
    else if (state.view === 'mistakes') renderMistakes();
    else if (state.view === 'bookmarks') renderQuestionList('bookmarks');
    typesetMath();
  }

  function renderDashboard() {
    const learned = state.data.questions.filter(q => recordFor(q).learned).length;
    const correct = state.data.questions.filter(q => recordFor(q).correct === true).length;
    const bookmarks = state.data.questions.filter(q => recordFor(q).bookmarked).length;
    main.innerHTML = `
      <div class="content-wrap">
        <section class="hero">
          <p class="eyebrow">GATE DA 2027 · Official-paper learning system</p>
          <h1 class="page-title">Turn every past paper into a pattern you can recognize.</h1>
          <p class="page-lede">Study the exact GATE question first. Then learn the intuition, fastest exam approach, common trap, 10-second check, and revision note that transfer to the next paper.</p>
          <div class="hero-actions">
            <a class="button primary" href="/gate1/2026/question-1" data-route>Start with GATE DA 2026 <span>→</span></a>
            <a class="button" href="/gate1/2024/practice/question-1" data-route>Practice from 2024</a>
          </div>
        </section>
        <section class="metric-strip" aria-label="Study metrics">
          <div class="metric"><strong>195</strong><span>source-faithful questions</span></div>
          <div class="metric"><strong>3</strong><span>complete official papers</span></div>
          <div class="metric"><strong>${learned}</strong><span>questions learned</span></div>
          <div class="metric"><strong>${correct}</strong><span>practice answers correct</span></div>
        </section>
        <div class="section-heading"><div><h2>Choose a paper</h2><p>Start in Learn mode or switch to the untouched paper at any time.</p></div><span class="tag">${bookmarks} BOOKMARKED</span></div>
        <section class="paper-grid">
          ${state.data.papers.slice().reverse().map(paper => {
            const qs = state.data.questions.filter(q => q.year === paper.year);
            const done = qs.filter(q => recordFor(q).learned).length;
            return `<a class="paper-card" href="/gate1/${paper.year}/question-1" data-route>
              <span class="paper-year">${paper.year} · ${esc(paper.institute)}</span>
              <h3>${esc(paper.label)}</h3>
              <p>${paper.questions} questions · 100 marks · GA + DA core · MCQ, MSQ and NAT</p>
              <div class="paper-meta"><span>${done} learned</span><span class="arrow">→</span></div>
            </a>`;
          }).join('')}
        </section>
        <div class="section-heading"><div><h2>One paper, four ways to study</h2><p>Move from source fidelity to timed recall without leaving the question.</p></div></div>
        <section class="feature-grid">
          <article class="feature-card"><span class="feature-icon">□</span><h3>Original paper</h3><p>Official question crops preserve every diagram, table, formula, option and instruction—without answers.</p></article>
          <article class="feature-card"><span class="feature-icon">✦</span><h3>Learn the pattern</h3><p>Intuition, exam-first method, detailed steps, option elimination, traps, checks and cheat-sheet notes.</p></article>
          <article class="feature-card"><span class="feature-icon">◷</span><h3>Practice under pressure</h3><p>MCQ, MSQ and NAT behavior, question palette, review states, local mistake tracking and a GATE-style timer.</p></article>
        </section>
      </div>`;
  }

  function questionToolbar(question) {
    return `<div class="question-toolbar">
      <div class="breadcrumbs"><span>${question.year} paper</span> · <strong>Question ${String(question.questionNumber).padStart(2, '0')}</strong></div>
      <div class="segmented" aria-label="Question mode">
        <a class="${state.view === 'paper' ? 'active' : ''}" href="${questionPath(question, 'paper')}" data-route>Paper</a>
        <a class="${state.view === 'learn' ? 'active' : ''}" href="${questionPath(question, 'learn')}" data-route>Learn</a>
        <a class="${state.view === 'practice' ? 'active' : ''}" href="${questionPath(question, 'practice')}" data-route>Practice</a>
        <a class="${state.view === 'exam' ? 'active' : ''}" href="${questionPath(question, 'exam')}" data-route>Exam</a>
      </div>
    </div>`;
  }

  function sourceCard(question) {
    const rec = recordFor(question);
    return `<article class="question-card">
      <header class="question-card-head">
        <div class="question-number">
          <span class="question-number-badge">Q${String(question.questionNumber).padStart(2, '0')}</span>
          <div><h1>Original Question</h1><div class="question-meta">
            <span>${question.marks} ${question.marks === 1 ? 'Mark' : 'Marks'}</span><span>·</span><span>${question.type}</span><span>·</span><span>${esc(question.topic)} → ${esc(question.subtopic)}</span>
          </div></div>
        </div>
        <button class="bookmark-button ${rec.bookmarked ? 'active' : ''}" data-action="bookmark" aria-label="${rec.bookmarked ? 'Remove bookmark' : 'Bookmark question'}" title="Bookmark (B)">${rec.bookmarked ? '◆' : '◇'}</button>
      </header>
      <div class="source-frame">
        <img src="${question.sourceImage}" alt="Official ${question.year} GATE DA question ${question.questionNumber}" data-action="zoom-source" loading="eager">
        <span class="source-badge">OFFICIAL SOURCE</span>
      </div>
      <div class="source-note"><span>${question.year} paper · page ${question.sourcePage} · source preserved verbatim</span><button data-action="zoom-source">Open large view ↗</button></div>
    </article>`;
  }

  function answerPanel(question, reveal = false, exam = false) {
    const rec = recordFor(question);
    const selected = state.draftAnswers[question.id] || (exam ? rec.examSelected : null) || [];
    const values = Array.isArray(selected) ? selected : [selected];
    const correctLabels = question.answer.split(',').map(v => v.trim());
    let controls;
    if (question.answer === 'MTA') {
      controls = `<div class="feedback correct">The final key awards Marks to All for this question.</div>`;
    } else if (question.type === 'NAT') {
      const value = values[0] || '';
      controls = `<label><span class="sr-only">Numerical answer</span><input class="nat-input" data-action="nat-input" inputmode="decimal" value="${esc(value)}" placeholder="Enter numerical answer"></label>`;
    } else {
      controls = `<div class="answer-options">${question.options.map(option => {
        const isSelected = values.includes(option.label);
        const isCorrect = correctLabels.includes(option.label);
        const feedbackClass = reveal && isCorrect ? 'correct' : reveal && isSelected && !isCorrect ? 'incorrect' : '';
        return `<button class="answer-option ${isSelected ? 'selected' : ''} ${feedbackClass}" data-action="select-option" data-value="${option.label}" ${reveal ? 'disabled' : ''}>
          <span class="option-key">${option.label}</span><span>${esc(option.text)}</span>
        </button>`;
      }).join('')}</div>`;
    }
    const feedback = reveal ? `<div class="feedback ${rec.correct ? 'correct' : 'incorrect'}">${rec.correct ? 'Correct — the recognition rule held.' : `Not yet. The official answer is ${esc(question.finalAnswerText)}.`}</div>` : '';
    const helper = question.type === 'MSQ' ? 'Select all options that apply.' : question.type === 'NAT' ? 'Enter the numerical value. Accepted ranges follow the final key.' : 'Select one option.';
    return `<section class="answer-panel">
      <h2>${exam ? 'Record your response' : 'Try it before opening the solution'}</h2>
      <p>${helper}</p>
      ${controls}
      ${feedback}
      <div class="exam-actions">
        ${!reveal ? `<button class="button primary" data-action="${exam ? 'save-next' : 'submit-answer'}">${exam ? 'Save & next' : 'Check answer'}</button>` : `<button class="button" data-action="retry-answer">Try again</button>`}
        ${exam ? `<button class="button" data-action="mark-review">${rec.needsReview ? 'Marked for review' : 'Mark for review'}</button><button class="button" data-action="clear-response">Clear response</button>` : ''}
      </div>
    </section>`;
  }

  function learningStack(question) {
    const worked = state.solutions[`${question.year}-${question.questionNumber}`];
    if (!worked) return `<section class="empty-state"><strong>Worked solution unavailable.</strong><p>This question has been blocked from showing a generic fallback.</p></section>`;
    const concepts = worked.testing.map(item => `<li>${esc(item)}</li>`).join('');
    const steps = worked.steps.map((step, index) => `<article class="worked-step">
      <div class="worked-step-number">Step ${index + 1}</div>
      <h3>${esc(step.heading)}</h3>
      ${step.body ? `<p>${esc(step.body)}</p>` : ''}
      ${(step.math || []).map(formula => `<div class="math-block">\\[${esc(formula)}\\]</div>`).join('')}
    </article>`).join('');
    const mistakes = worked.mistakes.map(item => `<li>${esc(item)}</li>`).join('');
    const cheatFormula = worked.cheat.formula ? `<dt>Formula</dt><dd><span class="inline-math">\\(${esc(worked.cheat.formula)}\\)</span></dd>` : '';
    return `<section class="learning-stack" aria-label="How to solve in the exam">
      <details class="learn-card" open><summary><span class="learn-index">01</span><strong>What is this question testing?</strong></summary><div class="learn-card-content"><ul>${concepts}</ul></div></details>
      <details class="learn-card intuition" open><summary><span class="learn-index">02</span><strong>Intuition</strong></summary><div class="learn-card-content"><p>${esc(worked.intuition)}</p></div></details>
      <details class="learn-card solution" open><summary><span class="learn-index">03</span><strong>Step-by-step solution — ${esc(worked.title)}</strong></summary><div class="learn-card-content worked-steps">${steps}</div></details>
      <details class="learn-card shortcut" open><summary><span class="learn-index">04</span><strong>Fastest GATE shortcut</strong></summary><div class="learn-card-content"><p>${esc(worked.shortcut)}</p></div></details>
      <details class="learn-card mistake" open><summary><span class="learn-index">05</span><strong>Common mistakes</strong></summary><div class="learn-card-content"><ul>${mistakes}</ul></div></details>
      <details class="learn-card shortcut" open><summary><span class="learn-index">06</span><strong>Add to GATE Cheat Sheet</strong></summary><div class="learn-card-content"><dl class="trigger-grid"><dt>Trigger</dt><dd>${esc(worked.cheat.trigger)}</dd><dt>Shortcut</dt><dd>${esc(worked.cheat.rule)}</dd>${cheatFormula}<dt>Trap</dt><dd>${esc(worked.cheat.trap)}</dd></dl></div></details>
      <details class="learn-card target" open><summary><span class="learn-index">07</span><strong>Target time</strong></summary><div class="learn-card-content"><div class="target-time">⏱ ${esc(worked.target)}</div></div></details>
      <details class="learn-card final" open><summary><span class="learn-index">08</span><strong>Final answer</strong></summary><div class="learn-card-content"><div class="final-answer">Q${question.questionNumber} = ${esc(worked.final)} ✓</div></div></details>
    </section>`;
  }

  function contextRail(question) {
    const rec = recordFor(question);
    const status = rec.correct === true ? 'Correct' : rec.correct === false ? 'Retry' : rec.learned ? 'Learned' : 'Unattempted';
    return `<aside class="context-rail" aria-label="Question context">
      <section class="rail-card"><p class="rail-label">Exam target</p><strong>${formatTimeTarget(question.timeTargetSeconds)}</strong><p class="difficulty ${question.difficulty.toLowerCase()}">${question.difficulty} · ${question.marks} ${question.marks === 1 ? 'mark' : 'marks'}</p></section>
      <section class="rail-card"><p class="rail-label">Topic</p><strong>${esc(question.topic)}</strong><p>${esc(question.subtopic)}</p></section>
      <section class="rail-card"><p class="rail-label">Your status</p><strong>${status}</strong><p>${rec.attempts} practice ${rec.attempts === 1 ? 'attempt' : 'attempts'}</p>${state.view === 'learn' ? `<button class="button small" style="margin-top:10px;width:100%" data-action="toggle-learned">${rec.learned ? 'Marked learned ✓' : 'Mark as learned'}</button>` : ''}</section>
    </aside>`;
  }

  function renderQuestionView() {
    const question = currentQuestion();
    const rec = recordFor(question);
    const reveal = state.view === 'practice' && rec.lastSubmitted === true;
    const examBanner = state.view === 'exam' ? `<div class="exam-banner"><div><span>GATE-style practice · responses are hidden</span><br><strong id="exam-timer">03:00:00</strong></div><button class="button small" data-action="submit-exam">Submit paper</button></div>` : '';
    main.innerHTML = `<div class="reading-wrap">
      ${questionToolbar(question)}
      ${examBanner}
      <div class="question-layout">
        <div class="question-column">
          ${sourceCard(question)}
          ${state.view === 'practice' ? answerPanel(question, reveal, false) : ''}
          ${state.view === 'exam' ? answerPanel(question, false, true) : ''}
          ${state.view === 'learn' || reveal ? learningStack(question) : ''}
          ${questionFooterNav(question)}
        </div>
        ${contextRail(question)}
      </div>
    </div>`;
    if (state.view === 'exam') startExamTimer();
  }

  function questionFooterNav(question) {
    const prev = Math.max(1, question.questionNumber - 1);
    const next = Math.min(65, question.questionNumber + 1);
    return `<nav class="question-footer-nav" aria-label="Question navigation">
      <a class="button ${question.questionNumber === 1 ? 'disabled' : ''}" href="${questionPath({...question, questionNumber: prev}, state.view)}" data-route aria-disabled="${question.questionNumber === 1}">← Previous</a>
      <span class="question-position">${String(question.questionNumber).padStart(2, '0')} / 65</span>
      <a class="button primary ${question.questionNumber === 65 ? 'disabled' : ''}" href="${questionPath({...question, questionNumber: next}, state.view)}" data-route aria-disabled="${question.questionNumber === 65}">Next →</a>
    </nav>`;
  }

  function renderLibrary(kind) {
    const title = kind === 'cheat' ? 'Master cheat sheet' : 'GATE shortcut library';
    const lede = kind === 'cheat'
      ? 'Every question-specific trigger, rule, formula, trap and fastest method from all 195 worked solutions—nothing reduced to one generic card per topic.'
      : 'All 195 exam shortcuts, searchable by paper and topic. Train the first useful thought that should fire under pressure.';
    const entries = state.data.questions.map(question => ({
      question,
      worked: state.solutions[`${question.year}-${question.questionNumber}`],
    })).filter(entry => entry.worked);
    const topics = [...new Set(entries.map(entry => entry.question.topic))].sort();
    main.innerHTML = `<div class="content-wrap library-page">
      <p class="eyebrow">Revision desk · complete 2024–2026 bank</p>
      <div class="library-heading">
        <div><h1 class="page-title">${title}</h1><p class="page-lede">${lede}</p></div>
        <div class="library-completeness"><strong>${entries.length}</strong><span>of 195<br>patterns included</span></div>
      </div>
      <div class="library-toolbar" aria-label="Filter revision library">
        <label class="library-search"><span class="material-symbols-rounded" aria-hidden="true">search</span><input id="library-search" type="search" placeholder="Search trigger, formula, topic or shortcut…"></label>
        <select class="filter-select" id="library-year" aria-label="Filter by year"><option value="">All papers</option><option>2026</option><option>2025</option><option>2024</option></select>
        <select class="filter-select" id="library-topic" aria-label="Filter by topic"><option value="">All topics</option>${topics.map(topic => `<option>${esc(topic)}</option>`).join('')}</select>
      </div>
      <div class="library-result-bar"><span id="library-count">${entries.length} revision cards</span><span>Official papers · worked-solution notes</span></div>
      <div id="library-results">${renderLibraryCards(entries, kind)}</div>
    </div>`;
    main.dataset.libraryKind = kind;
  }

  function renderLibraryCards(entries, kind) {
    if (!entries.length) return `<div class="empty-state"><strong>No revision card matches.</strong><p>Clear a filter or try a shorter keyword.</p></div>`;
    return `<div class="library-grid">${entries.map(({question, worked}) => `<article class="library-card complete-card">
      <div class="library-card-top"><span class="topic-label">${question.year} · Q${question.questionNumber} · ${esc(question.topic)}</span><span class="tag">${question.type}</span></div>
      <h2>${esc(worked.title)}</h2>
      ${worked.cheat.formula ? `<div class="formula">\\[${esc(worked.cheat.formula)}\\]</div>` : ''}
      <dl>
        <dt>Trigger</dt><dd>${esc(worked.cheat.trigger)}</dd>
        <dt>${kind === 'cheat' ? 'Rule' : 'Shortcut'}</dt><dd>${esc(kind === 'cheat' ? worked.cheat.rule : worked.shortcut)}</dd>
        ${kind === 'cheat' ? `<dt>Fast path</dt><dd>${esc(worked.shortcut)}</dd>` : ''}
        <dt>Trap</dt><dd>${esc(worked.cheat.trap)}</dd>
      </dl>
      <div class="library-card-footer">
        <span>${esc(worked.target)}</span>
        ${kind === 'cheat' ? `<strong>${esc(worked.final)}</strong>` : ''}
        <a href="${questionPath(question, 'learn')}" data-route>Open worked solution <span aria-hidden="true">→</span></a>
      </div>
    </article>`).join('')}</div>`;
  }

  function renderMistakes() {
    const incorrect = state.data.questions.filter(q => recordFor(q).correct === false || recordFor(q).needsReview);
    const trapTopics = [...new Map(state.data.questions.map(q => [q.topic, q])).values()];
    main.innerHTML = `<div class="content-wrap"><p class="eyebrow">Revision desk · adaptive review</p><h1 class="page-title">Mistake book</h1><p class="page-lede">Your incorrect and marked-for-review questions appear first. The concept traps below stay available even before your first attempt.</p>
      <div class="section-heading"><div><h2>Your retry queue</h2><p>${incorrect.length} questions currently need attention.</p></div></div>
      ${incorrect.length ? resultList(incorrect) : `<div class="empty-state"><strong>No recorded mistakes yet.</strong><p>Use Practice mode. Incorrect responses will be collected here automatically, on this device.</p><a class="button primary" href="/gate1/2026/practice/question-1" data-route>Start practice</a></div>`}
      <div class="section-heading"><div><h2>Common traps across the syllabus</h2><p>Fast warnings gathered from recurring question patterns.</p></div></div>
      <div class="library-grid">${trapTopics.map(q => `<article class="library-card"><span class="topic-label">${esc(q.topic)}</span><h2>${esc(q.trigger)}</h2><dl><dt>Trap</dt><dd>${esc(q.trap)}</dd><dt>Check</dt><dd>${esc(q.check)}</dd></dl></article>`).join('')}</div>
    </div>`;
  }

  function renderQuestionList(kind) {
    const questions = kind === 'bookmarks' ? state.data.questions.filter(q => recordFor(q).bookmarked) : state.data.questions;
    main.innerHTML = `<div class="content-wrap"><p class="eyebrow">Saved revision · all papers</p><h1 class="page-title">Bookmarked questions</h1><p class="page-lede">A focused queue for concepts you want to revisit.</p>
      <div class="filters"><input class="filter-input" id="list-search" placeholder="Filter saved questions…"><select class="filter-select" id="list-year"><option value="">All years</option><option>2026</option><option>2025</option><option>2024</option></select><select class="filter-select" id="list-topic"><option value="">All topics</option>${[...new Set(questions.map(q => q.topic))].map(v => `<option>${esc(v)}</option>`).join('')}</select><select class="filter-select" id="list-difficulty"><option value="">All difficulty</option><option>Easy</option><option>Moderate</option><option>Hard</option></select></div>
      <div id="filtered-results">${questions.length ? resultList(questions) : `<div class="empty-state"><strong>No bookmarks yet.</strong><p>Use the diamond button on any question to save it here.</p><a class="button primary" href="/gate1/2026/question-1" data-route>Browse questions</a></div>`}</div>
    </div>`;
    main.dataset.listKind = kind;
  }

  function resultList(questions) {
    return `<div class="result-list">${questions.map(q => `<a class="result-card" href="${questionPath(q, 'learn')}" data-route><span class="result-number">${q.year}<br>Q${q.questionNumber}</span><div><h3>${esc(q.topic)} · ${esc(q.subtopic)}</h3><p>${esc(compact(q.question))}</p><div class="result-tags"><span class="tag">${q.type}</span><span class="tag">${q.marks} MARK${q.marks > 1 ? 'S' : ''}</span><span class="tag">${q.difficulty.toUpperCase()}</span></div></div><span class="result-arrow">→</span></a>`).join('')}</div>`;
  }

  function updateChrome() {
    document.querySelectorAll('[data-view]').forEach(link => link.classList.toggle('active', link.dataset.view === state.view));
    renderPalette();
    updateProgressChrome();
  }

  function renderPalette() {
    if (!state.data) return;
    const questions = currentPaperQuestions();
    palette.innerHTML = questions.map(q => {
      const rec = recordFor(q);
      const hidden = state.paletteFilter === 'retry' && rec.correct !== false && !rec.needsReview;
      return `<button class="palette-q ${state.question === q.questionNumber && ['learn','paper','practice','exam'].includes(state.view) ? 'active' : ''} ${rec.learned ? 'learned' : ''} ${rec.correct === false ? 'incorrect' : ''} ${rec.bookmarked ? 'bookmarked' : ''}" data-action="palette-question" data-question="${q.questionNumber}" ${hidden ? 'hidden' : ''} aria-label="Question ${q.questionNumber}">${q.questionNumber}</button>`;
    }).join('');
  }

  function updateProgressChrome() {
    if (!state.data) return;
    const questions = currentPaperQuestions();
    const learned = questions.filter(q => recordFor(q).learned).length;
    const percent = Math.round(learned / questions.length * 100);
    document.querySelector('#paper-progress-label').textContent = `${learned} of 65 learned`;
    document.querySelector('#paper-progress-percent').textContent = `${percent}%`;
    document.querySelector('#paper-progress-bar').style.width = `${percent}%`;
    document.querySelector('#mistake-count').textContent = state.data.questions.filter(q => recordFor(q).correct === false || recordFor(q).needsReview).length;
    document.querySelector('#bookmark-count').textContent = state.data.questions.filter(q => recordFor(q).bookmarked).length;
  }

  function typesetMath() {
    const run = () => window.MathJax?.typesetPromise?.([main]).catch(() => {});
    if (window.MathJax?.typesetPromise) run(); else setTimeout(run, 900);
  }

  function formatTimeTarget(seconds) {
    if (seconds < 60) return `${seconds} seconds`;
    const mins = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec ? `${mins} min ${sec} sec` : `${mins} minutes`;
  }

  function toast(message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    document.querySelector('#toast-region').append(el);
    setTimeout(() => el.remove(), 2200);
  }

  function selectOption(question, value) {
    const selected = state.draftAnswers[question.id] || [];
    if (question.type === 'MSQ') {
      state.draftAnswers[question.id] = selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value];
    } else {
      state.draftAnswers[question.id] = [value];
    }
    renderQuestionView();
  }

  function isAnswerCorrect(question, selected) {
    const expected = question.answer.split(',').map(v => v.trim()).sort();
    if (question.answer === 'MTA') return true;
    if (question.type !== 'NAT') {
      const actual = [...selected].sort();
      return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
    }
    const value = Number(selected[0]);
    if (!Number.isFinite(value)) return false;
    const numbers = question.answer.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (numbers.length >= 2) return value >= Math.min(...numbers) - 1e-9 && value <= Math.max(...numbers) + 1e-9;
    return numbers.length === 1 && Math.abs(value - numbers[0]) < 1e-9;
  }

  function submitAnswer(question) {
    const selected = state.draftAnswers[question.id] || [];
    if (question.answer !== 'MTA' && (!selected.length || selected[0] === '')) return toast('Choose or enter an answer first.');
    const rec = recordFor(question);
    rec.attempts += 1;
    rec.correct = isAnswerCorrect(question, selected);
    rec.lastSubmitted = true;
    rec.selected = selected;
    rec.needsReview = !rec.correct;
    if (rec.correct) rec.learned = true;
    saveProgress();
    renderQuestionView();
  }

  function saveExamAnswer(question, goNext = true) {
    const selected = state.draftAnswers[question.id] || [];
    const rec = recordFor(question);
    rec.examSelected = selected;
    rec.lastSubmitted = false;
    saveProgress();
    if (goNext && question.questionNumber < 65) navigate(questionPath({...question, questionNumber: question.questionNumber + 1}, 'exam'));
    else renderQuestionView();
  }

  function submitExam() {
    const questions = currentPaperQuestions();
    let attempted = 0;
    let correct = 0;
    questions.forEach(question => {
      const rec = recordFor(question);
      if (rec.examSelected?.length) {
        attempted++;
        rec.attempts += 1;
        rec.correct = isAnswerCorrect(question, rec.examSelected);
        rec.lastSubmitted = true;
        rec.needsReview = !rec.correct;
        if (rec.correct) { correct++; rec.learned = true; }
      }
    });
    saveProgress();
    toast(`Exam checked: ${correct} correct from ${attempted} attempted.`);
    navigate(`/gate1/${state.year}/question-${state.question}`);
  }

  function startExamTimer() {
    clearInterval(state.examInterval);
    const key = `exam-${state.year}`;
    state.examStartedAt = Number(sessionStorage.getItem(key)) || Date.now();
    sessionStorage.setItem(key, String(state.examStartedAt));
    const tick = () => {
      const remaining = Math.max(0, 3 * 60 * 60 - Math.floor((Date.now() - state.examStartedAt) / 1000));
      const hours = String(Math.floor(remaining / 3600)).padStart(2, '0');
      const mins = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
      const secs = String(remaining % 60).padStart(2, '0');
      const timer = document.querySelector('#exam-timer');
      if (timer) timer.textContent = `${hours}:${mins}:${secs}`;
      if (!remaining) { clearInterval(state.examInterval); submitExam(); }
    };
    tick();
    state.examInterval = setInterval(tick, 1000);
  }

  function openSource(question) {
    document.querySelector('#source-dialog-title').textContent = `${question.year} · Question ${question.questionNumber} · page ${question.sourcePage}`;
    document.querySelector('#source-dialog-image').src = question.sourceImage;
    sourceDialog.showModal();
  }

  function openSearch() {
    searchDialog.showModal();
    searchInput.value = '';
    renderSearchResults('');
    setTimeout(() => searchInput.focus(), 20);
  }

  function renderSearchResults(query) {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let results = state.data.questions.filter(question => {
      const haystack = [question.question, question.topic, question.subtopic, question.trigger, question.think, question.approach].join(' ').toLowerCase();
      return terms.every(term => haystack.includes(term));
    });
    if (!terms.length) results = state.data.questions.filter(q => q.year === state.year).slice(0, 10);
    results = results.slice(0, 20);
    searchResults.innerHTML = results.length ? results.map(q => `<button class="search-result" data-action="search-result" data-path="${questionPath(q, 'learn')}"><span>${q.year}<br>Q${q.questionNumber}</span><span><strong>${esc(q.topic)} · ${esc(q.subtopic)}</strong><small>${esc(compact(q.question, 110))}</small></span><small>${q.type}</small></button>`).join('') : `<div class="empty-state"><strong>No exact match.</strong><p>Try a shorter topic word such as “SQL”, “matrix”, “probability”, “DFS” or “SVM”.</p></div>`;
  }

  function filterSavedList() {
    if (state.view !== 'bookmarks') return;
    const query = (document.querySelector('#list-search')?.value || '').toLowerCase();
    const year = document.querySelector('#list-year')?.value || '';
    const topic = document.querySelector('#list-topic')?.value || '';
    const difficulty = document.querySelector('#list-difficulty')?.value || '';
    const questions = state.data.questions.filter(q => recordFor(q).bookmarked)
      .filter(q => !year || String(q.year) === year)
      .filter(q => !topic || q.topic === topic)
      .filter(q => !difficulty || q.difficulty === difficulty)
      .filter(q => !query || [q.question, q.topic, q.subtopic].join(' ').toLowerCase().includes(query));
    document.querySelector('#filtered-results').innerHTML = questions.length ? resultList(questions) : `<div class="empty-state"><strong>No saved question matches these filters.</strong><p>Clear a filter or bookmark more questions from Learn mode.</p></div>`;
  }

  function filterLibrary() {
    if (!['cheat', 'shortcuts'].includes(state.view)) return;
    const query = (document.querySelector('#library-search')?.value || '').toLowerCase().trim();
    const year = document.querySelector('#library-year')?.value || '';
    const topic = document.querySelector('#library-topic')?.value || '';
    const entries = state.data.questions.map(question => ({
      question,
      worked: state.solutions[`${question.year}-${question.questionNumber}`],
    })).filter(entry => entry.worked)
      .filter(({question}) => !year || String(question.year) === year)
      .filter(({question}) => !topic || question.topic === topic)
      .filter(({question, worked}) => !query || [question.topic, question.subtopic, question.question, worked.title, worked.shortcut, worked.cheat.trigger, worked.cheat.rule, worked.cheat.formula, worked.cheat.trap].join(' ').toLowerCase().includes(query));
    document.querySelector('#library-count').textContent = `${entries.length} revision ${entries.length === 1 ? 'card' : 'cards'}`;
    document.querySelector('#library-results').innerHTML = renderLibraryCards(entries, state.view);
    typesetMath();
  }

  document.addEventListener('click', event => {
    const route = event.target.closest('[data-route]');
    if (route && route.getAttribute('aria-disabled') !== 'true') {
      event.preventDefault();
      navigate(route.getAttribute('href'));
      sidebar.classList.remove('open');
      return;
    }
    const action = event.target.closest('[data-action]');
    if (!action) return;
    const question = currentQuestion();
    switch (action.dataset.action) {
      case 'palette-question': navigate(questionPath({...question, questionNumber: +action.dataset.question}, ['learn','paper','practice','exam'].includes(state.view) ? state.view : 'learn')); break;
      case 'bookmark': { const rec = recordFor(question); rec.bookmarked = !rec.bookmarked; saveProgress(); renderQuestionView(); toast(rec.bookmarked ? 'Saved to bookmarks.' : 'Removed from bookmarks.'); break; }
      case 'zoom-source': openSource(question); break;
      case 'select-option': selectOption(question, action.dataset.value); break;
      case 'submit-answer': submitAnswer(question); break;
      case 'retry-answer': { const rec = recordFor(question); rec.lastSubmitted = false; state.draftAnswers[question.id] = []; saveProgress(); renderQuestionView(); break; }
      case 'save-next': saveExamAnswer(question, true); break;
      case 'clear-response': state.draftAnswers[question.id] = []; recordFor(question).examSelected = []; saveProgress(); renderQuestionView(); break;
      case 'mark-review': { const rec = recordFor(question); rec.needsReview = !rec.needsReview; saveProgress(); renderQuestionView(); break; }
      case 'submit-exam': submitExam(); break;
      case 'toggle-learned': { const rec = recordFor(question); rec.learned = !rec.learned; saveProgress(); renderQuestionView(); break; }
      case 'search-result': searchDialog.close(); navigate(action.dataset.path); break;
    }
  });

  document.addEventListener('input', event => {
    if (event.target.matches('[data-action="nat-input"]')) state.draftAnswers[currentQuestion().id] = [event.target.value];
    if (event.target === searchInput) renderSearchResults(event.target.value);
    if (event.target.matches('#list-search, #list-year, #list-topic, #list-difficulty')) filterSavedList();
    if (event.target.matches('#library-search, #library-year, #library-topic')) filterLibrary();
  });
  document.addEventListener('change', event => {
    if (event.target.matches('#list-year, #list-topic, #list-difficulty')) filterSavedList();
    if (event.target.matches('#library-year, #library-topic')) filterLibrary();
  });

  paperSelector.addEventListener('change', () => {
    state.year = +paperSelector.value;
    const q = state.view === 'dashboard' ? 1 : state.question;
    navigate(questionPath({year: state.year, questionNumber: q}, ['learn','paper','practice','exam'].includes(state.view) ? state.view : 'learn'));
  });
  document.querySelector('#palette-filter').addEventListener('click', event => {
    state.paletteFilter = state.paletteFilter === 'all' ? 'retry' : 'all';
    event.currentTarget.textContent = state.paletteFilter === 'all' ? 'All' : 'Retry';
    renderPalette();
  });
  document.querySelector('#menu-button').addEventListener('click', event => {
    sidebar.classList.toggle('open');
    event.currentTarget.setAttribute('aria-expanded', String(sidebar.classList.contains('open')));
  });
  document.querySelector('#search-trigger').addEventListener('click', openSearch);
  document.querySelector('#source-dialog-close').addEventListener('click', () => sourceDialog.close());
  document.querySelector('#theme-button').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
  });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); openSearch(); return; }
    if (!['learn','paper','practice','exam'].includes(state.view) || ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    const question = currentQuestion();
    if (event.key === 'ArrowLeft' && question.questionNumber > 1) navigate(questionPath({...question, questionNumber: question.questionNumber - 1}, state.view));
    if (event.key === 'ArrowRight' && question.questionNumber < 65) navigate(questionPath({...question, questionNumber: question.questionNumber + 1}, state.view));
    if (event.key.toLowerCase() === 'b') { const rec = recordFor(question); rec.bookmarked = !rec.bookmarked; saveProgress(); renderQuestionView(); }
  });
  window.addEventListener('popstate', applyRoute);

  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  Promise.all([fetch(DATA_URL), fetch(SOLUTIONS_URL)])
    .then(async ([dataResponse, solutionsResponse]) => {
      if (!dataResponse.ok) throw new Error(`Question data request failed (${dataResponse.status})`);
      if (!solutionsResponse.ok) throw new Error(`Worked solutions request failed (${solutionsResponse.status})`);
      return Promise.all([dataResponse.json(), solutionsResponse.json()]);
    })
    .then(([data, solutions]) => {
      state.data = data;
      state.solutions = solutions;
      applyRoute();
    })
    .catch(error => {
      main.innerHTML = `<div class="empty-state" style="margin-top:100px"><strong>The question library could not be loaded.</strong><p>${esc(error.message)}. Refresh once; if it persists, check that the site is being served from its root.</p></div>`;
    });
})();
