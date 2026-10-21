/* Loads the brand files for the chosen site before anything is drawn. Prototype only.
   A brand "slug" picks the color file (brand-<slug>.css). Crime Hunter palette options share one config (brand-crime-hunter.js). */
(function () {
  var q = new URLSearchParams(location.search).get('brand');
  if (q) localStorage.setItem('coi-brand', q);
  var b = q || localStorage.getItem('coi-brand') || 'student-section';
  var base = b.indexOf('crime-hunter') === 0 ? 'crime-hunter' : b;
  window.COI_BRAND_SLUG = b;
  window.COI_BRAND_BASE = base;
  window.COI_BRAND_OPTIONS = [
    ['student-section', 'Student Section'],
    ['crime-hunter', 'Crime Hunter'],
    ['crime-hunter-original', 'Crime Hunter: original palette (reference only)']
  ];
  document.write('<link rel="stylesheet" href="brand-' + b + '.css">');
  document.write('<script src="brand-' + base + '.js"><\/script>');
  document.write('<script src="data.js"><\/script>');
})();
