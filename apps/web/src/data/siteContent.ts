// =====================================================================
// Single source of truth for editable public-site content (the website CMS).
//
// Every key here is editable from the dashboard "Website Content" editor and
// stored in the SiteContent table. The public pages read a key via the
// `useSiteContent().c(key)` hook, which returns the saved value when present
// and falls back to the default below — so the site always renders, and these
// defaults double as the seed data.
//
// `value` may be a string, a block of text, or a structured object/array.
// `kind` tells the editor how to render it: text | textarea | list | json | image.
// =====================================================================

import { CORE_SERVICES } from './websiteData';

export type ContentKind = 'text' | 'textarea' | 'list' | 'json' | 'image';

export interface ContentDef {
  value: unknown;
  group: string; // editor grouping, e.g. "Hero", "Contact"
  label: string; // human label in the editor
  kind: ContentKind;
}

export interface HeroSlideText {
  title: string;
  titleAr?: string;
  highlight: string;
  highlightAr?: string;
  caption: string;
  captionAr?: string;
  tag: string;
  tagAr?: string;
}

export const SITE_CONTENT_DEFAULTS: Record<string, ContentDef> = {
  // ---- Brand -----------------------------------------------------------
  'brand.name': { value: 'AR Trust Travel & Tourism', group: 'Brand', label: 'Brand name', kind: 'text' },
  'brand.tagline': { value: 'Journeys, Explorations, & Adventures', group: 'Brand', label: 'Brand tagline', kind: 'text' },

  // ---- Homepage hero ---------------------------------------------------
  'home.hero.slides': {
    group: 'Homepage · Hero',
    label: 'Hero slides (text)',
    kind: 'json',
    value: [
      {
        title: 'Experience Qatar’s Wonders With',
        titleAr: 'اكتشف روائع ومعالم قطر الساحرة مع',
        highlight: 'AR Trust Travel & Tourism',
        highlightAr: 'الرائد للثقة للسياحة والسفر',
        caption: 'Official Destination Management Company: Desert safaris, inland sea dune thrills, traditional dhow cruises, VIP airport transit, and luxury hotel holidays.',
        captionAr: 'الشركة الرسمية الرائدة لإدارة الوجهات السياحية في قطر: رحلات السفاري الصحراوية، الكثبان الرملية في خور العديد، الرحلات البحرية، واستقبال المطار الفاخر.',
        tag: 'Explore Qatar • All-in-One Destination Services',
        tagAr: 'اكتشف قطر • خدمات إدارة وجهات متكاملة',
      },
      {
        title: 'Thrilling Inland Sea Dune Safaris',
        titleAr: 'مغامرات السفاري الصحراوية والكثبان الرملية',
        highlight: 'With 4x4 Land Cruiser Expeditions',
        highlightAr: 'مع رحلات لاند كروزر 4x4',
        caption: 'Heart-pounding dune bashing across sweeping desert sands to the UNESCO Inland Sea (Khor Al Adaid) with traditional Bedouin hospitality.',
        captionAr: 'إثارة ركوب الكثبان الرملية في صحراء قطر الخلابة وصولاً إلى خور العديد مع تجربة الضيافة البدوية الأصيلة.',
        tag: 'Desert Safaris & Inland Sea',
        tagAr: 'سفاري الصحراء والبحر الداخلي',
      },
      {
        title: 'Premier Airport Transit & Fleet',
        titleAr: 'خدمات استقبال المطار والأسطول الفاخر',
        highlight: 'With VIP Driver & Transfers',
        highlightAr: 'مع خدمة السائق الخاص الفاخر',
        caption: 'Luxury Mercedes-Benz V-Class, Land Cruisers & seamless Hamad International Airport layover tours with guaranteed punctual return.',
        captionAr: 'سيارات مرسيدس V-Class ولاند كروزر فاخرة لجولات ترانزيت سلسة ومضمونة لمسافري مطار حمد الدولي.',
        tag: 'Hamad Airport & Luxury Fleet',
        tagAr: 'مطار حمد والأسطول الفاخر',
      },
      {
        title: 'Authentic Arabian Dhow Cruises',
        titleAr: 'رحلات المراكب الشراعية التقليدية',
        highlight: '& Doha Heritage Excursions',
        highlightAr: 'وجولات التراث في الدوحة',
        caption: 'Traditional wooden Dhow cruises across Doha Bay, Katara Cultural Village strolls, and vibrant Souq Waqif spice market treasures.',
        captionAr: 'رحلات بحرية تقليدية على متن قوارب الداو في خليج الدوحة، وزيارات لقرية كتارا الثقافية وأزقة سوق واقف التاريخية.',
        tag: 'Dhow Cruise & Cultural Heritage',
        tagAr: 'رحلات الداو والتراث الثقافي',
      },
    ] as HeroSlideText[],
  },

  // ---- Homepage hero background images (dashboard-editable) ------------
  // Each slide's background image. Change/remove from the Website Content
  // editor; defaults point at committed /media files (shipped in the repo).
  'home.hero.slide1.image': { value: '/media/explore-qatar-hero.jpg', group: 'Homepage · Hero', label: 'Hero slide 1 image', kind: 'image' },
  'home.hero.slide2.image': { value: '/media/inland-sea-safari-hero.jpg', group: 'Homepage · Hero', label: 'Hero slide 2 image', kind: 'image' },
  'home.hero.slide3.image': { value: '/media/vip-airport-transit-hero.jpg', group: 'Homepage · Hero', label: 'Hero slide 3 image', kind: 'image' },
  'home.hero.slide4.image': { value: '/media/dhow-cruise-heritage-hero.jpg', group: 'Homepage · Hero', label: 'Hero slide 4 image', kind: 'image' },

  // ---- Homepage section headings --------------------------------------
  'home.tours.title': { value: 'Popular Tour Packages', group: 'Homepage · Sections', label: 'Tours heading', kind: 'text' },
  'home.tours.subtitle': { value: 'Handcrafted Qatar experiences, from desert safaris to dhow cruises.', group: 'Homepage · Sections', label: 'Tours subheading', kind: 'textarea' },
  'home.fleet.title': { value: 'Luxury Fleet & Drivers', group: 'Homepage · Sections', label: 'Fleet heading', kind: 'text' },
  'home.fleet.subtitle': { value: 'Mercedes V-Class, Land Cruisers & VIP vans with professional drivers.', group: 'Homepage · Sections', label: 'Fleet subheading', kind: 'textarea' },
  'home.services.title': { value: 'Our Core Services', group: 'Homepage · Sections', label: 'Services heading', kind: 'text' },
  'home.services.subtitle': { value: 'End-to-end travel management for Qatar and beyond.', group: 'Homepage · Sections', label: 'Services subheading', kind: 'textarea' },
  'home.services': { value: CORE_SERVICES, group: 'Homepage · Services', label: 'Service cards', kind: 'json' },
  'home.reviews.title': { value: 'What Our Travelers Say', group: 'Homepage · Sections', label: 'Reviews heading', kind: 'text' },
  'home.reviews.subtitle': { value: 'Real reviews from guests across the world.', group: 'Homepage · Sections', label: 'Reviews subheading', kind: 'textarea' },
  'home.cta.title': { value: 'Ready to Explore Qatar?', group: 'Homepage · CTA', label: 'CTA heading', kind: 'text' },
  'home.cta.subtitle': { value: 'Let us craft your perfect Qatar journey — from airport to adventure.', group: 'Homepage · CTA', label: 'CTA subheading', kind: 'textarea' },
  'home.cta.button': { value: 'Book Your Experience', group: 'Homepage · CTA', label: 'CTA button', kind: 'text' },
  'home.whyus.image': { value: '/media/holiday-packages-hero.jpg', group: 'Homepage · Why Us', label: 'Why-Us showcase image', kind: 'image' },

  // ---- Contact ---------------------------------------------------------
  'contact.title': { value: 'Get in Touch', group: 'Contact', label: 'Contact heading', kind: 'text' },
  'contact.subtitle': { value: 'Our team is available 24/7 to plan your Qatar experience.', group: 'Contact', label: 'Contact subheading', kind: 'textarea' },
  'contact.address': { value: 'West Bay, Doha, Qatar', group: 'Contact', label: 'Office address', kind: 'text' },
  'contact.hours': { value: 'Open 24/7 — every day', group: 'Contact', label: 'Working hours', kind: 'text' },
  'contact.phones': { value: ['+974 5555 7164', '+974 5550 2878', '+974 4444 8920'], group: 'Contact', label: 'Phone numbers', kind: 'list' },
  'contact.emails': { value: ['support@artrusttravel.com', 'bookings@artrusttravel.com', 'info@artrusttravel.com'], group: 'Contact', label: 'Email addresses', kind: 'list' },
  'contact.whatsapp': { value: '+974 5555 7164', group: 'Contact', label: 'WhatsApp number', kind: 'text' },

  // ---- Footer ----------------------------------------------------------
  'footer.tagline': { value: 'Qatar’s trusted destination management company for tours, transfers and luxury travel.', group: 'Footer', label: 'Footer tagline', kind: 'textarea' },
  'footer.copyright': { value: '© 2026 AR Trust Travel & Tourism. All rights reserved.', group: 'Footer', label: 'Copyright line', kind: 'text' },
};

/** Convenience: read a default value by key (used as the hook's fallback). */
export function defaultContent(key: string): unknown {
  return SITE_CONTENT_DEFAULTS[key]?.value;
}
