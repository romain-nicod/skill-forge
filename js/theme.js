/* Light/dark switch — loaded in the head (blocking, no defer) to set
   data-theme before the first paint without an inline script (CSP: script-src 'self').
   Reads ?theme= sent by the main site, then the local storage, then the system
   preference. The theme button is hidden in the markup and revealed here, so
   that without a script there is no dead control.
   The mobile menu is a native <details>: it needs no script. */
(function () {
  var KEY = 'skillforge-theme';

  // ?theme= handed over by the main site (local storage is sealed between origins)
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
    // Links to the main site: carry the current theme at click time
    document.querySelectorAll('a[href^="https://ai-gmented.pm"]').forEach(function (a) {
      a.addEventListener('click', function () {
        var url = new URL(a.href);
        url.searchParams.set('theme', current());
        a.href = url.toString();
      });
    });

    // Clean the address bar: ?theme= and ?lang= are read and remembered
    if (window.history && history.replaceState && /[?&](theme|lang)=/.test(location.search)) {
      var clean = new URL(location.href);
      clean.searchParams.delete('theme');
      clean.searchParams.delete('lang');
      history.replaceState(null, '', clean.pathname + clean.search + clean.hash);
    }

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.hidden = false;
      btn.setAttribute('aria-pressed', current() === 'dark');
      btn.addEventListener('click', function () {
        apply(current() === 'dark' ? 'light' : 'dark');
      });
    });
  });
})();
