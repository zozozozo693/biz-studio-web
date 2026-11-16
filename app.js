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

// The pages of Profile Setup
const SETUP_STEPS = ['Business type', 'Your business', 'Look', 'Goals'];

// The owner's business profile. Profile Setup fills this in.
const profile = {
  businessName: '',
  businessType: '',
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

    <p class="label photo-label">Profile picture (optional)</p>
    <div class="photo-picker" id="photo-picker"></div>

    <div class="form-actions">
      <button id="back-btn" class="btn secondary">Back</button>
      <button id="next-btn" class="btn">Continue</button>
    </div>
  `;
  showPhotoPicker();

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
          <p class="mini-date">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>

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
  preview.querySelector('.mini-btn').textContent = '+ New ' + w.orders.toLowerCase().replace(/s$/, '');
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
function hiddenSections() {
  let type = profile.businessType;
  if (type === 'other') {
    const guess = guessType(profile.otherType);
    type = guess ? guess.id : 'other';
  }
  return NO_ORDERS_TAB.includes(type) ? ['orders'] : [];
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
    subtitle = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
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
    text.textContent = d.toLocaleDateString('en-US',
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
    pop.querySelector('b').textContent = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
      cell.setAttribute('aria-label', toDate(day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
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
  return words().orders.replace(/s$/, '').toLowerCase();
}

// $45.00 style money
function money(amount) {
  return Number(amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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
  return toDate(text).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
        <span>${date.toLocaleDateString('en-US', { month: 'short' })}</span>
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
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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
  page.querySelector('label[for="o-customer"]').textContent = w.customers.replace(/s$/, '') + ' name';
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
    if (!values.customer) missing.push(w.customers.replace(/s$/, '').toLowerCase() + ' name');
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
    { id: 'customer', label: w.customers.replace(/s$/, '') + ' name' },
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
      error.textContent = 'Pick which question has the ' + w.customers.replace(/s$/, '').toLowerCase() + '\'s name.';
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
  return words().customers.replace(/s$/, '').toLowerCase();
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
  return toDate(text).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

function showCalendar(page) {
  const w = words();
  const today = todayText();
  const month = calendarMonth ? toDate(calendarMonth) : new Date(toDate(today).getFullYear(), toDate(today).getMonth(), 1);

  // Orders, events and to-dos by day
  const byDay = {};
  const eventsByDay = {};
  const tasksByDay = {};
  orders.forEach(function (o) {
    if (!o.due) return;
    (byDay[o.due] = byDay[o.due] || []).push(o);
  });
  events.forEach(function (e) { (eventsByDay[e.date] = eventsByDay[e.date] || []).push(e); });
  tasks.forEach(function (t) {
    if (t.due && !t.done) (tasksByDay[t.due] = tasksByDay[t.due] || []).push(t);
  });
  [byDay, eventsByDay].forEach(function (lists) {
    Object.keys(lists).forEach(function (day) {
      lists[day].sort(function (a, b) { return (a.time || '99').localeCompare(b.time || '99'); });
    });
  });

  const monthName = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const inMonth = orders.filter(function (o) {
    const d = toDate(o.due);
    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
  }).length;

  page.innerHTML = `
    <header class="page-head with-button">
      <div>
        <h1>Calendar</h1>
        <p></p>
      </div>
      <div class="month-nav">
        <button class="btn secondary small" id="cal-today">Today</button>
        <button class="round-btn" id="cal-prev" aria-label="Last month">${icon('back')}</button>
        <h2 class="month-name"></h2>
        <button class="round-btn" id="cal-next" aria-label="Next month">${icon('chevron')}</button>
      </div>
    </header>
    <div class="calendar-layout">
      <div class="calendar">
        <div class="cal-weekdays"></div>
        <div class="cal-grid"></div>
      </div>
      <aside class="day-panel" id="day-panel"></aside>
    </div>
  `;
  const eventsInMonth = events.filter(function (e) {
    const d = toDate(e.date);
    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
  }).length;
  page.querySelector('.page-head p').textContent = !usesOrders()
    ? (eventsInMonth ? eventsInMonth + (eventsInMonth === 1 ? ' event' : ' events') + ' in ' : 'Nothing planned in ') + month.toLocaleDateString('en-US', { month: 'long' }) + (eventsInMonth ? '' : ' yet')
    : inMonth === 0
    ? 'Nothing due in ' + month.toLocaleDateString('en-US', { month: 'long' }) + ' yet'
    : inMonth + ' ' + (inMonth === 1 ? oneOrder() : w.orders.toLowerCase()) + ' due in ' + month.toLocaleDateString('en-US', { month: 'long' });
  page.querySelector('.month-name').textContent = monthName;

  function goMonth(change) {
    const next = new Date(month.getFullYear(), month.getMonth() + change, 1);
    calendarMonth = dateText(next);
    showPage();
  }
  page.querySelector('#cal-prev').addEventListener('click', function () { goMonth(-1); });
  page.querySelector('#cal-next').addEventListener('click', function () { goMonth(1); });
  page.querySelector('#cal-today').addEventListener('click', function () {
    calendarMonth = null;
    calendarDay = today;
    showPage();
  });

  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function (name) {
    const cell = document.createElement('span');
    cell.textContent = name;
    page.querySelector('.cal-weekdays').appendChild(cell);
  });

  // Start on the Sunday before the 1st, and fill whole weeks
  const grid = page.querySelector('.cal-grid');
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - month.getDay());
  const lastOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const weeks = Math.ceil((month.getDay() + lastOfMonth.getDate()) / 7);

  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const day = dateText(d);
    const due = byDay[day] || [];
    const open = due.filter(isOpen);

    const cell = document.createElement('button');
    cell.className = 'cal-day';
    if (d.getMonth() !== month.getMonth()) cell.classList.add('other-month');
    if (day === today) cell.classList.add('today');
    if (day === calendarDay) cell.classList.add('picked');
    if (open.length + (eventsByDay[day] || []).length >= 3) cell.classList.add('busy');
    cell.setAttribute('aria-label', d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) +
      (due.length ? ', ' + due.length + ' ' + (due.length === 1 ? oneOrder() : w.orders.toLowerCase()) : ''));
    cell.innerHTML = '<span class="cal-num"></span><span class="cal-pills"></span>';
    cell.querySelector('.cal-num').textContent = d.getDate();

    // Little labels: events, then orders, then to-dos
    const pills = cell.querySelector('.cal-pills');
    const all = [];
    (eventsByDay[day] || []).forEach(function (e) {
      all.push({ cls: 'event', text: e.title, title: e.title + (e.time ? ' at ' + niceTime(e.time) : '') });
    });
    due.forEach(function (o) {
      all.push({ cls: urgency(o) === 'late' ? 'late' : findStatus(o.status).color, text: o.customer.split(' ')[0],
        title: o.customer + ': ' + o.item + (o.time ? ' at ' + niceTime(o.time) : '') });
    });
    (tasksByDay[day] || []).forEach(function (t) {
      all.push({ cls: 'todo', text: t.text, title: 'To-do: ' + t.text });
    });
    const showMax = all.length > 3 ? 2 : 3;
    all.slice(0, showMax).forEach(function (thing) {
      const pill = document.createElement('span');
      pill.className = 'cal-pill ' + thing.cls;
      pill.textContent = thing.text;
      pill.title = thing.title;
      pills.appendChild(pill);
    });
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

  // The picked day, on the side
  const panel = page.querySelector('#day-panel');
  const picked = toDate(calendarDay);
  const pickedOrders = byDay[calendarDay] || [];
  const days = daysUntil(calendarDay);
  const when = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days === -1 ? 'Yesterday' : '';

  panel.innerHTML = `
    <p class="day-when"></p>
    <h2 class="day-title"></h2>
    <div class="day-orders"></div>
    <button class="btn with-icon day-add">${icon('plus')}<span>Add</span></button>
  `;
  panel.querySelector('.day-when').textContent = when || picked.toLocaleDateString('en-US', { weekday: 'long' });
  panel.querySelector('.day-title').textContent = picked.toLocaleDateString('en-US',
    when ? { weekday: 'long', month: 'long', day: 'numeric' } : { month: 'long', day: 'numeric' });
  panel.querySelector('.day-add').addEventListener('click', function () { openAddChooser(calendarDay); });

  const list = panel.querySelector('.day-orders');
  const dayEvents = eventsByDay[calendarDay] || [];
  const dayTasks = tasksByDay[calendarDay] || [];
  if (!pickedOrders.length && !dayEvents.length && !dayTasks.length) {
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
    const note = item.querySelector('.day-item');
    if (e.where) note.textContent = e.where; else note.remove();
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
      ? toDate(day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
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
function oneProduct() { return words().products.replace(/s$/, '').toLowerCase(); }
function oneSupply() { return words().supplies.replace(/s$/, '').toLowerCase(); }

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
      <button class="btn with-icon" id="new-supply">${icon('plus')}<span></span></button>
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
    <header class="page-head"><h1>Pricing and profit</h1><p></p></header>
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
  page.querySelector('.month-name').textContent = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
    col.querySelector('.chart-label').textContent = m.toLocaleDateString('en-US', { month: 'short' });
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
      controls.firstChild.textContent = 'Add an ' + oneOrder() + ' first, then make a receipt for it here.';
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
    body.querySelector('.r-date').textContent = toDate(o.due).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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

// The little "..." menu: colors and Delete
function noteMenu(doc, note, onColor, onDelete) {
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
  const del = doc.createElement('button');
  del.className = 'note-menu-delete';
  del.innerHTML = icon('trash') + '<span>Delete note</span>';
  del.addEventListener('click', function () { menu.hidden = true; onDelete(); });
  menu.append(title, colorPicker(doc, note.color, picked), del);
  return menu;
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
        <button class="notes-plus" id="note-plus" title="New note" aria-label="New note" aria-expanded="false">${icon('plus')}</button>
        <div class="note-menu notes-pick" hidden>
          <p class="note-menu-title">Pick a color for your note</p>
        </div>
      </div>
    </div>
    <div class="notes-grid"></div>
  `;
  if (big) box.querySelector('.notes-head h2').remove();
  const grid = box.querySelector('.notes-grid');
  if (!notes.length) {
    grid.innerHTML = '<p class="notes-empty">No notes yet. Click <b>+</b> to add one.</p>';
  }
  notes.forEach(function (note) { grid.appendChild(noteCard(note)); });

  // + shows the colors; picking one makes the note
  const plus = box.querySelector('#note-plus');
  const pick = box.querySelector('.notes-pick');
  pick.appendChild(colorPicker(document, null, function (c) {
    pick.hidden = true;
    const note = addNote(null, c);
    showPage();
    focusNoteNow(note);
  }));
  plus.addEventListener('click', function () {
    pick.hidden = !pick.hidden;
    plus.setAttribute('aria-expanded', pick.hidden ? 'false' : 'true');
  });
  const wrap = box.querySelector('.notes-add-wrap');
  wrap.addEventListener('focusout', function (e) {
    if (!wrap.contains(e.relatedTarget)) pick.hidden = true;
  });
  return box;
}

// The Sticky notes page: all your notes, bigger
function showNotesPage(page) {
  page.innerHTML = '<header class="page-head with-button"><div><h1>Sticky notes</h1><p></p></div></header>';
  page.querySelector('.page-head p').textContent = notes.length
    ? notes.length + (notes.length === 1 ? ' note' : ' notes') + '. Point at a note to pop it out onto your screen.'
    : 'Quick notes and reminders, in any color you like';
  const board = stickyBoard(true);
  page.querySelector('.page-head').appendChild(board.querySelector('.notes-add-wrap'));
  page.appendChild(board);
}

// Puts the cursor in a note on My Day, ready to type
function focusNoteNow(note) {
  const typing = document.querySelector('.note[data-note="' + note.id + '"] textarea');
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
      <button class="note-tool" data-act="pop" title="Pop out onto your screen" aria-label="Pop out onto your screen">${icon('popout')}</button>
      <button class="note-tool" data-act="more" title="Color and delete" aria-label="Color and delete">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>
      </button>
    </div>
    <span class="note-fold" aria-hidden="true"></span>
  `;
  const text = card.querySelector('textarea');
  text.value = note.text;
  const popped = noteWindows[note.id] && !noteWindows[note.id].closed;
  if (popped) card.classList.add('popped');

  let timer = null;
  text.addEventListener('input', function () {
    note.text = text.value;
    note.changed = new Date().toISOString();
    clearTimeout(timer);
    timer = setTimeout(function () { saveNotes(); }, 250);
  });
  text.addEventListener('blur', function () {
    clearTimeout(timer);
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
  }, function () { deleteNote(note); });
  card.appendChild(menu);

  card.querySelector('[data-act="more"]').addEventListener('click', function () { menu.hidden = !menu.hidden; });
  card.querySelector('[data-act="pop"]').addEventListener('click', function () {
    note.text = text.value;
    saveList(NOTES_KEY, notes);
    popOutNote(note);
  });
  card.addEventListener('focusout', function (e) {
    if (!card.contains(e.relatedTarget)) menu.hidden = true;
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
  const text = doc.querySelector('textarea');
  text.value = note.text;
  text.addEventListener('input', function () {
    note.text = text.value;
    saveNotes(note.id);
    refreshBoardSoon();
  });

  const menu = noteMenu(doc, note, function (c) {
    note.color = c;
    doc.body.style.setProperty('--note', noteColor(c));
    saveNotes(note.id);
    refreshBoardSoon();
  }, function () { deleteNote(note); });
  doc.body.appendChild(menu);

  doc.querySelector('[data-act="new"]').addEventListener('click', function () { popOutNote(addNote(note)); refreshBoardSoon(); });
  doc.querySelector('[data-act="menu"]').addEventListener('click', function () { menu.hidden = !menu.hidden; });
  doc.querySelector('[data-act="close"]').addEventListener('click', function () { win.close(); });
  text.addEventListener('focus', function () { menu.hidden = true; });
  win.setTimeout(function () { text.focus(); text.setSelectionRange(text.value.length, text.value.length); }, 0);
}

// Changes made on My Day show up in the note windows (but not the one being typed in)
function syncNoteWindows(fromId) {
  notes.forEach(function (note) {
    const win = noteWindows[note.id];
    if (!win || win.closed || note.id === fromId) return;
    const text = win.document.querySelector('textarea');
    if (text && text.value !== note.text) text.value = note.text;
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
      font-family: Caveat, 'Segoe Print', 'Comic Sans MS', cursive; font-size: 30px; font-weight: 600; line-height: 1.15;
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
      const when = new Date(backup.saved).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
      <button class="settings-row pink" data-step="0">
        <span class="nav-icon">${icon(type.icon)}</span>
        <span class="row-text"><strong>Business type and words</strong><span class="row-value" id="row-type"></span></span>
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
  box.querySelector('#row-type').textContent = typeName + ': ' + (usesOrders() ? [w.products, w.orders, w.customers, w.supplies] : [w.products, w.customers, w.supplies]).join(', ');
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