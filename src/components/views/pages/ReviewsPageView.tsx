import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Award,
  Send,
  ThumbsUp,
  MapPin,
  Calendar,
} from 'lucide-react';
import { CUSTOMER_REVIEWS, ReviewItem } from '../../../data/websiteData';
import { useWebsiteLanguage } from '../../../context/WebsiteLanguageContext';

interface ReviewsPageViewProps {
  onSelectBooking: () => void;
  onNavigateHome: () => void;
}

export const ReviewsPageView: React.FC<ReviewsPageViewProps> = ({
  onSelectBooking,
  onNavigateHome,
}) => {
  const { t } = useWebsiteLanguage();
  const [filterTour, setFilterTour] = useState<string>('All');
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [submittedReview, setSubmittedReview] = useState<boolean>(false);

  // Form states
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerCountry, setReviewerCountry] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerTour, setReviewerTour] = useState('Doha Desert Safari');
  const [reviewerComment, setReviewerComment] = useState('');

  const expandedReviews: ReviewItem[] = [
    ...CUSTOMER_REVIEWS,
    {
      id: 'rev-5',
      author: 'Jean-Luc Dubois',
      country: 'France 🇫🇷',
      rating: 5,
      date: 'March 2026',
      tour: 'Luxury Boat Cruise Doha Skyline View',
      comment:
        'The private yacht cruise along Lusail Marina and The Pearl was the highlight of our Qatar holiday. Flawless boat condition, courteous captain, and delicious local refreshments. Five stars all the way!',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'rev-6',
      author: 'Amira & Tariq Mansour',
      country: 'United Arab Emirates 🇦🇪',
      rating: 5,
      date: 'February 2026',
      tour: 'Mercedes-Benz V-Class Airport Transfer',
      comment:
        'استقبال ممتاز في مطار حمد الدولي وسيارة مرسيدس في-كلاس فخمة ونظيفة جداً مع مقاعد جلدية وسائق في قمة الاحترام. تم التوصيل للفندق بكل راحة وسرعة. شكراً جزيلاً لفريق إيه آر ترست.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'rev-7',
      author: 'Robert MacIntyre',
      country: 'Australia 🇦🇺',
      rating: 5,
      date: 'January 2026',
      tour: 'Half-Day Desert Safari with Khor Al Adaid Sunset',
      comment:
        'Driving over dunes that literally drop right into the ocean at the Inland Sea is unlike anything else in the world. Safe, exciting, and our guide knew the best photo angles. Unmissable experience in Qatar!',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'rev-8',
      author: 'Kavita & Rajesh Patel',
      country: 'India 🇮🇳',
      rating: 5,
      date: 'December 2025',
      tour: 'Transit Doha City Tour Experience',
      comment:
        'We had a 6-hour layover at Hamad Airport. AR Trust took care of our luggage, showed us Katara and Souq Waqif, and got us back through security with plenty of time. Highly professional and dependable!',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    },
  ];

  const filteredReviews = expandedReviews.filter((rev) => {
    if (filterTour === 'All') return true;
    return rev.tour.toLowerCase().includes(filterTour.toLowerCase());
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedReview(true);
    setTimeout(() => {
      setShowReviewModal(false);
      setSubmittedReview(false);
      setReviewerName('');
      setReviewerCountry('');
      setReviewerComment('');
    }, 2000);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* ─── PAGE HERO BANNER ─── */}
      <section className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-hidden bg-[#05161D] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://artrusttravel.com/wp-content/uploads/2026/02/AR-Trust-Travel-Traditional-Dhow-Harbor-Cruise-1.webp')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05161D]/80 via-[#05161D]/60 to-[#05161D]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
          {/* Breadcrumb */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D3A48]/80 border border-[#C0AB6F]/30 text-xs font-semibold text-[#E7CF8A]">
            <button onClick={onNavigateHome} className="hover:underline">{t.common.home}</button>
            <span>/</span>
            <span className="text-white">{t.navReviews}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {t.reviewsPage.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            {t.reviewsPage.heroSubtitle}
          </p>

          <div className="text-xs text-[#E7CF8A] font-mono">
            {t.common.licensedDmc}
          </div>
        </div>
      </section>

      {/* ─── SCORECARD & WRITE REVIEW BANNER ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-white dark:bg-[#05161D] rounded-3xl p-8 border border-slate-200 dark:border-[#C0AB6F]/30 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Rating big score */}
          <div className="md:col-span-4 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 pb-6 md:pb-0 md:pr-8">
            <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F]">
              4.9
            </span>
            <div className="flex items-center justify-center md:justify-start gap-1 text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#D4AF37]" />
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Based on 1,240+ verified bookings on TripAdvisor, Google & direct portal.
            </p>
          </div>

          {/* Breakdown bars */}
          <div className="md:col-span-5 space-y-2 text-xs">
            {[
              { stars: '5 Stars', pct: '94%', width: 'w-[94%]' },
              { stars: '4 Stars', pct: '5%', width: 'w-[5%]' },
              { stars: '3 Stars', pct: '1%', width: 'w-[1%]' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-14 text-slate-500 font-semibold">{b.stars}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] ${b.width}`} />
                </div>
                <span className="w-8 text-right font-mono text-slate-400">{b.pct}</span>
              </div>
            ))}
          </div>

          {/* Write review action */}
          <div className="md:col-span-3 text-center md:text-right space-y-3">
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs shadow-md shadow-[#D4AF37]/20 active:scale-95 transition cursor-pointer"
            >
              Write a Guest Review
            </button>
            <p className="text-[11px] text-slate-400">Verified guests only</p>
          </div>
        </div>
      </div>

      {/* ─── REVIEW CATEGORY FILTER ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'All', label: 'All Reviews (8)' },
            { id: 'Desert Safari', label: 'Desert Safaris' },
            { id: 'City Tour', label: 'City Tours' },
            { id: 'Airport', label: 'Airport Transfers' },
            { id: 'Boat', label: 'Boat & Dhow Cruises' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTour(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterTour === tab.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] shadow-md shadow-[#D4AF37]/20 scale-105'
                  : 'bg-white dark:bg-[#05161D]/80 text-slate-600 dark:text-slate-300 hover:border-[#C0AB6F]/50 border border-slate-200 dark:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── REVIEWS CARDS GRID ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-[#05161D] p-7 rounded-3xl border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md hover:shadow-xl transition-all flex flex-col justify-between hover:border-[#D4AF37]"
            >
              <div>
                {/* Rating & Date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{rev.date}</span>
                </div>

                {/* Tour Taken Tag */}
                <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/30 mb-3">
                  {rev.tour}
                </span>

                {/* Comment */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center gap-3">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="w-11 h-11 rounded-full object-cover border border-[#C0AB6F]/40 shadow-sm"
                  loading="lazy"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {rev.author}
                  </h4>
                  <span className="text-[11px] text-slate-400 block">{rev.country}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── WRITE A REVIEW MODAL ─── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#05161D] border border-[#C0AB6F]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl relative">
            <h3 className="text-xl font-black">Share Your Qatar Experience</h3>
            <p className="text-xs text-slate-400 mt-1">Your feedback helps fellow travelers discover Qatar with confidence.</p>

            {submittedReview ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Thank You for Your Review!</h4>
                <p className="text-xs text-slate-300">Your feedback has been submitted successfully to AR Trust Travel moderation.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 mt-5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. David Sterling"
                    className="w-full bg-[#09232C] border border-[#C0AB6F]/30 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={reviewerCountry}
                      onChange={(e) => setReviewerCountry(e.target.value)}
                      placeholder="e.g. United Kingdom 🇬🇧"
                      className="w-full bg-[#09232C] border border-[#C0AB6F]/30 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Rating</label>
                    <select
                      value={reviewerRating}
                      onChange={(e) => setReviewerRating(Number(e.target.value))}
                      className="w-full bg-[#09232C] border border-[#C0AB6F]/30 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#D4AF37]"
                    >
                      <option value={5}>★★★★★ (5 - Excellent)</option>
                      <option value={4}>★★★★☆ (4 - Very Good)</option>
                      <option value={3}>★★★☆☆ (3 - Good)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tour or Service Taken</label>
                  <input
                    type="text"
                    required
                    value={reviewerTour}
                    onChange={(e) => setReviewerTour(e.target.value)}
                    placeholder="e.g. Doha Desert Safari & Inland Sea"
                    className="w-full bg-[#09232C] border border-[#C0AB6F]/30 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Your Review</label>
                  <textarea
                    rows={4}
                    required
                    value={reviewerComment}
                    onChange={(e) => setReviewerComment(e.target.value)}
                    placeholder="Describe your driver, safari experience, punctuality, and overall trip..."
                    className="w-full bg-[#09232C] border border-[#C0AB6F]/30 rounded-xl p-3 text-white placeholder-slate-500 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] font-bold text-xs shadow-md"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
