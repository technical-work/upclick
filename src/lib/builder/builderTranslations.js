'use client';

export const BUILDER_I18N = {
  ar: {
    // Header
    back: 'رجوع',
    saved: 'تم الحفظ',
    saving: 'جاري الحفظ...',
    hideDrawer: 'إخفاء القائمة',
    showDrawer: '+ إضافة عناصر',
    desktop: 'عرض الكمبيوتر',
    mobile: 'عرض الجوال',
    undo: 'تراجع (Ctrl+Z)',
    redo: 'إعادة (Ctrl+Y)',
    css: 'تنسيقات CSS',
    preview: 'معاينة',
    publish: 'نشر الصفحة',
    langToggle: 'English',

    // Drawer Tabs
    tabRows: 'الأعمدة',
    tabElements: 'العناصر',
    tabPrebuilt: 'قوالب جاهزة',
    tabInspector: 'التخصيص',
    tabPage: 'الصفحة',

    // Drawer Titles
    titleInspector: 'تخصيص العنصر المحدد',
    titlePage: 'إعدادات الصفحة العامة',
    titlePrebuilt: 'الأقسام والقوالب الجاهزة',
    titleRows: 'تخطيط الأعمدة والصفوف',
    titleElements: 'إضافة العناصر والمكونات',

    // Rows & Columns Tab
    rowsDesc: 'أضف صفاً، ثم اسحب أي عنصر داخل الأعمدة. يمكنك إضافة أعمدة إضافية، وتكديس الصفوف، ووضع أكثر من عنصر داخل نفس العمود.',
    col1Label: 'عمود واحد (1 Column)',
    col1Hint: 'عرض كامل للمحتوى من الطرف للطرف',
    col2Label: 'عمودان (2 Columns)',
    col2Hint: 'تخطيط مقسوم بالتساوي (50% / 50%)',
    col3Label: '3 أعمدة (3 Columns)',
    col3Hint: 'توزيع ثلاثي للميزات والخدمات',
    col4Label: '4 أعمدة (4 Columns)',
    col4Hint: 'توزيع رباعي للإحصائيات والأيقونات',

    // Elements Tab
    searchElements: 'ابحث عن أي عنصر...',
    allSections: 'جميع الأقسام',
    layouts: 'تصميم',

    // Inspector Tab
    noElementSelected: 'لم يتم تحديد أي عنصر',
    clickBlockToEdit: 'انقر على أي بلوك أو عنصر في الصفحة لتعديل نصوصه وألوانه وروابطه.',
    editing: 'تعديل',
    columnTargetNotice: 'سيتم إدراج العناصر الجديدة داخل العمود المحدد حالياً.',
    addAnotherColumn: '+ إضافة عمود جديد للصف',
    fullscreenHtmlNotice: 'يتم احتواء عناصر الـ iFrame داخل هذه المساحة أثناء التحرير. استخدم المعاينة أو النشر لمشاهدة العرض الفعلي.',

    // Page Settings Tab
    pageBg: 'لون خلفية الصفحة',
    pageTextColor: 'لون الخط الافتراضي',
    pageMaxWidth: 'أقصى عرض للمحتوى (px)',
    pagePaddingY: 'الهامش الرأسي أعلى/أسفل (px)',
    pagePaddingX: 'الهامش الجانبي يمين/يسار (px)',
    fontFamily: 'نوع الخط الرئيسي',
    brandingFooterOn: 'شارة UpKlick في الفوتر: مفعّلة',
    brandingFooterOff: 'شارة UpKlick في الفوتر: معطّلة',

    // Canvas Prompts
    section: 'قسم (SECTION)',
    row: 'صف',
    columns: 'أعمدة',
    column: 'عمود',
    dropHere: 'أفلت العنصر هنا',
    emptyCanvasTitle: 'ابدأ بإضافة صف ثم اسحب العناصر داخله',
    emptyCanvasDesc: 'اختر 1، 2، 3 أو 4 أعمدة. يمكنك وضع عدة عناصر مختلفة في نفس العمود.',
    addElement: '+ إضافة عنصر',
    addRow: '+ إضافة صف جديد',
    addRowInCol: '+ إضافة صف داخل هذا العمود',

    // Modals
    customCssTitle: 'تنسيقات CSS المخصصة للصفحة',
    applyCss: 'تطبيق التنسيقات',
    pagePublishedTitle: 'تم نشر الصفحة بنجاح! 🚀',
    pagePublishedDesc: 'رابط الإنتاج هو النسخة الحية المتاحة للزوار، بينما الرابط المحفوظ يعرض آخر التعديلات فوراً.',
    publishedUrl: 'رابط الإنتاج المباشر (Published URL)',
    savedUrl: 'رابط المسودة المحفوظة (Saved URL)',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    openPublished: 'فتح رابط الإنتاج في نافذة جديدة',
    openSaved: 'فتح رابط المعاينة المحفوظة',
    returnDashboard: 'العودة للوحة التحكم',

    // Style properties
    textColor: 'لون النص',
    background: 'الخلفية',
    fontSize: 'حجم الخط',
    fontWeight: 'سُمك الخط',
    alignment: 'المحاذاة',
    padding: 'الهامش الداخلي (Padding)',
    margin: 'الهامش الخارجي (Margin)',
    borderRadius: 'انحناء الحواف',
    maxWidth: 'أقصى عرض',
    boxShadow: 'تفعيل الظلال',
    left: 'يسار',
    center: 'وسط',
    right: 'يمين',
    addItem: '+ إضافة عنصر',
    item: 'عنصر',
    addOption: '+ إضافة خيار جديد',
    optionsTitle: 'خيارات القائمة المنسدلة / الاختيارات',
    optionsDesc: 'اكتب الخيارات التي ستظهر للمستخدم للاختيار منها',
    quickAdd: '+ إضافة سريعة',
    quickAddPlaceholder: 'اكتب خيارات متعددة مفصولة بفواصل واضغط إضافة...'
  },
  en: {
    // Header
    back: 'Back',
    saved: 'Saved',
    saving: 'Saving...',
    hideDrawer: 'Hide drawer',
    showDrawer: '+ Add element',
    desktop: 'Desktop view',
    mobile: 'Mobile view',
    undo: 'Undo (Ctrl+Z)',
    redo: 'Redo (Ctrl+Y)',
    css: 'CSS',
    preview: 'Preview',
    publish: 'Publish',
    langToggle: 'عربي',
    addOption: '+ Add new option',
    optionsTitle: 'Options / Choices list',
    optionsDesc: 'Enter the choices that will appear in this dropdown or list',
    quickAdd: '+ Quick Add',
    // Drawer Tabs
    tabRows: 'Rows',
    tabElements: 'Elements',
    tabPrebuilt: 'Prebuilt',
    tabInspector: 'Inspector',
    tabPage: 'Page',

    // Drawer Titles
    titleInspector: 'Customize element',
    titlePage: 'Page settings',
    titlePrebuilt: 'Prebuilt sections',
    titleRows: 'Rows & columns',
    titleElements: 'Add any element',

    // Rows & Columns Tab
    rowsDesc: 'Add a row, then drop any elements inside each column. You can add more columns, stack extra rows, and put more than one block in the same column.',
    col1Label: '1 Column',
    col1Hint: 'Full-width stack',
    col2Label: '2 Columns',
    col2Hint: 'Side by side',
    col3Label: '3 Columns',
    col3Hint: 'Three across',
    col4Label: '4 Columns',
    col4Hint: 'Four across',

    // Elements Tab
    searchElements: 'Search elements...',
    allSections: 'All sections',
    layouts: 'layouts',

    // Inspector Tab
    noElementSelected: 'No element selected',
    clickBlockToEdit: 'Click any block on the canvas to edit every field.',
    editing: 'Editing',
    columnTargetNotice: 'New elements will drop into the selected column.',
    addAnotherColumn: '+ Add another column',
    fullscreenHtmlNotice: 'Fullscreen / fixed iframes stay inside this block while you edit. Use Preview or Publish to see them cover the live page.',

    // Page Settings Tab
    pageBg: 'Page background',
    pageTextColor: 'Default text',
    pageMaxWidth: 'Content width',
    pagePaddingY: 'Vertical padding',
    pagePaddingX: 'Side padding',
    fontFamily: 'Font family',
    brandingFooterOn: 'Branding footer on',
    brandingFooterOff: 'Branding footer off',

    // Canvas Prompts
    section: 'SECTION',
    row: 'ROW',
    columns: 'COLUMNS',
    column: 'COLUMN',
    dropHere: 'Drop here',
    emptyCanvasTitle: 'Add a row, then drop elements into columns',
    emptyCanvasDesc: '1, 2, 3 or 4 columns. Stack extra rows. Put many blocks in the same column.',
    addElement: '+ Add element',
    addRow: '+ Add row',
    addRowInCol: '+ Add row in this column',

    // Modals
    customCssTitle: 'Custom page CSS',
    applyCss: 'Apply CSS',
    pagePublishedTitle: 'Page published',
    pagePublishedDesc: 'Published URL is the live snapshot. Saved URL always shows your latest edits.',
    publishedUrl: 'Published URL',
    savedUrl: 'Saved URL',
    copy: 'Copy',
    copied: 'Copied',
    openPublished: 'Open published URL',
    openSaved: 'Open saved URL',
    returnDashboard: 'Return to dashboard',

    // Style properties
    textColor: 'Text color',
    background: 'Background',
    fontSize: 'Font size',
    fontWeight: 'Font weight',
    alignment: 'Alignment',
    padding: 'Padding',
    margin: 'Margin',
    borderRadius: 'Border radius',
    maxWidth: 'Max width',
    boxShadow: 'Box shadow',
    left: 'Left',
    center: 'Center',
    right: 'Right',
    addItem: '+ Add item',
    item: 'Item'
  }
};

export const ELEMENT_LABELS_I18N = {
  headline: { ar: 'عنوان رئيسي', en: 'Headline' },
  subheadline: { ar: 'عنوان فرعي', en: 'Sub-headline' },
  paragraph: { ar: 'فقرة نصية', en: 'Paragraph' },
  bullet_list: { ar: 'قائمة نقطية', en: 'Bullet list' },
  numbered_list: { ar: 'قائمة رقمية', en: 'Numbered list' },
  quote: { ar: 'اقتباس / شهادة', en: 'Quote' },
  badge: { ar: 'شارة / وسم', en: 'Badge' },
  notice: { ar: 'تنبيه / إشعار', en: 'Notice / Alert' },
  button: { ar: 'زر تفاعلي (CTA)', en: 'Button' },
  button_group: { ar: 'مجموعة أزرار', en: 'Button group' },
  image: { ar: 'صورة', en: 'Image' },
  video: { ar: 'فيديو (يوتيوب/مضمن)', en: 'Video' },
  photo_gallery: { ar: 'معرض صور', en: 'Photo gallery' },
  embed: { ar: 'تضمين كود / iframe', en: 'Embed / iframe' },
  icon: { ar: 'أيقونة مع نص', en: 'Icon + text' },
  form: { ar: 'نموذج تسجيل / تواصل', en: 'Lead Form' },
  whatsapp_button: { ar: 'زر تواصل واتساب', en: 'WhatsApp Button' },
  countdown: { ar: 'عداد تنازلي للوقت', en: 'Countdown timer' },
  pricing_cards: { ar: 'جدول أسعار وباقات', en: 'Pricing cards' },
  testimonials: { ar: 'آراء وتقييمات العملاء', en: 'Testimonials' },
  features_grid: { ar: 'شبكة الميزات والخدمات', en: 'Features grid' },
  faq_accordion: { ar: 'الأسئلة الشائعة (FAQ)', en: 'FAQ accordion' },
  divider: { ar: 'فاصل / خط', en: 'Divider' },
  spacer: { ar: 'مساحة فارغة', en: 'Spacer' },
  custom_html: { ar: 'كود HTML مخصص', en: 'Custom HTML' },
  stats_counter: { ar: 'عداد أرقام وإحصائيات', en: 'Stats counter' },
  social_links: { ar: 'روابط السوشيال ميديا', en: 'Social links' },
  store_hero_banner: { ar: 'بانر المتجر الترحيبي', en: 'Store hero banner' },
  store_filter_bar: { ar: 'شريط فلترة وبحث المنتجات', en: 'Store filter bar' },
  store_products_grid: { ar: 'شبكة منتجات المتجر', en: 'Store products grid' },
  store_product_detail: { ar: 'تفاصيل المنتج والشراء', en: 'Product detail block' },
  store_cart: { ar: 'سلة المشتريات', en: 'Shopping cart' },
  store_checkout: { ar: 'صفحة إتمام الدفع (Checkout)', en: 'Store checkout' },
  webinar_registration: { ar: 'بطاقة التسجيل في الويبينار', en: 'Webinar Registration Card' },
  webinar_broadcast_room: { ar: 'غرفة البث المباشر والشات', en: 'Webinar Broadcast Room' },
  webinar_add_to_calendar: { ar: 'أزرار إضافة للتقويم', en: 'Add to Calendar Widget' },
  webinar_speakers: { ar: 'عرض المتحدثين والمدربين', en: 'Webinar Speakers Showcase' },
  webinar_offer_card: { ar: 'بطاقة العرض والخصم الحصري', en: 'Webinar Offer & Checkout Box' }
};

export const CATEGORY_LABELS_I18N = {
  layout: { ar: 'تخطيط وهيكل', en: 'Layout & Structure' },
  text: { ar: 'نصوص وعناوين', en: 'Typography & Text' },
  actions: { ar: 'أزرار وتفاعل', en: 'Buttons & CTA' },
  media: { ar: 'صور ووسائط', en: 'Media & Visuals' },
  forms: { ar: 'نماذج وتواصل', en: 'Forms & Leads' },
  store: { ar: 'عناصر المتجر', en: 'Store Blocks' },
  webinar: { ar: 'الويبينار والبث المباشر', en: 'Webinar & Live Stream' },
  interactive: { ar: 'أدوات تفاعلية', en: 'Interactive Blocks' },
  content: { ar: 'أقسام المحتوى', en: 'Content Sections' }
};

export const FIELD_LABELS_I18N = {
  'content': { ar: 'المحتوى / النص', en: 'Content' },
  'Headline text': { ar: 'نص العنوان الرئيسي', en: 'Headline text' },
  'Sub-headline text': { ar: 'نص العنوان الفرعي', en: 'Sub-headline text' },
  'Paragraph': { ar: 'نص الفقرة', en: 'Paragraph text' },
  'Button label': { ar: 'نص الزر', en: 'Button label' },
  'Click URL': { ar: 'رابط الزر (URL)', en: 'Click URL' },
  'Image URL': { ar: 'رابط الصورة (URL)', en: 'Image URL' },
  'Alt text': { ar: 'النص البديل للصورة', en: 'Alt text' },
  'YouTube / embed URL': { ar: 'رابط الفيديو (YouTube)', en: 'YouTube / embed URL' },
  'Title': { ar: 'العنوان', en: 'Title' },
  'Subtitle': { ar: 'العنوان الفرعي', en: 'Subtitle' },
  'Message': { ar: 'الرسالة', en: 'Message' },
  'Author': { ar: 'صاحب الاقتباس', en: 'Author' },
  'Role': { ar: 'المسمى الوظيفي', en: 'Role' },
  'Badge text': { ar: 'نص الشارة', en: 'Badge text' },
  'List items': { ar: 'عناصر القائمة', en: 'List items' },
  'Steps': { ar: 'الخطوات', en: 'Steps' },
  'Icon color': { ar: 'لون الأيقونة', en: 'Icon color' },
  'Text color': { ar: 'لون النص', en: 'Text color' },
  'Background': { ar: 'لون الخلفية', en: 'Background' },
  'Font size': { ar: 'حجم الخط', en: 'Font size' },
  'Font weight': { ar: 'سُمك الخط', en: 'Font weight' },
  'Alignment': { ar: 'المحاذاة', en: 'Alignment' },
  'Padding': { ar: 'الهامش الداخلي (Padding)', en: 'Padding' },
  'Margin': { ar: 'الهامش الخارجي (Margin)', en: 'Margin' },
  'Border radius': { ar: 'انحناء الحواف (Radius)', en: 'Border radius' },
  'Max width': { ar: 'أقصى عرض (Max width)', en: 'Max width' },
  'Box shadow': { ar: 'تفعيل الظلال', en: 'Box shadow' },
  'Phone number': { ar: 'رقم الواتساب', en: 'Phone number' },
  'End date / time': { ar: 'تاريخ ووقت النهاية', en: 'End date / time' },
  'Columns': { ar: 'عدد الأعمدة', en: 'Columns' },
  'Images': { ar: 'الصور', en: 'Images' },
  'Buttons': { ar: 'الأزرار', en: 'Buttons' },
  'Cards': { ar: 'البطاقات', en: 'Cards' },
  'Features': { ar: 'الميزات', en: 'Features' },
  'Questions': { ar: 'الأسئلة والأجوبة', en: 'Questions' },
  'Form title': { ar: 'عنوان النموذج', en: 'Form title' },
  'Form fields': { ar: 'حقول النموذج', en: 'Form fields' },
  'Submit label': { ar: 'نص زر الإرسال', en: 'Submit label' },
  'Button color': { ar: 'لون الزر', en: 'Button color' },
  'Redirect to URL (optional)': { ar: 'تحويل إلى رابط مخصص (اختياري)', en: 'Redirect to URL (optional)' },
  'Notification Email (optional)': { ar: 'بريد الإشعارات (اختياري)', en: 'Notification Email (optional)' },
  'Success title': { ar: 'عنوان رسالة النجاح', en: 'Success title' },
  'Success message': { ar: 'نص رسالة النجاح', en: 'Success message' },
  'Placeholder': { ar: 'النص التوضيحي', en: 'Placeholder' },
  'Field Type': { ar: 'نوع الحقل', en: 'Field Type' },
  'Width': { ar: 'عرض الحقل', en: 'Width' },
  'Required': { ar: 'حقل إلزامي', en: 'Required' },
  'Label': { ar: 'تسمية الحقل', en: 'Label' },
  'Options / Choices': { ar: 'خيارات القائمة / الاختيارات', en: 'Options / Choices' },
  'options': { ar: 'خيارات القائمة', en: 'Options' },
  'Correct Answer': { ar: 'الإجابة النموذجية الصحيحة', en: 'Correct Answer' },
  'correctAnswer': { ar: 'الإجابة النموذجية الصحيحة', en: 'Correct Answer' },
  'Points': { ar: 'درجة / نقاط السؤال', en: 'Points' },
  'points': { ar: 'درجة / نقاط السؤال', en: 'Points' },
  'Explanation': { ar: 'توضيح وشرح الإجابة', en: 'Answer Explanation' },
  'explanation': { ar: 'توضيح وشرح الإجابة', en: 'Answer Explanation' }
};

export function getBuilderString(key, lang = 'en') {
  const dict = BUILDER_I18N[lang] || BUILDER_I18N.en;
  return dict[key] || BUILDER_I18N.en[key] || key;
}

export function getElementI18nLabel(type, lang = 'en') {
  if (ELEMENT_LABELS_I18N[type]) {
    return lang === 'ar' ? ELEMENT_LABELS_I18N[type].ar : ELEMENT_LABELS_I18N[type].en;
  }
  return type;
}

export function getCategoryI18nLabel(catKey, lang = 'en') {
  if (CATEGORY_LABELS_I18N[catKey]) {
    return lang === 'ar' ? CATEGORY_LABELS_I18N[catKey].ar : CATEGORY_LABELS_I18N[catKey].en;
  }
  return catKey;
}

export function getFieldI18nLabel(fieldKey, fieldLabel, lang = 'en') {
  if (lang === 'ar') {
    if (FIELD_LABELS_I18N[fieldLabel]) return FIELD_LABELS_I18N[fieldLabel].ar;
    if (FIELD_LABELS_I18N[fieldKey]) return FIELD_LABELS_I18N[fieldKey].ar;
  }
  return fieldLabel || fieldKey;
}

export const FIELD_OPTION_LABELS = {
  text: { ar: '📝 نص عادي (Text)', en: '📝 Single Line Text' },
  first_name: { ar: '👤 الاسم الأول (First Name)', en: '👤 First Name' },
  last_name: { ar: '👥 اسم العائلة (Last Name)', en: '👥 Last Name' },
  full_name: { ar: '👤 الاسم الكامل (Full Name)', en: '👤 Full Name' },
  email: { ar: '✉️ البريد الإلكتروني (Email)', en: '✉️ Email Address' },
  phone: { ar: '📞 رقم الهاتف / واتساب (Phone)', en: '📞 Phone Number' },
  number: { ar: '🔢 رقم / كمية (Number)', en: '🔢 Number' },
  textarea: { ar: '📄 نص متعدد الأسطر (Textarea)', en: '📄 Multi-line Textarea' },
  date_of_birth: { ar: '📅 تاريخ الميلاد / تاريخ (Date)', en: '📅 Date of Birth / Date' },
  date: { ar: '📅 تاريخ (Date)', en: '📅 Date' },
  dropdown: { ar: '▼ قائمة منسدلة (Dropdown)', en: '▼ Dropdown Select' },
  select: { ar: '▼ قائمة منسدلة (Select)', en: '▼ Select' },
  radio: { ar: '🔘 اختيار مفرد (Radio)', en: '🔘 Radio Choices' },
  checkbox: { ar: '☑️ مربعات اختيار (Checkbox)', en: '☑️ Multiple Checkbox' },
  consent_checkbox: { ar: '🛡️ موافقة SMS والشروط (Consent)', en: '🛡️ SMS & Policy Consent' },
  address: { ar: '📍 العنوان (Street Address)', en: '📍 Street Address' },
  city: { ar: '🏙️ المدينة (City)', en: '🏙️ City' },
  state: { ar: '🗺️ المحافظة / الولاية (State)', en: '🗺️ State / Province' },
  postal_code: { ar: '📮 الرمز البريدي (Postal Code)', en: '📮 Postal / ZIP Code' },
  country: { ar: '🌐 الدولة (Country)', en: '🌐 Country' },
  url: { ar: '🔗 رابط ويب (Website URL)', en: '🔗 Website URL' },
  '100%': { ar: '100% (عرض كامل)', en: '100% (Full Width)' },
  '50%': { ar: '50% (نصف سطر)', en: '50% (Half Width)' }
};

export function getFieldOptionLabel(opt, lang = 'en') {
  if (FIELD_OPTION_LABELS[opt]) {
    return lang === 'ar' ? FIELD_OPTION_LABELS[opt].ar : FIELD_OPTION_LABELS[opt].en;
  }
  return opt;
}
