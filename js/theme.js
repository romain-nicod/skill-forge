/* Bascule light/dark — chargé en tête de page (bloquant, sans defer) pour
   poser data-theme avant le premier rendu sans script inline (CSP: script-src 'self').
   Gère aussi le menu mobile (même comportement que ai-gmented.pm). */
(function () {
  var KEY = 'skillforge-theme';

  // ?theme= transmis par le site maître (localStorage étanche entre origines)
  var urlTheme = new URLSearchParams(location.search).get('theme');
  var saved;
  try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }
  if (urlTheme === 'light' || urlTheme === 'dark') {
    saved = urlTheme;
    try { localStorage.setItem(KEY, urlTheme); } catch (e) {}
  }
  if (saved !== 'light' && saved !== 'dark') {
    saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', saved);

  function current() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Liens vers le site maître : embarquer le thème courant au moment du clic
    document.querySelectorAll('a[href^="https://ai-gmented.pm"]').forEach(function (a) {
      a.addEventListener('click', function () {
        var url = new URL(a.href);
        url.searchParams.set('theme', current());
        a.href = url.toString();
      });
    });

    // Nettoyage de l'adresse : ?theme=/?lang= lus et mémorisés
    if (window.history && history.replaceState && /[?&](theme|lang)=/.test(location.search)) {
      var clean = new URL(location.href);
      clean.searchParams.delete('theme');
      clean.searchParams.delete('lang');
      history.replaceState(null, '', clean.pathname + clean.search + clean.hash);
    }

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-pressed', current() === 'dark');
      btn.addEventListener('click', function () {
        apply(current() === 'dark' ? 'light' : 'dark');
      });
    });

    var t = document.getElementById('nav-toggle');
    var n = document.getElementById('site-nav');
    if (t && n) {
      t.addEventListener('click', function () {
        var o = n.classList.toggle('open');
        t.setAttribute('aria-expanded', o);
      });
      n.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          n.classList.remove('open');
          t.setAttribute('aria-expanded', 'false');
        });
      });
    }
  });
})();
