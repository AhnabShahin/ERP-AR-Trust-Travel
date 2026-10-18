export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  badge: string;
  iconName: 'Plane' | 'Building2' | 'FileCheck2' | 'ShieldCheck' | 'Award' | 'Compass';
  shortDescription: string;
  heroImage: string;
  startingPriceQAR: number;
  rateType: string;
  overview: string;
  overviewAr?: string;
  highlights: string[];
  inclusions: string[];
  whyChooseUs: Array<{ title: string; desc: string }>;
  processSteps: Array<{ step: string; title: string; desc: string }>;
  faqs: Array<{ q: string; a: string }>;
  inquiryConfig: {
    serviceTypeLabel: string;
    options: string[];
    defaultOption: string;
    dateLabel: string;
    paxLabel: string;
    notesPrompt: string;
  };
}

export const SERVICES_CATALOG: ServiceItem[] = [
  {
    id: 'airline-ticketing',
    slug: 'airline-ticketing',
    title: 'Airline Reservation & Global Ticketing',
    titleAr: 'حجز وإصدار تذاكر الطيران العالمية',
    badge: 'IATA & Global Network',
    iconName: 'Plane',
    shortDescription:
      'Instant flight bookings across 150+ international airlines including Qatar Airways, Emirates, flydubai, Saudia, and British Airways with competitive corporate & holiday fares.',
    heroImage:
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80',
    startingPriceQAR: 150,
    rateType: 'service fee from',
    overview:
      'AR Trust Travel & Tourism W.L.L. provides comprehensive global flight ticketing and reservation services as an accredited travel partner in Doha. We specialize in point-to-point journeys, complex multi-city round-the-world itineraries, and urgent corporate reroutings. With direct GDS access (Amadeus & Sabre) and contracted allocations with leading carriers such as Qatar Airways, Emirates, flydubai, Saudia, Turkish Airlines, and British Airways, our dedicated air ticketing desk guarantees optimal flight connections, generous baggage policies, and transparent pricing without hidden surcharges.',
    highlights: [
      'Accredited IATA Global Ticketing Desk headquartered in Doha, Qatar',
      'Contracted corporate and leisure discount allocations on Qatar Airways flights',
      '24/7 Emergency ticketing assistance for instant re-issuances, date shifts & rerouting',
      'Excess baggage allowances pre-booked at up to 40% discount vs airport counter rates',
      'Seat assignments, specialized meal requests (Halal, Diabetic, Vegan), and bassinet locks',
    ],
    inclusions: [
      'Official e-Ticket confirmation receipt with global airline PNR',
      'Direct baggage allowance verification and check-in assistance guidance',
      'Complimentary SMS and WhatsApp flight status and schedule change alerts',
      'Dedicated personal ticketing officer reachable 24/7 on WhatsApp',
    ],
    whyChooseUs: [
      {
        title: 'Best Fare Guarantee',
        desc: 'We cross-reference multiple reservation systems and corporate consolidator pools to find the most cost-effective routing for your schedule.',
      },
      {
        title: 'Instant 24/7 Emergency Support',
        desc: 'Flight delayed or missed connection? Our local operations center in Doha rebooks your flight in minutes without you waiting on hold with call centers.',
      },
      {
        title: 'Zero Hidden Fees',
        desc: 'All quotations clearly specify airport taxes, fuel surcharges, and change penalty policies prior to final confirmation.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Submit Route & Dates',
        desc: 'Enter your departure airport, destination, desired travel dates, and passenger details through our inquiry form.',
      },
      {
        step: '02',
        title: 'Compare Tailored Options',
        desc: 'Within 15 minutes, our ticketing specialist sends you 2-3 optimal flight itineraries with exact timings and fare classes.',
      },
      {
        step: '03',
        title: 'Secure Confirmation',
        desc: 'Select your preferred flight and confirm payment. Your official e-Ticket and PNR are instantly dispatched to your email and WhatsApp.',
      },
      {
        step: '04',
        title: 'Pre-Flight Flight Concierge',
        desc: 'Receive proactive web check-in links, terminal departure alerts, and 24/7 support throughout your travel journey.',
      },
    ],
    faqs: [
      {
        q: 'Can you issue same-day emergency flight tickets in Doha?',
        a: 'Yes. Our operations desk is manned 24 hours a day. We can issue same-day and last-minute tickets for departures within 2 hours of departure from Hamad International Airport (DOH).',
      },
      {
        q: 'Can you help change the date of an existing ticket?',
        a: 'Yes. Whether your ticket was originally booked through us or directly with an airline, our agents can assist in calculating fare differences, penalty fees, and reissuing your ticket seamlessly.',
      },
      {
        q: 'Do you offer group booking discounts for 10 or more passengers?',
        a: 'Absolutely. We hold direct group contract agreements with airlines that allow holding seats with small deposits and submitting passenger name lists closer to departure.',
      },
    ],
    inquiryConfig: {
      serviceTypeLabel: 'Preferred Cabin Class / Request Type',
      options: [
        'Economy Class (Best Value)',
        'Premium Economy',
        'Business Class (Lie-Flat Comfort)',
        'First Class Suite',
        'Group Booking (10+ Passengers)',
        'Urgent Date Change / Rerouting',
      ],
      defaultOption: 'Economy Class (Best Value)',
      dateLabel: 'Departure / Travel Date',
      paxLabel: 'Number of Passengers',
      notesPrompt: 'e.g. Origin & Destination cities (e.g. DOH to LHR), airline preference, baggage needs...',
    },
  },
  {
    id: 'luxury-hotels',
    slug: 'luxury-hotels',
    title: 'Luxury Hotel & Beach Resort Booking',
    titleAr: 'حجز الفنادق والمنتجعات الفاخرة',
    badge: '5-Star Concierge',
    iconName: 'Building2',
    shortDescription:
      'Exclusive partnership contracted rates across Doha’s top 5-star hotels and waterfront beach resorts: Ritz-Carlton, St. Regis, Mandarin Oriental, and Katara Hills Villas.',
    heroImage:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
    startingPriceQAR: 350,
    rateType: 'per night from',
    overview:
      'Experience the pinnacle of Arabian hospitality with AR Trust Travel’s exclusive hotel reservation desk. As a premier Destination Management Company licensed by Qatar Tourism, we maintain contracted direct partnership rates with Qatar’s most prestigious luxury properties. From private pool villas at Katara Hills and wellness sanctuaries at Zulal, to waterfront opulence at The Ritz-Carlton Sharq Village and St. Regis Doha, we provide our guests with exclusive VIP privileges including complimentary room upgrades, early check-in, late checkout, and resort food & beverage credits.',
    highlights: [
      'Direct contracts with over 45 luxury 4-star, 5-star, and ultra-luxury boutique hotels in Qatar',
      'Guaranteed best local rates surpassing standard public online booking engines',
      'Complimentary room upgrades to higher room or sea-view categories (subject to availability)',
      'Early 10:00 AM check-in and guaranteed late 4:00 PM checkout privileges for stopover guests',
      'Exclusive resort dining credits and daily gourmet breakfast inclusions',
    ],
    inclusions: [
      'Official Qatar Tourism approved Hotel Confirmation Voucher',
      'All applicable hotel service charges, municipality fees, and local taxes included',
      'Direct liaison with hotel management for VIP welcome amenities and special occasions',
      'Seamless link to private airport chauffeur transfer at Hamad International Airport',
    ],
    whyChooseUs: [
      {
        title: 'VIP Concierge Recognition',
        desc: 'Our guests are flagged as VIP agency arrivals, ensuring personalized greeting by hotel duty managers and prioritized room allocations.',
      },
      {
        title: 'Flexible Cancellation Policies',
        desc: 'Enjoy generous cancellation and amendment windows that adapt to your evolving travel schedules.',
      },
      {
        title: 'Layover & Day-Use Rates',
        desc: 'Transiting through Doha for 6 to 12 hours? We offer specialized transit hotel room packages near Hamad Airport without paying full overnight rates.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Share Preferences',
        desc: 'Select your preferred area (West Bay skyline, The Pearl beachfront, Souq Waqif heritage, or Airport vicinity) and stay dates.',
      },
      {
        step: '02',
        title: 'Receive Curated Proposals',
        desc: 'Our hotel specialist presents top negotiated room options with exclusive VIP amenities and photos.',
      },
      {
        step: '03',
        title: 'Instant Confirmation',
        desc: 'Confirm your choice to receive an official booking voucher with direct hotel reservation number.',
      },
      {
        step: '04',
        title: 'VIP Welcome & Check-In',
        desc: 'Arrive at your hotel with your room pre-inspected and all VIP privileges pre-authorized at the front desk.',
      },
    ],
    faqs: [
      {
        q: 'Are your hotel rates cheaper than booking directly on hotel websites?',
        a: 'Yes. As a licensed local DMC, we have wholesale contracted allocations that are typically 15% to 30% below standard public web rates, plus we include VIP amenities like free breakfast and room upgrades.',
      },
      {
        q: 'Do you offer transit hotels for a short 6-8 hour layover in Doha?',
        a: 'Yes. We offer specialized transit day-use rooms both inside Hamad International Airport (Oryx Airport Hotel) and at luxury waterfront hotels located just 10-15 minutes from the terminal.',
      },
      {
        q: 'Can you arrange connected family suites or adjoining rooms?',
        a: 'Yes. We personally coordinate with hotel reservation managers to guarantee interconnected family rooms prior to your arrival.',
      },
    ],
    inquiryConfig: {
      serviceTypeLabel: 'Preferred Hotel Style / Property Type',
      options: [
        '5-Star Luxury Skyline Hotel (West Bay / City Center)',
        'Waterfront Beach Resort (The Pearl / Katara / Lusail)',
        'Private Pool Luxury Villa (Katara Hills / Banana Island)',
        'Boutique Heritage Hotel (Souq Waqif Heritage Suites)',
        'Airport Vicinity / Transit Layover Hotel (5-10 mins from DOH)',
        'Extended Stay Executive Serviced Apartment',
      ],
      defaultOption: '5-Star Luxury Skyline Hotel (West Bay / City Center)',
      dateLabel: 'Check-in & Check-out Dates',
      paxLabel: 'Number of Guests (Adults & Children)',
      notesPrompt: 'e.g. Preferred hotel brand (Ritz, St. Regis, etc.), room type, view, breakfast preference...',
    },
  },
  {
    id: 'visa-assistance',
    slug: 'visa-assistance',
    title: 'Qatar Tourist & Transit Visa Assistance',
    titleAr: 'خدمات التأشيرات والدخول لقطر',
    badge: 'Fast-Track Processing',
    iconName: 'FileCheck2',
    shortDescription:
      'Fast-track visa processing for Qatar tourist visit visas, GCC resident transit permits, commercial business visit visas, and official Hayya card advisory.',
    heroImage:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80',
    startingPriceQAR: 200,
    rateType: 'application fee from',
    overview:
      'Navigating international entry requirements to Qatar is effortless with AR Trust Travel’s dedicated Visa Services Division. Operating under full compliance with the Ministry of Interior (MOI) and Qatar Tourism regulations, our certified visa consultants handle every aspect of your application. Whether you need a 30-day tourist visit visa, a GCC resident transit permit for a quick layover, an urgent business entry permit, or support with the official Hayya platform, we provide complete document pre-screening to achieve our industry-leading 99.2% approval track record.',
    highlights: [
      'Official accreditation and direct processing with the State of Qatar immigration systems',
      'Over 99.2% verified visa approval success rate for worldwide nationalities',
      'Express processing available with approval delivered in 24 to 48 working hours',
      'Rigorous document pre-audit preventing rejections or costly delays',
      'Full guidance on hotel discovery voucher and health insurance mandatory requirements',
    ],
    inclusions: [
      'Pre-submission document verification and biometric image compliance check',
      'Government application fees processing and administrative portal management',
      'Official downloadable electronic entry permit (e-Visa) with MOI QR validation',
      'Entry immigration arrival instructions and customs advisory guide',
    ],
    whyChooseUs: [
      {
        title: 'Zero-Rejection Document Audit',
        desc: 'Our immigration specialists pre-screen your passport validity, photo background, and supporting documents before portal submission.',
      },
      {
        title: 'Express 24-Hour Turnaround',
        desc: 'Traveling on short notice? Our express priority track fast-tracks urgent tourist and transit permits.',
      },
      {
        title: 'Global Nationalities Covered',
        desc: 'We assist travelers from over 120 nationalities worldwide, including non-visa-free passport holders requiring official local sponsor invitations.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Submit Basic Details',
        desc: 'Provide your passport copy, passport-style photograph, and proposed arrival date through our secure form.',
      },
      {
        step: '02',
        title: 'Document Audit & Review',
        desc: 'Our visa officers review your documents within 2 hours to ensure full compliance with current MOI criteria.',
      },
      {
        step: '03',
        title: 'Government Processing',
        desc: 'Your application is processed through official state immigration channels with real-time tracking.',
      },
      {
        step: '04',
        title: 'E-Visa Delivery',
        desc: 'Your approved Electronic Entry Permit (PDF) with verifiable QR code is delivered via email & WhatsApp.',
      },
    ],
    faqs: [
      {
        q: 'How long does it take to get a Qatar Tourist Visa approved?',
        a: 'Standard processing takes between 48 to 72 working hours. For urgent travelers, our express priority service can deliver approvals in as little as 24 hours.',
      },
      {
        q: 'Do GCC residents need a visa to enter Qatar?',
        a: 'GCC residents with valid residency permits (professions eligible under Qatar MOI list) can apply for a specialized GCC Resident Visit Visa, which our team processes rapidly.',
      },
      {
        q: 'Is mandatory health insurance required for tourists entering Qatar?',
        a: 'Yes. The Ministry of Public Health requires foreign visitors to hold an approved health insurance policy (QAR 50 per month). We can bundle this seamlessly with your visa application.',
      },
    ],
    inquiryConfig: {
      serviceTypeLabel: 'Visa Category Required',
      options: [
        'Qatar 30-Day Tourist Visit Visa (A1)',
        'GCC Resident Transit / Visit Entry Permit',
        'Commercial Business Visit Visa (1 to 3 Months)',
        'Hayya Platform Advisory & Entry Card',
        'Transit Layover Permit (Under 96 Hours)',
        'Family / Companion Visit Visa Extension',
      ],
      defaultOption: 'Qatar 30-Day Tourist Visit Visa (A1)',
      dateLabel: 'Intended Arrival Date in Doha',
      paxLabel: 'Number of Applicants',
      notesPrompt: 'e.g. Nationality, country of residence, passport expiry date, urgent timeline...',
    },
  },
  {
    id: 'airport-meet-assist',
    slug: 'airport-meet-assist',
    title: 'VIP Hamad Airport Meet & Assist (Al Maha)',
    titleAr: 'استقبال وتوديع كبار الشخصيات بمطار حمد',
    badge: 'VIP Hamad Airport',
    iconName: 'ShieldCheck',
    shortDescription:
      'Breeze effortlessly through Hamad International Airport with dedicated VIP escorts, fast-track immigration clearance, porter assistance, and private Al Maha lounge access.',
    heroImage:
      'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1600&q=80',
    startingPriceQAR: 280,
    rateType: 'per passenger from',
    overview:
      'Transform your arrival, departure, or transit through Hamad International Airport (DOH) into a luxurious, effortless experience with AR Trust Travel’s VIP Meet & Assist services. As your dedicated host at Skytrax’s World’s Best Airport, our uniformed VIP liaison awaits you right at the aircraft aerobridge or terminal arrivals gate with personalized signage. You will be whisked through dedicated fast-track immigration lanes and security checkpoints, escorted to the prestigious Al Maha Lounge, and met seamlessly by our private chauffeur fleet at the VIP curbside.',
    highlights: [
      'Personal uniformed VIP concierge greeting right at the aircraft aerobridge exit gate',
      'Exclusive expedited priority immigration, passport control, and security clearance lanes',
      'Dedicated luggage porter handling all baggage retrieval from the carousel',
      'Complimentary access to the luxurious Al Maha Transit Lounge with fine dining buffet & showers',
      'Direct curbside coordination with your awaiting Mercedes-Benz or Land Cruiser chauffeur',
    ],
    inclusions: [
      'Personalized greeting nameboard at aircraft aerobridge',
      'Fast-track customs and immigration clearance escort',
      'Baggage porter service from carousel to vehicle trunk',
      'Full coordination with arriving flights and live delay monitoring',
    ],
    whyChooseUs: [
      {
        title: 'Perfect for Families & Elderly',
        desc: 'Navigating a sprawling international hub with small children or seniors is stress-free with our motorized terminal buggies and dedicated porters.',
      },
      {
        title: 'Tight Connection Protection',
        desc: 'Have a short 60-90 minute international layover? Our airside escort fast-tracks you directly across terminals to ensure you never miss your connecting flight.',
      },
      {
        title: 'Seamless Chauffeur Handoff',
        desc: 'Our airport escort coordinates in real-time with your private AR Trust chauffeur, ensuring your car is waiting curbside the moment you exit.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Provide Flight Details',
        desc: 'Submit your arriving or departing flight number, date, and passenger list through our form.',
      },
      {
        step: '02',
        title: 'Pre-Arrival Coordination',
        desc: 'Our operations team tracks your flight in real-time and assigns a dedicated airside VIP host.',
      },
      {
        step: '03',
        title: 'Gate Greeting',
        desc: 'Your host meets you at the aerobridge gate with personalized name signage and assists with hand luggage.',
      },
      {
        step: '04',
        title: 'Fast-Track & Escort',
        desc: 'Glide through priority immigration and baggage collection directly to your awaiting luxury vehicle.',
      },
    ],
    faqs: [
      {
        q: 'Where will the host meet me upon arrival?',
        a: 'Your uniformed VIP host will be stationed directly at the aerobridge exit as you step off the aircraft, holding an electronic tablet with your name or company logo.',
      },
      {
        q: 'Does this service include fast-track immigration clearance?',
        a: 'Yes. You bypass standard public immigration queues and are escorted through the dedicated priority diplomats/first-class immigration lane.',
      },
      {
        q: 'Can this service be booked for departures as well as arrivals?',
        a: 'Yes. For departures, your host meets you at the departures curbside, handles your luggage, assists with airline check-in, guides you through fast-track exit immigration, and escorts you to the departure gate or lounge.',
      },
    ],
    inquiryConfig: {
      serviceTypeLabel: 'Service Scope / Service Package',
      options: [
        'VIP Arrival Meet & Assist (Gate to Curbside Chauffeur)',
        'VIP Departure Meet & Assist (Curbside to Boarding Gate)',
        'Transit Fast-Track Connection Escort (Flight to Flight)',
        'VIP Family Package (with Electric Terminal Buggy)',
        'Al Maha Premium Lounge Access Inclusion',
        'VVIP Diplomatic / Private Jet Protocol Escort',
      ],
      defaultOption: 'VIP Arrival Meet & Assist (Gate to Curbside Chauffeur)',
      dateLabel: 'Flight Arrival / Departure Date',
      paxLabel: 'Number of Passengers (Adults & Children)',
      notesPrompt: 'e.g. Airline & Flight Number (e.g. QR 004), arrival time, number of check-in bags...',
    },
  },
  {
    id: 'corporate-mice',
    slug: 'corporate-mice',
    title: 'Corporate Travel & MICE Event Logistics',
    titleAr: 'سياحة الأعمال والمؤتمرات والوفود',
    badge: 'Corporate & MICE',
    iconName: 'Award',
    shortDescription:
      'End-to-end transportation management for international congresses, sports tournaments, corporate summits, and trade delegations visiting Doha.',
    heroImage:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
    startingPriceQAR: 1200,
    rateType: 'custom project quote',
    overview:
      'AR Trust Travel & Tourism W.L.L. is a premier Destination Management Company in Qatar trusted by multinational corporations, governmental bodies, sports organizations, and international event organizers. We orchestrate comprehensive ground transportation, VIP executive chauffeur dispatch, group airport receptions, and curated gala hospitality programs for events hosted at the Doha Exhibition and Convention Centre (DECC), Qatar National Convention Centre (QNCC), and major international sports venues.',
    highlights: [
      'Comprehensive ground transportation fleet: executive sedans, Mercedes V-Class, and 50-seater luxury coaches',
      'Dedicated On-Site Logistics Coordinator and 24/7 Operations Command Center in Doha',
      'Consolidated corporate invoicing with transparent VAT/tax accounting and itemized manifests',
      'VIP protocol escorts for keynote speakers, CEOs, board members, and government dignitaries',
      'Customized delegate excursion programs (Desert Safari gala dinners, Dhow sunset receptions)',
    ],
    inclusions: [
      'Single Point of Contact (SPOC) Senior Account Executive',
      'Real-time GPS vehicle tracking and daily dispatch manifest reports',
      'Immaculately sanitized vehicles equipped with bottled water, Wi-Fi, and executive amenities',
      'Airport arrivals welcome desk with customized company branding & signage',
    ],
    whyChooseUs: [
      {
        title: 'Flawless Scale & Precision',
        desc: 'From moving 10 C-suite executives to dispatching 40 luxury buses for 1,500 conference attendees, we have the fleet and manpower to execute without delays.',
      },
      {
        title: 'Local Government & Venue Permits',
        desc: 'We hold commercial access permissions for VIP drop-offs at DECC, QNCC, Lusail Arena, and the Hamad International Airport VIP protocol gate.',
      },
      {
        title: 'Custom Corporate Billing',
        desc: 'Flexible credit terms, consolidated invoicing, and transparent post-event reconciliation for corporate travel procurement departments.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Share RFP / Event Scope',
        desc: 'Send us your event dates, estimated delegate counts, venue schedule, and VIP requirements.',
      },
      {
        step: '02',
        title: 'Tailored Logistics Proposal',
        desc: 'We create a comprehensive vehicle deployment plan with exact routing, vehicle specs, and competitive pricing.',
      },
      {
        step: '03',
        title: 'On-Site Execution',
        desc: 'Our dedicated on-site dispatchers coordinate curbside arrivals, venue shuttles, and VIP transfers in real time.',
      },
      {
        step: '04',
        title: 'Post-Event Manifest & Invoicing',
        desc: 'Receive consolidated electronic billing reports with complete passenger trip logs and tax documentation.',
      },
    ],
    faqs: [
      {
        q: 'Can you provide transportation for 200+ delegates attending an event at DECC or QNCC?',
        a: 'Yes. Our commercial fleet includes luxury 30-seater Coasters and 50-seater executive Coach buses capable of handling large-scale conference shuttle circuits.',
      },
      {
        q: 'Do you offer airport arrivals welcome desks for international conferences?',
        a: 'Yes. We set up dedicated branded welcome desks inside Hamad International Airport arrivals terminal to greet arriving delegates and guide them to their assigned shuttles.',
      },
      {
        q: 'Can we arrange a private desert safari or gala dinner for our corporate team?',
        a: 'Absolutely. We curate bespoke corporate team-building events, private Bedouin desert camp gala dinners with live Arabian BBQ catering, and private sunset Dhow cruises.',
      },
    ],
    inquiryConfig: {
      serviceTypeLabel: 'Event / Corporate Scope',
      options: [
        'International Conference / Congress Logistics (50-1,000 Pax)',
        'C-Suite Executive / Board of Directors Fleet Dispatch',
        'Trade Exhibition Shuttles (DECC / QNCC Venues)',
        'Sports Tournament / Athletic Delegation Transportation',
        'Corporate Team-Building / Desert Safari Gala Dinner',
        'Government / Diplomatic VIP Protocol Escort',
      ],
      defaultOption: 'International Conference / Congress Logistics (50-1,000 Pax)',
      dateLabel: 'Event Start & End Dates',
      paxLabel: 'Estimated Number of Delegates / Attendees',
      notesPrompt: 'e.g. Venue location, daily shuttle schedule, vehicle types needed, special requirements...',
    },
  },
  {
    id: 'yacht-dhow-charters',
    slug: 'yacht-dhow-charters',
    title: 'Private Yacht Charters & Arabian Dhows',
    titleAr: 'تأجير اليخوت الفاخرة والمراكب التقليدية',
    badge: 'Luxury Maritime',
    iconName: 'Compass',
    shortDescription:
      'Private luxury yacht cruises from The Pearl-Qatar and Lusail Marina, as well as traditional wooden Dhow charters with sunset barbecue catering in Doha Bay.',
    heroImage:
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1600&q=80',
    startingPriceQAR: 850,
    rateType: 'charter from',
    overview:
      'Discover Qatar’s magnificent skyline and turquoise Arabian waters from the vantage point of a private luxury yacht or authentic wooden Dhow. AR Trust Travel operates a curated fleet of maritime vessels departing daily from The Pearl-Qatar Marina and Lusail Marina. Whether you are hosting a romantic sunset cruise overlooking West Bay, a lively family day of swimming at Safliya Island, or a large celebration aboard a traditional Arabian Dhow with live open-flame barbecue catering, we guarantee an unforgettable maritime experience.',
    highlights: [
      'Private motor yachts (from 45ft sport yachts to 85ft tri-deck luxury mega-yachts)',
      'Traditional handcrafted wooden Arabian Dhow charters for up to 50 guests',
      'Scenic routing along Doha Bay, West Bay modern towers, Katara Cultural Village, and Safliya Island',
      'Full catering options available: 5-star live BBQ buffets, gourmet finger food, and tropical mocktails',
      'Certified marine captains, experienced deck crew, and comprehensive safety & life-saving equipment',
    ],
    inclusions: [
      'Private vessel charter exclusively for your group',
      'Licensed professional captain and onboard service crew',
      'Unlimited chilled bottled water, soft drinks, and ice',
      'State-of-the-art Bluetooth sound system and ambient lighting',
      'Swimming stop at Safliya Island (subject to tide & weather conditions)',
    ],
    whyChooseUs: [
      {
        title: '100% Private Charters',
        desc: 'You and your guests enjoy exclusive access to the boat without sharing with other passengers.',
      },
      {
        title: 'Fresh Live Barbecue Catering',
        desc: 'Upgrade your voyage with an authentic live open-flame charcoal grill prepared fresh by our onboard chef.',
      },
      {
        title: 'Flexible Hourly Durations',
        desc: 'Choose from 2-hour sunset cruises, 4-hour half-day island escapes, or full-day private deep-sea adventures.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Select Vessel & Date',
        desc: 'Choose between a modern luxury yacht or traditional wooden Dhow, your guest count, and cruise duration.',
      },
      {
        step: '02',
        title: 'Customize Itinerary & Catering',
        desc: 'Add optional live BBQ catering, anniversary decorations, or water sport activities.',
      },
      {
        step: '03',
        title: 'Instant Booking & Boarding Pass',
        desc: 'Receive your official boarding confirmation, marina gate coordinates, and captain direct contact.',
      },
      {
        step: '04',
        title: 'Set Sail in Doha Bay',
        desc: 'Arrive at the marina, step aboard your private vessel, and enjoy the premier luxury cruise of Qatar.',
      },
    ],
    faqs: [
      {
        q: 'Where do the yachts and Dhow boats depart from?',
        a: 'Our modern yachts depart from The Pearl-Qatar (Porto Arabia) or Lusail Marina. Traditional wooden Dhows depart from the historic Doha Corniche / Dhow Harbour near the Museum of Islamic Art.',
      },
      {
        q: 'Can we bring our own food and beverages on board?',
        a: 'Yes! Guests are welcome to bring their own snacks, meals, and soft drinks. We also offer turnkey 5-star live barbecue catering packages if you prefer a hassle-free culinary experience.',
      },
      {
        q: 'Can we stop for swimming in the sea?',
        a: 'Yes. On 3-hour or longer charters, we can anchor near Safliya Island where guests can swim in calm, clean waters. Life jackets and swimming ladders are provided on board.',
      },
    ],
    inquiryConfig: {
      serviceTypeLabel: 'Vessel Style / Charter Type',
      options: [
        '55ft Luxury Motor Yacht (Up to 15 Guests) - The Pearl Marina',
        '75ft VIP Tri-Deck Yacht (Up to 25 Guests) - Lusail Marina',
        'Traditional Wooden Dhow Charter (Up to 45 Guests) - Corniche',
        'Sunset Barbecue Cruise (Doha Bay Skyline View)',
        'Safliya Island Private Day Beach Anchorage (4+ Hours)',
        'Private Birthday / Anniversary Celebration Cruise',
      ],
      defaultOption: '55ft Luxury Motor Yacht (Up to 15 Guests) - The Pearl Marina',
      dateLabel: 'Preferred Charter Date & Time',
      paxLabel: 'Number of Guests on Board',
      notesPrompt: 'e.g. Duration (2h, 4h), time (sunset, morning), live BBQ catering needed, special occasion...',
    },
  },
];

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  const clean = slug.toLowerCase().replace(/^\/+|\/+$/g, '').trim();
  return SERVICES_CATALOG.find(
    (s) => s.slug === clean || s.id === clean || s.slug.includes(clean)
  );
}
