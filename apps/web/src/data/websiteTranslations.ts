export type WebsiteLanguageCode = 'en' | 'de' | 'fr' | 'it' | 'es' | 'ru';

export interface WebsiteLanguageOption {
  code: WebsiteLanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  shortCode: string;
  region: string;
}

export const WEBSITE_LANGUAGES: WebsiteLanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (UK / Global)',
    flag: '🇬🇧',
    shortCode: 'ENG',
    region: 'UK, US & Global Travelers',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    shortCode: 'DEU',
    region: 'Germany • Austria • Switzerland',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    shortCode: 'FRA',
    region: 'France • Belgium • Switzerland',
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    shortCode: 'ITA',
    region: 'Italy • Southern Europe',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    shortCode: 'ESP',
    region: 'Spain • Europe • Latin America',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    shortCode: 'RUS',
    region: 'Eastern Europe & Central Asia',
  },
];

export interface WebsiteTranslations {
  // Top Header Announcement
  supportEmail: string;
  phone: string;
  address: string;
  licenseBadge: string;
  signInStaff: string;
  myDashboard: string;
  partnerConsole: string;
  dashboard: string;
  logout: string;

  // Navigation Links
  navHome: string;
  navTours: string;
  navFleet: string;
  navPackages: string;
  navServices: string;
  navWhyUs: string;
  navReviews: string;
  navContact: string;
  exploreCatalog: string;
  bookByCalendar: string;

  // Search & Catalog
  searchPlaceholder: string;
  searchBtn: string;
  popularLabel: string;
  tagDesertSafari: string;
  tagDhowCruise: string;
  tagMercedesVClass: string;
  tagAirportTransit: string;
  tagFiveStarHotels: string;

  // Common UI words across all pages
  common: {
    bookNow: string;
    viewDetails: string;
    startingFrom: string;
    perPerson: string;
    perVehicle: string;
    duration: string;
    groupSize: string;
    freeCancellation: string;
    instantConfirmation: string;
    home: string;
    all: string;
    reserveNow: string;
    reviewsCount: string;
    licensedDmc: string;
    passengers: string;
    luggage: string;
    days: string;
    nights: string;
  };

  // Hero Section
  officialDmcBadge: string;
  slides: Array<{
    title: string;
    highlight: string;
    caption: string;
    tag: string;
  }>;

  // Homepage sections
  homeSections: {
    trustReviews: string;
    trustLicense: string;
    trustPunctual: string;
    toursTitle: string;
    toursSubtitle: string;
    toursViewAll: string;
    fleetTitle: string;
    fleetSubtitle: string;
    fleetViewAll: string;
    packagesTitle: string;
    packagesSubtitle: string;
    packagesViewAll: string;
    servicesTitle: string;
    servicesSubtitle: string;
    servicesViewAll: string;
    whyUsTitle: string;
    whyUsSubtitle: string;
    reviewsTitle: string;
    reviewsSubtitle: string;
  };

  // Tours & Safaris Page
  toursPage: {
    heroTitle: string;
    heroSubtitle: string;
    searchPlaceholder: string;
    allTours: string;
    catDesert: string;
    catCity: string;
    catTransit: string;
    catSea: string;
    catPrivate: string;
  };

  // Airport Fleet Page
  fleetPage: {
    heroTitle: string;
    heroSubtitle: string;
    allFleet: string;
    flightDelayTracking: string;
    flightDelayTrackingDesc: string;
    curbsideGreeting: string;
    curbsideGreetingDesc: string;
    complimentaryWater: string;
    complimentaryWaterDesc: string;
    climateControl: string;
    climateControlDesc: string;
    bookTransfer: string;
  };

  // Holiday Packages Page
  packagesPage: {
    heroTitle: string;
    heroSubtitle: string;
    allInclusiveBadge: string;
    reservePackage: string;
    inclusionsTitle: string;
  };

  // Services Page
  servicesPage: {
    heroTitle: string;
    heroSubtitle: string;
    getQuote: string;
    officialDmcGuarantee: string;
  };

  // Why Us Page
  whyUsPage: {
    heroTitle: string;
    heroSubtitle: string;
    bookWithConfidence: string;
    contactDesk: string;
  };

  // Reviews Page
  reviewsPage: {
    heroTitle: string;
    heroSubtitle: string;
    ratingScore: string;
    ratingSubtitle: string;
    filterAll: string;
    submitReviewBtn: string;
  };

  // Contact Page
  contactPage: {
    heroTitle: string;
    heroSubtitle: string;
    hqTitle: string;
    phoneTitle: string;
    emailTitle: string;
    hoursTitle: string;
    formName: string;
    formEmail: string;
    formPhone: string;
    formService: string;
    formMessage: string;
    formSubmit: string;
    formSuccess: string;
  };

  // Search Page
  searchPage: {
    heroTitle: string;
    resultsFound: string;
    noResults: string;
    filterAll: string;
  };

  // Website Footer
  footer: {
    aboutTitle: string;
    aboutDesc: string;
    quickLinksTitle: string;
    servicesTitle: string;
    vipClubTitle: string;
    vipClubDesc: string;
    vipClubBtn: string;
    subscribedSuccess: string;
    copyright: string;
  };
}

export const WEBSITE_TRANSLATIONS: Record<WebsiteLanguageCode, WebsiteTranslations> = {
  en: {
    supportEmail: 'support@artrusttravel.com',
    phone: '+974 5555 7164',
    address: 'Bin Dirham Plaza, Al Mansoura, Doha, Qatar',
    licenseBadge: 'Qatar Tourism DMC #QTA-QA-8819',
    signInStaff: 'Sign In / Staff',
    myDashboard: 'My Dashboard',
    partnerConsole: 'Partner Console',
    dashboard: 'Dashboard',
    logout: 'Logout',

    navHome: 'Home',
    navTours: 'Tours & Safaris',
    navFleet: 'Airport Fleet',
    navPackages: 'Holiday Packages',
    navServices: 'Services',
    navWhyUs: 'Why Us',
    navReviews: 'Reviews',
    navContact: 'Contact',
    exploreCatalog: 'Explore Catalog',
    bookByCalendar: 'Book by Calendar',

    searchPlaceholder: 'Search desert safari, dhow cruise, Mercedes V-Class, hotels...',
    searchBtn: 'Search Catalog',
    popularLabel: 'Popular:',
    tagDesertSafari: 'Desert Safari',
    tagDhowCruise: 'Dhow Cruise',
    tagMercedesVClass: 'Mercedes V-Class',
    tagAirportTransit: 'Airport Transit',
    tagFiveStarHotels: '5-Star Hotels',

    common: {
      bookNow: 'Book Now',
      viewDetails: 'View Details',
      startingFrom: 'Starting from',
      perPerson: 'per person',
      perVehicle: 'per vehicle',
      duration: 'Duration',
      groupSize: 'Group Size',
      freeCancellation: 'Free Cancellation',
      instantConfirmation: 'Instant Confirmation',
      home: 'Home',
      all: 'All',
      reserveNow: 'Reserve Now',
      reviewsCount: 'reviews',
      licensedDmc: 'Licensed Qatar DMC #QTA-QA-8819',
      passengers: 'Passengers',
      luggage: 'Luggage',
      days: 'Days',
      nights: 'Nights',
    },

    officialDmcBadge: 'Official Qatar DMC',
    slides: [
      {
        title: 'Experience Qatar’s Wonders With',
        highlight: 'AR Trust Travel & Tourism',
        caption: 'Official Destination Management Company: Desert safaris, inland sea dune thrills, traditional dhow cruises, VIP airport transit, and luxury hotel holidays.',
        tag: 'Explore Qatar • All-in-One Destination Services',
      },
      {
        title: 'Thrilling Inland Sea Dune Safaris',
        highlight: 'With 4x4 Land Cruiser Expeditions',
        caption: 'Heart-pounding dune bashing across sweeping desert sands to the UNESCO Inland Sea (Khor Al Adaid) with traditional Bedouin hospitality.',
        tag: 'Desert Safaris & Inland Sea',
      },
      {
        title: 'Premier Airport Transit & Fleet',
        highlight: 'With VIP Driver & Transfers',
        caption: 'Luxury Mercedes-Benz V-Class, Land Cruisers & seamless Hamad International Airport layover tours with guaranteed punctual return.',
        tag: 'Hamad Airport & Luxury Fleet',
      },
      {
        title: 'Authentic Arabian Dhow Cruises',
        highlight: '& Doha Heritage Excursions',
        caption: 'Traditional wooden Dhow cruises across Doha Bay, Katara Cultural Village strolls, and vibrant Souq Waqif spice market treasures.',
        tag: 'Dhow Cruise & Cultural Heritage',
      },
    ],

    homeSections: {
      trustReviews: '4.9/5 from 1,200+ Global Travelers',
      trustLicense: 'Licensed Qatar Tourism Partner',
      trustPunctual: 'Guaranteed On-Time Airport Return',
      toursTitle: 'Elite Qatar Tour Adventures',
      toursSubtitle: 'Handcrafted tours combining heart-pounding desert safaris, traditional wooden dhow cruises, and fast-track transit city experiences.',
      toursViewAll: 'View All Tours Page',
      fleetTitle: 'Executive Driver & Airport Fleet',
      fleetSubtitle: 'Driven Mercedes-Benz V-Class, Toyota Land Cruisers, and luxury coaches with live flight tracking and 24/7 curbside dispatch.',
      fleetViewAll: 'View All Fleet Vehicles',
      packagesTitle: 'Curated Holiday Comfort Packages',
      packagesSubtitle: 'All-inclusive multi-day holiday packages combining 5-star hotel stays, curated Doha excursions, wild Inland Sea dune bashing, and VIP airport escort.',
      packagesViewAll: 'View All Packages',
      servicesTitle: 'Comprehensive Travel & DMC Services',
      servicesSubtitle: 'Full-spectrum travel management, Hamad airport VIP concierge, tourist visa processing, and corporate group itineraries.',
      servicesViewAll: 'Explore All DMC Services',
      whyUsTitle: 'Why Discriminating Travelers Choose Us',
      whyUsSubtitle: 'Accredited government licensing, direct vehicle ownership, and dedicated 24/7 hospitality desks located right in Doha.',
      reviewsTitle: 'What Global Travelers Say',
      reviewsSubtitle: 'Verified feedback from discerning guests from the UK, Europe, and around the world.',
    },

    toursPage: {
      heroTitle: 'Qatar Desert Safaris & Sightseeing Tours',
      heroSubtitle: 'Experience heart-pounding 4x4 dune bashing to the UNESCO Inland Sea, traditional wooden Dhow cruises in Doha Bay, and cultural heritage excursions.',
      searchPlaceholder: 'Search tours by title or keywords...',
      allTours: 'All Tours',
      catDesert: 'Desert Safari',
      catCity: 'City Tour',
      catTransit: 'Airport Transit',
      catSea: 'Sea Tour',
      catPrivate: 'Private Luxury',
    },

    fleetPage: {
      heroTitle: 'Our Premium Transfer & Driver Fleet',
      heroSubtitle: 'From executive Mercedes-Benz V-Class and rugged Toyota Land Cruisers to spacious family MPVs and luxury group coaches. Punctual Hamad Airport greetings.',
      allFleet: 'All Fleet',
      flightDelayTracking: 'Flight Delay Tracking',
      flightDelayTrackingDesc: 'Auto-adjusted pickup if your flight arrives early or late',
      curbsideGreeting: 'Curbside Greeting',
      curbsideGreetingDesc: 'Uniformed driver holding a personalized digital nameboard',
      complimentaryWater: 'Chilled Water & Wi-Fi',
      complimentaryWaterDesc: 'On-board refreshments and high-speed in-cabin Wi-Fi',
      climateControl: 'Dual-Zone Climate Control',
      climateControlDesc: 'High-power AC optimized for peak Gulf summer comfort',
      bookTransfer: 'Book Transfer',
    },

    packagesPage: {
      heroTitle: 'Curated Qatar Holiday Comfort Packages',
      heroSubtitle: 'All-inclusive multi-day holiday packages combining 5-star hotel stays, curated Doha excursions, wild Inland Sea dune bashing, and VIP airport escort.',
      allInclusiveBadge: 'All-Inclusive DMC Package',
      reservePackage: 'Reserve Package',
      inclusionsTitle: 'Package Inclusions & Highlights',
    },

    servicesPage: {
      heroTitle: 'Full-Spectrum Qatar DMC & Travel Services',
      heroSubtitle: 'Comprehensive B2B & consumer destination management: Worldwide airline ticketing, 5-star hotel bookings, tourist visas, and VIP airport concierge.',
      getQuote: 'Request Custom Quote',
      officialDmcGuarantee: 'Guaranteed Service Delivery by Licensed Qatar Tourism DMC #QTA-QA-8819',
    },

    whyUsPage: {
      heroTitle: 'Why Travelers Choose AR Trust Travel',
      heroSubtitle: 'Qatar’s premier licensed Destination Management Company delivering unmatched service, safety, and local expertise.',
      bookWithConfidence: 'Book With Confidence',
      contactDesk: 'Contact 24/7 Desk',
    },

    reviewsPage: {
      heroTitle: 'Traveler Reviews & Global Testimonials',
      heroSubtitle: 'Read verified feedback from travelers across Europe and the globe who explored Qatar with AR Trust Travel.',
      ratingScore: '4.9 / 5.0 Rating',
      ratingSubtitle: 'Over 1,200+ verified traveler reviews from the UK, Germany, France, Italy, and Spain',
      filterAll: 'All Experiences',
      submitReviewBtn: 'Write a Review',
    },

    contactPage: {
      heroTitle: 'Contact Our Doha Operations Concierge',
      heroSubtitle: 'Have a question about a safari tour, airport transfer, or corporate group booking? Our 24/7 travel desk in Doha is ready to assist you anytime.',
      hqTitle: 'Doha Operations Center',
      phoneTitle: '24/7 Dispatch Hotline',
      emailTitle: 'Customer Care Desk',
      hoursTitle: 'Desk Working Hours',
      formName: 'Your Full Name',
      formEmail: 'Email Address',
      formPhone: 'Phone / WhatsApp Number',
      formService: 'Interested Service',
      formMessage: 'How can we assist you?',
      formSubmit: 'Send Priority Inquiry',
      formSuccess: 'Thank you! Your inquiry has been dispatched to our Doha team.',
    },

    searchPage: {
      heroTitle: 'Catalog Search & Live Booking Engine',
      resultsFound: 'experiences & fleet vehicles available',
      noResults: 'No experiences found matching your query. Try searching for "Safari", "Cruise", or "Mercedes".',
      filterAll: 'All Categories',
    },

    footer: {
      aboutTitle: 'About AR Trust Travel',
      aboutDesc: 'AR Trust Travel & Tourism is an officially licensed Qatar Destination Management Company (DMC) delivering desert safaris, luxury airport transfers, VIP driver services, and custom holiday tours.',
      quickLinksTitle: 'Quick Links',
      servicesTitle: 'Our Core Services',
      vipClubTitle: 'Official Qatar Travel Club',
      vipClubDesc: 'Subscribe to receive seasonal VIP discounts, complimentary airport lounge passes, and early access to luxury desert safari slots.',
      vipClubBtn: 'Join the VIP Club',
      subscribedSuccess: 'Welcome to the VIP Travel Club! Your promo code is QATARVIP10.',
      copyright: 'All rights reserved. AR Trust Travel & Tourism LLC.',
    },
  },

  de: {
    supportEmail: 'support@artrusttravel.com',
    phone: '+974 5555 7164',
    address: 'Bin Dirham Plaza, Al Mansoura, Doha, Katar',
    licenseBadge: 'Katar Tourismus DMC Lizenz #QTA-QA-8819',
    signInStaff: 'Anmelden / Team',
    myDashboard: 'Mein Dashboard',
    partnerConsole: 'Partner-Konsole',
    dashboard: 'Dashboard',
    logout: 'Abmelden',

    navHome: 'Startseite',
    navTours: 'Touren & Safaris',
    navFleet: 'Flughafenflotte',
    navPackages: 'Urlaubspakete',
    navServices: 'Dienstleistungen',
    navWhyUs: 'Warum Wir',
    navReviews: 'Bewertungen',
    navContact: 'Kontakt',
    exploreCatalog: 'Katalog Entdecken',
    bookByCalendar: 'Nach Kalender Buchen',

    searchPlaceholder: 'Wüstensafari, Dhow-Fahrt, Mercedes V-Klasse, Hotels suchen...',
    searchBtn: 'Katalog Suchen',
    popularLabel: 'Beliebt:',
    tagDesertSafari: 'Wüstensafari',
    tagDhowCruise: 'Dhow-Fahrt',
    tagMercedesVClass: 'Mercedes V-Klasse',
    tagAirportTransit: 'Flughafentransfer',
    tagFiveStarHotels: '5-Sterne-Hotels',

    common: {
      bookNow: 'Jetzt Buchen',
      viewDetails: 'Details Anzeigen',
      startingFrom: 'Ab',
      perPerson: 'pro Person',
      perVehicle: 'pro Fahrzeug',
      duration: 'Dauer',
      groupSize: 'Gruppengröße',
      freeCancellation: 'Kostenlose Stornierung',
      instantConfirmation: 'Sofortige Bestätigung',
      home: 'Startseite',
      all: 'Alle',
      reserveNow: 'Jetzt Reservieren',
      reviewsCount: 'Bewertungen',
      licensedDmc: 'Lizenzierter Katar DMC #QTA-QA-8819',
      passengers: 'Passagiere',
      luggage: 'Gepäck',
      days: 'Tage',
      nights: 'Nächte',
    },

    officialDmcBadge: 'Offizieller Katar DMC Partner',
    slides: [
      {
        title: 'Erleben Sie Katars Wunder Mit',
        highlight: 'AR Trust Travel & Tourism',
        caption: 'Offizielle Destination Management Company: Wüstensafaris, Dünenfahrten am Binnenmeer, Dhow-Kreuzfahrten, VIP-Flughafentransfers und Luxushotels.',
        tag: 'Katar Entdecken • Rundum-Reiseservice',
      },
      {
        title: 'Aufregende Binnenmeer-Wüstensafaris Mit',
        highlight: '4x4 Land Cruiser Expeditionen',
        caption: 'Atemberaubendes Dünen-Bashing durch den Wüstensand zum UNESCO-Binnenmeer (Khor Al Adaid) mit traditioneller Beduinen-Gastfreundschaft.',
        tag: 'Wüstensafaris & Binnenmeer',
      },
      {
        title: 'Erstklassiger Flughafentransit & Fuhrpark Mit',
        highlight: 'VIP Chauffeur & Transfers',
        caption: 'Luxuriöse Mercedes-Benz V-Klasse, Land Cruiser und nahtlose Zwischenstopp-Touren am Hamad International Airport mit pünktlicher Rückkehrgarantie.',
        tag: 'Hamad Flughafen & Luxusflotte',
      },
      {
        title: 'Authentische Arabische Dhow-Kreuzfahrten &',
        highlight: 'Doha Kulturerbe-Ausflüge',
        caption: 'Traditionelle Holz-Dhow-Fahrten in der Bucht von Doha, Spaziergänge im Kulturdorf Katara und der lebendige Gewürzmarkt Souq Waqif.',
        tag: 'Dhow-Fahrt & Kulturerbe',
      },
    ],

    homeSections: {
      trustReviews: '4.9/5 von über 1.200 internationalen Reisenden',
      trustLicense: 'Offizieller Katar-Tourismus-Partner',
      trustPunctual: 'Garantierte pünktliche Flughafen-Rückkehr',
      toursTitle: 'Erstklassige Katar-Touren & Abenteuer',
      toursSubtitle: 'Handverlesene Erlebnisse: spektakuläre Wüstensafaris, traditionelle Holzboot-Fahrten und City-Sightseeing.',
      toursViewAll: 'Alle Touren Anzeigen',
      fleetTitle: 'VIP Chauffeur & Flughafen-Flotte',
      fleetSubtitle: 'Chauffeurgesteuerte Mercedes V-Klasse, Land Cruiser und Reisebusse mit Flugverfolgung und 24/7-Abholung.',
      fleetViewAll: 'Alle Fahrzeuge Anzeigen',
      packagesTitle: 'Exklusive Katar Urlaubspakete',
      packagesSubtitle: 'All-inclusive Mehrtagesreisen mit 5-Sterne-Hotels, geführten Kulturausflügen und Wüstenabenteuern.',
      packagesViewAll: 'Alle Urlaubspakete',
      servicesTitle: 'Umfassende Reise- & DMC-Dienste',
      servicesSubtitle: 'Globales Ticketing, 5-Sterne-Hotelbuchungen, Visa-Bearbeitung und VIP-Flughafenservice am Hamad Airport.',
      servicesViewAll: 'Alle Dienstleistungen',
      whyUsTitle: 'Warum anspruchsvolle Reisende uns wählen',
      whyUsSubtitle: 'Staatliche Lizenzierung, eigene Premium-Fahrzeugflotte und persönlicher 24/7-Gästeservice direkt in Doha.',
      reviewsTitle: 'Was internationale Gäste sagen',
      reviewsSubtitle: 'Verifizierte Erfahrungen von Gästen aus Deutschland, Österreich, der Schweiz und weltweit.',
    },

    toursPage: {
      heroTitle: 'Wüstensafaris & Ausflüge in Katar',
      heroSubtitle: 'Erleben Sie rasantes 4x4-Dune-Bashing zum UNESCO-Binnenmeer, traditionelle Dhow-Fahrten in der Bucht von Doha und historische Städtetouren.',
      searchPlaceholder: 'Touren nach Titel oder Stichwort durchsuchen...',
      allTours: 'Alle Touren',
      catDesert: 'Wüstensafari',
      catCity: 'Stadttour',
      catTransit: 'Flughafentransfer',
      catSea: 'Bootstour',
      catPrivate: 'Privater Luxus',
    },

    fleetPage: {
      heroTitle: 'Unsere Premium Chauffeur- & Transferflotte',
      heroSubtitle: 'Von der exklusiven Mercedes-Benz V-Klasse über kraftvolle Toyota Land Cruiser bis hin zu Familien-Vans und Reisebussen.',
      allFleet: 'Gesamte Flotte',
      flightDelayTracking: 'Flugverspätungs-Tracking',
      flightDelayTrackingDesc: 'Automatische Anpassung der Abholzeit bei verfrühten oder verspäteten Flügen',
      curbsideGreeting: 'Empfang am Ausgang',
      curbsideGreetingDesc: 'Chauffeur in Uniform mit persönlichem digitalem Namensschild',
      complimentaryWater: 'Gekühltes Wasser & WLAN',
      complimentaryWaterDesc: 'Kostenlose Erfrischungen und Highspeed-WLAN an Bord',
      climateControl: 'Klimaautomatik',
      climateControlDesc: 'Leistungsstarke Klimaanlage für maximalen Komfort',
      bookTransfer: 'Transfer Buchen',
    },

    packagesPage: {
      heroTitle: 'Kuratierte Katar-Urlaubspakete',
      heroSubtitle: 'Mehrtägige Luxusreisen inklusive 5-Sterne-Hotels, geführten Touren, Binnenmeer-Safari und Flughafentransfers.',
      allInclusiveBadge: 'All-Inclusive DMC-Paket',
      reservePackage: 'Paket Reservieren',
      inclusionsTitle: 'Enthaltene Leistungen & Höhepunkte',
    },

    servicesPage: {
      heroTitle: 'Vollumfängliche DMC- & Reisedienste in Katar',
      heroSubtitle: 'Professionelles Destinationsmanagement: Flugtickets, 5-Sterne-Resortbuchungen, Touristenvisa und VIP-Flughafenassistenz.',
      getQuote: 'Individuelles Angebot anfordern',
      officialDmcGuarantee: 'Garantierter Service durch lizenzierten Katar DMC #QTA-QA-8819',
    },

    whyUsPage: {
      heroTitle: 'Warum Reisende AR Trust Travel Wählen',
      heroSubtitle: 'Katars führende lizenzierte Reiseservice-Agentur mit höchstem Anspruch an Sicherheit, Pünktlichkeit und Qualität.',
      bookWithConfidence: 'Sicher Buchen',
      contactDesk: '24/7 Team Kontaktieren',
    },

    reviewsPage: {
      heroTitle: 'Gästebewertungen & Internationale Erfahrungsberichte',
      heroSubtitle: 'Echte Bewertungen von Gästen aus Europa und aller Welt, die Katar mit uns entdeckt haben.',
      ratingScore: '4.9 / 5.0 Gesamtbewertung',
      ratingSubtitle: 'Über 1.200 verifizierte Kundenstimmen aus Deutschland, UK, Frankreich und der Schweiz',
      filterAll: 'Alle Erlebnisse',
      submitReviewBtn: 'Bewertung Abgeben',
    },

    contactPage: {
      heroTitle: 'Kontaktieren Sie Unser Doha-Team',
      heroSubtitle: 'Haben Sie Fragen zu Safaris, Flughafentransfers oder Gruppenreisen? Unser 24/7-Reiseteam in Doha hilft Ihnen jederzeit weiter.',
      hqTitle: 'Zentrale Doha',
      phoneTitle: '24/7 Hotline',
      emailTitle: 'Kundenservice-E-Mail',
      hoursTitle: 'Öffnungszeiten',
      formName: 'Ihr vollständiger Name',
      formEmail: 'E-Mail-Adresse',
      formPhone: 'Telefon- / WhatsApp-Nummer',
      formService: 'Gewünschte Leistung',
      formMessage: 'Wie können wir Ihnen helfen?',
      formSubmit: 'Anfrage Senden',
      formSuccess: 'Vielen Dank! Ihre Anfrage wurde an unser Team in Doha weitergeleitet.',
    },

    searchPage: {
      heroTitle: 'Katalogsuche & Buchungsübersicht',
      resultsFound: 'Erlebnisse und Fahrzeuge verfügbar',
      noResults: 'Keine passenden Angebote gefunden. Versuchen Sie es mit Begriffen wie "Safari", "Boot" oder "Mercedes".',
      filterAll: 'Alle Kategorien',
    },

    footer: {
      aboutTitle: 'Über AR Trust Travel',
      aboutDesc: 'AR Trust Travel & Tourism ist eine offiziell lizenzierte Destination Management Company in Katar. Wir bieten Wüstensafaris, exklusive Transfers und maßgeschneiderte Urlaubsreisen.',
      quickLinksTitle: 'Schnellzugriff',
      servicesTitle: 'Unsere Leistungen',
      vipClubTitle: 'Offizieller Katar Travel Club',
      vipClubDesc: 'Melden Sie sich an für exklusive VIP-Vorteile, Lounge-Pässe am Flughafen und Sonderkonditionen für Wüstensafaris.',
      vipClubBtn: 'Club Beitreten',
      subscribedSuccess: 'Herzlich willkommen im VIP Travel Club! Ihr Gutscheincode lautet QATARVIP10.',
      copyright: 'Alle Rechte vorbehalten. AR Trust Travel & Tourism LLC.',
    },
  },

  fr: {
    supportEmail: 'support@artrusttravel.com',
    phone: '+974 5555 7164',
    address: 'Bin Dirham Plaza, Al Mansoura, Doha, Qatar',
    licenseBadge: 'DMC officiel Tourisme Qatar #QTA-QA-8819',
    signInStaff: 'Connexion / Équipe',
    myDashboard: 'Mon Tableau de Bord',
    partnerConsole: 'Console Partenaire',
    dashboard: 'Tableau de Bord',
    logout: 'Déconnexion',

    navHome: 'Accueil',
    navTours: 'Tours & Safaris',
    navFleet: 'Flotte Aéroport',
    navPackages: 'Formules Vacances',
    navServices: 'Prestations',
    navWhyUs: 'Pourquoi Nous',
    navReviews: 'Avis Clients',
    navContact: 'Contact',
    exploreCatalog: 'Explorer le Catalogue',
    bookByCalendar: 'Réserver par Calendrier',

    searchPlaceholder: 'Rechercher safari désert, croisière boutre, Mercedes Classe V, hôtels...',
    searchBtn: 'Rechercher',
    popularLabel: 'Populaire :',
    tagDesertSafari: 'Safari Désert',
    tagDhowCruise: 'Croisière Boutre',
    tagMercedesVClass: 'Mercedes Classe V',
    tagAirportTransit: 'Transit Aéroport',
    tagFiveStarHotels: 'Hôtels 5 Étoiles',

    common: {
      bookNow: 'Réserver',
      viewDetails: 'Voir les Détails',
      startingFrom: 'À partir de',
      perPerson: 'par personne',
      perVehicle: 'par véhicule',
      duration: 'Durée',
      groupSize: 'Taille du groupe',
      freeCancellation: 'Annulation Gratuite',
      instantConfirmation: 'Confirmation Immédiate',
      home: 'Accueil',
      all: 'Tous',
      reserveNow: 'Réserver Maintenant',
      reviewsCount: 'avis',
      licensedDmc: 'DMC agréé Qatar #QTA-QA-8819',
      passengers: 'Passagers',
      luggage: 'Bagages',
      days: 'Jours',
      nights: 'Nuits',
    },

    officialDmcBadge: 'DMC Officiel Qatar',
    slides: [
      {
        title: 'Découvrez les Merveilles du Qatar Avec',
        highlight: 'AR Trust Travel & Tourism',
        caption: 'Agence de réceptif officiel : safaris dans le désert, sensations fortes sur les dunes côtières, croisières en boutre traditionnel et transferts aéroport VIP.',
        tag: 'Explorer le Qatar • Service de Voyage Intégral',
      },
      {
        title: 'Safaris Exaltants vers la Mer Intérieure En',
        highlight: 'Expéditions 4x4 Land Cruiser',
        caption: 'Parcourez les majestueuses dunes de sable jusqu’à la Mer Intérieure de l’UNESCO (Khor Al Adaid) avec l’hospitalité bédouine authentique.',
        tag: 'Safaris du Désert & Mer Intérieure',
      },
      {
        title: 'Flotte & Transferts Aéroport de Prestige Avec',
        highlight: 'Chauffeur VIP & Escorte',
        caption: 'Mercedes-Benz Classe V de luxe, Land Cruisers et circuits d’escale à l’aéroport international Hamad avec retour ponctuel garanti.',
        tag: 'Aéroport Hamad & Véhicules VIP',
      },
      {
        title: 'Croisières en Boutre Traditionnel &',
        highlight: 'Circuits Culturels à Doha',
        caption: 'Naviguez dans la baie de Doha, découvrez le village culturel de Katara et les étals colorés du souk Souq Waqif.',
        tag: 'Boutre Traditionnel & Patrimoine',
      },
    ],

    homeSections: {
      trustReviews: '4.9/5 par plus de 1 200 voyageurs internationaux',
      trustLicense: 'Partenaire agréé par Tourisme Qatar',
      trustPunctual: 'Garantie de retour ponctuel à l’aéroport',
      toursTitle: 'Excursions et Safaris d’Exception au Qatar',
      toursSubtitle: 'Des aventures inoubliables associant safaris dans les dunes, croisières traditionnelles et visites de la capitale.',
      toursViewAll: 'Voir Toutes les Excursions',
      fleetTitle: 'Chauffeur Privé & Flotte Aéroport',
      fleetSubtitle: 'Mercedes Classe V, Toyota Land Cruiser et autocars climatisés avec suivi des vols en temps réel.',
      fleetViewAll: 'Voir Tous les Véhicules',
      packagesTitle: 'Séjours & Formules Clés en Main',
      packagesSubtitle: 'Voyages tout compris avec hôtels 5 étoiles, visites guidées, bivouac dans le désert et assistance aéroportuaire.',
      packagesViewAll: 'Toutes les Formules',
      servicesTitle: 'Services Réceptifs & Affaires',
      servicesSubtitle: 'Billetterie internationale, hébergement de luxe, délivrance de visas et accueil VIP à l’aéroport Hamad.',
      servicesViewAll: 'Découvrir nos Services',
      whyUsTitle: 'Pourquoi les Voyageurs Exigeants nous Font Confiance',
      whyUsSubtitle: 'Licence d’État officielle, flotte exclusive de véhicules récents et équipe d’accueil dédiée 24h/24 à Doha.',
      reviewsTitle: 'Les Témoignages de nos Clients',
      reviewsSubtitle: 'Retours d’expérience de voyageurs venus de France, Belgique, Suisse et du monde entier.',
    },

    toursPage: {
      heroTitle: 'Safaris dans le Désert et Circuits au Qatar',
      heroSubtitle: 'Franchissez les dunes dorées en 4x4 jusqu’à la Mer Intérieure de l’UNESCO et naviguez sur les eaux calmes de la baie de Doha.',
      searchPlaceholder: 'Rechercher une excursion par nom ou mot-clé...',
      allTours: 'Toutes les Excursions',
      catDesert: 'Safari Désert',
      catCity: 'Visite de Ville',
      catTransit: 'Escale Aéroport',
      catSea: 'Circuit Maritime',
      catPrivate: 'Luxe Privé',
    },

    fleetPage: {
      heroTitle: 'Notre Flotte de Prestige avec Chauffeur',
      heroSubtitle: 'Mercedes-Benz Classe V, Toyota Land Cruiser et minibus grand confort pour vos transferts vers l’aéroport Hamad et vos déplacements.',
      allFleet: 'Toute la Flotte',
      flightDelayTracking: 'Suivi des Vols en Direct',
      flightDelayTrackingDesc: 'Prise en charge ajustée automatiquement en cas d’avance ou de retard',
      curbsideGreeting: 'Accueil Personnalisé',
      curbsideGreetingDesc: 'Chauffeur en tenue avec pancarte nominative dès la sortie',
      complimentaryWater: 'Eau Fraîche & Wi-Fi',
      complimentaryWaterDesc: 'Bouteilles d’eau minérale et connexion Internet haut débit',
      climateControl: 'Climatisation Optimale',
      climateControlDesc: 'Véhicules équipés pour garantir un confort thermique parfait',
      bookTransfer: 'Réserver un Transfert',
    },

    packagesPage: {
      heroTitle: 'Séjours & Forfaits Découverte au Qatar',
      heroSubtitle: 'Séjours tout compris avec hébergements 5 étoiles, découvertes culturelles, safari au désert et accueil personnalisé.',
      allInclusiveBadge: 'Formule Tout Compris',
      reservePackage: 'Réserver ce Séjour',
      inclusionsTitle: 'Prestations Incluses au Programme',
    },

    servicesPage: {
      heroTitle: 'Prestations Complètes de Réceptif au Qatar',
      heroSubtitle: 'Gestion de vos voyages d’affaires et loisirs : réservations d’hôtels 5 étoiles, billetterie, visas et conciergerie aéroport.',
      getQuote: 'Demander un Devis Personnalisé',
      officialDmcGuarantee: 'Service garanti par AR Trust Travel, agence agréée Tourisme Qatar #QTA-QA-8819',
    },

    whyUsPage: {
      heroTitle: 'Pourquoi Choisir AR Trust Travel',
      heroSubtitle: 'Le spécialiste réceptif de référence au Qatar, alliant rigueur, sécurité et accompagnement haut de gamme.',
      bookWithConfidence: 'Réserver en Toute Sérénité',
      contactDesk: 'Joindre notre Équipe 24h/24',
    },

    reviewsPage: {
      heroTitle: 'Avis des Voyageurs du Monde Entier',
      heroSubtitle: 'Consultez les avis authentiques de clients ayant exploré le Qatar avec nos équipes.',
      ratingScore: 'Note Moyenne : 4.9 / 5.0',
      ratingSubtitle: 'Plus de 1 200 avis certifiés de voyageurs français, suisses, belges et internationaux',
      filterAll: 'Toutes les Expériences',
      submitReviewBtn: 'Déposer un Avis',
    },

    contactPage: {
      heroTitle: 'Contactez notre Conciergerie à Doha',
      heroSubtitle: 'Une question sur un safari, un transfert privé ou un séjour sur mesure ? Notre équipe vous répond 24h/24 et 7j/7.',
      hqTitle: 'Bureau Principal de Doha',
      phoneTitle: 'Ligne Téléphonique 24/7',
      emailTitle: 'Service Client',
      hoursTitle: 'Horaires d’Ouverture',
      formName: 'Nom et Prénom',
      formEmail: 'Adresse E-mail',
      formPhone: 'Numéro de Téléphone / WhatsApp',
      formService: 'Prestation Souhaitée',
      formMessage: 'Précisez votre demande...',
      formSubmit: 'Envoyer ma Demande',
      formSuccess: 'Merci ! Votre demande a été transmise directement à notre équipe de Doha.',
    },

    searchPage: {
      heroTitle: 'Recherche dans le Catalogue',
      resultsFound: 'expériences et véhicules disponibles',
      noResults: 'Aucun résultat trouvé pour votre recherche. Essayez avec "Safari", "Boutre" ou "Mercedes".',
      filterAll: 'Toutes les Catégories',
    },

    footer: {
      aboutTitle: 'À Propos d’AR Trust Travel',
      aboutDesc: 'AR Trust Travel & Tourism est une agence de voyages réceptive officielle au Qatar, spécialisée dans les safaris, transferts d’affaires et séjours d’exception.',
      quickLinksTitle: 'Liens Rapides',
      servicesTitle: 'Nos Prestations',
      vipClubTitle: 'Club Privilège Qatar',
      vipClubDesc: 'Inscrivez-vous pour bénéficier d’offres privilégiées, d’accès aux salons VIP d’aéroport et d’avantages sur les safaris.',
      vipClubBtn: 'Rejoindre le Club VIP',
      subscribedSuccess: 'Bienvenue au Club Privilège ! Votre code avantage est QATARVIP10.',
      copyright: 'Tous droits réservés. AR Trust Travel & Tourism LLC.',
    },
  },

  it: {
    supportEmail: 'support@artrusttravel.com',
    phone: '+974 5555 7164',
    address: 'Bin Dirham Plaza, Al Mansoura, Doha, Qatar',
    licenseBadge: 'DMC Ufficiale Qatar Tourism #QTA-QA-8819',
    signInStaff: 'Accedi / Staff',
    myDashboard: 'Il Mio Dashboard',
    partnerConsole: 'Console Partner',
    dashboard: 'Dashboard',
    logout: 'Esci',

    navHome: 'Home',
    navTours: 'Tour e Safari',
    navFleet: 'Flotta Aeroporto',
    navPackages: 'Pacchetti Vacanza',
    navServices: 'Servizi',
    navWhyUs: 'Perché Noi',
    navReviews: 'Recensioni',
    navContact: 'Contatti',
    exploreCatalog: 'Esplora Catalogo',
    bookByCalendar: 'Prenota da Calendario',

    searchPlaceholder: 'Cerca safari nel deserto, dhow cruise, Mercedes Classe V, hotel...',
    searchBtn: 'Cerca Catalogo',
    popularLabel: 'Popolari:',
    tagDesertSafari: 'Safari Deserto',
    tagDhowCruise: 'Crociera Dhow',
    tagMercedesVClass: 'Mercedes Classe V',
    tagAirportTransit: 'Transito Aeroporto',
    tagFiveStarHotels: 'Hotel 5 Stelle',

    common: {
      bookNow: 'Prenota Ora',
      viewDetails: 'Vedi Dettagli',
      startingFrom: 'A partire da',
      perPerson: 'a persona',
      perVehicle: 'per veicolo',
      duration: 'Durata',
      groupSize: 'Gruppo',
      freeCancellation: 'Cancellazione Gratuita',
      instantConfirmation: 'Conferma Immediata',
      home: 'Home',
      all: 'Tutti',
      reserveNow: 'Prenota Subito',
      reviewsCount: 'recensioni',
      licensedDmc: 'DMC autorizzato Qatar #QTA-QA-8819',
      passengers: 'Passeggeri',
      luggage: 'Bagagli',
      days: 'Giorni',
      nights: 'Notti',
    },

    officialDmcBadge: 'DMC Ufficiale del Qatar',
    slides: [
      {
        title: 'Vivi le Meraviglie del Qatar Con',
        highlight: 'AR Trust Travel & Tourism',
        caption: 'Destination Management Company ufficiale: safari nel deserto, dune del Mare Interno, crociere in dhow e transfer aeroportuali VIP.',
        tag: 'Esplora il Qatar • Servizi di Viaggio Esclusivi',
      },
      {
        title: 'Emozionanti Safari sulle Dune In',
        highlight: 'Spedizioni 4x4 Land Cruiser',
        caption: 'Attraversa le dune dorate fino al Mare Interno UNESCO (Khor Al Adaid) con la leggendaria ospitalità beduina.',
        tag: 'Safari nel Deserto & Mare Interno',
      },
      {
        title: 'Flotta di Prestigio & Transfer Aeroporto Con',
        highlight: 'Chauffeur Privato & Assistenza',
        caption: 'Mercedes-Benz Classe V di lusso, Land Cruiser e tour in transito con rientro garantito e puntuale all’aeroporto Hamad.',
        tag: 'Aeroporto di Hamad & Flotta VIP',
      },
      {
        title: 'Autentiche Crociere in Dhow Tradizionale &',
        highlight: 'Tour Culturali a Doha',
        caption: 'Navigazioni nella baia di Doha, passeggiate al villaggio culturale di Katara e tesori nel tradizionale Souq Waqif.',
        tag: 'Crociera Dhow & Tradizione',
      },
    ],

    homeSections: {
      trustReviews: '4.9/5 da oltre 1.200 viaggiatori internazionali',
      trustLicense: 'Partner ufficiale autorizzato Qatar Tourism',
      trustPunctual: 'Ritorno garantito e puntuale in aeroporto',
      toursTitle: 'Tour e Safari Esclusivi nel Qatar',
      toursSubtitle: 'Esperienze create su misura: safari nel deserto, crociere tradizionali ed escursioni guidate nella capitale.',
      toursViewAll: 'Tutti i Tour',
      fleetTitle: 'Chauffeur Privato & Flotta Aeroporto',
      fleetSubtitle: 'Mercedes Classe V, Toyota Land Cruiser e minibus di lusso con monitoraggio dei voli in tempo reale.',
      fleetViewAll: 'Tutti i Veicoli',
      packagesTitle: 'Pacchetti Vacanza All-Inclusive',
      packagesSubtitle: 'Itinerari completi con hotel 5 stelle, visite culturali, safari nel deserto e transfer dedicati.',
      packagesViewAll: 'Tutti i Pacchetti',
      servicesTitle: 'Servizi Completi di Viaggio e DMC',
      servicesSubtitle: 'Biglietteria aerea, prenotazione resort esclusivi, visti turistici e accoglienza VIP a Hamad.',
      servicesViewAll: 'Tutti i Servizi',
      whyUsTitle: 'Perché i Viaggiatori Scelgono AR Trust',
      whyUsSubtitle: 'Licenza statale ufficiale, parco veicoli di proprietà e assistenza personalizzata 24 ore su 24 a Doha.',
      reviewsTitle: 'Cosa Dicono i Nostri Ospiti',
      reviewsSubtitle: 'Recensioni certificate di viaggiatori dall’Italia, dall’Europa e da tutto il mondo.',
    },

    toursPage: {
      heroTitle: 'Safari nel Deserto ed Escursioni nel Qatar',
      heroSubtitle: 'Affronta le emozionanti dune in 4x4 fino al Mare Interno e naviga sulle acque tranquille della baia di Doha.',
      searchPlaceholder: 'Cerca tour per nome o parole chiave...',
      allTours: 'Tutti i Tour',
      catDesert: 'Safari Deserto',
      catCity: 'Giro Città',
      catTransit: 'Transito Aeroporto',
      catSea: 'Gita in Barca',
      catPrivate: 'Lusso Privato',
    },

    fleetPage: {
      heroTitle: 'La Nostra Flotta di Lusso con Autista',
      heroSubtitle: 'Dalle Mercedes Classe V ai Toyota Land Cruiser e minibus per gruppi. Servizio impeccabile all’aeroporto di Doha.',
      allFleet: 'Tutti i Veicoli',
      flightDelayTracking: 'Monitoraggio Voli in Tempo Reale',
      flightDelayTrackingDesc: 'Orario di prelievo aggiornato automaticamente in caso di anticipo o ritardo',
      curbsideGreeting: 'Accoglienza all’Arrivo',
      curbsideGreetingDesc: 'Chauffeur in divisa con cartello personalizzato all’uscita passeggeri',
      complimentaryWater: 'Acqua Fresca & Wi-Fi',
      complimentaryWaterDesc: 'Bevande di benvenuto e connessione Wi-Fi veloce a bordo',
      climateControl: 'Climatizzazione Avanzata',
      climateControlDesc: 'Aria condizionata ad alte prestazioni per il massimo relax',
      bookTransfer: 'Prenota Transfer',
    },

    packagesPage: {
      heroTitle: 'Pacchetti Vacanza per il Qatar',
      heroSubtitle: 'Soggiorni completi con hotel di prima classe, escursioni guidate e accoglienza VIP a Hamad.',
      allInclusiveBadge: 'Pacchetto All-Inclusive',
      reservePackage: 'Prenota Pacchetto',
      inclusionsTitle: 'Cosa Include il Pacchetto',
    },

    servicesPage: {
      heroTitle: 'Servizi Turistici & DMC nel Qatar',
      heroSubtitle: 'Soluzioni complete per viaggi individuali e aziendali: hotel 5 stelle, voli, visti e assistenza aeroportuale.',
      getQuote: 'Richiedi Preventivo Su Misura',
      officialDmcGuarantee: 'Servizio garantito da AR Trust Travel, DMC con licenza Qatar Tourism #QTA-QA-8819',
    },

    whyUsPage: {
      heroTitle: 'Perché Scegliere AR Trust Travel',
      heroSubtitle: 'L’agenzia réceptive di riferimento nel Qatar: serietà, flotta propria e professionalità comprovata.',
      bookWithConfidence: 'Prenota con Fiducia',
      contactDesk: 'Contatta il Team 24/7',
    },

    reviewsPage: {
      heroTitle: 'Recensioni e Opinioni dei Viaggiatori',
      heroSubtitle: 'Scopri i pareri autentici dei clienti che hanno viaggiato nel Qatar con noi.',
      ratingScore: 'Valutazione 4.9 / 5.0',
      ratingSubtitle: 'Oltre 1.200 recensioni verificate di ospiti da tutta Europa',
      filterAll: 'Tutte le Esperienze',
      submitReviewBtn: 'Scrivi una Recensione',
    },

    contactPage: {
      heroTitle: 'Contatta il Nostro Concierge a Doha',
      heroSubtitle: 'Hai bisogno di informazioni su un safari, un transfer o un pacchetto vacanza? Siamo disponibili 24 ore su 24.',
      hqTitle: 'Sede Operativa di Doha',
      phoneTitle: 'Hotline 24/7',
      emailTitle: 'Assistenza Clienti',
      hoursTitle: 'Orari di Apertura',
      formName: 'Nome e Cognome',
      formEmail: 'Indirizzo E-mail',
      formPhone: 'Numero di Telefono / WhatsApp',
      formService: 'Servizio di Interesse',
      formMessage: 'Come possiamo aiutarti?',
      formSubmit: 'Invia Richiesta',
      formSuccess: 'Grazie! La tua richiesta è stata inoltrata direttamente al nostro team a Doha.',
    },

    searchPage: {
      heroTitle: 'Cerca nel Catalogo Esperienze',
      resultsFound: 'esperienze e veicoli trovati',
      noResults: 'Nessun risultato trovato. Prova con termini come "Safari", "Dhow" o "Mercedes".',
      filterAll: 'Tutte le Categorie',
    },

    footer: {
      aboutTitle: 'Chi Siamo',
      aboutDesc: 'AR Trust Travel & Tourism è un DMC autorizzato nel Qatar specializzato in safari nel deserto, transfer VIP e vacanze personalizzate.',
      quickLinksTitle: 'Link Rapidi',
      servicesTitle: 'I Nostri Servizi',
      vipClubTitle: 'Qatar Travel Club Ufficiale',
      vipClubDesc: 'Iscriviti per ricevere sconti VIP esclusivi, pass per le lounge aeroportuali e offerte speciali sui safari.',
      vipClubBtn: 'Unisciti al Club VIP',
      subscribedSuccess: 'Benvenuto nel VIP Travel Club! Il tuo codice sconto è QATARVIP10.',
      copyright: 'Tutti i diritti riservati. AR Trust Travel & Tourism LLC.',
    },
  },

  es: {
    supportEmail: 'support@artrusttravel.com',
    phone: '+974 5555 7164',
    address: 'Bin Dirham Plaza, Al Mansoura, Doha, Qatar',
    licenseBadge: 'DMC Oficial Turismo Qatar #QTA-QA-8819',
    signInStaff: 'Iniciar Sesión / Personal',
    myDashboard: 'Mi Panel',
    partnerConsole: 'Consola de Socios',
    dashboard: 'Panel',
    logout: 'Cerrar Sesión',

    navHome: 'Inicio',
    navTours: 'Tours y Safaris',
    navFleet: 'Flota Aeropuerto',
    navPackages: 'Paquetes Vacacionales',
    navServices: 'Servicios',
    navWhyUs: 'Por Qué Nosotros',
    navReviews: 'Opiniones',
    navContact: 'Contacto',
    exploreCatalog: 'Explorar Catálogo',
    bookByCalendar: 'Reservar por Calendario',

    searchPlaceholder: 'Buscar safari por el desierto, dhow, Mercedes Clase V, hoteles...',
    searchBtn: 'Buscar en Catálogo',
    popularLabel: 'Popular:',
    tagDesertSafari: 'Safari Desierto',
    tagDhowCruise: 'Crucero en Dhow',
    tagMercedesVClass: 'Mercedes Clase V',
    tagAirportTransit: 'Tránsito Aeropuerto',
    tagFiveStarHotels: 'Hoteles 5 Estrellas',

    common: {
      bookNow: 'Reservar Ahora',
      viewDetails: 'Ver Detalles',
      startingFrom: 'Desde',
      perPerson: 'por persona',
      perVehicle: 'por vehículo',
      duration: 'Duración',
      groupSize: 'Grupo',
      freeCancellation: 'Cancelación Gratuita',
      instantConfirmation: 'Confirmación Inmediata',
      home: 'Inicio',
      all: 'Todos',
      reserveNow: 'Reservar',
      reviewsCount: 'opiniones',
      licensedDmc: 'DMC oficial de Qatar #QTA-QA-8819',
      passengers: 'Pasajeros',
      luggage: 'Equipaje',
      days: 'Días',
      nights: 'Noches',
    },

    officialDmcBadge: 'DMC Oficial de Qatar',
    slides: [
      {
        title: 'Descubra las Maravillas de Qatar Con',
        highlight: 'AR Trust Travel & Tourism',
        caption: 'Compañía de Gestión de Destinos oficial: safaris por el desierto, dunas del Mar Interior, cruceros en dhow tradicional y traslados VIP.',
        tag: 'Explore Qatar • Servicios Integrales de Viaje',
      },
      {
        title: 'Emocionantes Safaris en las Dunas En',
        highlight: 'Expediciones 4x4 Land Cruiser',
        caption: 'Recorra las espectaculares dunas de arena hasta el Mar Interior de la UNESCO (Khor Al Adaid) con hospitalidad beduina auténtica.',
        tag: 'Safaris en el Desierto & Mar Interior',
      },
      {
        title: 'Flota Exclusiva & Traslados al Aeropuerto Con',
        highlight: 'Chófer VIP & Asistencia',
        caption: 'Mercedes-Benz Clase V de lujo, Land Cruisers y visitas guiadas de escala en el aeropuerto internacional de Hamad con puntualidad garantizada.',
        tag: 'Aeropuerto de Hamad & Flota VIP',
      },
      {
        title: 'Cruceros en Dhow Tradicional &',
        highlight: 'Excursiones Culturales en Doha',
        caption: 'Navegue por la bahía de Doha, recorra el pueblo cultural de Katara y descubra las maravillas del zoco Souq Waqif.',
        tag: 'Paseo en Dhow & Tradición',
      },
    ],

    homeSections: {
      trustReviews: '4.9/5 por más de 1.200 viajeros internacionales',
      trustLicense: 'Socio oficial acreditado de Turismo de Qatar',
      trustPunctual: 'Regreso puntual y garantizado al aeropuerto',
      toursTitle: 'Tours Exclusivos y Safaris en Qatar',
      toursSubtitle: 'Aventuras inolvidables: safaris por las dunas, cruceros tradicionales y visitas panorámicas por Doha.',
      toursViewAll: 'Ver Todos los Tours',
      fleetTitle: 'Chófer Privado & Flota Aeropuerto',
      fleetSubtitle: 'Mercedes Clase V, Toyota Land Cruiser y autocares de lujo con seguimiento de vuelos en tiempo real.',
      fleetViewAll: 'Ver Todos los Vehículos',
      packagesTitle: 'Paquetes Vacacionales Todo Incluido',
      packagesSubtitle: 'Viajes organizados de varios días con hoteles 5 estrellas, excursiones culturales y safaris por el desierto.',
      packagesViewAll: 'Todos los Paquetes',
      servicesTitle: 'Servicios Receptivos Integrales',
      servicesSubtitle: 'Billetes de avión, reservas en hoteles 5 estrellas, tramitación de visados y asistencia VIP en Hamad.',
      servicesViewAll: 'Descubrir Servicios',
      whyUsTitle: 'Por Qué los Viajeros nos Eligen',
      whyUsSubtitle: 'Licencia estatal oficial, flota propia de vehículos recientes y atención personalizada 24/7 en Doha.',
      reviewsTitle: 'Lo que Opinan Nuestros Clientes',
      reviewsSubtitle: 'Comentarios contrastados de visitantes de España, Europa y el resto del mundo.',
    },

    toursPage: {
      heroTitle: 'Safaris por el Desierto y Excursiones en Qatar',
      heroSubtitle: 'Recorra las dunas doradas en 4x4 hasta el Mar Interior y disfrute de la calma de la bahía de Doha.',
      searchPlaceholder: 'Buscar tours por nombre o palabras clave...',
      allTours: 'Todos los Tours',
      catDesert: 'Safari Desierto',
      catCity: 'Tour por la Ciudad',
      catTransit: 'Tránsito Aeropuerto',
      catSea: 'Paseo en Barco',
      catPrivate: 'Lujo Privado',
    },

    fleetPage: {
      heroTitle: 'Nuestra Flota de Chófer y Traslados VIP',
      heroSubtitle: 'Desde Mercedes-Benz Clase V y Toyota Land Cruiser hasta monovolúmenes familiares y autobuses para grupos.',
      allFleet: 'Toda la Flota',
      flightDelayTracking: 'Seguimiento de Vuelos en Directo',
      flightDelayTrackingDesc: 'Ajuste automático de la recogida en caso de adelanto o retraso de su vuelo',
      curbsideGreeting: 'Bienvenida Personalizada',
      curbsideGreetingDesc: 'Chófer con cartel identificativo a su salida de la terminal',
      complimentaryWater: 'Agua Fresca & Wi-Fi',
      complimentaryWaterDesc: 'Bebidas de cortesía y conexión a Internet de alta velocidad a bordo',
      climateControl: 'Climatización Avanzada',
      climateControlDesc: 'Aire acondicionado de alta potencia para máxima comodidad',
      bookTransfer: 'Reservar Traslado',
    },

    packagesPage: {
      heroTitle: 'Paquetes Vacacionales Todo Incluido en Qatar',
      heroSubtitle: 'Experiencias de varios días con hoteles 5 estrellas, visitas guiadas, safari en el desierto y traslados VIP.',
      allInclusiveBadge: 'Paquete Todo Incluido',
      reservePackage: 'Reservar Paquete',
      inclusionsTitle: 'Servicios Incluidos en el Paquete',
    },

    servicesPage: {
      heroTitle: 'Servicios de Viaje y DMC en Qatar',
      heroSubtitle: 'Gestión integral de viajes particulares y de empresa: hoteles 5 estrellas, vuelos, visados y conserjería.',
      getQuote: 'Solicitar Presupuesto a Medida',
      officialDmcGuarantee: 'Servicio garantizado por AR Trust Travel, DMC con licencia de Turismo de Qatar #QTA-QA-8819',
    },

    whyUsPage: {
      heroTitle: 'Por Qué Elegir AR Trust Travel',
      heroSubtitle: 'La agencia receptiva de confianza en Qatar: seguridad, vehículos propios y servicio de la más alta calidad.',
      bookWithConfidence: 'Reserve con Confianza',
      contactDesk: 'Contactar al Equipo 24/7',
    },

    reviewsPage: {
      heroTitle: 'Opiniones y Testimonios de Clientes',
      heroSubtitle: 'Lea experiencias de viajeros de todo el mundo que conocieron Qatar con nuestro equipo.',
      ratingScore: 'Puntuación 4.9 / 5.0',
      ratingSubtitle: 'Más de 1.200 valoraciones reales de visitantes europeos e internacionales',
      filterAll: 'Todas las Experiencias',
      submitReviewBtn: 'Escribir una Opinión',
    },

    contactPage: {
      heroTitle: 'Contacte con Nuestro Equipo en Doha',
      heroSubtitle: '¿Tiene dudas sobre un safari, un traslado privado o un viaje en grupo? Estamos a su disposición las 24 horas.',
      hqTitle: 'Sede Central en Doha',
      phoneTitle: 'Línea Directa 24/7',
      emailTitle: 'Atención al Cliente',
      hoursTitle: 'Horarios de Atención',
      formName: 'Nombre y Apellidos',
      formEmail: 'Correo Electrónico',
      formPhone: 'Teléfono / WhatsApp',
      formService: 'Servicio Deseado',
      formMessage: '¿En qué podemos ayudarle?',
      formSubmit: 'Enviar Mensaje',
      formSuccess: '¡Gracias! Su consulta ha sido enviada a nuestro equipo de atención en Doha.',
    },

    searchPage: {
      heroTitle: 'Búsqueda en el Catálogo',
      resultsFound: 'experiencias y vehículos disponibles',
      noResults: 'No se encontraron resultados para su búsqueda. Pruebe con "Safari", "Dhow" o "Mercedes".',
      filterAll: 'Todas las Categorías',
    },

    footer: {
      aboutTitle: 'Sobre AR Trust Travel',
      aboutDesc: 'AR Trust Travel & Tourism es un DMC oficial en Qatar especializado en safaris por el desierto, traslados VIP y paquetes vacacionales a medida.',
      quickLinksTitle: 'Enlaces Rápidos',
      servicesTitle: 'Nuestros Servicios',
      vipClubTitle: 'Club Exclusivo Qatar Travel',
      vipClubDesc: 'Suscríbase para acceder a descuentos VIP, pases a salas de espera en aeropuertos y promociones en safaris.',
      vipClubBtn: 'Unirse al Club VIP',
      subscribedSuccess: '¡Bienvenido al Club VIP! Su código promocional es QATARVIP10.',
      copyright: 'Todos los derechos reservados. AR Trust Travel & Tourism LLC.',
    },
  },

  ru: {
    supportEmail: 'support@artrusttravel.com',
    phone: '+974 5555 7164',
    address: 'Bin Dirham Plaza, Al Mansoura, Doha, Qatar',
    licenseBadge: 'Лицензия туроператора Катара #QTA-QA-8819',
    signInStaff: 'Вход / Персонал',
    myDashboard: 'Личный кабинет',
    partnerConsole: 'Кабинет партнера',
    dashboard: 'Панель управления',
    logout: 'Выйти',

    navHome: 'Главная',
    navTours: 'Туры и сафари',
    navFleet: 'Трансферы и автопарк',
    navPackages: 'Турпакеты',
    navServices: 'Услуги',
    navWhyUs: 'О нас',
    navReviews: 'Отзывы',
    navContact: 'Контакты',
    exploreCatalog: 'Каталог туров',
    bookByCalendar: 'Бронирование по датам',

    searchPlaceholder: 'Поиск: сафари в пустыне, круиз на доу, Mercedes V-Класс, отели...',
    searchBtn: 'Найти в каталоге',
    popularLabel: 'Популярное:',
    tagDesertSafari: 'Сафари в пустыне',
    tagDhowCruise: 'Круиз на доу',
    tagMercedesVClass: 'Mercedes V-Класс',
    tagAirportTransit: 'Транзит из аэропорта',
    tagFiveStarHotels: '5-звездочные отели',

    common: {
      bookNow: 'Забронировать',
      viewDetails: 'Подробнее',
      startingFrom: 'От',
      perPerson: 'за человека',
      perVehicle: 'за автомобиль',
      duration: 'Длительность',
      groupSize: 'Группа',
      freeCancellation: 'Бесплатная отмена',
      instantConfirmation: 'Мгновенное подтверждение',
      home: 'Главная',
      all: 'Все',
      reserveNow: 'Зарезервировать',
      reviewsCount: 'отзывов',
      licensedDmc: 'Официальный DMC Катара #QTA-QA-8819',
      passengers: 'Пассажиров',
      luggage: 'Багаж',
      days: 'Дней',
      nights: 'Ночей',
    },

    officialDmcBadge: 'Официальный туроператор Катара',
    slides: [
      {
        title: 'Откройте для себя чудеса Катара с',
        highlight: 'AR Trust Travel & Tourism',
        caption: 'Официальный туроператор: захватывающее сафари по дюнам, круизы на традиционных лодках доу, VIP-трансферы и отдых в премиум-отелях.',
        tag: 'Катар • Полный спектр туристических услуг',
      },
      {
        title: 'Увлекательные сафари к Внутреннему морю на',
        highlight: 'Внедорожниках Toyota Land Cruiser',
        caption: 'Экстремальная поездка по дюнам к побережью Внутреннего моря ЮНЕСКО (Хор-аль-Адаид) с арабским гостеприимством.',
        tag: 'Сафари в пустыне и Внутреннее море',
      },
      {
        title: 'Премиальный автопарк и трансферы с',
        highlight: 'Персональным VIP-водителем',
        caption: 'Mercedes-Benz V-Class, Land Cruiser и экскурсии во время пересадки в аэропорту Хамад с гарантией своевременного возвращения.',
        tag: 'Аэропорт Хамад и люкс-автопарк',
      },
      {
        title: 'Традиционные круизы на деревянных доу и',
        highlight: 'Исторические экскурсии по Дохе',
        caption: 'Прогулки по заливу Дохи на традиционной лодке, посещение этнографической деревни Катара и колоритного рынка Сук-Вакиф.',
        tag: 'Круиз на доу и культурное наследие',
      },
    ],

    homeSections: {
      trustReviews: '4.9/5 по оценкам более 1 200 гостей со всего мира',
      trustLicense: 'Лицензированный партнер туризма Катара',
      trustPunctual: 'Гарантированное прибытие в аэропорт вовремя',
      toursTitle: 'Лучшие экскурсии и сафари в Катаре',
      toursSubtitle: 'Уникальные программы: сафари по барханам, морские прогулки и обзорные экскурсии по Дохе.',
      toursViewAll: 'Все экскурсии',
      fleetTitle: 'VIP-автопарк и трансферы',
      fleetSubtitle: 'Mercedes V-Class, Toyota Land Cruiser и комфортабельные автобусы с отслеживанием рейсов 24/7.',
      fleetViewAll: 'Все автомобили',
      packagesTitle: 'Готовые турпакеты для отдыха',
      packagesSubtitle: 'Многодневные программы «все включено» с проживанием в отелях 5*, экскурсиями и трансферами.',
      packagesViewAll: 'Все турпакеты',
      servicesTitle: 'Полный комплекс услуг туроператора',
      servicesSubtitle: 'Авиабилеты по всему миру, бронирование отелей 5*, визовая поддержка и VIP-сервис в аэропорту.',
      servicesViewAll: 'Все услуги',
      whyUsTitle: 'Почему путешественники выбирают нас',
      whyUsSubtitle: 'Государственная лицензия, собственный автопарк и круглосуточная русскоязычная поддержка в Дохе.',
      reviewsTitle: 'Отзывы наших гостей',
      reviewsSubtitle: 'Подтвержденные отзывы туристов из Европы, стран СНГ и со всего мира.',
    },

    toursPage: {
      heroTitle: 'Сафари в пустыне и экскурсии по Катару',
      heroSubtitle: 'Поездки по барханам на 4x4 к Внутреннему морю, прогулки на деревянных доу и культурные достопримечательности.',
      searchPlaceholder: 'Поиск туров по названию или описанию...',
      allTours: 'Все туры',
      catDesert: 'Сафари в пустыне',
      catCity: 'Обзорная по городу',
      catTransit: 'Транзит из аэропорта',
      catSea: 'Морская прогулка',
      catPrivate: 'Индивидуальный VIP',
    },

    fleetPage: {
      heroTitle: 'Наш премиальный автопарк с водителем',
      heroSubtitle: 'Mercedes-Benz V-Class, Toyota Land Cruiser и туристические автобусы для встречи в аэропорту Дохи.',
      allFleet: 'Весь автопарк',
      flightDelayTracking: 'Отслеживание задержек рейсов',
      flightDelayTrackingDesc: 'Время встречи автоматически переносится при изменении расписания рейса',
      curbsideGreeting: 'Встреча с табличкой',
      curbsideGreetingDesc: 'Водитель встречает вас в зоне прилета с персональной табличкой',
      complimentaryWater: 'Прохладная вода и Wi-Fi',
      complimentaryWaterDesc: 'Бесплатные напитки и скоростной интернет во всех автомобилях',
      climateControl: 'Мощный климат-контроль',
      climateControlDesc: 'Современная система кондиционирования для комфорта в любую жару',
      bookTransfer: 'Заказать трансфер',
    },

    packagesPage: {
      heroTitle: 'Турпакеты и готовые программы отдыха',
      heroSubtitle: 'Многодневные пакеты с пятизвездочными отелями, экскурсиями, поездкой в пустыню и трансфером.',
      allInclusiveBadge: 'Пакет «Все включено»',
      reservePackage: 'Забронировать тур',
      inclusionsTitle: 'Что включено в программу',
    },

    servicesPage: {
      heroTitle: 'Услуги принимающего туроператора в Катаре',
      heroSubtitle: 'Организация индивидуальных и корпоративных поездок: отели 5*, авиабилеты, визы и VIP-сервис.',
      getQuote: 'Запросить расчет поездки',
      officialDmcGuarantee: 'Гарантия надежности от лицензированного туроператора Катара #QTA-QA-8819',
    },

    whyUsPage: {
      heroTitle: 'Почему выбирают AR Trust Travel',
      heroSubtitle: 'Ведущий лицензированный DMC-туроператор в Катаре: надежность, собственный автопарк и высочайший сервис.',
      bookWithConfidence: 'Бронируйте с уверенностью',
      contactDesk: 'Связаться с нами 24/7',
    },

    reviewsPage: {
      heroTitle: 'Отзывы путешественников со всего мира',
      heroSubtitle: 'Реальные впечатления гостей, открывших для себя Катар вместе с AR Trust Travel.',
      ratingScore: 'Рейтинг 4.9 из 5.0',
      ratingSubtitle: 'Более 1 200 реальных отзывов от путешественников из Европы и стран СНГ',
      filterAll: 'Все программы',
      submitReviewBtn: 'Оставить отзыв',
    },

    contactPage: {
      heroTitle: 'Свяжитесь с нашим офисом в Дохе',
      heroSubtitle: 'Есть вопросы по сафари, трансферам или групповым турам? Наша служба поддержки в Дохе на связи 24 часа в сутки.',
      hqTitle: 'Главный офис в Дохе',
      phoneTitle: 'Круглосуточная горячая линия',
      emailTitle: 'Служба заботы о клиентах',
      hoursTitle: 'График работы',
      formName: 'Ваше имя и фамилия',
      formEmail: 'Электронная почта',
      formPhone: 'Телефон / WhatsApp',
      formService: 'Интересующая услуга',
      formMessage: 'Чем мы можем вам помочь?',
      formSubmit: 'Отправить заявку',
      formSuccess: 'Спасибо! Ваша заявка передана сотрудникам нашего офиса в Дохе.',
    },

    searchPage: {
      heroTitle: 'Поиск по каталогу туров и автопарка',
      resultsFound: 'найдено доступных экскурсий и авто',
      noResults: 'По вашему запросу ничего не найдено. Попробуйте поискать «Сафари», «Доу» или «Mercedes».',
      filterAll: 'Все категории',
    },

    footer: {
      aboutTitle: 'О компании AR Trust Travel',
      aboutDesc: 'AR Trust Travel & Tourism — официальный лицензированный туроператор в Катаре (DMC). Мы организуем сафари в пустыне, VIP-трансферы и индивидуальные туры.',
      quickLinksTitle: 'Быстрые ссылки',
      servicesTitle: 'Наши услуги',
      vipClubTitle: 'Официальный Travel Club',
      vipClubDesc: 'Подпишитесь, чтобы получать эксклюзивные скидки, пропуска в бизнес-залы аэропорта и спецпредложения на сафари.',
      vipClubBtn: 'Вступить в клуб',
      subscribedSuccess: 'Добро пожаловать в клуб привилегий! Ваш промокод: QATARVIP10.',
      copyright: 'Все права защищены. AR Trust Travel & Tourism LLC.',
    },
  },
};
