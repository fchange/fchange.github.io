(function () {
  function detectLanguage(figure) {
    var classes = Array.prototype.slice.call(figure.classList || []);
    for (var i = 0; i < classes.length; i += 1) {
      if (classes[i] !== 'highlight') return classes[i];
    }
    return 'text';
  }

  function formatLanguage(language) {
    var normalized = (language || 'text').replace(/^language-/, '');
    var aliases = {
      js: 'JavaScript',
      ts: 'TypeScript',
      jsx: 'JSX',
      tsx: 'TSX',
      sh: 'Shell',
      bash: 'Bash',
      zsh: 'Zsh',
      yml: 'YAML',
      md: 'Markdown',
      golang: 'Go',
      plaintext: 'Text'
    };

    if (aliases[normalized]) return aliases[normalized];
    if (normalized.length <= 3) return normalized.toUpperCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        resolve();
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function enhanceCodeBlock(figure) {
    if (!figure || figure.dataset.enhanced === 'true') return;

    var language = detectLanguage(figure);
    var codePre = figure.querySelector('.code pre') || figure.querySelector('pre');
    if (!codePre) return;

    var toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';

    var label = document.createElement('span');
    label.className = 'code-language';
    label.textContent = formatLanguage(language);

    var button = document.createElement('button');
    button.className = 'code-copy-button';
    button.type = 'button';
    button.textContent = 'Copy';

    button.addEventListener('click', function () {
      var originalText = button.textContent;
      copyText(codePre.innerText.replace(/\n$/, ''))
        .then(function () {
          button.textContent = 'Copied';
          button.classList.add('is-copied');
          window.setTimeout(function () {
            button.textContent = originalText;
            button.classList.remove('is-copied');
          }, 1600);
        })
        .catch(function () {
          button.textContent = 'Failed';
          window.setTimeout(function () {
            button.textContent = originalText;
          }, 1600);
        });
    });

    toolbar.appendChild(label);
    toolbar.appendChild(button);
    figure.insertBefore(toolbar, figure.firstChild);
    figure.dataset.enhanced = 'true';
    figure.dataset.language = language;
  }

  function initCodeBlocks() {
    var blocks = document.querySelectorAll('figure.highlight');
    for (var i = 0; i < blocks.length; i += 1) {
      enhanceCodeBlock(blocks[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeBlocks);
  } else {
    initCodeBlocks();
  }
})();
