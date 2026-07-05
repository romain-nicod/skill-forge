import { getLang, t, initLangToggle, applyTranslations } from './i18n.js';
import { render } from './template-engine.js';
import { copyToClipboard, downloadSkillZip } from './output.js';

const state = {
  manifest: null,
  skillId: null,
  stepIndex: 0,
  answers: {},   // question id -> string | string[]
  outputs: null, // { skill, prompt }
};

const $ = (sel) => document.querySelector(sel);

// ---------------------------------------------------------------- bootstrap

async function init() {
  initLangToggle();
  state.skillId = new URLSearchParams(location.search).get('skill');
  try {
    const res = await fetch(`skills/${state.skillId}/manifest.json`);
    if (!res.ok) throw new Error(res.status);
    state.manifest = await res.json();
  } catch {
    $('#wizard').innerHTML = `<p>${t('wizard.notFound')}</p>
      <a class="btn btn-secondary" href="index.html">← Skill Forge</a>`;
    return;
  }
  document.title = `${state.manifest.name[getLang()]} — Skill Forge`;
  renderStep();
  document.addEventListener('langchange', () => {
    document.title = `${state.manifest.name[getLang()]} — Skill Forge`;
    if (state.outputs) renderOutput();
    else renderStep();
  });
}

// ---------------------------------------------------------------- wizard

function renderStep() {
  const lang = getLang();
  const steps = state.manifest.steps;
  const step = steps[state.stepIndex];
  const wizard = $('#wizard');
  const isLast = state.stepIndex === steps.length - 1;

  wizard.innerHTML = `
    <div class="progress"><div class="progress-bar" style="width:${((state.stepIndex + 1) / steps.length) * 100}%"></div></div>
    <div class="step-count">${t('wizard.step', state.stepIndex + 1, steps.length)}</div>
    <h2></h2>
    <p class="step-intro"></p>
    ${step.privacy ? `<div class="privacy-note">${t('wizard.privacy')}</div>` : ''}
    <form id="step-form" novalidate></form>
    <div class="wizard-nav">
      <button type="button" class="btn btn-secondary" id="btn-back" ${state.stepIndex === 0 ? 'disabled' : ''}>${t('wizard.back')}</button>
      <button type="button" class="btn btn-primary" id="btn-next">${isLast ? t('wizard.generate') : t('wizard.next')}</button>
    </div>
  `;
  wizard.querySelector('h2').textContent = step.title[lang];
  wizard.querySelector('.step-intro').textContent = (step.intro && step.intro[lang]) || '';

  const form = $('#step-form');
  for (const q of step.questions) form.appendChild(buildField(q, lang));

  $('#btn-back').addEventListener('click', () => {
    saveStepAnswers(step);
    state.stepIndex--;
    renderStep();
    scrollTo(0, 0);
  });
  $('#btn-next').addEventListener('click', async () => {
    saveStepAnswers(step);
    if (!validateStep(step)) return;
    if (isLast) {
      await generate();
    } else {
      state.stepIndex++;
      renderStep();
      scrollTo(0, 0);
    }
  });
}

function buildField(q, lang) {
  const field = document.createElement('div');
  field.className = 'field';
  field.dataset.qid = q.id;

  const label = document.createElement('label');
  label.className = 'q-label';
  label.htmlFor = `q-${q.id}`;
  label.textContent = q.label[lang];
  if (q.optional) {
    const tag = document.createElement('span');
    tag.className = 'optional-tag';
    tag.textContent = ' ' + t('wizard.optional');
    label.appendChild(tag);
  }
  field.appendChild(label);

  if (q.help && q.help[lang]) {
    const help = document.createElement('p');
    help.className = 'help';
    help.textContent = q.help[lang];
    field.appendChild(help);
  }

  const saved = state.answers[q.id];

  if (q.type === 'text') {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `q-${q.id}`;
    input.placeholder = (q.placeholder && q.placeholder[lang]) || '';
    if (typeof saved === 'string') input.value = saved;
    field.appendChild(input);
  } else if (q.type === 'textarea') {
    const ta = document.createElement('textarea');
    ta.id = `q-${q.id}`;
    ta.placeholder = (q.placeholder && q.placeholder[lang]) || '';
    if (typeof saved === 'string') ta.value = saved;
    field.appendChild(ta);
  } else if (q.type === 'select' || q.type === 'multiselect') {
    const list = document.createElement('div');
    list.className = 'choice-list';
    const inputType = q.type === 'select' ? 'radio' : 'checkbox';
    for (const opt of q.options) {
      const optLabel = document.createElement('label');
      const input = document.createElement('input');
      input.type = inputType;
      input.name = `q-${q.id}`;
      input.value = opt.value;
      const checked =
        q.type === 'select'
          ? saved !== undefined ? saved === opt.value : opt.default === true
          : saved !== undefined ? saved.includes(opt.value) : opt.default === true;
      input.checked = checked;
      const span = document.createElement('span');
      span.textContent = opt.label[lang];
      optLabel.append(input, span);
      list.appendChild(optLabel);
    }
    field.appendChild(list);
  }

  const error = document.createElement('div');
  error.className = 'error';
  error.textContent = t('wizard.required');
  field.appendChild(error);
  return field;
}

function saveStepAnswers(step) {
  for (const q of step.questions) {
    if (q.type === 'text' || q.type === 'textarea') {
      const el = document.getElementById(`q-${q.id}`);
      if (el) state.answers[q.id] = el.value.trim();
    } else if (q.type === 'select') {
      const el = document.querySelector(`input[name="q-${q.id}"]:checked`);
      if (el) state.answers[q.id] = el.value;
    } else if (q.type === 'multiselect') {
      state.answers[q.id] = [...document.querySelectorAll(`input[name="q-${q.id}"]:checked`)].map((i) => i.value);
    }
  }
}

function validateStep(step) {
  let ok = true;
  for (const q of step.questions) {
    const value = state.answers[q.id];
    const empty = value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
    const invalid = !q.optional && empty;
    const field = document.querySelector(`.field[data-qid="${q.id}"]`);
    if (field) field.classList.toggle('invalid', invalid);
    if (invalid) ok = false;
  }
  return ok;
}

// ---------------------------------------------------------------- generation

function allQuestions() {
  return state.manifest.steps.flatMap((s) => s.questions);
}

/** Build the variable map handed to the template engine. */
function buildVars(skillLang) {
  const vars = {};
  for (const q of allQuestions()) {
    const value = state.answers[q.id];
    if (q.type === 'select') {
      const opt = q.options.find((o) => o.value === value);
      vars[q.variable] = opt ? opt.label[skillLang] : '';
      if (value) vars[`${q.variable}_${value}`] = true;
    } else if (q.type === 'multiselect') {
      const selected = Array.isArray(value) ? value : [];
      vars[q.variable] = selected.map((v) => {
        const opt = q.options.find((o) => o.value === v);
        return opt ? opt.label[skillLang] : v;
      });
      for (const v of selected) vars[`${q.variable}_${v}`] = true;
    } else {
      vars[q.variable] = value || '';
    }
  }
  return vars;
}

/** Human-readable recap of the interview, embedded in the meta-prompt. */
function buildAnswersSummary(skillLang) {
  const lines = [];
  for (const q of allQuestions()) {
    const value = state.answers[q.id];
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) continue;
    let printable;
    if (q.type === 'select') {
      const opt = q.options.find((o) => o.value === value);
      printable = opt ? opt.label[skillLang] : value;
    } else if (q.type === 'multiselect') {
      printable = value
        .map((v) => (q.options.find((o) => o.value === v) || { label: {} }).label[skillLang] || v)
        .join(', ');
    } else {
      printable = String(value);
    }
    if (printable.includes('\n')) {
      printable = '\n  ' + printable.split('\n').join('\n  ');
    }
    lines.push(`- ${q.label[skillLang]} : ${printable}`);
  }
  return lines.join('\n');
}

async function generate() {
  const skillLang = state.answers.skill_language === 'en' ? 'en' : 'fr';
  const base = `skills/${state.skillId}`;
  const [templateRes, promptRes] = await Promise.all([
    fetch(`${base}/template.${skillLang}.md`),
    fetch(`${base}/meta-prompt.${skillLang}.md`),
  ]);
  const [template, promptTemplate] = await Promise.all([templateRes.text(), promptRes.text()]);

  const vars = buildVars(skillLang);
  const skill = render(template, vars);
  const prompt = render(promptTemplate, {
    ...vars,
    base_skill: skill,
    answers_summary: buildAnswersSummary(skillLang),
  });

  state.outputs = { skill, prompt, activeTab: 'ready' };
  renderOutput();
  scrollTo(0, 0);
}

// ---------------------------------------------------------------- output

function renderOutput() {
  const { skill, prompt, activeTab } = state.outputs;
  const wizard = $('#wizard');
  const skillFolder = `~/.claude/skills/${state.skillId}/`;

  wizard.innerHTML = `
    <h2>${t('out.title')}</h2>
    <p class="step-intro">${t('out.subtitle')}</p>
    <div class="tabs">
      <button data-tab="ready" class="${activeTab === 'ready' ? 'active' : ''}">${t('out.tabReady')}</button>
      <button data-tab="prompt" class="${activeTab === 'prompt' ? 'active' : ''}">${t('out.tabPrompt')}</button>
    </div>

    <section id="tab-ready" ${activeTab === 'ready' ? '' : 'hidden'}>
      <p class="tab-explain">${t('out.readyExplain')}</p>
      <div class="output-actions">
        <button class="btn btn-primary" id="btn-zip">${t('out.downloadZip')}</button>
        <button class="btn btn-secondary" id="btn-copy-skill">${t('out.copy')}</button>
      </div>
      <pre class="preview" id="preview-skill"></pre>
      <div class="install-steps">
        <h3>${t('out.installTitle')}</h3>
        <h4>${t('out.installClaudeAi')}</h4>
        <ol>
          <li>${t('out.installClaudeAi1')}</li>
          <li>${t('out.installClaudeAi2')}</li>
          <li>${t('out.installClaudeAi3')}</li>
        </ol>
        <h4>${t('out.installClaudeCode')}</h4>
        <ol>
          <li>${t('out.installClaudeCode1', `<code>${skillFolder}</code>`)}</li>
          <li>${t('out.installClaudeCode2', '<code>SKILL.md</code>')}</li>
        </ol>
      </div>
    </section>

    <section id="tab-prompt" ${activeTab === 'prompt' ? '' : 'hidden'}>
      <p class="tab-explain">${t('out.promptExplain')}</p>
      <div class="output-actions">
        <button class="btn btn-primary" id="btn-copy-prompt">${t('out.copy')}</button>
        <a class="btn btn-secondary" href="https://claude.ai/new" target="_blank" rel="noopener">${t('out.openClaude')}</a>
      </div>
      <pre class="preview" id="preview-prompt"></pre>
    </section>

    <div class="wizard-nav">
      <button class="btn btn-secondary" id="btn-restart">${t('out.restart')}</button>
    </div>
  `;

  $('#preview-skill').textContent = skill;
  $('#preview-prompt').textContent = prompt;

  wizard.querySelector('.tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-tab]');
    if (!btn) return;
    state.outputs.activeTab = btn.dataset.tab;
    wizard.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b === btn));
    $('#tab-ready').hidden = btn.dataset.tab !== 'ready';
    $('#tab-prompt').hidden = btn.dataset.tab !== 'prompt';
  });

  $('#btn-zip').addEventListener('click', () => downloadSkillZip(state.skillId, skill));
  $('#btn-copy-skill').addEventListener('click', (e) => copyToClipboard(skill, e.target));
  $('#btn-copy-prompt').addEventListener('click', (e) => copyToClipboard(prompt, e.target));
  $('#btn-restart').addEventListener('click', () => {
    state.outputs = null;
    state.stepIndex = 0;
    renderStep();
  });
  applyTranslations();
}

init();
