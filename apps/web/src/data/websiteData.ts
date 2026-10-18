import { FleetVehicle, TourPackage } from '../types';
import {
  mercedesVClass,
  toyotaLandCruiser,
  kiaK5,
  bestuneB70,
  hyundaiStaria,
  kiaCarnival,
  toyotaVeloz,
  mitsubishiXpander,
  toyotaCoaster,
  luxuryCoachBus,
  kiaCarens,
  changanSedan,
} from '../assets/cars';

export type { FleetVehicle };

export interface WebsiteTour {
  id: string;
  title: string;
  titleAr?: string;
  category: 'Desert Safari' | 'City Tour' | 'Airport Transit' | 'Sea Tour' | 'Private Luxury';
  duration: string;
  groupSize: string;
  rating: number;
  reviewCount: number;
  priceQAR: number;
  badge?: string;
  image: string;
  description: string;
  includes: string[];
  departure: string;
}

export function getSyncedFleet(customFleet?: FleetVehicle[]): FleetVehicle[] {
  if (customFleet && customFleet.length > 0) {
    return customFleet.filter((v) => v.showOnWebsite !== false);
  }
  return WEBSITE_FLEET;
}

export interface MultiDayPackage {
  id: string;
  title: string;
  days: number;
  nights: number;
  priceQAR: number;
  tagline: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  badge?: string;
  image: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  country: string;
  rating: number;
  date: string;
  tour: string;
  comment: string;
  avatar: string;
}

export const WEBSITE_TOURS: WebsiteTour[] = [
  {
    id: 'tour-1',
    title: 'Half-Day City Tour With Dhow Boat Cruise Adventure',
    titleAr: 'جولة نصف يوم بالدوحة مع رحلة القارب الخشبي (الداو)',
    category: 'City Tour',
    duration: '4.5 Hours',
    groupSize: '1 - 15 Guests',
    rating: 4.9,
    reviewCount: 342,
    priceQAR: 180,
    badge: 'Popular Choice',
    image: 'https://artrusttravel.com/wp-content/uploads/2026/01/Half-Day-City-Tour-With-Dhow-Boat-Cruise-Adventure-1000x1000.jpg',
    description: 'Explore the vibrant Souq Waqif, Katara Cultural Village, The Pearl-Qatar, and culminate in an authentic Arabian Dhow cruise across Doha Bay with panoramic West Bay skyline views.',
    includes: ['Traditional Dhow Boat Ride', 'Licensed English/Arabic Guide', 'Souq Waqif & Katara Walk', 'Bottled Mineral Water', 'Hotel / Airport Pickup'],
    departure: 'Daily at 09:00 AM & 03:00 PM',
  },
  {
    id: 'tour-2',
    title: 'Doha Desert Safari: Dune Bashing & Inland Sea Adventure',
    titleAr: 'سفاري صحراء الدوحة: تطعيس الكثبان وبحر خور العديد',
    category: 'Desert Safari',
    duration: '4 - 5 Hours',
    groupSize: 'Up to 6 per Land Cruiser',
    rating: 5.0,
    reviewCount: 520,
    priceQAR: 250,
    badge: 'Must Experience',
    image: 'https://artrusttravel.com/wp-content/uploads/2026/01/Doha-Desert-Safari_-Dune-Bashing-Inland-Sea-Adventure-2-1000x1000.jpg',
    description: 'A heart-pounding 4x4 dune bashing adventure into the majestic southern dunes of Qatar, reaching the UNESCO-recognized Inland Sea (Khor Al Adaid) where the desert kisses the Arabian Gulf.',
    includes: ['4x4 Land Cruiser Dune Bashing', 'Khor Al Adaid Inland Sea Visit', 'Camel Ride Experience', 'Sandboarding on High Dunes', 'Traditional Karak Tea in Majlis'],
    departure: 'Morning 08:30 AM | Sunset 02:30 PM',
  },
  {
    id: 'tour-3',
    title: 'Transit Doha City Tour Experience (Airport Pickup & Drop)',
    titleAr: 'جولة ترانزيت الدوحة السريعة مع الاستقبال والتوديع بمطار حمد',
    category: 'Airport Transit',
    duration: '3 - 4 Hours',
    groupSize: 'Private / Small Group',
    rating: 4.9,
    reviewCount: 418,
    priceQAR: 150,
    badge: 'Layover Friendly',
    image: 'https://artrusttravel.com/wp-content/uploads/2026/01/Transit-Doha-City-Tour-Private-Quick-Highlights-with-Airport-Pickup-2-1000x1000.jpg',
    description: 'Turn your transit layover at Hamad International Airport into an unforgettable memory. Priority curbside pickup, Corniche skyline drive, Souq Waqif stroll, and guaranteed punctual return.',
    includes: ['Guaranteed On-Time Airport Return', 'Curbside Meeting Service', 'Private Air-Conditioned Van', 'Corniche, Souq Waqif & Katara', 'Luggage Assistance'],
    departure: 'Flexible on all flight arrival schedules',
  },
  {
    id: 'tour-4',
    title: 'Qatar Sunset Desert Safari by Dune Buggy Riding',
    titleAr: 'سفاري غروب الشمس مع قيادة دراجات الباجي الصحراوية',
    category: 'Desert Safari',
    duration: '4 Hours',
    groupSize: '1 - 2 per Buggy',
    rating: 4.8,
    reviewCount: 189,
    priceQAR: 320,
    badge: 'Adrenaline High',
    image: 'https://artrusttravel.com/wp-content/uploads/2026/01/Qatar-Sunset-Desert-Safari-by-Dune-Buggy-Riding.jpg',
    description: 'Take command of powerful Can-Am / Polaris dune buggies across sweeping desert dunes with experienced marshal escorts, finishing with a golden sunset over the Arabian sands.',
    includes: ['Self-Drive Dune Buggy (1hr)', 'Helmets & Safety Goggles', 'Professional Safety Marshal', 'Desert Photo Stop at Sunset', 'Transfers from/to Doha'],
    departure: 'Daily at 02:45 PM',
  },
  {
    id: 'tour-5',
    title: 'Private Group City Tour in Doha With Luxury Boat Tour',
    titleAr: 'جولة خاصة لمجموعات العائلات في الدوحة مع يخت فاخر',
    category: 'Private Luxury',
    duration: '5 Hours',
    groupSize: 'Up to 10 Guests',
    rating: 5.0,
    reviewCount: 126,
    priceQAR: 650,
    badge: 'VIP Exclusive',
    image: 'https://artrusttravel.com/wp-content/uploads/2026/01/Private-Group-City-Tour-in-Doha-With-Luxury-Boat-Tour-2-1000x1000.jpg',
    description: 'A bespoke VIP experience crafted for families and executive groups. Travel in a luxury Mercedes V-Class with dedicated tour manager, followed by a private 90-minute yacht voyage.',
    includes: ['Private Luxury Mercedes-Benz V-Class', 'Exclusive 90-Min Yacht Cruise', 'Gourmet Arabian Treats & Refreshments', 'Museum of Islamic Art Stop', 'Bespoke Flexible Itinerary'],
    departure: 'Custom departure time upon booking',
  },
  {
    id: 'tour-6',
    title: 'Doha Safari Adventure, Quad Biking and Sunset Horse Riding',
    titleAr: 'مغامرة السفاري وركوب الدراجات الرباعية والخيل عند الغروب',
    category: 'Desert Safari',
    duration: '5.5 Hours',
    groupSize: '2 - 12 Guests',
    rating: 4.9,
    reviewCount: 204,
    priceQAR: 380,
    badge: 'Multi-Activity',
    image: 'https://artrusttravel.com/wp-content/uploads/2025/02/Half-Day-Desert-Safari-with-Khor-Al-Adaid-Sunset-1-1000x1000.png',
    description: 'The ultimate desert multi-experience: ATV Quad biking, purebred Arabian horse riding along the dunes at dusk, 4x4 dune thrills, and authentic Bedouin hospitality.',
    includes: ['30-Min ATV Quad Biking', '45-Min Arabian Horse Sunset Trek', '4x4 Dune Ride to Inland Sea', 'Traditional Arabic Karak & Dates', 'Full Safety Gear Provided'],
    departure: 'Daily at 02:00 PM',
  },
];

export const WEBSITE_FLEET: FleetVehicle[] = [
  {
    id: 'fleet-1',
    name: 'Mercedes-Benz V-Class',
    category: 'VIP Luxury',
    passengers: 7,
    luggage: 7,
    priceQAR: 280,
    rateType: 'per airport transfer',
    features: ['Leather Captain Seats', 'High-Speed Wi-Fi', 'Bottled Evian Water', 'Chauffeur in Formal Attire', 'Curbside Greeting'],
    image: mercedesVClass,
    idealFor: 'Executive VIPs, Diplomats & Luxury Family Transit',
  },
  {
    id: 'fleet-2',
    name: 'Toyota Land Cruiser 4x4 (VXR/GR)',
    category: 'Safari 4x4',
    passengers: 6,
    luggage: 4,
    priceQAR: 220,
    rateType: 'per trip / transfer',
    features: ['Reinforced Roll Cages', 'High-Clearance Suspension', 'Desert Recovery Gear', 'Licensed Safari Chauffeur', 'Dual AC Climate Zones'],
    image: toyotaLandCruiser,
    idealFor: 'Desert Dune Safaris, Inland Sea Expeditions & Offroad Tours',
  },
  {
    id: 'fleet-3',
    name: 'KIA K5 Executive Sedan',
    category: 'Executive Sedan',
    passengers: 4,
    luggage: 3,
    priceQAR: 120,
    rateType: 'per transfer',
    features: ['Spacious Rear Legroom', 'USB Fast Chargers', 'Punctual Flight Tracking', 'Clean Sanitized Cabin', 'Multilingual Professional Driver'],
    image: kiaK5,
    idealFor: 'Business Solo Travelers & Couples City Transfers',
  },
  {
    id: 'fleet-4',
    name: 'Bestune B70 Executive Sedan',
    category: 'Executive Sedan',
    passengers: 4,
    luggage: 3,
    priceQAR: 130,
    rateType: 'per transfer',
    features: ['Panoramic Sunroof', 'Acoustic Sound Insulation', 'Supple Leather Seating', 'Hamad Airport Arrival Tracking', 'Digital Infotainment'],
    image: bestuneB70,
    idealFor: 'Corporate Business Commutes & Hotel Chauffeur Transfers',
  },
  {
    id: 'fleet-5',
    name: 'Hyundai Staria VIP Van',
    category: 'Group Van',
    passengers: 8,
    luggage: 8,
    priceQAR: 190,
    rateType: 'per transfer',
    features: ['Panoramic Vista Windows', 'Generous Cargo Bay', 'Separate Rear AC Controls', 'Child Seat Available', 'Curbside Hamad Airport Greeting'],
    image: hyundaiStaria,
    idealFor: 'Family Holidays, Small Tour Groups & Hotel Luggage',
  },
  {
    id: 'fleet-6',
    name: 'Kia Carnival VIP Luxury',
    category: 'Group Van',
    passengers: 7,
    luggage: 6,
    priceQAR: 200,
    rateType: 'per transfer',
    features: ['Power Sliding Doors', 'Lounge VIP Captain Chairs', 'Tri-Zone Climate Control', 'Extra Luggage Capacity', 'Bottled Mineral Water'],
    image: kiaCarnival,
    idealFor: 'Executive Delegation Transit & Premium Family Vacations',
  },
  {
    id: 'fleet-7',
    name: 'Toyota Veloz 7-Seater MPV',
    category: 'Family MPV',
    passengers: 6,
    luggage: 5,
    priceQAR: 150,
    rateType: 'per transfer',
    features: ['Versatile 3-Row Seating', 'Rear Roof Air Conditioning', 'Flexible Luggage Storage', 'Smooth City Suspension', 'Courteous Experienced Driver'],
    image: toyotaVeloz,
    idealFor: 'Medium Families, Shopping Trips & City Sightseeing Transfers',
  },
  {
    id: 'fleet-8',
    name: 'Mitsubishi Xpander MPV',
    category: 'Family MPV',
    passengers: 6,
    luggage: 4,
    priceQAR: 140,
    rateType: 'per transfer',
    features: ['Elevated Ride Comfort', 'Rear AC Vents', 'Foldable 3rd Row Seats', 'USB Mobile Chargers', 'Budget-Friendly Group Ride'],
    image: mitsubishiXpander,
    idealFor: 'Budget Group Transfers, Meryal Waterpark & Souq Waqif Trips',
  },
  {
    id: 'fleet-9',
    name: 'Toyota Coaster Luxury Minibus',
    category: 'Coaster Bus',
    passengers: 22,
    luggage: 20,
    priceQAR: 450,
    rateType: 'per half-day rental',
    features: ['PA Microphone Guide System', 'High-Back Reclining Seats', 'Dedicated Luggage Compartment', 'Commercial Passenger Insurance', 'Uniformed Captain'],
    image: toyotaCoaster,
    idealFor: 'Corporate Events, Inbound Groups & Cruise Ship Excursions',
  },
  {
    id: 'fleet-10',
    name: 'Luxury Coach & Standard Bus',
    category: 'Luxury Coach',
    passengers: 35,
    luggage: 35,
    priceQAR: 750,
    rateType: 'per full-day rental',
    features: ['Massive Underfloor Luggage Bays', 'High-Capacity Tropical AC', 'Air Ride Suspension', 'Overhead Parcel Racks', 'Experienced Long-Distance Captain'],
    image: luxuryCoachBus,
    idealFor: 'Large Group Conferences, Sports Teams & Educational Tours',
  },
  {
    id: 'fleet-11',
    name: 'KIA Carens 7-Seater',
    category: 'Family MPV',
    passengers: 6,
    luggage: 4,
    priceQAR: 145,
    rateType: 'per transfer',
    features: ['One-Touch Tumble 2nd Row', 'Rear AC Vents with Speed Control', 'Wireless Phone Charging', 'Tinted Privacy Glass', 'Punctual Pickup'],
    image: kiaCarens,
    idealFor: 'Airport Arrivals, Katara Village & Pearl-Qatar Family Rides',
  },
  {
    id: 'fleet-12',
    name: 'Changan Executive Sedan',
    category: 'Executive Sedan',
    passengers: 4,
    luggage: 3,
    priceQAR: 110,
    rateType: 'per transfer',
    features: ['Efficient City Transit', 'Air-Conditioned Comfort', 'Curbside Airport Greeting', 'Flight Delayed Monitoring', 'Safe & Clean Interior'],
    image: changanSedan,
    idealFor: 'Affordable Solo Transit & Daily Doha City Rides',
  },
];

export const MULTI_DAY_PACKAGES: MultiDayPackage[] = [
  {
    id: 'pkg-2d',
    title: '2 Days / 1 Night: Essential Qatar Transit & Dunes',
    days: 2,
    nights: 1,
    priceQAR: 850,
    tagline: 'The ultimate quick escape covering modern Doha glamour and wild desert sands.',
    highlights: [
      'Day 1: Airport VIP pickup, Souq Waqif, Katara Village & Sunset Dhow Cruise',
      'Day 2: Morning Desert Dune Bashing, Khor Al Adaid Inland Sea & Airport transfer',
    ],
    included: ['4-Star Doha Hotel (1 Night)', 'Private Airport Transfers (Both Ways)', 'Dhow Boat Cruise', 'Half-Day Desert Safari', 'Daily Breakfast'],
    excluded: ['International Airfare', 'Personal Shopping', 'Gratuities'],
    badge: 'Short Stopover',
    image: 'https://artrusttravel.com/wp-content/uploads/2026/01/Half-Day-City-Tour-With-Dhow-Boat-Cruise-Adventure-1000x1000.jpg',
  },
  {
    id: 'pkg-3d',
    title: '3 Days / 2 Nights: Cultural Treasures & Desert Safari',
    days: 3,
    nights: 2,
    priceQAR: 1450,
    tagline: 'Immerse yourself into Qatar’s heritage, world-class architecture, and thrilling dunes.',
    highlights: [
      'Day 1: Curbside reception, Museum of Islamic Art, Msheireb Downtown & Souq Waqif',
      'Day 2: Full-Day Desert Safari, Dune Bashing, Camel Riding & Bedouin Beach BBQ',
      'Day 3: The Pearl-Qatar yacht cruise, Lusail Marina Promenade & VIP Airport departure',
    ],
    included: ['5-Star Luxury Hotel (2 Nights)', 'Dedicated Private Chauffeur & Vehicle', 'Full Desert Safari with Bedouin Majlis BBQ', 'Museum Entrance Fees', 'Breakfast & Special Dinner'],
    excluded: ['Visa Fees (if applicable)', 'Optional Water Sports'],
    badge: 'Best Value',
    image: 'https://artrusttravel.com/wp-content/uploads/2026/01/Doha-Desert-Safari_-Dune-Bashing-Inland-Sea-Adventure-2-1000x1000.jpg',
  },
  {
    id: 'pkg-4d',
    title: '4 Days / 3 Nights: Grand Qatar Luxury Experience',
    days: 4,
    nights: 3,
    priceQAR: 2350,
    tagline: 'A royal vacation featuring private yacht sailings, desert glamping, and 5-star concierge.',
    highlights: [
      'Day 1: VIP Hamad Airport Meet & Assist, Ritz-Carlton check-in & Corniche sunset',
      'Day 2: National Museum of Qatar, Katara Art Centre, Souq Falcon Hospital & Dhow cruise',
      'Day 3: Khor Al Adaid UNESCO Inland Sea, Sandboarding, Quad Biking & Seafood dinner',
      'Day 4: Luxury shopping at Place Vendôme Lusail & First-Class Airport Transfer',
    ],
    included: ['5-Star Waterfront Resort (3 Nights)', 'Private Mercedes V-Class 24/7 at disposal', 'Private Yacht Cruise with Catering', 'All Safari & Tour Activities', 'All Meals & Entrance Permits'],
    excluded: ['Personal Expenses'],
    badge: 'Ultra Luxury',
    image: 'https://artrusttravel.com/wp-content/uploads/2026/01/Private-Group-City-Tour-in-Doha-With-Luxury-Boat-Tour-2-1000x1000.jpg',
  },
];

export const CUSTOMER_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'David Sterling',
    country: 'United Kingdom 🇬🇧',
    rating: 5,
    date: 'February 2026',
    tour: 'Doha Desert Safari: Dune Bashing & Inland Sea',
    comment: 'Our driver was an absolute master on the dunes! My wife and teenage kids loved the dune bashing, sandboarding, and the view of the sea touching the dunes is unforgettable. Punctual, safe, and true 5-star service.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'rev-2',
    author: 'Elena Rostova',
    country: 'Germany 🇩🇪',
    rating: 5,
    date: 'January 2026',
    tour: 'Transit Doha City Tour Experience',
    comment: 'Had a 7-hour transit at Hamad International Airport. AR Trust Travel picked us up right outside arrivals, took us through Souq Waqif, Katara, and the Dhow harbor. Returned us to airport with 2 hours to spare! Flawless!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'rev-3',
    author: 'Sultan Al-Otaibi',
    country: 'Saudi Arabia 🇸🇦',
    rating: 5,
    date: 'February 2026',
    tour: 'Private Group City Tour in Doha With Luxury Boat Tour',
    comment: 'خدمة راقية جداً وسيارة مرسيدس نظيفة وفخمة مع سائق محترم وملم بكافة معالم الدوحة. جولة القارب في اللؤلؤة كانت ممتعة للأهل. بالتأكيد خيارنا الأول في كل زيارة لقطر.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'rev-4',
    author: 'Marcus & Chloe Chen',
    country: 'Singapore 🇸🇬',
    rating: 5,
    date: 'December 2025',
    tour: 'Half-Day City Tour With Dhow Boat Cruise',
    comment: 'The dhow boat cruise with the Doha skyline sunset is breathtaking. Our guide explained the rich history of Qatar pearling and modern developments with great warmth. Highly recommended agency!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
];

export const CORE_SERVICES = [
  {
    id: 'srv-1',
    title: 'Airline Reservation & Ticketing',
    titleAr: 'حجز وإصدار تذاكر الطيران العالمية',
    icon: 'Plane',
    description: 'Instant flight bookings across 150+ international airlines including Qatar Airways, Emirates, and British Airways with competitive corporate & holiday fares.',
    benefits: ['Best Fare Guaranteed', '24/7 Rebooking & Ticket Changes', 'Group Flight Reservations', 'Excess Baggage Coordination'],
  },
  {
    id: 'srv-2',
    title: 'Luxury Hotel Booking',
    titleAr: 'حجز الفنادق والمنتجعات الفاخرة',
    icon: 'Building2',
    description: 'Exclusive partnership rates across Doha’s top 5-star hotels and beach resorts: Ritz-Carlton, St. Regis, Mandarin Oriental, and Katara Hills Villas.',
    benefits: ['Complimentary Room Upgrades', 'Late Checkout Privilege', 'Direct Booking Confirmation', 'Corporate Contract Rates'],
  },
  {
    id: 'srv-3',
    title: 'Qatar Visa Assistance',
    titleAr: 'خدمات التأشيرات والدخول لقطر',
    icon: 'FileCheck2',
    description: 'Fast-track visa processing for Qatar tourist visas, GCC resident transit permits, business visit visas, and Hayya card support.',
    benefits: ['99.2% Visa Approval Rate', 'Quick 24 - 48h Turnaround', 'Expert Document Verification', 'Clear Tracking Status'],
  },
  {
    id: 'srv-4',
    title: 'VIP Airport Meet & Assist',
    titleAr: 'استقبال وتوديع كبار الشخصيات بمطار حمد',
    icon: 'ShieldCheck',
    description: 'Breeze through Hamad International Airport with dedicated VIP escorts, fast-track immigration clearance, porter assistance, and private lounge access.',
    benefits: ['Fast-Track Immigration Pass', 'Dedicated Luggage Porter', 'Al Maha Lounge Access', 'Curbside Chauffeur Link'],
  },
];

export interface ExperienceItem {
  id: string;
  title: string;
  titleAr?: string;
  category: string;
  priceQAR: number;
  duration?: string;
  image: string;
  badge?: string;
  rateType?: string;
  description?: string;
  includes?: string[];
  type: 'tour' | 'fleet' | 'package' | 'service';
}

/**
 * Synchronize website tours with dynamic packages from AppContext (Dashboard Catalog).
 * Any edits made in the Dashboard are immediately reflected on the frontend.
 */
export function getSyncedWebsiteTours(packages?: TourPackage[]): WebsiteTour[] {
  if (!packages || packages.length === 0) return WEBSITE_TOURS;

  // Filter packages that are tours (not multi-day holiday packages)
  const tourPkgs = packages.filter((p) => !p.isMultiDay && p.category !== 'Holiday Package');

  if (tourPkgs.length === 0) return WEBSITE_TOURS;

  return tourPkgs.map((p) => {
    const staticMatch = WEBSITE_TOURS.find(
      (st) => st.id === p.id || st.title.toLowerCase() === p.name.toLowerCase()
    );

    const catMap: Record<string, WebsiteTour['category']> = {
      'City Tour': 'City Tour',
      'Desert Safari': 'Desert Safari',
      'Airport Transit': 'Airport Transit',
      'Private Luxury': 'Private Luxury',
      'Sea Tour': 'Sea Tour',
    };

    return {
      id: p.id,
      title: p.name,
      titleAr: p.nameAr,
      category: (catMap[p.category] || staticMatch?.category || 'City Tour') as WebsiteTour['category'],
      duration: p.duration || staticMatch?.duration || '4 Hours',
      groupSize: p.groupSize || staticMatch?.groupSize || '1 - 10 Guests',
      rating: p.rating ?? staticMatch?.rating ?? 4.9,
      reviewCount: p.reviewCount ?? staticMatch?.reviewCount ?? 120,
      priceQAR: p.priceQAR,
      badge: p.badge || staticMatch?.badge,
      image:
        p.image ||
        staticMatch?.image ||
        'https://artrusttravel.com/wp-content/uploads/2026/01/Half-Day-City-Tour-With-Dhow-Boat-Cruise-Adventure-1000x1000.jpg',
      description: p.description || staticMatch?.description || '',
      includes: p.includes && p.includes.length > 0 ? p.includes : staticMatch?.includes || [],
      departure: p.departure || staticMatch?.departure || 'Daily departures',
    };
  });
}

/**
 * Synchronize holiday packages with dynamic packages from AppContext (Dashboard Catalog).
 */
export function getSyncedHolidayPackages(packages?: TourPackage[]): MultiDayPackage[] {
  if (!packages || packages.length === 0) return MULTI_DAY_PACKAGES;

  const holidayPkgs = packages.filter((p) => p.isMultiDay || p.category === 'Holiday Package');

  if (holidayPkgs.length === 0) return MULTI_DAY_PACKAGES;

  return holidayPkgs.map((p) => {
    const staticMatch = MULTI_DAY_PACKAGES.find(
      (sp) => sp.id === p.id || sp.title.toLowerCase() === p.name.toLowerCase()
    );
    return {
      id: p.id,
      title: p.name,
      days: p.days || staticMatch?.days || 3,
      nights: p.nights || staticMatch?.nights || 2,
      priceQAR: p.priceQAR,
      tagline: p.description || staticMatch?.tagline || '',
      highlights:
        p.highlights && p.highlights.length > 0
          ? p.highlights
          : staticMatch?.highlights || [
              'Day 1: Airport VIP reception & Doha city orientation',
              'Day 2: Full-day desert safari or cultural excursion',
            ],
      included:
        p.includes && p.includes.length > 0
          ? p.includes
          : staticMatch?.included || ['Luxury Hotel Stay', 'Private Airport Transfers', 'Daily Breakfast'],
      excluded:
        p.excluded && p.excluded.length > 0
          ? p.excluded
          : staticMatch?.excluded || ['International Airfare', 'Personal Expenses'],
      badge: p.badge || staticMatch?.badge,
      image:
        p.image ||
        staticMatch?.image ||
        'https://artrusttravel.com/wp-content/uploads/2026/01/Doha-Desert-Safari_-Dune-Bashing-Inland-Sea-Adventure-2-1000x1000.jpg',
    };
  });
}

export function getAllExperienceItems(
  customPackages?: TourPackage[],
  customFleet?: FleetVehicle[]
): ExperienceItem[] {
  const dynamicTours = getSyncedWebsiteTours(customPackages);
  const dynamicPkgs = getSyncedHolidayPackages(customPackages);

  const tours: ExperienceItem[] = dynamicTours.map((t) => ({
    id: t.id,
    title: t.title,
    titleAr: t.titleAr,
    category: t.category,
    priceQAR: t.priceQAR,
    duration: t.duration,
    image: t.image,
    badge: t.badge,
    rateType: 'per person',
    description: t.description,
    includes: t.includes,
    type: 'tour',
  }));

  const dynamicFleet = getSyncedFleet(customFleet);
  const fleet: ExperienceItem[] = dynamicFleet.map((f) => ({
    id: f.id,
    title: f.name,
    category: f.category,
    priceQAR: f.priceQAR,
    duration: `${f.passengers} Passengers • ${f.luggage} Luggage`,
    image: f.image,
    badge: f.idealFor,
    rateType: f.rateType,
    description: `Private chauffeur service in Qatar with ${f.name}. Includes airport meet & greet and fuel.`,
    includes: f.features,
    type: 'fleet',
  }));

  const pkgs: ExperienceItem[] = dynamicPkgs.map((p) => ({
    id: p.id,
    title: p.title,
    category: 'Holiday Package',
    priceQAR: p.priceQAR,
    duration: `${p.days} Days / ${p.nights} Nights`,
    image: p.image,
    badge: p.badge,
    rateType: 'complete package',
    description: p.tagline,
    includes: p.included,
    type: 'package',
  }));

  const svcs: ExperienceItem[] = CORE_SERVICES.map((s) => ({
    id: s.id,
    title: s.title,
    titleAr: s.titleAr,
    category: 'Travel Service',
    priceQAR: 200,
    duration: 'Custom Request',
    image: 'https://artrusttravel.com/wp-content/uploads/al_opt_content/IMAGE/artrusttravel.com/wp-content/uploads/2026/02/AR-Trust-Travel-Hero-Slider-2.webp.bv.webp',
    badge: 'Concierge Assistance',
    rateType: 'starting from',
    description: s.description,
    includes: s.benefits,
    type: 'service',
  }));

  return [...tours, ...fleet, ...pkgs, ...svcs];
}

export function findExperienceItem(
  idOrTitle?: string,
  customPackages?: TourPackage[],
  customFleet?: FleetVehicle[]
): ExperienceItem {
  const all = getAllExperienceItems(customPackages, customFleet);
  if (!idOrTitle) return all[1] || all[0];
  const exact = all.find((item) => item.id === idOrTitle);
  if (exact) return exact;
  const byTitle = all.find((item) => item.title.toLowerCase().includes(idOrTitle.toLowerCase()));
  if (byTitle) return byTitle;
  return all[1] || all[0];
}

