(function () {
  var loader = document.currentScript;
  var endpoint = loader && loader.dataset.endpoint;
  if (!endpoint) return;

  var callbackName = 'WenyanBusuanziCallback_' + Math.floor(Math.random() * 1e9);
  var script = document.createElement('script');
  var timer = window.setTimeout(cleanup, 10000);

  function reveal(key, value) {
    if (!Number.isFinite(Number(value))) return;
    var output = document.getElementById('busuanzi_value_' + key);
    var container = document.getElementById('busuanzi_container_' + key);
    if (!output || !container) return;
    output.textContent = String(value);
    container.style.display = 'inline';
  }

  function cleanup() {
    window.clearTimeout(timer);
    if (script.parentNode) script.parentNode.removeChild(script);
    try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
  }

  window[callbackName] = function (data) {
    reveal('page_pv', data && data.page_pv);
    reveal('site_pv', data && data.site_pv);
    reveal('site_uv', data && data.site_uv);
    cleanup();
  };

  script.async = true;
  script.referrerPolicy = 'no-referrer-when-downgrade';
  script.src = endpoint + (endpoint.indexOf('?') === -1 ? '?' : '&') + 'jsonpCallback=' + callbackName;
  script.addEventListener('error', cleanup);
  document.head.appendChild(script);
})();
