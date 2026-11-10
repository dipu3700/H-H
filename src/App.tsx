/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Phone,
  MapPin,
  Search,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  UserCheck,
  Mail,
  Clock,
  Calculator,
  FileCheck2,
  Award,
  Target,
  Eye,
  Star,
  Calendar,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  SiteSettings,
  HeroSlideItem,
  BoardMemberItem,
  ProjectItem,
  PropertyItem,
  GalleryItem,
  TestimonialItem,
  ArticleItem,
  CustomerUser,
} from './types';
import {
  filterProperties,
  toBengaliDigits,
  formatExactBdtBengali,
  calculateInstallmentPlan,
} from './utils/bengaliLogic';
import {
  NazihaLogo,
  ArchitecturalRender,
  ExecutivePortrait,
  REAL_ESTATE_PHOTO_COLLECTION,
  PhotoCollectionItem,
} from './components/ArchitecturalVisuals';
import { ProjectMapSection } from './components/ProjectMapSection';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { BrochureModal } from './components/BrochureModal';
import { CustomerPortalView } from './components/CustomerPortalView';
import { AdminCmsView, AdminSystemMode } from './components/AdminCmsView';
import { signInWithGoogle, subscribeToAuth } from './lib/firebase';

type ActiveView = 'public' | 'portal' | 'admin';

export type PublicPage =
  | 'home'
  // Projects Sub-pages
  | 'projects-all'
  | 'projects-ongoing'
  | 'projects-upcoming'
  | 'projects-completed'
  | 'projects-map'
  // Properties Sub-pages
  | 'properties-all'
  | 'properties-residential-land'
  | 'properties-commercial-land'
  | 'properties-apartments'
  // About Us Sub-pages (আমাদের সম্পর্কে > সাব মেনু)
  | 'about-profile'
  | 'about-chairman'
  | 'about-md'
  | 'about-board'
  | 'about-mission'
  // Media & Gallery Sub-pages
  | 'media-gallery'
  | 'media-testimonials'
  | 'media-news'
  // Customer Services Sub-pages
  | 'service-emi'
  | 'service-booking'
  | 'service-legal'
  // Contact Page
  | 'contact';

interface NavSubItem {
  id: PublicPage;
  label: string;
  desc: string;
}

interface NavMenuItem {
  id: string;
  label: string;
  page?: PublicPage;
  children?: NavSubItem[];
}

const NAVIGATION_MENU: NavMenuItem[] = [
  {
    id: 'home',
    label: 'হোম',
    page: 'home',
  },
  {
    id: 'projects',
    label: 'প্রকল্পসমূহ',
    children: [
      {
        id: 'projects-ongoing',
        label: 'চলমান প্রকল্প',
        desc: 'বর্তমানে উন্নয়ন ও নির্মাণাধীন আবাসিক ও ভবন প্রকল্প',
      },
      {
        id: 'projects-upcoming',
        label: 'আসন্ন প্রকল্প',
        desc: 'প্রি-বুকিং ও বিনিয়োগের জন্য উন্মুক্ত নতুন প্রকল্প',
      },
      {
        id: 'projects-completed',
        label: 'সম্পন্ন প্রকল্প',
        desc: 'হস্তান্তরযোগ্য ও শতভাগ প্রস্তুত প্রকল্পসমূহ',
      },
      {
        id: 'projects-all',
        label: 'সকল প্রকল্প তালিকা',
        desc: 'H & H Homes-এর সকল আবাসিক ও বাণিজ্যিক প্রকল্প',
      },
      {
        id: 'projects-map',
        label: 'প্রকল্পের লোকেশন ম্যাপ',
        desc: 'ম্যাপে প্রকল্পগুলোর অবস্থান ও সাইট নির্দেশিকা',
      },
    ],
  },
  {
    id: 'properties',
    label: 'প্রপার্টি',
    children: [
      {
        id: 'properties-residential-land',
        label: 'আবাসিক প্লট',
        desc: 'প্রস্তুত ও নিষ্কণ্টক আবাসিক জমির প্লট',
      },
      {
        id: 'properties-commercial-land',
        label: 'বাণিজ্যিক প্লট',
        desc: 'মেইন অ্যাভিনিউ সংলগ্ন বাণিজ্যিক প্লট',
      },
      {
        id: 'properties-apartments',
        label: 'ফ্ল্যাট ও অ্যাপার্টমেন্ট',
        desc: 'আধুনিক স্থাপত্যের লাক্সারি ফ্ল্যাট ও পেন্টহাউস',
      },
      {
        id: 'properties-all',
        label: 'সকল প্রপার্টি ইনভেন্টরি',
        desc: 'সকল প্লট ও ফ্ল্যাটের সম্পূর্ণ তালিকা',
      },
    ],
  },
  {
    id: 'about',
    label: 'আমাদের সম্পর্কে',
    children: [
      {
        id: 'about-profile',
        label: 'কোম্পানি প্রোফাইল',
        desc: 'H & H Homes-এর পরিচিতি, কার্যক্রম ও কর্পোরেট তথ্য',
      },
      {
        id: 'about-chairman',
        label: 'চেয়ারম্যানের বাণী',
        desc: 'মাননীয় চেয়ারম্যানের প্রত্যয় ও দিকনির্দেশনা',
      },
      {
        id: 'about-md',
        label: 'ব্যবস্থাপনা পরিচালকের বাণী',
        desc: 'ব্যবস্থাপনা পরিচালকের অঙ্গীকার ও কর্মপরিকল্পনা',
      },
      {
        id: 'about-board',
        label: 'পরিচালনা পর্ষদ',
        desc: 'চেয়ারম্যান, ব্যবস্থাপনা পরিচালক ও পরিচালকবৃন্দ',
      },
      {
        id: 'about-mission',
        label: 'লক্ষ্য, উদ্দেশ্য ও মূল্যবোধ',
        desc: 'আমাদের মিশন, ভিশন ও গুণগত মানের নীতিমালা',
      },
    ],
  },
  {
    id: 'media',
    label: 'মিডিয়া ও গ্যালারি',
    children: [
      {
        id: 'media-gallery',
        label: 'প্রজেক্ট ফটো গ্যালারি',
        desc: 'প্রকল্পের জমি ও আধুনিক ভবনের আলোকচিত্র',
      },
      {
        id: 'media-testimonials',
        label: 'গ্রাহক মতামত',
        desc: 'প্লট ও ফ্ল্যাট মালিকদের বাস্তব অভিজ্ঞতা',
      },
      {
        id: 'media-news',
        label: 'নিউজ ও আপডেট',
        desc: 'প্রকল্পের অগ্রগতি ও কর্পোরেট ঘোষণা',
      },
    ],
  },
  {
    id: 'services',
    label: 'গ্রাহক সেবা',
    children: [
      {
        id: 'service-emi',
        label: 'কিস্তি ক্যালকুলেটর',
        desc: 'মাসিক কিস্তি ও ডাউন পেমেন্ট হিসাব করুন',
      },
      {
        id: 'service-booking',
        label: 'অনলাইন বুকিং ও বরাদ্দ প্রক্রিয়া',
        desc: 'প্লট ও ফ্ল্যাট বুকিংয়ের নিয়মাবলি ও আবেদন',
      },
      {
        id: 'service-legal',
        label: 'দলিল ও নামজারি সহায়তা',
        desc: 'আইনগত যাচাই, রেজিস্ট্রেশন ও নামজারি সেবা',
      },
    ],
  },
  {
    id: 'contact',
    label: 'যোগাযোগ',
    page: 'contact',
  },
];

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('public');
  const [publicPage, setPublicPage] = useState<PublicPage>('home');
  const [adminMode, setAdminMode] = useState<AdminSystemMode>('realestate_erp');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>('about');
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(null);

  // Data from PostgreSQL backend
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMemberItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [galleryItemsList, setGalleryItemsList] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero Slider State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Customer Auth State
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);

  // Search Filter State
  const [searchCategory, setSearchCategory] = useState('সকল ধরন');
  const [searchArea, setSearchArea] = useState('সকল এলাকা');
  const [searchProject, setSearchProject] = useState('all');
  const [maxBudget, setMaxBudget] = useState(0);

  // Gallery Filter & Lightbox
  const [photoFilter, setPhotoFilter] = useState<'all' | 'land' | 'building'>('all');
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoCollectionItem | null>(null);

  // EMI Calculator State (for service-emi page)
  const [emiPriceBdt, setEmiPriceBdt] = useState<number>(4500000);
  const [emiBookingBdt, setEmiBookingBdt] = useState<number>(500000);
  const [emiPlanChoice, setEmiPlanChoice] = useState<string>('৩৬ মাসিক কিস্তি');

  // Modals
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [propertyModalTab, setPropertyModalTab] = useState<'details' | 'book' | 'inquiry'>('details');
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [brochureProject, setBrochureProject] = useState<ProjectItem | null>(null);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState('আবাসিক জমি');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState('');

  const fetchBootstrapData = async () => {
    try {
      const res = await fetch('/api/bootstrap');
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
      setHeroSlides(data.heroSlides || []);
      setBoardMembers(data.boardMembers || []);
      setProjects(data.projects || []);
      setProperties(data.properties || []);
      setGalleryItemsList(data.gallery || []);
      setTestimonials(data.testimonials || []);
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error loading bootstrap data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBootstrapData();
  }, []);

  // Support URL hash for direct navigation (#admin, #portal)
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setActiveView('admin');
      } else if (window.location.hash === '#portal') {
        setActiveView('portal');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  useEffect(() => {
    const unsub = subscribeToAuth(async (fbUser) => {
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          const res = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: fbUser.displayName }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setCustomerUser({
                id: data.user.id,
                uid: data.user.uid,
                name: data.user.name || fbUser.displayName || 'গ্রাহক',
                phone: data.user.phone || '',
                email: data.user.email || fbUser.email || '',
                nidNumber: data.user.nidNumber || '',
                addressBn: data.user.addressBn || '',
                role: data.user.role || 'customer',
              });
            }
          }
        } catch (err) {
          console.error('Auth sync error:', err);
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const companyName = settings?.companyNameBn || 'H & H Homes';
  const officeAddress = settings?.officeAddressBn || 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।';
  const hotline = settings?.phone || '+৮৮০ ১৭১১-২২৩৩৪৪';
  const emailAddress = settings?.email || 'info@hhhomesbd.com';

  const filteredProperties = filterProperties(properties, {
    categoryBn: searchCategory,
    areaBn: searchArea,
    projectId: searchProject,
    maxBudget: maxBudget > 0 ? maxBudget : undefined,
  });

  const residentialLandProperties = properties.filter(
    (p) => p.propertyType === 'land' && p.categoryBn === 'আবাসিক জমি'
  );
  const commercialLandProperties = properties.filter(
    (p) => p.propertyType === 'land' && p.categoryBn === 'বাণিজ্যিক জমি'
  );
  const allBuildingProperties = properties.filter((p) => p.propertyType !== 'land');

  const ongoingProjects = projects.filter((p) => p.statusBn === 'চলমান');
  const upcomingProjects = projects.filter((p) => p.statusBn === 'আসন্ন');
  const completedProjects = projects.filter((p) => p.statusBn === 'সম্পন্ন');

  const chairmanMember =
    boardMembers.find((b) => b.roleKey === 'chairman') || boardMembers[0] || null;
  const mdMember =
    boardMembers.find((b) => b.roleKey === 'md') || boardMembers[1] || null;

  const uniqueAreas = Array.from(new Set(properties.map((p) => p.areaBn)));

  const filteredPhotos = REAL_ESTATE_PHOTO_COLLECTION.filter((item) => {
    if (photoFilter === 'all') return true;
    if (photoFilter === 'land') return item.category === 'land';
    return item.category === 'building' || item.category === 'interior';
  });

  const emiCalculation = calculateInstallmentPlan(emiPriceBdt, emiBookingBdt, emiPlanChoice);

  const handleOpenProperty = (prop: PropertyItem, tab: 'details' | 'book' | 'inquiry' = 'details') => {
    setSelectedProperty(prop);
    setPropertyModalTab(tab);
  };

  const navigateToPage = (page: PublicPage) => {
    setPublicPage(page);
    setMobileMenuOpen(false);
    setOpenDesktopDropdown(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isMenuGroupActive = (item: NavMenuItem): boolean => {
    if (item.page && item.page === publicPage) return true;
    if (item.children) {
      return item.children.some((sub) => sub.id === publicPage);
    }
    return false;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactMessage) return;
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          phone: contactPhone,
          email: contactEmail,
          propertyCategoryBn: contactCategory,
          message: contactMessage,
        }),
      });
      if (res.ok) {
        setContactName('');
        setContactPhone('');
        setContactEmail('');
        setContactMessage('');
        setContactStatus('আপনার বার্তা সফলভাবে প্রেরণ করা হয়েছে। আমাদের প্রতিনিধি দ্রুত যোগাযোগ করবেন।');
      }
    } catch {
      setContactStatus('বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  if (activeView === 'portal') {
    return (
      <CustomerPortalView
        customerUser={customerUser}
        onCustomerAuthenticated={(user) => setCustomerUser(user)}
        onCustomerLogout={() => setCustomerUser(null)}
        onGoogleLogin={() => signInWithGoogle()}
        onBackToHome={() => {
          window.location.hash = '';
          setActiveView('public');
        }}
        onBrowseProperties={() => {
          window.location.hash = '';
          setActiveView('public');
          setPublicPage('properties-all');
        }}
        onOpenAdminPanel={() => {
          setAdminMode('realestate_erp');
          setActiveView('admin');
        }}
      />
    );
  }

  if (activeView === 'admin') {
    return (
      <AdminCmsView
        initialMode={adminMode}
        onBackToHome={() => {
          window.location.hash = '';
          setActiveView('public');
        }}
        onDataMutated={fetchBootstrapData}
      />
    );
  }

  const activeSlide = heroSlides[currentSlideIndex] || {
    id: 1,
    badgeBn: '',
    titleBn: 'এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ',
    subtitleBn: '',
    highlightStatsBn: '',
    ctaPrimaryBn: '',
    ctaSecondaryBn: '',
    visualTheme: 'hero_3d_green_township',
    publishedOnWeb: 1,
  };

  const renderPropertyCard = (prop: PropertyItem) => (
    <div
      key={prop.id}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-500/60 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="h-56 relative overflow-hidden">
          <ArchitecturalRender theme={prop.imageType} label={prop.categoryBn} />
          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md text-xs font-bold bg-[#0B192C]/90 text-emerald-300">
            {prop.statusBn}
          </span>
        </div>
        <div className="p-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>কোড: {prop.propertyCode}</span>
            <span>{prop.sizeBn}</span>
          </div>
          <h3 className="text-lg font-extrabold text-[#0F172A] leading-snug">
            {prop.titleBn}
          </h3>
          <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{prop.locationBn}</span>
          </p>
          <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-500 block">মূল্য</span>
              <span className="text-lg font-extrabold text-[#0F172A]">
                {prop.priceDisplayBn}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">বুকিং মানি</span>
              <span className="text-sm font-bold text-emerald-700">
                {prop.bookingDisplayBn}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => handleOpenProperty(prop, 'details')}
          className="py-2.5 px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-[#0F172A] text-xs font-bold transition-colors cursor-pointer"
        >
          বিস্তারিত দেখুন
        </button>
        <button
          type="button"
          onClick={() => handleOpenProperty(prop, 'book')}
          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          বুকিং করুন
        </button>
      </div>
    </div>
  );

  const renderProjectCard = (proj: ProjectItem) => (
    <div
      key={proj.id}
      className="rounded-2xl overflow-hidden border border-slate-200 bg-white flex flex-col sm:flex-row shadow-xs hover:shadow-md transition-all"
    >
      <div className="sm:w-2/5 h-56 sm:h-auto relative shrink-0">
        <ArchitecturalRender theme={proj.imageType} label={proj.statusBn} />
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-700">{proj.categoryBn}</span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800">
              {proj.statusBn}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-[#0F172A]">{proj.nameBn}</h3>
          <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{proj.locationBn}</span>
          </p>
          <p className="text-sm text-slate-600 pt-1 leading-relaxed line-clamp-2">
            {proj.descriptionBn}
          </p>
          <p className="text-xs font-bold text-slate-800 pt-1">
            আকার: {proj.sizeSummaryBn} · {proj.priceSummaryBn}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setBrochureProject(proj);
              setBrochureOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B192C] text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ব্রোশিওর ও স্পেসিফিকেশন</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchProject(String(proj.id));
              navigateToPage('properties-all');
            }}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>ইউনিটসমূহ দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Corporate Sticky Header with Multi-Level Dropdown Sub-Menus */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigateToPage('home')}
            className="focus:outline-none cursor-pointer text-left shrink-0"
          >
            <NazihaLogo variant="dark" />
          </button>

          {/* Desktop Multi-Page & Sub-Page Dropdown Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-bold text-slate-700">
            {NAVIGATION_MENU.map((item) => {
              const active = isMenuGroupActive(item);
              const isOpen = openDesktopDropdown === item.id;

              if (!item.children) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => item.page && navigateToPage(item.page)}
                    className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0B192C] text-white'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setOpenDesktopDropdown(item.id)}
                  onMouseLeave={() => setOpenDesktopDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDesktopDropdown(isOpen ? null : item.id)
                    }
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0B192C] text-white'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 top-full pt-2 w-72 z-50">
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1">
                        {item.children.map((sub) => {
                          const subActive = publicPage === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => navigateToPage(sub.id)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer block ${
                                subActive
                                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                                  : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <span className="font-extrabold text-sm block">
                                {sub.label}
                              </span>
                              <span className="text-xs text-slate-500 font-normal block mt-0.5">
                                {sub.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Clean Customer Portal Button Only */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('portal')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold whitespace-nowrap transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>{customerUser ? customerUser.name.split(' ')[0] : 'গ্রাহক পোর্টাল'}</span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="মেনু"
            className="lg:hidden p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Accordion Menu with Sub-Pages */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto">
            {NAVIGATION_MENU.map((item) => {
              if (!item.children) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => item.page && navigateToPage(item.page)}
                    className={`w-full p-3 rounded-xl text-left font-bold text-sm ${
                      publicPage === item.page
                        ? 'bg-[#0B192C] text-white'
                        : 'bg-slate-50 text-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              }

              const expanded = openMobileGroup === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMobileGroup(expanded ? null : item.id)
                    }
                    className="w-full p-3 bg-slate-50 flex items-center justify-between font-bold text-sm text-slate-800"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expanded && (
                    <div className="p-2 bg-white space-y-1 border-t border-slate-100">
                      {item.children.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => navigateToPage(sub.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold block ${
                            publicPage === sub.id
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveView('portal');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold"
              >
                গ্রাহক পোর্টাল
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          PAGE 1: HOME PAGE (হোম)
          Banner has ONLY Photo + Project Name.
          Search button says ONLY "খুঁজুন" (no numbers in parentheses).
         ========================================================= */}
      {publicPage === 'home' && (
        <main className="flex-1">
          {/* Hero Banner — ONLY Project Photo and Project Name */}
          <section className="relative bg-[#0B192C] overflow-hidden">
            <div className="relative h-[380px] sm:h-[460px] lg:h-[520px] w-full">
              <ArchitecturalRender
                theme={activeSlide.visualTheme}
                hideBadge={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07111E]/90 via-[#07111E]/25 to-transparent" />

              {/* Project Name Only */}
              <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end justify-between gap-4">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {activeSlide.titleBn}
                </h1>

                {heroSlides.length > 1 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentSlideIndex(
                          (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
                        )
                      }
                      aria-label="পূর্ববর্তী"
                      className="p-2.5 rounded-xl bg-black/50 hover:bg-black/75 text-white border border-white/20 cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length)
                      }
                      aria-label="পরবর্তী"
                      className="p-2.5 rounded-xl bg-black/50 hover:bg-black/75 text-white border border-white/20 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Clean Search Filter Bar — No result count in button */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    প্রপার্টির ধরন
                  </label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="সকল ধরন">সকল ধরন</option>
                    <option value="আবাসিক জমি">আবাসিক প্লট</option>
                    <option value="বাণিজ্যিক জমি">বাণিজ্যিক প্লট</option>
                    <option value="ফ্ল্যাট">ফ্ল্যাট ও অ্যাপার্টমেন্ট</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    লোকেশন / এলাকা
                  </label>
                  <select
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="সকল এলাকা">সকল এলাকা</option>
                    {uniqueAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    সর্বোচ্চ বাজেট
                  </label>
                  <select
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:outline-none focus:border-emerald-600"
                  >
                    <option value={0}>যেকোনো বাজেট</option>
                    <option value={5000000}>৳ ৫০ লক্ষ পর্যন্ত</option>
                    <option value={15000000}>৳ ১.৫০ কোটি পর্যন্ত</option>
                    <option value={30000000}>৳ ৩.০০ কোটি পর্যন্ত</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('featured-properties');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B192C] hover:bg-emerald-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>খুঁজুন</span>
                  </button>
                  {(searchCategory !== 'সকল ধরন' || searchArea !== 'সকল এলাকা' || maxBudget > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchCategory('সকল ধরন');
                        setSearchArea('সকল এলাকা');
                        setSearchProject('all');
                        setMaxBudget(0);
                      }}
                      className="py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      রিসেট
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Featured Projects Overview */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-700">
                  H &amp; H Homes প্রকল্পসমূহ
                </span>
                <h2 className="text-2xl font-extrabold text-[#0F172A] mt-0.5">
                  আমাদের উল্লেখযোগ্য প্রকল্পসমূহ
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigateToPage('projects-all')}
                className="text-sm font-extrabold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                সকল প্রকল্প দেখুন →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.slice(0, 4).map(renderProjectCard)}
            </div>
          </section>

          {/* Featured Properties Grid */}
          <section id="featured-properties" className="bg-white border-t border-slate-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-700">
                    প্লট ও অ্যাপার্টমেন্ট
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] mt-0.5">
                    নির্বাচিত প্রপার্টি সমূহ
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToPage('properties-all')}
                  className="text-sm font-extrabold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  সকল প্রপার্টি দেখুন →
                </button>
              </div>

              {loading ? (
                <div className="p-10 text-center text-slate-500 font-bold">লোড হচ্ছে...</div>
              ) : filteredProperties.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-600 font-semibold">
                  এই ফিল্টারে কোনো প্রপার্টি পাওয়া যায়নি।
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map(renderPropertyCard)}
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {/* =========================================================
          PROJECTS SUB-PAGES (প্রকল্পসমূহ > সাব পেজ)
         ========================================================= */}
      {(publicPage === 'projects-all' ||
        publicPage === 'projects-ongoing' ||
        publicPage === 'projects-upcoming' ||
        publicPage === 'projects-completed') && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700">
                প্রকল্পসমূহ · {companyName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
                {publicPage === 'projects-ongoing'
                  ? 'চলমান প্রকল্পসমূহ'
                  : publicPage === 'projects-upcoming'
                  ? 'আসন্ন প্রকল্পসমূহ'
                  : publicPage === 'projects-completed'
                  ? 'সম্পন্ন প্রকল্পসমূহ'
                  : 'সকল প্রকল্প তালিকা'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'projects-all', label: 'সকল প্রকল্প' },
                  { id: 'projects-ongoing', label: 'চলমান' },
                  { id: 'projects-upcoming', label: 'আসন্ন' },
                  { id: 'projects-completed', label: 'সম্পন্ন' },
                  { id: 'projects-map', label: 'লোকেশন ম্যাপ' },
                ] as { id: PublicPage; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigateToPage(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    publicPage === tab.id
                      ? 'bg-[#0B192C] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(publicPage === 'projects-ongoing'
              ? ongoingProjects
              : publicPage === 'projects-upcoming'
              ? upcomingProjects
              : publicPage === 'projects-completed'
              ? completedProjects
              : projects
            ).map(renderProjectCard)}
          </div>
        </main>
      )}

      {/* PROJECTS MAP SUB-PAGE */}
      {publicPage === 'projects-map' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700">
                প্রকল্পসমূহ · জিআইএস ও লোকেশন ম্যাপ
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
                প্রকল্পের লোকেশন ম্যাপ
              </h1>
            </div>
            <button
              type="button"
              onClick={() => navigateToPage('projects-all')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer self-start sm:self-auto"
            >
              সকল প্রকল্প তালিকায় ফিরুন
            </button>
          </div>

          <ProjectMapSection
            projects={projects}
            onSelectProjectForBrochure={(proj: ProjectItem) => {
              setBrochureProject(proj);
              setBrochureOpen(true);
            }}
          />
        </main>
      )}

      {/* =========================================================
          PROPERTIES SUB-PAGES (প্রপার্টি > সাব পেজ)
         ========================================================= */}
      {(publicPage === 'properties-all' ||
        publicPage === 'properties-residential-land' ||
        publicPage === 'properties-commercial-land' ||
        publicPage === 'properties-apartments') && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700">
                প্রপার্টি ইনভেন্টরি · {companyName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
                {publicPage === 'properties-residential-land'
                  ? 'আবাসিক প্লট'
                  : publicPage === 'properties-commercial-land'
                  ? 'বাণিজ্যিক প্লট'
                  : publicPage === 'properties-apartments'
                  ? 'ফ্ল্যাট ও অ্যাপার্টমেন্ট'
                  : 'সকল প্রপার্টি ইনভেন্টরি'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'properties-all', label: 'সকল প্রপার্টি' },
                  { id: 'properties-residential-land', label: 'আবাসিক প্লট' },
                  { id: 'properties-commercial-land', label: 'বাণিজ্যিক প্লট' },
                  { id: 'properties-apartments', label: 'ফ্ল্যাট ও অ্যাপার্টমেন্ট' },
                ] as { id: PublicPage; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSearchProject('all');
                    navigateToPage(tab.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    publicPage === tab.id
                      ? 'bg-[#0B192C] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(publicPage === 'properties-residential-land'
              ? residentialLandProperties
              : publicPage === 'properties-commercial-land'
              ? commercialLandProperties
              : publicPage === 'properties-apartments'
              ? allBuildingProperties
              : filteredProperties
            ).map(renderPropertyCard)}
          </div>
        </main>
      )}

      {/* =========================================================
          ABOUT US SUB-PAGES (আমাদের সম্পর্কে > সাব মেনু)
         ========================================================= */}
      {(publicPage === 'about-profile' ||
        publicPage === 'about-chairman' ||
        publicPage === 'about-md' ||
        publicPage === 'about-board' ||
        publicPage === 'about-mission') && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
          {/* Sub-navigation bar for About Us */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700">
                আমাদের সম্পর্কে · {companyName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
                {publicPage === 'about-profile'
                  ? 'কোম্পানি প্রোফাইল'
                  : publicPage === 'about-chairman'
                  ? 'মাননীয় চেয়ারম্যানের বাণী'
                  : publicPage === 'about-md'
                  ? 'ব্যবস্থাপনা পরিচালকের বাণী'
                  : publicPage === 'about-board'
                  ? 'পরিচালনা পর্ষদ'
                  : 'লক্ষ্য, উদ্দেশ্য ও মূল্যবোধ'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'about-profile', label: 'কোম্পানি প্রোফাইল' },
                  { id: 'about-chairman', label: 'চেয়ারম্যানের বাণী' },
                  { id: 'about-md', label: 'ব্যবস্থাপনা পরিচালকের বাণী' },
                  { id: 'about-board', label: 'পরিচালনা পর্ষদ' },
                  { id: 'about-mission', label: 'লক্ষ্য ও উদ্দেশ্য' },
                ] as { id: PublicPage; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigateToPage(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    publicPage === tab.id
                      ? 'bg-[#0B192C] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* SUB-PAGE: COMPANY PROFILE */}
          {publicPage === 'about-profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                  {companyName} — আস্থা, স্বচ্ছ দলিল ও আধুনিক নির্মাণের প্রতিষ্ঠান
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  {settings?.aboutIntroBn ||
                    'H & H Homes (এইচ অ্যান্ড এইচ হোমস) বসুন্ধরা আবাসিক এলাকায় পরিকল্পিত আবাসিক জমির প্লট এবং বনশ্রীতে আধুনিক অ্যাপার্টমেন্ট ভবন নির্মাণে স্বচ্ছতা, গুণগত মান এবং নির্ধারিত সময়ে হস্তান্তরে অঙ্গীকারবদ্ধ।'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-bold text-emerald-700">প্রধান কার্যালয়</span>
                    <p className="font-extrabold text-sm text-[#0F172A]">{officeAddress}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-bold text-emerald-700">ল্যান্ড প্রজেক্ট জোন</span>
                    <p className="font-extrabold text-sm text-[#0F172A]">
                      বসুন্ধরা আবাসিক এলাকা, ঢাকা
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-bold text-emerald-700">অ্যাপার্টমেন্ট জোন</span>
                    <p className="font-extrabold text-sm text-[#0F172A]">
                      বনশ্রী ও সংলগ্ন প্রাইম এলাকা, ঢাকা
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-bold text-emerald-700">গ্রাহক সহায়তা</span>
                    <p className="font-extrabold text-sm text-[#0F172A]">{hotline}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#0B192C] text-white rounded-2xl p-6 sm:p-8 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <Award className="w-10 h-10 text-emerald-400" />
                  <h3 className="text-xl font-extrabold">কর্পোরেট বৈশিষ্ট্যসমূহ</h3>
                  <ul className="space-y-3 text-sm text-slate-200">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                      <span>১০০% নিষ্কণ্টক দলিল, সিএস/আরএস/মিউটেশন যাচাইকৃত প্লট ও ফ্ল্যাট</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                      <span>বিএনবিসি (BNBC) বিল্ডিং কোড অনুসরণ করে ভূমিকম্প-সহনীয় নির্মাণ</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                      <span>ডিজিটাল গ্রাহক পোর্টাল ও তাৎক্ষণিক অনলাইন মানি রিসিট সুবিধা</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                      <span>সহজ কিস্তি ও ব্যাংক লোন প্রসেসিং সহায়তা</span>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToPage('contact')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  সরাসরি অফিসে যোগাযোগ করুন
                </button>
              </div>
            </div>
          )}

          {/* SUB-PAGE: CHAIRMAN'S MESSAGE */}
          {publicPage === 'about-chairman' && chairmanMember && (
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 flex flex-col items-center text-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="w-36 h-44 rounded-2xl overflow-hidden border-2 border-emerald-600 mb-4 shadow-md">
                  <ExecutivePortrait theme={chairmanMember.portraitTheme} />
                </div>
                <h2 className="text-xl font-extrabold text-[#0F172A]">{chairmanMember.nameBn}</h2>
                <p className="text-sm font-bold text-emerald-700 mt-1">
                  {chairmanMember.designationBn}
                </p>
                <p className="text-xs text-slate-600 mt-2">{chairmanMember.qualificationBn}</p>
                <p className="text-xs text-slate-500 mt-1">{chairmanMember.experienceBn}</p>
              </div>

              <div className="lg:col-span-8 space-y-5">
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-base sm:text-lg leading-relaxed">
                  {chairmanMember.quoteBn}
                </div>
                <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
                  <p>{chairmanMember.messageBn}</p>
                  <p>
                    আমাদের প্রতিটি প্রকল্পে স্ট্রাকচারাল নিরাপত্তা, আধুনিক স্থাপত্যশৈলী এবং নিষ্কণ্টক ভূমি ব্যবস্থাপনাকে সর্বোচ্চ অগ্রাধিকার দেওয়া হয়। গ্রাহকের আজীবনের সঞ্চয় যেন একটি নিরাপদ ও স্থায়ী সম্পদে রূপান্তরিত হয়, সেটিই আমাদের পরিচালনা পর্ষদের মূল অঙ্গীকার।
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span>ইমেইল: {chairmanMember.email}</span>
                  <span>প্রধান কার্যালয়: {officeAddress}</span>
                </div>
              </div>
            </div>
          )}

          {/* SUB-PAGE: MANAGING DIRECTOR'S MESSAGE */}
          {publicPage === 'about-md' && mdMember && (
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 flex flex-col items-center text-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="w-36 h-44 rounded-2xl overflow-hidden border-2 border-[#0B192C] mb-4 shadow-md">
                  <ExecutivePortrait theme={mdMember.portraitTheme} />
                </div>
                <h2 className="text-xl font-extrabold text-[#0F172A]">{mdMember.nameBn}</h2>
                <p className="text-sm font-bold text-emerald-700 mt-1">
                  {mdMember.designationBn}
                </p>
                <p className="text-xs text-slate-600 mt-2">{mdMember.qualificationBn}</p>
                <p className="text-xs text-slate-500 mt-1">{mdMember.experienceBn}</p>
              </div>

              <div className="lg:col-span-8 space-y-5">
                <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 text-[#0F172A] font-bold text-base sm:text-lg leading-relaxed">
                  {mdMember.quoteBn}
                </div>
                <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
                  <p>{mdMember.messageBn}</p>
                  <p>
                    আমরা বিশ্বাস করি, একটি আবাসন প্রতিষ্ঠানের সুনাম নির্ভর করে নির্ধারিত সময়ে প্রজেক্ট হস্তান্তর এবং বিক্রয়োত্তর সেবার ওপর। বসুন্ধরার আবাসিক প্লট থেকে শুরু করে বনশ্রীর আধুনিক ফ্ল্যাট—প্রতিটি পদক্ষেপে আমরা গ্রাহকের জন্য স্বচ্ছ ও ডিজিটাল সেবা নিশ্চিত করছি।
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span>ইমেইল: {mdMember.email}</span>
                  <span>হটলাইন: {mdMember.phone}</span>
                </div>
              </div>
            </div>
          )}

          {/* SUB-PAGE: BOARD OF DIRECTORS */}
          {publicPage === 'about-board' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {boardMembers.map((leader) => (
                <div
                  key={leader.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-xs"
                >
                  <div className="w-28 h-34 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                    <ExecutivePortrait theme={leader.portraitTheme} />
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <h3 className="font-extrabold text-lg text-[#0F172A]">{leader.nameBn}</h3>
                    <p className="text-xs font-bold text-emerald-700">{leader.designationBn}</p>
                    <p className="text-xs text-slate-500">
                      {leader.qualificationBn} · {leader.experienceBn}
                    </p>
                    <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {leader.quoteBn}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed pt-1">
                      {leader.messageBn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUB-PAGE: MISSION, VISION & VALUES */}
          {publicPage === 'about-mission' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-[#0F172A]">আমাদের লক্ষ্য (Mission)</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {settings?.missionBn ||
                    'পরিকল্পিত নগরায়ন, মানসম্মত নির্মাণশৈলী এবং স্বচ্ছ লেনদেনের মাধ্যমে প্রতিটি পরিবারের জন্য নিরাপদ জমি ও ফ্ল্যাট নিশ্চিত করা।'}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-[#0F172A]">আমাদের উদ্দেশ্য (Vision)</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {settings?.visionBn ||
                    'আস্থা, স্থাপত্য নান্দনিকতা এবং গ্রাহককেন্দ্রিক সেবার মাধ্যমে দেশের শীর্ষস্থানীয় আবাসন প্রতিষ্ঠানে পরিণত হওয়া।'}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-[#0F172A]">আমাদের মূল্যবোধ (Values)</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {settings?.coreValuesBn ||
                    'স্বচ্ছ দলিল ও নামজারি · আধুনিক ভবন নির্মাণ · নির্ধারিত সময়ে হস্তান্তর · সহজ কিস্তি সুবিধা · দীর্ঘমেয়াদি গ্রাহক সেবা'}
                </p>
              </div>
            </div>
          )}
        </main>
      )}

      {/* =========================================================
          MEDIA & GALLERY SUB-PAGES (মিডিয়া ও গ্যালারি > সাব পেজ)
         ========================================================= */}
      {(publicPage === 'media-gallery' ||
        publicPage === 'media-testimonials' ||
        publicPage === 'media-news') && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700">
                মিডিয়া ও গ্যালারি · {companyName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
                {publicPage === 'media-gallery'
                  ? 'প্রজেক্ট ফটো গ্যালারি'
                  : publicPage === 'media-testimonials'
                  ? 'গ্রাহক মতামত ও অভিজ্ঞতা'
                  : 'নিউজ ও প্রপার্টি আপডেট'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'media-gallery', label: 'প্রজেক্ট ফটো গ্যালারি' },
                  { id: 'media-testimonials', label: 'গ্রাহক মতামত' },
                  { id: 'media-news', label: 'নিউজ ও আপডেট' },
                ] as { id: PublicPage; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigateToPage(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    publicPage === tab.id
                      ? 'bg-[#0B192C] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {publicPage === 'media-gallery' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 w-fit">
                {[
                  { id: 'all', label: 'সকল ছবি' },
                  { id: 'land', label: 'প্লট ও ল্যান্ড প্রজেক্ট' },
                  { id: 'building', label: 'ভবন ও অ্যাপার্টমেন্ট' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPhotoFilter(tab.id as 'all' | 'land' | 'building')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      photoFilter === tab.id
                        ? 'bg-[#0B192C] text-white'
                        : 'text-slate-700 hover:text-[#0F172A]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPhotos.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxPhoto(item)}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col"
                  >
                    <div className="relative h-60 overflow-hidden bg-slate-900">
                      <img
                        src={item.imageUrl}
                        alt={item.titleBn}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#0B192C]/85 text-emerald-300 border border-white/15">
                          {item.tagBn}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                      <h3 className="text-lg font-extrabold text-[#0F172A] group-hover:text-emerald-700 transition-colors">
                        {item.titleBn}
                      </h3>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {item.locationBn}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {galleryItemsList.map((g) => (
                  <div
                    key={`cms-gal-${g.id}`}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs flex flex-col"
                  >
                    <div className="h-60 relative overflow-hidden">
                      <ArchitecturalRender theme={g.visualTheme} hideBadge={true} />
                    </div>
                    <div className="p-5 space-y-1.5">
                      <span className="text-xs font-bold text-emerald-700">{g.categoryBn}</span>
                      <h3 className="text-lg font-extrabold text-[#0F172A]">{g.titleBn}</h3>
                      {g.captionBn && <p className="text-xs text-slate-600">{g.captionBn}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {publicPage === 'media-testimonials' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed font-medium">
                    “{t.reviewBn}”
                  </p>
                  <div className="pt-3 border-t border-slate-100">
                    <h3 className="font-extrabold text-base text-[#0F172A]">
                      {t.customerNameBn}
                    </h3>
                    <p className="text-xs text-slate-500">{t.roleOrProfessionBn}</p>
                    <p className="text-xs font-bold text-emerald-700 mt-1">
                      {t.projectNameBn} · {t.propertyUnitBn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {publicPage === 'media-news' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <Calendar className="w-4 h-4" />
                    <span>{art.publishedDateBn}</span>
                    <span>·</span>
                    <span>{art.categoryBn}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#0F172A]">{art.titleBn}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{art.contentBn}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* =========================================================
          CUSTOMER SERVICES SUB-PAGES (গ্রাহক সেবা > সাব পেজ)
         ========================================================= */}
      {(publicPage === 'service-emi' ||
        publicPage === 'service-booking' ||
        publicPage === 'service-legal') && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700">
                গ্রাহক সেবা · {companyName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
                {publicPage === 'service-emi'
                  ? 'কিস্তি ও ডাউন পেমেন্ট ক্যালকুলেটর'
                  : publicPage === 'service-booking'
                  ? 'অনলাইন বুকিং ও বরাদ্দ প্রক্রিয়া'
                  : 'দলিল রেজিস্ট্রেশন ও নামজারি সহায়তা'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'service-emi', label: 'কিস্তি ক্যালকুলেটর' },
                  { id: 'service-booking', label: 'বুকিং ও বরাদ্দ প্রক্রিয়া' },
                  { id: 'service-legal', label: 'দলিল ও নামজারি সেবা' },
                ] as { id: PublicPage; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigateToPage(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    publicPage === tab.id
                      ? 'bg-[#0B192C] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {publicPage === 'service-emi' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-5">
                <div className="flex items-center gap-2.5">
                  <Calculator className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-xl font-extrabold text-[#0F172A]">
                    প্রপার্টির মূল্য ও কিস্তির মেয়াদ নির্বাচন করুন
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    প্রপার্টি নির্বাচন করুন (ঐচ্ছিক)
                  </label>
                  <select
                    onChange={(e) => {
                      const found = properties.find((p) => String(p.id) === e.target.value);
                      if (found) {
                        setEmiPriceBdt(found.priceBdt);
                        setEmiBookingBdt(found.bookingAmountBdt);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.titleBn} — {p.priceDisplayBn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      প্রপার্টির মোট মূল্য (BDT)
                    </label>
                    <input
                      type="number"
                      value={emiPriceBdt}
                      onChange={(e) => setEmiPriceBdt(Number(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      বুকিং মানি / ডাউন পেমেন্ট (BDT)
                    </label>
                    <input
                      type="number"
                      value={emiBookingBdt}
                      onChange={(e) => setEmiBookingBdt(Number(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    কিস্তির মেয়াদ (Installment Plan)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      'এককালীন পরিশোধ',
                      '২৪ মাসিক কিস্তি',
                      '৩৬ মাসিক কিস্তি',
                      '৬০ মাসিক কিস্তি',
                    ].map((planName) => (
                      <button
                        key={planName}
                        type="button"
                        onClick={() => setEmiPlanChoice(planName)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          emiPlanChoice === planName
                            ? 'bg-[#0B192C] text-white border-[#0B192C]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {planName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#0B192C] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase text-emerald-400">
                    হিসাব বিবরণী
                  </span>
                  <h3 className="text-2xl font-extrabold">আনুমানিক কিস্তির পরিমাণ</h3>

                  <div className="space-y-3 pt-2 text-sm">
                    <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                      <span className="text-slate-300">মোট মূল্য</span>
                      <span className="font-extrabold">
                        {formatExactBdtBengali(emiPriceBdt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                      <span className="text-slate-300">বুকিং মানি জমা</span>
                      <span className="font-extrabold text-emerald-400">
                        {formatExactBdtBengali(emiBookingBdt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                      <span className="text-slate-300">অবশিষ্ট কিস্তিযোগ্য টাকা</span>
                      <span className="font-extrabold">
                        {formatExactBdtBengali(emiCalculation.remainingPrincipalBdt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                      <span className="text-slate-300">মোট কিস্তির সংখ্যা</span>
                      <span className="font-extrabold">
                        {toBengaliDigits(emiCalculation.installmentCount)}টি
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-400/30">
                    <span className="text-xs text-emerald-300 block">প্রতি মাসের কিস্তি</span>
                    <span className="text-2xl font-extrabold text-white mt-0.5 block">
                      {formatExactBdtBengali(emiCalculation.monthlyInstallmentBdt)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigateToPage('properties-all')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  পছন্দের প্রপার্টি বুকিং করুন
                </button>
              </div>
            </div>
          )}

          {publicPage === 'service-booking' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {[
                  {
                    step: 'ধাপ ০১',
                    title: 'প্লট বা ফ্ল্যাট নির্বাচন',
                    desc: 'পছন্দের প্রকল্প থেকে প্লট বা অ্যাপার্টমেন্ট ইউনিট ও ফ্লোর প্ল্যান নির্বাচন করুন।',
                  },
                  {
                    step: 'ধাপ ০২',
                    title: 'আবেদন ও এনআইডি তথ্য',
                    desc: 'ক্রেতার নাম, এনআইডি (NID), নমিনি তথ্য ও কিস্তি প্ল্যান পূরণ করুন।',
                  },
                  {
                    step: 'ধাপ ০৩',
                    title: 'বুকিং মানি ও মানি রিসিট',
                    desc: 'ব্যাংক পে-অর্ডার বা ট্রান্সফারের মাধ্যমে বুকিং মানি জমা দিয়ে তাৎক্ষণিক মানি রিসিট নিন।',
                  },
                  {
                    step: 'ধাপ ০৪',
                    title: 'বরাদ্দপত্র ও চুক্তিপত্র',
                    desc: 'অফিশিয়াল অ্যালটমেন্ট লেটার ও ডিড অফ এগ্রিমেন্ট গ্রহণ করুন।',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="bg-white rounded-2xl p-6 border border-slate-200 space-y-2"
                  >
                    <span className="text-xs font-extrabold text-emerald-700 px-2.5 py-1 rounded-md bg-emerald-50">
                      {item.step}
                    </span>
                    <h3 className="text-lg font-extrabold text-[#0F172A] pt-1">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(renderPropertyCard)}
              </div>
            </div>
          )}

          {publicPage === 'service-legal' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
                <FileCheck2 className="w-8 h-8 text-emerald-600" />
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  সিএস, এসএ, আরএস ও মহানগর জরিপ যাচাই
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  H &amp; H Homes-এর প্রতিটি জমির মূল দলিল, বায়া দলিল, খতিয়ান ও হালনাগাদ খাজনা-খারিজ আমাদের নিজস্ব লিগ্যাল প্যানেল দ্বারা শতভাগ যাচাইকৃত।
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
                <Layers className="w-8 h-8 text-emerald-600" />
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  সাব-কবলা দলিল রেজিস্ট্রেশন ও নামজারি
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  সম্পূর্ণ মূল্য পরিশোধের সাথে সাথে গ্রাহকের নামে সাফ-কবলা রেজিস্ট্রেশন এবং সহকারী কমিশনার (ভূমি) অফিস থেকে একক নামজারি সম্পন্ন করতে সার্বিক সহায়তা প্রদান করা হয়।
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  ব্যাংক লোন ও মর্টগেজ ডকুমেন্টেশন
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  ফ্ল্যাট বা প্লট ক্রয়ে ব্যাংক ও আর্থিক প্রতিষ্ঠান থেকে হোম লোন গ্রহণের জন্য প্রয়োজনীয় সকল অনুমোদনপত্র ও লিগ্যাল ডকুমেন্ট সরবরাহ করা হয়।
                </p>
              </div>
            </div>
          )}
        </main>
      )}

      {/* =========================================================
          CONTACT PAGE (যোগাযোগ)
         ========================================================= */}
      {publicPage === 'contact' && (
        <main className="flex-1 bg-[#0B192C] text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                যোগাযোগ ও প্রধান কার্যালয়
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {companyName}
              </h1>

              <div className="space-y-3 text-sm">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">প্রধান কার্যালয়ের ঠিকানা</span>
                    <span className="font-bold text-base text-white">{officeAddress}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">জমির প্রকল্প লোকেশন</span>
                    <span className="font-bold text-base text-emerald-300">
                      বসুন্ধরা আবাসিক এলাকা, ঢাকা
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">হটলাইন ও হোয়াটসঅ্যাপ</span>
                    <span className="font-bold text-base text-white">{hotline}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">ইমেইল</span>
                    <span className="font-bold text-white">{emailAddress}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">অফিস সময়সূচি</span>
                    <span className="font-semibold text-white">
                      {settings?.officeHoursBn || 'শনিবার – বৃহস্পতিবার: সকাল ১০:০০টা – সন্ধ্যা ৮:০০টা'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white text-[#0F172A] rounded-2xl p-6 sm:p-8 border border-slate-200">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-5">
                জিজ্ঞাসা বা সাইট ভিজিট বুকিং ফর্ম
              </h2>

              {contactStatus && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold">
                  {contactStatus}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">আপনার নাম *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="পূর্ণ নাম লিখুন"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মোবাইল নম্বর *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="০১৭XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল (ঐচ্ছিক)</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">আগ্রহের বিষয়</label>
                    <select
                      value={contactCategory}
                      onChange={(e) => setContactCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="আবাসিক জমি">আবাসিক প্লট</option>
                      <option value="ফ্ল্যাট">ফ্ল্যাট ও অ্যাপার্টমেন্ট</option>
                      <option value="বাণিজ্যিক স্পেস">বাণিজ্যিক প্লট / অফিস স্পেস</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বার্তা *</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="আপনার পছন্দের প্লট বা ফ্ল্যাট সম্পর্কে লিখুন..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  বার্তা পাঠান
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* Multi-Column Corporate Footer with Quick Links to Sub-Pages */}
      <footer className="bg-[#07111E] text-slate-400 py-10 border-t border-white/10 text-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <NazihaLogo variant="light" />
              <p className="text-xs text-slate-400 leading-relaxed">
                প্রধান কার্যালয়: {officeAddress}
              </p>
              <p className="text-xs text-emerald-400 font-semibold">
                হটলাইন: {hotline}
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">প্রকল্প ও প্রপার্টি</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('projects-ongoing')}
                    className="hover:text-white cursor-pointer"
                  >
                    চলমান প্রকল্পসমূহ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('properties-residential-land')}
                    className="hover:text-white cursor-pointer"
                  >
                    আবাসিক প্লট
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('properties-apartments')}
                    className="hover:text-white cursor-pointer"
                  >
                    ফ্ল্যাট ও অ্যাপার্টমেন্ট
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('projects-map')}
                    className="hover:text-white cursor-pointer"
                  >
                    প্রকল্পের লোকেশন ম্যাপ
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">আমাদের সম্পর্কে</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('about-profile')}
                    className="hover:text-white cursor-pointer"
                  >
                    কোম্পানি প্রোফাইল
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('about-chairman')}
                    className="hover:text-white cursor-pointer"
                  >
                    চেয়ারম্যানের বাণী
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('about-md')}
                    className="hover:text-white cursor-pointer"
                  >
                    ব্যবস্থাপনা পরিচালকের বাণী
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('about-board')}
                    className="hover:text-white cursor-pointer"
                  >
                    পরিচালনা পর্ষদ
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">গ্রাহক সেবা ও পোর্টাল</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveView('portal')}
                    className="hover:text-white cursor-pointer"
                  >
                    গ্রাহক পোর্টাল
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('service-emi')}
                    className="hover:text-white cursor-pointer"
                  >
                    কিস্তি ক্যালকুলেটর
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('service-legal')}
                    className="hover:text-white cursor-pointer"
                  >
                    দলিল ও নামজারি সহায়তা
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminMode('realestate_erp');
                      setActiveView('admin');
                    }}
                    className="text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    ম্যানেজমেন্ট প্যানেল
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>সর্বস্বত্ব সংরক্ষিত © ২০২৬ {companyName}</span>
            <span>প্রধান কার্যালয়: {officeAddress}</span>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal for Gallery Page */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80 sm:h-[460px] bg-slate-900">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.titleBn}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-700">{lightboxPhoto.tagBn}</span>
                <h3 className="text-xl font-extrabold text-[#0F172A] mt-0.5">
                  {lightboxPhoto.titleBn}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{lightboxPhoto.locationBn}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLightboxPhoto(null);
                  navigateToPage('contact');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shrink-0 text-center cursor-pointer"
              >
                যোগাযোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Details & Online Booking Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          allProperties={properties}
          projects={projects}
          currentUserUid={customerUser?.uid || 'demo-customer'}
          currentUserEmail={customerUser?.email || ''}
          currentUserName={customerUser?.name || ''}
          initialTab={propertyModalTab}
          onClose={() => setSelectedProperty(null)}
          onSelectProperty={(prop) => setSelectedProperty(prop)}
          onOpenProjectBrochure={(proj) => {
            setSelectedProperty(null);
            setBrochureProject(proj);
            setBrochureOpen(true);
          }}
          onBookingCreated={() => {
            fetchBootstrapData();
          }}
          onGoToPortal={() => {
            setSelectedProperty(null);
            setActiveView('portal');
          }}
        />
      )}

      {/* Official Project Brochure Modal */}
      {brochureOpen && brochureProject && (
        <BrochureModal
          project={brochureProject}
          properties={properties}
          settings={settings}
          onClose={() => setBrochureOpen(false)}
          onSelectProperty={(prop) => {
            setBrochureOpen(false);
            handleOpenProperty(prop, 'details');
          }}
        />
      )}
    </div>
  );
}
