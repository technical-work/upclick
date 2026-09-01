import { defaultStoreCanvas, DEFAULT_PAGE } from '@/lib/builder/elementRegistry';

export const INITIAL_STORE_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Modern Ergonomic Office Chair',
    nameAr: 'كرسي مريح فاخر للمكتب والعمل',
    type: 'Physical',
    typeAr: 'منتج ملموس',
    price: 249,
    compareAtPrice: 320,
    currency: 'USD',
    inventory: 45,
    status: 'active',
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1580481077195-c266a4f10738?w=600&auto=format&fit=crop&q=80',
    updatedOn: 'Aug 28, 2026 04:12 PM',
    priority: 1,
    description: 'High-density foam with adjustable lumbar support, 3D armrests, and breathable mesh back.',
    descriptionAr: 'كرسي مكتب مريح مع دعم قطني قابل للتعديل ومساند ثلاثية الأبعاد وشبك تهوية متين.'
  },
  {
    id: 'prod_2',
    name: 'Minimalist Oak Coffee Table',
    nameAr: 'طاولة قهوة خشب بلوط مودرن',
    type: 'Physical',
    typeAr: 'منتج ملموس',
    price: 189,
    compareAtPrice: 240,
    currency: 'USD',
    inventory: 20,
    status: 'active',
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&auto=format&fit=crop&q=80',
    updatedOn: 'Aug 27, 2026 02:45 PM',
    priority: 2,
    description: 'Solid natural oak with rounded edges and scratch-resistant matte clear coating.',
    descriptionAr: 'خشب بلوط طبيعي متين مع حواف دائرية وتشطيب مطفي مقاوم للخدش.'
  },
  {
    id: 'prod_3',
    name: 'Ceramic Table Lamp with Linen Shade',
    nameAr: 'أباجورة طاولة سيراميك مودرن',
    type: 'Physical',
    typeAr: 'منتج ملموس',
    price: 79,
    compareAtPrice: 99,
    currency: 'USD',
    inventory: 60,
    status: 'active',
    category: 'Lighting',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    updatedOn: 'Aug 25, 2026 11:30 AM',
    priority: 3,
    description: 'Hand-thrown textured ceramic base with a warm natural linen lampshade.',
    descriptionAr: 'قاعدة سيراميك ملمس يدوي فاخر مع غطاء كتان طبيعي لإضاءة دافئة مريحة.'
  },
  {
    id: 'prod_4',
    name: 'Velvet Cloud Accent Armchair',
    nameAr: 'كرسي استرخاء مخملي عصري',
    type: 'Physical',
    typeAr: 'منتج ملموس',
    price: 890,
    compareAtPrice: 1100,
    currency: 'USD',
    inventory: 8,
    status: 'active',
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
    updatedOn: 'Aug 22, 2026 09:10 AM',
    priority: 4,
    description: 'Deep comfortable cushions with stain-resistant velvet fabric and gold metal legs.',
    descriptionAr: 'وسائد مريحة جداً بقماش مخملي مقاوم للبقع وأرجل معدنية ذهبية أنيقة.'
  }
];

export const INITIAL_STORE_PAGES = [
  {
    id: 'sp_1',
    name: 'Products List',
    nameAr: 'قائمة المنتجات',
    path: '/products',
    type: 'catalog',
    views: 3420,
    uniqueViews: 2810,
    optins: 320,
    optinRate: '9.3%',
    orders: 142,
    salesRate: '4.1%',
    salesQty: 189,
    salesAmount: 18450,
    avgCartValue: 130,
    earningsPerView: 5.39,
    uniqueEarningsPerView: 6.56,
    icon: 'Grid',
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&auto=format&fit=crop&q=80',
    page: { ...DEFAULT_PAGE },
    canvas: defaultStoreCanvas('catalog', 'Our Products')
  },
  {
    id: 'sp_2',
    name: 'Product details',
    nameAr: 'تفاصيل المنتج',
    path: '/product-details',
    type: 'product_detail',
    views: 2890,
    uniqueViews: 2310,
    optins: 180,
    optinRate: '6.2%',
    orders: 118,
    salesRate: '4.0%',
    salesQty: 154,
    salesAmount: 15200,
    avgCartValue: 128,
    earningsPerView: 5.25,
    uniqueEarningsPerView: 6.58,
    icon: 'Package',
    thumbnail: 'https://images.unsplash.com/photo-1580481077195-c266a4f10738?w=400&auto=format&fit=crop&q=80',
    page: { ...DEFAULT_PAGE },
    canvas: defaultStoreCanvas('product_detail', 'Product Details')
  },
  {
    id: 'sp_3',
    name: 'Cart',
    nameAr: 'سلة التسوق',
    path: '/cart',
    type: 'cart',
    views: 1450,
    uniqueViews: 1200,
    optins: 0,
    optinRate: '0%',
    orders: 98,
    salesRate: '6.7%',
    salesQty: 130,
    salesAmount: 13500,
    avgCartValue: 137,
    earningsPerView: 9.31,
    uniqueEarningsPerView: 11.25,
    icon: 'ShoppingCart',
    thumbnail: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400&auto=format&fit=crop&q=80',
    page: { ...DEFAULT_PAGE },
    canvas: defaultStoreCanvas('cart', 'Shopping Cart')
  },
  {
    id: 'sp_4',
    name: 'Checkout',
    nameAr: 'إتمام الطلب والدفع',
    path: '/checkout',
    type: 'checkout',
    views: 980,
    uniqueViews: 860,
    optins: 0,
    optinRate: '0%',
    orders: 86,
    salesRate: '8.7%',
    salesQty: 112,
    salesAmount: 12100,
    avgCartValue: 140,
    earningsPerView: 12.34,
    uniqueEarningsPerView: 14.06,
    icon: 'CreditCard',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=400&auto=format&fit=crop&q=80',
    page: { ...DEFAULT_PAGE },
    canvas: defaultStoreCanvas('checkout', 'Express Checkout')
  },
  {
    id: 'sp_5',
    name: 'Thank you!',
    nameAr: 'صفحة الشكر وتأكيد الطلب',
    path: '/thank-you',
    type: 'thankyou',
    views: 860,
    uniqueViews: 860,
    optins: 860,
    optinRate: '100%',
    orders: 86,
    salesRate: '100%',
    salesQty: 112,
    salesAmount: 12100,
    avgCartValue: 140,
    earningsPerView: 14.06,
    uniqueEarningsPerView: 14.06,
    icon: 'CheckCircle',
    thumbnail: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop&q=80',
    page: { ...DEFAULT_PAGE },
    canvas: defaultStoreCanvas('thankyou', 'Order Confirmed')
  },
  {
    id: 'sp_6',
    name: 'Contact Us',
    nameAr: 'اتصل بنا والدعم',
    path: '/contact-us',
    type: 'contact',
    views: 640,
    uniqueViews: 520,
    optins: 85,
    optinRate: '13.2%',
    orders: 12,
    salesRate: '1.8%',
    salesQty: 14,
    salesAmount: 1450,
    avgCartValue: 120,
    earningsPerView: 2.26,
    uniqueEarningsPerView: 2.78,
    icon: 'PhoneCall',
    thumbnail: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=400&auto=format&fit=crop&q=80',
    page: { ...DEFAULT_PAGE },
    canvas: defaultStoreCanvas('contact', 'Contact Us')
  },
  {
    id: 'sp_7',
    name: 'Home',
    nameAr: 'الصفحة الرئيسية للمتجر',
    path: '/',
    type: 'home',
    views: 5820,
    uniqueViews: 4600,
    optins: 450,
    optinRate: '7.7%',
    orders: 210,
    salesRate: '3.6%',
    salesQty: 290,
    salesAmount: 28400,
    avgCartValue: 135,
    earningsPerView: 4.87,
    uniqueEarningsPerView: 6.17,
    icon: 'Home',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80',
    page: { ...DEFAULT_PAGE },
    canvas: defaultStoreCanvas('home', 'Welcome to Our Store')
  }
];

export const INITIAL_STORE_SALES = [
  {
    id: 'tx_101',
    customer: 'Omar Al-Mansouri',
    customerAr: 'عمر المنصوري',
    email: 'omar.mansouri@gmail.com',
    productName: 'Modern Ergonomic Office Chair',
    productNameAr: 'كرسي مريح فاخر للمكتب والعمل',
    transactionId: 'txn_982347102938',
    amount: '$249.00',
    step: 'Checkout',
    stepAr: 'إتمام الطلب',
    purchaseDate: 'Aug 29, 2026 05:42 AM',
    status: 'Completed'
  },
  {
    id: 'tx_102',
    customer: 'Sarah Al-Khatib',
    customerAr: 'سارة الخطيب',
    email: 'sarah.khatib@outlook.com',
    productName: 'Minimalist Oak Coffee Table',
    productNameAr: 'طاولة قهوة خشب بلوط مودرن',
    transactionId: 'txn_872361928374',
    amount: '$189.00',
    step: 'Checkout',
    stepAr: 'إتمام الطلب',
    purchaseDate: 'Aug 28, 2026 08:15 PM',
    status: 'Completed'
  },
  {
    id: 'tx_103',
    customer: 'Khalid Ben Zaid',
    customerAr: 'خالد بن زيد',
    email: 'khalid.zaid@gmail.com',
    productName: 'Nordic Velvet 3-Seater Sofa',
    productNameAr: 'كنبة مخمل نورديك 3 مقاعد',
    transactionId: 'txn_771928374619',
    amount: '$890.00',
    step: 'Checkout',
    stepAr: 'إتمام الطلب',
    purchaseDate: 'Aug 27, 2026 02:30 PM',
    status: 'Completed'
  },
  {
    id: 'tx_104',
    customer: 'Layla Mahmoud',
    customerAr: 'ليلى محمود',
    email: 'layla.m@gmail.com',
    productName: 'Ceramic Table Lamp with Linen Shade',
    productNameAr: 'أباجورة طاولة سيراميك بقماش كتان',
    transactionId: 'txn_662819283741',
    amount: '$79.00',
    step: 'Checkout',
    stepAr: 'إتمام الطلب',
    purchaseDate: 'Aug 26, 2026 11:10 AM',
    status: 'Completed'
  }
];

export const STORE_TEMPLATES_LIST = [
  {
    id: 'tmpl_furniture',
    name: 'قالب لعرض منتجات الاثاث المنزلي مميز',
    nameEn: 'Luxury Home Furniture & Decor Store',
    category: 'Home & Living',
    categoryAr: 'الأثاث والديكور',
    pagesCount: 6,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
    badge: 'Popular',
    description: 'High-converting e-commerce store with catalog, 3D gallery blocks, instant cart, and checkout.',
    descriptionAr: 'متجر احترافي عالي التحويل مع كاتالوج كامل، كتل استعراض ثلاثية الأبعاد، وسلة فورية ودفع مباشر.'
  },
  {
    id: 'tmpl_fashion',
    name: 'قالب لمنتجات الملابس مميز',
    nameEn: 'Modern Fashion & Apparel Boutique',
    category: 'Fashion',
    categoryAr: 'الأزياء والملابس',
    pagesCount: 8,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
    badge: 'Trending',
    description: 'Sleek clothing brand store with size selectors, color swatches, lookbooks, and flash sales.',
    descriptionAr: 'متجر عصري لعلامات الأزياء مع محدد المقاسات، ألوان متعددة، ومجموعات تخفيضات موسمية.'
  },
  {
    id: 'tmpl_electronics',
    name: 'متجر الإلكترونيات والأجهزة الذكية',
    nameEn: 'Smart Electronics & Tech Store',
    category: 'Technology',
    categoryAr: 'التكنولوجيا والأجهزة',
    pagesCount: 7,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    badge: 'New',
    description: 'Feature comparison tables, tech specs highlights, bundle discounts, and fast checkout.',
    descriptionAr: 'جداول مقارنة المواصفات، عروض الباقات الذكية، وإتمام طلب فائق السرعة.'
  },
  {
    id: 'tmpl_beauty',
    name: 'متجر مستحضرات التجميل والعناية',
    nameEn: 'Beauty & Skincare Cosmetics Store',
    category: 'Beauty',
    categoryAr: 'الجمال والعناية',
    pagesCount: 7,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    badge: 'Hot',
    description: 'Aesthetic pastel design, ingredient breakdowns, customer before/after reviews, and subscriptions.',
    descriptionAr: 'تصميم جمالي ناعم، تفاصيل المكونات، تقييمات العملاء قبل وبعد، وخيارات الاشتراك الدوري.'
  }
];

export const INITIAL_STORES_DATA = [];

const PAGE_TYPES = [
  { type: 'home', name: 'Home', nameAr: 'الرئيسية', path: '/' },
  { type: 'catalog', name: 'Products', nameAr: 'المنتجات', path: '/products' },
  { type: 'product_detail', name: 'Product details', nameAr: 'تفاصيل المنتج', path: '/product-details' },
  { type: 'cart', name: 'Cart', nameAr: 'السلة', path: '/cart' },
  { type: 'checkout', name: 'Checkout', nameAr: 'الدفع', path: '/checkout' },
  { type: 'thankyou', name: 'Thank you', nameAr: 'شكراً لك', path: '/thank-you' },
  { type: 'contact', name: 'Contact', nameAr: 'تواصل معنا', path: '/contact-us' }
];

export const STORE_TEMPLATE_THEMES = {
  tmpl_furniture: {
    brand: 'Atelier Home',
    heroTitle: 'Furniture made for living',
    heroSubtitle: 'Warm wood, quiet lines, and pieces that last.',
    heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&auto=format&fit=crop&q=80',
    headerBg: '#faf8f5',
    headerColor: '#3f2e1f'
  },
  tmpl_fashion: {
    brand: 'Noir Studio',
    heroTitle: 'New season looks',
    heroSubtitle: 'Tailored essentials for everyday confidence.',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
    headerBg: '#111111',
    headerColor: '#ffffff'
  },
  tmpl_electronics: {
    brand: 'Pulse Tech',
    heroTitle: 'Smarter gear, ready today',
    heroSubtitle: 'Headphones, watches, and home tech that just works.',
    heroImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    headerBg: '#0f172a',
    headerColor: '#e2e8f0'
  },
  tmpl_beauty: {
    brand: 'Lumen Skin',
    heroTitle: 'Glow, simplified',
    heroSubtitle: 'Clean formulas for calm, hydrated skin.',
    heroImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&auto=format&fit=crop&q=80',
    headerBg: '#fff7f5',
    headerColor: '#4a2c2a'
  }
};

export const STORE_TEMPLATE_PRODUCTS = {
  tmpl_furniture: INITIAL_STORE_PRODUCTS,
  tmpl_fashion: [
    { id: 'prod_f1', name: 'Oversized Wool Coat', nameAr: 'معطف صوف واسع', type: 'Physical', typeAr: 'منتج ملموس', price: 189, compareAtPrice: 240, currency: 'USD', inventory: 18, status: 'active', category: 'Apparel', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&auto=format&fit=crop&q=80', updatedOn: 'Aug 28, 2026 04:12 PM', priority: 1, description: 'Heavyweight wool blend with a relaxed silhouette and hidden buttons.' },
    { id: 'prod_f2', name: 'Silk Slip Dress', nameAr: 'فستان حرير ناعم', type: 'Physical', typeAr: 'منتج ملموس', price: 129, compareAtPrice: 160, currency: 'USD', inventory: 24, status: 'active', category: 'Apparel', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80', updatedOn: 'Aug 27, 2026 02:45 PM', priority: 2, description: 'Bias-cut silk with adjustable straps and a lined bodice.' },
    { id: 'prod_f3', name: 'Leather Crossbody Bag', nameAr: 'حقيبة جلد كروس', type: 'Physical', typeAr: 'منتج ملموس', price: 98, compareAtPrice: 125, currency: 'USD', inventory: 30, status: 'active', category: 'Accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80', updatedOn: 'Aug 25, 2026 11:30 AM', priority: 3, description: 'Full-grain leather, magnetic flap, and an adjustable strap.' },
    { id: 'prod_f4', name: 'Minimal Sneakers', nameAr: 'سنيكرز مينيمال', type: 'Physical', typeAr: 'منتج ملموس', price: 115, compareAtPrice: 145, currency: 'USD', inventory: 40, status: 'active', category: 'Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', updatedOn: 'Aug 22, 2026 09:10 AM', priority: 4, description: 'Cushioned sole, clean leather upper, and all-day comfort.' }
  ],
  tmpl_electronics: [
    { id: 'prod_e1', name: 'Wireless Noise-Canceling Headphones', nameAr: 'سماعات لاسلكية عازلة للضجيج', type: 'Physical', typeAr: 'منتج ملموس', price: 219, compareAtPrice: 279, currency: 'USD', inventory: 35, status: 'active', category: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', updatedOn: 'Aug 28, 2026 04:12 PM', priority: 1, description: '40 hours of battery, adaptive ANC, and a fold-flat case.' },
    { id: 'prod_e2', name: 'Smart Fitness Watch', nameAr: 'ساعة لياقة ذكية', type: 'Physical', typeAr: 'منتج ملموس', price: 159, compareAtPrice: 199, currency: 'USD', inventory: 50, status: 'active', category: 'Wearables', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', updatedOn: 'Aug 27, 2026 02:45 PM', priority: 2, description: 'Heart-rate tracking, GPS, and a bright always-on display.' },
    { id: 'prod_e3', name: 'Portable Bluetooth Speaker', nameAr: 'سماعة بلوتوث محمولة', type: 'Physical', typeAr: 'منتج ملموس', price: 79, compareAtPrice: 99, currency: 'USD', inventory: 60, status: 'active', category: 'Audio', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80', updatedOn: 'Aug 25, 2026 11:30 AM', priority: 3, description: 'IPX7 waterproof body with 12-hour playback.' },
    { id: 'prod_e4', name: 'USB-C Hub 7-in-1', nameAr: 'محول USB-C متعدد المنافذ', type: 'Physical', typeAr: 'منتج ملموس', price: 49, compareAtPrice: 69, currency: 'USD', inventory: 80, status: 'active', category: 'Accessories', image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=600&auto=format&fit=crop&q=80', updatedOn: 'Aug 22, 2026 09:10 AM', priority: 4, description: 'HDMI 4K, SD card, and 100W pass-through charging.' }
  ],
  tmpl_beauty: [
    { id: 'prod_b1', name: 'Daily Hydrating Serum', nameAr: 'سيروم ترطيب يومي', type: 'Physical', typeAr: 'منتج ملموس', price: 42, compareAtPrice: 55, currency: 'USD', inventory: 70, status: 'active', category: 'Skincare', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80', updatedOn: 'Aug 28, 2026 04:12 PM', priority: 1, description: 'Hyaluronic acid and ceramides for a dewy, calm finish.' },
    { id: 'prod_b2', name: 'Gentle Cream Cleanser', nameAr: 'غسول كريمي لطيف', type: 'Physical', typeAr: 'منتج ملموس', price: 28, compareAtPrice: 36, currency: 'USD', inventory: 90, status: 'active', category: 'Skincare', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80', updatedOn: 'Aug 27, 2026 02:45 PM', priority: 2, description: 'Removes makeup without stripping the skin barrier.' },
    { id: 'prod_b3', name: 'Mineral SPF 50', nameAr: 'واقي شمس معدني', type: 'Physical', typeAr: 'منتج ملموس', price: 34, compareAtPrice: 44, currency: 'USD', inventory: 55, status: 'active', category: 'Skincare', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&auto=format&fit=crop&q=80', updatedOn: 'Aug 25, 2026 11:30 AM', priority: 3, description: 'Sheer zinc formula that sits well under makeup.' },
    { id: 'prod_b4', name: 'Overnight Repair Mask', nameAr: 'ماسك إصلاح ليلي', type: 'Physical', typeAr: 'منتج ملموس', price: 38, compareAtPrice: 48, currency: 'USD', inventory: 40, status: 'active', category: 'Skincare', image: 'https://images.unsplash.com/photo-1571875257727-256c6bd27f5d?w=600&auto=format&fit=crop&q=80', updatedOn: 'Aug 22, 2026 09:10 AM', priority: 4, description: 'Niacinamide overnight treatment for a brighter morning.' }
  ]
};

function stampPages(theme) {
  return PAGE_TYPES.map((meta, idx) => ({
    id: 'sp_' + (idx + 1) + '_' + Date.now(),
    name: meta.name,
    nameAr: meta.nameAr,
    path: meta.path,
    type: meta.type,
    views: 0,
    uniqueViews: 0,
    optins: 0,
    orders: 0,
    salesAmount: 0,
    page: { ...DEFAULT_PAGE },
    canvas: defaultStoreCanvas(meta.type, meta.name, theme)
  }));
}

export function pickTemplateFromNiche(niche = '') {
  const n = String(niche || '').toLowerCase();
  if (/fashion|cloth|apparel|outfit|ملابس|أزياء/.test(n)) return 'tmpl_fashion';
  if (/tech|electron|gadget|phone|إلكتر/.test(n)) return 'tmpl_electronics';
  if (/beauty|skin|cosmetic|makeup|تجميل|عناية/.test(n)) return 'tmpl_beauty';
  return 'tmpl_furniture';
}

export function createLiveStore({ name, templateId, blank = false, ownerUid = '' }) {
  const tmpl = STORE_TEMPLATES_LIST.find((t) => t.id === templateId);
  const theme = {
    ...(STORE_TEMPLATE_THEMES[templateId] || {}),
    brand: name || STORE_TEMPLATE_THEMES[templateId]?.brand || 'My Store'
  };
  const nowStr = new Date().toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return {
    id: 'store_' + Date.now(),
    name: name || tmpl?.nameEn || theme.brand || 'New Store',
    lastUpdated: nowStr,
    domain: '',
    domainStatus: '',
    kind: 'store',
    ownerUid: ownerUid || '',
    published: false,
    templateId: templateId || '',
    pages: stampPages(theme),
    products: blank ? [] : JSON.parse(JSON.stringify(STORE_TEMPLATE_PRODUCTS[templateId] || [])),
    sales: [],
    settings: {
      currency: 'USD',
      shippingFee: 15,
      freeShippingOver: 150,
      allowCashOnDelivery: true,
      stripeEnabled: true,
      paypalEnabled: true,
      storeEmail: '',
      storePhone: '',
      taxRate: 5
    }
  };
}

