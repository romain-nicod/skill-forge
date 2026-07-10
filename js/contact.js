/* Formulaire de contact — même mécanique que ai-gmented.pm (CSRF + AJAX).
   Si /contact.php n'est pas déployé sur ce sous-domaine, le formulaire
   s'efface au profit d'un lien e-mail direct. */
import { t } from './i18n.js';

(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  function showFallback() {
    var wrap = form.closest('.contact-form-wrap');
    if (!wrap) return;
    wrap.innerHTML =
      '<p class="tab-explain" data-i18n="contact.fallback">' + t('contact.fallback') + '</p>' +
      '<a class="cta-link" href="mailto:contact@ai-gmented.pm">contact@ai-gmented.pm <span class="arrow">→</span></a>';
  }

  fetch('/contact.php?csrf')
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function (d) {
      document.getElementById('csrf_token').value = d.token;
    })
    .catch(showFallback);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = document.getElementById('form-status');
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = t('contact.sending');
    status.textContent = '';
    status.className = 'form-status';

    fetch('/contact.php', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.status === 'success') {
          status.textContent = t('contact.sent');
          status.className = 'form-status success';
          form.reset();
          fetch('/contact.php?csrf')
            .then(function (r) { return r.json(); })
            .then(function (d2) { document.getElementById('csrf_token').value = d2.token; });
        } else {
          // Libellé localisé selon le code (d.message est en anglais)
          status.textContent = ({ expired: t('contact.errExpired'), 'rate-limited': t('contact.errTooMany') })[d.code] || t('contact.error');
          status.className = 'form-status error';
          fetch('/contact.php?csrf')
            .then(function (r) { return r.json(); })
            .then(function (d2) { document.getElementById('csrf_token').value = d2.token; })
            .catch(function () {});
        }
      })
      .catch(function () {
        status.textContent = t('contact.error');
        status.className = 'form-status error';
      })
      .finally(function () {
        btn.disabled = false;
        btn.innerHTML = t('contact.send') + ' <span class="arrow">→</span>';
      });
  });
})();
