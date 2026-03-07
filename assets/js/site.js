/* ============================================================
   PropertyPilot Global JS — site.js
   Progressive enhancement for all pages
   ============================================================ */

(function () {
  'use strict';

  /* ---------- helpers ---------- */
  var BASE_URL = 'https://majh777.github.io/propertypilot/';

  function getBasePath() {
    var depth = 0;
    var path = window.location.pathname;
    // Count how deep we are from root
    var parts = path.replace(/\/propertypilot\/?/, '').split('/').filter(Boolean);
    // If last part is a file, don't count it
    if (parts.length > 0 && parts[parts.length - 1].indexOf('.') !== -1) {
      depth = parts.length - 1;
    } else {
      depth = parts.length;
    }
    var base = '';
    for (var i = 0; i < depth; i++) base += '../';
    return base || './';
  }

  var BASE = getBasePath();

  /* ---------- Dark Mode Toggle ---------- */
  function initTheme() {
    var saved = localStorage.getItem('pp-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pp-theme', next);
    var btn = document.querySelector('.pp-theme-toggle');
    if (btn) btn.textContent = next === 'light' ? '\u263E' : '\u2600';
  }

  initTheme();

  /* ---------- Inject Navigation ---------- */
  function injectNav() {
    // Don't inject if page explicitly opts out
    if (document.querySelector('[data-pp-no-nav]')) return;
    // Don't double-inject
    if (document.querySelector('.pp-nav')) return;

    var currentTheme = document.documentElement.getAttribute('data-theme');
    var themeIcon = currentTheme === 'light' ? '\u263E' : '\u2600';

    var nav = document.createElement('nav');
    nav.className = 'pp-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');
    nav.innerHTML =
      '<div class="pp-nav-inner">' +
        '<a href="' + BASE + 'index.html" class="pp-nav-logo">\uD83C\uDFE0 PropertyPilot</a>' +
        '<div class="pp-nav-links" id="ppNavLinks">' +
          '<a href="' + BASE + 'index.html">Home</a>' +
          '<a href="' + BASE + 'blog/">Blog</a>' +
          '<a href="' + BASE + 'resources.html">Resources</a>' +
          '<a href="' + BASE + 'mortgage-calculator.html">Mortgage Calc</a>' +
          '<a href="' + BASE + 'roi-calculator.html">ROI Calculator</a>' +
          '<a href="' + BASE + 'ai-analysis.html">AI Analysis</a>' +
          '<a href="' + BASE + 'real-estate-ai-glossary-100-terms-explained.html">Glossary</a>' +
          '<a href="' + BASE + 'sitemap.html">Sitemap</a>' +
        '</div>' +
        '<div class="pp-nav-search">' +
          '<input type="search" placeholder="Search..." aria-label="Search site" id="ppNavSearch">' +
        '</div>' +
        '<button class="pp-theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">' + themeIcon + '</button>' +
        '<button class="pp-nav-hamburger" aria-label="Toggle menu" aria-expanded="false">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>' +
          '</svg>' +
        '</button>' +
      '</div>';

    document.body.insertBefore(nav, document.body.firstChild);

    // Highlight current page
    var links = nav.querySelectorAll('.pp-nav-links a');
    var loc = window.location.pathname;
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (loc.indexOf(href.replace(BASE, '').replace('./', '').replace('../', '')) !== -1 && href !== BASE + 'index.html') {
        links[i].classList.add('active');
      }
    }
    if (loc.match(/\/(index\.html)?$/) && !loc.match(/blog|guides|comparisons|industries|locations|case-studies/)) {
      var homeLink = nav.querySelector('.pp-nav-links a[href*="index.html"]');
      if (homeLink) homeLink.classList.add('active');
    }

    // Theme toggle
    nav.querySelector('.pp-theme-toggle').addEventListener('click', toggleTheme);

    // Hamburger
    var hamburger = nav.querySelector('.pp-nav-hamburger');
    var navLinks = nav.querySelector('.pp-nav-links');
    hamburger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close on link click (mobile)
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    // Search
    var searchInput = document.getElementById('ppNavSearch');
    if (searchInput) {
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && this.value.trim()) {
          window.location.href = BASE + 'sitemap.html?q=' + encodeURIComponent(this.value.trim());
        }
      });
    }
  }

  /* ---------- Inject Breadcrumbs ---------- */
  function injectBreadcrumbs() {
    if (document.querySelector('.pp-breadcrumbs')) return;
    if (document.querySelector('[data-pp-no-breadcrumbs]')) return;

    var path = window.location.pathname.replace(/.*\/propertypilot\/?/, '');
    if (!path || path === 'index.html') return;

    var parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return;

    var bc = document.createElement('div');
    bc.className = 'pp-breadcrumbs';
    bc.setAttribute('aria-label', 'Breadcrumb');

    var html = '<a href="' + BASE + 'index.html">Home</a>';

    var accumulated = BASE;
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      accumulated += part + (i < parts.length - 1 ? '/' : '');

      var label = part
        .replace(/\.html$/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, function (c) { return c.toUpperCase(); });

      if (label === 'Index') label = part.replace(/\/index\.html$/, '').replace(/-/g, ' ') || label;

      html += '<span>/</span>';
      if (i < parts.length - 1) {
        html += '<a href="' + accumulated + '">' + label + '</a>';
      } else {
        html += '<span style="color:var(--text-primary)">' + label.replace(/\.html$/i, '') + '</span>';
      }
    }

    bc.innerHTML = html;

    // Insert after nav
    var navEl = document.querySelector('.pp-nav');
    if (navEl && navEl.nextSibling) {
      navEl.parentNode.insertBefore(bc, navEl.nextSibling);
    }
  }

  /* ---------- Lazy Loading ---------- */
  function enableLazyLoading() {
    var images = document.querySelectorAll('img:not([loading])');
    for (var i = 0; i < images.length; i++) {
      images[i].setAttribute('loading', 'lazy');
      images[i].setAttribute('decoding', 'async');
    }
  }

  /* ---------- Social Sharing ---------- */
  function injectSocialSharing() {
    // Only on article-type pages (blog posts, guides, case studies)
    var path = window.location.pathname;
    if (!path.match(/\/(blog|guides|case-studies|comparisons|industries|locations)\//)) return;
    if (path.match(/index\.html$/)) return;

    var content = document.querySelector('.content, article, .section, main') || document.body;
    var lastSection = content.querySelector('.footer, .cta-section');
    if (!lastSection) lastSection = null;

    var title = encodeURIComponent(document.title);
    var url = encodeURIComponent(window.location.href);

    var share = document.createElement('div');
    share.className = 'pp-share';
    share.innerHTML =
      '<span class="pp-share-label">Share:</span>' +
      '<a href="https://twitter.com/intent/tweet?text=' + title + '&url=' + url + '" target="_blank" rel="noopener" aria-label="Share on X/Twitter">X</a>' +
      '<a href="https://www.linkedin.com/shareArticle?mini=true&url=' + url + '&title=' + title + '" target="_blank" rel="noopener" aria-label="Share on LinkedIn">in</a>' +
      '<a href="https://www.facebook.com/sharer/sharer.php?u=' + url + '" target="_blank" rel="noopener" aria-label="Share on Facebook">f</a>' +
      '<a href="mailto:?subject=' + title + '&body=' + url + '" aria-label="Share via Email">@</a>';

    // Insert before footer or at end of main content area
    var footer = document.querySelector('.footer');
    if (footer) {
      footer.parentNode.insertBefore(share, footer);
    } else {
      document.body.appendChild(share);
    }
  }

  /* ---------- Related Posts (blog/content) ---------- */
  function injectRelatedPosts() {
    var path = window.location.pathname;
    if (!path.match(/\/(blog|guides|case-studies)\//)) return;
    if (path.match(/index\.html$/)) return;

    // Get page keywords from title
    var titleWords = document.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(function (w) { return w.length > 3 && !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'your', 'propertypilot'].includes(w); });

    // Get links from the same folder/section
    var folder = path.substring(0, path.lastIndexOf('/') + 1);
    var allLinks = document.querySelectorAll('a[href]');
    var related = [];
    var seen = {};
    var currentFile = path.split('/').pop();

    for (var i = 0; i < allLinks.length; i++) {
      var href = allLinks[i].getAttribute('href');
      if (!href || href.indexOf('#') === 0) continue;
      if (href === currentFile || href.indexOf('index') !== -1) continue;
      if (href.indexOf('.html') === -1) continue;
      if (seen[href]) continue;
      seen[href] = true;

      var text = allLinks[i].textContent.toLowerCase();
      var score = 0;
      for (var j = 0; j < titleWords.length; j++) {
        if (text.indexOf(titleWords[j]) !== -1) score++;
      }
      if (score > 0) {
        related.push({ href: href, text: allLinks[i].textContent.trim(), score: score });
      }
    }

    related.sort(function (a, b) { return b.score - a.score; });
    related = related.slice(0, 3);

    if (related.length === 0) return;

    var section = document.createElement('div');
    section.className = 'pp-related';
    var html = '<h3>Related Articles</h3><div class="pp-grid-3" style="margin-top:16px">';
    for (var k = 0; k < related.length; k++) {
      html += '<div class="pp-card"><h3 style="font-size:1em"><a href="' + related[k].href + '">' + related[k].text + '</a></h3></div>';
    }
    html += '</div>';
    section.innerHTML = html;

    var share = document.querySelector('.pp-share');
    if (share) {
      share.parentNode.insertBefore(section, share);
    } else {
      var footer = document.querySelector('.footer, .pp-footer');
      if (footer) footer.parentNode.insertBefore(section, footer);
    }
  }

  /* ---------- Init on DOMContentLoaded ---------- */
  function init() {
    injectNav();
    injectBreadcrumbs();
    enableLazyLoading();
    injectSocialSharing();
    injectRelatedPosts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
