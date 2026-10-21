/* BRAND CONFIG: Crime Hunter (placeholder categories; sample posts are Student Section content so you can see the brand swap) */
window.COI_BRANDS = window.COI_BRANDS || {};
window.COI_BRANDS['crime-hunter'] = {
  name: 'Crime Hunter',
  logo: 'assets/ch-logo.png',
  categories: [{ name: 'True Crime' }, { name: 'Cold Cases' }, { name: 'Courts' }, { name: 'Unsolved' }],
  /* Home feed chips: a separate, editable list (WordPress menu in the "Home feed chips" location). Any label and link; not tied to categories. */
  homeChips: [['True Crime', 'category.html?c=True%20Crime'], ['Cold Cases', 'category.html?c=Cold%20Cases'], ['Courts', 'category.html?c=Courts'], ['Unsolved', 'category.html?c=Unsolved']],
  categoryDescription: 'Placeholder description for a Crime Hunter category.',
  social: [['Instagram', 'instagram'], ['Facebook', 'facebook'], ['X', 'x'], ['TikTok', 'tiktok']],
  pages: [['About Crime Hunter', 'page.html'], ['Copyright Notice', 'page.html?p=copyright']],
  legal: [
    ['Privacy Policy', 'https://www.mcclatchy.com/privacy-policy'],
    ['Cookie Preferences', '#'],
    ['Your Privacy Choices', '#'],
    ['Terms of Service', 'https://mcclatchy.com/terms-of-service']
  ],
  menuShowsLegal: false,
  note: 'Crime Hunter brand preview: only colors, logo, and menu change. Stories shown are sample Student Section content.'
};
