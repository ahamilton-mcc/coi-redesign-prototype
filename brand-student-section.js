/* BRAND CONFIG: Student Section (per-site values; in production these come from the brand file and the COI settings page) */
window.COI_BRANDS = window.COI_BRANDS || {};
window.COI_BRANDS['student-section'] = {
  name: 'Student Section',
  logo: 'assets/ss-logo.png',
  categories: [
    { name: 'Conferences', children: ['SEC', 'ACC', 'Big 10', 'Big 12', 'Pac 12'] },
    { name: 'Traditions' }, { name: 'Game Day' }, { name: 'History' }, { name: 'Rivalries' }
  ],
  /* Home feed chips: a separate, editable list (WordPress menu in the "Home feed chips" location). Any label and link; not tied to categories. */
  homeChips: [['Conferences', 'category.html?c=Conferences'], ['Traditions', 'category.html?c=Traditions'], ['Game Day', 'category.html?c=Game%20Day'], ['History', 'category.html?c=History'], ['Rivalries', 'category.html?c=Rivalries']],
  categoryDescription: 'Fan culture, traditions, game day guides and road trips from across college sports.',
  social: [['Instagram', 'instagram'], ['Facebook', 'facebook'], ['X', 'x'], ['TikTok', 'tiktok'], ['Bluesky', 'bluesky']],
  pages: [['About Student Section', 'page.html'], ['Copyright Notice', 'page.html?p=copyright']],
  legal: [
    ['Privacy Policy', 'https://www.mcclatchy.com/privacy-policy'],
    ['Cookie Preferences', '#'],
    ['Your Privacy Choices', '#'],
    ['Terms of Service', 'https://mcclatchy.com/terms-of-service']
  ],
  menuShowsLegal: false,
  note: ''
};
