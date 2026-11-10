// =========================================
// BIZ STUDIO - the code that makes the app work
// =========================================

// Simple line icons (drawn with SVG so they look sharp at any size)
const ICONS = {
  // menu icons
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17.5 14c2.5.3 4 2.2 4 5"/>',
  box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  cart: '<circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M2 3h3l2.5 12h11l2-8H6"/>',
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
    tip: (w) => 'Keep every one of your ' + w.orders.toLowerCase() + ' and ' + w.customers.toLowerCase() + ' here instead of in texts and notes.' },
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
  { id: 'calendar', icon: 'calendar', label: 'Calendar',
    emptyTitle: 'Your calendar is clear',
    emptyText: (w) => w.orders + ' and events will show up on the day they are due.' },
  { id: 'customers', icon: 'users', label: (w) => w.customers,
    emptyTitle: (w) => 'No ' + w.customers.toLowerCase() + ' yet',
    emptyText: (w) => w.customers + ' are added automatically when they book with you.' },
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
    emptyTitle: 'Find markets and supplies',
    emptyText: 'Search for local markets, craft fairs and stores near you.' },
  { id: 'printables', icon: 'printer', label: 'Receipts and menus',
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
  { label: 'Work', color: 'sky', items: ['orders', 'todo', 'calendar'] },
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
    localStorage.setItem(SAVE_KEY, JSON.stringify(profile));
  } catch (error) {
    // If the browser won't save, the app still works until it's closed
  }
}

// Returns true if a saved profile was found and loaded
function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
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
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(ORDERS_KEY);
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

  // The Look and Goals pages are wider, with the app preview on the right
  const showPreview = setupStep === 2 || setupStep === 3;
  document.getElementById('setup-body').classList.toggle('with-preview', showPreview);
  document.getElementById('look-preview').hidden = !showPreview;

  if (setupStep === 0) showTypePage();
  if (setupStep === 1) showNamePage();
  if (setupStep === 2) showLookPage();
  if (setupStep === 3) showGoalsPage();
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
  if (editing) return finishSetup();
  setupStep = 1;
  showSetup();
}

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
    showMenu();
    showPage();
  });
  return button;
}

// The menu groups for this owner: My Day, then "Picked for you" (their goals),
// then the normal groups without the sections that moved up
function menuGroups() {
  const focus = focusSections();
  const groups = [MENU_GROUPS[0]];
  if (focus.length > 0) groups.push({ label: 'Picked for you', items: focus });

  MENU_GROUPS.slice(1).forEach(function (group) {
    if (group.items.includes('settings')) return; // Settings is added at the bottom
    const items = group.items.filter(function (id) { return !focus.includes(id); });
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

  if (section.id === 'myday') {
    showComingUp(page);
    showGoalTips(page);
  }
  if (section.id === 'orders') showOrders(page);
  if (section.id === 'settings') showSettings(page);
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
  return wrap;
}

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
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveOrders() {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
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

  toast.querySelector('.toast-undo').addEventListener('click', function () {
    toast.hidden = true;
    clearTimeout(undoTimer);
    undo();
  });

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
  const addBtn = document.createElement('button');
  addBtn.className = 'btn with-icon';
  addBtn.innerHTML = icon('plus') + '<span></span>';
  addBtn.querySelector('span').textContent = 'New ' + oneOrder();
  addBtn.addEventListener('click', function () { openOrderForm('new'); });
  head.appendChild(addBtn);

  // No orders yet: a friendly empty message with a button
  if (orders.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty sky';
    empty.innerHTML = '<span class="empty-icon">' + icon('receipt') + '</span><h3></h3><p></p>' +
      '<button class="btn" id="first-order"></button>';
    empty.querySelector('h3').textContent = 'No ' + w.orders.toLowerCase() + ' yet';
    empty.querySelector('p').textContent = 'Add your first ' + oneOrder() + ' to start keeping track of who needs what, and when.';
    empty.querySelector('#first-order').textContent = 'Add your first ' + oneOrder();
    empty.querySelector('#first-order').addEventListener('click', function () { openOrderForm('new'); });
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
        <strong class="order-item"></strong>
        <span class="order-who"></span>
        <span class="order-chips"></span>
      </span>
    </button>
    <span class="order-price"></span>
    <select class="status-pick" aria-label="Status"></select>
    <button class="row-delete" title="Delete">${icon('trash')}</button>
  `;
  row.querySelector('.order-item').textContent = order.item;
  row.querySelector('.order-who').textContent =
    order.customer + ', ' + dueText(order).charAt(0).toLowerCase() + dueText(order).slice(1) + (order.time ? ' at ' + niceTime(order.time) : '');
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
function openOrderForm(which) {
  currentSection = 'orders';
  orderView = which;
  showMenu();
  showPage();
}

function showOrderForm(page) {
  const w = words();
  const isNew = orderView === 'new';
  const order = isNew
    ? { customer: '', contact: '', item: '', due: '', time: '', price: '', status: 'new', notes: '' }
    : orders.find(function (o) { return o.id === orderView; });

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
          <input id="o-contact" class="input" autocomplete="off" placeholder="(555) 123-4567">
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
  if (isNew) page.querySelector('#o-due').value = todayText();

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

  page.querySelector('#o-customer').focus();

  function goBack() {
    orderView = null;
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
      orderView = null;
      deleteOrders([order.id]);
    });
  }
}

// ---------- My Day: what's coming up ----------
function showComingUp(page) {
  const soon = sortedOrders().filter(function (o) {
    return isOpen(o) && daysUntil(o.due) <= 7;
  });
  if (soon.length === 0) return; // keep the "Nothing due today" message

  const empty = page.querySelector('.empty');
  const box = document.createElement('section');
  box.innerHTML = '<div class="section-head"><h2 class="tips-title"></h2><button class="link-btn" id="see-all"></button></div>' +
    '<div class="order-list"></div>';
  box.querySelector('h2').textContent = 'Coming up this week';
  box.querySelector('#see-all').textContent = 'See all ' + words().orders.toLowerCase();
  box.querySelector('#see-all').addEventListener('click', function () {
    currentSection = 'orders';
    orderView = null;
    showMenu();
    showPage();
  });
  soon.slice(0, 5).forEach(function (o) { box.querySelector('.order-list').appendChild(orderRow(o)); });
  empty.replaceWith(box);
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

    <h2 class="settings-group">Your business</h2>
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

    <button class="start-over" id="erase-btn">Erase everything and start over</button>
  `;

  // Text from the owner is added with textContent so it shows exactly as typed
  box.querySelector('#hero-name').textContent = profile.businessName;
  box.querySelector('#hero-type').textContent = typeName;
  box.querySelector('#row-name').textContent = profile.businessName;
  box.querySelector('#row-type').textContent = typeName + ': ' + [w.products, w.orders, w.customers, w.supplies].join(', ');
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
  const erase = box.querySelector('#erase-btn');
  erase.addEventListener('click', function () {
    if (erase.dataset.sure !== 'yes') {
      erase.dataset.sure = 'yes';
      erase.classList.add('sure');
      erase.textContent = 'Are you sure? Click again to erase everything';
      return;
    }
    eraseProfile();
    location.reload();
  });

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
    const target = findSection(goal.focus[0]);
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
if (loadProfile()) {
  openApp();
} else {
  showSetup();
}