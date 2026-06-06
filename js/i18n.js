/* ════════════════════════════════════════════════════════════════════════
   i18n.js  ·  English ⇄ Spanish toggle for Crop Origins Explorer
   ------------------------------------------------------------------------
   ADDITIVE. Does not touch the original app code. It:
     • captures the original English DOM as the baseline at load,
     • swaps targeted elements to Spanish (and back) losslessly,
     • persists the choice in localStorage ('coe_lang'),
     • re-translates the species / info modals whenever they open.

   To EXTEND coverage (e.g. the About / How-to / Terms / Cite popup text),
   add entries to TX (unique elements) or COMMON (label words). See README
   / DEPLOY_GUIDE for the one-paste workflow.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── read / write helpers for the different "modes" ─────────────────── */
  function firstTextNode(el){ return [...el.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim()); }
  function lastTextNode(el){ return [...el.childNodes].reverse().find(n => n.nodeType === 3 && n.nodeValue.trim()); }

  function read(el, mode){
    if (mode === 'html') return el.innerHTML;
    if (mode === 'text') return el.textContent;
    if (mode === 'first'){ const n = firstTextNode(el); return n ? n.nodeValue : null; }
    if (mode === 'last'){ const n = lastTextNode(el); return n ? n.nodeValue : null; }
    if (mode.startsWith('attr:')) return el.getAttribute(mode.slice(5));
    return null;
  }
  function write(el, mode, val){
    if (val == null) return;
    if (mode === 'html'){ el.innerHTML = val; return; }
    if (mode === 'text'){ el.textContent = val; return; }
    if (mode === 'first'){ const n = firstTextNode(el); if (n) n.nodeValue = val; return; }
    if (mode === 'last'){ const n = lastTextNode(el); if (n) n.nodeValue = val; return; }
    if (mode.startsWith('attr:')){ el.setAttribute(mode.slice(5), val); return; }
  }

  /* baseline (English) cache, keyed per element + mode */
  const cache = new WeakMap();
  function getEN(el, mode){
    let m = cache.get(el);
    if (!m){ m = {}; cache.set(el, m); }
    if (!(mode in m)) m[mode] = read(el, mode);
    return m[mode];
  }

  /* ════════════════════════════════════════════════════════════════════
     TX — unique elements: [selector, mode, Spanish]
     ════════════════════════════════════════════════════════════════════ */
  const TX = [
    /* HEADER */
    ['.logo-l2', 'html',
      'por <a href="mailto:mikesase270598@gmail.com">Samson Solomon</a> · datos: <a href="https://github.com/rubenmilla/Crop_Origins_Phylo" target="_blank" rel="noopener">Milla 2020</a>'],
    ['#s-search', 'attr:placeholder', 'Busca 867 cultivos por nombre…'],

    /* SIDEBAR · group labels (translate leading text, keep the count span) */
    ['#scroll-nav .nav-group:nth-of-type(1) .group-label', 'first', 'Resumen'],
    ['#scroll-nav .nav-group:nth-of-type(2) .group-label', 'first', 'Explorar datos '],
    ['#scroll-nav .nav-group:nth-of-type(3) .group-label', 'first', 'Antigüedad de domesticación '],

    /* SIDEBAR · nav items (trailing text node) */
    ['.nav-item[href="#intro"]', 'last', 'Introducción'],
    ['.nav-item[href="#atlas"]', 'last', 'Atlas de orígenes'],
    ['.nav-item[href="#timeline"]', 'last', 'Cronología'],
    ['.nav-item[href="#tree"]', 'last', 'Árbol filogenético'],
    ['.nav-item[href="#climate"]', 'last', 'Clima'],
    ['.nav-item[href="#stats"]', 'last', 'Estadísticas del conjunto'],
    ['.nav-item[href="#aq-intro"]', 'last', 'Acerca de'],
    ['.nav-item[href="#aq-map"]', 'last', 'Mapa de orígenes'],
    ['.nav-item[href="#aq-timeline"]', 'last', 'Cronología de antigüedad'],
    ['.nav-item[href="#aq-compare"]', 'last', 'Más antiguos vs. recientes'],

    /* SIDEBAR · filters */
    ['#global-filters-block .filter-title.global', 'last', 'Filtros · 867 spp.'],
    ['#aq-filters-block .filter-title', 'last', 'Filtros · 211 spp.'],
    ['label[for="s-family"]', 'text', 'Familia'],
    ['label[for="s-use"]', 'text', 'Uso principal'],
    ['label[for="s-realm"]', 'text', 'Reino biogeográfico'],
    ['label[for="s-gf"]', 'text', 'Forma de crecimiento'],
    ['label[for="s-aq-family"]', 'text', 'Familia'],
    ['label[for="s-aq-realm"]', 'text', 'Reino'],
    ['#s-family option[value=""]', 'text', 'Todas las familias'],
    ['#s-use option[value=""]', 'text', 'Todos los usos'],
    ['#s-realm option[value=""]', 'text', 'Todos los reinos'],
    ['#s-gf option[value=""]', 'text', 'Todas las formas'],
    ['#s-aq-family option[value=""]', 'text', 'Todas las familias'],
    ['#s-aq-realm option[value=""]', 'text', 'Todos los reinos'],
    ['#global-filters-block .count-pill span:first-child', 'last', ' coincidencias'],
    ['#aq-filters-block .count-pill span:first-child', 'last', ' coincidencias'],
    ['.range-labels span:nth-child(1)', 'first', 'Mín: '],
    ['.range-labels span:nth-child(2)', 'first', 'Máx: '],
    ['#btn-reset', 'text', '↻ Reiniciar'],
    ['#btn-reset-aq', 'text', '↻ Reiniciar'],
    ['.legend-title', 'text', 'Colores de reino'],

    /* MAIN · eyebrows (keep the .num chip, translate trailing text) */
    ['#intro .chapter-eyebrow', 'last', 'Introducción'],
    ['#atlas .chapter-eyebrow', 'last', 'Atlas de orígenes'],
    ['#timeline .chapter-eyebrow', 'last', 'Eje temporal'],
    ['#tree .chapter-eyebrow', 'last', 'Árbol filogenético'],
    ['#climate .chapter-eyebrow', 'last', 'Envolvente climática'],
    ['#stats .chapter-eyebrow', 'last', 'Estadísticas del conjunto'],
    ['#aq-intro .chapter-eyebrow', 'last', 'Atlas de antigüedad — capítulo aparte'],
    ['#aq-map .chapter-eyebrow', 'last', 'Antigüedad · Mapa de orígenes'],
    ['#aq-timeline .chapter-eyebrow', 'last', 'Antigüedad · Cronología'],
    ['#aq-compare .chapter-eyebrow', 'last', 'Antigüedad · Más antiguos vs. recientes'],

    /* MAIN · H1 */
    ['#intro .chapter-h h1', 'text', '¿De dónde vienen nuestros cultivos?'],
    ['#atlas .chapter-h h1', 'text', 'Dónde abundan más los progenitores silvestres'],
    ['#timeline .chapter-h h1', 'text', 'Cultivos a lo largo del tiempo'],
    ['#tree .chapter-h h1', 'text', 'Orden → Familia → Especie'],
    ['#climate .chapter-h h1', 'text', 'Temperatura media anual × precipitación'],
    ['#stats .chapter-h h1', 'text', '¿Qué hay en el subconjunto filtrado?'],
    ['#aq-intro .chapter-h h1', 'text', 'Los 211 cultivos datados'],
    ['#aq-map .chapter-h h1', 'text', 'Dónde se domesticaron los cultivos datados'],
    ['#aq-timeline .chapter-h h1', 'text', 'Patrón de domesticación del Holoceno'],
    ['#aq-compare .chapter-h h1', 'text', 'Los cultivos domesticados más antiguos y más recientes'],

    /* MAIN · ledes / paragraphs (innerHTML so links + emphasis survive) */
    ['#intro .lede', 'html',
      'De las aproximadamente 350.000 especies vegetales conocidas, menos de 900 se cultivan para alimentación en todo el mundo. Este explorador convierte la <a href="https://doi.org/10.1111/geb.13057" target="_blank" rel="noopener">base de datos Crop Origins &amp; Phylo Food</a> del Prof. Rubén Milla en una página interactiva que permite rastrear cada cultivo hasta el reino biogeográfico de su progenitor silvestre, representar su envolvente climática y seguir su linaje taxonómico y evolutivo.'],
    ['#intro > p:nth-of-type(1)', 'html',
      'La interfaz se divide en dos: un <b>Explorador global</b> que abarca los 867 cultivos, y una sección separada de <b>Antigüedad de domesticación</b> para las 211 especies con una fecha de domesticación publicada. Los dos conjuntos de filtros son independientes: mover los deslizadores de antigüedad no restringe el resto del explorador, y viceversa.'],
    ['#intro > p:nth-of-type(2)', 'html',
      'Desplázate para navegar, o usa la barra de la izquierda para saltar entre secciones. Pulsa <span class="kbd">/</span> en cualquier momento para enfocar la búsqueda, y <span class="kbd">Esc</span> para cerrar cualquier panel abierto.'],
    ['#atlas .lede', 'html',
      'Cada cultivo se ubica en el centroide de la ecorregión (Olson et al. 2001) donde su progenitor silvestre tiene más registros de presencia en GBIF. El color del marcador codifica el reino biogeográfico; el degradado suave indica que la ubicación es un indicador de la <em>región de origen</em>, no del lugar exacto de domesticación.'],
    ['#timeline .lede', 'html',
      'Cada punto es un cultivo situado según su fecha de domesticación publicada más temprana, agrupado por reino biogeográfico. La escala horizontal va de derecha a izquierda: <em>Hoy</em> a la derecha, los albores de la agricultura a la izquierda.'],
    ['#tree .lede', 'html',
      'Un dendrograma taxonómico del conjunto de cultivos filtrado. Haz clic en cualquier especie (hoja naranja) para ver el registro completo: progenitor silvestre, envolvente climática, antigüedad de domesticación y de cultivo, y cobertura en GBIF.'],
    ['#climate .lede', 'html',
      'Un gráfico tipo Whittaker del clima mediano del progenitor silvestre de cada cultivo. Eje X: <b>BIO1</b> (temperatura media anual, °C); eje Y: <b>BIO12</b> (precipitación anual, mm). Los puntos se colorean por reino. Pasa el cursor por un punto para ver especie y ecorregión; haz clic para abrir el registro completo.'],
    ['#stats .lede', 'html',
      'Gráficos dinámicos que se actualizan según los filtros de familia / uso / reino / forma de crecimiento que hayas aplicado arriba.'],
    ['#aq-intro .lede', 'html',
      'De las 867 especies de la base de datos, solo <b>211</b> tienen una estimación publicada de <em>minimum_time_domestication</em>. A partir de aquí, cada visualización se restringe a ese subconjunto y usa un conjunto de filtros independiente (el bloque naranja de la barra lateral), de modo que lo que ajustes aquí <em>no</em> afectará al Explorador global de arriba.'],
    ['#aq-intro .note-box', 'html',
      '<b>¿Por qué 211?</b> El artículo original de Milla (2020) señala que la antigüedad de domesticación está documentada solo para una minoría de cultivos. La calidad de los registros va desde una única referencia de literatura gris hasta síntesis arqueobotánicas y genómicas de varias fuentes, y todos los valores son estimaciones mínimas. Los cultivos sin fecha simplemente se omiten en este capítulo; siguen presentes en el resto del explorador.'],
    ['#aq-map .lede', 'html',
      'La misma lógica geográfica que el Atlas global, pero restringida al subconjunto de 211 especies. Los marcadores se colorean por <b>clase de edad</b> en lugar de por reino para que el patrón temporal profundo se vea de un vistazo. Pasa el cursor para ver detalles, haz clic para el registro completo.'],
    ['#aq-timeline .lede', 'html',
      'Un gráfico de puntos horizontal donde cada especie aparece en su año de domesticación. La densidad muestra cuántos eventos de domesticación ocurrieron en cada región a lo largo del tiempo.'],
    ['#aq-compare .lede', 'html',
      'Clasificación lado a lado de los 20 cultivos domesticados más antiguos y los 20 más recientes del subconjunto filtrado. Haz clic en cualquier fila para ver el registro completo.'],

    /* MAIN · viz toolbar titles (leading text, keep the dynamic badge span) */
    ['#atlas .viz-toolbar h3', 'first', '🗺 Mapa de orígenes '],
    ['#timeline .viz-toolbar h3', 'first', '📅 Cronología de domesticación '],
    ['#tree .viz-toolbar h3', 'first', '🌳 Explorador taxonómico '],
    ['#climate .viz-toolbar h3', 'first', '🌡 Dispersión climática '],
    ['#aq-map .viz-toolbar h3', 'first', '🌍 Mapa de orígenes (antigüedad) '],
    ['#aq-timeline .viz-toolbar h3', 'first', '📈 Cresta de antigüedad '],

    /* MAIN · toolbar buttons */
    ['#atlas-fit', 'text', 'Ajustar a la selección'],
    ['#atlas-reset', 'text', 'Restablecer vista'],
    ['#cl-biomes', 'text', 'Mostrar bandas de biomas'],

    /* MAIN · compare column headers */
    ['#aq-compare .compare-col.old h3', 'text', '🏛 Los 20 más antiguos · domesticados hace más tiempo'],
    ['#aq-compare .compare-col.new h3', 'text', '🌱 Los 20 más recientes · domesticados hace menos'],
  ];

  /* ════════════════════════════════════════════════════════════════════
     MAP — repeated elements translated by matching their English text.
     ════════════════════════════════════════════════════════════════════ */
  const STAT_LABELS = {
    'Food crop species': 'Especies de cultivos alimentarios',
    'With domestication antiquity': 'Con antigüedad de domesticación',
    'Plant families': 'Familias de plantas',
    'Biogeographic realms': 'Reinos biogeográficos',
    'Species with antiquity data': 'Especies con datos de antigüedad',
    'of the full database': 'de la base de datos completa',
    'Oldest (yr BP)': 'Más antiguo (años AP)',
    'Most recent (yr BP)': 'Más reciente (años AP)',
  };
  const MAP = [
    { sel: '.stat-label', mode: 'text', dict: STAT_LABELS },
  ];

  /* ════════════════════════════════════════════════════════════════════
     COMMON — exact-text-node labels used inside the species / info modals.
     Whole-text-node match only, so it can't corrupt names or numbers.
     Extend freely.
     ════════════════════════════════════════════════════════════════════ */
  const COMMON = {
    'Common name': 'Nombre común',
    'Scientific name': 'Nombre científico',
    'Wild progenitor': 'Progenitor silvestre',
    'Family': 'Familia',
    'Order': 'Orden',
    'Genus': 'Género',
    'Species': 'Especie',
    'Primary use': 'Uso principal',
    'Use': 'Uso',
    'Growth form': 'Forma de crecimiento',
    'Biogeographic realm': 'Reino biogeográfico',
    'Realm': 'Reino',
    'Origin': 'Origen',
    'Origin region': 'Región de origen',
    'Ecoregion': 'Ecorregión',
    'Climate': 'Clima',
    'Climate envelope': 'Envolvente climática',
    'Mean annual temperature': 'Temperatura media anual',
    'Annual precipitation': 'Precipitación anual',
    'Domestication': 'Domesticación',
    'Cultivation': 'Cultivo',
    'Domestication antiquity': 'Antigüedad de domesticación',
    'Cultivation antiquity': 'Antigüedad de cultivo',
    'Minimum time of domestication': 'Tiempo mínimo de domesticación',
    'Minimum time of cultivation': 'Tiempo mínimo de cultivo',
    'GBIF coverage': 'Cobertura en GBIF',
    'GBIF records': 'Registros de GBIF',
    'Food': 'Alimento',
    'Animal feed': 'Forraje',
    'Taxonomy': 'Taxonomía',
    'Full record': 'Registro completo',
    'No image found': 'No se encontró imagen',
    'No data': 'Sin datos',
    'About': 'Acerca de',
    'How to Use': 'Cómo usar',
    'Terms': 'Términos',
    'Cite': 'Citar',
    'Citation': 'Cita',
    'Close': 'Cerrar',
  };

  /* ── apply a language across all entries ────────────────────────────── */
  function applyTo(root, lang){
    // COMMON label words within a container (modals)
    const es = (lang === 'es');
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const raw = n.nodeValue;
      const key = raw.trim();
      if (!key) return;
      // remember original on the node itself
      if (n.__en === undefined){
        if (COMMON[key] !== undefined) n.__en = raw; else return;
      }
      if (n.__en === undefined) return;
      if (es){
        const t = COMMON[n.__en.trim()];
        if (t !== undefined) n.nodeValue = n.__en.replace(n.__en.trim(), t);
      } else {
        n.nodeValue = n.__en;
      }
    });
  }

  function applyLang(lang){
    const es = (lang === 'es');
    TX.forEach(([sel, mode, val]) => {
      document.querySelectorAll(sel).forEach(el => {
        const en = getEN(el, mode);
        write(el, mode, es ? val : en);
      });
    });
    MAP.forEach(({ sel, mode, dict }) => {
      document.querySelectorAll(sel).forEach(el => {
        const en = getEN(el, mode);
        const key = (en || '').trim();
        if (dict[key] !== undefined) write(el, mode, es ? dict[key] : en);
      });
    });
    // open modals
    ['#modal-body', '#imodal-body', '#imodal-title', '#modal-inner'].forEach(s => {
      const el = document.querySelector(s);
      if (el) applyTo(el, lang);
    });
  }

  /* ── observe modals so freshly-rendered records get translated ──────── */
  let _applying = false;   // re-entrancy guard
  function observeModals(){
    ['#modal-body', '#imodal-body', '#imodal-title'].forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      // childList only: the app swaps content via innerHTML. We must NOT watch
      // characterData, or our own text edits would re-trigger this observer.
      new MutationObserver(() => {
        if (_applying) return;
        if (getLang() === 'es'){ _applying = true; applyTo(el, 'es'); _applying = false; }
      }).observe(el, { childList: true, subtree: true });
    });
  }

  /* ── public API ─────────────────────────────────────────────────────── */
  function getLang(){ return localStorage.getItem('coe_lang') || 'en'; }
  function setLang(lang){
    lang = (lang === 'es') ? 'es' : 'en';
    localStorage.setItem('coe_lang', lang);
    document.documentElement.lang = lang;
    applyLang(lang);
    window.dispatchEvent(new CustomEvent('coe-lang', { detail: lang }));
  }
  window.coeGetLang = getLang;
  window.coeSetLang = setLang;
  window.coeApplyLang = applyLang;

  /* ── boot ───────────────────────────────────────────────────────────── */
  function boot(){
    const lang = getLang();
    document.documentElement.lang = lang;
    applyLang(lang);     // caches English baseline, then renders chosen lang
    observeModals();
    window.dispatchEvent(new CustomEvent('coe-lang', { detail: lang }));
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot);
  else
    boot();
})();
