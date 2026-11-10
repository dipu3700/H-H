import React, { useState } from 'react';
import {
  X,
  MapPin,
  CheckCircle2,
  FileText,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { PropertyItem, ProjectItem } from '../types';
import { ArchitecturalRender, BlueprintDiagram } from './ArchitecturalVisuals';
import {
  calculateInstallmentPlan,
  canBookProperty,
  formatExactBdtBengali,
  toBengaliDigits,
} from '../utils/bengaliLogic';

export const PropertyDetailModal: React.FC<{
  property: PropertyItem | null;
  allProperties: PropertyItem[];
  projects: ProjectItem[];
  currentUserUid: string;
  currentUserEmail: string;
  currentUserName: string;
  initialTab?: 'details' | 'book' | 'inquiry';
  onClose: () => void;
  onSelectProperty: (prop: PropertyItem) => void;
  onOpenProjectBrochure: (project: ProjectItem) => void;
  onBookingCreated: (bookingNumber: string) => void;
  onGoToPortal: () => void;
}> = ({
  property,
  allProperties,
  projects,
  currentUserUid,
  currentUserEmail,
  currentUserName,
  initialTab = 'details',
  onClose,
  onSelectProperty,
  onOpenProjectBrochure,
  onBookingCreated,
  onGoToPortal,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'book' | 'inquiry'>(initialTab);
  const [selectedPlan, setSelectedPlan] = useState('৩৬ মাসিক কিস্তি');

  // Booking Form State
  const [customerName, setCustomerName] = useState(currentUserName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUserEmail || '');
  const [nidNumber, setNidNumber] = useState('');
  const [addressBn, setAddressBn] = useState('');
  const [notesBn, setNotesBn] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccessNo, setBookingSuccessNo] = useState('');

  // Inquiry Form State
  const [inqName, setInqName] = useState(currentUserName || '');
  const [inqPhone, setInqPhone] = useState('');
  const [inqEmail, setInqEmail] = useState(currentUserEmail || '');
  const [inqMessage, setInqMessage] = useState('');
  const [inqSaved, setInqSaved] = useState(false);
  const [inqError, setInqError] = useState('');

  React.useEffect(() => {
    setActiveTab(initialTab);
    setActiveSlide(0);
    setBookingError('');
    setBookingSuccessNo('');
    setInqSaved(false);
    setInqError('');
  }, [property?.id, initialTab]);

  if (!property) return null;

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeAllProperties = Array.isArray(allProperties) ? allProperties : [];
  const parentProject = safeProjects.find((p) => p.id === property.projectId) || safeProjects[0] || null;
  const isAvailable = canBookProperty(property.statusBn);

  const slides = [
    { theme: property.imageType, caption: `${property.titleBn} — প্রধান দৃশ্য` },
    {
      theme: property.propertyType === 'land' ? 'prop_3d_lakeview_plot_b' : 'gallery_3d_grand_lobby',
      caption:
        property.propertyType === 'land'
          ? 'প্রশস্ত অভ্যন্তরীণ সড়ক ও প্লট সীমানা'
          : 'প্রিমিয়াম লিভিং ও ডাইনিং ইন্টেরিয়র',
    },
    {
      theme: property.propertyType === 'land' ? 'prop_3d_villa_plot_a' : 'hero_3d_twin_towers',
      caption: 'পার্শ্ববর্তী পরিবেশ ও ল্যান্ডস্কেপ ভিউ',
    },
  ];

  const planSummary = calculateInstallmentPlan(
    property.priceBdt,
    property.bookingAmountBdt,
    selectedPlan
  );

  const relatedProperties = safeAllProperties
    .filter((p) => p.id !== property.id && p.propertyType === property.propertyType)
    .slice(0, 3);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setBookingLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          userUid: currentUserUid || 'demo-customer',
          customerName,
          customerPhone,
          customerEmail,
          nidNumber,
          addressBn,
          paymentPlanChoice: selectedPlan,
          notesBn,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'বুকিং জমা দিতে সমস্যা হয়েছে।');
      }
      setBookingSuccessNo(data.booking.bookingNumber);
      onBookingCreated(data.booking.bookingNumber);
    } catch (err: any) {
      setBookingError(err.message || 'বুকিং জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInqError('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inqName,
          phone: inqPhone,
          email: inqEmail,
          propertyCategoryBn: property.categoryBn,
          propertyId: property.id,
          message: inqMessage || `${property.titleBn} (${property.propertyCode}) সম্পর্কে বিস্তারিত জানতে চাই।`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'বার্তা পাঠাতে সমস্যা হয়েছে।');
      setInqSaved(true);
    } catch (err: any) {
      setInqError(err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={property.titleBn}
    >
      <div className="bg-slate-50 rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl">
        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-20 bg-[#0B192C] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div>
            <div className="text-xs text-emerald-300 font-semibold">
              প্রপার্টি আইডি: {property.propertyCode} · {property.categoryBn} · {property.statusBn}
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-0.5">{property.titleBn}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="প্রপার্টি বিস্তারিত বন্ধ করুন"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Large Image Slider + Quick Action Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 bg-[#0F172A]">
                <ArchitecturalRender
                  theme={slides[activeSlide].theme}
                  label={slides[activeSlide].caption}
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent p-4 text-white flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">
                    {slides[activeSlide].caption}
                  </span>
                  <span className="text-xs text-emerald-300 tabular-nums">
                    {toBengaliDigits(activeSlide + 1)} / {toBengaliDigits(slides.length)}
                  </span>
                </div>
              </div>

              {/* Thumbnail Selector */}
              <div className="grid grid-cols-3 gap-3">
                {slides.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeSlide === idx
                        ? 'border-emerald-600 scale-[1.01]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ArchitecturalRender theme={s.theme} label={s.caption} />
                  </button>
                ))}
              </div>
            </div>

            {/* Key Specifications & Booking Trigger Panel */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                  <span>কোড: {property.propertyCode}</span>
                  <span
                    className={`font-bold ${
                      isAvailable ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    স্ট্যাটাস: {property.statusBn}
                  </span>
                </div>

                <div>
                  <div className="text-xs text-slate-500">নির্ধারিত মূল্য</div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tabular-nums mt-0.5">
                    {property.priceDisplayBn}
                  </div>
                  <div className="text-sm text-emerald-700 font-semibold mt-1">
                    বুকিং মানি: {property.bookingDisplayBn}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <div className="text-xs text-slate-500">আকার / পরিমাণ</div>
                    <div className="font-bold text-[#0F172A]">{property.sizeBn}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">ব্লক ও ইউনিট</div>
                    <div className="font-bold text-[#0F172A]">
                      {property.blockNo} · {property.plotNo}
                    </div>
                  </div>
                  {property.propertyType === 'apartment' && (
                    <>
                      <div>
                        <div className="text-xs text-slate-500">বেডরুম</div>
                        <div className="font-bold text-[#0F172A]">
                          {toBengaliDigits(property.bedrooms)}টি বেডরুম
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">বাথরুম</div>
                        <div className="font-bold text-[#0F172A]">
                          {toBengaliDigits(property.bathrooms)}টি বাথরুম
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-xs text-slate-600 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{property.locationBn}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('book')}
                    disabled={!isAvailable}
                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      isAvailable
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? 'এখনই বুকিং করুন' : 'ইতিমধ্যে সংরক্ষিত'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inquiry')}
                    className="py-3 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    তথ্য জানতে চান
                  </button>
                </div>
                {parentProject && (
                  <button
                    type="button"
                    onClick={() => onOpenProjectBrochure(parentProject)}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-[#0F172A] text-xs font-semibold hover:border-emerald-600 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>প্রজেক্ট ব্রোশিওর ডাউনলোড করুন</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs inside Modal */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              বিস্তারিত বিবরণ ও ফ্লোর প্ল্যান
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'book'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              অনলাইন প্রপার্টি বুকিং ফর্ম
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inquiry')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'inquiry'
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              জিজ্ঞাসা ও সাইট ভিজিট বুকিং
            </button>
          </div>

          {/* TAB 1: DETAILS, PAYMENT PLAN & FLOOR PLAN */}
          {activeTab === 'details' && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-lg font-bold text-[#0F172A]">প্রপার্টির বিস্তারিত বিবরণ</h3>
                <p className="text-slate-700 leading-relaxed">{property.descriptionBn}</p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span>পেমেন্ট সুবিধা: {property.paymentPlanBn}</span>
                  <span>·</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-semibold underline inline-flex items-center gap-1"
                  >
                    <span>গুগল ম্যাপে অবস্থান দেখুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Interactive Installment Calculator */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A]">
                      কিস্তি ও পেমেন্ট প্ল্যান ক্যালকুলেটর
                    </h3>
                    <p className="text-xs text-slate-500">
                      আপনার সুবিধাজনক পেমেন্ট পদ্ধতি নির্বাচন করে মাসিক কিস্তির হিসাব দেখুন
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {['এককালীন পরিশোধ', '৩৬ মাসিক কিস্তি', '৬০ মাসিক কিস্তি'].map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setSelectedPlan(plan)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          selectedPlan === plan
                            ? 'bg-[#0F172A] text-white'
                            : 'text-slate-700 hover:text-[#0F172A]'
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">মোট মূল্য</div>
                    <div className="text-base font-bold text-[#0F172A] tabular-nums mt-1">
                      {formatExactBdtBengali(planSummary.totalPriceBdt)}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">বুকিং মানি</div>
                    <div className="text-base font-bold text-[#0F172A] tabular-nums mt-1">
                      {formatExactBdtBengali(planSummary.bookingMoneyBdt)}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">অবশিষ্ট মূলধন</div>
                    <div className="text-base font-bold text-[#0F172A] tabular-nums mt-1">
                      {formatExactBdtBengali(planSummary.remainingPrincipalBdt)}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0B192C] text-white border border-emerald-500/40">
                    <div className="text-xs text-emerald-300">
                      {planSummary.installmentCount === 1
                        ? 'এককালীন পরিশোধযোগ্য'
                        : `মাসিক কিস্তি (${toBengaliDigits(planSummary.installmentCount)} মাস)`}
                    </div>
                    <div className="text-base font-bold text-white tabular-nums mt-1">
                      {formatExactBdtBengali(planSummary.monthlyInstallmentBdt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floor Plan / Plot Layout */}
              <BlueprintDiagram
                titleBn={property.titleBn}
                specsBn={property.floorPlanSpecs}
                isLand={property.propertyType === 'land'}
              />
            </div>
          )}

          {/* TAB 2: REAL ONLINE BOOKING APPLICATION */}
          {activeTab === 'book' && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
              {bookingSuccessNo ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0F172A]">
                    আপনার প্রপার্টি বুকিং আবেদন সফলভাবে গৃহীত হয়েছে!
                  </h3>
                  <p className="text-slate-600 max-w-lg mx-auto text-sm">
                    আপনার ইউনিক বুকিং নম্বর নিচে দেওয়া হলো। প্রপার্টিটি আপনার নামে
                    সংরক্ষিত করা হয়েছে এবং অ্যাডমিন অনুমোদনের পর চূড়ান্ত নিশ্চিতকরণ সম্পন্ন হবে।
                  </p>
                  <div className="inline-block bg-[#0B192C] text-emerald-300 px-6 py-3 rounded-xl font-mono text-lg font-bold border border-emerald-500">
                    বুকিং নম্বর: {bookingSuccessNo}
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onGoToPortal();
                      }}
                      className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      কাস্টমার পোর্টালে বুকিং দেখুন
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-5">
                  <div className="border-b border-slate-200 pb-4">
                    <h3 className="text-xl font-bold text-[#0F172A]">
                      অনলাইন প্রপার্টি বুকিং আবেদনপত্র — H &amp; H Homes
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      নির্বাচিত প্রপার্টি: <strong>{property.titleBn}</strong> ({property.propertyCode}) · বুকিং মানি:{' '}
                      <strong>{property.bookingDisplayBn}</strong>
                    </p>
                  </div>

                  {bookingError && (
                    <div
                      role="alert"
                      className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
                    >
                      {bookingError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="booking-name" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        আবেদনকারীর পূর্ণ নাম *
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="আপনার পূর্ণ নাম লিখুন"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label htmlFor="booking-phone" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        মোবাইল নম্বর (১১ সংখ্যা) *
                      </label>
                      <input
                        id="booking-phone"
                        type="text"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="০১৭XXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label htmlFor="booking-email" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        ইমেইল ঠিকানা *
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label htmlFor="booking-nid" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        জাতীয় পরিচয়পত্র (NID) নম্বর *
                      </label>
                      <input
                        id="booking-nid"
                        type="text"
                        required
                        value={nidNumber}
                        onChange={(e) => setNidNumber(e.target.value)}
                        placeholder="১০ থেকে ১৭ সংখ্যার NID নম্বর"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label htmlFor="booking-plan" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        পছন্দের পেমেন্ট প্ল্যান *
                      </label>
                      <select
                        id="booking-plan"
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-emerald-600"
                      >
                        <option value="এককালীন পরিশোধ">এককালীন পরিশোধ</option>
                        <option value="৩৬ মাসিক কিস্তি">৩৬ মাসিক কিস্তি</option>
                        <option value="৬০ মাসিক কিস্তি">৬০ মাসিক কিস্তি</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="booking-address" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        বর্তমান ঠিকানা *
                      </label>
                      <input
                        id="booking-address"
                        type="text"
                        required
                        value={addressBn}
                        onChange={(e) => setAddressBn(e.target.value)}
                        placeholder="বাসা নং, রোড, এলাকা, জেলা"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      অতিরিক্ত মন্তব্য বা নমিনি তথ্য (ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={2}
                      value={notesBn}
                      onChange={(e) => setNotesBn(e.target.value)}
                      placeholder="আপনার কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold cursor-pointer"
                    >
                      ফিরে যান
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading || !isAvailable}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {bookingLoading ? 'বুকিং প্রক্রিয়াধীন...' : 'বুকিং আবেদন নিশ্চিত করুন'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: INQUIRY FORM */}
          {activeTab === 'inquiry' && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
              {inqSaved ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-xl font-bold text-[#0F172A]">
                    আপনার জিজ্ঞাসা সংরক্ষিত হয়েছে!
                  </h4>
                  <p className="text-sm text-slate-600">
                    H &amp; H Homes-এর প্রতিনিধি দ্রুততম সময়ে আপনার সঙ্গে যোগাযোগ করবেন।
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    এই প্রপার্টি সম্পর্কে জিজ্ঞাসা বা সাইট ভিজিট আবেদন
                  </h3>
                  {inqError && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs">{inqError}</div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      required
                      value={inqName}
                      onChange={(e) => setInqName(e.target.value)}
                      placeholder="আপনার নাম *"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                    <input
                      type="text"
                      required
                      value={inqPhone}
                      onChange={(e) => setInqPhone(e.target.value)}
                      placeholder="মোবাইল নম্বর *"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                    <input
                      type="email"
                      value={inqEmail}
                      onChange={(e) => setInqEmail(e.target.value)}
                      placeholder="ইমেইল"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={inqMessage}
                    onChange={(e) => setInqMessage(e.target.value)}
                    placeholder="আপনার প্রশ্ন বা সাইট ভিজিটের সম্ভাব্য তারিখ লিখুন..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    বার্তা পাঠান
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Related Properties */}
          {relatedProperties.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-lg font-bold text-[#0F172A]">সম্পর্কিত অন্যান্য প্রপার্টি</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedProperties.map((rel) => (
                  <div
                    key={rel.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs text-slate-500">
                        {rel.propertyCode} · {rel.sizeBn}
                      </div>
                      <h4 className="font-bold text-sm text-[#0F172A] mt-1">{rel.titleBn}</h4>
                      <div className="text-sm font-bold text-emerald-700 mt-1">
                        {rel.priceDisplayBn}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('details');
                        setBookingSuccessNo('');
                        onSelectProperty(rel);
                      }}
                      className="text-xs font-bold text-[#0F172A] hover:text-emerald-600 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>বিস্তারিত দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
