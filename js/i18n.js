const STRINGS = {
  fr: {
    'app.tagline': 'Générez votre skill Claude personnalisé',
    'home.heroTitle': 'Des skills Claude taillés pour votre contexte',
    'home.heroSubtitle':
      'Un bon skill embarque votre jargon, vos projets et vos enjeux. Répondez à quelques questions et repartez avec un skill prêt à installer — vos réponses ne quittent jamais votre navigateur.',
    'home.available': 'Disponible',
    'home.soon': 'Bientôt',
    'card.customize': 'Personnaliser',
    'wizard.back': 'Retour',
    'wizard.next': 'Suivant',
    'wizard.generate': 'Générer mon skill',
    'wizard.step': 'Étape {0} sur {1}',
    'wizard.required': 'Ce champ est requis.',
    'wizard.optional': '(optionnel)',
    'wizard.privacy':
      '🔒 Confidentialité : tout se passe dans votre navigateur. Aucune réponse n’est envoyée à un serveur.',
    'wizard.notFound': 'Skill introuvable. Retournez au catalogue.',
    'out.title': 'Votre skill est prêt 🎉',
    'out.subtitle': 'Deux façons de l’utiliser — choisissez celle qui vous convient.',
    'out.tabReady': 'Skill prêt à l’emploi',
    'out.tabPrompt': 'Sur mesure via votre Claude',
    'out.readyExplain':
      'Vos réponses ont été injectées dans le skill de base. Téléchargez le .zip et installez-le tel quel, ou copiez le contenu.',
    'out.promptExplain':
      'Copiez ce prompt et collez-le dans une conversation Claude (claude.ai). Claude vous posera quelques questions complémentaires, puis rédigera un skill vraiment sur mesure à partir de la même base.',
    'out.copy': 'Copier',
    'out.copied': 'Copié ✓',
    'out.downloadZip': 'Télécharger le .zip',
    'out.openClaude': 'Ouvrir claude.ai',
    'out.installTitle': 'Installer le skill',
    'out.installClaudeAi': 'Sur claude.ai',
    'out.installClaudeAi1': 'Ouvrez Paramètres → Capacités → Skills.',
    'out.installClaudeAi2': 'Cliquez sur « Téléverser un skill » et sélectionnez le .zip téléchargé.',
    'out.installClaudeAi3': 'Activez le skill : Claude l’utilisera dès que vous fournirez un transcript.',
    'out.installClaudeCode': 'Dans Claude Code',
    'out.installClaudeCode1': 'Créez le dossier {0}.',
    'out.installClaudeCode2': 'Enregistrez-y le contenu sous le nom {0}.',
    'out.restart': 'Recommencer',
    'footer.note': 'Skill Forge — 100 % statique, aucune donnée collectée.',
  },
  en: {
    'app.tagline': 'Generate your personalized Claude skill',
    'home.heroTitle': 'Claude skills tailored to your context',
    'home.heroSubtitle':
      'A good skill carries your jargon, your projects and your stakes. Answer a few questions and leave with a ready-to-install skill — your answers never leave your browser.',
    'home.available': 'Available',
    'home.soon': 'Coming soon',
    'card.customize': 'Customize',
    'wizard.back': 'Back',
    'wizard.next': 'Next',
    'wizard.generate': 'Generate my skill',
    'wizard.step': 'Step {0} of {1}',
    'wizard.required': 'This field is required.',
    'wizard.optional': '(optional)',
    'wizard.privacy':
      '🔒 Privacy: everything happens in your browser. No answer is ever sent to a server.',
    'wizard.notFound': 'Skill not found. Go back to the catalog.',
    'out.title': 'Your skill is ready 🎉',
    'out.subtitle': 'Two ways to use it — pick the one that suits you.',
    'out.tabReady': 'Ready-to-use skill',
    'out.tabPrompt': 'Tailor-made via your Claude',
    'out.readyExplain':
      'Your answers were injected into the base skill. Download the .zip and install it as-is, or copy the content.',
    'out.promptExplain':
      'Copy this prompt and paste it into a Claude conversation (claude.ai). Claude will ask you a few follow-up questions, then write a truly tailor-made skill from the same base.',
    'out.copy': 'Copy',
    'out.copied': 'Copied ✓',
    'out.downloadZip': 'Download .zip',
    'out.openClaude': 'Open claude.ai',
    'out.installTitle': 'Install the skill',
    'out.installClaudeAi': 'On claude.ai',
    'out.installClaudeAi1': 'Open Settings → Capabilities → Skills.',
    'out.installClaudeAi2': 'Click “Upload skill” and select the downloaded .zip.',
    'out.installClaudeAi3': 'Enable the skill: Claude will use it whenever you provide a transcript.',
    'out.installClaudeCode': 'In Claude Code',
    'out.installClaudeCode1': 'Create the folder {0}.',
    'out.installClaudeCode2': 'Save the content there as {0}.',
    'out.restart': 'Start over',
    'footer.note': 'Skill Forge — 100% static, no data collected.',
  },
};

const STORAGE_KEY = 'skillforge-lang';

export function getLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'fr' || saved === 'en') return saved;
  return navigator.language && navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export function setLang(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  applyTranslations();
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

export function t(key, ...params) {
  const lang = getLang();
  let str = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  params.forEach((p, i) => {
    str = str.replace(`{${i}}`, p);
  });
  return str;
}

/** Translate every element carrying a data-i18n attribute. */
export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
}

/** Wire the FR/EN pill in the header. */
export function initLangToggle() {
  document.documentElement.lang = getLang();
  const toggle = document.querySelector('.lang-toggle');
  if (!toggle) return;
  const refresh = () => {
    toggle.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === getLang());
    });
  };
  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-lang]');
    if (!btn) return;
    setLang(btn.dataset.lang);
    refresh();
  });
  refresh();
  applyTranslations();
}
