/* ════════════════════════════════════════════════════════════════════════
   enhance.js  ·  modern chrome + better species imagery
   ------------------------------------------------------------------------
   ADDITIVE. Must load BEFORE i18n.js (so the icon labels exist when i18n
   boots). It:
     1. injects a language-toggle button into the header,
     2. replaces the emoji info-tabs (About / How to Use / Terms / Cite)
        with clean inline-SVG icons + a translatable label,
     3. upgrades window.getImg → public-domain illustration first,
        CC photo (iNaturalist) next, original Wikipedia logic last.
   No external image files, no copyright exposure (SVG icons drawn here;
   photos/illustrations are pulled live from openly-licensed APIs).
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── inline SVG icon set (stroke = currentColor via enhancements.css) ── */
  const ICON = {
    about: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11.5v4.5"/><path d="M12 7.6h.01"/></svg>',
    howto: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.2 9.3a2.8 2.8 0 1 1 4.2 2.4c-.9.5-1.4 1-1.4 2"/><path d="M12 16.6h.01"/></svg>',
    terms: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7Z"/><path d="M14 3v4h4"/><path d="M9.5 12h6M9.5 15.5h6M9.5 8.5h2.5"/></svg>',
    citations: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h7a2 2 0 0 1 2 2v12a3 3 0 0 0-3-2H4Z"/><path d="M20 5h-7a2 2 0 0 0-2 2v12a3 3 0 0 1 3-2h6Z"/></svg>',
  };
  const GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.7 2.6 15.3 0 18M12 3C9.4 5.7 9.4 18.3 12 21"/></svg>';

  /* info-tab labels in both languages */
  const TAB = {
    about:     { en: 'About',      es: 'Acerca de' },
    howto:     { en: 'How to Use', es: 'Cómo usar' },
    terms:     { en: 'Terms',      es: 'Términos' },
    citations: { en: 'Cite',       es: 'Citar' },
  };

  function lang(){ return (window.coeGetLang ? window.coeGetLang() : (localStorage.getItem('coe_lang') || 'en')); }

  /* ── 1 + 2 · build header chrome ────────────────────────────────────── */
  function buildHeader(){
    const nav = document.getElementById('nav-info');
    if (!nav) return;

    // icon-ise the existing info buttons (keep data-info + click wiring)
    nav.querySelectorAll('.ibtn').forEach(btn => {
      const key = btn.dataset.info;
      if (!ICON[key]) return;
      btn.innerHTML = ICON[key] + '<span class="lbl"></span>';
    });

    // language toggle
    if (!document.getElementById('lang-toggle')){
      const b = document.createElement('button');
      b.id = 'lang-toggle';
      b.type = 'button';
      b.title = 'Language / Idioma';
      b.innerHTML = GLOBE +
        '<span class="lang-current"></span><span class="lang-sep">|</span><span class="lang-other"></span>';
      b.addEventListener('click', () => {
        const next = lang() === 'es' ? 'en' : 'es';
        if (window.coeSetLang) window.coeSetLang(next); else { localStorage.setItem('coe_lang', next); location.reload(); }
      });
      nav.appendChild(b);
    }
    paintHeader();
  }

  function paintHeader(){
    const L = lang();
    document.querySelectorAll('#nav-info .ibtn').forEach(btn => {
      const t = TAB[btn.dataset.info];
      const lbl = btn.querySelector('.lbl');
      if (t && lbl) lbl.textContent = t[L] || t.en;
    });
    const tg = document.getElementById('lang-toggle');
    if (tg){
      const cur = tg.querySelector('.lang-current');
      const oth = tg.querySelector('.lang-other');
      if (cur && oth){
        cur.textContent = (L === 'es') ? 'ES' : 'EN';
        oth.textContent = (L === 'es') ? 'EN' : 'ES';
      }
    }
  }
  window.addEventListener('coe-lang', paintHeader);

  /* ── 3 · better species imagery ─────────────────────────────────────── */
  const _origGetImg = window.getImg;          // original Wikipedia-based fn
  const _cache2 = {};

  async function commonsSearch(name, size){
    try{
      const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*'
        + '&generator=search&gsrnamespace=6&gsrlimit=12&gsrsearch=' + encodeURIComponent(name)
        + '&prop=imageinfo&iiprop=url|mime&iiurlwidth=' + size;
      const r = await fetch(url);
      if (!r.ok) return [];
      const d = await r.json();
      const pages = d && d.query && d.query.pages;
      if (!pages) return [];
      return Object.values(pages)
        .map(p => ({ title: p.title || '', info: (p.imageinfo && p.imageinfo[0]) || null }))
        .filter(x => x.info && /image\/(jpeg|png)/i.test(x.info.mime || ''))
        .map(x => ({ title: x.title, url: x.info.thumburl || x.info.url }));
    }catch(e){ return []; }
  }

  // titles that look like botanical plates / drawings (illustration-first)
  const ILLU = /(k[oö]hler|illustration|botanical|flora|lithograph|engraving|drawing|\bplate\b|\bpl\.\s|\btab\.\s|sturm|thom[eé]|redout[eé]|curtis)/i;

  async function bestIllustration(name, size){
    const list = await commonsSearch(name, size);
    if (!list.length) return null;
    const hit = list.find(x => ILLU.test(x.title));
    return hit ? hit.url : null;
  }

  async function inatPhoto(name, size){
    try{
      const r = await fetch('https://api.inaturalist.org/v1/taxa?per_page=1&q=' + encodeURIComponent(name));
      if (!r.ok) return null;
      const d = await r.json();
      const t = d && d.results && d.results[0];
      const ph = t && t.default_photo;
      if (!ph) return null;
      let u = ph.medium_url || ph.url || null;
      if (u && size > 300) u = u.replace('/medium', '/large');
      return u;
    }catch(e){ return null; }
  }

  window.getImg = async function(commonName, sci, size){
    size = size || 400;
    const key = (sci || commonName || '') + '|' + size;
    if (_cache2[key] !== undefined) return _cache2[key];
    _cache2[key] = null;
    const name = sci || commonName;
    if (name){
      try{
        const ill = await bestIllustration(name, size);
        if (ill){ _cache2[key] = ill; return ill; }
        const ph = await inatPhoto(name, size);
        if (ph){ _cache2[key] = ph; return ph; }
      }catch(e){ /* fall through */ }
    }
    // original Wikipedia logic as the final fallback
    if (typeof _origGetImg === 'function'){
      const u = await _origGetImg(commonName, sci, size);
      _cache2[key] = u;
      return u;
    }
    return null;
  };

  /* ── boot ───────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', buildHeader);
  else
    buildHeader();
})();
