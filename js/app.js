import { getLang, t, initLangToggle, applyTranslations, ROOT } from './i18n.js';
import { render } from './template-engine.js';
import { copyToClipboard, downloadSkillZip } from './output.js';
import { pixelMark } from './pixel-marks.js';

const state = {
  manifest: null,
  skillId: null,
  stepIndex: 0,
  answers: {},   // question id -> string | string[]
  outputs: null, // { skill, prompt }
  busy: false,
};

const $ = (sel) => document.querySelector(sel);

/** « Erreur : » + message, as a written alert (never colour alone). */
function alertBox(message, ...actions) {
  const box = document.createElement('div');
  box.className = 'alert';
  box.setAttribute('role', 'alert');
  box.innerHTML = `${pixelMark('bang')}<div><p><strong></strong> <span></span></p></div>`;
  box.querySelector('strong').textContent = t('label.error').trim();
  box.querySelector('span').textContent = message;
  for (const a of actions) box.lastElementChild.appendChild(a);
  return box;
}

// ---------------------------------------------------------------- bootstrap

async function init() {
  initLangToggle();
  state.skillId = (new URLSearchParams(location.search).get('skill') || '').replace(/[^a-z0-9-]/gi, '');
  try {
    const res = await fetch(`${ROOT}skills/${state.skillId}/manifest.json`);
    if (!res.ok) throw new Error(res.status);
    state.manifest = await res.json();
  } catch {
    const back = document.createElement('a');
    back.className = 'btn btn-s';
    back.href = 'index.html';
    back.textContent = '← Skill Forge';
    $('#wizard').replaceChildren(alertBox(t('wizard.notFound'), back));
    return;
  }
  document.title = `${state.manifest.name[getLang()]} — Skill Forge`;
  renderStep();
}

// ---------------------------------------------------------------- wizard

function renderStep() {
  const lang = getLang();
  const steps = state.manifest.steps;
  const step = steps[state.stepIndex];
  const wizard = $('#wizard');
  const isLast = state.stepIndex === steps.length - 1;
  const cases = steps.map((_, i) => `<i class="${i < state.stepIndex ? 'done' : i === state.stepIndex ? 'cur' : ''}"></i>`).join('');

  wizard.innerHTML = `
    <div class="steps" aria-hidden="true">${cases}</div>
    <p class="step-count">${t('wizard.step', state.stepIndex + 1, steps.length)}</p>
    <h2></h2>
    <p class="step-intro"></p>
    ${state.stepIndex === 0 ? `<div class="pnote">${pixelMark('loop')}<p>${t('wizard.onceNote')}</p></div>` : ''}
    ${step.privacy ? `<div class="pnote">${pixelMark('lock')}<p>${t('wizard.privacy')}</p></div>` : ''}
    <form id="step-form" novalidate></form>
    <div class="wnav">
      <button type="button" class="btn btn-s" id="btn-back" ${state.stepIndex === 0 ? 'disabled aria-disabled="true"' : ''}>${t('wizard.back')}</button>
      <button type="button" class="btn" id="btn-next">${isLast ? t('wizard.generate') : t('wizard.next')}</button>
    </div>
    <div id="step-feedback"></div>
  `;
  wizard.querySelector('h2').textContent = step.title[lang];
  wizard.querySelector('.step-intro').textContent = (step.intro && step.intro[lang]) || '';

  const form = $('#step-form');
  for (const q of step.questions) form.appendChild(buildField(q, lang));
  // A flagged field clears as soon as it holds a value again
  form.addEventListener('input', () => revalidateFlagged(step));
  form.addEventListener('change', () => revalidateFlagged(step));

  $('#btn-back').addEventListener('click', () => {
    if (state.busy) return;
    saveStepAnswers(step);
    state.stepIndex--;
    renderStep();
    scrollTo(0, 0);
  });
  $('#btn-next').addEventListener('click', () => {
    // Double-clic : le 2e clic frappe le bouton re-rendu de l'étape suivante et
    // la franchirait en silence si ses champs ont des valeurs par défaut
    if (state.busy || Date.now() - (state.lastAdvance || 0) < 400) return;
    state.lastAdvance = Date.now();
    saveStepAnswers(step);
    if (!validateStep(step)) return;
    if (isLast) {
      runGeneration();
    } else {
      state.stepIndex++;
      renderStep();
      scrollTo(0, 0);
    }
  });

  // Entrée dans un champ = Suivant (accessibilité clavier, évite le submit implicite)
  form.addEventListener('submit', (ev) => { ev.preventDefault(); $('#btn-next').click(); });
}

function buildField(q, lang) {
  const field = document.createElement('div');
  field.className = 'field';
  field.dataset.qid = q.id;
  const isChoice = q.type === 'select' || q.type === 'multiselect';

  const label = document.createElement(isChoice ? 'p' : 'label');
  label.className = 'q-label';
  label.id = `lbl-${q.id}`;
  if (!isChoice) label.htmlFor = `q-${q.id}`;
  label.textContent = q.label[lang];
  const tag = document.createElement('span');
  tag.className = 'opt';
  tag.textContent = ' ' + (q.optional ? t('wizard.optional') : t('label.required'));
  label.appendChild(tag);
  field.appendChild(label);

  if (q.help && q.help[lang]) {
    const help = document.createElement('p');
    help.className = 'help';
    help.id = `help-${q.id}`;
    help.textContent = q.help[lang];
    field.appendChild(help);
    field.dataset.help = help.id;
  }

  const saved = state.answers[q.id];
  const describedBy = field.dataset.help;

  if (q.type === 'text' || q.type === 'textarea') {
    const input = document.createElement(q.type === 'text' ? 'input' : 'textarea');
    if (q.type === 'text') input.type = 'text';
    input.id = `q-${q.id}`;
    input.placeholder = (q.placeholder && q.placeholder[lang]) || '';
    if (typeof saved === 'string') input.value = saved;
    if (!q.optional) input.setAttribute('aria-required', 'true');
    if (describedBy) input.setAttribute('aria-describedby', describedBy);
    field.appendChild(input);
  } else if (isChoice) {
    const list = document.createElement('div');
    list.className = 'choices';
    list.dataset.kind = q.type;
    list.setAttribute('role', q.type === 'select' ? 'radiogroup' : 'group');
    list.setAttribute('aria-labelledby', label.id);
    if (q.type === 'select' && !q.optional) list.setAttribute('aria-required', 'true');
    if (describedBy) list.setAttribute('aria-describedby', describedBy);
    const inputType = q.type === 'select' ? 'radio' : 'checkbox';
    for (const opt of q.options) {
      const optLabel = document.createElement('label');
      optLabel.className = 'choice';
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

  const error = document.createElement('p');
  error.className = 'field-err';
  error.id = `err-${q.id}`;
  error.hidden = true;
  error.innerHTML = `${pixelMark('bang')}<span><strong></strong> <span></span></span>`;
  error.querySelector('strong').textContent = t('label.error').trim();
  error.querySelector('span span').textContent = t('wizard.required');
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

function isEmpty(value) {
  return value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

/** The control that carries the question: the field itself, or its group. */
function controlOf(q) {
  return document.getElementById(`q-${q.id}`) || document.querySelector(`.field[data-qid="${q.id}"] .choices`);
}

function flag(q, invalid) {
  const field = document.querySelector(`.field[data-qid="${q.id}"]`);
  if (!field) return;
  field.classList.toggle('invalid', invalid);
  const control = controlOf(q);
  const error = field.querySelector('.field-err');
  error.hidden = !invalid;
  if (control) {
    if (invalid) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
    const ids = [field.dataset.help, invalid ? error.id : null].filter(Boolean);
    if (ids.length) control.setAttribute('aria-describedby', ids.join(' '));
    else control.removeAttribute('aria-describedby');
  }
}

function revalidateFlagged(step) {
  const flagged = step.questions.filter((q) => document.querySelector(`.field[data-qid="${q.id}"].invalid`));
  if (!flagged.length) return;
  saveStepAnswers(step);
  for (const q of flagged) if (!isEmpty(state.answers[q.id])) flag(q, false);
}

/** Flags every empty required field at once, then moves focus to the first. */
function validateStep(step) {
  let first = null;
  for (const q of step.questions) {
    const invalid = !q.optional && isEmpty(state.answers[q.id]);
    flag(q, invalid);
    if (invalid && !first) first = q;
  }
  if (!first) return true;
  const control = controlOf(first);
  const target = control && control.matches('.choices') ? control.querySelector('input') : control;
  if (target) target.focus();
  return false;
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

/** Generation in progress: « Retour » is off, the button says so, a status line is announced. */
function setGenerating(on) {
  const next = $('#btn-next');
  const back = $('#btn-back');
  const feedback = $('#step-feedback');
  if (!next || !back || !feedback) return;
  if (on) {
    state.nextLabel = next.textContent;
    next.textContent = t('wizard.generating');
    next.setAttribute('aria-disabled', 'true');
    back.disabled = true;
    back.setAttribute('aria-disabled', 'true');
    feedback.innerHTML = `<div class="loading" role="status"><p></p><div class="dashbar" aria-hidden="true"></div></div>`;
    feedback.querySelector('p').textContent = t('wizard.generatingStatus');
  } else {
    next.textContent = state.nextLabel || t('wizard.generate');
    next.removeAttribute('aria-disabled');
    if (state.stepIndex > 0) {
      back.disabled = false;
      back.removeAttribute('aria-disabled');
    }
    feedback.replaceChildren();
  }
}

async function runGeneration() {
  if (state.busy) return;
  state.busy = true;
  setGenerating(true);
  try {
    await generate();
  } catch {
    setGenerating(false);
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'btn btn-s';
    retry.textContent = t('action.retry');
    retry.addEventListener('click', runGeneration);
    $('#step-feedback').replaceChildren(alertBox(t('wizard.generateError'), retry));
    retry.focus();
  } finally {
    state.busy = false;
  }
}

async function generate() {
  const skillLang = state.answers.skill_language === 'en' ? 'en' : 'fr';
  const base = `${ROOT}skills/${state.skillId}`;
  const [templateRes, promptRes] = await Promise.all([
    fetch(`${base}/template.${skillLang}.md`),
    fetch(`${base}/meta-prompt.${skillLang}.md`),
  ]);
  if (!templateRes.ok || !promptRes.ok) throw new Error('template');
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
  const selected = (tab) => (activeTab === tab ? 'true' : 'false');

  wizard.innerHTML = `
    <h2 class="with-mark">${pixelMark('check')}<span>${t('out.title')}</span></h2>
    <p class="step-intro">${t('out.subtitle')}</p>
    <div class="tabs" role="tablist">
      <button type="button" role="tab" id="tab-btn-ready" aria-controls="tab-ready" aria-selected="${selected('ready')}" data-tab="ready">${t('out.tabReady')}</button>
      <button type="button" role="tab" id="tab-btn-prompt" aria-controls="tab-prompt" aria-selected="${selected('prompt')}" data-tab="prompt">${t('out.tabPrompt')}</button>
    </div>

    <section id="tab-ready" role="tabpanel" aria-labelledby="tab-btn-ready" ${activeTab === 'ready' ? '' : 'hidden'}>
      <p class="tab-explain">${t('out.readyExplain')}</p>
      <div class="actions">
        <button type="button" class="btn" id="btn-zip">${t('out.downloadZip')}</button>
        <button type="button" class="btn btn-s" id="btn-copy-skill">${t('out.copy')}</button>
      </div>
      <pre class="preview" id="preview-skill" tabindex="0"></pre>
      <div class="install">
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

    <section id="tab-prompt" role="tabpanel" aria-labelledby="tab-btn-prompt" ${activeTab === 'prompt' ? '' : 'hidden'}>
      <p class="tab-explain">${t('out.promptExplain')}</p>
      <div class="actions">
        <button type="button" class="btn" id="btn-copy-prompt">${t('out.copy')}</button>
        <a class="btn btn-s" href="https://claude.ai/new" target="_blank" rel="noopener">${t('out.openClaude')}</a>
      </div>
      <pre class="preview" id="preview-prompt" tabindex="0"></pre>
    </section>

    <p class="sr-live" id="copy-status" role="status"></p>
    <div class="wnav">
      <button type="button" class="btn btn-s" id="btn-restart">${t('out.restart')}</button>
    </div>
  `;

  $('#preview-skill').textContent = skill;
  $('#preview-prompt').textContent = prompt;

  wizard.querySelector('.tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-tab]');
    if (!btn) return;
    state.outputs.activeTab = btn.dataset.tab;
    wizard.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
    $('#tab-ready').hidden = btn.dataset.tab !== 'ready';
    $('#tab-prompt').hidden = btn.dataset.tab !== 'prompt';
  });

  const skillLang = state.answers.skill_language === 'en' ? 'en' : 'fr';
  const track = (action) => window.sfTrackEvent && window.sfTrackEvent('SkillForge', action, `${state.skillId}/${skillLang}`);
  $('#btn-zip').addEventListener('click', () => { track('generate-zip'); downloadSkillZip(state.skillId, skill); });
  $('#btn-copy-skill').addEventListener('click', (e) => { track('copy-skill'); copyToClipboard(skill, e.currentTarget); });
  $('#btn-copy-prompt').addEventListener('click', (e) => { track('copy-megaprompt'); copyToClipboard(prompt, e.currentTarget); });
  $('#btn-restart').addEventListener('click', () => {
    state.outputs = null;
    state.stepIndex = 0;
    renderStep();
  });
  applyTranslations();
}

init();
