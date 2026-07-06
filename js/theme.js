/* Bascule light/dark. La classe est posée sur <html> dès le <head>
   (script inline anti-FOUC) ; ici on ne gère que le bouton. */
(function () {
  var KEY = 'skillforge-theme';

  function current() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark');
    });
  }

  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.setAttribute('aria-pressed', current() === 'dark');
    btn.addEventListener('click', function () {
      apply(current() === 'dark' ? 'light' : 'dark');
    });
  });

  // Menu mobile (même comportement que ai-gmented.pm)
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
})();
