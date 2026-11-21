import React from 'react';
import {
  ArrowRight,
  Building2,
  Calculator,
  Compass,
  FileText,
  Handshake,
  Home,
  Landmark,
  Layers,
  MapPin,
  PieChart,
  Receipt,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { PortalRoleKey } from '../types';

interface ModulesDirectoryPageProps {
  onNavigateRoleLogin: (role: PortalRoleKey) => void;
  onNavigateCustomerPortal: () => void;
  onNavigateErpModule: (hashTarget: string) => void;
  onNavigatePublicPage: (pageId: any) => void;
}

export const ModulesDirectoryPage: React.FC<ModulesDirectoryPageProps> = ({
  onNavigateRoleLogin,
  onNavigateCustomerPortal,
  onNavigateErpModule,
  onNavigatePublicPage,
}) => {
  const loginPortals = [
    {
      title: 'গ্রাহক পোর্টাল লগইন',
      subtitle: 'নিজস্ব প্লট/ফ্ল্যাট, কিস্তির বিবরণ, অনলাইন পেমেন্ট এবং মানি রিসিট ডাউনলোড।',
      routeHash: '#portal',
      credential: '01711223344 / 123456',
      icon: UserCheck,
      action: onNavigateCustomerPortal,
    },
    {
      title: 'হিসাব ও অ্যাকাউন্টস পোর্টাল',
      subtitle: 'ব্যাংক ও ক্যাশ ব্যালেন্স, আয়-ব্যয় ভাউচার, ফান্ড ট্রান্সফার ও প্রজেক্ট লেজার।',
      routeHash: '#accounts',
      credential: 'accounts@hhhomesbd.com / 123456',
      icon: Calculator,
      action: () => onNavigateRoleLogin('accounts'),
    },
    {
      title: 'স্টাফ ও প্রকৌশলী পোর্টাল',
      subtitle: 'দৈনিক উপস্থিতি, মাসিক বেতন পে-স্লিপ ও চলমান সাইট প্রকল্প তথ্য।',
      routeHash: '#staff',
      credential: 'staff@hhhomesbd.com / 123456',
      icon: Users,
      action: () => onNavigateRoleLogin('staff'),
    },
    {
      title: 'শেয়ারহোল্ডার ও পার্টনার পোর্টাল',
      subtitle: 'শেয়ার মালিকানা (%), জমাকৃত মূলধন, লভ্যাংশ বিবরণী ও সনদপত্র।',
      routeHash: '#shareholder',
      credential: 'partner@hhhomesbd.com / 123456',
      icon: PieChart,
      action: () => onNavigateRoleLogin('shareholder'),
    },
    {
      title: 'ম্যানেজমেন্ট ও মাস্টার ইআরপি',
      subtitle: 'সকল বিভাগ, ওয়েবসাইট সিএমএস, বুকিং অনুমোদন ও মাস্টার ডাটা কন্ট্রোল।',
      routeHash: '#admin',
      credential: 'admin@hhhomesbd.com / 123456',
      icon: ShieldCheck,
      action: () => onNavigateRoleLogin('admin'),
    },
  ];

  const erpModuleLinks = [
    {
      title: 'হিসাব ও ব্যাংক অ্যাকাউন্ট মডিউল',
      desc: 'ক্যাশ কাউন্টার, ইসলামী ব্যাংক, সিটি ব্যাংক ও বিকাশ ব্যালেন্স ট্র্যাকিং',
      hash: '#erp/accounts',
      icon: Landmark,
    },
    {
      title: 'আয়-ব্যয় ও কস্ট সেন্টার বিশ্লেষণ',
      desc: 'খাতভিত্তিক খরচ বিভাজন, প্রজেক্ট বাজেট বনাম ব্যয় ও লাভ-ক্ষতি হিসাব',
      hash: '#erp/expenses',
      icon: Layers,
    },
    {
      title: 'শেয়ার ভিত্তিক হিসাব ও লভ্যাংশ',
      desc: 'অংশীদার ক্যাপ-টেবিল, মুনাফা বণ্টন ক্যালকুলেটর ও ইক্যুইটি সনদ',
      hash: '#erp/shares',
      icon: PieChart,
    },
    {
      title: 'স্টাফ, হাজিরা ও বেতন (HR Payroll)',
      desc: 'বিভাগীয় কর্মকর্তা তালিকা, উপস্থিতি ও স্বয়ংক্রিয় মাসিক পে-স্লিপ',
      hash: '#erp/staff',
      icon: Users,
    },
    {
      title: 'মানি রিসিট ও কিস্তি আদায়',
      desc: 'তাৎক্ষণিক মানি রিসিট ইস্যু, বুকিং কালেকশন ও প্রিন্ট/পিডিএফ',
      hash: '#erp/receipts',
      icon: Receipt,
    },
    {
      title: 'মাস্টার প্রজেক্ট ও প্রপার্টি তালিকা',
      desc: 'বসুন্ধরার জমি ও বনশ্রীর ভবন প্রকল্প এবং ফ্ল্যাট ইনভেন্টরি',
      hash: '#erp/projects',
      icon: Building2,
    },
  ];

  const publicDivisions = [
    { label: 'চলমান প্রকল্পসমূহ', page: 'projects-ongoing', icon: Building2 },
    { label: 'বসুন্ধরা আবাসিক প্লট', page: 'properties-residential-land', icon: MapPin },
    { label: 'বনশ্রী ফ্ল্যাট ও অ্যাপার্টমেন্ট', page: 'properties-apartments', icon: Home },
    { label: 'প্রকল্পের লোকেশন ম্যাপ', page: 'projects-map', icon: Compass },
    { label: 'কিস্তি ক্যালকুলেটর', page: 'service-emi', icon: Calculator },
    { label: 'যৌথ উদ্যোগ (Landowner JV)', page: 'service-jv', icon: Handshake },
    { label: 'পরিচালনা পর্ষদ ও চেয়ারম্যান', page: 'about-board', icon: FileText },
    { label: 'যোগাযোগ ও সাইট ভিজিট', page: 'contact', icon: MapPin },
  ];

  return (
    <main className="flex-1 bg-[#FAF8F4]">
      {/* Architectural Sub-Page Masthead */}
      <section className="bg-[#0B162C] text-white border-b border-[#C6A15B]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
            <button
              type="button"
              onClick={() => onNavigatePublicPage('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              হোম
            </button>
            <span className="text-[#C6A15B]">/</span>
            <span>গ্রাহক সেবা</span>
            <span className="text-[#C6A15B]">/</span>
            <span className="text-[#E5C989]">সকল বিভাগ ও পোর্টাল</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                সকল বিভাগ, হিসাব মডিউল ও আলাদা লগিন ডিরেক্টরি
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mt-2 leading-relaxed">
                প্রতিটি দায়িত্ব ও বিভাগের জন্য নির্ধারিত আলাদা লগিন লিংক, ফিন্যান্সিয়াল মডিউল এবং পাবলিক সার্ভিস পেজ এখান থেকে সরাসরি খোলা যাবে।
              </p>
            </div>
            <span className="text-xs font-mono text-[#E5C989] shrink-0">রুট: #modules</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* 1. Separate Role-Based Login Portals */}
        <section className="space-y-5">
          <div className="border-b border-slate-200 pb-3 flex items-baseline gap-3">
            <span className="text-sm font-extrabold text-[#9A7432] tabular-nums-bn">০১.</span>
            <div>
              <h2 className="text-xl font-extrabold text-[#0B162C]">
                আলাদা রোল-ভিত্তিক লগিন পোর্টাল (Separate Login Links)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                গ্রাহক, হিসাব বিভাগ, স্টাফ, শেয়ারহোল্ডার এবং ম্যানেজমেন্টের জন্য পৃথক প্রবেশদ্বার।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loginPortals.map((portal) => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.routeHash}
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between gap-4 hover:border-[#C6A15B] transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#0B162C] text-[#E5C989] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        {portal.routeHash}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-[#0B162C]">{portal.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{portal.subtitle}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-mono text-slate-500">ডেমো: {portal.credential}</p>
                    <button
                      type="button"
                      onClick={portal.action}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0B162C] hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer transition-colors"
                    >
                      <span>পোর্টালে প্রবেশ করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Direct ERP Accounting Modules */}
        <section className="space-y-5">
          <div className="border-b border-slate-200 pb-3 flex items-baseline gap-3">
            <span className="text-sm font-extrabold text-[#9A7432] tabular-nums-bn">০২.</span>
            <div>
              <h2 className="text-xl font-extrabold text-[#0B162C]">
                সরাসরি অ্যাকাউন্টিং ও ইআরপি মডিউল শর্টকাট
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                নির্দিষ্ট হিসাব, খরচ, শেয়ার বা স্টাফ পে-স্লিপ মডিউল সরাসরি খুলুন।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {erpModuleLinks.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.hash}
                  type="button"
                  onClick={() => onNavigateErpModule(mod.hash)}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 text-left hover:border-[#0B162C] transition-colors flex items-start gap-4 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F4] border border-slate-200 text-[#0B162C] group-hover:bg-[#0B162C] group-hover:text-[#E5C989] transition-colors flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-extrabold text-sm text-[#0B162C] truncate">{mod.title}</h3>
                      <span className="font-mono text-[11px] text-slate-500 shrink-0">{mod.hash}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{mod.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Public Site Divisions */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-baseline gap-3">
            <span className="text-sm font-extrabold text-[#9A7432] tabular-nums-bn">০৩.</span>
            <h2 className="text-xl font-extrabold text-[#0B162C]">পাবলিক ওয়েবসাইট বিভাগসমূহ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {publicDivisions.map((divItem) => {
              const Icon = divItem.icon;
              return (
                <button
                  key={divItem.page}
                  type="button"
                  onClick={() => onNavigatePublicPage(divItem.page)}
                  className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-600 text-left flex items-center gap-3 cursor-pointer transition-colors"
                >
                  <Icon className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-xs font-extrabold text-[#0B162C]">{divItem.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};
