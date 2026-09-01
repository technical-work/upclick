'use client';

export function uid(prefix = 'el') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const DEFAULT_PAGE = {
  background: '#ffffff',
  textColor: '#0f172a',
  fontFamily: 'DM Sans',
  maxWidth: 1080,
  paddingY: 60,
  paddingX: 20,
  customCss: '',
  showBranding: true
};

const STYLE_FIELDS = [
  { key: 'color', label: 'Text color', type: 'color' },
  { key: 'bg', label: 'Background', type: 'color' },
  { key: 'fontSize', label: 'Font size', type: 'text', placeholder: '32px' },
  { key: 'weight', label: 'Font weight', type: 'select', options: ['400', '500', '600', '700', '800', '900'] },
  { key: 'align', label: 'Alignment', type: 'align' },
  { key: 'padding', label: 'Padding', type: 'text', placeholder: '16px 24px' },
  { key: 'margin', label: 'Margin', type: 'text', placeholder: '16px 0' },
  { key: 'radius', label: 'Border radius', type: 'text', placeholder: '12px' },
  { key: 'maxWidth', label: 'Max width', type: 'text', placeholder: '720px' },
  { key: 'shadow', label: 'Box shadow', type: 'toggle' }
];

export const ELEMENT_REGISTRY = {
  headline: {
    label: 'Headline',
    category: 'text',
    defaults: { content: 'Write a headline that sells', fontSize: '42px', color: '#0f172a', align: 'center', weight: '800', margin: '0 0 12px' },
    fields: [{ key: 'content', label: 'Headline text', type: 'textarea' }, ...STYLE_FIELDS]
  },
  subheadline: {
    label: 'Sub-headline',
    category: 'text',
    defaults: { content: 'Add a supporting line that explains the offer', fontSize: '22px', color: '#334155', align: 'center', weight: '600', margin: '0 0 12px' },
    fields: [{ key: 'content', label: 'Sub-headline text', type: 'textarea' }, ...STYLE_FIELDS]
  },
  paragraph: {
    label: 'Paragraph',
    category: 'text',
    defaults: { content: 'Write your story, offer details, or page copy here. Every word is editable from the inspector.', fontSize: '16px', color: '#475569', align: 'left', weight: '400', margin: '0 0 16px' },
    fields: [{ key: 'content', label: 'Paragraph', type: 'textarea' }, ...STYLE_FIELDS]
  },
  bullet_list: {
    label: 'Bullet list',
    category: 'text',
    defaults: { items: ['Benefit one your visitor cares about', 'Benefit two with a clear outcome', 'Benefit three that removes risk'], color: '#0f172a', iconColor: '#2563eb', fontSize: '15px', align: 'left' },
    fields: [{ key: 'items', label: 'List items', type: 'list' }, { key: 'iconColor', label: 'Icon color', type: 'color' }, ...STYLE_FIELDS]
  },
  numbered_list: {
    label: 'Numbered list',
    category: 'text',
    defaults: { items: ['Step one — get started', 'Step two — customize everything', 'Step three — publish live'], color: '#0f172a', iconColor: '#2563eb', fontSize: '15px' },
    fields: [{ key: 'items', label: 'Steps', type: 'list' }, { key: 'iconColor', label: 'Number color', type: 'color' }, ...STYLE_FIELDS]
  },
  quote: {
    label: 'Quote',
    category: 'text',
    defaults: { content: 'This product paid for itself in the first week.', author: 'Sara Hassan', role: 'Founder', color: '#0f172a', bg: '#f8fafc', align: 'center', radius: '16px', padding: '28px 32px' },
    fields: [{ key: 'content', label: 'Quote', type: 'textarea' }, { key: 'author', label: 'Author', type: 'text' }, { key: 'role', label: 'Role', type: 'text' }, ...STYLE_FIELDS]
  },
  badge: {
    label: 'Badge',
    category: 'text',
    defaults: { content: 'New · Limited spots', color: '#2563eb', bg: '#eff6ff', align: 'center', radius: '999px', padding: '6px 14px', fontSize: '12px', weight: '800' },
    fields: [{ key: 'content', label: 'Badge text', type: 'text' }, ...STYLE_FIELDS]
  },
  notice: {
    label: 'Notice / Alert',
    category: 'text',
    defaults: { content: 'Only 12 spots left this month.', title: 'Limited offer', color: '#9a3412', bg: '#fff7ed', align: 'left', radius: '12px', padding: '14px 16px' },
    fields: [{ key: 'title', label: 'Title', type: 'text' }, { key: 'content', label: 'Message', type: 'textarea' }, ...STYLE_FIELDS]
  },
  button: {
    label: 'Button',
    category: 'actions',
    defaults: { content: 'Get Started Now', bg: '#2563eb', color: '#ffffff', align: 'center', radius: '10px', padding: '16px 36px', link: '', fontSize: '16px', weight: '700' },
    fields: [
      { key: 'content', label: 'Button label', type: 'text' },
      { key: 'link', label: 'Click URL', type: 'url' },
      ...STYLE_FIELDS
    ]
  },
  button_group: {
    label: 'Button group',
    category: 'actions',
    defaults: {
      align: 'center',
      items: [
        { content: 'Start Free', bg: '#2563eb', color: '#ffffff', link: '' },
        { content: 'See Demo', bg: '#ffffff', color: '#2563eb', link: '' }
      ]
    },
    fields: [
      { key: 'align', label: 'Alignment', type: 'align' },
      { key: 'items', label: 'Buttons', type: 'items', itemFields: [
        { key: 'content', label: 'Label', type: 'text' },
        { key: 'link', label: 'URL', type: 'url' },
        { key: 'bg', label: 'Background', type: 'color' },
        { key: 'color', label: 'Text', type: 'color' }
      ]}
    ]
  },
  image: {
    label: 'Image',
    category: 'media',
    defaults: { src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=70', alt: 'Showcase image', radius: '16px', align: 'center', maxWidth: '100%' },
    fields: [{ key: 'src', label: 'Image URL', type: 'url' }, { key: 'alt', label: 'Alt text', type: 'text' }, ...STYLE_FIELDS]
  },
  video: {
    label: 'Video',
    category: 'media',
    defaults: { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Product video', radius: '16px', maxWidth: '760px' },
    fields: [{ key: 'src', label: 'YouTube / embed URL', type: 'url' }, { key: 'title', label: 'Title', type: 'text' }, { key: 'maxWidth', label: 'Max width', type: 'text' }, { key: 'radius', label: 'Radius', type: 'text' }]
  },
  photo_gallery: {
    label: 'Photo gallery',
    category: 'media',
    defaults: {
      columns: 3,
      radius: '12px',
      items: [
        { src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=70', alt: 'Gallery 1' },
        { src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&auto=format&fit=crop&q=70', alt: 'Gallery 2' },
        { src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&auto=format&fit=crop&q=70', alt: 'Gallery 3' }
      ]
    },
    fields: [
      { key: 'columns', label: 'Columns', type: 'select', options: ['2', '3', '4'] },
      { key: 'radius', label: 'Image radius', type: 'text' },
      { key: 'items', label: 'Images', type: 'items', itemFields: [
        { key: 'src', label: 'Image URL', type: 'url' },
        { key: 'alt', label: 'Alt text', type: 'text' }
      ]}
    ]
  },
  embed: {
    label: 'Embed / iframe',
    category: 'media',
    defaults: { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', height: '360px', radius: '12px', title: 'Embedded content' },
    fields: [{ key: 'src', label: 'Embed URL', type: 'url' }, { key: 'height', label: 'Height', type: 'text' }, { key: 'title', label: 'Title', type: 'text' }, { key: 'radius', label: 'Radius', type: 'text' }]
  },
  icon: {
    label: 'Icon + text',
    category: 'media',
    defaults: { icon: '⚡', content: 'Fast setup in minutes', color: '#0f172a', align: 'center', fontSize: '16px', weight: '700' },
    fields: [{ key: 'icon', label: 'Icon / emoji', type: 'text' }, { key: 'content', label: 'Text', type: 'text' }, ...STYLE_FIELDS]
  },
  logo: {
    label: 'Logo',
    category: 'media',
    defaults: { src: '', content: 'UpKlick', fontSize: '28px', color: '#2563eb', align: 'center', weight: '800' },
    fields: [{ key: 'src', label: 'Logo image URL', type: 'url' }, { key: 'content', label: 'Fallback text', type: 'text' }, ...STYLE_FIELDS]
  },
  qr_code: {
    label: 'QR code',
    category: 'media',
    defaults: { value: 'https://app.upklick.co', label: 'Scan to open', size: 160, align: 'center', bg: '#f8fafc', radius: '12px' },
    fields: [{ key: 'value', label: 'QR destination URL', type: 'url' }, { key: 'label', label: 'Caption', type: 'text' }, { key: 'size', label: 'Size (px)', type: 'number' }, ...STYLE_FIELDS]
  },
  map: {
    label: 'Map',
    category: 'media',
    defaults: { src: 'https://maps.google.com/maps?q=Dubai&t=&z=13&ie=UTF8&iwloc=&output=embed', height: '320px', radius: '16px' },
    fields: [{ key: 'src', label: 'Google Maps embed URL', type: 'url' }, { key: 'height', label: 'Height', type: 'text' }, { key: 'radius', label: 'Radius', type: 'text' }]
  },
  form: {
    label: 'Opt-in form',
    category: 'actions',
    defaults: {
      title: 'Get instant access',
      subtitle: 'Enter your details and we will send the next step.',
      buttonText: 'Submit now',
      successTitle: 'Thank you!',
      successText: 'Your submission was received.',
      bg: '#f8fafc',
      color: '#0f172a',
      buttonBg: '#2563eb',
      radius: '16px',
      fields: [
        { label: 'Full Name', type: 'text', placeholder: 'Your name', required: true },
        { label: 'Email Address', type: 'email', placeholder: 'you@email.com', required: true },
        { label: 'Phone Number', type: 'tel', placeholder: '+971 50 000 0000', required: false }
      ]
    },
    fields: [
      { key: 'title', label: 'Form title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'buttonText', label: 'Submit label', type: 'text' },
      { key: 'successTitle', label: 'Success title', type: 'text' },
      { key: 'successText', label: 'Success message', type: 'textarea' },
      { key: 'buttonBg', label: 'Button color', type: 'color' },
      ...STYLE_FIELDS,
      { key: 'fields', label: 'Form fields', type: 'items', itemFields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'placeholder', label: 'Placeholder', type: 'text' },
        { key: 'type', label: 'Type', type: 'select', options: ['text', 'email', 'tel', 'number'] }
      ]}
    ]
  },
  whatsapp_button: {
    label: 'WhatsApp button',
    category: 'actions',
    defaults: { content: 'Chat on WhatsApp', phone: '971500000000', message: 'Hi, I want to know more', bg: '#22c55e', color: '#ffffff', align: 'center', radius: '999px', padding: '14px 28px' },
    fields: [
      { key: 'content', label: 'Button label', type: 'text' },
      { key: 'phone', label: 'Phone (no +)', type: 'text' },
      { key: 'message', label: 'Prefilled message', type: 'textarea' },
      ...STYLE_FIELDS
    ]
  },
  social_icons: {
    label: 'Social icons',
    category: 'actions',
    defaults: {
      align: 'center',
      color: '#0f172a',
      items: [
        { network: 'Instagram', url: 'https://instagram.com' },
        { network: 'YouTube', url: 'https://youtube.com' },
        { network: 'TikTok', url: 'https://tiktok.com' },
        { network: 'X', url: 'https://x.com' }
      ]
    },
    fields: [
      { key: 'align', label: 'Alignment', type: 'align' },
      { key: 'color', label: 'Icon color', type: 'color' },
      { key: 'items', label: 'Profiles', type: 'items', itemFields: [
        { key: 'network', label: 'Network', type: 'text' },
        { key: 'url', label: 'URL', type: 'url' }
      ]}
    ]
  },
  row: {
    label: 'Row',
    category: 'layout',
    defaults: { gap: 16, valign: 'stretch', bg: 'transparent', padding: '10px', columns: [] },
    fields: [
      { key: 'gap', label: 'Column gap', type: 'number' },
      { key: 'valign', label: 'Vertical align', type: 'select', options: ['stretch', 'start', 'center', 'end'] },
      { key: 'bg', label: 'Row background', type: 'color' },
      { key: 'padding', label: 'Padding', type: 'text' }
    ]
  },
  row_1: { label: '1 column', category: 'layout', defaults: {}, fields: [] },
  row_2: { label: '2 columns', category: 'layout', defaults: {}, fields: [] },
  row_3: { label: '3 columns', category: 'layout', defaults: {}, fields: [] },
  row_4: { label: '4 columns', category: 'layout', defaults: {}, fields: [] },
  spacer: {
    label: 'Spacer',
    category: 'layout',
    defaults: { height: '40px', bg: 'transparent' },
    fields: [{ key: 'height', label: 'Height', type: 'text', placeholder: '40px' }, { key: 'bg', label: 'Background', type: 'color' }]
  },
  divider: {
    label: 'Divider',
    category: 'layout',
    defaults: { color: '#e2e8f0', thickness: '1px', maxWidth: '100%', align: 'center' },
    fields: [{ key: 'color', label: 'Color', type: 'color' }, { key: 'thickness', label: 'Thickness', type: 'text' }, { key: 'maxWidth', label: 'Max width', type: 'text' }]
  },
  columns: {
    label: '2 columns',
    category: 'layout',
    defaults: {
      items: [
        { title: 'Left column', text: 'Edit this column title and copy from the inspector.', image: '' },
        { title: 'Right column', text: 'Add an image URL or keep it as text-only.', image: '' }
      ]
    },
    fields: [{ key: 'items', label: 'Columns', type: 'items', itemFields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'text', label: 'Text', type: 'textarea' },
      { key: 'image', label: 'Image URL', type: 'url' }
    ]}]
  },
  columns_3: {
    label: '3 columns',
    category: 'layout',
    defaults: {
      items: [
        { title: 'Plan', text: 'Describe the first benefit.', icon: '🎯' },
        { title: 'Build', text: 'Describe the second benefit.', icon: '🛠️' },
        { title: 'Grow', text: 'Describe the third benefit.', icon: '📈' }
      ]
    },
    fields: [{ key: 'items', label: 'Columns', type: 'items', itemFields: [
      { key: 'icon', label: 'Icon', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'text', label: 'Text', type: 'textarea' }
    ]}]
  },
  testimonials: {
    label: 'Testimonials',
    category: 'social',
    defaults: {
      title: 'What clients say',
      items: [
        { name: 'Nora Al-Rashidi', role: 'Saudi Arabia', quote: 'I launched my first funnel in one afternoon and booked 9 calls.', stars: 5, initial: 'N' },
        { name: 'Ahmed Khalil', role: 'Egypt', quote: 'Every block is editable. It finally feels like a real builder.', stars: 5, initial: 'A' },
        { name: 'Mona Saber', role: 'UAE', quote: 'The live preview matches exactly what I designed.', stars: 5, initial: 'M' }
      ]
    },
    fields: [
      { key: 'title', label: 'Section title', type: 'text' },
      { key: 'items', label: 'Testimonials', type: 'items', itemFields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'role', label: 'Role / location', type: 'text' },
        { key: 'quote', label: 'Quote', type: 'textarea' },
        { key: 'stars', label: 'Stars', type: 'number' },
        { key: 'initial', label: 'Initial', type: 'text' }
      ]}
    ]
  },
  number_counter: {
    label: 'Number counter',
    category: 'social',
    defaults: { number: '10,000+', label: 'Happy customers', color: '#2563eb', align: 'center', fontSize: '48px' },
    fields: [{ key: 'number', label: 'Number', type: 'text' }, { key: 'label', label: 'Caption', type: 'text' }, ...STYLE_FIELDS]
  },
  star_rating: {
    label: 'Star rating',
    category: 'social',
    defaults: { stars: 5, content: 'Rated 4.9/5 by 1,200+ founders', color: '#f59e0b', align: 'center' },
    fields: [{ key: 'stars', label: 'Stars (1-5)', type: 'number' }, { key: 'content', label: 'Caption', type: 'text' }, ...STYLE_FIELDS]
  },
  logo_cloud: {
    label: 'Logo cloud',
    category: 'social',
    defaults: { title: 'Trusted by teams at', items: ['Notion', 'Stripe', 'Figma', 'HubSpot', 'Slack'] },
    fields: [{ key: 'title', label: 'Title', type: 'text' }, { key: 'items', label: 'Brand names', type: 'list' }]
  },
  stats_row: {
    label: 'Stats row',
    category: 'social',
    defaults: {
      items: [
        { number: '500+', label: 'Clients coached' },
        { number: '98%', label: 'Satisfaction' },
        { number: '12+', label: 'Countries' },
        { number: '4.9', label: 'Average rating' }
      ]
    },
    fields: [{ key: 'items', label: 'Stats', type: 'items', itemFields: [
      { key: 'number', label: 'Number', type: 'text' },
      { key: 'label', label: 'Label', type: 'text' }
    ]}]
  },
  team_member: {
    label: 'Team member',
    category: 'social',
    defaults: { name: 'Alex Rivera', role: 'Head of Growth', content: 'I help companies turn traffic into booked calls.', src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=70', bg: '#0b0f19', color: '#ffffff', radius: '16px' },
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'content', label: 'Bio', type: 'textarea' },
      { key: 'src', label: 'Photo URL', type: 'url' },
      ...STYLE_FIELDS
    ]
  },
  pricing_table: {
    label: 'Pricing card',
    category: 'commerce',
    defaults: {
      title: 'Pro Membership',
      price: '$97/mo',
      buttonText: 'Start now',
      buttonLink: '',
      popular: true,
      bg: '#f8fafc',
      color: '#0f172a',
      features: ['Unlimited funnels', 'Custom domain', 'Priority support', 'Conversion analytics']
    },
    fields: [
      { key: 'title', label: 'Plan name', type: 'text' },
      { key: 'price', label: 'Price', type: 'text' },
      { key: 'buttonText', label: 'Button label', type: 'text' },
      { key: 'buttonLink', label: 'Button URL', type: 'url' },
      { key: 'popular', label: 'Highlight as popular', type: 'toggle' },
      { key: 'features', label: 'Features', type: 'list' },
      ...STYLE_FIELDS
    ]
  },
  pricing_grid: {
    label: 'Pricing grid',
    category: 'commerce',
    defaults: {
      title: 'Choose your plan',
      items: [
        { title: 'Starter', price: '$29', features: ['3 funnels', 'Basic analytics', 'Email support'], buttonText: 'Start', popular: false },
        { title: 'Pro', price: '$97', features: ['Unlimited funnels', 'Custom domain', 'Priority support'], buttonText: 'Go Pro', popular: true },
        { title: 'VIP', price: '$197', features: ['Everything in Pro', 'Done-with-you setup', 'Monthly strategy call'], buttonText: 'Talk to us', popular: false }
      ]
    },
    fields: [
      { key: 'title', label: 'Section title', type: 'text' },
      { key: 'items', label: 'Plans', type: 'items', itemFields: [
        { key: 'title', label: 'Name', type: 'text' },
        { key: 'price', label: 'Price', type: 'text' },
        { key: 'buttonText', label: 'Button', type: 'text' },
        { key: 'features', label: 'Features (one per line)', type: 'textarea' }
      ]}
    ]
  },
  product_card: {
    label: 'Product card',
    category: 'commerce',
    defaults: {
      title: 'Signature Offer',
      price: '$297',
      content: 'A complete system to launch, book calls, and close.',
      buttonText: 'Buy now',
      buttonLink: '',
      src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&auto=format&fit=crop&q=70',
      bg: '#ffffff',
      radius: '16px'
    },
    fields: [
      { key: 'title', label: 'Product name', type: 'text' },
      { key: 'price', label: 'Price', type: 'text' },
      { key: 'content', label: 'Description', type: 'textarea' },
      { key: 'src', label: 'Image URL', type: 'url' },
      { key: 'buttonText', label: 'Button label', type: 'text' },
      { key: 'buttonLink', label: 'Button URL', type: 'url' },
      ...STYLE_FIELDS
    ]
  },
  countdown: {
    label: 'Countdown',
    category: 'commerce',
    defaults: { label: 'Limited time offer ends in', hours: 6, minutes: 30, seconds: 0, bg: '#0f172a', color: '#ffffff', radius: '16px' },
    fields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'hours', label: 'Hours', type: 'number' },
      { key: 'minutes', label: 'Minutes', type: 'number' },
      { key: 'seconds', label: 'Seconds', type: 'number' },
      ...STYLE_FIELDS
    ]
  },
  progress_bar: {
    label: 'Progress bar',
    category: 'commerce',
    defaults: { label: 'Spots remaining', value: 72, color: '#2563eb', bg: '#e2e8f0' },
    fields: [{ key: 'label', label: 'Label', type: 'text' }, { key: 'value', label: 'Progress %', type: 'number' }, { key: 'color', label: 'Bar color', type: 'color' }, { key: 'bg', label: 'Track color', type: 'color' }]
  },
  guarantee: {
    label: 'Guarantee',
    category: 'commerce',
    defaults: { title: '30-day money-back guarantee', content: 'If it is not a fit, email us within 30 days for a full refund. No questions asked.', icon: '🛡️', bg: '#ecfdf5', color: '#065f46', radius: '16px', padding: '24px' },
    fields: [{ key: 'icon', label: 'Icon', type: 'text' }, { key: 'title', label: 'Title', type: 'text' }, { key: 'content', label: 'Details', type: 'textarea' }, ...STYLE_FIELDS]
  },
  faq: {
    label: 'FAQ',
    category: 'content',
    defaults: {
      title: 'Frequently asked questions',
      items: [
        { q: 'Can I customize every element?', a: 'Yes. Select any block and edit text, colors, images, links, lists, and layout from the inspector.' },
        { q: 'Does the live page match the builder?', a: 'Yes. The published site uses the same renderer as the canvas, so what you design is what visitors see.' },
        { q: 'Can I add my own sections?', a: 'Add any element, duplicate it, or drop a prebuilt section and then edit every field.' }
      ]
    },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'items', label: 'Questions', type: 'items', itemFields: [
        { key: 'q', label: 'Question', type: 'text' },
        { key: 'a', label: 'Answer', type: 'textarea' }
      ]}
    ]
  },
  features_grid: {
    label: 'Features grid',
    category: 'content',
    defaults: {
      title: 'Everything you need',
      items: [
        { icon: '🎯', title: 'Drag any block', desc: 'Add headlines, forms, pricing, FAQs and more in one click.' },
        { icon: '🎨', title: 'Style everything', desc: 'Colors, type, spacing, radius and alignment are yours to set.' },
        { icon: '⚡', title: 'Publish live', desc: 'Preview and publish the exact page you designed.' }
      ]
    },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'items', label: 'Features', type: 'items', itemFields: [
        { key: 'icon', label: 'Icon', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'desc', label: 'Description', type: 'textarea' }
      ]}
    ]
  },
  icon_box: {
    label: 'Icon box',
    category: 'content',
    defaults: { icon: '🚀', title: 'Launch faster', content: 'Ship a complete funnel page without waiting on a developer.', bg: '#f8fafc', color: '#0f172a', radius: '16px', padding: '24px', align: 'center' },
    fields: [{ key: 'icon', label: 'Icon', type: 'text' }, { key: 'title', label: 'Title', type: 'text' }, { key: 'content', label: 'Text', type: 'textarea' }, ...STYLE_FIELDS]
  },
  cta_banner: {
    label: 'CTA banner',
    category: 'content',
    defaults: { title: 'Ready to grow?', content: 'Build the page, connect your offer, and publish in minutes.', buttonText: 'Start now', buttonLink: '', bg: '#2563eb', color: '#ffffff', radius: '20px', padding: '40px 32px', align: 'center' },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'content', label: 'Text', type: 'textarea' },
      { key: 'buttonText', label: 'Button label', type: 'text' },
      { key: 'buttonLink', label: 'Button URL', type: 'url' },
      ...STYLE_FIELDS
    ]
  },
  navbar: {
    label: 'Navbar',
    category: 'content',
    defaults: {
      brand: 'Your Brand',
      buttonText: 'Get Started',
      buttonLink: '',
      bg: '#ffffff',
      color: '#0f172a',
      items: [
        { label: 'Home', href: '#' },
        { label: 'Offer', href: '#' },
        { label: 'Reviews', href: '#' },
        { label: 'FAQ', href: '#' }
      ]
    },
    fields: [
      { key: 'brand', label: 'Brand name', type: 'text' },
      { key: 'buttonText', label: 'CTA label', type: 'text' },
      { key: 'buttonLink', label: 'CTA URL', type: 'url' },
      { key: 'bg', label: 'Background', type: 'color' },
      { key: 'color', label: 'Text color', type: 'color' },
      { key: 'items', label: 'Links', type: 'items', itemFields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'href', label: 'URL', type: 'url' }
      ]}
    ]
  },
  footer: {
    label: 'Footer',
    category: 'content',
    defaults: {
      brand: 'Your Brand',
      content: 'Helping founders launch high-converting funnels.',
      copyright: '© 2026 Your Brand. All rights reserved.',
      bg: '#0f172a',
      color: '#e2e8f0',
      items: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'Contact', href: '#' }
      ]
    },
    fields: [
      { key: 'brand', label: 'Brand', type: 'text' },
      { key: 'content', label: 'Blurb', type: 'textarea' },
      { key: 'copyright', label: 'Copyright', type: 'text' },
      { key: 'bg', label: 'Background', type: 'color' },
      { key: 'color', label: 'Text color', type: 'color' },
      { key: 'items', label: 'Links', type: 'items', itemFields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'href', label: 'URL', type: 'url' }
      ]}
    ]
  },
  hero: {
    label: 'Hero block',
    category: 'content',
    defaults: {
      badge: 'New for 2026',
      title: 'Build pages that convert',
      content: 'Add any element, customize every field, and publish a live funnel that matches your brand.',
      buttonText: 'Create your page',
      buttonLink: '',
      secondaryText: 'Watch demo',
      secondaryLink: '',
      bg: '#0b0f19',
      color: '#ffffff',
      radius: '20px',
      padding: '64px 36px',
      align: 'center'
    },
    fields: [
      { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'title', label: 'Headline', type: 'textarea' },
      { key: 'content', label: 'Subcopy', type: 'textarea' },
      { key: 'buttonText', label: 'Primary button', type: 'text' },
      { key: 'buttonLink', label: 'Primary URL', type: 'url' },
      { key: 'secondaryText', label: 'Secondary button', type: 'text' },
      { key: 'secondaryLink', label: 'Secondary URL', type: 'url' },
      ...STYLE_FIELDS
    ]
  },
  about_split: {
    label: 'About split',
    category: 'content',
    defaults: {
      title: 'Meet the founder',
      content: 'I built this after launching 40+ funnels for coaches and creators. Every block on this page is editable so you can tell your story your way.',
      buttonText: 'Work with me',
      buttonLink: '',
      src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=70',
      items: ['3+ years in the field', '500+ documented results', 'Built for Arabic & English markets']
    },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'content', label: 'Story', type: 'textarea' },
      { key: 'src', label: 'Photo URL', type: 'url' },
      { key: 'buttonText', label: 'Button label', type: 'text' },
      { key: 'buttonLink', label: 'Button URL', type: 'url' },
      { key: 'items', label: 'Highlights', type: 'list' }
    ]
  },
  calendar_cta: {
    label: 'Booking CTA',
    category: 'actions',
    defaults: { title: 'Book a strategy call', content: 'Pick a time that works. We will review your offer and funnel live.', buttonText: 'Open calendar', buttonLink: '', bg: '#eff6ff', color: '#0f172a', radius: '16px' },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'content', label: 'Text', type: 'textarea' },
      { key: 'buttonText', label: 'Button label', type: 'text' },
      { key: 'buttonLink', label: 'Calendar URL', type: 'url' },
      ...STYLE_FIELDS
    ]
  },
  code: {
    label: 'Custom HTML',
    category: 'content',
    defaults: { code: '<div style="background:#0f172a;color:#38bdf8;padding:28px;border-radius:14px;text-align:center;font-weight:700;">Your custom HTML / CSS lives here.</div>' },
    fields: [{ key: 'code', label: 'HTML', type: 'code' }]
  },
  prebuilt_template: {
    label: 'Prebuilt section',
    category: 'content',
    defaults: { category: 'About', title: "Hey, I'm Name!", subtitle: 'I lead growth strategy for scaling companies.', bg: '#0b0f19', color: '#ffffff', buttonText: 'Let’s talk', buttonLink: '' },
    fields: [
      { key: 'category', label: 'Eyebrow', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'buttonText', label: 'Button label', type: 'text' },
      { key: 'buttonLink', label: 'Button URL', type: 'url' },
      ...STYLE_FIELDS
    ]
  },
  store_header: {
    label: 'Store Header',
    category: 'commerce',
    defaults: {
      brand: 'My Store',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Contact', href: '/contact-us' }
      ],
      cartCount: 0,
      bg: '#ffffff',
      color: '#0f172a'
    },
    fields: [
      { key: 'brand', label: 'Store Name', type: 'text' },
      { key: 'cartCount', label: 'Cart Badge Count', type: 'number' },
      { key: 'bg', label: 'Background', type: 'color' },
      { key: 'color', label: 'Text color', type: 'color' }
    ]
  },
  store_hero_banner: {
    label: 'Store Hero Banner',
    category: 'commerce',
    defaults: {
      title: 'Our Products',
      subtitle: 'Hey there — welcome in!',
      bgImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80',
      color: '#ffffff',
      height: '280px',
      showSearch: true,
      searchPlaceholder: 'Search'
    },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'bgImage', label: 'Banner Image URL', type: 'url' },
      { key: 'height', label: 'Height', type: 'text' },
      { key: 'showSearch', label: 'Show Search Bar', type: 'toggle' }
    ]
  },
  store_filter_bar: {
    label: 'Store Filter & Sort Bar',
    category: 'commerce',
    defaults: {
      totalProducts: 13,
      sortOption: 'Featured',
      filterInStock: true,
      filterPriceRange: '$1 - $1000'
    },
    fields: [
      { key: 'totalProducts', label: 'Product Count', type: 'number' },
      { key: 'sortOption', label: 'Default Sort', type: 'select', options: ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest'] }
    ]
  },
  store_products_grid: {
    label: 'Store Products Grid',
    category: 'commerce',
    defaults: {
      columns: 4,
      items: [
        {
          id: 'p1',
          title: 'Product title',
          price: 99.9,
          compareAtPrice: 148.08,
          discount: '33% off',
          rating: 4.3,
          reviewsCount: 45,
          image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80',
          badge1: 'Subscription',
          badge2: '7 day free trial'
        },
        {
          id: 'p2',
          title: 'Product title',
          price: 99.9,
          compareAtPrice: 148.08,
          discount: '33% off',
          rating: 4.3,
          reviewsCount: 45,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
          badge1: 'Subscription',
          badge2: '7 day free trial'
        },
        {
          id: 'p3',
          title: 'Product title',
          price: 99.9,
          compareAtPrice: 148.08,
          discount: '33% off',
          rating: 4.3,
          reviewsCount: 45,
          image: 'https://images.unsplash.com/photo-1580481077195-c266a4f10738?w=600&auto=format&fit=crop&q=80',
          badge1: 'Subscription',
          badge2: '7 day free trial'
        },
        {
          id: 'p4',
          title: 'Product title',
          price: 99.9,
          compareAtPrice: 148.08,
          discount: '33% off',
          rating: 4.3,
          reviewsCount: 45,
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
          badge1: 'Subscription',
          badge2: '7 day free trial'
        }
      ]
    },
    fields: [
      { key: 'columns', label: 'Columns (Desktop)', type: 'select', options: ['2', '3', '4'] }
    ]
  },
  store_product_detail: {
    label: 'Product Details View',
    category: 'commerce',
    defaults: {
      title: 'Modern Ergonomic Office Chair',
      price: 249,
      compareAtPrice: 320,
      rating: 4.8,
      reviewsCount: 124,
      image: 'https://images.unsplash.com/photo-1580481077195-c266a4f10738?w=800&auto=format&fit=crop&q=80',
      description: 'Engineered for all-day comfort with 3D lumbar support, breathable mesh back, and multi-angle recline lock.',
      features: ['Adjustable 3D Armrests', 'Breathable High-Density Mesh', 'Heavy-Duty Aluminum Base', '10-Year Warranty & Free Shipping']
    },
    fields: [
      { key: 'title', label: 'Product Name', type: 'text' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'compareAtPrice', label: 'Compare Price', type: 'number' },
      { key: 'image', label: 'Image URL', type: 'url' },
      { key: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  store_cart: {
    label: 'Shopping Cart',
    category: 'commerce',
    defaults: {
      title: 'Shopping Cart',
      items: [
        { id: 'c1', name: 'Modern Ergonomic Office Chair', price: 249, qty: 1, image: 'https://images.unsplash.com/photo-1580481077195-c266a4f10738?w=200&auto=format&fit=crop&q=80' },
        { id: 'c2', name: 'Ceramic Table Lamp', price: 79, qty: 1, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&auto=format&fit=crop&q=80' }
      ]
    },
    fields: [
      { key: 'title', label: 'Cart Title', type: 'text' }
    ]
  },
  store_checkout: {
    label: 'Checkout Form',
    category: 'commerce',
    defaults: {
      title: 'Checkout',
      bumpOfferTitle: 'Add 1-Year Extended Care Warranty ($19)',
      bumpPrice: 19
    },
    fields: [
      { key: 'title', label: 'Checkout Title', type: 'text' },
      { key: 'bumpOfferTitle', label: 'Order Bump Offer', type: 'text' }
    ]
  }
};

export const ELEMENT_CATEGORIES = [
  { id: 'text', label: 'Text', types: ['headline', 'subheadline', 'paragraph', 'bullet_list', 'numbered_list', 'quote', 'badge', 'notice'] },
  { id: 'media', label: 'Media', types: ['image', 'video', 'photo_gallery', 'logo', 'icon', 'qr_code', 'embed', 'map'] },
  { id: 'actions', label: 'Actions & forms', types: ['button', 'button_group', 'form', 'whatsapp_button', 'social_icons', 'calendar_cta'] },
  { id: 'layout', label: 'Rows & columns', types: ['row_1', 'row_2', 'row_3', 'row_4', 'spacer', 'divider'] },
  { id: 'social', label: 'Social proof', types: ['testimonials', 'number_counter', 'star_rating', 'logo_cloud', 'stats_row', 'team_member'] },
  { id: 'commerce', label: 'Commerce & Store', types: ['store_header', 'store_hero_banner', 'store_filter_bar', 'store_products_grid', 'store_product_detail', 'store_cart', 'store_checkout', 'pricing_table', 'pricing_grid', 'product_card', 'countdown', 'progress_bar', 'guarantee'] },
  { id: 'content', label: 'Sections', types: ['hero', 'navbar', 'features_grid', 'icon_box', 'about_split', 'cta_banner', 'faq', 'footer', 'code'] }
];

export { PREBUILT_SECTIONS } from './prebuiltSections';

export function getElementDef(type) {
  return ELEMENT_REGISTRY[type] || {
    label: type,
    category: 'content',
    defaults: { content: String(type || '').replace(/_/g, ' ') },
    fields: [{ key: 'content', label: 'Content', type: 'textarea' }, ...STYLE_FIELDS]
  };
}

export function hydrateEntry(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') return createElement(entry);
  const { type, ...rest } = entry;
  return createElement(type || 'paragraph', rest);
}

export function createElement(type, overrides = {}) {
  const { type: _ignoredType, id: overrideId, columns: overrideCols, ...rest } = overrides || {};
  if (type === 'row' || String(type).startsWith('row_')) {
    const fallbackCount = type === 'row' ? 2 : Number(String(type).split('_')[1]) || 1;
    const source = Array.isArray(overrideCols) && overrideCols.length
      ? overrideCols
      : Array.from({ length: Math.max(1, Math.min(6, fallbackCount)) }, () => ({ canvas: [] }));
    return {
      id: overrideId || uid('row'),
      type: 'row',
      gap: 16,
      valign: 'stretch',
      bg: 'transparent',
      padding: '10px',
      ...rest,
      type: 'row',
      columns: source.map((col) => ({
        id: col.id || uid('col'),
        canvas: (col.canvas || []).map((child) => hydrateEntry(child)).filter(Boolean)
      }))
    };
  }
  const def = getElementDef(type);
  const cleaned = {};
  Object.entries(rest || {}).forEach(([key, value]) => {
    if (value !== undefined) cleaned[key] = value;
  });
  return {
    id: overrideId || uid(),
    type,
    ...structuredClone(def.defaults || {}),
    ...cleaned
  };
}

export function createElements(types) {
  return (types || []).map((entry) => hydrateEntry(entry)).filter(Boolean);
}

export function defaultStepCanvas(title = 'Welcome') {
  return [
    createElement('headline', { content: title }),
    createElement('paragraph', { content: 'Add any element from the drawer, then click it to customize text, colors, images, links, and lists.', align: 'center' }),
    createElement('button', { content: 'Get Started Now' })
  ];
}

export function defaultStoreCanvas(pageType = 'catalog', title = 'Products List', theme = {}) {
  const brand = theme.brand || 'My Store';
  const header = () => createElement('store_header', {
    brand,
    bg: theme.headerBg || '#ffffff',
    color: theme.headerColor || '#0f172a',
    cartCount: 0
  });
  const foot = () => createElement('footer', { brand });

  if (pageType === 'catalog') {
    return [
      header(),
      createElement('store_hero_banner', {
        title: theme.heroTitle || 'Our Products',
        subtitle: theme.heroSubtitle || 'Hey there — welcome in!',
        bgImage: theme.heroImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80'
      }),
      createElement('store_filter_bar'),
      createElement('store_products_grid', { items: [] }),
      foot()
    ];
  }
  if (pageType === 'product_detail') {
    return [
      header(),
      createElement('store_product_detail'),
      createElement('headline', { content: 'Related Products You May Like', fontSize: '24px', align: 'left', margin: '40px 0 20px' }),
      createElement('store_products_grid', { items: [] }),
      foot()
    ];
  }
  if (pageType === 'cart') {
    return [header(), createElement('store_cart', { items: [] }), foot()];
  }
  if (pageType === 'checkout') {
    return [header(), createElement('store_checkout'), foot()];
  }
  if (pageType === 'thankyou') {
    return [
      header(),
      createElement('headline', { content: 'Thank You for Your Order! 🎉', fontSize: '36px', align: 'center', color: '#16a34a' }),
      createElement('paragraph', { content: 'Your order has been confirmed and is being prepared for shipping.', align: 'center' }),
      createElement('notice', { title: 'Order Details Sent', content: 'We sent a receipt and tracking link to your email address.' }),
      createElement('button', { content: 'Continue Shopping', link: '/products' }),
      foot()
    ];
  }
  if (pageType === 'contact') {
    return [
      header(),
      createElement('headline', { content: 'Contact Customer Support', fontSize: '32px', align: 'center' }),
      createElement('paragraph', { content: 'Have a question about your order or our products? We are here to help.', align: 'center' }),
      createElement('form', { title: 'Send us a message', buttonText: 'Send Message' }),
      createElement('whatsapp_button', { content: 'Chat with Support on WhatsApp', phone: theme.phone || '' }),
      foot()
    ];
  }
  return [
    header(),
    createElement('store_hero_banner', {
      title: title || theme.heroTitle || 'Welcome to Our Store',
      subtitle: theme.heroSubtitle || 'Discover curated quality essentials.',
      bgImage: theme.heroImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&auto=format&fit=crop&q=80'
    }),
    createElement('features_grid', {
      title: 'Why Shop With Us',
      items: theme.features || [
        { icon: '🚚', title: 'Free Worldwide Shipping', desc: 'On all orders over $150 with express tracking.' },
        { icon: '🛡️', title: '30-Day Guarantee', desc: 'Hassle-free 100% money-back returns.' },
        { icon: '🔒', title: 'Secure Checkout', desc: 'Encrypted payments via Stripe, Apple Pay & PayPal.' }
      ]
    }),
    createElement('headline', { content: 'Featured Collections', fontSize: '28px', align: 'center', margin: '30px 0 10px' }),
    createElement('store_products_grid', { items: [] }),
    foot()
  ];
}

export function normalizeFormFields(fields) {
  if (!Array.isArray(fields)) return [];
  return fields.map((field) => {
    if (typeof field === 'string') {
      return { label: field, type: field.toLowerCase().includes('email') ? 'email' : 'text', placeholder: field, required: true };
    }
    return {
      label: field.label || 'Field',
      type: field.type || 'text',
      placeholder: field.placeholder || field.label || '',
      required: field.required !== false
    };
  });
}

export function toEmbedUrl(src = '') {
  if (!src) return '';
  const yt = String(src).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return src;
}

export const PAGE_FONTS = [
  { id: 'DM Sans', label: 'DM Sans' },
  { id: 'Inter', label: 'Inter' },
  { id: 'Syne', label: 'Syne' },
  { id: 'Cairo', label: 'Cairo (Arabic)' },
  { id: 'Tajawal', label: 'Tajawal (Arabic)' },
  { id: 'Noto Kufi Arabic', label: 'Noto Kufi Arabic' }
];
