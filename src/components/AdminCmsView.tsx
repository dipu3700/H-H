import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  PlusCircle,
  Trash2,
  ArrowLeft,
  Building2,
  Home,
  Settings,
  MessageSquareQuote,
  FileText,
  BookmarkCheck,
  Calculator,
  Globe,
  Database,
  Users,
  Presentation,
  Video,
  TrendingUp,
  TrendingDown,
  Wallet,
  Printer,
  Eye,
  EyeOff,
  Receipt,
  Download,
  Edit3,
  Save,
  Search,
  List,
  LayoutGrid,
  Terminal,
} from 'lucide-react';
import {
  SiteSettings,
  HeroSlideItem,
  BoardMemberItem,
  ProjectItem,
  PropertyItem,
  BookingItem,
  PaymentItem,
  ErpTransactionItem,
  InquiryItem,
  GalleryItem,
  TestimonialItem,
  ArticleItem,
  CustomerUser,
} from '../types';
import {
  formatExactBdtBengali,
  toBengaliDigits,
  calculateErpAccountingSummary,
} from '../utils/bengaliLogic';
import { ArchitecturalRender, ExecutivePortrait } from './ArchitecturalVisuals';
import { MoneyReceiptModal, MoneyReceiptData } from './MoneyReceiptModal';
import { ProjectPropertyViewerModal, ViewerTarget } from './ProjectPropertyViewerModal';

export type AdminSystemMode = 'realestate_erp' | 'website_cms';

type ErpTab =
  | 'মানি রিসিট ও কিস্তি আদায়'
  | 'হিসাবরক্ষণ ও লেজার'
  | 'বুকিং অনুমোদন ও কিস্তি'
  | 'মাস্টার প্রজেক্ট এন্ট্রি'
  | 'মাস্টার প্রপার্টি ইনভেন্টরি'
  | 'পরিচালনা পর্ষদ ডাটাবেস'
  | 'নিবন্ধিত গ্রাহক তালিকা';

type WebCmsTab =
  | 'ইআরপি ডাটা সিলেকশন'
  | 'ব্যানার ও প্রজেক্ট স্লাইডার'
  | 'চেয়ারম্যান ও পরিচালনা পর্ষদ'
  | 'ছবি ও ভিডিও গ্যালারি'
  | 'কাস্টমার রিভিউ'
  | 'সাইট সেটিংস ও যোগাযোগ';

export const AdminCmsView: React.FC<{
  initialMode?: AdminSystemMode;
  onBackToHome: () => void;
  onDataMutated: () => void;
}> = ({ initialMode = 'realestate_erp', onBackToHome, onDataMutated }) => {
  const [systemMode, setSystemMode] = useState<AdminSystemMode>(initialMode);
  const [erpTab, setErpTab] = useState<ErpTab>('মানি রিসিট ও কিস্তি আদায়');
  const [webTab, setWebTab] = useState<WebCmsTab>('ইআরপি ডাটা সিলেকশন');

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMemberItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [erpTransactions, setErpTransactions] = useState<ErpTransactionItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [, setArticles] = useState<ArticleItem[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusBanner, setStatusBanner] = useState('');

  // Official Money Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<MoneyReceiptData | null>(null);
  // Project / Property Detail Viewer Modal State
  const [adminViewerTarget, setAdminViewerTarget] = useState<ViewerTarget | null>(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');
  const [adminListMode, setAdminListMode] = useState<'list' | 'grid'>('list');

  // New Money Receipt Form State
  const [mrBookingId, setMrBookingId] = useState<string>('');
  const [mrCustomerName, setMrCustomerName] = useState('');
  const [mrCustomerPhone, setMrCustomerPhone] = useState('');
  const [mrTitleBn, setMrTitleBn] = useState('বুকিং মানি / ১ম কিস্তি জমা');
  const [mrAmountBdt, setMrAmountBdt] = useState('500000');
  const [mrInstallmentNo, setMrInstallmentNo] = useState('1');
  const [mrMethodBn, setMrMethodBn] = useState('ব্যাংক পে-অর্ডার / চেক');

  // ERP Voucher Form
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txCategory, setTxCategory] = useState('বুকিং ও কিস্তি আদায়');
  const [txProjectName, setTxProjectName] = useState('এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ');
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txMethod, setTxMethod] = useState('ব্যাংক ট্রান্সফার / পে-অর্ডার');
  const [txRef, setTxRef] = useState('');
  const [txNotes, setTxNotes] = useState('');

  // New Project Form (ERP)
  const [projNameBn, setProjNameBn] = useState('');
  const [projCategoryBn, setProjCategoryBn] = useState('আবাসিক জমি');
  const [projStatusBn, setProjStatusBn] = useState('চলমান');
  const [projAreaBn, setProjAreaBn] = useState('বসুন্ধরা আবাসিক এলাকা, ঢাকা');
  const [projLocationBn, setProjLocationBn] = useState('ব্লক-এন, বসুন্ধরা আবাসিক এলাকা, ঢাকা');
  const [projSizeBn, setProjSizeBn] = useState('৩, ৫ ও ১০ কাঠা');
  const [projPriceBn, setProjPriceBn] = useState('কাঠা প্রতি ৪৫ লক্ষ টাকা থেকে');
  const [projDescBn, setProjDescBn] = useState('');
  const [projBudget, setProjBudget] = useState('95000000');
  const [projTheme, setProjTheme] = useState('project_3d_township');

  // New Property Form (ERP)
  const [propCode, setPropCode] = useState('');
  const [propTitleBn, setPropTitleBn] = useState('');
  const [propType, setPropType] = useState<'land' | 'apartment'>('land');
  const [propCategoryBn, setPropCategoryBn] = useState('আবাসিক জমি');
  const [propAreaBn, setPropAreaBn] = useState('বসুন্ধরা আবাসিক এলাকা, ঢাকা');
  const [propLocationBn, setPropLocationBn] = useState('ব্লক-এন, বসুন্ধরা আবাসিক এলাকা, ঢাকা');
  const [propBlockNo, setPropBlockNo] = useState('ব্লক-এন');
  const [propPlotNo, setPropPlotNo] = useState('প্লট-১৫');
  const [propSizeBn, setPropSizeBn] = useState('৫ কাঠা (৩,৬০০ বর্গফুট)');
  const [propPriceBdt, setPropPriceBdt] = useState('22500000');
  const [propPriceDisplayBn, setPropPriceDisplayBn] = useState('৳ ২.২৫ কোটি');
  const [propBookingBdt, setPropBookingBdt] = useState('2000000');
  const [propBookingDisplayBn, setPropBookingDisplayBn] = useState('৳ ২০ লক্ষ');
  const [propTheme, setPropTheme] = useState('prop_3d_villa_plot_a');

  // New Slide Form (Web CMS)
  const [slideBadge, setSlideBadge] = useState('বসুন্ধরা আবাসিক এলাকা, ঢাকা');
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideStats, setSlideStats] = useState('রেডি আবাসিক প্লট ও লাক্সারি ফ্ল্যাট');
  const [slideTheme, setSlideTheme] = useState('hero_3d_twin_towers');

  // Inline Edit States
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [editingSlideTitle, setEditingSlideTitle] = useState('');
  const [editingSlideTheme, setEditingSlideTheme] = useState('hero_3d_twin_towers');

  const [editingPropId, setEditingPropId] = useState<number | null>(null);
  const [editingPropTitle, setEditingPropTitle] = useState('');
  const [editingPropLocation, setEditingPropLocation] = useState('');
  const [editingPropPriceDisplay, setEditingPropPriceDisplay] = useState('');

  // New Gallery Form (Web CMS)
  const [galTitleBn, setGalTitleBn] = useState('');
  const [galCategoryBn, setGalCategoryBn] = useState('বসুন্ধরা জমি');
  const [galMediaType, setGalMediaType] = useState<'image' | 'video'>('image');
  const [galTheme, setGalTheme] = useState('gallery_3d_duplex_villa');
  const [galCaptionBn, setGalCaptionBn] = useState('');
  const [galDurationBn, setGalDurationBn] = useState('০৩:৪৫ মিনিট');

  // New Board Member Form
  const [bmName, setBmName] = useState('');
  const [bmDesignation, setBmDesignation] = useState('পরিচালক (প্রকৌশল ও পরিকল্পনা)');
  const [bmRoleKey] = useState('director');
  const [bmQual] = useState('বিএসসি ইঞ্জিনিয়ার, এমবিএ');
  const [bmExp] = useState('১৫+ বছরের রিয়েল এস্টেট অভিজ্ঞতা');
  const [bmQuote, setBmQuote] = useState('');
  const [bmMessage, setBmMessage] = useState('');
  const [bmPortrait, setBmPortrait] = useState('portrait_director_fin');

  useEffect(() => {
    setSystemMode(initialMode);
  }, [initialMode]);

  const loadErpData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/erp');
      const data = await res.json();
      setSettings(data.settings || null);
      setHeroSlides(data.heroSlides || []);
      setBoardMembers(data.boardMembers || []);
      setProjects(data.projects || []);
      setProperties(data.properties || []);
      setBookings(data.bookings || []);
      setPayments(data.payments || []);
      setErpTransactions(data.erpTransactions || []);
      setInquiries(data.inquiries || []);
      setGallery(data.gallery || []);
      setTestimonials(data.testimonials || []);
      setArticles(data.articles || []);
      setCustomers(data.customers || []);
      if (data.bookings && data.bookings.length > 0 && !mrBookingId) {
        setMrBookingId(String(data.bookings[0].id));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadErpData();
  }, []);

  const notify = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(''), 4500);
  };

  const accountingSummary = calculateErpAccountingSummary(erpTransactions, bookings);

  // Build MoneyReceiptData from a PaymentItem
  const openReceiptForPayment = (pay: PaymentItem) => {
    const booking = bookings.find((b) => b.id === pay.bookingId);
    const prop = booking ? properties.find((p) => p.id === booking.propertyId) : properties[0];
    setActiveReceipt({
      receiptNumber: pay.receiptNumber || `HH-MR-2026-0${pay.id}`,
      issueDate: pay.paidDate || pay.dueDate || '২০২৬-০৪-১০',
      customerName: booking?.customerName || 'সম্মানিত গ্রাহক (H & H Homes)',
      customerPhone: booking?.customerPhone || '+৮৮০ ১৭১১-২২৩৩৪৪',
      customerAddressBn: booking?.addressBn || 'ঢাকা, বাংলাদেশ',
      bookingNumber: booking?.bookingNumber || `HH-BK-${pay.bookingId}`,
      propertyTitleBn:
        prop?.titleBn || 'বসুন্ধরা গ্রিন টাউনশিপ — প্রিমিয়াম আবাসিক প্লট (বসুন্ধরা, ঢাকা)',
      propertyCode: prop?.propertyCode || 'HH-L-101',
      propertyLocationBn: prop?.locationBn || 'বসুন্ধরা আবাসিক এলাকা, ঢাকা',
      paymentTitleBn: pay.titleBn,
      amountBdt: pay.amountBdt,
      paymentMethodBn: pay.paymentMethodBn || 'ব্যাংক পে-অর্ডার / চেক',
      statusBn: 'পরিশোধিত',
    });
  };

  // Build MoneyReceiptData from a BookingItem
  const openReceiptForBooking = (b: BookingItem) => {
    const prop = properties.find((p) => p.id === b.propertyId);
    const relatedPaid = payments.find((p) => p.bookingId === b.id && p.statusBn === 'পরিশোধিত');
    setActiveReceipt({
      receiptNumber: relatedPaid?.receiptNumber || `HH-MR-BK-${b.id}`,
      issueDate: relatedPaid?.paidDate || b.createdAt,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      customerAddressBn: b.addressBn,
      bookingNumber: b.bookingNumber,
      propertyTitleBn: prop?.titleBn || 'এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ প্লট',
      propertyCode: prop?.propertyCode || 'HH-L-101',
      propertyLocationBn: prop?.locationBn || 'বসুন্ধরা আবাসিক এলাকা, ঢাকা',
      paymentTitleBn: relatedPaid?.titleBn || 'বুকিং মানি ও ডাউন পেমেন্ট রিসিট',
      amountBdt: relatedPaid?.amountBdt || b.bookingMoneyBdt,
      paymentMethodBn: relatedPaid?.paymentMethodBn || 'ব্যাংক পে-অর্ডার / চেক',
      totalPriceBdt: b.totalPriceBdt,
      totalPaidBdt: b.paidAmountBdt,
      dueAmountBdt: b.dueAmountBdt,
      statusBn: 'পরিশোধিত',
    });
  };

  // Build MoneyReceiptData from an ERP Voucher
  const openReceiptForVoucher = (tx: ErpTransactionItem) => {
    setActiveReceipt({
      receiptNumber: tx.voucherNo,
      issueDate: tx.transactionDate,
      customerName: tx.type === 'income' ? 'গ্রাহক / বিনিয়োগকারী জমা' : 'প্রজেক্ট ও অফিস ব্যয় ভাউচার',
      customerPhone: settings?.phone || '+৮৮০ ১৭১১-২২৩৩৪৪',
      customerAddressBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।',
      bookingNumber: tx.referenceNo || tx.voucherNo,
      propertyTitleBn: tx.projectNameBn,
      propertyCode: tx.categoryBn,
      propertyLocationBn:
        tx.projectNameBn.includes('বসুন্ধরা')
          ? 'বসুন্ধরা আবাসিক এলাকা, ঢাকা'
          : 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।',
      paymentTitleBn: tx.titleBn,
      amountBdt: tx.amountBdt,
      paymentMethodBn: tx.paymentMethodBn,
      referenceNo: tx.referenceNo,
      statusBn: 'পরিশোধিত',
    });
  };

  // Issue a new Money Receipt from Admin Panel
  const handleCreateMoneyReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mrTitleBn || !mrAmountBdt) return;
    const selectedBooking = bookings.find((b) => String(b.id) === mrBookingId);
    const prop = selectedBooking
      ? properties.find((p) => p.id === selectedBooking.propertyId)
      : properties[0];

    const res = await fetch('/api/admin/payments/receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: selectedBooking ? selectedBooking.id : 1,
        customerUid: selectedBooking ? selectedBooking.userUid : 'cust-demo-101',
        customerName: mrCustomerName || selectedBooking?.customerName || 'সম্মানিত গ্রাহক',
        installmentNo: Number(mrInstallmentNo) || 1,
        titleBn: mrTitleBn,
        amountBdt: Number(mrAmountBdt),
        paymentMethodBn: mrMethodBn,
        projectNameBn: prop?.locationBn?.includes('বসুন্ধরা')
          ? 'এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ'
          : 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const generatedNo = data.receiptNumber || data.receiptNo || `HH-MR-2026-${Date.now().toString().slice(-4)}`;
      notify(`নতুন মানি রিসিট (${generatedNo}) সফলভাবে তৈরি হয়েছে।`);
      await loadErpData();
      setActiveReceipt({
        receiptNumber: generatedNo,
        issueDate: new Date().toISOString().slice(0, 10),
        customerName: mrCustomerName || selectedBooking?.customerName || 'সম্মানিত গ্রাহক',
        customerPhone: mrCustomerPhone || selectedBooking?.customerPhone || '+৮৮০ ১৭১১-৮৮৯৯০০',
        customerAddressBn: selectedBooking?.addressBn || 'ঢাকা, বাংলাদেশ',
        bookingNumber: selectedBooking?.bookingNumber || 'HH-BK-2026-0101',
        propertyTitleBn:
          prop?.titleBn || 'বসুন্ধরা গ্রিন টাউনশিপ — দক্ষিণমুখী ভিআইপি প্লট (বসুন্ধরা, ঢাকা)',
        propertyCode: prop?.propertyCode || 'HH-L-101',
        propertyLocationBn: prop?.locationBn || 'বসুন্ধরা আবাসিক এলাকা, ঢাকা',
        paymentTitleBn: mrTitleBn,
        amountBdt: Number(mrAmountBdt),
        paymentMethodBn: mrMethodBn,
        statusBn: 'পরিশোধিত',
      });
    }
  };

  // Mark due installment as paid & open receipt immediately
  const handleMarkPaymentPaidAndOpenReceipt = async (pay: PaymentItem) => {
    const res = await fetch(`/api/portal/pay/${pay.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodBn: 'ব্যাংক পে-অর্ডার / ক্যাশ জমা' }),
    });
    if (res.ok) {
      notify('কিস্তি পরিশোধিত হিসেবে আপডেট হয়েছে এবং মানি রিসিট প্রস্তুত করা হয়েছে।');
      await loadErpData();
      openReceiptForPayment({
        ...pay,
        statusBn: 'পরিশোধিত',
        paidDate: new Date().toISOString().slice(0, 10),
      });
    }
  };

  const handleToggleWebVisibility = async (
    entity: 'project' | 'property' | 'board' | 'slide' | 'gallery',
    id: number,
    currentVal: number
  ) => {
    const nextVal = currentVal === 1 ? 0 : 1;
    const res = await fetch('/api/admin/toggle-web', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity, id, publishedOnWeb: nextVal }),
    });
    if (res.ok) {
      notify(
        nextVal === 1
          ? 'পাবলিক ওয়েবসাইটে প্রদর্শনের জন্য সক্রিয় করা হয়েছে।'
          : 'পাবলিক ওয়েবসাইট থেকে লুকানো হয়েছে।'
      );
      await loadErpData();
      onDataMutated();
    }
  };

  const handleBookingDecision = async (id: number, action: 'approve' | 'cancel') => {
    const res = await fetch(`/api/admin/bookings/${id}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      notify(
        action === 'approve'
          ? 'বুকিং অনুমোদিত হয়েছে এবং ইআরপি লেজারে ভাউচার যুক্ত হয়েছে।'
          : 'বুকিং বাতিল করা হয়েছে।'
      );
      await loadErpData();
      onDataMutated();
    }
  };

  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle || !txAmount) return;
    const res = await fetch('/api/admin/erp/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: txType,
        categoryBn: txCategory,
        projectNameBn: txProjectName,
        titleBn: txTitle,
        amountBdt: Number(txAmount),
        paymentMethodBn: txMethod,
        referenceNo: txRef,
        notesBn: txNotes,
      }),
    });
    if (res.ok) {
      setTxTitle('');
      setTxAmount('');
      setTxRef('');
      setTxNotes('');
      notify('নতুন ফিন্যান্সিয়াল ভাউচার সফলভাবে ইআরপি লেজারে সংরক্ষিত হয়েছে।');
      await loadErpData();
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nameBn: projNameBn,
        categoryBn: projCategoryBn,
        statusBn: projStatusBn,
        areaBn: projAreaBn,
        locationBn: projLocationBn,
        sizeSummaryBn: projSizeBn,
        priceSummaryBn: projPriceBn,
        descriptionBn: projDescBn,
        totalBudgetBdt: Number(projBudget),
        imageType: projTheme,
        publishedOnWeb: 1,
      }),
    });
    if (res.ok) {
      setProjNameBn('');
      setProjDescBn('');
      notify('নতুন প্রজেক্ট মাস্টার ডাটাবেসে যোগ হয়েছে।');
      await loadErpData();
      onDataMutated();
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyCode: propCode,
        titleBn: propTitleBn,
        propertyType: propType,
        categoryBn: propCategoryBn,
        areaBn: propAreaBn,
        locationBn: propLocationBn,
        blockNo: propBlockNo,
        plotNo: propPlotNo,
        sizeBn: propSizeBn,
        priceBdt: Number(propPriceBdt),
        priceDisplayBn: propPriceDisplayBn,
        bookingAmountBdt: Number(propBookingBdt),
        bookingDisplayBn: propBookingDisplayBn,
        imageType: propTheme,
        publishedOnWeb: 1,
      }),
    });
    if (res.ok) {
      setPropCode('');
      setPropTitleBn('');
      notify('নতুন প্রপার্টি ইআরপি ইনভেন্টরিতে যোগ হয়েছে।');
      await loadErpData();
      onDataMutated();
    }
  };

  const handleSavePropertyEdit = async (prop: PropertyItem) => {
    const res = await fetch(`/api/admin/properties/${prop.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...prop,
        titleBn: editingPropTitle,
        locationBn: editingPropLocation,
        priceDisplayBn: editingPropPriceDisplay,
      }),
    });
    if (res.ok) {
      setEditingPropId(null);
      notify('প্রপার্টির তথ্য সফলভাবে আপডেট হয়েছে।');
      await loadErpData();
      onDataMutated();
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitle) return;
    const res = await fetch('/api/admin/slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        badgeBn: slideBadge,
        titleBn: slideTitle,
        subtitleBn: slideSubtitle,
        highlightStatsBn: slideStats,
        visualTheme: slideTheme,
      }),
    });
    if (res.ok) {
      setSlideTitle('');
      setSlideSubtitle('');
      notify('নতুন ব্যানার স্লাইড পাবলিক ওয়েবসাইটে যুক্ত হয়েছে।');
      await loadErpData();
      onDataMutated();
    }
  };

  const handleSaveSlideEdit = async (slide: HeroSlideItem) => {
    const res = await fetch(`/api/admin/slides/${slide.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...slide,
        titleBn: editingSlideTitle,
        visualTheme: editingSlideTheme,
      }),
    });
    if (res.ok) {
      setEditingSlideId(null);
      notify('ব্যানার স্লাইডের প্রকল্প নাম ও ছবি আপডেট হয়েছে।');
      await loadErpData();
      onDataMutated();
    }
  };

  const handleDeleteSlide = async (id: number) => {
    const res = await fetch(`/api/admin/slides/${id}`, { method: 'DELETE' });
    if (res.ok) {
      notify('ব্যানার স্লাইড মুছে ফেলা হয়েছে।');
      await loadErpData();
      onDataMutated();
    }
  };

  const handleAddBoardMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmName) return;
    const res = await fetch('/api/admin/board', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nameBn: bmName,
        designationBn: bmDesignation,
        roleKey: bmRoleKey,
        qualificationBn: bmQual,
        experienceBn: bmExp,
        quoteBn: bmQuote,
        messageBn: bmMessage,
        portraitTheme: bmPortrait,
        publishedOnWeb: 1,
      }),
    });
    if (res.ok) {
      setBmName('');
      setBmQuote('');
      setBmMessage('');
      notify('পরিচালনা পর্ষদের নতুন সদস্য যুক্ত হয়েছে।');
      await loadErpData();
      onDataMutated();
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titleBn: galTitleBn,
        categoryBn: galCategoryBn,
        mediaType: galMediaType,
        visualTheme: galTheme,
        captionBn: galCaptionBn,
        durationBn: galDurationBn,
      }),
    });
    if (res.ok) {
      setGalTitleBn('');
      setGalCaptionBn('');
      notify('গ্যালারি আইটেম সংরক্ষিত হয়েছে।');
      await loadErpData();
      onDataMutated();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      notify('পাবলিক ওয়েবসাইটের কনটেন্ট ও ঠিকানা সফলভাবে আপডেট হয়েছে।');
      await loadErpData();
      onDataMutated();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#0B162C] flex flex-col pb-16 lg:pb-0">
      {/* Top Dual-System Switcher Bar — Compact on Mobile */}
      <div className="sticky top-0 z-40 bg-[#071120] text-white border-b-2 border-[#C6A15B] px-3 sm:px-6 md:px-8 py-2.5 sm:py-4 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 shadow-md no-print">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-[#C6A15B] text-[#FDE68A] hover:text-[#0B162C] font-extrabold text-xs sm:text-sm transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">পাবলিক ওয়েবসাইটে ফিরুন</span>
            <span className="sm:hidden">হোমপেজ</span>
          </button>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold text-[#34D399] block truncate">
              H &amp; H Homes · রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা
            </span>
            <h1 className="text-sm sm:text-lg md:text-xl font-extrabold text-white truncate">
              {systemMode === 'realestate_erp'
                ? 'প্যানেল ১: ইআরপি, মানি রিসিট ও একাউন্টিং'
                : 'প্যানেল ২: পাবলিক ওয়েবসাইট কন্ট্রোল ও সিএমএস'}
            </h1>
          </div>
        </div>

        {/* Switch Between the 2 Admin Panels */}
        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2 bg-[#101C32] p-1 sm:p-1.5 rounded-2xl border border-[#C6A15B]/40 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSystemMode('realestate_erp')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
              systemMode === 'realestate_erp'
                ? 'bg-[#059669] text-white shadow-lg'
                : 'text-white/75 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">১. ইআরপি ও রিসিট</span>
          </button>
          <button
            type="button"
            onClick={() => setSystemMode('website_cms')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
              systemMode === 'website_cms'
                ? 'bg-[#C6A15B] text-[#0B162C] shadow-lg'
                : 'text-white/75 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">২. ওয়েবসাইট কন্ট্রোল</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar Navigation — Horizontal Swipeable Bar on Mobile (< lg), Vertical Sidebar on Desktop (lg+) */}
        <aside
          className={`w-full lg:w-72 text-white shrink-0 border-b lg:border-b-0 lg:border-r no-print ${
            systemMode === 'realestate_erp'
              ? 'bg-[#062E26] border-emerald-500/30'
              : 'bg-[#0B162C] border-[#C6A15B]/30'
          }`}
        >
          {systemMode === 'realestate_erp' ? (
            <nav className="p-2.5 lg:p-3 flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar">
              {(
                [
                  { label: 'মানি রিসিট ও কিস্তি আদায়', icon: Receipt },
                  { label: 'হিসাবরক্ষণ ও লেজার', icon: Calculator },
                  { label: 'বুকিং অনুমোদন ও কিস্তি', icon: BookmarkCheck },
                  { label: 'মাস্টার প্রজেক্ট এন্ট্রি', icon: Building2 },
                  { label: 'মাস্টার প্রপার্টি ইনভেন্টরি', icon: Home },
                  { label: 'পরিচালনা পর্ষদ ডাটাবেস', icon: Users },
                  { label: 'নিবন্ধিত গ্রাহক তালিকা', icon: FileText },
                ] as { label: ErpTab; icon: any }[]
              ).map((item) => {
                const Icon = item.icon;
                const active = erpTab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => setErpTab(item.label)}
                    className={`lg:w-full flex items-center gap-2 lg:gap-3 px-3.5 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-extrabold whitespace-nowrap shrink-0 transition-all text-left cursor-pointer ${
                      active
                        ? 'bg-[#10B981] text-[#042F2E] shadow-md'
                        : 'bg-white/5 lg:bg-transparent text-white/85 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          ) : (
            <nav className="p-2.5 lg:p-3 flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar">
              {(
                [
                  { label: 'ইআরপি ডাটা সিলেকশন', icon: Globe },
                  { label: 'ব্যানার ও প্রজেক্ট স্লাইডার', icon: Presentation },
                  { label: 'চেয়ারম্যান ও পরিচালনা পর্ষদ', icon: Users },
                  { label: 'ছবি ও ভিডিও গ্যালারি', icon: Video },
                  { label: 'কাস্টমার রিভিউ', icon: MessageSquareQuote },
                  { label: 'সাইট সেটিংস ও যোগাযোগ', icon: Settings },
                ] as { label: WebCmsTab; icon: any }[]
              ).map((item) => {
                const Icon = item.icon;
                const active = webTab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => setWebTab(item.label)}
                    className={`lg:w-full flex items-center gap-2 lg:gap-3 px-3.5 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-extrabold whitespace-nowrap shrink-0 transition-all text-left cursor-pointer ${
                      active
                        ? 'bg-[#C6A15B] text-[#0B162C] shadow-md'
                        : 'bg-white/5 lg:bg-transparent text-white/85 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-8 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
          {statusBanner && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              {statusBanner}
            </div>
          )}

          {loading ? (
            <div className="bg-white p-12 rounded-2xl text-center font-bold text-base">
              সিস্টেম ডাটাবেস লোড হচ্ছে...
            </div>
          ) : (
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#0B162C]/15 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                <span className="text-xs sm:text-sm font-extrabold text-[#0B162C]">
                  দ্রুত প্রকল্প ভিউ ({toBengaliDigits(projects.length)}টি প্রকল্প · {toBengaliDigits(properties.length)}টি প্রপার্টি):
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar max-w-full pb-0.5">
                {projects.slice(0, 4).map((proj) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => setAdminViewerTarget({ type: 'project', project: proj })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0B162C] text-[#0B162C] hover:text-[#FDE68A] text-xs font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{proj.nameBn}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSystemMode('realestate_erp');
                    setErpTab('মাস্টার প্রজেক্ট এন্ট্রি');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>সকল প্রকল্প তালিকা</span>
                </button>
              </div>
            </div>
          )}

          {loading ? null : systemMode === 'realestate_erp' ? (
            <>
              {/* TAB 1: MONEY RECEIPT & INSTALLMENT COLLECTION */}
              {erpTab === 'মানি রিসিট ও কিস্তি আদায়' && (
                <div className="space-y-6">
                  {/* Issue New Official Money Receipt Form */}
                  <form
                    onSubmit={handleCreateMoneyReceipt}
                    className="bg-white p-6 rounded-2xl border-2 border-emerald-600/25 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-xs font-extrabold uppercase text-emerald-700">
                          H &amp; H Homes অফিশিয়াল পেমেন্ট রিসিট জেনারেটর
                        </span>
                        <h3 className="text-xl font-extrabold text-[#0B162C]">
                          নতুন মানি রিসিট ইস্যু ও ডাউনলোড করুন
                        </h3>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900">
                        বসুন্ধরা প্লট ও বনশ্রী ফ্ল্যাট কালেকশন
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          বুকিং ফাইল নির্বাচন করুন
                        </label>
                        <select
                          value={mrBookingId}
                          onChange={(e) => {
                            setMrBookingId(e.target.value);
                            const found = bookings.find((b) => String(b.id) === e.target.value);
                            if (found) {
                              setMrCustomerName(found.customerName);
                              setMrCustomerPhone(found.customerPhone);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                        >
                          {bookings.map((b) => (
                            <option key={b.id} value={String(b.id)}>
                              {b.bookingNumber} — {b.customerName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          গ্রাহকের নাম *
                        </label>
                        <input
                          type="text"
                          required
                          value={mrCustomerName}
                          onChange={(e) => setMrCustomerName(e.target.value)}
                          placeholder="যেমন: আলহাজ্ব মো: রফিকুল ইসলাম"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          মোবাইল নম্বর
                        </label>
                        <input
                          type="text"
                          value={mrCustomerPhone}
                          onChange={(e) => setMrCustomerPhone(e.target.value)}
                          placeholder="+৮৮০ ১৭১১-৮৮৯৯০০"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          রিসিটের বিবরণ (খাত) *
                        </label>
                        <input
                          type="text"
                          required
                          value={mrTitleBn}
                          onChange={(e) => setMrTitleBn(e.target.value)}
                          placeholder="যেমন: বুকিং মানি / ২য় কিস্তি আদায়"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          টাকার পরিমাণ (BDT) *
                        </label>
                        <input
                          type="number"
                          required
                          value={mrAmountBdt}
                          onChange={(e) => setMrAmountBdt(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          পেমেন্ট মাধ্যম
                        </label>
                        <select
                          value={mrMethodBn}
                          onChange={(e) => setMrMethodBn(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                        >
                          <option value="ব্যাংক পে-অর্ডার / চেক">ব্যাংক পে-অর্ডার / চেক</option>
                          <option value="অনলাইন ব্যাংকিং (RTGS/BEFTN)">অনলাইন ব্যাংকিং (RTGS/BEFTN)</option>
                          <option value="ক্যাশ / নগদ জমা (বনশ্রী অফিস)">ক্যাশ / নগদ জমা (বনশ্রী অফিস)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                      মানি রিসিট তৈরি ও প্রিন্ট/ডাউনলোড করুন
                    </button>
                  </form>

                  {/* All Customer Payments & Money Receipts Table */}
                  <div className="bg-white p-6 rounded-2xl border border-[#0B162C]/15 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xl font-extrabold text-[#0B162C]">
                        সকল মানি রিসিট ও কিস্তির তালিকা ({toBengaliDigits(payments.length)})
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b-2 border-[#0B162C]/15 text-[#0B162C]/70 font-bold">
                            <th className="py-3 px-3">রিসিট নং</th>
                            <th className="py-3 px-3">গ্রাহক ও বুকিং</th>
                            <th className="py-3 px-3">কিস্তির বিবরণ</th>
                            <th className="py-3 px-3">পরিমাণ</th>
                            <th className="py-3 px-3">স্ট্যাটাস</th>
                            <th className="py-3 px-3 text-right">মানি রিসিট অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0B162C]/10">
                          {payments.map((pay) => {
                            const b = bookings.find((item) => item.id === pay.bookingId);
                            return (
                              <tr key={pay.id} className="hover:bg-slate-50">
                                <td className="py-3.5 px-3 font-mono font-bold text-xs">
                                  {pay.receiptNumber}
                                </td>
                                <td className="py-3.5 px-3">
                                  <p className="font-bold text-[#0B162C]">
                                    {b?.customerName || 'গ্রাহক'}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    বুকিং: {b?.bookingNumber || `#${pay.bookingId}`}
                                  </p>
                                </td>
                                <td className="py-3.5 px-3">
                                  <p className="font-semibold">{pay.titleBn}</p>
                                  <p className="text-xs text-slate-500">
                                    তারিখ: {toBengaliDigits(pay.paidDate || pay.dueDate)}
                                  </p>
                                </td>
                                <td className="py-3.5 px-3 font-extrabold tabular-nums-bn">
                                  {formatExactBdtBengali(pay.amountBdt)}
                                </td>
                                <td className="py-3.5 px-3">
                                  <span
                                    className={`px-2.5 py-1 rounded text-xs font-extrabold ${
                                      pay.statusBn === 'পরিশোধিত'
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : 'bg-amber-100 text-amber-900'
                                    }`}
                                  >
                                    {pay.statusBn}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-right">
                                  {pay.statusBn === 'পরিশোধিত' ? (
                                    <button
                                      type="button"
                                      onClick={() => openReceiptForPayment(pay)}
                                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B162C] hover:bg-emerald-700 text-[#FDE68A] hover:text-white text-xs font-extrabold transition-colors cursor-pointer"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      মানি রিসিট বের করুন
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleMarkPaymentPaidAndOpenReceipt(pay)}
                                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors cursor-pointer"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      জমা নিন ও রিসিট বের করুন
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ACCOUNTING & LEDGER */}
              {erpTab === 'হিসাবরক্ষণ ও লেজার' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/30 shadow-sm">
                      <div className="flex items-center justify-between text-emerald-700">
                        <span className="text-xs font-bold">মোট আদায় ও আয়</span>
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <p className="text-xl font-extrabold text-emerald-800 mt-2 tabular-nums-bn">
                        {formatExactBdtBengali(accountingSummary.totalIncomeBdt)}
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border-2 border-rose-500/30 shadow-sm">
                      <div className="flex items-center justify-between text-rose-700">
                        <span className="text-xs font-bold">মোট নির্মাণ ও ভূমি ব্যয়</span>
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <p className="text-xl font-extrabold text-rose-800 mt-2 tabular-nums-bn">
                        {formatExactBdtBengali(accountingSummary.totalExpenseBdt)}
                      </p>
                    </div>

                    <div className="bg-[#062E26] text-white p-5 rounded-2xl border-2 border-[#34D399]/50 shadow-sm">
                      <div className="flex items-center justify-between text-[#6EE7B7]">
                        <span className="text-xs font-bold">নিট ক্যাশ ব্যালেন্স</span>
                        <Wallet className="w-4 h-4" />
                      </div>
                      <p className="text-xl font-extrabold text-white mt-2 tabular-nums-bn">
                        {formatExactBdtBengali(accountingSummary.netBalanceBdt)}
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#0B162C]/15 shadow-sm">
                      <span className="text-xs font-bold text-[#0B162C]/70 block">
                        বুকিং চুক্তিমূল্য
                      </span>
                      <p className="text-xl font-extrabold text-[#0B162C] mt-2 tabular-nums-bn">
                        {formatExactBdtBengali(accountingSummary.totalBookingContractBdt)}
                      </p>
                    </div>

                    <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-400/50 shadow-sm">
                      <span className="text-xs font-bold text-amber-900 block">
                        গ্রাহকদের কাছে বকেয়া
                      </span>
                      <p className="text-xl font-extrabold text-amber-800 mt-2 tabular-nums-bn">
                        {formatExactBdtBengali(accountingSummary.totalReceivableBdt)}
                      </p>
                    </div>
                  </div>

                  {/* New Voucher Entry Form */}
                  <form
                    onSubmit={handleAddVoucher}
                    className="bg-white p-6 rounded-2xl border border-[#0B162C]/15 shadow-sm space-y-4"
                  >
                    <h3 className="text-lg font-extrabold text-[#0B162C]">
                      নতুন আয় / ব্যয় ভাউচার এন্ট্রি (ERP Cashbook)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">লেনদেনের ধরন *</label>
                        <select
                          value={txType}
                          onChange={(e) => setTxType(e.target.value as 'income' | 'expense')}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 font-bold text-sm"
                        >
                          <option value="income">আয় / জমা (Credit)</option>
                          <option value="expense">ব্যয় / খরচ (Debit)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">হিসাবের খাত *</label>
                        <select
                          value={txCategory}
                          onChange={(e) => setTxCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        >
                          <option value="বুকিং ও কিস্তি আদায়">বুকিং ও কিস্তি আদায়</option>
                          <option value="কমার্শিয়াল স্পেস বিক্রি আদায়">কমার্শিয়াল স্পেস বিক্রি আদায়</option>
                          <option value="ভূমি অধিগ্রহণ ও বালি ভরাট ব্যয়">ভূমি অধিগ্রহণ ও বালি ভরাট ব্যয়</option>
                          <option value="নির্মাণ সামগ্রী (রড, সিমেন্ট ও পাথর)">নির্মাণ সামগ্রী (রড, সিমেন্ট ও পাথর)</option>
                          <option value="অফিস বেতন ও প্রশাসনিক ব্যয়">অফিস বেতন ও প্রশাসনিক ব্যয়</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">সংশ্লিষ্ট প্রজেক্ট</label>
                        <select
                          value={txProjectName}
                          onChange={(e) => setTxProjectName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        >
                          {projects.map((p) => (
                            <option key={p.id} value={p.nameBn}>
                              {p.nameBn}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">টাকার পরিমাণ (BDT) *</label>
                        <input
                          type="number"
                          required
                          value={txAmount}
                          onChange={(e) => setTxAmount(e.target.value)}
                          placeholder="1500000"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold mb-1">ভাউচারের বিবরণ *</label>
                        <input
                          type="text"
                          required
                          value={txTitle}
                          onChange={(e) => setTxTitle(e.target.value)}
                          placeholder="বসুন্ধরা আবাসিক প্রকল্পের প্লট উন্নয়ন বাবদ বিল"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">চেক / রেফারেন্স নং</label>
                        <input
                          type="text"
                          value={txRef}
                          onChange={(e) => setTxRef(e.target.value)}
                          placeholder="CHK-88412"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-sm cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      লেজারে ভাউচার সংরক্ষণ করুন
                    </button>
                  </form>

                  {/* Full Ledger Table */}
                  <div className="bg-white p-6 rounded-2xl border border-[#0B162C]/15 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-extrabold text-[#0B162C]">
                        কর্পোরেট একাউন্টিং লেজার ও ভাউচার স্টেটমেন্ট ({toBengaliDigits(erpTransactions.length)})
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b-2 border-[#0B162C]/15 text-[#0B162C]/70 font-bold">
                            <th className="py-3 px-3">ভাউচার নং ও তারিখ</th>
                            <th className="py-3 px-3">খাত ও প্রজেক্ট</th>
                            <th className="py-3 px-3">বিবরণ</th>
                            <th className="py-3 px-3 text-right">টাকার পরিমাণ</th>
                            <th className="py-3 px-3 text-right">রিসিট</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0B162C]/10">
                          {erpTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-[#F8F6F0]/70">
                              <td className="py-3 px-3">
                                <span className="font-mono font-bold text-xs block">{tx.voucherNo}</span>
                                <span className="text-xs text-[#0B162C]/60">
                                  {toBengaliDigits(tx.transactionDate)}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold block">{tx.categoryBn}</span>
                                <span className="text-xs text-[#059669] font-semibold">
                                  {tx.projectNameBn}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <p className="font-semibold text-[#0B162C]">{tx.titleBn}</p>
                                <p className="text-xs text-[#0B162C]/60">
                                  মাধ্যম: {tx.paymentMethodBn}
                                </p>
                              </td>
                              <td
                                className={`py-3 px-3 text-right font-extrabold tabular-nums-bn ${
                                  tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {tx.type === 'income' ? '+' : '-'}{' '}
                                {formatExactBdtBengali(tx.amountBdt)}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => openReceiptForVoucher(tx)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0B162C] text-[#0B162C] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  রিসিট
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BOOKINGS */}
              {erpTab === 'বুকিং অনুমোদন ও কিস্তি' && (
                <div className="bg-white rounded-2xl p-6 border border-[#0B162C]/15 shadow-sm space-y-4">
                  <h3 className="text-lg font-extrabold text-[#0B162C]">
                    গ্রাহক প্রপার্টি বুকিং অনুমোদন, প্রজেক্ট ভিউ ও মানি রিসিট ({toBengaliDigits(bookings.length)})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#0B162C]/10 text-[#0B162C]/65 font-bold">
                          <th className="py-3 px-3">বুকিং নম্বর</th>
                          <th className="py-3 px-3">গ্রাহকের নাম ও ফোন</th>
                          <th className="py-3 px-3">বরাদ্দকৃত প্রপার্টি</th>
                          <th className="py-3 px-3">মূল্য ও প্ল্যান</th>
                          <th className="py-3 px-3">স্ট্যাটাস</th>
                          <th className="py-3 px-3 text-right">সিদ্ধান্ত, ভিউ ও মানি রিসিট</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0B162C]/10">
                        {bookings.map((b) => {
                          const bookedProp =
                            properties.find((p) => p.id === b.propertyId) || properties[0];
                          return (
                            <tr key={b.id}>
                              <td className="py-3.5 px-3 font-mono font-bold">{b.bookingNumber}</td>
                              <td className="py-3.5 px-3">
                                <p className="font-bold">{b.customerName}</p>
                                <p className="text-xs text-[#0B162C]/65">{b.customerPhone}</p>
                              </td>
                              <td className="py-3.5 px-3">
                                <p className="font-extrabold text-[#0B162C]">
                                  {bookedProp?.titleBn || `প্রপার্টি #${b.propertyId}`}
                                </p>
                                <p className="text-xs text-emerald-700 font-bold">
                                  {bookedProp?.propertyCode} · {bookedProp?.sizeBn}
                                </p>
                              </td>
                              <td className="py-3.5 px-3">
                                <p className="font-bold">{formatExactBdtBengali(b.totalPriceBdt)}</p>
                                <p className="text-xs text-[#0B162C]/65">{b.paymentPlanChoice}</p>
                              </td>
                              <td className="py-3.5 px-3">
                                <span
                                  className={`px-2.5 py-1 rounded text-xs font-bold ${
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
                              <td className="py-3.5 px-3 text-right space-x-1.5">
                                {bookedProp && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAdminViewerTarget({
                                        type: 'property',
                                        property: bookedProp,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0B162C] text-xs font-extrabold cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    প্রপার্টি ভিউ
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => openReceiptForBooking(b)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B162C] text-[#FDE68A] text-xs font-bold hover:bg-emerald-700 hover:text-white cursor-pointer"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  বুকিং রিসিট
                                </button>
                                {b.statusBn !== 'অনুমোদিত' && (
                                  <button
                                    onClick={() => handleBookingDecision(b.id, 'approve')}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    অনুমোদন
                                  </button>
                                )}
                                {b.statusBn !== 'বাতিল' && (
                                  <button
                                    onClick={() => handleBookingDecision(b.id, 'cancel')}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 cursor-pointer"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    বাতিল
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: PROJECTS */}
              {erpTab === 'মাস্টার প্রজেক্ট এন্ট্রি' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleAddProject}
                    className="bg-white rounded-2xl p-6 border border-[#0B162C]/15 shadow-sm space-y-4"
                  >
                    <h3 className="text-lg font-extrabold text-[#0B162C]">
                      মাস্টার সিস্টেমে নতুন প্রজেক্ট এন্ট্রি করুন
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">প্রজেক্টের নাম *</label>
                        <input
                          type="text"
                          required
                          value={projNameBn}
                          onChange={(e) => setProjNameBn(e.target.value)}
                          placeholder="এইচ অ্যান্ড এইচ বসুন্ধরা সাউথ ভিউ"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">ধরন</label>
                        <select
                          value={projCategoryBn}
                          onChange={(e) => setProjCategoryBn(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        >
                          <option value="আবাসিক জমি">আবাসিক জমি (বসুন্ধরা)</option>
                          <option value="ফ্ল্যাট">ফ্ল্যাট (বনশ্রী)</option>
                          <option value="কমার্শিয়াল স্পেস">কমার্শিয়াল স্পেস</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">ছবির থিম</label>
                        <select
                          value={projTheme}
                          onChange={(e) => setProjTheme(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        >
                          <option value="project_3d_township">বসুন্ধরা আবাসিক প্লট</option>
                          <option value="project_3d_twin_towers">সিগনেচার অ্যাপার্টমেন্ট টাওয়ার</option>
                          <option value="project_3d_commercial_tower">কমার্শিয়াল গ্লাস টাওয়ার</option>
                          <option value="project_3d_palace_residency">লাক্সারি কন্ডোমিনিয়াম</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">এলাকা *</label>
                        <input
                          type="text"
                          required
                          value={projAreaBn}
                          onChange={(e) => setProjAreaBn(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">বিস্তারিত অবস্থান *</label>
                        <input
                          type="text"
                          required
                          value={projLocationBn}
                          onChange={(e) => setProjLocationBn(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">বাজেট (BDT)</label>
                        <input
                          type="number"
                          value={projBudget}
                          onChange={(e) => setProjBudget(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] text-white font-extrabold text-sm cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      প্রজেক্ট সংরক্ষণ করুন
                    </button>
                  </form>

                  <div className="bg-white rounded-2xl p-6 border border-[#0B162C]/15 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="font-extrabold text-base text-[#0B162C]">
                        সিস্টেমে নিবন্ধিত সকল প্রজেক্ট তালিকা ও বিস্তারিত ভিউ ({toBengaliDigits(projects.length)})
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={adminSearchQuery}
                            onChange={(e) => setAdminSearchQuery(e.target.value)}
                            placeholder="প্রকল্প খুঁজুন..."
                            className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setAdminListMode('list')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer ${
                              adminListMode === 'list'
                                ? 'bg-[#0B162C] text-[#FDE68A]'
                                : 'text-slate-600'
                            }`}
                          >
                            <List className="w-3.5 h-3.5" />
                            তালিকা
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminListMode('grid')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer ${
                              adminListMode === 'grid'
                                ? 'bg-[#0B162C] text-[#FDE68A]'
                                : 'text-slate-600'
                            }`}
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            কার্ড
                          </button>
                        </div>
                      </div>
                    </div>

                    {adminListMode === 'list' ? (
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-[#0B162C] text-white">
                              <th className="py-3 px-4 font-bold">প্রকল্পের নাম</th>
                              <th className="py-3 px-4 font-bold">ধরন ও স্ট্যাটাস</th>
                              <th className="py-3 px-4 font-bold">অবস্থান</th>
                              <th className="py-3 px-4 font-bold">বাজেট / মূল্য</th>
                              <th className="py-3 px-4 font-bold text-right">প্রকল্প ভিউ ও কন্ট্রোল</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {projects
                              .filter(
                                (p) =>
                                  !adminSearchQuery.trim() ||
                                  p.nameBn.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                                  p.locationBn.toLowerCase().includes(adminSearchQuery.toLowerCase())
                              )
                              .map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                  <td className="py-3.5 px-4 font-extrabold text-[#0B162C]">
                                    {p.nameBn}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-bold mr-1">
                                      {p.categoryBn}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-xs font-extrabold">
                                      {p.statusBn}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-xs text-slate-600">
                                    {p.locationBn} ({p.areaBn})
                                  </td>
                                  <td className="py-3.5 px-4 text-xs font-bold text-[#0B162C]">
                                    {p.priceSummaryBn}
                                  </td>
                                  <td className="py-3.5 px-4 text-right space-x-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAdminViewerTarget({ type: 'project', project: p })
                                      }
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B162C] hover:bg-emerald-700 text-[#FDE68A] hover:text-white text-xs font-extrabold cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      প্রকল্প ভিউ
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleWebVisibility('project', p.id, p.publishedOnWeb)
                                      }
                                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                                        p.publishedOnWeb === 1
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-gray-300 text-gray-800'
                                      }`}
                                    >
                                      {p.publishedOnWeb === 1 ? 'ওয়েবসাইটে লাইভ' : 'লুকানো'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map((p) => (
                          <div
                            key={p.id}
                            className="p-4 rounded-xl bg-[#F8F6F0] border border-[#0B162C]/10 flex items-center justify-between gap-4"
                          >
                            <div>
                              <p className="font-extrabold text-sm">{p.nameBn}</p>
                              <p className="text-xs text-[#0B162C]/65">
                                {p.categoryBn} · {p.locationBn}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setAdminViewerTarget({ type: 'project', project: p })
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B162C] text-[#FDE68A] text-xs font-extrabold cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                ভিউ
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleWebVisibility('project', p.id, p.publishedOnWeb)
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                                  p.publishedOnWeb === 1
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-300 text-gray-800'
                                }`}
                              >
                                {p.publishedOnWeb === 1 ? 'ওয়েবসাইটে লাইভ' : 'লুকানো'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: PROPERTIES */}
              {erpTab === 'মাস্টার প্রপার্টি ইনভেন্টরি' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleAddProperty}
                    className="bg-white rounded-2xl p-6 border border-[#0B162C]/15 shadow-sm space-y-4"
                  >
                    <h3 className="text-lg font-extrabold text-[#0B162C]">
                      নতুন প্রপার্টি (বসুন্ধরা জমি বা বনশ্রী ফ্ল্যাট) যোগ করুন
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">প্রপার্টি শিরোনাম *</label>
                        <input
                          type="text"
                          required
                          value={propTitleBn}
                          onChange={(e) => setPropTitleBn(e.target.value)}
                          placeholder="বসুন্ধরা ব্লক-এন — ৫ কাঠা দক্ষিণমুখী প্লট"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">প্রপার্টি কোড</label>
                        <input
                          type="text"
                          value={propCode}
                          onChange={(e) => setPropCode(e.target.value)}
                          placeholder="HH-L-109"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">প্রপার্টির ধরন</label>
                        <select
                          value={propType}
                          onChange={(e) => {
                            const val = e.target.value as 'land' | 'apartment';
                            setPropType(val);
                            if (val === 'land') {
                              setPropCategoryBn('আবাসিক জমি');
                              setPropAreaBn('বসুন্ধরা আবাসিক এলাকা, ঢাকা');
                              setPropLocationBn('ব্লক-এন, বসুন্ধরা আবাসিক এলাকা, ঢাকা');
                            } else {
                              setPropCategoryBn('ফ্ল্যাট');
                              setPropAreaBn('বনশ্রী, ব্লক-সি, ঢাকা');
                              setPropLocationBn('রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা');
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        >
                          <option value="land">জমি / প্লট (বসুন্ধরা)</option>
                          <option value="apartment">ফ্ল্যাট / অ্যাপার্টমেন্ট (বনশ্রী)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">এলাকা *</label>
                        <input
                          type="text"
                          required
                          value={propAreaBn}
                          onChange={(e) => setPropAreaBn(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">বিস্তারিত ঠিকানা *</label>
                        <input
                          type="text"
                          required
                          value={propLocationBn}
                          onChange={(e) => setPropLocationBn(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">আকার *</label>
                        <input
                          type="text"
                          required
                          value={propSizeBn}
                          onChange={(e) => setPropSizeBn(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">মোট মূল্য (BDT) *</label>
                        <input
                          type="number"
                          required
                          value={propPriceBdt}
                          onChange={(e) => setPropPriceBdt(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">মূল্য প্রদর্শন (বাংলায়) *</label>
                        <input
                          type="text"
                          required
                          value={propPriceDisplayBn}
                          onChange={(e) => setPropPriceDisplayBn(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">বুকিং মানি প্রদর্শন *</label>
                        <input
                          type="text"
                          required
                          value={propBookingDisplayBn}
                          onChange={(e) => setPropBookingDisplayBn(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] text-white font-extrabold text-sm cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      প্রপার্টি ইনভেন্টরিতে যোগ করুন
                    </button>
                  </form>

                  {/* Property List with Inline Edit & Detail View */}
                  <div className="bg-white rounded-2xl p-6 border border-[#0B162C]/15 shadow-sm space-y-4">
                    <h4 className="font-extrabold text-base">
                      সকল জমি ও ফ্ল্যাট তালিকা, বিস্তারিত ভিউ এবং সরাসরি এডিট ({toBengaliDigits(properties.length)})
                    </h4>
                    <div className="space-y-3">
                      {properties.map((prop) => (
                        <div
                          key={prop.id}
                          className="p-4 rounded-xl bg-[#F8F6F0] border border-[#0B162C]/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {editingPropId === prop.id ? (
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <input
                                type="text"
                                value={editingPropTitle}
                                onChange={(e) => setEditingPropTitle(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-bold"
                              />
                              <input
                                type="text"
                                value={editingPropLocation}
                                onChange={(e) => setEditingPropLocation(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                              />
                              <input
                                type="text"
                                value={editingPropPriceDisplay}
                                onChange={(e) => setEditingPropPriceDisplay(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-bold"
                              />
                            </div>
                          ) : (
                            <div>
                              <span className="text-xs font-mono font-bold text-emerald-700">
                                {prop.propertyCode} · {prop.areaBn}
                              </span>
                              <p className="font-extrabold text-sm text-[#0B162C]">{prop.titleBn}</p>
                              <p className="text-xs text-slate-600">
                                {prop.locationBn} · {prop.sizeBn} · {prop.priceDisplayBn}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setAdminViewerTarget({ type: 'property', property: prop })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B162C] text-[#FDE68A] text-xs font-extrabold cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              বিস্তারিত ভিউ
                            </button>
                            {editingPropId === prop.id ? (
                              <button
                                type="button"
                                onClick={() => handleSavePropertyEdit(prop)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                সেভ করুন
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPropId(prop.id);
                                  setEditingPropTitle(prop.titleBn);
                                  setEditingPropLocation(prop.locationBn);
                                  setEditingPropPriceDisplay(prop.priceDisplayBn);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                এডিট
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: BOARD MEMBERS */}
              {erpTab === 'পরিচালনা পর্ষদ ডাটাবেস' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleAddBoardMember}
                    className="bg-white rounded-2xl p-6 border border-[#0B162C]/15 shadow-sm space-y-4"
                  >
                    <h3 className="text-lg font-extrabold text-[#0B162C]">
                      পরিচালনা পর্ষদের নতুন সদস্য সংযোজন করুন
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">পূর্ণ নাম *</label>
                        <input
                          type="text"
                          required
                          value={bmName}
                          onChange={(e) => setBmName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">পদবী *</label>
                        <input
                          type="text"
                          required
                          value={bmDesignation}
                          onChange={(e) => setBmDesignation(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">পোর্ট্রেট স্টাইল</label>
                        <select
                          value={bmPortrait}
                          onChange={(e) => setBmPortrait(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        >
                          <option value="portrait_chairman">চেয়ারম্যান পোর্ট্রেট</option>
                          <option value="portrait_md">ব্যবস্থাপনা পরিচালক (MD)</option>
                          <option value="portrait_director_arch">পরিচালক (স্থপতি)</option>
                          <option value="portrait_director_fin">পরিচালক (অর্থ ও হিসাব)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">সংক্ষিপ্ত বাণী</label>
                      <textarea
                        rows={2}
                        value={bmMessage}
                        onChange={(e) => setBmMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] text-white font-extrabold text-sm cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      পরিচালনা পর্ষদে সংরক্ষণ করুন
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 7: CUSTOMERS */}
              {erpTab === 'নিবন্ধিত গ্রাহক তালিকা' && (
                <div className="bg-white rounded-2xl p-6 border border-[#0B162C]/15 shadow-sm space-y-4">
                  <h3 className="text-lg font-extrabold text-[#0B162C]">
                    নিবন্ধিত গ্রাহকদের তালিকা ({toBengaliDigits(customers.length)})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#0B162C]/10 text-[#0B162C]/65 font-bold">
                          <th className="py-3 px-3">গ্রাহক আইডি</th>
                          <th className="py-3 px-3">নাম</th>
                          <th className="py-3 px-3">মোবাইল ও ইমেইল</th>
                          <th className="py-3 px-3">NID ও ঠিকানা</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0B162C]/10">
                        {customers.map((c) => (
                          <tr key={c.id}>
                            <td className="py-3 px-3 font-mono text-xs font-bold">{c.uid}</td>
                            <td className="py-3 px-3 font-extrabold">{c.name}</td>
                            <td className="py-3 px-3">
                              <p className="font-bold">{c.phone}</p>
                              <p className="text-xs text-[#0B162C]/60">{c.email}</p>
                            </td>
                            <td className="py-3 px-3 text-xs">
                              {c.nidNumber || '—'} · {c.addressBn || 'ঢাকা'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ============================================================
               PANEL 2: PUBLIC WEBSITE ADMIN & CMS PANEL
               ============================================================ */
            <>
              {webTab === 'ইআরপি ডাটা সিলেকশন' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-[#0B162C]/15 shadow-sm space-y-4">
                    <h4 className="text-lg font-extrabold text-[#0B162C]">
                      ১. প্রজেক্ট সিলেকশন ও ভিউ ({toBengaliDigits(projects.filter((p) => p.publishedOnWeb === 1).length)}/{toBengaliDigits(projects.length)}টি ওয়েবসাইটে প্রদর্শিত)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((p) => (
                        <div
                          key={p.id}
                          className={`p-4 rounded-xl border-2 flex items-center justify-between gap-4 ${
                            p.publishedOnWeb === 1
                              ? 'bg-emerald-50/50 border-emerald-500/40'
                              : 'bg-gray-100 border-gray-300 opacity-75'
                          }`}
                        >
                          <div>
                            <p className="font-extrabold text-sm text-[#0B162C]">{p.nameBn}</p>
                            <p className="text-xs text-[#0B162C]/70">
                              {p.categoryBn} · {p.locationBn}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setAdminViewerTarget({ type: 'project', project: p })
                              }
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-[#0B162C] font-extrabold text-xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              ভিউ
                            </button>
                            <button
                              onClick={() => handleToggleWebVisibility('project', p.id, p.publishedOnWeb)}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs cursor-pointer ${
                                p.publishedOnWeb === 1
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#0B162C] text-[#FDE68A]'
                              }`}
                            >
                              {p.publishedOnWeb === 1 ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" /> লাইভ
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" /> সিলেক্ট করুন
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-[#0B162C]/15 shadow-sm space-y-4">
                    <h4 className="text-lg font-extrabold text-[#0B162C]">
                      ২. বসুন্ধরা জমি ও বনশ্রী ফ্ল্যাট সিলেকশন ও ভিউ ({toBengaliDigits(properties.filter((p) => p.publishedOnWeb === 1).length)}/{toBengaliDigits(properties.length)}টি ওয়েবসাইটে প্রদর্শিত)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {properties.map((prop) => (
                        <div
                          key={prop.id}
                          className={`p-4 rounded-xl border-2 flex items-center justify-between gap-4 ${
                            prop.publishedOnWeb === 1
                              ? 'bg-emerald-50/50 border-emerald-500/40'
                              : 'bg-gray-100 border-gray-300 opacity-75'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-mono font-bold text-[#9A7432]">
                              {prop.propertyCode} · {prop.areaBn}
                            </span>
                            <p className="font-extrabold text-sm text-[#0B162C]">{prop.titleBn}</p>
                            <p className="text-xs text-[#0B162C]/70">
                              {prop.sizeBn} · {prop.priceDisplayBn}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setAdminViewerTarget({ type: 'property', property: prop })
                              }
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-[#0B162C] font-extrabold text-xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              ভিউ
                            </button>
                            <button
                              onClick={() => handleToggleWebVisibility('property', prop.id, prop.publishedOnWeb)}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs cursor-pointer shrink-0 ${
                                prop.publishedOnWeb === 1
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#0B162C] text-[#FDE68A]'
                              }`}
                            >
                              {prop.publishedOnWeb === 1 ? 'লাইভ' : 'সিলেক্ট করুন'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {webTab === 'ব্যানার ও প্রজেক্ট স্লাইডার' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleAddSlide}
                    className="bg-white rounded-2xl p-6 border border-[#0B162C]/15 shadow-sm space-y-4"
                  >
                    <h3 className="text-lg font-extrabold text-[#0B162C]">
                      হোমপেজ ব্যানারে নতুন প্রকল্প ছবি ও নাম যোগ করুন
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">প্রকল্পের নাম (ব্যানারে প্রদর্শিত হবে) *</label>
                        <input
                          type="text"
                          required
                          value={slideTitle}
                          onChange={(e) => setSlideTitle(e.target.value)}
                          placeholder="যেমন: এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">ব্যানার ছবি নির্বাচন</label>
                        <select
                          value={slideTheme}
                          onChange={(e) => setSlideTheme(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        >
                          <option value="hero_3d_twin_towers">সিগনেচার অ্যাপার্টমেন্ট ভবন</option>
                          <option value="hero_3d_green_township">বসুন্ধরা আবাসিক জমির প্লট</option>
                          <option value="hero_3d_royal_commercial">কমার্শিয়াল স্কয়ার ভবন</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B162C] text-[#FDE68A] font-extrabold text-sm cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      ব্যানার স্লাইড যোগ করুন
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {heroSlides.map((s) => (
                      <div
                        key={s.id}
                        className="bg-white rounded-2xl overflow-hidden border border-[#0B162C]/15 shadow-sm"
                      >
                        <div className="h-44">
                          <ArchitecturalRender theme={s.visualTheme} hideBadge={true} />
                        </div>
                        <div className="p-4 space-y-3">
                          {editingSlideId === s.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editingSlideTitle}
                                onChange={(e) => setEditingSlideTitle(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold"
                              />
                              <select
                                value={editingSlideTheme}
                                onChange={(e) => setEditingSlideTheme(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                              >
                                <option value="hero_3d_twin_towers">সিগনেচার অ্যাপার্টমেন্ট ভবন</option>
                                <option value="hero_3d_green_township">বসুন্ধরা আবাসিক জমির প্লট</option>
                                <option value="hero_3d_royal_commercial">কমার্শিয়াল স্কয়ার ভবন</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleSaveSlideEdit(s)}
                                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                সেভ করুন
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-extrabold text-base text-[#0B162C]">{s.titleBn}</p>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSlideId(s.id);
                                    setEditingSlideTitle(s.titleBn);
                                    setEditingSlideTheme(s.visualTheme);
                                  }}
                                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                                  title="এডিট"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleWebVisibility('slide', s.id, s.publishedOnWeb)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                                    s.publishedOnWeb === 1
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-gray-300 text-gray-800'
                                  }`}
                                >
                                  {s.publishedOnWeb === 1 ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSlide(s.id)}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                  title="ডিলিট"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {webTab === 'চেয়ারম্যান ও পরিচালনা পর্ষদ' && (
                <div className="bg-white p-6 rounded-2xl border border-[#0B162C]/15 shadow-sm space-y-4">
                  <h3 className="text-lg font-extrabold text-[#0B162C]">
                    পরিচালনা পর্ষদ প্রদর্শন কন্ট্রোল
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {boardMembers.map((bm) => (
                      <div
                        key={bm.id}
                        className="p-4 rounded-xl bg-[#F8F6F0] border border-[#0B162C]/10 flex items-center gap-4"
                      >
                        <div className="w-14 h-18 rounded-xl overflow-hidden shrink-0 border border-[#C6A15B]">
                          <ExecutivePortrait theme={bm.portraitTheme} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-sm truncate">{bm.nameBn}</p>
                          <p className="text-xs font-bold text-[#9A7432]">{bm.designationBn}</p>
                        </div>
                        <button
                          onClick={() => handleToggleWebVisibility('board', bm.id, bm.publishedOnWeb)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer shrink-0 ${
                            bm.publishedOnWeb === 1
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-300 text-gray-800'
                          }`}
                        >
                          {bm.publishedOnWeb === 1 ? 'লাইভ' : 'লুকানো'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {webTab === 'ছবি ও ভিডিও গ্যালারি' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleAddGallery}
                    className="bg-white rounded-2xl p-6 border border-[#0B162C]/15 shadow-sm space-y-4"
                  >
                    <h3 className="text-lg font-extrabold text-[#0B162C]">
                      গ্যালারি পেজে নতুন আইটেম যোগ করুন
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">শিরোনাম *</label>
                        <input
                          type="text"
                          required
                          value={galTitleBn}
                          onChange={(e) => setGalTitleBn(e.target.value)}
                          placeholder="বসুন্ধরা আবাসিক প্লট ভিউ"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">ধরন</label>
                        <select
                          value={galMediaType}
                          onChange={(e) => setGalMediaType(e.target.value as 'image' | 'video')}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        >
                          <option value="image">ছবি (Image)</option>
                          <option value="video">ভিডিও (Video)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">থিম</label>
                        <select
                          value={galTheme}
                          onChange={(e) => setGalTheme(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        >
                          <option value="gallery_3d_duplex_villa">বসুন্ধরা আবাসিক প্লট</option>
                          <option value="gallery_3d_twin_night">সিগনেচার টাওয়ার</option>
                          <option value="gallery_3d_grand_lobby">গ্র্যান্ড রিসেপশন লবি</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#0B162C] text-[#FDE68A] font-extrabold text-sm cursor-pointer"
                    >
                      গ্যালারিতে যুক্ত করুন
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {gallery.map((g) => (
                      <div
                        key={g.id}
                        className="bg-white rounded-xl overflow-hidden border border-slate-200 p-3 space-y-2"
                      >
                        <div className="h-36 rounded-lg overflow-hidden">
                          <ArchitecturalRender theme={g.visualTheme} hideBadge={true} />
                        </div>
                        <p className="font-bold text-sm">{g.titleBn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {webTab === 'কাস্টমার রিভিউ' && (
                <div className="bg-white rounded-2xl p-6 border border-[#0B162C]/15 shadow-sm space-y-4">
                  <h3 className="text-lg font-extrabold text-[#0B162C]">
                    কাস্টমার রিভিউ অনুমোদন ({toBengaliDigits(testimonials.length)})
                  </h3>
                  <div className="space-y-3">
                    {testimonials.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-xl bg-[#F8F6F0] border border-[#0B162C]/10 flex flex-wrap items-center justify-between gap-4"
                      >
                        <div className="space-y-1 max-w-2xl">
                          <span className="font-extrabold text-[#0B162C]">{t.customerNameBn}</span>
                          <p className="text-sm text-[#0B162C]/85">“{t.reviewBn}”</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {webTab === 'সাইট সেটিংস ও যোগাযোগ' && settings && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleSaveSettings}
                    className="bg-white rounded-2xl p-6 border border-[#0B162C]/15 shadow-sm space-y-4"
                  >
                    <h3 className="text-lg font-extrabold text-[#0B162C]">
                      কোম্পানির নাম, বনশ্রী অফিসের ঠিকানা ও যোগাযোগ তথ্য এডিট করুন
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">কোম্পানির নাম</label>
                        <input
                          type="text"
                          value={settings.companyNameBn}
                          onChange={(e) =>
                            setSettings({ ...settings, companyNameBn: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">
                          প্রধান কার্যালয়ের ঠিকানা (বনশ্রী)
                        </label>
                        <input
                          type="text"
                          value={settings.officeAddressBn}
                          onChange={(e) =>
                            setSettings({ ...settings, officeAddressBn: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">হটলাইন নম্বর</label>
                        <input
                          type="text"
                          value={settings.phone}
                          onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">ইমেইল ঠিকানা</label>
                        <input
                          type="text"
                          value={settings.email}
                          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold mb-1">আমাদের সম্পর্কে</label>
                        <textarea
                          rows={3}
                          value={settings.aboutIntroBn}
                          onChange={(e) =>
                            setSettings({ ...settings, aboutIntroBn: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B162C]/20 text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#0B162C] text-[#FDE68A] font-extrabold text-sm cursor-pointer"
                    >
                      সেটিংস সংরক্ষণ করুন
                    </button>
                  </form>

                  <div className="bg-white rounded-2xl p-6 border border-[#0B162C]/15 shadow-sm space-y-3">
                    <h4 className="text-lg font-extrabold">
                      গ্রাহক জিজ্ঞাসা তালিকা ({toBengaliDigits(inquiries.length)})
                    </h4>
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="p-4 rounded-xl bg-[#F8F6F0] border border-[#0B162C]/10"
                      >
                        <p className="font-bold text-sm">
                          {inq.name} · {inq.phone} ({inq.propertyCategoryBn})
                        </p>
                        <p className="text-xs text-[#0B162C]/80 mt-1">{inq.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Cloud Git Deployment & Build Command Reference Card */}
                  <div className="bg-[#0B162C] text-white rounded-2xl p-6 border-2 border-[#C6A15B]/50 shadow-md space-y-4">
                    <div className="flex items-center gap-2.5">
                      <Terminal className="w-6 h-6 text-[#34D399]" />
                      <div>
                        <span className="text-xs font-bold text-[#FDE68A] uppercase">
                          ক্লাউড গিট ডিপ্লয়মেন্ট গাইড (Cloud Git Deployment)
                        </span>
                        <h4 className="text-lg font-extrabold text-white">
                          গিট (Git) থেকে ক্লাউডে বিল্ড ও রান কমান্ড
                        </h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1">
                        <span className="text-emerald-300 font-bold block">1. Build Command</span>
                        <code className="font-mono text-white font-bold block">
                          npm install &amp;&amp; npm run build
                        </code>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1">
                        <span className="text-emerald-300 font-bold block">2. Start Command</span>
                        <code className="font-mono text-white font-bold block">
                          NODE_ENV=production npm start
                        </code>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1">
                        <span className="text-emerald-300 font-bold block">3. Static Output Dir</span>
                        <code className="font-mono text-white font-bold block">dist</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Native Mobile Fixed Bottom Navigation Bar for Admin & ERP */}
      <nav
        aria-label="অ্যাডমিন প্যানেল মোবাইল নেভিগেশন"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(11,25,44,0.08)] pb-safe no-print"
      >
        <div className="grid grid-cols-5 items-center h-14 px-1">
          <button
            type="button"
            onClick={() => {
              setSystemMode('realestate_erp');
              setErpTab('মানি রিসিট ও কিস্তি আদায়');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 h-full rounded-xl transition-colors cursor-pointer ${
              systemMode === 'realestate_erp' && erpTab === 'মানি রিসিট ও কিস্তি আদায়'
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-500 hover:text-[#0B162C] font-semibold'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] leading-none">মানি রিসিট</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSystemMode('realestate_erp');
              setErpTab('মাস্টার প্রজেক্ট এন্ট্রি');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 h-full rounded-xl transition-colors cursor-pointer ${
              systemMode === 'realestate_erp' && erpTab === 'মাস্টার প্রজেক্ট এন্ট্রি'
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-500 hover:text-[#0B162C] font-semibold'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-[10px] leading-none">প্রকল্প</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSystemMode('realestate_erp');
              setErpTab('মাস্টার প্রপার্টি ইনভেন্টরি');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 h-full rounded-xl transition-colors cursor-pointer ${
              systemMode === 'realestate_erp' && erpTab === 'মাস্টার প্রপার্টি ইনভেন্টরি'
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-500 hover:text-[#0B162C] font-semibold'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] leading-none">প্রপার্টি</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSystemMode('realestate_erp');
              setErpTab('হিসাবরক্ষণ ও লেজার');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 h-full rounded-xl transition-colors cursor-pointer ${
              systemMode === 'realestate_erp' && erpTab === 'হিসাবরক্ষণ ও লেজার'
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-500 hover:text-[#0B162C] font-semibold'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] leading-none">লেজার</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSystemMode('website_cms');
              setWebTab('ইআরপি ডাটা সিলেকশন');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 h-full rounded-xl transition-colors cursor-pointer ${
              systemMode === 'website_cms'
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-500 hover:text-[#0B162C] font-semibold'
            }`}
          >
            <Globe className="w-5 h-5" />
            <span className="text-[10px] leading-none">ওয়েবসাইট</span>
          </button>
        </div>
      </nav>

      {/* Official Printable & Downloadable Money Receipt Modal */}
      {activeReceipt && (
        <MoneyReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* Interactive Project & Property Detail Viewer Modal */}
      <ProjectPropertyViewerModal
        target={adminViewerTarget}
        allProjects={projects}
        allProperties={properties}
        onSelectTarget={(next) => setAdminViewerTarget(next)}
        onClose={() => setAdminViewerTarget(null)}
        contextLabelBn="অ্যাডমিন ও ইআরপি · প্রকল্প ও প্রপার্টি ভিউ"
      />
    </div>
  );
};
