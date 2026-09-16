const IMG = {
  office: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=70',
  team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=70',
  founder: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=70',
  man: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=70',
  woman: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=70',
  woman2: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=70',
  shop: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&auto=format&fit=crop&q=70',
  product: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=70',
  product2: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=70',
  product3: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=70',
  dash: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=70',
  city: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=70',
  hands: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=70'
};

const P = (id, category, label, hint, types, accent = '#38bdf8') => ({
  id, category, label, hint, types, accent
});

const nav = (brand, extra = {}) => ({ type: 'navbar', brand, ...extra });

export const PREBUILT_SECTIONS = [
  // ── Welcome ──
  P('welcome-launch', 'Welcome', 'Launch hero + stats', 'Navbar, dark hero, proof numbers', [
    nav('UpKlick', { bg: '#0b0f19', color: '#ffffff', buttonText: 'Start free' }),
    { type: 'hero', badge: 'New for 2026', title: 'Build pages that convert', content: 'Drop a complete welcome section, then customize every word, color, and button.', buttonText: 'Create your page', secondaryText: 'Watch demo', bg: '#0b0f19', color: '#ffffff' },
    { type: 'stats_row', items: [{ number: '12k+', label: 'Pages published' }, { number: '4.9', label: 'Average rating' }, { number: '38%', label: 'Higher conversion' }, { number: '14d', label: 'Avg. time to launch' }] }
  ]),
  P('welcome-clean', 'Welcome', 'Clean light welcome', 'Soft hero with form on the side', [
    nav('Your Brand', { bg: '#ffffff', color: '#0f172a', buttonText: 'Book a call' }),
    { type: 'badge', content: 'Welcome to the studio', align: 'center' },
    { type: 'headline', content: 'Grow your offer without a developer', color: '#0f172a' },
    { type: 'paragraph', content: 'A calm, high-trust first screen for coaches, agencies, and course creators.', align: 'center' },
    { type: 'button_group', items: [{ content: 'See how it works', bg: '#2563eb', color: '#fff' }, { content: 'Browse templates', bg: '#fff', color: '#2563eb' }] }
  ]),
  P('welcome-video', 'Welcome', 'Video-first welcome', 'Headline + video + CTA', [
    { type: 'headline', content: 'Watch the 90-second walkthrough' },
    { type: 'paragraph', content: 'See the builder, the funnel steps, and a live publish — then start your own page.', align: 'center' },
    { type: 'video', src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Welcome video' },
    { type: 'button', content: 'Start my funnel' }
  ]),
  P('welcome-split', 'Welcome', 'Split welcome + image', 'Two columns: copy and photo', [
    { type: 'row', columns: [
      { canvas: [
        { type: 'badge', content: 'Welcome', align: 'left' },
        { type: 'headline', content: 'Your next client is already looking', align: 'left', fontSize: '36px' },
        { type: 'paragraph', content: 'A side-by-side welcome that puts the offer on the left and social proof on the right.', align: 'left' },
        { type: 'button', content: 'Get the playbook', align: 'left' }
      ]},
      { canvas: [{ type: 'image', src: IMG.office, alt: 'Welcome workspace' }] }
    ]}
  ]),
  P('welcome-countdown', 'Welcome', 'Launch countdown welcome', 'Urgency hero for launches', [
    { type: 'badge', content: 'Doors close Friday' },
    { type: 'headline', content: 'The summer cohort is almost full' },
    { type: 'countdown', label: 'Enrollment ends in', hours: 18, minutes: 40, seconds: 12 },
    { type: 'button', content: 'Reserve my seat' }
  ]),
  P('welcome-arabic', 'Welcome', 'Bilingual welcome', 'Arabic + English first screen', [
    { type: 'headline', content: 'أهلاً بك — Welcome' },
    { type: 'subheadline', content: 'ابنِ صفحتك، خصّص كل عنصر، وانشرها الآن' },
    { type: 'paragraph', content: 'A bilingual welcome block for Gulf, Egypt, and Levant audiences.', align: 'center' },
    { type: 'button_group', items: [{ content: 'ابدأ الآن', bg: '#0f172a', color: '#fff' }, { content: 'Start in English', bg: '#fff', color: '#0f172a' }] }
  ]),
  P('welcome-notice', 'Welcome', 'Announcement welcome', 'Notice + hero + social icons', [
    { type: 'notice', title: 'Now live', content: 'New templates for webinars, stores, and coaching funnels.' },
    { type: 'hero', title: 'Ship the page you sketched this morning', content: 'Welcome visitors with a clear promise and one obvious next step.', bg: '#eff6ff', color: '#0f172a', buttonText: 'Browse prebuilt sections' },
    { type: 'social_icons' }
  ]),
  P('welcome-minimal', 'Welcome', 'Minimal logo welcome', 'Logo, one line, one button', [
    { type: 'logo', content: 'UPKLICK', color: '#2563eb' },
    { type: 'headline', content: 'Simple. Fast. Yours.', fontSize: '48px' },
    { type: 'button', content: 'Enter the builder' }
  ]),

  // ── About ──
  P('about-founder', 'About', 'Founder story split', 'Photo, bio, highlights', [
    { type: 'about_split', title: 'Meet the founder', content: 'I built this after launching 40+ funnels for coaches and creators. Every block on this page is editable so you can tell your story your way.', src: IMG.founder, buttonText: 'Work with me', items: ['3+ years in market', '500+ documented results', 'Arabic & English ready'] }
  ]),
  P('about-story', 'About', 'Long-form about', 'Headline, story, quote', [
    { type: 'subheadline', content: 'Our story' },
    { type: 'headline', content: 'We started with one broken landing page' },
    { type: 'paragraph', content: 'Clients were waiting on developers, copy was locked in Figma, and every change took a week. So we built a builder where every element is yours.' },
    { type: 'quote', content: 'If you cannot edit it, you do not own it.', author: 'UpKlick team', role: 'Product' }
  ]),
  P('about-values', 'About', 'Values in 3 columns', 'Mission + three values', [
    { type: 'headline', content: 'What we believe' },
    { type: 'features_grid', title: '', items: [
      { icon: '🎯', title: 'Clarity first', desc: 'One offer. One next step. No clutter.' },
      { icon: '⚡', title: 'Ship same day', desc: 'Design, edit, and publish without a handoff.' },
      { icon: '🤝', title: 'Your brand', desc: 'Colors, type, photos, and copy stay yours.' }
    ]}
  ]),
  P('about-numbers', 'About', 'About + numbers', 'Bio with proof stats', [
    { type: 'headline', content: 'A studio that ships pages, not decks' },
    { type: 'paragraph', content: 'We help founders turn an offer into a live funnel — then keep editing it after launch.', align: 'center' },
    { type: 'stats_row', items: [{ number: '8 yrs', label: 'Building funnels' }, { number: '24', label: 'Markets served' }, { number: '96%', label: 'Client retain' }, { number: '3.2x', label: 'Avg. lift' }] }
  ]),
  P('about-team-preview', 'About', 'About the people', 'Short intro + team card', [
    { type: 'headline', content: 'Humans behind the product' },
    { type: 'team_member', name: 'Lina Farouk', role: 'Head of Product', content: 'I obsess over the inspector — every field you can edit is there on purpose.', src: IMG.woman, bg: '#0b0f19' }
  ]),
  P('about-split-dark', 'About', 'Dark about panel', 'High-contrast founder block', [
    { type: 'hero', badge: 'About us', title: 'Built in the region, for the region', content: 'From Riyadh to Cairo to Dubai — pages that feel local and convert globally.', bg: '#0f172a', color: '#fff', buttonText: 'Read the story', secondaryText: '' }
  ]),
  P('about-timeline', 'About', 'About timeline list', 'Numbered origin story', [
    { type: 'headline', content: 'How we got here' },
    { type: 'numbered_list', items: ['Started as a freelance funnel shop', 'Productized the builder our clients asked for', 'Opened it to every UpKlick workspace', 'Kept every block fully customizable'] }
  ]),

  // ── Call To Action ──
  P('cta-blue', 'Call To Action', 'Primary blue banner', 'Full-width conversion strip', [
    { type: 'cta_banner', title: 'Ready to grow?', content: 'Build the page, connect your offer, and publish in minutes.', buttonText: 'Start now', bg: '#2563eb', color: '#ffffff' }
  ]),
  P('cta-dark', 'Call To Action', 'Dark urgency CTA', 'Dark banner with countdown', [
    { type: 'cta_banner', title: 'Last seats this month', content: 'Lock the founding price before it resets.', buttonText: 'Claim founding rate', bg: '#0b0f19', color: '#fff' },
    { type: 'countdown', label: 'Price goes up in', hours: 9, minutes: 12, seconds: 44 }
  ]),
  P('cta-soft', 'Call To Action', 'Soft mint CTA', 'Calm, high-trust layout', [
    { type: 'cta_banner', title: 'Try it on a real offer', content: 'No theme lock-in. Duplicate any block and make it yours.', buttonText: 'Open the builder', bg: '#ecfdf5', color: '#065f46' }
  ]),
  P('cta-split', 'Call To Action', 'Split CTA + form', 'Copy on the left, opt-in on the right', [
    { type: 'row', columns: [
      { canvas: [
        { type: 'headline', content: 'Get the 7-page funnel checklist', align: 'left', fontSize: '32px' },
        { type: 'paragraph', content: 'Used by coaches who want a page live this week — not next quarter.', align: 'left' },
        { type: 'bullet_list', items: ['Hero formula', 'Offer stack', 'FAQ that sells'] }
      ]},
      { canvas: [{ type: 'form', title: 'Send me the checklist', buttonText: 'Email it to me', fields: [{ label: 'First name', type: 'text', placeholder: 'Lina' }, { label: 'Work email', type: 'email', placeholder: 'you@brand.com' }] }] }
    ]}
  ]),
  P('cta-whatsapp', 'Call To Action', 'WhatsApp close', 'Chat CTA for local markets', [
    { type: 'headline', content: 'Prefer to talk it through?' },
    { type: 'paragraph', content: 'Message the team on WhatsApp and we will walk your offer live.', align: 'center' },
    { type: 'whatsapp_button', content: 'Chat on WhatsApp', phone: '971500000000', message: 'Hi, I want to build a funnel' }
  ]),
  P('cta-calendar', 'Call To Action', 'Book a strategy call', 'Calendar booking block', [
    { type: 'calendar_cta', title: 'Book a 20-minute teardown', content: 'Bring your current page. We will show what to change first.', buttonText: 'Open calendar' }
  ]),
  P('cta-guarantee', 'Call To Action', 'CTA + guarantee', 'Button with risk reversal', [
    { type: 'cta_banner', title: 'Start today, risk-free', content: 'Publish the page. If it is not a fit, you have 30 days.', buttonText: 'Start free', bg: '#111827', color: '#fff' },
    { type: 'guarantee', title: '30-day money-back', content: 'Email us within 30 days for a full refund. No forms, no friction.' }
  ]),
  P('cta-two-buttons', 'Call To Action', 'Two-path CTA', 'Primary + secondary actions', [
    { type: 'headline', content: 'Choose your next step' },
    { type: 'button_group', items: [{ content: 'Build a funnel', bg: '#2563eb', color: '#fff' }, { content: 'See pricing', bg: '#0f172a', color: '#fff' }] }
  ]),

  // ── FAQs ──
  P('faq-classic', 'FAQs', 'Classic accordion', 'Three starter questions', [
    { type: 'faq', title: 'Frequently asked questions', items: [
      { q: 'Can I customize every element?', a: 'Yes. Select any block and edit text, colors, images, links, lists, and layout from the inspector.' },
      { q: 'Does the live page match the builder?', a: 'Yes. Preview and publish use the same renderer as the canvas.' },
      { q: 'Can I add my own sections?', a: 'Add any element, drop a prebuilt, then edit every field.' }
    ]}
  ]),
  P('faq-pricing', 'FAQs', 'Pricing FAQs', 'Questions that unblock checkout', [
    { type: 'faq', title: 'Questions about plans', items: [
      { q: 'Can I change plans later?', a: 'Yes. Upgrade or downgrade any time from billing. Your pages stay published.' },
      { q: 'Is there a refund?', a: '30 days, full refund, no questions asked.' },
      { q: 'Do you take a cut of sales?', a: 'No platform tax on your offers. You keep what you charge.' },
      { q: 'Can my team edit pages?', a: 'Invite teammates to the same workspace and they can use the builder.' }
    ]}
  ]),
  P('faq-onboarding', 'FAQs', 'Getting started FAQs', 'For first-time builders', [
    { type: 'headline', content: 'New here?' },
    { type: 'faq', title: '', items: [
      { q: 'How do I add a column?', a: 'Open Rows, drop 2 or 3 columns, then click a column and add elements into it.' },
      { q: 'How do I stack rows?', a: 'Use + Add row, or + Add row in this column to nest rows.' },
      { q: 'Where do I change colors?', a: 'Click the block, then use Customize element on the right.' }
    ]}
  ]),
  P('faq-split', 'FAQs', 'FAQ + CTA column', 'Answers beside a booking box', [
    { type: 'row', columns: [
      { canvas: [{ type: 'faq', title: 'Still deciding?', items: [{ q: 'How long to launch?', a: 'Most teams publish the first page the same day.' }, { q: 'Do I need a designer?', a: 'No. Start from a prebuilt and swap copy and photos.' }, { q: 'Can I use my domain later?', a: 'Yes — connect it in funnel settings when you are ready.' }] }] },
      { canvas: [{ type: 'calendar_cta', title: 'Talk to a human', content: 'If the FAQs are not enough, book a short call.', buttonText: 'Pick a time' }] }
    ]}
  ]),
  P('faq-product', 'FAQs', 'Product support FAQs', 'Shipping, access, support', [
    { type: 'faq', title: 'Product & delivery', items: [
      { q: 'When do I get access?', a: 'Immediately after checkout — the page can deep-link to your thank-you step.' },
      { q: 'What if a video will not play?', a: 'Paste any YouTube or embed URL into the video block.' },
      { q: 'Can I add custom HTML?', a: 'Yes. Use the Custom HTML element or page CSS.' }
    ]}
  ]),
  P('faq-notice', 'FAQs', 'FAQ with notice', 'Announcement + accordion', [
    { type: 'notice', title: 'Updated this week', content: 'We added nested rows, more prebuilts, and a light inspector.' },
    { type: 'faq' }
  ]),

  // ── Footer ──
  P('footer-dark', 'Footer', 'Dark brand footer', 'Brand, links, copyright', [
    { type: 'footer', brand: 'Your Brand', content: 'Helping founders launch high-converting funnels.', copyright: '© 2026 Your Brand. All rights reserved.', bg: '#0f172a', color: '#e2e8f0' }
  ]),
  P('footer-light', 'Footer', 'Light minimal footer', 'Clean white footer', [
    { type: 'footer', brand: 'UpKlick', content: 'Sites & funnels for teams that ship.', copyright: '© 2026 UpKlick', bg: '#f8fafc', color: '#334155', items: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }, { label: 'Support', href: '#' }] }
  ]),
  P('footer-social', 'Footer', 'Footer + socials', 'Links and social icons', [
    { type: 'social_icons', align: 'center' },
    { type: 'footer', brand: 'Studio', content: 'Follow along for new templates every week.', bg: '#111827', color: '#f8fafc' }
  ]),
  P('footer-cta', 'Footer', 'Footer with last CTA', 'Button then footer', [
    { type: 'button', content: 'Start your free page' },
    { type: 'footer', brand: 'UpKlick', content: 'No credit card required to explore the builder.' }
  ]),
  P('footer-columns', 'Footer', 'Three-column footer', 'Brand / links / contact', [
    { type: 'row', bg: '#0f172a', padding: '20px', columns: [
      { canvas: [{ type: 'headline', content: 'UpKlick', color: '#fff', fontSize: '22px', align: 'left' }, { type: 'paragraph', content: 'The funnel builder inside your workspace.', color: '#94a3b8', align: 'left' }] },
      { canvas: [{ type: 'subheadline', content: 'Product', color: '#fff', align: 'left', fontSize: '14px' }, { type: 'bullet_list', items: ['Funnels', 'Forms', 'Analytics'], color: '#cbd5e1' }] },
      { canvas: [{ type: 'subheadline', content: 'Contact', color: '#fff', align: 'left', fontSize: '14px' }, { type: 'paragraph', content: 'hello@upklick.co', color: '#94a3b8', align: 'left' }, { type: 'whatsapp_button', content: 'WhatsApp', align: 'left' }] }
    ]}
  ]),
  P('footer-legal', 'Footer', 'Legal strip', 'Short copyright only', [
    { type: 'divider' },
    { type: 'paragraph', content: '© 2026 Your Brand · Privacy · Terms · Cookies', align: 'center', fontSize: '13px', color: '#64748b' }
  ]),

  // ── For Who ──
  P('forwho-grid', 'For Who', 'Three audience cards', 'Coaches, creators, agencies', [
    { type: 'headline', content: 'Built for people who sell online' },
    { type: 'features_grid', title: '', items: [
      { icon: '🎓', title: 'Coaches', desc: 'Turn a call-booking page into a full funnel.' },
      { icon: '🎬', title: 'Creators', desc: 'Launch a digital product without waiting on a site rebuild.' },
      { icon: '🏢', title: 'Agencies', desc: 'Ship client pages in the same workspace you already use.' }
    ]}
  ]),
  P('forwho-list', 'For Who', 'Who it is for list', 'Bullet audience list', [
    { type: 'headline', content: 'This is for you if…' },
    { type: 'bullet_list', items: ['You sell a service or digital product', 'You need a page live this week', 'You want to edit copy without a developer', 'You care how the live page actually looks'] }
  ]),
  P('forwho-not', 'For Who', 'For you / not for you', 'Two-column qualifier', [
    { type: 'row', columns: [
      { canvas: [{ type: 'icon_box', icon: '✅', title: 'For you', content: 'Founders, coaches, and teams who want control over every block.', bg: '#ecfdf5' }] },
      { canvas: [{ type: 'icon_box', icon: '⛔', title: 'Not for you', content: 'If you only need a 5-page brochure and never want to edit it again.', bg: '#fef2f2' }] }
    ]}
  ]),
  P('forwho-roles', 'For Who', 'Roles row', 'Four buyer roles', [
    { type: 'headline', content: 'Pick your seat' },
    { type: 'stats_row', items: [{ number: 'Founder', label: 'Owns the offer' }, { number: 'Marketer', label: 'Owns the page' }, { number: 'Closer', label: 'Owns the call' }, { number: 'Operator', label: 'Owns the publish' }] }
  ]),
  P('forwho-industries', 'For Who', 'Industry chips', 'Badges for niches', [
    { type: 'headline', content: 'Works across niches' },
    { type: 'row', columns: [
      { canvas: [{ type: 'badge', content: 'Coaching' }] },
      { canvas: [{ type: 'badge', content: 'E-commerce' }] },
      { canvas: [{ type: 'badge', content: 'SaaS' }] },
      { canvas: [{ type: 'badge', content: 'Education' }] }
    ]}
  ]),
  P('forwho-quote', 'For Who', 'Audience quote', 'Social proof from a buyer type', [
    { type: 'quote', content: 'I am not a designer. I dropped a Welcome section, changed the photos, and published before lunch.', author: 'Mona S.', role: 'Course creator, UAE' }
  ]),

  // ── Guarantee & Awards ──
  P('guarantee-classic', 'Guarantee & Awards', 'Classic guarantee', 'Shield + copy', [
    { type: 'guarantee', title: '30-day money-back guarantee', content: 'If it is not a fit, email us within 30 days for a full refund. No questions asked.', icon: '🛡️' }
  ]),
  P('guarantee-stars', 'Guarantee & Awards', 'Guarantee + rating', 'Trust stack', [
    { type: 'star_rating', stars: 5, content: 'Rated 4.9/5 by 1,200+ founders' },
    { type: 'guarantee', title: 'Loved or refunded', content: 'We keep the promise simple so visitors can click with confidence.' }
  ]),
  P('guarantee-awards', 'Guarantee & Awards', 'Awards row', 'Four award tiles', [
    { type: 'headline', content: 'Recognition' },
    { type: 'stats_row', items: [{ number: '2026', label: 'Product Hunt hunt' }, { number: '#1', label: 'Builder in use' }, { number: '4.9', label: 'Support score' }, { number: 'ISO', label: 'Workspace ready' }] }
  ]),
  P('guarantee-badges', 'Guarantee & Awards', 'Trust badges', 'Payment & security chips', [
    { type: 'headline', content: 'Checkout you can trust' },
    { type: 'logo_cloud', title: 'Secure payments', items: ['Stripe', 'Visa', 'Mastercard', 'Apple Pay', 'Mada'] },
    { type: 'guarantee', title: 'SSL + encrypted forms', content: 'Lead forms stay on your workspace. You own the submissions.' }
  ]),
  P('guarantee-risk', 'Guarantee & Awards', 'Risk reversal copy', 'Bold no-risk block', [
    { type: 'hero', badge: 'Guarantee', title: 'If you do not use it, you do not pay for it', content: 'Keep the pages you built. Cancel any time. Refund window is 30 days from purchase.', bg: '#052e16', color: '#ecfdf5', buttonText: 'See the terms', secondaryText: '' }
  ]),
  P('guarantee-press', 'Guarantee & Awards', 'As seen in', 'Press logo cloud', [
    { type: 'logo_cloud', title: 'As seen in', items: ['Forbes', 'TechCrunch', 'Wired', 'Rest of World', 'Arab News'] }
  ]),

  // ── Image Slider ──
  P('slider-gallery', 'Image Slider', '3-up photo gallery', 'Default showcase grid', [
    { type: 'headline', content: 'A look inside' },
    { type: 'photo_gallery', columns: 3 }
  ]),
  P('slider-wide', 'Image Slider', 'Wide product shots', 'Two large images', [
    { type: 'photo_gallery', columns: 2, items: [
      { src: IMG.shop, alt: 'Store' },
      { src: IMG.product, alt: 'Product' }
    ]}
  ]),
  P('slider-four', 'Image Slider', 'Four-tile mosaic', 'Tighter gallery', [
    { type: 'photo_gallery', columns: 4, items: [
      { src: IMG.office, alt: '1' }, { src: IMG.dash, alt: '2' }, { src: IMG.team, alt: '3' }, { src: IMG.city, alt: '4' }
    ]}
  ]),
  P('slider-caption', 'Image Slider', 'Gallery with caption', 'Title + 3 photos', [
    { type: 'subheadline', content: 'Campus & product' },
    { type: 'paragraph', content: 'Replace every image URL from the inspector.', align: 'center' },
    { type: 'photo_gallery' }
  ]),
  P('slider-single', 'Image Slider', 'Single cinematic image', 'One full-width shot', [
    { type: 'image', src: IMG.city, alt: 'Hero image', radius: '20px' },
    { type: 'paragraph', content: 'Swap this image in Customize element.', align: 'center', fontSize: '13px' }
  ]),
  P('slider-before-after', 'Image Slider', 'Before / after', 'Two-column comparison', [
    { type: 'headline', content: 'Before and after the rebuild' },
    { type: 'row', columns: [
      { canvas: [{ type: 'badge', content: 'Before' }, { type: 'image', src: IMG.dash, alt: 'Before' }] },
      { canvas: [{ type: 'badge', content: 'After' }, { type: 'image', src: IMG.office, alt: 'After' }] }
    ]}
  ]),

  // ── List ──
  P('list-benefits', 'List', 'Benefit bullets', 'Headline + checklist', [
    { type: 'headline', content: 'What you get on day one' },
    { type: 'bullet_list', items: ['Unlimited funnel steps', 'Drag-and-drop rows and columns', 'Every block fully customizable', 'One-click preview and publish'] }
  ]),
  P('list-steps', 'List', 'Numbered process', '3-step method', [
    { type: 'headline', content: 'Launch in three steps' },
    { type: 'numbered_list', items: ['Drop a prebuilt Welcome or Pricing section', 'Click any block and rewrite it in the inspector', 'Preview, then publish the live page'] }
  ]),
  P('list-included', 'List', 'What’s included', 'Two lists side by side', [
    { type: 'row', columns: [
      { canvas: [{ type: 'subheadline', content: 'Included', align: 'left' }, { type: 'bullet_list', items: ['Page builder', 'Forms', 'QR blocks', 'Custom CSS'] }] },
      { canvas: [{ type: 'subheadline', content: 'Coming with you', align: 'left' }, { type: 'bullet_list', items: ['Your brand colors', 'Your photos', 'Your offer', 'Your domain later'] }] }
    ]}
  ]),
  P('list-objections', 'List', 'Objection crushers', 'List that sells', [
    { type: 'headline', content: 'If you have been waiting because…' },
    { type: 'bullet_list', items: ['“I am not technical” — click, type, publish', '“Design takes weeks” — start from a prebuilt', '“Edits need a ticket” — you own every field'] }
  ]),
  P('list-curriculum', 'List', 'Curriculum list', 'Course-style outline', [
    { type: 'headline', content: 'Inside the program' },
    { type: 'numbered_list', items: ['Offer clarity workshop', 'Page architecture', 'Copy that asks for the click', 'Publish + first 10 visitors'] }
  ]),
  P('list-icon', 'List', 'Icon feature list', 'Three icon boxes', [
    { type: 'row', columns: [
      { canvas: [{ type: 'icon_box', icon: '1', title: 'Add a row', content: '1, 2, 3 or 4 columns.' }] },
      { canvas: [{ type: 'icon_box', icon: '2', title: 'Drop elements', content: 'As many as you want per column.' }] },
      { canvas: [{ type: 'icon_box', icon: '3', title: 'Customize', content: 'Inspector edits every field.' }] }
    ]}
  ]),

  // ── Mega Menu Headers ──
  P('header-light', 'Mega Menu Headers', 'Light marketing nav', 'White bar, blue CTA', [
    nav('Your Brand', { bg: '#ffffff', color: '#0f172a', buttonText: 'Get Started', items: [{ label: 'Home', href: '#' }, { label: 'Offer', href: '#' }, { label: 'Reviews', href: '#' }, { label: 'Pricing', href: '#' }, { label: 'FAQ', href: '#' }] })
  ]),
  P('header-dark', 'Mega Menu Headers', 'Dark product nav', 'Night header', [
    nav('UpKlick', { bg: '#0b0f19', color: '#ffffff', buttonText: 'Start free', items: [{ label: 'Product', href: '#' }, { label: 'Templates', href: '#' }, { label: 'Customers', href: '#' }, { label: 'Pricing', href: '#' }] })
  ]),
  P('header-center', 'Mega Menu Headers', 'Centered logo header', 'Logo then nav', [
    { type: 'logo', content: 'STUDIO', align: 'center', color: '#0f172a' },
    nav(' ', { buttonText: 'Book a demo', items: [{ label: 'Work', href: '#' }, { label: 'About', href: '#' }, { label: 'Journal', href: '#' }, { label: 'Contact', href: '#' }] })
  ]),
  P('header-notice', 'Mega Menu Headers', 'Nav with promo bar', 'Notice + navbar', [
    { type: 'notice', title: 'Summer of AI', content: 'New prebuilt sections just dropped — scroll the Prebuilt tab.', bg: '#0f172a', color: '#fff' },
    nav('UpKlick', { buttonText: 'Try them' })
  ]),
  P('header-simple', 'Mega Menu Headers', 'Utility header', 'Brand + one button', [
    { type: 'row', columns: [
      { canvas: [{ type: 'logo', content: 'UpKlick', align: 'left', color: '#2563eb' }] },
      { canvas: [{ type: 'button', content: 'Login', align: 'right', bg: '#f1f5f9', color: '#0f172a' }] }
    ]}
  ]),
  P('header-store', 'Mega Menu Headers', 'Store header', 'Shop-style nav', [
    nav('Shop', { buttonText: 'Cart (0)', items: [{ label: 'New', href: '#' }, { label: 'Best sellers', href: '#' }, { label: 'Bundles', href: '#' }, { label: 'Support', href: '#' }] })
  ]),

  // ── Partners ──
  P('partners-cloud', 'Partners', 'Logo cloud', 'Trusted-by row', [
    { type: 'logo_cloud', title: 'Trusted by teams at', items: ['Notion', 'Stripe', 'Figma', 'HubSpot', 'Slack'] }
  ]),
  P('partners-wide', 'Partners', 'Large partner list', 'More brand names', [
    { type: 'headline', content: 'Partners & integrations' },
    { type: 'logo_cloud', title: '', items: ['WhatsApp', 'Telegram', 'Stripe', 'Calendly', 'YouTube', 'Google Maps'] }
  ]),
  P('partners-quote', 'Partners', 'Partner + quote', 'Logo cloud and testimonial', [
    { type: 'logo_cloud', title: 'They ship with us' },
    { type: 'quote', content: 'We white-label the published page and still edit every block for each client.', author: 'Agency partner', role: 'Riyadh' }
  ]),
  P('partners-stats', 'Partners', 'Partner proof numbers', 'Network stats', [
    { type: 'stats_row', items: [{ number: '180+', label: 'Partner brands' }, { number: '12', label: 'Countries' }, { number: '4.8', label: 'Partner NPS' }, { number: '24h', label: 'Co-marketing SLA' }] }
  ]),
  P('partners-cta', 'Partners', 'Become a partner', 'Logo cloud + CTA', [
    { type: 'logo_cloud', title: 'Current partners' },
    { type: 'cta_banner', title: 'Become a partner', content: 'Agencies get a workspace, templates, and a partner manager.', buttonText: 'Apply', bg: '#1e293b', color: '#fff' }
  ]),

  // ── Plan Selection ──
  P('plans-grid', 'Plan Selection', '3-plan pricing grid', 'Starter / Pro / VIP', [
    { type: 'pricing_grid', title: 'Choose your plan' }
  ]),
  P('plans-single', 'Plan Selection', 'Featured Pro card', 'One highlighted plan', [
    { type: 'headline', content: 'Most teams start here' },
    { type: 'pricing_table', title: 'Pro Membership', price: '$97/mo', popular: true, features: ['Unlimited funnels', 'Custom domain', 'Priority support', 'Conversion analytics'], buttonText: 'Go Pro' }
  ]),
  P('plans-compare', 'Plan Selection', 'Compare two plans', 'Side-by-side cards', [
    { type: 'row', columns: [
      { canvas: [{ type: 'pricing_table', title: 'Starter', price: '$29', popular: false, features: ['3 funnels', 'Basic analytics', 'Email support'], buttonText: 'Start' }] },
      { canvas: [{ type: 'pricing_table', title: 'Pro', price: '$97', popular: true, features: ['Unlimited funnels', 'Custom domain', 'Priority support'], buttonText: 'Go Pro' }] }
    ]}
  ]),
  P('plans-offer', 'Plan Selection', 'Launch offer plans', 'Countdown + grid', [
    { type: 'countdown', label: 'Founding price ends in', hours: 4, minutes: 15, seconds: 0 },
    { type: 'pricing_grid', title: 'Lock founding pricing' }
  ]),
  P('plans-faq', 'Plan Selection', 'Plans + FAQ', 'Pricing then objections', [
    { type: 'pricing_grid', title: 'Simple pricing' },
    { type: 'faq', title: 'Plan questions', items: [
      { q: 'Can I switch later?', a: 'Yes, instantly from billing.' },
      { q: 'Do pages stay live if I downgrade?', a: 'Yes. Limits apply to new funnels, not published ones.' }
    ]}
  ]),
  P('plans-guarantee', 'Plan Selection', 'Plans + guarantee', 'Checkout confidence', [
    { type: 'pricing_grid' },
    { type: 'guarantee', title: '30-day guarantee on every plan', content: 'Try the builder on a real offer. If it is not for you, you get your money back.' }
  ]),

  // ── Product ──
  P('product-card', 'Product', 'Signature product card', 'Image, price, buy button', [
    { type: 'product_card', title: 'Signature Offer', price: '$297', content: 'A complete system to launch, book calls, and close.', src: IMG.shop, buttonText: 'Buy now' }
  ]),
  P('product-feature', 'Product', 'Product + features', 'Card and benefit list', [
    { type: 'row', columns: [
      { canvas: [{ type: 'product_card', title: 'Builder Pro', price: '$97/mo', src: IMG.dash, content: 'The workspace that edits every block.' }] },
      { canvas: [{ type: 'headline', content: 'Inside the box', align: 'left', fontSize: '28px' }, { type: 'bullet_list', items: ['Rows & columns', '40+ elements', 'Prebuilt library', 'Live preview'] }] }
    ]}
  ]),
  P('product-three', 'Product', 'Three product cards', 'Store-like row', [
    { type: 'headline', content: 'Featured products' },
    { type: 'row', columns: [
      { canvas: [{ type: 'product_card', title: 'Watch', price: '$199', src: IMG.product, buttonText: 'Add to cart' }] },
      { canvas: [{ type: 'product_card', title: 'Audio', price: '$149', src: IMG.product2, buttonText: 'Add to cart' }] },
      { canvas: [{ type: 'product_card', title: 'Kicks', price: '$129', src: IMG.product3, buttonText: 'Add to cart' }] }
    ]}
  ]),
  P('product-story', 'Product', 'Product story', 'Long copy + image', [
    { type: 'headline', content: 'Designed to be edited' },
    { type: 'paragraph', content: 'This product block is a starting point. Change the photo, price, and button link from the inspector.' },
    { type: 'image', src: IMG.product, alt: 'Product' }
  ]),
  P('product-video', 'Product', 'Product demo video', 'Video then buy', [
    { type: 'headline', content: 'See it in motion' },
    { type: 'video', title: 'Product demo' },
    { type: 'button', content: 'Get the product' }
  ]),
  P('product-bundle', 'Product', 'Bundle offer', 'Progress + product', [
    { type: 'progress_bar', label: 'Bundle spots claimed', value: 74 },
    { type: 'product_card', title: 'Launch bundle', price: '$97', content: 'Page + checklist + 1 teardown call.', buttonText: 'Get the bundle' }
  ]),

  // ── Store Sections ──
  P('store-grid', 'Store Sections', '3-product shelf', 'Simple store row', [
    { type: 'headline', content: 'Shop the drop' },
    { type: 'row', columns: [
      { canvas: [{ type: 'product_card', title: 'Classic', price: '$49', src: IMG.product }] },
      { canvas: [{ type: 'product_card', title: 'Studio', price: '$79', src: IMG.product2 }] },
      { canvas: [{ type: 'product_card', title: 'Limited', price: '$99', src: IMG.product3 }] }
    ]}
  ]),
  P('store-banner', 'Store Sections', 'Store promo banner', 'Sale CTA', [
    { type: 'cta_banner', title: 'Mid-season sale', content: 'Extra 20% off store sections when you publish this week.', buttonText: 'Shop now', bg: '#9a3412', color: '#fff7ed' }
  ]),
  P('store-categories', 'Store Sections', 'Category tiles', 'Four shop categories', [
    { type: 'headline', content: 'Shop by category' },
    { type: 'features_grid', title: '', items: [
      { icon: '🎧', title: 'Audio', desc: 'Sessions and sound packs.' },
      { icon: '📚', title: 'Guides', desc: 'Playbooks and checklists.' },
      { icon: '🎟️', title: 'Tickets', desc: 'Workshops and live days.' },
      { icon: '🎁', title: 'Bundles', desc: 'Save when you buy together.' }
    ]}
  ]),
  P('store-hero', 'Store Sections', 'Store welcome', 'Nav + shop hero', [
    nav('Shop', { buttonText: 'Cart' }),
    { type: 'hero', badge: 'New arrival', title: 'The collection is live', content: 'Every card is a real product block — change price and images in one click.', bg: '#fff7ed', color: '#9a3412', buttonText: 'Browse products' }
  ]),
  P('store-testimonial', 'Store Sections', 'Store social proof', 'Reviews over products', [
    { type: 'testimonials', title: 'What buyers say' },
    { type: 'button', content: 'Continue shopping' }
  ]),
  P('store-faq', 'Store Sections', 'Shipping FAQs', 'Store support', [
    { type: 'faq', title: 'Shipping & returns', items: [
      { q: 'How fast do you ship?', a: 'Digital products are instant. Physical items ship in 2–5 days.' },
      { q: 'Can I return it?', a: 'Yes, 14 days on unused items.' },
      { q: 'Do you ship regionally?', a: 'GCC and Egypt first. Add your policy in this FAQ.' }
    ]}
  ]),

  // ── Team ──
  P('team-single', 'Team', 'Featured member', 'One profile card', [
    { type: 'team_member', name: 'Alex Rivera', role: 'Head of Growth', content: 'I help companies turn traffic into booked calls.', src: IMG.man }
  ]),
  P('team-three', 'Team', 'Leadership row', 'Three people', [
    { type: 'headline', content: 'The team' },
    { type: 'row', columns: [
      { canvas: [{ type: 'team_member', name: 'Alex Rivera', role: 'Growth', content: 'Funnels and paid.', src: IMG.man, bg: '#0b0f19' }] },
      { canvas: [{ type: 'team_member', name: 'Lina Farouk', role: 'Product', content: 'Builder and UX.', src: IMG.woman, bg: '#111827' }] },
      { canvas: [{ type: 'team_member', name: 'Noor Hassan', role: 'Success', content: 'Onboarding and support.', src: IMG.woman2, bg: '#1e293b' }] }
    ]}
  ]),
  P('team-about', 'Team', 'Team + story', 'About split then member', [
    { type: 'about_split', title: 'Why we built a team around the builder', content: 'Writers, designers, and closers sit in the same workspace as the page.', src: IMG.team, buttonText: 'Meet everyone' }
  ]),
  P('team-hiring', 'Team', 'We’re hiring', 'CTA for careers', [
    { type: 'headline', content: 'Build with us' },
    { type: 'paragraph', content: 'We hire operators who like shipping pages more than slide decks.', align: 'center' },
    { type: 'cta_banner', title: 'Open roles', content: 'Product, support, and partner success.', buttonText: 'See roles', bg: '#2563eb' }
  ]),
  P('team-quote', 'Team', 'Team quote', 'Voice of the company', [
    { type: 'quote', content: 'If a client cannot change the headline themselves, we failed.', author: 'Lina Farouk', role: 'Head of Product' }
  ]),
  P('team-stats', 'Team', 'Team by the numbers', 'Studio stats', [
    { type: 'stats_row', items: [{ number: '18', label: 'Teammates' }, { number: '6', label: 'Time zones' }, { number: '40+', label: 'Languages in support' }, { number: '1', label: 'Shared builder' }] }
  ]),

  // ── Testimonials ──
  P('love-grid', 'Testimonials', '3-column reviews', 'Classic proof grid', [
    { type: 'testimonials', title: 'What clients say' }
  ]),
  P('love-single', 'Testimonials', 'Featured quote', 'One strong quote', [
    { type: 'quote', content: 'I launched my first funnel in one afternoon and booked 9 calls.', author: 'Nora Al-Rashidi', role: 'Saudi Arabia' },
    { type: 'star_rating', content: 'Typical first-week result from a published page' }
  ]),
  P('love-video', 'Testimonials', 'Video testimonial', 'Playable social proof', [
    { type: 'headline', content: 'Hear it from them' },
    { type: 'video', title: 'Customer story' },
    { type: 'paragraph', content: 'Replace the embed URL with your own interview.', align: 'center' }
  ]),
  P('love-logos', 'Testimonials', 'Reviews + logos', 'Proof sandwich', [
    { type: 'logo_cloud', title: 'Teams already publishing' },
    { type: 'testimonials', title: '' }
  ]),
  P('love-rating', 'Testimonials', 'Score + reviews', 'Stars then grid', [
    { type: 'star_rating', stars: 5, content: '4.9 average from live workspaces' },
    { type: 'testimonials' }
  ]),
  P('love-cta', 'Testimonials', 'Reviews then CTA', 'Proof to action', [
    { type: 'testimonials', title: 'Don’t take our word for it' },
    { type: 'button', content: 'Start your page' }
  ])
];
