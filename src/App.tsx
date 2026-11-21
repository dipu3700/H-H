/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
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
  Handshake,
  Compass,
  Landmark,
  Home,
  Briefcase,
  Camera,
  MessageSquareQuote,
  Newspaper,
  LayoutGrid,
  Users,
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
  PortalRoleKey,
  RoleSessionUser,
} from './types';
import {
  filterProperties,
  toBengaliDigits,
  formatExactBdtBengali,
  calculateInstallmentPlan,
} from './utils/bengaliLogic';
import {
  HHLogo,
  ArchitecturalRender,
  ExecutivePortrait,
  REAL_ESTATE_PHOTO_COLLECTION,
  PhotoCollectionItem,
  resolveImageUrl,
} from './components/ArchitecturalVisuals';
import { ProjectMapSection } from './components/ProjectMapSection';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { BrochureModal } from './components/BrochureModal';
import { CustomerPortalView } from './components/CustomerPortalView';
import { AdminCmsView, AdminSystemMode, ErpTab } from './components/AdminCmsView';
import { RoleLoginPortalView } from './components/RoleLoginPortalView';
import { ModulesDirectoryPage } from './components/ModulesDirectoryPage';
import { signInWithGoogle, subscribeToAuth } from './lib/firebase';

type ActiveView = 'public' | 'portal' | 'admin' | 'accounts' | 'staff' | 'shareholder';

export type PublicPage =
  | 'home'
  | 'modules'
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
  | 'service-jv'
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
      {
        id: 'service-jv',
        label: 'যৌথ উদ্যোগ (Landowner JV)',
        desc: 'জমিওয়ালাদের সাথে যৌথ উদ্যোগে আধুনিক ভবন নির্মাণ',
      },
      {
        id: 'modules',
        label: 'সকল বিভাগ, হিসাব মডিউল ও আলাদা লগিন',
        desc: 'অ্যাকাউন্টস, স্টাফ, শেয়ারহোল্ডার, কিস্তি ও ইআরপি ডিরেক্টরি',
      },
    ],
  },
  {
    id: 'contact',
    label: 'যোগাযোগ',
    page: 'contact',
  },
];

const getSubItemIcon = (pageId: PublicPage) => {
  switch (pageId) {
    case 'projects-ongoing':
    case 'projects-upcoming':
    case 'projects-completed':
    case 'projects-all':
      return Building2;
    case 'projects-map':
      return Compass;
    case 'properties-residential-land':
    case 'properties-commercial-land':
      return Landmark;
    case 'properties-apartments':
    case 'properties-all':
      return Home;
    case 'about-profile':
      return Briefcase;
    case 'about-chairman':
    case 'about-md':
      return Award;
    case 'about-board':
      return Users;
    case 'about-mission':
      return Target;
    case 'media-gallery':
      return Camera;
    case 'media-testimonials':
      return MessageSquareQuote;
    case 'media-news':
      return Newspaper;
    case 'service-emi':
      return Calculator;
    case 'service-booking':
      return Calendar;
    case 'service-legal':
      return FileCheck2;
    case 'service-jv':
      return Handshake;
    case 'modules':
      return LayoutGrid;
    default:
      return Building2;
  }
};

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('public');
  const [publicPage, setPublicPage] = useState<PublicPage>('home');
  const [adminMode, setAdminMode] = useState<AdminSystemMode>('realestate_erp');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>('about');
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(null);
  const desktopNavRef = useRef<HTMLElement | null>(null);

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

  // Homepage Project Showcase Filter Tab
  const [homeProjectTab, setHomeProjectTab] = useState<'all' | 'চলমান' | 'আসন্ন' | 'সম্পন্ন'>('all');

  // Customer Auth State
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  // Staff / Accounts / Shareholder / Admin Role Auth State
  const [roleSession, setRoleSession] = useState<RoleSessionUser | null>(null);
  const [adminErpTab, setAdminErpTab] = useState<ErpTab>('মানি রিসিট ও কিস্তি আদায়');

  // Search Filter State
  const [searchCategory, setSearchCategory] = useState('সকল ধরন');
  const [searchArea, setSearchArea] = useState('সকল এলাকা');
  const [searchProject, setSearchProject] = useState('all');
  const [maxBudget, setMaxBudget] = useState(0);

  // Gallery Filter & Lightbox
  const [photoFilter, setPhotoFilter] = useState<'all' | 'land' | 'building'>('all');
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoCollectionItem | null>(null);

  // EMI Calculator State
  const [emiPriceBdt, setEmiPriceBdt] = useState<number>(4500000);
  const [emiBookingBdt, setEmiBookingBdt] = useState<number>(500000);
  const [emiPlanChoice, setEmiPlanChoice] = useState<string>('৩৬ মাসিক কিস্তি');

  // Modals
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [propertyModalTab, setPropertyModalTab] = useState<'details' | 'book' | 'inquiry'>('details');
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [brochureProject, setBrochureProject] = useState<ProjectItem | null>(null);

  // Contact / Landowner JV Form State
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

  // Ensure document title & favicon always reflect H & H Homes
  useEffect(() => {
    document.title =
      settings?.seoTitle || 'H & H Homes | এইচ অ্যান্ড এইচ হোমস — বনশ্রী, ঢাকা';
    const existingIcon = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (existingIcon) {
      existingIcon.href = '/favicon.svg?v=hh2026';
    }
  }, [settings?.seoTitle]);

  // Support URL hash & path routing for portals, modules directory, and ERP deep-links
  const applyRouteTarget = (targetRaw: string) => {
    const target = targetRaw.trim().toLowerCase();
    if (target === '#modules' || target === '/modules') {
      setActiveView('public');
      setPublicPage('modules');
      return;
    }
    if (target === '#portal' || target === '/portal') {
      setActiveView('portal');
      return;
    }
    if (target === '#accounts' || target === '/accounts') {
      setActiveView('accounts');
      return;
    }
    if (target === '#staff' || target === '/staff') {
      setActiveView('staff');
      return;
    }
    if (target === '#shareholder' || target === '/shareholder') {
      setActiveView('shareholder');
      return;
    }
    if (target === '#admin' || target === '/admin') {
      setAdminMode('realestate_erp');
      setActiveView('admin');
      return;
    }
    if (target.startsWith('#erp/')) {
      const moduleKey = target.replace('#erp/', '');
      const erpTabMap: Record<string, ErpTab> = {
        accounts: 'হিসাব ও ব্যাংক অ্যাকাউন্ট',
        expenses: 'আয়-ব্যয় ও খরচ বিশ্লেষণ',
        shares: 'শেয়ার ভিত্তিক হিসাব',
        staff: 'স্টাফ ও বেতন (HR)',
        receipts: 'মানি রিসিট ও কিস্তি আদায়',
        projects: 'মাস্টার প্রজেক্ট এন্ট্রি',
        properties: 'মাস্টার প্রপার্টি ইনভেন্টরি',
      };
      if (erpTabMap[moduleKey]) {
        setAdminErpTab(erpTabMap[moduleKey]);
      }
      setAdminMode('realestate_erp');
      setActiveView('admin');
    }
  };

  useEffect(() => {
    const checkRoute = () => {
      const currentHash = window.location.hash;
      const currentPath = window.location.pathname;
      if (currentHash) {
        applyRouteTarget(currentHash);
      } else if (
        ['/modules', '/portal', '/accounts', '/staff', '/shareholder', '/admin'].includes(
          currentPath.toLowerCase()
        )
      ) {
        applyRouteTarget(currentPath);
      }
    };
    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDesktopDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target as Node)) {
        setOpenDesktopDropdown(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const homeFilteredProjects =
    homeProjectTab === 'all'
      ? projects
      : projects.filter((p) => p.statusBn === homeProjectTab);

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
          window.location.hash = '#admin';
          setAdminMode('realestate_erp');
          setActiveView('admin');
        }}
      />
    );
  }

  if (activeView === 'accounts' || activeView === 'staff' || activeView === 'shareholder') {
    const activeRole = activeView as PortalRoleKey;
    return (
      <RoleLoginPortalView
        role={activeRole}
        sessionUser={roleSession}
        onAuthenticated={(session) => setRoleSession(session)}
        onLogout={() => setRoleSession(null)}
        onSwitchRole={(nextRole) => {
          const hashByRole: Record<PortalRoleKey, string> = {
            accounts: '#accounts',
            staff: '#staff',
            shareholder: '#shareholder',
            admin: '#admin',
          };
          window.location.hash = hashByRole[nextRole];
          setActiveView(nextRole);
        }}
        onOpenCustomerPortal={() => {
          window.location.hash = '#portal';
          setActiveView('portal');
        }}
        onOpenModulesDirectory={() => {
          window.location.hash = '#modules';
          setActiveView('public');
          setPublicPage('modules');
        }}
        onBackToHome={() => {
          window.location.hash = '';
          setActiveView('public');
          setPublicPage('home');
        }}
      />
    );
  }

  if (activeView === 'admin') {
    if (roleSession?.role !== 'admin') {
      return (
        <RoleLoginPortalView
          role="admin"
          sessionUser={roleSession}
          onAuthenticated={(session) => {
            setRoleSession(session);
            if (session.role === 'admin') {
              setActiveView('admin');
            } else {
              setActiveView(session.role);
            }
          }}
          onLogout={() => setRoleSession(null)}
          onSwitchRole={(nextRole) => {
            const hashByRole: Record<PortalRoleKey, string> = {
              accounts: '#accounts',
              staff: '#staff',
              shareholder: '#shareholder',
              admin: '#admin',
            };
            window.location.hash = hashByRole[nextRole];
            setActiveView(nextRole);
          }}
          onOpenCustomerPortal={() => {
            window.location.hash = '#portal';
            setActiveView('portal');
          }}
          onOpenModulesDirectory={() => {
            window.location.hash = '#modules';
            setActiveView('public');
            setPublicPage('modules');
          }}
          onBackToHome={() => {
            window.location.hash = '';
            setActiveView('public');
            setPublicPage('home');
          }}
        />
      );
    }

    return (
      <AdminCmsView
        initialMode={adminMode}
        initialErpTab={adminErpTab}
        currentStaffRole={roleSession}
        onLogout={() => setRoleSession(null)}
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
    <article
      key={prop.id}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-[#C6A15B] shadow-xs hover:shadow-[0_18px_36px_-18px_rgba(11,22,44,0.22)] transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        <div className="h-56 relative overflow-hidden bg-slate-900">
          <ArchitecturalRender theme={prop.imageType} label={prop.categoryBn} hideBadge={true} />
        </div>
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs font-bold tabular-nums-bn">
            <span className="text-slate-500">
              কোড: {prop.propertyCode} · {prop.sizeBn}
            </span>
            <span className="text-emerald-700 shrink-0">{prop.statusBn}</span>
          </div>
          <h3 className="text-lg font-extrabold text-[#0B162C] leading-snug group-hover:text-emerald-800 transition-colors">
            {prop.titleBn}
          </h3>
          <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#9A7432] shrink-0" />
            <span>{prop.locationBn}</span>
          </p>
          <div className="pt-3 flex items-baseline justify-between border-t border-slate-100 tabular-nums-bn">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">মোট মূল্য</span>
              <span className="text-lg font-extrabold text-[#0B162C]">
                {prop.priceDisplayBn}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 block">বুকিং মানি</span>
              <span className="text-sm font-bold text-emerald-700">
                {prop.bookingDisplayBn}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => handleOpenProperty(prop, 'details')}
          className="py-2.5 px-3 rounded-xl border border-slate-300 bg-[#FAF8F4] hover:bg-slate-100 text-[#0B162C] text-xs font-bold transition-colors cursor-pointer"
        >
          বিস্তারিত দেখুন
        </button>
        <button
          type="button"
          onClick={() => handleOpenProperty(prop, 'book')}
          className="py-2.5 px-3 rounded-xl bg-[#0B162C] hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          বুকিং করুন
        </button>
      </div>
    </article>
  );

  const renderProjectCard = (proj: ProjectItem) => (
    <article
      key={proj.id}
      className="rounded-2xl overflow-hidden border border-slate-200/90 hover:border-[#C6A15B] bg-white flex flex-col sm:flex-row shadow-xs hover:shadow-[0_18px_36px_-18px_rgba(11,22,44,0.2)] transition-all duration-300 group"
    >
      <div className="sm:w-2/5 h-56 sm:h-auto relative shrink-0 overflow-hidden bg-slate-900">
        <ArchitecturalRender theme={proj.imageType} label={proj.statusBn} hideBadge={true} />
      </div>
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-bold">
            <span className="text-emerald-700">
              {proj.categoryBn} · <span className="text-[#9A7432]">{proj.statusBn}</span>
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-[#0B162C] group-hover:text-emerald-800 transition-colors">
            {proj.nameBn}
          </h3>
          <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#9A7432] shrink-0" />
            <span>{proj.locationBn}</span>
          </p>
          <p className="text-sm text-slate-600 pt-1 leading-relaxed line-clamp-2">
            {proj.descriptionBn}
          </p>
          <p className="text-xs font-bold text-[#0B162C] pt-1 tabular-nums-bn">
            আকার: {proj.sizeSummaryBn} · {proj.priceSummaryBn}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setBrochureProject(proj);
              setBrochureOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B162C] text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#E5C989]" />
            <span>ব্রোশিওর ও স্পেসিফিকেশন</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchProject(String(proj.id));
              navigateToPage('properties-all');
            }}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-300 text-[#0B162C] hover:bg-[#FAF8F4] text-xs font-bold transition-colors cursor-pointer"
          >
            <span>ইউনিটসমূহ দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );

  const renderSubPageHero = ({
    sectionLabel,
    title,
    subtitle,
    tabs,
    onSelectTab,
  }: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    tabs?: { id: PublicPage; label: string }[];
    onSelectTab?: (id: PublicPage) => void;
  }) => (
    <>
      <section className="bg-[#0B162C] text-white border-b border-[#C6A15B]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-12 space-y-3">
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-300 font-semibold">
            <button
              type="button"
              onClick={() => navigateToPage('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              হোম
            </button>
            <span className="text-[#C6A15B]">/</span>
            <span>{sectionLabel}</span>
            <span className="text-[#C6A15B]">/</span>
            <span className="text-[#E5C989]">{title}</span>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </section>

      {tabs && tabs.length > 0 && (
        <div className="bg-white border-b border-slate-200 sticky top-14 sm:top-[74px] z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const active = publicPage === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    onSelectTab ? onSelectTab(tab.id) : navigateToPage(tab.id)
                  }
                  className={`py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    active
                      ? 'border-[#0B162C] text-[#0B162C]'
                      : 'border-transparent text-slate-500 hover:text-[#0B162C]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#0B162C] flex flex-col pb-16 lg:pb-0">
      {/* Corporate Sticky Header — Refined Architectural 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 border-t-2 border-t-[#0B162C]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-[74px] flex items-center justify-between gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => navigateToPage('home')}
            className="focus:outline-none cursor-pointer text-left shrink-0 min-w-0"
          >
            <HHLogo variant="dark" compact />
          </button>

          {/* Desktop Multi-Page & Structured Dropdown Navigation */}
          <nav
            ref={desktopNavRef}
            aria-label="প্রধান নেভিগেশন"
            className="hidden lg:flex items-center gap-2 xl:gap-4 text-sm font-bold"
          >
            {NAVIGATION_MENU.map((item) => {
              const active = isMenuGroupActive(item);
              const isOpen = openDesktopDropdown === item.id;

              if (!item.children) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => item.page && navigateToPage(item.page)}
                    className={`relative px-2 py-2.5 whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                      active
                        ? 'border-[#C6A15B] text-[#0B162C]'
                        : 'border-transparent text-slate-600 hover:text-[#0B162C]'
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
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenDesktopDropdown(isOpen ? null : item.id)
                    }
                    className={`inline-flex items-center gap-1 px-2 py-2.5 whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                      active || isOpen
                        ? 'border-[#C6A15B] text-[#0B162C]'
                        : 'border-transparent text-slate-600 hover:text-[#0B162C]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#9A7432]' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 top-full pt-2.5 w-[360px] z-50 dropdown-reveal">
                      <div className="bg-white rounded-2xl shadow-[0_24px_48px_-14px_rgba(11,22,44,0.22)] border border-slate-200/90 overflow-hidden">
                        <div className="px-4 py-2.5 bg-[#0B162C] text-white flex items-center justify-between">
                          <span className="text-xs font-extrabold tracking-wide text-[#E5C989]">
                            {item.label}
                          </span>
                          <span className="text-[11px] text-slate-300 font-medium">
                            {companyName}
                          </span>
                        </div>
                        <div className="p-2 space-y-1">
                          {item.children.map((sub) => {
                            const subActive = publicPage === sub.id;
                            const SubIcon = getSubItemIcon(sub.id);
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => navigateToPage(sub.id)}
                                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors cursor-pointer flex items-start gap-3 group/sub ${
                                  subActive
                                    ? 'bg-[#FAF8F4] text-[#0B162C] ring-1 ring-[#C6A15B]/50'
                                    : 'hover:bg-[#FAF8F4] text-[#0B162C]'
                                }`}
                              >
                                <div
                                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                    subActive
                                      ? 'bg-[#0B162C] text-[#E5C989]'
                                      : 'bg-slate-100 text-slate-700 group-hover/sub:bg-[#0B162C] group-hover/sub:text-[#E5C989]'
                                  }`}
                                >
                                  <SubIcon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="font-extrabold text-sm block leading-snug">
                                    {sub.label}
                                  </span>
                                  <span className="text-xs text-slate-500 font-normal block mt-0.5 leading-snug">
                                    {sub.desc}
                                  </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover/sub:text-[#9A7432] shrink-0 mt-1 transition-colors" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action Zone: Single Crisp Customer Portal CTA + Mobile Menu Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('portal')}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{customerUser ? customerUser.name.split(' ')[0] : 'গ্রাহক পোর্টাল'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="মেনু"
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-[#0B162C] hover:bg-slate-100 active:scale-95 transition-transform cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Native Mobile Bottom-Sheet Drawer Menu with Architectural Header & Sub-Pages */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-[#07111E]/75 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-t border-[#C6A15B]/40 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dark Navy Drag Handle & Sheet Header */}
            <div className="bg-[#0B162C] text-white pt-2.5 pb-4 px-4 flex flex-col">
              <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#E5C989] block">
                    H &amp; H Homes · বনশ্রী, ঢাকা
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    নেভিগেশন ও গ্রাহক সেবা মেনু
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="মেনু বন্ধ করুন"
                  className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Sheet Body */}
            <div className="p-4 space-y-3.5 overflow-y-auto bg-[#FAF8F4]">
              {/* 4 Quick App Shortcut Tiles */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigateToPage('service-emi')}
                  className="p-3 rounded-xl bg-white border border-slate-200/90 text-left flex items-center gap-2.5"
                >
                  <Calculator className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-xs font-extrabold text-[#0B162C] block">কিস্তি ক্যালকুলেটর</span>
                    <span className="text-[10px] text-slate-500 block">মাসিক কিস্তির হিসাব</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToPage('projects-map')}
                  className="p-3 rounded-xl bg-white border border-slate-200/90 text-left flex items-center gap-2.5"
                >
                  <Compass className="w-5 h-5 text-[#9A7432] shrink-0" />
                  <div>
                    <span className="text-xs font-extrabold text-[#0B162C] block">লোকেশন ম্যাপ</span>
                    <span className="text-[10px] text-slate-500 block">বসুন্ধরা ও বনশ্রী</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToPage('properties-residential-land')}
                  className="p-3 rounded-xl bg-white border border-slate-200/90 text-left flex items-center gap-2.5"
                >
                  <Landmark className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-xs font-extrabold text-[#0B162C] block">আবাসিক প্লট</span>
                    <span className="text-[10px] text-slate-500 block">বসুন্ধরা আবাসিক এলাকা</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToPage('properties-apartments')}
                  className="p-3 rounded-xl bg-white border border-slate-200/90 text-left flex items-center gap-2.5"
                >
                  <Home className="w-5 h-5 text-[#0B162C] shrink-0" />
                  <div>
                    <span className="text-xs font-extrabold text-[#0B162C] block">ফ্ল্যাট ও ভবন</span>
                    <span className="text-[10px] text-slate-500 block">বনশ্রী রেসিডেন্সি</span>
                  </div>
                </button>
              </div>

              {/* Accordion Menu Items */}
              <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden">
                {NAVIGATION_MENU.map((item) => {
                  if (!item.children) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => item.page && navigateToPage(item.page)}
                        className={`w-full px-4 py-3.5 text-left font-bold text-sm flex items-center justify-between ${
                          publicPage === item.page
                            ? 'bg-emerald-50 text-emerald-900'
                            : 'text-[#0B162C]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    );
                  }

                  const expanded = openMobileGroup === item.id;
                  return (
                    <div key={item.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMobileGroup(expanded ? null : item.id)
                        }
                        className="w-full px-4 py-3.5 flex items-center justify-between font-bold text-sm text-[#0B162C]"
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 transition-transform ${
                            expanded ? 'rotate-180 text-[#9A7432]' : ''
                          }`}
                        />
                      </button>
                      {expanded && (
                        <div className="px-3 pb-3 space-y-1 bg-[#FAF8F4]">
                          {item.children.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => navigateToPage(sub.id)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between ${
                                publicPage === sub.id
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-white text-slate-700 border border-slate-200/60'
                              }`}
                            >
                              <span>{sub.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.hash = '#portal';
                      setActiveView('portal');
                    }}
                    className="py-3 px-3 rounded-xl bg-emerald-600 text-white text-xs font-extrabold text-center"
                  >
                    গ্রাহক পোর্টাল লগইন
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.hash = '#modules';
                      navigateToPage('modules');
                    }}
                    className="py-3 px-3 rounded-xl bg-white text-[#0B162C] border border-slate-300 text-xs font-extrabold text-center"
                  >
                    সকল বিভাগ ও পোর্টাল
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.hash = '#accounts';
                      setActiveView('accounts');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#0B162C] text-emerald-300 text-xs font-bold text-center"
                  >
                    হিসাব ও অ্যাকাউন্টস
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.hash = '#admin';
                      setAdminMode('realestate_erp');
                      setActiveView('admin');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#0B162C] text-[#E5C989] text-xs font-bold text-center"
                  >
                    ম্যানেজমেন্ট ইআরপি
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PAGE 1: HOME PAGE (হোম)
          Hero Banner strictly shows ONLY Project Photo + Project Name.
         ========================================================= */}
      {publicPage === 'home' && (
        <main className="flex-1">
          {/* Hero Banner — ONLY Project Photo and Project Name */}
          <section className="relative bg-[#0B162C] overflow-hidden">
            <div className="relative h-[270px] sm:h-[460px] lg:h-[580px] w-full">
              <ArchitecturalRender
                theme={activeSlide.visualTheme}
                hideBadge={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07111E]/95 via-[#07111E]/25 to-black/10" />

              {/* Project Name Only */}
              <div className="absolute bottom-9 sm:bottom-14 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end justify-between gap-4">
                <div className="space-y-2.5 max-w-3xl">
                  <div className="w-12 sm:w-16 h-0.5 bg-[#C6A15B]" />
                  <h1 className="text-xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-md leading-tight">
                    {activeSlide.titleBn}
                  </h1>
                </div>

                {heroSlides.length > 1 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-bold text-[#E5C989] tabular-nums-bn mr-1">
                      ০{toBengaliDigits(currentSlideIndex + 1)} / ০{toBengaliDigits(heroSlides.length)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentSlideIndex(
                          (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
                        )
                      }
                      aria-label="পূর্ববর্তী"
                      className="p-2 sm:p-2.5 rounded-xl bg-[#0B162C]/70 hover:bg-[#0B162C] text-white border border-white/25 backdrop-blur-xs transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length)
                      }
                      aria-label="পরবর্তী"
                      className="p-2 sm:p-2.5 rounded-xl bg-[#0B162C]/70 hover:bg-[#0B162C] text-white border border-white/25 backdrop-blur-xs transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Floating Smart Property Finder Bar */}
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-6 sm:-mt-9 relative z-20">
            <div className="bg-white rounded-2xl shadow-[0_20px_50px_-15px_rgba(11,22,44,0.16)] border border-slate-200/90 p-3.5 sm:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-0 lg:divide-x lg:divide-slate-200 items-end">
                <div className="lg:pr-5">
                  <label className="block text-[11px] sm:text-xs font-bold text-[#0B162C] mb-1.5">
                    প্রপার্টির ধরন
                  </label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-[#FAF8F4] text-[#0B162C] focus:outline-none focus:border-[#0B162C]"
                  >
                    <option value="সকল ধরন">সকল ধরন</option>
                    <option value="আবাসিক জমি">আবাসিক প্লট</option>
                    <option value="বাণিজ্যিক জমি">বাণিজ্যিক প্লট</option>
                    <option value="ফ্ল্যাট">ফ্ল্যাট ও অ্যাপার্টমেন্ট</option>
                  </select>
                </div>

                <div className="lg:px-5">
                  <label className="block text-[11px] sm:text-xs font-bold text-[#0B162C] mb-1.5">
                    লোকেশন / এলাকা
                  </label>
                  <select
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                    className="w-full px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-[#FAF8F4] text-[#0B162C] focus:outline-none focus:border-[#0B162C]"
                  >
                    <option value="সকল এলাকা">সকল এলাকা</option>
                    {uniqueAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:px-5">
                  <label className="block text-[11px] sm:text-xs font-bold text-[#0B162C] mb-1.5">
                    সর্বোচ্চ বাজেট
                  </label>
                  <select
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-[#FAF8F4] text-[#0B162C] focus:outline-none focus:border-[#0B162C]"
                  >
                    <option value={0}>যেকোনো বাজেট</option>
                    <option value={5000000}>৳ ৫০ লক্ষ পর্যন্ত</option>
                    <option value={15000000}>৳ ১.৫০ কোটি পর্যন্ত</option>
                    <option value={30000000}>৳ ৩.০০ কোটি পর্যন্ত</option>
                  </select>
                </div>

                <div className="lg:pl-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('featured-properties');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-[#0B162C] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E5C989]" />
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
                      className="py-2.5 sm:py-3 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      রিসেট
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Architectural Corporate Ledger Ribbon */}
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-2 sm:pb-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-200/80 overflow-hidden shadow-xs">
              {[
                {
                  num: '০১',
                  metric: '১২+ বছর',
                  title: 'আবাসন ও ল্যান্ড ব্যাংকিং অভিজ্ঞতা',
                  sub: 'আস্থা ও স্বচ্ছতার শীর্ষে',
                },
                {
                  num: '০২',
                  metric: '১০০% নিষ্কণ্টক',
                  title: 'দলিল ও নামজারি নিশ্চয়তা',
                  sub: 'সিএস, আরএস ও খতিয়ান যাচাইকৃত',
                },
                {
                  num: '০৩',
                  metric: 'বসুন্ধরা ও বনশ্রী',
                  title: 'প্রাইম ডেভেলপমেন্ট জোন',
                  sub: 'ঢাকার সেরা আবাসিক লোকেশন',
                },
                {
                  num: '০৪',
                  metric: 'BNBC কোড',
                  title: 'ভূমিকম্প-সহনীয় স্থাপত্য',
                  sub: 'আধুনিক প্রকৌশল ও গুণগত মান',
                },
              ].map((stat) => (
                <div
                  key={stat.metric}
                  className="p-4 sm:p-6 flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-xl font-extrabold text-emerald-700 tabular-nums-bn">
                      {stat.metric}
                    </span>
                    <span className="text-xs font-extrabold text-[#9A7432] tabular-nums-bn">
                      {stat.num}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#0B162C]">
                      {stat.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Signature Projects Showcase */}
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6 sm:space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  সিগনেচার ডেভেলপমেন্ট · {companyName}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B162C] mt-1">
                  আমাদের প্রকল্পসমূহ
                </h2>
              </div>

              {/* Project Status Tabs — Clean Architectural Underline Filter */}
              <div className="flex items-center gap-5 overflow-x-auto no-scrollbar max-w-full">
                {(
                  [
                    { id: 'all', label: 'সকল প্রকল্প' },
                    { id: 'চলমান', label: 'চলমান' },
                    { id: 'আসন্ন', label: 'আসন্ন' },
                    { id: 'সম্পন্ন', label: 'সম্পন্ন' },
                  ] as { id: 'all' | 'চলমান' | 'আসন্ন' | 'সম্পন্ন'; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setHomeProjectTab(tab.id)}
                    className={`pb-2 text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                      homeProjectTab === tab.id
                        ? 'border-[#0B162C] text-[#0B162C]'
                        : 'border-transparent text-slate-500 hover:text-[#0B162C]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {homeFilteredProjects.map(renderProjectCard)}
            </div>
          </section>

          {/* Prime Location Zones Spotlight (Bashundhara Land Plots vs Banasree Apartments) */}
          <section className="bg-[#0B162C] text-white py-14 sm:py-16 border-y border-[#C6A15B]/25">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E5C989]">
                    প্রাইম লোকেশন জোন · ঢাকা
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    বসুন্ধরায় আবাসিক প্লট ও বনশ্রীতে আধুনিক অ্যাপার্টমেন্ট
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToPage('projects-map')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-[#E5C989] cursor-pointer self-start sm:self-auto transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  <span>লোকেশন ম্যাপে দেখুন</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Zone 1: Bashundhara Land Zone */}
                <div className="rounded-2xl bg-[#11203B] border border-white/10 border-t-2 border-t-emerald-400 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                      <span>ল্যান্ড ও প্লট জোন · বসুন্ধরা আবাসিক এলাকা, ঢাকা</span>
                      <span className="text-slate-400 tabular-nums-bn">০১</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                      বসুন্ধরা আবাসিক এলাকায় নিষ্কণ্টক রেডি প্লট
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      বসুন্ধরা আবাসিক এলাকার ব্লক-আই, ব্লক-এম ও মেইন অ্যাভিনিউতে ৪০ ও ৬০ ফুট প্রশস্ত সড়ক সংলগ্ন ৩, ৫ ও ১০ কাঠার প্রস্তুত আবাসিক ও বাণিজ্যিক প্লট। এককালীন ও সহজ কিস্তিতে রেজিস্ট্রেশন সুবিধা।
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => navigateToPage('properties-residential-land')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      আবাসিক প্লট দেখুন
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToPage('properties-commercial-land')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      বাণিজ্যিক প্লট দেখুন
                    </button>
                  </div>
                </div>

                {/* Zone 2: Banasree Apartment & Head Office Zone */}
                <div className="rounded-2xl bg-[#11203B] border border-white/10 border-t-2 border-t-[#C6A15B] p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#E5C989]">
                      <span>অ্যাপার্টমেন্ট ও হেড অফিস · রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা</span>
                      <span className="text-slate-400 tabular-nums-bn">০২</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                      বনশ্রীতে লাক্সারি ফ্ল্যাট, পেন্টহাউস ও কমার্শিয়াল স্পেস
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      বনশ্রী ব্লক-সি, রোড-৪ এ আমাদের প্রধান কার্যালয় ও সিগনেচার আবাসিক ভবনসমূহে ১৭৫০ থেকে ২৮৫০ বর্গফুটের আধুনিক ৩ ও ৪ বেডরুমের অ্যাপার্টমেন্ট, ডুপ্লেক্স পেন্টহাউস ও বাণিজ্যিক ফ্লোর।
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => navigateToPage('properties-apartments')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      ফ্ল্যাট ও অ্যাপার্টমেন্ট দেখুন
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToPage('contact')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      বনশ্রী অফিসের ঠিকানা
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Properties Inventory Grid */}
          <section id="featured-properties" className="py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
              <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    প্লট ও অ্যাপার্টমেন্ট ইনভেন্টরি
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B162C] mt-1">
                    নির্বাচিত প্রপার্টি সমূহ
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToPage('properties-all')}
                  className="text-sm font-extrabold text-[#0B162C] hover:text-emerald-700 inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <span>সকল প্রপার্টি দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="p-10 text-center text-slate-500 font-bold">লোড হচ্ছে...</div>
              ) : filteredProperties.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-600 font-semibold">
                  এই ফিল্টারে কোনো প্রপার্টি পাওয়া যায়নি।
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map(renderPropertyCard)}
                </div>
              )}
            </div>
          </section>

          {/* Landowner Joint Venture & Architectural Excellence Section */}
          <section className="bg-white border-t border-slate-200 py-14 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  যৌথ উদ্যোগে ভবন নির্মাণ · Landowner Joint Venture
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B162C] leading-snug">
                  আপনার মূল্যবান জমিতে আধুনিক ভবন নির্মাণে H &amp; H Homes আপনার বিশ্বস্ত অংশীদার
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  বনশ্রী, বসুন্ধরা, আফতাবনগর, উত্তরা বা ঢাকার প্রাইম আবাসিক এলাকায় আপনার জমিতে রাজউক অনুমোদিত আধুনিক বহুতল ভবন নির্মাণের জন্য আমাদের অভিজ্ঞ প্রকৌশলী ও স্থাপত্য টিমের সাথে যৌথ উদ্যোগে (Joint Venture) যুক্ত হোন।
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigateToPage('service-jv')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0B162C] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    <Handshake className="w-4 h-4 text-[#E5C989]" />
                    <span>জয়েন্ট ভেঞ্চার প্রস্তাব পাঠান</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToPage('service-emi')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-[#FAF8F4] hover:bg-slate-100 text-[#0B162C] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    <Calculator className="w-4 h-4 text-emerald-700" />
                    <span>কিস্তি ক্যালকুলেটর</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#FAF8F4] rounded-2xl border border-slate-200/90 divide-y divide-slate-200/80">
                {[
                  {
                    num: '০১',
                    title: 'রাজউক প্ল্যান ও সর্বোচ্চ FAR অনুমোদন',
                    desc: 'অভিজ্ঞ স্থপতি ও স্ট্রাকচারাল ইঞ্জিনিয়ার দ্বারা সর্বোচ্চ ব্যবহারযোগ্য ফ্লোর স্পেস ও আধুনিক নকশা।',
                  },
                  {
                    num: '০২',
                    title: 'প্রথম শ্রেণির উপাদান ও BNBC মানদণ্ড',
                    desc: 'সর্বাধুনিক স্ট্রাকচারাল সেফটি, ভূমিকম্প-সহনীয় ফাউন্ডেশন ও মানসম্মত ফিটিংস।',
                  },
                  {
                    num: '০৩',
                    title: 'চুক্তিবদ্ধ সময়ে শতভাগ হস্তান্তর',
                    desc: 'জমির মালিকের অংশ বুঝিয়ে দেওয়া ও স্বচ্ছ আইনি নথিপত্রের পূর্ণ নিশ্চয়তা।',
                  },
                ].map((pillar) => (
                  <div key={pillar.num} className="p-5 flex items-start gap-4">
                    <span className="text-sm font-extrabold text-[#9A7432] tabular-nums-bn pt-0.5 shrink-0">
                      {pillar.num}.
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0B162C]">{pillar.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">{pillar.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
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
        <main className="flex-1 bg-[#FAF8F4]">
          {renderSubPageHero({
            sectionLabel: 'প্রকল্পসমূহ',
            title:
              publicPage === 'projects-ongoing'
                ? 'চলমান প্রকল্পসমূহ'
                : publicPage === 'projects-upcoming'
                ? 'আসন্ন প্রকল্পসমূহ'
                : publicPage === 'projects-completed'
                ? 'সম্পন্ন প্রকল্পসমূহ'
                : 'সকল প্রকল্প তালিকা',
            subtitle:
              'বসুন্ধরা আবাসিক এলাকায় পরিকল্পিত জমি ও বনশ্রীতে আধুনিক আবাসিক ও বাণিজ্যিক ভবন প্রকল্প।',
            tabs: [
              { id: 'projects-all', label: 'সকল প্রকল্প' },
              { id: 'projects-ongoing', label: 'চলমান' },
              { id: 'projects-upcoming', label: 'আসন্ন' },
              { id: 'projects-completed', label: 'সম্পন্ন' },
              { id: 'projects-map', label: 'লোকেশন ম্যাপ' },
            ],
          })}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
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
          </div>
        </main>
      )}

      {/* PROJECTS MAP SUB-PAGE */}
      {publicPage === 'projects-map' && (
        <main className="flex-1 bg-[#FAF8F4]">
          {renderSubPageHero({
            sectionLabel: 'প্রকল্পসমূহ',
            title: 'প্রকল্পের লোকেশন ম্যাপ',
            subtitle:
              'বসুন্ধরা আবাসিক এলাকা ও বনশ্রী ব্লক-সি জুড়ে আমাদের চলমান ও আসন্ন প্রকল্পগুলোর অবস্থান।',
            tabs: [
              { id: 'projects-all', label: 'সকল প্রকল্প' },
              { id: 'projects-ongoing', label: 'চলমান' },
              { id: 'projects-upcoming', label: 'আসন্ন' },
              { id: 'projects-completed', label: 'সম্পন্ন' },
              { id: 'projects-map', label: 'লোকেশন ম্যাপ' },
            ],
          })}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <ProjectMapSection
              projects={projects}
              onSelectProjectForBrochure={(proj: ProjectItem) => {
                setBrochureProject(proj);
                setBrochureOpen(true);
              }}
            />
          </div>
        </main>
      )}

      {/* =========================================================
          PROPERTIES SUB-PAGES (প্রপার্টি > সাব পেজ)
         ========================================================= */}
      {(publicPage === 'properties-all' ||
        publicPage === 'properties-residential-land' ||
        publicPage === 'properties-commercial-land' ||
        publicPage === 'properties-apartments') && (
        <main className="flex-1 bg-[#FAF8F4]">
          {renderSubPageHero({
            sectionLabel: 'প্রপার্টি ইনভেন্টরি',
            title:
              publicPage === 'properties-residential-land'
                ? 'আবাসিক প্লট'
                : publicPage === 'properties-commercial-land'
                ? 'বাণিজ্যিক প্লট'
                : publicPage === 'properties-apartments'
                ? 'ফ্ল্যাট ও অ্যাপার্টমেন্ট'
                : 'সকল প্রপার্টি ইনভেন্টরি',
            subtitle:
              'নিষ্কণ্টক দলিল ও তাৎক্ষণিক বুকিং সুবিধাসম্পন্ন প্লট, ফ্ল্যাট ও কর্পোরেট স্পেসের তালিকা।',
            tabs: [
              { id: 'properties-all', label: 'সকল প্রপার্টি' },
              { id: 'properties-residential-land', label: 'আবাসিক প্লট' },
              { id: 'properties-commercial-land', label: 'বাণিজ্যিক প্লট' },
              { id: 'properties-apartments', label: 'ফ্ল্যাট ও অ্যাপার্টমেন্ট' },
            ],
            onSelectTab: (tabId) => {
              setSearchProject('all');
              navigateToPage(tabId);
            },
          })}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
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
        <main className="flex-1 bg-[#FAF8F4]">
          {renderSubPageHero({
            sectionLabel: 'আমাদের সম্পর্কে',
            title:
              publicPage === 'about-profile'
                ? 'কোম্পানি প্রোফাইল'
                : publicPage === 'about-chairman'
                ? 'মাননীয় চেয়ারম্যানের বাণী'
                : publicPage === 'about-md'
                ? 'ব্যবস্থাপনা পরিচালকের বাণী'
                : publicPage === 'about-board'
                ? 'পরিচালনা পর্ষদ'
                : 'লক্ষ্য, উদ্দেশ্য ও মূল্যবোধ',
            subtitle:
              'স্বচ্ছ দলিল, নির্ধারিত সময়ে হস্তান্তর ও ডিজিটাল গ্রাহক সেবার মাধ্যমে আস্থার প্রতীক H & H Homes।',
            tabs: [
              { id: 'about-profile', label: 'কোম্পানি প্রোফাইল' },
              { id: 'about-chairman', label: 'চেয়ারম্যানের বাণী' },
              { id: 'about-md', label: 'ব্যবস্থাপনা পরিচালকের বাণী' },
              { id: 'about-board', label: 'পরিচালনা পর্ষদ' },
              { id: 'about-mission', label: 'লক্ষ্য ও উদ্দেশ্য' },
            ],
          })}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {/* SUB-PAGE: COMPANY PROFILE */}
            {publicPage === 'about-profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 space-y-6">
                  <div className="space-y-2 border-b border-slate-100 pb-5">
                    <span className="text-xs font-extrabold text-emerald-700">
                      কর্পোরেট পরিচিতি
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B162C]">
                      {companyName} — আস্থা, স্বচ্ছ দলিল ও আধুনিক নির্মাণের প্রতিষ্ঠান
                    </h2>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    {settings?.aboutIntroBn ||
                      'H & H Homes (এইচ অ্যান্ড এইচ হোমস) বসুন্ধরা আবাসিক এলাকায় পরিকল্পিত আবাসিক জমির প্লট এবং বনশ্রীতে আধুনিক অ্যাপার্টমেন্ট ভবন নির্মাণে স্বচ্ছতা, গুণগত মান এবং নির্ধারিত সময়ে হস্তান্তরে অঙ্গীকারবদ্ধ।'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-[#FAF8F4] border border-slate-200/80 space-y-1">
                      <span className="text-xs font-bold text-[#9A7432]">প্রধান কার্যালয়</span>
                      <p className="font-extrabold text-sm text-[#0B162C]">{officeAddress}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF8F4] border border-slate-200/80 space-y-1">
                      <span className="text-xs font-bold text-[#9A7432]">ল্যান্ড প্রজেক্ট জোন</span>
                      <p className="font-extrabold text-sm text-[#0B162C]">
                        বসুন্ধরা আবাসিক এলাকা, ঢাকা
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF8F4] border border-slate-200/80 space-y-1">
                      <span className="text-xs font-bold text-[#9A7432]">অ্যাপার্টমেন্ট জোন</span>
                      <p className="font-extrabold text-sm text-[#0B162C]">
                        বনশ্রী ও সংলগ্ন প্রাইম এলাকা, ঢাকা
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF8F4] border border-slate-200/80 space-y-1">
                      <span className="text-xs font-bold text-[#9A7432]">গ্রাহক সহায়তা</span>
                      <p className="font-extrabold text-sm text-[#0B162C] tabular-nums-bn">
                        {hotline}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#0B162C] text-white rounded-2xl p-6 sm:p-8 border-t-2 border-t-[#C6A15B] space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <Award className="w-9 h-9 text-[#E5C989]" />
                    <h3 className="text-xl font-extrabold">কর্পোরেট বৈশিষ্ট্যসমূহ</h3>
                    <ul className="space-y-3.5 text-sm text-slate-200">
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
              <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/90 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 flex flex-col items-center text-center bg-[#FAF8F4] p-6 rounded-2xl border border-slate-200/80">
                  <div className="w-36 h-44 rounded-2xl overflow-hidden border-2 border-[#C6A15B] mb-4 shadow-md">
                    <ExecutivePortrait theme={chairmanMember.portraitTheme} />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#0B162C]">
                    {chairmanMember.nameBn}
                  </h2>
                  <p className="text-sm font-bold text-emerald-700 mt-1">
                    {chairmanMember.designationBn}
                  </p>
                  <p className="text-xs text-slate-600 mt-2">{chairmanMember.qualificationBn}</p>
                  <p className="text-xs text-slate-500 mt-1">{chairmanMember.experienceBn}</p>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <div className="py-4 border-y border-[#C6A15B]/40">
                    <span className="text-3xl leading-none font-serif text-[#C6A15B] block mb-1">
                      “
                    </span>
                    <p className="text-[#0B162C] font-extrabold text-lg sm:text-xl leading-relaxed">
                      {chairmanMember.quoteBn}
                    </p>
                  </div>
                  <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
                    <p>{chairmanMember.messageBn}</p>
                    <p>
                      আমাদের প্রতিটি প্রকল্পে স্ট্রাকচারাল নিরাপত্তা, আধুনিক স্থাপত্যশৈলী এবং নিষ্কণ্টক ভূমি ব্যবস্থাপনাকে সর্বোচ্চ অগ্রাধিকার দেওয়া হয়। গ্রাহকের আজীবনের সঞ্চয় যেন একটি নিরাপদ ও স্থায়ী সম্পদে রূপান্তরিত হয়, সেটিই আমাদের পরিচালনা পর্ষদের মূল অঙ্গীকার।
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-bold">
                    <span>ইমেইল: {chairmanMember.email}</span>
                    <span>প্রধান কার্যালয়: {officeAddress}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-PAGE: MANAGING DIRECTOR'S MESSAGE */}
            {publicPage === 'about-md' && mdMember && (
              <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/90 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 flex flex-col items-center text-center bg-[#FAF8F4] p-6 rounded-2xl border border-slate-200/80">
                  <div className="w-36 h-44 rounded-2xl overflow-hidden border-2 border-[#0B162C] mb-4 shadow-md">
                    <ExecutivePortrait theme={mdMember.portraitTheme} />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#0B162C]">{mdMember.nameBn}</h2>
                  <p className="text-sm font-bold text-emerald-700 mt-1">
                    {mdMember.designationBn}
                  </p>
                  <p className="text-xs text-slate-600 mt-2">{mdMember.qualificationBn}</p>
                  <p className="text-xs text-slate-500 mt-1">{mdMember.experienceBn}</p>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <div className="py-4 border-y border-[#C6A15B]/40">
                    <span className="text-3xl leading-none font-serif text-[#C6A15B] block mb-1">
                      “
                    </span>
                    <p className="text-[#0B162C] font-extrabold text-lg sm:text-xl leading-relaxed">
                      {mdMember.quoteBn}
                    </p>
                  </div>
                  <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
                    <p>{mdMember.messageBn}</p>
                    <p>
                      আমরা বিশ্বাস করি, একটি আবাসন প্রতিষ্ঠানের সুনাম নির্ভর করে নির্ধারিত সময়ে প্রজেক্ট হস্তান্তর এবং বিক্রয়োত্তর সেবার ওপর। বসুন্ধরার আবাসিক প্লট থেকে শুরু করে বনশ্রীর আধুনিক ফ্ল্যাট—প্রতিটি পদক্ষেপে আমরা গ্রাহকের জন্য স্বচ্ছ ও ডিজিটাল সেবা নিশ্চিত করছি।
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-bold tabular-nums-bn">
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
                    className="bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-[#C6A15B] transition-colors flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-xs"
                  >
                    <div className="w-28 h-34 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <ExecutivePortrait theme={leader.portraitTheme} />
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                      <h3 className="font-extrabold text-lg text-[#0B162C]">{leader.nameBn}</h3>
                      <p className="text-xs font-bold text-emerald-700">
                        {leader.designationBn} · {leader.experienceBn}
                      </p>
                      <p className="text-xs text-slate-500">{leader.qualificationBn}</p>
                      <p className="text-xs font-bold text-[#0B162C] py-2 border-y border-slate-100">
                        “{leader.quoteBn}”
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
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 border-t-2 border-t-emerald-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-700">আমাদের লক্ষ্য</span>
                    <span className="text-xs font-extrabold text-[#9A7432] tabular-nums-bn">০১</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#0B162C]">মিশন (Mission)</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {settings?.missionBn ||
                      'পরিকল্পিত নগরায়ন, মানসম্মত নির্মাণশৈলী এবং স্বচ্ছ লেনদেনের মাধ্যমে প্রতিটি পরিবারের জন্য নিরাপদ জমি ও ফ্ল্যাট নিশ্চিত করা।'}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 border-t-2 border-t-[#0B162C] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0B162C]">আমাদের উদ্দেশ্য</span>
                    <span className="text-xs font-extrabold text-[#9A7432] tabular-nums-bn">০২</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#0B162C]">ভিশন (Vision)</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {settings?.visionBn ||
                      'আস্থা, স্থাপত্য নান্দনিকতা এবং গ্রাহককেন্দ্রিক সেবার মাধ্যমে দেশের শীর্ষস্থানীয় আবাসন প্রতিষ্ঠানে পরিণত হওয়া।'}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 border-t-2 border-t-[#C6A15B] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#9A7432]">কর্পোরেট নীতি</span>
                    <span className="text-xs font-extrabold text-[#9A7432] tabular-nums-bn">০৩</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#0B162C]">মূল্যবোধ (Values)</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {settings?.coreValuesBn ||
                      'স্বচ্ছ দলিল ও নামজারি · আধুনিক ভবন নির্মাণ · নির্ধারিত সময়ে হস্তান্তর · সহজ কিস্তি সুবিধা · দীর্ঘমেয়াদি গ্রাহক সেবা'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* =========================================================
          MEDIA & GALLERY SUB-PAGES (মিডিয়া ও গ্যালারি > সাব পেজ)
         ========================================================= */}
      {(publicPage === 'media-gallery' ||
        publicPage === 'media-testimonials' ||
        publicPage === 'media-news') && (
        <main className="flex-1 bg-[#FAF8F4]">
          {renderSubPageHero({
            sectionLabel: 'মিডিয়া ও গ্যালারি',
            title:
              publicPage === 'media-gallery'
                ? 'প্রজেক্ট ফটো গ্যালারি'
                : publicPage === 'media-testimonials'
                ? 'গ্রাহক মতামত ও অভিজ্ঞতা'
                : 'নিউজ ও প্রপার্টি আপডেট',
            subtitle:
              'বসুন্ধরা আবাসিক প্লট ও বনশ্রীর সিগনেচার আবাসিক ভবনের প্রকৃত আলোকচিত্র এবং সম্মানিত গ্রাহকদের অভিজ্ঞতা।',
            tabs: [
              { id: 'media-gallery', label: 'প্রজেক্ট ফটো গ্যালারি' },
              { id: 'media-testimonials', label: 'গ্রাহক মতামত' },
              { id: 'media-news', label: 'নিউজ ও আপডেট' },
            ],
          })}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {publicPage === 'media-gallery' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 border-b border-slate-200">
                  {[
                    { id: 'all', label: 'সকল ছবি' },
                    { id: 'land', label: 'প্লট ও ল্যান্ড প্রজেক্ট' },
                    { id: 'building', label: 'ভবন ও অ্যাপার্টমেন্ট' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPhotoFilter(tab.id as 'all' | 'land' | 'building')}
                      className={`pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-colors cursor-pointer ${
                        photoFilter === tab.id
                          ? 'border-[#0B162C] text-[#0B162C]'
                          : 'border-transparent text-slate-500 hover:text-[#0B162C]'
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
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-[#C6A15B] shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col"
                    >
                      <div className="relative h-60 overflow-hidden bg-slate-900">
                        <img
                          src={resolveImageUrl(item.imageUrl)}
                          alt={item.titleBn}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/hh_signature_tower.jpg';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-2.5">
                        <span className="text-xs font-bold text-emerald-700">{item.tagBn}</span>
                        <h3 className="text-lg font-extrabold text-[#0B162C] group-hover:text-emerald-800 transition-colors">
                          {item.titleBn}
                        </h3>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#9A7432]" />
                            {item.locationBn}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {galleryItemsList.map((g) => (
                    <div
                      key={`cms-gal-${g.id}`}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs flex flex-col"
                    >
                      <div className="h-60 relative overflow-hidden">
                        <ArchitecturalRender theme={g.visualTheme} hideBadge={true} />
                      </div>
                      <div className="p-5 space-y-1.5">
                        <span className="text-xs font-bold text-emerald-700">{g.categoryBn}</span>
                        <h3 className="text-lg font-extrabold text-[#0B162C]">{g.titleBn}</h3>
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
                    className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                          <Star key={idx} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#9A7432]">গ্রাহক অভিজ্ঞতা</span>
                    </div>
                    <p className="text-base text-[#0B162C] leading-relaxed font-medium">
                      “{t.reviewBn}”
                    </p>
                    <div className="pt-3 border-t border-slate-100">
                      <h3 className="font-extrabold text-base text-[#0B162C]">
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
                  <article
                    key={art.id}
                    className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 hover:border-[#C6A15B] transition-colors shadow-xs space-y-3"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 tabular-nums-bn">
                      <Calendar className="w-4 h-4 text-[#9A7432]" />
                      <span>{art.publishedDateBn}</span>
                      <span>·</span>
                      <span>{art.categoryBn}</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-[#0B162C]">{art.titleBn}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{art.contentBn}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* =========================================================
          CUSTOMER SERVICES SUB-PAGES (গ্রাহক সেবা > সাব পেজ)
         ========================================================= */}
      {(publicPage === 'service-emi' ||
        publicPage === 'service-booking' ||
        publicPage === 'service-legal' ||
        publicPage === 'service-jv') && (
        <main className="flex-1 bg-[#FAF8F4]">
          {renderSubPageHero({
            sectionLabel: 'গ্রাহক সেবা',
            title:
              publicPage === 'service-emi'
                ? 'কিস্তি ও ডাউন পেমেন্ট ক্যালকুলেটর'
                : publicPage === 'service-booking'
                ? 'অনলাইন বুকিং ও বরাদ্দ প্রক্রিয়া'
                : publicPage === 'service-jv'
                ? 'জমিওয়ালাদের সাথে যৌথ উদ্যোগ (Landowner Joint Venture)'
                : 'দলিল রেজিস্ট্রেশন ও নামজারি সহায়তা',
            subtitle:
              'স্বচ্ছ আর্থিক কিস্তি পরিকল্পনা, অনলাইন বরাদ্দ নির্দেশিকা এবং নিষ্কণ্টক দলিল ও নামজারি সহায়তা।',
            tabs: [
              { id: 'service-emi', label: 'কিস্তি ক্যালকুলেটর' },
              { id: 'service-booking', label: 'বুকিং ও বরাদ্দ প্রক্রিয়া' },
              { id: 'service-legal', label: 'দলিল ও নামজারি সেবা' },
              { id: 'service-jv', label: 'যৌথ উদ্যোগ (JV)' },
            ],
          })}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {publicPage === 'service-emi' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 space-y-5">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                    <Calculator className="w-6 h-6 text-[#9A7432]" />
                    <h2 className="text-xl font-extrabold text-[#0B162C]">
                      প্রপার্টির মূল্য ও কিস্তির মেয়াদ নির্বাচন করুন
                    </h2>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B162C] mb-1.5">
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-[#FAF8F4]"
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
                      <label className="block text-xs font-bold text-[#0B162C] mb-1.5">
                        প্রপার্টির মোট মূল্য (BDT)
                      </label>
                      <input
                        type="number"
                        value={emiPriceBdt}
                        onChange={(e) => setEmiPriceBdt(Number(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold tabular-nums-bn"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0B162C] mb-1.5">
                        বুকিং মানি / ডাউন পেমেন্ট (BDT)
                      </label>
                      <input
                        type="number"
                        value={emiBookingBdt}
                        onChange={(e) => setEmiBookingBdt(Number(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold tabular-nums-bn"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B162C] mb-1.5">
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
                              ? 'bg-[#0B162C] text-white border-[#0B162C]'
                              : 'bg-[#FAF8F4] text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {planName}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#0B162C] text-white rounded-2xl p-6 sm:p-8 border-t-2 border-t-[#C6A15B] flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase text-[#E5C989]">
                      হিসাব বিবরণী
                    </span>
                    <h3 className="text-2xl font-extrabold">আনুমানিক কিস্তির পরিমাণ</h3>

                    {/* Visual Booking vs Installment Ratio */}
                    {emiPriceBdt > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden flex">
                          <div
                            className="bg-[#C6A15B] h-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, Math.round((emiBookingBdt / emiPriceBdt) * 100))
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-300 tabular-nums-bn">
                          <span>
                            ডাউন পেমেন্ট:{' '}
                            {toBengaliDigits(
                              Math.min(100, Math.max(0, Math.round((emiBookingBdt / emiPriceBdt) * 100)))
                            )}
                            %
                          </span>
                          <span>
                            কিস্তিযোগ্য:{' '}
                            {toBengaliDigits(
                              Math.max(0, 100 - Math.min(100, Math.round((emiBookingBdt / emiPriceBdt) * 100)))
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 pt-2 text-sm tabular-nums-bn">
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-slate-300">মোট মূল্য</span>
                        <span className="font-extrabold">
                          {formatExactBdtBengali(emiPriceBdt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-white/10">
                        <span className="text-slate-300">বুকিং মানি জমা</span>
                        <span className="font-extrabold text-[#E5C989]">
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

                    <div className="p-4 rounded-xl bg-white/10 border border-white/15">
                      <span className="text-xs text-[#E5C989] block">প্রতি মাসের কিস্তি</span>
                      <span className="text-2xl font-extrabold text-white mt-0.5 block tabular-nums-bn">
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
              <div className="space-y-10">
                <div className="bg-white rounded-2xl border border-slate-200/90 grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 overflow-hidden">
                  {[
                    {
                      num: '০১',
                      title: 'প্লট বা ফ্ল্যাট নির্বাচন',
                      desc: 'পছন্দের প্রকল্প থেকে প্লট বা অ্যাপার্টমেন্ট ইউনিট ও ফ্লোর প্ল্যান নির্বাচন করুন।',
                    },
                    {
                      num: '০২',
                      title: 'আবেদন ও এনআইডি তথ্য',
                      desc: 'ক্রেতার নাম, এনআইডি (NID), নমিনি তথ্য ও কিস্তি প্ল্যান পূরণ করুন।',
                    },
                    {
                      num: '০৩',
                      title: 'বুকিং মানি ও মানি রিসিট',
                      desc: 'ব্যাংক পে-অর্ডার বা ট্রান্সফারের মাধ্যমে বুকিং মানি জমা দিয়ে তাৎক্ষণিক মানি রিসিট নিন।',
                    },
                    {
                      num: '০৪',
                      title: 'বরাদ্দপত্র ও চুক্তিপত্র',
                      desc: 'অফিশিয়াল অ্যালটমেন্ট লেটার ও ডিড অফ এগ্রিমেন্ট গ্রহণ করুন।',
                    },
                  ].map((item) => (
                    <div key={item.num} className="p-6 space-y-2.5">
                      <span className="text-sm font-extrabold text-[#9A7432] tabular-nums-bn block">
                        ধাপ {item.num}
                      </span>
                      <h3 className="text-lg font-extrabold text-[#0B162C]">{item.title}</h3>
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
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 border-t-2 border-t-emerald-600 space-y-3">
                  <FileCheck2 className="w-7 h-7 text-emerald-700" />
                  <h3 className="text-lg font-extrabold text-[#0B162C]">
                    সিএস, এসএ, আরএস ও মহানগর জরিপ যাচাই
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    H &amp; H Homes-এর প্রতিটি জমির মূল দলিল, বায়া দলিল, খতিয়ান ও হালনাগাদ খাজনা-খারিজ আমাদের নিজস্ব লিগ্যাল প্যানেল দ্বারা শতভাগ যাচাইকৃত।
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 border-t-2 border-t-[#0B162C] space-y-3">
                  <Layers className="w-7 h-7 text-[#0B162C]" />
                  <h3 className="text-lg font-extrabold text-[#0B162C]">
                    সাব-কবলা দলিল রেজিস্ট্রেশন ও নামজারি
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    সম্পূর্ণ মূল্য পরিশোধের সাথে সাথে গ্রাহকের নামে সাফ-কবলা রেজিস্ট্রেশন এবং সহকারী কমিশনার (ভূমি) অফিস থেকে একক নামজারি সম্পন্ন করতে সার্বিক সহায়তা প্রদান করা হয়।
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 border-t-2 border-t-[#C6A15B] space-y-3">
                  <ShieldCheck className="w-7 h-7 text-[#9A7432]" />
                  <h3 className="text-lg font-extrabold text-[#0B162C]">
                    ব্যাংক লোন ও মর্টগেজ ডকুমেন্টেশন
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    ফ্ল্যাট বা প্লট ক্রয়ে ব্যাংক ও আর্থিক প্রতিষ্ঠান থেকে হোম লোন গ্রহণের জন্য প্রয়োজনীয় সকল অনুমোদনপত্র ও লিগ্যাল ডকুমেন্ট সরবরাহ করা হয়।
                  </p>
                </div>
              </div>
            )}

            {publicPage === 'service-jv' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 bg-[#0B162C] text-white rounded-2xl p-6 sm:p-8 border-t-2 border-t-[#C6A15B] space-y-5">
                  <Handshake className="w-9 h-9 text-[#E5C989]" />
                  <h2 className="text-xl sm:text-2xl font-extrabold">
                    জমির মালিকদের জন্য যৌথ উদ্যোগ (Joint Venture) সুবিধা
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    বনশ্রী, বসুন্ধরা, আফতাবনগর ও ঢাকার প্রাইম আবাসিক এলাকায় আপনার নিষ্কণ্টক জমিতে আধুনিক অ্যাপার্টমেন্ট বা কমার্শিয়াল ভবন নির্মাণের জন্য H &amp; H Homes দিচ্ছে সর্বোচ্চ শেয়ারিং অনুপাত ও সাইনিং মানি সুবিধা।
                  </p>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-200 pt-2 border-t border-white/10">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>রাজউক (RAJUK) অনুমোদন ও আর্কিটেকচারাল ডিজাইন</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>১০০% বিএনবিসি বিল্ডিং কোড ও প্রথম শ্রেণির নির্মাণ সামগ্রী</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>চুক্তিবদ্ধ সময়ের মধ্যে ভবন হস্তান্তর গ্যারান্টি</span>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90">
                  <h3 className="text-xl font-extrabold text-[#0B162C] mb-4">
                    জমির বিবরণ পাঠান (Landowner JV Proposal)
                  </h3>
                  {contactStatus && (
                    <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold">
                      {contactStatus}
                    </div>
                  )}
                  <form
                    onSubmit={(e) => {
                      setContactCategory('যৌথ উদ্যোগ (Landowner JV)');
                      handleContactSubmit(e);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          জমির মালিকের নাম *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="পূর্ণ নাম"
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
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        জমির লোকেশন, আয়তন (কাঠা) ও সম্মুখ সড়কের বিবরণ *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="যেমন: বনশ্রী ব্লক-সি / বসুন্ধরা, জমির পরিমাণ ৫ কাঠা, সম্মুখ সড়ক ৩০ ফুট..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-[#0B162C] hover:bg-emerald-700 text-white font-bold text-sm transition-colors cursor-pointer"
                    >
                      প্রস্তাব পাঠান
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* =========================================================
          MODULES DIRECTORY PAGE (#modules / সকল বিভাগ ও লগিন লিংক)
         ========================================================= */}
      {publicPage === 'modules' && (
        <ModulesDirectoryPage
          onNavigateRoleLogin={(role) => {
            const hashMap: Record<PortalRoleKey, string> = {
              accounts: '#accounts',
              staff: '#staff',
              shareholder: '#shareholder',
              admin: '#admin',
            };
            window.location.hash = hashMap[role];
            setActiveView(role);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateCustomerPortal={() => {
            window.location.hash = '#portal';
            setActiveView('portal');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateErpModule={(hashTarget) => {
            window.location.hash = hashTarget;
            applyRouteTarget(hashTarget);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigatePublicPage={(pageId) => {
            window.location.hash = '';
            navigateToPage(pageId);
          }}
        />
      )}

      {/* =========================================================
          CONTACT PAGE (যোগাযোগ)
         ========================================================= */}
      {publicPage === 'contact' && (
        <main className="flex-1 bg-[#FAF8F4]">
          {renderSubPageHero({
            sectionLabel: 'যোগাযোগ',
            title: 'প্রধান কার্যালয় ও সরাসরি যোগাযোগ',
            subtitle:
              'প্লট ও ফ্ল্যাট বুকিং, সাইট ভিজিট বা প্রকল্প সংক্রান্ত যেকোনো তথ্যের জন্য আমাদের বনশ্রী অফিসে যোগাযোগ করুন।',
          })}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-[#0B162C] text-white rounded-2xl p-6 sm:p-8 border-t-2 border-t-[#C6A15B] space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E5C989]">
                  কর্পোরেট হেড অফিস
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {companyName}
                </h2>
              </div>

              <div className="space-y-4 text-sm divide-y divide-white/10">
                <div className="pt-3 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#E5C989] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">প্রধান কার্যালয়ের ঠিকানা</span>
                    <span className="font-bold text-base text-white">{officeAddress}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">জমির প্রকল্প লোকেশন</span>
                    <span className="font-bold text-base text-emerald-300">
                      বসুন্ধরা আবাসিক এলাকা, ঢাকা
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#E5C989] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">হটলাইন ও হোয়াটসঅ্যাপ</span>
                    <span className="font-bold text-base text-white tabular-nums-bn">{hotline}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#E5C989] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">ইমেইল</span>
                    <span className="font-bold text-white">{emailAddress}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-start gap-3">
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

            <div className="lg:col-span-7 bg-white text-[#0B162C] rounded-2xl p-6 sm:p-8 border border-slate-200/90">
              <h2 className="text-xl font-extrabold text-[#0B162C] mb-5">
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
                      <option value="যৌথ উদ্যোগ (Landowner JV)">যৌথ উদ্যোগ (Landowner JV)</option>
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
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0B162C] hover:bg-emerald-700 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  বার্তা পাঠান
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* Multi-Column Corporate Footer with Gold Architectural Top Rule */}
      <footer className="bg-[#07111E] text-slate-400 py-12 border-t border-[#C6A15B]/30 text-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <HHLogo variant="light" />
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                প্রধান কার্যালয়: {officeAddress}
              </p>
              <p className="text-xs text-[#E5C989] font-semibold tabular-nums-bn">
                হটলাইন: {hotline}
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3.5 pb-2 border-b border-white/10">
                প্রকল্প ও প্রপার্টি
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('projects-ongoing')}
                    className="hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    চলমান প্রকল্পসমূহ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('properties-residential-land')}
                    className="hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    আবাসিক প্লট
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('properties-apartments')}
                    className="hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    ফ্ল্যাট ও অ্যাপার্টমেন্ট
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('projects-map')}
                    className="hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    প্রকল্পের লোকেশন ম্যাপ
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3.5 pb-2 border-b border-white/10">
                আমাদের সম্পর্কে
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('about-profile')}
                    className="hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    কোম্পানি প্রোফাইল
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('about-chairman')}
                    className="hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    চেয়ারম্যানের বাণী
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('about-md')}
                    className="hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    ব্যবস্থাপনা পরিচালকের বাণী
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToPage('about-board')}
                    className="hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    পরিচালনা পর্ষদ
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3.5 pb-2 border-b border-white/10">
                পোর্টাল ও আলাদা লগিন লিংক
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = '#modules';
                      navigateToPage('modules');
                    }}
                    className="text-emerald-300 hover:text-white font-semibold transition-colors cursor-pointer"
                  >
                    সকল মডিউল ও বিভাগ (#modules)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = '#portal';
                      setActiveView('portal');
                    }}
                    className="hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    গ্রাহক পোর্টাল লগইন (#portal)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = '#accounts';
                      setActiveView('accounts');
                    }}
                    className="hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    হিসাব ও অ্যাকাউন্টস (#accounts)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = '#staff';
                      setActiveView('staff');
                    }}
                    className="hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    স্টাফ ও এইচআর পোর্টাল (#staff)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = '#shareholder';
                      setActiveView('shareholder');
                    }}
                    className="hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    শেয়ারহোল্ডার পোর্টাল (#shareholder)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = '#admin';
                      setAdminMode('realestate_erp');
                      setActiveView('admin');
                    }}
                    className="text-slate-400 hover:text-[#E5C989] transition-colors cursor-pointer"
                  >
                    ম্যানেজমেন্ট ইআরপি (#admin)
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
                src={resolveImageUrl(lightboxPhoto.imageUrl)}
                alt={lightboxPhoto.titleBn}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/hh_signature_tower.jpg';
                }}
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

      {/* Native Mobile Fixed Bottom Navigation Bar (Thumb Zone) */}
      <nav
        aria-label="মোবাইল অ্যাপ নেভিগেশন"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(11,25,44,0.08)] pb-safe no-print"
      >
        <div className="grid grid-cols-5 items-center h-14 px-1">
          <button
            type="button"
            onClick={() => navigateToPage('home')}
            className={`relative flex flex-col items-center justify-center gap-0.5 h-full transition-colors cursor-pointer ${
              publicPage === 'home' && !mobileMenuOpen
                ? 'text-[#0B162C] font-extrabold'
                : 'text-slate-500 hover:text-[#0B162C] font-semibold'
            }`}
          >
            {publicPage === 'home' && !mobileMenuOpen && (
              <span className="absolute top-0 w-7 h-0.5 bg-[#C6A15B] rounded-full" />
            )}
            <Home className="w-5 h-5" />
            <span className="text-[10px] leading-none">হোম</span>
          </button>

          <button
            type="button"
            onClick={() => navigateToPage('projects-all')}
            className={`relative flex flex-col items-center justify-center gap-0.5 h-full transition-colors cursor-pointer ${
              publicPage.startsWith('projects-') && !mobileMenuOpen
                ? 'text-[#0B162C] font-extrabold'
                : 'text-slate-500 hover:text-[#0B162C] font-semibold'
            }`}
          >
            {publicPage.startsWith('projects-') && !mobileMenuOpen && (
              <span className="absolute top-0 w-7 h-0.5 bg-[#C6A15B] rounded-full" />
            )}
            <Building2 className="w-5 h-5" />
            <span className="text-[10px] leading-none">প্রকল্প</span>
          </button>

          <button
            type="button"
            onClick={() => navigateToPage('properties-all')}
            className={`relative flex flex-col items-center justify-center gap-0.5 h-full transition-colors cursor-pointer ${
              publicPage.startsWith('properties-') && !mobileMenuOpen
                ? 'text-[#0B162C] font-extrabold'
                : 'text-slate-500 hover:text-[#0B162C] font-semibold'
            }`}
          >
            {publicPage.startsWith('properties-') && !mobileMenuOpen && (
              <span className="absolute top-0 w-7 h-0.5 bg-[#C6A15B] rounded-full" />
            )}
            <Compass className="w-5 h-5" />
            <span className="text-[10px] leading-none">প্রপার্টি</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveView('portal');
            }}
            className="flex flex-col items-center justify-center gap-0.5 h-full text-emerald-700 font-bold transition-colors cursor-pointer"
          >
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] leading-none">পোর্টাল</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`relative flex flex-col items-center justify-center gap-0.5 h-full transition-colors cursor-pointer ${
              mobileMenuOpen
                ? 'text-[#0B162C] font-extrabold'
                : 'text-slate-500 hover:text-[#0B162C] font-semibold'
            }`}
          >
            {mobileMenuOpen && (
              <span className="absolute top-0 w-7 h-0.5 bg-[#C6A15B] rounded-full" />
            )}
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="text-[10px] leading-none">মেনু</span>
          </button>
        </div>
      </nav>

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
