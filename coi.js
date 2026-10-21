/* COI behavior for the prototype: draws the shared header, footer, feed, Editor's Picks, ad slots, relative time.
   In production these are WordPress template parts and one small script; the data comes from WordPress, not data.js. */
(function () {
  var B = (window.COI_BRANDS || {})[window.COI_BRAND_BASE] || {};
  var BRAND_LABEL = (window.COI_BRAND_OPTIONS || []).filter(function (o) { return o[0] === window.COI_BRAND_SLUG; }).map(function (o) { return o[1]; })[0] || B.name;
  var POSTS = window.COI_POSTS || [];
  var PAGE = document.body.getAttribute('data-page');
  var PER_PAGE = 20;                       // homepage and category pages: 20 stories, then Load more
  var AD_EVERY = 3;                        // mobile in-feed ad after every third card
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var params = new URLSearchParams(location.search);

  document.body.setAttribute('data-ads', localStorage.getItem('coi-ads') || 'on');

  /* ---------- Time label rule (last modified) ----------
     under 30 minutes: "Just now"; under 24 hours: "N hours ago" rounded to the nearest hour, capped at 23;
     older: the last-modified date. */
  function fmtDate(iso) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function relTime(iso) {
    var mins = (Date.now() - new Date(iso).getTime()) / 60000;
    if (mins < 30) return 'Just now';
    if (mins < 1440) { var h = Math.min(Math.round(mins / 60), 23); return h + (h === 1 ? ' hour ago' : ' hours ago'); }
    return fmtDate(iso);
  }
  function refreshTimes() { document.querySelectorAll('time[data-coi-time]').forEach(function (t) { t.textContent = relTime(t.getAttribute('datetime')); }); }

  /* ---------- Template parts ---------- */
  var ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
  var ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';

  /* Platform icons (24x24, filled with the brand social color) */
  var ICONS = {
    facebook: '<path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>',
    x: '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>',
    instagram: '<path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.2-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/>',
    tiktok: '<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
    bluesky: '<path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.829.624-5.789.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>'
  };
  function socialLinks() {
    return (B.social || []).map(function (s) {
      return '<a href="#" aria-label="' + esc(B.name + ' on ' + s[0]) + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[s[1]] || '') + '</svg></a>';
    }).join('');
  }
  function legalLinks() {
    return (B.pages || []).concat(B.legal || []).map(function (l) { return '<li><a href="' + esc(l[1]) + '">' + esc(l[0]) + '</a></li>'; }).join('');
  }
  /* Chips sit on the page, above the first card. items = [[label, url, isCurrent?], ...] */
  function chips(items) {
    if (!items || !items.length) return '';
    return '<nav class="coi-chips" aria-label="Browse">' + items.map(function (c) {
      return '<a class="coi-chip" href="' + esc(c[1]) + '"' + (c[2] ? ' aria-current="page"' : '') + '>' + esc(c[0]) + '</a>';
    }).join('') + '</nav>';
  }
  /* Home feed chips are their own configurable list (in WordPress: a menu assigned to the "Home feed chips" location).
     Falls back to the top-level categories if no list is configured. */
  function homeChipItems() {
    return (B.homeChips || (B.categories || []).map(function (c) { return [c.name, 'category.html?c=' + encodeURIComponent(c.name)]; }));
  }
  /* Category pages show only the sub-categories of the category being viewed (or its siblings, with the current one marked) */
  function categoryChipItems(name) {
    var cats = B.categories || [], parent = null;
    cats.forEach(function (c) { if (c.name.toLowerCase() === name.toLowerCase() || (c.children || []).indexOf(name) > -1) parent = c; });
    if (!parent || !parent.children) return [];
    return parent.children.map(function (k) { return [k, 'category.html?c=' + encodeURIComponent(k), k.toLowerCase() === name.toLowerCase()]; });
  }
  function drawerHtml() {
    var secs = (B.categories || []).map(function (c) {
      var kids = (c.children || []).map(function (k) { return '<li><a href="category.html?c=' + encodeURIComponent(k) + '">&nbsp;&nbsp;' + esc(k) + '</a></li>'; }).join('');
      return '<li><a href="category.html?c=' + encodeURIComponent(c.name) + '">' + esc(c.name) + '</a></li>' + kids;
    }).join('');
    var pages = (B.pages || []).map(function (l) { return '<li><a href="' + esc(l[1]) + '">' + esc(l[0]) + '</a></li>'; }).join('');
    var legal = B.menuShowsLegal ? '<h2>Legal</h2><ul class="coi-drawer__legal">' + (B.legal || []).map(function (l) { return '<li><a href="' + esc(l[1]) + '">' + esc(l[0]) + '</a></li>'; }).join('') + '</ul>' : '';
    return '<button class="coi-drawer__close" aria-label="Close menu">&times;</button>' +
      '<h2>Sections</h2><ul>' + secs + '</ul><h2>About</h2><ul>' + pages + '</ul>' + legal;
  }

  function drawChrome() {
    if (B.note) document.body.insertAdjacentHTML('afterbegin', '<div class="proto-note">' + esc(window.COI_BRAND_BASE === 'crime-hunter' ? 'Crime Hunter preview. Only colors, logo, and menu change. Stories shown are sample Student Section content.' : B.note) + '</div>');
    $('#coi-header').classList.add('coi-masthead');
    $('#coi-header').innerHTML =
      '<a class="coi-skip" href="#main">Skip to content</a>' +
      '<header class="coi-header"><div class="coi-header__bar">' +
      '<button class="coi-menu-btn" aria-expanded="false" aria-controls="coi-drawer">' + ICON_MENU + '<span>Menu</span></button>' +
      '<a class="coi-logo" href="index.html"><img src="' + esc(B.logo) + '" alt="' + esc(B.name) + '"></a>' +
      '<div class="coi-social">' + socialLinks() + '</div>' +
      '<button class="coi-search-btn" aria-label="Search">' + ICON_SEARCH + '</button>' +
      '</div></header>' +
      '<div class="coi-drawer-overlay" hidden></div><aside class="coi-drawer" id="coi-drawer" hidden aria-label="Menu">' + drawerHtml() + '</aside>';

    $('#coi-footer').innerHTML =
      '<footer class="coi-footer"><div class="coi-footer__inner">' +
      '<a class="coi-footer__logo" href="index.html"><img src="' + esc(B.logo) + '" alt="' + esc(B.name) + '"></a>' +
      '<div class="coi-footer__social">' + socialLinks() + '</div>' +
      '<ul class="coi-footer__links">' + legalLinks() + '</ul>' +
      '<p class="coi-footer__copy">Copyright &copy; ' + new Date().getFullYear() + ' ' + esc(B.name) + '</p></div></footer>';

    var btn = $('.coi-menu-btn'), dr = $('#coi-drawer'), ov = $('.coi-drawer-overlay');
    function toggle(open) { dr.hidden = ov.hidden = !open; btn.setAttribute('aria-expanded', open); if (open) { $('.coi-drawer__close').focus(); } else { btn.focus(); } }
    btn.addEventListener('click', function () { toggle(dr.hidden); });
    ov.addEventListener('click', function () { toggle(false); });
    $('.coi-drawer__close').addEventListener('click', function () { toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dr.hidden) toggle(false); });

    /* Prototype controls (not part of the kit). Hidden when the page is shown inside the device preview. */
    if (window.self !== window.top) return;
    var here = location.pathname.split('/').pop() + location.search;
    var bar = document.createElement('div');
    bar.className = 'proto-bar';
    var enc = encodeURIComponent(here);
    bar.innerHTML =
      '<label>Brand <select id="p-brand">' + (window.COI_BRAND_OPTIONS || []).map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select></label>' +
      '<label><input type="checkbox" id="p-ads"> Ads on</label>' +
      '<span>Device: <b>Pane</b> &middot; <a href="preview.html?d=desktop&src=' + enc + '">Desktop</a> &middot; <a href="preview.html?d=tablet&src=' + enc + '">Tablet</a> &middot; <a href="preview.html?d=mobile&src=' + enc + '">Mobile</a></span>' +
      '<span>Page: <a href="index.html">Home</a> &middot; <a href="category.html?c=Conferences">Category</a> &middot; <a href="article.html">Article</a> &middot; <a href="page.html">About</a> &middot; <a href="author.html">Author</a></span>';
    document.body.appendChild(bar);
    $('#p-brand').value = window.COI_BRAND_SLUG;
    $('#p-brand').addEventListener('change', function (e) { localStorage.setItem('coi-brand', e.target.value); location.reload(); });
    $('#p-ads').checked = document.body.getAttribute('data-ads') !== 'off';
    $('#p-ads').addEventListener('change', function (e) { var v = e.target.checked ? 'on' : 'off'; localStorage.setItem('coi-ads', v); document.body.setAttribute('data-ads', v); });
  }

  /* ---------- Components ---------- */
  function adSlot(slot, extra) {
    /* Production: <yz-ad data-slot="..." data-atf="n" data-sizes="[[300,250]]"></yz-ad> goes inside .coi-ad__box */
    return '<div class="coi-ad ' + (extra || '') + '" data-ad-slot="' + slot + '"><span class="coi-ad__label">Advertisement</span><div class="coi-ad__box">300 &times; 250 &middot; ' + slot + '</div></div>';
  }
  function card(p, i, surface) {
    return '<a class="coi-card" href="article.html?p=' + p.id + '" data-coi-event="card_click" data-coi-surface="' + surface + '" data-coi-position="' + (i + 1) + '">' +
      '<img src="' + esc(p.img) + '" alt="" loading="' + (i < 2 ? 'eager' : 'lazy') + '">' +
      '<span class="coi-tag">' + esc(p.cat) + '</span>' +
      '<div class="coi-card__body"><h3 class="coi-card__title">' + esc(p.title) + '</h3>' +
      '<span class="coi-card__meta"><time data-coi-time datetime="' + esc(p.modified) + '">' + relTime(p.modified) + '</time></span></div></a>';
  }
  function picks(list, inline) {
    var sfx = inline ? '-inline' : '';
    var items = list.slice(0, 3).map(function (p, i) {
      return '<li><a class="coi-pick" href="article.html?p=' + p.id + '" data-coi-event="editors_pick_click" data-coi-surface="' + (inline ? 'article_inline' : 'rail_left') + '" data-coi-position="' + (i + 1) + '"><img src="' + esc(p.img) + '" alt=""><span><strong>' + esc(p.title) + '</strong><small>' + esc(p.cat) + '</small></span></a></li>';
    }).join('');
    return '<section class="coi-picks' + (inline ? ' coi-picks--inline' : '') + '" aria-labelledby="coi-picks-h' + sfx + '"><h2 id="coi-picks-h' + sfx + '">Editor&rsquo;s Picks</h2><ol>' + items + '</ol>' +
      (inline ? '<p class="coi-continue" aria-hidden="true"><span>Your story continues below</span></p>' : '') + '</section>';
  }
  /* Keep reading logic (not curated): same primary category as the story, newest first, the story itself excluded,
     3 items; if the category has fewer than 3, fill with the newest stories site-wide. */
  function keepList(post) {
    var byDate = POSTS.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    var out = byDate.filter(function (x) { return x.id !== post.id && x.cat === post.cat; }).slice(0, 3);
    byDate.forEach(function (x) { if (out.length < 3 && x.id !== post.id && out.indexOf(x) < 0) out.push(x); });
    return out;
  }
  function keepReading(list) {
    var items = list.map(function (p) {
      return '<li><a class="coi-pick" href="article.html?p=' + p.id + '" data-coi-event="keep_reading_click" data-coi-surface="article_keep_reading"><img src="' + esc(p.img) + '" alt=""><span><strong>' + esc(p.title) + '</strong><small>' + esc(p.cat) + '</small></span></a></li>';
    }).join('');
    return '<section class="coi-keep" aria-labelledby="coi-keep-h"><h2 id="coi-keep-h">Keep reading</h2><ol>' + items + '</ol></section>';
  }

  /* Feed with Load more: 20 stories, then a button that adds 20 more */
  function feed(el, list, surface, chipItems) {
    var shown = 0;
    el.innerHTML = chips(chipItems) + '<div class="coi-feed" id="coi-feed"></div><div class="coi-load"><button class="coi-btn" type="button">Load more</button><p class="coi-end" hidden>You&rsquo;re all caught up.</p></div>';
    var box = $('#coi-feed'), btn = $('.coi-btn', el), end = $('.coi-end', el);
    function more() {
      var first = null, html = '', upto = Math.min(shown + PER_PAGE, list.length);
      for (var i = shown; i < upto; i++) {
        html += card(list[i], i, surface);
        if ((i + 1) % AD_EVERY === 0) html += adSlot('infeed-' + Math.floor((i + 1) / AD_EVERY), 'coi-ad--infeed');
      }
      var before = box.children.length;
      box.insertAdjacentHTML('beforeend', html);
      first = box.children[before];
      shown = upto;
      if (shown >= list.length) { btn.hidden = true; end.hidden = false; }
      return first;
    }
    more();
    btn.addEventListener('click', function () { var f = more(); if (f && f.focus) f.focus({ preventScroll: true }); });
  }

  /* ---------- Pages ---------- */
  function home() {
    $('#coi-main').innerHTML =
      '<aside class="coi-rail--left" aria-label="Editor&rsquo;s Picks"><div class="coi-sticky">' + picks(POSTS) + '</div></aside>' +
      '<section aria-label="Latest stories" id="coi-feed-wrap"></section>' +
      '<aside class="coi-rail--right" aria-label="Advertising"><div class="coi-sticky">' + adSlot('rail-right-top') + '</div></aside>';
    feed($('#coi-feed-wrap'), POSTS, 'main_feed', homeChipItems());
  }

  /* Category pages: sub-category chips sit in the page header under the title (not above the feed) */
  function subChips(items) {
    if (!items.length) return '';
    return '<div class="coi-subchips" aria-label="Browse by topic">' + items.map(function (c) {
      return '<a class="coi-chip" href="' + esc(c[1]) + '"' + (c[2] ? ' aria-current="page"' : '') + '>' + esc(c[0]) + '</a>';
    }).join('') + '</div>';
  }
  function category() {
    var name = params.get('c') || (B.categories && B.categories[0].name) || 'Category';
    var def = (B.categories || []).filter(function (c) { return c.name.toLowerCase() === name.toLowerCase(); })[0];
    var parent = def || (B.categories || []).filter(function (c) { return (c.children || []).indexOf(name) > -1; })[0];
    var list = POSTS.filter(function (p) { return p.cat === name || (p.cats || []).indexOf(name) > -1; });
    var sample = list.length < 3;            // sample data has few posts per category: fall back to all stories
    if (sample) list = POSTS;
    document.title = name + ' | ' + B.name;
    $('#coi-main').innerHTML =
      '<div class="coi-archive-head"><p class="coi-eyebrow">Category</p><h1>' + esc(name) + '</h1><p>' + esc(B.categoryDescription || '') + '</p>' + subChips(categoryChipItems(name)) +
      '</div>' +
      '<aside class="coi-rail--left" aria-label="Editor&rsquo;s Picks"><div class="coi-sticky">' + picks(POSTS) + '</div></aside>' +
      '<section aria-label="Stories" id="coi-feed-wrap"></section>' +
      '<aside class="coi-rail--right" aria-label="Advertising"><div class="coi-sticky">' + adSlot('rail-right-top') + '</div></aside>';
    feed($('#coi-feed-wrap'), list, 'category_feed');
  }

  function article() {
    var id = +(params.get('p') || (window.COI_ARTICLE && COI_ARTICLE.id));
    var p = POSTS.filter(function (x) { return x.id === id; })[0] || POSTS[0];
    document.title = p.title + ' | ' + B.name;
    var keep = keepList(p);
    $('#coi-main').innerHTML =
      '<aside class="coi-rail--left" aria-label="Editor&rsquo;s Picks"><div class="coi-sticky">' + picks(POSTS) + '</div></aside>' +
      '<article class="coi-article">' +
      '<a class="coi-tag coi-article__tag" href="category.html?c=' + encodeURIComponent(p.cat) + '">' + esc(p.cat) + '</a>' +
      '<h1>' + esc(p.title) + '</h1>' +
      '<p class="coi-byline">By <strong>' + esc(B.name) + ' staff</strong> &middot; Updated <time datetime="' + esc(p.modified) + '">' + fmtDate(p.modified) + '</time></p>' +
      '<figure class="coi-hero"><img src="' + esc(p.img) + '" alt=""><figcaption>Photo caption goes here. (Sample.)</figcaption></figure>' +
      '<div class="coi-prose">' + (window.COI_ARTICLE ? COI_ARTICLE.html : '') + '</div>' +
      '<div class="coi-share"><span>Share</span><a href="#">Facebook</a><a href="#">X</a><a href="#">Email</a><a href="#">Copy link</a></div>' +
      '<div class="coi-keep--mobile">' + keepReading(keep) + '</div>' +
      '</article>' +
      '<aside class="coi-rail--right" aria-label="Advertising and related"><div class="coi-sticky">' + adSlot('rail-right-top') + keepReading(keep) + '</div></aside>';
    document.querySelector('.coi-layout').classList.add('coi-layout--article');
    /* Mobile and tablet: Editor's Picks sits inside the article after the 4th paragraph (desktop uses the left rail) */
    var paras = document.querySelectorAll('.coi-prose > p');
    if (paras.length >= 4) paras[3].insertAdjacentHTML('afterend', picks(POSTS, true));
  }

  function stdPage() {
    var which = (params.get('p') || 'about');
    var title = which === 'copyright' ? 'Copyright Notice' : 'About ' + B.name;
    var body = which === 'copyright'
      ? '<p>Copyright notice text goes here. (Sample.)</p>'
      : (window.COI_ABOUT || '<p>About text goes here.</p>');
    document.title = title + ' | ' + B.name;
    $('#coi-main').outerHTML = '<main id="main" class="coi-page"><h1>' + esc(title) + '</h1><div class="coi-prose">' + body + '</div></main>';
  }

  function author() {
    document.title = 'Author | ' + B.name;
    var list = POSTS.slice(0, 12);
    $('#coi-main').outerHTML =
      '<main id="main" class="coi-page" style="max-width:var(--coi-max)">' +
      '<div class="coi-author-head"><div class="coi-avatar" aria-hidden="true">SS</div><div><h1 style="margin:0">' + esc(B.name) + ' Staff</h1><p style="margin:.3rem 0 0;color:var(--coi-muted)">Author bio goes here. (Sample.)</p></div></div>' +
      '<div class="coi-grid">' + list.map(function (p, i) { return card(p, i, 'author_archive'); }).join('') + '</div></main>';
  }

  drawChrome();
  if (PAGE === 'home') home();
  else if (PAGE === 'category') category();
  else if (PAGE === 'article') article();
  else if (PAGE === 'page') stdPage();
  else if (PAGE === 'author') author();
  refreshTimes();
  setInterval(refreshTimes, 60000);
})();
