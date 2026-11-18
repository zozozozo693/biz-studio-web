// =========================================
// BIZ STUDIO - the code that makes the app work
// =========================================

// =========================================
// MORE THAN ONE BUSINESS
// Each business keeps its own things, saved as "bizStudio.<business id>.orders" and so on.
// The list of businesses: [{ id, name, type }]. The one open now is saved as "current".
// =========================================
const BIZ_LIST_KEY = 'bizStudio.businesses';
const BIZ_CURRENT_KEY = 'bizStudio.current';
const BIZ_PARTS = ['profile', 'orders', 'customers', 'tasks', 'formMatch', 'products', 'supplies', 'shopping', 'money', 'events', 'notes'];

function readBusinesses() {
  try { return JSON.parse(localStorage.getItem(BIZ_LIST_KEY)) || []; } catch (error) { return []; }
}
function writeBusinesses(list) {
  try { localStorage.setItem(BIZ_LIST_KEY, JSON.stringify(list)); } catch (error) { /* fine */ }
}

let businesses = readBusinesses();

// Someone who used the app before there could be more than one business:
// move their things into their first business so nothing is lost
try {
  const old = localStorage.getItem('bizStudio.profile');
  if (!businesses.length && old) {
    const id = 'b' + Date.now().toString(36);
    BIZ_PARTS.forEach(function (part) {
      const value = localStorage.getItem('bizStudio.' + part);
      if (value !== null) {
        localStorage.setItem('bizStudio.' + id + '.' + part, value);
        localStorage.removeItem('bizStudio.' + part);
      }
    });
    const saved = JSON.parse(old);
    businesses = [{ id: id, name: saved.businessName || 'My business', type: saved.businessType || '' }];
    writeBusinesses(businesses);
    localStorage.setItem(BIZ_CURRENT_KEY, id);
  }
} catch (error) { /* fine */ }

// The business that's open. If there isn't one yet, a new id waiting for setup.
let currentBiz = null;
try { currentBiz = localStorage.getItem(BIZ_CURRENT_KEY); } catch (error) { /* fine */ }
if (!currentBiz) currentBiz = businesses.length ? businesses[0].id : 'b' + Date.now().toString(36);

// Like localStorage, but every key belongs to the open business
const store = {
  key: function (k) { return k.replace(/^bizStudio\./, 'bizStudio.' + currentBiz + '.'); },
  getItem: function (k) { return localStorage.getItem(store.key(k)); },
  setItem: function (k, v) { localStorage.setItem(store.key(k), v); },
  removeItem: function (k) { localStorage.removeItem(store.key(k)); },
};

// True when the app runs inside another page (like the online version on claude.ai).
// There, printing, downloads and extra windows aren't allowed, so those buttons hide.
const IN_FRAME = location.protocol !== 'file:' && (function () { try { return window.self !== window.top; } catch (error) { return true; } })();

// Opens another business (the whole app reloads with its things)
function switchBusiness(id) {
  try { localStorage.setItem(BIZ_CURRENT_KEY, id); } catch (error) { /* fine */ }
  location.reload();
}

// Starts setup for a brand new business, keeping all the others.
// "start" can pre-fill things, like the business type.
function addBusiness(start) {
  const id = 'b' + Date.now().toString(36);
  try {
    if (start) sessionStorage.setItem('bizStudio.newBusiness', JSON.stringify(start));
    sessionStorage.setItem('bizStudio.cameFrom', currentBiz);
  } catch (error) { /* fine */ }
  switchBusiness(id);
}

// Keeps the list of businesses up to date when the profile is saved
function rememberBusiness() {
  const entry = { id: currentBiz, name: profile.businessName, type: profile.businessType };
  const i = businesses.findIndex(function (b) { return b.id === currentBiz; });
  if (i === -1) businesses.push(entry); else businesses[i] = entry;
  writeBusinesses(businesses);
  try { localStorage.setItem(BIZ_CURRENT_KEY, currentBiz); } catch (error) { /* fine */ }
}

// Reads another business's saved profile (for its picture and colors in the list)
function profileOf(id) {
  try { return JSON.parse(localStorage.getItem('bizStudio.' + id + '.profile')) || {}; } catch (error) { return {}; }
}

// Simple line icons (drawn with SVG so they look sharp at any size)
const ICONS = {
  // menu icons
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17.5 14c2.5.3 4 2.2 4 5"/>',
  box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  cart: '<circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M2 3h3l2.5 12h11l2-8H6"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4.5L17 13H5"/>',
  tick: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  pin: '<path d="M9 3h6l-1 6 3.5 3.5h-11L10 9z"/><path d="M12 12.5V21"/>',
  check: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  book: '<path d="M4 19.5V4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5A1.5 1.5 0 0 0 5.5 21H20"/><path d="M8 7h8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  printer: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><rect x="7" y="14" width="10" height="7"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  // business type icons
  cupcake: '<path d="M5 11h14l-2 9H7z"/><path d="M5 11a7 5 0 0 1 14 0"/><path d="M10 11l.5 9M14 11l-.5 9"/><circle cx="12" cy="3.5" r="1.5"/>',
  chef: '<path d="M7 14a4 4 0 1 1 1-7.9A4 4 0 0 1 16 6a4 4 0 1 1 1 8z"/><path d="M7 14v6h10v-6M7 17h10"/>',
  candle: '<rect x="8" y="10" width="8" height="11" rx="1.5"/><path d="M12 10V7.5"/><path d="M12 2c1.6 1.8 1.6 3.4 0 4.6-1.6-1.2-1.6-2.8 0-4.6z"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.9 1.2-1.7-.4-1 .3-2.3 1.5-2.3H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  shirt: '<path d="M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
  polish: '<rect x="6" y="11" width="12" height="10" rx="3"/><path d="M9 11V8h6v3"/><rect x="10" y="2" width="4" height="6" rx="1"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 8 20 19M8.5 16 20 5"/>',
  eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/><path d="M5 7 3.5 5M9 5.2 8.5 3M15 5.2l.5-2.2M19 7l1.5-2"/>',
  cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/><path d="M22 9v5"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  dumbbell: '<path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8 7l1.5-3h5L16 7"/><circle cx="12" cy="13.5" r="3.5"/>',
  paw: '<circle cx="6.5" cy="10" r="1.8"/><circle cx="10" cy="6" r="1.8"/><circle cx="14" cy="6" r="1.8"/><circle cx="17.5" cy="10" r="1.8"/><path d="M12 11c-3 0-5.5 4-5.5 6.2 0 1.8 1.5 2.8 3.1 2.4 1-.3 1.6-.6 2.4-.6s1.4.3 2.4.6c1.6.4 3.1-.6 3.1-2.4C17.5 15 15 11 12 11z"/>',
  spray: '<rect x="7" y="10" width="9" height="11" rx="2"/><path d="M9 10V7h5v3M14 7h3l2-2M20 9h1.5M20 12h1.5"/>',
  leaf: '<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15z"/><path d="M5 19l8-8"/>',
  balloon: '<path d="M12 3a6 6 0 0 0-6 6c0 4 3 7 6 7s6-3 6-7a6 6 0 0 0-6-6z"/><path d="M12 16l-1 2h2zM12 18c0 2-2 2-2 4"/>',
  clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M5 3 2 6M19 3l3 3"/>',
  sprout: '<path d="M12 21v-9"/><path d="M12 12C12 8 9 6 5 6c0 4 3 6 7 6zM12 12c0-4 3-6 7-6 0 4-3 6-7 6z"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  back: '<path d="m15 6-6 6 6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  camera2: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
  note: '<path d="M5 4h14a1 1 0 0 1 1 1v9l-6 6H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M14 20v-5a1 1 0 0 1 1-1h5"/>',
  popout: '<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="11.5" y="10.5" width="7" height="6" rx="1.2"/>',
  upload: '<path d="M12 15V4M7 9l5-5 5 5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9s1.3-6.4 3.8-9z"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
};

function icon(name) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
}

// =========================================
// BUSINESS TYPES
// "words"    are what sections are called for that business.
// "example"  is the sample name shown in the business name box.
// "keywords" help guess the type when someone types their own.
// "color"    is the card color: pink, mint, sky, lilac, peach or butter.
// "samples"  are 2 example items shown in the Look page preview.
// =========================================
const BUSINESS_TYPES = [
  {
    id: 'bakery', color: 'pink', icon: 'cupcake', label: 'Home bakery', example: 'Bakez & Cakez',
    words: { products: 'Recipes', orders: 'Orders', customers: 'Customers', supplies: 'Ingredients' },
    keywords: ['bake', 'cake', 'cookie', 'cupcake', 'bread', 'dessert', 'pastr', 'sweet', 'treat', 'pie', 'macaron', 'chocolate', 'candy', 'fudge', 'brownie', 'donut'],
    samples: ['Birthday cake', 'Chocolate chip cookies'],
  },
  {
    id: 'catering', color: 'peach', icon: 'chef', label: 'Meals and catering', example: 'Sunday Supper Co.',
    words: { products: 'Menu items', orders: 'Orders', customers: 'Customers', supplies: 'Ingredients' },
    keywords: ['cater', 'meal', 'food', 'cook', 'chef', 'lunch', 'dinner', 'snack', 'drink', 'lemonade', 'coffee'],
    samples: ['Taco tray for 20', 'Meal prep box'],
  },
  {
    id: 'craft', color: 'butter', icon: 'candle', label: 'Candles and crafts', example: 'Wick & Willow',
    words: { products: 'Products', orders: 'Orders', customers: 'Customers', supplies: 'Materials' },
    keywords: ['candle', 'soap', 'craft', 'handmade', 'crochet', 'knit', 'resin', 'jewel', 'bead', 'bracelet', 'pottery', 'keychain'],
    samples: ['Lavender candle', 'Beaded bracelet'],
  },
  {
    id: 'art', color: 'lilac', icon: 'palette', label: 'Art and commissions', example: 'Inkwell Studio',
    words: { products: 'Pieces', orders: 'Commissions', customers: 'Clients', supplies: 'Art supplies' },
    keywords: ['art', 'paint', 'draw', 'illustrat', 'portrait', 'sticker', 'commission', 'design', 'mural', 'graphic'],
    samples: ['Pet portrait', 'Sticker pack'],
  },
  {
    id: 'clothing', color: 'sky', icon: 'shirt', label: 'Sewing and clothing', example: 'Stitch & Thread',
    words: { products: 'Products', orders: 'Orders', customers: 'Customers', supplies: 'Materials' },
    keywords: ['sew', 'cloth', 'shirt', 'alter', 'embroider', 'fashion', 'tote', 'hoodie', 'thrift', 'vintage'],
    samples: ['Embroidered hoodie', 'Hem jeans'],
  },
  {
    id: 'nails', color: 'pink', icon: 'polish', label: 'Nails', example: 'Polished by Priya',
    words: { products: 'Services', orders: 'Appointments', customers: 'Clients', supplies: 'Supplies' },
    keywords: ['nail', 'manicure', 'pedicure', 'gel', 'acrylic'],
    samples: ['Gel manicure', 'Acrylic full set'],
  },
  {
    id: 'hair', color: 'lilac', icon: 'scissors', label: 'Hair', example: 'Crown & Curl',
    words: { products: 'Services', orders: 'Appointments', customers: 'Clients', supplies: 'Supplies' },
    keywords: ['hair', 'braid', 'barber', 'haircut', 'locs', 'silk press', 'wig', 'stylist'],
    samples: ['Box braids', 'Silk press'],
  },
  {
    id: 'beauty', color: 'peach', icon: 'eye', label: 'Lashes and makeup', example: 'Lash Lounge',
    words: { products: 'Services', orders: 'Appointments', customers: 'Clients', supplies: 'Supplies' },
    keywords: ['lash', 'makeup', 'brow', 'wax', 'skin', 'facial', 'spa', 'beauty'],
    samples: ['Classic lash set', 'Prom makeup'],
  },
  {
    id: 'tutoring', color: 'sky', icon: 'cap', label: 'Tutoring', example: 'Bright Minds Tutoring',
    words: { products: 'Lessons', orders: 'Sessions', customers: 'Students', supplies: 'Materials' },
    keywords: ['tutor', 'math', 'reading', 'homework', 'teach', 'test prep', 'science', 'spanish', 'language'],
    samples: ['Algebra review', 'Essay help'],
  },
  {
    id: 'music', color: 'lilac', icon: 'music', label: 'Music and dance lessons', example: 'Treble Makers',
    words: { products: 'Lessons', orders: 'Bookings', customers: 'Students', supplies: 'Materials' },
    keywords: ['music', 'piano', 'guitar', 'sing', 'voice', 'violin', 'drum', 'dance', 'ballet'],
    samples: ['Beginner piano', 'Guitar lesson'],
  },
  {
    id: 'fitness', color: 'mint', icon: 'dumbbell', label: 'Fitness coaching', example: 'Strong Start Fitness',
    words: { products: 'Classes', orders: 'Sessions', customers: 'Clients', supplies: 'Equipment' },
    keywords: ['fitness', 'train', 'yoga', 'gym', 'coach', 'workout', 'pilates', 'sport', 'soccer', 'basketball'],
    samples: ['Personal training', 'Yoga class'],
  },
  {
    id: 'photo', color: 'butter', icon: 'camera', label: 'Photography', example: 'Golden Hour Photos',
    words: { products: 'Packages', orders: 'Shoots', customers: 'Clients', supplies: 'Gear' },
    keywords: ['photo', 'camera', 'video', 'film', 'edit', 'content'],
    samples: ['Senior portraits', 'Family photos'],
  },
  {
    id: 'pets', color: 'peach', icon: 'paw', label: 'Pet care', example: 'Sunny Paws',
    words: { products: 'Services', orders: 'Bookings', customers: 'Pet owners', supplies: 'Supplies' },
    keywords: ['dog', 'cat', 'pet', 'groom', 'walk', 'puppy', 'animal', 'horse'],
    samples: ['Dog walk', 'Bath and brush'],
  },
  {
    id: 'cleaning', color: 'sky', icon: 'spray', label: 'Cleaning', example: 'Sparkle & Shine',
    words: { products: 'Services', orders: 'Jobs', customers: 'Clients', supplies: 'Supplies' },
    keywords: ['clean', 'detail', 'wash', 'laundry', 'organiz', 'house', 'maid', 'window'],
    samples: ['Deep clean', 'Car detailing'],
  },
  {
    id: 'yard', color: 'mint', icon: 'leaf', label: 'Yard and garden', example: 'Green Thumb Yard Care',
    words: { products: 'Services', orders: 'Jobs', customers: 'Clients', supplies: 'Supplies' },
    keywords: ['lawn', 'yard', 'garden', 'plant', 'landscap', 'mow', 'snow', 'flower', 'leaf'],
    samples: ['Lawn mowing', 'Leaf cleanup'],
  },
  {
    id: 'events', color: 'pink', icon: 'balloon', label: 'Parties and events', example: 'Pop & Party Decor',
    words: { products: 'Packages', orders: 'Events', customers: 'Clients', supplies: 'Supplies' },
    keywords: ['party', 'event', 'balloon', 'decor', 'wedding', 'dj', 'plan', 'face paint', 'bounce'],
    samples: ['Balloon arch', 'Birthday setup'],
  },
  {
    id: 'other', color: 'butter', icon: 'sparkle', label: 'Something else', example: 'Your business name',
    words: { products: 'Products', orders: 'Orders', customers: 'Customers', supplies: 'Supplies' },
    keywords: [],
    samples: ['First order', 'Second order'],
  },
];

function findType(id) {
  return BUSINESS_TYPES.find(function (t) { return t.id === id; }) || BUSINESS_TYPES[0];
}

// When someone types their own business ("dog grooming"), find the type it sounds like
function guessType(text) {
  const lower = text.toLowerCase();
  if (lower.trim() === '') return null;
  // Split what they typed into words, then look for a word that starts with a keyword
  // ("grooming" starts with "groom", so it matches pet care)
  const typedWords = lower.split(/[^a-z]+/);
  return BUSINESS_TYPES.find(function (type) {
    return type.keywords.some(function (keyword) {
      if (keyword.includes(' ')) return lower.includes(keyword); // two-word keywords like "test prep"
      return typedWords.some(function (w) { return w.startsWith(keyword); });
    });
  }) || null;
}

// The words for the owner's business (Recipes, Services, Clients...)
// If they picked "Something else", these are the words they chose.
function words() {
  if (profile.businessType === 'other') return profile.customWords;
  return findType(profile.businessType).words;
}

// =========================================
// LOOK: color themes and fonts
// "ink"   is the main color (text, logo, buttons)
// "sun"   is the accent color (star, progress bar, highlights)
// "glows" are the 3 soft background colors
// "font"  is the heading font that matches the theme (from FONTS below)
// =========================================
const THEME_GROUPS = [
  {
    label: 'Simple',
    themes: [
      { id: 'classic',  label: 'Classic',  ink: '#1d2a44', sun: '#ffb703', font: 'friendly', glows: ['#ffe0ea', '#d9ecff', '#d3f5e6'] },
      { id: 'slate',    label: 'Slate',    ink: '#2f3e4e', sun: '#9fb3c8', font: 'modern', glows: ['#e4ebf2', '#eef2f7', '#ede9f4'] },
      { id: 'sage',     label: 'Sage',     ink: '#3d5a4a', sun: '#a8c3a0', font: 'classic', glows: ['#e8f0e4', '#f1f6ee', '#f6efe6'] },
      { id: 'lavender', label: 'Lavender', ink: '#3b2f7a', sun: '#b79cff', font: 'elegant', glows: ['#ece5ff', '#f4f0ff', '#ffe9f3'] },
      { id: 'cherry',   label: 'Cherry',   ink: '#7a1f2b', sun: '#ffb3c1', font: 'elegant', glows: ['#ffe3e8', '#fff0f2', '#fff3dc'] },
    ],
  },
  {
    label: 'Sweet treats',
    themes: [
      { id: 'strawberry', label: 'Strawberry', ink: '#8a1c3b', sun: '#ff6b8b', font: 'playful', glows: ['#ffdbe4', '#ffeef2', '#e3f6dc'] },
      { id: 'matcha',     label: 'Matcha',     ink: '#2f5233', sun: '#8fc96b', font: 'rounded', glows: ['#e2f2d5', '#f0f8e8', '#fff3dc'] },
      { id: 'blueberry',  label: 'Blueberry',  ink: '#23306b', sun: '#6c8cff', font: 'rounded', glows: ['#dfe6ff', '#eceffe', '#f1e6ff'] },
      { id: 'lemon',      label: 'Lemon',      ink: '#5c4d00', sun: '#ffd60a', font: 'playful', glows: ['#fff4b8', '#fffbe0', '#e6f7e1'] },
      { id: 'caramel',    label: 'Caramel',    ink: '#5a3418', sun: '#e09f3e', font: 'classic', glows: ['#f6e1c8', '#fdf1e3', '#ffe6dc'] },
      { id: 'bubblegum',  label: 'Bubblegum',  ink: '#6d1b7b', sun: '#ff8fd8', font: 'playful', glows: ['#ffdcf3', '#e9e1ff', '#dcf6ff'] },
    ],
  },
  {
    label: 'Nature',
    themes: [
      { id: 'ocean',  label: 'Ocean',  ink: '#0f4c5c', sun: '#4cc9f0', font: 'friendly', glows: ['#d4f1ff', '#e3fbf5', '#eaf3ff'] },
      { id: 'forest', label: 'Forest', ink: '#1f4d3a', sun: '#9ad14b', font: 'classic', glows: ['#e0f2d8', '#eef7e4', '#fff2d6'] },
      { id: 'sunset', label: 'Sunset', ink: '#6b2d1a', sun: '#ff8c42', font: 'friendly', glows: ['#ffe0cc', '#ffd9e4', '#fff0c4'] },
      { id: 'desert', label: 'Desert', ink: '#6b4226', sun: '#e9a96b', font: 'elegant', glows: ['#f7e4cf', '#fcefe1', '#f1e2d8'] },
      { id: 'sky',    label: 'Sky',    ink: '#1b4b8a', sun: '#8ecdf7', font: 'rounded', glows: ['#dbecff', '#eef6ff', '#fff6d9'] },
    ],
  },
  {
    label: 'Bold',
    themes: [
      { id: 'galaxy',   label: 'Galaxy',   ink: '#2a1b5e', sun: '#7b5cff', font: 'modern', glows: ['#e0d8ff', '#d6eeff', '#ffd9f0'] },
      { id: 'tropical', label: 'Tropical', ink: '#0b5d4b', sun: '#ff6f59', font: 'playful', glows: ['#d2f4e9', '#ffe0d8', '#fff2bf'] },
      { id: 'retro',    label: 'Retro',    ink: '#3d2c8d', sun: '#ff9f1c', font: 'modern', glows: ['#ffe6c2', '#e4ddff', '#d5f5ef'] },
      { id: 'rainbow',  label: 'Rainbow',  ink: '#262335', sun: '#ff5d8f', font: 'playful', glows: ['#ffdede', '#dcf5e3', '#dbe8ff'] },
    ],
  },
];

// All the themes in one list, so they are easy to look up
const THEMES = THEME_GROUPS.flatMap(function (group) { return group.themes; });

const FONTS = [
  { id: 'friendly', label: 'Friendly', family: "'Bricolage Grotesque', 'Segoe UI', sans-serif" },
  { id: 'classic',  label: 'Classic',  family: "'Lora', Georgia, serif" },
  { id: 'rounded',  label: 'Rounded',  family: "'Nunito', 'Segoe UI', sans-serif" },
  { id: 'playful',  label: 'Playful',  family: "'Fredoka', 'Segoe UI', sans-serif" },
  { id: 'elegant',  label: 'Elegant',  family: "'Playfair Display', Georgia, serif" },
  { id: 'modern',   label: 'Modern',   family: "'Space Grotesk', 'Segoe UI', sans-serif" },
];

function findFont(id) {
  return FONTS.find(function (f) { return f.id === id; });
}

// If "Change with the time of day" is on, these themes are used instead
function themeForTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'sunset';    // warm morning
  if (hour < 18) return 'ocean';     // bright afternoon
  return 'lavender';                 // calm evening
}

// The theme being used right now
function currentTheme() {
  if (profile.changeWithTime) {
    return THEMES.find(function (t) { return t.id === themeForTimeOfDay(); });
  }
  if (profile.theme === 'custom') {
    // Custom themes make their glows from the accent color
    return {
      ink: profile.customInk,
      sun: profile.customSun,
      glows: [
        'color-mix(in srgb, ' + profile.customSun + ' 25%, white)',
        'color-mix(in srgb, ' + profile.customInk + ' 12%, white)',
        'color-mix(in srgb, ' + profile.customSun + ' 12%, white)',
      ],
    };
  }
  return THEMES.find(function (t) { return t.id === profile.theme; });
}

// Puts the owner's colors and font into the CSS variables
function applyLook() {
  const theme = currentTheme();
  const font = findFont(profile.font);
  const root = document.documentElement.style;
  root.setProperty('--ink', theme.ink);
  root.setProperty('--sun', theme.sun);
  root.setProperty('--glow-a', theme.glows[0]);
  root.setProperty('--glow-b', theme.glows[1]);
  root.setProperty('--glow-c', theme.glows[2]);
  root.setProperty('--font-head', font.family);
}

// =========================================
// GOALS
// "focus" = the sections that move to the top of the menu for this goal.
// "tip"   = shown on the My Day screen.
// Labels and tips can use the business's words (w).
// =========================================
const GOALS = [
  { id: 'forget', color: 'sky', icon: 'clock',
    label: (w) => 'I forget ' + w.orders.toLowerCase() + ' or due dates',
    focus: ['calendar', 'orders', 'todo'],
    tip: (w) => 'Check your calendar each morning. You will get extra reminders before ' + w.orders.toLowerCase() + ' are due.' },
  { id: 'pricing', color: 'mint', icon: 'tag',
    label: "I don't know how to price my work",
    focus: ['pricing', 'bookkeeping'],
    tip: (w) => 'Add what you pay for ' + w.supplies.toLowerCase() + ' in Pricing and profit, and Biz Studio will suggest fair prices.' },
  { id: 'supplies', color: 'pink', icon: 'cart',
    label: (w) => 'I run out of ' + w.supplies.toLowerCase(),
    focus: ['checklist', 'products'],
    tip: (w) => 'Look at your ' + w.supplies.toLowerCase() + ' list a few days before busy days so you can shop ahead.' },
  { id: 'grow', color: 'lilac', icon: 'sprout',
    label: 'I want to grow my business',
    focus: ['finder', 'customers', 'printables'],
    tip: 'Use the Finder to discover local markets and events where you can sell.' },
  { id: 'time', color: 'butter', icon: 'check',
    label: "I don't have enough time",
    focus: ['todo', 'calendar'],
    tip: 'Your to-do list puts the most urgent work first, so you always know what to do next.' },
  { id: 'organize', color: 'peach', icon: 'folder',
    label: 'My info is all over the place',
    focus: ['orders', 'customers'],
    tip: (w) => usesOrders()
      ? 'Keep every one of your ' + w.orders.toLowerCase() + ' and ' + w.customers.toLowerCase() + ' here instead of in texts and notes.'
      : 'Keep your ' + w.customers.toLowerCase() + ', to-dos and events here instead of in texts and notes.' },
  { id: 'money', color: 'mint', icon: 'book',
    label: 'I want to track my money',
    focus: ['bookkeeping', 'pricing'],
    tip: 'Bookkeeping adds up what comes in and what goes out, so you can see your real profit.' },
  { id: 'pro', color: 'lilac', icon: 'printer',
    label: 'I want my business to look professional',
    focus: ['printables'],
    tip: (w) => 'Make receipts, menus and price lists from your ' + w.products.toLowerCase() + ' in a few clicks.' },
];

function findGoal(id) {
  return GOALS.find(function (g) { return g.id === id; });
}

// The sections picked for the owner's goals, in order, with no repeats
function focusSections() {
  const ids = [];
  profile.goals.forEach(function (goalId) {
    findGoal(goalId).focus.forEach(function (id) {
      if (!ids.includes(id)) ids.push(id);
    });
  });
  return ids;
}

// =========================================
// SECTIONS
// Labels and messages that change with the business are written as
// functions: (w) => ... where w is the business's words.
// =========================================
const SECTIONS = [
  { id: 'myday', icon: 'sun', label: 'My Day',
    emptyTitle: 'Nothing due today',
    emptyText: (w) => w.orders + ', tasks and reminders due today will show up here.' },
  { id: 'orders', icon: 'receipt', label: (w) => w.orders,
    emptyTitle: (w) => 'No ' + w.orders.toLowerCase() + ' yet',
    emptyText: (w) => w.orders + ' you add, or that come in from your order form, will show up here.' },
  { id: 'todo', icon: 'check', label: 'To-do list',
    emptyTitle: 'No tasks',
    emptyText: (w) => 'Tasks from your ' + w.orders.toLowerCase() + ', plus any you add, will be listed here with the most urgent first.' },
  { id: 'notes', icon: 'note', label: 'Sticky notes',
    emptyTitle: 'No sticky notes yet',
    emptyText: 'Quick notes and reminders, in any color you like.' },
  { id: 'calendar', icon: 'calendar', label: 'Calendar',
    emptyTitle: 'Your calendar is clear',
    emptyText: (w) => w.orders + ' and events will show up on the day they are due.' },
  { id: 'customers', icon: 'users', label: (w) => w.customers,
    emptyTitle: (w) => 'No ' + w.customers.toLowerCase() + ' yet',
    emptyText: (w) => usesOrders() ? w.customers + ' are added automatically from your ' + w.orders.toLowerCase() + '.' : 'Keep everyone you work for in one place.' },
  { id: 'products', icon: 'box', label: (w) => w.products,
    emptyTitle: 'Nothing on your list yet',
    emptyText: (w) => 'Add your ' + w.products.toLowerCase() + ' with their prices, ' + w.supplies.toLowerCase() + ' and steps.' },
  { id: 'checklist', icon: 'cart', label: (w) => w.supplies + ' and shopping',
    emptyTitle: 'Nothing to buy',
    emptyText: (w) => 'When ' + w.orders.toLowerCase() + ' are coming up, the ' + w.supplies.toLowerCase() + ' they need will be listed here.' },
  { id: 'pricing', icon: 'tag', label: 'Pricing and profit',
    emptyTitle: 'No prices worked out yet',
    emptyText: (w) => 'Enter what you pay for ' + w.supplies.toLowerCase() + ' to see what each one really costs you.' },
  { id: 'bookkeeping', icon: 'book', label: 'Bookkeeping',
    emptyTitle: 'No money tracked yet',
    emptyText: 'Payments and the expenses you add are totaled here by week, month and year.' },
  { id: 'finder', icon: 'search', label: 'Finder',
    emptyTitle: 'Find anything',
    emptyText: 'Search everything in your app, or find markets and stores near you.' },
  { id: 'printables', icon: 'printer', label: () => (usesOrders() ? 'Receipts and menus' : 'Menus'),
    emptyTitle: 'No printables yet',
    emptyText: (w) => 'Make receipts, menus and price lists from your ' + w.products.toLowerCase() + '.' },
  { id: 'settings', icon: 'sliders', label: 'Settings',
    emptyTitle: 'Settings',
    emptyText: 'Your business profile, theme and reminders will be here.' },
];

// Turns a label or message into text, whether it's plain text or a function
function say(value) {
  return typeof value === 'function' ? value(words()) : value;
}

// How the menu is grouped. Each group has its own color.
// Settings sits at the bottom on its own.
const MENU_GROUPS = [
  { label: '', color: 'butter', items: ['myday'] },
  { label: 'Work', color: 'sky', items: ['orders', 'todo', 'notes', 'calendar'] },
  { label: 'Business', color: 'pink', items: ['customers', 'products', 'checklist'] },
  { label: 'Money', color: 'mint', items: ['pricing', 'bookkeeping'] },
  { label: 'Grow', color: 'lilac', items: ['finder', 'printables'] },
  { label: '', color: 'peach', items: ['settings'] },
];

// Finds the color of the group a section is in
function sectionColor(id) {
  return MENU_GROUPS.find(function (g) { return g.items.includes(id); }).color;
}

// =========================================
// PROFILE SETUP
// =========================================

// =========================================
// LANGUAGE
// The app is written in English. When another language is picked, every bit of text
// on the screen is swapped for its translation as it shows up (see LANG_ES and the other
// languages at the bottom of this file).
// Numbers, prices, dates and the business's own words are kept and put back in.
// The language is saved on this computer, for every business.
// =========================================
const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
  { id: 'fr', label: 'Français' },
  { id: 'zh', label: '中文 (简体)' },
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'ko', label: '한국어' },
  { id: 'tl', label: 'Tagalog' },
  { id: 'ru', label: 'Русский' },
  { id: 'ja', label: '日本語' },
  { id: 'pt', label: 'Português' },
  { id: 'de', label: 'Deutsch' },
  { id: 'it', label: 'Italiano' },
  { id: 'id', label: 'Bahasa Indonesia' },
  { id: 'uk', label: 'Українська' },
  { id: 'hi', label: 'हिन्दी' },
];
let appLanguage = 'en';
try { appLanguage = localStorage.getItem('bizStudio.language') || 'en'; } catch (error) { /* fine */ }
if (!LANGUAGES.some(function (l) { return l.id === appLanguage; })) appLanguage = 'en';

// For dates and times: "Tuesday, November 17" or "martes, 17 de noviembre"
function appLocale() {
  const country = typeof myCountry === 'function' ? myCountry() : 'US';
  if (appLanguage === 'es') return country === 'MX' ? 'es-MX' : 'es-US';
  if (appLanguage === 'fr') return country === 'CA' ? 'fr-CA' : 'fr-FR';
  if (appLanguage === 'zh') return 'zh-CN';
  if (appLanguage === 'vi') return 'vi-VN';
  if (appLanguage === 'ko') return 'ko-KR';
  if (appLanguage === 'tl') return 'fil-PH';
  if (appLanguage === 'ru') return 'ru-RU';
  if (appLanguage === 'ja') return 'ja-JP';
  if (appLanguage === 'pt') return 'pt-BR';
  if (appLanguage === 'de') return 'de-DE';
  if (appLanguage === 'it') return 'it-IT';
  if (appLanguage === 'id') return 'id-ID';
  if (appLanguage === 'uk') return 'uk-UA';
  if (appLanguage === 'hi') return 'hi-IN';
  return 'en-US';
}

function setLanguage(id) {
  appLanguage = id;
  try { localStorage.setItem('bizStudio.language', id); } catch (error) { /* fine */ }
  document.documentElement.lang = id;
  // Draw everything again in the new language
  if (!document.getElementById('app').hidden) { showMenu(); showPage(); }
  else showSetup();
}

// The business's own words in other languages (Recipes, Orders...): Spanish, French, Chinese, Vietnamese, Korean
const OWN_WORDS = {
  'Recipes': ['Recetas', 'Recettes', '食谱', 'Công thức', '레시피'], 'Recipe': ['Receta', 'Recette', '食谱', 'Công thức', '레시피'],
  'Orders': ['Pedidos', 'Commandes', '订单', 'Đơn hàng', '주문'], 'Order': ['Pedido', 'Commande', '订单', 'Đơn hàng', '주문'],
  'Customers': ['Clientes', 'Clients', '顾客', 'Khách hàng', '고객'], 'Customer': ['Cliente', 'Client', '顾客', 'Khách hàng', '고객'],
  'Ingredients': ['Ingredientes', 'Ingrédients', '食材', 'Nguyên liệu', '재료'], 'Ingredient': ['Ingrediente', 'Ingrédient', '食材', 'Nguyên liệu', '재료'],
  'Classes': ['Clases', 'Cours', '课程', 'Lớp học', '수업'], 'Class': ['Clase', 'Cours', '课程', 'Lớp học', '수업'],
  'Sessions': ['Sesiones', 'Séances', '课时', 'Buổi tập', '세션'], 'Session': ['Sesión', 'Séance', '课时', 'Buổi tập', '세션'],
  'Clients': ['Clientes', 'Clients', '客户', 'Khách hàng', '고객'], 'Client': ['Cliente', 'Client', '客户', 'Khách hàng', '고객'],
  'Equipment': ['Equipo', 'Équipement', '器材', 'Dụng cụ', '장비'],
  'Lessons': ['Clases', 'Leçons', '课程', 'Bài học', '레슨'], 'Lesson': ['Clase', 'Leçon', '课程', 'Bài học', '레슨'],
  'Bookings': ['Reservas', 'Réservations', '预约', 'Lịch đặt', '예약'], 'Booking': ['Reserva', 'Réservation', '预约', 'Lịch đặt', '예약'],
  'Students': ['Alumnos', 'Élèves', '学生', 'Học sinh', '학생'], 'Student': ['Alumno', 'Élève', '学生', 'Học sinh', '학생'],
  'Materials': ['Materiales', 'Matériel', '材料', 'Vật liệu', '재료'], 'Material': ['Material', 'Matériel', '材料', 'Vật liệu', '재료'],
  'Menu items': ['Platillos', 'Plats', '菜品', 'Món ăn', '메뉴'], 'Menu item': ['Platillo', 'Plat', '菜品', 'Món ăn', '메뉴'],
  'Packages': ['Paquetes', 'Forfaits', '套餐', 'Gói dịch vụ', '패키지'], 'Package': ['Paquete', 'Forfait', '套餐', 'Gói dịch vụ', '패키지'],
  'Events': ['Eventos', 'Événements', '活动', 'Sự kiện', '행사'], 'Event': ['Evento', 'Événement', '活动', 'Sự kiện', '행사'],
  'Shoots': ['Sesiones de fotos', 'Séances photo', '拍摄', 'Buổi chụp', '촬영'], 'Shoot': ['Sesión de fotos', 'Séance photo', '拍摄', 'Buổi chụp', '촬영'],
  'Gear': ['Equipo', 'Matériel', '器材', 'Thiết bị', '장비'],
  'Pieces': ['Piezas', 'Œuvres', '作品', 'Tác phẩm', '작품'], 'Piece': ['Pieza', 'Œuvre', '作品', 'Tác phẩm', '작품'],
  'Commissions': ['Encargos', 'Commandes', '委托', 'Đơn đặt', '의뢰'], 'Commission': ['Encargo', 'Commande', '委托', 'Đơn đặt', '의뢰'],
  'Art supplies': ['Materiales de arte', "Matériel d'art", '美术用品', 'Họa cụ', '미술 용품'], 'Art supply': ['Material de arte', "Matériel d'art", '美术用品', 'Họa cụ', '미술 용품'],
  'Products': ['Productos', 'Produits', '产品', 'Sản phẩm', '상품'], 'Product': ['Producto', 'Produit', '产品', 'Sản phẩm', '상품'],
  'Supplies': ['Insumos', 'Fournitures', '用品', 'Vật tư', '용품'], 'Supply': ['Insumo', 'Fourniture', '用品', 'Vật tư', '용품'],
  'Services': ['Servicios', 'Services', '服务', 'Dịch vụ', '서비스'], 'Service': ['Servicio', 'Service', '服务', 'Dịch vụ', '서비스'],
  'Appointments': ['Citas', 'Rendez-vous', '预约', 'Lịch hẹn', '예약'], 'Appointment': ['Cita', 'Rendez-vous', '预约', 'Lịch hẹn', '예약'],
  'Pet owners': ['Dueños de mascotas', 'Propriétaires', '宠物主人', 'Chủ thú cưng', '보호자'], 'Pet owner': ['Dueño de mascota', 'Propriétaire', '宠物主人', 'Chủ thú cưng', '보호자'],
  'Jobs': ['Trabajos', 'Contrats', '工作', 'Công việc', '작업'], 'Job': ['Trabajo', 'Contrat', '工作', 'Công việc', '작업'],
};
// ...and Tagalog, Russian, Japanese, Portuguese, German
const OWN_WORDS_MORE = {
  'Recipes': ['Mga recipe', 'Рецепты', 'レシピ', 'Receitas', 'Rezepte'], 'Recipe': ['Recipe', 'Рецепт', 'レシピ', 'Receita', 'Rezept'],
  'Orders': ['Mga order', 'Заказы', '注文', 'Pedidos', 'Bestellungen'], 'Order': ['Order', 'Заказ', '注文', 'Pedido', 'Bestellung'],
  'Customers': ['Mga customer', 'Клиенты', 'お客さん', 'Clientes', 'Kunden'], 'Customer': ['Customer', 'Клиент', 'お客さん', 'Cliente', 'Kunde'],
  'Ingredients': ['Mga sangkap', 'Ингредиенты', '材料', 'Ingredientes', 'Zutaten'], 'Ingredient': ['Sangkap', 'Ингредиент', '材料', 'Ingrediente', 'Zutat'],
  'Classes': ['Mga klase', 'Занятия', 'クラス', 'Aulas', 'Kurse'], 'Class': ['Klase', 'Занятие', 'クラス', 'Aula', 'Kurs'],
  'Sessions': ['Mga session', 'Сеансы', 'セッション', 'Sessões', 'Einheiten'], 'Session': ['Session', 'Сеанс', 'セッション', 'Sessão', 'Einheit'],
  'Clients': ['Mga kliyente', 'Клиенты', 'お客さま', 'Clientes', 'Kunden'], 'Client': ['Kliyente', 'Клиент', 'お客さま', 'Cliente', 'Kunde'],
  'Equipment': ['Kagamitan', 'Оборудование', '道具', 'Equipamentos', 'Ausrüstung'],
  'Lessons': ['Mga lesson', 'Уроки', 'レッスン', 'Aulas', 'Stunden'], 'Lesson': ['Lesson', 'Урок', 'レッスン', 'Aula', 'Stunde'],
  'Bookings': ['Mga booking', 'Записи', '予約', 'Reservas', 'Buchungen'], 'Booking': ['Booking', 'Запись', '予約', 'Reserva', 'Buchung'],
  'Students': ['Mga estudyante', 'Ученики', '生徒', 'Alunos', 'Schüler'], 'Student': ['Estudyante', 'Ученик', '生徒', 'Aluno', 'Schüler'],
  'Materials': ['Mga materyales', 'Материалы', '材料', 'Materiais', 'Materialien'], 'Material': ['Materyales', 'Материал', '材料', 'Material', 'Material'],
  'Menu items': ['Mga pagkain', 'Блюда', 'メニュー', 'Pratos', 'Gerichte'], 'Menu item': ['Pagkain', 'Блюдо', 'メニュー', 'Prato', 'Gericht'],
  'Packages': ['Mga package', 'Пакеты', 'プラン', 'Pacotes', 'Pakete'], 'Package': ['Package', 'Пакет', 'プラン', 'Pacote', 'Paket'],
  'Events': ['Mga event', 'Мероприятия', 'イベント', 'Eventos', 'Events'], 'Event': ['Event', 'Мероприятие', 'イベント', 'Evento', 'Event'],
  'Shoots': ['Mga shoot', 'Съёмки', '撮影', 'Ensaios', 'Shootings'], 'Shoot': ['Shoot', 'Съёмка', '撮影', 'Ensaio', 'Shooting'],
  'Gear': ['Gamit', 'Техника', '機材', 'Equipamentos', 'Ausrüstung'],
  'Pieces': ['Mga likha', 'Работы', '作品', 'Obras', 'Werke'], 'Piece': ['Likha', 'Работа', '作品', 'Obra', 'Werk'],
  'Commissions': ['Mga commission', 'Заказы', '依頼', 'Encomendas', 'Aufträge'], 'Commission': ['Commission', 'Заказ', '依頼', 'Encomenda', 'Auftrag'],
  'Art supplies': ['Gamit sa sining', 'Художественные материалы', '画材', 'Materiais de arte', 'Künstlerbedarf'], 'Art supply': ['Gamit sa sining', 'Художественный материал', '画材', 'Material de arte', 'Künstlerbedarf'],
  'Products': ['Mga produkto', 'Товары', '商品', 'Produtos', 'Produkte'], 'Product': ['Produkto', 'Товар', '商品', 'Produto', 'Produkt'],
  'Supplies': ['Mga gamit', 'Расходники', '消耗品', 'Materiais', 'Material'], 'Supply': ['Gamit', 'Расходник', '消耗品', 'Material', 'Material'],
  'Services': ['Mga serbisyo', 'Услуги', 'サービス', 'Serviços', 'Leistungen'], 'Service': ['Serbisyo', 'Услуга', 'サービス', 'Serviço', 'Leistung'],
  'Appointments': ['Mga appointment', 'Записи', '予約', 'Horários', 'Termine'], 'Appointment': ['Appointment', 'Запись', '予約', 'Horário', 'Termin'],
  'Pet owners': ['Mga may-ari ng alaga', 'Хозяева питомцев', '飼い主さん', 'Tutores', 'Tierhalter'], 'Pet owner': ['May-ari ng alaga', 'Хозяин питомца', '飼い主さん', 'Tutor', 'Tierhalter'],
  'Jobs': ['Mga trabaho', 'Заказы', '仕事', 'Serviços', 'Aufträge'], 'Job': ['Trabaho', 'Заказ', '仕事', 'Serviço', 'Auftrag'],
};
Object.keys(OWN_WORDS_MORE).forEach(function (k) { OWN_WORDS[k] = OWN_WORDS[k].concat(OWN_WORDS_MORE[k]); });
// ...and Italian, Indonesian, Ukrainian, Hindi
const OWN_WORDS_MORE2 = {
  'Recipes': ['Ricette', 'Resep', 'Рецепти', 'रेसिपी'], 'Recipe': ['Ricetta', 'Resep', 'Рецепт', 'रेसिपी'],
  'Orders': ['Ordini', 'Pesanan', 'Замовлення', 'ऑर्डर'], 'Order': ['Ordine', 'Pesanan', 'Замовлення', 'ऑर्डर'],
  'Customers': ['Clienti', 'Pelanggan', 'Клієнти', 'ग्राहक'], 'Customer': ['Cliente', 'Pelanggan', 'Клієнт', 'ग्राहक'],
  'Ingredients': ['Ingredienti', 'Bahan', 'Інгредієнти', 'सामग्री'], 'Ingredient': ['Ingrediente', 'Bahan', 'Інгредієнт', 'सामग्री'],
  'Classes': ['Corsi', 'Kelas', 'Заняття', 'क्लास'], 'Class': ['Corso', 'Kelas', 'Заняття', 'क्लास'],
  'Sessions': ['Sessioni', 'Sesi', 'Сеанси', 'सेशन'], 'Session': ['Sessione', 'Sesi', 'Сеанс', 'सेशन'],
  'Clients': ['Clienti', 'Klien', 'Клієнти', 'क्लाइंट'], 'Client': ['Cliente', 'Klien', 'Клієнт', 'क्लाइंट'],
  'Equipment': ['Attrezzatura', 'Peralatan', 'Обладнання', 'उपकरण'],
  'Lessons': ['Lezioni', 'Les', 'Уроки', 'पाठ'], 'Lesson': ['Lezione', 'Les', 'Урок', 'पाठ'],
  'Bookings': ['Prenotazioni', 'Pemesanan', 'Записи', 'बुकिंग'], 'Booking': ['Prenotazione', 'Pemesanan', 'Запис', 'बुकिंग'],
  'Students': ['Studenti', 'Murid', 'Учні', 'छात्र'], 'Student': ['Studente', 'Murid', 'Учень', 'छात्र'],
  'Materials': ['Materiali', 'Bahan', 'Матеріали', 'सामग्री'], 'Material': ['Materiale', 'Bahan', 'Матеріал', 'सामग्री'],
  'Menu items': ['Piatti', 'Menu', 'Страви', 'व्यंजन'], 'Menu item': ['Piatto', 'Menu', 'Страва', 'व्यंजन'],
  'Packages': ['Pacchetti', 'Paket', 'Пакети', 'पैकेज'], 'Package': ['Pacchetto', 'Paket', 'Пакет', 'पैकेज'],
  'Events': ['Eventi', 'Acara', 'Заходи', 'इवेंट'], 'Event': ['Evento', 'Acara', 'Захід', 'इवेंट'],
  'Shoots': ['Servizi fotografici', 'Sesi foto', 'Зйомки', 'शूट'], 'Shoot': ['Servizio fotografico', 'Sesi foto', 'Зйомка', 'शूट'],
  'Gear': ['Attrezzatura', 'Peralatan', 'Техніка', 'उपकरण'],
  'Pieces': ['Opere', 'Karya', 'Роботи', 'कृतियाँ'], 'Piece': ['Opera', 'Karya', 'Робота', 'कृति'],
  'Commissions': ['Commissioni', 'Pesanan karya', 'Замовлення', 'कमीशन'], 'Commission': ['Commissione', 'Pesanan karya', 'Замовлення', 'कमीशन'],
  'Art supplies': ['Materiale artistico', 'Alat seni', 'Художні матеріали', 'कला सामग्री'], 'Art supply': ['Materiale artistico', 'Alat seni', 'Художній матеріал', 'कला सामग्री'],
  'Products': ['Prodotti', 'Produk', 'Товари', 'प्रोडक्ट'], 'Product': ['Prodotto', 'Produk', 'Товар', 'प्रोडक्ट'],
  'Supplies': ['Forniture', 'Perlengkapan', 'Витратні матеріали', 'सामान'], 'Supply': ['Fornitura', 'Perlengkapan', 'Витратний матеріал', 'सामान'],
  'Services': ['Servizi', 'Layanan', 'Послуги', 'सेवाएँ'], 'Service': ['Servizio', 'Layanan', 'Послуга', 'सेवा'],
  'Appointments': ['Appuntamenti', 'Janji temu', 'Записи', 'अपॉइंटमेंट'], 'Appointment': ['Appuntamento', 'Janji temu', 'Запис', 'अपॉइंटमेंट'],
  'Pet owners': ['Proprietari', 'Pemilik hewan', 'Власники тварин', 'पालतू के मालिक'], 'Pet owner': ['Proprietario', 'Pemilik hewan', 'Власник тварини', 'पालतू का मालिक'],
  'Jobs': ['Lavori', 'Pekerjaan', 'Замовлення', 'काम'], 'Job': ['Lavoro', 'Pekerjaan', 'Замовлення', 'काम'],
};
Object.keys(OWN_WORDS_MORE2).forEach(function (k) { OWN_WORDS[k] = OWN_WORDS[k].concat(OWN_WORDS_MORE2[k]); });
const OWN_WORD_LANGS = ['es', 'fr', 'zh', 'vi', 'ko', 'tl', 'ru', 'ja', 'pt', 'de', 'it', 'id', 'uk', 'hi'];
function translateWord(word) {
  const at = OWN_WORD_LANGS.indexOf(appLanguage);
  if (at === -1) return word;
  if (OWN_WORDS[word]) return OWN_WORDS[word][at];
  const cap = word.charAt(0).toUpperCase() + word.slice(1);
  if (OWN_WORDS[cap]) return OWN_WORDS[cap][at].toLowerCase();
  return word;
}

// Month and day names, so whole dates can be kept as they are.
// English is always included (the app is written in English), plus the language that's picked.
const DATE_WORDS = {
  en: 'January|February|March|April|May|June|July|August|September|October|November|December|' +
    'Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec|' +
    'Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sun|Mon|Tue|Wed|Thu|Fri|Sat',
  es: 'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre|' +
    'ene|feb|mar|abr|jun|jul|ago|sept|sep|oct|nov|dic|domingo|lunes|martes|miércoles|jueves|viernes|sábado|dom|lun|mié|jue|vie|sáb',
  fr: 'janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|' +
    'janv|févr|avr|juil|sept|oct|nov|déc|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|lun|mar|mer|jeu|ven|sam|dim',
  vi: 'Thứ (?:Hai|Ba|Tư|Năm|Sáu|Bảy|\\d)|Chủ Nhật|thg|[Tt]háng',
  tl: 'Enero|Pebrero|Marso|Abril|Mayo|Hunyo|Hulyo|Agosto|Setyembre|Oktubre|Nobyembre|Disyembre|' +
    'Ene|Peb|Mar|Abr|Hun|Hul|Ago|Set|Okt|Nob|Dis|Linggo|Lunes|Martes|Miyerkules|Huwebes|Biyernes|Sabado|Lin|Lun|Miy|Huw|Biy|Sab',
  ru: 'январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь|' +
    'января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря|' +
    'янв|февр|мар|апр|июн|июл|авг|сент|окт|нояб|дек|понедельник|вторник|среда|четверг|пятница|суббота|воскресенье|пн|вт|ср|чт|пт|сб|вс',
  pt: 'janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|' +
    'jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|domingo|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado|dom|seg|ter|qua|qui|sex|sáb',
  de: 'Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|' +
    'Jan|Feb|Mär|Apr|Jun|Jul|Aug|Sept|Sep|Okt|Nov|Dez|Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag|Mo|Di|Mi|Do|Fr|Sa|So',
  it: 'gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|' +
    'gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic|lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica|lun|mer|gio|ven|sab|dom',
  id: 'Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|' +
    'Jan|Feb|Mar|Apr|Jun|Jul|Agu|Sep|Okt|Nov|Des|Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu|Sen|Sel|Rab|Kam|Jum|Sab|Min',
  uk: 'січень|лютий|березень|квітень|травень|червень|липень|серпень|вересень|жовтень|листопад|грудень|' +
    'січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня|' +
    'січ|лют|бер|квіт|трав|черв|лип|серп|вер|жовт|лист|груд|понеділок|вівторок|середа|четвер|пʼятниця|п\'ятниця|субота|неділя|пн|вт|ср|чт|пт|сб|нд',
  hi: 'जनवरी|फ़रवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्तूबर|अक्टूबर|नवंबर|दिसंबर|' +
    'जन॰|फ़र॰|जुल॰|अग॰|सित॰|अक्तू॰|नव॰|दिस॰|रविवार|सोमवार|मंगलवार|बुधवार|गुरुवार|शुक्रवार|शनिवार|रवि|सोम|मंगल|बुध|गुरु|शुक्र|शनि',
};
const dateRegexCache = {};
function dateRegexes() {
  if (dateRegexCache[appLanguage]) return dateRegexCache[appLanguage];
  const names = '(?:' + [DATE_WORDS.en, DATE_WORDS[appLanguage]].filter(Boolean).join('|') + ')';
  const part = '(?:' + names + '\\.?|\\d{1,4}|de|del|năm|г\\.?|р\\.?)';
  dateRegexCache[appLanguage] = {
    run: new RegExp('(?<![\\p{L}\\p{M}\\d])' + part + '(?:[\\s,.]+' + part + ')*(?![\\p{L}\\p{M}])', 'gu'),
    has: new RegExp('(?<![\\p{L}\\p{M}])' + names + '(?![\\p{L}\\p{M}])', 'u'),
  };
  return dateRegexCache[appLanguage];
}
// Chinese, Japanese and Korean dates: 11月18日周三, 11月18日(水), 2026年11月, 11월 18일 (수)
const CJK_DATE = /(?:\d{4}\s*[年년]\s*)?\d{1,2}\s*[月월](?:\s*\d{1,2}\s*[日일])?(?:\s*\(?(?:周[一二三四五六日]|星期[一二三四五六日天]|[月火水木金土日](?:曜日)?|[월화수목금토일](?:요일)?)\)?)?|[一二三四五六七八九十]+月|星期[一二三四五六日天]|周[一二三四五六日]|[月火水木金土日]曜日/g;

function escapeRegex(text) { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Turns "3 things planned this week" into "{n} things planned this week", keeping the 3
function textKey(text) {
  let key = text.replace(/\s+/g, ' ').trim();
  const values = [];
  // The business name
  if (profile.businessName && profile.businessName.length > 1) {
    key = key.split(profile.businessName).join('{B}');
  }
  // The business's own words, longest first
  const w = words();
  const list = [];
  [['P', w.products], ['O', w.orders], ['C', w.customers], ['S', w.supplies]].forEach(function (pair) {
    const many = pair[1] || '';
    const one = singular(many);
    list.push([many, '{' + pair[0] + '}'], [many.toLowerCase(), '{' + pair[0].toLowerCase() + '}'],
      [one, '{' + pair[0] + 'a}'], [one.toLowerCase(), '{' + pair[0].toLowerCase() + 'a}']);
  });
  list.sort(function (a, b) { return b[0].length - a[0].length; }).forEach(function (pair) {
    if (pair[0].length < 2) return;
    key = key.replace(new RegExp('(?<![\\w{])' + escapeRegex(pair[0]) + '(?![\\w}])', 'g'), pair[1]);
  });
  // Dates (whole runs like "Tue, Nov 17" or "17 de noviembre")
  const dates = dateRegexes();
  key = key.replace(dates.run, function (run) {
    if (!dates.has.test(run)) return run;
    values.push(['d', run]);
    return '{d}';
  });
  key = key.replace(CJK_DATE, function (run) { values.push(['d', run]); return '{d}'; });
  // Times like 3:30 PM, 14 h 00, 오후 2:00, 14:00
  key = key.replace(/(?:(?:오전|오후|上午|下午)\s?)?\b\d{1,2}(?::\d{2}|\s?h\s?\d{2})(?:\s?(?:AM|PM|a\. ?m\.|p\. ?m\.|SA|CH))?/gi, function (t) { values.push(['t', t]); return '{t}'; });
  if (appLanguage === 'id') key = key.replace(/(?<![\d$.])\b\d{1,2}\.\d{2}\b(?!\d)/g, function (t) { values.push(['t', t]); return '{t}'; });
  // Money, then other numbers
  key = key.replace(/-?\$\d[\d,]*(?:\.\d+)?/g, function (m) { values.push(['m', m]); return '{m}'; });
  key = key.replace(/(?<![{\w])\d+(?:[.,]\d+)*%?/g, function (n) { values.push(['n', n]); return '{n}'; });
  return { key: key, values: values };
}

// Puts the kept values back into the translated text
function fillKey(template, values) {
  const queues = { d: [], t: [], m: [], n: [] };
  values.forEach(function (v) { queues[v[0]].push(v[1]); });
  const w = words();
  const own = {
    P: w.products, O: w.orders, C: w.customers, S: w.supplies,
  };
  return template
    .replace(/\{([dtmn])\}/g, function (all, kind) { return queues[kind].length ? queues[kind].shift() : ''; })
    .replace(/\{B\}/g, profile.businessName || '')
    .replace(/\{([POCSpocs])(a?)\}/g, function (all, letter, one) {
      let word = own[letter.toUpperCase()] || '';
      if (one) word = singular(word);
      word = translateWord(word);
      return letter === letter.toLowerCase() ? word.toLowerCase() : word;
    });
}

// A few newer labels, in every language (same order as OWN_WORD_LANGS)
const EXTRA_TEXT = {
  'Country': ['País', 'Pays', '国家', 'Quốc gia', '나라', 'Bansa', 'Страна', '国', 'País', 'Land', 'Paese', 'Negara', 'Країна', 'देश'],
  'Words': ['Palabras', 'Mots', '用词', 'Từ ngữ', '단어', 'Mga salita', 'Слова', '言葉', 'Palavras', 'Wörter', 'Parole', 'Kata-kata', 'Слова', 'शब्द'],
  // Sticky notes: checklists, pins, search
  "Make it a checklist": ["Convertir en lista", "Transformer en liste", "改成清单", "Chuyển thành danh sách", "체크리스트로 바꾸기", "Gawing checklist", "Сделать списком", "チェックリストにする", "Transformar em lista", "Als Checkliste", "Trasforma in lista", "Jadikan daftar centang", "Зробити списком", "चेकलिस्ट बनाएँ"],
  "Make it plain text": ["Convertir en texto", "Transformer en texte", "改成普通文字", "Chuyển thành văn bản", "일반 메모로 바꾸기", "Gawing simpleng text", "Сделать текстом", "普通のメモにする", "Transformar em texto", "Als normaler Text", "Trasforma in testo", "Jadikan teks biasa", "Зробити текстом", "सादा टेक्स्ट बनाएँ"],
  "Make it a to-do": ["Convertir en pendiente", "Transformer en tâche", "加入待办事项", "Chuyển thành việc cần làm", "할 일로 만들기", "Gawing gagawin", "Сделать делом", "やることにする", "Transformar em tarefa", "Als Aufgabe", "Trasforma in attività", "Jadikan tugas", "Зробити справою", "काम बनाएँ"],
  "Pin to top": ["Fijar arriba", "Épingler en haut", "置顶", "Ghim lên đầu", "맨 위에 고정", "I-pin sa itaas", "Закрепить сверху", "上に固定", "Fixar no topo", "Oben anheften", "Fissa in alto", "Sematkan di atas", "Закріпити вгорі", "ऊपर पिन करें"],
  "Unpin": ["Desfijar", "Désépingler", "取消置顶", "Bỏ ghim", "고정 해제", "I-unpin", "Открепить", "固定を外す", "Desafixar", "Lösen", "Sblocca", "Lepas sematan", "Відкріпити", "पिन हटाएँ"],
  "Add an item": ["Agregar un elemento", "Ajouter un élément", "添加一项", "Thêm một mục", "항목 추가", "Magdagdag ng item", "Добавить пункт", "項目を追加", "Adicionar item", "Punkt hinzufügen", "Aggiungi un elemento", "Tambah item", "Додати пункт", "आइटम जोड़ें"],
  "List item": ["Elemento", "Élément", "清单项", "Mục", "항목", "Item", "Пункт", "項目", "Item", "Punkt", "Elemento", "Item", "Пункт", "आइटम"],
  "Search notes": ["Buscar notas", "Chercher des notes", "搜索便利贴", "Tìm ghi chú", "메모 검색", "Hanapin ang notes", "Искать стикеры", "付箋を検索", "Buscar notas", "Notizen suchen", "Cerca post-it", "Cari catatan", "Шукати стікери", "नोट खोजें"],
  "No notes match your search.": ["Ninguna nota coincide con tu búsqueda.", "Aucune note ne correspond.", "没有符合的便利贴。", "Không có ghi chú phù hợp.", "검색과 맞는 메모가 없어요.", "Walang note na tugma.", "Ничего не найдено.", "一致する付箋はありません。", "Nenhuma nota encontrada.", "Keine passenden Notizen.", "Nessun post-it trovato.", "Tidak ada catatan yang cocok.", "Нічого не знайдено.", "कोई मेल खाता नोट नहीं।"],
  "Added to your To-do list": ["Agregado a tus pendientes", "Ajouté à ta liste de tâches", "已加入待办事项", "Đã thêm vào việc cần làm", "할 일에 추가했어요", "Naidagdag sa mga gagawin", "Добавлено в список дел", "やることリストに追加しました", "Adicionado às tarefas", "Zur To-do-Liste hinzugefügt", "Aggiunto alle cose da fare", "Ditambahkan ke daftar tugas", "Додано до списку справ", "काम की सूची में जोड़ा गया"],
  // Country names and holidays
  "Brazil": ["Brasil", "Brésil", "巴西", "Brazil", "브라질", "Brazil", "Бразилия", "ブラジル", "Brasil", "Brasilien", "Brasile", "Brasil", "Бразилія", "ब्राज़ील"],
  "China": ["China", "Chine", "中国", "Trung Quốc", "중국", "China", "Китай", "中国", "China", "China", "Cina", "Tiongkok", "Китай", "चीन"],
  "France": ["Francia", "France", "法国", "Pháp", "프랑스", "France", "Франция", "フランス", "França", "Frankreich", "Francia", "Prancis", "Франція", "फ़्रांस"],
  "Germany": ["Alemania", "Allemagne", "德国", "Đức", "독일", "Germany", "Германия", "ドイツ", "Alemanha", "Deutschland", "Germania", "Jerman", "Німеччина", "जर्मनी"],
  "India": ["India", "Inde", "印度", "Ấn Độ", "인도", "India", "Индия", "インド", "Índia", "Indien", "India", "India", "Індія", "भारत"],
  "Indonesia": ["Indonesia", "Indonésie", "印度尼西亚", "Indonesia", "인도네시아", "Indonesia", "Индонезия", "インドネシア", "Indonésia", "Indonesien", "Indonesia", "Indonesia", "Індонезія", "इंडोनेशिया"],
  "Italy": ["Italia", "Italie", "意大利", "Ý", "이탈리아", "Italya", "Италия", "イタリア", "Itália", "Italien", "Italia", "Italia", "Італія", "इटली"],
  "Japan": ["Japón", "Japon", "日本", "Nhật Bản", "일본", "Japan", "Япония", "日本", "Japão", "Japan", "Giappone", "Jepang", "Японія", "जापान"],
  "Philippines": ["Filipinas", "Philippines", "菲律宾", "Philippines", "필리핀", "Pilipinas", "Филиппины", "フィリピン", "Filipinas", "Philippinen", "Filippine", "Filipina", "Філіппіни", "फ़िलीपींस"],
  "Portugal": ["Portugal", "Portugal", "葡萄牙", "Bồ Đào Nha", "포르투갈", "Portugal", "Португалия", "ポルトガル", "Portugal", "Portugal", "Portogallo", "Portugal", "Португалія", "पुर्तगाल"],
  "South Korea": ["Corea del Sur", "Corée du Sud", "韩国", "Hàn Quốc", "대한민국", "South Korea", "Южная Корея", "韓国", "Coreia do Sul", "Südkorea", "Corea del Sud", "Korea Selatan", "Південна Корея", "दक्षिण कोरिया"],
  "Spain": ["España", "Espagne", "西班牙", "Tây Ban Nha", "스페인", "Espanya", "Испания", "スペイン", "Espanha", "Spanien", "Spagna", "Spanyol", "Іспанія", "स्पेन"],
  "Ukraine": ["Ucrania", "Ukraine", "乌克兰", "Ukraina", "우크라이나", "Ukraine", "Украина", "ウクライナ", "Ucrânia", "Ukraine", "Ucraina", "Ukraina", "Україна", "यूक्रेन"],
  "Vietnam": ["Vietnam", "Viêt Nam", "越南", "Việt Nam", "베트남", "Vietnam", "Вьетнам", "ベトナム", "Vietnã", "Vietnam", "Vietnam", "Vietnam", "В'єтнам", "वियतनाम"],
  "Carnival": ["Carnaval", "Carnaval", "狂欢节", "Lễ hội Carnival", "카니발", "Karnabal", "Карнавал", "カーニバル", "Carnaval", "Karneval", "Carnevale", "Karnaval", "Карнавал", "कार्निवल"],
  "Tiradentes Day": ["Día de Tiradentes", "Jour de Tiradentes", "蒂拉登特斯日", "Ngày Tiradentes", "치라덴치스의 날", "Araw ni Tiradentes", "День Тирадентиса", "ティラデンテスの日", "Tiradentes", "Tiradentes-Tag", "Giorno di Tiradentes", "Hari Tiradentes", "День Тірадентіса", "तिराडेंटेस दिवस"],
  "Corpus Christi": ["Corpus Christi", "Fête-Dieu", "基督圣体节", "Lễ Mình Máu Thánh Chúa", "성체 성혈 대축일", "Corpus Christi", "Праздник Тела Христова", "聖体の祝日", "Corpus Christi", "Fronleichnam", "Corpus Domini", "Hari Raya Tubuh Kristus", "Свято Тіла Христового", "कॉर्पस क्रिस्टी"],
  "All Souls' Day": ["Día de los Fieles Difuntos", "Jour des Morts", "万灵节", "Lễ Các Đẳng", "위령의 날", "Araw ng mga Kaluluwa", "День поминовения усопших", "死者の日", "Finados", "Allerseelen", "Commemorazione dei defunti", "Hari Arwah", "День поминання померлих", "ऑल सोल्स डे"],
  "Republic Day": ["Día de la República", "Fête de la République", "共和国日", "Ngày Cộng hòa", "공화국의 날", "Araw ng Republika", "День Республики", "共和国記念日", "Proclamação da República", "Tag der Republik", "Festa della Repubblica", "Hari Republik", "День Республіки", "गणतंत्र दिवस"],
  "Black Consciousness Day": ["Día de la Conciencia Negra", "Journée de la conscience noire", "黑人觉醒日", "Ngày Ý thức Người da đen", "흑인 의식의 날", "Araw ng Kamalayang Itim", "День чёрного самосознания", "黒人意識の日", "Dia da Consciência Negra", "Tag des schwarzen Bewusstseins", "Giornata della coscienza nera", "Hari Kesadaran Kulit Hitam", "День чорної свідомості", "ब्लैक कॉन्शसनेस डे"],
  "Lunar New Year": ["Año Nuevo Lunar", "Nouvel An lunaire", "春节", "Tết Nguyên Đán", "설날", "Bagong Taon ng Tsino", "Лунный Новый год", "旧正月", "Ano-Novo Lunar", "Mondneujahr", "Capodanno lunare", "Tahun Baru Imlek", "Місячний Новий рік", "चंद्र नव वर्ष"],
  "Mid-Autumn Festival": ["Festival del Medio Otoño", "Fête de la mi-automne", "中秋节", "Tết Trung Thu", "추석", "Mid-Autumn Festival", "Праздник середины осени", "中秋節", "Festival do Meio do Outono", "Mondfest", "Festa di metà autunno", "Festival Pertengahan Musim Gugur", "Свято середини осені", "मध्य-शरद उत्सव"],
  "National Day": ["Día Nacional", "Fête nationale", "国庆节", "Quốc khánh", "국경일", "Pambansang Araw", "Национальный день", "ナショナルデー", "Dia Nacional", "Nationalfeiertag", "Festa nazionale", "Hari Nasional", "Національний день", "राष्ट्रीय दिवस"],
  "Victory Day": ["Día de la Victoria", "Fête de la Victoire", "胜利日", "Ngày Chiến thắng", "승전 기념일", "Araw ng Tagumpay", "День Победы", "戦勝記念日", "Dia da Vitória", "Tag des Sieges", "Giorno della Vittoria", "Hari Kemenangan", "День Перемоги", "विजय दिवस"],
  "Ascension Day": ["Día de la Ascensión", "Ascension", "耶稣升天节", "Lễ Thăng Thiên", "예수 승천일", "Araw ng Pag-akyat", "Вознесение", "キリスト昇天祭", "Dia da Ascensão", "Christi Himmelfahrt", "Ascensione", "Kenaikan Isa Almasih", "Вознесіння", "स्वर्गारोहण दिवस"],
  "Whit Monday": ["Lunes de Pentecostés", "Lundi de Pentecôte", "圣灵降临节星期一", "Thứ Hai Lễ Ngũ Tuần", "성령 강림 월요일", "Lunes ng Pentekostes", "Духов день", "聖霊降臨祭の月曜日", "Segunda-feira de Pentecostes", "Pfingstmontag", "Lunedì di Pentecoste", "Senin Pentakosta", "Духів день", "पेंटेकोस्ट सोमवार"],
  "Bastille Day": ["Día de la Bastilla", "Fête nationale", "法国国庆日", "Ngày Bastille", "바스티유의 날", "Araw ng Bastille", "День взятия Бастилии", "パリ祭", "Dia da Bastilha", "Französischer Nationalfeiertag", "Presa della Bastiglia", "Hari Bastille", "День взяття Бастилії", "बैस्टिल दिवस"],
  "Assumption Day": ["Asunción", "Assomption", "圣母升天节", "Lễ Đức Mẹ Lên Trời", "성모 승천 대축일", "Pag-akyat ni Maria", "Успение Богородицы", "聖母被昇天祭", "Assunção de Nossa Senhora", "Mariä Himmelfahrt", "Ferragosto", "Maria Diangkat ke Surga", "Успіння Богородиці", "असम्प्शन दिवस"],
  "All Saints' Day": ["Día de Todos los Santos", "Toussaint", "诸圣节", "Lễ Các Thánh", "모든 성인의 날", "Araw ng mga Santo", "День всех святых", "諸聖人の日", "Dia de Todos os Santos", "Allerheiligen", "Ognissanti", "Hari Semua Orang Kudus", "День усіх святих", "ऑल सेंट्स डे"],
  "Armistice Day": ["Día del Armisticio", "Armistice", "停战纪念日", "Ngày Đình chiến", "휴전 기념일", "Araw ng Armistice", "День перемирия", "休戦記念日", "Dia do Armistício", "Waffenstillstandstag", "Giorno dell'Armistizio", "Hari Gencatan Senjata", "День перемир'я", "युद्धविराम दिवस"],
  "German Unity Day": ["Día de la Unidad Alemana", "Jour de l'unité allemande", "德国统一日", "Ngày Thống nhất Đức", "독일 통일의 날", "Araw ng Pagkakaisa ng Germany", "День германского единства", "ドイツ統一の日", "Dia da Unidade Alemã", "Tag der Deutschen Einheit", "Giorno dell'unità tedesca", "Hari Persatuan Jerman", "День німецької єдності", "जर्मन एकता दिवस"],
  "Holi": ["Holi", "Holi", "洒红节", "Lễ hội Holi", "홀리", "Holi", "Холи", "ホーリー祭", "Holi", "Holi", "Holi", "Holi", "Холі", "होली"],
  "Gandhi Jayanti": ["Gandhi Jayanti", "Gandhi Jayanti", "甘地诞辰", "Ngày sinh Gandhi", "간디 탄신일", "Gandhi Jayanti", "День рождения Ганди", "ガンジー生誕記念日", "Gandhi Jayanti", "Gandhi Jayanti", "Gandhi Jayanti", "Gandhi Jayanti", "День народження Ганді", "गांधी जयंती"],
  "Diwali": ["Diwali", "Diwali", "排灯节", "Lễ hội Diwali", "디왈리", "Diwali", "Дивали", "ディワリ", "Diwali", "Diwali", "Diwali", "Diwali", "Дівалі", "दिवाली"],
  "Pancasila Day": ["Día de Pancasila", "Jour de la Pancasila", "建国五项原则日", "Ngày Pancasila", "판차실라의 날", "Araw ng Pancasila", "День Панчасила", "パンチャシラの日", "Dia da Pancasila", "Pancasila-Tag", "Giorno della Pancasila", "Hari Lahir Pancasila", "День Панчасила", "पंचशील दिवस"],
  "Liberation Day": ["Día de la Liberación", "Fête de la Libération", "解放日", "Ngày Giải phóng", "광복절", "Araw ng Paglaya", "День освобождения", "解放記念日", "Dia da Libertação", "Tag der Befreiung", "Festa della Liberazione", "Hari Pembebasan", "День визволення", "मुक्ति दिवस"],
  "Immaculate Conception": ["Inmaculada Concepción", "Immaculée Conception", "圣母无染原罪节", "Lễ Đức Mẹ Vô Nhiễm", "무염시태 대축일", "Kalinis-linisang Paglilihi", "Непорочное зачатие", "無原罪の御宿り", "Imaculada Conceição", "Mariä Empfängnis", "Immacolata Concezione", "Maria Dikandung Tanpa Noda", "Непорочне зачаття", "निष्कलंक गर्भधारण दिवस"],
  "Coming of Age Day": ["Día de la Mayoría de Edad", "Fête de la majorité", "成人节", "Ngày Thành niên", "성년의 날", "Araw ng Pagtanda", "День совершеннолетия", "成人の日", "Dia da Maioridade", "Tag der Volljährigkeit", "Giorno della maggiore età", "Hari Kedewasaan", "День повноліття", "वयस्कता दिवस"],
  "National Foundation Day": ["Día de la Fundación Nacional", "Fête de la fondation nationale", "建国纪念日", "Ngày Lập quốc", "개천절", "Araw ng Pagkakatatag", "День основания государства", "建国記念の日", "Dia da Fundação Nacional", "Staatsgründungstag", "Giorno della fondazione nazionale", "Hari Berdirinya Negara", "День заснування держави", "राष्ट्रीय स्थापना दिवस"],
  "Emperor's Birthday": ["Cumpleaños del Emperador", "Anniversaire de l'Empereur", "天皇诞辰", "Sinh nhật Thiên hoàng", "일왕 탄생일", "Kaarawan ng Emperador", "День рождения императора", "天皇誕生日", "Aniversário do Imperador", "Geburtstag des Kaisers", "Compleanno dell'Imperatore", "Hari Ulang Tahun Kaisar", "День народження імператора", "सम्राट का जन्मदिन"],
  "Culture Day": ["Día de la Cultura", "Fête de la culture", "文化日", "Ngày Văn hóa", "문화의 날", "Araw ng Kultura", "День культуры", "文化の日", "Dia da Cultura", "Tag der Kultur", "Giornata della cultura", "Hari Kebudayaan", "День культури", "संस्कृति दिवस"],
  "Labor Thanksgiving Day": ["Día de Acción de Gracias por el Trabajo", "Fête du travail et de la gratitude", "勤劳感谢日", "Ngày Cảm tạ Lao động", "근로감사의 날", "Araw ng Pasasalamat sa Paggawa", "День благодарности труду", "勤労感謝の日", "Dia de Ação de Graças pelo Trabalho", "Tag des Dankes für die Arbeit", "Giorno del ringraziamento per il lavoro", "Hari Syukur Pekerja", "День подяки праці", "श्रम धन्यवाद दिवस"],
  "Independence Movement Day": ["Día del Movimiento de Independencia", "Jour du mouvement d'indépendance", "三一节", "Ngày Phong trào Độc lập", "삼일절", "Araw ng Kilusan ng Kalayaan", "День движения за независимость", "三・一節", "Dia do Movimento de Independência", "Tag der Unabhängigkeitsbewegung", "Giorno del movimento per l'indipendenza", "Hari Gerakan Kemerdekaan", "День руху за незалежність", "स्वतंत्रता आंदोलन दिवस"],
  "Hangul Day": ["Día del Hangul", "Jour du hangeul", "韩文日", "Ngày Hangul", "한글날", "Araw ng Hangul", "День хангыля", "ハングルの日", "Dia do Hangul", "Hangeul-Tag", "Giorno dell'hangul", "Hari Hangul", "День хангиля", "हंगुल दिवस"],
  "Day of Valor": ["Día del Valor", "Jour de la Bravoure", "英勇日", "Ngày Dũng cảm", "용맹의 날", "Araw ng Kagitingan", "День доблести", "勇者の日", "Dia do Valor", "Tag der Tapferkeit", "Giorno del Valore", "Hari Keberanian", "День звитяги", "शौर्य दिवस"],
  "National Heroes Day": ["Día de los Héroes Nacionales", "Journée des héros nationaux", "民族英雄日", "Ngày Anh hùng Dân tộc", "국가 영웅의 날", "Araw ng mga Bayani", "День национальных героев", "国民英雄の日", "Dia dos Heróis Nacionais", "Tag der Nationalhelden", "Giornata degli eroi nazionali", "Hari Pahlawan Nasional", "День національних героїв", "राष्ट्रीय नायक दिवस"],
  "Bonifacio Day": ["Día de Bonifacio", "Jour de Bonifacio", "博尼法西奥日", "Ngày Bonifacio", "보니파시오의 날", "Araw ni Bonifacio", "День Бонифасио", "ボニファシオの日", "Dia de Bonifacio", "Bonifacio-Tag", "Giorno di Bonifacio", "Hari Bonifacio", "День Боніфасіо", "बोनिफ़ासियो दिवस"],
  "Rizal Day": ["Día de Rizal", "Jour de Rizal", "黎刹日", "Ngày Rizal", "리살의 날", "Araw ni Rizal", "День Рисаля", "リサールの日", "Dia de Rizal", "Rizal-Tag", "Giorno di Rizal", "Hari Rizal", "День Ризаля", "रिज़ाल दिवस"],
  "Freedom Day": ["Día de la Libertad", "Jour de la Liberté", "自由日", "Ngày Tự do", "자유의 날", "Araw ng Kalayaan", "День свободы", "自由の日", "Dia da Liberdade", "Tag der Freiheit", "Giorno della Libertà", "Hari Kebebasan", "День свободи", "स्वतंत्रता दिवस"],
  "Portugal Day": ["Día de Portugal", "Jour du Portugal", "葡萄牙日", "Ngày Bồ Đào Nha", "포르투갈의 날", "Araw ng Portugal", "День Португалии", "ポルトガルの日", "Dia de Portugal", "Tag Portugals", "Giorno del Portogallo", "Hari Portugal", "День Португалії", "पुर्तगाल दिवस"],
  "Restoration of Independence": ["Restauración de la Independencia", "Restauration de l'indépendance", "恢复独立日", "Ngày Khôi phục Độc lập", "독립 회복의 날", "Pagbabalik ng Kalayaan", "День восстановления независимости", "独立回復記念日", "Restauração da Independência", "Wiederherstellung der Unabhängigkeit", "Restaurazione dell'indipendenza", "Pemulihan Kemerdekaan", "День відновлення незалежності", "स्वतंत्रता पुनर्स्थापना दिवस"],
  "Women's Day": ["Día de la Mujer", "Journée des femmes", "妇女节", "Ngày Quốc tế Phụ nữ", "여성의 날", "Araw ng Kababaihan", "Международный женский день", "国際女性デー", "Dia da Mulher", "Frauentag", "Festa della donna", "Hari Perempuan", "Міжнародний жіночий день", "महिला दिवस"],
  "Defenders Day": ["Día de los Defensores", "Jour des défenseurs", "保卫者日", "Ngày Những người Bảo vệ", "수호자의 날", "Araw ng mga Tagapagtanggol", "День защитников", "防衛者の日", "Dia dos Defensores", "Tag der Verteidiger", "Giorno dei Difensori", "Hari Para Pembela", "День захисників і захисниць", "रक्षक दिवस"],
  "Reunification Day": ["Día de la Reunificación", "Jour de la réunification", "统一日", "Ngày Thống nhất", "통일의 날", "Araw ng Muling Pagkakaisa", "День объединения", "統一記念日", "Dia da Reunificação", "Tag der Wiedervereinigung", "Giorno della Riunificazione", "Hari Reunifikasi", "День возз'єднання", "पुनर्एकीकरण दिवस"],
  "Orthodox Easter": ["Pascua ortodoxa", "Pâques orthodoxe", "东正教复活节", "Lễ Phục sinh Chính thống", "정교회 부활절", "Pasko ng Pagkabuhay (Ortodokso)", "Православная Пасха", "正教会の復活祭", "Páscoa Ortodoxa", "Orthodoxes Ostern", "Pasqua ortodossa", "Paskah Ortodoks", "Великдень", "ईस्टर (ऑर्थोडॉक्स)"],
};

function translateText(text) {
  if (appLanguage === 'en' || !text || !/[A-Za-z]/.test(text)) return null;
  const data = languageData();
  if (!data) return null;
  const dict = data.dict;
  const trimmed = text.trim();
  const extraAt = OWN_WORD_LANGS.indexOf(appLanguage);
  const known = function (t) {
    if (EXTRA_TEXT[t] && extraAt > -1) return EXTRA_TEXT[t][extraAt];
    if (Object.prototype.hasOwnProperty.call(dict, t)) return dict[t];
    return null;
  };
  if (known(trimmed) !== null) return text.replace(trimmed, known(trimmed));
  // Two holidays on one day: "Labor Day · Mother's Day"
  if (trimmed.indexOf(' · ') > 0) {
    const pieces = trimmed.split(' · ');
    if (pieces.every(function (piece) { return known(piece) !== null; })) return text.replace(trimmed, pieces.map(known).join(' · '));
  }
  if (Object.prototype.hasOwnProperty.call(dict, trimmed)) return text.replace(trimmed, dict[trimmed]);
  // "Friday, November 27, Black Friday": a date, then a holiday
  const lastComma = trimmed.lastIndexOf(', ');
  if (lastComma > 0) {
    const tail = trimmed.slice(lastComma + 2);
    const tailText = known(tail) !== null ? known(tail) : (tail.indexOf(' · ') > 0 && tail.split(' · ').every(function (piece) { return known(piece) !== null; }) ? tail.split(' · ').map(known).join(' · ') : null);
    if (tailText !== null && !/[A-Za-z]{3,}/.test(textKey(trimmed.slice(0, lastComma)).key.replace(/\{\w+\}/g, ''))) {
      return text.replace(tail, tailText);
    }
  }
  const k = textKey(trimmed);
  if (Object.prototype.hasOwnProperty.call(dict, k.key)) return text.replace(trimmed, fillKey(dict[k.key], k.values));
  // "Tuesday, Christmas" and lists like "Goal one, Goal two"
  const dated = k.key.match(/^\{d\}, (.+)$/);
  if (dated && Object.prototype.hasOwnProperty.call(dict, dated[1])) return text.replace(trimmed, fillKey('{d}, ' + dict[dated[1]], k.values));
  if (k.key.indexOf(', ') > 0 && k.values.length === 0) {
    const parts = k.key.split(', ');
    if (parts.every(function (part) { return /^\{[POCSpocs]a?\}$/.test(part) || Object.prototype.hasOwnProperty.call(dict, part); })) {
      return text.replace(trimmed, fillKey(parts.map(function (part) { return dict[part] || part; }).join(', '), []));
    }
  }
  // "Tutoring: Lessons, Sessions, Students" (a label, then a list)
  const labelled = k.key.match(/^([^:{}]+): (.+)$/);
  if (labelled && Object.prototype.hasOwnProperty.call(dict, labelled[1])) {
    const parts = labelled[2].split(', ');
    if (parts.every(function (part) { return /^\{[POCSpocs]a?\}$/.test(part) || Object.prototype.hasOwnProperty.call(dict, part); })) {
      return text.replace(trimmed, fillKey(dict[labelled[1]] + ': ' + parts.map(function (part) { return dict[part] || part; }).join(', '), k.values));
    }
  }
  // Sentences with names in them. Any part that has its own translation (like a theme name) is translated too.
  for (let i = 0; i < data.patterns.length; i++) {
    const rule = data.patterns[i];
    const found = k.key.match(rule[0]);
    if (!found) continue;
    const out = rule[1].replace(/\$(\d)/g, function (all, n) { return translatePiece(found[Number(n)] || '', dict); });
    return text.replace(trimmed, fillKey(out, k.values));
  }
  // A word on its own, like a business's own word in the menu
  if (/^[A-Z][a-z ]+$/.test(trimmed) && OWN_WORDS[trimmed]) return text.replace(trimmed, translateWord(trimmed));
  return null;
}

// The example details shown in Settings ("Add things like cake flavor"), in each language (same order as OWN_WORD_LANGS)
const EXAMPLE_WORDS = {
  'cake flavor': ['sabor del pastel', 'saveur du gâteau', '蛋糕口味', 'vị bánh', '케이크 맛', 'flavor ng cake', 'вкус торта', 'ケーキの味', 'sabor do bolo', 'Kuchengeschmack', 'gusto della torta', 'rasa kue', 'смак торта', 'केक का फ़्लेवर'],
  'number of people': ['número de personas', 'nombre de personnes', '人数', 'số người', '인원 수', 'bilang ng tao', 'число гостей', '人数', 'número de pessoas', 'Personenzahl', 'numero di persone', 'jumlah orang', 'кількість гостей', 'लोगों की संख्या'],
  'scent': ['aroma', 'parfum', '香味', 'mùi hương', '향', 'amoy', 'аромат', '香り', 'aroma', 'Duft', 'profumo', 'aroma', 'аромат', 'ख़ुशबू'],
  'size': ['tamaño', 'taille', '尺寸', 'kích cỡ', '크기', 'laki', 'размер', 'サイズ', 'tamanho', 'Größe', 'taglia', 'ukuran', 'розмір', 'साइज़'],
  'nail shape': ['forma de uñas', 'forme des ongles', '甲型', 'dáng móng', '네일 모양', 'hugis ng kuko', 'форма ногтей', '爪の形', 'formato da unha', 'Nagelform', 'forma delle unghie', 'bentuk kuku', 'форма нігтів', 'नाखून का आकार'],
  'hair length': ['largo del cabello', 'longueur des cheveux', '头发长度', 'độ dài tóc', '머리 길이', 'haba ng buhok', 'длина волос', '髪の長さ', 'comprimento do cabelo', 'Haarlänge', 'lunghezza dei capelli', 'panjang rambut', 'довжина волосся', 'बालों की लंबाई'],
  'lash style': ['estilo de pestañas', 'style de cils', '睫毛款式', 'kiểu mi', '속눈썹 스타일', 'istilo ng pilikmata', 'стиль ресниц', 'まつげのスタイル', 'estilo de cílios', 'Wimpernstil', 'stile delle ciglia', 'gaya bulu mata', 'стиль вій', 'पलकों का स्टाइल'],
  'subject': ['materia', 'matière', '科目', 'môn học', '과목', 'asignatura', 'предмет', '科目', 'matéria', 'Fach', 'materia', 'mata pelajaran', 'предмет', 'विषय'],
  'instrument': ['instrumento', 'instrument', '乐器', 'nhạc cụ', '악기', 'instrumento', 'инструмент', '楽器', 'instrumento', 'Instrument', 'strumento', 'alat musik', 'інструмент', 'वाद्य'],
  'goal': ['meta', 'objectif', '目标', 'mục tiêu', '목표', 'layunin', 'цель', '目標', 'meta', 'Ziel', 'obiettivo', 'target', 'мета', 'लक्ष्य'],
  'location': ['lugar', 'lieu', '地点', 'địa điểm', '장소', 'lugar', 'место', '場所', 'local', 'Ort', 'luogo', 'lokasi', 'місце', 'जगह'],
  'pet name': ['nombre de la mascota', "nom de l'animal", '宠物名字', 'tên thú cưng', '반려동물 이름', 'pangalan ng alaga', 'кличка питомца', 'ペットの名前', 'nome do pet', 'Name des Tiers', "nome dell'animale", 'nama hewan', 'кличка тварини', 'पालतू का नाम'],
  'number of rooms': ['número de cuartos', 'nombre de pièces', '房间数', 'số phòng', '방 개수', 'bilang ng kuwarto', 'число комнат', '部屋数', 'número de cômodos', 'Zimmeranzahl', 'numero di stanze', 'jumlah kamar', 'кількість кімнат', 'कमरों की संख्या'],
  'yard size': ['tamaño del jardín', 'taille du jardin', '院子大小', 'diện tích sân', '마당 크기', 'laki ng bakuran', 'размер двора', '庭の広さ', 'tamanho do quintal', 'Gartengröße', 'dimensione del giardino', 'luas halaman', 'розмір двору', 'आँगन का आकार'],
  'theme': ['tema', 'thème', '主题', 'chủ đề', '테마', 'tema', 'тема', 'テーマ', 'tema', 'Motto', 'tema', 'tema', 'тема', 'थीम'],
  'pickup or delivery': ['recoger o entregar', 'ramassage ou livraison', '自取还是送货', 'tự lấy hay giao hàng', '픽업 또는 배달', 'pickup o delivery', 'самовывоз или доставка', '受け取りか配達か', 'retirada ou entrega', 'Abholung oder Lieferung', 'ritiro o consegna', 'ambil sendiri atau diantar', 'самовивіз чи доставка', 'पिकअप या डिलीवरी'],
};

// A piece of a sentence: translated if it's a known word or phrase, otherwise kept as it is
function translatePiece(piece, dict) {
  const example = EXAMPLE_WORDS[piece.toLowerCase()];
  const at = OWN_WORD_LANGS.indexOf(appLanguage);
  if (example && at > -1) return example[at];
  if (Object.prototype.hasOwnProperty.call(dict, piece)) return dict[piece];
  const cap = piece.charAt(0).toUpperCase() + piece.slice(1);
  if (piece !== cap && Object.prototype.hasOwnProperty.call(dict, cap)) return dict[cap].toLowerCase();
  return piece;
}

const SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, OPTION: 0, CODE: 1 };
const TRANSLATE_ATTRS = ['placeholder', 'title', 'aria-label'];

function translateNode(node) {
  if (appLanguage === 'en') return;
  if (node.nodeType === 3) {
    const parent = node.parentNode;
    if (!parent || SKIP_TAGS[parent.nodeName] || (parent.closest && parent.closest('[data-own-words], .day-sticky'))) return;
    const out = translateText(node.nodeValue);
    if (out !== null && out !== node.nodeValue) node.nodeValue = out;
    return;
  }
  if (node.nodeType !== 1 || SKIP_TAGS[node.nodeName] === 1 && node.nodeName !== 'INPUT' && node.nodeName !== 'TEXTAREA') return;
  TRANSLATE_ATTRS.forEach(function (attr) {
    const value = node.getAttribute && node.getAttribute(attr);
    if (!value) return;
    const out = translateText(value);
    if (out !== null && out !== value) node.setAttribute(attr, out);
  });
  if (node.nodeName === 'INPUT' && (node.type === 'button' || node.type === 'submit') && node.value) {
    const out = translateText(node.value);
    if (out !== null) node.value = out;
  }
  if (SKIP_TAGS[node.nodeName] === 1) return;
  for (let child = node.firstChild; child; child = child.nextSibling) translateNode(child);
}

// Watch the page and translate anything new
const languageWatcher = new MutationObserver(function (changes) {
  if (appLanguage === 'en') return;
  changes.forEach(function (change) {
    if (change.type === 'characterData') translateNode(change.target);
    else if (change.type === 'attributes') translateNode(change.target);
    else change.addedNodes.forEach(translateNode);
  });
});
languageWatcher.observe(document.documentElement, {
  childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: TRANSLATE_ATTRS,
});

// The pages of Profile Setup
const SETUP_STEPS = ['Business type', 'Your business', 'Look', 'Goals'];

// The owner's business profile. Profile Setup fills this in.
const profile = {
  businessName: '',
  businessType: '',
  country: '',       // where they're based, for the holidays on the calendar
  otherType: '',     // what they typed for "Something else"
  customWords: { products: 'Products', orders: 'Orders', customers: 'Customers', supplies: 'Supplies' },
  theme: 'classic',
  customInk: '#2b2d42',  // colors for the "Custom" theme
  customSun: '#ef8354',
  font: 'friendly',
  changeWithTime: false,
  goals: [],         // ids from GOALS
  customGoal: '',    // their own reason, if they typed one
  photo: '',         // profile picture, saved as a small image
  details: [],       // extra details asked on every order, like "Cake flavor"
};

// True once the owner changes one of the custom words themselves,
// so we stop replacing their words with our guesses
let wordsEditedByOwner = false;

let setupStep = 0;
let currentSection = 'myday';
let editing = false;       // true when the owner is changing something from Settings
let editStep = null;       // which page they are changing (0 type, 1 name, 2 look, 3 goals)
let profileBeforeEdit = null; // a copy, so Cancel can undo their changes

// The box the setup pages draw into: the setup screen, or the edit page inside the app
function formArea() {
  return document.getElementById(editing ? 'edit-form' : 'setup-form');
}

// =========================================
// PROFILE PICTURE
// =========================================

// "Bakez & Cakez" -> "BC" (shown when there's no picture)
function initials() {
  const parts = profile.businessName.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map(function (part) { return part[0].toUpperCase(); });
  return letters.join('') || 'B';
}

// Makes a round picture. size is 'sm', 'md' or 'lg'.
function avatar(size) {
  const circle = document.createElement('span');
  circle.className = 'avatar avatar-' + size;
  if (profile.photo) {
    const img = document.createElement('img');
    img.src = profile.photo;
    img.alt = profile.businessName + ' picture';
    circle.appendChild(img);
  } else {
    circle.textContent = initials();
  }
  return circle;
}

// Opens the computer's file picker, shrinks the picture to a small square
// (so it saves quickly), then gives it to "done"
function pickPhoto(done) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', function () {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.onload = function () {
        // Crop the middle of the picture into a 256 x 256 square
        const size = 256;
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.getContext('2d').drawImage(
          img,
          (img.width - side) / 2, (img.height - side) / 2, side, side,
          0, 0, size, size
        );
        done(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
  input.click();
}

// =========================================
// SAVING
// The profile is saved in the browser (localStorage), so setup only
// happens once and the app remembers everything next time.
// =========================================
const SAVE_KEY = 'bizStudio.profile';

function saveProfile() {
  try {
    store.setItem(SAVE_KEY, JSON.stringify(profile));
    rememberBusiness();
  } catch (error) {
    // If the browser won't save, the app still works until it's closed
  }
}

// Returns true if a saved profile was found and loaded
function loadProfile() {
  try {
    const saved = JSON.parse(store.getItem(SAVE_KEY));
    if (saved && saved.businessName) {
      Object.assign(profile, saved);
      wordsEditedByOwner = true; // keep the words they saved
      return true;
    }
  } catch (error) {
    // Nothing saved, or it couldn't be read
  }
  return false;
}

function eraseProfile() {
  try {
    store.removeItem(SAVE_KEY);
    store.removeItem(ORDERS_KEY);
    store.removeItem('bizStudio.customers');
    store.removeItem('bizStudio.tasks');
    store.removeItem('bizStudio.products');
    store.removeItem('bizStudio.supplies');
    store.removeItem('bizStudio.shopping');
    store.removeItem('bizStudio.money');
    store.removeItem('bizStudio.formMatch');
    store.removeItem('bizStudio.events');
    store.removeItem('bizStudio.notes');
    businesses = businesses.filter(function (b) { return b.id !== currentBiz; });
    writeBusinesses(businesses);
    localStorage.setItem(BIZ_CURRENT_KEY, businesses.length ? businesses[0].id : '');
  } catch (error) {
    // nothing to erase
  }
}

// Draws the steps across the top and fills the progress bar
function showSetupSteps() {
  const list = document.getElementById('setup-steps');
  list.innerHTML = '';
  SETUP_STEPS.forEach(function (name, i) {
    const item = document.createElement('li');
    item.innerHTML = '<span class="step-num">' + (i + 1) + '</span><span></span>';
    item.lastChild.textContent = name;
    if (i === setupStep) item.className = 'current';
    if (i < setupStep) item.className = 'done';
    list.appendChild(item);
  });

  const percent = ((setupStep + 1) / SETUP_STEPS.length) * 100;
  document.getElementById('setup-progress').style.width = percent + '%';
}

// Shows whichever setup page we're on
function showSetup() {
  document.getElementById('app').hidden = true;
  document.getElementById('setup').hidden = false;
  showSetupLanguage();
  showSetupSteps();
  showSetupCancel();

  // The Look and Goals pages are wider, with the app preview on the right
  const showPreview = setupStep === 2 || setupStep === 3;
  document.getElementById('setup-body').classList.toggle('with-preview', showPreview);
  document.getElementById('look-preview').hidden = !showPreview;

  if (setupStep === 0) showTypePage();
  if (setupStep === 1) showNamePage();
  if (setupStep === 2) showLookPage();
  if (setupStep === 3) showGoalsPage();
}

// A language picker at the top of setup, so it can be changed from the very first page
function showSetupLanguage() {
  if (document.getElementById('setup-lang')) return;
  const wrap = document.createElement('div');
  wrap.className = 'setup-lang';
  wrap.innerHTML = icon('globe') + '<select id="setup-lang" class="input" aria-label="Language"></select>';
  const select = wrap.querySelector('select');
  LANGUAGES.forEach(function (l) {
    const o = document.createElement('option');
    o.value = l.id;
    o.textContent = l.label;
    select.appendChild(o);
  });
  select.value = appLanguage;
  select.addEventListener('change', function () { setLanguage(select.value); });
  document.querySelector('.setup-top').appendChild(wrap);
}

// When adding another business, a way back to the one they came from
function showSetupCancel() {
  const others = businesses.filter(function (b) { return b.id !== currentBiz; });
  if (!others.length || document.getElementById('setup-cancel')) return;
  let backTo = others[0];
  try {
    const came = sessionStorage.getItem('bizStudio.cameFrom');
    backTo = others.find(function (b) { return b.id === came; }) || backTo;
  } catch (error) { /* fine */ }
  const link = document.createElement('button');
  link.className = 'back-link setup-cancel';
  link.id = 'setup-cancel';
  link.innerHTML = icon('back') + '<span></span>';
  link.querySelector('span').textContent = 'Back to ' + backTo.name;
  link.addEventListener('click', function () {
    eraseProfile(); // throw away the half-made one
    switchBusiness(backTo.id);
  });
  document.querySelector('.setup-top').appendChild(link);
}

// =========================================
// EDITING FROM SETTINGS
// The same pages as setup, but shown inside the app on their own page,
// with Save changes and Cancel buttons.
// =========================================
const EDIT_TITLES = ['Business type and words', 'Business name and picture', 'Colors and font', 'Goals'];

function editProfile(step) {
  editing = true;
  editStep = step;
  profileBeforeEdit = JSON.parse(JSON.stringify(profile));
  currentSection = 'settings';
  showMenu();
  showPage();
}

// Draws the edit page in the main area
function showEditPage(page) {
  if (editStep === 4) return showDetailsPage(page);
  page.innerHTML = `
    <button class="back-link" id="edit-back">${icon('back')}<span>Back to Settings</span></button>
    <div class="setup-form edit-form" id="edit-form"></div>
  `;

  if (editStep === 0) showTypePage();
  if (editStep === 1) showNamePage();
  if (editStep === 2) showLookPage();
  if (editStep === 3) showGoalsPage();

  // Swap the setup buttons for Save changes and Cancel
  const back = document.getElementById('back-btn');
  if (back) back.remove();
  const skip = document.getElementById('skip-btn');
  if (skip) skip.remove();
  document.getElementById('next-btn').textContent = 'Save changes';

  const cancel = document.createElement('button');
  cancel.className = 'btn secondary';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', cancelEdit);
  document.querySelector('#edit-form .form-actions').appendChild(cancel);

  document.getElementById('edit-back').addEventListener('click', cancelEdit);
}

// Settings page for the extra details: see them, remove them, add more.
// Changes save right away.
function showDetailsPage(page) {
  const w = words();
  page.innerHTML = `
    <button class="back-link" id="edit-back">${icon('back')}<span>Back to Settings</span></button>
    <div class="setup-form edit-form">
      <h1>Extra details</h1>
      <p class="help"></p>
      <div class="settings-list" id="detail-list"></div>
      <div id="detail-add"></div>
      <div class="form-actions"><button class="btn" id="details-done">Done</button></div>
    </div>
  `;
  page.querySelector('.help').textContent =
    'These questions show up on every ' + oneOrder() + ', so you always remember to ask them.';

  const list = page.querySelector('#detail-list');
  if (!profile.details.length) {
    list.innerHTML = '<p class="list-empty detail-none">None yet. Tap an idea below to add one.</p>';
  }
  profile.details.forEach(function (d, index) {
    const row = document.createElement('div');
    row.className = 'detail-row';
    const kind = DETAIL_KINDS.find(function (k) { return k.id === d.kind; });
    row.innerHTML = '<span class="row-text"><strong></strong><span class="row-value"></span></span>' +
      '<button class="row-delete" title="Remove">' + icon('trash') + '</button>';
    row.querySelector('strong').textContent = d.name;
    row.querySelector('.row-value').textContent = kind.label + (d.kind === 'list' ? ': ' + d.choices.join(', ') : '');
    row.querySelector('.row-delete').setAttribute('aria-label', 'Remove ' + d.name);
    row.querySelector('.row-delete').addEventListener('click', function () {
      profile.details.splice(index, 1);
      saveProfile();
      showPage();
      showUndo(d.name + ' removed', function () {
        profile.details.splice(index, 0, d);
        saveProfile();
        showPage();
      });
    });
    list.appendChild(row);
  });

  const add = page.querySelector('#detail-add');
  add.innerHTML = '<p class="extra-ask">Add more:</p>';
  add.appendChild(detailIdeaButtons(showPage));

  function done() {
    stopEditing();
    openApp();
  }
  page.querySelector('#details-done').addEventListener('click', done);
  page.querySelector('#edit-back').addEventListener('click', done);
}

// Undo any changes and go back to Settings
function cancelEdit() {
  Object.assign(profile, profileBeforeEdit);
  stopEditing();
  openApp();
}

function stopEditing() {
  editing = false;
  editStep = null;
  profileBeforeEdit = null;
}

// ---------- Page 1: business type ----------

// The 4 words an owner can change for "Something else"
const WORD_FIELDS = [
  { key: 'products', label: 'What you sell or offer' },
  { key: 'orders', label: 'What people book or order' },
  { key: 'customers', label: 'The people you work with' },
  { key: 'supplies', label: 'What you use to do the work' },
];

function showTypePage() {
  const form = formArea();
  form.innerHTML = `
    <h1>What kind of business is it?</h1>
    <p class="help">Biz Studio uses the right words for your business, like Recipes for a bakery or Appointments for a salon.</p>

    <div class="type-grid" id="type-grid" role="radiogroup" aria-label="Business type"></div>

    <div class="other-box" id="other-box" hidden>
      <label class="label" for="other-type">What kind of business?</label>
      <input id="other-type" class="input" autocomplete="off" placeholder="Bike repair, dog grooming, lemonade stand...">

      <p class="other-note" id="other-note"></p>
      <div class="word-grid" id="word-grid"></div>
    </div>
    <p id="setup-error" class="error" role="alert"></p>

    <div class="form-actions">
      <button id="next-btn" class="btn">Continue</button>
    </div>
  `;

  // One card for each business type
  const grid = document.getElementById('type-grid');
  BUSINESS_TYPES.forEach(function (type) {
    const card = document.createElement('button');
    card.className = 'type-card ' + type.color;
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', profile.businessType === type.id ? 'true' : 'false');
    card.innerHTML = '<span class="type-icon">' + icon(type.icon) + '</span><strong></strong>';
    card.querySelector('strong').textContent = type.label;

    card.addEventListener('click', function () {
      profile.businessType = type.id;
      document.getElementById('setup-error').textContent = '';
      grid.querySelectorAll('.type-card').forEach(function (c) {
        c.setAttribute('aria-checked', 'false');
      });
      card.setAttribute('aria-checked', 'true');
      updateOtherBox();
      if (type.id === 'other') document.getElementById('other-type').focus();
    });

    grid.appendChild(card);
  });

  // The boxes for their own words
  const wordGrid = document.getElementById('word-grid');
  WORD_FIELDS.forEach(function (field) {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<label class="label small"></label><input class="input">';
    const input = wrap.querySelector('input');
    input.id = 'word-' + field.key;
    wrap.querySelector('label').textContent = field.label;
    wrap.querySelector('label').htmlFor = input.id;
    input.value = profile.customWords[field.key];

    input.addEventListener('input', function () {
      wordsEditedByOwner = true;
      profile.customWords[field.key] = input.value.trim() || findType('other').words[field.key];
    });
    wordGrid.appendChild(wrap);
  });

  // As they type their business, guess the words that fit
  const otherBox = document.getElementById('other-type');
  otherBox.value = profile.otherType;
  otherBox.addEventListener('input', function () {
    profile.otherType = otherBox.value.trim();
    document.getElementById('setup-error').textContent = '';
    applyGuess();
  });

  updateOtherBox();
  applyGuess();

  document.getElementById('next-btn').addEventListener('click', saveType);
}

// Shows the "What kind of business?" area only when Something else is picked
function updateOtherBox() {
  document.getElementById('other-box').hidden = profile.businessType !== 'other';
}

// Fills in words that fit what they typed, and explains what happened
function applyGuess() {
  const guess = guessType(profile.otherType);
  const note = document.getElementById('other-note');

  if (!wordsEditedByOwner) {
    const suggested = guess ? guess.words : findType('other').words;
    profile.customWords = Object.assign({}, suggested);
    WORD_FIELDS.forEach(function (field) {
      document.getElementById('word-' + field.key).value = profile.customWords[field.key];
    });
  }

  if (profile.otherType === '') {
    note.textContent = 'Tell us what you do, and we will fill in words that fit.';
  } else if (guess) {
    note.textContent = 'That sounds like ' + guess.label.toLowerCase() +
      ', so we filled in words that fit. Change any of them to match how you talk.';
  } else {
    note.textContent = 'Change any of these words to match how you talk about your business.';
  }
}

function saveType() {
  if (profile.businessType === '') {
    document.getElementById('setup-error').textContent = 'Pick the kind of business you run to continue.';
    return;
  }
  if (profile.businessType === 'other' && profile.otherType === '') {
    document.getElementById('setup-error').textContent = 'Type what kind of business you run to continue.';
    document.getElementById('other-type').focus();
    return;
  }
  if (editing) {
    // Switching to a different kind of business? Ask if it's a new one.
    const changed = profile.businessType !== profileBeforeEdit.businessType ||
      (profile.businessType === 'other' && profile.otherType !== profileBeforeEdit.otherType);
    if (changed && hasBusinessData()) return askNewBusiness();
    return finishSetup();
  }
  setupStep = 1;
  showSetup();
}

// True if there are orders, customers or tasks that a new business would clear
function hasBusinessData() {
  return orders.length > 0 || tasks.length > 0 || Object.keys(customerInfo).length > 0;
}

// "Is this a new business?" Start fresh, or keep everything and just fix the type
function askNewBusiness() {
  const oldName = profileBeforeEdit.businessType === 'other'
    ? profileBeforeEdit.otherType : findType(profileBeforeEdit.businessType).label;
  const newName = profile.businessType === 'other' ? profile.otherType : findType(profile.businessType).label;

  formArea().innerHTML = `
    <h1>Is this a new business?</h1>
    <p class="help"></p>
    <div class="fresh-choices">
      <button class="fresh-card peach" id="fresh-yes">
        <span class="fresh-icon">${icon('sprout')}</span>
        <b>Yes, it's a new business</b>
        <span></span>
      </button>
      <button class="fresh-card sky" id="fresh-no">
        <span class="fresh-icon">${icon('check')}</span>
        <b>No, keep everything</b>
        <span></span>
      </button>
    </div>
    <div class="form-actions"><button class="btn secondary" id="fresh-cancel">Cancel</button></div>
  `;
  formArea().querySelector('.help').textContent =
    'You changed from ' + oldName + ' to ' + newName + '.';
  formArea().querySelector('#fresh-no span:last-child').textContent =
    'Same business. Only change the type and words, and keep your ' + words().orders.toLowerCase() + ', ' +
    words().customers.toLowerCase() + ' and to-do list.';
  formArea().querySelector('#fresh-yes span:last-child').textContent = 'Set it up on its own. ' +
    profileBeforeEdit.businessName + ' stays just like it is, and you can switch between them any time.';
  formArea().querySelector('#fresh-yes').addEventListener('click', function () { startNewBusiness(); });
  formArea().querySelector('#fresh-no').addEventListener('click', finishSetup);
  formArea().querySelector('#fresh-cancel').addEventListener('click', cancelEdit);
  window.scrollTo(0, 0);
}

// Sets up a new business with the new type already picked. The old one isn't changed.
function startNewBusiness() {
  addBusiness({
    businessType: profile.businessType,
    otherType: profile.otherType,
    customWords: profile.customWords,
  });
}
const NEW_BUSINESS_KEY = 'bizStudio.newBusiness';

// ---------- Page 2: business name ----------
function showNamePage() {
  formArea().innerHTML = `
    <h1>What's your business called?</h1>
    <p class="help">This name goes on your receipts, your menus and the top of your app. You can change it later.</p>

    <label class="label" for="business-name">Business name</label>
    <input id="business-name" class="input" autocomplete="off">
    <p id="setup-error" class="error" role="alert"></p>

    <label class="label" for="business-country">Where are you based?</label>
    <select id="business-country" class="input"></select>

    <p class="label photo-label">Profile picture (optional)</p>
    <div class="photo-picker" id="photo-picker"></div>

    <div class="form-actions">
      <button id="back-btn" class="btn secondary">Back</button>
      <button id="next-btn" class="btn">Continue</button>
    </div>
  `;
  showPhotoPicker();

  const countryBox = document.getElementById('business-country');
  COUNTRIES.forEach(function (c) {
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = c.label;
    countryBox.appendChild(option);
  });
  countryBox.value = myCountry();
  countryBox.addEventListener('change', function () { profile.country = countryBox.value; });

  const nameBox = document.getElementById('business-name');
  nameBox.placeholder = exampleName(); // a sample name that fits their business
  nameBox.value = profile.businessName;
  nameBox.focus();

  document.getElementById('back-btn').addEventListener('click', function () {
    profile.businessName = nameBox.value.trim(); // keep what they typed
    setupStep = 0;
    showSetup();
  });
  document.getElementById('next-btn').addEventListener('click', saveName);

  // Clear the error as soon as they start typing, and update the initials
  nameBox.addEventListener('input', function () {
    nameBox.classList.remove('has-error');
    document.getElementById('setup-error').textContent = '';
    profile.businessName = nameBox.value.trim();
    showPhotoPicker();
  });
  nameBox.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') saveName();
  });
}

// The picture, plus buttons to add, change or remove it
function showPhotoPicker() {
  const box = document.getElementById('photo-picker');
  box.innerHTML = '';
  box.appendChild(avatar('md'));

  const buttons = document.createElement('div');
  buttons.className = 'photo-buttons';
  buttons.innerHTML =
    '<button type="button" class="btn secondary small" id="add-photo">' +
    (profile.photo ? 'Change picture' : 'Add a picture or logo') + '</button>' +
    (profile.photo ? '<button type="button" class="link-btn" id="remove-photo">Remove</button>' : '') +
    '<span class="photo-hint">If you skip this, your initials show instead.</span>';
  box.appendChild(buttons);

  document.getElementById('add-photo').addEventListener('click', function () {
    pickPhoto(function (photo) {
      profile.photo = photo;
      showPhotoPicker();
    });
  });
  const remove = document.getElementById('remove-photo');
  if (remove) {
    remove.addEventListener('click', function () {
      profile.photo = '';
      showPhotoPicker();
    });
  }
}

// A sample business name that fits what they picked or typed
function exampleName() {
  if (profile.businessType !== 'other') return findType(profile.businessType).example;
  const guess = guessType(profile.otherType);
  return guess ? guess.example : 'Your business name';
}

function saveName() {
  const nameBox = document.getElementById('business-name');
  const name = nameBox.value.trim();

  if (name === '') {
    nameBox.classList.add('has-error');
    document.getElementById('setup-error').textContent = 'Enter a business name to continue.';
    nameBox.focus();
    return;
  }

  profile.businessName = name;
  profile.country = document.getElementById('business-country').value;
  if (editing) return finishSetup();
  setupStep = 2;
  showSetup();
}

// ---------- Page 3: look ----------
function showLookPage() {
  formArea().innerHTML = `
    <h1>Make it yours</h1>
    <p class="help">Pick your colors. Each one comes with a matching font, and the whole app changes as you click.</p>

    <section class="look-section">
      <h2>Colors</h2>
      <div id="theme-groups" role="radiogroup" aria-label="Colors"></div>
      <div class="custom-colors" id="custom-colors" hidden>
        <label>Main color <input type="color" id="custom-ink"></label>
        <label>Accent color <input type="color" id="custom-sun"></label>
      </div>
    </section>

    <section class="look-section">
      <label class="toggle">
        <input type="checkbox" id="time-toggle">
        <span class="toggle-track"></span>
        <span class="toggle-text">
          <strong>Change with the time of day</strong>
          <span>Warm in the morning, bright in the afternoon and calm at night.</span>
        </span>
      </label>
    </section>

    <div class="form-actions">
      <button id="back-btn" class="btn secondary">Back</button>
      <button id="next-btn" class="btn">Continue</button>
    </div>
  `;

  // Theme cards, in groups. "Custom" goes at the end of the last group.
  const groupsBox = document.getElementById('theme-groups');
  THEME_GROUPS.forEach(function (group, i) {
    const heading = document.createElement('p');
    heading.className = 'theme-group-label';
    heading.textContent = group.label;
    groupsBox.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'theme-grid';
    groupsBox.appendChild(grid);

    let choices = group.themes;
    if (i === THEME_GROUPS.length - 1) choices = choices.concat([{ id: 'custom', label: 'Custom' }]);

    choices.forEach(function (theme) {
      grid.appendChild(makeThemeCard(theme));
    });
  });

  // Custom color pickers
  const inkPicker = document.getElementById('custom-ink');
  const sunPicker = document.getElementById('custom-sun');
  inkPicker.value = profile.customInk;
  sunPicker.value = profile.customSun;
  inkPicker.addEventListener('input', function () { profile.customInk = inkPicker.value; updateLookPage(); });
  sunPicker.addEventListener('input', function () { profile.customSun = sunPicker.value; updateLookPage(); });

  // Time of day switch
  const timeToggle = document.getElementById('time-toggle');
  timeToggle.addEventListener('change', function () {
    profile.changeWithTime = timeToggle.checked;
    updateLookPage();
  });

  document.getElementById('back-btn').addEventListener('click', function () {
    setupStep = 1;
    showSetup();
  });

  document.getElementById('next-btn').addEventListener('click', function () {
    if (editing) return finishSetup();
    setupStep = 3;
    showSetup();
  });

  updateLookPage();
}

// Makes one theme card: a tiny drawing of the app in that theme, with the name below
function makeThemeCard(theme) {
  const card = document.createElement('button');
  card.className = 'theme-card';
  card.dataset.id = theme.id;
  card.setAttribute('role', 'radio');
  card.innerHTML = `
    <span class="tiny-app" aria-hidden="true">
      <span class="tiny-side">
        <span class="tiny-logo"></span>
        <span class="tiny-nav on"><i class="butter"></i><b></b></span>
        <span class="tiny-nav"><i class="sky"></i><b></b></span>
        <span class="tiny-nav"><i class="pink"></i><b></b></span>
        <span class="tiny-nav"><i class="mint"></i><b></b></span>
      </span>
      <span class="tiny-main">
        <span class="tiny-title"></span>
        <span class="tiny-stats"><span class="tiny-stat"></span><span class="tiny-stat two"></span></span>
        <span class="tiny-btn"></span>
      </span>
    </span>
    <span class="theme-label"><span class="theme-dot"></span><span class="theme-name"></span></span>
  `;
  card.querySelector('.theme-name').textContent = theme.label;
  if (theme.font) card.querySelector('.theme-name').style.fontFamily = findFont(theme.font).family; // name shown in its matching font

  if (theme.id === 'custom') {
    card.classList.add('custom-card');
  } else {
    // Give this card its own theme colors to use in the CSS
    card.style.setProperty('--t-ink', theme.ink);
    card.style.setProperty('--t-sun', theme.sun);
    card.style.setProperty('--t-g1', theme.glows[0]);
    card.style.setProperty('--t-g2', theme.glows[1]);
  }

  card.addEventListener('click', function () {
    profile.theme = theme.id;
    if (theme.font) profile.font = theme.font; // switch to the font that matches this theme
    profile.changeWithTime = false;            // picking a color turns off the time-of-day switch
    updateLookPage();
  });
  return card;
}

// Marks the picked cards and applies the look to the whole app
function updateLookPage() {
  document.querySelectorAll('.theme-card').forEach(function (card) {
    const picked = !profile.changeWithTime && card.dataset.id === profile.theme;
    card.setAttribute('aria-checked', picked ? 'true' : 'false');
  });
  document.getElementById('custom-colors').hidden = profile.theme !== 'custom' || profile.changeWithTime;
  document.getElementById('time-toggle').checked = profile.changeWithTime;
  applyLook();
  showLookPreview();
}

// Draws a mini version of the app with the owner's name, words, colors and font
function showLookPreview() {
  if (editing) return; // when editing, the real app around the page changes instead
  const w = words();
  const type = findType(profile.businessType);
  const guess = profile.businessType === 'other' ? guessType(profile.otherType) : null;
  const samples = (guess || type).samples;

  // A few menu items, each with its group color
  // The first 5 menu items, in the same order as the real menu
  const focus = focusSections();
  const menuItems = menuOrder().slice(0, 5).map(function (id) {
    const section = findSection(id);
    const active = id === 'myday' ? ' active' : '';
    const label = id === 'pricing' ? 'Pricing' : say(section.label); // short name so it fits
    const star = focus.includes(id) ? '<span class="mini-star">' + icon('star') + '</span>' : '';
    return '<div class="mini-nav ' + sectionColor(id) + active + '">' +
      '<span class="nav-icon">' + icon(section.icon) + '</span><span class="mini-nav-text"></span>' + star + '</div>';
  }).join('');
  const menuLabels = menuOrder().slice(0, 5).map(function (id) {
    return id === 'pricing' ? 'Pricing' : say(findSection(id).label);
  });

  const preview = document.getElementById('look-preview');
  preview.innerHTML = `
    <p class="preview-label">Preview</p>
    <div class="mini-window">
      <div class="mini-bar"><i></i><i></i><i></i></div>
      <div class="mini-app">
        <div class="mini-side">
          <div class="logo logo-mini"><span class="logo-word"></span>
            <svg class="logo-star" viewBox="0 0 24 24"><path d="M12 1l3 7 7 1-5 5 1.5 8L12 18l-6.5 4L7 14 2 9l7-1z"/></svg>
          </div>
          ${menuItems}
        </div>
        <div class="mini-main">
          <h3>${greeting()}!</h3>
          <p class="mini-date">${new Date().toLocaleDateString(appLocale(), { weekday: 'long', month: 'long', day: 'numeric' })}</p>

          <div class="mini-stats">
            <div class="mini-stat sky"><strong>3</strong><span class="mini-stat-label"></span></div>
            <div class="mini-stat mint"><strong>$240</strong><span>this week</span></div>
          </div>

          <div class="mini-card">
            <p class="mini-card-title">Up next</p>
            <div class="mini-row"><span class="mini-item"></span><span class="mini-badge">New</span></div>
            <div class="mini-row"><span class="mini-item"></span><span class="mini-price">$45</span></div>
          </div>

          <span class="mini-btn"></span>
        </div>
      </div>
    </div>
  `;

  // Text that comes from what the owner typed is added safely with textContent
  preview.querySelectorAll('.mini-nav-text').forEach(function (span, i) {
    span.textContent = menuLabels[i];
  });
  preview.querySelector('.logo-word').textContent = profile.businessName || 'Your business';
  preview.querySelector('.mini-stat-label').textContent = w.orders.toLowerCase() + ' due';
  const items = preview.querySelectorAll('.mini-item');
  items[0].textContent = samples[0];
  items[1].textContent = samples[1];
  preview.querySelector('.mini-btn').textContent = '+ New ' + singular(w.orders.toLowerCase());
}

// ---------- Page 4: goals ----------
function showGoalsPage() {
  formArea().innerHTML = `
    <h1>What do you want help with?</h1>
    <p class="help">Pick as many as you like. Biz Studio puts these first and gives you tips for them.</p>

    <div class="goal-grid" id="goal-grid" role="group" aria-label="Goals"></div>

    <label class="label" for="custom-goal">Something else? (optional)</label>
    <input id="custom-goal" class="input" autocomplete="off" placeholder="I want to sell at the farmers market this summer">

    <div class="form-actions">
      <button id="back-btn" class="btn secondary">Back</button>
      <button id="skip-btn" class="btn secondary">Skip for now</button>
      <button id="next-btn" class="btn">Finish setup</button>
    </div>
  `;

  const grid = document.getElementById('goal-grid');
  GOALS.forEach(function (goal) {
    const card = document.createElement('button');
    card.className = 'goal-card ' + goal.color;
    card.dataset.id = goal.id;
    card.setAttribute('role', 'checkbox');
    card.innerHTML =
      '<span class="goal-icon">' + icon(goal.icon) + '</span>' +
      '<span class="goal-text"></span>' +
      '<span class="goal-check">' + icon('check') + '</span>';
    card.querySelector('.goal-text').textContent = say(goal.label);

    card.addEventListener('click', function () {
      if (profile.goals.includes(goal.id)) {
        profile.goals = profile.goals.filter(function (g) { return g !== goal.id; });
      } else {
        profile.goals.push(goal.id);
      }
      updateGoalsPage();
    });
    grid.appendChild(card);
  });

  const customBox = document.getElementById('custom-goal');
  customBox.value = profile.customGoal;
  customBox.addEventListener('input', function () {
    profile.customGoal = customBox.value.trim();
  });

  document.getElementById('back-btn').addEventListener('click', function () {
    setupStep = 2;
    showSetup();
  });
  document.getElementById('skip-btn').addEventListener('click', function () {
    profile.goals = [];
    profile.customGoal = '';
    finishSetup();
  });
  document.getElementById('next-btn').addEventListener('click', finishSetup);

  updateGoalsPage();
}

// Marks the picked goals and updates the preview menu
function updateGoalsPage() {
  document.querySelectorAll('.goal-card').forEach(function (card) {
    card.setAttribute('aria-checked', profile.goals.includes(card.dataset.id) ? 'true' : 'false');
  });
  if (editing) showMenu(); // the menu changes right away when editing
  else showLookPreview();
}

// Saves the profile and opens the main app
function finishSetup() {
  saveProfile();
  if (editing) {
    currentSection = 'settings'; // go back to Settings
    showSavedMessage = true;
  }
  stopEditing();
  openApp();
}

let showSavedMessage = false; // shows "Changes saved" once on the Settings page

// Shows the main app
function openApp() {
  if (!usesOrders()) orders = []; // no jobs anywhere for this kind of business
  applyLook();
  document.getElementById('setup-form').innerHTML = ''; // setup is done, clear it out
  document.getElementById('setup').hidden = true;
  document.getElementById('app').hidden = false;
  document.getElementById('brand-name').textContent = profile.businessName;
  showSidebarAvatar();

  showMenu();
  showPage();
}

// The small picture next to the logo in the menu
function showSidebarAvatar() {
  const spot = document.getElementById('side-avatar');
  spot.innerHTML = '';
  spot.appendChild(avatar('sm'));
}

// =========================================
// MAIN APP
// =========================================

function findSection(id) {
  return SECTIONS.find(function (s) { return s.id === id; });
}

// Makes one menu button
function makeMenuButton(section) {
  const button = document.createElement('button');
  button.className = 'nav-item ' + sectionColor(section.id);
  if (section.id === currentSection) button.classList.add('active');
  button.innerHTML = '<span class="nav-icon">' + icon(section.icon) + '</span><span class="nav-text"></span>';
  button.querySelector('.nav-text').textContent = say(section.label);

  button.addEventListener('click', function () {
    currentSection = section.id;
    orderView = null; // always open Orders on the list
    customerView = null; // and Customers on the list
    calendarMonth = null; // and the Calendar on this month
    productView = null;   // and the rest on their first page
    productEditing = false;
    bookMonth = null;
    calendarDay = todayText();
    orderCameFrom = null;
    showMenu();
    showPage();
  });
  return button;
}

// The menu groups for this owner: My Day, then "Picked for you" (their goals),
// then the normal groups without the sections that moved up
// Tabs some kinds of business don't use. Cleaning and yard businesses
// keep track of their jobs on the Calendar instead of a Jobs tab.
const NO_ORDERS_TAB = ['cleaning', 'yard'];
// Businesses that don't sell things over a counter don't need Receipts and menus
const NO_PRINTABLES = ['tutoring', 'music', 'fitness', 'pets', 'cleaning', 'yard'];
// For "Something else": words that mean they sell things people would want a receipt or menu for
const SELLS_THINGS = /\b(sell|selling|shop|store|stand|booth|market|bake|baked|bakery|cake|cookie|cupcake|bread|pie|treat|candy|chocolate|snack|food|meal|lunch|catering|cater|drink|coffee|tea|lemonade|smoothie|juice|jewel|jewelry|bracelet|necklace|earring|craft|handmade|make|making|shirt|clothes|clothing|hat|bag|sticker|print|poster|art|painting|candle|soap|plant|flower|menu|restaurant|cafe|truck|merch|product)/;

function hiddenSections() {
  let type = profile.businessType;
  if (type === 'other') {
    const guess = guessType(profile.otherType || '');
    type = guess ? guess.id : 'other';
  }
  const hidden = NO_ORDERS_TAB.includes(type) ? ['orders'] : [];
  if (NO_PRINTABLES.includes(type)) hidden.push('printables');
  // Their own kind of business that we couldn't match: only keep it if they sell things
  if (type === 'other' && !SELLS_THINGS.test((profile.otherType || '').toLowerCase())) hidden.push('printables');
  return hidden;
}

// False for businesses without jobs or orders at all (cleaning, yard)
function usesOrders() {
  return !hiddenSections().includes('orders');
}

function menuGroups() {
  const hidden = hiddenSections();
  const focus = focusSections().filter(function (id) { return !hidden.includes(id); });
  const groups = [MENU_GROUPS[0]];
  if (focus.length > 0) groups.push({ label: 'Picked for you', items: focus });

  MENU_GROUPS.slice(1).forEach(function (group) {
    if (group.items.includes('settings')) return; // Settings is added at the bottom
    const items = group.items.filter(function (id) { return !focus.includes(id) && !hidden.includes(id); });
    if (items.length > 0) groups.push({ label: group.label, items: items });
  });
  return groups;
}

// Every section id in menu order (used by the preview)
function menuOrder() {
  return menuGroups().flatMap(function (g) { return g.items; });
}

// Draws the menu on the left, in groups
function showMenu() {
  const menu = document.getElementById('menu');
  menu.innerHTML = '';

  menuGroups().forEach(function (group) {
    if (group.label) {
      const heading = document.createElement('div');
      heading.className = 'nav-group-label';
      heading.textContent = group.label;
      menu.appendChild(heading);
    }
    group.items.forEach(function (id) {
      menu.appendChild(makeMenuButton(findSection(id)));
    });
  });

  const bottom = document.createElement('div');
  bottom.className = 'nav-bottom';
  bottom.appendChild(makeMenuButton(findSection('settings')));
  menu.appendChild(bottom);
}

// "Good morning" / "Good afternoon" / "Good evening"
function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Draws the page on the right for the current section
function showPage() {
  // A hidden tab's list opens the Calendar instead (its form still works from there)
  if (hiddenSections().includes(currentSection) && currentSection === 'orders' && orderView === null) {
    currentSection = 'calendar';
    showMenu();
  }
  // A page this business doesn't use goes back to My Day
  if (currentSection === 'printables' && hiddenSections().includes('printables')) {
    currentSection = 'myday';
    showMenu();
  }
  const section = findSection(currentSection);
  const page = document.getElementById('page');

  // Leaving Settings while editing throws away the unsaved changes
  if (editing && currentSection !== 'settings') {
    Object.assign(profile, profileBeforeEdit);
    stopEditing();
    applyLook();
    showMenu();
  }
  if (editing) return showEditPage(page);

  let title = say(section.label);
  let subtitle = '';
  if (section.id === 'myday') {
    title = greeting();
    subtitle = new Date().toLocaleDateString(appLocale(), { weekday: 'long', month: 'long', day: 'numeric' });
  }

  page.innerHTML = `
    <header class="page-head">
      <h1></h1>
      <p></p>
    </header>
    <div class="empty ${sectionColor(section.id)}">
      <span class="empty-icon">${icon(section.icon)}</span>
      <h3></h3>
      <p></p>
    </div>
  `;
  page.querySelector('h1').textContent = title;
  page.querySelector('.page-head p').textContent = subtitle;

  // On My Day, show their picture next to the greeting
  if (section.id === 'myday') {
    const head = page.querySelector('.page-head');
    head.classList.add('with-avatar');
    head.prepend(avatar('md'));
    const text = document.createElement('div');
    text.append(head.querySelector('h1'), head.querySelector('p'));
    head.appendChild(text);
  }
  page.querySelector('.empty h3').textContent = say(section.emptyTitle);
  page.querySelector('.empty p').textContent = say(section.emptyText);

  if (section.id === 'myday') showMyDay(page);
  if (section.id === 'products') showProducts(page);
  if (section.id === 'checklist') showSupplies(page);
  if (section.id === 'pricing') showPricing(page);
  if (section.id === 'bookkeeping') showBookkeeping(page);
  if (section.id === 'printables') showPrintables(page);
  if (section.id === 'finder') showFinder(page);
  if (section.id === 'orders') showOrders(page);
  if (section.id === 'customers') showCustomers(page);
  if (section.id === 'calendar') showCalendar(page);
  if (section.id === 'todo') showTodo(page);
  if (section.id === 'notes') showNotesPage(page);
  if (section.id === 'settings') showSettings(page);
  updateHelper();
}

// =========================================
// PIP, THE HELPER
// A little star who sits in the corner and pops up with tips about your business.
// Tips come from your real orders, tasks, recipes and money. Click Pip for the next one.
// =========================================
const HELPER_NAME = 'Pip';
let helperTipIndex = 0;
let helperSection = null;
const helperSeen = {}; // tips already shown this visit, so Pip doesn't nag

// Pip, drawn as a little star with a face
function pipDrawing() {
  return `
    <svg class="pip-svg" viewBox="0 0 100 100" aria-hidden="true">
      <path class="pip-body" d="M50 8c3 0 5 2 6.5 5.5l8 17 18.5 2.6c7 1 8.5 6 3.5 10.8L73 57.2l3.2 18.6c1.2 7-3.3 10-9.4 6.8L50 73.8l-16.8 8.8c-6.1 3.2-10.6.2-9.4-6.8L27 57.2 13.5 43.9c-5-4.8-3.5-9.8 3.5-10.8l18.5-2.6 8-17C45 10 47 8 50 8z"/>
      <g class="pip-eyes">
        <ellipse cx="41" cy="46" rx="3.6" ry="4.6"/>
        <ellipse cx="59" cy="46" rx="3.6" ry="4.6"/>
      </g>
      <circle class="pip-shine" cx="42.3" cy="44.3" r="1.3"/>
      <circle class="pip-shine" cx="60.3" cy="44.3" r="1.3"/>
      <ellipse class="pip-cheek" cx="34" cy="55" rx="4.5" ry="2.8"/>
      <ellipse class="pip-cheek" cx="66" cy="55" rx="4.5" ry="2.8"/>
      <path class="pip-smile" d="M43.5 55.5c3.5 4.2 9.5 4.2 13 0"/>
    </svg>
  `;
}

// Tips that fit right now. Ones about the page you're on come first.
function helperTips(sectionId) {
  const w = words();
  const tips = [];
  const today = todayText();
  const add = function (text, options) { tips.push(Object.assign({ text: text, page: '', urgent: false }, options || {})); };
  const first = function (name) { return String(name || '').split(' ')[0]; };

  const late = orders.filter(function (o) { return isOpen(o) && o.due < today; });
  const dueToday = orders.filter(function (o) { return isOpen(o) && o.due === today; });
  const dueTomorrow = orders.filter(function (o) { return isOpen(o) && daysUntil(o.due) === 1; });
  const unpaid = orders.filter(function (o) { return o.status === 'done' && Number(o.price); });
  const flagged = tasks.filter(function (t) { return t.flagged && !t.done; });
  const todayTasks = tasks.filter(function (t) { return !t.done && t.due && t.due <= today; });
  const toBuy = whatToBuy();
  const eventsToday = events.filter(function (e) { return e.date === today; });

  if (late.length) {
    add(late.length === 1
      ? 'Heads up! ' + first(late[0].customer) + '\'s ' + late[0].item.toLowerCase() + ' is late.'
      : 'Heads up! ' + late.length + ' ' + w.orders.toLowerCase() + ' are late.', { urgent: true, go: 'calendar', page: 'orders' });
  }
  if (dueToday.length) {
    add(dueToday.length === 1
      ? first(dueToday[0].customer) + '\'s ' + dueToday[0].item.toLowerCase() + ' is due today' + (dueToday[0].time ? ' at ' + niceTime(dueToday[0].time) : '') + '.'
      : 'You have ' + dueToday.length + ' ' + w.orders.toLowerCase() + ' due today. You can do it!', { urgent: true, go: 'calendar', page: 'calendar' });
  }
  if (dueTomorrow.length) {
    add(dueTomorrow.length === 1
      ? 'Don\'t forget: ' + first(dueTomorrow[0].customer) + '\'s ' + dueTomorrow[0].item.toLowerCase() + ' is due tomorrow.'
      : dueTomorrow.length + ' ' + w.orders.toLowerCase() + ' are due tomorrow. Time to get ready!', { go: 'calendar', page: 'calendar' });
  }
  eventsToday.forEach(function (e) {
    add('Today: ' + e.title + (e.time ? ' at ' + niceTime(e.time) : '') + '. Have fun!', { go: 'calendar', page: 'calendar' });
  });
  if (flagged.length) {
    add('You flagged "' + flagged[0].text + '" as important.' + (flagged.length > 1 ? ' And ' + (flagged.length - 1) + ' more.' : ''), { go: 'todo', page: 'todo' });
  } else if (todayTasks.length) {
    add('You have ' + todayTasks.length + (todayTasks.length === 1 ? ' thing' : ' things') + ' on your to-do list for today.', { go: 'todo', page: 'todo' });
  }
  if (toBuy.length) {
    add('You\'re running low on ' + toBuy[0].supply.name.toLowerCase() + (toBuy.length > 1 ? ' and ' + (toBuy.length - 1) + ' more' : '') +
      ' for your upcoming ' + w.orders.toLowerCase() + '.', { go: 'checklist', page: 'checklist' });
  }
  if (unpaid.length) {
    add(unpaid.length === 1
      ? first(unpaid[0].customer) + '\'s ' + oneOrder() + ' is done but not paid yet.'
      : unpaid.length + ' finished ' + w.orders.toLowerCase() + ' are waiting to be paid.', { go: 'bookkeeping', page: 'bookkeeping' });
  }

  // Pricing: losing money, or a little low
  const s = pricingSettings();
  products.forEach(function (p) {
    const trueCost = productCost(p) + Number(p.hours || 0) * s.hourly;
    if (!p.price || !trueCost) return;
    if (p.price < trueCost) add('Your ' + p.name.toLowerCase() + ' costs more to make than you charge. Let\'s fix that!', { go: 'pricing', page: 'pricing', urgent: true });
    else if (p.price < Math.ceil(trueCost * (1 + s.extra / 100))) add('You could charge a little more for your ' + p.name.toLowerCase() + '.', { go: 'pricing', page: 'pricing' });
  });

  // Getting started
  if (!orders.length && usesOrders()) add('Add your first ' + oneOrder() + ' and I\'ll help you keep track of it.', { go: 'orders', page: 'orders' });
  if (!products.length) add('Add your ' + w.products.toLowerCase() + ' so I can work out what things cost you.', { go: 'products', page: 'products' });
  if (products.length && !supplies.length) add('Add what you pay for your ' + w.supplies.toLowerCase() + ', and I\'ll make your shopping list.', { go: 'checklist', page: 'checklist' });
  let lastBackup = null;
  try { lastBackup = localStorage.getItem(LAST_BACKUP_KEY); } catch (error) { /* fine */ }
  const backupDays = lastBackup ? Math.round((Date.now() - new Date(lastBackup)) / 86400000) : null;
  if (!IN_FRAME && ((backupDays === null && (orders.length || products.length || tasks.length)) || backupDays >= 7)) {
    add('It\'s been a while since your last backup. Save one in Settings so nothing gets lost!', { go: 'settings', page: 'settings' });
  }
  if (!profile.photo) add('Add a picture for your business in Settings. It goes on your receipts too!', { go: 'settings', page: 'settings' });

  // Little page helpers
  const pageTips = {
    customers: 'Click someone to see all their ' + w.orders.toLowerCase() + ' in one place.',
    calendar: 'Click a day, then Add to put an event or a to-do on it.',
    printables: 'Print a menu and bring it to your next market.',
    finder: 'Try searching for a name, a ' + oneProduct() + ', or anything else.',
    bookkeeping: 'Add money you spend with Money out, so you know what you really kept.',
  };
  if (pageTips[sectionId]) add(pageTips[sectionId], { page: sectionId });

  if (!tips.length || tips.every(function (t) { return !t.urgent; })) {
    add(['You\'re doing great. Keep it up!', 'Nothing urgent right now. Nice work!', 'All caught up! Maybe treat yourself to a snack.'][new Date().getDate() % 3]);
  }

  // This page's tips first, then urgent ones, then the rest
  tips.sort(function (a, b) {
    return (b.page === sectionId) - (a.page === sectionId) || b.urgent - a.urgent;
  });
  return tips;
}

// Draws Pip in the corner (once), and decides whether to pop up
function updateHelper() {
  let pip = document.getElementById('pip');
  if (profile.helperOff) { if (pip) pip.remove(); return; }
  if (!pip) {
    pip = document.createElement('div');
    pip.id = 'pip';
    pip.className = 'pip';
    pip.innerHTML = `
      <div class="pip-bubble" role="status" aria-live="polite" hidden>
        <button class="pip-close" aria-label="Close">${icon('plus')}</button>
        <b class="pip-name"></b>
        <p class="pip-text"></p>
        <div class="pip-actions">
          <button class="btn small pip-go">Show me</button>
          <button class="link-btn pip-next">Next tip</button>
        </div>
      </div>
      <button class="pip-buddy" aria-label="Tips from ${HELPER_NAME}">
        ${pipDrawing()}
        <span class="pip-dot" hidden></span>
      </button>
    `;
    pip.querySelector('.pip-name').textContent = HELPER_NAME;
    document.getElementById('app').appendChild(pip);
    pip.querySelector('.pip-buddy').addEventListener('click', function () {
      const bubble = pip.querySelector('.pip-bubble');
      if (bubble.hidden) showTip(); else closeTip();
    });
    pip.querySelector('.pip-close').addEventListener('click', closeTip);
    pip.querySelector('.pip-next').addEventListener('click', function () { helperTipIndex++; showTip(); });
    pip.querySelector('.pip-go').addEventListener('click', function () {
      const tip = currentTips()[helperTipIndex % currentTips().length];
      closeTip();
      if (tip && tip.go) {
        if (tip.go === 'orders') orderView = null;
        goTo(tip.go);
      }
    });
  }

  // New page: start from its first tip. Pop up by itself only for something new and urgent.
  if (helperSection !== currentSection) {
    helperSection = currentSection;
    helperTipIndex = 0;
    closeTip();
  }
  const tips = currentTips();
  const top = tips[0];
  const fresh = top && (top.urgent || top.page === currentSection) && !helperSeen[top.text];
  pip.querySelector('.pip-dot').hidden = !fresh;
  if (fresh && currentSection === 'myday' && top.urgent) showTip();
}

function currentTips() {
  return helperTips(currentSection);
}

function showTip() {
  const pip = document.getElementById('pip');
  if (!pip) return;
  const tips = currentTips();
  const tip = tips[helperTipIndex % tips.length];
  helperSeen[tip.text] = true;
  const bubble = pip.querySelector('.pip-bubble');
  bubble.hidden = false;
  bubble.classList.toggle('urgent', !!tip.urgent);
  pip.querySelector('.pip-text').textContent = tip.text;
  pip.querySelector('.pip-go').hidden = !tip.go || tip.go === currentSection;
  pip.querySelector('.pip-next').hidden = tips.length < 2;
  pip.querySelector('.pip-dot').hidden = true;
  pip.classList.add('talking');
  // A little hop each time Pip talks
  const buddy = pip.querySelector('.pip-buddy');
  buddy.classList.remove('hop');
  void buddy.offsetWidth;
  buddy.classList.add('hop');
}

function closeTip() {
  const pip = document.getElementById('pip');
  if (!pip) return;
  pip.querySelector('.pip-bubble').hidden = true;
  pip.classList.remove('talking');
}

// =========================================
// EXTRA DETAILS (custom fields)
// Questions the owner adds to every order, like "Cake flavor".
// Each one: { id, name, kind, choices }
// kind: 'text', 'number', 'date', 'yesno' or 'list' (pick from a list)
// =========================================
const DETAIL_KINDS = [
  { id: 'text', label: 'Type it', example: 'Happy Birthday Ava!' },
  { id: 'number', label: 'A number', example: '24' },
  { id: 'date', label: 'A date', example: '' },
  { id: 'yesno', label: 'Yes or no', example: '' },
  { id: 'list', label: 'Pick from a list', example: '' },
];

// Ideas that fit each kind of business, shown as one-click buttons
const DETAIL_IDEAS = {
  bakery: [
    { name: 'Cake flavor', kind: 'list', choices: ['Vanilla', 'Chocolate', 'Red velvet'] },
    { name: 'Message on the cake', kind: 'text' },
    { name: 'Allergies', kind: 'text' },
    { name: 'Pickup or delivery', kind: 'list', choices: ['Pickup', 'Delivery'] },
  ],
  catering: [
    { name: 'Number of people', kind: 'number' },
    { name: 'Allergies', kind: 'text' },
    { name: 'Pickup or delivery', kind: 'list', choices: ['Pickup', 'Delivery'] },
  ],
  craft: [
    { name: 'Scent', kind: 'list', choices: ['Lavender', 'Vanilla', 'Unscented'] },
    { name: 'Gift wrap', kind: 'yesno' },
    { name: 'Personalized text', kind: 'text' },
  ],
  art: [
    { name: 'Size', kind: 'list', choices: ['5x7', '8x10', '11x14'] },
    { name: 'Reference photo sent', kind: 'yesno' },
    { name: 'Style notes', kind: 'text' },
  ],
  clothing: [
    { name: 'Size', kind: 'list', choices: ['XS', 'S', 'M', 'L', 'XL'] },
    { name: 'Color', kind: 'text' },
    { name: 'Gift wrap', kind: 'yesno' },
  ],
  nails: [
    { name: 'Nail shape', kind: 'list', choices: ['Square', 'Round', 'Almond', 'Coffin'] },
    { name: 'Color', kind: 'text' },
    { name: 'First visit', kind: 'yesno' },
  ],
  hair: [
    { name: 'Hair length', kind: 'list', choices: ['Short', 'Medium', 'Long'] },
    { name: 'Products used', kind: 'text' },
    { name: 'First visit', kind: 'yesno' },
  ],
  beauty: [
    { name: 'Lash style', kind: 'list', choices: ['Classic', 'Hybrid', 'Volume'] },
    { name: 'Allergies', kind: 'text' },
    { name: 'First visit', kind: 'yesno' },
  ],
  tutoring: [
    { name: 'Subject', kind: 'text' },
    { name: 'Grade', kind: 'number' },
    { name: 'Online or in person', kind: 'list', choices: ['Online', 'In person'] },
  ],
  music: [
    { name: 'Instrument', kind: 'text' },
    { name: 'Level', kind: 'list', choices: ['Beginner', 'Intermediate', 'Advanced'] },
  ],
  fitness: [
    { name: 'Goal', kind: 'text' },
    { name: 'Session length', kind: 'list', choices: ['30 min', '45 min', '60 min'] },
  ],
  photo: [
    { name: 'Location', kind: 'text' },
    { name: 'Number of people', kind: 'number' },
    { name: 'Deposit paid', kind: 'yesno' },
  ],
  pets: [
    { name: 'Pet name', kind: 'text' },
    { name: 'Pet size', kind: 'list', choices: ['Small', 'Medium', 'Large'] },
    { name: 'Special care', kind: 'text' },
  ],
  cleaning: [
    { name: 'Number of rooms', kind: 'number' },
    { name: 'Pets in home', kind: 'yesno' },
    { name: 'Entry instructions', kind: 'text' },
  ],
  yard: [
    { name: 'Yard size', kind: 'list', choices: ['Small', 'Medium', 'Large'] },
    { name: 'Gate code', kind: 'text' },
  ],
  events: [
    { name: 'Theme', kind: 'text' },
    { name: 'Number of guests', kind: 'number' },
    { name: 'Colors', kind: 'text' },
  ],
  other: [
    { name: 'Pickup or delivery', kind: 'list', choices: ['Pickup', 'Delivery'] },
    { name: 'Gift wrap', kind: 'yesno' },
    { name: 'Special requests', kind: 'text' },
  ],
};

// The ideas that fit this business and haven't been added yet
function detailIdeas() {
  const key = profile.businessType === 'other' && guessType(profile.otherType)
    ? guessType(profile.otherType).id
    : profile.businessType;
  const ideas = DETAIL_IDEAS[key] || DETAIL_IDEAS.other;
  return ideas.filter(function (idea) {
    return !profile.details.some(function (d) { return d.name.toLowerCase() === idea.name.toLowerCase(); });
  });
}

function addDetail(detail) {
  profile.details.push({
    id: 'd' + Date.now(),
    name: detail.name,
    kind: detail.kind,
    choices: detail.choices ? detail.choices.slice() : [],
  });
  saveProfile();
}

// One question box in the order form, for one extra detail
function detailInput(detail, value) {
  const wrap = document.createElement('div');
  const id = 'x-' + detail.id;

  if (detail.kind === 'yesno') {
    wrap.className = 'yesno';
    wrap.innerHTML = '<label class="check-row"><input type="checkbox"><span></span></label>';
    wrap.querySelector('input').id = id;
    wrap.querySelector('input').checked = value === true;
    wrap.querySelector('span').textContent = detail.name;
    return wrap;
  }

  wrap.innerHTML = '<label class="label"></label>';
  wrap.querySelector('label').textContent = detail.name;
  wrap.querySelector('label').htmlFor = id;

  let input;
  if (detail.kind === 'list') {
    input = document.createElement('select');
    input.innerHTML = '<option value="">Pick one</option>';
    detail.choices.forEach(function (choice) {
      const option = document.createElement('option');
      option.value = choice;
      option.textContent = choice;
      input.appendChild(option);
    });
  } else {
    input = document.createElement('input');
    input.type = detail.kind === 'number' ? 'number' : detail.kind === 'date' ? 'date' : 'text';
    input.autocomplete = 'off';
  }
  input.id = id;
  input.className = 'input';
  input.value = value === undefined || value === null ? '' : value;
  wrap.appendChild(input);
  if (detail.kind === 'date') fancyDate(input, { clearable: true });
  return wrap;
}

// =========================================
// DATE PICKER
// Swaps the browser's plain date box for one that matches the app:
// a button that opens a small, colorful calendar.
// The real input stays (hidden), so its .value still works everywhere.
// =========================================
function fancyDate(input, options) {
  options = options || {};
  const wrap = document.createElement('div');
  wrap.className = 'date-field';
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);
  input.type = 'hidden';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'input date-button';
  button.setAttribute('aria-haspopup', 'dialog');
  button.innerHTML = '<span class="date-text"></span>' + icon('calendar');
  wrap.appendChild(button);

  // Clicking the label opens it too
  const label = input.id ? document.querySelector('label[for="' + input.id + '"]') : null;
  if (label) {
    button.setAttribute('aria-label', label.textContent);
    label.addEventListener('click', function (e) { e.preventDefault(); button.focus(); open(); });
  }

  // When code sets input.value, the button's words update too
  const real = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  Object.defineProperty(input, 'value', {
    configurable: true,
    get: function () { return real.get.call(input); },
    set: function (v) { real.set.call(input, v); showText(); },
  });

  function showText() {
    const v = input.value;
    const text = button.querySelector('.date-text');
    button.classList.toggle('is-empty', !v);
    if (!v) { text.textContent = options.placeholder || 'Pick a day'; return; }
    const d = toDate(v);
    const sameYear = d.getFullYear() === new Date().getFullYear();
    text.textContent = d.toLocaleDateString(appLocale(),
      sameYear ? { weekday: 'long', month: 'long', day: 'numeric' } : { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  showText();

  function pick(v) {
    input.value = v;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  let pop = null;
  let month = null;

  function open() {
    if (pop) return;
    const start = input.value ? toDate(input.value) : toDate(todayText());
    month = new Date(start.getFullYear(), start.getMonth(), 1);
    pop = document.createElement('div');
    pop.className = 'date-pop';
    pop.setAttribute('role', 'dialog');
    wrap.appendChild(pop);
    wrap.classList.add('open');
    draw();
    document.addEventListener('mousedown', outside, true);
    const focusDay = pop.querySelector('.date-cell.picked') || pop.querySelector('.date-cell.today');
    if (focusDay) focusDay.focus();
  }

  function close() {
    if (!pop) return;
    pop.remove();
    pop = null;
    wrap.classList.remove('open');
    document.removeEventListener('mousedown', outside, true);
  }

  function outside(e) {
    if (!wrap.contains(e.target)) close();
  }

  function draw() {
    const today = todayText();
    pop.innerHTML = `
      <div class="date-pop-head">
        <button type="button" class="round-btn small" data-move="-1" aria-label="Last month">${icon('back')}</button>
        <b></b>
        <button type="button" class="round-btn small" data-move="1" aria-label="Next month">${icon('chevron')}</button>
      </div>
      <div class="date-week"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>
      <div class="date-days"></div>
      <div class="date-pop-foot"></div>
    `;
    pop.querySelector('b').textContent = month.toLocaleDateString(appLocale(), { month: 'long', year: 'numeric' });
    pop.querySelectorAll('[data-move]').forEach(function (b) {
      b.addEventListener('click', function () {
        month = new Date(month.getFullYear(), month.getMonth() + Number(b.dataset.move), 1);
        draw();
      });
    });

    const days = pop.querySelector('.date-days');
    for (let i = 0; i < month.getDay(); i++) days.appendChild(document.createElement('span'));
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let n = 1; n <= count; n++) {
      const day = dateText(new Date(month.getFullYear(), month.getMonth(), n));
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'date-cell' + (day === today ? ' today' : '') + (day === input.value ? ' picked' : '') +
        (day < today ? ' past' : '');
      cell.textContent = n;
      cell.setAttribute('aria-label', toDate(day).toLocaleDateString(appLocale(), { weekday: 'long', month: 'long', day: 'numeric' }));
      cell.addEventListener('click', function () {
        pick(day);
        close();
        button.focus();
      });
      days.appendChild(cell);
    }

    const foot = pop.querySelector('.date-pop-foot');
    const todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.className = 'link-btn';
    todayBtn.textContent = 'Today';
    todayBtn.addEventListener('click', function () { pick(today); close(); button.focus(); });
    foot.appendChild(todayBtn);
    if (options.clearable) {
      const clear = document.createElement('button');
      clear.type = 'button';
      clear.className = 'link-btn';
      clear.textContent = 'No date';
      clear.addEventListener('click', function () { pick(''); close(); button.focus(); });
      foot.appendChild(clear);
    }
  }

  button.addEventListener('click', function () { if (pop) close(); else open(); });
  wrap.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && pop) {
      e.preventDefault();
      e.stopPropagation(); // don't close the whole window, just the calendar
      close();
      button.focus();
    }
  });
  return input;
}

// =========================================
// DROPDOWNS
// Every <select> in the app is swapped for one that matches the app's colors:
// a button, and a rounded list that pops up under it.
// The real select stays (hidden), so .value and 'change' still work everywhere.
// =========================================
function fancySelect(select) {
  if (select.dataset.fancy) return;
  select.dataset.fancy = 'yes';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pick-button ' + select.className;
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  if (select.getAttribute('aria-label')) button.setAttribute('aria-label', select.getAttribute('aria-label'));
  button.innerHTML = '<span class="pick-text"></span><svg class="pick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  select.after(button);
  select.classList.add('select-hidden');
  select.tabIndex = -1;

  const label = select.id ? document.querySelector('label[for="' + select.id + '"]') : null;
  if (label) {
    if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', label.textContent);
    label.addEventListener('click', function (e) { e.preventDefault(); button.focus(); open(); });
  }

  let list = null; // the open list, if any

  // Setting select.value in code updates the button too
  const real = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  Object.defineProperty(select, 'value', {
    configurable: true,
    get: function () { return real.get.call(select); },
    set: function (v) { real.set.call(select, v); showText(); },
  });

  function showText() {
    const chosen = select.options[select.selectedIndex];
    button.querySelector('.pick-text').textContent = chosen ? chosen.textContent : '';
    button.classList.toggle('is-empty', !chosen || chosen.value === '');
    // Keep color classes (like the status colors) in step with the select
    button.className = 'pick-button ' + select.className.replace('select-hidden', '').trim() +
      (!chosen || chosen.value === '' ? ' is-empty' : '') + (list ? ' open' : '');
  }
  showText();
  new MutationObserver(showText).observe(select, { childList: true, attributes: true, attributeFilter: ['class'] });

  function open() {
    if (list) return;
    list = document.createElement('div');
    list.className = 'pick-list';
    list.setAttribute('role', 'listbox');

    function addOption(option) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'pick-option';
      item.setAttribute('role', 'option');
      const on = option.value === select.value;
      item.setAttribute('aria-selected', on ? 'true' : 'false');
      item.innerHTML = '<span class="pick-dot"></span><span class="pick-label"></span>' +
        '<svg class="pick-tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
      item.querySelector('.pick-label').textContent = option.textContent;
      if (option.dataset.color) item.classList.add('has-dot', option.dataset.color);
      else item.querySelector('.pick-dot').remove();
      if (option.value === '') item.classList.add('blank');
      item.addEventListener('click', function () {
        select.value = option.value;
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        close();
        if (document.body.contains(button)) button.focus();
      });
      list.appendChild(item);
    }
    Array.from(select.children).forEach(function (child) {
      if (child.tagName === 'OPTGROUP') {
        const head = document.createElement('div');
        head.className = 'pick-group';
        head.textContent = child.label;
        list.appendChild(head);
        Array.from(child.children).forEach(addOption);
      } else addOption(child);
    });

    // Put it on top of everything, right under the button (inside a pop-up window if there is one)
    (button.closest('dialog') || document.body).appendChild(list);
    place();
    button.setAttribute('aria-expanded', 'true');
    button.classList.add('open');
    // Start on the picked one (or, for times, around 9 AM)
    const items = Array.from(list.querySelectorAll('.pick-option'));
    let onItem = list.querySelector('.pick-option[aria-selected="true"]:not(.blank)');
    if (!onItem && select.dataset.startAt) {
      const at = Array.from(select.options).findIndex(function (o) { return o.value === select.dataset.startAt; });
      if (at > -1) {
        items[at].scrollIntoView({ block: 'start' });
        list.scrollTop -= 6;
      }
    }
    if (onItem) {
      onItem.scrollIntoView({ block: 'center' });
      onItem.focus({ preventScroll: true });
    } else {
      const at = select.dataset.startAt ? Array.from(select.options).findIndex(function (o) { return o.value === select.dataset.startAt; }) : -1;
      (items[at] || items[0]).focus({ preventScroll: true });
    }
    document.addEventListener('mousedown', outside, true);
    window.addEventListener('resize', close);
    document.addEventListener('scroll', onScroll, true);
  }

  function place() {
    const r = button.getBoundingClientRect();
    const width = Math.max(r.width, 200);
    list.style.minWidth = width + 'px';
    list.style.left = Math.min(r.left, window.innerWidth - width - 12) + 'px';
    const below = window.innerHeight - r.bottom;
    if (below < 240 && r.top > below) {
      list.style.bottom = (window.innerHeight - r.top + 6) + 'px';
      list.style.top = 'auto';
      list.style.maxHeight = Math.min(320, r.top - 16) + 'px';
    } else {
      list.style.top = (r.bottom + 6) + 'px';
      list.style.bottom = 'auto';
      list.style.maxHeight = Math.min(320, below - 16) + 'px';
    }
  }

  function close() {
    if (!list) return;
    list.remove();
    list = null;
    button.setAttribute('aria-expanded', 'false');
    button.classList.remove('open');
    document.removeEventListener('mousedown', outside, true);
    window.removeEventListener('resize', close);
    document.removeEventListener('scroll', onScroll, true);
  }
  function outside(e) {
    if (!list.contains(e.target) && !button.contains(e.target)) close();
  }
  function onScroll(e) {
    if (list && !list.contains(e.target)) close();
  }

  button.addEventListener('click', function () { if (list) close(); else open(); });
  button.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
  });

  // Arrow keys move through the list, Esc closes it
  function onListKey(e) {
    if (!list) return;
    const items = Array.from(list.querySelectorAll('.pick-option'));
    const at = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (items[at + 1] || items[0]).focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (items[at - 1] || items[items.length - 1]).focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); button.focus(); }
    else if (e.key === 'Tab') close();
  }
  document.addEventListener('keydown', function (e) { if (list && list.contains(e.target)) onListKey(e); }, true);
}

// Time boxes become a dropdown of times (every 15 minutes), so they match too
function timeSelect(input) {
  const select = document.createElement('select');
  select.id = input.id;
  select.className = input.className;
  select.dataset.startAt = '09:00';
  const times = [''];
  for (let h = 5; h < 23; h++) {
    ['00', '15', '30', '45'].forEach(function (m) { times.push(String(h).padStart(2, '0') + ':' + m); });
  }
  if (input.value && !times.includes(input.value)) { times.push(input.value); times.sort(); }
  times.forEach(function (t) {
    const option = document.createElement('option');
    option.value = t;
    option.textContent = t ? niceTime(t) : 'No time';
    select.appendChild(option);
  });
  select.value = input.value || '';
  input.replaceWith(select);
  return select;
}

// Any dropdown or time box that shows up anywhere gets the app's look
function dressUp(node) {
  if (node.nodeType !== 1) return;
  const times = node.matches('input[type="time"]') ? [node] : Array.from(node.querySelectorAll('input[type="time"]'));
  times.forEach(timeSelect);
  const selects = node.tagName === 'SELECT' ? [node] : Array.from(node.querySelectorAll('select'));
  selects.forEach(fancySelect);
}
new MutationObserver(function (changes) {
  changes.forEach(function (change) { change.addedNodes.forEach(dressUp); });
}).observe(document.body, { childList: true, subtree: true });

// Reads the answer from a question box
function readDetail(detail, page) {
  const input = page.querySelector('#x-' + detail.id);
  if (!input) return undefined;
  if (detail.kind === 'yesno') return input.checked;
  return input.value.trim();
}

// The short text shown on an order in the list, like "Cake flavor: Chocolate"
function detailChips(order) {
  const chips = [];
  profile.details.forEach(function (d) {
    const v = order.extra ? order.extra[d.id] : undefined;
    if (v === true) chips.push(d.name);
    else if (v && v !== false) chips.push(d.name + ': ' + (d.kind === 'date' ? niceDate(v) : v));
  });
  return chips;
}

// The "Add something else" mini form, asked as plain questions.
// When saved, it calls done(newDetail).
function detailBuilder(done, cancel) {
  const box = document.createElement('div');
  box.className = 'detail-builder';
  box.innerHTML = `
    <label class="label" for="db-name">What do you want to ask?</label>
    <input id="db-name" class="input" autocomplete="off" placeholder="Favorite color">

    <p class="label">How will you answer?</p>
    <div class="kind-buttons" id="db-kinds" role="radiogroup" aria-label="How will you answer?"></div>

    <div id="db-choices-box" hidden>
      <label class="label" for="db-choices">What are the choices? Put a comma between each one.</label>
      <input id="db-choices" class="input" autocomplete="off" placeholder="Red, Blue, Green">
    </div>

    <p class="error" id="db-error" role="alert"></p>
    <div class="form-actions">
      <button type="button" class="btn small" id="db-save">Add it</button>
      <button type="button" class="btn secondary small" id="db-cancel">Never mind</button>
    </div>
  `;

  let kind = 'text';
  const kinds = box.querySelector('#db-kinds');
  function drawKinds() {
    kinds.innerHTML = '';
    DETAIL_KINDS.forEach(function (k) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'kind-btn';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', k.id === kind ? 'true' : 'false');
      b.textContent = k.label;
      b.addEventListener('click', function () {
        kind = k.id;
        drawKinds();
        box.querySelector('#db-choices-box').hidden = kind !== 'list';
      });
      kinds.appendChild(b);
    });
  }
  drawKinds();

  box.querySelector('#db-cancel').addEventListener('click', cancel);
  box.querySelector('#db-save').addEventListener('click', function () {
    const name = box.querySelector('#db-name').value.trim();
    const choices = box.querySelector('#db-choices').value.split(',')
      .map(function (c) { return c.trim(); })
      .filter(Boolean);
    const error = box.querySelector('#db-error');

    if (!name) { error.textContent = 'Type what you want to ask.'; return; }
    if (kind === 'list' && choices.length < 2) { error.textContent = 'Add at least two choices.'; return; }
    done({ name: name, kind: kind, choices: choices });
  });

  setTimeout(function () { box.querySelector('#db-name').focus(); }, 0);
  return box;
}

// The row of idea buttons plus "Something else"
// onAdded runs after a detail is added.
function detailIdeaButtons(onAdded) {
  const wrap = document.createElement('div');
  wrap.className = 'idea-area';

  const row = document.createElement('div');
  row.className = 'idea-row';
  detailIdeas().forEach(function (idea) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'idea-btn';
    b.innerHTML = icon('plus') + '<span></span>';
    b.querySelector('span').textContent = idea.name;
    b.addEventListener('click', function () {
      addDetail(idea);
      onAdded();
    });
    row.appendChild(b);
  });

  const other = document.createElement('button');
  other.type = 'button';
  other.className = 'idea-btn other';
  other.innerHTML = icon('plus') + '<span>Something else</span>';
  other.addEventListener('click', function () {
    row.hidden = true;
    wrap.appendChild(detailBuilder(function (detail) {
      addDetail(detail);
      onAdded();
    }, function () {
      onAdded(); // just redraw
    }));
  });
  row.appendChild(other);

  wrap.appendChild(row);
  return wrap;
}

// =========================================
// ORDERS
// Each order: { id, customer, contact, item, due, time, price, status, notes, created }
// "due" is a date like "2026-11-14". Orders are saved in the browser like the profile.
// =========================================
const ORDERS_KEY = 'bizStudio.orders';
let orders = loadOrders();
let orderView = null;      // null = the list, 'new' = adding, or the id of the order being edited
let orderFilter = 'open';  // which orders the list shows

const STATUSES = [
  { id: 'new', label: 'New', color: 'butter' },
  { id: 'progress', label: 'In progress', color: 'sky' },
  { id: 'done', label: 'Done', color: 'mint' },
  { id: 'paid', label: 'Paid', color: 'lilac' },
];

function findStatus(id) {
  return STATUSES.find(function (st) { return st.id === id; });
}

function loadOrders() {
  try {
    return JSON.parse(store.getItem(ORDERS_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveOrders() {
  if (!usesOrders()) return; // don't touch saved ones for a business without orders
  try {
    store.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (error) {
    // If the browser won't save, the orders still work until the app is closed
  }
}

// ---------- Deleting, with Undo ----------
let undoTimer = null;

// Removes orders and shows "Deleted. Undo" for a few seconds
function deleteOrders(ids) {
  const removed = [];
  orders.forEach(function (o, index) {
    if (ids.includes(o.id)) removed.push({ order: o, index: index });
  });
  orders = orders.filter(function (o) { return !ids.includes(o.id); });
  saveOrders();
  showPage();

  const what = removed.length === 1 ? capitalize(oneOrder()) : removed.length + ' ' + words().orders.toLowerCase();
  showUndo(what + ' deleted', function () {
    removed.forEach(function (r) { orders.splice(r.index, 0, r.order); });
    saveOrders();
    showPage();
  });
}

// A little message at the bottom of the screen with an Undo button
function showUndo(message, undo) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.innerHTML = '<span></span><button class="toast-undo">Undo</button>';
  toast.querySelector('span').textContent = message;
  toast.hidden = false;

  if (undo) {
    toast.querySelector('.toast-undo').addEventListener('click', function () {
      toast.hidden = true;
      clearTimeout(undoTimer);
      undo();
    });
  } else {
    toast.querySelector('.toast-undo').remove(); // just a message
  }

  clearTimeout(undoTimer);
  undoTimer = setTimeout(function () { toast.hidden = true; }, 6000);
}

// "Orders" -> "order", "Appointments" -> "appointment"
function oneOrder() {
  return singular(words().orders).toLowerCase();
}

// $45.00 style money
function money(amount) {
  return Number(amount || 0).toLocaleString(appLocale(), { style: 'currency', currency: 'USD' });
}

// Turns "2026-11-14" into a date at midnight, in the owner's time zone
function toDate(text) {
  const parts = text.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// Today as "2026-11-10"
function todayText() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// How many days until a date (0 = today, -2 = two days ago)
function daysUntil(text) {
  return Math.round((toDate(text) - toDate(todayText())) / 86400000);
}

// "Due today", "Due tomorrow", "Due in 3 days", "2 days late"
function dueText(order) {
  if (order.status === 'done' || order.status === 'paid') return 'Was due ' + niceDate(order.due);
  const days = daysUntil(order.due);
  if (days < -1) return Math.abs(days) + ' days late';
  if (days === -1) return '1 day late';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 7) return 'Due in ' + days + ' days';
  return 'Due ' + niceDate(order.due);
}

// "Sat, Nov 14"
function niceDate(text) {
  return toDate(text).toLocaleDateString(appLocale(), { weekday: 'short', month: 'short', day: 'numeric' });
}

// How urgent an order is, for its color: late, soon, later or finished
function urgency(order) {
  if (order.status === 'done' || order.status === 'paid') return 'finished';
  const days = daysUntil(order.due);
  if (days < 0) return 'late';
  if (days <= 2) return 'soon';
  return 'later';
}

function isOpen(order) {
  return order.status === 'new' || order.status === 'progress';
}

// Open orders first (soonest due at the top), then finished ones
function sortedOrders() {
  return orders.slice().sort(function (a, b) {
    if (isOpen(a) !== isOpen(b)) return isOpen(a) ? -1 : 1;
    const byDate = a.due.localeCompare(b.due);
    if (byDate !== 0) return isOpen(a) ? byDate : -byDate; // finished: newest first
    return (a.time || '').localeCompare(b.time || '');
  });
}

// ---------- The Orders page ----------
function showOrders(page) {
  if (orderView === 'import') return showImport(page);
  if (orderView !== null) return showOrderForm(page);

  page.querySelector('.empty').remove();
  const w = words();
  const openCount = orders.filter(isOpen).length;
  page.querySelector('.page-head p').textContent = orders.length === 0
    ? ''
    : openCount + ' open, ' + (orders.length - openCount) + ' finished';

  // "+ New order" button next to the title
  const head = page.querySelector('.page-head');
  head.classList.add('with-button');
  const titleBox = document.createElement('div');
  titleBox.append(head.querySelector('h1'), head.querySelector('p'));
  head.appendChild(titleBox);
  const buttons = document.createElement('div');
  buttons.className = 'head-buttons';
  const formBtn = document.createElement('button');
  formBtn.className = 'btn secondary with-icon';
  formBtn.innerHTML = icon('upload') + '<span>From Google Form</span>';
  formBtn.addEventListener('click', function () { openOrderForm('import'); });
  const addBtn = document.createElement('button');
  addBtn.className = 'btn with-icon';
  addBtn.innerHTML = icon('plus') + '<span></span>';
  addBtn.querySelector('span').textContent = 'New ' + oneOrder();
  addBtn.addEventListener('click', function () { openOrderForm('new'); });
  buttons.append(formBtn, addBtn);
  head.appendChild(buttons);

  // No orders yet: a friendly empty message with a button
  if (orders.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty sky';
    empty.innerHTML = '<span class="empty-icon">' + icon('receipt') + '</span><h3></h3><p></p>' +
      '<div class="empty-buttons"><button class="btn" id="first-order"></button>' +
      '<button class="btn secondary" id="first-import">Bring them in from your Google Form</button></div>';
    empty.querySelector('h3').textContent = 'No ' + w.orders.toLowerCase() + ' yet';
    empty.querySelector('p').textContent = 'Add your first ' + oneOrder() + ' to start keeping track of who needs what, and when.';
    empty.querySelector('#first-order').textContent = 'Add your first ' + oneOrder();
    empty.querySelector('#first-order').addEventListener('click', function () { openOrderForm('new'); });
    empty.querySelector('#first-import').addEventListener('click', function () { openOrderForm('import'); });
    page.appendChild(empty);
    return;
  }

  // Filter tabs with counts
  const filters = [
    { id: 'open', label: 'Open', test: isOpen },
    { id: 'all', label: 'All', test: function () { return true; } },
  ].concat(STATUSES.map(function (st) {
    return { id: st.id, label: st.label, test: function (o) { return o.status === st.id; } };
  }));

  const tabs = document.createElement('div');
  tabs.className = 'filter-tabs';
  tabs.setAttribute('role', 'tablist');
  filters.forEach(function (f) {
    const tab = document.createElement('button');
    tab.className = 'filter-tab' + (f.id === orderFilter ? ' on' : '');
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', f.id === orderFilter ? 'true' : 'false');
    tab.innerHTML = '<span></span><b></b>';
    tab.querySelector('span').textContent = f.label;
    tab.querySelector('b').textContent = orders.filter(f.test).length;
    tab.addEventListener('click', function () {
      orderFilter = f.id;
      showPage();
    });
    tabs.appendChild(tab);
  });
  page.appendChild(tabs);

  const filter = filters.find(function (f) { return f.id === orderFilter; });
  const shown = sortedOrders().filter(filter.test);

  if (shown.length === 0) {
    const none = document.createElement('p');
    none.className = 'list-empty';
    none.textContent = 'Nothing here right now.';
    page.appendChild(none);
    return;
  }

  const list = document.createElement('div');
  list.className = 'order-list';
  shown.forEach(function (order) { list.appendChild(orderRow(order)); });
  page.appendChild(list);

  // "Clear finished" removes every Done and Paid one at once (with Undo)
  const finished = orders.filter(function (o) { return !isOpen(o); });
  if (finished.length > 0) {
    const clear = document.createElement('button');
    clear.className = 'link-btn clear-finished';
    clear.innerHTML = icon('trash') + '<span></span>';
    clear.querySelector('span').textContent = 'Clear finished ' + words().orders.toLowerCase() + ' (' + finished.length + ')';
    clear.addEventListener('click', function () {
      deleteOrders(finished.map(function (o) { return o.id; }));
    });
    page.appendChild(clear);
  }
}

// One order in the list: date block, what and who, price and status
function orderRow(order) {
  const row = document.createElement('div');
  row.className = 'order-row ' + urgency(order);

  const date = toDate(order.due);
  row.innerHTML = `
    <button class="order-main" title="Edit">
      <span class="date-block">
        <b>${date.getDate()}</b>
        <span>${date.toLocaleDateString(appLocale(), { month: 'short' })}</span>
      </span>
      <span class="order-text">
        <strong class="order-name"></strong>
        <span class="order-item"></span>
        <span class="order-who"></span>
        <span class="order-chips"></span>
      </span>
    </button>
    <span class="order-price"></span>
    <select class="status-pick" aria-label="Status"></select>
    <button class="row-delete" title="Delete">${icon('trash')}</button>
  `;
  // The person's name goes on top so it's easy to spot
  row.querySelector('.order-name').textContent = order.customer;
  row.querySelector('.order-item').textContent = order.item;
  row.querySelector('.order-who').textContent =
    dueText(order) + (order.time ? ' at ' + niceTime(order.time) : '');
  row.querySelector('.order-price').textContent = order.price ? money(order.price) : '';

  // Extra details, like "Cake flavor: Chocolate"
  const chipBox = row.querySelector('.order-chips');
  detailChips(order).slice(0, 4).forEach(function (text) {
    const chip = document.createElement('span');
    chip.className = 'mini-chip';
    chip.textContent = text;
    chipBox.appendChild(chip);
  });
  if (!chipBox.children.length) chipBox.remove();

  // Change the status right from the list
  const pick = row.querySelector('.status-pick');
  STATUSES.forEach(function (st) {
    const option = document.createElement('option');
    option.value = st.id;
    option.textContent = st.label;
    option.dataset.color = st.color;
    pick.appendChild(option);
  });
  pick.value = order.status;
  pick.className = 'status-pick ' + findStatus(order.status).color;
  pick.addEventListener('change', function () {
    order.status = pick.value;
    saveOrders();
    showPage();
  });

  row.querySelector('.order-main').addEventListener('click', function () {
    openOrderForm(order.id);
  });

  const del = row.querySelector('.row-delete');
  del.setAttribute('aria-label', 'Delete ' + order.item);
  del.addEventListener('click', function () {
    deleteOrders([order.id]);
  });
  return row;
}

// "14:30" -> "2:30 PM"
function niceTime(text) {
  const parts = text.split(':').map(Number);
  const d = new Date();
  d.setHours(parts[0], parts[1]);
  return d.toLocaleTimeString(appLocale(), { hour: 'numeric', minute: '2-digit' });
}

// ---------- Adding and editing an order ----------
// Closes the form, going back to wherever it was opened from
function leaveOrderForm() {
  orderView = null;
  if (orderCameFrom) {
    currentSection = orderCameFrom.section;
    customerView = orderCameFrom.customer;
    orderCameFrom = null;
    showMenu();
  }
}

// If an order is opened from Customers or the Calendar, go back there after
let orderCameFrom = null; // { section, customer }
let orderPrefill = null;  // things filled in already, like { customer, contact } or { due }

function openOrderForm(which) {
  orderCameFrom = currentSection === 'orders' ? null : { section: currentSection, customer: customerView };
  currentSection = 'orders';
  orderView = which;
  showMenu();
  showPage();
}

function showOrderForm(page) {
  const w = words();
  const isNew = orderView === 'new';
  const order = isNew
    ? Object.assign({ customer: '', contact: '', item: '', due: '', time: '', price: '', status: 'new', notes: '' }, orderPrefill)
    : orders.find(function (o) { return o.id === orderView; });
  orderPrefill = null;

  page.innerHTML = `
    <button class="back-link" id="order-back">${icon('back')}<span></span></button>
    <div class="setup-form edit-form order-form">
      <h1></h1>

      <div class="form-grid">
        <div>
          <label class="label" for="o-customer"></label>
          <input id="o-customer" class="input" autocomplete="off" placeholder="Mia Rodriguez">
        </div>
        <div>
          <label class="label" for="o-contact">Phone or email (optional)</label>
          <input id="o-contact" class="input" autocomplete="off" placeholder="555-123-4567 or an email">
        </div>

        <div class="span-2">
          <label class="label" for="o-item"></label>
          <textarea id="o-item" class="input" rows="2"></textarea>
        </div>

        <div>
          <label class="label" for="o-due">Due date</label>
          <input id="o-due" class="input" type="date">
        </div>
        <div>
          <label class="label" for="o-time">Time (optional)</label>
          <input id="o-time" class="input" type="time">
        </div>

        <div>
          <label class="label" for="o-price">Price</label>
          <div class="money-box"><span>$</span><input id="o-price" class="input" type="number" min="0" step="0.01" placeholder="0.00"></div>
        </div>
        <div>
          <p class="label">Status</p>
          <div class="status-buttons" id="o-status" role="radiogroup" aria-label="Status"></div>
        </div>

        <section class="span-2 extra-details" id="extra-details"></section>

        <div class="span-2">
          <label class="label" for="o-notes">Notes (optional)</label>
          <textarea id="o-notes" class="input" rows="3" placeholder="Anything else to remember"></textarea>
        </div>
      </div>

      <p id="order-error" class="error" role="alert"></p>

      <div class="form-actions">
        <button class="btn" id="o-save"></button>
        <button class="btn secondary" id="o-cancel">Cancel</button>
        <span class="spacer"></span>
        <button class="link-btn delete-btn" id="o-delete" hidden></button>
      </div>
    </div>
  `;

  // Words that fit the business
  page.querySelector('#order-back span').textContent = 'Back to ' + w.orders;
  page.querySelector('h1').textContent = isNew ? 'New ' + oneOrder() : 'Edit ' + oneOrder();
  page.querySelector('label[for="o-customer"]').textContent = singular(w.customers) + ' name';
  page.querySelector('label[for="o-item"]').textContent = 'What they want';
  page.querySelector('#o-item').placeholder = findType(profile.businessType).samples[0];
  page.querySelector('#o-save').textContent = isNew ? 'Add ' + oneOrder() : 'Save changes';

  // Fill in the boxes
  const fields = ['customer', 'contact', 'item', 'due', 'time', 'price', 'notes'];
  fields.forEach(function (name) {
    page.querySelector('#o-' + name).value = order[name] || '';
  });
  if (isNew && !order.due) page.querySelector('#o-due').value = todayText();
  fancyDate(page.querySelector('#o-due'));

  // Quick picks from their recipes: fills in what they want and the price
  if (products.length) {
    const picks = document.createElement('div');
    picks.className = 'product-picks';
    products.forEach(function (p) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'idea-btn';
      b.textContent = p.name + (p.price ? ' ' + money(p.price) : '');
      b.addEventListener('click', function () {
        page.querySelector('#o-item').value = p.name;
        if (p.price) page.querySelector('#o-price').value = p.price;
        page.querySelector('#o-item').focus();
      });
      picks.appendChild(b);
    });
    page.querySelector('#o-item').after(picks);
  }

  // Extra details: the owner's own questions, plus ideas to add more
  const extra = Object.assign({}, order.extra || {});
  function drawExtraDetails() {
    // keep anything already typed before redrawing
    profile.details.forEach(function (d) {
      const v = readDetail(d, page);
      if (v !== undefined) extra[d.id] = v;
    });

    const box = page.querySelector('#extra-details');
    box.innerHTML = '<h2 class="extra-title">Extra details</h2><div class="extra-grid"></div><p class="extra-ask"></p>';
    const grid = box.querySelector('.extra-grid');
    profile.details.forEach(function (d) {
      grid.appendChild(detailInput(d, extra[d.id]));
    });
    if (!profile.details.length) grid.remove();

    box.querySelector('.extra-ask').textContent = profile.details.length
      ? 'Want to ask something else on every ' + oneOrder() + '?'
      : 'Anything else you want to remember for every ' + oneOrder() + '? Tap one to add it.';
    box.appendChild(detailIdeaButtons(drawExtraDetails));
  }
  drawExtraDetails();

  // Status buttons
  let status = order.status;
  const statusBox = page.querySelector('#o-status');
  function drawStatus() {
    statusBox.innerHTML = '';
    STATUSES.forEach(function (st) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'status-btn ' + st.color;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', st.id === status ? 'true' : 'false');
      b.textContent = st.label;
      b.addEventListener('click', function () { status = st.id; drawStatus(); });
      statusBox.appendChild(b);
    });
  }
  drawStatus();

  addPhoneDashes(page.querySelector('#o-contact'));
  if (order.customer) page.querySelector('#o-item').focus();
  else page.querySelector('#o-customer').focus();
  if (orderCameFrom) {
    page.querySelector('#order-back span').textContent = 'Back to ' +
      (orderCameFrom.customer ? order.customer || 'them' : say(findSection(orderCameFrom.section).label));
  }

  function goBack() {
    leaveOrderForm();
    showPage();
  }
  page.querySelector('#order-back').addEventListener('click', goBack);
  page.querySelector('#o-cancel').addEventListener('click', goBack);

  // Save
  page.querySelector('#o-save').addEventListener('click', function () {
    const values = {};
    fields.forEach(function (name) { values[name] = page.querySelector('#o-' + name).value.trim(); });

    const missing = [];
    if (!values.customer) missing.push(singular(w.customers).toLowerCase() + ' name');
    if (!values.item) missing.push('what they want');
    if (!values.due) missing.push('due date');
    if (missing.length > 0) {
      const list = missing.length > 1
        ? missing.slice(0, -1).join(', ') + ' and ' + missing[missing.length - 1]
        : missing[0];
      page.querySelector('#order-error').textContent = 'To save, fill in the ' + list + '.';
      return;
    }

    values.price = values.price === '' ? '' : Math.max(0, Number(values.price));
    values.status = status;

    // Answers to the extra details
    values.extra = Object.assign({}, extra);
    profile.details.forEach(function (d) {
      const v = readDetail(d, page);
      values.extra[d.id] = d.kind === 'number' && v !== '' ? Number(v) : v;
    });

    if (isNew) {
      values.id = 'o' + Date.now();
      values.created = new Date().toISOString();
      orders.push(values);
    } else {
      Object.assign(order, values);
    }
    saveOrders();
    goBack();
  });

  // Delete (asks twice)
  const del = page.querySelector('#o-delete');
  if (!isNew) {
    del.hidden = false;
    del.textContent = 'Delete this ' + oneOrder();
    del.addEventListener('click', function () {
      leaveOrderForm();
      deleteOrders([order.id]);
    });
  }
}

// =========================================
// ORDERS FROM A GOOGLE FORM
// The owner downloads their form answers as a .csv file from Google Sheets,
// picks it here, and tells the app which question goes where.
// =========================================
const MATCH_KEY = 'bizStudio.formMatch'; // remembers their matches for next time
let importData = null; // { fileName, questions: [...], rows: [[...], ...] } once a file is picked

function loadMatches() {
  try { return JSON.parse(store.getItem(MATCH_KEY)) || {}; } catch (error) { return {}; }
}
function saveMatches(matches) {
  try { store.setItem(MATCH_KEY, JSON.stringify(matches)); } catch (error) { /* fine */ }
}

// Reads CSV text into rows of cells. Handles "quoted, cells" and line breaks inside answers.
function parseCSV(text) {
  text = text.replace(/^﻿/, ''); // remove the invisible mark some files start with
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(function (r) { return r.some(function (c) { return c.trim() !== ''; }); });
}

// Turns what someone typed into a date like "2026-11-14", or '' if it can't tell
function readFormDate(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  const pad = function (n) { return String(n).padStart(2, '0'); };
  let m = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return m[1] + '-' + pad(m[2]) + '-' + pad(m[3]);
  m = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    const year = m[3].length === 2 ? '20' + m[3] : m[3];
    return year + '-' + pad(m[1]) + '-' + pad(m[2]);
  }
  const parsed = new Date(text);
  if (isNaN(parsed)) return '';
  if (!/\d{4}/.test(text)) {
    // No year typed ("Nov 14"): use this year, or next year if that date already passed a while ago
    parsed.setFullYear(new Date().getFullYear());
    if (parsed < new Date(Date.now() - 60 * 86400000)) parsed.setFullYear(parsed.getFullYear() + 1);
  }
  return parsed.getFullYear() + '-' + pad(parsed.getMonth() + 1) + '-' + pad(parsed.getDate());
}

// "2:30 PM" or "14:30:00" -> "14:30", or '' if there is no time in it
function readFormTime(raw) {
  const text = String(raw || '');
  let m = text.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]\.?m\.?)?/i);
  if (!m) {
    const short = text.match(/\b(\d{1,2})\s*([ap]\.?m\.?)/i);
    if (!short) return '';
    m = [short[0], short[1], '00', short[2]];
  }
  let hour = Number(m[1]);
  const ampm = (m[3] || '').toLowerCase().replace(/\./g, '');
  if (ampm === 'pm' && hour < 12) hour += 12;
  if (ampm === 'am' && hour === 12) hour = 0;
  if (hour > 23) return '';
  return String(hour).padStart(2, '0') + ':' + m[2];
}

// Where each form answer can go
function matchChoices() {
  const w = words();
  const choices = [
    { id: '', label: 'Leave it out' },
    { id: 'customer', label: singular(w.customers) + ' name' },
    { id: 'contact', label: 'Phone or email' },
    { id: 'item', label: 'What they want' },
    { id: 'due', label: 'Due date' },
    { id: 'time', label: 'Time' },
    { id: 'price', label: 'Price' },
    { id: 'notes', label: 'Notes' },
    { id: 'sent', label: 'When they filled out the form' },
  ];
  profile.details.forEach(function (d) {
    choices.push({ id: 'd:' + d.id, label: d.name, group: 'Your extra details' });
  });
  choices.push({ id: 'new', label: 'Make it a new extra detail', group: 'Your extra details' });
  return choices;
}

// A first guess at where a question goes, from its wording
function guessMatch(question, saved) {
  if (saved[question] !== undefined) {
    const s = saved[question];
    if (!s.startsWith('d:') || profile.details.some(function (d) { return 'd:' + d.id === s; })) return s;
  }
  const q = question.toLowerCase();
  const detail = profile.details.find(function (d) {
    const name = d.name.toLowerCase();
    return q.includes(name) || name.includes(q.replace(/\?$/, '').trim());
  });
  if (detail) return 'd:' + detail.id;
  if (/timestamp|submitted/.test(q)) return 'sent';
  if (/e-?mail|phone|number to reach|contact|text you/.test(q)) return 'contact';
  if (/\bname\b/.test(q)) return 'customer';
  if (/\btime\b/.test(q) && !/\bdate\b/.test(q)) return 'time';
  if (/\bdate\b|\bwhen\b|\bday\b|pick ?up|deliver|need it|due/.test(q)) return 'due';
  if (/price|cost|budget|total|\$/.test(q)) return 'price';
  if (/order|want|would you like|item|product|what can we|what do you need/.test(q)) return 'item';
  return 'notes';
}

// Picks a file and reads it
function readImportFile(file, done) {
  if (!file) return;
  if (!/\.csv$/i.test(file.name)) {
    done('That file is not a .csv file. In Google Sheets, go to File, then Download, then Comma Separated Values (.csv).');
    return;
  }
  const reader = new FileReader();
  reader.onload = function () {
    const rows = parseCSV(String(reader.result));
    if (rows.length < 2) {
      done('That file doesn\'t have any answers in it yet.');
      return;
    }
    const questions = rows[0].map(function (q) { return q.trim(); });
    importData = {
      fileName: file.name,
      questions: questions,
      rows: rows.slice(1).map(function (r) {
        // make every row as long as the questions row
        return questions.map(function (q, i) { return (r[i] || '').trim(); });
      }),
    };
    done(null);
  };
  reader.onerror = function () { done('That file couldn\'t be opened. Try downloading it again.'); };
  reader.readAsText(file);
}

// Builds orders from the rows, using the matches
function buildImportedOrders(matches, forReal) {
  const results = [];
  const details = {}; // detail id -> detail
  profile.details.forEach(function (d) { details[d.id] = d; });
  const knownKeys = new Set(orders.map(function (o) { return o.formKey; }).filter(Boolean));
  let skipped = 0;

  importData.rows.forEach(function (cells) {
    const order = {
      customer: '', contact: '', item: '', due: '', time: '', price: '',
      status: 'new', notes: '', extra: {},
    };
    const items = [];
    const notes = [];
    let sent = '';

    importData.questions.forEach(function (question, i) {
      const answer = cells[i];
      const target = matches[i];
      if (!answer || !target) return;
      if (target === 'customer' || target === 'contact') {
        const value = target === 'contact' ? phoneWithDashes(answer) : answer;
        order[target] = order[target] ? order[target] + ', ' + value : value;
      } else if (target === 'item') items.push(answer);
      else if (target === 'notes') notes.push(question.replace(/[?:]\s*$/, '') + ': ' + answer);
      else if (target === 'sent') sent = answer;
      else if (target === 'due') {
        order.due = readFormDate(answer);
        if (!order.due) notes.push('Date from the form: ' + answer);
        if (!order.time && /:|[ap]\.?m/i.test(answer)) order.time = readFormTime(answer);
      } else if (target === 'time') order.time = readFormTime(answer) || order.time;
      else if (target === 'price') {
        const n = parseFloat(answer.replace(/[^0-9.]/g, ''));
        if (!isNaN(n)) order.price = n;
      } else if (target.startsWith('d:')) {
        const d = details[target.slice(2)];
        if (d) order.extra[d.id] = formAnswerFor(d, answer, forReal);
      }
    });

    // Every order needs a date. If the form didn't have one, use the day it was sent.
    if (!order.due) order.due = readFormDate(sent) || todayText();
    order.item = items.join(', ') || 'Order from your form';
    order.customer = order.customer || 'No name given';
    order.notes = notes.join('\n');

    // A fingerprint, so the same answer isn't added twice
    order.formKey = sent ? sent + '|' + order.customer : cells.join('|');
    if (knownKeys.has(order.formKey)) { skipped++; return; }
    knownKeys.add(order.formKey);

    order.created = sent && !isNaN(new Date(sent)) ? new Date(sent).toISOString() : new Date().toISOString();
    results.push(order);
  });

  return { orders: results, skipped: skipped };
}

// Turns a form answer into the right kind of answer for an extra detail
function formAnswerFor(detail, answer, forReal) {
  if (detail.kind === 'yesno') return /^(yes|y|true|x|sure|please)/i.test(answer);
  if (detail.kind === 'number') {
    const n = parseFloat(answer.replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? '' : n;
  }
  if (detail.kind === 'date') return readFormDate(answer);
  if (detail.kind === 'list') {
    const found = detail.choices.find(function (c) { return c.toLowerCase() === answer.toLowerCase(); });
    if (found) return found;
    // a new choice from the form, so it can still be picked later
    if (forReal) detail.choices.push(answer);
    return answer;
  }
  return answer;
}

// ---------- The "From Google Form" page ----------
function showImport(page) {
  const w = words();
  page.innerHTML = `
    <button class="back-link" id="import-back">${icon('back')}<span></span></button>
    <div class="import-page">
      <h1></h1>
      <p class="help"></p>

      <section class="import-step">
        <span class="import-num">1</span>
        <div>
          <h2>Download your answers</h2>
          <ol class="how-to">
            <li>Open your Google Form and click <b>Responses</b>.</li>
            <li>Click <b>View in Sheets</b> (or <b>Link to Sheets</b> the first time).</li>
            <li>In the sheet, click <b>File</b>, then <b>Download</b>, then <b>Comma Separated Values (.csv)</b>.</li>
          </ol>
        </div>
      </section>

      <section class="import-step">
        <span class="import-num">2</span>
        <div class="step-body">
          <h2>Pick that file</h2>
          <div id="file-area"></div>
          <p class="error" id="file-error" role="alert"></p>
        </div>
      </section>

      <section class="import-step" id="match-step" hidden>
        <span class="import-num">3</span>
        <div class="step-body">
          <h2>Tell the app where each answer goes</h2>
          <p class="step-help">We made a guess for each question. Change any that look wrong.</p>
          <div class="match-list" id="match-list"></div>
          <div id="import-summary"></div>
          <p class="error" id="import-error" role="alert"></p>
          <div class="form-actions">
            <button class="btn" id="import-go"></button>
            <button class="btn secondary" id="import-cancel">Cancel</button>
          </div>
        </div>
      </section>
    </div>
  `;
  page.querySelector('#import-back span').textContent = 'Back to ' + w.orders;
  page.querySelector('h1').textContent = 'Bring in ' + w.orders.toLowerCase() + ' from your Google Form';
  page.querySelector('.help').textContent = 'Everyone who filled out your form shows up here as a new ' + oneOrder() +
    '. You can do this again any time. Ones you already brought in won\'t be added twice.';

  function goBack() {
    importData = null;
    orderView = null;
    showPage();
  }
  page.querySelector('#import-back').addEventListener('click', goBack);
  page.querySelector('#import-cancel').addEventListener('click', goBack);

  // ----- Step 2: picking the file -----
  const fileArea = page.querySelector('#file-area');
  function drawFileArea() {
    fileArea.innerHTML = '';
    if (importData) {
      const chip = document.createElement('div');
      chip.className = 'file-chip';
      chip.innerHTML = icon('file') + '<span><b></b><small></small></span><button class="link-btn" type="button">Pick a different file</button>';
      chip.querySelector('b').textContent = importData.fileName;
      chip.querySelector('small').textContent = importData.rows.length + (importData.rows.length === 1 ? ' answer' : ' answers');
      chip.querySelector('button').addEventListener('click', function () {
        importData = null;
        drawFileArea();
        drawMatches();
      });
      fileArea.appendChild(chip);
      return;
    }
    const zone = document.createElement('label');
    zone.className = 'drop-zone';
    zone.innerHTML = '<input type="file" accept=".csv,text/csv" hidden>' +
      '<span class="drop-icon">' + icon('upload') + '</span>' +
      '<b>Choose your file</b><span>or drag it here</span>';
    const input = zone.querySelector('input');
    function got(file) {
      page.querySelector('#file-error').textContent = '';
      readImportFile(file, function (problem) {
        if (problem) { page.querySelector('#file-error').textContent = problem; return; }
        drawFileArea();
        drawMatches();
      });
    }
    input.addEventListener('change', function () { got(input.files[0]); });
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', function () { zone.classList.remove('over'); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.classList.remove('over');
      got(e.dataTransfer.files[0]);
    });
    fileArea.appendChild(zone);
  }

  // ----- Step 3: matching questions -----
  let matches = [];
  function drawMatches() {
    const step = page.querySelector('#match-step');
    step.hidden = !importData;
    if (!importData) return;

    const saved = loadMatches();
    matches = importData.questions.map(function (q) { return guessMatch(q, saved); });

    const list = page.querySelector('#match-list');
    list.innerHTML = '';
    importData.questions.forEach(function (question, i) {
      const example = importData.rows.map(function (r) { return r[i]; }).find(Boolean) || '';
      const row = document.createElement('div');
      row.className = 'match-row';
      row.innerHTML = '<div class="match-q"><b></b><span></span></div><select class="input"></select>';
      row.querySelector('b').textContent = question || 'Question ' + (i + 1);
      row.querySelector('span').textContent = example ? 'Like: ' + example : 'No answers yet';

      const select = row.querySelector('select');
      select.setAttribute('aria-label', 'Where "' + question + '" goes');
      let group = null;
      matchChoices().forEach(function (c) {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.label;
        if (c.group) {
          if (!group) {
            group = document.createElement('optgroup');
            group.label = c.group;
            select.appendChild(group);
          }
          group.appendChild(option);
        } else select.appendChild(option);
      });
      select.value = matches[i];
      if (select.value !== matches[i]) { select.value = 'notes'; matches[i] = 'notes'; }
      row.classList.toggle('left-out', matches[i] === '');
      select.addEventListener('change', function () {
        matches[i] = select.value;
        row.classList.toggle('left-out', select.value === '');
        drawSummary();
      });
      list.appendChild(row);
    });
    drawSummary();
  }

  // How many will be added, and the button
  function drawSummary() {
    const box = page.querySelector('#import-summary');
    page.querySelector('#import-error').textContent = '';
    const result = buildImportedOrders(matches.map(function (m) { return m === 'new' ? '' : m; }));
    const count = result.orders.length;
    const past = result.orders.filter(function (o) { return daysUntil(o.due) < 0; }).length;

    box.innerHTML = '';
    const line = document.createElement('p');
    line.className = 'import-count';
    line.textContent = count === 0
      ? 'Everything in this file is already in your app.'
      : count + ' new ' + (count === 1 ? oneOrder() : w.orders.toLowerCase()) + ' ready to add.' +
        (result.skipped ? ' ' + result.skipped + ' you already have will be skipped.' : '');
    box.appendChild(line);

    if (past > 0) {
      const check = document.createElement('label');
      check.className = 'check-row past-check';
      check.innerHTML = '<input type="checkbox" id="past-done" checked><span></span>';
      check.querySelector('span').textContent = past === 1
        ? 'Mark the one that was due before today as done'
        : 'Mark the ' + past + ' that were due before today as done';
      box.appendChild(check);
    }

    const go = page.querySelector('#import-go');
    go.textContent = count === 0 ? 'Nothing new to add' : 'Add ' + count + ' ' + (count === 1 ? oneOrder() : w.orders.toLowerCase());
    go.disabled = count === 0;
  }

  page.querySelector('#import-go').addEventListener('click', function () {
    const error = page.querySelector('#import-error');
    if (!matches.includes('customer')) {
      error.textContent = 'Pick which question has the ' + singular(w.customers).toLowerCase() + '\'s name.';
      return;
    }
    if (!matches.includes('item')) {
      error.textContent = 'Pick which question says what they want.';
      return;
    }

    // Questions they chose to make into new extra details
    const final = matches.slice();
    final.forEach(function (m, i) {
      if (m !== 'new') return;
      const name = importData.questions[i].replace(/[?:]\s*$/, '').trim() || 'Question ' + (i + 1);
      const existing = profile.details.find(function (d) { return d.name.toLowerCase() === name.toLowerCase(); });
      if (existing) { final[i] = 'd:' + existing.id; return; }
      addDetail({ name: name, kind: 'text' });
      const added = profile.details[profile.details.length - 1];
      added.id += '_' + i; // so two added at once never get the same id
      final[i] = 'd:' + added.id;
    });

    // Remember the matches for next time
    const saved = loadMatches();
    importData.questions.forEach(function (q, i) { saved[q] = final[i]; });
    saveMatches(saved);

    const result = buildImportedOrders(final, true);
    const pastDone = page.querySelector('#past-done');
    result.orders.forEach(function (o, i) {
      o.id = 'o' + Date.now() + '_' + i;
      if (pastDone && pastDone.checked && daysUntil(o.due) < 0) o.status = 'done';
      orders.push(o);
    });
    saveOrders();
    saveProfile(); // new choices or details from the form

    const ids = result.orders.map(function (o) { return o.id; });
    const count = ids.length;
    importData = null;
    orderView = null;
    orderFilter = 'all';
    showPage();
    showUndo('Added ' + count + ' ' + (count === 1 ? oneOrder() : w.orders.toLowerCase()) + ' from your form', function () {
      orders = orders.filter(function (o) { return !ids.includes(o.id); });
      saveOrders();
      showPage();
    });
  });

  drawFileArea();
  drawMatches();
}

// =========================================
// CUSTOMERS
// The list is made from the orders, so nobody has to be typed in twice.
// Extra things about a person (notes, a phone number, people added by hand)
// are saved separately, keyed by their name in lowercase.
// =========================================
const CUSTOMERS_KEY = 'bizStudio.customers';
let customerInfo = loadCustomerInfo(); // { "mia rodriguez": { name, contact, notes, added } }
let customerView = null;    // null = the list, or the key of the person being looked at
let customerSort = 'recent';
let customerSearch = '';
const CARD_COLORS = ['pink', 'mint', 'sky', 'lilac', 'peach', 'butter'];

function loadCustomerInfo() {
  try { return JSON.parse(store.getItem(CUSTOMERS_KEY)) || {}; } catch (error) { return {}; }
}
function saveCustomerInfo() {
  try { store.setItem(CUSTOMERS_KEY, JSON.stringify(customerInfo)); } catch (error) { /* fine */ }
}

// "  Mia   Rodriguez " -> "mia rodriguez", so the same person always matches
function personKey(name) {
  return String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// Phone numbers get their dashes as you type: 5552013344 -> 555-201-3344.
// Emails (anything with a letter or @) are left alone.
function phoneWithDashes(text) {
  if (/[a-z@]/i.test(text)) return text;
  let digits = text.replace(/\D/g, '');
  let start = '';
  if (digits.length > 10 && digits[0] === '1') { start = '1-'; digits = digits.slice(1); }
  digits = digits.slice(0, 10);
  if (!digits) return text.trim() === '' ? '' : text;
  let out = digits.slice(0, 3);
  if (digits.length > 3) out += '-' + digits.slice(3, 6);
  if (digits.length > 6) out += '-' + digits.slice(6);
  return start + out;
}

function addPhoneDashes(input) {
  input.addEventListener('input', function (e) {
    // Only fix it up while typing at the end, so the cursor doesn't jump around
    if (input.selectionStart !== input.value.length) return;
    if (e.inputType && e.inputType.startsWith('delete')) return;
    input.value = phoneWithDashes(input.value);
  });
  input.addEventListener('blur', function () { input.value = phoneWithDashes(input.value); });
}

// "Mia Rodriguez" -> "MR"
function initialsOf(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

// The same person always gets the same color
function personColor(key) {
  let n = 0;
  for (let i = 0; i < key.length; i++) n = (n * 31 + key.charCodeAt(i)) % 997;
  return CARD_COLORS[n % CARD_COLORS.length];
}

function oneCustomer() {
  return singular(words().customers).toLowerCase();
}

// Everyone, with their orders and totals
function allCustomers() {
  const people = {};
  function person(key, name) {
    if (!people[key]) people[key] = { key: key, name: name, contact: '', notes: '', orders: [], total: 0, added: false };
    return people[key];
  }

  orders.forEach(function (o) {
    const key = personKey(o.customer);
    if (!key) return;
    const p = person(key, o.customer.trim().replace(/\s+/g, ' '));
    p.orders.push(o);
    p.total += Number(o.price) || 0;
  });

  Object.keys(customerInfo).forEach(function (key) {
    const info = customerInfo[key];
    if (!people[key] && !info.added) return; // their orders were all deleted
    const p = person(key, info.name);
    if (info.name) p.name = info.name;
    p.notes = info.notes || '';
    p.added = !!info.added;
    if (info.contact) p.contact = info.contact;
  });

  return Object.keys(people).map(function (key) {
    const p = people[key];
    // newest first
    p.orders.sort(function (a, b) { return b.due.localeCompare(a.due); });
    p.last = p.orders[0] || null;
    p.first = p.orders.length ? p.orders[p.orders.length - 1].due : '';
    p.open = p.orders.filter(isOpen).length;
    p.regular = p.orders.length >= 3;
    if (!p.contact) {
      const withContact = p.orders.find(function (o) { return o.contact; });
      p.contact = withContact ? withContact.contact : '';
    }
    return p;
  });
}

function findCustomer(key) {
  return allCustomers().find(function (p) { return p.key === key; });
}

// "Nov 14, 2026" (no weekday)
function shortDate(text) {
  return toDate(text).toLocaleDateString(appLocale(), { month: 'short', day: 'numeric', year: 'numeric' });
}

function showCustomers(page) {
  if (customerView) {
    const person = findCustomer(customerView);
    if (person) return showCustomer(page, person);
    customerView = null; // they were renamed or removed
  }

  const w = words();
  const people = allCustomers();
  const regulars = people.filter(function (p) { return p.regular; }).length;

  page.innerHTML = `
    <header class="page-head with-button">
      <div>
        <h1></h1>
        <p></p>
      </div>
      <button class="btn with-icon" id="add-person">${icon('plus')}<span></span></button>
    </header>
    <div id="add-person-box"></div>
    <div id="people-area"></div>
  `;
  page.querySelector('h1').textContent = w.customers;
  page.querySelector('.page-head p').textContent = people.length === 0
    ? 'Everyone who orders from you, in one place'
    : people.length + (people.length === 1 ? ' person' : ' people') +
      (regulars ? ', ' + regulars + (regulars === 1 ? ' comes' : ' come') + ' back often' : '');
  page.querySelector('#add-person span').textContent = 'Add a ' + oneCustomer();
  page.querySelector('#add-person').addEventListener('click', function () { showAddPerson(page); });

  const area = page.querySelector('#people-area');

  if (people.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty pink';
    empty.innerHTML = '<span class="empty-icon">' + icon('users') + '</span><h3></h3><p></p>';
    empty.querySelector('h3').textContent = 'No ' + w.customers.toLowerCase() + ' yet';
    empty.querySelector('p').textContent = usesOrders()
      ? 'When you add ' + w.orders.toLowerCase() + ', the people who ordered show up here on their own. You can also add someone yourself.'
      : 'Add the people you work for, with their phone or email, so they\'re all in one place.';
    area.appendChild(empty);
    return;
  }

  // Search and sort
  const tools = document.createElement('div');
  tools.className = 'people-tools';
  tools.innerHTML = '<input class="input search-box" type="search" placeholder="Find someone" aria-label="Find someone">' +
    '<div class="filter-tabs" role="tablist"></div>';
  const search = tools.querySelector('input');
  search.value = customerSearch;
  const tabs = tools.querySelector('.filter-tabs');
  [
    { id: 'recent', label: 'Most recent' },
    { id: 'most', label: 'Most ' + w.orders.toLowerCase() },
    { id: 'spent', label: 'Spent the most' },
    { id: 'az', label: 'A to Z' },
  ].filter(function (t) { return usesOrders() || t.id === 'az' || t.id === 'recent'; }).forEach(function (t) {
    const b = document.createElement('button');
    b.className = 'filter-tab' + (customerSort === t.id ? ' on' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', customerSort === t.id ? 'true' : 'false');
    b.textContent = t.label;
    b.addEventListener('click', function () { customerSort = t.id; showPage(); });
    tabs.appendChild(b);
  });
  area.appendChild(tools);

  const grid = document.createElement('div');
  grid.className = 'people-grid';
  area.appendChild(grid);

  function drawGrid() {
    const find = customerSearch.trim().toLowerCase();
    const shown = people.filter(function (p) {
      return !find || p.name.toLowerCase().includes(find) || p.contact.toLowerCase().includes(find);
    });
    shown.sort(function (a, b) {
      if (customerSort === 'az') return a.name.localeCompare(b.name);
      if (customerSort === 'most') return b.orders.length - a.orders.length || a.name.localeCompare(b.name);
      if (customerSort === 'spent') return b.total - a.total || a.name.localeCompare(b.name);
      const aDue = a.last ? a.last.due : '';
      const bDue = b.last ? b.last.due : '';
      return bDue.localeCompare(aDue) || a.name.localeCompare(b.name);
    });

    grid.innerHTML = '';
    if (shown.length === 0) {
      const none = document.createElement('p');
      none.className = 'list-empty';
      none.textContent = 'Nobody matches "' + customerSearch.trim() + '".';
      grid.appendChild(none);
      return;
    }
    shown.forEach(function (p) { grid.appendChild(personCard(p)); });
  }
  search.addEventListener('input', function () {
    customerSearch = search.value;
    drawGrid();
  });
  drawGrid();
}

// One card in the list
function personCard(p) {
  const w = words();
  const card = document.createElement('button');
  card.className = 'person-card ' + personColor(p.key);
  card.innerHTML = `
    <span class="person-top">
      <span class="initials"></span>
      <span class="person-name-box">
        <b class="person-name"></b>
        <span class="person-contact"></span>
      </span>
    </span>
    <span class="person-badges"></span>
    <span class="person-stats">
      <span><b class="st-count"></b><small class="st-count-label"></small></span>
      <span><b class="st-total"></b><small>total</small></span>
    </span>
    <span class="person-last"></span>
  `;
  card.querySelector('.initials').textContent = initialsOf(p.name);
  card.querySelector('.person-name').textContent = p.name;
  card.querySelector('.person-contact').textContent = p.contact || 'No phone or email yet';
  card.querySelector('.person-contact').classList.toggle('none', !p.contact);
  card.querySelector('.st-count').textContent = p.orders.length;
  card.querySelector('.st-count-label').textContent = p.orders.length === 1 ? oneOrder() : w.orders.toLowerCase();
  card.querySelector('.st-total').textContent = money(p.total);
  card.querySelector('.person-last').textContent = p.last
    ? 'Last: ' + p.last.item + ', ' + shortDate(p.last.due)
    : 'No ' + w.orders.toLowerCase() + ' yet';

  const badges = card.querySelector('.person-badges');
  personBadges(p).forEach(function (b) { badges.appendChild(b); });
  if (!badges.children.length) badges.remove();
  if (!usesOrders()) {
    card.querySelector('.person-stats').remove();
    card.querySelector('.person-last').remove();
  }

  card.addEventListener('click', function () {
    customerView = p.key;
    showPage();
    window.scrollTo(0, 0);
  });
  return card;
}

// Little tags like "Comes back often"
function personBadges(p) {
  const list = [];
  function badge(text, color) {
    const b = document.createElement('span');
    b.className = 'badge ' + color;
    b.textContent = text;
    list.push(b);
  }
  if (p.regular) badge('Comes back often', 'lilac');
  if (p.open) badge(p.open === 1 ? '1 ' + oneOrder() + ' coming up' : p.open + ' ' + words().orders.toLowerCase() + ' coming up', 'butter');
  return list;
}

// "Add a customer" mini form at the top of the list
function showAddPerson(page) {
  const box = page.querySelector('#add-person-box');
  if (box.children.length) { box.querySelector('input').focus(); return; }
  box.innerHTML = `
    <div class="add-person">
      <div class="add-person-fields">
        <div>
          <label class="label" for="new-name">Name</label>
          <input class="input" id="new-name" autocomplete="off" placeholder="Mia Rodriguez">
        </div>
        <div>
          <label class="label" for="new-contact">Phone or email (optional)</label>
          <input class="input" id="new-contact" autocomplete="off" placeholder="555-123-4567 or an email">
        </div>
      </div>
      <p class="error" id="new-error" role="alert"></p>
      <div class="form-actions">
        <button class="btn" id="new-add"></button>
        <button class="btn secondary" id="new-cancel">Never mind</button>
      </div>
    </div>
  `;
  box.querySelector('#new-add').textContent = 'Add ' + oneCustomer();
  const name = box.querySelector('#new-name');
  addPhoneDashes(box.querySelector('#new-contact'));
  name.focus();
  box.querySelector('#new-cancel').addEventListener('click', function () { box.innerHTML = ''; });

  function add() {
    const typed = name.value.trim().replace(/\s+/g, ' ');
    if (!typed) {
      box.querySelector('#new-error').textContent = 'Type their name.';
      name.classList.add('has-error');
      return;
    }
    const key = personKey(typed);
    if (!findCustomer(key)) {
      customerInfo[key] = { name: typed, contact: box.querySelector('#new-contact').value.trim(), notes: '', added: true };
      saveCustomerInfo();
    }
    customerView = key; // open their page (or the one that already exists)
    showPage();
  }
  box.querySelector('#new-add').addEventListener('click', add);
  box.querySelectorAll('input').forEach(function (input) {
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });
  });
}

// ---------- One person's page ----------
function showCustomer(page, p) {
  const w = words();
  page.innerHTML = `
    <button class="back-link" id="person-back">${icon('back')}<span></span></button>
    <div class="person-page">
      <header class="person-head ${personColor(p.key)}">
        <span class="initials big"></span>
        <div class="person-head-text">
          <h1></h1>
          <p class="person-contact-line"></p>
          <div class="person-badges"></div>
        </div>
        <button class="btn secondary small" id="person-edit">Edit</button>
      </header>
      <div id="person-edit-box"></div>

      <div class="stat-tiles">
        <div class="stat-tile sky"><b id="t-count"></b><span id="t-count-label"></span></div>
        <div class="stat-tile mint"><b id="t-total"></b><span>total</span></div>
        <div class="stat-tile peach"><b id="t-first"></b><span id="t-first-label"></span></div>
      </div>

      <section>
        <div class="person-orders-head">
          <h2></h2>
          <button class="btn with-icon" id="person-new-order">${icon('plus')}<span></span></button>
        </div>
        <div id="person-orders"></div>
        <button class="link-btn start-over" id="person-remove" hidden></button>
      </section>
    </div>
  `;
  page.querySelector('#person-back span').textContent = 'Back to ' + w.customers;
  page.querySelector('.initials').textContent = initialsOf(p.name);
  page.querySelector('h1').textContent = p.name;
  const contactLine = page.querySelector('.person-contact-line');
  contactLine.textContent = p.contact || 'No phone or email yet';
  contactLine.classList.toggle('none', !p.contact);
  const badges = page.querySelector('.person-badges');
  personBadges(p).forEach(function (b) { badges.appendChild(b); });

  page.querySelector('#t-count').textContent = p.orders.length;
  page.querySelector('#t-count-label').textContent = p.orders.length === 1 ? oneOrder() : w.orders.toLowerCase();
  page.querySelector('#t-total').textContent = money(p.total);
  page.querySelector('#t-first').textContent = p.first ? shortDate(p.first) : 'Not yet';
  page.querySelector('#t-first-label').textContent = 'first ' + oneOrder();

  function goBack() {
    customerView = null;
    showPage();
  }
  page.querySelector('#person-back').addEventListener('click', goBack);

  // Their orders
  page.querySelector('.person-orders-head h2').textContent = 'Their ' + w.orders.toLowerCase();
  page.querySelector('#person-new-order span').textContent = 'New ' + oneOrder() + ' for ' + p.name.split(' ')[0];
  page.querySelector('#person-new-order').addEventListener('click', function () {
    orderPrefill = { customer: p.name, contact: p.contact };
    openOrderForm('new');
  });

  const box = page.querySelector('#person-orders');
  if (p.orders.length) {
    const list = document.createElement('div');
    list.className = 'order-list';
    p.orders.forEach(function (o) { list.appendChild(orderRow(o)); });
    box.appendChild(list);
  } else {
    const none = document.createElement('p');
    none.className = 'list-empty';
    none.textContent = 'No ' + w.orders.toLowerCase() + ' yet.';
    box.appendChild(none);

    // Someone added by hand with no orders can be removed
    const remove = page.querySelector('#person-remove');
    remove.hidden = false;
    remove.textContent = 'Remove ' + p.name;
    remove.addEventListener('click', function () {
      const saved = customerInfo[p.key];
      delete customerInfo[p.key];
      saveCustomerInfo();
      customerView = null;
      showPage();
      showUndo(p.name + ' removed', function () {
        customerInfo[p.key] = saved;
        saveCustomerInfo();
        showPage();
      });
    });
  }

  page.querySelector('#person-edit').addEventListener('click', function () { showPersonEdit(page, p); });

  // No orders or jobs for this business: just their info and a way to remove them
  if (!usesOrders()) {
    page.querySelector('.stat-tiles').remove();
    page.querySelector('.person-orders-head').remove();
    box.remove();
  }
}

// Changing someone's name or phone/email
function showPersonEdit(page, p) {
  const box = page.querySelector('#person-edit-box');
  if (box.children.length) return;
  box.innerHTML = `
    <div class="add-person">
      <div class="add-person-fields">
        <div>
          <label class="label" for="edit-name">Name</label>
          <input class="input" id="edit-name" autocomplete="off">
        </div>
        <div>
          <label class="label" for="edit-contact">Phone or email</label>
          <input class="input" id="edit-contact" autocomplete="off" placeholder="555-123-4567 or an email">
        </div>
      </div>
      <p class="error" id="edit-error" role="alert"></p>
      <div class="form-actions">
        <button class="btn" id="edit-save">Save changes</button>
        <button class="btn secondary" id="edit-cancel">Cancel</button>
      </div>
    </div>
  `;
  const nameBox = box.querySelector('#edit-name');
  const contactBox = box.querySelector('#edit-contact');
  addPhoneDashes(contactBox);
  nameBox.value = p.name;
  contactBox.value = p.contact;
  nameBox.focus();
  box.querySelector('#edit-cancel').addEventListener('click', function () { box.innerHTML = ''; });

  box.querySelector('#edit-save').addEventListener('click', function () {
    const name = nameBox.value.trim().replace(/\s+/g, ' ');
    if (!name) {
      box.querySelector('#edit-error').textContent = 'Type their name.';
      nameBox.classList.add('has-error');
      return;
    }
    const newKey = personKey(name);
    const old = customerInfo[p.key] || { notes: p.notes, added: p.added };
    delete customerInfo[p.key];

    // If the new name belongs to someone already here, they become one person
    const other = customerInfo[newKey] || {};
    customerInfo[newKey] = {
      name: name,
      contact: contactBox.value.trim(),
      notes: [other.notes, old.notes].filter(Boolean).join('\n'),
      added: !!(old.added || other.added),
    };
    saveCustomerInfo();

    // Their orders get the new name too
    p.orders.forEach(function (o) { o.customer = name; });
    saveOrders();

    customerView = newKey;
    showPage();
  });
}

// =========================================
// CALENDAR
// A month with every order on the day it's due. Click a day to see what's due.
// =========================================
let calendarMonth = null;       // first day of the month being shown, like "2026-11-01" (null = this month)
let calendarDay = todayText();  // the day that's picked

function dateText(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// Day, Week, Month or Year (remembered on this computer)
const CAL_VIEWS = [['day', 'Day'], ['week', 'Week'], ['month', 'Month'], ['year', 'Year']];
let calendarView = 'month';
try { calendarView = localStorage.getItem('bizStudio.calendarView') || 'month'; } catch (error) { /* fine */ }
if (!CAL_VIEWS.some(function (v) { return v[0] === calendarView; })) calendarView = 'month';

function setCalendarView(view) {
  calendarView = view;
  try { localStorage.setItem('bizStudio.calendarView', view); } catch (error) { /* fine */ }
  if (view === 'month') {
    const d = toDate(calendarDay);
    calendarMonth = dateText(new Date(d.getFullYear(), d.getMonth(), 1));
  }
  showPage();
}

function addDays(text, n) {
  const d = toDate(text);
  return dateText(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
}

// The Sunday that starts a day's week
function weekStart(text) {
  return addDays(text, -toDate(text).getDay());
}

// ---------- Holidays: worked out for any year, for the country they picked in setup ----------
const COUNTRIES = [
  { id: 'AU', label: 'Australia' },
  { id: 'BR', label: 'Brazil' },
  { id: 'CA', label: 'Canada' },
  { id: 'CN', label: 'China' },
  { id: 'FR', label: 'France' },
  { id: 'DE', label: 'Germany' },
  { id: 'IN', label: 'India' },
  { id: 'ID', label: 'Indonesia' },
  { id: 'IE', label: 'Ireland' },
  { id: 'IT', label: 'Italy' },
  { id: 'JP', label: 'Japan' },
  { id: 'MX', label: 'Mexico' },
  { id: 'NZ', label: 'New Zealand' },
  { id: 'PH', label: 'Philippines' },
  { id: 'PT', label: 'Portugal' },
  { id: 'KR', label: 'South Korea' },
  { id: 'ES', label: 'Spain' },
  { id: 'UA', label: 'Ukraine' },
  { id: 'GB', label: 'United Kingdom' },
  { id: 'US', label: 'United States' },
  { id: 'VN', label: 'Vietnam' },
  { id: 'none', label: 'Somewhere else (no holidays)' },
];
function findCountry(id) {
  return COUNTRIES.find(function (c) { return c.id === id; }) || COUNTRIES.find(function (c) { return c.id === 'US'; });
}

// Holidays that follow the moon move every year, so their dates are listed here (month-day)
const LUNAR_NEW_YEAR = { 2025: '01-29', 2026: '02-17', 2027: '02-06', 2028: '01-26', 2029: '02-13', 2030: '02-03', 2031: '01-23', 2032: '02-11', 2033: '01-31', 2034: '02-19', 2035: '02-08' };
const MID_AUTUMN = { 2025: '10-06', 2026: '09-25', 2027: '09-15', 2028: '10-03', 2029: '09-22', 2030: '09-12' };
const DIWALI = { 2025: '10-20', 2026: '11-08', 2027: '10-29', 2028: '10-17', 2029: '11-05', 2030: '10-26' };
const HOLI = { 2025: '03-14', 2026: '03-04', 2027: '03-22', 2028: '03-11', 2029: '03-01', 2030: '03-20' };
// A good first guess, from the computer's language setting (like "en-CA")
function guessCountry() {
  let region = '';
  try { region = ((navigator.languages && navigator.languages[0]) || navigator.language || '').split('-')[1] || ''; } catch (error) { /* fine */ }
  region = region.toUpperCase();
  if (region === 'UK') region = 'GB';
  return COUNTRIES.some(function (c) { return c.id === region; }) ? region : 'US';
}
// Settings: change the country (for the holidays on the calendar)
function pickCountry() {
  openWindow({
    title: 'Where are you based?',
    saveLabel: 'Save',
    html: `
      <select class="input" id="country-pick" aria-label="Where are you based?"></select>
    `,
    fill: function (box) {
      const select = box.querySelector('#country-pick');
      COUNTRIES.forEach(function (c) {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.label;
        select.appendChild(option);
      });
      select.value = myCountry();
    },
    onSave: function (box) {
      profile.country = box.querySelector('#country-pick').value;
      saveProfile();
      showPage();
    },
  });
}

function myCountry() {
  return profile.country || guessCountry();
}

const holidayCache = {};
function holidaysFor(year, country) {
  country = country || myCountry();
  const cacheKey = country + year;
  if (holidayCache[cacheKey]) return holidayCache[cacheKey];
  const list = {};
  function put(month, day, name) {
    const key = dateText(new Date(year, month, day));
    list[key] = (list[key] ? list[key] + ' · ' : '') + name;
  }
  // The nth weekday of a month (weekday 0 = Sunday). n = -1 means the last one.
  function nth(month, weekday, n) {
    if (n === -1) {
      const last = new Date(year, month + 1, 0);
      return last.getDate() - ((last.getDay() - weekday + 7) % 7);
    }
    const first = new Date(year, month, 1).getDay();
    return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
  }
  // Easter Sunday
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const em = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const ed = ((h + l - 7 * m + 114) % 31) + 1;
  function easter(plus, name) { put(em, ed + plus, name); }

  if (country === 'US') {
    const thanksgiving = nth(10, 4, 4);
    put(0, 1, 'New Year\'s Day');
    put(0, nth(0, 1, 3), 'Martin Luther King Jr. Day');
    put(1, 14, 'Valentine\'s Day');
    put(1, nth(1, 1, 3), 'Presidents\' Day');
    put(2, 17, 'St. Patrick\'s Day');
    easter(0, 'Easter');
    put(4, nth(4, 0, 2), 'Mother\'s Day');
    put(4, nth(4, 1, -1), 'Memorial Day');
    put(5, nth(5, 0, 3), 'Father\'s Day');
    put(5, 19, 'Juneteenth');
    put(6, 4, 'Independence Day');
    put(8, nth(8, 1, 1), 'Labor Day');
    put(9, nth(9, 1, 2), 'Indigenous Peoples\' Day');
    put(9, 31, 'Halloween');
    put(10, 11, 'Veterans Day');
    put(10, thanksgiving, 'Thanksgiving');
    put(10, thanksgiving + 1, 'Black Friday');
    put(10, thanksgiving + 2, 'Small Business Saturday');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'CA') {
    const may24 = new Date(year, 4, 24);
    put(0, 1, 'New Year\'s Day');
    put(1, nth(1, 1, 3), 'Family Day');
    put(1, 14, 'Valentine\'s Day');
    put(2, 17, 'St. Patrick\'s Day');
    easter(-2, 'Good Friday');
    easter(0, 'Easter');
    put(4, nth(4, 0, 2), 'Mother\'s Day');
    put(4, 24 - ((may24.getDay() + 6) % 7), 'Victoria Day');
    put(5, nth(5, 0, 3), 'Father\'s Day');
    put(6, 1, 'Canada Day');
    put(7, nth(7, 1, 1), 'Civic Holiday');
    put(8, nth(8, 1, 1), 'Labour Day');
    put(8, 30, 'Truth and Reconciliation Day');
    put(9, nth(9, 1, 2), 'Thanksgiving');
    put(9, 31, 'Halloween');
    put(10, 11, 'Remembrance Day');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas');
    put(11, 26, 'Boxing Day');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'MX') {
    put(0, 1, 'New Year\'s Day');
    put(0, 6, 'Three Kings Day');
    put(1, nth(1, 1, 1), 'Constitution Day');
    put(1, 14, 'Valentine\'s Day');
    put(2, nth(2, 1, 3), 'Benito Juárez\'s Birthday');
    easter(-3, 'Holy Thursday');
    easter(-2, 'Good Friday');
    easter(0, 'Easter');
    put(3, 30, 'Children\'s Day');
    put(4, 1, 'Labor Day');
    put(4, 5, 'Cinco de Mayo');
    put(4, 10, 'Mother\'s Day');
    put(5, nth(5, 0, 3), 'Father\'s Day');
    put(8, 16, 'Independence Day');
    put(10, 1, 'Day of the Dead');
    put(10, 2, 'Day of the Dead');
    put(10, nth(10, 1, 3), 'Revolution Day');
    put(11, 12, 'Day of the Virgin of Guadalupe');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'GB') {
    put(0, 1, 'New Year\'s Day');
    put(1, 14, 'Valentine\'s Day');
    easter(-21, 'Mother\'s Day');
    easter(-2, 'Good Friday');
    easter(0, 'Easter Sunday');
    easter(1, 'Easter Monday');
    put(4, nth(4, 1, 1), 'Early May bank holiday');
    put(4, nth(4, 1, -1), 'Spring bank holiday');
    put(5, nth(5, 0, 3), 'Father\'s Day');
    put(7, nth(7, 1, -1), 'Summer bank holiday');
    put(9, 31, 'Halloween');
    put(10, 5, 'Bonfire Night');
    put(10, nth(10, 0, 2), 'Remembrance Sunday');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas Day');
    put(11, 26, 'Boxing Day');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'IE') {
    put(0, 1, 'New Year\'s Day');
    put(1, nth(1, 1, 1), 'St. Brigid\'s Day bank holiday');
    put(1, 14, 'Valentine\'s Day');
    easter(-21, 'Mother\'s Day');
    put(2, 17, 'St. Patrick\'s Day');
    easter(-2, 'Good Friday');
    easter(0, 'Easter Sunday');
    easter(1, 'Easter Monday');
    put(4, nth(4, 1, 1), 'May bank holiday');
    put(5, nth(5, 1, 1), 'June bank holiday');
    put(5, nth(5, 0, 3), 'Father\'s Day');
    put(7, nth(7, 1, 1), 'August bank holiday');
    put(9, nth(9, 1, -1), 'October bank holiday');
    put(9, 31, 'Halloween');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas Day');
    put(11, 26, 'St. Stephen\'s Day');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'AU') {
    put(0, 1, 'New Year\'s Day');
    put(0, 26, 'Australia Day');
    put(1, 14, 'Valentine\'s Day');
    easter(-2, 'Good Friday');
    easter(0, 'Easter Sunday');
    easter(1, 'Easter Monday');
    put(3, 25, 'Anzac Day');
    put(4, nth(4, 0, 2), 'Mother\'s Day');
    put(5, nth(5, 1, 2), 'King\'s Birthday');
    put(8, nth(8, 0, 1), 'Father\'s Day');
    put(9, 31, 'Halloween');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas Day');
    put(11, 26, 'Boxing Day');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'NZ') {
    put(0, 1, 'New Year\'s Day');
    put(0, 2, 'Day after New Year\'s');
    put(1, 6, 'Waitangi Day');
    put(1, 14, 'Valentine\'s Day');
    easter(-2, 'Good Friday');
    easter(0, 'Easter Sunday');
    easter(1, 'Easter Monday');
    put(3, 25, 'Anzac Day');
    put(4, nth(4, 0, 2), 'Mother\'s Day');
    put(5, nth(5, 1, 1), 'King\'s Birthday');
    put(8, nth(8, 0, 1), 'Father\'s Day');
    put(9, nth(9, 1, 4), 'Labour Day');
    put(9, 31, 'Halloween');
    put(11, 25, 'Christmas Day');
    put(11, 26, 'Boxing Day');
    put(11, 31, 'New Year\'s Eve');
  }
  // Moving holidays from the tables above
  function fromTable(table, name) {
    const md = table[year];
    if (md) put(Number(md.slice(0, 2)) - 1, Number(md.slice(3)), name);
  }
  // Orthodox Easter (Ukraine): worked out on the old calendar, then moved 13 days
  function orthodoxEaster(name) {
    const oa = year % 4, ob = year % 7, oc = year % 19;
    const od = (19 * oc + 15) % 30, oe = (2 * oa + 4 * ob - od + 34) % 7;
    const om = Math.floor((od + oe + 114) / 31) - 1;
    const oday = ((od + oe + 114) % 31) + 1;
    put(om, oday + 13, name);
  }

  if (country === 'BR') {
    put(0, 1, 'New Year\'s Day');
    easter(-48, 'Carnival');
    easter(-47, 'Carnival');
    easter(-2, 'Good Friday');
    easter(0, 'Easter');
    put(3, 21, 'Tiradentes Day');
    put(4, 1, 'Labor Day');
    put(4, nth(4, 0, 2), 'Mother\'s Day');
    easter(60, 'Corpus Christi');
    put(5, 12, 'Valentine\'s Day');
    put(7, nth(7, 0, 2), 'Father\'s Day');
    put(8, 7, 'Independence Day');
    put(9, 12, 'Children\'s Day');
    put(10, 2, 'All Souls\' Day');
    put(10, 15, 'Republic Day');
    put(10, 20, 'Black Consciousness Day');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'CN') {
    put(0, 1, 'New Year\'s Day');
    fromTable(LUNAR_NEW_YEAR, 'Lunar New Year');
    put(2, 8, 'Women\'s Day');
    put(4, 1, 'Labor Day');
    put(5, 1, 'Children\'s Day');
    fromTable(MID_AUTUMN, 'Mid-Autumn Festival');
    put(9, 1, 'National Day');
    put(11, 25, 'Christmas');
  }
  if (country === 'FR') {
    put(0, 1, 'New Year\'s Day');
    put(1, 14, 'Valentine\'s Day');
    easter(0, 'Easter');
    easter(1, 'Easter Monday');
    put(4, 1, 'Labor Day');
    put(4, 8, 'Victory Day');
    easter(39, 'Ascension Day');
    easter(50, 'Whit Monday');
    put(4, nth(4, 0, -1), 'Mother\'s Day');
    put(5, nth(5, 0, 3), 'Father\'s Day');
    put(6, 14, 'Bastille Day');
    put(7, 15, 'Assumption Day');
    put(9, 31, 'Halloween');
    put(10, 1, 'All Saints\' Day');
    put(10, 11, 'Armistice Day');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'DE') {
    put(0, 1, 'New Year\'s Day');
    put(1, 14, 'Valentine\'s Day');
    easter(-2, 'Good Friday');
    easter(0, 'Easter Sunday');
    easter(1, 'Easter Monday');
    put(4, 1, 'Labor Day');
    put(4, nth(4, 0, 2), 'Mother\'s Day');
    easter(39, 'Ascension Day');
    easter(50, 'Whit Monday');
    put(9, 3, 'German Unity Day');
    put(9, 31, 'Halloween');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas Day');
    put(11, 26, 'Boxing Day');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'IN') {
    put(0, 1, 'New Year\'s Day');
    put(0, 26, 'Republic Day');
    fromTable(HOLI, 'Holi');
    put(4, nth(4, 0, 2), 'Mother\'s Day');
    put(7, 15, 'Independence Day');
    put(9, 2, 'Gandhi Jayanti');
    fromTable(DIWALI, 'Diwali');
    put(10, 14, 'Children\'s Day');
    put(11, 25, 'Christmas');
  }
  if (country === 'ID') {
    put(0, 1, 'New Year\'s Day');
    fromTable(LUNAR_NEW_YEAR, 'Lunar New Year');
    easter(-2, 'Good Friday');
    easter(0, 'Easter');
    put(4, 1, 'Labor Day');
    easter(39, 'Ascension Day');
    put(5, 1, 'Pancasila Day');
    put(7, 17, 'Independence Day');
    put(11, 25, 'Christmas');
  }
  if (country === 'IT') {
    put(0, 1, 'New Year\'s Day');
    put(0, 6, 'Three Kings Day');
    put(1, 14, 'Valentine\'s Day');
    put(2, 19, 'Father\'s Day');
    easter(0, 'Easter');
    easter(1, 'Easter Monday');
    put(3, 25, 'Liberation Day');
    put(4, 1, 'Labor Day');
    put(4, nth(4, 0, 2), 'Mother\'s Day');
    put(5, 2, 'Republic Day');
    put(7, 15, 'Assumption Day');
    put(10, 1, 'All Saints\' Day');
    put(11, 8, 'Immaculate Conception');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas');
    put(11, 26, 'St. Stephen\'s Day');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'JP') {
    put(0, 1, 'New Year\'s Day');
    put(0, nth(0, 1, 2), 'Coming of Age Day');
    put(1, 11, 'National Foundation Day');
    put(1, 14, 'Valentine\'s Day');
    put(1, 23, 'Emperor\'s Birthday');
    put(4, 3, 'Constitution Day');
    put(4, 5, 'Children\'s Day');
    put(4, nth(4, 0, 2), 'Mother\'s Day');
    put(10, 3, 'Culture Day');
    put(10, 23, 'Labor Thanksgiving Day');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'PH') {
    put(0, 1, 'New Year\'s Day');
    fromTable(LUNAR_NEW_YEAR, 'Lunar New Year');
    put(1, 14, 'Valentine\'s Day');
    easter(-3, 'Holy Thursday');
    easter(-2, 'Good Friday');
    easter(0, 'Easter');
    put(3, 9, 'Day of Valor');
    put(4, 1, 'Labor Day');
    put(4, nth(4, 0, 2), 'Mother\'s Day');
    put(5, 12, 'Independence Day');
    put(5, nth(5, 0, 3), 'Father\'s Day');
    put(7, nth(7, 1, -1), 'National Heroes Day');
    put(10, 1, 'All Saints\' Day');
    put(10, 30, 'Bonifacio Day');
    put(11, 8, 'Immaculate Conception');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas');
    put(11, 30, 'Rizal Day');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'PT') {
    put(0, 1, 'New Year\'s Day');
    easter(-47, 'Carnival');
    put(2, 19, 'Father\'s Day');
    easter(-2, 'Good Friday');
    easter(0, 'Easter');
    put(3, 25, 'Freedom Day');
    put(4, 1, 'Labor Day');
    put(4, nth(4, 0, 1), 'Mother\'s Day');
    easter(60, 'Corpus Christi');
    put(5, 10, 'Portugal Day');
    put(7, 15, 'Assumption Day');
    put(9, 5, 'Republic Day');
    put(10, 1, 'All Saints\' Day');
    put(11, 1, 'Restoration of Independence');
    put(11, 8, 'Immaculate Conception');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'KR') {
    put(0, 1, 'New Year\'s Day');
    fromTable(LUNAR_NEW_YEAR, 'Lunar New Year');
    put(1, 14, 'Valentine\'s Day');
    put(2, 1, 'Independence Movement Day');
    put(4, 5, 'Children\'s Day');
    put(5, 6, 'Memorial Day');
    put(7, 15, 'Liberation Day');
    fromTable(MID_AUTUMN, 'Mid-Autumn Festival');
    put(9, 3, 'National Foundation Day');
    put(9, 9, 'Hangul Day');
    put(11, 25, 'Christmas');
  }
  if (country === 'ES') {
    put(0, 1, 'New Year\'s Day');
    put(0, 6, 'Three Kings Day');
    put(1, 14, 'Valentine\'s Day');
    put(2, 19, 'Father\'s Day');
    easter(-3, 'Holy Thursday');
    easter(-2, 'Good Friday');
    easter(0, 'Easter');
    put(4, 1, 'Labor Day');
    put(4, nth(4, 0, 1), 'Mother\'s Day');
    put(7, 15, 'Assumption Day');
    put(9, 12, 'National Day');
    put(10, 1, 'All Saints\' Day');
    put(11, 6, 'Constitution Day');
    put(11, 8, 'Immaculate Conception');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'UA') {
    put(0, 1, 'New Year\'s Day');
    put(1, 14, 'Valentine\'s Day');
    put(2, 8, 'Women\'s Day');
    orthodoxEaster('Orthodox Easter');
    put(4, 1, 'Labor Day');
    put(4, nth(4, 0, 2), 'Mother\'s Day');
    put(5, 28, 'Constitution Day');
    put(7, 24, 'Independence Day');
    put(9, 1, 'Defenders Day');
    put(11, 25, 'Christmas');
    put(11, 31, 'New Year\'s Eve');
  }
  if (country === 'VN') {
    put(0, 1, 'New Year\'s Day');
    fromTable(LUNAR_NEW_YEAR, 'Lunar New Year');
    put(1, 14, 'Valentine\'s Day');
    put(2, 8, 'Women\'s Day');
    put(3, 30, 'Reunification Day');
    put(4, 1, 'Labor Day');
    put(5, 1, 'Children\'s Day');
    fromTable(MID_AUTUMN, 'Mid-Autumn Festival');
    put(8, 2, 'National Day');
    put(11, 24, 'Christmas Eve');
    put(11, 25, 'Christmas');
  }
  holidayCache[cacheKey] = list;
  return list;
}
function holidayOn(day) {
  return holidaysFor(toDate(day).getFullYear())[day] || '';
}

function showCalendar(page) {
  const w = words();
  const today = todayText();
  if (!calendarDay) calendarDay = today;
  const view = calendarView;
  const month = calendarMonth ? toDate(calendarMonth) : new Date(toDate(today).getFullYear(), toDate(today).getMonth(), 1);

  // Orders, events, to-dos and sticky notes by day
  const byDay = {};
  const eventsByDay = {};
  const tasksByDay = {};
  const notesByDay = {};
  orders.forEach(function (o) {
    if (!o.due) return;
    (byDay[o.due] = byDay[o.due] || []).push(o);
  });
  events.forEach(function (e) { (eventsByDay[e.date] = eventsByDay[e.date] || []).push(e); });
  tasks.forEach(function (t) {
    if (t.due && !t.done) (tasksByDay[t.due] = tasksByDay[t.due] || []).push(t);
  });
  notes.forEach(function (n) { if (n.date) (notesByDay[n.date] = notesByDay[n.date] || []).push(n); });
  [byDay, eventsByDay].forEach(function (lists) {
    Object.keys(lists).forEach(function (day) {
      lists[day].sort(function (a, b) { return (a.time || '99').localeCompare(b.time || '99'); });
    });
  });

  // Everything on one day, as little labels: events, then orders, then to-dos, then notes
  function itemsFor(day, withHoliday) {
    const all = [];
    const holiday = withHoliday === false ? '' : holidayOn(day);
    if (holiday) all.push({ cls: 'holiday', text: holiday, title: holiday, open: function () { calendarDay = day; setCalendarView('day'); } });
    (eventsByDay[day] || []).forEach(function (e) {
      all.push({ cls: 'event', text: e.title, time: e.time, title: e.title + (e.time ? ' at ' + niceTime(e.time) : ''),
        open: function () { editEvent(e); } });
    });
    (byDay[day] || []).forEach(function (o) {
      all.push({ cls: urgency(o) === 'late' ? 'late' : findStatus(o.status).color, text: o.customer.split(' ')[0],
        long: o.customer + ': ' + o.item, time: o.time,
        title: o.customer + ': ' + o.item + (o.time ? ' at ' + niceTime(o.time) : ''),
        open: function () { openOrderForm(o.id); } });
    });
    (tasksByDay[day] || []).forEach(function (t) {
      all.push({ cls: 'todo', text: t.text, title: 'To-do: ' + t.text,
        open: function () { calendarDay = day; setCalendarView('day'); } });
    });
    (notesByDay[day] || []).forEach(function (n) {
      all.push({ cls: 'sticky', text: firstLine(n.text), title: 'Sticky note: ' + n.text, color: noteColor(n.color),
        open: function () { goTo('notes'); focusNoteNow(n); } });
    });
    return all;
  }

  function pill(thing, tag) {
    const el = document.createElement(tag || 'span');
    el.className = 'cal-pill ' + thing.cls;
    el.textContent = thing.text;
    el.title = thing.title;
    if (thing.color) el.style.setProperty('--note', thing.color);
    return el;
  }

  page.innerHTML = `
    <header class="page-head with-button cal-head">
      <div>
        <h1>Calendar</h1>
        <p></p>
      </div>
      <div class="cal-controls">
        <div class="view-switch" role="tablist" aria-label="Calendar view"></div>
        <div class="month-nav">
          <button class="btn secondary small" id="cal-today">Today</button>
          <button class="round-btn" id="cal-prev">${icon('back')}</button>
          <h2 class="month-name"></h2>
          <button class="round-btn" id="cal-next">${icon('chevron')}</button>
        </div>
      </div>
    </header>
    <div class="cal-body cal-view-${view}"></div>
  `;
  const body = page.querySelector('.cal-body');
  const sub = page.querySelector('.page-head p');
  const title = page.querySelector('.month-name');

  // Day | Week | Month | Year
  const switcher = page.querySelector('.view-switch');
  CAL_VIEWS.forEach(function (v) {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', v[0] === view ? 'true' : 'false');
    b.textContent = v[1];
    b.addEventListener('click', function () { if (v[0] !== view) setCalendarView(v[0]); });
    switcher.appendChild(b);
  });

  // Back and forward move by a day, a week, a month or a year
  const names = { day: ['Day before', 'Next day'], week: ['Last week', 'Next week'], month: ['Last month', 'Next month'], year: ['Last year', 'Next year'] };
  page.querySelector('#cal-prev').setAttribute('aria-label', names[view][0]);
  page.querySelector('#cal-next').setAttribute('aria-label', names[view][1]);
  function move(change) {
    if (view === 'day') calendarDay = addDays(calendarDay, change);
    if (view === 'week') calendarDay = addDays(calendarDay, change * 7);
    if (view === 'month') calendarMonth = dateText(new Date(month.getFullYear(), month.getMonth() + change, 1));
    if (view === 'year') {
      const d = toDate(calendarDay);
      calendarDay = dateText(new Date(d.getFullYear() + change, d.getMonth(), 1));
    }
    showPage();
  }
  page.querySelector('#cal-prev').addEventListener('click', function () { move(-1); });
  page.querySelector('#cal-next').addEventListener('click', function () { move(1); });
  page.querySelector('#cal-today').addEventListener('click', function () {
    calendarMonth = null;
    calendarDay = today;
    showPage();
  });

  if (view === 'day') drawDayView();
  else if (view === 'week') drawWeekView();
  else if (view === 'year') drawYearView();
  else drawMonthView();

  // ---------- Month ----------
  function drawMonthView() {
    title.textContent = month.toLocaleDateString(appLocale(), { month: 'long', year: 'numeric' });
    const monthWord = month.toLocaleDateString(appLocale(), { month: 'long' });
    const inMonth = orders.filter(function (o) {
      const d = toDate(o.due);
      return o.due && d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    }).length;
    const eventsInMonth = events.filter(function (e) {
      const d = toDate(e.date);
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    }).length;
    sub.textContent = !usesOrders()
      ? (eventsInMonth ? eventsInMonth + (eventsInMonth === 1 ? ' event' : ' events') + ' in ' : 'Nothing planned in ') + monthWord + (eventsInMonth ? '' : ' yet')
      : inMonth === 0
      ? 'Nothing due in ' + monthWord + ' yet'
      : inMonth + ' ' + (inMonth === 1 ? oneOrder() : w.orders.toLowerCase()) + ' due in ' + monthWord;

    body.innerHTML = `
      <div class="calendar-layout">
        <div class="calendar">
          <div class="cal-weekdays"></div>
          <div class="cal-grid"></div>
        </div>
        <aside class="day-panel" id="day-panel"></aside>
      </div>
    `;
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function (name) {
      const cell = document.createElement('span');
      cell.textContent = name;
      body.querySelector('.cal-weekdays').appendChild(cell);
    });

    // Start on the Sunday before the 1st, and fill whole weeks
    const grid = body.querySelector('.cal-grid');
    const start = new Date(month.getFullYear(), month.getMonth(), 1 - month.getDay());
    const lastOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const weeks = Math.ceil((month.getDay() + lastOfMonth.getDate()) / 7);
    body.style.setProperty('--weeks', weeks);

    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const day = dateText(d);
      const due = byDay[day] || [];
      const all = itemsFor(day);

      const cell = document.createElement('button');
      cell.className = 'cal-day';
      if (d.getMonth() !== month.getMonth()) cell.classList.add('other-month');
      if (day === today) cell.classList.add('today');
      if (day === calendarDay) cell.classList.add('picked');
      if (due.filter(isOpen).length + (eventsByDay[day] || []).length >= 3) cell.classList.add('busy');
      cell.setAttribute('aria-label', d.toLocaleDateString(appLocale(), { weekday: 'long', month: 'long', day: 'numeric' }) +
        (due.length ? ', ' + due.length + ' ' + (due.length === 1 ? oneOrder() : w.orders.toLowerCase()) : ''));
      cell.innerHTML = '<span class="cal-num"></span><span class="cal-pills"></span>';
      cell.querySelector('.cal-num').textContent = d.getDate();

      const pills = cell.querySelector('.cal-pills');
      const showMax = all.length > 3 ? 2 : 3;
      all.slice(0, showMax).forEach(function (thing) { pills.appendChild(pill(thing)); });
      if (all.length > showMax) {
        const more = document.createElement('span');
        more.className = 'cal-more';
        more.textContent = '+' + (all.length - showMax) + ' more';
        pills.appendChild(more);
      }

      cell.addEventListener('click', function () {
        calendarDay = day;
        if (d.getMonth() !== month.getMonth()) calendarMonth = dateText(new Date(d.getFullYear(), d.getMonth(), 1));
        showPage();
      });
      grid.appendChild(cell);
    }

    drawDay(body.querySelector('#day-panel'), calendarDay);
  }

  // ---------- Week: seven days side by side ----------
  function drawWeekView() {
    const first = weekStart(calendarDay);
    const last = addDays(first, 6);
    const a = toDate(first);
    const b = toDate(last);
    title.textContent = a.getMonth() === b.getMonth()
      ? a.toLocaleDateString(appLocale(), { month: 'short' }) + ' ' + a.getDate() + ' – ' + b.getDate() + ', ' + b.getFullYear()
      : a.toLocaleDateString(appLocale(), { month: 'short', day: 'numeric' }) + ' – ' + b.toLocaleDateString(appLocale(), { month: 'short', day: 'numeric' }) + ', ' + b.getFullYear();

    let count = 0;
    body.innerHTML = '<div class="week-grid"></div>';
    const grid = body.querySelector('.week-grid');
    for (let i = 0; i < 7; i++) {
      const day = addDays(first, i);
      const d = toDate(day);
      const all = itemsFor(day);
      count += itemsFor(day, false).length;

      const col = document.createElement('section');
      col.className = 'week-col' + (day === today ? ' today' : '');
      col.innerHTML = `
        <button class="week-day" title="See this day">
          <span class="week-name"></span><span class="week-num"></span>
        </button>
        <div class="week-items"></div>
        <button class="week-add" title="Add to this day">${icon('plus')}</button>
      `;
      col.querySelector('.week-name').textContent = d.toLocaleDateString(appLocale(), { weekday: 'short' });
      col.querySelector('.week-num').textContent = d.getDate();
      col.querySelector('.week-add').setAttribute('aria-label', 'Add to ' + d.toLocaleDateString(appLocale(), { weekday: 'long', month: 'long', day: 'numeric' }));
      col.querySelector('.week-day').addEventListener('click', function () { calendarDay = day; setCalendarView('day'); });
      col.querySelector('.week-add').addEventListener('click', function () { openAddChooser(day); });

      const list = col.querySelector('.week-items');
      all.forEach(function (thing) {
        const item = pill(Object.assign({}, thing, { text: thing.long || thing.text }), 'button');
        item.classList.add('week-item');
        if (thing.time) {
          const t = document.createElement('small');
          t.textContent = niceTime(thing.time);
          item.prepend(t);
        }
        item.addEventListener('click', thing.open);
        list.appendChild(item);
      });
      grid.appendChild(col);
    }
    sub.textContent = count ? count + (count === 1 ? ' thing' : ' things') + ' planned this week' : 'Nothing planned this week yet';
  }

  // ---------- Day: one day, big ----------
  function drawDayView() {
    const d = toDate(calendarDay);
    title.textContent = d.toLocaleDateString(appLocale(), { month: 'long', day: 'numeric', year: 'numeric' });
    const n = itemsFor(calendarDay, false).length;
    sub.textContent = n ? n + (n === 1 ? ' thing' : ' things') + ' planned' : 'Nothing planned yet';
    body.innerHTML = '<div class="day-panel big" id="day-panel"></div>';
    drawDay(body.querySelector('#day-panel'), calendarDay);
  }

  // ---------- Year: all 12 months small ----------
  function drawYearView() {
    const year = toDate(calendarDay).getFullYear();
    title.textContent = String(year);
    sub.textContent = 'Dots show planned days. Holidays are in yellow.';
    body.innerHTML = '<div class="year-grid"></div>';
    const grid = body.querySelector('.year-grid');
    for (let m = 0; m < 12; m++) {
      const first = new Date(year, m, 1);
      const box = document.createElement('section');
      box.className = 'year-month';
      box.innerHTML = '<button class="year-name" title="See this month"></button><div class="year-week"></div><div class="year-days"></div>';
      box.querySelector('.year-name').textContent = first.toLocaleDateString(appLocale(), { month: 'long' });
      box.querySelector('.year-name').addEventListener('click', function () {
        calendarDay = dateText(first);
        setCalendarView('month');
      });
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (letter) {
        const s = document.createElement('span');
        s.textContent = letter;
        box.querySelector('.year-week').appendChild(s);
      });
      const days = box.querySelector('.year-days');
      for (let blank = 0; blank < first.getDay(); blank++) days.appendChild(document.createElement('span'));
      const count = new Date(year, m + 1, 0).getDate();
      for (let i = 1; i <= count; i++) {
        const day = dateText(new Date(year, m, i));
        const has = itemsFor(day, false).length;
        const holiday = holidayOn(day);
        const b = document.createElement('button');
        b.className = 'year-day' + (day === today ? ' today' : '') + (has ? ' has' : '') + (holiday ? ' holiday' : '');
        b.textContent = i;
        if (holiday) b.title = holiday;
        b.setAttribute('aria-label', new Date(year, m, i).toLocaleDateString(appLocale(), { weekday: 'long', month: 'long', day: 'numeric' }) +
          (holiday ? ', ' + holiday : '') + (has ? ', ' + has + (has === 1 ? ' thing' : ' things') : ''));
        b.addEventListener('click', function () { calendarDay = day; setCalendarView('day'); });
        days.appendChild(b);
      }
      grid.appendChild(box);
    }
  }

  // ---------- The list for one day (beside the month, or big in Day view) ----------
  function drawDay(panel, day) {
    const picked = toDate(day);
    const pickedOrders = byDay[day] || [];
    const days = daysUntil(day);
    const when = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days === -1 ? 'Yesterday' : '';

    panel.innerHTML = `
      <p class="day-when"></p>
      <h2 class="day-title"></h2>
      <div class="day-orders"></div>
      <button class="btn with-icon day-add">${icon('plus')}<span>Add</span></button>
    `;
    panel.querySelector('.day-when').textContent = when || picked.toLocaleDateString(appLocale(), { weekday: 'long' });
    panel.querySelector('.day-title').textContent = picked.toLocaleDateString(appLocale(),
      when ? { weekday: 'long', month: 'long', day: 'numeric' } : { month: 'long', day: 'numeric' });
    panel.querySelector('.day-add').addEventListener('click', function () { openAddChooser(day); });
    const holiday = holidayOn(day);
    if (holiday) {
      const tag = document.createElement('p');
      tag.className = 'day-holiday';
      tag.innerHTML = icon('star') + '<span></span>';
      tag.querySelector('span').textContent = holiday;
      panel.querySelector('.day-title').after(tag);
    }

    const list = panel.querySelector('.day-orders');
    const dayEvents = eventsByDay[day] || [];
    const dayTasks = tasksByDay[day] || [];
    const dayNotes = notesByDay[day] || [];
    if (!pickedOrders.length && !dayEvents.length && !dayTasks.length && !dayNotes.length) {
      const none = document.createElement('p');
      none.className = 'day-free';
      none.textContent = 'Nothing planned. A free day!';
      list.appendChild(none);
      return;
    }

    // Events
    dayEvents.forEach(function (e) {
      const item = document.createElement('button');
      item.className = 'day-order event-card';
      item.innerHTML = '<span class="day-top"><span class="day-time"></span><span class="day-status">Event</span></span>' +
        '<b class="day-name"></b><span class="day-item"></span>';
      item.querySelector('.day-time').textContent = e.time ? niceTime(e.time) : 'All day';
      item.querySelector('.day-name').textContent = e.title;
      const where = item.querySelector('.day-item');
      if (e.where) where.textContent = e.where; else where.remove();
      item.addEventListener('click', function () { editEvent(e); });
      list.appendChild(item);
    });

    // Orders
    pickedOrders.forEach(function (o) {
      const item = document.createElement('button');
      item.className = 'day-order ' + (urgency(o) === 'late' ? 'late' : findStatus(o.status).color);
      item.innerHTML = '<span class="day-top"><span class="day-time"></span><span class="day-status"></span></span>' +
        '<b class="day-name"></b><span class="day-item"></span>';
      item.querySelector('.day-time').textContent = o.time ? niceTime(o.time) : 'Any time';
      item.querySelector('.day-name').textContent = o.customer;
      item.querySelector('.day-item').textContent = o.item;
      item.querySelector('.day-status').textContent = urgency(o) === 'late' ? 'Late' : findStatus(o.status).label;
      item.addEventListener('click', function () { openOrderForm(o.id); });
      list.appendChild(item);
    });

    // To-dos, with a box to check off
    if (dayTasks.length) {
      const todo = document.createElement('div');
      todo.className = 'day-todos';
      dayTasks.forEach(function (t) {
        const row = document.createElement('div');
        row.className = 'day-todo';
        row.innerHTML = '<button class="task-check" role="checkbox" aria-checked="false">' + icon('tick') + '</button><span></span>';
        row.querySelector('span').textContent = t.text;
        row.querySelector('button').setAttribute('aria-label', 'Done: ' + t.text);
        row.querySelector('button').addEventListener('click', function () {
          t.done = true;
          t.doneAt = new Date().toISOString();
          saveTasks();
          showPage();
          showUndo('Checked off', function () { t.done = false; t.doneAt = ''; saveTasks(); showPage(); });
        });
        todo.appendChild(row);
      });
      list.appendChild(todo);
    }

    // Sticky notes on this day, in their own colors
    dayNotes.forEach(function (n) {
      const item = document.createElement('button');
      item.className = 'day-sticky';
      item.style.setProperty('--note', noteColor(n.color));
      item.title = 'Open in Sticky notes';
      item.textContent = n.text;
      item.addEventListener('click', function () {
        goTo('notes');
        focusNoteNow(n);
      });
      list.appendChild(item);
    });
  }
}

// The first line of some text (for small labels)
function firstLine(text) {
  return (text || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean)[0] || 'Note';
}

// ---------- Adding to a day: an Event or a To-do, like Google or Apple Calendar ----------
let lastAddKind = 'event';

function openAddChooser(day) {
  let kind = lastAddKind;
  const box = document.createElement('dialog');
  box.className = 'task-dialog';
  box.innerHTML = `
    <form method="dialog" class="task-dialog-inner">
      <div class="dialog-head">
        <div class="kind-switch" role="tablist" aria-label="What to add">
          <button type="button" role="tab" data-kind="event">${icon('calendar')}<span>Event</span></button>
          <button type="button" role="tab" data-kind="todo">${icon('check')}<span>To-do</span></button>
        </div>
        <button type="button" class="dialog-close" aria-label="Close">${icon('plus')}</button>
      </div>

      <input class="input title-input" id="add-title" autocomplete="off" aria-label="Title">
      <p class="error" id="add-error" role="alert"></p>

      <label class="label" for="add-date">Day</label>
      <input class="input" id="add-date" type="date">

      <div class="for-event">
        <div class="two-fields">
          <div>
            <label class="label" for="add-time">Time <span class="label-hint">(optional)</span></label>
            <input class="input" id="add-time" type="time">
          </div>
          <div>
            <label class="label" for="add-where">Where <span class="label-hint">(optional)</span></label>
            <input class="input" id="add-where" autocomplete="off" placeholder="Main Street park">
          </div>
        </div>
      </div>

      <div class="for-todo">
        <button type="button" class="flag-toggle" id="add-flag" aria-pressed="false">
          ${icon('flag')}<span><b>Important</b><small>Flag it so it stays at the top</small></span>
        </button>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn" id="add-save">Save</button>
        <button type="button" class="btn secondary" id="add-cancel">Cancel</button>
      </div>
    </form>
  `;
  document.body.appendChild(box);

  const title = box.querySelector('#add-title');
  const date = box.querySelector('#add-date');
  date.value = day || todayText();
  fancyDate(date);

  function drawKind() {
    box.querySelectorAll('[data-kind]').forEach(function (b) {
      b.setAttribute('aria-selected', b.dataset.kind === kind ? 'true' : 'false');
    });
    box.querySelector('.for-event').hidden = kind !== 'event';
    box.querySelector('.for-todo').hidden = kind !== 'todo';
    title.placeholder = kind === 'event' ? 'Add a title, like Farmers market' : 'What do you need to do?';
  }
  box.querySelectorAll('[data-kind]').forEach(function (b) {
    b.addEventListener('click', function () { kind = b.dataset.kind; drawKind(); title.focus(); });
  });
  drawKind();

  const flag = box.querySelector('#add-flag');
  flag.addEventListener('click', function () {
    flag.setAttribute('aria-pressed', flag.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  });
  title.addEventListener('input', function () { box.querySelector('#add-error').textContent = ''; });

  function close() { box.close(); box.remove(); }
  box.querySelector('.dialog-close').addEventListener('click', close);
  box.querySelector('#add-cancel').addEventListener('click', close);
  box.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });

  box.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    const text = title.value.trim();
    if (!text) {
      box.querySelector('#add-error').textContent = kind === 'event' ? 'Give it a title.' : 'Type what you need to do.';
      title.focus();
      return;
    }
    const when = date.value || todayText();
    lastAddKind = kind;
    let undo;
    if (kind === 'event') {
      const ev = { id: newId('e'), title: text, date: when, time: box.querySelector('#add-time').value, where: box.querySelector('#add-where').value.trim() };
      events.push(ev);
      saveEvents();
      undo = function () { events = events.filter(function (x) { return x !== ev; }); saveEvents(); showPage(); };
    } else {
      const t = { id: 't' + Date.now(), text: text, due: when, done: false, flagged: flag.getAttribute('aria-pressed') === 'true', created: new Date().toISOString() };
      tasks.push(t);
      saveTasks();
      undo = function () { tasks = tasks.filter(function (x) { return x !== t; }); saveTasks(); showPage(); };
    }
    close();
    showPage();
    showUndo(kind === 'event' ? 'Event added' : 'To-do added', undo);
  });

  box.showModal();
  title.focus();
}

// =========================================
// EVENTS: things on the calendar that aren't orders
// Each: { id, title, date, time, where }
// =========================================
const EVENTS_KEY = 'bizStudio.events';
let events = loadList(EVENTS_KEY);
function saveEvents() { saveList(EVENTS_KEY, events); }

function editEvent(event, day) {
  const isNew = !event;
  openWindow({
    title: isNew ? 'New event' : 'Edit event',
    saveLabel: isNew ? 'Add event' : 'Save changes',
    html: `
      <label class="label" for="ev-title">What's happening?</label>
      <input class="input" id="ev-title" autocomplete="off" placeholder="Farmers market">
      <label class="label" for="ev-date">What day?</label>
      <input class="input" id="ev-date" type="date">
      <label class="label" for="ev-time">What time? <span class="label-hint">(you can skip this)</span></label>
      <input class="input" id="ev-time" type="time">
      <label class="label" for="ev-where">Where? <span class="label-hint">(you can skip this)</span></label>
      <input class="input" id="ev-where" autocomplete="off" placeholder="Main Street park">
      <button type="button" class="link-btn delete-btn" id="ev-delete" hidden>${icon('trash')}<span>Delete this event</span></button>
    `,
    fill: function (box) {
      const date = box.querySelector('#ev-date');
      date.value = event ? event.date : (day || todayText());
      fancyDate(date);
      if (event) {
        box.querySelector('#ev-title').value = event.title;
        box.querySelector('#ev-time').value = event.time || '';
        box.querySelector('#ev-where').value = event.where || '';
        const del = box.querySelector('#ev-delete');
        del.hidden = false;
        del.addEventListener('click', function () {
          events = events.filter(function (x) { return x !== event; });
          saveEvents();
          box.close();
          box.remove();
          showPage();
          showUndo('Event deleted', function () { events.push(event); saveEvents(); showPage(); });
        });
      }
    },
    onSave: function (box) {
      const title = box.querySelector('#ev-title').value.trim();
      if (!title) { box.problem('Type what\'s happening.'); return false; }
      const values = {
        title: title,
        date: box.querySelector('#ev-date').value || todayText(),
        time: box.querySelector('#ev-time').value,
        where: box.querySelector('#ev-where').value.trim(),
      };
      if (event) Object.assign(event, values);
      else events.push(Object.assign({ id: newId('e') }, values));
      saveEvents();
      showPage();
    },
  });
}

// =========================================
// TO-DO LIST
// Tasks the owner adds, plus one task for every open order ("Make Mia's cake"),
// due the day before the order. Checking off an order's task marks the order Done.
// Each saved task: { id, text, due ("2026-11-14" or ''), done, doneAt, created }
// =========================================
const TASKS_KEY = 'bizStudio.tasks';
let tasks = loadTasks();

function loadTasks() {
  try { return JSON.parse(store.getItem(TASKS_KEY)) || []; } catch (error) { return []; }
}
function saveTasks() {
  try { store.setItem(TASKS_KEY, JSON.stringify(tasks)); } catch (error) { /* fine */ }
}

// "Make" for things you make, "Get ready for" for appointments and jobs
function orderVerb() {
  return /orders|commissions/i.test(words().orders) ? 'Make' : 'Get ready for';
}

// "Birthday cake" -> "birthday cake", but "DJ set" stays "DJ set"
function lowerFirst(text) {
  if (text.length > 1 && text[1] === text[1].toUpperCase() && /[A-Z]/.test(text[1])) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

// The task for each open order
function orderTasks() {
  const today = todayText();
  return orders.filter(isOpen).map(function (o) {
    const before = new Date(toDate(o.due).getTime() - 86400000);
    let due = dateText(before);
    if (due < today && o.due >= today) due = today; // due today: do it today
    if (o.due < today) due = o.due;                  // already late
    return {
      id: 'order-' + o.id,
      order: o,
      text: orderVerb() + ' ' + lowerFirst(o.item) + ' for ' + o.customer.split(' ')[0],
      due: due,
      done: false,
      flagged: !!o.flagged, // the flag is kept on the order itself
    };
  });
}

function showTodo(page) {
  const w = words();
  const open = orderTasks().concat(tasks.filter(function (t) { return !t.done; }));
  const done = tasks.filter(function (t) { return t.done; })
    .sort(function (a, b) { return (b.doneAt || '').localeCompare(a.doneAt || ''); });
  const todayCount = open.filter(function (t) { return t.due && daysUntil(t.due) <= 0; }).length;

  page.innerHTML = `
    <header class="page-head">
      <h1>To-do list</h1>
      <p></p>
    </header>
    <div class="todo-page">
      <button class="task-add" id="open-add-task">
        <span class="task-add-words">Add a task</span>
        <span class="task-add-btn">${icon('plus')}</span>
      </button>
      <div id="task-groups"></div>
      <section class="task-done" id="task-done" hidden>
        <div class="task-done-head">
          <h2>Done</h2>
          <button class="link-btn clear-finished" id="clear-done"></button>
        </div>
        <div class="task-list" id="done-list"></div>
      </section>
    </div>
  `;
  page.querySelector('.page-head p').textContent = open.length === 0
    ? 'All caught up'
    : todayCount === 0
      ? 'Nothing for today. ' + open.length + ' coming up.'
      : todayCount + (todayCount === 1 ? ' thing' : ' things') + ' to do today';

  // ----- Adding a task opens its own window -----
  page.querySelector('#open-add-task').addEventListener('click', function () { openAddTask(); });

  // ----- The groups -----
  const groupsBox = page.querySelector('#task-groups');
  if (open.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty sky';
    empty.innerHTML = '<span class="empty-icon">' + icon('check') + '</span><h3>All caught up</h3><p></p>';
    empty.querySelector('p').textContent = usesOrders()
      ? 'Add a task above. When you have ' + w.orders.toLowerCase() + ' coming up, tasks for them show up here on their own.'
      : 'Add a task above to get started.';
    groupsBox.appendChild(empty);
  }
  // Flagged tasks go at the very top, in their own box
  const flagged = open.filter(function (t) { return t.flagged; })
    .sort(function (a, b) { return (a.due || '9999').localeCompare(b.due || '9999'); });
  if (flagged.length) {
    const section = document.createElement('section');
    section.className = 'task-group flagged-group';
    section.innerHTML = '<h2><span class="flag-badge">' + icon('flag') + '</span><span class="group-date">Important</span>' +
      '<b class="group-count"></b></h2><div class="task-list"></div>';
    section.querySelector('.group-count').textContent = flagged.length;
    flagged.forEach(function (t) { section.querySelector('.task-list').appendChild(taskRow(t, true)); });
    groupsBox.appendChild(section);
  }

  // One group for each date, soonest first. Tasks with no date go last.
  const byDate = {};
  open.filter(function (t) { return !t.flagged; }).forEach(function (t) { (byDate[t.due || ''] = byDate[t.due || ''] || []).push(t); });
  const dates = Object.keys(byDate).sort(function (a, b) {
    if (!a) return 1;
    if (!b) return -1;
    return a.localeCompare(b);
  });
  const colors = ['sky', 'lilac', 'peach', 'mint'];
  let colorIndex = 0;
  dates.forEach(function (day) {
    const list = byDate[day];
    const section = document.createElement('section');
    let color = 'mint';
    let tag = '';
    if (day) {
      const days = daysUntil(day);
      if (days < 0) { color = 'pink'; tag = 'Late'; }
      else if (days === 0) { color = 'butter'; tag = 'Today'; }
      else if (days === 1) { color = 'peach'; tag = 'Tomorrow'; }
      else { color = colors[colorIndex++ % colors.length]; }
    }
    section.className = 'task-group ' + color;
    section.innerHTML = '<h2><span class="group-dot"></span><span class="group-date"></span>' +
      '<span class="group-tag"></span><b class="group-count"></b></h2><div class="task-list"></div>';
    section.querySelector('.group-date').textContent = day
      ? toDate(day).toLocaleDateString(appLocale(), { weekday: 'long', month: 'long', day: 'numeric' })
      : 'No date';
    const tagBox = section.querySelector('.group-tag');
    if (tag) tagBox.textContent = tag; else tagBox.remove();
    section.querySelector('.group-count').textContent = list.length;
    list.forEach(function (t) { section.querySelector('.task-list').appendChild(taskRow(t)); });
    groupsBox.appendChild(section);
  });

  // ----- Done -----
  if (done.length) {
    const doneBox = page.querySelector('#task-done');
    doneBox.hidden = false;
    done.slice(0, 15).forEach(function (t) { page.querySelector('#done-list').appendChild(taskRow(t)); });
    const clear = page.querySelector('#clear-done');
    clear.innerHTML = icon('trash') + '<span></span>';
    clear.querySelector('span').textContent = 'Clear done (' + done.length + ')';
    clear.addEventListener('click', function () {
      const before = tasks.slice();
      tasks = tasks.filter(function (t) { return !t.done; });
      saveTasks();
      showPage();
      showUndo('Cleared ' + done.length + (done.length === 1 ? ' task' : ' tasks'), function () {
        tasks = before;
        saveTasks();
        showPage();
      });
    });
  }
}

// The "New task" window that pops up over the page: what to do, and which day
function openAddTask(day) {
  const box = document.createElement('dialog');
  box.className = 'task-dialog';
  box.innerHTML = `
    <form method="dialog" class="task-dialog-inner">
      <div class="dialog-head">
        <h2>New task</h2>
        <button type="button" class="dialog-close" aria-label="Close">${icon('plus')}</button>
      </div>

      <label class="label" for="new-task">What do you need to do?</label>
      <input class="input" id="new-task" autocomplete="off" placeholder="Buy more flour">
      <p class="error" id="new-task-error" role="alert"></p>

      <label class="label" for="new-task-date">What day?</label>
      <input class="input" id="new-task-date" type="date">

      <button type="button" class="flag-toggle" id="new-task-flag" aria-pressed="false">
        ${icon('flag')}<span><b>Important</b><small>Flag it so it stays at the top</small></span>
      </button>

      <div class="form-actions">
        <button type="submit" class="btn with-icon" id="save-task">${icon('plus')}<span>Add task</span></button>
        <button type="button" class="btn secondary" id="cancel-task">Cancel</button>
      </div>
    </form>
  `;
  document.body.appendChild(box);

  const text = box.querySelector('#new-task');
  const dateBox = box.querySelector('#new-task-date');
  dateBox.value = day || todayText();
  fancyDate(dateBox, { clearable: true, placeholder: 'No date' });
  const flagBtn = box.querySelector('#new-task-flag');
  flagBtn.addEventListener('click', function () {
    flagBtn.setAttribute('aria-pressed', flagBtn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  });
  text.addEventListener('input', function () { box.querySelector('#new-task-error').textContent = ''; });

  function close() {
    box.close();
    box.remove();
  }
  box.querySelector('.dialog-close').addEventListener('click', close);
  box.querySelector('#cancel-task').addEventListener('click', close);
  box.addEventListener('cancel', function (e) { e.preventDefault(); close(); }); // the Esc key
  box.addEventListener('click', function (e) { if (e.target === box) close(); }); // clicking outside

  box.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    const words = text.value.trim();
    if (!words) {
      box.querySelector('#new-task-error').textContent = 'Type what you need to do.';
      text.focus();
      return;
    }
    const id = 't' + Date.now();
    tasks.push({
      id: id, text: words, due: dateBox.value, done: false,
      flagged: flagBtn.getAttribute('aria-pressed') === 'true',
      created: new Date().toISOString(),
    });
    saveTasks();
    close();
    showPage();
    showUndo('Task added', function () {
      tasks = tasks.filter(function (t) { return t.id !== id; });
      saveTasks();
      showPage();
    });
  });

  box.showModal();
  text.focus();
}

// One task: a checkbox, the words, and when it's due
function taskRow(t, showDate) {
  const row = document.createElement('div');
  row.className = 'task-row' + (t.done ? ' done' : '') + (t.order ? ' from-order' : '') + (t.flagged && !t.done ? ' flagged' : '');
  row.innerHTML = `
    <button class="task-check" role="checkbox">${icon('tick')}</button>
    <div class="task-text">
      <span class="task-words"></span>
      <span class="task-meta"></span>
    </div>
  `;
  const check = row.querySelector('.task-check');
  check.setAttribute('aria-checked', t.done ? 'true' : 'false');
  check.setAttribute('aria-label', (t.done ? 'Not done: ' : 'Done: ') + t.text);
  row.querySelector('.task-words').textContent = t.text;

  const meta = row.querySelector('.task-meta');
  // Done and flagged tasks show their day (the rest are already under their date)
  if (t.due && (t.done || showDate)) {
    const dueLine = document.createElement('span');
    dueLine.className = 'task-due' + (!t.done && daysUntil(t.due) < 0 ? ' late' : '');
    const days = daysUntil(t.due);
    dueLine.textContent = t.done ? niceDate(t.due)
      : days < 0 ? 'Late, was ' + niceDate(t.due) : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : niceDate(t.due);
    meta.appendChild(dueLine);
  }
  if (t.order) {
    // A link to the order this task came from
    const link = document.createElement('button');
    link.className = 'task-order-link';
    link.textContent = capitalize(oneOrder()) + ' due ' + niceDate(t.order.due) + (t.order.time ? ' at ' + niceTime(t.order.time) : '');
    link.addEventListener('click', function () { openOrderForm(t.order.id); });
    meta.appendChild(link);
  }
  if (!meta.children.length) meta.remove();

  check.addEventListener('click', function () {
    if (t.order) {
      // Checking off an order's task marks the order Done
      const was = t.order.status;
      t.order.status = 'done';
      saveOrders();
      showPage();
      showUndo(t.order.customer.split(' ')[0] + '\'s ' + oneOrder() + ' marked Done', function () {
        t.order.status = was;
        saveOrders();
        showPage();
      });
      return;
    }
    t.done = !t.done;
    t.doneAt = t.done ? new Date().toISOString() : '';
    saveTasks();
    showPage();
  });

  // The flag: marks a task as important and moves it to the top
  if (!t.done) {
    const flag = document.createElement('button');
    flag.className = 'task-flag';
    flag.innerHTML = icon('flag');
    flag.setAttribute('aria-pressed', t.flagged ? 'true' : 'false');
    flag.setAttribute('aria-label', (t.flagged ? 'Unflag ' : 'Flag as important: ') + t.text);
    flag.title = t.flagged ? 'Unflag' : 'Flag as important';
    flag.addEventListener('click', function () {
      if (t.order) {
        t.order.flagged = !t.order.flagged;
        saveOrders();
      } else {
        t.flagged = !t.flagged;
        saveTasks();
      }
      showPage();
    });
    row.appendChild(flag);
  }

  // Tasks you added can be deleted
  if (!t.order) {
    const del = document.createElement('button');
    del.className = 'row-delete';
    del.innerHTML = icon('trash');
    del.setAttribute('aria-label', 'Delete ' + t.text);
    del.title = 'Delete';
    del.addEventListener('click', function () {
      const index = tasks.indexOf(t);
      tasks.splice(index, 1);
      saveTasks();
      showPage();
      showUndo('Task deleted', function () {
        tasks.splice(index, 0, t);
        saveTasks();
        showPage();
      });
    });
    row.appendChild(del);
  } else {
    // Order tasks can't be deleted here; an empty space keeps the flags lined up
    const space = document.createElement('span');
    space.className = 'row-space';
    row.appendChild(space);
  }
  return row;
}

// =========================================
// SHARED: saving lists, pop-up windows, little helpers
// =========================================
function loadList(key) {
  try { return JSON.parse(store.getItem(key)) || []; } catch (error) { return []; }
}
function saveList(key, list) {
  try { store.setItem(key, JSON.stringify(list)); } catch (error) { /* fine */ }
}
function newId(start) {
  return start + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function oneProduct() { return singular(words().products).toLowerCase(); }
function oneSupply() { return singular(words().supplies).toLowerCase(); }

// One of something: Supplies -> Supply, Classes -> Class, Recipes -> Recipe, Lashes -> Lash
function singular(word) {
  word = String(word || '');
  if (/ies$/i.test(word)) return word.slice(0, -3) + (word.slice(-3) === 'IES' ? 'Y' : 'y');
  if (/(ss|sh|ch|x)es$/i.test(word)) return word.slice(0, -2);
  if (/ss$/i.test(word)) return word;
  return word.replace(/s$/i, '');
}

// Rounds to at most 2 decimals and drops trailing zeros: 1.50 -> "1.5", 2 -> "2"
function niceNumber(n) {
  return String(Math.round(Number(n || 0) * 100) / 100);
}

// Goes to another part of the app
function goTo(sectionId) {
  currentSection = sectionId;
  showMenu();
  showPage();
  window.scrollTo(0, 0);
}

// A pop-up window like the New task one. fill(box) sets it up;
// onSave(box) returns false to keep it open (for example, when something is missing).
function openWindow(options) {
  const box = document.createElement('dialog');
  box.className = 'task-dialog' + (options.wide ? ' wide' : '');
  box.innerHTML = `
    <form method="dialog" class="task-dialog-inner">
      <div class="dialog-head">
        <h2></h2>
        <button type="button" class="dialog-close" aria-label="Close">${icon('plus')}</button>
      </div>
      <div class="dialog-body">${options.html}</div>
      <p class="error" id="window-error" role="alert"></p>
      <div class="form-actions">
        <button type="submit" class="btn" id="window-save"></button>
        <button type="button" class="btn secondary" id="window-cancel">Cancel</button>
      </div>
    </form>
  `;
  box.querySelector('h2').textContent = options.title;
  box.querySelector('#window-save').textContent = options.saveLabel || 'Save';
  document.body.appendChild(box);

  function close() { box.close(); box.remove(); }
  box.querySelector('.dialog-close').addEventListener('click', close);
  box.querySelector('#window-cancel').addEventListener('click', close);
  box.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  box.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    box.querySelector('#window-error').textContent = '';
    if (options.onSave(box) === false) return;
    close();
  });
  box.problem = function (text) { box.querySelector('#window-error').textContent = text; };

  if (options.fill) options.fill(box);
  box.showModal();
  const first = box.querySelector('input, select, textarea');
  if (first) first.focus();
  return box;
}

// =========================================
// INGREDIENTS (supplies)
// Each: { id, name, unit, packSize, packPrice, have }
// "I buy 5 lb for $4.50, and I have 2 lb"
// =========================================
const SUPPLIES_KEY = 'bizStudio.supplies';
let supplies = loadList(SUPPLIES_KEY);
function saveSupplies() { saveList(SUPPLIES_KEY, supplies); }
function findSupply(id) { return supplies.find(function (s) { return s.id === id; }); }

// What one unit costs, like $0.90 for one lb
function unitCost(supply) {
  const size = Number(supply.packSize);
  const price = Number(supply.packPrice);
  return size > 0 && price > 0 ? price / size : 0;
}

const UNIT_IDEAS = ['cups', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'each', 'sticks', 'dozen'];

// =========================================
// RECIPES (products)
// Each: { id, name, price, makes, hours, uses: [{ supplyId, amount }], steps }
// =========================================
const PRODUCTS_KEY = 'bizStudio.products';
let products = loadList(PRODUCTS_KEY);
function saveProducts() { saveList(PRODUCTS_KEY, products); }
function findProduct(id) { return products.find(function (p) { return p.id === id; }); }

let productView = null;   // null = the list, 'new', or a product id
let productEditing = false;
let productScale = 1;

// What the ingredients for one batch cost
function productCost(p) {
  return p.uses.reduce(function (sum, use) {
    const s = findSupply(use.supplyId);
    return sum + (s ? unitCost(s) * Number(use.amount || 0) : 0);
  }, 0);
}

// Ingredients that don't have a price yet (so the cost isn't complete)
function missingPrices(p) {
  return p.uses.map(function (u) { return findSupply(u.supplyId); })
    .filter(function (s) { return s && !unitCost(s); });
}

// Which product an order is for, by matching the name in "What they want"
function productForOrder(order) {
  const text = (order.item || '').toLowerCase();
  let best = null;
  products.forEach(function (p) {
    const name = p.name.toLowerCase().trim();
    if (name && text.includes(name) && (!best || name.length > best.name.length)) best = p;
  });
  return best;
}

const PRODUCT_COLORS = ['pink', 'peach', 'butter', 'mint', 'sky', 'lilac'];
function productColor(p) { return PRODUCT_COLORS[products.indexOf(p) % PRODUCT_COLORS.length]; }

function showProducts(page) {
  if (productView) {
    const p = productView === 'new' ? null : findProduct(productView);
    if (productView === 'new' || productEditing) return showProductForm(page, p);
    if (p) return showProduct(page, p);
    productView = null;
  }
  const w = words();
  page.innerHTML = `
    <header class="page-head with-button">
      <div><h1></h1><p></p></div>
      <button class="btn with-icon" id="new-product">${icon('plus')}<span></span></button>
    </header>
    <div id="product-area"></div>
  `;
  page.querySelector('h1').textContent = w.products;
  page.querySelector('.page-head p').textContent = products.length
    ? products.length + ' ' + (products.length === 1 ? oneProduct() : w.products.toLowerCase())
    : 'What you make, what goes into it, and what you charge';
  page.querySelector('#new-product span').textContent = 'New ' + oneProduct();
  page.querySelector('#new-product').addEventListener('click', function () {
    productView = 'new';
    showPage();
  });

  const area = page.querySelector('#product-area');
  if (!products.length) {
    area.innerHTML = '<div class="empty pink"><span class="empty-icon">' + icon('box') + '</span><h3></h3><p></p></div>';
    area.querySelector('h3').textContent = 'No ' + w.products.toLowerCase() + ' yet';
    area.querySelector('p').textContent = 'Add what you make with its ' + w.supplies.toLowerCase() +
      '. The app works out what it costs you' + (usesOrders() ? ' and what to buy for your ' + w.orders.toLowerCase() : '') + '.';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'product-grid';
  products.forEach(function (p) {
    const cost = productCost(p);
    const card = document.createElement('button');
    card.className = 'product-card ' + productColor(p);
    card.innerHTML = `
      <span class="product-top"><span class="product-icon">${icon('box')}</span><span class="product-price"></span></span>
      <b class="product-name"></b>
      <span class="product-makes"></span>
      <span class="product-foot"><span class="pf-uses"></span><span class="pf-cost"></span></span>
    `;
    card.querySelector('.product-name').textContent = p.name;
    card.querySelector('.product-price').textContent = p.price ? money(p.price) : 'No price';
    card.querySelector('.product-makes').textContent = p.makes ? 'Makes ' + p.makes : '';
    card.querySelector('.pf-uses').textContent = p.uses.length + ' ' + (p.uses.length === 1 ? oneSupply() : w.supplies.toLowerCase());
    card.querySelector('.pf-cost').textContent = cost ? 'Costs ' + money(cost) : '';
    card.addEventListener('click', function () {
      productView = p.id;
      productScale = 1;
      showPage();
      window.scrollTo(0, 0);
    });
    grid.appendChild(card);
  });
  area.appendChild(grid);
}

// One recipe: what goes in it (scaled up or down), the steps, and the cost
function showProduct(page, p) {
  const w = words();
  const cost = productCost(p) * productScale;
  page.innerHTML = `
    <button class="back-link" id="product-back">${icon('back')}<span></span></button>
    <div class="product-page">
      <header class="product-head ${productColor(p)}">
        <span class="product-icon big">${icon('box')}</span>
        <div class="product-head-text"><h1></h1><p></p></div>
        <button class="btn secondary small" id="product-edit">Edit</button>
      </header>

      <div class="stat-tiles">
        <div class="stat-tile lilac"><b id="pt-price"></b><span>you charge</span></div>
        <div class="stat-tile peach"><b id="pt-cost"></b><span id="pt-cost-label"></span></div>
        <div class="stat-tile mint"><b id="pt-profit"></b><span>left over</span></div>
      </div>

      <section class="recipe-box">
        <div class="recipe-head">
          <h2></h2>
          <div class="scale-pick" role="radiogroup" aria-label="How many batches"></div>
        </div>
        <ul class="uses-list" id="uses-list"></ul>
        <p class="price-warning" id="price-warning" hidden></p>
      </section>

      <section class="recipe-box" id="steps-box">
        <h2>Steps</h2>
        <ol class="steps-list" id="steps-list"></ol>
      </section>

      <div class="product-actions">
        <button class="btn with-icon" id="product-order">${icon('plus')}<span></span></button>
      </div>
    </div>
  `;
  page.querySelector('#product-back span').textContent = 'Back to ' + w.products;
  page.querySelector('h1').textContent = p.name;
  page.querySelector('.product-head-text p').textContent = [p.makes ? 'Makes ' + p.makes : '', p.hours ? 'Takes about ' + niceNumber(p.hours) + (Number(p.hours) === 1 ? ' hour' : ' hours') : '']
    .filter(Boolean).join('. ') || 'Add how much it makes and how long it takes with Edit.';
  page.querySelector('#pt-price').textContent = p.price ? money(p.price * productScale) : 'Not set';
  page.querySelector('#pt-cost').textContent = money(cost);
  page.querySelector('#pt-cost-label').textContent = w.supplies.toLowerCase() + ' cost';
  page.querySelector('#pt-profit').textContent = p.price ? money(p.price * productScale - cost) : 'Not set';

  page.querySelector('.recipe-head h2').textContent = w.supplies;
  const scale = page.querySelector('.scale-pick');
  [{ v: 0.5, t: 'Half' }, { v: 1, t: '1 batch' }, { v: 2, t: '2x' }, { v: 3, t: '3x' }].forEach(function (s) {
    const b = document.createElement('button');
    b.className = 'kind-btn';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', productScale === s.v ? 'true' : 'false');
    b.textContent = s.t;
    b.addEventListener('click', function () { productScale = s.v; showPage(); });
    scale.appendChild(b);
  });

  const list = page.querySelector('#uses-list');
  if (!p.uses.length) {
    list.innerHTML = '<li class="uses-none"></li>';
    list.firstChild.textContent = 'No ' + w.supplies.toLowerCase() + ' added yet.';
  }
  p.uses.forEach(function (use) {
    const s = findSupply(use.supplyId);
    if (!s) return;
    const li = document.createElement('li');
    li.innerHTML = '<span class="use-amount"></span><span class="use-name"></span><span class="use-cost"></span>';
    li.querySelector('.use-amount').textContent = niceNumber(use.amount * productScale) + ' ' + s.unit;
    li.querySelector('.use-name').textContent = s.name;
    li.querySelector('.use-cost').textContent = unitCost(s) ? money(unitCost(s) * use.amount * productScale) : 'No price';
    list.appendChild(li);
  });
  const missing = missingPrices(p);
  if (missing.length) {
    const warn = page.querySelector('#price-warning');
    warn.hidden = false;
    warn.textContent = 'Add what you pay for ' + missing.map(function (s) { return s.name; }).join(', ') +
      ' in ' + w.supplies + ' and shopping to get the full cost.';
  }

  const steps = (p.steps || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  if (!steps.length) page.querySelector('#steps-box').remove();
  steps.forEach(function (step) {
    const li = document.createElement('li');
    li.textContent = step.replace(/^\d+[.)]\s*/, '');
    page.querySelector('#steps-list').appendChild(li);
  });

  page.querySelector('#product-back').addEventListener('click', function () { productView = null; showPage(); });
  page.querySelector('#product-edit').addEventListener('click', function () { productEditing = true; showPage(); });
  if (!usesOrders()) page.querySelector('.product-actions').remove();
  else page.querySelector('#product-order span').textContent = 'New ' + oneOrder() + ' for this';
  if (usesOrders()) page.querySelector('#product-order').addEventListener('click', function () {
    orderPrefill = { item: p.name, price: p.price || '' };
    openOrderForm('new');
  });
}

// Adding or changing a recipe
function showProductForm(page, p) {
  const w = words();
  const isNew = !p;
  const draft = p ? JSON.parse(JSON.stringify(p)) : { id: newId('p'), name: '', price: '', makes: '', hours: '', uses: [], steps: '' };

  page.innerHTML = `
    <button class="back-link" id="pf-back">${icon('back')}<span></span></button>
    <div class="order-form product-form">
      <h1></h1>
      <div class="form-grid">
        <div class="span-2">
          <label class="label" for="pf-name">Name</label>
          <input id="pf-name" class="input" autocomplete="off">
        </div>
        <div>
          <label class="label" for="pf-price">What you charge</label>
          <div class="money-box"><span>$</span><input id="pf-price" class="input" type="number" min="0" step="0.01" placeholder="0.00"></div>
        </div>
        <div>
          <label class="label" for="pf-makes">How much it makes</label>
          <input id="pf-makes" class="input" autocomplete="off" placeholder="1 cake, 12 cupcakes">
        </div>
        <div>
          <label class="label" for="pf-hours">Hours it takes you</label>
          <input id="pf-hours" class="input" type="number" min="0" step="0.25" placeholder="2">
        </div>
      </div>

      <section class="uses-edit">
        <h2></h2>
        <div id="uses-rows"></div>
        <div class="add-use" id="add-use"></div>
      </section>

      <label class="label" for="pf-steps">Steps <span class="label-hint">(one per line)</span></label>
      <textarea id="pf-steps" class="input" rows="6"></textarea>

      <p class="error" id="pf-error" role="alert"></p>
      <div class="form-actions">
        <button class="btn" id="pf-save"></button>
        <button class="btn secondary" id="pf-cancel">Cancel</button>
        <span class="spacer"></span>
        <button class="link-btn delete-btn" id="pf-delete" hidden>${icon('trash')}<span></span></button>
      </div>
    </div>
  `;
  page.querySelector('#pf-back span').textContent = isNew ? 'Back to ' + w.products : 'Back to ' + p.name;
  page.querySelector('h1').textContent = isNew ? 'New ' + oneProduct() : 'Edit ' + p.name;
  page.querySelector('#pf-name').placeholder = findType(profile.businessType).samples[0];
  page.querySelector('.uses-edit h2').textContent = 'What goes in it';
  page.querySelector('#pf-save').textContent = isNew ? 'Add ' + oneProduct() : 'Save changes';
  ['name', 'price', 'makes', 'hours', 'steps'].forEach(function (f) { page.querySelector('#pf-' + f).value = draft[f] || ''; });

  // Ingredient rows: amount, unit (from the ingredient), name, remove
  const rows = page.querySelector('#uses-rows');
  function drawUses() {
    rows.innerHTML = '';
    if (!draft.uses.length) {
      rows.innerHTML = '<p class="list-empty uses-none"></p>';
      rows.firstChild.textContent = 'Nothing added yet. Pick from your ' + w.supplies.toLowerCase() + ' below, or add a new one.';
    }
    draft.uses.forEach(function (use, i) {
      const s = findSupply(use.supplyId);
      if (!s) return;
      const row = document.createElement('div');
      row.className = 'use-row';
      row.innerHTML = '<input class="input use-amt" type="number" min="0" step="0.01" aria-label="Amount">' +
        '<span class="use-unit"></span><span class="use-name"></span>' +
        '<button class="row-delete" type="button">' + icon('trash') + '</button>';
      row.querySelector('.use-amt').value = use.amount;
      row.querySelector('.use-unit').textContent = s.unit;
      row.querySelector('.use-name').textContent = s.name;
      row.querySelector('.row-delete').setAttribute('aria-label', 'Remove ' + s.name);
      row.querySelector('.use-amt').addEventListener('input', function (e) { use.amount = Number(e.target.value) || 0; });
      row.querySelector('.row-delete').addEventListener('click', function () { draft.uses.splice(i, 1); drawUses(); });
      rows.appendChild(row);
    });
    drawAdd();
  }

  // Chips for each ingredient not used yet, plus "+ New ingredient"
  const add = page.querySelector('#add-use');
  function drawAdd() {
    add.innerHTML = '';
    const unused = supplies.filter(function (s) { return !draft.uses.some(function (u) { return u.supplyId === s.id; }); });
    unused.forEach(function (s) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'idea-btn';
      b.textContent = '+ ' + s.name;
      b.addEventListener('click', function () { draft.uses.push({ supplyId: s.id, amount: 1 }); drawUses(); focusLast(); });
      add.appendChild(b);
    });
    const other = document.createElement('button');
    other.type = 'button';
    other.className = 'idea-btn other';
    other.textContent = '+ New ' + oneSupply();
    other.addEventListener('click', function () {
      editSupply(null, function (s) { draft.uses.push({ supplyId: s.id, amount: 1 }); drawUses(); focusLast(); });
    });
    add.appendChild(other);
  }
  function focusLast() {
    const amts = rows.querySelectorAll('.use-amt');
    if (amts.length) { amts[amts.length - 1].focus(); amts[amts.length - 1].select(); }
  }
  drawUses();

  function leave() {
    productEditing = false;
    if (isNew) productView = null;
    showPage();
  }
  page.querySelector('#pf-back').addEventListener('click', leave);
  page.querySelector('#pf-cancel').addEventListener('click', leave);

  page.querySelector('#pf-save').addEventListener('click', function () {
    const name = page.querySelector('#pf-name').value.trim();
    if (!name) {
      page.querySelector('#pf-error').textContent = 'Give it a name to save it.';
      page.querySelector('#pf-name').focus();
      return;
    }
    draft.name = name;
    draft.price = page.querySelector('#pf-price').value ? Number(page.querySelector('#pf-price').value) : '';
    draft.makes = page.querySelector('#pf-makes').value.trim();
    draft.hours = page.querySelector('#pf-hours').value ? Number(page.querySelector('#pf-hours').value) : '';
    draft.steps = page.querySelector('#pf-steps').value.trim();
    draft.uses = draft.uses.filter(function (u) { return Number(u.amount) > 0; });
    if (isNew) products.push(draft);
    else products[products.indexOf(p)] = draft;
    saveProducts();
    productEditing = false;
    productView = draft.id;
    showPage();
    window.scrollTo(0, 0);
  });

  if (!isNew) {
    const del = page.querySelector('#pf-delete');
    del.hidden = false;
    del.querySelector('span').textContent = 'Delete ' + oneProduct();
    del.addEventListener('click', function () {
      const index = products.indexOf(p);
      products.splice(index, 1);
      saveProducts();
      productEditing = false;
      productView = null;
      showPage();
      showUndo(p.name + ' deleted', function () {
        products.splice(index, 0, p);
        saveProducts();
        showPage();
      });
    });
  }
  page.querySelector('#pf-name').focus();
}

// The window for adding or changing an ingredient
function editSupply(s, done) {
  const w = words();
  const isNew = !s;
  openWindow({
    title: isNew ? 'New ' + oneSupply() : 'Edit ' + s.name,
    saveLabel: isNew ? 'Add ' + oneSupply() : 'Save changes',
    html: `
      <label class="label" for="sw-name">Name</label>
      <input class="input" id="sw-name" autocomplete="off" placeholder="Flour">
      <label class="label" for="sw-unit">You measure it in</label>
      <input class="input" id="sw-unit" autocomplete="off" placeholder="cups">
      <div class="unit-chips">${UNIT_IDEAS.map(function (u) { return '<button type="button" class="idea-btn" data-unit="' + u + '">' + u + '</button>'; }).join('')}</div>
      <p class="label">When you buy it</p>
      <div class="buy-line">
        <span>You get</span>
        <input class="input" id="sw-size" type="number" min="0" step="0.01" placeholder="20" aria-label="How much you get">
        <span class="sw-unit-word">cups</span>
        <span>for</span>
        <div class="money-box"><span>$</span><input class="input" id="sw-price" type="number" min="0" step="0.01" placeholder="4.50" aria-label="Price"></div>
      </div>
      <label class="label" for="sw-have">How much you have now</label>
      <input class="input" id="sw-have" type="number" min="0" step="0.01" placeholder="0">
    `,
    fill: function (box) {
      const unit = box.querySelector('#sw-unit');
      function unitWords() { box.querySelector('.sw-unit-word').textContent = unit.value.trim() || 'units'; }
      unit.addEventListener('input', unitWords);
      box.querySelectorAll('[data-unit]').forEach(function (chip) {
        chip.addEventListener('click', function () { unit.value = chip.dataset.unit; unitWords(); });
      });
      if (s) {
        box.querySelector('#sw-name').value = s.name;
        unit.value = s.unit;
        box.querySelector('#sw-size').value = s.packSize || '';
        box.querySelector('#sw-price').value = s.packPrice || '';
        box.querySelector('#sw-have').value = s.have || '';
      }
      unitWords();
    },
    onSave: function (box) {
      const name = box.querySelector('#sw-name').value.trim();
      if (!name) { box.problem('Type its name.'); return false; }
      const values = {
        name: name,
        unit: box.querySelector('#sw-unit').value.trim() || 'each',
        packSize: Number(box.querySelector('#sw-size').value) || '',
        packPrice: Number(box.querySelector('#sw-price').value) || '',
        have: Number(box.querySelector('#sw-have').value) || 0,
      };
      if (isNew) {
        s = Object.assign({ id: newId('s') }, values);
        supplies.push(s);
      } else {
        Object.assign(s, values);
      }
      saveSupplies();
      if (done) done(s);
      else showPage();
    },
  });
}

// =========================================
// INGREDIENTS AND SHOPPING
// The shopping list fills itself in from the recipes for orders due in the next 2 weeks.
// You can add your own things to buy too: { id, text, done }
// =========================================
const SHOPPING_KEY = 'bizStudio.shopping';
let shopping = loadList(SHOPPING_KEY);
function saveShopping() { saveList(SHOPPING_KEY, shopping); }

// What the upcoming orders need, and how much more to buy
function whatToBuy() {
  const need = {}; // supplyId -> amount needed
  const forOrders = {}; // supplyId -> [names]
  orders.filter(function (o) { return isOpen(o) && daysUntil(o.due) <= 14; }).forEach(function (o) {
    const p = productForOrder(o);
    if (!p) return;
    p.uses.forEach(function (u) {
      need[u.supplyId] = (need[u.supplyId] || 0) + Number(u.amount || 0);
      (forOrders[u.supplyId] = forOrders[u.supplyId] || []).push(o.customer.split(' ')[0]);
    });
  });
  return Object.keys(need).map(function (id) {
    const s = findSupply(id);
    if (!s) return null;
    const short = need[id] - Number(s.have || 0);
    if (short <= 0) return null;
    const packs = s.packSize ? Math.ceil(short / s.packSize) : 0;
    return { supply: s, need: need[id], short: short, packs: packs, cost: packs * Number(s.packPrice || 0), who: forOrders[id] };
  }).filter(Boolean);
}

function showSupplies(page) {
  const w = words();
  const buy = whatToBuy();
  const extra = shopping.filter(function (i) { return !i.done; });
  const bought = shopping.filter(function (i) { return i.done; });

  page.innerHTML = `
    <header class="page-head with-button">
      <div><h1></h1><p></p></div>
      <div class="head-buttons">
        <button class="btn secondary with-icon" id="from-picture">${icon('camera')}<span>Add from a picture</span></button>
        <button class="btn with-icon" id="new-supply">${icon('plus')}<span></span></button>
      </div>
    </header>
    <div class="supplies-layout">
      <section class="shop-box">
        <div class="shop-head">
          <span class="shop-icon">${icon('cart')}</span>
          <div><h2>Shopping list</h2><p id="shop-sub"></p></div>
        </div>
        <div id="shop-list"></div>
        <form class="shop-add" id="shop-add">
          <input class="task-input" id="shop-text" autocomplete="off" placeholder="Add something to buy" aria-label="Add something to buy">
          <button class="task-add-btn small" aria-label="Add">${icon('plus')}</button>
        </form>
      </section>
      <section class="have-box">
        <h2></h2>
        <div id="have-list"></div>
      </section>
    </div>
  `;
  page.querySelector('h1').textContent = w.supplies + ' and shopping';
  page.querySelector('.page-head p').textContent = buy.length + extra.length
    ? (buy.length + extra.length) + ' thing' + (buy.length + extra.length === 1 ? '' : 's') + ' to buy'
    : 'You have what you need';
  page.querySelector('#new-supply span').textContent = 'New ' + oneSupply();
  page.querySelector('#new-supply').addEventListener('click', function () { editSupply(null); });
  page.querySelector('#from-picture').addEventListener('click', openPictureImport);
  page.querySelector('.have-box h2').textContent = 'What you have';

  // ----- Shopping list -----
  const shopList = page.querySelector('#shop-list');
  const total = buy.reduce(function (sum, b) { return sum + b.cost; }, 0);
  page.querySelector('#shop-sub').textContent = buy.length
    ? 'For your ' + w.orders.toLowerCase() + ' in the next 2 weeks' + (total ? ', about ' + money(total) : '')
    : usesOrders() ? 'Things for your ' + w.orders.toLowerCase() + ' show up here on their own' : 'Things you need to buy';

  buy.forEach(function (b) {
    const row = document.createElement('div');
    row.className = 'shop-row auto';
    row.innerHTML = '<button class="task-check" role="checkbox" aria-checked="false">' + icon('tick') + '</button>' +
      '<div class="task-text"><span class="task-words"></span><span class="task-meta"><span class="task-due"></span></span></div>' +
      '<span class="shop-cost"></span>';
    row.querySelector('.task-words').textContent = b.supply.name + ', buy ' + (b.packs
      ? niceNumber(b.packs * b.supply.packSize) + ' ' + b.supply.unit + ' (' + b.packs + (b.packs === 1 ? ' pack)' : ' packs)')
      : niceNumber(b.short) + ' ' + b.supply.unit);
    row.querySelector('.task-due').textContent = 'Need ' + niceNumber(b.need) + ' ' + b.supply.unit + ', have ' +
      niceNumber(b.supply.have || 0) + '. For ' + Array.from(new Set(b.who)).join(', ');
    row.querySelector('.shop-cost').textContent = b.cost ? money(b.cost) : '';
    row.querySelector('.task-check').setAttribute('aria-label', 'Bought ' + b.supply.name);
    row.querySelector('.task-check').addEventListener('click', function () {
      // Bought it: add it to what you have, and to your money out
      const before = b.supply.have || 0;
      const added = b.packs ? b.packs * b.supply.packSize : b.short;
      b.supply.have = Number(before) + added;
      saveSupplies();
      let entry = null;
      if (b.cost) {
        entry = { id: newId('m'), kind: 'out', amount: Math.round(b.cost * 100) / 100, what: b.supply.name, date: todayText() };
        moneyEntries.push(entry);
        saveMoney();
      }
      showPage();
      showUndo('Bought ' + b.supply.name + (entry ? ', added ' + money(entry.amount) + ' to Bookkeeping' : ''), function () {
        b.supply.have = before;
        saveSupplies();
        if (entry) { moneyEntries = moneyEntries.filter(function (m) { return m !== entry; }); saveMoney(); }
        showPage();
      });
    });
    shopList.appendChild(row);
  });

  extra.concat(bought).forEach(function (item) {
    const row = document.createElement('div');
    row.className = 'shop-row' + (item.done ? ' done' : '');
    row.innerHTML = '<button class="task-check" role="checkbox">' + icon('tick') + '</button>' +
      '<div class="task-text"><span class="task-words"></span></div>' +
      '<button class="row-delete">' + icon('trash') + '</button>';
    row.querySelector('.task-words').textContent = item.text;
    row.querySelector('.task-check').setAttribute('aria-checked', item.done ? 'true' : 'false');
    row.querySelector('.task-check').addEventListener('click', function () {
      item.done = !item.done;
      saveShopping();
      showPage();
    });
    row.querySelector('.row-delete').setAttribute('aria-label', 'Remove ' + item.text);
    row.querySelector('.row-delete').addEventListener('click', function () {
      shopping = shopping.filter(function (i) { return i !== item; });
      saveShopping();
      showPage();
    });
    shopList.appendChild(row);
  });
  if (!buy.length && !shopping.length) {
    shopList.innerHTML = '<p class="shop-empty">Nothing to buy right now.</p>';
  }

  page.querySelector('#shop-add').addEventListener('submit', function (e) {
    e.preventDefault();
    const text = page.querySelector('#shop-text').value.trim();
    if (!text) return;
    shopping.push({ id: newId('b'), text: text, done: false });
    saveShopping();
    showPage();
    document.getElementById('shop-text').focus();
  });

  // ----- What you have -----
  const have = page.querySelector('#have-list');
  if (!supplies.length) {
    have.innerHTML = '<p class="list-empty"></p>';
    have.firstChild.textContent = 'Add your ' + w.supplies.toLowerCase() + ' with what you pay for them, so the app can work out costs and your shopping list.';
    return;
  }
  const list = document.createElement('div');
  list.className = 'supply-list';
  supplies.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (s) {
    const short = buy.find(function (b) { return b.supply === s; });
    const row = document.createElement('div');
    row.className = 'supply-row' + (short ? ' low' : '');
    row.innerHTML = `
      <button class="supply-main"><b></b><span></span></button>
      <div class="have-stepper">
        <button class="round-btn small" aria-label="Less">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 12h12"/></svg>'}</button>
        <span class="have-amount"></span>
        <button class="round-btn small" aria-label="More">${icon('plus')}</button>
      </div>
    `;
    row.querySelector('b').textContent = s.name;
    row.querySelector('.supply-main span').textContent = unitCost(s)
      ? money(s.packPrice) + ' for ' + niceNumber(s.packSize) + ' ' + s.unit
      : 'No price yet';
    row.querySelector('.have-amount').textContent = niceNumber(s.have || 0) + ' ' + s.unit;
    row.querySelector('.supply-main').addEventListener('click', function () { editSupply(s); });
    const step = s.packSize ? Math.max(1, Math.round(s.packSize / 10)) : 1;
    const btns = row.querySelectorAll('.have-stepper button');
    btns[0].addEventListener('click', function () { s.have = Math.max(0, Number(s.have || 0) - step); saveSupplies(); showPage(); });
    btns[1].addEventListener('click', function () { s.have = Number(s.have || 0) + step; saveSupplies(); showPage(); });
    list.appendChild(row);
  });
  have.appendChild(list);
}

// =========================================
// ADD FROM A PICTURE
// Take a screenshot (or photo) of a receipt or a list. The app reads it,
// shows what it found so you can fix anything, then adds it to your list.
// Reading pictures uses Tesseract.js, a free tool that loads from the internet the first time.
// =========================================
const OCR_SCRIPT = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';

function loadOcr() {
  return new Promise(function (resolve, reject) {
    if (window.Tesseract) return resolve(window.Tesseract);
    const script = document.createElement('script');
    script.src = OCR_SCRIPT;
    script.onload = function () { window.Tesseract ? resolve(window.Tesseract) : reject(new Error('no reader')); };
    script.onerror = function () { reject(new Error('could not load the reader')); };
    document.head.appendChild(script);
  });
}

// Reads the words in a picture. onProgress gets a number from 0 to 1.
async function readPicture(file, onProgress) {
  const T = await loadOcr();
  const worker = await T.createWorker('eng', 1, {
    logger: function (m) { if (m.status === 'recognizing text' && onProgress) onProgress(m.progress || 0); },
  });
  try {
    const result = await worker.recognize(file);
    return result.data.text || '';
  } finally {
    worker.terminate();
  }
}

// Lines on a receipt that aren't things you bought
const NOT_AN_ITEM = /\b(sub ?total|total|tax|balance|change|cash|visa|mastercard|amex|debit|credit|card|tender|savings|you saved|saved|discount|coupon|thank|receipt|store|tel|phone|www|\.com|items? sold|member|points|approved|auth|ref|cashier|register|order #|invoice|due|paid|payment|refund|return)\b/i;

const UNIT_WORDS = [
  [/^(lbs?|pounds?|#)$/i, 'lb'], [/^(oz|ounces?)$/i, 'oz'], [/^(fl ?oz)$/i, 'fl oz'],
  [/^(g|grams?|gr)$/i, 'g'], [/^(kg|kilos?|kilograms?)$/i, 'kg'], [/^(ml|milliliters?)$/i, 'ml'],
  [/^(l|liters?|litres?|ltr)$/i, 'l'], [/^(ct|count|pcs?|pieces?|ea|each)$/i, 'each'],
  [/^(doz|dozen)$/i, 'dozen'], [/^(cups?)$/i, 'cups'], [/^(gal|gallons?)$/i, 'gal'], [/^(qt|quarts?)$/i, 'qt'],
  [/^(pk|packs?|pkg)$/i, 'pack'], [/^(sticks?)$/i, 'sticks'], [/^(bags?)$/i, 'bags'], [/^(box|boxes)$/i, 'boxes'],
  [/^(rolls?)$/i, 'rolls'], [/^(sheets?)$/i, 'sheets'], [/^(bottles?)$/i, 'bottles'], [/^(jars?)$/i, 'jars'], [/^(cans?)$/i, 'cans'],
];
function cleanUnit(word) {
  for (let i = 0; i < UNIT_WORDS.length; i++) if (UNIT_WORDS[i][0].test(word)) return UNIT_WORDS[i][1];
  return '';
}
const UNIT_PATTERN = /(\d+(?:[.,]\d+)?)\s*-?\s*(fl ?oz|lbs?|pounds?|ounces?|oz|grams?|gr|g|kilograms?|kilos?|kg|milliliters?|ml|liters?|litres?|ltr|l|count|ct|pcs?|pieces?|ea|each|dozen|doz|cups?|gallons?|gal|quarts?|qt|packs?|pkg|pk|sticks?|bags?|boxes|box|rolls?|sheets?|bottles?|jars?|cans?)\b/i;

// Turns the words from a picture (or pasted text) into a list of things with amounts and prices
function parseList(text) {
  const found = [];
  (text || '').split(/\r?\n/).forEach(function (raw) {
    let line = raw.replace(/[|_~*]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!/[a-z]{2,}/i.test(line) || NOT_AN_ITEM.test(line)) return;

    // The price: the last money amount on the line ("$4.50" or "4.50")
    let price = '';
    const prices = line.match(/\$?\s?\d{1,4}[.,]\d{2}(?!\d)/g);
    if (prices) {
      const last = prices[prices.length - 1];
      price = last.replace(/[$\s]/g, '').replace(',', '.');
      line = line.slice(0, line.lastIndexOf(last)) + line.slice(line.lastIndexOf(last) + last.length);
    }

    // How much: "5 lb", "16 oz", "12 ct"... or "2 @" / "x2" for how many
    let amount = '';
    let unit = '';
    const size = line.match(UNIT_PATTERN);
    if (size) {
      amount = Number(size[1].replace(',', '.'));
      unit = cleanUnit(size[2]);
      line = line.replace(size[0], ' ');
    }
    let count = 1;
    const times = line.match(/(?:^|\s)(?:(\d+)\s*@|x\s*(\d+)|(\d+)\s*x)(?=\s|$)/i);
    if (times) {
      count = Number(times[1] || times[2] || times[3]) || 1;
      line = line.replace(times[0], ' ');
      line = line.replace(/\$?\d+[.,]\d{2}/g, ' '); // the price for one, after the @
    }
    if (amount && count > 1) amount = amount * count;
    if (!amount) { amount = count; unit = unit || 'each'; }

    // The name: what's left, without codes, numbers and tax letters
    let name = line
      .replace(/\b\d{4,}\b/g, ' ')          // item numbers
      .replace(/\$/g, ' ')
      .replace(/(^|\s)[A-Z](?=\s|$)/g, ' ') // tax letters like "F" or "T"
      .replace(/\s\d+(?=\s|$)/g, ' ')        // stray numbers
      .replace(/[^A-Za-z0-9&'%\-\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (name.replace(/[^a-z]/gi, '').length < 2) return;
    if (name === name.toUpperCase()) {
      name = name.toLowerCase().replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
    }
    found.push({ name: name, amount: amount, unit: unit || 'each', price: price, use: true });
  });
  // On a receipt, lines without a price are things like the store's name, so leave them out
  const priced = found.filter(function (it) { return it.price; });
  return priced.length ? priced : found;
}

// An ingredient you already have with the same name
function sameSupply(name) {
  const n = name.toLowerCase().trim();
  return supplies.find(function (s) {
    const m = s.name.toLowerCase().trim();
    return m === n || (m.length > 3 && n.includes(m)) || (n.length > 3 && m.includes(n));
  });
}

function openPictureImport() {
  const w = words();
  let items = [];
  let picture = '';

  const box = openWindow({
    title: 'Add from a picture',
    saveLabel: 'Add to ' + w.supplies,
    wide: true,
    html: `
      <div class="import-start">
        <p class="import-help">Take a screenshot of a receipt, an online order or a list of what you need. The app reads it and fills in the names, amounts and prices for you.</p>
        <label class="import-drop" id="import-drop" tabindex="0">
          <input type="file" accept="image/*" id="import-file" hidden>
          <span class="import-drop-icon">${icon('camera')}</span>
          <b>Paste a screenshot here</b>
          <span>Press <kbd>Ctrl</kbd> + <kbd>V</kbd>, drop a picture, or click to choose one</span>
          <small>Tip: <kbd>Windows</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> takes a screenshot</small>
        </label>
        <button type="button" class="link-btn import-type" id="import-type">Or type or paste the list as words</button>
        <div class="import-text" hidden>
          <textarea class="input" id="import-words" rows="6" placeholder="Flour 5 lb $4.50&#10;Sugar 4 lb $3.29&#10;Cake boxes 10 ct $8.99"></textarea>
          <button type="button" class="btn secondary small" id="import-read-words">Read this list</button>
        </div>
      </div>
      <div class="import-reading" hidden>
        <img class="import-thumb" alt="Your picture">
        <div>
          <b>Reading your picture...</b>
          <div class="import-bar"><span></span></div>
          <small>This can take a few seconds. The first time, it also loads the reader from the internet.</small>
        </div>
      </div>
      <div class="import-review" hidden>
        <div class="import-review-head">
          <img class="import-thumb small" alt="Your picture">
          <p class="import-found"></p>
        </div>
        <div class="import-table">
          <div class="import-row import-labels"><span></span><span>Name</span><span>Amount</span><span>Unit</span><span>Price</span></div>
          <div id="import-rows"></div>
        </div>
        <button type="button" class="link-btn" id="import-add-row">${icon('plus')}<span>Add a line</span></button>
        <button type="button" class="link-btn" id="import-again">Try a different picture</button>
      </div>
    `,
    fill: function (box) {
      box.querySelector('#window-save').hidden = true;
    },
    onSave: function (box) {
      const chosen = items.filter(function (it) { return it.use && it.name.trim(); });
      if (!chosen.length) { box.problem('Check at least one thing to add.'); return false; }
      const added = [];
      const changed = [];
      chosen.forEach(function (it) {
        const match = sameSupply(it.name);
        const size = Number(it.amount) || 1;
        const cost = Number(String(it.price).replace(/[$,]/g, '')) || 0;
        if (match) {
          changed.push({ supply: match, was: Object.assign({}, match) });
          if (cost) { match.packPrice = cost; match.packSize = size; match.unit = it.unit || match.unit; }
        } else {
          const s = { id: newId('s'), name: it.name.trim(), unit: it.unit || 'each', packSize: size, packPrice: cost, have: size };
          supplies.push(s);
          added.push(s);
        }
      });
      saveSupplies();
      document.removeEventListener('paste', onPaste);
      showPage();
      const message = (added.length ? 'Added ' + added.length + ' to ' + w.supplies : '') +
        (added.length && changed.length ? ' and updated ' : changed.length ? 'Updated ' : '') +
        (changed.length ? changed.length + (changed.length === 1 ? ' price' : ' prices') : '');
      showUndo(message, function () {
        supplies = supplies.filter(function (s) { return added.indexOf(s) === -1; });
        changed.forEach(function (c) { Object.assign(c.supply, c.was); });
        saveSupplies();
        showPage();
      });
    },
  });

  const start = box.querySelector('.import-start');
  const reading = box.querySelector('.import-reading');
  const review = box.querySelector('.import-review');
  const save = box.querySelector('#window-save');
  const fileInput = box.querySelector('#import-file');
  const drop = box.querySelector('#import-drop');

  function show(part) {
    start.hidden = part !== start;
    reading.hidden = part !== reading;
    review.hidden = part !== review;
    save.hidden = part !== review;
    box.problem('');
  }

  // Ctrl + V anywhere in the window
  function onPaste(e) {
    if (!document.body.contains(box)) { document.removeEventListener('paste', onPaste); return; }
    const files = Array.from((e.clipboardData && e.clipboardData.items) || [])
      .filter(function (it) { return it.type.indexOf('image') === 0; })
      .map(function (it) { return it.getAsFile(); });
    if (files.length) { e.preventDefault(); usePicture(files[0]); }
  }
  document.addEventListener('paste', onPaste);
  box.addEventListener('close', function () { document.removeEventListener('paste', onPaste); });

  fileInput.addEventListener('change', function () { if (fileInput.files[0]) usePicture(fileInput.files[0]); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
  drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', function () { drop.classList.remove('over'); });
  drop.addEventListener('drop', function (e) {
    e.preventDefault();
    drop.classList.remove('over');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && file.type.indexOf('image') === 0) usePicture(file);
  });

  box.querySelector('#import-type').addEventListener('click', function () {
    box.querySelector('.import-text').hidden = false;
    box.querySelector('#import-words').focus();
  });
  box.querySelector('#import-read-words').addEventListener('click', function () {
    picture = '';
    showReview(parseList(box.querySelector('#import-words').value));
  });
  box.querySelector('#import-again').addEventListener('click', function () {
    fileInput.value = '';
    show(start);
  });
  box.querySelector('#import-add-row').addEventListener('click', function () {
    items.push({ name: '', amount: 1, unit: 'each', price: '', use: true });
    drawRows();
    const names = box.querySelectorAll('.import-name');
    names[names.length - 1].focus();
  });

  async function usePicture(file) {
    picture = URL.createObjectURL(file);
    box.querySelectorAll('.import-thumb').forEach(function (img) { img.src = picture; });
    show(reading);
    const bar = box.querySelector('.import-bar span');
    bar.style.width = '5%';
    try {
      const text = await readPicture(file, function (p) { bar.style.width = Math.max(5, Math.round(p * 100)) + '%'; });
      if (!document.body.contains(box)) return;
      const list = parseList(text);
      if (!list.length) {
        show(start);
        box.querySelector('.import-text').hidden = false;
        box.querySelector('#import-words').value = text.trim();
        box.problem('We couldn\'t find any items with prices in that picture. Try a clearer screenshot, or fix the words below and click Read this list.');
        return;
      }
      showReview(list);
    } catch (error) {
      if (!document.body.contains(box)) return;
      show(start);
      box.querySelector('.import-text').hidden = false;
      box.problem('We couldn\'t read the picture. Reading pictures needs the internet the first time. You can type or paste the list below instead.');
    }
  }

  function showReview(list) {
    if (!list.length) { box.problem('Add at least one line, like "Flour 5 lb $4.50".'); return; }
    items = list;
    box.querySelectorAll('.import-thumb').forEach(function (img) { img.hidden = !picture; });
    show(review);
    drawRows();
  }

  function drawRows() {
    const rows = box.querySelector('#import-rows');
    rows.innerHTML = '';
    items.forEach(function (it) {
      const row = document.createElement('div');
      row.className = 'import-row';
      row.innerHTML = `
        <button type="button" class="task-check" role="checkbox">${icon('tick')}</button>
        <div class="import-name-cell"><input class="input import-name" aria-label="Name"><span class="import-tag" hidden>Updates the price</span></div>
        <input class="input import-amount" type="number" min="0" step="any" aria-label="Amount">
        <input class="input import-unit" list="import-units" aria-label="Unit">
        <div class="money-box"><span>$</span><input class="input import-price" type="number" min="0" step="0.01" aria-label="Price"></div>
      `;
      const check = row.querySelector('.task-check');
      function drawCheck() {
        check.setAttribute('aria-checked', it.use ? 'true' : 'false');
        check.setAttribute('aria-label', (it.use ? 'Skip ' : 'Add ') + (it.name || 'this line'));
        row.classList.toggle('skipped', !it.use);
      }
      drawCheck();
      check.addEventListener('click', function () { it.use = !it.use; drawCheck(); updateCount(); });

      const name = row.querySelector('.import-name');
      const tag = row.querySelector('.import-tag');
      name.value = it.name;
      function drawTag() { tag.hidden = !sameSupply(name.value || ' '); }
      drawTag();
      name.addEventListener('input', function () { it.name = name.value; drawTag(); });
      const amount = row.querySelector('.import-amount');
      amount.value = it.amount;
      amount.addEventListener('input', function () { it.amount = amount.value; });
      const unit = row.querySelector('.import-unit');
      unit.value = it.unit;
      unit.addEventListener('input', function () { it.unit = unit.value; });
      const price = row.querySelector('.import-price');
      price.value = it.price;
      price.addEventListener('input', function () { it.price = price.value; });
      rows.appendChild(row);
    });
    let units = document.getElementById('import-units');
    if (!units) {
      units = document.createElement('datalist');
      units.id = 'import-units';
      UNIT_IDEAS.concat(['pack', 'bags', 'boxes', 'rolls', 'gal']).forEach(function (u) {
        const o = document.createElement('option');
        o.value = u;
        units.appendChild(o);
      });
      box.appendChild(units);
    }
    updateCount();
  }

  function updateCount() {
    const n = items.filter(function (it) { return it.use; }).length;
    box.querySelector('.import-found').textContent = 'We found ' + items.length + (items.length === 1 ? ' thing' : ' things') +
      '. Check the names, amounts and prices, and fix anything that looks wrong. Uncheck anything you don\'t want.';
    save.textContent = n ? 'Add ' + n + ' to ' + w.supplies : 'Add to ' + w.supplies;
  }
}

// =========================================
// PRICING AND PROFIT
// True cost = ingredients + your time. Suggested price adds the profit you want.
// =========================================
function pricingSettings() {
  return { hourly: profile.hourlyPay === undefined ? 15 : profile.hourlyPay, extra: profile.profitWanted === undefined ? 30 : profile.profitWanted };
}

function showPricing(page) {
  const w = words();
  const set = pricingSettings();
  page.innerHTML = `
    <header class="page-head with-button">
      <div><h1>Pricing and profit</h1><p></p></div>
      <button class="btn with-icon" id="from-picture">${icon('camera')}<span>Add from a picture</span></button>
    </header>
    <div class="pricing-settings">
      <label><span>Pay yourself</span>
        <div class="money-box"><span>$</span><input class="input" id="pay-rate" type="number" min="0" step="0.5"></div>
        <span>an hour</span></label>
      <label><span>Profit on top</span>
        <input class="input" id="profit-rate" type="number" min="0" step="5"><span>%</span></label>
    </div>
    <div id="price-list"></div>
  `;
  page.querySelector('.page-head p').textContent = 'What each ' + oneProduct() + ' really costs you, and what to charge';
  page.querySelector('#from-picture').addEventListener('click', openPictureImport);
  const pay = page.querySelector('#pay-rate');
  const extra = page.querySelector('#profit-rate');
  pay.value = set.hourly;
  extra.value = set.extra;
  function saveRates() {
    profile.hourlyPay = Number(pay.value) || 0;
    profile.profitWanted = Number(extra.value) || 0;
    saveProfile();
    drawList();
  }
  pay.addEventListener('change', saveRates);
  extra.addEventListener('change', saveRates);

  const box = page.querySelector('#price-list');
  function drawList() {
    box.innerHTML = '';
    if (!products.length) {
      box.innerHTML = '<div class="empty mint"><span class="empty-icon">' + icon('tag') + '</span><h3></h3><p></p><button class="btn" id="go-products"></button></div>';
      box.querySelector('h3').textContent = 'Add your ' + w.products.toLowerCase() + ' first';
      box.querySelector('p').textContent = 'Once you add what goes into each one, this page works out your costs and a fair price.';
      box.querySelector('#go-products').textContent = 'Go to ' + w.products;
      box.querySelector('#go-products').addEventListener('click', function () { goTo('products'); });
      return;
    }
    const s = pricingSettings();
    products.forEach(function (p) {
      const supplyCost = productCost(p);
      const timeCost = Number(p.hours || 0) * s.hourly;
      const trueCost = supplyCost + timeCost;
      const suggested = Math.ceil(trueCost * (1 + s.extra / 100));
      const price = Number(p.price || 0);
      const left = price - trueCost;
      let mood = 'none';
      let note = 'No price set yet';
      if (price) {
        if (left < 0) { mood = 'bad'; note = 'You lose ' + money(-left) + ' each time'; }
        else if (price < suggested) { mood = 'thin'; note = 'You make ' + money(left) + ', a little under your goal'; }
        else { mood = 'good'; note = 'You make ' + money(left) + ' each time'; }
      }

      const card = document.createElement('div');
      card.className = 'price-card ' + mood;
      card.innerHTML = `
        <div class="pc-head"><b></b><span class="pc-note"></span></div>
        <div class="pc-bar" aria-hidden="true"><span class="pc-supplies"></span><span class="pc-time"></span><span class="pc-profit"></span></div>
        <div class="pc-numbers">
          <span><small></small><b class="n-supplies"></b></span>
          <span><small>Your time</small><b class="n-time"></b></span>
          <span><small>True cost</small><b class="n-cost"></b></span>
          <span><small>You charge</small><b class="n-price"></b></span>
          <span class="pc-suggest"><small>Suggested</small><b class="n-suggest"></b></span>
        </div>
        <button class="btn small" hidden>Use the suggested price</button>
      `;
      card.querySelector('.pc-head b').textContent = p.name;
      card.querySelector('.pc-note').textContent = note;
      card.querySelector('.pc-numbers small').textContent = w.supplies;
      card.querySelector('.n-supplies').textContent = money(supplyCost);
      card.querySelector('.n-time').textContent = p.hours ? money(timeCost) : 'Not set';
      card.querySelector('.n-cost').textContent = money(trueCost);
      card.querySelector('.n-price').textContent = price ? money(price) : 'Not set';
      card.querySelector('.n-suggest').textContent = trueCost ? money(suggested) : '-';

      // The bar: ingredients, time, and what's left over, out of the price
      const whole = Math.max(price, trueCost) || 1;
      card.querySelector('.pc-supplies').style.width = (supplyCost / whole * 100) + '%';
      card.querySelector('.pc-time').style.width = (timeCost / whole * 100) + '%';
      card.querySelector('.pc-profit').style.width = (Math.max(0, left) / whole * 100) + '%';

      const use = card.querySelector('.btn');
      if (trueCost && price !== suggested) {
        use.hidden = false;
        use.textContent = 'Charge ' + money(suggested) + ' instead';
        use.addEventListener('click', function () {
          const was = p.price;
          p.price = suggested;
          saveProducts();
          drawList();
          showUndo(p.name + ' is now ' + money(suggested), function () { p.price = was; saveProducts(); drawList(); });
        });
      }
      box.appendChild(card);
    });
    const how = document.createElement('p');
    how.className = 'pricing-how';
    how.textContent = 'True cost is your ' + w.supplies.toLowerCase() + ' plus your time. The suggested price adds the profit you picked on top, rounded up to the next dollar.';
    box.appendChild(how);
  }
  drawList();
}

// =========================================
// BOOKKEEPING
// Money in: paid orders, plus anything you add. Money out: what you add (and shopping you check off).
// Each added entry: { id, kind: 'in' or 'out', amount, what, date }
// =========================================
const MONEY_KEY = 'bizStudio.money';
let moneyEntries = loadList(MONEY_KEY);
function saveMoney() { saveList(MONEY_KEY, moneyEntries); }
let bookMonth = null; // "2026-11-01", or null for this month

// Every money line, paid orders included
function allMoney() {
  const list = moneyEntries.map(function (m) { return Object.assign({ fromOrder: null }, m); });
  orders.filter(function (o) { return o.status === 'paid' && Number(o.price); }).forEach(function (o) {
    list.push({ id: 'order-' + o.id, kind: 'in', amount: Number(o.price), what: o.item + ' for ' + o.customer, date: o.due, fromOrder: o });
  });
  return list;
}

function monthTotals(list, year, month) {
  let moneyIn = 0;
  let moneyOut = 0;
  list.forEach(function (m) {
    const d = toDate(m.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    if (m.kind === 'in') moneyIn += Number(m.amount); else moneyOut += Number(m.amount);
  });
  return { moneyIn: moneyIn, moneyOut: moneyOut };
}

function showBookkeeping(page) {
  const w = words();
  const today = toDate(todayText());
  const month = bookMonth ? toDate(bookMonth) : new Date(today.getFullYear(), today.getMonth(), 1);
  const list = allMoney();
  const totals = monthTotals(list, month.getFullYear(), month.getMonth());
  const unpaid = orders.filter(function (o) { return o.status === 'done' && Number(o.price); });
  const unpaidTotal = unpaid.reduce(function (sum, o) { return sum + Number(o.price); }, 0);

  page.innerHTML = `
    <header class="page-head with-button">
      <div><h1>Bookkeeping</h1><p></p></div>
      <div class="month-nav">
        <button class="round-btn" id="bk-prev" aria-label="Last month">${icon('back')}</button>
        <h2 class="month-name"></h2>
        <button class="round-btn" id="bk-next" aria-label="Next month">${icon('chevron')}</button>
      </div>
    </header>
    <div class="money-tiles">
      <div class="money-tile mint"><span>Money in</span><b id="mt-in"></b></div>
      <div class="money-tile pink"><span>Money out</span><b id="mt-out"></b></div>
      <div class="money-tile sky"><span>You kept</span><b id="mt-kept"></b></div>
      <div class="money-tile butter"><span>Waiting to be paid</span><b id="mt-wait"></b></div>
    </div>
    <section class="chart-box">
      <h2>Last 6 months</h2>
      <div class="money-chart" id="money-chart"></div>
      <div class="chart-key"><span class="key-in">Money in</span><span class="key-out">Money out</span></div>
    </section>
    <section>
      <div class="person-orders-head">
        <h2>This month</h2>
        <div class="head-buttons">
          <button class="btn secondary with-icon" id="add-out">${icon('plus')}<span>Money out</span></button>
          <button class="btn with-icon" id="add-in">${icon('plus')}<span>Money in</span></button>
        </div>
      </div>
      <div class="money-list" id="money-list"></div>
    </section>
  `;
  page.querySelector('.page-head p').textContent = usesOrders()
    ? 'Paid ' + w.orders.toLowerCase() + ' count as money in on their due date'
    : 'Money in and money out, month by month';
  page.querySelector('.month-name').textContent = month.toLocaleDateString(appLocale(), { month: 'long', year: 'numeric' });
  page.querySelector('#mt-in').textContent = money(totals.moneyIn);
  page.querySelector('#mt-out').textContent = money(totals.moneyOut);
  page.querySelector('#mt-kept').textContent = money(totals.moneyIn - totals.moneyOut);
  page.querySelector('#mt-wait').textContent = money(unpaidTotal);
  if (!usesOrders()) {
    page.querySelector('#mt-wait').parentNode.remove();
    page.querySelector('.money-tiles').classList.add('three');
  }

  page.querySelector('#bk-prev').addEventListener('click', function () { bookMonth = dateText(new Date(month.getFullYear(), month.getMonth() - 1, 1)); showPage(); });
  page.querySelector('#bk-next').addEventListener('click', function () { bookMonth = dateText(new Date(month.getFullYear(), month.getMonth() + 1, 1)); showPage(); });
  page.querySelector('#add-in').addEventListener('click', function () { editMoney('in'); });
  page.querySelector('#add-out').addEventListener('click', function () { editMoney('out'); });

  // Bars for the last 6 months
  const chart = page.querySelector('#money-chart');
  const months = [];
  for (let i = 5; i >= 0; i--) months.push(new Date(month.getFullYear(), month.getMonth() - i, 1));
  const sums = months.map(function (m) { return monthTotals(list, m.getFullYear(), m.getMonth()); });
  const top = Math.max.apply(null, sums.map(function (s) { return Math.max(s.moneyIn, s.moneyOut); }).concat([1]));
  months.forEach(function (m, i) {
    const col = document.createElement('div');
    col.className = 'chart-col' + (i === 5 ? ' now' : '');
    col.innerHTML = '<div class="chart-bars"><span class="bar-in"></span><span class="bar-out"></span></div><span class="chart-label"></span>';
    col.querySelector('.bar-in').style.height = (sums[i].moneyIn / top * 100) + '%';
    col.querySelector('.bar-out').style.height = (sums[i].moneyOut / top * 100) + '%';
    col.querySelector('.bar-in').title = 'In: ' + money(sums[i].moneyIn);
    col.querySelector('.bar-out').title = 'Out: ' + money(sums[i].moneyOut);
    col.querySelector('.chart-label').textContent = m.toLocaleDateString(appLocale(), { month: 'short' });
    chart.appendChild(col);
  });

  // The list for this month, newest first
  const box = page.querySelector('#money-list');
  const lines = list.filter(function (m) {
    const d = toDate(m.date);
    return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
  }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  if (!lines.length) {
    box.innerHTML = '<p class="list-empty">Nothing this month yet.</p>';
    return;
  }
  lines.forEach(function (m) {
    const row = document.createElement('div');
    row.className = 'money-row ' + m.kind;
    row.innerHTML = '<span class="money-date"></span><button class="money-what"></button><b class="money-amount"></b>';
    row.querySelector('.money-date').textContent = niceDate(m.date);
    row.querySelector('.money-what').textContent = m.what || (m.kind === 'in' ? 'Money in' : 'Money out');
    row.querySelector('.money-amount').textContent = (m.kind === 'in' ? '+' : '-') + money(m.amount);
    row.querySelector('.money-what').addEventListener('click', function () {
      if (m.fromOrder) openOrderForm(m.fromOrder.id);
      else editMoney(m.kind, moneyEntries.find(function (x) { return x.id === m.id; }));
    });
    if (m.fromOrder) {
      const tag = document.createElement('span');
      tag.className = 'money-tag';
      tag.textContent = capitalize(oneOrder());
      row.querySelector('.money-what').appendChild(tag);
    }
    box.appendChild(row);
  });
}

// Adding or changing money in or out
function editMoney(kind, entry) {
  const isNew = !entry;
  openWindow({
    title: isNew ? (kind === 'in' ? 'Money in' : 'Money out') : 'Edit',
    saveLabel: isNew ? 'Add it' : 'Save changes',
    html: `
      <label class="label" for="mw-what"></label>
      <input class="input" id="mw-what" autocomplete="off">
      <label class="label" for="mw-amount">How much</label>
      <div class="money-box"><span>$</span><input class="input" id="mw-amount" type="number" min="0" step="0.01" placeholder="0.00"></div>
      <label class="label" for="mw-date">What day</label>
      <input class="input" id="mw-date" type="date">
      <button type="button" class="link-btn delete-btn" id="mw-delete" hidden>${icon('trash')}<span>Delete this</span></button>
    `,
    fill: function (box) {
      box.querySelector('label[for="mw-what"]').textContent = kind === 'in' ? 'What it was for' : 'What you bought or paid';
      box.querySelector('#mw-what').placeholder = kind === 'in' ? 'Bake sale, tips' : 'Cake boxes, booth fee';
      const date = box.querySelector('#mw-date');
      date.value = entry ? entry.date : todayText();
      fancyDate(date);
      if (entry) {
        box.querySelector('#mw-what').value = entry.what;
        box.querySelector('#mw-amount').value = entry.amount;
        const del = box.querySelector('#mw-delete');
        del.hidden = false;
        del.addEventListener('click', function () {
          moneyEntries = moneyEntries.filter(function (m) { return m !== entry; });
          saveMoney();
          box.close();
          box.remove();
          showPage();
          showUndo('Deleted', function () { moneyEntries.push(entry); saveMoney(); showPage(); });
        });
      }
    },
    onSave: function (box) {
      const amount = Number(box.querySelector('#mw-amount').value);
      if (!amount) { box.problem('Type how much it was.'); return false; }
      const values = { kind: kind, amount: amount, what: box.querySelector('#mw-what').value.trim(), date: box.querySelector('#mw-date').value || todayText() };
      if (entry) Object.assign(entry, values);
      else moneyEntries.push(Object.assign({ id: newId('m') }, values));
      saveMoney();
      showPage();
    },
  });
}

// =========================================
// RECEIPTS AND MENUS
// A receipt for any order, and a menu of everything you make. Both can be printed.
// =========================================
let printTab = 'receipt';
let receiptOrder = null;

function showPrintables(page) {
  const w = words();
  page.innerHTML = `
    <header class="page-head"><h1>Receipts and menus</h1><p>Make one, then print it or save it as a PDF</p></header>
    <div class="filter-tabs print-tabs" role="tablist">
      <button class="filter-tab" data-tab="receipt" role="tab">Receipt</button>
      <button class="filter-tab" data-tab="menu" role="tab">Menu</button>
    </div>
    <div class="print-layout">
      <div class="print-controls" id="print-controls"></div>
      <div class="paper-wrap"><div class="paper print-area" id="paper"></div></div>
    </div>
  `;
  if (!usesOrders()) {
    printTab = 'menu';
    page.querySelector('.print-tabs').remove();
    page.querySelector('h1').textContent = 'Menus';
  }
  page.querySelectorAll('[data-tab]').forEach(function (b) {
    const on = b.dataset.tab === printTab;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
    b.addEventListener('click', function () { printTab = b.dataset.tab; showPage(); });
  });

  const controls = page.querySelector('#print-controls');
  const paper = page.querySelector('#paper');

  // The business name at the top of the paper, like the sticker logo
  function paperTop(title) {
    const top = document.createElement('div');
    top.className = 'paper-top';
    top.innerHTML = '<div class="paper-logo"><span></span></div><p class="paper-title"></p>';
    top.querySelector('.paper-logo span').textContent = profile.businessName;
    top.querySelector('.paper-title').textContent = title;
    if (profile.photo) {
      const img = document.createElement('img');
      img.src = profile.photo;
      img.alt = '';
      img.className = 'paper-photo';
      top.prepend(img);
    }
    return top;
  }

  const printBtn = document.createElement('button');
  printBtn.className = 'btn with-icon print-btn';
  printBtn.innerHTML = icon('printer') + '<span>Print</span>';
  printBtn.addEventListener('click', function () { window.print(); });
  if (IN_FRAME) printBtn.hidden = true;

  if (printTab === 'receipt') {
    const choices = sortedOrders();
    if (!choices.length) {
      controls.innerHTML = '<p class="list-empty"></p>';
      controls.firstChild.textContent = 'Add ' + (/^[aeiou]/i.test(oneOrder()) ? 'an ' : 'a ') + oneOrder() + ' first, then make a receipt for it here.';
      paper.parentNode.remove();
      return;
    }
    if (!receiptOrder || !orders.find(function (o) { return o.id === receiptOrder; })) receiptOrder = choices[0].id;
    controls.innerHTML = '<label class="label" for="receipt-pick"></label><select class="input" id="receipt-pick"></select>';
    controls.querySelector('label').textContent = 'Which ' + oneOrder();
    const pick = controls.querySelector('select');
    choices.forEach(function (o) {
      const opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = o.customer + ': ' + o.item + ' (' + niceDate(o.due) + ')';
      pick.appendChild(opt);
    });
    pick.value = receiptOrder;
    pick.addEventListener('change', function () { receiptOrder = pick.value; showPage(); });
    controls.appendChild(printBtn);

    const o = orders.find(function (x) { return x.id === receiptOrder; });
    paper.appendChild(paperTop('Receipt'));
    const body = document.createElement('div');
    body.className = 'receipt-body';
    body.innerHTML = `
      <div class="receipt-meta">
        <div><small>For</small><b class="r-name"></b><span class="r-contact"></span></div>
        <div class="right"><small>Date</small><b class="r-date"></b><span class="r-time"></span></div>
      </div>
      <table class="receipt-table"><thead><tr><th>Item</th><th class="right">Price</th></tr></thead><tbody></tbody>
        <tfoot><tr><td>Total</td><td class="right r-total"></td></tr></tfoot></table>
      <p class="receipt-stamp"></p>
      <p class="paper-thanks">Thank you for your order!</p>
    `;
    body.querySelector('.r-name').textContent = o.customer;
    body.querySelector('.r-contact').textContent = o.contact || '';
    body.querySelector('.r-date').textContent = toDate(o.due).toLocaleDateString(appLocale(), { month: 'long', day: 'numeric', year: 'numeric' });
    body.querySelector('.r-time').textContent = o.time ? niceTime(o.time) : '';
    const tr = document.createElement('tr');
    tr.innerHTML = '<td><b></b><span class="r-details"></span></td><td class="right"></td>';
    tr.querySelector('b').textContent = o.item;
    tr.querySelector('.r-details').textContent = detailChips(o).join('. ');
    tr.querySelector('.right').textContent = o.price ? money(o.price) : '';
    body.querySelector('tbody').appendChild(tr);
    body.querySelector('.r-total').textContent = money(o.price || 0);
    const stamp = body.querySelector('.receipt-stamp');
    stamp.textContent = o.status === 'paid' ? 'Paid' : 'Not paid yet';
    stamp.classList.add(o.status === 'paid' ? 'paid' : 'due');
    paper.appendChild(body);
    return;
  }

  // ----- Menu -----
  if (!products.length) {
    controls.innerHTML = '<p class="list-empty"></p><button class="btn" id="go-products"></button>';
    controls.firstChild.textContent = 'Add your ' + w.products.toLowerCase() + ' with prices first, then your menu makes itself.';
    controls.querySelector('#go-products').textContent = 'Go to ' + w.products;
    controls.querySelector('#go-products').addEventListener('click', function () { goTo('products'); });
    paper.parentNode.remove();
    return;
  }
  if (profile.menuTitle === undefined) profile.menuTitle = 'Menu';
  if (profile.menuNote === undefined) profile.menuNote = '';
  controls.innerHTML = `
    <label class="label" for="menu-title">Title</label>
    <input class="input" id="menu-title" autocomplete="off">
    <label class="label" for="menu-note">A note at the bottom</label>
    <textarea class="input" id="menu-note" rows="3" placeholder="Order 3 days ahead. Text 555-201-3344"></textarea>
  `;
  controls.appendChild(printBtn);
  const titleBox = controls.querySelector('#menu-title');
  const noteBox = controls.querySelector('#menu-note');
  titleBox.value = profile.menuTitle;
  noteBox.value = profile.menuNote;

  function drawMenu() {
    paper.innerHTML = '';
    paper.appendChild(paperTop(profile.menuTitle || 'Menu'));
    const items = document.createElement('div');
    items.className = 'menu-items';
    products.forEach(function (p) {
      const row = document.createElement('div');
      row.className = 'menu-item';
      row.innerHTML = '<div><b></b><span></span></div><span class="menu-dots"></span><b class="menu-price"></b>';
      row.querySelector('div b').textContent = p.name;
      row.querySelector('div span').textContent = p.makes || '';
      row.querySelector('.menu-price').textContent = p.price ? money(p.price) : 'Ask';
      items.appendChild(row);
    });
    paper.appendChild(items);
    if (profile.menuNote) {
      const note = document.createElement('p');
      note.className = 'paper-thanks';
      note.textContent = profile.menuNote;
      paper.appendChild(note);
    }
  }
  function saveMenuWords() {
    profile.menuTitle = titleBox.value;
    profile.menuNote = noteBox.value.trim();
    saveProfile();
    drawMenu();
  }
  titleBox.addEventListener('input', saveMenuWords);
  noteBox.addEventListener('input', saveMenuWords);
  drawMenu();
}

// =========================================
// FINDER
// One search box for everything in the app, plus quick links to find places near you.
// =========================================
let finderText = '';

function showFinder(page) {
  const w = words();
  page.innerHTML = `
    <header class="page-head"><h1>Finder</h1><p>Search everything in your app, or find places near you</p></header>
    <div class="finder-box">
      ${icon('search')}
      <input class="task-input" id="finder-input" type="search" autocomplete="off" aria-label="Search">
    </div>
    <div id="finder-results"></div>
    <section class="near-box">
      <h2>Find near you</h2>
      <div class="near-grid" id="near-grid"></div>
    </section>
  `;
  const input = page.querySelector('#finder-input');
  input.placeholder = 'Search ' + (usesOrders() ? [w.orders, w.customers, w.products, 'tasks'] : [w.customers, w.products, 'tasks']).map(function (x) { return x.toLowerCase(); }).join(', ');
  input.value = finderText;

  const near = [
    { label: 'Farmers markets', q: 'farmers markets near me', color: 'mint' },
    { label: 'Craft fairs', q: 'craft fairs near me', color: 'lilac' },
    { label: w.supplies + ' stores', q: findType(profile.businessType).label + ' ' + w.supplies.toLowerCase() + ' supply store near me', color: 'peach' },
    { label: 'Places to sell', q: 'pop up markets for small businesses near me', color: 'sky' },
  ];
  near.forEach(function (n) {
    const a = document.createElement('a');
    a.className = 'near-card ' + n.color;
    a.href = 'https://www.google.com/maps/search/' + encodeURIComponent(n.q);
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = '<span class="near-icon">' + icon('search') + '</span><b></b><span>Opens Google Maps</span>';
    a.querySelector('b').textContent = n.label;
    page.querySelector('#near-grid').appendChild(a);
  });

  const results = page.querySelector('#finder-results');
  function search() {
    finderText = input.value;
    results.innerHTML = '';
    const q = input.value.trim().toLowerCase();
    if (!q) return;
    const groups = [];

    function has() {
      for (let i = 0; i < arguments.length; i++) if (String(arguments[i] || '').toLowerCase().includes(q)) return true;
      return false;
    }
    groups.push({ title: w.orders, color: 'sky', items: orders.filter(function (o) { return has(o.customer, o.item, o.notes, o.contact, detailChips(o).join(' ')); })
      .map(function (o) { return { main: o.customer + ': ' + o.item, sub: dueText(o), go: function () { openOrderForm(o.id); } }; }) });
    groups.push({ title: w.customers, color: 'pink', items: allCustomers().filter(function (p) { return has(p.name, p.contact); })
      .map(function (p) { return { main: p.name, sub: p.orders.length + ' ' + (p.orders.length === 1 ? oneOrder() : w.orders.toLowerCase()), go: function () { customerView = p.key; goTo('customers'); } }; }) });
    groups.push({ title: w.products, color: 'peach', items: products.filter(function (p) { return has(p.name, p.steps, p.makes); })
      .map(function (p) { return { main: p.name, sub: p.price ? money(p.price) : '', go: function () { productView = p.id; productScale = 1; goTo('products'); } }; }) });
    groups.push({ title: w.supplies, color: 'butter', items: supplies.filter(function (s) { return has(s.name); })
      .map(function (s) { return { main: s.name, sub: 'You have ' + niceNumber(s.have || 0) + ' ' + s.unit, go: function () { goTo('checklist'); } }; }) });
    groups.push({ title: 'Tasks', color: 'mint', items: tasks.filter(function (t) { return has(t.text); })
      .map(function (t) { return { main: t.text, sub: t.done ? 'Done' : t.due ? niceDate(t.due) : 'No date', go: function () { goTo('todo'); } }; }) });

    const found = groups.filter(function (g) { return g.items.length; });
    if (!found.length) {
      results.innerHTML = '<p class="list-empty finder-none"></p>';
      results.firstChild.textContent = 'Nothing matches "' + input.value.trim() + '".';
      return;
    }
    found.forEach(function (g) {
      const section = document.createElement('section');
      section.className = 'finder-group ' + g.color;
      section.innerHTML = '<h2><span class="group-dot"></span><span></span><b class="group-count"></b></h2><div class="finder-list"></div>';
      section.querySelector('h2 span:nth-child(2)').textContent = g.title;
      section.querySelector('.group-count').textContent = g.items.length;
      g.items.slice(0, 8).forEach(function (item) {
        const b = document.createElement('button');
        b.className = 'finder-item';
        b.innerHTML = '<b></b><span></span>';
        b.querySelector('b').textContent = item.main;
        b.querySelector('span').textContent = item.sub;
        b.addEventListener('click', item.go);
        section.querySelector('.finder-list').appendChild(b);
      });
      results.appendChild(section);
    });
  }
  input.addEventListener('input', search);
  search();
  input.focus();
}

// Events in the next week, for My Day
function eventsComingUp() {
  const box = document.createElement('section');
  box.innerHTML = '<div class="section-head"><h2 class="tips-title">Coming up this week</h2><button class="link-btn">See all</button></div>';
  box.querySelector('.link-btn').addEventListener('click', function () { goTo('calendar'); });
  const soon = events.filter(function (e) { const d = daysUntil(e.date); return d >= 0 && d <= 7; })
    .sort(function (a, b) { return (a.date + (a.time || '99')).localeCompare(b.date + (b.time || '99')); });
  if (!soon.length) {
    const none = document.createElement('p');
    none.className = 'day-free';
    none.textContent = 'No events this week. Add one on the Calendar.';
    box.appendChild(none);
    return box;
  }
  const list = document.createElement('div');
  list.className = 'day-orders';
  soon.slice(0, 5).forEach(function (e) {
    const item = document.createElement('button');
    item.className = 'day-order event-card';
    item.innerHTML = '<span class="day-top"><span class="day-time"></span><span class="day-status">Event</span></span><b class="day-name"></b><span class="day-item"></span>';
    const days = daysUntil(e.date);
    item.querySelector('.day-time').textContent = (days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : niceDate(e.date)) + (e.time ? ' at ' + niceTime(e.time) : '');
    item.querySelector('.day-name').textContent = e.title;
    if (e.where) item.querySelector('.day-item').textContent = e.where; else item.querySelector('.day-item').remove();
    item.addEventListener('click', function () { editEvent(e); });
    list.appendChild(item);
  });
  box.appendChild(list);
  return box;
}

// =========================================
// MY DAY
// The first page: today at a glance.
// =========================================
function showMyDay(page) {
  const w = words();
  page.querySelector('.empty').remove();
  const today = todayText();
  const dueToday = orders.filter(function (o) { return isOpen(o) && o.due === today; });
  const late = orders.filter(function (o) { return isOpen(o) && o.due < today; });
  const todayTasks = orderTasks().concat(tasks.filter(function (t) { return !t.done; }))
    .filter(function (t) { return t.flagged || (t.due && t.due <= today); })
    .sort(function (a, b) { return (b.flagged ? 1 : 0) - (a.flagged ? 1 : 0) || (a.due || '').localeCompare(b.due || ''); });
  const now = toDate(today);
  const thisMonth = monthTotals(allMoney(), now.getFullYear(), now.getMonth());
  const toBuy = whatToBuy().length + shopping.filter(function (i) { return !i.done; }).length;

  const tiles = document.createElement('div');
  tiles.className = 'day-tiles';
  [
    usesOrders()
      ? { n: dueToday.length, label: (dueToday.length === 1 ? oneOrder() : w.orders.toLowerCase()) + ' due today', color: 'butter', go: 'calendar' }
      : { n: events.filter(function (e) { return e.date === today; }).length, label: events.filter(function (e) { return e.date === today; }).length === 1 ? 'event today' : 'events today', color: 'butter', go: 'calendar' },
    { n: todayTasks.length, label: todayTasks.length === 1 ? 'task for today' : 'tasks for today', color: 'sky', go: 'todo' },
    { n: money(thisMonth.moneyIn), label: 'paid to you this month', color: 'mint', go: 'bookkeeping' },
    { n: toBuy, label: toBuy === 1 ? 'thing to buy' : 'things to buy', color: 'peach', go: 'checklist' },
  ].forEach(function (t) {
    const b = document.createElement('button');
    b.className = 'day-tile ' + t.color;
    b.innerHTML = '<b></b><span></span>';
    b.querySelector('b').textContent = t.n;
    b.querySelector('span').textContent = t.label;
    b.addEventListener('click', function () { goTo(t.go); });
    tiles.appendChild(b);
  });
  page.appendChild(tiles);

  if (late.length) {
    const warn = document.createElement('button');
    warn.className = 'late-banner';
    warn.innerHTML = icon('clock') + '<span></span>';
    warn.querySelector('span').textContent = late.length + ' ' + (late.length === 1 ? oneOrder() + ' is' : w.orders.toLowerCase() + ' are') + ' late. Tap to see.';
    warn.addEventListener('click', function () { orderFilter = 'open'; goTo('orders'); });
    page.appendChild(warn);
  }

  const two = document.createElement('div');
  two.className = 'day-columns';
  page.appendChild(two);

  // Today's tasks
  const taskBox = document.createElement('section');
  taskBox.innerHTML = '<div class="section-head"><h2 class="tips-title">To do today</h2><button class="link-btn">See all</button></div>';
  taskBox.querySelector('.link-btn').addEventListener('click', function () { goTo('todo'); });
  if (todayTasks.length) {
    const list = document.createElement('div');
    list.className = 'task-list';
    todayTasks.slice(0, 6).forEach(function (t) { list.appendChild(taskRow(t, true)); });
    taskBox.appendChild(list);
  } else {
    const none = document.createElement('p');
    none.className = 'day-free';
    none.textContent = 'Nothing on your list for today.';
    taskBox.appendChild(none);
  }
  two.appendChild(taskBox);

  // Orders coming up this week
  const soon = sortedOrders().filter(function (o) { return isOpen(o) && daysUntil(o.due) <= 7; });
  if (!usesOrders()) {
    two.appendChild(eventsComingUp());
    page.appendChild(stickyBoard());
    showGoalTips(page);
    return;
  }
  const orderBox = document.createElement('section');
  orderBox.innerHTML = '<div class="section-head"><h2 class="tips-title"></h2><button class="link-btn"></button></div>';
  orderBox.querySelector('h2').textContent = 'Coming up this week';
  orderBox.querySelector('.link-btn').textContent = 'See all';
  orderBox.querySelector('.link-btn').addEventListener('click', function () { orderView = null; goTo('orders'); });
  if (soon.length) {
    const list = document.createElement('div');
    list.className = 'day-orders';
    soon.slice(0, 5).forEach(function (o) {
      const item = document.createElement('button');
      item.className = 'day-order ' + (urgency(o) === 'late' ? 'late' : findStatus(o.status).color);
      item.innerHTML = '<span class="day-top"><span class="day-time"></span><span class="day-status"></span></span><b class="day-name"></b><span class="day-item"></span>';
      item.querySelector('.day-time').textContent = dueText(o) + (o.time ? ' at ' + niceTime(o.time) : '');
      item.querySelector('.day-status').textContent = urgency(o) === 'late' ? 'Late' : findStatus(o.status).label;
      item.querySelector('.day-name').textContent = o.customer;
      item.querySelector('.day-item').textContent = o.item;
      item.addEventListener('click', function () { openOrderForm(o.id); });
      list.appendChild(item);
    });
    orderBox.appendChild(list);
  } else {
    const none = document.createElement('p');
    none.className = 'day-free';
    none.textContent = 'No ' + w.orders.toLowerCase() + ' due this week.';
    orderBox.appendChild(none);
  }
  two.appendChild(orderBox);

  page.appendChild(stickyBoard());
  showGoalTips(page);
}

// =========================================
// STICKY NOTES
// Like Microsoft Sticky Notes: simple colored notes with a bar on top.
// Each one can pop out into its own little window you can move anywhere on your screen.
// Each note: { id, text, color, created }
// =========================================
const NOTES_KEY = 'bizStudio.notes';
let notes = loadList(NOTES_KEY);
const NOTE_COLORS = ['butter', 'peach', 'pink', 'lilac', 'sky', 'mint', 'lime', 'sand'];
// Soft pastel sticky note colors (the same in every theme, like real paper)
const NOTE_HEX = {
  butter: '#fff1a8', peach: '#ffd8bd', pink: '#ffd3e2', lilac: '#e4d7ff',
  sky: '#cde7ff', mint: '#c9f0dc', lime: '#e3f3c2', sand: '#efe6da',
};
const NOTE_COLOR_NAMES = {
  butter: 'Yellow', peach: 'Peach', pink: 'Pink', lilac: 'Lavender',
  sky: 'Blue', mint: 'Mint', lime: 'Lime', sand: 'Sand',
};
// A note's color: one of the pastels above, or any color they picked (like "#a0e8ff")
function noteColor(c) { return NOTE_HEX[c] || (/^#[0-9a-f]{6}$/i.test(c || '') ? c : NOTE_HEX.butter); }
const noteWindows = {}; // note id -> its popped-out window

// fromId: which note's window made the change, so that one isn't redrawn while typing
function saveNotes(fromId) {
  saveList(NOTES_KEY, notes);
  syncNoteWindows(fromId);
}

function addNote(after, color) {
  const used = after ? after.color : (notes.length ? notes[notes.length - 1].color : 'sand');
  const next = NOTE_COLORS[(NOTE_COLORS.indexOf(used) + 1) % NOTE_COLORS.length] || 'butter';
  const note = {
    id: newId('n'),
    text: '',
    color: color || next,
    created: new Date().toISOString(),
  };
  notes.push(note);
  saveList(NOTES_KEY, notes);
  return note;
}

function deleteNote(note) {
  const index = notes.indexOf(note);
  notes = notes.filter(function (n) { return n !== note; });
  saveList(NOTES_KEY, notes);
  const win = noteWindows[note.id];
  if (win && !win.closed) win.close();
  if (currentSection === 'myday' || currentSection === 'notes') showPage();
  if (note.text.trim()) {
    showUndo('Note deleted', function () {
      notes.splice(Math.max(0, index), 0, note);
      saveNotes();
      showPage();
    });
  }
}

// A row of pastel colors, plus a rainbow circle to pick any color
function colorPicker(doc, current, onPick) {
  const row = doc.createElement('div');
  row.className = 'note-menu-colors';
  NOTE_COLORS.forEach(function (c) {
    const dot = doc.createElement('button');
    dot.className = 'note-dot';
    dot.title = NOTE_COLOR_NAMES[c];
    dot.setAttribute('aria-label', NOTE_COLOR_NAMES[c]);
    dot.setAttribute('aria-pressed', c === current ? 'true' : 'false');
    dot.dataset.color = c;
    dot.style.background = NOTE_HEX[c];
    dot.addEventListener('click', function () { onPick(c); });
    row.appendChild(dot);
  });
  // Any color at all
  const custom = doc.createElement('label');
  custom.className = 'note-dot custom';
  custom.title = 'Pick any color';
  custom.innerHTML = '<input type="color" aria-label="Pick any color">';
  const input = custom.querySelector('input');
  input.value = /^#[0-9a-f]{6}$/i.test(current || '') ? current : '#ffd3e2';
  if (/^#/.test(current || '')) {
    custom.setAttribute('aria-pressed', 'true');
    custom.style.setProperty('--picked', current);
  }
  input.addEventListener('change', function () { onPick(input.value.toLowerCase()); });
  row.appendChild(custom);
  return row;
}

// The little "..." menu: colors, calendar and Delete
function noteMenu(doc, note, onColor, onDelete, onCalendar, onList, onTodo) {
  const menu = doc.createElement('div');
  menu.className = 'note-menu';
  menu.hidden = true;
  const title = doc.createElement('p');
  title.className = 'note-menu-title';
  title.textContent = 'Color';
  function picked(c) {
    onColor(c);
    menu.hidden = true;
    menu.replaceChild(colorPicker(doc, c, picked), menu.querySelector('.note-menu-colors'));
  }
  const cal = doc.createElement('button');
  cal.className = 'note-menu-delete note-menu-cal';
  cal.innerHTML = icon('calendar') + '<span></span>';
  cal.querySelector('span').textContent = note.date ? 'On calendar: ' + niceDate(note.date) : 'Add to calendar';
  cal.addEventListener('click', function () { menu.hidden = true; onCalendar(); });
  const list = doc.createElement('button');
  list.className = 'note-menu-delete note-menu-cal';
  list.innerHTML = icon('list') + '<span></span>';
  list.querySelector('span').textContent = note.list ? 'Make it plain text' : 'Make it a checklist';
  list.addEventListener('click', function () { menu.hidden = true; onList(); });
  const todo = doc.createElement('button');
  todo.className = 'note-menu-delete note-menu-cal';
  todo.innerHTML = icon('check') + '<span>Make it a to-do</span>';
  todo.addEventListener('click', function () { menu.hidden = true; onTodo(); });
  const del = doc.createElement('button');
  del.className = 'note-menu-delete';
  del.innerHTML = icon('trash') + '<span>Delete note</span>';
  del.addEventListener('click', function () { menu.hidden = true; onDelete(); });
  menu.append(title, colorPicker(doc, note.color, picked), cal, list, todo, del);
  return menu;
}

// ---------- Checklists, pins and to-dos ----------
// A checklist note keeps its lines in note.items ({ text, done }), and note.text too (for search and the calendar)
function syncNoteText(note) {
  if (note.list) note.text = note.items.map(function (item) { return item.text; }).join('\n');
}

function toggleNoteList(note) {
  if (note.list) {
    note.text = note.items.map(function (item) { return item.text; }).filter(function (t) { return t.trim(); }).join('\n');
    note.list = false;
    delete note.items;
  } else {
    const lines = note.text.split('\n')
      .map(function (line) { return line.replace(/^\s*([-*•]|\[[ xX]?\]|☐|☑|✓)\s*/, '').trim(); })
      .filter(Boolean);
    note.items = (lines.length ? lines : ['']).map(function (t) { return { text: t, done: false }; });
    note.list = true;
  }
  saveNotes();
}

// Puts a note on the To-do list: one task, or one for each unchecked line of a checklist
function noteToTodo(note) {
  const texts = note.list
    ? note.items.filter(function (item) { return !item.done && item.text.trim(); }).map(function (item) { return item.text.trim(); })
    : [note.text.replace(/\s+/g, ' ').trim()].filter(Boolean);
  window.focus();
  if (!texts.length) { showUndo('Type what you need to do.', null); return; }
  const stamp = Date.now();
  const added = texts.map(function (t, i) {
    return { id: 't' + stamp + '_' + i, text: t.slice(0, 140), due: note.date || '', done: false, flagged: !!note.pinned, created: new Date().toISOString() };
  });
  added.forEach(function (t) { tasks.push(t); });
  saveTasks();
  showPage();
  showUndo('Added to your To-do list', function () {
    tasks = tasks.filter(function (t) { return added.indexOf(t) === -1; });
    saveTasks();
    showPage();
  });
}

// The checklist itself: a box to check and a line to type on, for each item.
// Enter adds a new line, Backspace on an empty line removes it.
function noteListEditor(doc, note, onChange) {
  const box = doc.createElement('div');
  box.className = 'note-list';
  function draw(focusIndex) {
    box.innerHTML = '';
    note.items.forEach(function (item, i) {
      const row = doc.createElement('div');
      row.className = 'note-item' + (item.done ? ' done' : '');
      row.innerHTML = '<button type="button" class="note-check" role="checkbox">' + icon('tick') + '</button><textarea class="note-item-text" rows="1" aria-label="List item"></textarea>';
      const check = row.querySelector('.note-check');
      check.setAttribute('aria-checked', item.done ? 'true' : 'false');
      check.setAttribute('aria-label', (item.done ? 'Not done: ' : 'Done: ') + (item.text || 'List item'));
      check.addEventListener('click', function () {
        item.done = !item.done;
        onChange();
        draw();
      });
      const input = row.querySelector('textarea');
      input.value = item.text;
      // Long lines wrap: the box grows to fit
      const fit = function () { input.style.height = 'auto'; input.style.height = input.scrollHeight + 'px'; };
      input.addEventListener('input', fit);
      (doc.defaultView || window).requestAnimationFrame(fit);
      input.placeholder = i === note.items.length - 1 ? 'Write here...' : '';
      input.addEventListener('input', function () {
        item.text = input.value;
        syncNoteText(note);
        onChange(true);
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          note.items.splice(i + 1, 0, { text: '', done: false });
          onChange();
          draw(i + 1);
        } else if (e.key === 'Backspace' && !input.value && note.items.length > 1) {
          e.preventDefault();
          note.items.splice(i, 1);
          onChange();
          draw(Math.max(0, i - 1));
        } else if (e.key === 'ArrowDown' && i < note.items.length - 1 && input.selectionStart === input.value.length) {
          e.preventDefault();
          box.querySelectorAll('.note-item-text')[i + 1].focus();
        } else if (e.key === 'ArrowUp' && i > 0 && input.selectionStart === 0) {
          e.preventDefault();
          box.querySelectorAll('.note-item-text')[i - 1].focus();
        }
      });
      box.appendChild(row);
    });
    const add = doc.createElement('button');
    add.type = 'button';
    add.className = 'note-add-item';
    add.innerHTML = icon('plus') + '<span>Add an item</span>';
    add.addEventListener('click', function () {
      note.items.push({ text: '', done: false });
      onChange();
      draw(note.items.length - 1);
    });
    box.appendChild(add);
    if (focusIndex !== undefined) {
      const inputs = box.querySelectorAll('.note-item-text');
      const target = inputs[Math.min(focusIndex, inputs.length - 1)];
      if (target) { target.focus(); target.setSelectionRange(target.value.length, target.value.length); }
    }
    syncNoteText(note);
  }
  draw();
  box.focusFirst = function () { draw(0); };
  return box;
}

// Puts a note on a day in the calendar (or takes it off)
function pickNoteDay(note) {
  window.focus();
  openWindow({
    title: note.date ? 'Move to another day' : 'Add to calendar',
    saveLabel: note.date ? 'Save' : 'Add to calendar',
    html: `
      <label class="label" for="note-day">What day?</label>
      <input class="input" id="note-day" type="date">
      <button type="button" class="link-btn delete-btn" id="note-day-off" hidden>${icon('trash')}<span>Take it off the calendar</span></button>
    `,
    fill: function (box) {
      const date = box.querySelector('#note-day');
      date.value = note.date || todayText();
      fancyDate(date);
      if (note.date) {
        const off = box.querySelector('#note-day-off');
        off.hidden = false;
        off.addEventListener('click', function () {
          const was = note.date;
          delete note.date;
          saveNotes();
          box.close();
          box.remove();
          showPage();
          showUndo('Taken off the calendar', function () { note.date = was; saveNotes(); showPage(); });
        });
      }
    },
    onSave: function (box) {
      const day = box.querySelector('#note-day').value;
      if (!day) { box.problem('Pick a day.'); return false; }
      if (!note.text.trim()) note.text = 'Note';
      note.date = day;
      saveNotes();
      showPage();
      showUndo('Added to the calendar on ' + niceDate(day), null);
    },
  });
}

// Opens the calendar on a note's day
function showNoteOnCalendar(note) {
  calendarDay = note.date;
  const d = toDate(note.date);
  calendarMonth = dateText(new Date(d.getFullYear(), d.getMonth(), 1));
  goTo('calendar');
}

// ---------- The notes on My Day, and on the Sticky notes page ----------
// Pastel square notes, like sticky note widgets. Each one can pop off the page into its own window.
function stickyBoard(big) {
  const box = document.createElement('section');
  box.className = 'notes-panel' + (big ? ' big' : '');
  box.innerHTML = `
    <div class="notes-head">
      <h2 class="tips-title">Sticky notes</h2>
      <div class="notes-add-wrap">
        <button class="notes-plus" id="note-plus" title="New note" aria-label="New note">${icon('plus')}</button>
      </div>
    </div>
    <div class="notes-grid"></div>
  `;
  if (big) box.querySelector('.notes-head h2').remove();
  const grid = box.querySelector('.notes-grid');
  if (!notes.length) {
    grid.innerHTML = '<p class="notes-empty">No notes yet. Click <b>+</b> to add one.</p>';
  }
  // Pinned notes come first
  notes.slice().sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0); })
    .forEach(function (note) { grid.appendChild(noteCard(note)); });

  // + makes a new note right away. Write first, then pick its color on the note.
  box.querySelector('#note-plus').addEventListener('click', function () {
    const note = addNote(null);
    showPage();
    focusNoteNow(note);
  });
  return box;
}

// The Sticky notes page: all your notes, bigger
let noteSearch = '';
function showNotesPage(page) {
  page.innerHTML = `
    <header class="page-head with-button"><div><h1>Sticky notes</h1><p></p></div>
      <div class="notes-head-tools">
        <label class="notes-search">${icon('search')}<input class="input" type="search" placeholder="Search notes" aria-label="Search notes"></label>
      </div>
    </header>`;
  page.querySelector('.page-head p').textContent = notes.length
    ? notes.length + (notes.length === 1 ? ' note' : ' notes') + '. Point at a note to pop it out onto your screen.'
    : 'Quick notes and reminders, in any color you like';
  const board = stickyBoard(true);
  page.querySelector('.notes-head-tools').appendChild(board.querySelector('.notes-add-wrap'));
  page.appendChild(board);

  // Search: hides the notes that don't match
  const search = page.querySelector('.notes-search input');
  const none = document.createElement('p');
  none.className = 'notes-empty notes-no-match';
  none.textContent = 'No notes match your search.';
  none.hidden = true;
  board.querySelector('.notes-grid').appendChild(none);
  function filter() {
    noteSearch = search.value;
    const q = noteSearch.trim().toLowerCase();
    let shown = 0;
    board.querySelectorAll('.note').forEach(function (card) {
      const note = notes.find(function (n) { return n.id === card.dataset.note; });
      const match = !q || (note && note.text.toLowerCase().includes(q));
      card.hidden = !match;
      if (match) shown++;
    });
    none.hidden = !q || shown > 0 || !notes.length;
  }
  search.value = noteSearch;
  search.addEventListener('input', filter);
  if (!notes.length) page.querySelector('.notes-search').hidden = true;
  filter();
}

// Puts the cursor in a note on My Day, ready to type
function focusNoteNow(note) {
  const typing = document.querySelector('.note[data-note="' + note.id + '"] textarea, .note[data-note="' + note.id + '"] .note-item-text');
  if (typing) typing.focus();
}

function noteCard(note) {
  const card = document.createElement('div');
  card.className = 'note';
  card.dataset.note = note.id;
  card.style.setProperty('--note', noteColor(note.color));
  card.innerHTML = `
    <textarea class="note-text" aria-label="Sticky note" placeholder="Write here..."></textarea>
    <div class="note-tools">
      <button class="note-tool" data-act="pin">${icon('pin')}</button>
      <button class="note-tool" data-act="pop" title="Pop out onto your screen" aria-label="Pop out onto your screen">${icon('popout')}</button>
      <button class="note-tool" data-act="more" title="Color and delete" aria-label="Color and delete">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>
      </button>
    </div>
    <span class="note-fold" aria-hidden="true"></span>
  `;
  let text = card.querySelector('textarea');
  text.value = note.text;

  // A checklist note shows its list instead of the writing area
  let listTimer = null;
  if (note.list) {
    const editor = noteListEditor(document, note, function (typing) {
      note.changed = new Date().toISOString();
      clearTimeout(listTimer);
      if (typing) listTimer = setTimeout(function () { saveNotes(); }, 250);
      else saveNotes();
    });
    text.replaceWith(editor);
    text = null;
    card.classList.add('is-list');
  }

  // Pin: pinned notes stay first, on My Day too
  const pin = card.querySelector('[data-act="pin"]');
  pin.setAttribute('aria-pressed', note.pinned ? 'true' : 'false');
  pin.title = note.pinned ? 'Unpin' : 'Pin to top';
  pin.setAttribute('aria-label', pin.title);
  if (note.pinned) card.classList.add('pinned');
  pin.addEventListener('click', function () {
    if (text) note.text = text.value;
    note.pinned = !note.pinned;
    saveNotes();
    showPage();
  });

  // Its day on the calendar, if it has one
  if (note.date) {
    const tag = document.createElement('button');
    tag.className = 'note-date';
    tag.title = 'See it on the calendar';
    tag.innerHTML = icon('calendar') + '<span></span>';
    tag.querySelector('span').textContent = niceDate(note.date);
    tag.addEventListener('click', function () { showNoteOnCalendar(note); });
    card.classList.add('has-date');
    card.appendChild(tag);
  }

  // Color dots on the note, shown while you're writing in it
  const swatches = document.createElement('div');
  swatches.className = 'note-swatches';
  function drawSwatches() {
    swatches.innerHTML = '';
    swatches.appendChild(colorPicker(document, note.color, function (c) {
      note.color = c;
      card.style.setProperty('--note', noteColor(c));
      saveNotes();
      drawSwatches();
      const back = text || card.querySelector('.note-item-text');
      if (back) back.focus();
    }));
  }
  drawSwatches();
  card.appendChild(swatches);
  const popped = noteWindows[note.id] && !noteWindows[note.id].closed;
  if (popped) card.classList.add('popped');

  let timer = null;
  if (text) text.addEventListener('input', function () {
    note.text = text.value;
    note.changed = new Date().toISOString();
    clearTimeout(timer);
    timer = setTimeout(function () { saveNotes(); }, 250);
  });
  if (text) text.addEventListener('blur', function (e) {
    clearTimeout(timer);
    if (e.relatedTarget && card.contains(e.relatedTarget)) { note.text = text.value; saveNotes(); return; }
    note.text = text.value;
    if (!note.text.trim() && !(noteWindows[note.id] && !noteWindows[note.id].closed)) {
      // An empty note just goes away
      notes = notes.filter(function (n) { return n !== note; });
      saveList(NOTES_KEY, notes);
      setTimeout(function () { if (!card.contains(document.activeElement)) card.remove(); }, 150);
      return;
    }
    saveNotes();
  });

  const menu = noteMenu(document, note, function (c) {
    note.color = c;
    card.style.setProperty('--note', noteColor(c));
    saveNotes();
  }, function () { deleteNote(note); }, function () {
    if (text) note.text = text.value;
    pickNoteDay(note);
  }, function () {
    if (text) note.text = text.value;
    toggleNoteList(note);
    showPage();
    focusNoteNow(note);
  }, function () {
    if (text) note.text = text.value;
    noteToTodo(note);
  });
  card.appendChild(menu);

  card.querySelector('[data-act="more"]').addEventListener('click', function () { menu.hidden = !menu.hidden; });
  card.querySelector('[data-act="pop"]').addEventListener('click', function () {
    if (text) note.text = text.value;
    saveList(NOTES_KEY, notes);
    popOutNote(note);
  });
  card.addEventListener('focusout', function (e) {
    if (card.contains(e.relatedTarget)) return;
    menu.hidden = true;
    // An empty checklist goes away too
    if (note.list && !note.text.trim() && !(noteWindows[note.id] && !noteWindows[note.id].closed)) {
      setTimeout(function () {
        if (card.contains(document.activeElement) || note.text.trim()) return;
        notes = notes.filter(function (n) { return n !== note; });
        saveList(NOTES_KEY, notes);
        card.remove();
      }, 150);
    }
  });
  return card;
}

// ---------- A note in its own window ----------
function popOutNote(note) {
  const open = noteWindows[note.id];
  if (open && !open.closed) { open.focus(); return; }

  const count = Object.keys(noteWindows).filter(function (id) { return noteWindows[id] && !noteWindows[id].closed; }).length;
  const left = (window.screenX || 0) + 80 + count * 36;
  const top = (window.screenY || 0) + 90 + count * 36;
  let win = null;
  try {
    win = window.open('', 'bizNote_' + note.id, 'popup,width=300,height=300,left=' + left + ',top=' + top);
  } catch (error) { win = null; }
  if (!win) {
    showUndo('Your browser blocked the note window. Allow pop-ups for this site and try again.', null);
    return;
  }
  noteWindows[note.id] = win;
  const doc = win.document;
  doc.title = 'Sticky note';
  doc.head.innerHTML = '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
  const fonts = document.querySelector('link[href*="fonts.googleapis.com/css2"]');
  if (fonts) {
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = fonts.href;
    doc.head.appendChild(link);
  }
  const style = doc.createElement('style');
  style.textContent = noteWindowStyles();
  doc.head.appendChild(style);
  drawNoteWindow(note);

  win.addEventListener('pagehide', function () {
    delete noteWindows[note.id];
    if (!note.text.trim()) {
      notes = notes.filter(function (n) { return n !== note; });
      saveList(NOTES_KEY, notes);
    }
    if (currentSection === 'myday' || currentSection === 'notes') showPage();
  });
  if (currentSection === 'myday' || currentSection === 'notes') showPage();
}

function drawNoteWindow(note) {
  const win = noteWindows[note.id];
  if (!win || win.closed) return;
  const doc = win.document;
  doc.body.className = 'note-window';
  doc.body.style.setProperty('--note', noteColor(note.color));
  doc.body.innerHTML = `
    <div class="note-bar">
      <button class="note-btn" data-act="new" title="New note" aria-label="New note">${icon('plus')}</button>
      <span class="note-bar-space"></span>
      <button class="note-btn" data-act="menu" title="Color and delete" aria-label="Color and delete">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
      </button>
      <button class="note-btn" data-act="close" title="Close" aria-label="Close">${icon('plus')}</button>
    </div>
    <textarea class="note-text" aria-label="Sticky note" placeholder="Write here..."></textarea>
  `;
  let text = doc.querySelector('textarea');
  text.value = note.text;
  text.addEventListener('input', function () {
    note.text = text.value;
    saveNotes(note.id);
    refreshBoardSoon();
  });
  if (note.list) {
    const editor = noteListEditor(doc, note, function () {
      saveNotes(note.id);
      refreshBoardSoon();
    });
    text.replaceWith(editor);
    text = null;
  }

  const menu = noteMenu(doc, note, function (c) {
    note.color = c;
    doc.body.style.setProperty('--note', noteColor(c));
    saveNotes(note.id);
    refreshBoardSoon();
  }, function () { deleteNote(note); }, function () { pickNoteDay(note); }, function () {
    toggleNoteList(note);
    drawNoteWindow(note);
    refreshBoardSoon();
  }, function () { noteToTodo(note); });
  doc.body.appendChild(menu);

  doc.querySelector('[data-act="new"]').addEventListener('click', function () { popOutNote(addNote(note)); refreshBoardSoon(); });
  doc.querySelector('[data-act="menu"]').addEventListener('click', function () { menu.hidden = !menu.hidden; });
  doc.querySelector('[data-act="close"]').addEventListener('click', function () { win.close(); });
  if (text) {
    text.addEventListener('focus', function () { menu.hidden = true; });
    win.setTimeout(function () { text.focus(); text.setSelectionRange(text.value.length, text.value.length); }, 0);
  }
}

// Changes made on My Day show up in the note windows (but not the one being typed in)
function syncNoteWindows(fromId) {
  notes.forEach(function (note) {
    const win = noteWindows[note.id];
    if (!win || win.closed || note.id === fromId) return;
    const text = win.document.querySelector('textarea');
    const list = win.document.querySelector('.note-list');
    // Switched between text and checklist somewhere else: draw the window again
    if ((note.list && text) || (!note.list && list)) { drawNoteWindow(note); return; }
    if (text && text.value !== note.text) text.value = note.text;
    if (list) list.replaceWith(noteListEditor(win.document, note, function () { saveNotes(note.id); refreshBoardSoon(); }));
    win.document.body.style.setProperty('--note', noteColor(note.color));
  });
}

let boardRefresh = null;
function refreshBoardSoon() {
  clearTimeout(boardRefresh);
  boardRefresh = setTimeout(function () {
    if ((currentSection === 'myday' || currentSection === 'notes') && !(document.activeElement && document.activeElement.closest && document.activeElement.closest('.note'))) showPage();
  }, 400);
}

// The note window can't load style.css, so it gets its own styles here
function noteWindowStyles() {
  const ink = '#2b2b2b';
  return `
    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; }
    body.note-window { display: flex; flex-direction: column; background: var(--note); color: ${ink};
      font-family: Figtree, 'Segoe UI', sans-serif; }
    svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .note-bar { display: flex; align-items: center; gap: 2px; height: 32px; padding: 0 4px;
      background: rgba(0, 0, 0, 0.06); opacity: 0.35; transition: opacity 0.15s ease; }
    body:hover .note-bar, .note-bar:focus-within { opacity: 1; }
    .note-bar-space { flex: 1; }
    .note-btn { display: grid; place-items: center; width: 30px; height: 26px; padding: 0; border: none; border-radius: 5px;
      background: transparent; color: ${ink}; cursor: pointer; }
    .note-btn:hover, .note-btn:focus-visible { background: rgba(0, 0, 0, 0.1); outline: none; }
    .note-btn[data-act="menu"] svg { fill: currentColor; stroke: none; }
    .note-btn[data-act="close"] svg { transform: rotate(45deg); }
    .note-text { flex: 1; width: 100%; padding: 10px 16px 16px; border: none; background: transparent; color: ${ink};
      font-family: Nunito, Figtree, 'Segoe UI', sans-serif; font-size: 21px; font-weight: 700; line-height: 1.3;
      resize: none; outline: none; }
    .note-text::placeholder { color: rgba(0, 0, 0, 0.35); }
    .note-menu { position: absolute; top: 34px; right: 6px; z-index: 5; width: 240px; padding: 6px; border-radius: 10px;
      background: #fff; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); }
    .note-menu[hidden] { display: none; }
    .note-menu-title { margin: 4px 6px 6px; color: #777; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
    .note-menu-colors { display: grid; grid-template-columns: repeat(9, 1fr); gap: 4px; padding: 0 4px 8px; border-bottom: 1px solid #eee; }
    .note-dot { position: relative; width: 20px; height: 20px; padding: 0; border: 1px solid rgba(0, 0, 0, 0.15); border-radius: 50%; cursor: pointer; }
    .note-dot[aria-pressed="true"] { box-shadow: 0 0 0 2px #fff, 0 0 0 4px ${ink}; }
    .note-dot.custom { background: conic-gradient(#ffb3b3, #ffe6a3, #c9f0b0, #b3e6ff, #d9c2ff, #ffb3e6, #ffb3b3); overflow: hidden; }
    .note-dot.custom[aria-pressed="true"] { background: var(--picked); }
    .note-dot.custom input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: 0; padding: 0; }
    .note-menu-delete { display: flex; align-items: center; gap: 8px; width: 100%; margin-top: 4px; padding: 8px; border: none;
      border-radius: 6px; background: none; color: ${ink}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; text-align: left; }
    .note-menu-delete:hover { background: #f4f4f4; color: #c62a3f; }
    .note-menu-delete.note-menu-cal { margin-top: 6px; }
    .note-menu-delete.note-menu-cal:hover { color: ${ink}; }
    .note-menu-delete svg { width: 16px; height: 16px; flex: none; }
    .note-list { flex: 1; overflow: auto; padding: 8px 12px 14px; }
    .note-item { display: flex; align-items: center; gap: 8px; padding: 2px 0; }
    .note-check { display: grid; place-items: center; flex: none; width: 22px; height: 22px; padding: 0; border: 2px solid rgba(0, 0, 0, 0.45);
      border-radius: 6px; background: rgba(255, 255, 255, 0.5); color: transparent; cursor: pointer; }
    .note-check svg { width: 14px; height: 14px; stroke-width: 3; }
    .note-item.done .note-check { background: ${ink}; border-color: ${ink}; color: #fff; }
    .note-item-text { flex: 1; min-width: 0; padding: 4px 0; border: none; background: transparent; color: ${ink};
      font-family: Nunito, Figtree, 'Segoe UI', sans-serif; font-size: 18px; font-weight: 700; line-height: 1.3; outline: none;
      resize: none; overflow: hidden; }
    .note-item { align-items: flex-start; }
    .note-check { margin-top: 4px; }
    .note-item.done .note-item-text { text-decoration: line-through; opacity: 0.55; }
    .note-add-item { display: flex; align-items: center; gap: 6px; margin-top: 4px; padding: 4px 0; border: none; background: none;
      color: rgba(0, 0, 0, 0.5); font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
  `;
}

// =========================================
// BACKUP
// Everything the app saves (every business) goes into one .json file.
// Loading that file puts it all back, on this computer or another one.
// =========================================
const LAST_BACKUP_KEY = 'bizStudio.lastBackup';

function lastBackupText() {
  let when = null;
  try { when = localStorage.getItem(LAST_BACKUP_KEY); } catch (error) { /* fine */ }
  if (!when) return 'You haven\'t saved one yet';
  const days = Math.round((toDate(todayText()) - toDate(when.slice(0, 10))) / 86400000);
  return 'Last saved ' + (days <= 0 ? 'today' : days === 1 ? 'yesterday' : days + ' days ago');
}

function saveBackup() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('bizStudio.') && key !== LAST_BACKUP_KEY) data[key] = localStorage.getItem(key);
  }
  const backup = { app: 'Biz Studio', version: 1, saved: new Date().toISOString(), data: data };
  const file = new Blob([JSON.stringify(backup)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = 'biz-studio-backup-' + todayText() + '.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(link.href); }, 2000);
  try { localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString()); } catch (error) { /* fine */ }
  showUndo('Backup saved to your Downloads folder', null);
}

// Picks a backup file, checks it, and asks before replacing everything
function pickBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', function () {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      let backup = null;
      try { backup = JSON.parse(String(reader.result)); } catch (error) { /* not JSON */ }
      if (!backup || backup.app !== 'Biz Studio' || !backup.data) {
        openWindow({
          title: 'That\'s not a backup',
          saveLabel: 'OK',
          html: '<p class="help">Pick a file that starts with <b>biz-studio-backup</b>. It\'s made by Save a backup.</p>',
          onSave: function () {},
        });
        return;
      }
      const names = [];
      try {
        JSON.parse(backup.data[BIZ_LIST_KEY] || '[]').forEach(function (b) { names.push(b.name); });
      } catch (error) { /* fine */ }
      const when = new Date(backup.saved).toLocaleDateString(appLocale(), { month: 'long', day: 'numeric', year: 'numeric' });
      openWindow({
        title: 'Load this backup?',
        saveLabel: 'Yes, load it',
        html: '<p class="help backup-note"></p><p class="backup-warn">What\'s in the app now will be replaced. Save a backup first if you want to keep it.</p>',
        fill: function (box) {
          box.querySelector('.backup-note').textContent = 'From ' + when +
            (names.length ? ', with ' + names.join(', ') + '.' : '.');
        },
        onSave: function () {
          // Clear what's here, then put the backup in
          const old = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('bizStudio.')) old.push(key);
          }
          old.forEach(function (key) { localStorage.removeItem(key); });
          Object.keys(backup.data).forEach(function (key) {
            if (key.startsWith('bizStudio.')) localStorage.setItem(key, backup.data[key]);
          });
          localStorage.setItem(LAST_BACKUP_KEY, backup.saved);
          location.reload();
        },
      });
    };
    reader.readAsText(file);
  });
  input.click();
}

// =========================================
// SWITCHING BUSINESSES
// =========================================
// Fills a list with one row per business, plus "Add another business"
function businessRows(list) {
  businesses.forEach(function (b) {
    const p = profileOf(b.id);
    const row = document.createElement('button');
    row.className = 'settings-row biz-row' + (b.id === currentBiz ? ' current' : '');
    row.innerHTML = '<span class="biz-avatar"></span><span class="row-text"><strong></strong><span class="row-value"></span></span>' +
      '<span class="biz-here"></span>';
    const pic = row.querySelector('.biz-avatar');
    if (p.photo) {
      const img = document.createElement('img');
      img.src = p.photo;
      img.alt = '';
      pic.appendChild(img);
    } else {
      pic.textContent = initialsOf(b.name || '?');
    }
    row.querySelector('strong').textContent = b.name;
    const type = b.type === 'other' ? capitalize(p.otherType || 'Something else') : (findType(b.type) || { label: '' }).label;
    row.querySelector('.row-value').textContent = type;
    if (b.id === currentBiz) row.querySelector('.biz-here').textContent = 'Open now';
    else row.querySelector('.biz-here').innerHTML = '<span class="biz-open">Open</span>';
    row.addEventListener('click', function () {
      if (b.id === currentBiz) return;
      switchBusiness(b.id);
    });
    list.appendChild(row);
  });
  const add = document.createElement('button');
  add.className = 'settings-row biz-add';
  add.innerHTML = '<span class="biz-avatar add">' + icon('plus') + '</span>' +
    '<span class="row-text"><strong>Add another business</strong><span class="row-value">Your other businesses stay saved</span></span>';
  add.addEventListener('click', function () { addBusiness(null); });
  list.appendChild(add);
}

// =========================================
// SETTINGS: see and change the business profile
// =========================================
function showSettings(page) {
  page.querySelector('.empty').remove();
  page.querySelector('.page-head').remove(); // the profile header below takes its place

  const type = findType(profile.businessType);
  const typeName = profile.businessType === 'other' ? capitalize(profile.otherType) : type.label;
  const theme = profile.theme === 'custom' ? { label: 'Custom' } : THEMES.find(function (t) { return t.id === profile.theme; });
  const w = words();

  const box = document.createElement('div');
  box.className = 'settings';
  box.innerHTML = `
    <header class="settings-hero">
      <div class="hero-photo" id="hero-photo">
        <button class="photo-edit" id="hero-photo-btn" title="Change picture" aria-label="Change picture">${icon('camera2')}</button>
      </div>
      <div class="hero-text">
        <div class="logo settings-logo"><span class="logo-word" id="hero-name"></span>
          <svg class="logo-star" viewBox="0 0 24 24"><path d="M12 1l3 7 7 1-5 5 1.5 8L12 18l-6.5 4L7 14 2 9l7-1z"/></svg>
        </div>
        <p class="hero-type"><span class="hero-icon">${icon(type.icon)}</span><span id="hero-type"></span></p>
        <button class="link-btn" id="hero-remove" hidden>Remove picture</button>
      </div>
    </header>

    <h2 class="settings-group">Your businesses</h2>
    <div class="settings-list" id="biz-list"></div>

    <h2 class="settings-group">This business</h2>
    <div class="settings-list">
      <button class="settings-row pink" data-step="1">
        <span class="nav-icon">${icon('tag')}</span>
        <span class="row-text"><strong>Business name</strong><span class="row-value" id="row-name"></span></span>
        <span class="row-arrow">${icon('chevron')}</span>
      </button>
      <button class="settings-row pink" id="row-country-btn">
        <span class="nav-icon">${icon('globe')}</span>
        <span class="row-text"><strong>Country</strong><span class="row-value" id="row-country"></span></span>
        <span class="row-arrow">${icon('chevron')}</span>
      </button>
      <button class="settings-row pink" data-step="0">
        <span class="nav-icon">${icon(type.icon)}</span>
        <span class="row-text"><strong>Business type</strong><span class="row-value" id="row-type"></span></span>
        <span class="row-arrow">${icon('chevron')}</span>
      </button>
    </div>

    <h2 class="settings-group">Look</h2>
    <div class="settings-list">
      <button class="settings-row sky" data-step="2">
        <span class="nav-icon">${icon('palette')}</span>
        <span class="row-text"><strong>Colors and font</strong><span class="row-value" id="row-theme"></span></span>
        <span class="row-swatch"><i style="background: var(--ink)"></i><i style="background: var(--sun)"></i></span>
        <span class="row-arrow">${icon('chevron')}</span>
      </button>
      <div class="settings-row mint lang-row">
        <span class="nav-icon">${icon('globe')}</span>
        <span class="row-text"><strong>Language</strong></span>
        <select id="lang-pick" class="input lang-select" aria-label="Language"></select>
      </div>
      <label class="settings-row butter helper-row">
        <span class="nav-icon pip-mini">${pipDrawing()}</span>
        <span class="row-text"><strong>Pip, your helper</strong><span class="row-value">Pops up with tips about your business</span></span>
        <span class="toggle"><input type="checkbox" id="helper-toggle"><span class="toggle-track"></span></span>
      </label>
    </div>

    <h2 class="settings-group" id="details-group"></h2>
    <div class="settings-list">
      <button class="settings-row peach" data-step="4">
        <span class="nav-icon">${icon('list')}</span>
        <span class="row-text"><strong>Extra details</strong><span class="row-value" id="row-details"></span></span>
        <span class="row-arrow">${icon('chevron')}</span>
      </button>
    </div>

    <h2 class="settings-group">Goals</h2>
    <div class="settings-list">
      <button class="settings-row mint" data-step="3">
        <span class="nav-icon">${icon('star')}</span>
        <span class="row-text"><strong>What you want help with</strong><span class="row-value" id="row-goals"></span></span>
        <span class="row-arrow">${icon('chevron')}</span>
      </button>
    </div>

    <h2 class="settings-group">Backup</h2>
    <div class="settings-list">
      <button class="settings-row mint" id="backup-save">
        <span class="nav-icon">${icon('download')}</span>
        <span class="row-text"><strong>Save a backup</strong><span class="row-value" id="backup-when"></span></span>
        <span class="row-arrow">${icon('chevron')}</span>
      </button>
      <button class="settings-row sky" id="backup-load">
        <span class="nav-icon">${icon('upload')}</span>
        <span class="row-text"><strong>Load a backup</strong><span class="row-value">Bring back everything from a backup file</span></span>
        <span class="row-arrow">${icon('chevron')}</span>
      </button>
    </div>

    <button class="start-over" id="erase-btn"></button>
  `;

  // Text from the owner is added with textContent so it shows exactly as typed
  box.querySelector('#hero-name').textContent = profile.businessName;
  box.querySelector('#hero-type').textContent = typeName;
  box.querySelector('#row-name').textContent = profile.businessName;
  box.querySelector('#row-country').textContent = findCountry(myCountry()).label;
  box.querySelector('#row-type').textContent = typeName;
  box.querySelector('#row-country-btn').addEventListener('click', pickCountry);
  box.querySelector('#row-theme').textContent = profile.changeWithTime
    ? 'Changes with the time of day'
    : theme.label + ' with the ' + findFont(profile.font).label + ' font';

  const goalNames = profile.goals.map(function (id) { return say(findGoal(id).label); });
  if (profile.customGoal) goalNames.push(profile.customGoal);
  box.querySelector('#row-goals').textContent = goalNames.length > 0 ? goalNames.join(', ') : 'None picked yet';

  box.querySelector('#details-group').textContent = w.orders;
  box.querySelector('#row-details').textContent = profile.details.length
    ? profile.details.map(function (d) { return d.name; }).join(', ')
    : 'None yet. Add things like ' + (DETAIL_IDEAS[profile.businessType] || DETAIL_IDEAS.other)[0].name.toLowerCase() + '.';
  if (!usesOrders()) {
    const group = box.querySelector('#details-group');
    group.nextElementSibling.remove();
    group.remove();
  }

  // The big picture: click the camera to change it
  box.querySelector('#hero-photo').prepend(avatar('lg'));
  box.querySelector('#hero-photo-btn').addEventListener('click', function () {
    pickPhoto(function (photo) {
      profile.photo = photo;
      saveProfile();
      openApp(); // redraw everything with the new picture
    });
  });
  const removeHero = box.querySelector('#hero-remove');
  removeHero.hidden = !profile.photo;
  removeHero.addEventListener('click', function () {
    profile.photo = '';
    saveProfile();
    openApp();
  });

  // Clicking a row opens that setup page
  const langPick = box.querySelector('#lang-pick');
  LANGUAGES.forEach(function (l) {
    const o = document.createElement('option');
    o.value = l.id;
    o.textContent = l.label;
    langPick.appendChild(o);
  });
  langPick.value = appLanguage;
  langPick.addEventListener('change', function () { setLanguage(langPick.value); });

  box.querySelectorAll('[data-step]').forEach(function (row) {
    row.addEventListener('click', function () {
      editProfile(Number(row.dataset.step));
    });
  });

  // Erasing asks twice, so nobody erases by accident
  // Backup: save everything to a file, or load it back
  box.querySelector('#backup-when').textContent = lastBackupText();
  if (IN_FRAME) box.querySelector('#backup-save').hidden = true;
  box.querySelector('#backup-save').addEventListener('click', function () {
    saveBackup();
    box.querySelector('#backup-when').textContent = lastBackupText();
  });
  box.querySelector('#backup-load').addEventListener('click', pickBackup);

  const helperToggle = box.querySelector('#helper-toggle');
  helperToggle.checked = !profile.helperOff;
  helperToggle.addEventListener('change', function () {
    profile.helperOff = !helperToggle.checked;
    saveProfile();
    updateHelper();
  });

  const erase = box.querySelector('#erase-btn');
  erase.addEventListener('click', function () {
    if (erase.dataset.sure !== 'yes') {
      erase.dataset.sure = 'yes';
      erase.classList.add('sure');
      erase.textContent = 'This deletes everything in ' + profile.businessName + '. Click again to delete it';
      return;
    }
    eraseProfile();
    location.reload();
  });
  erase.textContent = 'Delete ' + profile.businessName;

  // Every business, with a way to switch and to add another
  const bizList = box.querySelector('#biz-list');
  businessRows(bizList);

  if (showSavedMessage) {
    const note = document.createElement('p');
    note.className = 'saved-note';
    note.setAttribute('role', 'status');
    note.innerHTML = icon('check') + '<span>Changes saved</span>';
    box.prepend(note);
    showSavedMessage = false;
  }

  page.appendChild(box);
}

// "dog grooming" -> "Dog grooming"
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// On My Day: a colorful tip card for each goal, with a button to that section
function showGoalTips(page) {
  if (profile.goals.length === 0 && profile.customGoal === '') return;

  const box = document.createElement('section');
  box.innerHTML = '<h2 class="tips-title">Your focus</h2><div class="tip-grid"></div>';
  const grid = box.querySelector('.tip-grid');

  profile.goals.forEach(function (goalId) {
    const goal = findGoal(goalId);
    const hidden = hiddenSections();
    const target = findSection(goal.focus.find(function (id) { return !hidden.includes(id); }) || 'myday');
    const card = document.createElement('div');
    card.className = 'tip-card ' + goal.color;
    card.innerHTML =
      '<span class="goal-icon">' + icon(goal.icon) + '</span>' +
      '<h3></h3><p></p><button class="tip-link"></button>';
    card.querySelector('h3').textContent = say(goal.label);
    card.querySelector('p').textContent = say(goal.tip);
    const link = card.querySelector('.tip-link');
    link.textContent = 'Open ' + say(target.label).toLowerCase();
    link.addEventListener('click', function () {
      currentSection = target.id;
      showMenu();
      showPage();
    });
    grid.appendChild(card);
  });

  if (profile.customGoal !== '') {
    const card = document.createElement('div');
    card.className = 'tip-card butter';
    card.innerHTML = '<span class="goal-icon">' + icon('star') + '</span><h3>Your goal</h3><p></p>';
    card.querySelector('p').textContent = profile.customGoal;
    grid.appendChild(card);
  }

  page.appendChild(box);
}

// =========================================
// START THE APP
// If a profile was saved before, go straight to the app.
// Otherwise, start Profile Setup.
// =========================================
// ---------- Start the app ----------
let newBusiness = null;
try {
  newBusiness = JSON.parse(sessionStorage.getItem(NEW_BUSINESS_KEY));
  sessionStorage.removeItem(NEW_BUSINESS_KEY);
} catch (error) { /* fine */ }

if (newBusiness) {
  // They just started a new business: skip to the name step, type already picked
  Object.assign(profile, newBusiness);
  wordsEditedByOwner = true;
  setupStep = 1;
  showSetup();
} else if (loadProfile()) {
  openApp();
} else {
  showSetup();
}

// Spanish. Keys are the English text, with {n} numbers, {m} money, {d} dates, {t} times,
// {B} the business name, and {P} {O} {C} {S} the business's own words ({oa} = one, lowercase).
var LANG_ES = {
  // Days of the week (calendar headers)
  'Sun': 'Dom', 'Mon': 'Lun', 'Tue': 'Mar', 'Wed': 'Mié', 'Thu': 'Jue', 'Fri': 'Vie', 'Sat': 'Sáb',

  // Menu
  'My Day': 'Mi día', 'Picked for you': 'Elegido para ti', 'Calendar': 'Calendario', 'To-do list': 'Pendientes',
  'Pricing and profit': 'Precios y ganancias', 'Bookkeeping': 'Contabilidad', 'Work': 'Trabajo', 'Sticky notes': 'Notas adhesivas',
  'Business': 'Negocio', '{S} and shopping': '{S} y compras', 'Grow': 'Crecer', 'Finder': 'Buscador',
  'Receipts and menus': 'Recibos y menús', 'Settings': 'Ajustes', 'Money': 'Dinero', 'Menu': 'Menú', 'Menus': 'Menús',

  // My Day
  'Good morning': 'Buenos días', 'Good afternoon': 'Buenas tardes', 'Good evening': 'Buenas noches', 'Good morning!': '¡Buenos días!',
  '{o} due today': '{o} para hoy', '{oa} due today': '{oa} para hoy', 'tasks for today': 'pendientes para hoy', 'task for today': 'pendiente para hoy',
  'paid to you this month': 'te pagaron este mes', 'things to buy': 'cosas por comprar', 'thing to buy': 'cosa por comprar',
  '{n} {oa} is late. Tap to see.': '{n} {oa} va tarde. Toca para ver.', '{n} {o} are late. Tap to see.': '{n} {o} van tarde. Toca para ver.',
  'To do today': 'Para hacer hoy', 'See all': 'Ver todo', 'Coming up this week': 'Esta semana', 'events today': 'eventos hoy', 'event today': 'evento hoy',
  'Nothing for today. {n} coming up.': 'Nada para hoy. {n} más adelante.',
  'Your focus': 'Tu enfoque', 'Close': 'Cerrar', 'Show me': 'Muéstrame', 'Next tip': 'Siguiente consejo', 'Tips from Pip': 'Consejos de Pip', 'Pip': 'Pip',

  // Dates and due
  'Today': 'Hoy', 'Tomorrow': 'Mañana', 'Yesterday': 'Ayer', 'Late': 'Tarde', 'No date': 'Sin fecha', 'Someday': 'Algún día',
  'Late, was {d}': 'Tarde, era el {d}', '{Oa} due {d}': '{Oa} para el {d}', '{Oa} due {d} at {t}': '{Oa} para el {d} a las {t}',
  '{n} days late': '{n} días tarde', '{n} day late': '{n} día tarde', 'Due today': 'Para hoy', 'Due tomorrow': 'Para mañana',
  'Due tomorrow at {t}': 'Para mañana a las {t}', 'Due today at {t}': 'Para hoy a las {t}', 'Due in {n} days': 'En {n} días',
  'Due in {n} days at {t}': 'En {n} días a las {t}', 'Due {d}': 'Para el {d}', 'Due {d} at {t}': 'Para el {d} a las {t}',
  'Was due {d}': 'Era para el {d}', 'Was due {d} at {t}': 'Era para el {d} a las {t}', '{d} at {t}': '{d} a las {t}',

  // Tasks
  'Flag as important': 'Marcar como importante', 'Unflag': 'Quitar marca', 'Delete': 'Borrar', 'Done': 'Hecho', 'Not done': 'No hecho',
  'Add a task': 'Agregar un pendiente', 'New task': 'Nuevo pendiente', 'What do you need to do?': '¿Qué necesitas hacer?',
  'Buy more flour': 'Comprar más harina', 'Important': 'Importante', 'Flag it so it stays at the top': 'Márcalo para que se quede arriba',
  'Add task': 'Agregar pendiente', 'Type what you need to do.': 'Escribe lo que necesitas hacer.', 'Clear done ({n})': 'Borrar hechos ({n})',
  '{n} things to do today': '{n} cosas para hacer hoy', '{n} thing to do today': '{n} cosa para hacer hoy', 'Cleared {n} tasks': 'Se borraron {n} pendientes',
  'Cleared {n} task': 'Se borró {n} pendiente', 'Nothing here right now.': 'Nada por aquí ahora.', 'Undo': 'Deshacer',
  'No tasks': 'No hay pendientes', 'Nothing to do today': 'Nada que hacer hoy', 'All done!': '¡Todo listo!',

  // Sticky notes
  'New note': 'Nueva nota', 'Write here...': 'Escribe aquí...', 'Sticky note': 'Nota adhesiva', 'Pop out onto your screen': 'Sacar a tu pantalla',
  'Color and delete': 'Color y borrar', 'See it on the calendar': 'Verla en el calendario', 'Yellow': 'Amarillo', 'Peach': 'Durazno',
  'Pink': 'Rosa', 'Lavender': 'Lavanda', 'Blue': 'Azul', 'Mint': 'Menta', 'Lime': 'Lima', 'Sand': 'Arena', 'Pick any color': 'Elige cualquier color',
  'Color': 'Color', 'On calendar: {d}': 'En el calendario: {d}', 'Delete note': 'Borrar nota', 'Add to calendar': 'Agregar al calendario',
  'Open in Sticky notes': 'Abrir en Notas adhesivas', 'Move to another day': 'Pasar a otro día', 'What day?': '¿Qué día?',
  'Take it off the calendar': 'Quitarla del calendario', 'Save': 'Guardar', 'Added to the calendar on {d}': 'Agregada al calendario el {d}',
  'Taken off the calendar': 'Quitada del calendario', 'Note deleted': 'Nota borrada', 'Pick a day.': 'Elige un día.',
  '{n} note. Point at a note to pop it out onto your screen.': '{n} nota. Pasa el mouse sobre una nota para sacarla a tu pantalla.',
  '{n} notes. Point at a note to pop it out onto your screen.': '{n} notas. Pasa el mouse sobre una nota para sacarla a tu pantalla.',
  'Quick notes and reminders, in any color you like': 'Notas y recordatorios rápidos, del color que quieras',
  'No notes yet. Click + to add one.': 'Aún no hay notas. Haz clic en + para agregar una.',
  'Your browser blocked the note window. Allow pop-ups for this site and try again.': 'Tu navegador bloqueó la ventana de la nota. Permite las ventanas emergentes para este sitio e inténtalo de nuevo.',

  // Calendar
  'Calendar view': 'Vista del calendario', 'Day': 'Día', 'Week': 'Semana', 'Month': 'Mes', 'Year': 'Año',
  'Last month': 'Mes anterior', 'Next month': 'Mes siguiente', 'Day before': 'Día anterior', 'Next day': 'Día siguiente',
  'Last week': 'Semana anterior', 'Next week': 'Semana siguiente', 'Last year': 'Año anterior', 'Next year': 'Año siguiente',
  'Add': 'Agregar', 'See this day': 'Ver este día', 'Add to this day': 'Agregar a este día', 'Add to {d}': 'Agregar al {d}', 'See this month': 'Ver este mes',
  '{n} things planned this week': '{n} cosas planeadas esta semana', '{n} thing planned this week': '{n} cosa planeada esta semana',
  'Nothing planned this week yet': 'Nada planeado esta semana todavía', '{n} things planned': '{n} cosas planeadas', '{n} thing planned': '{n} cosa planeada',
  'Nothing planned yet': 'Nada planeado todavía', 'Dots show planned days. Holidays are in yellow.': 'Los puntos marcan días con planes. Los días festivos están en amarillo.',
  'Nothing due in {d} yet': 'Nada para {d} todavía', 'Nothing planned in {d} yet': 'Nada planeado en {d} todavía',
  'Nothing planned. A free day!': 'Nada planeado. ¡Un día libre!', '{n} {o} due in {d}': '{n} {o} para {d}', '{n} {oa} due in {d}': '{n} {oa} para {d}',
  '{n} event in {d}': '{n} evento en {d}', '{n} events in {d}': '{n} eventos en {d}', 'Event': 'Evento', 'To-do': 'Pendiente',
  'Edit event': 'Editar evento', 'New event': 'Nuevo evento', "What's happening?": '¿Qué va a pasar?', 'What time?': '¿A qué hora?',
  '(you can skip this)': '(puedes dejarlo en blanco)', 'What time? (you can skip this)': '¿A qué hora? (puedes dejarlo en blanco)',
  'Where?': '¿Dónde?', 'Main Street park': 'Parque de la calle principal', 'Delete this event': 'Borrar este evento', 'Add event': 'Agregar evento',
  'Event deleted': 'Evento borrado', "Type what's happening.": 'Escribe qué va a pasar.', 'All day': 'Todo el día', 'Any time': 'A cualquier hora',
  'Farmers market': 'Mercado local', 'What to add': 'Qué agregar', 'Day': 'Día', 'Time': 'Hora', 'Where': 'Dónde', 'Title': 'Título',
  '(optional)': '(opcional)', 'Checked off': 'Marcado como hecho',

  // Holidays
  "New Year's Day": 'Año Nuevo', 'Martin Luther King Jr. Day': 'Día de Martin Luther King Jr.', "Valentine's Day": 'Día de San Valentín',
  "Presidents' Day": 'Día de los Presidentes', "St. Patrick's Day": 'Día de San Patricio', 'Easter': 'Pascua', 'Easter Sunday': 'Domingo de Pascua',
  'Easter Monday': 'Lunes de Pascua', 'Good Friday': 'Viernes Santo', 'Holy Thursday': 'Jueves Santo', "Mother's Day": 'Día de las Madres',
  'Memorial Day': 'Día de los Caídos', "Father's Day": 'Día del Padre', 'Juneteenth': 'Juneteenth', 'Independence Day': 'Día de la Independencia',
  'Labor Day': 'Día del Trabajo', "Indigenous Peoples' Day": 'Día de los Pueblos Indígenas', 'Halloween': 'Halloween', 'Veterans Day': 'Día de los Veteranos',
  'Thanksgiving': 'Día de Acción de Gracias', 'Black Friday': 'Black Friday', 'Small Business Saturday': 'Sábado de los Pequeños Negocios',
  'Christmas Eve': 'Nochebuena', 'Christmas': 'Navidad', 'Christmas Day': 'Navidad', "New Year's Eve": 'Nochevieja', 'Boxing Day': 'Boxing Day',
  'Family Day': 'Día de la Familia', 'Victoria Day': 'Día de Victoria', 'Canada Day': 'Día de Canadá', 'Civic Holiday': 'Día cívico',
  'Labour Day': 'Día del Trabajo', 'Truth and Reconciliation Day': 'Día de la Verdad y la Reconciliación', 'Remembrance Day': 'Día del Recuerdo',
  'Three Kings Day': 'Día de Reyes', 'Constitution Day': 'Día de la Constitución', "Benito Juárez's Birthday": 'Natalicio de Benito Juárez',
  "Children's Day": 'Día del Niño', 'Cinco de Mayo': 'Cinco de Mayo', 'Day of the Dead': 'Día de Muertos', 'Revolution Day': 'Día de la Revolución',
  'Day of the Virgin of Guadalupe': 'Día de la Virgen de Guadalupe', 'Australia Day': 'Día de Australia', 'Anzac Day': 'Día de Anzac',
  "King's Birthday": 'Cumpleaños del Rey', 'Waitangi Day': 'Día de Waitangi', "Day after New Year's": 'Día después de Año Nuevo',
  'Bonfire Night': 'Noche de las Hogueras', 'Remembrance Sunday': 'Domingo del Recuerdo', "St. Stephen's Day": 'Día de San Esteban',
  'Early May bank holiday': 'Feriado de principios de mayo', 'Spring bank holiday': 'Feriado de primavera', 'Summer bank holiday': 'Feriado de verano',
  "St. Brigid's Day bank holiday": 'Feriado de Santa Brígida', 'May bank holiday': 'Feriado de mayo', 'June bank holiday': 'Feriado de junio',
  'August bank holiday': 'Feriado de agosto', 'October bank holiday': 'Feriado de octubre',

  // Bookkeeping
  'Paid {o} count as money in on their due date': 'Los {o} pagados cuentan como dinero recibido en su fecha',
  'Money in and money out, month by month': 'Dinero que entra y que sale, mes por mes', 'Money in': 'Dinero que entra', 'Money out': 'Dinero que sale',
  'You kept': 'Te quedaste con', 'Waiting to be paid': 'Por cobrar', 'Last {n} months': 'Últimos {n} meses', 'In: {m}': 'Entró: {m}', 'Out: {m}': 'Salió: {m}',
  'This month': 'Este mes', 'Nothing this month yet.': 'Nada este mes todavía.', 'What you bought or paid': 'Lo que compraste o pagaste',
  'Cake boxes, booth fee': 'Cajas para pastel, renta del puesto', 'How much': 'Cuánto', 'What day': 'Qué día', 'Delete this': 'Borrar esto',
  'Add it': 'Agregarlo', 'Type how much it was.': 'Escribe cuánto fue.', 'What it was for': 'Para qué fue', 'Bake sale, tips': 'Venta de pasteles, propinas',
  'Tip': 'Propina', 'No money tracked yet': 'Aún no hay dinero registrado',

  // Shopping and supplies
  '{n} things to buy': '{n} cosas por comprar', '{n} thing to buy': '{n} cosa por comprar', 'Add from a picture': 'Agregar desde una foto',
  'New {sa}': 'Agregar {sa}', 'Shopping list': 'Lista de compras', 'For your {o} in the next {n} weeks, about {m}': 'Para tus {o} de las próximas {n} semanas, unos {m}',
  'For your {o} in the next {n} weeks': 'Para tus {o} de las próximas {n} semanas',
  'Things for your {o} show up here on their own': 'Lo que necesitas para tus {o} aparece aquí solo', 'Things you need to buy': 'Cosas que necesitas comprar',
  'Add something to buy': 'Agrega algo por comprar', 'What you have': 'Lo que tienes', 'Less': 'Menos', 'More': 'Más',
  'You have what you need': 'Tienes lo que necesitas', 'Nothing to buy right now.': 'Nada por comprar ahora.', 'No price yet': 'Sin precio todavía',
  'You measure it in': 'Lo mides en', 'When you buy it': 'Cuando lo compras', 'You get': 'Te dan', 'How much you get': 'Cuánto te dan',
  'units': 'unidades', 'for': 'por', 'How much you have now': 'Cuánto tienes ahora', 'Add {sa}': 'Agregar {sa}', 'Type its name.': 'Escribe su nombre.',
  'cups': 'tazas', 'each': 'pieza', 'sticks': 'barras', 'dozen': 'docena', 'Name': 'Nombre', 'Amount': 'Cantidad', 'Unit': 'Unidad', 'Price': 'Precio',
  'Edit {sa}': 'Editar {sa}', 'Flour': 'Harina', 'Sugar': 'Azúcar',

  // Picture import
  'Take a screenshot of a receipt, an online {oa} or a list of what you need. The app reads it and fills in the names, amounts and prices for you.':
    'Toma una captura de pantalla de un recibo, una compra en línea o una lista de lo que necesitas. La app la lee y llena los nombres, cantidades y precios por ti.',
  'Take a screenshot of a receipt, an online order or a list of what you need. The app reads it and fills in the names, amounts and prices for you.':
    'Toma una captura de pantalla de un recibo, una compra en línea o una lista de lo que necesitas. La app la lee y llena los nombres, cantidades y precios por ti.',
  'Paste a screenshot here': 'Pega una captura de pantalla aquí', 'Press': 'Presiona', ', drop a picture, or click to choose one': ', suelta una imagen o haz clic para elegir una',
  'Tip:': 'Consejo:', 'takes a screenshot': 'toma una captura de pantalla', 'Or type or paste the list as words': 'O escribe o pega la lista como texto',
  'Read this list': 'Leer esta lista', 'Reading your picture...': 'Leyendo tu imagen...',
  'This can take a few seconds. The first time, it also loads the reader from the internet.': 'Puede tardar unos segundos. La primera vez también carga el lector desde internet.',
  'Add a line': 'Agregar una línea', 'Try a different picture': 'Probar otra imagen', 'Add to {S}': 'Agregar a {S}',
  'Check at least one thing to add.': 'Marca al menos una cosa para agregar.', 'Updates the price': 'Actualiza el precio', 'Your picture': 'Tu imagen',
  "We couldn't read the picture. Reading pictures needs the internet the first time. You can type or paste the list below instead.":
    'No pudimos leer la imagen. Leer imágenes necesita internet la primera vez. Puedes escribir o pegar la lista abajo.',
  "We couldn't find any items with prices in that picture. Try a clearer screenshot, or fix the words below and click Read this list.":
    'No encontramos artículos con precio en esa imagen. Prueba con una captura más clara, o corrige el texto abajo y haz clic en Leer esta lista.',

  // Pricing
  'What each {pa} really costs you, and what to charge': 'Lo que de verdad te cuesta cada {pa} y cuánto cobrar',
  'Pay yourself': 'Págate', 'an hour': 'la hora', 'Profit on top': 'Ganancia extra', 'Your time': 'Tu tiempo', 'True cost': 'Costo real',
  'You charge': 'Cobras', 'Suggested': 'Sugerido', 'Charge {m} instead': 'Cobra {m} mejor', 'No price set yet': 'Sin precio todavía', 'Not set': 'Sin definir',
  'You make {m}, a little under your goal': 'Ganas {m}, un poco menos de tu meta', 'You make {m} each time': 'Ganas {m} cada vez',
  'You lose {m} each time': 'Pierdes {m} cada vez', 'Use the suggested price': 'Usar el precio sugerido',
  'True cost is your {s} plus your time. The suggested price adds the profit you picked on top, rounded up to the next dollar.':
    'El costo real son tus {s} más tu tiempo. El precio sugerido le suma la ganancia que elegiste, redondeado al siguiente dólar.',
  'Add your {p} first': 'Primero agrega tus {p}', 'Once you add what goes into each one, this page works out your costs and a fair price.':
    'Cuando agregues lo que lleva cada uno, esta página calcula tus costos y un precio justo.', 'Go to {P}': 'Ir a {P}',

  // Orders
  '{n} open, {n} finished': '{n} abiertos, {n} terminados', 'From Google Form': 'Desde Google Forms', 'New {oa}': 'Agregar {oa}', '+ New {oa}': '+ Agregar {oa}',
  'Open': 'Abiertos', 'All': 'Todos', 'New': 'Nuevo', 'In progress': 'En proceso', 'Paid': 'Pagado', 'Edit': 'Editar', 'Status': 'Estado',
  'Clear finished {o} ({n})': 'Borrar {o} terminados ({n})', 'Back to My Day': 'Volver a Mi día', 'Edit {oa}': 'Editar {oa}',
  '{Ca} name': 'Nombre del {ca}', 'Phone or email (optional)': 'Teléfono o correo (opcional)', '{n}-{n}-{n} or an email': '{n}-{n}-{n} o un correo',
  'What they want': 'Lo que quieren', 'Due date': 'Fecha de entrega', 'Time (optional)': 'Hora (opcional)', 'No time': 'Sin hora', 'Extra details': 'Detalles extra',
  'Cake flavor': 'Sabor del pastel', 'Want to ask something else on every {oa}?': '¿Quieres preguntar algo más en cada {oa}?',
  'Message on the cake': 'Mensaje en el pastel', 'Allergies': 'Alergias', 'Pickup or delivery': 'Recoger o entregar', 'Something else': 'Otra cosa',
  'Notes (optional)': 'Notas (opcional)', 'Anything else to remember': 'Algo más que recordar', 'Save changes': 'Guardar cambios', 'Cancel': 'Cancelar',
  'Delete this {oa}': 'Borrar este {oa}', 'Back to {O}': 'Volver a {O}', 'Add {oa}': 'Agregar {oa}', '{n} {o} deleted': 'Se borraron {n} {o}',
  'Bring in {o} from your Google Form': 'Trae los {o} de tu Google Form',
  "Everyone who filled out your form shows up here as a new {oa}. You can do this again any time. Ones you already brought in won't be added twice.":
    'Cada persona que llenó tu formulario aparece aquí como un {oa} nuevo. Puedes hacerlo cuando quieras. Los que ya trajiste no se agregan dos veces.',
  'Download your answers': 'Descarga tus respuestas', 'Open your Google Form and click': 'Abre tu Google Form y haz clic en', 'Responses': 'Respuestas',
  'Click': 'Haz clic en', 'View in Sheets': 'Ver en Hojas de cálculo', '(or': '(o', 'Link to Sheets': 'Vincular con Hojas de cálculo', 'the first time).': 'la primera vez).',
  'In the sheet, click': 'En la hoja, haz clic en', 'File': 'Archivo', ', then': ', luego', 'Download': 'Descargar', 'Pick that file': 'Elige ese archivo',
  'Choose your file': 'Elige tu archivo', 'or drag it here': 'o arrástralo aquí', 'Tell the app where each answer goes': 'Dile a la app dónde va cada respuesta',
  'We made a guess for each question. Change any that look wrong.': 'Adivinamos cada pregunta. Cambia las que se vean mal.',
  "Pick which question has the {ca}'s name.": 'Elige qué pregunta tiene el nombre del {ca}.', 'Nothing due today': 'Nada para hoy',

  // Customers
  '{n} person': '{n} persona', '{n} people': '{n} personas', 'Add a {ca}': 'Agregar un {ca}', 'Find someone': 'Buscar a alguien', 'Most recent': 'Más recientes',
  'Most {o}': 'Más {o}', 'Spent the most': 'Gastaron más', 'A to Z': 'A a Z', 'No phone or email yet': 'Sin teléfono ni correo todavía', 'total': 'total',
  'Add {ca}': 'Agregar {ca}', 'Never mind': 'Mejor no', 'Back to {C}': 'Volver a {C}', 'first {oa}': 'primer {oa}', 'Their {o}': 'Sus {o}',
  'Everyone who orders from you, in one place': 'Todos los que te compran, en un solo lugar', 'No {c} yet': 'Aún no hay {c}',
  "Add the people you work for, with their phone or email, so they're all in one place.": 'Agrega a las personas para las que trabajas, con su teléfono o correo, para tenerlas en un solo lugar.',
  'Keep everyone you work for in one place.': 'Ten a todas las personas para las que trabajas en un solo lugar.',

  // Products
  '{n} {p}': '{n} {p}', 'New {pa}': 'Agregar {pa}', 'Makes {n}': 'Rinde {n}', '{n} {s}': '{n} {s}', 'Costs {m}': 'Cuesta {m}', 'No price': 'Sin precio',
  'Back to {P}': 'Volver a {P}', 'What you charge': 'Lo que cobras', 'How much it makes': 'Cuánto rinde', '{n} cake, {n} cupcakes': '{n} pastel, {n} cupcakes',
  'Hours it takes you': 'Horas que te toma', 'What goes in it': 'Lo que lleva', 'Nothing added yet. Pick from your {s} below, or add a new one.':
    'Nada agregado todavía. Elige de tus {s} abajo, o agrega uno nuevo.', '+ New {sa}': '+ Agregar {sa}', 'Steps': 'Pasos', '(one per line)': '(uno por línea)',
  'Add {pa}': 'Agregar {pa}', 'Give it a name to save it.': 'Ponle un nombre para guardarlo.', 'Ingredients for one batch cost': 'Los ingredientes de una tanda cuestan',

  // Finder and printables
  'Search everything in your app, or find places near you': 'Busca todo en tu app, o encuentra lugares cerca de ti',
  'Search {o}, {c}, {p}, tasks': 'Busca {o}, {c}, {p}, pendientes', 'Search {c}, {p}, tasks': 'Busca {c}, {p}, pendientes', 'Search': 'Buscar',
  'Find near you': 'Encuentra cerca de ti', 'Farmers markets': 'Mercados locales', 'Opens Google Maps': 'Abre Google Maps', 'Craft fairs': 'Ferias de artesanías',
  '{S} stores': 'Tiendas de {s}', 'Places to sell': 'Lugares para vender', 'Make one, then print it or save it as a PDF': 'Haz uno y luego imprímelo o guárdalo como PDF',
  'Receipt': 'Recibo', 'Which {oa}': 'Cuál {oa}', 'Print': 'Imprimir', 'For': 'Para', 'Date': 'Fecha', 'Item': 'Artículo', 'Total': 'Total',
  'Not paid yet': 'Sin pagar todavía', 'Thank you for your {oa}!': '¡Gracias por tu {oa}!', 'A note at the bottom': 'Una nota al final',
  '{Oa} {n} days ahead. Text {n}-{n}-{n}': 'Haz tu {oa} con {n} días de anticipación. Escribe al {n}-{n}-{n}',
  'Order {n} days ahead. Text {n}-{n}-{n}': 'Pide con {n} días de anticipación. Escribe al {n}-{n}-{n}', 'No results': 'Sin resultados',

  // Settings
  'Change picture': 'Cambiar imagen', 'Remove picture': 'Quitar imagen', 'Your businesses': 'Tus negocios', 'Open now': 'Abierto ahora',
  'Add another business': 'Agregar otro negocio', 'Your other businesses stay saved': 'Tus otros negocios se quedan guardados', 'This business': 'Este negocio',
  'Business name and country': 'Nombre del negocio y país', '{B} · United States': '{B} · Estados Unidos', '{B} · Canada': '{B} · Canadá', '{B} · Mexico': '{B} · México',
  '{B} · United Kingdom': '{B} · Reino Unido', '{B} · Ireland': '{B} · Irlanda', '{B} · Australia': '{B} · Australia', '{B} · New Zealand': '{B} · Nueva Zelanda',
  '{B} · No holidays': '{B} · Sin días festivos', 'Business type and words': 'Tipo de negocio y palabras', 'Look': 'Apariencia', 'Colors and font': 'Colores y letra',
  'Changes with the time of day': 'Cambia según la hora del día', 'Language': 'Idioma', 'English, Español, Français, 中文, Tiếng Việt, 한국어, Tagalog, Русский, 日本語, Português, Deutsch': 'English, Español, Français, 中文, Tiếng Việt, 한국어, Tagalog, Русский, 日本語, Português, Deutsch',
  'Pip, your helper': 'Pip, tu ayudante', 'Pops up with tips about your business': 'Aparece con consejos sobre tu negocio', 'Goals': 'Metas',
  'What you want help with': 'Con qué quieres ayuda', 'None picked yet': 'Ninguna elegida todavía', 'Backup': 'Copia de seguridad', 'Save a backup': 'Guardar una copia',
  "You haven't saved one yet": 'Aún no has guardado una', 'Load a backup': 'Cargar una copia', 'Bring back everything from a backup file': 'Recupera todo desde un archivo de copia',
  'Last saved today': 'Guardada hoy', 'Last saved yesterday': 'Guardada ayer', 'Last saved {n} days ago': 'Guardada hace {n} días',
  'Delete {B}': 'Borrar {B}', 'Back to Settings': 'Volver a Ajustes', 'Extra details': 'Detalles extra',
  'This deletes everything in {B}. Click again to delete it': 'Esto borra todo en {B}. Haz clic otra vez para borrarlo',

  // Setup
  'Business type': 'Tipo de negocio', 'Your business': 'Tu negocio', 'Colors': 'Colores', 'What kind of business is it?': '¿Qué tipo de negocio es?',
  'Biz Studio uses the right words for your business, like {P} for a bakery or Appointments for a salon.': 'Biz Studio usa las palabras correctas para tu negocio, como {P} para una pastelería o Citas para un salón.',
  'Home bakery': 'Pastelería en casa', 'Meals and catering': 'Comidas y banquetes', 'Candles and crafts': 'Velas y manualidades', 'Art and commissions': 'Arte y encargos',
  'Sewing and clothing': 'Costura y ropa', 'Nails': 'Uñas', 'Hair': 'Cabello', 'Lashes and makeup': 'Pestañas y maquillaje', 'Tutoring': 'Clases particulares',
  'Music and dance lessons': 'Clases de música y baile', 'Fitness coaching': 'Entrenamiento físico', 'Photography': 'Fotografía', 'Pet care': 'Cuidado de mascotas',
  'Cleaning': 'Limpieza', 'Yard and garden': 'Jardinería', 'Parties and events': 'Fiestas y eventos', 'What kind of business?': '¿Qué tipo de negocio?',
  'Bike repair, dog grooming, lemonade stand...': 'Reparar bicis, bañar perros, puesto de limonada...', 'Tell us what you do, and we will fill in words that fit.':
    'Cuéntanos qué haces y llenaremos las palabras que encajen.', 'What you sell or offer': 'Lo que vendes u ofreces', 'What people book or {oa}': 'Lo que la gente reserva o pide',
  'The people you work with': 'Las personas con quienes trabajas', 'What you use to do the work': 'Lo que usas para hacer el trabajo', 'Continue': 'Continuar',
  "What's your business called?": '¿Cómo se llama tu negocio?', 'This name goes on your receipts, your menus and the top of your app. You can change it later.':
    'Este nombre va en tus recibos, tus menús y arriba en tu app. Puedes cambiarlo después.', 'Business name': 'Nombre del negocio', 'Where are you based?': '¿Dónde estás?',
  'United States': 'Estados Unidos', 'Canada': 'Canadá', 'Mexico': 'México', 'United Kingdom': 'Reino Unido', 'Ireland': 'Irlanda', 'Australia': 'Australia',
  'New Zealand': 'Nueva Zelanda', 'Somewhere else (no holidays)': 'Otro lugar (sin días festivos)', "We'll put your country's holidays on your calendar.":
    'Pondremos los días festivos de tu país en tu calendario.', 'Profile picture (optional)': 'Foto de perfil (opcional)', 'Add a picture or logo': 'Agregar una imagen o logo',
  'If you skip this, your initials show instead.': 'Si no agregas una, se muestran tus iniciales.', 'Back': 'Atrás', 'Enter a business name to continue.': 'Escribe el nombre del negocio para continuar.',
  'Make it yours': 'Hazlo tuyo', 'Pick your colors. Each one comes with a matching font, and the whole app changes as you click.': 'Elige tus colores. Cada uno viene con su tipo de letra, y toda la app cambia al hacer clic.',
  'Simple': 'Sencillos', 'Classic': 'Clásico', 'Slate': 'Pizarra', 'Sage': 'Salvia', 'Cherry': 'Cereza', 'Sweet treats': 'Dulces', 'Strawberry': 'Fresa', 'Matcha': 'Matcha',
  'Blueberry': 'Mora azul', 'Lemon': 'Limón', 'Caramel': 'Caramelo', 'Bubblegum': 'Chicle', 'Nature': 'Naturaleza', 'Ocean': 'Océano', 'Forest': 'Bosque',
  'Sunset': 'Atardecer', 'Desert': 'Desierto', 'Sky': 'Cielo', 'Bold': 'Llamativos', 'Galaxy': 'Galaxia', 'Tropical': 'Tropical', 'Retro': 'Retro', 'Rainbow': 'Arcoíris',
  'Custom': 'Personalizado', 'Main color': 'Color principal', 'Accent color': 'Color de acento', 'Change with the time of day': 'Cambiar según la hora del día',
  'Warm in the morning, bright in the afternoon and calm at night.': 'Cálido en la mañana, brillante en la tarde y tranquilo en la noche.', 'Preview': 'Vista previa',
  '{o} due': '{o} pendientes', 'this week': 'esta semana', 'Up next': 'Lo que sigue', 'Chocolate chip cookies': 'Galletas con chispas de chocolate',
  'Friendly': 'Amigable', 'Rounded': 'Redonda', 'Playful': 'Divertida', 'Elegant': 'Elegante', 'Modern': 'Moderna', 'Font': 'Letra',
  'What do you want help with?': '¿Con qué quieres ayuda?', 'Pick as many as you like. Biz Studio puts these first and gives you tips for them.':
    'Elige las que quieras. Biz Studio las pone primero y te da consejos.', 'Something else? (optional)': '¿Algo más? (opcional)',
  'I want to sell at the farmers market this summer': 'Quiero vender en el mercado local este verano', 'Skip for now': 'Saltar por ahora', 'Finish setup': 'Terminar',

  // Goals and tips
  'I forget {o} or due dates': 'Se me olvidan {o} o fechas de entrega', "I don't know how to price my work": 'No sé cuánto cobrar por mi trabajo',
  'I run out of {s}': 'Se me acaban {s}', 'I want to grow my business': 'Quiero hacer crecer mi negocio', "I don't have enough time": 'No me alcanza el tiempo',
  'My info is all over the place': 'Tengo mi información por todos lados', 'I want to track my money': 'Quiero llevar el control de mi dinero',
  'I want my business to look professional': 'Quiero que mi negocio se vea profesional',
  'Check your calendar each morning. You will get extra reminders before {o} are due.': 'Revisa tu calendario cada mañana. Te recordaremos antes de que se venzan tus {o}.',
  'Add what you pay for {s} in Pricing and profit, and Biz Studio will suggest fair prices.': 'Agrega lo que pagas por tus {s} en Precios y ganancias, y Biz Studio te sugerirá precios justos.',
  'Look at your {s} list a few days before busy days so you can shop ahead.': 'Revisa tu lista de {s} unos días antes de los días ocupados para comprar con tiempo.',
  'Use the Finder to discover local markets and events where you can sell.': 'Usa el Buscador para descubrir mercados y eventos donde puedes vender.',
  'Your to-do list puts the most urgent work first, so you always know what to do next.': 'Tu lista de pendientes pone primero lo más urgente, así siempre sabes qué sigue.',
  'Keep every one of your {o} and {c} here instead of in texts and notes.': 'Guarda todos tus {o} y {c} aquí en vez de en mensajes y notas.',
  'Keep your {c}, to-dos and events here instead of in texts and notes.': 'Guarda tus {c}, pendientes y eventos aquí en vez de en mensajes y notas.',
  'Bookkeeping adds up what comes in and what goes out, so you can see your real profit.': 'Contabilidad suma lo que entra y lo que sale, para que veas tu ganancia real.',
  'Make receipts, menus and price lists from your {p} in a few clicks.': 'Haz recibos, menús y listas de precios con tus {p} en unos clics.',
  'Open calendar': 'Abrir calendario', 'Open pricing and profit': 'Abrir precios y ganancias', 'Open to-do list': 'Abrir pendientes', 'Open bookkeeping': 'Abrir contabilidad',
  'Open finder': 'Abrir buscador', 'Open receipts and menus': 'Abrir recibos y menús',
  'Heads up! {n} {o} are late.': '¡Ojo! {n} {o} van tarde.', 'You have {n} {o} due today. You can do it!': 'Tienes {n} {o} para hoy. ¡Tú puedes!',
  '{n} {o} are due tomorrow. Time to get ready!': '{n} {o} son para mañana. ¡A prepararse!', 'You have {n} things on your to-do list for today.': 'Tienes {n} cosas en tus pendientes para hoy.',
  'You have {n} thing on your to-do list for today.': 'Tienes {n} cosa en tus pendientes para hoy.', '{n} finished {o} are waiting to be paid.': '{n} {o} terminados esperan su pago.',
  "Add your first {oa} and I'll help you keep track of it.": 'Agrega tu primer {oa} y te ayudo a darle seguimiento.',
  'Add your {p} so I can work out what things cost you.': 'Agrega tus {p} para que pueda calcular lo que te cuestan.',
  "Add what you pay for your {s}, and I'll make your shopping list.": 'Agrega lo que pagas por tus {s} y haré tu lista de compras.',
  "It's been a while since your last backup. Save one in Settings so nothing gets lost!": 'Hace rato que no guardas una copia. ¡Guarda una en Ajustes para no perder nada!',
  'Add a picture for your business in Settings. It goes on your receipts too!': 'Agrega una imagen para tu negocio en Ajustes. ¡También sale en tus recibos!',
  'Click someone to see all their {o} in one place.': 'Haz clic en alguien para ver todos sus {o} en un solo lugar.',
  'Click a day, then Add to put an event or a to-do on it.': 'Haz clic en un día y luego en Agregar para poner un evento o un pendiente.',
  'Print a menu and bring it to your next market.': 'Imprime un menú y llévalo a tu próximo mercado.',
  'Try searching for a name, a {pa}, or anything else.': 'Prueba buscar un nombre, un {pa}, o lo que sea.',
  'Add money you spend with Money out, so you know what you really kept.': 'Agrega lo que gastas en Dinero que sale, para saber con cuánto te quedaste de verdad.',
  "You're doing great. Keep it up!": 'Vas muy bien. ¡Sigue así!', 'Nothing urgent right now. Nice work!': 'Nada urgente ahora. ¡Buen trabajo!',
  'All caught up! Maybe treat yourself to a snack.': '¡Todo al día! Date un gustito.',

  // Empty pages
  'Nothing on your list for today.': 'Nada en tu lista para hoy.', 'Add a task above to get started.': 'Agrega un pendiente arriba para empezar.',
  'Add a task above. When you have {o} coming up, tasks for them show up here on their own.': 'Agrega un pendiente arriba. Cuando tengas {o} próximos, sus pendientes aparecerán aquí solos.',
  'No sticky notes yet': 'Aún no hay notas adhesivas', 'Quick notes and reminders, in any color you like.': 'Notas y recordatorios rápidos, del color que quieras.',
  'Your calendar is clear': 'Tu calendario está libre', 'Nothing on your list yet': 'Nada en tu lista todavía', 'Nothing to buy': 'Nada por comprar',
  'No prices worked out yet': 'Aún no hay precios calculados', 'Find anything': 'Encuentra lo que sea', 'No printables yet': 'Nada para imprimir todavía',
};

// Sentences with names or things people typed in them: the part in ( ) is kept as it is
var LANG_ES_PATTERNS = [
  [/^Done: (.+)$/, 'Hecho: $1'], [/^Not done: (.+)$/, 'No hecho: $1'], [/^Flag as important: (.+)$/, 'Marcar como importante: $1'],
  [/^Unflag (.+)$/, 'Quitar marca: $1'], [/^Delete (.+)$/, 'Borrar $1'], [/^Remove (.+)$/, 'Quitar $1'], [/^Edit (.+)$/, 'Editar $1'],
  [/^To-do: (.+)$/, 'Pendiente: $1'], [/^Sticky note: (.+)$/, 'Nota adhesiva: $1'], [/^Bought (.+), added (\{m\}) to Bookkeeping$/, 'Compraste $1, se agregaron $2 a Contabilidad'],
  [/^Bought (.+)$/, 'Compraste $1'], [/^(.+) is now (\{m\})$/, '$1 ahora cuesta $2'], [/^Last: (.+)$/, 'Último: $1'],
  [/^New (\{oa\}) for (.+)$/, 'Agregar $1 para $2'], [/^(.+)'s (\{oa\}) marked (.+)$/, '$2 de $1 marcado como $3'],
  [/^Make (.+) for (.+)$/, 'Hacer $1 para $2'], [/^(.+), buy (.+)$/, '$1, compra $2'], [/^Need (.+), have (.+)\. For (.+)$/, 'Necesitas $1, tienes $2. Para $3'],
  [/^(\{m\}) for (\{n\}) (.+)$/, '$1 por $2 $3'], [/^(.+) at (\{t\})$/, '$1 a las $2'], [/^(.+) for ([A-Z][a-z]+(?: [A-Z][a-z]+)?)$/, '$1 para $2'],
  [/^Heads up! (.+)'s (.+) is late\.$/, '¡Ojo! $2 de $1 va tarde.'], [/^(.+)'s (.+) is due today at (\{t\})\.$/, '$2 de $1 es para hoy a las $3.'],
  [/^(.+)'s (.+) is due today\.$/, '$2 de $1 es para hoy.'], [/^Don't forget: (.+)'s (.+) is due tomorrow\.$/, 'No olvides: $2 de $1 es para mañana.'],
  [/^Today: (.+) at (\{t\})\. Have fun!$/, 'Hoy: $1 a las $2. ¡Diviértete!'], [/^Today: (.+)\. Have fun!$/, 'Hoy: $1. ¡Diviértete!'],
  [/^You flagged "(.+)" as important\. And (\{n\}) more\.$/, 'Marcaste "$1" como importante. Y $2 más.'], [/^You flagged "(.+)" as important\.$/, 'Marcaste "$1" como importante.'],
  [/^You're running low on (.+) and (\{n\}) more for your upcoming (.+)\.$/, 'Te queda poco de $1 y $2 más para tus próximos $3.'],
  [/^You're running low on (.+) for your upcoming (.+)\.$/, 'Te queda poco de $1 para tus próximos $2.'],
  [/^(.+)'s (\{oa\}) is done but not paid yet\.$/, 'El $2 de $1 está listo pero sin pagar.'],
  [/^Your (.+) costs more to make than you charge\. Let's fix that!$/, 'Hacer $1 te cuesta más de lo que cobras. ¡Arreglémoslo!'],
  [/^You could charge a little more for your (.+)\.$/, 'Podrías cobrar un poco más por $1.'],
  [/^(.+): (.+) \((\{d\})\)$/, '$1: $2 ($3)'], [/^Back to (.+)$/, 'Volver a $1'], [/^Added (\{n\}) to (\{S\}) and updated (\{n\}) prices?$/, 'Se agregaron $1 a $2 y se actualizaron $3 precios'],
  [/^Added (\{n\}) to (\{S\})$/, 'Se agregaron $1 a $2'], [/^Updated (\{n\}) prices?$/, 'Se actualizaron $1 precios'], [/^Add (\{n\}) to (\{S\})$/, 'Agregar $1 a $2'],
  [/^We found (\{n\}) things?\. (.+)$/, 'Encontramos $1. Revisa los nombres, cantidades y precios, y corrige lo que se vea mal. Desmarca lo que no quieras.'],
  [/^(.+) with the (.+) font$/, '$1 con la letra $2'], [/^Home bakery: (.+)$/, 'Pastelería en casa: $1'], [/^Cleaning: (.+)$/, 'Limpieza: $1'],
  [/^Skip (.+)$/, 'Omitir $1'], [/^Bought (.+)$/, 'Compraste $1'],
  [/^None yet\. Add things like (.+)\.$/, 'Nada todavía. Agrega cosas como $1.'],
];

// =========================================
// MORE LANGUAGES
// Each line is "number|translation". The numbers follow the order of LANG_ES above
// (0 is the first Spanish line), then the sentence patterns in LANG_ES_PATTERNS.
// To add a new line to every language, add it at the END of LANG_ES so the numbers stay lined up.
// =========================================
function buildLanguage(text) {
  const list = [];
  text.trim().split('\n').forEach(function (line) {
    const bar = line.indexOf('|');
    if (bar > 0) list[Number(line.slice(0, bar))] = line.slice(bar + 1);
  });
  const keys = Object.keys(LANG_ES);
  const dict = {};
  keys.forEach(function (k, i) { if (list[i]) dict[k] = list[i]; });
  const patterns = LANG_ES_PATTERNS.map(function (rule, i) { return [rule[0], list[keys.length + i]]; })
    .filter(function (rule) { return rule[1]; });
  return { dict: dict, patterns: patterns };
}
const languageCache = {};
function languageData() {
  if (appLanguage === 'es') return { dict: LANG_ES, patterns: LANG_ES_PATTERNS };
  const text = { fr: LANG_FR, zh: LANG_ZH, vi: LANG_VI, ko: LANG_KO, tl: LANG_TL, ru: LANG_RU, ja: LANG_JA, pt: LANG_PT, de: LANG_DE,
    it: LANG_IT, id: LANG_ID, uk: LANG_UK, hi: LANG_HI }[appLanguage];
  if (!text) return null;
  if (!languageCache[appLanguage]) languageCache[appLanguage] = buildLanguage(text);
  return languageCache[appLanguage];
}

// French
var LANG_FR = `
0|Dim
1|Lun
2|Mar
3|Mer
4|Jeu
5|Ven
6|Sam
7|Ma journée
8|Choisi pour toi
9|Calendrier
10|À faire
11|Prix et profits
12|Comptabilité
13|Travail
14|Notes autocollantes
15|Entreprise
16|{S} et courses
17|Grandir
18|Recherche
19|Reçus et menus
20|Paramètres
21|Argent
22|Menu
23|Menus
24|Bonjour
25|Bon après-midi
26|Bonsoir
27|Bonjour !
28|{o} pour aujourd'hui
29|{oa} pour aujourd'hui
30|tâches pour aujourd'hui
31|tâche pour aujourd'hui
32|payé ce mois-ci
33|choses à acheter
34|chose à acheter
35|{n} {oa} est en retard. Touche pour voir.
36|{n} {o} sont en retard. Touche pour voir.
37|À faire aujourd'hui
38|Tout voir
39|Cette semaine
40|événements aujourd'hui
41|événement aujourd'hui
42|Rien pour aujourd'hui. {n} à venir.
43|Tes priorités
44|Fermer
45|Montre-moi
46|Conseil suivant
47|Conseils de Pip
48|Pip
49|Aujourd'hui
50|Demain
51|Hier
52|En retard
53|Sans date
54|Un jour
55|En retard, c'était le {d}
56|{Oa} pour le {d}
57|{Oa} pour le {d} à {t}
58|{n} jours de retard
59|{n} jour de retard
60|Pour aujourd'hui
61|Pour demain
62|Pour demain à {t}
63|Pour aujourd'hui à {t}
64|Dans {n} jours
65|Dans {n} jours à {t}
66|Pour le {d}
67|Pour le {d} à {t}
68|Prévu le {d}
69|Prévu le {d} à {t}
70|{d} à {t}
71|Marquer comme important
72|Retirer la marque
73|Supprimer
74|Fait
75|Pas fait
76|Ajouter une tâche
77|Nouvelle tâche
78|Qu'est-ce que tu dois faire ?
79|Acheter plus de farine
80|Important
81|Marque-la pour qu'elle reste en haut
82|Ajouter la tâche
83|Écris ce que tu dois faire.
84|Effacer les tâches faites ({n})
85|{n} choses à faire aujourd'hui
86|{n} chose à faire aujourd'hui
87|{n} tâches effacées
88|{n} tâche effacée
89|Rien ici pour l'instant.
90|Annuler
91|Aucune tâche
92|Rien à faire aujourd'hui
93|Tout est fait !
94|Nouvelle note
95|Écris ici...
96|Note autocollante
97|Sortir sur ton écran
98|Couleur et supprimer
99|La voir dans le calendrier
100|Jaune
101|Pêche
102|Rose
103|Lavande
104|Bleu
105|Menthe
106|Citron vert
107|Sable
108|Choisir n'importe quelle couleur
109|Couleur
110|Au calendrier : {d}
111|Supprimer la note
112|Ajouter au calendrier
113|Ouvrir dans Notes autocollantes
114|Déplacer à un autre jour
115|Quel jour ?
116|La retirer du calendrier
117|Enregistrer
118|Ajoutée au calendrier le {d}
119|Retirée du calendrier
120|Note supprimée
121|Choisis un jour.
122|{n} note. Pointe une note pour la sortir sur ton écran.
123|{n} notes. Pointe une note pour la sortir sur ton écran.
124|Notes et rappels rapides, de la couleur que tu veux
125|Pas encore de notes. Clique sur + pour en ajouter une.
126|Ton navigateur a bloqué la fenêtre de la note. Autorise les fenêtres pop-up pour ce site et réessaie.
127|Vue du calendrier
128|Jour
129|Semaine
130|Mois
131|Année
132|Mois précédent
133|Mois suivant
134|Jour précédent
135|Jour suivant
136|Semaine précédente
137|Semaine suivante
138|Année précédente
139|Année suivante
140|Ajouter
141|Voir ce jour
142|Ajouter à ce jour
143|Ajouter au {d}
144|Voir ce mois
145|{n} choses prévues cette semaine
146|{n} chose prévue cette semaine
147|Rien de prévu cette semaine pour l'instant
148|{n} choses prévues
149|{n} chose prévue
150|Rien de prévu pour l'instant
151|Les points montrent les jours prévus. Les jours fériés sont en jaune.
152|Rien pour {d} pour l'instant
153|Rien de prévu en {d} pour l'instant
154|Rien de prévu. Une journée libre !
155|{n} {o} en {d}
156|{n} {oa} en {d}
157|{n} événement en {d}
158|{n} événements en {d}
159|Événement
160|À faire
161|Modifier l'événement
162|Nouvel événement
163|Qu'est-ce qui se passe ?
164|À quelle heure ?
165|(tu peux sauter ça)
166|À quelle heure ? (tu peux sauter ça)
167|Où ?
168|Parc de la rue principale
169|Supprimer cet événement
170|Ajouter l'événement
171|Événement supprimé
172|Écris ce qui se passe.
173|Toute la journée
174|N'importe quand
175|Marché fermier
176|Quoi ajouter
177|Heure
178|Où
179|Titre
180|(facultatif)
181|Coché
182|Jour de l'An
183|Journée de Martin Luther King Jr.
184|Saint-Valentin
185|Journée des présidents
186|Saint-Patrick
187|Pâques
188|Dimanche de Pâques
189|Lundi de Pâques
190|Vendredi saint
191|Jeudi saint
192|Fête des Mères
193|Memorial Day
194|Fête des Pères
195|Juneteenth
196|Fête de l'Indépendance
197|Fête du Travail
198|Journée des peuples autochtones
199|Halloween
200|Journée des anciens combattants
201|Action de grâce
202|Black Friday
203|Samedi des petites entreprises
204|Veille de Noël
205|Noël
206|Noël
207|Réveillon du Nouvel An
208|Lendemain de Noël
209|Fête de la Famille
210|Journée nationale des patriotes
211|Fête du Canada
212|Congé civique
213|Fête du Travail
214|Journée de la vérité et de la réconciliation
215|Jour du Souvenir
216|Jour des Rois
217|Jour de la Constitution
218|Anniversaire de Benito Juárez
219|Journée des enfants
220|Cinco de Mayo
221|Jour des Morts
222|Jour de la Révolution
223|Jour de la Vierge de Guadalupe
224|Fête de l'Australie
225|Anzac Day
226|Anniversaire du Roi
227|Waitangi Day
228|Lendemain du Jour de l'An
229|Nuit des feux de joie
230|Dimanche du Souvenir
231|Saint-Étienne
232|Jour férié de début mai
233|Jour férié de printemps
234|Jour férié d'été
235|Jour férié de la Sainte-Brigitte
236|Jour férié de mai
237|Jour férié de juin
238|Jour férié d'août
239|Jour férié d'octobre
240|Les {o} payés comptent comme argent reçu à leur date
241|L'argent qui entre et qui sort, mois par mois
242|Argent reçu
243|Argent dépensé
244|Il te reste
245|En attente de paiement
246|{n} derniers mois
247|Reçu : {m}
248|Dépensé : {m}
249|Ce mois-ci
250|Rien ce mois-ci pour l'instant.
251|Ce que tu as acheté ou payé
252|Boîtes à gâteau, location du stand
253|Combien
254|Quel jour
255|Supprimer ceci
256|L'ajouter
257|Écris combien c'était.
258|C'était pour quoi
259|Vente de pâtisseries, pourboires
260|Pourboire
261|Pas encore d'argent suivi
262|{n} choses à acheter
263|{n} chose à acheter
264|Ajouter depuis une photo
265|Ajouter {sa}
266|Liste de courses
267|Pour tes {o} des {n} prochaines semaines, environ {m}
268|Pour tes {o} des {n} prochaines semaines
269|Ce qu'il faut pour tes {o} apparaît ici tout seul
270|Choses à acheter
271|Ajoute quelque chose à acheter
272|Ce que tu as
273|Moins
274|Plus
275|Tu as ce qu'il te faut
276|Rien à acheter pour l'instant.
277|Pas encore de prix
278|Tu le mesures en
279|Quand tu l'achètes
280|Tu reçois
281|Combien tu reçois
282|unités
283|pour
284|Combien tu en as maintenant
285|Ajouter {sa}
286|Écris son nom.
287|tasses
288|pièce
289|bâtons
290|douzaine
291|Nom
292|Quantité
293|Unité
294|Prix
295|Modifier {sa}
296|Farine
297|Sucre
298|Prends une capture d'écran d'un reçu, d'une commande en ligne ou d'une liste de ce dont tu as besoin. L'appli la lit et remplit les noms, quantités et prix pour toi.
299|Prends une capture d'écran d'un reçu, d'une commande en ligne ou d'une liste de ce dont tu as besoin. L'appli la lit et remplit les noms, quantités et prix pour toi.
300|Colle une capture d'écran ici
301|Appuie sur
302|, dépose une image ou clique pour en choisir une
303|Astuce :
304|prend une capture d'écran
305|Ou tape ou colle la liste en texte
306|Lire cette liste
307|Lecture de ton image...
308|Ça peut prendre quelques secondes. La première fois, le lecteur se charge aussi depuis internet.
309|Ajouter une ligne
310|Essayer une autre image
311|Ajouter à {S}
312|Coche au moins une chose à ajouter.
313|Met à jour le prix
314|Ton image
315|Impossible de lire l'image. La lecture d'images a besoin d'internet la première fois. Tu peux taper ou coller la liste ci-dessous.
316|Aucun article avec un prix trouvé dans cette image. Essaie une capture plus nette, ou corrige le texte ci-dessous et clique sur Lire cette liste.
317|Ce que chaque {pa} te coûte vraiment, et combien le vendre
318|Paie-toi
319|de l'heure
320|Profit en plus
321|Ton temps
322|Coût réel
323|Tu demandes
324|Suggéré
325|Demande plutôt {m}
326|Pas encore de prix
327|Non défini
328|Tu gagnes {m}, un peu sous ton objectif
329|Tu gagnes {m} à chaque fois
330|Tu perds {m} à chaque fois
331|Utiliser le prix suggéré
332|Le coût réel, c'est tes {s} plus ton temps. Le prix suggéré ajoute le profit choisi, arrondi au dollar supérieur.
333|Ajoute d'abord tes {p}
334|Une fois que tu ajoutes ce qui entre dans chacun, cette page calcule tes coûts et un prix juste.
335|Aller à {P}
336|{n} ouverts, {n} terminés
337|Depuis Google Forms
338|Ajouter {oa}
339|+ Ajouter {oa}
340|Ouverts
341|Tous
342|Nouveau
343|En cours
344|Payé
345|Modifier
346|Statut
347|Effacer les {o} terminés ({n})
348|Retour à Ma journée
349|Modifier {oa}
350|Nom du {ca}
351|Téléphone ou courriel (facultatif)
352|{n}-{n}-{n} ou un courriel
353|Ce qu'ils veulent
354|Date prévue
355|Heure (facultatif)
356|Sans heure
357|Détails en plus
358|Saveur du gâteau
359|Tu veux demander autre chose à chaque {oa} ?
360|Message sur le gâteau
361|Allergies
362|Ramassage ou livraison
363|Autre chose
364|Notes (facultatif)
365|Autre chose à retenir
366|Enregistrer
367|Annuler
368|Supprimer {oa}
369|Retour à {O}
370|Ajouter {oa}
371|{n} {o} supprimés
372|Importer les {o} de ton Google Form
373|Chaque personne qui a rempli ton formulaire apparaît ici comme {oa}. Tu peux le refaire quand tu veux. Ceux déjà importés ne seront pas ajoutés deux fois.
374|Télécharge tes réponses
375|Ouvre ton Google Form et clique sur
376|Réponses
377|Clique sur
378|Afficher dans Sheets
379|(ou
380|Associer à Sheets
381|la première fois).
382|Dans la feuille, clique sur
383|Fichier
384|, puis
385|Télécharger
386|Choisis ce fichier
387|Choisis ton fichier
388|ou glisse-le ici
389|Dis à l'appli où va chaque réponse
390|On a deviné chaque question. Change celles qui semblent fausses.
391|Choisis la question qui contient le nom du {ca}.
392|Rien pour aujourd'hui
393|{n} personne
394|{n} personnes
395|Ajouter un {ca}
396|Trouver quelqu'un
397|Plus récents
398|Le plus de {o}
399|Ont le plus dépensé
400|De A à Z
401|Pas encore de téléphone ni de courriel
402|total
403|Ajouter {ca}
404|Laisse tomber
405|Retour à {C}
406|premier {oa}
407|Leurs {o}
408|Tous ceux qui t'achètent, au même endroit
409|Pas encore de {c}
410|Ajoute les personnes pour qui tu travailles, avec leur téléphone ou courriel, pour les avoir au même endroit.
411|Garde tous ceux pour qui tu travailles au même endroit.
412|{n} {p}
413|Ajouter {pa}
414|Donne {n}
415|{n} {s}
416|Coûte {m}
417|Sans prix
418|Retour à {P}
419|Ce que tu demandes
420|Combien ça donne
421|{n} gâteau, {n} cupcakes
422|Heures que ça te prend
423|Ce qu'il y a dedans
424|Rien d'ajouté pour l'instant. Choisis parmi tes {s} ci-dessous, ou ajoutes-en un nouveau.
425|+ Ajouter {sa}
426|Étapes
427|(une par ligne)
428|Ajouter {pa}
429|Donne-lui un nom pour l'enregistrer.
430|Les ingrédients d'une fournée coûtent
431|Cherche tout dans ton appli, ou trouve des endroits près de chez toi
432|Chercher {o}, {c}, {p}, tâches
433|Chercher {c}, {p}, tâches
434|Chercher
435|Près de chez toi
436|Marchés fermiers
437|Ouvre Google Maps
438|Foires d'artisanat
439|Magasins de {s}
440|Endroits où vendre
441|Crées-en un, puis imprime-le ou enregistre-le en PDF
442|Reçu
443|Quel {oa}
444|Imprimer
445|Pour
446|Date
447|Article
448|Total
449|Pas encore payé
450|Merci pour ton {oa} !
451|Une note en bas
452|{Oa} {n} jours à l'avance. Texto au {n}-{n}-{n}
453|Commande {n} jours à l'avance. Texto au {n}-{n}-{n}
454|Aucun résultat
455|Changer l'image
456|Retirer l'image
457|Tes entreprises
458|Ouverte
459|Ajouter une autre entreprise
460|Tes autres entreprises restent enregistrées
461|Cette entreprise
462|Nom de l'entreprise et pays
463|{B} · États-Unis
464|{B} · Canada
465|{B} · Mexique
466|{B} · Royaume-Uni
467|{B} · Irlande
468|{B} · Australie
469|{B} · Nouvelle-Zélande
470|{B} · Sans jours fériés
471|Type d'entreprise et mots
472|Apparence
473|Couleurs et police
474|Change selon l'heure de la journée
475|Langue
476|English, Español, Français, 中文, Tiếng Việt, 한국어, Tagalog, Русский, 日本語, Português, Deutsch
477|Pip, ton assistant
478|Apparaît avec des conseils sur ton entreprise
479|Objectifs
480|Ce pour quoi tu veux de l'aide
481|Aucun choisi pour l'instant
482|Sauvegarde
483|Faire une sauvegarde
484|Tu n'en as pas encore fait
485|Charger une sauvegarde
486|Récupère tout depuis un fichier de sauvegarde
487|Sauvegardé aujourd'hui
488|Sauvegardé hier
489|Sauvegardé il y a {n} jours
490|Supprimer {B}
491|Retour aux Paramètres
492|Ceci supprime tout dans {B}. Clique encore pour supprimer
493|Type d'entreprise
494|Ton entreprise
495|Couleurs
496|Quel genre d'entreprise est-ce ?
497|Biz Studio utilise les bons mots pour ton entreprise, comme {P} pour une boulangerie ou Rendez-vous pour un salon.
498|Pâtisserie maison
499|Repas et traiteur
500|Bougies et artisanat
501|Art et commandes
502|Couture et vêtements
503|Ongles
504|Coiffure
505|Cils et maquillage
506|Tutorat
507|Cours de musique et de danse
508|Coaching sportif
509|Photographie
510|Soins des animaux
511|Ménage
512|Jardinage
513|Fêtes et événements
514|Quel genre d'entreprise ?
515|Réparation de vélos, toilettage de chiens, stand de limonade...
516|Dis-nous ce que tu fais, et on remplira les mots qui vont bien.
517|Ce que tu vends ou proposes
518|Ce que les gens réservent ou commandent
519|Les personnes avec qui tu travailles
520|Ce que tu utilises pour travailler
521|Continuer
522|Comment s'appelle ton entreprise ?
523|Ce nom va sur tes reçus, tes menus et en haut de ton appli. Tu peux le changer plus tard.
524|Nom de l'entreprise
525|Où es-tu ?
526|États-Unis
527|Canada
528|Mexique
529|Royaume-Uni
530|Irlande
531|Australie
532|Nouvelle-Zélande
533|Ailleurs (sans jours fériés)
534|On mettra les jours fériés de ton pays dans ton calendrier.
535|Photo de profil (facultatif)
536|Ajouter une image ou un logo
537|Si tu passes, tes initiales s'affichent à la place.
538|Retour
539|Écris un nom d'entreprise pour continuer.
540|Fais-le à ton image
541|Choisis tes couleurs. Chacune vient avec sa police, et toute l'appli change quand tu cliques.
542|Simples
543|Classique
544|Ardoise
545|Sauge
546|Cerise
547|Douceurs
548|Fraise
549|Matcha
550|Myrtille
551|Citron
552|Caramel
553|Barbe à papa
554|Nature
555|Océan
556|Forêt
557|Coucher de soleil
558|Désert
559|Ciel
560|Audacieux
561|Galaxie
562|Tropical
563|Rétro
564|Arc-en-ciel
565|Personnalisé
566|Couleur principale
567|Couleur d'accent
568|Changer selon l'heure de la journée
569|Chaleureux le matin, lumineux l'après-midi et calme le soir.
570|Aperçu
571|{o} à venir
572|cette semaine
573|Ensuite
574|Biscuits aux pépites de chocolat
575|Amicale
576|Arrondie
577|Ludique
578|Élégante
579|Moderne
580|Police
581|Pour quoi veux-tu de l'aide ?
582|Choisis-en autant que tu veux. Biz Studio les met en premier et te donne des conseils.
583|Autre chose ? (facultatif)
584|Je veux vendre au marché fermier cet été
585|Passer pour l'instant
586|Terminer
587|J'oublie des {o} ou des dates
588|Je ne sais pas quel prix demander
589|Je manque de {s}
590|Je veux faire grandir mon entreprise
591|Je manque de temps
592|Mes infos sont éparpillées partout
593|Je veux suivre mon argent
594|Je veux que mon entreprise ait l'air professionnelle
595|Regarde ton calendrier chaque matin. Tu auras des rappels en plus avant tes {o}.
596|Ajoute ce que tu paies pour tes {s} dans Prix et profits, et Biz Studio te suggérera des prix justes.
597|Regarde ta liste de {s} quelques jours avant les jours chargés pour acheter à l'avance.
598|Utilise la Recherche pour trouver des marchés et des événements où vendre.
599|Ta liste de tâches met le plus urgent en premier, donc tu sais toujours quoi faire ensuite.
600|Garde tous tes {o} et {c} ici au lieu de les éparpiller dans des textos et des notes.
601|Garde tes {c}, tâches et événements ici au lieu de les éparpiller dans des textos et des notes.
602|La comptabilité additionne ce qui entre et ce qui sort, pour voir ton vrai profit.
603|Crée des reçus, des menus et des listes de prix à partir de tes {p} en quelques clics.
604|Ouvrir le calendrier
605|Ouvrir prix et profits
606|Ouvrir les tâches
607|Ouvrir la comptabilité
608|Ouvrir la recherche
609|Ouvrir reçus et menus
610|Attention ! {n} {o} sont en retard.
611|Tu as {n} {o} pour aujourd'hui. Tu peux le faire !
612|{n} {o} sont pour demain. Prépare-toi !
613|Tu as {n} choses dans ta liste pour aujourd'hui.
614|Tu as {n} chose dans ta liste pour aujourd'hui.
615|{n} {o} terminés attendent d'être payés.
616|Ajoute ton premier {oa} et je t'aiderai à le suivre.
617|Ajoute tes {p} pour que je calcule ce qu'ils te coûtent.
618|Ajoute ce que tu paies pour tes {s}, et je ferai ta liste de courses.
619|Ça fait un moment depuis ta dernière sauvegarde. Fais-en une dans Paramètres pour ne rien perdre !
620|Ajoute une image pour ton entreprise dans Paramètres. Elle va aussi sur tes reçus !
621|Clique sur quelqu'un pour voir tous ses {o} au même endroit.
622|Clique sur un jour, puis sur Ajouter pour y mettre un événement ou une tâche.
623|Imprime un menu et apporte-le à ton prochain marché.
624|Essaie de chercher un nom, un {pa}, ou autre chose.
625|Ajoute ce que tu dépenses dans Argent dépensé, pour savoir ce qu'il te reste vraiment.
626|Tu t'en sors très bien. Continue !
627|Rien d'urgent pour l'instant. Beau travail !
628|Tout est à jour ! Offre-toi une petite collation.
629|Rien sur ta liste pour aujourd'hui.
630|Ajoute une tâche ci-dessus pour commencer.
631|Ajoute une tâche ci-dessus. Quand tu auras des {o} à venir, leurs tâches apparaîtront ici toutes seules.
632|Pas encore de notes autocollantes
633|Notes et rappels rapides, de la couleur que tu veux.
634|Ton calendrier est libre
635|Rien sur ta liste pour l'instant
636|Rien à acheter
637|Pas encore de prix calculés
638|Trouve n'importe quoi
639|Rien à imprimer pour l'instant
640|Fait : $1
641|Pas fait : $1
642|Marquer comme important : $1
643|Retirer la marque : $1
644|Supprimer $1
645|Retirer $1
646|Modifier $1
647|À faire : $1
648|Note autocollante : $1
649|Tu as acheté $1, $2 ajoutés à la Comptabilité
650|Tu as acheté $1
651|$1 coûte maintenant $2
652|Dernier : $1
653|Ajouter $1 pour $2
654|$2 de $1 marqué $3
655|Faire $1 pour $2
656|$1, acheter $2
657|Il te faut $1, tu as $2. Pour $3
658|$1 pour $2 $3
659|$1 à $2
660|$1 pour $2
661|Attention ! $2 de $1 est en retard.
662|$2 de $1 est pour aujourd'hui à $3.
663|$2 de $1 est pour aujourd'hui.
664|N'oublie pas : $2 de $1 est pour demain.
665|Aujourd'hui : $1 à $2. Amuse-toi bien !
666|Aujourd'hui : $1. Amuse-toi bien !
667|Tu as marqué « $1 » comme important. Et $2 de plus.
668|Tu as marqué « $1 » comme important.
669|Il te reste peu de $1 et $2 autres pour tes prochains $3.
670|Il te reste peu de $1 pour tes prochains $2.
671|Le $2 de $1 est fini mais pas encore payé.
672|Ton $1 te coûte plus cher à faire que ce que tu demandes. Arrangeons ça !
673|Tu pourrais demander un peu plus pour ton $1.
674|$1 : $2 ($3)
675|Retour à $1
676|$1 ajoutés à $2 et $3 prix mis à jour
677|$1 ajoutés à $2
678|$1 prix mis à jour
679|Ajouter $1 à $2
680|On a trouvé $1 choses. Vérifie les noms, quantités et prix, et corrige ce qui semble faux. Décoche ce que tu ne veux pas.
681|$1 avec la police $2
682|Pâtisserie maison : $1
683|Ménage : $1
684|Passer $1
685|Tu as acheté $1
686|Rien pour l'instant. Ajoute des choses comme $1.
`;

// Chinese (Simplified)
var LANG_ZH = `
0|周日
1|周一
2|周二
3|周三
4|周四
5|周五
6|周六
7|我的一天
8|为你精选
9|日历
10|待办事项
11|定价与利润
12|记账
13|工作
14|便利贴
15|生意
16|{S}和购物
17|成长
18|查找
19|收据和菜单
20|设置
21|钱
22|菜单
23|菜单
24|早上好
25|下午好
26|晚上好
27|早上好！
28|今天到期的{o}
29|今天到期的{oa}
30|今天的任务
31|今天的任务
32|本月收入
33|要买的东西
34|要买的东西
35|{n}个{oa}已逾期。点击查看。
36|{n}个{o}已逾期。点击查看。
37|今天要做的
38|查看全部
39|本周即将到来
40|今天的活动
41|今天的活动
42|今天没有安排。之后还有{n}项。
43|你的重点
44|关闭
45|带我去看
46|下一条提示
47|Pip 的小提示
48|Pip
49|今天
50|明天
51|昨天
52|逾期
53|没有日期
54|以后再说
55|已逾期，原定{d}
56|{Oa}到期：{d}
57|{Oa}到期：{d} {t}
58|逾期{n}天
59|逾期{n}天
60|今天到期
61|明天到期
62|明天{t}到期
63|今天{t}到期
64|{n}天后到期
65|{n}天后{t}到期
66|{d}到期
67|{d} {t}到期
68|原定{d}
69|原定{d} {t}
70|{d} {t}
71|标为重要
72|取消标记
73|删除
74|完成
75|未完成
76|添加任务
77|新任务
78|你需要做什么？
79|再买些面粉
80|重要
81|标记后它会一直在最上面
82|添加任务
83|请写下你要做的事。
84|清除已完成（{n}）
85|今天有{n}件事要做
86|今天有{n}件事要做
87|已清除{n}个任务
88|已清除{n}个任务
89|这里暂时没有内容。
90|撤销
91|没有任务
92|今天没什么要做的
93|全部完成！
94|新便利贴
95|在这里写...
96|便利贴
97|弹出到屏幕上
98|颜色和删除
99|在日历中查看
100|黄色
101|桃色
102|粉色
103|薰衣草紫
104|蓝色
105|薄荷绿
106|青柠绿
107|沙色
108|选择任意颜色
109|颜色
110|日历上：{d}
111|删除便利贴
112|添加到日历
113|在便利贴中打开
114|移到另一天
115|哪一天？
116|从日历上移除
117|保存
118|已添加到日历：{d}
119|已从日历上移除
120|便利贴已删除
121|请选择一天。
122|{n}张便利贴。把鼠标移到便利贴上就能把它弹出到屏幕上。
123|{n}张便利贴。把鼠标移到便利贴上就能把它弹出到屏幕上。
124|快速笔记和提醒，颜色随你选
125|还没有便利贴。点击 + 添加一张。
126|你的浏览器拦截了便利贴窗口。请允许此网站弹出窗口后再试一次。
127|日历视图
128|日
129|周
130|月
131|年
132|上个月
133|下个月
134|前一天
135|后一天
136|上周
137|下周
138|去年
139|明年
140|添加
141|查看这一天
142|添加到这一天
143|添加到{d}
144|查看这个月
145|本周安排了{n}件事
146|本周安排了{n}件事
147|本周还没有安排
148|安排了{n}件事
149|安排了{n}件事
150|还没有安排
151|有圆点的日子有安排。节假日用黄色标出。
152|{d}还没有到期的事
153|{d}还没有安排
154|没有安排。自由的一天！
155|{d}有{n}个{o}到期
156|{d}有{n}个{oa}到期
157|{d}有{n}个活动
158|{d}有{n}个活动
159|活动
160|待办
161|编辑活动
162|新活动
163|发生什么事？
164|几点？
165|（可以不填）
166|几点？（可以不填）
167|在哪里？
168|主街公园
169|删除这个活动
170|添加活动
171|活动已删除
172|请写下发生什么事。
173|全天
174|任何时间
175|农贸市场
176|要添加什么
177|时间
178|地点
179|标题
180|（可选）
181|已勾选
182|元旦
183|马丁·路德·金纪念日
184|情人节
185|总统日
186|圣帕特里克节
187|复活节
188|复活节星期日
189|复活节星期一
190|耶稣受难日
191|濯足节
192|母亲节
193|阵亡将士纪念日
194|父亲节
195|六月节
196|独立日
197|劳动节
198|原住民日
199|万圣节
200|退伍军人节
201|感恩节
202|黑色星期五
203|小商家星期六
204|平安夜
205|圣诞节
206|圣诞节
207|除夕夜
208|节礼日
209|家庭日
210|维多利亚日
211|加拿大国庆日
212|公民假日
213|劳动节
214|真相与和解日
215|阵亡将士纪念日
216|三王节
217|宪法日
218|贝尼托·华雷斯诞辰
219|儿童节
220|五月五日节
221|亡灵节
222|革命纪念日
223|瓜达卢佩圣母节
224|澳大利亚国庆日
225|澳新军团日
226|国王生日
227|怀唐伊日
228|元旦次日
229|篝火之夜
230|国殇纪念日
231|圣史蒂芬节
232|五月初银行假日
233|春季银行假日
234|夏季银行假日
235|圣布里吉德节银行假日
236|五月银行假日
237|六月银行假日
238|八月银行假日
239|十月银行假日
240|已付款的{o}在到期日计入收入
241|每月的收入和支出
242|收入
243|支出
244|你留下的
245|等待付款
246|最近{n}个月
247|收入：{m}
248|支出：{m}
249|本月
250|本月还没有记录。
251|你买了或付了什么
252|蛋糕盒、摊位费
253|多少钱
254|哪一天
255|删除这一项
256|添加
257|请填写金额。
258|用途
259|义卖、小费
260|小费
261|还没有记账
262|{n}样东西要买
263|{n}样东西要买
264|从图片添加
265|添加{sa}
266|购物清单
267|未来{n}周的{o}所需，约{m}
268|未来{n}周的{o}所需
269|{o}需要的东西会自动出现在这里
270|你需要买的东西
271|添加要买的东西
272|你现有的
273|减少
274|增加
275|你需要的都有了
276|现在没有要买的。
277|还没有价格
278|计量单位
279|购买时
280|你得到
281|你得到多少
282|单位
283|共
284|你现在有多少
285|添加{sa}
286|请填写名称。
287|杯
288|个
289|条
290|打
291|名称
292|数量
293|单位
294|价格
295|编辑{sa}
296|面粉
297|糖
298|截取收据、网上订单或购物清单的屏幕截图。应用会读取并帮你填好名称、数量和价格。
299|截取收据、网上订单或购物清单的屏幕截图。应用会读取并帮你填好名称、数量和价格。
300|在这里粘贴截图
301|按
302|，拖入图片，或点击选择一张
303|提示：
304|可以截图
305|或者把清单打字或粘贴成文字
306|读取这份清单
307|正在读取你的图片...
308|这可能需要几秒钟。第一次使用时还需要从网上加载读取工具。
309|添加一行
310|换一张图片
311|添加到{S}
312|请至少勾选一项。
313|会更新价格
314|你的图片
315|无法读取这张图片。第一次读取图片需要联网。你也可以在下面打字或粘贴清单。
316|这张图片里没找到带价格的项目。试试更清晰的截图，或修改下面的文字后点击"读取这份清单"。
317|每个{pa}的真实成本，以及该收多少钱
318|给自己的工资
319|每小时
320|额外利润
321|你的时间
322|真实成本
323|你的售价
324|建议价格
325|改收{m}
326|还没有定价
327|未设置
328|你赚{m}，略低于目标
329|每次赚{m}
330|每次亏{m}
331|使用建议价格
332|真实成本 = {s} + 你的时间。建议价格会加上你选的利润，并向上取整到整数美元。
333|请先添加你的{p}
334|添加每样东西的用料后，这个页面会算出成本和合理价格。
335|前往{P}
336|{n}个进行中，{n}个已完成
337|从 Google 表单导入
338|添加{oa}
339|+ 添加{oa}
340|进行中
341|全部
342|新
343|进行中
344|已付款
345|编辑
346|状态
347|清除已完成的{o}（{n}）
348|返回我的一天
349|编辑{oa}
350|{ca}姓名
351|电话或邮箱（可选）
352|{n}-{n}-{n} 或邮箱
353|他们想要什么
354|到期日
355|时间（可选）
356|不设时间
357|额外细节
358|蛋糕口味
359|想在每个{oa}里多问点什么吗？
360|蛋糕上的字
361|过敏
362|自取还是送货
363|其他
364|备注（可选）
365|其他要记住的事
366|保存更改
367|取消
368|删除这个{oa}
369|返回{O}
370|添加{oa}
371|已删除{n}个{o}
372|从你的 Google 表单导入{o}
373|每个填过表单的人都会作为一个新的{oa}出现在这里。你可以随时再导入，已导入的不会重复添加。
374|下载你的回复
375|打开你的 Google 表单并点击
376|回复
377|点击
378|在表格中查看
379|（或
380|关联到表格
381|第一次时）。
382|在表格中，点击
383|文件
384|，然后
385|下载
386|选择那个文件
387|选择你的文件
388|或拖到这里
389|告诉应用每个回答该放哪里
390|我们猜了每个问题。如有不对请修改。
391|请选择哪个问题是{ca}的姓名。
392|今天没有到期的
393|{n}人
394|{n}人
395|添加{ca}
396|找人
397|最近的
398|{o}最多
399|花费最多
400|按字母排序
401|还没有电话或邮箱
402|总计
403|添加{ca}
404|算了
405|返回{C}
406|第一个{oa}
407|他们的{o}
408|所有向你购买的人，都在这里
409|还没有{c}
410|添加你服务的人和他们的电话或邮箱，所有人都在一个地方。
411|把你服务的每个人放在一个地方。
412|{n}个{p}
413|添加{pa}
414|可做{n}份
415|{n}种{s}
416|成本{m}
417|没有价格
418|返回{P}
419|你的售价
420|能做多少
421|{n}个蛋糕、{n}个纸杯蛋糕
422|需要几小时
423|用料
424|还没有添加。从下面的{s}中选择，或新增一个。
425|+ 添加{sa}
426|步骤
427|（每行一步）
428|添加{pa}
429|请起个名字再保存。
430|一批的用料成本
431|搜索应用里的所有内容，或查找附近的地方
432|搜索{o}、{c}、{p}、任务
433|搜索{c}、{p}、任务
434|搜索
435|在附近查找
436|农贸市场
437|打开 Google 地图
438|手工艺市集
439|{s}商店
440|可以摆摊卖东西的地方
441|制作一个，然后打印或保存为 PDF
442|收据
443|哪个{oa}
444|打印
445|给
446|日期
447|项目
448|总计
449|尚未付款
450|感谢你的{oa}！
451|底部备注
452|请提前{n}天下{oa}。短信：{n}-{n}-{n}
453|请提前{n}天下单。短信：{n}-{n}-{n}
454|没有结果
455|更换图片
456|移除图片
457|你的生意
458|正在使用
459|添加另一个生意
460|你的其他生意会保留
461|这个生意
462|生意名称和国家
463|{B} · 美国
464|{B} · 加拿大
465|{B} · 墨西哥
466|{B} · 英国
467|{B} · 爱尔兰
468|{B} · 澳大利亚
469|{B} · 新西兰
470|{B} · 不显示节假日
471|生意类型和用词
472|外观
473|颜色和字体
474|随一天中的时间变化
475|语言
476|English, Español, Français, 中文, Tiếng Việt, 한국어, Tagalog, Русский, 日本語, Português, Deutsch
477|Pip，你的小帮手
478|会弹出关于你生意的小提示
479|目标
480|你想要什么帮助
481|还没选
482|备份
483|保存备份
484|你还没有保存过
485|载入备份
486|从备份文件恢复所有内容
487|今天已保存
488|昨天已保存
489|{n}天前保存
490|删除{B}
491|返回设置
492|这会删除{B}的所有内容。再点一次确认删除
493|生意类型
494|你的生意
495|颜色
496|你做的是什么生意？
497|Biz Studio 会为你的生意使用合适的词，比如烘焙店用{P}，沙龙用预约。
498|家庭烘焙
499|餐饮外烩
500|蜡烛和手工艺
501|艺术和委托创作
502|缝纫和服装
503|美甲
504|美发
505|睫毛和化妆
506|家教
507|音乐和舞蹈课
508|健身教练
509|摄影
510|宠物照护
511|清洁
512|园艺
513|派对和活动
514|什么类型的生意？
515|修自行车、宠物美容、柠檬水摊...
516|告诉我们你做什么，我们会帮你填上合适的词。
517|你卖或提供什么
518|大家预订或订购的东西
519|和你合作的人
520|你工作用的东西
521|继续
522|你的生意叫什么名字？
523|这个名字会出现在你的收据、菜单和应用顶部。之后可以修改。
524|生意名称
525|你在哪里？
526|美国
527|加拿大
528|墨西哥
529|英国
530|爱尔兰
531|澳大利亚
532|新西兰
533|其他地方（不显示节假日）
534|我们会把你所在国家的节假日放进你的日历。
535|头像（可选）
536|添加图片或标志
537|如果跳过，会显示你的名字缩写。
538|返回
539|请输入生意名称再继续。
540|打造你的风格
541|选择你的颜色。每种都有配套字体，点击后整个应用都会改变。
542|简约
543|经典
544|石板
545|鼠尾草
546|樱桃
547|甜点
548|草莓
549|抹茶
550|蓝莓
551|柠檬
552|焦糖
553|泡泡糖
554|自然
555|海洋
556|森林
557|日落
558|沙漠
559|天空
560|醒目
561|银河
562|热带
563|复古
564|彩虹
565|自定义
566|主色
567|强调色
568|随一天中的时间变化
569|早上温暖，下午明亮，晚上安静。
570|预览
571|待完成的{o}
572|本周
573|接下来
574|巧克力豆曲奇
575|友好
576|圆润
577|活泼
578|优雅
579|现代
580|字体
581|你想要什么帮助？
582|想选几个都可以。Biz Studio 会把它们放在最前面，并给你相关提示。
583|还有别的吗？（可选）
584|我想今年夏天去农贸市场摆摊
585|先跳过
586|完成设置
587|我总忘记{o}或到期日
588|我不知道该怎么定价
589|我的{s}总是用完
590|我想让生意成长
591|我时间不够
592|我的信息到处都是
593|我想记录我的钱
594|我想让生意看起来更专业
595|每天早上看看日历。{o}到期前你会收到额外提醒。
596|在"定价与利润"里填上{s}的价格，Biz Studio 会建议合理的售价。
597|在忙碌的日子前几天看看{s}清单，提前采购。
598|用"查找"发现附近可以摆摊的市场和活动。
599|待办事项会把最紧急的放在最前面，你总知道下一步做什么。
600|把所有{o}和{c}都放在这里，不用再翻短信和笔记。
601|把{c}、待办和活动都放在这里，不用再翻短信和笔记。
602|记账会算出收入和支出，让你看到真正的利润。
603|几下点击就能用你的{p}做出收据、菜单和价目表。
604|打开日历
605|打开定价与利润
606|打开待办事项
607|打开记账
608|打开查找
609|打开收据和菜单
610|注意！{n}个{o}已逾期。
611|你今天有{n}个{o}要完成。加油！
612|明天有{n}个{o}到期。该准备了！
613|你今天的待办里有{n}件事。
614|你今天的待办里有{n}件事。
615|{n}个已完成的{o}还没付款。
616|添加你的第一个{oa}，我会帮你跟进。
617|添加你的{p}，我就能算出成本。
618|填上{s}的价格，我会帮你做购物清单。
619|你很久没备份了。在设置里保存一份，以免丢失！
620|在设置里为你的生意添加一张图片。它也会出现在收据上！
621|点击某人，就能看到他们所有的{o}。
622|点击某一天，然后点"添加"来加上活动或待办。
623|打印一份菜单，带去下一次市集。
624|试着搜索名字、{pa}或其他任何东西。
625|在"支出"里记录花费，就知道你真正留下了多少。
626|你做得很棒，继续加油！
627|目前没有紧急的事。干得好！
628|全部搞定！犒劳一下自己吧。
629|今天的清单上没有内容。
630|在上面添加一个任务开始吧。
631|在上面添加一个任务。有{o}要来时，相关任务会自动出现在这里。
632|还没有便利贴
633|快速笔记和提醒，颜色随你选。
634|你的日历是空的
635|你的清单还是空的
636|没有要买的
637|还没有算出价格
638|找任何东西
639|还没有可打印的
640|完成：$1
641|未完成：$1
642|标为重要：$1
643|取消标记：$1
644|删除 $1
645|移除 $1
646|编辑 $1
647|待办：$1
648|便利贴：$1
649|已购买 $1，已在记账中加入 $2
650|已购买 $1
651|$1 现在是 $2
652|最近：$1
653|为 $2 添加$1
654|$1 的$2已标为$3
655|为 $2 做 $1
656|$1，买 $2
657|需要 $1，现有 $2。用于 $3
658|$1 / $2 $3
659|$1 $2
660|$1（给 $2）
661|注意！$1 的 $2 已逾期。
662|$1 的 $2 今天 $3 到期。
663|$1 的 $2 今天到期。
664|别忘了：$1 的 $2 明天到期。
665|今天：$1，$2。玩得开心！
666|今天：$1。玩得开心！
667|你把"$1"标为重要。还有 $2 个。
668|你把"$1"标为重要。
669|你的 $1 和另外 $2 样东西快用完了，即将到来的$3需要。
670|你的 $1 快用完了，即将到来的$2需要。
671|$1 的$2已完成，但还没付款。
672|你的 $1 成本比售价还高。我们来解决一下！
673|你的 $1 可以再多收一点。
674|$1：$2（$3）
675|返回 $1
676|已向$2添加 $1 项，并更新 $3 个价格
677|已向$2添加 $1 项
678|已更新 $1 个价格
679|添加 $1 项到$2
680|找到 $1 项。请检查名称、数量和价格，有错就改。不想要的取消勾选。
681|$1，$2字体
682|家庭烘焙：$1
683|清洁：$1
684|跳过 $1
685|已购买 $1
686|还没有。可以添加像$1这样的内容。
`;

// Vietnamese
var LANG_VI = `
0|CN
1|T2
2|T3
3|T4
4|T5
5|T6
6|T7
7|Ngày của tôi
8|Chọn cho bạn
9|Lịch
10|Việc cần làm
11|Giá và lợi nhuận
12|Sổ sách
13|Công việc
14|Ghi chú dán
15|Kinh doanh
16|{S} và mua sắm
17|Phát triển
18|Tìm kiếm
19|Hóa đơn và thực đơn
20|Cài đặt
21|Tiền
22|Thực đơn
23|Thực đơn
24|Chào buổi sáng
25|Chào buổi chiều
26|Chào buổi tối
27|Chào buổi sáng!
28|{o} đến hạn hôm nay
29|{oa} đến hạn hôm nay
30|việc hôm nay
31|việc hôm nay
32|tiền nhận tháng này
33|món cần mua
34|món cần mua
35|{n} {oa} bị trễ. Chạm để xem.
36|{n} {o} bị trễ. Chạm để xem.
37|Việc hôm nay
38|Xem tất cả
39|Sắp tới trong tuần
40|sự kiện hôm nay
41|sự kiện hôm nay
42|Hôm nay không có gì. Sắp tới có {n} việc.
43|Trọng tâm của bạn
44|Đóng
45|Cho tôi xem
46|Mẹo tiếp theo
47|Mẹo từ Pip
48|Pip
49|Hôm nay
50|Ngày mai
51|Hôm qua
52|Trễ
53|Không có ngày
54|Lúc nào đó
55|Trễ, hạn là {d}
56|{Oa} hạn {d}
57|{Oa} hạn {d} lúc {t}
58|Trễ {n} ngày
59|Trễ {n} ngày
60|Hạn hôm nay
61|Hạn ngày mai
62|Hạn ngày mai lúc {t}
63|Hạn hôm nay lúc {t}
64|Còn {n} ngày
65|Còn {n} ngày, lúc {t}
66|Hạn {d}
67|Hạn {d} lúc {t}
68|Hạn đã là {d}
69|Hạn đã là {d} lúc {t}
70|{d} lúc {t}
71|Đánh dấu quan trọng
72|Bỏ đánh dấu
73|Xóa
74|Xong
75|Chưa xong
76|Thêm việc
77|Việc mới
78|Bạn cần làm gì?
79|Mua thêm bột mì
80|Quan trọng
81|Đánh dấu để việc này luôn ở trên cùng
82|Thêm việc
83|Hãy nhập việc bạn cần làm.
84|Xóa việc đã xong ({n})
85|{n} việc cần làm hôm nay
86|{n} việc cần làm hôm nay
87|Đã xóa {n} việc
88|Đã xóa {n} việc
89|Hiện chưa có gì ở đây.
90|Hoàn tác
91|Không có việc nào
92|Hôm nay không có gì phải làm
93|Xong hết rồi!
94|Ghi chú mới
95|Viết ở đây...
96|Ghi chú dán
97|Đưa ra màn hình
98|Màu và xóa
99|Xem trên lịch
100|Vàng
101|Cam đào
102|Hồng
103|Tím oải hương
104|Xanh dương
105|Xanh bạc hà
106|Xanh chanh
107|Màu cát
108|Chọn màu bất kỳ
109|Màu
110|Trên lịch: {d}
111|Xóa ghi chú
112|Thêm vào lịch
113|Mở trong Ghi chú dán
114|Dời sang ngày khác
115|Ngày nào?
116|Gỡ khỏi lịch
117|Lưu
118|Đã thêm vào lịch ngày {d}
119|Đã gỡ khỏi lịch
120|Đã xóa ghi chú
121|Hãy chọn một ngày.
122|{n} ghi chú. Rê chuột lên ghi chú để đưa nó ra màn hình.
123|{n} ghi chú. Rê chuột lên ghi chú để đưa nó ra màn hình.
124|Ghi chú và nhắc nhở nhanh, màu nào cũng được
125|Chưa có ghi chú. Bấm + để thêm.
126|Trình duyệt đã chặn cửa sổ ghi chú. Hãy cho phép cửa sổ bật lên cho trang này rồi thử lại.
127|Chế độ xem lịch
128|Ngày
129|Tuần
130|Tháng
131|Năm
132|Tháng trước
133|Tháng sau
134|Hôm trước
135|Hôm sau
136|Tuần trước
137|Tuần sau
138|Năm trước
139|Năm sau
140|Thêm
141|Xem ngày này
142|Thêm vào ngày này
143|Thêm vào {d}
144|Xem tháng này
145|{n} việc đã lên kế hoạch tuần này
146|{n} việc đã lên kế hoạch tuần này
147|Tuần này chưa có kế hoạch
148|{n} việc đã lên kế hoạch
149|{n} việc đã lên kế hoạch
150|Chưa có kế hoạch
151|Dấu chấm là ngày có kế hoạch. Ngày lễ có màu vàng.
152|Chưa có gì đến hạn trong {d}
153|Chưa có kế hoạch trong {d}
154|Không có kế hoạch. Một ngày rảnh!
155|{n} {o} đến hạn trong {d}
156|{n} {oa} đến hạn trong {d}
157|{n} sự kiện trong {d}
158|{n} sự kiện trong {d}
159|Sự kiện
160|Việc cần làm
161|Sửa sự kiện
162|Sự kiện mới
163|Có chuyện gì?
164|Mấy giờ?
165|(có thể bỏ qua)
166|Mấy giờ? (có thể bỏ qua)
167|Ở đâu?
168|Công viên phố chính
169|Xóa sự kiện này
170|Thêm sự kiện
171|Đã xóa sự kiện
172|Hãy nhập chuyện gì sẽ diễn ra.
173|Cả ngày
174|Giờ nào cũng được
175|Chợ nông sản
176|Thêm gì
177|Giờ
178|Ở đâu
179|Tiêu đề
180|(không bắt buộc)
181|Đã đánh dấu xong
182|Tết Dương lịch
183|Ngày Martin Luther King Jr.
184|Lễ Tình nhân
185|Ngày Tổng thống
186|Lễ Thánh Patrick
187|Lễ Phục sinh
188|Chủ nhật Phục sinh
189|Thứ hai Phục sinh
190|Thứ sáu Tuần Thánh
191|Thứ năm Tuần Thánh
192|Ngày của Mẹ
193|Ngày Tưởng niệm
194|Ngày của Cha
195|Juneteenth
196|Ngày Độc lập
197|Ngày Lao động
198|Ngày của Người bản địa
199|Halloween
200|Ngày Cựu chiến binh
201|Lễ Tạ ơn
202|Black Friday
203|Thứ bảy Doanh nghiệp nhỏ
204|Đêm Giáng sinh
205|Giáng sinh
206|Giáng sinh
207|Đêm Giao thừa
208|Boxing Day
209|Ngày Gia đình
210|Ngày Victoria
211|Quốc khánh Canada
212|Ngày lễ Công dân
213|Ngày Lao động
214|Ngày Sự thật và Hòa giải
215|Ngày Tưởng niệm
216|Lễ Ba Vua
217|Ngày Hiến pháp
218|Sinh nhật Benito Juárez
219|Ngày Thiếu nhi
220|Cinco de Mayo
221|Lễ Người chết
222|Ngày Cách mạng
223|Lễ Đức Mẹ Guadalupe
224|Quốc khánh Úc
225|Ngày Anzac
226|Sinh nhật Nhà vua
227|Ngày Waitangi
228|Ngày sau Tết Dương lịch
229|Đêm Lửa trại
230|Chủ nhật Tưởng niệm
231|Lễ Thánh Stephen
232|Ngày nghỉ đầu tháng Năm
233|Ngày nghỉ mùa xuân
234|Ngày nghỉ mùa hè
235|Ngày nghỉ Thánh Brigid
236|Ngày nghỉ tháng Năm
237|Ngày nghỉ tháng Sáu
238|Ngày nghỉ tháng Tám
239|Ngày nghỉ tháng Mười
240|{o} đã thanh toán được tính là tiền vào vào ngày đến hạn
241|Tiền vào và tiền ra, theo từng tháng
242|Tiền vào
243|Tiền ra
244|Bạn giữ lại
245|Đang chờ thanh toán
246|{n} tháng gần nhất
247|Vào: {m}
248|Ra: {m}
249|Tháng này
250|Tháng này chưa có gì.
251|Bạn đã mua hoặc trả gì
252|Hộp bánh, phí gian hàng
253|Bao nhiêu
254|Ngày nào
255|Xóa mục này
256|Thêm
257|Hãy nhập số tiền.
258|Dùng cho việc gì
259|Bán bánh gây quỹ, tiền boa
260|Tiền boa
261|Chưa ghi chép tiền nào
262|{n} món cần mua
263|{n} món cần mua
264|Thêm từ hình ảnh
265|Thêm {sa}
266|Danh sách mua sắm
267|Cho {o} trong {n} tuần tới, khoảng {m}
268|Cho {o} trong {n} tuần tới
269|Những thứ cần cho {o} sẽ tự hiện ở đây
270|Những thứ bạn cần mua
271|Thêm món cần mua
272|Những gì bạn có
273|Bớt
274|Thêm
275|Bạn có đủ những gì cần
276|Hiện không cần mua gì.
277|Chưa có giá
278|Đơn vị đo
279|Khi bạn mua
280|Bạn được
281|Bạn được bao nhiêu
282|đơn vị
283|giá
284|Bạn đang có bao nhiêu
285|Thêm {sa}
286|Hãy nhập tên.
287|cốc
288|cái
289|thanh
290|tá
291|Tên
292|Số lượng
293|Đơn vị
294|Giá
295|Sửa {sa}
296|Bột mì
297|Đường
298|Chụp màn hình hóa đơn, đơn hàng trực tuyến hoặc danh sách những gì bạn cần. Ứng dụng sẽ đọc và điền tên, số lượng và giá cho bạn.
299|Chụp màn hình hóa đơn, đơn hàng trực tuyến hoặc danh sách những gì bạn cần. Ứng dụng sẽ đọc và điền tên, số lượng và giá cho bạn.
300|Dán ảnh chụp màn hình vào đây
301|Nhấn
302|, thả hình ảnh vào, hoặc bấm để chọn
303|Mẹo:
304|để chụp màn hình
305|Hoặc gõ hay dán danh sách dạng chữ
306|Đọc danh sách này
307|Đang đọc hình ảnh...
308|Việc này có thể mất vài giây. Lần đầu, ứng dụng còn tải công cụ đọc từ internet.
309|Thêm một dòng
310|Thử ảnh khác
311|Thêm vào {S}
312|Hãy đánh dấu ít nhất một món để thêm.
313|Sẽ cập nhật giá
314|Hình ảnh của bạn
315|Không đọc được hình ảnh. Lần đầu đọc ảnh cần có internet. Bạn có thể gõ hoặc dán danh sách bên dưới.
316|Không tìm thấy món nào có giá trong ảnh đó. Hãy thử ảnh rõ hơn, hoặc sửa chữ bên dưới rồi bấm Đọc danh sách này.
317|Mỗi {pa} thật sự tốn bao nhiêu, và nên bán giá nào
318|Trả lương cho bạn
319|mỗi giờ
320|Lợi nhuận thêm
321|Thời gian của bạn
322|Chi phí thật
323|Bạn bán
324|Gợi ý
325|Nên bán {m}
326|Chưa đặt giá
327|Chưa đặt
328|Bạn lời {m}, hơi thấp hơn mục tiêu
329|Mỗi lần lời {m}
330|Mỗi lần lỗ {m}
331|Dùng giá gợi ý
332|Chi phí thật là {s} cộng thời gian của bạn. Giá gợi ý cộng thêm lợi nhuận bạn chọn, làm tròn lên đô la tiếp theo.
333|Hãy thêm {p} trước
334|Khi bạn thêm nguyên liệu cho từng món, trang này sẽ tính chi phí và giá hợp lý.
335|Đến {P}
336|{n} đang mở, {n} đã xong
337|Từ Google Form
338|Thêm {oa}
339|+ Thêm {oa}
340|Đang mở
341|Tất cả
342|Mới
343|Đang làm
344|Đã trả
345|Sửa
346|Trạng thái
347|Xóa {o} đã xong ({n})
348|Quay lại Ngày của tôi
349|Sửa {oa}
350|Tên {ca}
351|Điện thoại hoặc email (không bắt buộc)
352|{n}-{n}-{n} hoặc email
353|Họ muốn gì
354|Ngày đến hạn
355|Giờ (không bắt buộc)
356|Không có giờ
357|Chi tiết thêm
358|Vị bánh
359|Muốn hỏi thêm gì trong mỗi {oa}?
360|Chữ trên bánh
361|Dị ứng
362|Tự lấy hay giao hàng
363|Khác
364|Ghi chú (không bắt buộc)
365|Điều khác cần nhớ
366|Lưu thay đổi
367|Hủy
368|Xóa {oa} này
369|Quay lại {O}
370|Thêm {oa}
371|Đã xóa {n} {o}
372|Lấy {o} từ Google Form của bạn
373|Mỗi người đã điền biểu mẫu sẽ hiện ở đây thành một {oa} mới. Bạn có thể làm lại bất cứ lúc nào. Những cái đã lấy sẽ không bị thêm hai lần.
374|Tải câu trả lời về
375|Mở Google Form và bấm
376|Câu trả lời
377|Bấm
378|Xem trong Trang tính
379|(hoặc
380|Liên kết với Trang tính
381|lần đầu).
382|Trong trang tính, bấm
383|Tệp
384|, rồi
385|Tải xuống
386|Chọn tệp đó
387|Chọn tệp của bạn
388|hoặc kéo vào đây
389|Cho ứng dụng biết mỗi câu trả lời thuộc mục nào
390|Chúng tôi đã đoán cho từng câu hỏi. Hãy sửa nếu thấy sai.
391|Chọn câu hỏi chứa tên {ca}.
392|Hôm nay không có gì đến hạn
393|{n} người
394|{n} người
395|Thêm {ca}
396|Tìm người
397|Gần đây nhất
398|Nhiều {o} nhất
399|Chi nhiều nhất
400|A đến Z
401|Chưa có điện thoại hay email
402|tổng
403|Thêm {ca}
404|Thôi
405|Quay lại {C}
406|{oa} đầu tiên
407|{o} của họ
408|Tất cả những người mua hàng của bạn, ở một nơi
409|Chưa có {c}
410|Thêm những người bạn làm việc cùng, kèm điện thoại hoặc email, để tất cả ở một nơi.
411|Giữ mọi người bạn làm việc cùng ở một nơi.
412|{n} {p}
413|Thêm {pa}
414|Làm được {n}
415|{n} {s}
416|Tốn {m}
417|Chưa có giá
418|Quay lại {P}
419|Giá bạn bán
420|Làm được bao nhiêu
421|{n} bánh kem, {n} bánh cupcake
422|Số giờ bạn cần
423|Thành phần
424|Chưa thêm gì. Chọn từ {s} bên dưới, hoặc thêm mới.
425|+ Thêm {sa}
426|Các bước
427|(mỗi dòng một bước)
428|Thêm {pa}
429|Hãy đặt tên để lưu.
430|Nguyên liệu cho một mẻ tốn
431|Tìm mọi thứ trong ứng dụng, hoặc tìm địa điểm gần bạn
432|Tìm {o}, {c}, {p}, việc
433|Tìm {c}, {p}, việc
434|Tìm
435|Tìm gần bạn
436|Chợ nông sản
437|Mở Google Maps
438|Hội chợ thủ công
439|Cửa hàng {s}
440|Nơi để bán hàng
441|Tạo một cái, rồi in hoặc lưu thành PDF
442|Hóa đơn
443|{oa} nào
444|In
445|Cho
446|Ngày
447|Món
448|Tổng
449|Chưa thanh toán
450|Cảm ơn bạn đã đặt {oa}!
451|Ghi chú ở cuối
452|Đặt {oa} trước {n} ngày. Nhắn tin {n}-{n}-{n}
453|Đặt trước {n} ngày. Nhắn tin {n}-{n}-{n}
454|Không có kết quả
455|Đổi ảnh
456|Gỡ ảnh
457|Các cơ sở kinh doanh của bạn
458|Đang mở
459|Thêm cơ sở kinh doanh khác
460|Các cơ sở khác vẫn được lưu
461|Cơ sở này
462|Tên và quốc gia
463|{B} · Hoa Kỳ
464|{B} · Canada
465|{B} · Mexico
466|{B} · Vương quốc Anh
467|{B} · Ireland
468|{B} · Úc
469|{B} · New Zealand
470|{B} · Không có ngày lễ
471|Loại hình và từ ngữ
472|Giao diện
473|Màu và phông chữ
474|Thay đổi theo thời gian trong ngày
475|Ngôn ngữ
476|English, Español, Français, 中文, Tiếng Việt, 한국어, Tagalog, Русский, 日本語, Português, Deutsch
477|Pip, người trợ giúp của bạn
478|Hiện mẹo về việc kinh doanh của bạn
479|Mục tiêu
480|Bạn muốn được giúp gì
481|Chưa chọn
482|Sao lưu
483|Lưu bản sao lưu
484|Bạn chưa lưu bản nào
485|Tải bản sao lưu
486|Khôi phục mọi thứ từ tệp sao lưu
487|Đã lưu hôm nay
488|Đã lưu hôm qua
489|Đã lưu {n} ngày trước
490|Xóa {B}
491|Quay lại Cài đặt
492|Thao tác này xóa mọi thứ trong {B}. Bấm lần nữa để xóa
493|Loại hình kinh doanh
494|Cơ sở của bạn
495|Màu sắc
496|Bạn kinh doanh gì?
497|Biz Studio dùng từ ngữ phù hợp với việc kinh doanh của bạn, như {P} cho tiệm bánh hay Lịch hẹn cho tiệm tóc.
498|Làm bánh tại nhà
499|Nấu ăn và đặt tiệc
500|Nến và đồ thủ công
501|Nghệ thuật và đặt vẽ
502|May vá và quần áo
503|Làm móng
504|Làm tóc
505|Mi và trang điểm
506|Gia sư
507|Dạy nhạc và nhảy
508|Huấn luyện thể hình
509|Nhiếp ảnh
510|Chăm sóc thú cưng
511|Dọn dẹp
512|Sân vườn
513|Tiệc và sự kiện
514|Loại hình kinh doanh nào?
515|Sửa xe đạp, tắm chó, quầy nước chanh...
516|Hãy cho biết bạn làm gì, chúng tôi sẽ điền từ ngữ phù hợp.
517|Những gì bạn bán hoặc cung cấp
518|Những gì người ta đặt
519|Những người bạn làm việc cùng
520|Những gì bạn dùng để làm việc
521|Tiếp tục
522|Cơ sở của bạn tên gì?
523|Tên này sẽ có trên hóa đơn, thực đơn và đầu ứng dụng. Bạn có thể đổi sau.
524|Tên cơ sở
525|Bạn ở đâu?
526|Hoa Kỳ
527|Canada
528|Mexico
529|Vương quốc Anh
530|Ireland
531|Úc
532|New Zealand
533|Nơi khác (không có ngày lễ)
534|Chúng tôi sẽ đưa ngày lễ của nước bạn vào lịch.
535|Ảnh đại diện (không bắt buộc)
536|Thêm ảnh hoặc logo
537|Nếu bỏ qua, chữ viết tắt tên bạn sẽ hiện ra.
538|Quay lại
539|Hãy nhập tên cơ sở để tiếp tục.
540|Làm theo phong cách của bạn
541|Chọn màu. Mỗi màu đi kèm một phông chữ, và cả ứng dụng thay đổi khi bạn bấm.
542|Đơn giản
543|Cổ điển
544|Xám đá
545|Xô thơm
546|Anh đào
547|Đồ ngọt
548|Dâu tây
549|Matcha
550|Việt quất
551|Chanh
552|Caramel
553|Kẹo cao su
554|Thiên nhiên
555|Đại dương
556|Rừng
557|Hoàng hôn
558|Sa mạc
559|Bầu trời
560|Nổi bật
561|Thiên hà
562|Nhiệt đới
563|Cổ điển retro
564|Cầu vồng
565|Tùy chỉnh
566|Màu chính
567|Màu nhấn
568|Thay đổi theo thời gian trong ngày
569|Ấm áp buổi sáng, tươi sáng buổi chiều và dịu nhẹ buổi tối.
570|Xem trước
571|{o} sắp đến hạn
572|tuần này
573|Tiếp theo
574|Bánh quy sô-cô-la chip
575|Thân thiện
576|Bo tròn
577|Vui nhộn
578|Thanh lịch
579|Hiện đại
580|Phông chữ
581|Bạn muốn được giúp gì?
582|Chọn bao nhiêu cũng được. Biz Studio sẽ đưa chúng lên đầu và cho bạn mẹo.
583|Điều khác? (không bắt buộc)
584|Tôi muốn bán ở chợ nông sản mùa hè này
585|Bỏ qua lúc này
586|Hoàn tất
587|Tôi hay quên {o} hoặc ngày đến hạn
588|Tôi không biết định giá thế nào
589|Tôi hay hết {s}
590|Tôi muốn phát triển việc kinh doanh
591|Tôi không đủ thời gian
592|Thông tin của tôi để lung tung khắp nơi
593|Tôi muốn theo dõi tiền bạc
594|Tôi muốn cơ sở của mình trông chuyên nghiệp
595|Xem lịch mỗi sáng. Bạn sẽ được nhắc thêm trước khi {o} đến hạn.
596|Nhập giá bạn mua {s} trong Giá và lợi nhuận, Biz Studio sẽ gợi ý giá hợp lý.
597|Xem danh sách {s} vài ngày trước những ngày bận để mua sẵn.
598|Dùng Tìm kiếm để tìm chợ và sự kiện nơi bạn có thể bán hàng.
599|Danh sách việc cần làm đưa việc gấp nhất lên đầu, nên bạn luôn biết phải làm gì tiếp.
600|Giữ tất cả {o} và {c} ở đây thay vì trong tin nhắn và ghi chú.
601|Giữ {c}, việc cần làm và sự kiện ở đây thay vì trong tin nhắn và ghi chú.
602|Sổ sách cộng tiền vào và tiền ra, để bạn thấy lợi nhuận thật.
603|Tạo hóa đơn, thực đơn và bảng giá từ {p} chỉ với vài cú bấm.
604|Mở lịch
605|Mở giá và lợi nhuận
606|Mở việc cần làm
607|Mở sổ sách
608|Mở tìm kiếm
609|Mở hóa đơn và thực đơn
610|Chú ý! {n} {o} bị trễ.
611|Hôm nay bạn có {n} {o} đến hạn. Bạn làm được mà!
612|{n} {o} đến hạn ngày mai. Chuẩn bị thôi!
613|Hôm nay bạn có {n} việc trong danh sách.
614|Hôm nay bạn có {n} việc trong danh sách.
615|{n} {o} đã xong đang chờ thanh toán.
616|Thêm {oa} đầu tiên và tôi sẽ giúp bạn theo dõi.
617|Thêm {p} để tôi tính chi phí cho bạn.
618|Nhập giá bạn mua {s}, tôi sẽ lập danh sách mua sắm.
619|Đã lâu rồi bạn chưa sao lưu. Hãy lưu một bản trong Cài đặt để không mất gì!
620|Thêm ảnh cho cơ sở của bạn trong Cài đặt. Ảnh cũng có trên hóa đơn!
621|Bấm vào một người để xem tất cả {o} của họ.
622|Bấm vào một ngày, rồi bấm Thêm để thêm sự kiện hoặc việc cần làm.
623|In một thực đơn và mang đến phiên chợ tới.
624|Thử tìm một cái tên, một {pa}, hoặc bất cứ thứ gì.
625|Ghi khoản chi trong Tiền ra, để biết bạn thật sự giữ lại bao nhiêu.
626|Bạn đang làm rất tốt. Cứ thế nhé!
627|Hiện không có gì gấp. Làm tốt lắm!
628|Xong hết rồi! Tự thưởng một món ăn vặt nhé.
629|Hôm nay danh sách trống.
630|Thêm một việc ở trên để bắt đầu.
631|Thêm một việc ở trên. Khi có {o} sắp tới, việc của chúng sẽ tự hiện ở đây.
632|Chưa có ghi chú dán
633|Ghi chú và nhắc nhở nhanh, màu nào cũng được.
634|Lịch của bạn đang trống
635|Danh sách của bạn đang trống
636|Không cần mua gì
637|Chưa tính được giá
638|Tìm bất cứ thứ gì
639|Chưa có gì để in
640|Xong: $1
641|Chưa xong: $1
642|Đánh dấu quan trọng: $1
643|Bỏ đánh dấu: $1
644|Xóa $1
645|Gỡ $1
646|Sửa $1
647|Việc cần làm: $1
648|Ghi chú dán: $1
649|Đã mua $1, đã thêm $2 vào Sổ sách
650|Đã mua $1
651|$1 giờ là $2
652|Gần nhất: $1
653|Thêm $1 cho $2
654|$2 của $1 đã đánh dấu $3
655|Làm $1 cho $2
656|$1, mua $2
657|Cần $1, đang có $2. Cho $3
658|$1 cho $2 $3
659|$1 lúc $2
660|$1 cho $2
661|Chú ý! $2 của $1 bị trễ.
662|$2 của $1 đến hạn hôm nay lúc $3.
663|$2 của $1 đến hạn hôm nay.
664|Đừng quên: $2 của $1 đến hạn ngày mai.
665|Hôm nay: $1 lúc $2. Chúc vui!
666|Hôm nay: $1. Chúc vui!
667|Bạn đã đánh dấu "$1" là quan trọng. Và $2 việc nữa.
668|Bạn đã đánh dấu "$1" là quan trọng.
669|Bạn sắp hết $1 và $2 món khác cho $3 sắp tới.
670|Bạn sắp hết $1 cho $2 sắp tới.
671|$2 của $1 đã xong nhưng chưa thanh toán.
672|$1 của bạn tốn nhiều hơn giá bạn bán. Cùng sửa nhé!
673|Bạn có thể bán $1 giá cao hơn một chút.
674|$1: $2 ($3)
675|Quay lại $1
676|Đã thêm $1 vào $2 và cập nhật $3 giá
677|Đã thêm $1 vào $2
678|Đã cập nhật $1 giá
679|Thêm $1 vào $2
680|Tìm thấy $1 món. Hãy kiểm tra tên, số lượng và giá, sửa nếu sai. Bỏ chọn những gì bạn không muốn.
681|$1 với phông $2
682|Làm bánh tại nhà: $1
683|Dọn dẹp: $1
684|Bỏ qua $1
685|Đã mua $1
686|Chưa có. Thêm những thứ như $1.
`;

// Korean
var LANG_KO = `
0|일
1|월
2|화
3|수
4|목
5|금
6|토
7|나의 하루
8|추천 메뉴
9|캘린더
10|할 일
11|가격과 이익
12|장부
13|업무
14|메모지
15|비즈니스
16|{S}와 장보기
17|성장
18|찾기
19|영수증과 메뉴
20|설정
21|돈
22|메뉴
23|메뉴
24|좋은 아침이에요
25|좋은 오후예요
26|좋은 저녁이에요
27|좋은 아침이에요!
28|오늘 마감 {o}
29|오늘 마감 {oa}
30|오늘 할 일
31|오늘 할 일
32|이번 달 받은 돈
33|살 것
34|살 것
35|{oa} {n}개가 늦었어요. 눌러서 확인하세요.
36|{o} {n}개가 늦었어요. 눌러서 확인하세요.
37|오늘 할 일
38|모두 보기
39|이번 주 예정
40|오늘 일정
41|오늘 일정
42|오늘은 일정이 없어요. 곧 {n}개가 있어요.
43|나의 목표
44|닫기
45|보여 줘
46|다음 팁
47|Pip의 팁
48|Pip
49|오늘
50|내일
51|어제
52|늦음
53|날짜 없음
54|언젠가
55|늦음, {d}까지였어요
56|{Oa} 마감 {d}
57|{Oa} 마감 {d} {t}
58|{n}일 늦음
59|{n}일 늦음
60|오늘 마감
61|내일 마감
62|내일 {t} 마감
63|오늘 {t} 마감
64|{n}일 후 마감
65|{n}일 후 {t} 마감
66|{d} 마감
67|{d} {t} 마감
68|{d} 마감이었어요
69|{d} {t} 마감이었어요
70|{d} {t}
71|중요 표시
72|표시 해제
73|삭제
74|완료
75|미완료
76|할 일 추가
77|새 할 일
78|무엇을 해야 하나요?
79|밀가루 더 사기
80|중요
81|표시하면 맨 위에 계속 있어요
82|할 일 추가
83|할 일을 입력하세요.
84|완료 항목 지우기 ({n})
85|오늘 할 일 {n}개
86|오늘 할 일 {n}개
87|할 일 {n}개를 지웠어요
88|할 일 {n}개를 지웠어요
89|지금은 아무것도 없어요.
90|실행 취소
91|할 일 없음
92|오늘은 할 일이 없어요
93|모두 끝!
94|새 메모
95|여기에 쓰세요...
96|메모지
97|화면으로 꺼내기
98|색상 및 삭제
99|캘린더에서 보기
100|노랑
101|복숭아
102|분홍
103|라벤더
104|파랑
105|민트
106|라임
107|모래
108|아무 색이나 고르기
109|색상
110|캘린더: {d}
111|메모 삭제
112|캘린더에 추가
113|메모지에서 열기
114|다른 날로 옮기기
115|어느 날?
116|캘린더에서 빼기
117|저장
118|{d} 캘린더에 추가했어요
119|캘린더에서 뺐어요
120|메모를 삭제했어요
121|날짜를 고르세요.
122|메모 {n}개. 메모에 마우스를 올리면 화면으로 꺼낼 수 있어요.
123|메모 {n}개. 메모에 마우스를 올리면 화면으로 꺼낼 수 있어요.
124|원하는 색으로 쓰는 간단한 메모와 알림
125|아직 메모가 없어요. +를 눌러 추가하세요.
126|브라우저가 메모 창을 막았어요. 이 사이트의 팝업을 허용하고 다시 시도하세요.
127|캘린더 보기
128|일
129|주
130|월
131|년
132|지난달
133|다음 달
134|전날
135|다음 날
136|지난주
137|다음 주
138|작년
139|내년
140|추가
141|이날 보기
142|이날에 추가
143|{d}에 추가
144|이 달 보기
145|이번 주 계획 {n}개
146|이번 주 계획 {n}개
147|이번 주 계획이 아직 없어요
148|계획 {n}개
149|계획 {n}개
150|아직 계획이 없어요
151|점은 계획이 있는 날이에요. 공휴일은 노란색이에요.
152|{d}에 마감이 아직 없어요
153|{d}에 계획이 아직 없어요
154|계획 없음. 자유로운 하루!
155|{d}에 {o} {n}개 마감
156|{d}에 {oa} {n}개 마감
157|{d}에 일정 {n}개
158|{d}에 일정 {n}개
159|일정
160|할 일
161|일정 수정
162|새 일정
163|무슨 일인가요?
164|몇 시?
165|(건너뛰어도 돼요)
166|몇 시? (건너뛰어도 돼요)
167|어디서?
168|메인 스트리트 공원
169|이 일정 삭제
170|일정 추가
171|일정을 삭제했어요
172|무슨 일인지 입력하세요.
173|하루 종일
174|아무 때나
175|파머스 마켓
176|추가할 항목
177|시간
178|장소
179|제목
180|(선택)
181|완료 표시했어요
182|새해 첫날
183|마틴 루터 킹 주니어의 날
184|밸런타인데이
185|대통령의 날
186|성 패트릭의 날
187|부활절
188|부활절 일요일
189|부활절 월요일
190|성금요일
191|성목요일
192|어머니의 날
193|현충일
194|아버지의 날
195|준틴스
196|독립기념일
197|노동절
198|원주민의 날
199|핼러윈
200|재향군인의 날
201|추수감사절
202|블랙 프라이데이
203|스몰 비즈니스 새터데이
204|크리스마스이브
205|크리스마스
206|크리스마스
207|새해 전야
208|박싱 데이
209|가족의 날
210|빅토리아 데이
211|캐나다 데이
212|시민의 날
213|노동절
214|진실과 화해의 날
215|현충일
216|주현절
217|제헌절
218|베니토 후아레스 탄생일
219|어린이날
220|싱코 데 마요
221|망자의 날
222|혁명 기념일
223|과달루페 성모의 날
224|오스트레일리아 데이
225|안작 데이
226|국왕 탄신일
227|와이탕이 데이
228|새해 다음 날
229|본파이어 나이트
230|현충 일요일
231|성 스테파노의 날
232|5월 초 공휴일
233|봄 공휴일
234|여름 공휴일
235|성 브리지드의 날 공휴일
236|5월 공휴일
237|6월 공휴일
238|8월 공휴일
239|10월 공휴일
240|결제된 {o}은 마감일에 들어온 돈으로 계산돼요
241|월별로 보는 들어온 돈과 나간 돈
242|들어온 돈
243|나간 돈
244|남은 돈
245|받을 돈
246|최근 {n}개월
247|들어옴: {m}
248|나감: {m}
249|이번 달
250|이번 달은 아직 없어요.
251|산 것 또는 낸 것
252|케이크 상자, 부스 비용
253|금액
254|날짜
255|삭제
256|추가하기
257|금액을 입력하세요.
258|용도
259|베이크 세일, 팁
260|팁
261|아직 기록한 돈이 없어요
262|살 것 {n}개
263|살 것 {n}개
264|사진으로 추가
265|{sa} 추가
266|장보기 목록
267|앞으로 {n}주 동안의 {o}에 필요해요, 약 {m}
268|앞으로 {n}주 동안의 {o}에 필요해요
269|{o}에 필요한 것은 여기에 자동으로 나타나요
270|사야 할 것
271|살 것 추가
272|가지고 있는 것
273|줄이기
274|늘리기
275|필요한 건 다 있어요
276|지금은 살 게 없어요.
277|아직 가격이 없어요
278|측정 단위
279|살 때
280|받는 양
281|받는 양
282|단위
283|가격
284|지금 가진 양
285|{sa} 추가
286|이름을 입력하세요.
287|컵
288|개
289|스틱
290|다스
291|이름
292|양
293|단위
294|가격
295|{sa} 수정
296|밀가루
297|설탕
298|영수증, 온라인 주문, 필요한 물건 목록의 스크린샷을 찍어 보세요. 앱이 읽고 이름, 양, 가격을 채워 줘요.
299|영수증, 온라인 주문, 필요한 물건 목록의 스크린샷을 찍어 보세요. 앱이 읽고 이름, 양, 가격을 채워 줘요.
300|여기에 스크린샷을 붙여넣으세요
301|누르기
302|, 사진을 끌어다 놓거나 클릭해서 고르세요
303|팁:
304|로 스크린샷을 찍어요
305|또는 목록을 글자로 입력하거나 붙여넣기
306|이 목록 읽기
307|사진을 읽는 중...
308|몇 초 걸릴 수 있어요. 처음에는 인터넷에서 읽기 도구도 불러와요.
309|줄 추가
310|다른 사진으로 해 보기
311|{S}에 추가
312|추가할 항목을 하나 이상 체크하세요.
313|가격을 업데이트해요
314|내 사진
315|사진을 읽지 못했어요. 처음 사진을 읽을 때는 인터넷이 필요해요. 아래에 목록을 입력하거나 붙여넣어도 돼요.
316|그 사진에서 가격이 있는 항목을 찾지 못했어요. 더 선명한 스크린샷으로 해 보거나, 아래 글자를 고친 뒤 이 목록 읽기를 누르세요.
317|각 {pa}에 실제로 드는 비용과 받을 가격
318|내 시급
319|시간당
320|추가 이익
321|내 시간
322|실제 비용
323|판매가
324|추천 가격
325|대신 {m} 받기
326|아직 가격이 없어요
327|미설정
328|{m} 남아요, 목표보다 조금 적어요
329|매번 {m} 남아요
330|매번 {m} 손해예요
331|추천 가격 사용
332|실제 비용은 {s}에 내 시간을 더한 거예요. 추천 가격은 고른 이익을 더하고 1달러 단위로 올림해요.
333|먼저 {p}을 추가하세요
334|각 항목에 들어가는 재료를 추가하면, 이 페이지가 비용과 적정 가격을 계산해요.
335|{P}로 가기
336|진행 중 {n}개, 완료 {n}개
337|구글 설문지에서
338|{oa} 추가
339|+ {oa} 추가
340|진행 중
341|전체
342|새로 들어옴
343|진행 중
344|결제 완료
345|수정
346|상태
347|완료된 {o} 지우기 ({n})
348|나의 하루로 돌아가기
349|{oa} 수정
350|{ca} 이름
351|전화번호 또는 이메일 (선택)
352|{n}-{n}-{n} 또는 이메일
353|원하는 것
354|마감일
355|시간 (선택)
356|시간 없음
357|추가 정보
358|케이크 맛
359|{oa}마다 더 물어보고 싶은 게 있나요?
360|케이크 문구
361|알레르기
362|픽업 또는 배달
363|기타
364|메모 (선택)
365|기억할 다른 내용
366|변경 사항 저장
367|취소
368|이 {oa} 삭제
369|{O}로 돌아가기
370|{oa} 추가
371|{o} {n}개를 삭제했어요
372|구글 설문지에서 {o} 가져오기
373|설문지를 작성한 사람마다 여기에 새 {oa}로 나타나요. 언제든 다시 할 수 있어요. 이미 가져온 것은 두 번 추가되지 않아요.
374|응답 다운로드하기
375|구글 설문지를 열고 클릭하세요
376|응답
377|클릭
378|스프레드시트에서 보기
379|(또는
380|스프레드시트에 연결
381|처음일 때).
382|시트에서 클릭하세요
383|파일
384|, 그다음
385|다운로드
386|그 파일 고르기
387|파일 고르기
388|또는 여기로 끌어다 놓기
389|각 답이 어디로 가는지 알려 주세요
390|질문마다 추측해 봤어요. 틀린 것은 바꿔 주세요.
391|{ca} 이름이 있는 질문을 고르세요.
392|오늘 마감 없음
393|{n}명
394|{n}명
395|{ca} 추가
396|사람 찾기
397|최근 순
398|{o} 많은 순
399|많이 쓴 순
400|가나다순
401|아직 전화번호나 이메일이 없어요
402|합계
403|{ca} 추가
404|그만두기
405|{C}로 돌아가기
406|첫 {oa}
407|이 사람의 {o}
408|내게 주문하는 모든 사람을 한곳에
409|아직 {c}이 없어요
410|함께 일하는 사람들을 전화번호나 이메일과 함께 추가해서 한곳에 모아 두세요.
411|함께 일하는 모든 사람을 한곳에 모아 두세요.
412|{p} {n}개
413|{pa} 추가
414|{n}개 만들어요
415|{s} {n}개
416|비용 {m}
417|가격 없음
418|{P}로 돌아가기
419|판매가
420|만드는 양
421|케이크 {n}개, 컵케이크 {n}개
422|걸리는 시간
423|들어가는 것
424|아직 추가한 게 없어요. 아래 {s}에서 고르거나 새로 추가하세요.
425|+ {sa} 추가
426|순서
427|(한 줄에 하나씩)
428|{pa} 추가
429|저장하려면 이름을 붙여 주세요.
430|한 번 만드는 재료비
431|앱 안의 모든 것을 찾거나, 근처 장소를 찾아보세요
432|{o}, {c}, {p}, 할 일 검색
433|{c}, {p}, 할 일 검색
434|검색
435|근처에서 찾기
436|파머스 마켓
437|구글 지도 열기
438|공예 장터
439|{s} 가게
440|판매할 수 있는 곳
441|만든 다음 인쇄하거나 PDF로 저장하세요
442|영수증
443|어떤 {oa}
444|인쇄
445|받는 사람
446|날짜
447|항목
448|합계
449|아직 결제 안 됨
450|{oa} 감사합니다!
451|아래쪽 메모
452|{n}일 전에 {oa}하세요. 문자 {n}-{n}-{n}
453|{n}일 전에 주문하세요. 문자 {n}-{n}-{n}
454|결과 없음
455|사진 바꾸기
456|사진 빼기
457|내 비즈니스
458|지금 열림
459|다른 비즈니스 추가
460|다른 비즈니스는 그대로 저장돼요
461|이 비즈니스
462|비즈니스 이름과 나라
463|{B} · 미국
464|{B} · 캐나다
465|{B} · 멕시코
466|{B} · 영국
467|{B} · 아일랜드
468|{B} · 호주
469|{B} · 뉴질랜드
470|{B} · 공휴일 없음
471|비즈니스 종류와 단어
472|모양
473|색상과 글꼴
474|하루 시간에 따라 바뀌어요
475|언어
476|English, Español, Français, 中文, Tiếng Việt, 한국어, Tagalog, Русский, 日本語, Português, Deutsch
477|도우미 Pip
478|비즈니스에 대한 팁을 알려 줘요
479|목표
480|도움받고 싶은 것
481|아직 고르지 않았어요
482|백업
483|백업 저장
484|아직 저장한 적이 없어요
485|백업 불러오기
486|백업 파일에서 모두 되살리기
487|오늘 저장했어요
488|어제 저장했어요
489|{n}일 전에 저장했어요
490|{B} 삭제
491|설정으로 돌아가기
492|{B}의 모든 것이 삭제돼요. 삭제하려면 한 번 더 클릭하세요
493|비즈니스 종류
494|내 비즈니스
495|색상
496|어떤 비즈니스인가요?
497|Biz Studio는 비즈니스에 맞는 단어를 써요. 베이커리는 {P}, 미용실은 예약처럼요.
498|홈 베이커리
499|음식과 케이터링
500|양초와 공예
501|미술과 의뢰 작품
502|바느질과 옷
503|네일
504|헤어
505|속눈썹과 메이크업
506|과외
507|음악과 댄스 레슨
508|피트니스 코칭
509|사진
510|반려동물 돌봄
511|청소
512|마당과 정원
513|파티와 이벤트
514|어떤 비즈니스인가요?
515|자전거 수리, 강아지 미용, 레모네이드 가판대...
516|무슨 일을 하는지 알려 주시면 어울리는 단어를 채워 드릴게요.
517|팔거나 제공하는 것
518|사람들이 예약하거나 주문하는 것
519|함께 일하는 사람들
520|일할 때 쓰는 것
521|계속
522|비즈니스 이름이 뭔가요?
523|이 이름은 영수증, 메뉴, 앱 맨 위에 나와요. 나중에 바꿀 수 있어요.
524|비즈니스 이름
525|어디에 있나요?
526|미국
527|캐나다
528|멕시코
529|영국
530|아일랜드
531|호주
532|뉴질랜드
533|기타 지역 (공휴일 없음)
534|그 나라의 공휴일을 캘린더에 넣어 드릴게요.
535|프로필 사진 (선택)
536|사진이나 로고 추가
537|건너뛰면 이니셜이 대신 나와요.
538|뒤로
539|계속하려면 비즈니스 이름을 입력하세요.
540|나만의 스타일로
541|색을 골라 보세요. 색마다 어울리는 글꼴이 있고, 클릭하면 앱 전체가 바뀌어요.
542|심플
543|클래식
544|슬레이트
545|세이지
546|체리
547|달콤한 간식
548|딸기
549|말차
550|블루베리
551|레몬
552|캐러멜
553|풍선껌
554|자연
555|바다
556|숲
557|노을
558|사막
559|하늘
560|강렬한
561|은하수
562|트로피컬
563|레트로
564|무지개
565|직접 만들기
566|메인 색
567|포인트 색
568|하루 시간에 따라 바꾸기
569|아침엔 따뜻하게, 오후엔 밝게, 밤엔 차분하게.
570|미리 보기
571|마감 예정 {o}
572|이번 주
573|다음 할 일
574|초코칩 쿠키
575|친근한
576|둥근
577|발랄한
578|우아한
579|모던한
580|글꼴
581|어떤 도움이 필요하세요?
582|원하는 만큼 고르세요. Biz Studio가 먼저 보여 주고 팁도 드려요.
583|다른 게 있나요? (선택)
584|이번 여름에 파머스 마켓에서 팔고 싶어요
585|지금은 건너뛰기
586|설정 끝내기
587|{o}이나 마감일을 잊어버려요
588|가격을 어떻게 정할지 모르겠어요
589|{s}이 자주 떨어져요
590|비즈니스를 키우고 싶어요
591|시간이 부족해요
592|정보가 여기저기 흩어져 있어요
593|돈 관리를 하고 싶어요
594|비즈니스가 전문적으로 보였으면 해요
595|매일 아침 캘린더를 확인하세요. {o} 마감 전에 알림을 더 드려요.
596|가격과 이익에 {s} 구매 가격을 넣으면 Biz Studio가 적정 가격을 추천해요.
597|바쁜 날 며칠 전에 {s} 목록을 확인해서 미리 사 두세요.
598|찾기로 팔 수 있는 근처 장터와 행사를 찾아보세요.
599|할 일 목록은 가장 급한 일을 맨 위에 둬서, 다음에 뭘 할지 항상 알 수 있어요.
600|모든 {o}과 {c}을 문자나 메모 대신 여기에 모아 두세요.
601|{c}, 할 일, 일정을 문자나 메모 대신 여기에 모아 두세요.
602|장부는 들어온 돈과 나간 돈을 더해서 진짜 이익을 보여 줘요.
603|{p}으로 영수증, 메뉴, 가격표를 몇 번만 클릭해서 만들어요.
604|캘린더 열기
605|가격과 이익 열기
606|할 일 열기
607|장부 열기
608|찾기 열기
609|영수증과 메뉴 열기
610|주의! {o} {n}개가 늦었어요.
611|오늘 마감인 {o}이 {n}개 있어요. 할 수 있어요!
612|내일 마감인 {o}이 {n}개예요. 준비할 시간이에요!
613|오늘 할 일 목록에 {n}개가 있어요.
614|오늘 할 일 목록에 {n}개가 있어요.
615|완료된 {o} {n}개가 결제를 기다리고 있어요.
616|첫 {oa}을 추가하면 관리를 도와 드릴게요.
617|{p}을 추가하면 비용을 계산해 드릴게요.
618|{s} 구매 가격을 넣으면 장보기 목록을 만들어 드릴게요.
619|마지막 백업 이후 시간이 꽤 지났어요. 아무것도 잃지 않게 설정에서 백업하세요!
620|설정에서 비즈니스 사진을 추가하세요. 영수증에도 나와요!
621|사람을 클릭하면 그 사람의 {o}을 한곳에서 볼 수 있어요.
622|날짜를 클릭하고 추가를 눌러 일정이나 할 일을 넣으세요.
623|메뉴를 인쇄해서 다음 장터에 가져가세요.
624|이름, {pa}, 무엇이든 검색해 보세요.
625|쓴 돈을 나간 돈에 추가하면 실제로 남은 돈을 알 수 있어요.
626|정말 잘하고 있어요. 계속 힘내요!
627|지금은 급한 일이 없어요. 잘했어요!
628|모두 끝났어요! 간식 하나 먹어도 돼요.
629|오늘 목록이 비어 있어요.
630|위에서 할 일을 추가해서 시작하세요.
631|위에서 할 일을 추가하세요. 다가오는 {o}이 있으면 관련 할 일이 여기에 자동으로 나타나요.
632|아직 메모지가 없어요
633|원하는 색으로 쓰는 간단한 메모와 알림.
634|캘린더가 비어 있어요
635|목록이 아직 비어 있어요
636|살 것이 없어요
637|아직 계산된 가격이 없어요
638|무엇이든 찾기
639|아직 인쇄할 것이 없어요
640|완료: $1
641|미완료: $1
642|중요 표시: $1
643|표시 해제: $1
644|$1 삭제
645|$1 빼기
646|$1 수정
647|할 일: $1
648|메모지: $1
649|$1 구매, 장부에 $2 추가
650|$1 구매
651|$1 이제 $2
652|최근: $1
653|$2님의 $1 추가
654|$1님의 $2: $3 표시
655|$2님 $1 만들기
656|$1, $2 사기
657|$1 필요, $2 있음. $3님 것
658|$2 $3에 $1
659|$1 $2
660|$2님 $1
661|주의! $1님의 $2이(가) 늦었어요.
662|$1님의 $2은(는) 오늘 $3 마감이에요.
663|$1님의 $2은(는) 오늘 마감이에요.
664|잊지 마세요: $1님의 $2은(는) 내일 마감이에요.
665|오늘: $2 $1. 즐거운 시간 보내세요!
666|오늘: $1. 즐거운 시간 보내세요!
667|"$1"을(를) 중요로 표시했어요. 그리고 $2개 더 있어요.
668|"$1"을(를) 중요로 표시했어요.
669|다가오는 $3에 필요한 $1 외 $2개가 부족해요.
670|다가오는 $2에 필요한 $1이(가) 부족해요.
671|$1님의 $2은(는) 완료됐지만 아직 결제 전이에요.
672|$1은(는) 판매가보다 만드는 비용이 더 들어요. 고쳐 봐요!
673|$1은(는) 조금 더 받아도 돼요.
674|$1: $2 ($3)
675|$1로 돌아가기
676|$2에 $1개 추가, 가격 $3개 업데이트
677|$2에 $1개 추가
678|가격 $1개 업데이트
679|$2에 $1개 추가
680|$1개를 찾았어요. 이름, 양, 가격을 확인하고 틀린 건 고치세요. 원하지 않는 건 체크를 해제하세요.
681|$1, $2 글꼴
682|홈 베이커리: $1
683|청소: $1
684|$1 건너뛰기
685|$1 구매
686|아직 없어요. $1 같은 것을 추가해 보세요.
`;

// Tagalog
var LANG_TL = `
0|Lin
1|Lun
2|Mar
3|Miy
4|Huw
5|Biy
6|Sab
7|Araw Ko
8|Pinili para sa iyo
9|Kalendaryo
10|Mga gagawin
11|Presyo at kita
12|Talaan ng pera
13|Trabaho
14|Mga sticky note
15|Negosyo
16|{S} at pamimili
17|Paglago
18|Hanapin
19|Resibo at menu
20|Settings
21|Pera
22|Menu
23|Mga menu
24|Magandang umaga
25|Magandang hapon
26|Magandang gabi
27|Magandang umaga!
28|{o} na due ngayon
29|{oa} na due ngayon
30|gagawin ngayon
31|gagawin ngayon
32|naibayad sa iyo ngayong buwan
33|bibilhin
34|bibilhin
35|{n} {oa} ang late. I-tap para makita.
36|{n} {o} ang late. I-tap para makita.
37|Gagawin ngayon
38|Tingnan lahat
39|Ngayong linggo
40|event ngayon
41|event ngayon
42|Wala ngayong araw. {n} ang paparating.
43|Ang focus mo
44|Isara
45|Ipakita
46|Susunod na tip
47|Mga tip mula kay Pip
48|Pip
49|Ngayon
50|Bukas
51|Kahapon
52|Late
53|Walang petsa
54|Balang araw
55|Late, dapat noong {d}
56|{Oa} due {d}
57|{Oa} due {d} nang {t}
58|{n} araw na late
59|{n} araw na late
60|Due ngayon
61|Due bukas
62|Due bukas nang {t}
63|Due ngayon nang {t}
64|Due sa loob ng {n} araw
65|Due sa loob ng {n} araw nang {t}
66|Due {d}
67|Due {d} nang {t}
68|Dapat noong {d}
69|Dapat noong {d} nang {t}
70|{d} nang {t}
71|Markahan na mahalaga
72|Alisin ang marka
73|Burahin
74|Tapos
75|Hindi pa tapos
76|Magdagdag ng gagawin
77|Bagong gagawin
78|Ano ang kailangan mong gawin?
79|Bumili ng dagdag na harina
80|Mahalaga
81|Markahan para manatili sa itaas
82|Idagdag
83|Isulat kung ano ang kailangan mong gawin.
84|Burahin ang tapos na ({n})
85|{n} gagawin ngayon
86|{n} gagawin ngayon
87|Nabura ang {n} gagawin
88|Nabura ang {n} gagawin
89|Wala pa rito ngayon.
90|I-undo
91|Walang gagawin
92|Walang gagawin ngayon
93|Tapos na lahat!
94|Bagong note
95|Sumulat dito...
96|Sticky note
97|Ilabas sa screen mo
98|Kulay at burahin
99|Tingnan sa kalendaryo
100|Dilaw
101|Peach
102|Pink
103|Lavender
104|Asul
105|Mint
106|Lime
107|Buhangin
108|Pumili ng kahit anong kulay
109|Kulay
110|Sa kalendaryo: {d}
111|Burahin ang note
112|Idagdag sa kalendaryo
113|Buksan sa Mga sticky note
114|Ilipat sa ibang araw
115|Anong araw?
116|Alisin sa kalendaryo
117|I-save
118|Naidagdag sa kalendaryo sa {d}
119|Inalis sa kalendaryo
120|Nabura ang note
121|Pumili ng araw.
122|{n} note. Itapat ang mouse sa note para ilabas ito sa screen mo.
123|{n} note. Itapat ang mouse sa note para ilabas ito sa screen mo.
124|Mabilis na note at paalala, sa kahit anong kulay
125|Wala pang note. I-click ang + para magdagdag.
126|Hinarang ng browser mo ang window ng note. Payagan ang mga pop-up para sa site na ito at subukan ulit.
127|View ng kalendaryo
128|Araw
129|Linggo
130|Buwan
131|Taon
132|Nakaraang buwan
133|Susunod na buwan
134|Nakaraang araw
135|Susunod na araw
136|Nakaraang linggo
137|Susunod na linggo
138|Nakaraang taon
139|Susunod na taon
140|Idagdag
141|Tingnan ang araw na ito
142|Idagdag sa araw na ito
143|Idagdag sa {d}
144|Tingnan ang buwang ito
145|{n} plano ngayong linggo
146|{n} plano ngayong linggo
147|Wala pang plano ngayong linggo
148|{n} plano
149|{n} plano
150|Wala pang plano
151|May tuldok ang mga araw na may plano. Dilaw ang mga holiday.
152|Wala pang due sa {d}
153|Wala pang plano sa {d}
154|Walang plano. Libreng araw!
155|{n} {o} ang due sa {d}
156|{n} {oa} ang due sa {d}
157|{n} event sa {d}
158|{n} event sa {d}
159|Event
160|Gagawin
161|I-edit ang event
162|Bagong event
163|Ano ang mangyayari?
164|Anong oras?
165|(puwedeng laktawan)
166|Anong oras? (puwedeng laktawan)
167|Saan?
168|Parke sa Main Street
169|Burahin ang event na ito
170|Idagdag ang event
171|Nabura ang event
172|Isulat kung ano ang mangyayari.
173|Buong araw
174|Kahit anong oras
175|Farmers market
176|Ano ang idadagdag
177|Oras
178|Saan
179|Pamagat
180|(opsyonal)
181|Natapos
182|Bagong Taon
183|Araw ni Martin Luther King Jr.
184|Araw ng mga Puso
185|Araw ng mga Pangulo
186|Araw ni San Patricio
187|Pasko ng Pagkabuhay
188|Linggo ng Pagkabuhay
189|Lunes ng Pagkabuhay
190|Biyernes Santo
191|Huwebes Santo
192|Araw ng mga Ina
193|Memorial Day
194|Araw ng mga Ama
195|Juneteenth
196|Araw ng Kalayaan
197|Araw ng Paggawa
198|Araw ng mga Katutubo
199|Halloween
200|Araw ng mga Beterano
201|Thanksgiving
202|Black Friday
203|Small Business Saturday
204|Bisperas ng Pasko
205|Pasko
206|Pasko
207|Bisperas ng Bagong Taon
208|Boxing Day
209|Araw ng Pamilya
210|Victoria Day
211|Canada Day
212|Civic Holiday
213|Araw ng Paggawa
214|Araw ng Katotohanan at Pagkakasundo
215|Araw ng Paggunita
216|Araw ng Tatlong Hari
217|Araw ng Konstitusyon
218|Kaarawan ni Benito Juárez
219|Araw ng mga Bata
220|Cinco de Mayo
221|Araw ng mga Patay
222|Araw ng Rebolusyon
223|Araw ng Birhen ng Guadalupe
224|Australia Day
225|Anzac Day
226|Kaarawan ng Hari
227|Waitangi Day
228|Araw pagkatapos ng Bagong Taon
229|Bonfire Night
230|Linggo ng Paggunita
231|Araw ni San Esteban
232|Holiday sa unang bahagi ng Mayo
233|Spring holiday
234|Summer holiday
235|Holiday ni Santa Brigida
236|Holiday ng Mayo
237|Holiday ng Hunyo
238|Holiday ng Agosto
239|Holiday ng Oktubre
240|Ang mga bayad na {o} ay binibilang na pumasok na pera sa due date nila
241|Pumasok at lumabas na pera, bawat buwan
242|Pumasok na pera
243|Lumabas na pera
244|Natira sa iyo
245|Hinihintay na bayad
246|Huling {n} buwan
247|Pumasok: {m}
248|Lumabas: {m}
249|Ngayong buwan
250|Wala pa ngayong buwan.
251|Ano ang binili o binayaran mo
252|Kahon ng cake, bayad sa booth
253|Magkano
254|Anong araw
255|Burahin ito
256|Idagdag
257|Isulat kung magkano.
258|Para saan
259|Bake sale, tip
260|Tip
261|Wala pang naitalang pera
262|{n} bibilhin
263|{n} bibilhin
264|Idagdag mula sa larawan
265|Magdagdag ng {sa}
266|Listahan ng bibilhin
267|Para sa {o} mo sa susunod na {n} linggo, mga {m}
268|Para sa {o} mo sa susunod na {n} linggo
269|Kusang lalabas dito ang kailangan para sa {o} mo
270|Mga kailangan mong bilhin
271|Magdagdag ng bibilhin
272|Ang meron ka
273|Bawasan
274|Dagdagan
275|Nasa iyo na ang kailangan mo
276|Walang bibilhin ngayon.
277|Wala pang presyo
278|Sinusukat mo ito sa
279|Kapag binili mo
280|Makakakuha ka ng
281|Gaano karami ang makukuha mo
282|unit
283|sa halagang
284|Gaano karami ang meron ka ngayon
285|Magdagdag ng {sa}
286|Isulat ang pangalan nito.
287|tasa
288|piraso
289|stick
290|dosena
291|Pangalan
292|Dami
293|Unit
294|Presyo
295|I-edit ang {sa}
296|Harina
297|Asukal
298|Mag-screenshot ng resibo, online order, o listahan ng kailangan mo. Babasahin ito ng app at pupunuin ang mga pangalan, dami at presyo para sa iyo.
299|Mag-screenshot ng resibo, online order, o listahan ng kailangan mo. Babasahin ito ng app at pupunuin ang mga pangalan, dami at presyo para sa iyo.
300|I-paste ang screenshot dito
301|Pindutin ang
302|, mag-drop ng larawan, o i-click para pumili
303|Tip:
304|ay kumukuha ng screenshot
305|O i-type o i-paste ang listahan bilang text
306|Basahin ang listahang ito
307|Binabasa ang larawan mo...
308|Ilang segundo lang ito. Sa unang beses, ilo-load din ang reader mula sa internet.
309|Magdagdag ng linya
310|Subukan ang ibang larawan
311|Idagdag sa {S}
312|Mag-check ng kahit isang idadagdag.
313|Ia-update ang presyo
314|Ang larawan mo
315|Hindi mabasa ang larawan. Kailangan ng internet sa unang pagbasa ng larawan. Puwede mong i-type o i-paste ang listahan sa ibaba.
316|Walang nakitang item na may presyo sa larawang iyon. Subukan ang mas malinaw na screenshot, o ayusin ang text sa ibaba at i-click ang Basahin ang listahang ito.
317|Magkano talaga ang gastos sa bawat {pa}, at magkano dapat ang singil
318|Bayaran ang sarili
319|kada oras
320|Dagdag na kita
321|Oras mo
322|Totoong gastos
323|Singil mo
324|Mungkahi
325|Singilin ng {m} na lang
326|Wala pang presyo
327|Hindi pa naka-set
328|Kumikita ka ng {m}, medyo kulang sa goal mo
329|Kumikita ka ng {m} bawat beses
330|Nalulugi ka ng {m} bawat beses
331|Gamitin ang mungkahing presyo
332|Ang totoong gastos ay {s} mo kasama ang oras mo. Dinadagdagan ng mungkahing presyo ang kitang pinili mo, at ira-round up sa susunod na dolyar.
333|Idagdag muna ang {p} mo
334|Kapag naidagdag mo ang laman ng bawat isa, kakalkulahin ng page na ito ang gastos at tamang presyo.
335|Pumunta sa {P}
336|{n} bukas, {n} tapos
337|Mula sa Google Form
338|Magdagdag ng {oa}
339|+ Magdagdag ng {oa}
340|Bukas
341|Lahat
342|Bago
343|Ginagawa
344|Bayad na
345|I-edit
346|Status
347|Burahin ang tapos na {o} ({n})
348|Bumalik sa Araw Ko
349|I-edit ang {oa}
350|Pangalan ng {ca}
351|Telepono o email (opsyonal)
352|{n}-{n}-{n} o email
353|Ano ang gusto nila
354|Due date
355|Oras (opsyonal)
356|Walang oras
357|Dagdag na detalye
358|Flavor ng cake
359|Gusto mo bang magtanong ng iba pa sa bawat {oa}?
360|Mensahe sa cake
361|Allergy
362|Pickup o delivery
363|Iba pa
364|Notes (opsyonal)
365|Iba pang dapat tandaan
366|I-save ang mga pagbabago
367|Kanselahin
368|Burahin ang {oa} na ito
369|Bumalik sa {O}
370|Idagdag ang {oa}
371|Nabura ang {n} {o}
372|Kunin ang {o} mula sa Google Form mo
373|Lahat ng sumagot sa form mo ay lalabas dito bilang bagong {oa}. Puwede mo itong ulitin anumang oras. Hindi madodoble ang mga nakuha mo na.
374|I-download ang mga sagot
375|Buksan ang Google Form mo at i-click ang
376|Mga sagot
377|I-click ang
378|Tingnan sa Sheets
379|(o
380|I-link sa Sheets
381|sa unang beses).
382|Sa sheet, i-click ang
383|File
384|, tapos
385|Download
386|Piliin ang file na iyon
387|Pumili ng file
388|o i-drag dito
389|Sabihin sa app kung saan pupunta ang bawat sagot
390|Hinulaan namin ang bawat tanong. Palitan ang mukhang mali.
391|Piliin ang tanong na may pangalan ng {ca}.
392|Walang due ngayon
393|{n} tao
394|{n} tao
395|Magdagdag ng {ca}
396|Maghanap ng tao
397|Pinakabago
398|Pinakamaraming {o}
399|Pinakamalaking gastos
400|A hanggang Z
401|Wala pang telepono o email
402|kabuuan
403|Idagdag ang {ca}
404|Huwag na
405|Bumalik sa {C}
406|unang {oa}
407|Kanilang {o}
408|Lahat ng bumibili sa iyo, nasa iisang lugar
409|Wala pang {c}
410|Idagdag ang mga taong pinagtatrabahuhan mo, kasama ang telepono o email nila, para nasa iisang lugar sila.
411|Ilagay sa iisang lugar ang lahat ng pinagtatrabahuhan mo.
412|{n} {p}
413|Magdagdag ng {pa}
414|Nakakagawa ng {n}
415|{n} {s}
416|Gastos {m}
417|Walang presyo
418|Bumalik sa {P}
419|Singil mo
420|Ilan ang nagagawa
421|{n} cake, {n} cupcake
422|Ilang oras ang kailangan
423|Ano ang laman
424|Wala pang naidagdag. Pumili mula sa {s} mo sa ibaba, o magdagdag ng bago.
425|+ Magdagdag ng {sa}
426|Mga hakbang
427|(isa bawat linya)
428|Idagdag ang {pa}
429|Pangalanan muna bago i-save.
430|Gastos ng sangkap sa isang batch
431|Hanapin ang lahat sa app mo, o maghanap ng lugar malapit sa iyo
432|Hanapin ang {o}, {c}, {p}, gagawin
433|Hanapin ang {c}, {p}, gagawin
434|Hanapin
435|Malapit sa iyo
436|Mga farmers market
437|Bubuksan ang Google Maps
438|Mga craft fair
439|Tindahan ng {s}
440|Mga lugar na mabebentahan
441|Gumawa ng isa, tapos i-print o i-save bilang PDF
442|Resibo
443|Aling {oa}
444|I-print
445|Para kay
446|Petsa
447|Item
448|Kabuuan
449|Hindi pa bayad
450|Salamat sa {oa} mo!
451|Note sa ibaba
452|Mag-{oa} {n} araw bago. Mag-text sa {n}-{n}-{n}
453|Mag-order {n} araw bago. Mag-text sa {n}-{n}-{n}
454|Walang resulta
455|Palitan ang larawan
456|Alisin ang larawan
457|Mga negosyo mo
458|Bukas ngayon
459|Magdagdag ng ibang negosyo
460|Mananatiling naka-save ang iba mong negosyo
461|Negosyong ito
462|Pangalan ng negosyo at bansa
463|{B} · Estados Unidos
464|{B} · Canada
465|{B} · Mexico
466|{B} · United Kingdom
467|{B} · Ireland
468|{B} · Australia
469|{B} · New Zealand
470|{B} · Walang holiday
471|Uri ng negosyo at mga salita
472|Itsura
473|Kulay at font
474|Nagbabago ayon sa oras ng araw
475|Wika
476|English, Español, Français, 中文, Tiếng Việt, 한국어, Tagalog, Русский, 日本語, Português, Deutsch
477|Si Pip, ang katulong mo
478|Lumalabas na may tip tungkol sa negosyo mo
479|Mga layunin
480|Ano ang gusto mong matulungan
481|Wala pang napili
482|Backup
483|Mag-save ng backup
484|Wala ka pang na-save
485|Mag-load ng backup
486|Ibalik ang lahat mula sa backup file
487|Na-save ngayon
488|Na-save kahapon
489|Na-save {n} araw na ang nakalipas
490|Burahin ang {B}
491|Bumalik sa Settings
492|Buburahin nito ang lahat sa {B}. I-click ulit para burahin
493|Uri ng negosyo
494|Ang negosyo mo
495|Mga kulay
496|Anong klaseng negosyo ito?
497|Gumagamit ang Biz Studio ng tamang salita para sa negosyo mo, gaya ng {P} para sa bakery o Appointment para sa salon.
498|Home bakery
499|Pagkain at catering
500|Kandila at crafts
501|Sining at commission
502|Pananahi at damit
503|Kuko
504|Buhok
505|Pilikmata at makeup
506|Tutoring
507|Lessons sa musika at sayaw
508|Fitness coaching
509|Photography
510|Pag-aalaga ng alaga
511|Paglilinis
512|Hardin at bakuran
513|Party at events
514|Anong klaseng negosyo?
515|Pag-aayos ng bike, pag-groom ng aso, tindahan ng lemonade...
516|Sabihin kung ano ang ginagawa mo, at pupunuin namin ng tamang salita.
517|Ang binebenta o inaalok mo
518|Ang bina-book o ino-order ng tao
519|Mga taong katrabaho mo
520|Ang ginagamit mo sa trabaho
521|Tuloy
522|Ano ang pangalan ng negosyo mo?
523|Lalabas ang pangalang ito sa resibo, menu at itaas ng app mo. Puwede mo itong palitan mamaya.
524|Pangalan ng negosyo
525|Saan ka nakabase?
526|Estados Unidos
527|Canada
528|Mexico
529|United Kingdom
530|Ireland
531|Australia
532|New Zealand
533|Ibang lugar (walang holiday)
534|Ilalagay namin ang mga holiday ng bansa mo sa kalendaryo mo.
535|Profile picture (opsyonal)
536|Magdagdag ng larawan o logo
537|Kung lalaktawan, initials mo ang lalabas.
538|Bumalik
539|Isulat ang pangalan ng negosyo para magpatuloy.
540|Gawin mong sa iyo
541|Piliin ang mga kulay mo. May kasamang font ang bawat isa, at nagbabago ang buong app habang nagki-click ka.
542|Simple
543|Classic
544|Slate
545|Sage
546|Cherry
547|Matatamis
548|Strawberry
549|Matcha
550|Blueberry
551|Lemon
552|Caramel
553|Bubblegum
554|Kalikasan
555|Dagat
556|Gubat
557|Paglubog ng araw
558|Disyerto
559|Langit
560|Matapang
561|Kalawakan
562|Tropical
563|Retro
564|Bahaghari
565|Custom
566|Pangunahing kulay
567|Accent na kulay
568|Magbago ayon sa oras ng araw
569|Mainit sa umaga, maliwanag sa hapon at kalmado sa gabi.
570|Preview
571|{o} na due
572|ngayong linggo
573|Susunod
574|Chocolate chip cookies
575|Friendly
576|Bilugan
577|Masaya
578|Elegante
579|Moderno
580|Font
581|Ano ang gusto mong matulungan?
582|Pumili hangga't gusto mo. Uunahin ito ng Biz Studio at bibigyan ka ng mga tip.
583|Iba pa? (opsyonal)
584|Gusto kong magbenta sa farmers market ngayong summer
585|Laktawan muna
586|Tapusin ang setup
587|Nakakalimutan ko ang {o} o due date
588|Hindi ko alam kung paano magpresyo
589|Nauubusan ako ng {s}
590|Gusto kong palaguin ang negosyo ko
591|Kulang ako sa oras
592|Kalat-kalat ang impormasyon ko
593|Gusto kong subaybayan ang pera ko
594|Gusto kong magmukhang propesyonal ang negosyo ko
595|Tingnan ang kalendaryo tuwing umaga. Makakakuha ka ng dagdag na paalala bago mag-due ang {o}.
596|Idagdag ang presyo ng {s} sa Presyo at kita, at magmumungkahi ang Biz Studio ng tamang presyo.
597|Tingnan ang listahan ng {s} ilang araw bago ang abalang araw para makabili nang maaga.
598|Gamitin ang Hanapin para makahanap ng market at event na mabebentahan.
599|Inuuna ng listahan ng gagawin ang pinakaapurahan, kaya alam mo palagi ang susunod.
600|Ilagay dito ang lahat ng {o} at {c} mo imbes na sa text at notes.
601|Ilagay dito ang {c}, gagawin at events mo imbes na sa text at notes.
602|Sinusuma ng Talaan ng pera ang pumasok at lumabas, para makita mo ang totoong kita.
603|Gumawa ng resibo, menu at listahan ng presyo mula sa {p} mo sa ilang click lang.
604|Buksan ang kalendaryo
605|Buksan ang presyo at kita
606|Buksan ang mga gagawin
607|Buksan ang talaan ng pera
608|Buksan ang Hanapin
609|Buksan ang resibo at menu
610|Heads up! {n} {o} ang late.
611|May {n} {o} kang due ngayon. Kaya mo 'yan!
612|{n} {o} ang due bukas. Oras na para maghanda!
613|May {n} gagawin ka ngayon sa listahan mo.
614|May {n} gagawin ka ngayon sa listahan mo.
615|{n} tapos na {o} ang naghihintay ng bayad.
616|Idagdag ang una mong {oa} at tutulungan kitang bantayan ito.
617|Idagdag ang {p} mo para makalkula ko ang gastos.
618|Idagdag ang presyo ng {s} mo, at gagawin ko ang listahan ng bibilhin.
619|Matagal na mula sa huli mong backup. Mag-save ng isa sa Settings para walang mawala!
620|Magdagdag ng larawan ng negosyo mo sa Settings. Lalabas din ito sa resibo mo!
621|I-click ang isang tao para makita ang lahat ng {o} nila.
622|I-click ang isang araw, tapos ang Idagdag para maglagay ng event o gagawin.
623|Mag-print ng menu at dalhin sa susunod na market.
624|Subukang hanapin ang pangalan, {pa}, o kahit ano.
625|Idagdag ang ginastos mo sa Lumabas na pera, para alam mo kung magkano talaga ang natira.
626|Ang galing mo. Ituloy mo lang!
627|Walang apurahan ngayon. Magaling!
628|Tapos lahat! Mag-meryenda ka muna.
629|Wala sa listahan mo ngayon.
630|Magdagdag ng gagawin sa itaas para magsimula.
631|Magdagdag ng gagawin sa itaas. Kapag may paparating na {o}, kusang lalabas dito ang mga gagawin para sa mga ito.
632|Wala pang sticky note
633|Mabilis na note at paalala, sa kahit anong kulay.
634|Walang laman ang kalendaryo mo
635|Wala pang laman ang listahan mo
636|Walang bibilhin
637|Wala pang nakalkulang presyo
638|Hanapin ang kahit ano
639|Wala pang mapi-print
640|Tapos: $1
641|Hindi pa tapos: $1
642|Markahan na mahalaga: $1
643|Alisin ang marka: $1
644|Burahin ang $1
645|Alisin ang $1
646|I-edit ang $1
647|Gagawin: $1
648|Sticky note: $1
649|Binili ang $1, naidagdag ang $2 sa Talaan ng pera
650|Binili ang $1
651|$2 na ngayon ang $1
652|Huli: $1
653|Magdagdag ng $1 para kay $2
654|Ang $2 ni $1 ay minarkahang $3
655|Gumawa ng $1 para kay $2
656|$1, bumili ng $2
657|Kailangan ng $1, meron $2. Para kay $3
658|$1 para sa $2 $3
659|$1 nang $2
660|$1 para kay $2
661|Heads up! Late na ang $2 ni $1.
662|Due ngayon nang $3 ang $2 ni $1.
663|Due ngayon ang $2 ni $1.
664|Huwag kalimutan: due bukas ang $2 ni $1.
665|Ngayon: $1 nang $2. Mag-enjoy!
666|Ngayon: $1. Mag-enjoy!
667|Minarkahan mong mahalaga ang "$1". At $2 pa.
668|Minarkahan mong mahalaga ang "$1".
669|Paubos na ang $1 at $2 pa para sa paparating mong $3.
670|Paubos na ang $1 para sa paparating mong $2.
671|Tapos na ang $2 ni $1 pero hindi pa bayad.
672|Mas mahal gawin ang $1 mo kaysa sa singil mo. Ayusin natin!
673|Puwede kang maningil nang kaunti pa para sa $1 mo.
674|$1: $2 ($3)
675|Bumalik sa $1
676|Naidagdag ang $1 sa $2 at na-update ang $3 presyo
677|Naidagdag ang $1 sa $2
678|Na-update ang $1 presyo
679|Idagdag ang $1 sa $2
680|Nakakita ng $1. Tingnan ang mga pangalan, dami at presyo, at ayusin ang mukhang mali. Alisin ang check sa ayaw mo.
681|$1 na may $2 font
682|Home bakery: $1
683|Paglilinis: $1
684|Laktawan ang $1
685|Binili ang $1
686|Wala pa. Magdagdag ng gaya ng $1.
`;

// Russian
var LANG_RU = `
0|Вс
1|Пн
2|Вт
3|Ср
4|Чт
5|Пт
6|Сб
7|Мой день
8|Для тебя
9|Календарь
10|Список дел
11|Цены и прибыль
12|Учёт денег
13|Работа
14|Стикеры
15|Бизнес
16|{S} и покупки
17|Рост
18|Поиск
19|Чеки и меню
20|Настройки
21|Деньги
22|Меню
23|Меню
24|Доброе утро
25|Добрый день
26|Добрый вечер
27|Доброе утро!
28|{o} на сегодня
29|{oa} на сегодня
30|дел на сегодня
31|дело на сегодня
32|получено в этом месяце
33|нужно купить
34|нужно купить
35|{oa}: {n} опаздывает. Нажми, чтобы посмотреть.
36|{o}: {n} опаздывают. Нажми, чтобы посмотреть.
37|Дела на сегодня
38|Все
39|На этой неделе
40|событий сегодня
41|событие сегодня
42|На сегодня ничего. Впереди: {n}.
43|Твои цели
44|Закрыть
45|Покажи
46|Следующий совет
47|Советы от Pip
48|Pip
49|Сегодня
50|Завтра
51|Вчера
52|Опоздание
53|Без даты
54|Когда-нибудь
55|Опоздание, было на {d}
56|{Oa} к {d}
57|{Oa} к {d} в {t}
58|Опоздание {n} дн.
59|Опоздание {n} дн.
60|К сегодня
61|К завтра
62|К завтра в {t}
63|К сегодня в {t}
64|Через {n} дн.
65|Через {n} дн. в {t}
66|К {d}
67|К {d} в {t}
68|Было к {d}
69|Было к {d} в {t}
70|{d} в {t}
71|Отметить как важное
72|Снять отметку
73|Удалить
74|Готово
75|Не готово
76|Добавить дело
77|Новое дело
78|Что нужно сделать?
79|Купить ещё муки
80|Важное
81|Отметь, чтобы оно было наверху
82|Добавить дело
83|Напиши, что нужно сделать.
84|Убрать выполненные ({n})
85|Дел на сегодня: {n}
86|Дел на сегодня: {n}
87|Удалено дел: {n}
88|Удалено дел: {n}
89|Здесь пока ничего нет.
90|Отменить
91|Нет дел
92|Сегодня делать нечего
93|Всё готово!
94|Новый стикер
95|Пиши здесь...
96|Стикер
97|Вынести на экран
98|Цвет и удаление
99|Посмотреть в календаре
100|Жёлтый
101|Персиковый
102|Розовый
103|Лавандовый
104|Голубой
105|Мятный
106|Лаймовый
107|Песочный
108|Выбрать любой цвет
109|Цвет
110|В календаре: {d}
111|Удалить стикер
112|Добавить в календарь
113|Открыть в Стикерах
114|Перенести на другой день
115|Какой день?
116|Убрать из календаря
117|Сохранить
118|Добавлено в календарь на {d}
119|Убрано из календаря
120|Стикер удалён
121|Выбери день.
122|Стикеров: {n}. Наведи на стикер, чтобы вынести его на экран.
123|Стикеров: {n}. Наведи на стикер, чтобы вынести его на экран.
124|Быстрые заметки и напоминания любого цвета
125|Стикеров пока нет. Нажми +, чтобы добавить.
126|Браузер заблокировал окно стикера. Разреши всплывающие окна для этого сайта и попробуй ещё раз.
127|Вид календаря
128|День
129|Неделя
130|Месяц
131|Год
132|Прошлый месяц
133|Следующий месяц
134|Предыдущий день
135|Следующий день
136|Прошлая неделя
137|Следующая неделя
138|Прошлый год
139|Следующий год
140|Добавить
141|Открыть этот день
142|Добавить в этот день
143|Добавить на {d}
144|Открыть этот месяц
145|Запланировано на неделю: {n}
146|Запланировано на неделю: {n}
147|На этой неделе пока ничего не запланировано
148|Запланировано: {n}
149|Запланировано: {n}
150|Пока ничего не запланировано
151|Точки — дни с планами. Праздники выделены жёлтым.
152|На {d} пока ничего нет
153|На {d} пока ничего не запланировано
154|Ничего не запланировано. Свободный день!
155|{o} в {d}: {n}
156|{oa} в {d}: {n}
157|Событий в {d}: {n}
158|Событий в {d}: {n}
159|Событие
160|Дело
161|Изменить событие
162|Новое событие
163|Что будет?
164|Во сколько?
165|(можно пропустить)
166|Во сколько? (можно пропустить)
167|Где?
168|Парк на главной улице
169|Удалить это событие
170|Добавить событие
171|Событие удалено
172|Напиши, что будет.
173|Весь день
174|В любое время
175|Фермерский рынок
176|Что добавить
177|Время
178|Где
179|Название
180|(необязательно)
181|Отмечено
182|Новый год
183|День Мартина Лютера Кинга
184|День святого Валентина
185|День президентов
186|День святого Патрика
187|Пасха
188|Пасхальное воскресенье
189|Пасхальный понедельник
190|Страстная пятница
191|Великий четверг
192|День матери
193|День памяти
194|День отца
195|Джунтин
196|День независимости
197|День труда
198|День коренных народов
199|Хэллоуин
200|День ветеранов
201|День благодарения
202|Чёрная пятница
203|Суббота малого бизнеса
204|Сочельник
205|Рождество
206|Рождество
207|Канун Нового года
208|День подарков
209|День семьи
210|День Виктории
211|День Канады
212|Гражданский праздник
213|День труда
214|День правды и примирения
215|День памяти
216|День трёх королей
217|День Конституции
218|День рождения Бенито Хуареса
219|День детей
220|Синко де Майо
221|День мёртвых
222|День революции
223|День Девы Марии Гваделупской
224|День Австралии
225|День АНЗАК
226|День рождения короля
227|День Вайтанги
228|День после Нового года
229|Ночь костров
230|Поминальное воскресенье
231|День святого Стефана
232|Выходной в начале мая
233|Весенний выходной
234|Летний выходной
235|Выходной святой Бригитты
236|Майский выходной
237|Июньский выходной
238|Августовский выходной
239|Октябрьский выходной
240|Оплаченные {o} считаются доходом в день срока
241|Доходы и расходы по месяцам
242|Доходы
243|Расходы
244|Осталось у тебя
245|Ожидает оплаты
246|Последние {n} мес.
247|Доход: {m}
248|Расход: {m}
249|Этот месяц
250|В этом месяце пока ничего.
251|Что ты купил или оплатил
252|Коробки для торта, аренда места
253|Сколько
254|Какой день
255|Удалить это
256|Добавить
257|Напиши сумму.
258|На что
259|Ярмарка выпечки, чаевые
260|Чаевые
261|Денег пока не записано
262|Нужно купить: {n}
263|Нужно купить: {n}
264|Добавить с картинки
265|Добавить: {sa}
266|Список покупок
267|Для твоих {o} на ближайшие {n} нед., примерно {m}
268|Для твоих {o} на ближайшие {n} нед.
269|Всё нужное для {o} появится здесь само
270|Что нужно купить
271|Добавь, что купить
272|Что у тебя есть
273|Меньше
274|Больше
275|У тебя есть всё нужное
276|Сейчас ничего не нужно покупать.
277|Цены пока нет
278|Ты измеряешь это в
279|Когда покупаешь
280|Ты получаешь
281|Сколько получаешь
282|ед.
283|за
284|Сколько у тебя сейчас
285|Добавить: {sa}
286|Напиши название.
287|чашки
288|шт.
289|палочки
290|дюжина
291|Название
292|Количество
293|Единица
294|Цена
295|Изменить: {sa}
296|Мука
297|Сахар
298|Сделай скриншот чека, онлайн-заказа или списка нужного. Приложение прочитает его и заполнит названия, количество и цены за тебя.
299|Сделай скриншот чека, онлайн-заказа или списка нужного. Приложение прочитает его и заполнит названия, количество и цены за тебя.
300|Вставь скриншот сюда
301|Нажми
302|, перетащи картинку или нажми, чтобы выбрать
303|Совет:
304|делает скриншот
305|Или напиши или вставь список текстом
306|Прочитать этот список
307|Читаю картинку...
308|Это займёт несколько секунд. В первый раз программа чтения ещё загрузится из интернета.
309|Добавить строку
310|Попробовать другую картинку
311|Добавить в {S}
312|Отметь хотя бы одну позицию.
313|Обновит цену
314|Твоя картинка
315|Не удалось прочитать картинку. Для первого чтения нужен интернет. Можно напечатать или вставить список ниже.
316|На картинке не нашлось позиций с ценами. Попробуй более чёткий скриншот или исправь текст ниже и нажми «Прочитать этот список».
317|Сколько на самом деле стоит каждый {pa} и сколько за него брать
318|Плати себе
319|в час
320|Прибыль сверху
321|Твоё время
322|Настоящая стоимость
323|Твоя цена
324|Рекомендуем
325|Бери лучше {m}
326|Цена ещё не задана
327|Не задано
328|Ты зарабатываешь {m}, чуть меньше цели
329|Ты зарабатываешь {m} каждый раз
330|Ты теряешь {m} каждый раз
331|Взять рекомендуемую цену
332|Настоящая стоимость — это {s} плюс твоё время. Рекомендуемая цена добавляет выбранную прибыль и округляет вверх до целого доллара.
333|Сначала добавь {p}
334|Когда добавишь, что входит в каждый, эта страница посчитает стоимость и честную цену.
335|Перейти в {P}
336|Открыто: {n}, готово: {n}
337|Из Google Формы
338|Добавить: {oa}
339|+ Добавить: {oa}
340|Открытые
341|Все
342|Новый
343|В работе
344|Оплачено
345|Изменить
346|Статус
347|Убрать готовые {o} ({n})
348|Назад в Мой день
349|Изменить: {oa}
350|Имя ({ca})
351|Телефон или почта (необязательно)
352|{n}-{n}-{n} или почта
353|Что хотят
354|Срок
355|Время (необязательно)
356|Без времени
357|Доп. детали
358|Вкус торта
359|Хочешь спрашивать что-то ещё в каждом заказе ({oa})?
360|Надпись на торте
361|Аллергии
362|Самовывоз или доставка
363|Другое
364|Заметки (необязательно)
365|Что ещё запомнить
366|Сохранить
367|Отмена
368|Удалить: {oa}
369|Назад в {O}
370|Добавить: {oa}
371|Удалено ({o}): {n}
372|Загрузить {o} из Google Формы
373|Каждый, кто заполнил форму, появится здесь как новый {oa}. Можно повторить в любое время. Уже загруженные не добавятся дважды.
374|Скачай ответы
375|Открой Google Форму и нажми
376|Ответы
377|Нажми
378|Открыть в Таблицах
379|(или
380|Связать с Таблицами
381|в первый раз).
382|В таблице нажми
383|Файл
384|, затем
385|Скачать
386|Выбери этот файл
387|Выбери файл
388|или перетащи сюда
389|Подскажи приложению, куда идёт каждый ответ
390|Мы угадали каждый вопрос. Исправь, если что-то не так.
391|Выбери вопрос, где имя ({ca}).
392|На сегодня ничего
393|{n} чел.
394|{n} чел.
395|Добавить: {ca}
396|Найти человека
397|Сначала новые
398|Больше всего {o}
399|Больше всех потратили
400|От А до Я
401|Пока нет телефона или почты
402|всего
403|Добавить: {ca}
404|Не надо
405|Назад в {C}
406|первый {oa}
407|Их {o}
408|Все, кто у тебя покупает, в одном месте
409|Пока нет: {c}
410|Добавь людей, на которых работаешь, с телефоном или почтой, чтобы все были в одном месте.
411|Держи всех, на кого работаешь, в одном месте.
412|{p}: {n}
413|Добавить: {pa}
414|Выход: {n}
415|{s}: {n}
416|Стоит {m}
417|Без цены
418|Назад в {P}
419|Твоя цена
420|Сколько выходит
421|{n} торт, {n} капкейков
422|Сколько часов занимает
423|Что входит
424|Пока ничего не добавлено. Выбери из {s} ниже или добавь новое.
425|+ Добавить: {sa}
426|Шаги
427|(по одному в строке)
428|Добавить: {pa}
429|Дай название, чтобы сохранить.
430|Ингредиенты на одну партию стоят
431|Ищи всё в приложении или находи места рядом
432|Искать {o}, {c}, {p}, дела
433|Искать {c}, {p}, дела
434|Искать
435|Рядом с тобой
436|Фермерские рынки
437|Открывает Google Карты
438|Ярмарки ремёсел
439|Магазины: {s}
440|Где продавать
441|Создай, а потом распечатай или сохрани в PDF
442|Чек
443|Какой {oa}
444|Печать
445|Для
446|Дата
447|Позиция
448|Итого
449|Ещё не оплачено
450|Спасибо за заказ ({oa})!
451|Заметка внизу
452|{Oa} за {n} дн. Пиши на {n}-{n}-{n}
453|Заказывай за {n} дн. Пиши на {n}-{n}-{n}
454|Ничего не найдено
455|Сменить картинку
456|Убрать картинку
457|Твои бизнесы
458|Открыт сейчас
459|Добавить ещё бизнес
460|Другие бизнесы останутся сохранёнными
461|Этот бизнес
462|Название бизнеса и страна
463|{B} · США
464|{B} · Канада
465|{B} · Мексика
466|{B} · Великобритания
467|{B} · Ирландия
468|{B} · Австралия
469|{B} · Новая Зеландия
470|{B} · Без праздников
471|Тип бизнеса и слова
472|Вид
473|Цвета и шрифт
474|Меняется в течение дня
475|Язык
476|English, Español, Français, 中文, Tiếng Việt, 한국어, Tagalog, Русский, 日本語, Português, Deutsch
477|Pip, твой помощник
478|Появляется с советами о твоём бизнесе
479|Цели
480|С чем тебе помочь
481|Пока ничего не выбрано
482|Резервная копия
483|Сохранить копию
484|Ты ещё не сохранял копию
485|Загрузить копию
486|Вернуть всё из файла копии
487|Сохранено сегодня
488|Сохранено вчера
489|Сохранено {n} дн. назад
490|Удалить {B}
491|Назад в Настройки
492|Это удалит всё в {B}. Нажми ещё раз, чтобы удалить
493|Тип бизнеса
494|Твой бизнес
495|Цвета
496|Какой у тебя бизнес?
497|Biz Studio использует подходящие слова, например {P} для пекарни или Записи для салона.
498|Домашняя выпечка
499|Еда и кейтеринг
500|Свечи и рукоделие
501|Искусство и заказы
502|Шитьё и одежда
503|Ногти
504|Волосы
505|Ресницы и макияж
506|Репетиторство
507|Уроки музыки и танцев
508|Фитнес-тренировки
509|Фотография
510|Уход за животными
511|Уборка
512|Двор и сад
513|Праздники и события
514|Какой бизнес?
515|Ремонт велосипедов, груминг собак, лимонадная лавка...
516|Расскажи, чем занимаешься, и мы подберём подходящие слова.
517|Что ты продаёшь или предлагаешь
518|Что люди бронируют или заказывают
519|Люди, с которыми ты работаешь
520|Чем ты пользуешься в работе
521|Далее
522|Как называется твой бизнес?
523|Это название будет на чеках, в меню и вверху приложения. Его можно поменять позже.
524|Название бизнеса
525|Где ты находишься?
526|США
527|Канада
528|Мексика
529|Великобритания
530|Ирландия
531|Австралия
532|Новая Зеландия
533|Другое место (без праздников)
534|Мы добавим праздники твоей страны в календарь.
535|Фото профиля (необязательно)
536|Добавить картинку или логотип
537|Если пропустить, будут показаны твои инициалы.
538|Назад
539|Напиши название бизнеса, чтобы продолжить.
540|Сделай по-своему
541|Выбери цвета. У каждого свой шрифт, и всё приложение меняется при нажатии.
542|Простые
543|Классика
544|Сланец
545|Шалфей
546|Вишня
547|Сладости
548|Клубника
549|Матча
550|Черника
551|Лимон
552|Карамель
553|Жвачка
554|Природа
555|Океан
556|Лес
557|Закат
558|Пустыня
559|Небо
560|Яркие
561|Галактика
562|Тропики
563|Ретро
564|Радуга
565|Свои
566|Основной цвет
567|Акцентный цвет
568|Менять в течение дня
569|Тёплые утром, яркие днём и спокойные вечером.
570|Предпросмотр
571|{o} к сроку
572|на этой неделе
573|Дальше
574|Печенье с шоколадной крошкой
575|Дружелюбный
576|Округлый
577|Игривый
578|Элегантный
579|Современный
580|Шрифт
581|С чем тебе помочь?
582|Выбирай сколько хочешь. Biz Studio поставит это на первое место и даст советы.
583|Что-то ещё? (необязательно)
584|Хочу продавать на фермерском рынке этим летом
585|Пропустить пока
586|Завершить
587|Я забываю {o} или сроки
588|Не знаю, сколько брать за работу
589|У меня заканчиваются {s}
590|Хочу развивать бизнес
591|Мне не хватает времени
592|Моя информация разбросана повсюду
593|Хочу следить за деньгами
594|Хочу, чтобы мой бизнес выглядел профессионально
595|Проверяй календарь каждое утро. Перед сроком {o} будут дополнительные напоминания.
596|Добавь, сколько платишь за {s}, в «Цены и прибыль», и Biz Studio предложит честные цены.
597|Смотри список ({s}) за несколько дней до загруженных дней, чтобы купить заранее.
598|Используй Поиск, чтобы найти рынки и события, где можно продавать.
599|Список дел ставит самое срочное первым, поэтому ты всегда знаешь, что делать дальше.
600|Храни все {o} и {c} здесь, а не в сообщениях и заметках.
601|Храни {c}, дела и события здесь, а не в сообщениях и заметках.
602|Учёт денег складывает доходы и расходы, чтобы ты видел настоящую прибыль.
603|Делай чеки, меню и прайс-листы из своих {p} в пару кликов.
604|Открыть календарь
605|Открыть цены и прибыль
606|Открыть список дел
607|Открыть учёт денег
608|Открыть поиск
609|Открыть чеки и меню
610|Внимание! Опаздывают: {n} ({o}).
611|Сегодня у тебя {n} ({o}). Ты справишься!
612|Завтра срок: {n} ({o}). Пора готовиться!
613|Сегодня в твоём списке дел: {n}.
614|Сегодня в твоём списке дел: {n}.
615|Готовы, но не оплачены: {n} ({o}).
616|Добавь первый {oa}, и я помогу за ним следить.
617|Добавь {p}, чтобы я посчитал, во сколько они тебе обходятся.
618|Добавь, сколько платишь за {s}, и я составлю список покупок.
619|Давно не было резервной копии. Сохрани её в Настройках, чтобы ничего не потерять!
620|Добавь картинку для бизнеса в Настройках. Она будет и на чеках!
621|Нажми на человека, чтобы увидеть все его {o}.
622|Нажми на день, потом «Добавить», чтобы поставить событие или дело.
623|Распечатай меню и возьми его на следующий рынок.
624|Попробуй найти имя, {pa} или что угодно.
625|Записывай траты в «Расходы», чтобы знать, сколько у тебя реально осталось.
626|У тебя отлично получается. Так держать!
627|Сейчас ничего срочного. Хорошая работа!
628|Всё сделано! Можно и перекусить.
629|На сегодня в списке ничего нет.
630|Добавь дело выше, чтобы начать.
631|Добавь дело выше. Когда появятся ближайшие {o}, дела для них появятся здесь сами.
632|Стикеров пока нет
633|Быстрые заметки и напоминания любого цвета.
634|Календарь пуст
635|Список пока пуст
636|Нечего покупать
637|Цены ещё не посчитаны
638|Найди что угодно
639|Пока нечего печатать
640|Готово: $1
641|Не готово: $1
642|Отметить как важное: $1
643|Снять отметку: $1
644|Удалить: $1
645|Убрать: $1
646|Изменить: $1
647|Дело: $1
648|Стикер: $1
649|Куплено: $1, $2 добавлено в Учёт денег
650|Куплено: $1
651|$1 теперь стоит $2
652|Последний: $1
653|Добавить $1 для $2
654|$2 ($1) отмечен: $3
655|Сделать $1 для $2
656|$1, купить $2
657|Нужно $1, есть $2. Для $3
658|$1 за $2 $3
659|$1 в $2
660|$1 для $2
661|Внимание! $2 ($1) опаздывает.
662|$2 ($1) — сегодня в $3.
663|$2 ($1) — сегодня.
664|Не забудь: $2 ($1) — завтра.
665|Сегодня: $1 в $2. Хорошо провести время!
666|Сегодня: $1. Хорошо провести время!
667|Ты отметил «$1» как важное. И ещё $2.
668|Ты отметил «$1» как важное.
669|Заканчивается $1 и ещё $2 для ближайших $3.
670|Заканчивается $1 для ближайших $2.
671|$2 ($1) готов, но ещё не оплачен.
672|$1 обходится дороже, чем ты берёшь. Давай исправим!
673|За $1 можно брать чуть больше.
674|$1: $2 ($3)
675|Назад в $1
676|Добавлено в $2: $1, обновлено цен: $3
677|Добавлено в $2: $1
678|Обновлено цен: $1
679|Добавить $1 в $2
680|Найдено: $1. Проверь названия, количество и цены и исправь ошибки. Сними отметку с ненужного.
681|$1, шрифт $2
682|Домашняя выпечка: $1
683|Уборка: $1
684|Пропустить: $1
685|Куплено: $1
686|Пока ничего. Добавь, например, $1.
`;

// Japanese
var LANG_JA = `
0|日
1|月
2|火
3|水
4|木
5|金
6|土
7|今日の予定
8|おすすめ
9|カレンダー
10|やることリスト
11|価格と利益
12|帳簿
13|仕事
14|付箋
15|ビジネス
16|{S}と買い物
17|成長
18|検索
19|レシートとメニュー
20|設定
21|お金
22|メニュー
23|メニュー
24|おはようございます
25|こんにちは
26|こんばんは
27|おはようございます！
28|今日が期限の{o}
29|今日が期限の{oa}
30|今日のタスク
31|今日のタスク
32|今月の入金
33|買うもの
34|買うもの
35|{oa}が{n}件遅れています。タップして確認。
36|{o}が{n}件遅れています。タップして確認。
37|今日やること
38|すべて見る
39|今週の予定
40|今日のイベント
41|今日のイベント
42|今日は予定なし。この先{n}件あります。
43|あなたの目標
44|閉じる
45|見せて
46|次のヒント
47|Pipのヒント
48|Pip
49|今日
50|明日
51|昨日
52|遅れ
53|日付なし
54|いつか
55|遅れ、期限は{d}
56|{Oa}の期限 {d}
57|{Oa}の期限 {d} {t}
58|{n}日遅れ
59|{n}日遅れ
60|今日が期限
61|明日が期限
62|明日 {t} が期限
63|今日 {t} が期限
64|あと{n}日
65|あと{n}日、{t}
66|期限 {d}
67|期限 {d} {t}
68|期限は{d}でした
69|期限は{d} {t}でした
70|{d} {t}
71|重要にする
72|重要を外す
73|削除
74|完了
75|未完了
76|タスクを追加
77|新しいタスク
78|何をする必要がありますか？
79|小麦粉をもっと買う
80|重要
81|印をつけると一番上に残ります
82|タスクを追加
83|やることを入力してください。
84|完了したものを消す（{n}）
85|今日やること{n}件
86|今日やること{n}件
87|{n}件のタスクを消しました
88|{n}件のタスクを消しました
89|今は何もありません。
90|元に戻す
91|タスクなし
92|今日やることはありません
93|全部完了！
94|新しい付箋
95|ここに書く...
96|付箋
97|画面に出す
98|色と削除
99|カレンダーで見る
100|イエロー
101|ピーチ
102|ピンク
103|ラベンダー
104|ブルー
105|ミント
106|ライム
107|サンド
108|好きな色を選ぶ
109|色
110|カレンダー：{d}
111|付箋を削除
112|カレンダーに追加
113|付箋で開く
114|別の日に移す
115|何日？
116|カレンダーから外す
117|保存
118|{d}のカレンダーに追加しました
119|カレンダーから外しました
120|付箋を削除しました
121|日付を選んでください。
122|付箋{n}枚。付箋にマウスを合わせると画面に出せます。
123|付箋{n}枚。付箋にマウスを合わせると画面に出せます。
124|好きな色で、すばやくメモやリマインダー
125|まだ付箋がありません。＋を押して追加。
126|ブラウザが付箋のウィンドウをブロックしました。このサイトのポップアップを許可して、もう一度お試しください。
127|カレンダー表示
128|日
129|週
130|月
131|年
132|前の月
133|次の月
134|前の日
135|次の日
136|前の週
137|次の週
138|前の年
139|次の年
140|追加
141|この日を見る
142|この日に追加
143|{d}に追加
144|この月を見る
145|今週の予定{n}件
146|今週の予定{n}件
147|今週はまだ予定がありません
148|予定{n}件
149|予定{n}件
150|まだ予定がありません
151|点は予定がある日です。祝日は黄色です。
152|{d}はまだ期限のものがありません
153|{d}はまだ予定がありません
154|予定なし。自由な一日！
155|{d}の{o} {n}件
156|{d}の{oa} {n}件
157|{d}のイベント{n}件
158|{d}のイベント{n}件
159|イベント
160|タスク
161|イベントを編集
162|新しいイベント
163|何がありますか？
164|何時？
165|（なくても大丈夫）
166|何時？（なくても大丈夫）
167|どこで？
168|メインストリート公園
169|このイベントを削除
170|イベントを追加
171|イベントを削除しました
172|何があるか入力してください。
173|終日
174|いつでも
175|ファーマーズマーケット
176|追加するもの
177|時間
178|場所
179|タイトル
180|（任意）
181|チェックしました
182|元日
183|キング牧師記念日
184|バレンタインデー
185|大統領の日
186|聖パトリックの祝日
187|イースター
188|イースターの日曜日
189|イースターの月曜日
190|聖金曜日
191|聖木曜日
192|母の日
193|戦没者追悼記念日
194|父の日
195|ジューンティーンス
196|独立記念日
197|労働者の日
198|先住民の日
199|ハロウィン
200|退役軍人の日
201|感謝祭
202|ブラックフライデー
203|スモールビジネス・サタデー
204|クリスマスイブ
205|クリスマス
206|クリスマス
207|大みそか
208|ボクシングデー
209|家族の日
210|ビクトリア・デー
211|カナダ・デー
212|シビック・ホリデー
213|労働者の日
214|真実と和解の日
215|リメンブランス・デー
216|公現祭
217|憲法記念日
218|ベニート・フアレス生誕記念日
219|こどもの日
220|シンコ・デ・マヨ
221|死者の日
222|革命記念日
223|グアダルーペの聖母の日
224|オーストラリア・デー
225|アンザック・デー
226|国王誕生日
227|ワイタンギ・デー
228|元日の翌日
229|ボンファイア・ナイト
230|リメンブランス・サンデー
231|聖ステファノの日
232|5月初めの祝日
233|春の祝日
234|夏の祝日
235|聖ブリジッドの日の祝日
236|5月の祝日
237|6月の祝日
238|8月の祝日
239|10月の祝日
240|支払い済みの{o}は期限の日に入金として数えます
241|月ごとの入金と出金
242|入金
243|出金
244|手元に残ったお金
245|入金待ち
246|直近{n}か月
247|入金：{m}
248|出金：{m}
249|今月
250|今月はまだありません。
251|買ったもの・支払ったもの
252|ケーキの箱、出店料
253|金額
254|日付
255|これを削除
256|追加する
257|金額を入力してください。
258|何のため
259|ベイクセール、チップ
260|チップ
261|まだお金の記録がありません
262|買うもの{n}件
263|買うもの{n}件
264|画像から追加
265|{sa}を追加
266|買い物リスト
267|今後{n}週間の{o}用、約{m}
268|今後{n}週間の{o}用
269|{o}に必要なものは自動でここに表示されます
270|買う必要があるもの
271|買うものを追加
272|持っているもの
273|減らす
274|増やす
275|必要なものはそろっています
276|今は買うものはありません。
277|まだ価格がありません
278|単位
279|買うとき
280|入る量
281|入る量
282|単位
283|で
284|今ある量
285|{sa}を追加
286|名前を入力してください。
287|カップ
288|個
289|本
290|ダース
291|名前
292|量
293|単位
294|価格
295|{sa}を編集
296|小麦粉
297|砂糖
298|レシート、ネット注文、必要なもののリストのスクリーンショットを撮ってください。アプリが読み取って、名前・量・価格を入力します。
299|レシート、ネット注文、必要なもののリストのスクリーンショットを撮ってください。アプリが読み取って、名前・量・価格を入力します。
300|ここにスクリーンショットを貼り付け
301|押す：
302|、画像をドロップ、またはクリックして選択
303|ヒント：
304|でスクリーンショット
305|またはリストを文字で入力・貼り付け
306|このリストを読み取る
307|画像を読み取り中...
308|数秒かかることがあります。初回は読み取りツールもインターネットから読み込みます。
309|行を追加
310|別の画像を試す
311|{S}に追加
312|追加するものを1つ以上チェックしてください。
313|価格を更新します
314|あなたの画像
315|画像を読み取れませんでした。初回の読み取りにはインターネットが必要です。下にリストを入力または貼り付けることもできます。
316|その画像には価格付きの項目が見つかりませんでした。もっと鮮明なスクリーンショットを試すか、下の文字を直して「このリストを読み取る」を押してください。
317|各{pa}に本当にかかる費用と、いくらで売るか
318|自分の時給
319|1時間あたり
320|上乗せする利益
321|あなたの時間
322|本当の費用
323|売値
324|おすすめ価格
325|{m}にする
326|まだ価格がありません
327|未設定
328|利益は{m}、目標より少し下
329|毎回{m}の利益
330|毎回{m}の赤字
331|おすすめ価格を使う
332|本当の費用は{s}とあなたの時間の合計です。おすすめ価格は選んだ利益を足して、1ドル単位に切り上げます。
333|まず{p}を追加してください
334|それぞれに使うものを追加すると、このページで費用と適正価格を計算します。
335|{P}へ
336|進行中{n}件、完了{n}件
337|Googleフォームから
338|{oa}を追加
339|+ {oa}を追加
340|進行中
341|すべて
342|新規
343|作業中
344|支払い済み
345|編集
346|状況
347|完了した{o}を消す（{n}）
348|今日の予定に戻る
349|{oa}を編集
350|{ca}の名前
351|電話番号かメール（任意）
352|{n}-{n}-{n} またはメール
353|ご希望の内容
354|期限
355|時間（任意）
356|時間なし
357|追加の詳細
358|ケーキの味
359|{oa}ごとに他に聞きたいことはありますか？
360|ケーキのメッセージ
361|アレルギー
362|受け取りか配達か
363|その他
364|メモ（任意）
365|他に覚えておくこと
366|変更を保存
367|キャンセル
368|この{oa}を削除
369|{O}に戻る
370|{oa}を追加
371|{o}を{n}件削除しました
372|Googleフォームから{o}を取り込む
373|フォームに回答した人は、ここに新しい{oa}として表示されます。いつでもやり直せます。取り込み済みのものは二重に追加されません。
374|回答をダウンロード
375|Googleフォームを開いてクリック
376|回答
377|クリック
378|スプレッドシートで表示
379|（または
380|スプレッドシートにリンク
381|初回のみ）。
382|シートでクリック
383|ファイル
384|、次に
385|ダウンロード
386|そのファイルを選ぶ
387|ファイルを選ぶ
388|またはここにドラッグ
389|それぞれの回答の行き先を教えてください
390|各質問を推測しました。違うものは変更してください。
391|{ca}の名前が入っている質問を選んでください。
392|今日が期限のものはありません
393|{n}人
394|{n}人
395|{ca}を追加
396|人を探す
397|新しい順
398|{o}が多い順
399|利用額が多い順
400|名前順
401|電話番号・メールはまだありません
402|合計
403|{ca}を追加
404|やめる
405|{C}に戻る
406|最初の{oa}
407|この人の{o}
408|お客さん全員を一か所に
409|まだ{c}はいません
410|一緒に仕事をする人を、電話番号かメールと一緒に追加して、一か所にまとめましょう。
411|一緒に仕事をする人を一か所にまとめましょう。
412|{p} {n}件
413|{pa}を追加
414|{n}個できる
415|{s} {n}件
416|費用{m}
417|価格なし
418|{P}に戻る
419|売値
420|できる量
421|ケーキ{n}個、カップケーキ{n}個
422|かかる時間
423|使うもの
424|まだ何もありません。下の{s}から選ぶか、新しく追加してください。
425|+ {sa}を追加
426|手順
427|（1行に1つ）
428|{pa}を追加
429|保存するには名前をつけてください。
430|1回分の材料費
431|アプリ内のすべてを検索、または近くの場所を探す
432|{o}、{c}、{p}、タスクを検索
433|{c}、{p}、タスクを検索
434|検索
435|近くで探す
436|ファーマーズマーケット
437|Googleマップを開く
438|クラフトフェア
439|{s}のお店
440|売れる場所
441|作って、印刷するかPDFで保存
442|レシート
443|どの{oa}
444|印刷
445|宛先
446|日付
447|品目
448|合計
449|未払い
450|{oa}ありがとうございます！
451|下に入れるメモ
452|{n}日前までに{oa}を。SMS：{n}-{n}-{n}
453|{n}日前までにご注文を。SMS：{n}-{n}-{n}
454|結果なし
455|画像を変える
456|画像を外す
457|あなたのビジネス
458|使用中
459|別のビジネスを追加
460|他のビジネスはそのまま保存されます
461|このビジネス
462|ビジネス名と国
463|{B} · アメリカ
464|{B} · カナダ
465|{B} · メキシコ
466|{B} · イギリス
467|{B} · アイルランド
468|{B} · オーストラリア
469|{B} · ニュージーランド
470|{B} · 祝日なし
471|ビジネスの種類と言葉
472|見た目
473|色とフォント
474|時間帯で変わる
475|言語
476|English, Español, Français, 中文, Tiếng Việt, 한국어, Tagalog, Русский, 日本語, Português, Deutsch
477|お手伝いのPip
478|ビジネスのヒントを教えてくれます
479|目標
480|手伝ってほしいこと
481|まだ選んでいません
482|バックアップ
483|バックアップを保存
484|まだ保存していません
485|バックアップを読み込む
486|バックアップファイルからすべて戻す
487|今日保存しました
488|昨日保存しました
489|{n}日前に保存しました
490|{B}を削除
491|設定に戻る
492|{B}のすべてが削除されます。もう一度クリックすると削除します
493|ビジネスの種類
494|あなたのビジネス
495|色
496|どんなビジネスですか？
497|Biz Studioはビジネスに合った言葉を使います。たとえばパン屋なら{P}、サロンなら予約です。
498|自宅のお菓子づくり
499|料理とケータリング
500|キャンドルとクラフト
501|アートと依頼制作
502|裁縫と服
503|ネイル
504|ヘア
505|まつげとメイク
506|家庭教師
507|音楽とダンスのレッスン
508|フィットネス指導
509|写真
510|ペットのお世話
511|掃除
512|庭仕事
513|パーティーとイベント
514|どんなビジネス？
515|自転車修理、犬のトリミング、レモネード屋さん...
516|何をしているか教えてくれたら、合う言葉を入れます。
517|売っているもの・提供しているもの
518|予約や注文されるもの
519|一緒に仕事をする人
520|仕事に使うもの
521|続ける
522|ビジネスの名前は？
523|この名前はレシート、メニュー、アプリの上に表示されます。あとで変えられます。
524|ビジネス名
525|どこにいますか？
526|アメリカ
527|カナダ
528|メキシコ
529|イギリス
530|アイルランド
531|オーストラリア
532|ニュージーランド
533|その他の場所（祝日なし）
534|あなたの国の祝日をカレンダーに入れます。
535|プロフィール画像（任意）
536|画像かロゴを追加
537|スキップすると、イニシャルが表示されます。
538|戻る
539|続けるにはビジネス名を入力してください。
540|自分らしく
541|色を選んでください。それぞれに合うフォントがあり、クリックするとアプリ全体が変わります。
542|シンプル
543|クラシック
544|スレート
545|セージ
546|チェリー
547|スイーツ
548|いちご
549|抹茶
550|ブルーベリー
551|レモン
552|キャラメル
553|バブルガム
554|自然
555|オーシャン
556|フォレスト
557|夕焼け
558|砂漠
559|空
560|はっきり
561|ギャラクシー
562|トロピカル
563|レトロ
564|レインボー
565|カスタム
566|メインの色
567|アクセントの色
568|時間帯で変える
569|朝はあたたかく、昼は明るく、夜は落ち着いた色に。
570|プレビュー
571|期限の{o}
572|今週
573|次
574|チョコチップクッキー
575|フレンドリー
576|まるい
577|楽しい
578|エレガント
579|モダン
580|フォント
581|何を手伝ってほしいですか？
582|いくつでも選べます。Biz Studioがそれを先に表示して、ヒントを出します。
583|他には？（任意）
584|この夏ファーマーズマーケットで売りたい
585|今はスキップ
586|設定を完了
587|{o}や期限を忘れてしまう
588|値段の決め方がわからない
589|{s}がよく足りなくなる
590|ビジネスを大きくしたい
591|時間が足りない
592|情報があちこちに散らばっている
593|お金を管理したい
594|ビジネスをプロらしく見せたい
595|毎朝カレンダーを確認しましょう。{o}の期限前にリマインダーが増えます。
596|「価格と利益」に{s}の値段を入れると、Biz Studioが適正価格を提案します。
597|忙しい日の数日前に{s}のリストを見て、前もって買い物しましょう。
598|「検索」で近くのマーケットやイベントを見つけましょう。
599|やることリストは一番急ぐものが先に来るので、次に何をするかいつもわかります。
600|{o}と{c}を全部、メッセージやメモではなくここにまとめましょう。
601|{c}、タスク、イベントを、メッセージやメモではなくここにまとめましょう。
602|帳簿は入金と出金を合計して、本当の利益を見せてくれます。
603|{p}からレシート、メニュー、価格表を数クリックで作れます。
604|カレンダーを開く
605|価格と利益を開く
606|やることリストを開く
607|帳簿を開く
608|検索を開く
609|レシートとメニューを開く
610|注意！{o}が{n}件遅れています。
611|今日が期限の{o}が{n}件あります。がんばって！
612|明日が期限の{o}が{n}件。準備しましょう！
613|今日のやることリストに{n}件あります。
614|今日のやることリストに{n}件あります。
615|完了した{o}が{n}件、支払い待ちです。
616|最初の{oa}を追加すると、管理をお手伝いします。
617|{p}を追加すると、費用を計算します。
618|{s}の値段を入れると、買い物リストを作ります。
619|しばらくバックアップしていません。何もなくさないよう、設定で保存しましょう！
620|設定でビジネスの画像を追加しましょう。レシートにも入ります！
621|人をクリックすると、その人の{o}をまとめて見られます。
622|日付をクリックして「追加」を押すと、イベントやタスクを入れられます。
623|メニューを印刷して、次のマーケットに持っていきましょう。
624|名前、{pa}、なんでも検索してみましょう。
625|使ったお金を「出金」に入れると、本当に残ったお金がわかります。
626|とてもいい調子です。その調子！
627|今は急ぎのことはありません。おつかれさま！
628|全部終わり！おやつでもどうぞ。
629|今日のリストは空です。
630|上でタスクを追加して始めましょう。
631|上でタスクを追加してください。{o}が近づくと、そのタスクが自動でここに出ます。
632|まだ付箋がありません
633|好きな色で、すばやくメモやリマインダー。
634|カレンダーは空いています
635|リストはまだ空です
636|買うものはありません
637|まだ価格が計算されていません
638|なんでも探す
639|まだ印刷するものがありません
640|完了：$1
641|未完了：$1
642|重要にする：$1
643|重要を外す：$1
644|$1を削除
645|$1を外す
646|$1を編集
647|タスク：$1
648|付箋：$1
649|$1を購入、帳簿に$2を追加しました
650|$1を購入
651|$1は$2になりました
652|最後：$1
653|$2さんの$1を追加
654|$1さんの$2を「$3」にしました
655|$2さんの$1を作る
656|$1、$2買う
657|$1必要、$2あり。$3さん用
658|$2 $3で$1
659|$1 $2
660|$2さんの$1
661|注意！$1さんの$2が遅れています。
662|$1さんの$2は今日 $3 が期限です。
663|$1さんの$2は今日が期限です。
664|忘れずに：$1さんの$2は明日が期限です。
665|今日：$1 $2。楽しんで！
666|今日：$1。楽しんで！
667|「$1」を重要にしました。ほかに$2件あります。
668|「$1」を重要にしました。
669|今度の$3に使う$1など$2件が少なくなっています。
670|今度の$2に使う$1が少なくなっています。
671|$1さんの$2は完了しましたが、まだ支払われていません。
672|$1は売値より作る費用のほうが高いです。直しましょう！
673|$1はもう少し高くしても大丈夫です。
674|$1：$2（$3）
675|$1に戻る
676|$2に$1件追加、価格を$3件更新しました
677|$2に$1件追加しました
678|価格を$1件更新しました
679|$2に$1件追加
680|$1件見つかりました。名前・量・価格を確認して、違うところは直してください。いらないもののチェックを外してください。
681|$1、$2フォント
682|自宅のお菓子づくり：$1
683|掃除：$1
684|$1をスキップ
685|$1を購入
686|まだありません。$1などを追加しましょう。
`;

// Portuguese (Brazil)
var LANG_PT = `
0|Dom
1|Seg
2|Ter
3|Qua
4|Qui
5|Sex
6|Sáb
7|Meu dia
8|Escolhido para você
9|Calendário
10|Tarefas
11|Preços e lucro
12|Contas
13|Trabalho
14|Notas adesivas
15|Negócio
16|{S} e compras
17|Crescer
18|Buscar
19|Recibos e cardápios
20|Configurações
21|Dinheiro
22|Cardápio
23|Cardápios
24|Bom dia
25|Boa tarde
26|Boa noite
27|Bom dia!
28|{o} para hoje
29|{oa} para hoje
30|tarefas para hoje
31|tarefa para hoje
32|recebido este mês
33|coisas para comprar
34|coisa para comprar
35|{n} {oa} está atrasado. Toque para ver.
36|{n} {o} estão atrasados. Toque para ver.
37|Para fazer hoje
38|Ver tudo
39|Nesta semana
40|eventos hoje
41|evento hoje
42|Nada para hoje. {n} chegando.
43|Seu foco
44|Fechar
45|Me mostre
46|Próxima dica
47|Dicas do Pip
48|Pip
49|Hoje
50|Amanhã
51|Ontem
52|Atrasado
53|Sem data
54|Algum dia
55|Atrasado, era em {d}
56|{Oa} para {d}
57|{Oa} para {d} às {t}
58|{n} dias de atraso
59|{n} dia de atraso
60|Para hoje
61|Para amanhã
62|Para amanhã às {t}
63|Para hoje às {t}
64|Em {n} dias
65|Em {n} dias às {t}
66|Para {d}
67|Para {d} às {t}
68|Era para {d}
69|Era para {d} às {t}
70|{d} às {t}
71|Marcar como importante
72|Desmarcar
73|Excluir
74|Feito
75|Não feito
76|Adicionar tarefa
77|Nova tarefa
78|O que você precisa fazer?
79|Comprar mais farinha
80|Importante
81|Marque para ficar no topo
82|Adicionar tarefa
83|Escreva o que você precisa fazer.
84|Limpar feitas ({n})
85|{n} coisas para fazer hoje
86|{n} coisa para fazer hoje
87|{n} tarefas apagadas
88|{n} tarefa apagada
89|Nada por aqui agora.
90|Desfazer
91|Sem tarefas
92|Nada para fazer hoje
93|Tudo pronto!
94|Nova nota
95|Escreva aqui...
96|Nota adesiva
97|Levar para a tela
98|Cor e excluir
99|Ver no calendário
100|Amarelo
101|Pêssego
102|Rosa
103|Lavanda
104|Azul
105|Menta
106|Lima
107|Areia
108|Escolher qualquer cor
109|Cor
110|No calendário: {d}
111|Excluir nota
112|Adicionar ao calendário
113|Abrir em Notas adesivas
114|Mudar para outro dia
115|Que dia?
116|Tirar do calendário
117|Salvar
118|Adicionada ao calendário em {d}
119|Tirada do calendário
120|Nota excluída
121|Escolha um dia.
122|{n} nota. Passe o mouse sobre uma nota para levá-la à tela.
123|{n} notas. Passe o mouse sobre uma nota para levá-la à tela.
124|Notas e lembretes rápidos, da cor que você quiser
125|Ainda não há notas. Clique em + para adicionar.
126|Seu navegador bloqueou a janela da nota. Permita pop-ups para este site e tente de novo.
127|Visualização do calendário
128|Dia
129|Semana
130|Mês
131|Ano
132|Mês anterior
133|Próximo mês
134|Dia anterior
135|Próximo dia
136|Semana anterior
137|Próxima semana
138|Ano anterior
139|Próximo ano
140|Adicionar
141|Ver este dia
142|Adicionar a este dia
143|Adicionar em {d}
144|Ver este mês
145|{n} coisas planejadas nesta semana
146|{n} coisa planejada nesta semana
147|Nada planejado nesta semana ainda
148|{n} coisas planejadas
149|{n} coisa planejada
150|Nada planejado ainda
151|Os pontos mostram dias com planos. Os feriados ficam em amarelo.
152|Nada para {d} ainda
153|Nada planejado em {d} ainda
154|Nada planejado. Um dia livre!
155|{n} {o} em {d}
156|{n} {oa} em {d}
157|{n} evento em {d}
158|{n} eventos em {d}
159|Evento
160|Tarefa
161|Editar evento
162|Novo evento
163|O que vai acontecer?
164|Que horas?
165|(pode pular)
166|Que horas? (pode pular)
167|Onde?
168|Parque da rua principal
169|Excluir este evento
170|Adicionar evento
171|Evento excluído
172|Escreva o que vai acontecer.
173|O dia todo
174|Qualquer hora
175|Feira livre
176|O que adicionar
177|Hora
178|Onde
179|Título
180|(opcional)
181|Marcado como feito
182|Ano-Novo
183|Dia de Martin Luther King Jr.
184|Dia de São Valentim
185|Dia dos Presidentes
186|Dia de São Patrício
187|Páscoa
188|Domingo de Páscoa
189|Segunda-feira de Páscoa
190|Sexta-feira Santa
191|Quinta-feira Santa
192|Dia das Mães
193|Dia da Memória
194|Dia dos Pais
195|Juneteenth
196|Dia da Independência
197|Dia do Trabalho
198|Dia dos Povos Indígenas
199|Halloween
200|Dia dos Veteranos
201|Dia de Ação de Graças
202|Black Friday
203|Sábado dos Pequenos Negócios
204|Véspera de Natal
205|Natal
206|Natal
207|Véspera de Ano-Novo
208|Boxing Day
209|Dia da Família
210|Dia da Vitória
211|Dia do Canadá
212|Feriado Cívico
213|Dia do Trabalho
214|Dia da Verdade e Reconciliação
215|Dia da Lembrança
216|Dia de Reis
217|Dia da Constituição
218|Aniversário de Benito Juárez
219|Dia das Crianças
220|Cinco de Mayo
221|Dia dos Mortos
222|Dia da Revolução
223|Dia da Virgem de Guadalupe
224|Dia da Austrália
225|Dia de Anzac
226|Aniversário do Rei
227|Dia de Waitangi
228|Dia depois do Ano-Novo
229|Noite das Fogueiras
230|Domingo da Lembrança
231|Dia de Santo Estêvão
232|Feriado do início de maio
233|Feriado de primavera
234|Feriado de verão
235|Feriado de Santa Brígida
236|Feriado de maio
237|Feriado de junho
238|Feriado de agosto
239|Feriado de outubro
240|{o} pagos contam como dinheiro recebido na data deles
241|Dinheiro que entra e que sai, mês a mês
242|Dinheiro que entra
243|Dinheiro que sai
244|Você ficou com
245|Aguardando pagamento
246|Últimos {n} meses
247|Entrou: {m}
248|Saiu: {m}
249|Este mês
250|Nada este mês ainda.
251|O que você comprou ou pagou
252|Caixas de bolo, taxa da barraca
253|Quanto
254|Que dia
255|Excluir isto
256|Adicionar
257|Escreva quanto foi.
258|Para que foi
259|Venda de bolos, gorjetas
260|Gorjeta
261|Nenhum dinheiro registrado ainda
262|{n} coisas para comprar
263|{n} coisa para comprar
264|Adicionar por foto
265|Adicionar {sa}
266|Lista de compras
267|Para seus {o} das próximas {n} semanas, cerca de {m}
268|Para seus {o} das próximas {n} semanas
269|O que seus {o} precisam aparece aqui sozinho
270|Coisas que você precisa comprar
271|Adicione algo para comprar
272|O que você tem
273|Menos
274|Mais
275|Você tem o que precisa
276|Nada para comprar agora.
277|Sem preço ainda
278|Você mede em
279|Quando você compra
280|Você recebe
281|Quanto você recebe
282|unidades
283|por
284|Quanto você tem agora
285|Adicionar {sa}
286|Escreva o nome.
287|xícaras
288|unidade
289|tabletes
290|dúzia
291|Nome
292|Quantidade
293|Unidade
294|Preço
295|Editar {sa}
296|Farinha
297|Açúcar
298|Tire um print de um recibo, de um pedido on-line ou de uma lista do que você precisa. O app lê e preenche os nomes, quantidades e preços para você.
299|Tire um print de um recibo, de um pedido on-line ou de uma lista do que você precisa. O app lê e preenche os nomes, quantidades e preços para você.
300|Cole um print aqui
301|Pressione
302|, solte uma imagem ou clique para escolher
303|Dica:
304|tira um print
305|Ou digite ou cole a lista como texto
306|Ler esta lista
307|Lendo sua imagem...
308|Isso pode levar alguns segundos. Na primeira vez, o leitor também é carregado da internet.
309|Adicionar uma linha
310|Tentar outra imagem
311|Adicionar a {S}
312|Marque pelo menos um item para adicionar.
313|Atualiza o preço
314|Sua imagem
315|Não conseguimos ler a imagem. Ler imagens precisa de internet na primeira vez. Você pode digitar ou colar a lista abaixo.
316|Não encontramos itens com preço nessa imagem. Tente um print mais nítido ou corrija o texto abaixo e clique em Ler esta lista.
317|Quanto cada {pa} realmente custa e quanto cobrar
318|Seu salário
319|por hora
320|Lucro extra
321|Seu tempo
322|Custo real
323|Você cobra
324|Sugerido
325|Cobre {m}
326|Sem preço ainda
327|Não definido
328|Você ganha {m}, um pouco abaixo da meta
329|Você ganha {m} cada vez
330|Você perde {m} cada vez
331|Usar o preço sugerido
332|O custo real são seus {s} mais seu tempo. O preço sugerido soma o lucro escolhido, arredondado para cima até o próximo dólar.
333|Adicione seus {p} primeiro
334|Quando você adicionar o que vai em cada um, esta página calcula seus custos e um preço justo.
335|Ir para {P}
336|{n} abertos, {n} concluídos
337|Do Google Forms
338|Adicionar {oa}
339|+ Adicionar {oa}
340|Abertos
341|Todos
342|Novo
343|Em andamento
344|Pago
345|Editar
346|Status
347|Limpar {o} concluídos ({n})
348|Voltar para Meu dia
349|Editar {oa}
350|Nome do {ca}
351|Telefone ou e-mail (opcional)
352|{n}-{n}-{n} ou um e-mail
353|O que querem
354|Data de entrega
355|Hora (opcional)
356|Sem hora
357|Detalhes extras
358|Sabor do bolo
359|Quer perguntar mais alguma coisa em cada {oa}?
360|Mensagem no bolo
361|Alergias
362|Retirada ou entrega
363|Outra coisa
364|Notas (opcional)
365|Mais alguma coisa para lembrar
366|Salvar alterações
367|Cancelar
368|Excluir este {oa}
369|Voltar para {O}
370|Adicionar {oa}
371|{n} {o} excluídos
372|Trazer {o} do seu Google Forms
373|Cada pessoa que preencheu seu formulário aparece aqui como um novo {oa}. Você pode fazer isso quando quiser. Os que já foram trazidos não serão adicionados de novo.
374|Baixe suas respostas
375|Abra seu Google Forms e clique em
376|Respostas
377|Clique em
378|Ver no Planilhas
379|(ou
380|Vincular ao Planilhas
381|na primeira vez).
382|Na planilha, clique em
383|Arquivo
384|, depois
385|Fazer download
386|Escolha esse arquivo
387|Escolha seu arquivo
388|ou arraste para cá
389|Diga ao app onde vai cada resposta
390|Adivinhamos cada pergunta. Mude as que parecerem erradas.
391|Escolha a pergunta que tem o nome do {ca}.
392|Nada para hoje
393|{n} pessoa
394|{n} pessoas
395|Adicionar um {ca}
396|Encontrar alguém
397|Mais recentes
398|Mais {o}
399|Gastaram mais
400|De A a Z
401|Sem telefone ou e-mail ainda
402|total
403|Adicionar {ca}
404|Deixa pra lá
405|Voltar para {C}
406|primeiro {oa}
407|{O} dessa pessoa
408|Todo mundo que compra de você, em um só lugar
409|Nenhum {ca} ainda
410|Adicione as pessoas para quem você trabalha, com telefone ou e-mail, para ficarem todas em um só lugar.
411|Mantenha todas as pessoas para quem você trabalha em um só lugar.
412|{n} {p}
413|Adicionar {pa}
414|Rende {n}
415|{n} {s}
416|Custa {m}
417|Sem preço
418|Voltar para {P}
419|Quanto você cobra
420|Quanto rende
421|{n} bolo, {n} cupcakes
422|Horas que leva
423|O que vai nele
424|Nada adicionado ainda. Escolha entre seus {s} abaixo ou adicione um novo.
425|+ Adicionar {sa}
426|Passos
427|(um por linha)
428|Adicionar {pa}
429|Dê um nome para salvar.
430|Os ingredientes de uma fornada custam
431|Busque tudo no seu app ou encontre lugares perto de você
432|Buscar {o}, {c}, {p}, tarefas
433|Buscar {c}, {p}, tarefas
434|Buscar
435|Perto de você
436|Feiras livres
437|Abre o Google Maps
438|Feiras de artesanato
439|Lojas de {s}
440|Lugares para vender
441|Crie um e depois imprima ou salve como PDF
442|Recibo
443|Qual {oa}
444|Imprimir
445|Para
446|Data
447|Item
448|Total
449|Ainda não pago
450|Obrigado pelo seu {oa}!
451|Uma nota no final
452|{Oa} com {n} dias de antecedência. Mensagem para {n}-{n}-{n}
453|Peça com {n} dias de antecedência. Mensagem para {n}-{n}-{n}
454|Nenhum resultado
455|Trocar imagem
456|Remover imagem
457|Seus negócios
458|Aberto agora
459|Adicionar outro negócio
460|Seus outros negócios continuam salvos
461|Este negócio
462|Nome do negócio e país
463|{B} · Estados Unidos
464|{B} · Canadá
465|{B} · México
466|{B} · Reino Unido
467|{B} · Irlanda
468|{B} · Austrália
469|{B} · Nova Zelândia
470|{B} · Sem feriados
471|Tipo de negócio e palavras
472|Aparência
473|Cores e fonte
474|Muda com a hora do dia
475|Idioma
476|English, Español, Français, 中文, Tiếng Việt, 한국어, Tagalog, Русский, 日本語, Português, Deutsch
477|Pip, seu ajudante
478|Aparece com dicas sobre seu negócio
479|Metas
480|Com o que você quer ajuda
481|Nenhuma escolhida ainda
482|Backup
483|Salvar um backup
484|Você ainda não salvou nenhum
485|Carregar um backup
486|Recupere tudo de um arquivo de backup
487|Salvo hoje
488|Salvo ontem
489|Salvo há {n} dias
490|Excluir {B}
491|Voltar para Configurações
492|Isso apaga tudo em {B}. Clique de novo para excluir
493|Tipo de negócio
494|Seu negócio
495|Cores
496|Que tipo de negócio é?
497|O Biz Studio usa as palavras certas para seu negócio, como {P} para uma confeitaria ou Horários para um salão.
498|Confeitaria caseira
499|Refeições e bufê
500|Velas e artesanato
501|Arte e encomendas
502|Costura e roupas
503|Unhas
504|Cabelo
505|Cílios e maquiagem
506|Aulas particulares
507|Aulas de música e dança
508|Treino físico
509|Fotografia
510|Cuidado de pets
511|Limpeza
512|Jardinagem
513|Festas e eventos
514|Que tipo de negócio?
515|Conserto de bicicletas, banho e tosa, barraca de limonada...
516|Conte o que você faz e vamos preencher as palavras certas.
517|O que você vende ou oferece
518|O que as pessoas reservam ou pedem
519|As pessoas com quem você trabalha
520|O que você usa para trabalhar
521|Continuar
522|Qual é o nome do seu negócio?
523|Esse nome aparece nos seus recibos, cardápios e no topo do app. Você pode mudar depois.
524|Nome do negócio
525|Onde você está?
526|Estados Unidos
527|Canadá
528|México
529|Reino Unido
530|Irlanda
531|Austrália
532|Nova Zelândia
533|Outro lugar (sem feriados)
534|Vamos colocar os feriados do seu país no seu calendário.
535|Foto de perfil (opcional)
536|Adicionar uma imagem ou logo
537|Se pular, suas iniciais aparecem no lugar.
538|Voltar
539|Escreva o nome do negócio para continuar.
540|Deixe do seu jeito
541|Escolha suas cores. Cada uma vem com uma fonte combinando, e o app todo muda quando você clica.
542|Simples
543|Clássico
544|Ardósia
545|Sálvia
546|Cereja
547|Doces
548|Morango
549|Matcha
550|Mirtilo
551|Limão
552|Caramelo
553|Chiclete
554|Natureza
555|Oceano
556|Floresta
557|Pôr do sol
558|Deserto
559|Céu
560|Fortes
561|Galáxia
562|Tropical
563|Retrô
564|Arco-íris
565|Personalizado
566|Cor principal
567|Cor de destaque
568|Mudar com a hora do dia
569|Quente de manhã, claro à tarde e calmo à noite.
570|Prévia
571|{o} a entregar
572|nesta semana
573|A seguir
574|Cookies com gotas de chocolate
575|Amigável
576|Arredondada
577|Divertida
578|Elegante
579|Moderna
580|Fonte
581|Com o que você quer ajuda?
582|Escolha quantas quiser. O Biz Studio coloca essas primeiro e dá dicas para elas.
583|Mais alguma coisa? (opcional)
584|Quero vender na feira livre neste verão
585|Pular por agora
586|Concluir
587|Eu esqueço {o} ou datas de entrega
588|Não sei quanto cobrar pelo meu trabalho
589|Meus {s} acabam
590|Quero fazer meu negócio crescer
591|Não tenho tempo suficiente
592|Minhas informações estão espalhadas
593|Quero controlar meu dinheiro
594|Quero que meu negócio pareça profissional
595|Olhe seu calendário toda manhã. Você recebe lembretes extras antes dos seus {o}.
596|Adicione quanto você paga pelos {s} em Preços e lucro, e o Biz Studio vai sugerir preços justos.
597|Veja sua lista de {s} alguns dias antes dos dias cheios para comprar com antecedência.
598|Use o Buscar para descobrir feiras e eventos onde você pode vender.
599|Sua lista de tarefas coloca o mais urgente primeiro, então você sempre sabe o que fazer.
600|Guarde todos os seus {o} e {c} aqui em vez de em mensagens e notas.
601|Guarde seus {c}, tarefas e eventos aqui em vez de em mensagens e notas.
602|Contas soma o que entra e o que sai, para você ver seu lucro de verdade.
603|Faça recibos, cardápios e listas de preços com seus {p} em poucos cliques.
604|Abrir calendário
605|Abrir preços e lucro
606|Abrir tarefas
607|Abrir contas
608|Abrir busca
609|Abrir recibos e cardápios
610|Atenção! {n} {o} estão atrasados.
611|Você tem {n} {o} para hoje. Você consegue!
612|{n} {o} são para amanhã. Hora de se preparar!
613|Você tem {n} coisas na sua lista para hoje.
614|Você tem {n} coisa na sua lista para hoje.
615|{n} {o} concluídos esperam pagamento.
616|Adicione seu primeiro {oa} e eu ajudo você a acompanhar.
617|Adicione seus {p} para eu calcular quanto custam para você.
618|Adicione quanto você paga pelos {s} e eu faço sua lista de compras.
619|Faz tempo desde seu último backup. Salve um em Configurações para não perder nada!
620|Adicione uma imagem do seu negócio em Configurações. Ela aparece nos recibos também!
621|Clique em alguém para ver todos os {o} dessa pessoa.
622|Clique em um dia e depois em Adicionar para colocar um evento ou tarefa.
623|Imprima um cardápio e leve para a próxima feira.
624|Tente buscar um nome, um {pa} ou qualquer coisa.
625|Registre o que você gasta em Dinheiro que sai, para saber com quanto ficou de verdade.
626|Você está indo muito bem. Continue assim!
627|Nada urgente agora. Bom trabalho!
628|Tudo em dia! Que tal um lanchinho?
629|Nada na sua lista para hoje.
630|Adicione uma tarefa acima para começar.
631|Adicione uma tarefa acima. Quando tiver {o} chegando, as tarefas deles aparecem aqui sozinhas.
632|Nenhuma nota adesiva ainda
633|Notas e lembretes rápidos, da cor que você quiser.
634|Seu calendário está livre
635|Nada na sua lista ainda
636|Nada para comprar
637|Nenhum preço calculado ainda
638|Encontre qualquer coisa
639|Nada para imprimir ainda
640|Feito: $1
641|Não feito: $1
642|Marcar como importante: $1
643|Desmarcar: $1
644|Excluir $1
645|Remover $1
646|Editar $1
647|Tarefa: $1
648|Nota adesiva: $1
649|Você comprou $1, $2 adicionados às Contas
650|Você comprou $1
651|$1 agora custa $2
652|Último: $1
653|Adicionar $1 para $2
654|$2 de $1 marcado como $3
655|Fazer $1 para $2
656|$1, comprar $2
657|Precisa de $1, tem $2. Para $3
658|$1 por $2 $3
659|$1 às $2
660|$1 para $2
661|Atenção! $2 de $1 está atrasado.
662|$2 de $1 é para hoje às $3.
663|$2 de $1 é para hoje.
664|Não esqueça: $2 de $1 é para amanhã.
665|Hoje: $1 às $2. Divirta-se!
666|Hoje: $1. Divirta-se!
667|Você marcou "$1" como importante. E mais $2.
668|Você marcou "$1" como importante.
669|Está acabando $1 e mais $2 para seus próximos $3.
670|Está acabando $1 para seus próximos $2.
671|O $2 de $1 está pronto, mas ainda não foi pago.
672|Fazer $1 custa mais do que você cobra. Vamos resolver isso!
673|Você poderia cobrar um pouco mais por $1.
674|$1: $2 ($3)
675|Voltar para $1
676|$1 adicionados a $2 e $3 preços atualizados
677|$1 adicionados a $2
678|$1 preços atualizados
679|Adicionar $1 a $2
680|Encontramos $1. Confira os nomes, quantidades e preços e corrija o que parecer errado. Desmarque o que não quiser.
681|$1 com a fonte $2
682|Confeitaria caseira: $1
683|Limpeza: $1
684|Pular $1
685|Você comprou $1
686|Nada ainda. Adicione coisas como $1.
`;

// German
var LANG_DE = `
0|So
1|Mo
2|Di
3|Mi
4|Do
5|Fr
6|Sa
7|Mein Tag
8|Für dich ausgewählt
9|Kalender
10|To-do-Liste
11|Preise und Gewinn
12|Buchhaltung
13|Arbeit
14|Haftnotizen
15|Geschäft
16|{S} und Einkauf
17|Wachsen
18|Suche
19|Belege und Menüs
20|Einstellungen
21|Geld
22|Menü
23|Menüs
24|Guten Morgen
25|Guten Tag
26|Guten Abend
27|Guten Morgen!
28|{o} fällig heute
29|{oa} fällig heute
30|Aufgaben für heute
31|Aufgabe für heute
32|diesen Monat eingenommen
33|Dinge zu kaufen
34|Ding zu kaufen
35|{n} {oa} ist überfällig. Tippe zum Ansehen.
36|{n} {o} sind überfällig. Tippe zum Ansehen.
37|Heute zu tun
38|Alle ansehen
39|Diese Woche
40|Termine heute
41|Termin heute
42|Heute nichts. {n} stehen an.
43|Dein Fokus
44|Schließen
45|Zeig mir
46|Nächster Tipp
47|Tipps von Pip
48|Pip
49|Heute
50|Morgen
51|Gestern
52|Überfällig
53|Kein Datum
54|Irgendwann
55|Überfällig, war am {d}
56|{Oa} fällig {d}
57|{Oa} fällig {d} um {t}
58|{n} Tage überfällig
59|{n} Tag überfällig
60|Heute fällig
61|Morgen fällig
62|Morgen um {t} fällig
63|Heute um {t} fällig
64|In {n} Tagen fällig
65|In {n} Tagen um {t} fällig
66|Fällig {d}
67|Fällig {d} um {t}
68|War fällig {d}
69|War fällig {d} um {t}
70|{d} um {t}
71|Als wichtig markieren
72|Markierung entfernen
73|Löschen
74|Erledigt
75|Nicht erledigt
76|Aufgabe hinzufügen
77|Neue Aufgabe
78|Was musst du tun?
79|Mehr Mehl kaufen
80|Wichtig
81|Markiere sie, damit sie oben bleibt
82|Aufgabe hinzufügen
83|Schreib auf, was du tun musst.
84|Erledigte löschen ({n})
85|{n} Dinge heute zu tun
86|{n} Ding heute zu tun
87|{n} Aufgaben gelöscht
88|{n} Aufgabe gelöscht
89|Hier ist gerade nichts.
90|Rückgängig
91|Keine Aufgaben
92|Heute nichts zu tun
93|Alles erledigt!
94|Neue Notiz
95|Hier schreiben...
96|Haftnotiz
97|Auf den Bildschirm holen
98|Farbe und löschen
99|Im Kalender ansehen
100|Gelb
101|Pfirsich
102|Rosa
103|Lavendel
104|Blau
105|Minze
106|Limette
107|Sand
108|Beliebige Farbe wählen
109|Farbe
110|Im Kalender: {d}
111|Notiz löschen
112|Zum Kalender hinzufügen
113|In Haftnotizen öffnen
114|Auf einen anderen Tag legen
115|Welcher Tag?
116|Aus dem Kalender nehmen
117|Speichern
118|Am {d} zum Kalender hinzugefügt
119|Aus dem Kalender genommen
120|Notiz gelöscht
121|Wähle einen Tag.
122|{n} Notiz. Zeige auf eine Notiz, um sie auf den Bildschirm zu holen.
123|{n} Notizen. Zeige auf eine Notiz, um sie auf den Bildschirm zu holen.
124|Schnelle Notizen und Erinnerungen in jeder Farbe
125|Noch keine Notizen. Klicke auf +, um eine hinzuzufügen.
126|Dein Browser hat das Notizfenster blockiert. Erlaube Pop-ups für diese Seite und versuch es noch einmal.
127|Kalenderansicht
128|Tag
129|Woche
130|Monat
131|Jahr
132|Letzter Monat
133|Nächster Monat
134|Vortag
135|Nächster Tag
136|Letzte Woche
137|Nächste Woche
138|Letztes Jahr
139|Nächstes Jahr
140|Hinzufügen
141|Diesen Tag ansehen
142|Zu diesem Tag hinzufügen
143|Zum {d} hinzufügen
144|Diesen Monat ansehen
145|{n} Dinge diese Woche geplant
146|{n} Ding diese Woche geplant
147|Diese Woche noch nichts geplant
148|{n} Dinge geplant
149|{n} Ding geplant
150|Noch nichts geplant
151|Punkte zeigen Tage mit Plänen. Feiertage sind gelb.
152|Noch nichts fällig im {d}
153|Noch nichts geplant im {d}
154|Nichts geplant. Ein freier Tag!
155|{n} {o} fällig im {d}
156|{n} {oa} fällig im {d}
157|{n} Termin im {d}
158|{n} Termine im {d}
159|Termin
160|Aufgabe
161|Termin bearbeiten
162|Neuer Termin
163|Was ist los?
164|Um wie viel Uhr?
165|(kannst du weglassen)
166|Um wie viel Uhr? (kannst du weglassen)
167|Wo?
168|Park an der Hauptstraße
169|Diesen Termin löschen
170|Termin hinzufügen
171|Termin gelöscht
172|Schreib auf, was los ist.
173|Ganztägig
174|Jederzeit
175|Bauernmarkt
176|Was hinzufügen
177|Uhrzeit
178|Wo
179|Titel
180|(optional)
181|Abgehakt
182|Neujahr
183|Martin-Luther-King-Tag
184|Valentinstag
185|Presidents' Day
186|St. Patrick's Day
187|Ostern
188|Ostersonntag
189|Ostermontag
190|Karfreitag
191|Gründonnerstag
192|Muttertag
193|Memorial Day
194|Vatertag
195|Juneteenth
196|Unabhängigkeitstag
197|Tag der Arbeit
198|Tag der indigenen Völker
199|Halloween
200|Veteranentag
201|Thanksgiving
202|Black Friday
203|Small Business Saturday
204|Heiligabend
205|Weihnachten
206|Weihnachten
207|Silvester
208|Zweiter Weihnachtstag
209|Familientag
210|Victoria Day
211|Canada Day
212|Civic Holiday
213|Tag der Arbeit
214|Tag der Wahrheit und Versöhnung
215|Gedenktag
216|Heilige Drei Könige
217|Tag der Verfassung
218|Geburtstag von Benito Juárez
219|Kindertag
220|Cinco de Mayo
221|Tag der Toten
222|Tag der Revolution
223|Tag der Jungfrau von Guadalupe
224|Australia Day
225|Anzac Day
226|Geburtstag des Königs
227|Waitangi Day
228|Tag nach Neujahr
229|Bonfire Night
230|Gedenksonntag
231|Stephanstag
232|Feiertag Anfang Mai
233|Frühlingsfeiertag
234|Sommerfeiertag
235|Feiertag der heiligen Brigid
236|Maifeiertag
237|Junifeiertag
238|Augustfeiertag
239|Oktoberfeiertag
240|Bezahlte {o} zählen am Fälligkeitstag als Einnahmen
241|Einnahmen und Ausgaben, Monat für Monat
242|Einnahmen
243|Ausgaben
244|Übrig für dich
245|Wartet auf Zahlung
246|Letzte {n} Monate
247|Ein: {m}
248|Aus: {m}
249|Dieser Monat
250|Diesen Monat noch nichts.
251|Was du gekauft oder bezahlt hast
252|Tortenkartons, Standgebühr
253|Wie viel
254|Welcher Tag
255|Das löschen
256|Hinzufügen
257|Schreib auf, wie viel es war.
258|Wofür
259|Kuchenverkauf, Trinkgeld
260|Trinkgeld
261|Noch kein Geld erfasst
262|{n} Dinge zu kaufen
263|{n} Ding zu kaufen
264|Aus einem Bild hinzufügen
265|{sa} hinzufügen
266|Einkaufsliste
267|Für deine {o} in den nächsten {n} Wochen, etwa {m}
268|Für deine {o} in den nächsten {n} Wochen
269|Was deine {o} brauchen, erscheint hier von selbst
270|Was du kaufen musst
271|Etwas zum Kaufen hinzufügen
272|Was du hast
273|Weniger
274|Mehr
275|Du hast, was du brauchst
276|Gerade nichts zu kaufen.
277|Noch kein Preis
278|Du misst es in
279|Wenn du es kaufst
280|Du bekommst
281|Wie viel du bekommst
282|Einheiten
283|für
284|Wie viel du gerade hast
285|{sa} hinzufügen
286|Schreib den Namen.
287|Tassen
288|Stück
289|Stangen
290|Dutzend
291|Name
292|Menge
293|Einheit
294|Preis
295|{sa} bearbeiten
296|Mehl
297|Zucker
298|Mach einen Screenshot von einem Beleg, einer Online-Bestellung oder einer Liste mit dem, was du brauchst. Die App liest ihn und füllt Namen, Mengen und Preise für dich aus.
299|Mach einen Screenshot von einem Beleg, einer Online-Bestellung oder einer Liste mit dem, was du brauchst. Die App liest ihn und füllt Namen, Mengen und Preise für dich aus.
300|Screenshot hier einfügen
301|Drücke
302|, zieh ein Bild hierher oder klicke zum Auswählen
303|Tipp:
304|macht einen Screenshot
305|Oder tipp oder füg die Liste als Text ein
306|Diese Liste lesen
307|Dein Bild wird gelesen...
308|Das kann ein paar Sekunden dauern. Beim ersten Mal wird der Leser auch aus dem Internet geladen.
309|Zeile hinzufügen
310|Anderes Bild probieren
311|Zu {S} hinzufügen
312|Hake mindestens eine Sache an.
313|Aktualisiert den Preis
314|Dein Bild
315|Das Bild konnte nicht gelesen werden. Beim ersten Lesen braucht es Internet. Du kannst die Liste unten eintippen oder einfügen.
316|In dem Bild wurden keine Artikel mit Preisen gefunden. Probier einen schärferen Screenshot oder korrigier den Text unten und klicke auf Diese Liste lesen.
317|Was jedes {pa} dich wirklich kostet und was du verlangen solltest
318|Dein Stundenlohn
319|pro Stunde
320|Gewinn obendrauf
321|Deine Zeit
322|Echte Kosten
323|Du verlangst
324|Vorschlag
325|Verlange lieber {m}
326|Noch kein Preis festgelegt
327|Nicht festgelegt
328|Du verdienst {m}, etwas unter deinem Ziel
329|Du verdienst jedes Mal {m}
330|Du verlierst jedes Mal {m}
331|Vorgeschlagenen Preis nehmen
332|Die echten Kosten sind deine {s} plus deine Zeit. Der vorgeschlagene Preis rechnet deinen Gewinn drauf und rundet auf den nächsten Dollar auf.
333|Füg zuerst deine {p} hinzu
334|Sobald du einträgst, was in jedes kommt, berechnet diese Seite deine Kosten und einen fairen Preis.
335|Zu {P}
336|{n} offen, {n} fertig
337|Aus Google Formulare
338|{oa} hinzufügen
339|+ {oa} hinzufügen
340|Offen
341|Alle
342|Neu
343|In Arbeit
344|Bezahlt
345|Bearbeiten
346|Status
347|Fertige {o} löschen ({n})
348|Zurück zu Mein Tag
349|{oa} bearbeiten
350|Name ({ca})
351|Telefon oder E-Mail (optional)
352|{n}-{n}-{n} oder eine E-Mail
353|Was sie möchten
354|Fälligkeitsdatum
355|Uhrzeit (optional)
356|Keine Uhrzeit
357|Weitere Details
358|Kuchengeschmack
359|Möchtest du bei jedem {oa} noch etwas anderes fragen?
360|Text auf dem Kuchen
361|Allergien
362|Abholung oder Lieferung
363|Etwas anderes
364|Notizen (optional)
365|Sonst noch etwas zu merken
366|Änderungen speichern
367|Abbrechen
368|Diesen {oa} löschen
369|Zurück zu {O}
370|{oa} hinzufügen
371|{n} {o} gelöscht
372|{o} aus deinem Google-Formular holen
373|Jede Person, die dein Formular ausgefüllt hat, erscheint hier als neuer {oa}. Du kannst das jederzeit wiederholen. Schon geholte werden nicht doppelt hinzugefügt.
374|Lade deine Antworten herunter
375|Öffne dein Google-Formular und klicke auf
376|Antworten
377|Klicke auf
378|In Tabellen ansehen
379|(oder
380|Mit Tabellen verknüpfen
381|beim ersten Mal).
382|Klicke in der Tabelle auf
383|Datei
384|, dann
385|Herunterladen
386|Wähle diese Datei
387|Datei auswählen
388|oder hierher ziehen
389|Sag der App, wohin jede Antwort gehört
390|Wir haben jede Frage geraten. Ändere alles, was falsch aussieht.
391|Wähle die Frage mit dem Namen ({ca}).
392|Heute nichts fällig
393|{n} Person
394|{n} Personen
395|{ca} hinzufügen
396|Jemanden finden
397|Neueste
398|Meiste {o}
399|Haben am meisten ausgegeben
400|A bis Z
401|Noch kein Telefon oder E-Mail
402|gesamt
403|{ca} hinzufügen
404|Doch nicht
405|Zurück zu {C}
406|erster {oa}
407|Ihre {o}
408|Alle, die bei dir bestellen, an einem Ort
409|Noch keine {c}
410|Füg die Leute hinzu, für die du arbeitest, mit Telefon oder E-Mail, damit alle an einem Ort sind.
411|Behalte alle, für die du arbeitest, an einem Ort.
412|{n} {p}
413|{pa} hinzufügen
414|Ergibt {n}
415|{n} {s}
416|Kostet {m}
417|Kein Preis
418|Zurück zu {P}
419|Was du verlangst
420|Wie viel es ergibt
421|{n} Kuchen, {n} Cupcakes
422|Stunden, die du brauchst
423|Was hineinkommt
424|Noch nichts hinzugefügt. Wähle aus deinen {s} unten oder füg ein neues hinzu.
425|+ {sa} hinzufügen
426|Schritte
427|(einer pro Zeile)
428|{pa} hinzufügen
429|Gib ihm einen Namen, um es zu speichern.
430|Zutaten für eine Ladung kosten
431|Durchsuche alles in deiner App oder finde Orte in deiner Nähe
432|{o}, {c}, {p}, Aufgaben suchen
433|{c}, {p}, Aufgaben suchen
434|Suchen
435|In deiner Nähe
436|Bauernmärkte
437|Öffnet Google Maps
438|Handwerksmärkte
439|{S}-Läden
440|Orte zum Verkaufen
441|Erstell einen und drucke ihn dann oder speichere ihn als PDF
442|Beleg
443|Welcher {oa}
444|Drucken
445|Für
446|Datum
447|Artikel
448|Summe
449|Noch nicht bezahlt
450|Danke für deinen {oa}!
451|Eine Notiz unten
452|{Oa} {n} Tage vorher. SMS an {n}-{n}-{n}
453|{n} Tage vorher bestellen. SMS an {n}-{n}-{n}
454|Keine Ergebnisse
455|Bild ändern
456|Bild entfernen
457|Deine Geschäfte
458|Gerade offen
459|Weiteres Geschäft hinzufügen
460|Deine anderen Geschäfte bleiben gespeichert
461|Dieses Geschäft
462|Name des Geschäfts und Land
463|{B} · USA
464|{B} · Kanada
465|{B} · Mexiko
466|{B} · Großbritannien
467|{B} · Irland
468|{B} · Australien
469|{B} · Neuseeland
470|{B} · Keine Feiertage
471|Art des Geschäfts und Wörter
472|Aussehen
473|Farben und Schrift
474|Ändert sich mit der Tageszeit
475|Sprache
476|English, Español, Français, 中文, Tiếng Việt, 한국어, Tagalog, Русский, 日本語, Português, Deutsch
477|Pip, dein Helfer
478|Taucht mit Tipps zu deinem Geschäft auf
479|Ziele
480|Wobei du Hilfe willst
481|Noch nichts ausgewählt
482|Sicherung
483|Sicherung speichern
484|Du hast noch keine gespeichert
485|Sicherung laden
486|Alles aus einer Sicherungsdatei zurückholen
487|Heute gespeichert
488|Gestern gespeichert
489|Vor {n} Tagen gespeichert
490|{B} löschen
491|Zurück zu den Einstellungen
492|Das löscht alles in {B}. Klicke noch mal, um es zu löschen
493|Art des Geschäfts
494|Dein Geschäft
495|Farben
496|Was für ein Geschäft ist es?
497|Biz Studio benutzt die richtigen Wörter für dein Geschäft, zum Beispiel {P} für eine Bäckerei oder Termine für einen Salon.
498|Backen zu Hause
499|Essen und Catering
500|Kerzen und Basteln
501|Kunst und Auftragsarbeiten
502|Nähen und Kleidung
503|Nägel
504|Haare
505|Wimpern und Make-up
506|Nachhilfe
507|Musik- und Tanzunterricht
508|Fitnesstraining
509|Fotografie
510|Tierbetreuung
511|Putzen
512|Garten
513|Partys und Events
514|Was für ein Geschäft?
515|Fahrradreparatur, Hundepflege, Limonadenstand...
516|Erzähl uns, was du machst, und wir setzen passende Wörter ein.
517|Was du verkaufst oder anbietest
518|Was Leute buchen oder bestellen
519|Die Leute, mit denen du arbeitest
520|Was du für die Arbeit benutzt
521|Weiter
522|Wie heißt dein Geschäft?
523|Dieser Name steht auf deinen Belegen, Menüs und oben in der App. Du kannst ihn später ändern.
524|Name des Geschäfts
525|Wo bist du?
526|USA
527|Kanada
528|Mexiko
529|Großbritannien
530|Irland
531|Australien
532|Neuseeland
533|Woanders (keine Feiertage)
534|Wir tragen die Feiertage deines Landes in deinen Kalender ein.
535|Profilbild (optional)
536|Bild oder Logo hinzufügen
537|Wenn du das überspringst, werden deine Initialen angezeigt.
538|Zurück
539|Gib einen Namen für dein Geschäft ein, um weiterzumachen.
540|Mach es zu deinem
541|Wähle deine Farben. Jede hat eine passende Schrift, und die ganze App ändert sich beim Klicken.
542|Schlicht
543|Klassisch
544|Schiefer
545|Salbei
546|Kirsche
547|Süßes
548|Erdbeere
549|Matcha
550|Blaubeere
551|Zitrone
552|Karamell
553|Kaugummi
554|Natur
555|Ozean
556|Wald
557|Sonnenuntergang
558|Wüste
559|Himmel
560|Kräftig
561|Galaxie
562|Tropisch
563|Retro
564|Regenbogen
565|Eigene
566|Hauptfarbe
567|Akzentfarbe
568|Mit der Tageszeit ändern
569|Warm am Morgen, hell am Nachmittag und ruhig am Abend.
570|Vorschau
571|{o} fällig
572|diese Woche
573|Als Nächstes
574|Schokoladenkekse
575|Freundlich
576|Rund
577|Verspielt
578|Elegant
579|Modern
580|Schrift
581|Wobei möchtest du Hilfe?
582|Wähle so viele, wie du willst. Biz Studio zeigt sie zuerst und gibt dir Tipps dazu.
583|Noch etwas anderes? (optional)
584|Ich möchte diesen Sommer auf dem Bauernmarkt verkaufen
585|Erst mal überspringen
586|Fertig
587|Ich vergesse {o} oder Termine
588|Ich weiß nicht, wie ich meine Preise festlegen soll
589|Mir gehen die {s} aus
590|Ich möchte mein Geschäft wachsen lassen
591|Ich habe nicht genug Zeit
592|Meine Infos sind überall verstreut
593|Ich möchte mein Geld im Blick behalten
594|Mein Geschäft soll professionell aussehen
595|Schau jeden Morgen in deinen Kalender. Vor fälligen {o} bekommst du extra Erinnerungen.
596|Trag unter Preise und Gewinn ein, was du für {s} zahlst, und Biz Studio schlägt faire Preise vor.
597|Schau dir deine {s}-Liste ein paar Tage vor vollen Tagen an, damit du vorher einkaufen kannst.
598|Finde mit der Suche Märkte und Events, auf denen du verkaufen kannst.
599|Deine To-do-Liste zeigt das Dringendste zuerst, damit du immer weißt, was als Nächstes kommt.
600|Behalte alle deine {o} und {c} hier statt in Nachrichten und Notizen.
601|Behalte deine {c}, Aufgaben und Termine hier statt in Nachrichten und Notizen.
602|Die Buchhaltung rechnet Einnahmen und Ausgaben zusammen, damit du deinen echten Gewinn siehst.
603|Mach mit ein paar Klicks Belege, Menüs und Preislisten aus deinen {p}.
604|Kalender öffnen
605|Preise und Gewinn öffnen
606|To-do-Liste öffnen
607|Buchhaltung öffnen
608|Suche öffnen
609|Belege und Menüs öffnen
610|Achtung! {n} {o} sind überfällig.
611|Du hast heute {n} {o} fällig. Du schaffst das!
612|{n} {o} sind morgen fällig. Zeit, sich vorzubereiten!
613|Du hast heute {n} Dinge auf deiner Liste.
614|Du hast heute {n} Ding auf deiner Liste.
615|{n} fertige {o} warten auf Bezahlung.
616|Füg deinen ersten {oa} hinzu, und ich helfe dir, den Überblick zu behalten.
617|Füg deine {p} hinzu, damit ich ausrechnen kann, was sie dich kosten.
618|Trag ein, was du für deine {s} zahlst, und ich mache deine Einkaufsliste.
619|Deine letzte Sicherung ist schon eine Weile her. Speichere eine in den Einstellungen, damit nichts verloren geht!
620|Füg in den Einstellungen ein Bild für dein Geschäft hinzu. Es kommt auch auf deine Belege!
621|Klicke auf jemanden, um alle seine {o} an einem Ort zu sehen.
622|Klicke auf einen Tag und dann auf Hinzufügen, um einen Termin oder eine Aufgabe einzutragen.
623|Druck ein Menü aus und nimm es zu deinem nächsten Markt mit.
624|Such mal nach einem Namen, einem {pa} oder irgendwas anderem.
625|Trag Ausgaben unter Ausgaben ein, damit du weißt, was dir wirklich bleibt.
626|Du machst das super. Weiter so!
627|Gerade nichts Dringendes. Gute Arbeit!
628|Alles erledigt! Gönn dir einen Snack.
629|Heute steht nichts auf deiner Liste.
630|Füg oben eine Aufgabe hinzu, um loszulegen.
631|Füg oben eine Aufgabe hinzu. Wenn {o} anstehen, erscheinen ihre Aufgaben hier von selbst.
632|Noch keine Haftnotizen
633|Schnelle Notizen und Erinnerungen in jeder Farbe.
634|Dein Kalender ist frei
635|Noch nichts auf deiner Liste
636|Nichts zu kaufen
637|Noch keine Preise berechnet
638|Alles finden
639|Noch nichts zum Drucken
640|Erledigt: $1
641|Nicht erledigt: $1
642|Als wichtig markieren: $1
643|Markierung entfernen: $1
644|$1 löschen
645|$1 entfernen
646|$1 bearbeiten
647|Aufgabe: $1
648|Haftnotiz: $1
649|$1 gekauft, $2 zur Buchhaltung hinzugefügt
650|$1 gekauft
651|$1 kostet jetzt $2
652|Zuletzt: $1
653|$1 für $2 hinzufügen
654|$2 von $1 als $3 markiert
655|$1 für $2 machen
656|$1, $2 kaufen
657|Brauchst $1, hast $2. Für $3
658|$1 für $2 $3
659|$1 um $2
660|$1 für $2
661|Achtung! $2 von $1 ist überfällig.
662|$2 von $1 ist heute um $3 fällig.
663|$2 von $1 ist heute fällig.
664|Nicht vergessen: $2 von $1 ist morgen fällig.
665|Heute: $1 um $2. Viel Spaß!
666|Heute: $1. Viel Spaß!
667|Du hast „$1“ als wichtig markiert. Und $2 weitere.
668|Du hast „$1“ als wichtig markiert.
669|Dir gehen $1 und $2 weitere für deine nächsten $3 aus.
670|Dir geht $1 für deine nächsten $2 aus.
671|$2 von $1 ist fertig, aber noch nicht bezahlt.
672|$1 kostet dich mehr, als du verlangst. Lass uns das ändern!
673|Für $1 könntest du etwas mehr verlangen.
674|$1: $2 ($3)
675|Zurück zu $1
676|$1 zu $2 hinzugefügt und $3 Preise aktualisiert
677|$1 zu $2 hinzugefügt
678|$1 Preise aktualisiert
679|$1 zu $2 hinzufügen
680|$1 gefunden. Prüf die Namen, Mengen und Preise und korrigier, was falsch aussieht. Entferne den Haken bei allem, was du nicht willst.
681|$1 mit der Schrift $2
682|Backen zu Hause: $1
683|Putzen: $1
684|$1 überspringen
685|$1 gekauft
686|Noch nichts. Füg Dinge wie $1 hinzu.
`;

// Italian
var LANG_IT = `
0|Dom
1|Lun
2|Mar
3|Mer
4|Gio
5|Ven
6|Sab
7|La mia giornata
8|Scelto per te
9|Calendario
10|Cose da fare
11|Prezzi e guadagni
12|Contabilità
13|Lavoro
14|Post-it
15|Attività
16|{S} e spesa
17|Crescere
18|Cerca
19|Ricevute e menù
20|Impostazioni
21|Soldi
22|Menù
23|Menù
24|Buongiorno
25|Buon pomeriggio
26|Buonasera
27|Buongiorno!
28|{o} in scadenza oggi
29|{oa} in scadenza oggi
30|attività per oggi
31|attività per oggi
32|incassato questo mese
33|cose da comprare
34|cosa da comprare
35|{n} {oa} è in ritardo. Tocca per vedere.
36|{n} {o} sono in ritardo. Tocca per vedere.
37|Da fare oggi
38|Vedi tutto
39|Questa settimana
40|eventi oggi
41|evento oggi
42|Niente per oggi. {n} in arrivo.
43|I tuoi obiettivi
44|Chiudi
45|Fammi vedere
46|Consiglio successivo
47|Consigli di Pip
48|Pip
49|Oggi
50|Domani
51|Ieri
52|In ritardo
53|Senza data
54|Prima o poi
55|In ritardo, era il {d}
56|{Oa} per il {d}
57|{Oa} per il {d} alle {t}
58|{n} giorni di ritardo
59|{n} giorno di ritardo
60|Per oggi
61|Per domani
62|Per domani alle {t}
63|Per oggi alle {t}
64|Tra {n} giorni
65|Tra {n} giorni alle {t}
66|Per il {d}
67|Per il {d} alle {t}
68|Era per il {d}
69|Era per il {d} alle {t}
70|{d} alle {t}
71|Segna come importante
72|Togli il segno
73|Elimina
74|Fatto
75|Non fatto
76|Aggiungi un'attività
77|Nuova attività
78|Cosa devi fare?
79|Comprare altra farina
80|Importante
81|Segnala così resta in cima
82|Aggiungi attività
83|Scrivi cosa devi fare.
84|Togli le fatte ({n})
85|{n} cose da fare oggi
86|{n} cosa da fare oggi
87|{n} attività eliminate
88|{n} attività eliminata
89|Qui non c'è niente per ora.
90|Annulla
91|Nessuna attività
92|Niente da fare oggi
93|Tutto fatto!
94|Nuovo post-it
95|Scrivi qui...
96|Post-it
97|Porta sullo schermo
98|Colore ed elimina
99|Vedi nel calendario
100|Giallo
101|Pesca
102|Rosa
103|Lavanda
104|Azzurro
105|Menta
106|Lime
107|Sabbia
108|Scegli un colore qualsiasi
109|Colore
110|Nel calendario: {d}
111|Elimina post-it
112|Aggiungi al calendario
113|Apri in Post-it
114|Sposta a un altro giorno
115|Che giorno?
116|Togli dal calendario
117|Salva
118|Aggiunto al calendario il {d}
119|Tolto dal calendario
120|Post-it eliminato
121|Scegli un giorno.
122|{n} post-it. Passa il mouse su un post-it per portarlo sullo schermo.
123|{n} post-it. Passa il mouse su un post-it per portarlo sullo schermo.
124|Note e promemoria veloci, del colore che vuoi
125|Ancora nessun post-it. Clicca + per aggiungerne uno.
126|Il browser ha bloccato la finestra del post-it. Consenti i pop-up per questo sito e riprova.
127|Vista calendario
128|Giorno
129|Settimana
130|Mese
131|Anno
132|Mese scorso
133|Mese prossimo
134|Giorno prima
135|Giorno dopo
136|Settimana scorsa
137|Settimana prossima
138|Anno scorso
139|Anno prossimo
140|Aggiungi
141|Vedi questo giorno
142|Aggiungi a questo giorno
143|Aggiungi al {d}
144|Vedi questo mese
145|{n} cose in programma questa settimana
146|{n} cosa in programma questa settimana
147|Ancora niente in programma questa settimana
148|{n} cose in programma
149|{n} cosa in programma
150|Ancora niente in programma
151|I puntini indicano i giorni con impegni. Le feste sono in giallo.
152|Ancora niente per {d}
153|Ancora niente in programma a {d}
154|Niente in programma. Una giornata libera!
155|{n} {o} a {d}
156|{n} {oa} a {d}
157|{n} evento a {d}
158|{n} eventi a {d}
159|Evento
160|Attività
161|Modifica evento
162|Nuovo evento
163|Cosa succede?
164|A che ora?
165|(puoi saltarlo)
166|A che ora? (puoi saltarlo)
167|Dove?
168|Parco di via principale
169|Elimina questo evento
170|Aggiungi evento
171|Evento eliminato
172|Scrivi cosa succede.
173|Tutto il giorno
174|Quando vuoi
175|Mercato contadino
176|Cosa aggiungere
177|Ora
178|Dove
179|Titolo
180|(facoltativo)
181|Spuntato
182|Capodanno
183|Giorno di Martin Luther King Jr.
184|San Valentino
185|Giorno dei Presidenti
186|San Patrizio
187|Pasqua
188|Domenica di Pasqua
189|Lunedì dell'Angelo
190|Venerdì Santo
191|Giovedì Santo
192|Festa della Mamma
193|Memorial Day
194|Festa del Papà
195|Juneteenth
196|Festa dell'Indipendenza
197|Festa del Lavoro
198|Giornata dei popoli indigeni
199|Halloween
200|Giornata dei Veterani
201|Giorno del Ringraziamento
202|Black Friday
203|Sabato delle piccole imprese
204|Vigilia di Natale
205|Natale
206|Natale
207|Vigilia di Capodanno
208|Santo Stefano
209|Festa della Famiglia
210|Victoria Day
211|Festa del Canada
212|Festa civica
213|Festa del Lavoro
214|Giornata della verità e della riconciliazione
215|Giorno della Memoria
216|Epifania
217|Festa della Costituzione
218|Anniversario di Benito Juárez
219|Giornata dei bambini
220|Cinco de Mayo
221|Giorno dei Morti
222|Festa della Rivoluzione
223|Festa della Vergine di Guadalupe
224|Festa dell'Australia
225|Anzac Day
226|Compleanno del Re
227|Waitangi Day
228|Giorno dopo Capodanno
229|Notte dei falò
230|Domenica della Memoria
231|Santo Stefano
232|Festa di inizio maggio
233|Festa di primavera
234|Festa d'estate
235|Festa di Santa Brigida
236|Festa di maggio
237|Festa di giugno
238|Festa di agosto
239|Festa di ottobre
240|Gli {o} pagati contano come entrate alla loro data
241|Entrate e uscite, mese per mese
242|Entrate
243|Uscite
244|Ti è rimasto
245|In attesa di pagamento
246|Ultimi {n} mesi
247|Entrate: {m}
248|Uscite: {m}
249|Questo mese
250|Ancora niente questo mese.
251|Cosa hai comprato o pagato
252|Scatole per torte, affitto del banco
253|Quanto
254|Che giorno
255|Elimina questo
256|Aggiungi
257|Scrivi quanto era.
258|Per cosa era
259|Vendita di dolci, mance
260|Mancia
261|Ancora nessun movimento registrato
262|{n} cose da comprare
263|{n} cosa da comprare
264|Aggiungi da una foto
265|Aggiungi {sa}
266|Lista della spesa
267|Per i tuoi {o} delle prossime {n} settimane, circa {m}
268|Per i tuoi {o} delle prossime {n} settimane
269|Quello che serve per i tuoi {o} compare qui da solo
270|Cose che devi comprare
271|Aggiungi qualcosa da comprare
272|Quello che hai
273|Meno
274|Più
275|Hai tutto quello che ti serve
276|Niente da comprare adesso.
277|Ancora nessun prezzo
278|Lo misuri in
279|Quando lo compri
280|Ricevi
281|Quanto ricevi
282|unità
283|per
284|Quanto ne hai adesso
285|Aggiungi {sa}
286|Scrivi il nome.
287|tazze
288|pezzo
289|panetti
290|dozzina
291|Nome
292|Quantità
293|Unità
294|Prezzo
295|Modifica {sa}
296|Farina
297|Zucchero
298|Fai uno screenshot di uno scontrino, di un ordine online o di una lista di quello che ti serve. L'app lo legge e compila nomi, quantità e prezzi per te.
299|Fai uno screenshot di uno scontrino, di un ordine online o di una lista di quello che ti serve. L'app lo legge e compila nomi, quantità e prezzi per te.
300|Incolla qui uno screenshot
301|Premi
302|, trascina un'immagine o clicca per sceglierne una
303|Consiglio:
304|fa uno screenshot
305|Oppure scrivi o incolla la lista come testo
306|Leggi questa lista
307|Sto leggendo l'immagine...
308|Può volerci qualche secondo. La prima volta carica anche il lettore da internet.
309|Aggiungi una riga
310|Prova un'altra immagine
311|Aggiungi a {S}
312|Spunta almeno una cosa da aggiungere.
313|Aggiorna il prezzo
314|La tua immagine
315|Non siamo riusciti a leggere l'immagine. La prima lettura richiede internet. Puoi scrivere o incollare la lista qui sotto.
316|Nessun articolo con prezzo trovato in quell'immagine. Prova uno screenshot più nitido, oppure correggi il testo qui sotto e clicca Leggi questa lista.
317|Quanto ti costa davvero ogni {pa} e quanto farlo pagare
318|Paga te stesso
319|all'ora
320|Guadagno in più
321|Il tuo tempo
322|Costo reale
323|Fai pagare
324|Consigliato
325|Fai pagare {m}
326|Nessun prezzo ancora
327|Non impostato
328|Guadagni {m}, un po' sotto l'obiettivo
329|Guadagni {m} ogni volta
330|Perdi {m} ogni volta
331|Usa il prezzo consigliato
332|Il costo reale sono i tuoi {s} più il tuo tempo. Il prezzo consigliato aggiunge il guadagno scelto e arrotonda al dollaro successivo.
333|Aggiungi prima i tuoi {p}
334|Quando aggiungi cosa va in ognuno, questa pagina calcola i costi e un prezzo giusto.
335|Vai a {P}
336|{n} aperti, {n} finiti
337|Da Google Moduli
338|Aggiungi {oa}
339|+ Aggiungi {oa}
340|Aperti
341|Tutti
342|Nuovo
343|In corso
344|Pagato
345|Modifica
346|Stato
347|Togli i {o} finiti ({n})
348|Torna a La mia giornata
349|Modifica {oa}
350|Nome del {ca}
351|Telefono o email (facoltativo)
352|{n}-{n}-{n} o una email
353|Cosa vogliono
354|Data di consegna
355|Ora (facoltativo)
356|Nessun orario
357|Dettagli extra
358|Gusto della torta
359|Vuoi chiedere altro in ogni {oa}?
360|Scritta sulla torta
361|Allergie
362|Ritiro o consegna
363|Altro
364|Note (facoltativo)
365|Altro da ricordare
366|Salva modifiche
367|Annulla
368|Elimina questo {oa}
369|Torna a {O}
370|Aggiungi {oa}
371|{n} {o} eliminati
372|Importa {o} dal tuo Google Modulo
373|Chi ha compilato il modulo compare qui come nuovo {oa}. Puoi rifarlo quando vuoi. Quelli già importati non verranno aggiunti due volte.
374|Scarica le risposte
375|Apri il tuo Google Modulo e clicca
376|Risposte
377|Clicca
378|Visualizza in Fogli
379|(oppure
380|Collega a Fogli
381|la prima volta).
382|Nel foglio, clicca
383|File
384|, poi
385|Scarica
386|Scegli quel file
387|Scegli il file
388|oppure trascinalo qui
389|Di' all'app dove va ogni risposta
390|Abbiamo indovinato ogni domanda. Cambia quelle che sembrano sbagliate.
391|Scegli la domanda con il nome del {ca}.
392|Niente per oggi
393|{n} persona
394|{n} persone
395|Aggiungi un {ca}
396|Trova qualcuno
397|Più recenti
398|Più {o}
399|Hanno speso di più
400|Dalla A alla Z
401|Ancora nessun telefono o email
402|totale
403|Aggiungi {ca}
404|Lascia stare
405|Torna a {C}
406|primo {oa}
407|I loro {o}
408|Tutti quelli che comprano da te, in un unico posto
409|Ancora nessun {ca}
410|Aggiungi le persone per cui lavori, con telefono o email, così sono tutte in un unico posto.
411|Tieni tutte le persone per cui lavori in un unico posto.
412|{n} {p}
413|Aggiungi {pa}
414|Ne fa {n}
415|{n} {s}
416|Costa {m}
417|Nessun prezzo
418|Torna a {P}
419|Quanto fai pagare
420|Quanto ne fa
421|{n} torta, {n} cupcake
422|Ore che ci metti
423|Cosa ci va dentro
424|Ancora niente. Scegli tra i tuoi {s} qui sotto o aggiungine uno nuovo.
425|+ Aggiungi {sa}
426|Passaggi
427|(uno per riga)
428|Aggiungi {pa}
429|Dagli un nome per salvarlo.
430|Gli ingredienti per una infornata costano
431|Cerca tutto nella tua app o trova posti vicino a te
432|Cerca {o}, {c}, {p}, attività
433|Cerca {c}, {p}, attività
434|Cerca
435|Vicino a te
436|Mercati contadini
437|Apre Google Maps
438|Fiere dell'artigianato
439|Negozi di {s}
440|Posti dove vendere
441|Creane uno, poi stampalo o salvalo in PDF
442|Ricevuta
443|Quale {oa}
444|Stampa
445|Per
446|Data
447|Articolo
448|Totale
449|Non ancora pagato
450|Grazie per il tuo {oa}!
451|Una nota in fondo
452|{Oa} con {n} giorni di anticipo. Scrivi al {n}-{n}-{n}
453|Ordina con {n} giorni di anticipo. Scrivi al {n}-{n}-{n}
454|Nessun risultato
455|Cambia immagine
456|Togli immagine
457|Le tue attività
458|Aperta ora
459|Aggiungi un'altra attività
460|Le altre attività restano salvate
461|Questa attività
462|Nome dell'attività e paese
463|{B} · Stati Uniti
464|{B} · Canada
465|{B} · Messico
466|{B} · Regno Unito
467|{B} · Irlanda
468|{B} · Australia
469|{B} · Nuova Zelanda
470|{B} · Nessuna festa
471|Tipo di attività e parole
472|Aspetto
473|Colori e carattere
474|Cambia con l'ora del giorno
475|Lingua
476|
477|Pip, il tuo aiutante
478|Compare con consigli sulla tua attività
479|Obiettivi
480|In cosa vuoi aiuto
481|Ancora niente di scelto
482|Backup
483|Salva un backup
484|Non ne hai ancora salvato uno
485|Carica un backup
486|Recupera tutto da un file di backup
487|Salvato oggi
488|Salvato ieri
489|Salvato {n} giorni fa
490|Elimina {B}
491|Torna alle Impostazioni
492|Questo cancella tutto in {B}. Clicca di nuovo per eliminare
493|Tipo di attività
494|La tua attività
495|Colori
496|Che tipo di attività è?
497|Biz Studio usa le parole giuste per la tua attività, come {P} per una pasticceria o Appuntamenti per un salone.
498|Pasticceria in casa
499|Pasti e catering
500|Candele e artigianato
501|Arte e commissioni
502|Cucito e vestiti
503|Unghie
504|Capelli
505|Ciglia e trucco
506|Ripetizioni
507|Lezioni di musica e danza
508|Allenamento fitness
509|Fotografia
510|Cura degli animali
511|Pulizie
512|Giardino
513|Feste ed eventi
514|Che tipo di attività?
515|Riparazione bici, toelettatura cani, banchetto di limonata...
516|Raccontaci cosa fai e inseriremo le parole giuste.
517|Cosa vendi o offri
518|Cosa prenotano o ordinano le persone
519|Le persone con cui lavori
520|Cosa usi per lavorare
521|Continua
522|Come si chiama la tua attività?
523|Questo nome compare sulle ricevute, sui menù e in cima all'app. Puoi cambiarlo dopo.
524|Nome dell'attività
525|Dove ti trovi?
526|Stati Uniti
527|Canada
528|Messico
529|Regno Unito
530|Irlanda
531|Australia
532|Nuova Zelanda
533|Altrove (nessuna festa)
534|Metteremo le feste del tuo paese nel tuo calendario.
535|Foto del profilo (facoltativa)
536|Aggiungi un'immagine o un logo
537|Se salti, compaiono le tue iniziali.
538|Indietro
539|Scrivi il nome dell'attività per continuare.
540|Rendila tua
541|Scegli i colori. Ognuno ha il suo carattere abbinato, e tutta l'app cambia mentre clicchi.
542|Semplici
543|Classico
544|Ardesia
545|Salvia
546|Ciliegia
547|Dolcetti
548|Fragola
549|Matcha
550|Mirtillo
551|Limone
552|Caramello
553|Gomma da masticare
554|Natura
555|Oceano
556|Foresta
557|Tramonto
558|Deserto
559|Cielo
560|Decisi
561|Galassia
562|Tropicale
563|Retrò
564|Arcobaleno
565|Personalizzato
566|Colore principale
567|Colore d'accento
568|Cambia con l'ora del giorno
569|Caldo al mattino, luminoso al pomeriggio e calmo la sera.
570|Anteprima
571|{o} in scadenza
572|questa settimana
573|Prossimo
574|Biscotti con gocce di cioccolato
575|Amichevole
576|Arrotondato
577|Giocoso
578|Elegante
579|Moderno
580|Carattere
581|In cosa vuoi aiuto?
582|Scegline quanti vuoi. Biz Studio li mette per primi e ti dà consigli.
583|Altro? (facoltativo)
584|Voglio vendere al mercato contadino quest'estate
585|Salta per ora
586|Finisci
587|Dimentico {o} o scadenze
588|Non so quanto far pagare il mio lavoro
589|Finisco i {s}
590|Voglio far crescere la mia attività
591|Non ho abbastanza tempo
592|Le mie informazioni sono sparse ovunque
593|Voglio tenere d'occhio i soldi
594|Voglio che la mia attività sembri professionale
595|Guarda il calendario ogni mattina. Riceverai promemoria extra prima delle scadenze dei {o}.
596|Aggiungi quanto paghi i {s} in Prezzi e guadagni, e Biz Studio ti suggerirà prezzi giusti.
597|Guarda la lista dei {s} qualche giorno prima dei giorni pieni, così fai la spesa in anticipo.
598|Usa Cerca per scoprire mercati ed eventi dove vendere.
599|La lista delle cose da fare mette prima le più urgenti, così sai sempre cosa fare dopo.
600|Tieni tutti i tuoi {o} e {c} qui invece che in messaggi e note.
601|Tieni i tuoi {c}, attività ed eventi qui invece che in messaggi e note.
602|La Contabilità somma entrate e uscite, così vedi il tuo vero guadagno.
603|Crea ricevute, menù e listini dai tuoi {p} in pochi clic.
604|Apri calendario
605|Apri prezzi e guadagni
606|Apri cose da fare
607|Apri contabilità
608|Apri cerca
609|Apri ricevute e menù
610|Attenzione! {n} {o} sono in ritardo.
611|Hai {n} {o} per oggi. Ce la fai!
612|{n} {o} sono per domani. È ora di prepararsi!
613|Hai {n} cose nella lista di oggi.
614|Hai {n} cosa nella lista di oggi.
615|{n} {o} finiti aspettano il pagamento.
616|Aggiungi il tuo primo {oa} e ti aiuto a seguirlo.
617|Aggiungi i tuoi {p} così calcolo quanto ti costano.
618|Aggiungi quanto paghi i {s} e preparo la tua lista della spesa.
619|È passato un po' dall'ultimo backup. Salvane uno nelle Impostazioni per non perdere nulla!
620|Aggiungi un'immagine della tua attività nelle Impostazioni. Compare anche sulle ricevute!
621|Clicca su qualcuno per vedere tutti i suoi {o}.
622|Clicca su un giorno, poi su Aggiungi per mettere un evento o un'attività.
623|Stampa un menù e portalo al prossimo mercato.
624|Prova a cercare un nome, un {pa} o qualsiasi cosa.
625|Registra quello che spendi in Uscite, così sai quanto ti è rimasto davvero.
626|Stai andando alla grande. Continua così!
627|Niente di urgente adesso. Ottimo lavoro!
628|Tutto fatto! Concediti uno spuntino.
629|Niente nella tua lista per oggi.
630|Aggiungi un'attività qui sopra per iniziare.
631|Aggiungi un'attività qui sopra. Quando avrai {o} in arrivo, le loro attività compariranno qui da sole.
632|Ancora nessun post-it
633|Note e promemoria veloci, del colore che vuoi.
634|Il tuo calendario è libero
635|Ancora niente nella tua lista
636|Niente da comprare
637|Ancora nessun prezzo calcolato
638|Trova qualsiasi cosa
639|Ancora niente da stampare
640|Fatto: $1
641|Non fatto: $1
642|Segna come importante: $1
643|Togli il segno: $1
644|Elimina $1
645|Togli $1
646|Modifica $1
647|Attività: $1
648|Post-it: $1
649|Hai comprato $1, aggiunti $2 alla Contabilità
650|Hai comprato $1
651|$1 ora costa $2
652|Ultimo: $1
653|Aggiungi $1 per $2
654|$2 di $1 segnato come $3
655|Fare $1 per $2
656|$1, compra $2
657|Ti serve $1, hai $2. Per $3
658|$1 per $2 $3
659|$1 alle $2
660|$1 per $2
661|Attenzione! $2 di $1 è in ritardo.
662|$2 di $1 è per oggi alle $3.
663|$2 di $1 è per oggi.
664|Non dimenticare: $2 di $1 è per domani.
665|Oggi: $1 alle $2. Divertiti!
666|Oggi: $1. Divertiti!
667|Hai segnato "$1" come importante. E altri $2.
668|Hai segnato "$1" come importante.
669|Stai finendo $1 e altri $2 per i tuoi prossimi $3.
670|Stai finendo $1 per i tuoi prossimi $2.
671|$2 di $1 è finito ma non ancora pagato.
672|Fare $1 ti costa più di quanto fai pagare. Sistemiamolo!
673|Potresti far pagare un po' di più per $1.
674|$1: $2 ($3)
675|Torna a $1
676|Aggiunti $1 a $2 e aggiornati $3 prezzi
677|Aggiunti $1 a $2
678|Aggiornati $1 prezzi
679|Aggiungi $1 a $2
680|Trovati $1. Controlla nomi, quantità e prezzi e correggi quello che sembra sbagliato. Togli la spunta a quello che non vuoi.
681|$1 con il carattere $2
682|Pasticceria in casa: $1
683|Pulizie: $1
684|Salta $1
685|Hai comprato $1
686|Ancora niente. Aggiungi cose come $1.
`;

// Indonesian
var LANG_ID = `
0|Min
1|Sen
2|Sel
3|Rab
4|Kam
5|Jum
6|Sab
7|Hariku
8|Dipilih untukmu
9|Kalender
10|Daftar tugas
11|Harga dan untung
12|Pembukuan
13|Kerja
14|Catatan tempel
15|Usaha
16|{S} dan belanja
17|Berkembang
18|Cari
19|Struk dan menu
20|Pengaturan
21|Uang
22|Menu
23|Menu
24|Selamat pagi
25|Selamat siang
26|Selamat malam
27|Selamat pagi!
28|{o} jatuh tempo hari ini
29|{oa} jatuh tempo hari ini
30|tugas hari ini
31|tugas hari ini
32|diterima bulan ini
33|barang untuk dibeli
34|barang untuk dibeli
35|{n} {oa} terlambat. Ketuk untuk melihat.
36|{n} {o} terlambat. Ketuk untuk melihat.
37|Yang dikerjakan hari ini
38|Lihat semua
39|Minggu ini
40|acara hari ini
41|acara hari ini
42|Tidak ada apa-apa hari ini. {n} akan datang.
43|Fokusmu
44|Tutup
45|Tunjukkan
46|Tips berikutnya
47|Tips dari Pip
48|Pip
49|Hari ini
50|Besok
51|Kemarin
52|Terlambat
53|Tanpa tanggal
54|Kapan-kapan
55|Terlambat, seharusnya {d}
56|{Oa} jatuh tempo {d}
57|{Oa} jatuh tempo {d} pukul {t}
58|Terlambat {n} hari
59|Terlambat {n} hari
60|Jatuh tempo hari ini
61|Jatuh tempo besok
62|Jatuh tempo besok pukul {t}
63|Jatuh tempo hari ini pukul {t}
64|{n} hari lagi
65|{n} hari lagi pukul {t}
66|Jatuh tempo {d}
67|Jatuh tempo {d} pukul {t}
68|Seharusnya {d}
69|Seharusnya {d} pukul {t}
70|{d} pukul {t}
71|Tandai penting
72|Hapus tanda
73|Hapus
74|Selesai
75|Belum selesai
76|Tambah tugas
77|Tugas baru
78|Apa yang perlu kamu kerjakan?
79|Beli tepung lagi
80|Penting
81|Tandai supaya tetap di atas
82|Tambah tugas
83|Tulis apa yang perlu kamu kerjakan.
84|Hapus yang selesai ({n})
85|{n} hal dikerjakan hari ini
86|{n} hal dikerjakan hari ini
87|{n} tugas dihapus
88|{n} tugas dihapus
89|Belum ada apa-apa di sini.
90|Urungkan
91|Tidak ada tugas
92|Tidak ada yang dikerjakan hari ini
93|Semua selesai!
94|Catatan baru
95|Tulis di sini...
96|Catatan tempel
97|Keluarkan ke layar
98|Warna dan hapus
99|Lihat di kalender
100|Kuning
101|Persik
102|Merah muda
103|Lavender
104|Biru
105|Mint
106|Jeruk nipis
107|Pasir
108|Pilih warna apa saja
109|Warna
110|Di kalender: {d}
111|Hapus catatan
112|Tambahkan ke kalender
113|Buka di Catatan tempel
114|Pindahkan ke hari lain
115|Hari apa?
116|Keluarkan dari kalender
117|Simpan
118|Ditambahkan ke kalender pada {d}
119|Dikeluarkan dari kalender
120|Catatan dihapus
121|Pilih satu hari.
122|{n} catatan. Arahkan mouse ke catatan untuk mengeluarkannya ke layar.
123|{n} catatan. Arahkan mouse ke catatan untuk mengeluarkannya ke layar.
124|Catatan dan pengingat cepat, warna apa saja
125|Belum ada catatan. Klik + untuk menambah.
126|Browser kamu memblokir jendela catatan. Izinkan pop-up untuk situs ini lalu coba lagi.
127|Tampilan kalender
128|Hari
129|Minggu
130|Bulan
131|Tahun
132|Bulan lalu
133|Bulan depan
134|Hari sebelumnya
135|Hari berikutnya
136|Minggu lalu
137|Minggu depan
138|Tahun lalu
139|Tahun depan
140|Tambah
141|Lihat hari ini
142|Tambah ke hari ini
143|Tambah ke {d}
144|Lihat bulan ini
145|{n} rencana minggu ini
146|{n} rencana minggu ini
147|Belum ada rencana minggu ini
148|{n} rencana
149|{n} rencana
150|Belum ada rencana
151|Titik menandai hari yang ada rencana. Hari libur berwarna kuning.
152|Belum ada yang jatuh tempo di {d}
153|Belum ada rencana di {d}
154|Tidak ada rencana. Hari bebas!
155|{n} {o} jatuh tempo di {d}
156|{n} {oa} jatuh tempo di {d}
157|{n} acara di {d}
158|{n} acara di {d}
159|Acara
160|Tugas
161|Ubah acara
162|Acara baru
163|Ada acara apa?
164|Jam berapa?
165|(boleh dilewati)
166|Jam berapa? (boleh dilewati)
167|Di mana?
168|Taman Jalan Utama
169|Hapus acara ini
170|Tambah acara
171|Acara dihapus
172|Tulis ada acara apa.
173|Seharian
174|Kapan saja
175|Pasar tani
176|Apa yang ditambah
177|Waktu
178|Tempat
179|Judul
180|(opsional)
181|Dicentang
182|Tahun Baru
183|Hari Martin Luther King Jr.
184|Hari Valentine
185|Hari Presiden
186|Hari Santo Patrick
187|Paskah
188|Minggu Paskah
189|Senin Paskah
190|Jumat Agung
191|Kamis Putih
192|Hari Ibu
193|Memorial Day
194|Hari Ayah
195|Juneteenth
196|Hari Kemerdekaan
197|Hari Buruh
198|Hari Masyarakat Adat
199|Halloween
200|Hari Veteran
201|Thanksgiving
202|Black Friday
203|Sabtu Usaha Kecil
204|Malam Natal
205|Natal
206|Natal
207|Malam Tahun Baru
208|Boxing Day
209|Hari Keluarga
210|Victoria Day
211|Hari Kanada
212|Libur Sipil
213|Hari Buruh
214|Hari Kebenaran dan Rekonsiliasi
215|Hari Peringatan
216|Hari Tiga Raja
217|Hari Konstitusi
218|Hari Lahir Benito Juárez
219|Hari Anak
220|Cinco de Mayo
221|Hari Orang Mati
222|Hari Revolusi
223|Hari Perawan Guadalupe
224|Hari Australia
225|Hari Anzac
226|Hari Ulang Tahun Raja
227|Hari Waitangi
228|Sehari setelah Tahun Baru
229|Malam Api Unggun
230|Minggu Peringatan
231|Hari Santo Stefanus
232|Libur awal Mei
233|Libur musim semi
234|Libur musim panas
235|Libur Santa Brigid
236|Libur Mei
237|Libur Juni
238|Libur Agustus
239|Libur Oktober
240|{o} yang sudah dibayar dihitung sebagai uang masuk pada tanggal jatuh temponya
241|Uang masuk dan keluar, per bulan
242|Uang masuk
243|Uang keluar
244|Sisa untukmu
245|Menunggu pembayaran
246|{n} bulan terakhir
247|Masuk: {m}
248|Keluar: {m}
249|Bulan ini
250|Belum ada apa-apa bulan ini.
251|Apa yang kamu beli atau bayar
252|Kotak kue, sewa stan
253|Berapa
254|Hari apa
255|Hapus ini
256|Tambahkan
257|Tulis berapa jumlahnya.
258|Untuk apa
259|Bazar kue, tip
260|Tip
261|Belum ada uang yang dicatat
262|{n} barang untuk dibeli
263|{n} barang untuk dibeli
264|Tambah dari gambar
265|Tambah {sa}
266|Daftar belanja
267|Untuk {o} kamu {n} minggu ke depan, sekitar {m}
268|Untuk {o} kamu {n} minggu ke depan
269|Kebutuhan untuk {o} kamu muncul di sini sendiri
270|Yang perlu kamu beli
271|Tambah barang untuk dibeli
272|Yang kamu punya
273|Kurangi
274|Tambah
275|Kamu sudah punya yang dibutuhkan
276|Tidak ada yang perlu dibeli sekarang.
277|Belum ada harga
278|Kamu mengukurnya dalam
279|Saat kamu membeli
280|Kamu dapat
281|Berapa yang kamu dapat
282|unit
283|seharga
284|Berapa yang kamu punya sekarang
285|Tambah {sa}
286|Tulis namanya.
287|cangkir
288|buah
289|batang
290|lusin
291|Nama
292|Jumlah
293|Satuan
294|Harga
295|Ubah {sa}
296|Tepung
297|Gula
298|Ambil tangkapan layar struk, pesanan online, atau daftar kebutuhanmu. Aplikasi akan membacanya dan mengisi nama, jumlah, dan harga untukmu.
299|Ambil tangkapan layar struk, pesanan online, atau daftar kebutuhanmu. Aplikasi akan membacanya dan mengisi nama, jumlah, dan harga untukmu.
300|Tempel tangkapan layar di sini
301|Tekan
302|, letakkan gambar, atau klik untuk memilih
303|Tips:
304|untuk tangkapan layar
305|Atau ketik atau tempel daftarnya sebagai teks
306|Baca daftar ini
307|Membaca gambarmu...
308|Ini bisa makan beberapa detik. Pertama kali, pembacanya juga dimuat dari internet.
309|Tambah baris
310|Coba gambar lain
311|Tambah ke {S}
312|Centang setidaknya satu barang.
313|Akan memperbarui harga
314|Gambarmu
315|Gambar tidak bisa dibaca. Membaca gambar pertama kali butuh internet. Kamu bisa ketik atau tempel daftarnya di bawah.
316|Tidak ada barang berharga di gambar itu. Coba tangkapan layar yang lebih jelas, atau perbaiki teks di bawah lalu klik Baca daftar ini.
317|Berapa biaya sebenarnya tiap {pa}, dan berapa harga jualnya
318|Gaji untukmu
319|per jam
320|Untung tambahan
321|Waktumu
322|Biaya sebenarnya
323|Harga jualmu
324|Saran
325|Jual {m} saja
326|Belum ada harga
327|Belum diatur
328|Kamu untung {m}, sedikit di bawah target
329|Kamu untung {m} tiap kali
330|Kamu rugi {m} tiap kali
331|Pakai harga saran
332|Biaya sebenarnya adalah {s} ditambah waktumu. Harga saran menambahkan untung yang kamu pilih, dibulatkan ke dolar berikutnya.
333|Tambahkan {p} dulu
334|Setelah kamu menambahkan isinya, halaman ini menghitung biaya dan harga yang pas.
335|Ke {P}
336|{n} terbuka, {n} selesai
337|Dari Google Formulir
338|Tambah {oa}
339|+ Tambah {oa}
340|Terbuka
341|Semua
342|Baru
343|Sedang dikerjakan
344|Sudah dibayar
345|Ubah
346|Status
347|Hapus {o} yang selesai ({n})
348|Kembali ke Hariku
349|Ubah {oa}
350|Nama {ca}
351|Telepon atau email (opsional)
352|{n}-{n}-{n} atau email
353|Yang mereka mau
354|Tanggal jatuh tempo
355|Waktu (opsional)
356|Tanpa waktu
357|Detail tambahan
358|Rasa kue
359|Mau tanya hal lain di setiap {oa}?
360|Tulisan di kue
361|Alergi
362|Ambil sendiri atau diantar
363|Lainnya
364|Catatan (opsional)
365|Hal lain yang perlu diingat
366|Simpan perubahan
367|Batal
368|Hapus {oa} ini
369|Kembali ke {O}
370|Tambah {oa}
371|{n} {o} dihapus
372|Ambil {o} dari Google Formulir
373|Setiap orang yang mengisi formulirmu muncul di sini sebagai {oa} baru. Kamu bisa mengulanginya kapan saja. Yang sudah diambil tidak akan ditambahkan dua kali.
374|Unduh jawabanmu
375|Buka Google Formulir dan klik
376|Jawaban
377|Klik
378|Lihat di Spreadsheet
379|(atau
380|Tautkan ke Spreadsheet
381|pertama kali).
382|Di spreadsheet, klik
383|File
384|, lalu
385|Unduh
386|Pilih file itu
387|Pilih file kamu
388|atau seret ke sini
389|Beri tahu aplikasi ke mana tiap jawaban
390|Kami sudah menebak tiap pertanyaan. Ubah yang tampak salah.
391|Pilih pertanyaan yang berisi nama {ca}.
392|Tidak ada yang jatuh tempo hari ini
393|{n} orang
394|{n} orang
395|Tambah {ca}
396|Cari orang
397|Terbaru
398|{O} terbanyak
399|Belanja terbanyak
400|A sampai Z
401|Belum ada telepon atau email
402|total
403|Tambah {ca}
404|Tidak jadi
405|Kembali ke {C}
406|{oa} pertama
407|{O} mereka
408|Semua yang membeli darimu, di satu tempat
409|Belum ada {c}
410|Tambahkan orang yang kamu layani, dengan telepon atau email, supaya semuanya di satu tempat.
411|Simpan semua orang yang kamu layani di satu tempat.
412|{n} {p}
413|Tambah {pa}
414|Jadi {n}
415|{n} {s}
416|Biaya {m}
417|Tanpa harga
418|Kembali ke {P}
419|Harga jualmu
420|Jadi berapa
421|{n} kue, {n} cupcake
422|Berapa jam yang dibutuhkan
423|Isinya apa saja
424|Belum ada yang ditambahkan. Pilih dari {s} di bawah, atau tambah yang baru.
425|+ Tambah {sa}
426|Langkah
427|(satu per baris)
428|Tambah {pa}
429|Beri nama untuk menyimpannya.
430|Bahan untuk satu adonan seharga
431|Cari semua di aplikasimu, atau temukan tempat di dekatmu
432|Cari {o}, {c}, {p}, tugas
433|Cari {c}, {p}, tugas
434|Cari
435|Di dekatmu
436|Pasar tani
437|Membuka Google Maps
438|Pameran kerajinan
439|Toko {s}
440|Tempat untuk berjualan
441|Buat satu, lalu cetak atau simpan sebagai PDF
442|Struk
443|{Oa} yang mana
444|Cetak
445|Untuk
446|Tanggal
447|Barang
448|Total
449|Belum dibayar
450|Terima kasih atas {oa} kamu!
451|Catatan di bawah
452|{Oa} {n} hari sebelumnya. SMS ke {n}-{n}-{n}
453|Pesan {n} hari sebelumnya. SMS ke {n}-{n}-{n}
454|Tidak ada hasil
455|Ganti gambar
456|Hapus gambar
457|Usahamu
458|Sedang dibuka
459|Tambah usaha lain
460|Usahamu yang lain tetap tersimpan
461|Usaha ini
462|Nama usaha dan negara
463|{B} · Amerika Serikat
464|{B} · Kanada
465|{B} · Meksiko
466|{B} · Inggris
467|{B} · Irlandia
468|{B} · Australia
469|{B} · Selandia Baru
470|{B} · Tanpa hari libur
471|Jenis usaha dan kata-kata
472|Tampilan
473|Warna dan huruf
474|Berubah sesuai waktu
475|Bahasa
476|
477|Pip, pembantumu
478|Muncul dengan tips tentang usahamu
479|Tujuan
480|Kamu mau dibantu apa
481|Belum ada yang dipilih
482|Cadangan
483|Simpan cadangan
484|Kamu belum pernah menyimpan
485|Muat cadangan
486|Kembalikan semua dari file cadangan
487|Disimpan hari ini
488|Disimpan kemarin
489|Disimpan {n} hari lalu
490|Hapus {B}
491|Kembali ke Pengaturan
492|Ini menghapus semua di {B}. Klik sekali lagi untuk menghapus
493|Jenis usaha
494|Usahamu
495|Warna
496|Usaha apa ini?
497|Biz Studio memakai kata yang pas untuk usahamu, seperti {P} untuk toko kue atau Janji temu untuk salon.
498|Kue rumahan
499|Makanan dan katering
500|Lilin dan kerajinan
501|Seni dan pesanan karya
502|Menjahit dan pakaian
503|Kuku
504|Rambut
505|Bulu mata dan rias
506|Les privat
507|Les musik dan tari
508|Pelatih kebugaran
509|Fotografi
510|Perawatan hewan
511|Bersih-bersih
512|Halaman dan taman
513|Pesta dan acara
514|Usaha apa?
515|Bengkel sepeda, salon anjing, kios limun...
516|Ceritakan apa yang kamu kerjakan, kami isi kata yang cocok.
517|Yang kamu jual atau tawarkan
518|Yang dipesan orang
519|Orang yang bekerja denganmu
520|Yang kamu pakai untuk bekerja
521|Lanjut
522|Apa nama usahamu?
523|Nama ini muncul di struk, menu, dan bagian atas aplikasimu. Bisa diganti nanti.
524|Nama usaha
525|Kamu di mana?
526|Amerika Serikat
527|Kanada
528|Meksiko
529|Inggris
530|Irlandia
531|Australia
532|Selandia Baru
533|Tempat lain (tanpa hari libur)
534|Kami akan memasukkan hari libur negaramu ke kalender.
535|Foto profil (opsional)
536|Tambah gambar atau logo
537|Kalau dilewati, inisialmu yang muncul.
538|Kembali
539|Tulis nama usaha untuk lanjut.
540|Jadikan milikmu
541|Pilih warnamu. Tiap warna punya huruf yang cocok, dan seluruh aplikasi berubah saat kamu klik.
542|Sederhana
543|Klasik
544|Batu tulis
545|Sage
546|Ceri
547|Manisan
548|Stroberi
549|Matcha
550|Bluberi
551|Lemon
552|Karamel
553|Permen karet
554|Alam
555|Samudra
556|Hutan
557|Matahari terbenam
558|Gurun
559|Langit
560|Mencolok
561|Galaksi
562|Tropis
563|Retro
564|Pelangi
565|Kustom
566|Warna utama
567|Warna aksen
568|Berubah sesuai waktu
569|Hangat di pagi hari, cerah di siang hari, dan tenang di malam hari.
570|Pratinjau
571|{o} jatuh tempo
572|minggu ini
573|Berikutnya
574|Kue kering cokelat chip
575|Ramah
576|Bulat
577|Ceria
578|Elegan
579|Modern
580|Huruf
581|Kamu mau dibantu apa?
582|Pilih sebanyak yang kamu mau. Biz Studio menaruhnya paling depan dan memberi tips.
583|Ada lagi? (opsional)
584|Aku mau berjualan di pasar tani musim panas ini
585|Lewati dulu
586|Selesaikan
587|Aku lupa {o} atau tanggal jatuh tempo
588|Aku tidak tahu cara menentukan harga
589|{S} aku sering habis
590|Aku mau usahaku berkembang
591|Waktuku tidak cukup
592|Infoku tersebar di mana-mana
593|Aku mau mencatat uangku
594|Aku mau usahaku terlihat profesional
595|Cek kalendermu tiap pagi. Kamu akan dapat pengingat tambahan sebelum {o} jatuh tempo.
596|Tambahkan harga {s} di Harga dan untung, dan Biz Studio akan menyarankan harga yang pas.
597|Lihat daftar {s} beberapa hari sebelum hari sibuk supaya bisa belanja lebih dulu.
598|Pakai Cari untuk menemukan pasar dan acara tempat kamu bisa berjualan.
599|Daftar tugasmu menaruh yang paling mendesak di depan, jadi kamu selalu tahu langkah berikutnya.
600|Simpan semua {o} dan {c} di sini, bukan di pesan dan catatan.
601|Simpan {c}, tugas, dan acaramu di sini, bukan di pesan dan catatan.
602|Pembukuan menjumlahkan uang masuk dan keluar, jadi kamu bisa lihat untung sebenarnya.
603|Buat struk, menu, dan daftar harga dari {p} dalam beberapa klik.
604|Buka kalender
605|Buka harga dan untung
606|Buka daftar tugas
607|Buka pembukuan
608|Buka cari
609|Buka struk dan menu
610|Perhatian! {n} {o} terlambat.
611|Kamu punya {n} {o} untuk hari ini. Kamu pasti bisa!
612|{n} {o} jatuh tempo besok. Saatnya bersiap!
613|Ada {n} hal di daftarmu hari ini.
614|Ada {n} hal di daftarmu hari ini.
615|{n} {o} yang selesai menunggu pembayaran.
616|Tambahkan {oa} pertamamu dan aku bantu memantaunya.
617|Tambahkan {p} supaya aku bisa hitung biayanya.
618|Tambahkan harga {s} kamu, dan aku buatkan daftar belanja.
619|Sudah lama sejak cadangan terakhirmu. Simpan satu di Pengaturan supaya tidak ada yang hilang!
620|Tambahkan gambar usahamu di Pengaturan. Gambarnya juga muncul di struk!
621|Klik seseorang untuk melihat semua {o} mereka.
622|Klik satu hari, lalu Tambah untuk memasukkan acara atau tugas.
623|Cetak menu dan bawa ke pasar berikutnya.
624|Coba cari nama, {pa}, atau apa saja.
625|Catat pengeluaranmu di Uang keluar, supaya tahu berapa yang benar-benar tersisa.
626|Kamu hebat. Terus begitu!
627|Tidak ada yang mendesak sekarang. Kerja bagus!
628|Semua beres! Waktunya ngemil.
629|Tidak ada di daftarmu hari ini.
630|Tambah tugas di atas untuk mulai.
631|Tambah tugas di atas. Saat ada {o} mendekat, tugasnya akan muncul di sini sendiri.
632|Belum ada catatan tempel
633|Catatan dan pengingat cepat, warna apa saja.
634|Kalendermu kosong
635|Daftarmu masih kosong
636|Tidak ada yang perlu dibeli
637|Belum ada harga yang dihitung
638|Cari apa saja
639|Belum ada yang bisa dicetak
640|Selesai: $1
641|Belum selesai: $1
642|Tandai penting: $1
643|Hapus tanda: $1
644|Hapus $1
645|Keluarkan $1
646|Ubah $1
647|Tugas: $1
648|Catatan tempel: $1
649|Membeli $1, $2 ditambahkan ke Pembukuan
650|Membeli $1
651|$1 sekarang $2
652|Terakhir: $1
653|Tambah $1 untuk $2
654|$2 milik $1 ditandai $3
655|Buat $1 untuk $2
656|$1, beli $2
657|Butuh $1, punya $2. Untuk $3
658|$1 untuk $2 $3
659|$1 pukul $2
660|$1 untuk $2
661|Perhatian! $2 milik $1 terlambat.
662|$2 milik $1 jatuh tempo hari ini pukul $3.
663|$2 milik $1 jatuh tempo hari ini.
664|Jangan lupa: $2 milik $1 jatuh tempo besok.
665|Hari ini: $1 pukul $2. Selamat bersenang-senang!
666|Hari ini: $1. Selamat bersenang-senang!
667|Kamu menandai "$1" penting. Dan $2 lagi.
668|Kamu menandai "$1" penting.
669|$1 dan $2 barang lain hampir habis untuk $3 berikutnya.
670|$1 hampir habis untuk $2 berikutnya.
671|$2 milik $1 sudah selesai tapi belum dibayar.
672|Membuat $1 lebih mahal dari harga jualmu. Ayo perbaiki!
673|Kamu bisa menjual $1 sedikit lebih mahal.
674|$1: $2 ($3)
675|Kembali ke $1
676|$1 ditambahkan ke $2 dan $3 harga diperbarui
677|$1 ditambahkan ke $2
678|$1 harga diperbarui
679|Tambah $1 ke $2
680|Ditemukan $1. Periksa nama, jumlah, dan harga, lalu perbaiki yang salah. Hapus centang yang tidak kamu mau.
681|$1 dengan huruf $2
682|Kue rumahan: $1
683|Bersih-bersih: $1
684|Lewati $1
685|Membeli $1
686|Belum ada. Tambahkan hal seperti $1.
`;

// Ukrainian
var LANG_UK = `
0|Нд
1|Пн
2|Вт
3|Ср
4|Чт
5|Пт
6|Сб
7|Мій день
8|Обрано для тебе
9|Календар
10|Список справ
11|Ціни й прибуток
12|Облік грошей
13|Робота
14|Нотатки-стікери
15|Бізнес
16|{S} і покупки
17|Розвиток
18|Пошук
19|Чеки й меню
20|Налаштування
21|Гроші
22|Меню
23|Меню
24|Доброго ранку
25|Добрий день
26|Добрий вечір
27|Доброго ранку!
28|{o} на сьогодні
29|{oa} на сьогодні
30|справ на сьогодні
31|справа на сьогодні
32|отримано цього місяця
33|треба купити
34|треба купити
35|{oa}: {n} запізнюється. Натисни, щоб переглянути.
36|{o}: {n} запізнюються. Натисни, щоб переглянути.
37|Справи на сьогодні
38|Усі
39|Цього тижня
40|подій сьогодні
41|подія сьогодні
42|На сьогодні нічого. Попереду: {n}.
43|Твої цілі
44|Закрити
45|Покажи
46|Наступна порада
47|Поради від Pip
48|Pip
49|Сьогодні
50|Завтра
51|Учора
52|Запізнення
53|Без дати
54|Колись
55|Запізнення, було на {d}
56|{Oa} до {d}
57|{Oa} до {d} о {t}
58|Запізнення {n} дн.
59|Запізнення {n} дн.
60|До сьогодні
61|До завтра
62|До завтра о {t}
63|До сьогодні о {t}
64|Через {n} дн.
65|Через {n} дн. о {t}
66|До {d}
67|До {d} о {t}
68|Було до {d}
69|Було до {d} о {t}
70|{d} о {t}
71|Позначити як важливе
72|Зняти позначку
73|Видалити
74|Готово
75|Не готово
76|Додати справу
77|Нова справа
78|Що потрібно зробити?
79|Купити ще борошна
80|Важливе
81|Познач, щоб воно було вгорі
82|Додати справу
83|Напиши, що потрібно зробити.
84|Прибрати виконані ({n})
85|Справ на сьогодні: {n}
86|Справ на сьогодні: {n}
87|Видалено справ: {n}
88|Видалено справ: {n}
89|Тут поки нічого немає.
90|Скасувати
91|Немає справ
92|Сьогодні нічого робити
93|Усе готово!
94|Новий стікер
95|Пиши тут...
96|Стікер
97|Винести на екран
98|Колір і видалення
99|Переглянути в календарі
100|Жовтий
101|Персиковий
102|Рожевий
103|Лавандовий
104|Блакитний
105|М'ятний
106|Лаймовий
107|Пісочний
108|Вибрати будь-який колір
109|Колір
110|У календарі: {d}
111|Видалити стікер
112|Додати в календар
113|Відкрити в Стікерах
114|Перенести на інший день
115|Який день?
116|Прибрати з календаря
117|Зберегти
118|Додано в календар на {d}
119|Прибрано з календаря
120|Стікер видалено
121|Вибери день.
122|Стікерів: {n}. Наведи на стікер, щоб винести його на екран.
123|Стікерів: {n}. Наведи на стікер, щоб винести його на екран.
124|Швидкі нотатки й нагадування будь-якого кольору
125|Стікерів поки немає. Натисни +, щоб додати.
126|Браузер заблокував вікно стікера. Дозволь спливні вікна для цього сайту й спробуй ще раз.
127|Вигляд календаря
128|День
129|Тиждень
130|Місяць
131|Рік
132|Минулий місяць
133|Наступний місяць
134|Попередній день
135|Наступний день
136|Минулий тиждень
137|Наступний тиждень
138|Минулий рік
139|Наступний рік
140|Додати
141|Відкрити цей день
142|Додати в цей день
143|Додати на {d}
144|Відкрити цей місяць
145|Заплановано на тиждень: {n}
146|Заплановано на тиждень: {n}
147|Цього тижня поки нічого не заплановано
148|Заплановано: {n}
149|Заплановано: {n}
150|Поки нічого не заплановано
151|Крапки — дні з планами. Свята виділено жовтим.
152|На {d} поки нічого
153|На {d} поки нічого не заплановано
154|Нічого не заплановано. Вільний день!
155|{o} у {d}: {n}
156|{oa} у {d}: {n}
157|Подій у {d}: {n}
158|Подій у {d}: {n}
159|Подія
160|Справа
161|Змінити подію
162|Нова подія
163|Що буде?
164|О котрій?
165|(можна пропустити)
166|О котрій? (можна пропустити)
167|Де?
168|Парк на головній вулиці
169|Видалити цю подію
170|Додати подію
171|Подію видалено
172|Напиши, що буде.
173|Увесь день
174|Будь-коли
175|Фермерський ринок
176|Що додати
177|Час
178|Де
179|Назва
180|(необов'язково)
181|Позначено
182|Новий рік
183|День Мартіна Лютера Кінга
184|День святого Валентина
185|День президентів
186|День святого Патрика
187|Великдень
188|Великодня неділя
189|Великодній понеділок
190|Страсна п'ятниця
191|Великий четвер
192|День матері
193|День пам'яті
194|День батька
195|Джунтінс
196|День незалежності
197|День праці
198|День корінних народів
199|Гелловін
200|День ветеранів
201|День подяки
202|Чорна п'ятниця
203|Субота малого бізнесу
204|Святвечір
205|Різдво
206|Різдво
207|Переддень Нового року
208|День подарунків
209|День родини
210|День Вікторії
211|День Канади
212|Громадянське свято
213|День праці
214|День правди й примирення
215|День пам'яті
216|День трьох королів
217|День Конституції
218|День народження Беніто Хуареса
219|День дітей
220|Сінко де Майо
221|День мертвих
222|День революції
223|День Діви Марії Гваделупської
224|День Австралії
225|День АНЗАК
226|День народження короля
227|День Вайтангі
228|День після Нового року
229|Ніч вогнищ
230|Поминальна неділя
231|День святого Стефана
232|Вихідний на початку травня
233|Весняний вихідний
234|Літній вихідний
235|Вихідний святої Бригіди
236|Травневий вихідний
237|Червневий вихідний
238|Серпневий вихідний
239|Жовтневий вихідний
240|Оплачені {o} рахуються як дохід у день терміну
241|Доходи й витрати по місяцях
242|Доходи
243|Витрати
244|Залишилося в тебе
245|Очікує оплати
246|Останні {n} міс.
247|Дохід: {m}
248|Витрата: {m}
249|Цей місяць
250|Цього місяця поки нічого.
251|Що ти купив або оплатив
252|Коробки для торта, оренда місця
253|Скільки
254|Який день
255|Видалити це
256|Додати
257|Напиши суму.
258|На що
259|Ярмарок випічки, чайові
260|Чайові
261|Грошей поки не записано
262|Треба купити: {n}
263|Треба купити: {n}
264|Додати з картинки
265|Додати: {sa}
266|Список покупок
267|Для твоїх {o} на найближчі {n} тиж., приблизно {m}
268|Для твоїх {o} на найближчі {n} тиж.
269|Усе потрібне для {o} з'явиться тут саме
270|Що треба купити
271|Додай, що купити
272|Що в тебе є
273|Менше
274|Більше
275|У тебе є все потрібне
276|Зараз нічого не треба купувати.
277|Ціни поки немає
278|Ти вимірюєш це в
279|Коли купуєш
280|Ти отримуєш
281|Скільки отримуєш
282|од.
283|за
284|Скільки в тебе зараз
285|Додати: {sa}
286|Напиши назву.
287|чашки
288|шт.
289|палички
290|дюжина
291|Назва
292|Кількість
293|Одиниця
294|Ціна
295|Змінити: {sa}
296|Борошно
297|Цукор
298|Зроби скриншот чека, онлайн-замовлення чи списку потрібного. Застосунок прочитає його й заповнить назви, кількість і ціни за тебе.
299|Зроби скриншот чека, онлайн-замовлення чи списку потрібного. Застосунок прочитає його й заповнить назви, кількість і ціни за тебе.
300|Встав скриншот сюди
301|Натисни
302|, перетягни картинку або натисни, щоб вибрати
303|Порада:
304|робить скриншот
305|Або напиши чи встав список текстом
306|Прочитати цей список
307|Читаю картинку...
308|Це займе кілька секунд. Першого разу програма читання ще завантажиться з інтернету.
309|Додати рядок
310|Спробувати іншу картинку
311|Додати в {S}
312|Познач хоча б одну позицію.
313|Оновить ціну
314|Твоя картинка
315|Не вдалося прочитати картинку. Для першого читання потрібен інтернет. Можна надрукувати або вставити список нижче.
316|На картинці не знайшлося позицій із цінами. Спробуй чіткіший скриншот або виправ текст нижче й натисни «Прочитати цей список».
317|Скільки насправді коштує кожен {pa} і скільки за нього брати
318|Плати собі
319|за годину
320|Прибуток зверху
321|Твій час
322|Справжня вартість
323|Твоя ціна
324|Радимо
325|Краще бери {m}
326|Ціну ще не задано
327|Не задано
328|Ти заробляєш {m}, трохи менше за ціль
329|Ти заробляєш {m} щоразу
330|Ти втрачаєш {m} щоразу
331|Взяти рекомендовану ціну
332|Справжня вартість — це {s} плюс твій час. Рекомендована ціна додає вибраний прибуток і округлює вгору до цілого долара.
333|Спершу додай {p}
334|Коли додаси, що входить у кожен, ця сторінка порахує вартість і чесну ціну.
335|Перейти до {P}
336|Відкрито: {n}, готово: {n}
337|З Google Форми
338|Додати: {oa}
339|+ Додати: {oa}
340|Відкриті
341|Усі
342|Новий
343|У роботі
344|Оплачено
345|Змінити
346|Статус
347|Прибрати готові {o} ({n})
348|Назад у Мій день
349|Змінити: {oa}
350|Ім'я ({ca})
351|Телефон або пошта (необов'язково)
352|{n}-{n}-{n} або пошта
353|Що хочуть
354|Термін
355|Час (необов'язково)
356|Без часу
357|Дод. деталі
358|Смак торта
359|Хочеш питати щось іще в кожному замовленні ({oa})?
360|Напис на торті
361|Алергії
362|Самовивіз чи доставка
363|Інше
364|Нотатки (необов'язково)
365|Що ще запам'ятати
366|Зберегти
367|Скасувати
368|Видалити: {oa}
369|Назад до {O}
370|Додати: {oa}
371|Видалено ({o}): {n}
372|Завантажити {o} з Google Форми
373|Кожен, хто заповнив форму, з'явиться тут як новий {oa}. Можна повторити будь-коли. Уже завантажені не додадуться двічі.
374|Завантаж відповіді
375|Відкрий Google Форму й натисни
376|Відповіді
377|Натисни
378|Відкрити в Таблицях
379|(або
380|Пов'язати з Таблицями
381|першого разу).
382|У таблиці натисни
383|Файл
384|, потім
385|Завантажити
386|Вибери цей файл
387|Вибери файл
388|або перетягни сюди
389|Підкажи застосунку, куди йде кожна відповідь
390|Ми вгадали кожне питання. Виправ, якщо щось не так.
391|Вибери питання з іменем ({ca}).
392|На сьогодні нічого
393|{n} ос.
394|{n} ос.
395|Додати: {ca}
396|Знайти людину
397|Спершу нові
398|Найбільше {o}
399|Найбільше витратили
400|Від А до Я
401|Поки немає телефону чи пошти
402|усього
403|Додати: {ca}
404|Не треба
405|Назад до {C}
406|перший {oa}
407|Їхні {o}
408|Усі, хто в тебе купує, в одному місці
409|Поки немає: {c}
410|Додай людей, на яких працюєш, з телефоном чи поштою, щоб усі були в одному місці.
411|Тримай усіх, на кого працюєш, в одному місці.
412|{p}: {n}
413|Додати: {pa}
414|Вихід: {n}
415|{s}: {n}
416|Коштує {m}
417|Без ціни
418|Назад до {P}
419|Твоя ціна
420|Скільки виходить
421|{n} торт, {n} капкейків
422|Скільки годин займає
423|Що входить
424|Поки нічого не додано. Вибери з {s} нижче або додай нове.
425|+ Додати: {sa}
426|Кроки
427|(по одному в рядку)
428|Додати: {pa}
429|Дай назву, щоб зберегти.
430|Інгредієнти на одну партію коштують
431|Шукай усе в застосунку або знаходь місця поруч
432|Шукати {o}, {c}, {p}, справи
433|Шукати {c}, {p}, справи
434|Шукати
435|Поруч із тобою
436|Фермерські ринки
437|Відкриває Google Карти
438|Ярмарки ремесел
439|Магазини: {s}
440|Де продавати
441|Створи, а потім надрукуй або збережи в PDF
442|Чек
443|Який {oa}
444|Друк
445|Для
446|Дата
447|Позиція
448|Разом
449|Ще не оплачено
450|Дякуємо за замовлення ({oa})!
451|Нотатка внизу
452|{Oa} за {n} дн. Пиши на {n}-{n}-{n}
453|Замовляй за {n} дн. Пиши на {n}-{n}-{n}
454|Нічого не знайдено
455|Змінити картинку
456|Прибрати картинку
457|Твої бізнеси
458|Відкритий зараз
459|Додати ще бізнес
460|Інші бізнеси залишаться збереженими
461|Цей бізнес
462|Назва бізнесу й країна
463|{B} · США
464|{B} · Канада
465|{B} · Мексика
466|{B} · Велика Британія
467|{B} · Ірландія
468|{B} · Австралія
469|{B} · Нова Зеландія
470|{B} · Без свят
471|Тип бізнесу й слова
472|Вигляд
473|Кольори й шрифт
474|Змінюється протягом дня
475|Мова
476|
477|Pip, твій помічник
478|З'являється з порадами про твій бізнес
479|Цілі
480|З чим тобі допомогти
481|Поки нічого не вибрано
482|Резервна копія
483|Зберегти копію
484|Ти ще не зберігав копію
485|Завантажити копію
486|Повернути все з файлу копії
487|Збережено сьогодні
488|Збережено вчора
489|Збережено {n} дн. тому
490|Видалити {B}
491|Назад до Налаштувань
492|Це видалить усе в {B}. Натисни ще раз, щоб видалити
493|Тип бізнесу
494|Твій бізнес
495|Кольори
496|Який у тебе бізнес?
497|Biz Studio використовує правильні слова, наприклад {P} для пекарні чи Записи для салону.
498|Домашня випічка
499|Їжа й кейтеринг
500|Свічки й рукоділля
501|Мистецтво й замовлення
502|Шиття й одяг
503|Нігті
504|Волосся
505|Вії й макіяж
506|Репетиторство
507|Уроки музики й танців
508|Фітнес-тренування
509|Фотографія
510|Догляд за тваринами
511|Прибирання
512|Подвір'я й сад
513|Свята й події
514|Який бізнес?
515|Ремонт велосипедів, грумінг собак, лимонадний кіоск...
516|Розкажи, чим займаєшся, і ми підберемо слова.
517|Що ти продаєш або пропонуєш
518|Що люди бронюють або замовляють
519|Люди, з якими ти працюєш
520|Чим ти користуєшся в роботі
521|Далі
522|Як називається твій бізнес?
523|Ця назва буде на чеках, у меню й угорі застосунку. Її можна змінити пізніше.
524|Назва бізнесу
525|Де ти знаходишся?
526|США
527|Канада
528|Мексика
529|Велика Британія
530|Ірландія
531|Австралія
532|Нова Зеландія
533|Інше місце (без свят)
534|Ми додамо свята твоєї країни в календар.
535|Фото профілю (необов'язково)
536|Додати картинку чи логотип
537|Якщо пропустити, будуть твої ініціали.
538|Назад
539|Напиши назву бізнесу, щоб продовжити.
540|Зроби по-своєму
541|Вибери кольори. Кожен має свій шрифт, і весь застосунок змінюється, коли натискаєш.
542|Прості
543|Класика
544|Сланець
545|Шавлія
546|Вишня
547|Солодощі
548|Полуниця
549|Матча
550|Чорниця
551|Лимон
552|Карамель
553|Жуйка
554|Природа
555|Океан
556|Ліс
557|Захід сонця
558|Пустеля
559|Небо
560|Яскраві
561|Галактика
562|Тропіки
563|Ретро
564|Веселка
565|Свої
566|Основний колір
567|Акцентний колір
568|Змінювати протягом дня
569|Теплі вранці, яскраві вдень і спокійні ввечері.
570|Попередній перегляд
571|{o} до терміну
572|цього тижня
573|Далі
574|Печиво з шоколадною крихтою
575|Дружній
576|Округлий
577|Грайливий
578|Елегантний
579|Сучасний
580|Шрифт
581|З чим тобі допомогти?
582|Вибирай скільки хочеш. Biz Studio поставить це першим і дасть поради.
583|Щось іще? (необов'язково)
584|Хочу продавати на фермерському ринку цього літа
585|Поки пропустити
586|Завершити
587|Я забуваю {o} або терміни
588|Не знаю, скільки брати за роботу
589|У мене закінчуються {s}
590|Хочу розвивати бізнес
591|Мені бракує часу
592|Моя інформація розкидана всюди
593|Хочу стежити за грошима
594|Хочу, щоб мій бізнес виглядав професійно
595|Перевіряй календар щоранку. Перед терміном {o} будуть додаткові нагадування.
596|Додай, скільки платиш за {s}, у «Ціни й прибуток», і Biz Studio запропонує чесні ціни.
597|Дивись список ({s}) за кілька днів до завантажених днів, щоб купити заздалегідь.
598|Використовуй Пошук, щоб знайти ринки й події, де можна продавати.
599|Список справ ставить найтерміновіше першим, тож ти завжди знаєш, що далі.
600|Тримай усі {o} і {c} тут, а не в повідомленнях і нотатках.
601|Тримай {c}, справи й події тут, а не в повідомленнях і нотатках.
602|Облік грошей складає доходи й витрати, щоб ти бачив справжній прибуток.
603|Роби чеки, меню й прайс-листи зі своїх {p} у кілька кліків.
604|Відкрити календар
605|Відкрити ціни й прибуток
606|Відкрити список справ
607|Відкрити облік грошей
608|Відкрити пошук
609|Відкрити чеки й меню
610|Увага! Запізнюються: {n} ({o}).
611|Сьогодні в тебе {n} ({o}). Ти впораєшся!
612|Завтра термін: {n} ({o}). Час готуватися!
613|Сьогодні у твоєму списку справ: {n}.
614|Сьогодні у твоєму списку справ: {n}.
615|Готові, але не оплачені: {n} ({o}).
616|Додай перший {oa}, і я допоможу за ним стежити.
617|Додай {p}, щоб я порахував, скільки вони тобі коштують.
618|Додай, скільки платиш за {s}, і я складу список покупок.
619|Давно не було резервної копії. Збережи її в Налаштуваннях, щоб нічого не втратити!
620|Додай картинку для бізнесу в Налаштуваннях. Вона буде й на чеках!
621|Натисни на людину, щоб побачити всі її {o}.
622|Натисни на день, а потім «Додати», щоб поставити подію чи справу.
623|Надрукуй меню й візьми його на наступний ринок.
624|Спробуй знайти ім'я, {pa} або що завгодно.
625|Записуй витрати у «Витрати», щоб знати, скільки в тебе насправді залишилося.
626|У тебе чудово виходить. Так тримати!
627|Зараз нічого термінового. Гарна робота!
628|Усе зроблено! Можна й перекусити.
629|На сьогодні в списку нічого немає.
630|Додай справу вище, щоб почати.
631|Додай справу вище. Коли з'являться найближчі {o}, справи для них з'являться тут самі.
632|Стікерів поки немає
633|Швидкі нотатки й нагадування будь-якого кольору.
634|Календар порожній
635|Список поки порожній
636|Нічого купувати
637|Ціни ще не пораховано
638|Знайди що завгодно
639|Поки нічого друкувати
640|Готово: $1
641|Не готово: $1
642|Позначити як важливе: $1
643|Зняти позначку: $1
644|Видалити: $1
645|Прибрати: $1
646|Змінити: $1
647|Справа: $1
648|Стікер: $1
649|Куплено: $1, $2 додано в Облік грошей
650|Куплено: $1
651|$1 тепер коштує $2
652|Останній: $1
653|Додати $1 для $2
654|$2 ($1) позначено: $3
655|Зробити $1 для $2
656|$1, купити $2
657|Потрібно $1, є $2. Для $3
658|$1 за $2 $3
659|$1 о $2
660|$1 для $2
661|Увага! $2 ($1) запізнюється.
662|$2 ($1) — сьогодні о $3.
663|$2 ($1) — сьогодні.
664|Не забудь: $2 ($1) — завтра.
665|Сьогодні: $1 о $2. Гарно провести час!
666|Сьогодні: $1. Гарно провести час!
667|Ти позначив «$1» як важливе. І ще $2.
668|Ти позначив «$1» як важливе.
669|Закінчується $1 і ще $2 для найближчих $3.
670|Закінчується $1 для найближчих $2.
671|$2 ($1) готовий, але ще не оплачений.
672|$1 обходиться дорожче, ніж ти береш. Давай виправимо!
673|За $1 можна брати трохи більше.
674|$1: $2 ($3)
675|Назад до $1
676|Додано в $2: $1, оновлено цін: $3
677|Додано в $2: $1
678|Оновлено цін: $1
679|Додати $1 у $2
680|Знайдено: $1. Перевір назви, кількість і ціни й виправ помилки. Зніми позначку з непотрібного.
681|$1, шрифт $2
682|Домашня випічка: $1
683|Прибирання: $1
684|Пропустити: $1
685|Куплено: $1
686|Поки нічого. Додай, наприклад, $1.
`;

// Hindi
var LANG_HI = `
0|रवि
1|सोम
2|मंगल
3|बुध
4|गुरु
5|शुक्र
6|शनि
7|मेरा दिन
8|आपके लिए चुना गया
9|कैलेंडर
10|करने के काम
11|दाम और मुनाफ़ा
12|हिसाब-किताब
13|काम
14|स्टिकी नोट
15|बिज़नेस
16|{S} और ख़रीदारी
17|आगे बढ़ें
18|खोजें
19|रसीदें और मेन्यू
20|सेटिंग्स
21|पैसे
22|मेन्यू
23|मेन्यू
24|सुप्रभात
25|नमस्ते
26|शुभ संध्या
27|सुप्रभात!
28|आज के {o}
29|आज का {oa}
30|आज के काम
31|आज का काम
32|इस महीने मिले पैसे
33|ख़रीदने की चीज़ें
34|ख़रीदने की चीज़
35|{n} {oa} देर से है। देखने के लिए टैप करें।
36|{n} {o} देर से हैं। देखने के लिए टैप करें।
37|आज करना है
38|सब देखें
39|इस हफ़्ते
40|आज के इवेंट
41|आज का इवेंट
42|आज कुछ नहीं। आगे {n} हैं।
43|आपका फ़ोकस
44|बंद करें
45|दिखाओ
46|अगला सुझाव
47|Pip के सुझाव
48|Pip
49|आज
50|कल
51|बीता कल
52|देर से
53|कोई तारीख़ नहीं
54|कभी भी
55|देर से, तारीख़ थी {d}
56|{Oa} की तारीख़ {d}
57|{Oa} की तारीख़ {d}, {t}
58|{n} दिन देर
59|{n} दिन देर
60|आज तक
61|कल तक
62|कल {t} तक
63|आज {t} तक
64|{n} दिन में
65|{n} दिन में, {t}
66|{d} तक
67|{d}, {t} तक
68|तारीख़ थी {d}
69|तारीख़ थी {d}, {t}
70|{d}, {t}
71|ज़रूरी मार्क करें
72|मार्क हटाएँ
73|हटाएँ
74|हो गया
75|नहीं हुआ
76|काम जोड़ें
77|नया काम
78|आपको क्या करना है?
79|और आटा ख़रीदें
80|ज़रूरी
81|मार्क करें ताकि यह सबसे ऊपर रहे
82|काम जोड़ें
83|लिखें कि आपको क्या करना है।
84|पूरे हुए हटाएँ ({n})
85|आज {n} काम करने हैं
86|आज {n} काम करना है
87|{n} काम हटाए गए
88|{n} काम हटाया गया
89|अभी यहाँ कुछ नहीं है।
90|वापस लें
91|कोई काम नहीं
92|आज करने को कुछ नहीं
93|सब हो गया!
94|नया नोट
95|यहाँ लिखें...
96|स्टिकी नोट
97|स्क्रीन पर निकालें
98|रंग और हटाएँ
99|कैलेंडर में देखें
100|पीला
101|आड़ू
102|गुलाबी
103|लैवेंडर
104|नीला
105|पुदीना
106|हरा नींबू
107|रेतीला
108|कोई भी रंग चुनें
109|रंग
110|कैलेंडर में: {d}
111|नोट हटाएँ
112|कैलेंडर में जोड़ें
113|स्टिकी नोट में खोलें
114|किसी और दिन पर ले जाएँ
115|कौन सा दिन?
116|कैलेंडर से हटाएँ
117|सेव करें
118|{d} को कैलेंडर में जोड़ा गया
119|कैलेंडर से हटाया गया
120|नोट हटाया गया
121|एक दिन चुनें।
122|{n} नोट। नोट पर माउस ले जाकर उसे स्क्रीन पर निकालें।
123|{n} नोट। नोट पर माउस ले जाकर उसे स्क्रीन पर निकालें।
124|जल्दी के नोट और याद-दिलाने, किसी भी रंग में
125|अभी कोई नोट नहीं। जोड़ने के लिए + दबाएँ।
126|आपके ब्राउज़र ने नोट की विंडो रोक दी। इस साइट के लिए पॉप-अप की अनुमति दें और फिर कोशिश करें।
127|कैलेंडर व्यू
128|दिन
129|हफ़्ता
130|महीना
131|साल
132|पिछला महीना
133|अगला महीना
134|पिछला दिन
135|अगला दिन
136|पिछला हफ़्ता
137|अगला हफ़्ता
138|पिछला साल
139|अगला साल
140|जोड़ें
141|यह दिन देखें
142|इस दिन में जोड़ें
143|{d} में जोड़ें
144|यह महीना देखें
145|इस हफ़्ते {n} काम तय हैं
146|इस हफ़्ते {n} काम तय है
147|इस हफ़्ते अभी कुछ तय नहीं
148|{n} काम तय हैं
149|{n} काम तय है
150|अभी कुछ तय नहीं
151|बिंदु वाले दिनों में कुछ तय है। छुट्टियाँ पीले रंग में हैं।
152|{d} में अभी कुछ नहीं
153|{d} में अभी कुछ तय नहीं
154|कुछ तय नहीं। आज़ाद दिन!
155|{d} में {n} {o}
156|{d} में {n} {oa}
157|{d} में {n} इवेंट
158|{d} में {n} इवेंट
159|इवेंट
160|काम
161|इवेंट बदलें
162|नया इवेंट
163|क्या होने वाला है?
164|कितने बजे?
165|(छोड़ सकते हैं)
166|कितने बजे? (छोड़ सकते हैं)
167|कहाँ?
168|मेन स्ट्रीट पार्क
169|यह इवेंट हटाएँ
170|इवेंट जोड़ें
171|इवेंट हटाया गया
172|लिखें कि क्या होने वाला है।
173|पूरा दिन
174|कभी भी
175|किसान बाज़ार
176|क्या जोड़ना है
177|समय
178|कहाँ
179|शीर्षक
180|(वैकल्पिक)
181|पूरा किया
182|नया साल
183|मार्टिन लूथर किंग जूनियर दिवस
184|वैलेंटाइन डे
185|प्रेसिडेंट्स डे
186|सेंट पैट्रिक डे
187|ईस्टर
188|ईस्टर संडे
189|ईस्टर मंडे
190|गुड फ्राइडे
191|होली थर्सडे
192|मदर्स डे
193|मेमोरियल डे
194|फ़ादर्स डे
195|जूनटीन्थ
196|स्वतंत्रता दिवस
197|श्रम दिवस
198|मूल निवासी दिवस
199|हैलोवीन
200|वेटरन्स डे
201|थैंक्सगिविंग
202|ब्लैक फ्राइडे
203|स्मॉल बिज़नेस सैटरडे
204|क्रिसमस की पूर्व संध्या
205|क्रिसमस
206|क्रिसमस
207|नए साल की पूर्व संध्या
208|बॉक्सिंग डे
209|फ़ैमिली डे
210|विक्टोरिया डे
211|कनाडा डे
212|सिविक हॉलिडे
213|श्रम दिवस
214|सत्य और मेल-मिलाप दिवस
215|स्मरण दिवस
216|तीन राजाओं का दिन
217|संविधान दिवस
218|बेनितो हुआरेज़ जयंती
219|बाल दिवस
220|सिंको दे मायो
221|मृतकों का दिन
222|क्रांति दिवस
223|ग्वाडालूपे की कुँवारी मरियम का दिन
224|ऑस्ट्रेलिया डे
225|एंज़ैक डे
226|राजा का जन्मदिन
227|वाइतांगी डे
228|नए साल के बाद का दिन
229|बॉनफ़ायर नाइट
230|रिमेंबरेंस संडे
231|सेंट स्टीफ़न डे
232|मई की शुरुआत की छुट्टी
233|वसंत की छुट्टी
234|गर्मी की छुट्टी
235|सेंट ब्रिजिड डे की छुट्टी
236|मई की छुट्टी
237|जून की छुट्टी
238|अगस्त की छुट्टी
239|अक्तूबर की छुट्टी
240|भुगतान हुए {o} अपनी तारीख़ पर आमदनी में गिने जाते हैं
241|हर महीने आने वाले और जाने वाले पैसे
242|आए पैसे
243|गए पैसे
244|आपके पास बचे
245|भुगतान बाक़ी
246|पिछले {n} महीने
247|आए: {m}
248|गए: {m}
249|यह महीना
250|इस महीने अभी कुछ नहीं।
251|आपने क्या ख़रीदा या चुकाया
252|केक के डिब्बे, स्टॉल का किराया
253|कितना
254|कौन सा दिन
255|इसे हटाएँ
256|जोड़ें
257|लिखें कि कितना था।
258|किसलिए था
259|बेक सेल, टिप
260|टिप
261|अभी कोई पैसा दर्ज नहीं
262|{n} चीज़ें ख़रीदनी हैं
263|{n} चीज़ ख़रीदनी है
264|फ़ोटो से जोड़ें
265|{sa} जोड़ें
266|ख़रीदारी की सूची
267|अगले {n} हफ़्तों के {o} के लिए, लगभग {m}
268|अगले {n} हफ़्तों के {o} के लिए
269|{o} के लिए ज़रूरी चीज़ें यहाँ अपने-आप दिखेंगी
270|जो चीज़ें ख़रीदनी हैं
271|ख़रीदने की चीज़ जोड़ें
272|आपके पास क्या है
273|कम
274|ज़्यादा
275|आपके पास सब कुछ है
276|अभी कुछ ख़रीदना नहीं है।
277|अभी कोई दाम नहीं
278|आप इसे इसमें नापते हैं
279|जब आप ख़रीदते हैं
280|आपको मिलता है
281|आपको कितना मिलता है
282|यूनिट
283|के लिए
284|अभी आपके पास कितना है
285|{sa} जोड़ें
286|इसका नाम लिखें।
287|कप
288|पीस
289|स्टिक
290|दर्जन
291|नाम
292|मात्रा
293|यूनिट
294|दाम
295|{sa} बदलें
296|आटा
297|चीनी
298|रसीद, ऑनलाइन ऑर्डर या ज़रूरी चीज़ों की सूची का स्क्रीनशॉट लें। ऐप उसे पढ़कर नाम, मात्रा और दाम भर देगा।
299|रसीद, ऑनलाइन ऑर्डर या ज़रूरी चीज़ों की सूची का स्क्रीनशॉट लें। ऐप उसे पढ़कर नाम, मात्रा और दाम भर देगा।
300|स्क्रीनशॉट यहाँ पेस्ट करें
301|दबाएँ
302|, तस्वीर छोड़ें, या चुनने के लिए क्लिक करें
303|सुझाव:
304|से स्क्रीनशॉट लेते हैं
305|या सूची को टेक्स्ट के रूप में लिखें या पेस्ट करें
306|यह सूची पढ़ें
307|आपकी तस्वीर पढ़ी जा रही है...
308|इसमें कुछ सेकंड लग सकते हैं। पहली बार, रीडर इंटरनेट से भी लोड होता है।
309|लाइन जोड़ें
310|कोई और तस्वीर आज़माएँ
311|{S} में जोड़ें
312|कम से कम एक चीज़ पर टिक करें।
313|दाम अपडेट करेगा
314|आपकी तस्वीर
315|तस्वीर नहीं पढ़ी जा सकी। पहली बार तस्वीर पढ़ने के लिए इंटरनेट चाहिए। आप नीचे सूची लिख या पेस्ट कर सकते हैं।
316|उस तस्वीर में दाम वाली कोई चीज़ नहीं मिली। ज़्यादा साफ़ स्क्रीनशॉट आज़माएँ, या नीचे का टेक्स्ट ठीक करके "यह सूची पढ़ें" दबाएँ।
317|हर {pa} पर असल में कितना ख़र्च होता है, और कितना लेना चाहिए
318|ख़ुद को दें
319|प्रति घंटा
320|ऊपर से मुनाफ़ा
321|आपका समय
322|असली लागत
323|आप लेते हैं
324|सुझाया गया
325|इसके बजाय {m} लें
326|अभी कोई दाम तय नहीं
327|तय नहीं
328|आप {m} कमाते हैं, लक्ष्य से थोड़ा कम
329|आप हर बार {m} कमाते हैं
330|आपको हर बार {m} का नुकसान होता है
331|सुझाया गया दाम लें
332|असली लागत है आपके {s} और आपका समय। सुझाया गया दाम आपका चुना मुनाफ़ा जोड़कर अगले डॉलर तक बढ़ा देता है।
333|पहले अपने {p} जोड़ें
334|जब आप हर एक में लगने वाली चीज़ें जोड़ देंगे, यह पेज लागत और सही दाम निकाल देगा।
335|{P} पर जाएँ
336|{n} खुले, {n} पूरे
337|Google Form से
338|{oa} जोड़ें
339|+ {oa} जोड़ें
340|खुले
341|सभी
342|नया
343|चल रहा है
344|भुगतान हो गया
345|बदलें
346|स्थिति
347|पूरे हुए {o} हटाएँ ({n})
348|मेरा दिन पर वापस जाएँ
349|{oa} बदलें
350|{ca} का नाम
351|फ़ोन या ईमेल (वैकल्पिक)
352|{n}-{n}-{n} या ईमेल
353|उन्हें क्या चाहिए
354|तारीख़
355|समय (वैकल्पिक)
356|कोई समय नहीं
357|और जानकारी
358|केक का फ़्लेवर
359|हर {oa} पर कुछ और पूछना है?
360|केक पर संदेश
361|एलर्जी
362|पिकअप या डिलीवरी
363|कुछ और
364|नोट्स (वैकल्पिक)
365|और कुछ याद रखना है
366|बदलाव सेव करें
367|रद्द करें
368|यह {oa} हटाएँ
369|{O} पर वापस जाएँ
370|{oa} जोड़ें
371|{n} {o} हटाए गए
372|अपने Google Form से {o} लाएँ
373|जिसने भी आपका फ़ॉर्म भरा है, वह यहाँ नए {oa} के रूप में दिखेगा। आप यह कभी भी दोबारा कर सकते हैं। पहले लाए गए दो बार नहीं जुड़ेंगे।
374|अपने जवाब डाउनलोड करें
375|अपना Google Form खोलें और क्लिक करें
376|जवाब
377|क्लिक करें
378|Sheets में देखें
379|(या
380|Sheets से जोड़ें
381|पहली बार)।
382|शीट में, क्लिक करें
383|फ़ाइल
384|, फिर
385|डाउनलोड
386|वह फ़ाइल चुनें
387|अपनी फ़ाइल चुनें
388|या यहाँ खींचकर लाएँ
389|ऐप को बताएँ कि हर जवाब कहाँ जाएगा
390|हमने हर सवाल का अंदाज़ा लगाया है। जो ग़लत लगे उसे बदलें।
391|वह सवाल चुनें जिसमें {ca} का नाम है।
392|आज के लिए कुछ नहीं
393|{n} व्यक्ति
394|{n} लोग
395|{ca} जोड़ें
396|किसी को ढूँढें
397|सबसे नए
398|सबसे ज़्यादा {o}
399|सबसे ज़्यादा ख़र्च किया
400|A से Z
401|अभी कोई फ़ोन या ईमेल नहीं
402|कुल
403|{ca} जोड़ें
404|रहने दें
405|{C} पर वापस जाएँ
406|पहला {oa}
407|उनके {o}
408|आपसे ख़रीदने वाले सभी लोग, एक जगह
409|अभी कोई {c} नहीं
410|जिन लोगों के लिए आप काम करते हैं उन्हें फ़ोन या ईमेल के साथ जोड़ें, ताकि सब एक जगह रहें।
411|जिनके लिए आप काम करते हैं, उन सबको एक जगह रखें।
412|{n} {p}
413|{pa} जोड़ें
414|{n} बनते हैं
415|{n} {s}
416|लागत {m}
417|कोई दाम नहीं
418|{P} पर वापस जाएँ
419|आप कितना लेते हैं
420|कितना बनता है
421|{n} केक, {n} कपकेक
422|कितने घंटे लगते हैं
423|इसमें क्या लगता है
424|अभी कुछ नहीं जोड़ा। नीचे अपने {s} में से चुनें, या नया जोड़ें।
425|+ {sa} जोड़ें
426|स्टेप
427|(हर लाइन में एक)
428|{pa} जोड़ें
429|सेव करने के लिए नाम दें।
430|एक बैच की सामग्री की लागत
431|अपने ऐप में सब कुछ खोजें, या पास की जगहें ढूँढें
432|{o}, {c}, {p}, काम खोजें
433|{c}, {p}, काम खोजें
434|खोजें
435|आपके पास
436|किसान बाज़ार
437|Google Maps खोलता है
438|हस्तशिल्प मेले
439|{s} की दुकानें
440|बेचने की जगहें
441|एक बनाएँ, फिर प्रिंट करें या PDF के रूप में सेव करें
442|रसीद
443|कौन सा {oa}
444|प्रिंट करें
445|किसके लिए
446|तारीख़
447|चीज़
448|कुल
449|अभी भुगतान नहीं हुआ
450|आपके {oa} के लिए धन्यवाद!
451|नीचे एक नोट
452|{n} दिन पहले {oa} करें। मैसेज करें {n}-{n}-{n}
453|{n} दिन पहले ऑर्डर करें। मैसेज करें {n}-{n}-{n}
454|कोई नतीजा नहीं
455|तस्वीर बदलें
456|तस्वीर हटाएँ
457|आपके बिज़नेस
458|अभी खुला है
459|एक और बिज़नेस जोड़ें
460|आपके दूसरे बिज़नेस सेव रहेंगे
461|यह बिज़नेस
462|बिज़नेस का नाम और देश
463|{B} · अमेरिका
464|{B} · कनाडा
465|{B} · मेक्सिको
466|{B} · ब्रिटेन
467|{B} · आयरलैंड
468|{B} · ऑस्ट्रेलिया
469|{B} · न्यूज़ीलैंड
470|{B} · कोई छुट्टी नहीं
471|बिज़नेस का प्रकार और शब्द
472|रूप
473|रंग और फ़ॉन्ट
474|दिन के समय के साथ बदलता है
475|भाषा
476|
477|Pip, आपका सहायक
478|आपके बिज़नेस के बारे में सुझाव देता है
479|लक्ष्य
480|आपको किसमें मदद चाहिए
481|अभी कुछ नहीं चुना
482|बैकअप
483|बैकअप सेव करें
484|आपने अभी तक कोई सेव नहीं किया
485|बैकअप लोड करें
486|बैकअप फ़ाइल से सब कुछ वापस लाएँ
487|आज सेव किया
488|कल सेव किया
489|{n} दिन पहले सेव किया
490|{B} हटाएँ
491|सेटिंग्स पर वापस जाएँ
492|इससे {B} में सब कुछ मिट जाएगा। हटाने के लिए फिर से क्लिक करें
493|बिज़नेस का प्रकार
494|आपका बिज़नेस
495|रंग
496|यह किस तरह का बिज़नेस है?
497|Biz Studio आपके बिज़नेस के लिए सही शब्द इस्तेमाल करता है, जैसे बेकरी के लिए {P} या सैलून के लिए अपॉइंटमेंट।
498|घर की बेकरी
499|खाना और कैटरिंग
500|मोमबत्तियाँ और हस्तशिल्प
501|कला और कमीशन
502|सिलाई और कपड़े
503|नेल्स
504|बाल
505|पलकें और मेकअप
506|ट्यूशन
507|संगीत और डांस क्लास
508|फ़िटनेस कोचिंग
509|फ़ोटोग्राफ़ी
510|पालतू जानवरों की देखभाल
511|सफ़ाई
512|आँगन और बगीचा
513|पार्टी और इवेंट
514|किस तरह का बिज़नेस?
515|साइकिल रिपेयर, कुत्तों की ग्रूमिंग, नींबू पानी का ठेला...
516|हमें बताएँ कि आप क्या करते हैं, हम सही शब्द भर देंगे।
517|आप क्या बेचते या देते हैं
518|लोग क्या बुक या ऑर्डर करते हैं
519|जिन लोगों के साथ आप काम करते हैं
520|काम के लिए आप क्या इस्तेमाल करते हैं
521|आगे बढ़ें
522|आपके बिज़नेस का नाम क्या है?
523|यह नाम आपकी रसीदों, मेन्यू और ऐप के ऊपर दिखेगा। आप इसे बाद में बदल सकते हैं।
524|बिज़नेस का नाम
525|आप कहाँ रहते हैं?
526|अमेरिका
527|कनाडा
528|मेक्सिको
529|ब्रिटेन
530|आयरलैंड
531|ऑस्ट्रेलिया
532|न्यूज़ीलैंड
533|कहीं और (कोई छुट्टी नहीं)
534|हम आपके देश की छुट्टियाँ आपके कैलेंडर में डाल देंगे।
535|प्रोफ़ाइल फ़ोटो (वैकल्पिक)
536|तस्वीर या लोगो जोड़ें
537|अगर आप इसे छोड़ते हैं, तो आपके नाम के पहले अक्षर दिखेंगे।
538|वापस
539|आगे बढ़ने के लिए बिज़नेस का नाम लिखें।
540|इसे अपना बनाएँ
541|अपने रंग चुनें। हर एक के साथ मिलता-जुलता फ़ॉन्ट आता है, और क्लिक करते ही पूरा ऐप बदल जाता है।
542|सादा
543|क्लासिक
544|स्लेट
545|सेज
546|चेरी
547|मिठाइयाँ
548|स्ट्रॉबेरी
549|माचा
550|ब्लूबेरी
551|नींबू
552|कैरेमल
553|बबलगम
554|प्रकृति
555|समुद्र
556|जंगल
557|सूर्यास्त
558|रेगिस्तान
559|आसमान
560|चटकीले
561|आकाशगंगा
562|ट्रॉपिकल
563|रेट्रो
564|इंद्रधनुष
565|अपना
566|मुख्य रंग
567|ख़ास रंग
568|दिन के समय के साथ बदलें
569|सुबह गर्माहट, दोपहर में चमक और रात में सुकून।
570|झलक
571|बाक़ी {o}
572|इस हफ़्ते
573|आगे
574|चॉकलेट चिप कुकीज़
575|दोस्ताना
576|गोल
577|मज़ेदार
578|सुंदर
579|आधुनिक
580|फ़ॉन्ट
581|आपको किसमें मदद चाहिए?
582|जितने चाहें उतने चुनें। Biz Studio इन्हें सबसे पहले रखेगा और सुझाव देगा।
583|कुछ और? (वैकल्पिक)
584|मैं इस गर्मी किसान बाज़ार में बेचना चाहता/चाहती हूँ
585|अभी छोड़ें
586|सेटअप पूरा करें
587|मैं {o} या तारीख़ें भूल जाता/जाती हूँ
588|मुझे नहीं पता कि दाम कैसे तय करूँ
589|मेरे {s} ख़त्म हो जाते हैं
590|मैं अपना बिज़नेस बढ़ाना चाहता/चाहती हूँ
591|मेरे पास समय कम है
592|मेरी जानकारी इधर-उधर बिखरी है
593|मैं अपने पैसों का हिसाब रखना चाहता/चाहती हूँ
594|मैं चाहता/चाहती हूँ कि मेरा बिज़नेस प्रोफ़ेशनल दिखे
595|हर सुबह अपना कैलेंडर देखें। {o} की तारीख़ से पहले आपको और याद दिलाया जाएगा।
596|"दाम और मुनाफ़ा" में {s} के दाम डालें, और Biz Studio सही दाम सुझाएगा।
597|व्यस्त दिनों से कुछ दिन पहले {s} की सूची देखें ताकि पहले से ख़रीद सकें।
598|"खोजें" से वे बाज़ार और इवेंट ढूँढें जहाँ आप बेच सकते हैं।
599|आपकी काम की सूची सबसे ज़रूरी काम पहले दिखाती है, ताकि आपको हमेशा पता रहे कि आगे क्या करना है।
600|अपने सभी {o} और {c} मैसेज और नोट्स के बजाय यहाँ रखें।
601|अपने {c}, काम और इवेंट मैसेज और नोट्स के बजाय यहाँ रखें।
602|हिसाब-किताब आने और जाने वाले पैसे जोड़ता है, ताकि आप असली मुनाफ़ा देख सकें।
603|अपने {p} से कुछ ही क्लिक में रसीदें, मेन्यू और दाम-सूची बनाएँ।
604|कैलेंडर खोलें
605|दाम और मुनाफ़ा खोलें
606|काम की सूची खोलें
607|हिसाब-किताब खोलें
608|खोजें खोलें
609|रसीदें और मेन्यू खोलें
610|ध्यान दें! {n} {o} देर से हैं।
611|आज आपके {n} {o} हैं। आप कर सकते हैं!
612|कल {n} {o} की तारीख़ है। तैयारी का समय!
613|आज आपकी सूची में {n} काम हैं।
614|आज आपकी सूची में {n} काम है।
615|{n} पूरे हुए {o} भुगतान का इंतज़ार कर रहे हैं।
616|अपना पहला {oa} जोड़ें और मैं उसे संभालने में मदद करूँगा।
617|अपने {p} जोड़ें ताकि मैं उनकी लागत निकाल सकूँ।
618|अपने {s} के दाम डालें, और मैं आपकी ख़रीदारी की सूची बनाऊँगा।
619|आपका पिछला बैकअप काफ़ी पुराना है। सेटिंग्स में एक सेव करें ताकि कुछ खोए नहीं!
620|सेटिंग्स में अपने बिज़नेस की तस्वीर जोड़ें। यह आपकी रसीदों पर भी आती है!
621|किसी पर क्लिक करके उनके सभी {o} एक जगह देखें।
622|किसी दिन पर क्लिक करें, फिर "जोड़ें" दबाकर इवेंट या काम डालें।
623|एक मेन्यू प्रिंट करें और अगले बाज़ार में ले जाएँ।
624|कोई नाम, {pa}, या कुछ भी खोजकर देखें।
625|ख़र्च "गए पैसे" में डालें, ताकि पता रहे कि असल में कितना बचा।
626|आप बहुत अच्छा कर रहे हैं। ऐसे ही चलते रहें!
627|अभी कुछ ज़रूरी नहीं। बढ़िया काम!
628|सब हो गया! थोड़ा नाश्ता कर लीजिए।
629|आज आपकी सूची में कुछ नहीं।
630|शुरू करने के लिए ऊपर एक काम जोड़ें।
631|ऊपर एक काम जोड़ें। जब {o} आने वाले होंगे, उनके काम यहाँ अपने-आप दिखेंगे।
632|अभी कोई स्टिकी नोट नहीं
633|जल्दी के नोट और याद-दिलाने, किसी भी रंग में।
634|आपका कैलेंडर ख़ाली है
635|आपकी सूची अभी ख़ाली है
636|ख़रीदने को कुछ नहीं
637|अभी कोई दाम नहीं निकाला गया
638|कुछ भी ढूँढें
639|अभी प्रिंट करने को कुछ नहीं
640|हो गया: $1
641|नहीं हुआ: $1
642|ज़रूरी मार्क करें: $1
643|मार्क हटाएँ: $1
644|$1 हटाएँ
645|$1 हटाएँ
646|$1 बदलें
647|काम: $1
648|स्टिकी नोट: $1
649|$1 ख़रीदा, $2 हिसाब-किताब में जोड़ा गया
650|$1 ख़रीदा
651|$1 अब $2 है
652|पिछला: $1
653|$2 के लिए $1 जोड़ें
654|$1 का $2 "$3" मार्क किया गया
655|$2 के लिए $1 बनाएँ
656|$1, $2 ख़रीदें
657|$1 चाहिए, $2 है। $3 के लिए
658|$2 $3 के लिए $1
659|$1, $2
660|$2 के लिए $1
661|ध्यान दें! $1 का $2 देर से है।
662|$1 का $2 आज $3 तक है।
663|$1 का $2 आज तक है।
664|भूलिए मत: $1 का $2 कल तक है।
665|आज: $1, $2। मज़े करें!
666|आज: $1। मज़े करें!
667|आपने "$1" को ज़रूरी मार्क किया। और $2 और।
668|आपने "$1" को ज़रूरी मार्क किया।
669|आने वाले $3 के लिए $1 और $2 और चीज़ें कम हैं।
670|आने वाले $2 के लिए $1 कम है।
671|$1 का $2 पूरा हो गया पर अभी भुगतान नहीं हुआ।
672|आपके $1 को बनाने में आपके दाम से ज़्यादा लगता है। इसे ठीक करते हैं!
673|आप अपने $1 के लिए थोड़ा ज़्यादा ले सकते हैं।
674|$1: $2 ($3)
675|$1 पर वापस जाएँ
676|$2 में $1 जोड़े गए और $3 दाम अपडेट हुए
677|$2 में $1 जोड़े गए
678|$1 दाम अपडेट हुए
679|$2 में $1 जोड़ें
680|$1 चीज़ें मिलीं। नाम, मात्रा और दाम देखें, जो ग़लत लगे उसे ठीक करें। जो नहीं चाहिए उसका टिक हटाएँ।
681|$1, $2 फ़ॉन्ट के साथ
682|घर की बेकरी: $1
683|सफ़ाई: $1
684|$1 छोड़ें
685|$1 ख़रीदा
686|अभी कुछ नहीं। $1 जैसी चीज़ें जोड़ें।
`;