import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  BookmarkCheck,
  CreditCard,
  CalendarClock,
  Wallet,
  Receipt,
  FileSignature,
  HardHat,
  MessageSquareWarning,
  Bell,
  UserCheck,
  ArrowLeft,
  Printer,
  CheckCircle2,
  LogIn,
  UserPlus,
  Lock,
  LogOut,
  Phone,
  Mail,
  ShieldCheck,
  KeyRound,
  Download,
  Database,
} from 'lucide-react';
import {
  BookingItem,
  PaymentItem,
  PropertyItem,
  ProjectItem,
  ComplaintItem,
  NotificationItem,
  CustomerUser,
} from '../types';
import { formatExactBdtBengali, toBengaliDigits } from '../utils/bengaliLogic';
import { ArchitecturalRender, NazihaLogo } from './ArchitecturalVisuals';
import { MoneyReceiptModal, MoneyReceiptData } from './MoneyReceiptModal';

type PortalTab =
  | 'ড্যাশবোর্ড'
  | 'আমার প্রপার্টি'
  | 'আমার বুকিং'
  | 'পেমেন্ট'
  | 'কিস্তির বিবরণ'
  | 'বকেয়া হিসাব'
  | 'রিসিট'
  | 'চুক্তিপত্র'
  | 'প্রজেক্ট আপডেট'
  | 'অভিযোগ'
  | 'নোটিফিকেশন'
  | 'প্রোফাইল';

const PORTAL_MENU: { label: PortalTab; icon: React.FC<{ className?: string }> }[] = [
  { label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { label: 'আমার প্রপার্টি', icon: Building2 },
  { label: 'আমার বুকিং', icon: BookmarkCheck },
  { label: 'পেমেন্ট', icon: CreditCard },
  { label: 'কিস্তির বিবরণ', icon: CalendarClock },
  { label: 'বকেয়া হিসাব', icon: Wallet },
  { label: 'রিসিট', icon: Receipt },
  { label: 'চুক্তিপত্র', icon: FileSignature },
  { label: 'প্রজেক্ট আপডেট', icon: HardHat },
  { label: 'অভিযোগ', icon: MessageSquareWarning },
  { label: 'নোটিফিকেশন', icon: Bell },
  { label: 'প্রোফাইল', icon: UserCheck },
];

export const CustomerPortalView: React.FC<{
  customerUser: CustomerUser | null;
  onCustomerAuthenticated: (user: CustomerUser) => void;
  onCustomerLogout: () => void;
  onGoogleLogin: () => void;
  onBackToHome: () => void;
  onBrowseProperties: () => void;
  onOpenAdminPanel?: () => void;
}> = ({
  customerUser,
  onCustomerAuthenticated,
  onCustomerLogout,
  onGoogleLogin,
  onBackToHome,
  onBrowseProperties,
  onOpenAdminPanel,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginIdentifier, setLoginIdentifier] = useState('01711223344');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupNid, setSignupNid] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<PortalTab>('ড্যাশবোর্ড');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<MoneyReceiptData | null>(null);

  const [subjectBn, setSubjectBn] = useState('');
  const [messageBn, setMessageBn] = useState('');
  const [complaintSaved, setComplaintSaved] = useState(false);

  const activeUid = customerUser?.uid || 'demo-customer';

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portal?uid=${encodeURIComponent(activeUid)}`);
      const data = await res.json();
      setBookings(data.bookings || []);
      setPayments(data.payments || []);
      setProperties(data.properties || []);
      setProjects(data.projects || []);
      setComplaints(data.complaints || []);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error loading portal data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerUser) {
      loadPortalData();
    }
  }, [customerUser?.uid]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'লগইন করতে সমস্যা হয়েছে।');
      } else if (data.customer) {
        onCustomerAuthenticated(data.customer);
      }
    } catch {
      setAuthError('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCustomerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          phone: signupPhone,
          email: signupEmail,
          nidNumber: signupNid,
          addressBn: signupAddress,
          password: signupPassword,
          confirmPassword: signupConfirm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'সাইন আপ করতে সমস্যা হয়েছে।');
      } else if (data.customer) {
        onCustomerAuthenticated(data.customer);
      }
    } catch {
      setAuthError('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।');
    } finally {
      setAuthLoading(false);
    }
  };

  const totalBookings = bookings.length;
  const totalPaid = bookings.reduce((sum, b) => sum + (b.paidAmountBdt || 0), 0);
  const totalDue = bookings.reduce((sum, b) => sum + (b.dueAmountBdt || 0), 0);
  const nextInstallmentDate =
    bookings.find((b) => b.dueAmountBdt > 0)?.nextInstallmentDate || 'নির্ধারিত নেই';

  const buildReceiptFromPayment = (p: PaymentItem): MoneyReceiptData => {
    const bk = bookings.find((b) => b.id === p.bookingId) || bookings[0];
    const prop = properties.find((pr) => pr.id === bk?.propertyId) || properties[0];
    return {
      receiptNumber: p.receiptNumber,
      issueDate: p.paidDate || p.dueDate || new Date().toISOString().split('T')[0],
      bookingNumber: bk?.bookingNumber || 'HH-BK-2026-0101',
      customerName: bk?.customerName || customerUser?.name || 'সম্মানিত গ্রাহক',
      customerPhone: bk?.customerPhone || customerUser?.phone || '01711223344',
      customerEmail: bk?.customerEmail || customerUser?.email || '',
      nidNumber: bk?.nidNumber || customerUser?.nidNumber || '',
      customerAddressBn: bk?.addressBn || customerUser?.addressBn || 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।',
      propertyTitleBn: prop?.titleBn || p.titleBn,
      propertyCode: prop?.propertyCode || 'HH-L-101',
      propertyLocationBn: prop?.locationBn || 'বসুন্ধরা আবাসিক এলাকা, ঢাকা',
      propertySizeBn: prop?.sizeBn || '৫ কাঠা',
      paymentTitleBn: p.titleBn,
      paymentMethodBn: p.paymentMethodBn || 'ব্যাংক ট্রান্সফার / পে-অর্ডার',
      referenceNo: p.receiptNumber,
      amountBdt: p.amountBdt,
      totalPriceBdt: bk?.totalPriceBdt,
      totalPaidBdt: bk?.paidAmountBdt,
      dueAmountBdt: bk?.dueAmountBdt,
      statusBn: p.statusBn || 'পরিশোধিত',
      recordedByBn: 'হিসাব ও ক্যাশ বিভাগ · H & H Homes',
    };
  };

  const handlePayInstallment = async (paymentId: number) => {
    setPayingId(paymentId);
    try {
      const res = await fetch('/api/portal/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          paymentMethodBn: 'ব্যাংক ট্রান্সফার / অনলাইন গেটওয়ে',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        await loadPortalData();
        if (data.payment) {
          setSelectedReceipt(buildReceiptFromPayment(data.payment));
        }
      }
    } finally {
      setPayingId(null);
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectBn || !messageBn) return;
    const res = await fetch('/api/portal/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userUid: activeUid,
        customerName: customerUser?.name || 'সম্মানিত গ্রাহক',
        subjectBn,
        messageBn,
      }),
    });
    if (res.ok) {
      setSubjectBn('');
      setMessageBn('');
      setComplaintSaved(true);
      await loadPortalData();
    }
  };

  // IF NOT LOGGED IN: Render Real Customer Password Login & Sign-Up Screen
  if (!customerUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071120] via-[#101C32] to-[#06392F] flex flex-col justify-between p-4 md:p-8 text-white">
        <div className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 py-2">
          <NazihaLogo variant="light" />
          <div className="flex items-center gap-2.5">
            {onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/25 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-400/40 font-bold text-sm transition-colors cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>অ্যাডমিন ও ইআরপি প্যানেল</span>
              </button>
            )}
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FDE68A] border border-[#C6A15B]/40 font-bold text-base transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              হোমপেজে ফিরে যান
            </button>
          </div>
        </div>

        <div className="max-w-6xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 3D Visual & Portal Benefits */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#C6A15B]/20 border border-[#C6A15B]/50 text-[#FDE68A] text-base font-bold">
              <ShieldCheck className="w-5 h-5 text-[#34D399]" />
              নিরাপদ পাসওয়ার্ড ও সাইন আপ যুক্ত গ্রাহক পোর্টাল
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">
              H &amp; H Homes ডিজিটাল গ্রাহক অ্যাকাউন্টে স্বাগতম
            </h1>
            <p className="text-lg text-white/85 leading-relaxed">
              আপনার মোবাইল নম্বর বা ইমেইল এবং পাসওয়ার্ড দিয়ে লগইন করুন। নতুন গ্রাহক হলে মাত্র ১ মিনিটে সাইন আপ করে আপনার প্লট বা ফ্ল্যাটের বুকিং, কিস্তির বিবরণ, বকেয়া হিসাব এবং অফিশিয়াল মানি রিসিট দেখুন।
            </p>
            <div className="rounded-2xl overflow-hidden border-2 border-[#C6A15B]/50 shadow-2xl h-64">
              <ArchitecturalRender
                theme="hero_3d_twin_towers"
                label="গ্রাহক ডিজিটাল ইআরপি ও ৩ডি প্রপার্টি ট্র্যাকার"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-base">
              <div className="p-4 rounded-xl bg-white/10 border border-white/15">
                <p className="font-bold text-[#FDE68A]">তাৎক্ষণিক মানি রিসিট</p>
                <p className="text-sm text-white/80 mt-1">প্রতিটি কিস্তি পরিশোধের সাথে সাথে প্রিন্টযোগ্য রিসিট</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 border border-white/15">
                <p className="font-bold text-[#34D399]">ডিজিটাল বরাদ্দপত্র</p>
                <p className="text-sm text-white/80 mt-1">আপনার বুকিংকৃত জমি বা ফ্ল্যাটের সম্পূর্ণ চুক্তিপত্র</p>
              </div>
            </div>
          </div>

          {/* Right Password Login & Sign-Up Form Card */}
          <div className="lg:col-span-6 bg-white text-[#0B162C] rounded-3xl shadow-2xl border-2 border-[#C6A15B] p-6 md:p-10">
            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#F2F4F7] rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-extrabold text-base md:text-lg transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#0B162C] text-[#FDE68A] shadow-md'
                    : 'text-[#0B162C]/70 hover:text-[#0B162C]'
                }`}
              >
                <KeyRound className="w-5 h-5" />
                পাসওয়ার্ড লগইন
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
                className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-extrabold text-base md:text-lg transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-[#059669] text-white shadow-md'
                    : 'text-[#0B162C]/70 hover:text-[#0B162C]'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                নতুন গ্রাহক সাইন আপ
              </button>
            </div>

            {authError && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-base font-bold">
                {authError}
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handlePasswordLogin} className="space-y-5">
                <div>
                  <label
                    htmlFor="customer-login-id"
                    className="block text-base font-bold text-[#0B162C] mb-2"
                  >
                    মোবাইল নম্বর অথবা ইমেইল ঠিকানা *
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-[#0B162C]/50 absolute left-4 top-4" />
                    <input
                      id="customer-login-id"
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="০১৭১১২২৩৩৪৪ অথবা customer@hhhomesbd.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-[#0B162C]/20 focus:border-[#C6A15B] focus:outline-none text-base font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="customer-login-password"
                    className="block text-base font-bold text-[#0B162C] mb-2"
                  >
                    গোপন পাসওয়ার্ড (Password) *
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-[#0B162C]/50 absolute left-4 top-4" />
                    <input
                      id="customer-login-password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="আপনার পাসওয়ার্ড লিখুন"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-[#0B162C]/20 focus:border-[#C6A15B] focus:outline-none text-base font-semibold"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/40 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-bold text-[#92400E]">
                    ডেমো গ্রাহক লগইন: মোবাইল <code className="font-mono">01711223344</code> | পাসওয়ার্ড{' '}
                    <code className="font-mono">123456</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('01711223344');
                      setLoginPassword('123456');
                    }}
                    className="px-3 py-1 rounded-lg bg-[#C6A15B] text-[#0B162C] font-extrabold text-xs cursor-pointer"
                  >
                    অটো-ফিল করুন
                  </button>
                </div>

                <button
                  id="customer-login-submit"
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0B162C] to-[#172A45] hover:from-[#172A45] hover:to-[#0B162C] text-[#FDE68A] font-extrabold text-lg shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  {authLoading ? 'লগইন যাচাই হচ্ছে...' : 'পাসওয়ার্ড দিয়ে লগইন করুন'}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-300" />
                  <span className="flex-shrink mx-4 text-gray-500 text-sm font-bold">অথবা</span>
                  <div className="flex-grow border-t border-gray-300" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="py-3 px-4 rounded-xl border-2 border-[#059669] text-[#059669] hover:bg-[#059669] hover:text-white font-bold text-base transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    নতুন অ্যাকাউন্ট খুলুন
                  </button>
                  <button
                    type="button"
                    onClick={onGoogleLogin}
                    className="py-3 px-4 rounded-xl border-2 border-[#0B162C]/20 hover:bg-[#F2F4F7] text-[#0B162C] font-bold text-base transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5 text-[#C6A15B]" />
                    গুগল দিয়ে লগইন
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCustomerSignup} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="signup-name" className="block text-sm font-bold text-[#0B162C] mb-1">
                      গ্রাহকের পূর্ণ নাম *
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="আপনার পূর্ণ নাম"
                      className="w-full px-3.5 py-3 rounded-xl border-2 border-[#0B162C]/20 text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-phone" className="block text-sm font-bold text-[#0B162C] mb-1">
                      মোবাইল নম্বর (১১ সংখ্যা) *
                    </label>
                    <input
                      id="signup-phone"
                      type="text"
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-3 rounded-xl border-2 border-[#0B162C]/20 text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-bold text-[#0B162C] mb-1">
                      ইমেইল ঠিকানা *
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-3 rounded-xl border-2 border-[#0B162C]/20 text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-nid" className="block text-sm font-bold text-[#0B162C] mb-1">
                      জাতীয় পরিচয়পত্র (NID) নম্বর
                    </label>
                    <input
                      id="signup-nid"
                      type="text"
                      value={signupNid}
                      onChange={(e) => setSignupNid(e.target.value)}
                      placeholder="১০ বা ১৭ সংখ্যার NID"
                      className="w-full px-3.5 py-3 rounded-xl border-2 border-[#0B162C]/20 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-address" className="block text-sm font-bold text-[#0B162C] mb-1">
                    বর্তমান ঠিকানা
                  </label>
                  <input
                    id="signup-address"
                    type="text"
                    value={signupAddress}
                    onChange={(e) => setSignupAddress(e.target.value)}
                    placeholder="বাসা নং, রোড, এলাকা, জেলা"
                    className="w-full px-3.5 py-3 rounded-xl border-2 border-[#0B162C]/20 text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-bold text-[#0B162C] mb-1">
                      নতুন পাসওয়ার্ড দিন *
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="কমপক্ষে ৪ অক্ষর"
                      className="w-full px-3.5 py-3 rounded-xl border-2 border-[#0B162C]/20 text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-confirm" className="block text-sm font-bold text-[#0B162C] mb-1">
                      পাসওয়ার্ড নিশ্চিত করুন *
                    </label>
                    <input
                      id="signup-confirm"
                      type="password"
                      required
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                      className="w-full px-3.5 py-3 rounded-xl border-2 border-[#0B162C]/20 text-base"
                    />
                  </div>
                </div>

                <button
                  id="signup-submit"
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-lg shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  {authLoading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'সাইন আপ সম্পন্ন ও লগইন করুন'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#101C32] flex flex-col lg:flex-row">
      {/* Left Sidebar Navigation */}
      <aside className="w-full lg:w-76 bg-[#0B162C] text-white shrink-0 border-r border-[#C6A15B]/30 no-print">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#FDE68A] font-bold tracking-wider uppercase">
              H &amp; H Homes ডিজিটাল ইআরপি
            </p>
            <h2 className="text-2xl font-extrabold text-white mt-0.5">গ্রাহক পোর্টাল</h2>
          </div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg bg-[#172A45] text-[#FDE68A] hover:bg-[#C6A15B] hover:text-[#101C32] transition-colors font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            হোমপেজ
          </button>
        </div>

        <nav className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5">
          {PORTAL_MENU.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all text-left cursor-pointer ${
                  active
                    ? 'bg-[#C6A15B] text-[#0B162C] shadow-md'
                    : 'text-white/85 hover:bg-[#172A45] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 m-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <p className="text-xs text-[#FDE68A] font-bold">লগইনকৃত গ্রাহক</p>
          <p className="text-base font-extrabold text-white truncate">{customerUser.name}</p>
          <p className="text-xs text-white/75 truncate">{customerUser.phone || customerUser.email}</p>
          <button
            onClick={onCustomerLogout}
            className="w-full mt-2 py-2.5 px-3 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            লগআউট করুন
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Welcome & Account Bar */}
        <div className="bg-white rounded-2xl p-6 border border-[#101C32]/10 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
          <div>
            <span className="text-sm font-bold text-[#059669]">
              স্বাগতম, {customerUser.name} ({customerUser.phone || customerUser.email})
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#101C32] mt-0.5">
              H &amp; H Homes গ্রাহক অ্যাকাউন্ট — {activeTab}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onBrowseProperties}
              className="px-5 py-3 rounded-xl bg-[#C6A15B] text-[#101C32] text-base font-extrabold hover:bg-[#b58f48] transition-colors cursor-pointer"
            >
              নতুন প্রপার্টি বুকিং করুন
            </button>
            <button
              onClick={onCustomerLogout}
              className="px-4 py-3 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-base font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              লগআউট
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 no-print">
          <div className="bg-white p-6 rounded-2xl border border-[#101C32]/10 shadow-sm">
            <p className="text-base text-[#101C32]/65 font-bold">মোট বুকিং</p>
            <p className="text-3xl font-extrabold text-[#101C32] mt-2 tabular-nums-bn">
              {toBengaliDigits(totalBookings)}টি প্রপার্টি
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#101C32]/10 shadow-sm">
            <p className="text-base text-[#101C32]/65 font-bold">মোট পরিশোধ</p>
            <p className="text-3xl font-extrabold text-emerald-700 mt-2 tabular-nums-bn">
              {formatExactBdtBengali(totalPaid)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#101C32]/10 shadow-sm">
            <p className="text-base text-[#101C32]/65 font-bold">মোট বকেয়া</p>
            <p className="text-3xl font-extrabold text-amber-700 mt-2 tabular-nums-bn">
              {formatExactBdtBengali(totalDue)}
            </p>
          </div>
          <div className="bg-[#101C32] text-white p-6 rounded-2xl border border-[#C6A15B]/40 shadow-sm">
            <p className="text-base text-[#FDE68A] font-bold">পরবর্তী কিস্তির তারিখ</p>
            <p className="text-2xl font-extrabold text-white mt-2 tabular-nums-bn">
              {toBengaliDigits(nextInstallmentDate)}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-2xl text-center text-[#101C32]/70 font-bold text-lg">
            আপনার অ্যাকাউন্টের তথ্য লোড হচ্ছে...
          </div>
        ) : (
          <>
            {(activeTab === 'ড্যাশবোর্ড' ||
              activeTab === 'আমার বুকিং' ||
              activeTab === 'আমার প্রপার্টি' ||
              activeTab === 'বকেয়া হিসাব') && (
              <div className="bg-white rounded-2xl p-6 border border-[#101C32]/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-[#101C32]">
                    বুকিং ও বরাদ্দকৃত প্রপার্টির তালিকা
                  </h3>
                  <span className="text-sm font-bold text-[#101C32]/60">
                    মোট: {toBengaliDigits(bookings.length)}টি রেকর্ড
                  </span>
                </div>

                {bookings.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#F8F6F0] text-center space-y-3">
                    <p className="text-lg text-[#101C32]/80 font-bold">
                      আপনার নামে এখনো কোনো প্রপার্টি বুকিং পাওয়া যায়নি।
                    </p>
                    <button
                      onClick={onBrowseProperties}
                      className="px-6 py-3 rounded-xl bg-[#101C32] text-[#FDE68A] text-base font-bold cursor-pointer"
                    >
                      পছন্দের জমি বা ফ্ল্যাট বুকিং করুন
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-base">
                      <thead>
                        <tr className="border-b border-[#101C32]/10 text-[#101C32]/65 font-bold">
                          <th className="py-3.5 px-3">বুকিং নম্বর</th>
                          <th className="py-3.5 px-3">প্রপার্টি</th>
                          <th className="py-3.5 px-3">পেমেন্ট প্ল্যান</th>
                          <th className="py-3.5 px-3 text-right">মোট মূল্য</th>
                          <th className="py-3.5 px-3 text-right">পরিশোধিত</th>
                          <th className="py-3.5 px-3 text-right">বকেয়া</th>
                          <th className="py-3.5 px-3">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#101C32]/10">
                        {bookings.map((b) => {
                          const prop = properties.find((p) => p.id === b.propertyId);
                          return (
                            <tr key={b.id} className="hover:bg-[#F8F6F0]/60">
                              <td className="py-4 px-3 font-mono font-bold text-[#101C32]">
                                {b.bookingNumber}
                              </td>
                              <td className="py-4 px-3">
                                <p className="font-extrabold text-[#101C32]">
                                  {prop?.titleBn || `প্রপার্টি আইডি #${b.propertyId}`}
                                </p>
                                <p className="text-sm text-[#101C32]/65">
                                  {prop?.propertyCode} · {prop?.sizeBn}
                                </p>
                              </td>
                              <td className="py-4 px-3 font-semibold">{b.paymentPlanChoice}</td>
                              <td className="py-4 px-3 text-right font-bold tabular-nums-bn">
                                {formatExactBdtBengali(b.totalPriceBdt)}
                              </td>
                              <td className="py-4 px-3 text-right font-bold text-emerald-700 tabular-nums-bn">
                                {formatExactBdtBengali(b.paidAmountBdt)}
                              </td>
                              <td className="py-4 px-3 text-right font-bold text-amber-700 tabular-nums-bn">
                                {formatExactBdtBengali(b.dueAmountBdt)}
                              </td>
                              <td className="py-4 px-3">
                                <span
                                  className={`px-3 py-1 rounded-md text-sm font-bold ${
                                    b.statusBn === 'অনুমোদিত'
                                      ? 'bg-emerald-100 text-emerald-900'
                                      : b.statusBn === 'বাতিল'
                                      ? 'bg-red-100 text-red-900'
                                      : 'bg-amber-100 text-amber-900'
                                  }`}
                                >
                                  {b.statusBn}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

             {(activeTab === 'ড্যাশবোর্ড' ||
              activeTab === 'পেমেন্ট' ||
              activeTab === 'কিস্তির বিবরণ' ||
              activeTab === 'রিসিট') && (
              <div className="bg-white rounded-2xl p-6 border border-[#101C32]/10 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#101C32]">
                      কিস্তির বিবরণ, পেমেন্ট ও অফিশিয়াল মানি রিসিট
                    </h3>
                    <p className="text-sm text-[#101C32]/65">
                      যেকোনো পরিশোধিত কিস্তির অফিশিয়াল মানি রিসিট দেখুন, ডাউনলোড বা প্রিন্ট করুন
                    </p>
                  </div>
                  {payments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const firstPaid =
                          payments.find((p) => p.statusBn === 'পরিশোধিত') || payments[0];
                        if (firstPaid) setSelectedReceipt(buildReceiptFromPayment(firstPaid));
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 no-print cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                      সর্বশেষ মানি রিসিট বের করুন
                    </button>
                  )}
                </div>

                {payments.length === 0 ? (
                  <p className="text-base text-[#101C32]/70 py-4">
                    এখনো কোনো কিস্তি বা পেমেন্ট শিডিউল তৈরি হয়নি।
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-base">
                      <thead>
                        <tr className="border-b border-[#101C32]/10 text-[#101C32]/65 font-bold">
                          <th className="py-3 px-3">রিসিট নম্বর</th>
                          <th className="py-3 px-3">কিস্তির বিবরণ</th>
                          <th className="py-3 px-3">তারিখ</th>
                          <th className="py-3 px-3 text-right">পরিমাণ</th>
                          <th className="py-3 px-3">স্ট্যাটাস</th>
                          <th className="py-3 px-3 text-right no-print">মানি রিসিট / কার্যক্রম</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#101C32]/10">
                        {payments.map((p) => (
                          <tr key={p.id}>
                            <td className="py-3.5 px-3 font-mono text-sm font-bold">
                              {p.receiptNumber}
                            </td>
                            <td className="py-3.5 px-3 font-bold text-[#101C32]">{p.titleBn}</td>
                            <td className="py-3.5 px-3 tabular-nums-bn">
                              {toBengaliDigits(p.paidDate || p.dueDate)}
                            </td>
                            <td className="py-3.5 px-3 text-right font-bold tabular-nums-bn">
                              {formatExactBdtBengali(p.amountBdt)}
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`px-2.5 py-1 rounded text-sm font-bold ${
                                  p.statusBn === 'পরিশোধিত'
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {p.statusBn}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right no-print">
                              {p.statusBn === 'পরিশোধিত' ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedReceipt(buildReceiptFromPayment(p))}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>মানি রিসিট দেখুন ও ডাউনলোড</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handlePayInstallment(p.id)}
                                  disabled={payingId === p.id}
                                  className="px-4 py-2 rounded-lg bg-[#101C32] text-[#FDE68A] text-sm font-bold hover:bg-[#172A45] transition-colors cursor-pointer"
                                >
                                  {payingId === p.id ? 'প্রক্রিয়াধীন...' : 'কিস্তি পরিশোধ ও রিসিট নিন'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'চুক্তিপত্র' && (
              <div className="bg-white rounded-2xl p-8 border-2 border-[#C6A15B]/40 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#101C32]/10 pb-4">
                  <div>
                    <p className="text-xs font-bold text-[#C6A15B]">H &amp; H Homes অফিশিয়াল দলিল</p>
                    <h3 className="text-2xl font-extrabold text-[#101C32]">
                      প্রাথমিক বরাদ্দপত্র ও বুকিং চুক্তিপত্র (Allotment Agreement)
                    </h3>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#101C32] text-[#FDE68A] text-sm font-bold no-print cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    চুক্তিপত্র প্রিন্ট করুন
                  </button>
                </div>
                {bookings.length === 0 ? (
                  <p className="text-base text-[#101C32]/75">
                    প্রপার্টি বুকিং সম্পন্ন হওয়ার পর আপনার ডিজিটাল বরাদ্দপত্র ও চুক্তিপত্র এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
                  </p>
                ) : (
                  bookings.map((b) => {
                    const prop = properties.find((p) => p.id === b.propertyId);
                    return (
                      <div key={b.id} className="p-6 rounded-xl bg-[#F8F6F0] space-y-3 text-base leading-relaxed">
                        <p className="font-extrabold text-[#101C32] text-lg">
                          বরাদ্দপত্র নম্বর: {b.bookingNumber} | স্ট্যাটাস: {b.statusBn}
                        </p>
                        <p>
                          <strong>গ্রাহকের নাম:</strong> {b.customerName} | <strong>জাতীয় পরিচয়পত্র (NID):</strong>{' '}
                          {b.nidNumber}
                        </p>
                        <p>
                          <strong>বরাদ্দকৃত প্রপার্টি:</strong> {prop?.titleBn} ({prop?.propertyCode}) — {prop?.sizeBn}
                        </p>
                        <p>
                          <strong>নির্ধারিত মোট মূল্য:</strong> {formatExactBdtBengali(b.totalPriceBdt)} |{' '}
                          <strong>পরিশোধের মাধ্যম:</strong> {b.paymentPlanChoice}
                        </p>
                        <p className="text-sm text-[#101C32]/70 pt-2 border-t border-[#101C32]/10">
                          শর্তাবলী: নির্ধারিত কিস্তি পরিশোধ সাপেক্ষে H &amp; H Homes কর্তৃপক্ষ গ্রাহকের অনুকূলে সাফ কবলা রেজিস্ট্রেশন ও দখল হস্তান্তর করতে অঙ্গীকারবদ্ধ।
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'প্রজেক্ট আপডেট' && (
              <div className="bg-white rounded-2xl p-6 border border-[#101C32]/10 shadow-sm space-y-5">
                <h3 className="text-xl font-extrabold text-[#101C32]">
                  চলমান প্রজেক্টের ৩ডি ও প্রকৌশল উন্নয়ন আপডেট
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {projects.map((proj) => (
                    <div key={proj.id} className="rounded-xl border border-[#101C32]/10 overflow-hidden bg-[#F8F6F0]">
                      <div className="h-44">
                        <ArchitecturalRender theme={proj.imageType} label={proj.statusBn} />
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-lg text-[#101C32]">{proj.nameBn}</h4>
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#101C32] text-[#FDE68A]">
                            {proj.statusBn}
                          </span>
                        </div>
                        <p className="text-sm text-[#101C32]/70">{proj.locationBn}</p>
                        <p className="text-sm text-[#101C32]/85">{proj.descriptionBn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'অভিযোগ' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form
                  onSubmit={handleComplaintSubmit}
                  className="bg-white rounded-2xl p-6 border border-[#101C32]/10 shadow-sm space-y-4"
                >
                  <h3 className="text-xl font-extrabold text-[#101C32]">
                    গ্রাহক সেবা ও অভিযোগ দাখিল
                  </h3>
                  {complaintSaved && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold">
                      আপনার অভিযোগ/অনুরোধ সফলভাবে গ্রহণ করা হয়েছে।
                    </div>
                  )}
                  <div>
                    <label className="block text-base font-bold mb-1">বিষয় *</label>
                    <input
                      type="text"
                      required
                      value={subjectBn}
                      onChange={(e) => setSubjectBn(e.target.value)}
                      placeholder="যেমন: কিস্তির রিসিট সংশোধন বা সাইট ভিজিট অনুরোধ"
                      className="w-full px-3.5 py-3 rounded-xl border border-[#101C32]/20 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-bold mb-1">বিস্তারিত বিবরণ *</label>
                    <textarea
                      rows={4}
                      required
                      value={messageBn}
                      onChange={(e) => setMessageBn(e.target.value)}
                      placeholder="আপনার সমস্যার বিস্তারিত লিখুন..."
                      className="w-full px-3.5 py-3 rounded-xl border border-[#101C32]/20 text-base"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#101C32] text-[#FDE68A] font-bold text-base cursor-pointer"
                  >
                    জমা দিন
                  </button>
                </form>

                <div className="bg-white rounded-2xl p-6 border border-[#101C32]/10 shadow-sm space-y-3">
                  <h3 className="text-xl font-extrabold text-[#101C32]">পূর্ববর্তী টিকিট তালিকা</h3>
                  {complaints.length === 0 ? (
                    <p className="text-base text-[#101C32]/70">কোনো অভিযোগ রেকর্ড নেই।</p>
                  ) : (
                    complaints.map((c) => (
                      <div key={c.id} className="p-4 rounded-xl bg-[#F8F6F0] border border-[#101C32]/10">
                        <div className="flex justify-between">
                          <span className="font-bold text-base">{c.subjectBn}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                            {c.statusBn}
                          </span>
                        </div>
                        <p className="text-sm text-[#101C32]/75 mt-1">{c.messageBn}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'নোটিফিকেশন' && (
              <div className="bg-white rounded-2xl p-6 border border-[#101C32]/10 shadow-sm space-y-3">
                <h3 className="text-xl font-extrabold text-[#101C32]">অ্যাকাউন্ট নোটিফিকেশন</h3>
                {notifications.length === 0 ? (
                  <p className="text-base text-[#101C32]/70">কোনো নতুন বার্তা নেই।</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 rounded-xl bg-[#F8F6F0] border-l-4 border-[#C6A15B] space-y-1"
                    >
                      <p className="font-bold text-base text-[#101C32]">{n.titleBn}</p>
                      <p className="text-base text-[#101C32]/80">{n.messageBn}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'প্রোফাইল' && (
              <div className="bg-white rounded-2xl p-6 border border-[#101C32]/10 shadow-sm space-y-4">
                <h3 className="text-xl font-extrabold text-[#101C32]">গ্রাহক প্রোফাইল তথ্য</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                  <div className="p-4 rounded-xl bg-[#F8F6F0]">
                    <span className="text-xs text-[#101C32]/60 block">গ্রাহকের নাম</span>
                    <span className="font-bold">{customerUser.name}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F8F6F0]">
                    <span className="text-xs text-[#101C32]/60 block">মোবাইল নম্বর</span>
                    <span className="font-bold">{customerUser.phone || '০১৭১১২২৩৩৪৪'}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F8F6F0]">
                    <span className="text-xs text-[#101C32]/60 block">ইমেইল</span>
                    <span className="font-bold">{customerUser.email}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F8F6F0]">
                    <span className="text-xs text-[#101C32]/60 block">জাতীয় পরিচয়পত্র (NID) ও ঠিকানা</span>
                    <span className="font-bold">
                      {customerUser.nidNumber || '১৯৯২১২৩৪৫৬৭৮৯'} · {customerUser.addressBn || 'ঢাকা'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <MoneyReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      </main>
    </div>
  );
};
