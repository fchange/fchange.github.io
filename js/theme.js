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
    button.textContent = document.body.dataset.copyLabel || 'Copy';

    button.addEventListener('click', function () {
      var originalText = button.textContent;
      copyText(codePre.innerText.replace(/\n$/, ''))
        .then(function () {
          button.textContent = document.body.dataset.copiedLabel || 'Copied';
          button.classList.add('is-copied');
          window.setTimeout(function () {
            button.textContent = originalText;
            button.classList.remove('is-copied');
          }, 1600);
        })
        .catch(function () {
          button.textContent = document.body.dataset.copyFailedLabel || 'Failed';
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

  function initMobileMenu() {
    var trigger = document.querySelector('.mobile-menu-button');
    var close = document.querySelector('.mobile-menu-close');
    var menu = document.querySelector('.mobile-navigation');
    var backdrop = document.querySelector('.mobile-menu-backdrop');
    if (!trigger || !close || !menu || !backdrop) return;

    function setOpen(open) {
      trigger.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      menu.classList.toggle('is-open', open);
      backdrop.hidden = !open;
      document.body.classList.toggle('menu-open', open);
    }

    trigger.addEventListener('click', function () { setOpen(true); });
    close.addEventListener('click', function () { setOpen(false); });
    backdrop.addEventListener('click', function () { setOpen(false); });
    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width: 48rem)').matches) setOpen(false);
    });
  }

  function initToc() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.post-toc a'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var headings = links.map(function (link) {
      var id = decodeURIComponent((link.getAttribute('href') || '').replace(/^#/, ''));
      return document.getElementById(id);
    }).filter(Boolean);
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '0% 0% -80% 0%' });
    headings.forEach(function (heading) { observer.observe(heading); });
  }

  function initThemeToggle() {
    var button = document.querySelector('.theme-toggle');
    if (!button) return;

    function updateLabel(theme) {
      var label = theme === 'dark' ? document.body.dataset.lightThemeLabel : document.body.dataset.darkThemeLabel;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    }

    updateLabel(document.documentElement.dataset.theme || 'light');
    button.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('wenyan-theme', next); } catch (error) {}
      document.cookie = 'wenyan-theme=' + next + '; path=/; max-age=31536000; SameSite=Lax';
      updateLabel(next);
    });
  }

  function initSearch() {
    var trigger = document.querySelector('.search-toggle');
    var dialog = document.querySelector('.search-dialog');
    if (!trigger || !dialog) return;

    var input = dialog.querySelector('#site-search-input');
    var closeButtons = dialog.querySelectorAll('.search-close, .search-backdrop');
    var previousFocus = null;

    function setOpen(open) {
      dialog.hidden = !open;
      document.body.classList.toggle('search-open', open);
      trigger.setAttribute('aria-expanded', String(open));
      if (open) {
        previousFocus = document.activeElement;
        window.requestAnimationFrame(function () { input.focus(); });
      } else if (previousFocus) {
        previousFocus.focus();
      }
    }

    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', function () { setOpen(true); });
    for (var i = 0; i < closeButtons.length; i += 1) {
      closeButtons[i].addEventListener('click', function () { setOpen(false); });
    }
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !dialog.hidden) setOpen(false);
    });
  }

  function initHeaderMotion() {
    if (!document.body.classList.contains('has-header-motion')) return;
    if (!document.body.classList.contains('is-post')) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('header-expanded');
      return;
    }

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        document.body.classList.add('header-expanded');
      });
    });
  }

  function initBackToTop() {
    var link = document.querySelector('.back-top-link');
    if (!link) return;

    function updateVisibility() {
      link.classList.toggle('is-visible', window.scrollY > 320);
    }

    window.addEventListener('scroll', updateVisibility, { passive: true });
    link.addEventListener('click', function (event) {
      event.preventDefault();
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      window.history.replaceState(null, '', window.location.pathname + window.location.search + '#top');
    });
    updateVisibility();
  }

  function initTheme() {
    initCodeBlocks();
    initMobileMenu();
    initToc();
    initThemeToggle();
    initSearch();
    initHeaderMotion();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
})();
