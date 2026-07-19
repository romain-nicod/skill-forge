const STRINGS = {
  fr: {
    'home.heroTitle': 'Des skills Claude taillés pour votre contexte',
    'home.heroSubtitle':
      'Un bon skill embarque votre jargon, vos projets et vos enjeux. Conçu pour vos réunions récurrentes : répondez une fois à quelques questions, puis relancez simplement le skill à chaque réunion — vos réponses ne quittent jamais votre navigateur.',
    'home.available': 'Disponible',
    'home.soon': 'Bientôt',
    'card.customize': 'Personnaliser',
    'wizard.back': 'Retour',
    'wizard.generateError': 'La génération a échoué (réseau ?). Réessayez.',
    'wizard.next': 'Suivant',
    'wizard.generate': 'Générer mon skill',
    'wizard.step': 'Étape {0} sur {1}',
    'wizard.required': 'Ce champ est requis.',
    'wizard.optional': '(optionnel)',
    'wizard.privacy':
      '🔒 Confidentialité : tout se passe dans votre navigateur. Aucune réponse n’est envoyée à un serveur.',
    'wizard.onceNote':
      '🔁 Un investissement unique : ces quelques étapes (~5 min) configurent un skill fait pour vos réunions récurrentes. Vous répondez une fois — ensuite, à chaque réunion, vous lancez simplement le skill avec votre transcript.',
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
    'footer.note': '100 % statique : vos réponses ne quittent jamais votre navigateur.',
    'footer.service': 'Skill Forge est un service de',
    'footer.legal': 'Mentions légales',
    'footer.privacy': 'Confidentialité',
    'footer.cookies': 'Cookies',
    'footer.accessibility': 'Accessibilité',
    'nav.who': 'Qui sommes-nous',
    'nav.services': 'Services',
    'nav.expertise': 'Expertise',
    'nav.track': 'Réalisations',
    'nav.approach': 'Notre approche',
    'nav.skillforge': 'Skill Forge',
    'nav.contact': 'Contact',
    'hero.service': 'Un service de',
    'home.intro':
      'Le Skill Forge transforme votre contexte projet en outils opérationnels : répondez une fois à un court questionnaire (~5 min), et repartez avec un skill Claude prêt à installer — comptes-rendus qui captent les décisions et les non-dits, coach de réunion, extraction de backlog. Aucun compte, aucune clé API : tout est généré dans votre navigateur.',
    'more.label': 'Skills complémentaires',
    'more.title': 'Il manque un skill à votre forge ?',
    'more.text':
      'Débrief candidat, revue de risques, préparation de comité… Dites-nous quel skill accélérerait vos projets : nous en forgeons de nouveaux en continu, en priorité sur demande.',
    'more.cta': 'Demander un skill sur LinkedIn',
    'contact.label': 'Contact',
    'contact.title': 'Parlons-en.',
    'contact.name': 'Votre nom',
    'contact.email': 'Votre email',
    'contact.message': 'Comment pouvons-nous vous aider ?',
    'contact.consent':
      'J’autorise AI-GMENTED.pm à traiter mes données pour répondre à cette demande.',
    'contact.send': 'Envoyer',
    'contact.sending': 'Envoi…',
    'contact.sent': 'Message envoyé. Nous revenons vers vous rapidement.',
    'contact.errExpired': 'Le formulaire a expiré — merci de réessayer.',
    'contact.errTooMany': 'Trop de messages — merci de réessayer plus tard.',
    'contact.error': 'Une erreur est survenue. Réessayez ou écrivez-nous directement.',
    'contact.fallback':
      'Le formulaire n’est pas encore actif sur ce sous-domaine — écrivez-nous directement :',
    'contact.asideTitle': 'Vous préférez un échange direct ?',
    'contact.asideText':
      'Retrouvez-nous sur LinkedIn pour en savoir plus sur AI-GMENTED.pm et échanger avec nous.',
  },
  en: {
    'home.heroTitle': 'Claude skills tailored to your context',
    'home.heroSubtitle':
      'A good skill carries your jargon, your projects and your stakes. Built for your recurring meetings: answer a few questions once, then simply run the skill at every meeting — your answers never leave your browser.',
    'home.available': 'Available',
    'home.soon': 'Coming soon',
    'card.customize': 'Customize',
    'wizard.back': 'Back',
    'wizard.generateError': 'Generation failed (network?). Please try again.',
    'wizard.next': 'Next',
    'wizard.generate': 'Generate my skill',
    'wizard.step': 'Step {0} of {1}',
    'wizard.required': 'This field is required.',
    'wizard.optional': '(optional)',
    'wizard.privacy':
      '🔒 Privacy: everything happens in your browser. No answer is ever sent to a server.',
    'wizard.onceNote':
      '🔁 A one-time investment: these few steps (~5 min) configure a skill built for your recurring meetings. You answer once — then, at every meeting, you simply run the skill with your transcript.',
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
    'footer.note': '100% static: your answers never leave your browser.',
    'footer.service': 'Skill Forge is a service by',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy',
    'footer.cookies': 'Cookies',
    'footer.accessibility': 'Accessibility',
    'nav.who': 'Who we are',
    'nav.services': 'Services',
    'nav.expertise': 'Expertise',
    'nav.track': 'Track Record',
    'nav.approach': 'How we work',
    'nav.skillforge': 'Skill Forge',
    'nav.contact': 'Contact',
    'hero.service': 'A service by',
    'home.intro':
      'The Skill Forge turns your project context into working tools: answer a short questionnaire once (~5 min) and walk away with a ready-to-install Claude skill — meeting minutes that capture decisions and what was left unsaid, a meeting coach, backlog extraction. No account, no API key: everything is generated in your browser.',
    'more.label': 'Complementary skills',
    'more.title': 'Missing a skill in your forge?',
    'more.text':
      'Candidate debrief, risk review, steering committee prep… Tell us which skill would accelerate your projects: we keep forging new ones, prioritised on demand.',
    'more.cta': 'Request a skill on LinkedIn',
    'contact.label': 'Contact',
    'contact.title': 'Let’s talk.',
    'contact.name': 'Your name',
    'contact.email': 'Your email',
    'contact.message': 'How can we help?',
    'contact.consent':
      'I consent to AI-GMENTED.pm processing my data to respond to this enquiry.',
    'contact.send': 'Send message',
    'contact.sending': 'Sending…',
    'contact.sent': 'Message sent. We will get back to you shortly.',
    'contact.errExpired': 'The form expired — please try again.',
    'contact.errTooMany': 'Too many messages — please try again later.',
    'contact.error': 'Something went wrong. Please try again or email us directly.',
    'contact.fallback':
      'The form is not active on this subdomain yet — email us directly:',
    'contact.asideTitle': 'Prefer a direct conversation?',
    'contact.asideText':
      'Visit our LinkedIn page to learn more about AI-GMENTED.pm and connect with us.',
  },
};

// ------------------------------------------------------------------
// i18n par URL : la langue de la page est portée par l'URL, jamais par
// localStorage. FR vit à la racine "/", EN sous "/en/". Chaque page HTML
// déclare sa langue via <html lang="…"> et son préfixe de chemin vers la
// racine du site via data-root ("./" côté FR, "../" côté EN) — les fetch
// JS (catalogue, manifests, templates) passent par ce préfixe.
// ------------------------------------------------------------------

/** Préfixe relatif vers la racine du site ("./" en FR, "../" en EN). */
export const ROOT = document.documentElement.getAttribute('data-root') || './';

/** Langue de la page courante — l'URL (via <html lang>) est la source de vérité. */
export function getLang() {
  return (document.documentElement.lang || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
}

// Compat site maître : ai-gmented.pm transmet ?lang=fr|en (localStorage
// étanche entre origines). Si la langue demandée n'est pas celle de la
// page, on redirige vers l'URL miroir en préservant les autres paramètres
// (?skill=…, ?theme=…) et l'ancre. Amélioration progressive uniquement :
// sans JavaScript, les liens <a> du sélecteur FR/EN restent fonctionnels.
(function redirectToRequestedLang() {
  const params = new URLSearchParams(location.search);
  const asked = params.get('lang');
  if (asked !== 'fr' && asked !== 'en') return;
  if (asked === getLang()) return;
  params.delete('lang');
  const qs = params.toString() ? `?${params.toString()}` : '';
  const file = location.pathname.split('/').pop() || '';
  const target = asked === 'en' ? `en/${file}` : `../${file}`;
  location.replace(target + qs + location.hash);
})();

export function t(key, ...params) {
  const lang = getLang();
  let str = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  params.forEach((p, i) => {
    str = str.replace(`{${i}}`, p);
  });
  return str;
}

/** Translate every element carrying a data-i18n attribute (progressive enhancement). */
export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
}

/**
 * Sélecteur FR/EN : de vrais liens <a> vers l'URL miroir (fonctionnels sans
 * JavaScript). Le JS n'ajoute que deux améliorations : l'état actif, et la
 * conservation des paramètres de la page courante (ex. ?skill=… sur le
 * générateur) dans le lien vers l'autre langue.
 */
export function initLangToggle() {
  const toggle = document.querySelector('.lang-toggle');
  if (!toggle) return;
  const lang = getLang();
  toggle.querySelectorAll('a[data-lang]').forEach((a) => {
    const isCurrent = a.dataset.lang === lang;
    a.classList.toggle('active', isCurrent);
    if (isCurrent) a.setAttribute('aria-current', 'true');
    if (!isCurrent && location.search) {
      const url = new URL(a.getAttribute('href'), location.href);
      const params = new URLSearchParams(location.search);
      params.delete('lang');
      const qs = params.toString();
      if (qs) a.href = `${url.pathname}?${qs}${url.hash || ''}`;
    }
  });
  applyTranslations();
}
