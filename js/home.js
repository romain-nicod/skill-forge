import { getLang, t, initLangToggle, ROOT } from './i18n.js';
import { pixelMark } from './pixel-marks.js';

// The catalogue keeps its emoji icons (skills/catalog.json does not change);
// the page draws a pixel mark per skill id instead.
const MARK_BY_SKILL = {
  'meeting-minutes': 'minutes',
  'meeting-coach': 'target',
  'backlog-scanner': 'backlog',
  'candidate-debrief': 'candidate',
};

async function renderCatalog() {
  const host = document.getElementById('catalog');
  const lang = getLang();
  const res = await fetch(`${ROOT}skills/catalog.json`);
  if (!res.ok) throw new Error(res.status);
  const catalog = await res.json();

  const grid = document.createElement('div');
  grid.className = 'cards';
  for (const skill of catalog.skills) {
    const card = document.createElement('article');
    card.className = 'card' + (skill.available ? '' : ' soon');
    card.innerHTML = `
      <div class="card-top">
        ${pixelMark(MARK_BY_SKILL[skill.id] || 'minutes', 'pix card-mark')}
        <span class="badge${skill.available ? '' : ' soon'}">${skill.available ? t('home.available') : t('home.soon')}</span>
      </div>
      <h3></h3>
      <p></p>
    `;
    card.querySelector('h3').textContent = skill.name[lang];
    card.querySelector('p').textContent = skill.description[lang];
    if (skill.available) {
      const link = document.createElement('a');
      link.className = 'btn btn-s';
      link.href = `generator.html?skill=${encodeURIComponent(skill.id)}`;
      link.innerHTML = `${t('card.customize')} <span aria-hidden="true">→</span>`;
      card.appendChild(link);
    }
    grid.appendChild(card);
  }
  host.replaceChildren(grid);
}

function renderError() {
  const host = document.getElementById('catalog');
  host.innerHTML = `
    <div class="alert" role="alert">
      ${pixelMark('bang')}
      <div>
        <p><strong class="state-label"></strong> <span class="state-text"></span></p>
        <button type="button" class="btn btn-s" id="catalog-reload"></button>
      </div>
    </div>`;
  host.querySelector('.state-label').textContent = t('label.error').trim();
  host.querySelector('.state-text').textContent = t('home.error');
  const reload = host.querySelector('#catalog-reload');
  reload.textContent = t('action.reload');
  reload.addEventListener('click', () => location.reload());
}

initLangToggle();
renderCatalog().catch(renderError);
