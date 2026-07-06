/* Statistiques anonymes — Matomo (auto-hébergé sur ai-gmented.pm/analytics/),
   sans cookie, sans fingerprinting, Do Not Track respecté.
   Pas de script tiers : on parle directement à l'API HTTP de tracking via
   sendBeacon (requête simple, pas de lecture de réponse, pas de CORS requis).
   TODO: confirmer SITE_ID après création du site « forge.ai-gmented.pm »
   dans l'admin Matomo (Administration → Websites → Manage). */
(function () {
  var ENDPOINT = 'https://ai-gmented.pm/analytics/matomo.php';
  var SITE_ID = '2';

  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1';
  if (dnt) { window.sfTrackEvent = function () {}; return; }

  function send(extra) {
    var params = new URLSearchParams({
      idsite: SITE_ID,
      rec: '1',
      apiv: '1',
      url: location.href.split('#')[0],
      rand: String(Math.random()).slice(2)
    });
    Object.keys(extra).forEach(function (k) { params.set(k, extra[k]); });
    try {
      if (navigator.sendBeacon) { navigator.sendBeacon(ENDPOINT, params); return; }
    } catch (e) {}
    new Image(1, 1).src = ENDPOINT + '?' + params.toString();
  }

  // Pageview
  send({ action_name: document.title });

  // Événements custom : sfTrackEvent('SkillForge', 'generate-zip', skillId)
  window.sfTrackEvent = function (category, action, name) {
    send({ e_c: category, e_a: action, e_n: name || '' });
  };
})();
