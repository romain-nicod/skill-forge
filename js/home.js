import { getLang, t, initLangToggle } from './i18n.js';

async function renderCatalog() {
  const grid = document.getElementById('catalog');
  const lang = getLang();
  const res = await fetch('skills/catalog.json');
  const catalog = await res.json();

  grid.innerHTML = '';
  for (const skill of catalog.skills) {
    const card = document.createElement('article');
    card.className = 'card' + (skill.available ? '' : ' soon');
    card.innerHTML = `
      <span class="icon">${skill.icon}</span>
      <span class="badge">${skill.available ? t('home.available') : t('home.soon')}</span>
      <h3></h3>
      <p></p>
    `;
    card.querySelector('h3').textContent = skill.name[lang];
    card.querySelector('p').textContent = skill.description[lang];
    if (skill.available) {
      const link = document.createElement('a');
      link.className = 'cta-link';
      link.href = `generator.html?skill=${encodeURIComponent(skill.id)}`;
      link.innerHTML = `${t('card.customize')} <span class="arrow">→</span>`;
      card.appendChild(link);
    }
    grid.appendChild(card);
  }
}

initLangToggle();
renderCatalog();
document.addEventListener('langchange', renderCatalog);
