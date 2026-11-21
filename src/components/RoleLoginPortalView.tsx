import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Building2,
  Calculator,
  CheckCircle2,
  Coins,
  CreditCard,
  Download,
  FileSpreadsheet,
  KeyRound,
  Landmark,
  Layers,
  Lock,
  LogIn,
  LogOut,
  PieChart,
  Printer,
  Receipt,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import {
  BookingItem,
  ErpTransactionItem,
  FinancialAccountItem,
  PaymentItem,
  PortalRoleKey,
  ProjectItem,
  PropertyItem,
  RoleSessionUser,
  SalaryPaymentItem,
  ShareDistributionItem,
  ShareholderItem,
  StaffMemberItem,
} from '../types';
import {
  calculateErpAccountingSummary,
  formatExactBdtBengali,
  toBengaliDigits,
} from '../utils/bengaliLogic';
import { HHLogo } from './ArchitecturalVisuals';
import { MoneyReceiptData, MoneyReceiptModal } from './MoneyReceiptModal';
import { AccountsLedgerModule } from './erp/AccountsLedgerModule';
import { ShareAccountingModule } from './erp/ShareAccountingModule';
import { StaffPayrollModule } from './erp/StaffPayrollModule';

interface RoleLoginPortalViewProps {
  role: PortalRoleKey;
  sessionUser: RoleSessionUser | null;
  onAuthenticated: (session: RoleSessionUser) => void;
  onLogout: () => void;
  onSwitchRole: (nextRole: PortalRoleKey) => void;
  onOpenCustomerPortal: () => void;
  onOpenModulesDirectory: () => void;
  onBackToHome: () => void;
}

interface RoleConfig {
  key: PortalRoleKey;
  titleBn: string;
  subtitleBn: string;
  hashLink: string;
  demoIdentifier: string;
  demoLabelBn: string;
  icon: React.FC<{ className?: string }>;
}

const ROLE_CONFIGS: Record<PortalRoleKey, RoleConfig> = {
  accounts: {
    key: 'accounts',
    titleBn: 'হিসাব ও অ্যাকাউন্টস পোর্টাল',
    subtitleBn: 'ব্যাংক, ক্যাশ, আয়-ব্যয় ভাউচার, কস্ট সেন্টার, শেয়ার ও বেতন হিসাব',
    hashLink: '#accounts',
    demoIdentifier: 'accounts@hhhomesbd.com',
    demoLabelBn: 'accounts@hhhomesbd.com / 01711000101',
    icon: Calculator,
  },
  staff: {
    key: 'staff',
    titleBn: 'স্টাফ ও প্রকৌশলী পোর্টাল',
    subtitleBn: 'দৈনিক হাজিরা, মাসিক বেতন পে-স্লিপ ও সাইট প্রকল্প তথ্য',
    hashLink: '#staff',
    demoIdentifier: 'staff@hhhomesbd.com',
    demoLabelBn: 'staff@hhhomesbd.com / 01711000201',
    icon: Users,
  },
  shareholder: {
    key: 'shareholder',
    titleBn: 'শেয়ারহোল্ডার ও পার্টনার পোর্টাল',
    subtitleBn: 'শেয়ার মালিকানা, মূলধন, লভ্যাংশ স্টেটমেন্ট ও প্রকল্প অগ্রগতি',
    hashLink: '#shareholder',
    demoIdentifier: 'partner@hhhomesbd.com',
    demoLabelBn: 'partner@hhhomesbd.com / 01711000301',
    icon: PieChart,
  },
  admin: {
    key: 'admin',
    titleBn: 'ম্যানেজমেন্ট ও মাস্টার ইআরপি লগইন',
    subtitleBn: 'পূর্ণাঙ্গ ইআরপি, সিএমএস, প্রজেক্ট, হিসাব, শেয়ার ও স্টাফ কন্ট্রোল',
    hashLink: '#admin',
    demoIdentifier: 'admin@hhhomesbd.com',
    demoLabelBn: 'admin@hhhomesbd.com / 01711000001',
    icon: ShieldCheck,
  },
};

type AccountsWorkspaceTab = 'accounts' | 'expenses' | 'shares' | 'payroll' | 'receipts';

export const RoleLoginPortalView: React.FC<RoleLoginPortalViewProps> = ({
  role,
  sessionUser,
  onAuthenticated,
  onLogout,
  onSwitchRole,
  onOpenCustomerPortal,
  onOpenModulesDirectory,
  onBackToHome,
}) => {
  const cfg = ROLE_CONFIGS[role];

  const [identifier, setIdentifier] = useState(cfg.demoIdentifier);
  const [password, setPassword] = useState('123456');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Sync default identifier when switching role tabs
  useEffect(() => {
    setIdentifier(ROLE_CONFIGS[role].demoIdentifier);
    setPassword('123456');
    setAuthError('');
  }, [role]);

  // Accounts Officer Workspace State
  const [accTab, setAccTab] = useState<AccountsWorkspaceTab>('accounts');
  const [accounts, setAccounts] = useState<FinancialAccountItem[]>([]);
  const [transactions, setTransactions] = useState<ErpTransactionItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMemberItem[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPaymentItem[]>([]);
  const [shareholders, setShareholders] = useState<ShareholderItem[]>([]);
  const [shareDistributions, setShareDistributions] = useState<ShareDistributionItem[]>([]);

  // Staff Scoped State
  const [myStaffProfile, setMyStaffProfile] = useState<StaffMemberItem | null>(null);
  const [mySalarySlips, setMySalarySlips] = useState<SalaryPaymentItem[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<SalaryPaymentItem | null>(null);

  // Shareholder Scoped State
  const [myShareholder, setMyShareholder] = useState<ShareholderItem | null>(null);
  const [allShareholders, setAllShareholders] = useState<ShareholderItem[]>([]);
  const [myDistributions, setMyDistributions] = useState<ShareDistributionItem[]>([]);
  const [showCertModal, setShowCertModal] = useState(false);

  // Common UI state
  const [dataLoading, setDataLoading] = useState(false);
  const [bannerMsg, setBannerMsg] = useState('');
  const [activeReceipt, setActiveReceipt] = useState<MoneyReceiptData | null>(null);

  const notify = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(''), 4500);
  };

  const loadRoleWorkspaceData = async () => {
    if (!sessionUser || sessionUser.role !== role) return;
    setDataLoading(true);
    try {
      if (role === 'accounts') {
        const res = await fetch('/api/admin/erp');
        const data = await res.json();
        setAccounts(data.accounts || []);
        setTransactions(data.erpTransactions || []);
        setProjects(data.projects || []);
        setProperties(data.properties || []);
        setBookings(data.bookings || []);
        setPayments(data.payments || []);
        setStaffMembers(data.staffMembers || []);
        setSalaryPayments(data.salaryPayments || []);
        setShareholders(data.shareholders || []);
        setShareDistributions(data.shareDistributions || []);
      } else if (role === 'staff') {
        const res = await fetch(`/api/staff/portal?id=${sessionUser.id}`);
        const data = await res.json();
        setMyStaffProfile(data.staff || null);
        setMySalarySlips(data.salarySlips || []);
        setProjects(data.projects || []);
      } else if (role === 'shareholder') {
        const res = await fetch(`/api/shareholder/portal?id=${sessionUser.id}`);
        const data = await res.json();
        setMyShareholder(data.shareholder || null);
        setAllShareholders(data.allShareholders || []);
        setMyDistributions(data.distributions || []);
        setProjects(data.projects || []);
        setTransactions(data.transactions || []);
      }
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (sessionUser && sessionUser.role === role && role !== 'admin') {
      loadRoleWorkspaceData();
    }
  }, [sessionUser?.role, sessionUser?.id, role]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/role-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          identifier: identifier.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'লগইন তথ্য সঠিক নয়।');
      } else if (data.session) {
        onAuthenticated(data.session);
      }
    } catch {
      setAuthError('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।');
    } finally {
      setAuthLoading(false);
    }
  };

  // Show login gate if not signed in for the active role
  const isAuthenticatedForThisRole = sessionUser && sessionUser.role === role;

  if (!isAuthenticatedForThisRole) {
    const RoleIcon = cfg.icon;
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0B192C] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমপেজ</span>
          </button>
          <HHLogo variant="dark" />
          <button
            type="button"
            onClick={onOpenModulesDirectory}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0B192C] cursor-pointer whitespace-nowrap"
          >
            সকল মডিউল ও লিংক
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Switch Between Separate Role Login Links */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {(['accounts', 'staff', 'shareholder', 'admin'] as PortalRoleKey[]).map((rk) => (
                <button
                  key={rk}
                  type="button"
                  onClick={() => onSwitchRole(rk)}
                  className={`flex-1 px-2.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    role === rk
                      ? 'bg-[#0B162C] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0B162C]'
                  }`}
                >
                  {rk === 'accounts'
                    ? 'হিসাব'
                    : rk === 'staff'
                    ? 'স্টাফ'
                    : rk === 'shareholder'
                    ? 'শেয়ারহোল্ডার'
                    : 'অ্যাডমিন ইআরপি'}
                </button>
              ))}
            </div>

            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#0B162C] text-emerald-400 flex items-center justify-center shrink-0">
                <RoleIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-emerald-700">{cfg.hashLink}</span>
                <h1 className="text-xl font-extrabold text-[#0B162C]">{cfg.titleBn}</h1>
                <p className="text-xs text-slate-500 mt-0.5">{cfg.subtitleBn}</p>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                {authError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইমেইল, মোবাইল নম্বর অথবা আইডি কোড *
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-sm cursor-pointer disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                <span>{authLoading ? 'যাচাই করা হচ্ছে...' : 'নিরাপদ প্রবেশ করুন'}</span>
              </button>
            </form>

            {/* Quick Demo Credentials Info */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                  ডেমো লগইন তথ্য
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier(cfg.demoIdentifier);
                    setPassword('123456');
                  }}
                  className="text-emerald-700 hover:underline font-bold cursor-pointer"
                >
                  ফর্ম পূরণ করুন
                </button>
              </div>
              <p className="font-mono text-slate-600">{cfg.demoLabelBn}</p>
              <p className="font-mono text-slate-600">পাসওয়ার্ড: 123456</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={onOpenCustomerPortal}
                className="font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                গ্রাহক পোর্টাল লগইন (#portal)
              </button>
              <button
                type="button"
                onClick={onOpenModulesDirectory}
                className="font-bold text-slate-600 hover:text-[#0B162C] cursor-pointer"
              >
                মডিউল তালিকা দেখুন →
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#0B162C] flex flex-col">
      {/* Authenticated Role Top Header */}
      <header className="sticky top-0 z-40 bg-[#0B162C] text-white border-b border-emerald-500/40 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>হোমপেজ</span>
          </button>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-emerald-300 block truncate">
              {cfg.titleBn} · {sessionUser.code}
            </span>
            <h1 className="text-sm sm:text-base font-extrabold truncate">{sessionUser.nameBn}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenModulesDirectory}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
          >
            সকল মডিউল
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-extrabold text-white cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8 space-y-6">
        {bannerMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{bannerMsg}</span>
          </div>
        )}

        {dataLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 font-bold text-sm">
            পোর্টালের তথ্য লোড হচ্ছে...
          </div>
        ) : (
          <>
            {/* =====================================================
                1. ACCOUNTS & FINANCE OFFICER WORKSPACE (#accounts)
                ===================================================== */}
            {role === 'accounts' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200">
                  {(
                    [
                      { id: 'accounts', label: 'হিসাব ও ব্যাংক অ্যাকাউন্ট', icon: Landmark },
                      { id: 'expenses', label: 'আয়-ব্যয় ও প্রজেক্ট খরচ', icon: Layers },
                      { id: 'shares', label: 'শেয়ার ভিত্তিক হিসাব', icon: PieChart },
                      { id: 'payroll', label: 'স্টাফ ও বেতন পেরোল', icon: Users },
                      { id: 'receipts', label: 'মানি রিসিট তালিকা', icon: Receipt },
                    ] as { id: AccountsWorkspaceTab; label: string; icon: React.FC<{ className?: string }> }[]
                  ).map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAccTab(tab.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap cursor-pointer transition-colors ${
                          accTab === tab.id
                            ? 'bg-[#059669] text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <TabIcon className="w-4 h-4 shrink-0" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {accTab === 'accounts' && (
                  <AccountsLedgerModule
                    mode="accounts"
                    accounts={accounts}
                    transactions={transactions}
                    projects={projects}
                    bookings={bookings}
                    onRefresh={loadRoleWorkspaceData}
                    onNotify={notify}
                    onPrintVoucher={(tx) =>
                      setActiveReceipt({
                        receiptNumber: tx.voucherNo,
                        issueDate: tx.transactionDate,
                        customerName: tx.type === 'income' ? 'আয় / ক্রেডিট ভাউচার' : 'ব্যয় / ডেবিট ভাউচার',
                        customerPhone: '+৮৮০ ১৭১১-২২৩৩৪৪',
                        customerAddressBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।',
                        bookingNumber: tx.referenceNo || tx.voucherNo,
                        propertyTitleBn: tx.projectNameBn,
                        propertyCode: tx.categoryBn,
                        propertyLocationBn: 'বনশ্রী / বসুন্ধরা, ঢাকা',
                        paymentTitleBn: tx.titleBn,
                        amountBdt: tx.amountBdt,
                        paymentMethodBn: tx.paymentMethodBn,
                        statusBn: 'পরিশোধিত',
                      })
                    }
                  />
                )}

                {accTab === 'expenses' && (
                  <AccountsLedgerModule
                    mode="expenses"
                    accounts={accounts}
                    transactions={transactions}
                    projects={projects}
                    bookings={bookings}
                    onRefresh={loadRoleWorkspaceData}
                    onNotify={notify}
                    onPrintVoucher={(tx) =>
                      setActiveReceipt({
                        receiptNumber: tx.voucherNo,
                        issueDate: tx.transactionDate,
                        customerName: tx.type === 'income' ? 'আয় / ক্রেডিট ভাউচার' : 'ব্যয় / ডেবিট ভাউচার',
                        customerPhone: '+৮৮০ ১৭১১-২২৩৩৪৪',
                        customerAddressBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।',
                        bookingNumber: tx.referenceNo || tx.voucherNo,
                        propertyTitleBn: tx.projectNameBn,
                        propertyCode: tx.categoryBn,
                        propertyLocationBn: 'বনশ্রী / বসুন্ধরা, ঢাকা',
                        paymentTitleBn: tx.titleBn,
                        amountBdt: tx.amountBdt,
                        paymentMethodBn: tx.paymentMethodBn,
                        statusBn: 'পরিশোধিত',
                      })
                    }
                  />
                )}

                {accTab === 'shares' && (
                  <ShareAccountingModule
                    shareholders={shareholders}
                    distributions={shareDistributions}
                    accounts={accounts}
                    projects={projects}
                    onRefresh={loadRoleWorkspaceData}
                    onNotify={notify}
                  />
                )}

                {accTab === 'payroll' && (
                  <StaffPayrollModule
                    staffMembers={staffMembers}
                    salaryPayments={salaryPayments}
                    accounts={accounts}
                    onRefresh={loadRoleWorkspaceData}
                    onNotify={notify}
                  />
                )}

                {accTab === 'receipts' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-lg font-extrabold text-[#0B162C]">
                      গ্রাহক মানি রিসিট ও কিস্তি আদায় ({toBengaliDigits(payments.length)})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-3 px-3">রিসিট নং</th>
                            <th className="py-3 px-3">গ্রাহক ও বুকিং</th>
                            <th className="py-3 px-3">বিবরণ</th>
                            <th className="py-3 px-3 text-right">পরিমাণ</th>
                            <th className="py-3 px-3 text-right">মানি রিসিট</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {payments.map((pay) => {
                            const b = bookings.find((bk) => bk.id === pay.bookingId);
                            const prop = properties.find((pr) => pr.id === b?.propertyId) || properties[0];
                            return (
                              <tr key={pay.id} className="hover:bg-slate-50">
                                <td className="py-3 px-3 font-mono font-bold">{pay.receiptNumber}</td>
                                <td className="py-3 px-3 font-bold">
                                  {b?.customerName || 'গ্রাহক'} · {b?.bookingNumber}
                                </td>
                                <td className="py-3 px-3">{pay.titleBn}</td>
                                <td className="py-3 px-3 text-right font-extrabold tabular-nums-bn">
                                  {formatExactBdtBengali(pay.amountBdt)}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveReceipt({
                                        receiptNumber: pay.receiptNumber,
                                        issueDate: pay.paidDate || pay.dueDate || '২০২৬-১১-২০',
                                        customerName: b?.customerName || 'সম্মানিত গ্রাহক',
                                        customerPhone: b?.customerPhone || '+৮৮০ ১৭১১-২২৩৩৪৪',
                                        customerAddressBn: b?.addressBn || 'ঢাকা',
                                        bookingNumber: b?.bookingNumber || `HH-BK-${pay.bookingId}`,
                                        propertyTitleBn: prop?.titleBn || 'H & H Homes প্রপার্টি',
                                        propertyCode: prop?.propertyCode || 'HH-L-101',
                                        propertyLocationBn: prop?.locationBn || 'বসুন্ধরা / বনশ্রী, ঢাকা',
                                        paymentTitleBn: pay.titleBn,
                                        amountBdt: pay.amountBdt,
                                        paymentMethodBn: pay.paymentMethodBn,
                                        statusBn: pay.statusBn === 'পরিশোধিত' ? 'পরিশোধিত' : 'বকেয়া',
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B162C] text-[#FDE68A] font-bold cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    রিসিট
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =====================================================
                2. STAFF & ENGINEER PORTAL (#staff)
                ===================================================== */}
            {role === 'staff' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Employee Profile Card */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {myStaffProfile?.employeeCode || sessionUser.code}
                      </span>
                      <span className="text-xs font-bold text-emerald-800">
                        {myStaffProfile?.statusBn || 'সক্রিয়'}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-[#0B162C]">
                        {myStaffProfile?.nameBn || sessionUser.nameBn}
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {myStaffProfile?.designationBn} · {myStaffProfile?.departmentBn}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-500 block">মোট মাসিক বেতন</span>
                        <span className="text-base font-extrabold text-emerald-800 tabular-nums-bn">
                          {formatExactBdtBengali(
                            (myStaffProfile?.basicSalaryBdt || 0) + (myStaffProfile?.allowanceBdt || 0)
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">বেতন অ্যাকাউন্ট</span>
                        <span className="font-bold text-[#0B162C]">
                          {myStaffProfile?.bankAccountBn || 'সিটি ব্যাংক'}
                        </span>
                      </div>
                    </div>

                    {/* Daily Attendance Quick Toggle */}
                    {myStaffProfile && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <span className="text-xs font-bold text-slate-700 block">
                          আজকের উপস্থিতি স্ট্যাটাস আপডেট করুন:
                        </span>
                        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                          {(['উপস্থিত', 'ছুটিতে'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={async () => {
                                await fetch(`/api/admin/staff/${myStaffProfile.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ attendanceStatusBn: st }),
                                });
                                notify(`আজকের হাজিরা '${st}' হিসেবে সংরক্ষিত হয়েছে।`);
                                await loadRoleWorkspaceData();
                              }}
                              className={`flex-1 py-2 rounded-lg text-xs font-extrabold cursor-pointer ${
                                myStaffProfile.attendanceStatusBn === st
                                  ? 'bg-[#059669] text-white'
                                  : 'text-slate-600'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Personal Salary Slips */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-lg font-extrabold text-[#0B162C]">
                      আমার মাসিক বেতন পে-স্লিপ ({toBengaliDigits(mySalarySlips.length)})
                    </h3>
                    {mySalarySlips.length === 0 ? (
                      <p className="text-xs text-slate-500 py-8 text-center">
                        এখনো কোনো বেতন স্লিপ তৈরি হয়নি।
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-600 font-bold">
                              <th className="py-2.5 px-2">স্লিপ নং</th>
                              <th className="py-2.5 px-2">মাস ও তারিখ</th>
                              <th className="py-2.5 px-2 text-right">নিট বেতন</th>
                              <th className="py-2.5 px-2 text-right">প্রিন্ট</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {mySalarySlips.map((slip) => (
                              <tr key={slip.id}>
                                <td className="py-3 px-2 font-mono font-bold">{slip.slipNumber}</td>
                                <td className="py-3 px-2">
                                  <span className="font-bold block">{slip.salaryMonth}</span>
                                  <span className="text-slate-500 tabular-nums-bn">{toBengaliDigits(slip.paidDate)}</span>
                                </td>
                                <td className="py-3 px-2 text-right font-extrabold text-emerald-700 tabular-nums-bn">
                                  {formatExactBdtBengali(slip.netSalaryBdt)}
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSlip(slip)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B162C] text-white font-bold cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    পে-স্লিপ
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Company Projects Reference */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="text-lg font-extrabold text-[#0B162C]">
                    চলমান সাইট ও প্রকল্পসমূহ ({toBengaliDigits(projects.length)})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {projects.map((p) => (
                      <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <span className="text-[11px] font-bold text-emerald-700">{p.statusBn}</span>
                        <h4 className="font-extrabold text-sm text-[#0B162C]">{p.nameBn}</h4>
                        <p className="text-xs text-slate-600">{p.locationBn}</p>
                        <p className="text-xs font-bold text-slate-800 pt-1">{p.sizeSummaryBn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =====================================================
                3. SHAREHOLDER & PARTNER PORTAL (#shareholder)
                ===================================================== */}
            {role === 'shareholder' && (
              <div className="space-y-6">
                {/* Shareholder Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#0B162C] text-white p-5 rounded-2xl border border-[#0B162C]">
                    <div className="flex items-center justify-between text-emerald-300">
                      <span className="text-xs font-bold">আমার শেয়ার মালিকানা</span>
                      <PieChart className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-extrabold mt-2 tabular-nums-bn">
                      {toBengaliDigits(myShareholder?.sharePercent || 0)}%
                    </p>
                    <p className="text-xs text-slate-300 mt-1 tabular-nums-bn">
                      মোট শেয়ার: {toBengaliDigits(myShareholder?.totalShares || 0)}টি
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-xs font-bold">পরিশোধিত শেয়ার মূলধন</span>
                      <Coins className="w-4 h-4 text-emerald-700" />
                    </div>
                    <p className="text-2xl font-extrabold text-[#0B162C] mt-2 tabular-nums-bn">
                      {formatExactBdtBengali(myShareholder?.paidCapitalBdt || 0)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {myShareholder?.projectScopeBn}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between text-emerald-700">
                      <span className="text-xs font-bold">মোট প্রাপ্ত লভ্যাংশ</span>
                      <Award className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-800 mt-2 tabular-nums-bn">
                      {formatExactBdtBengali(myShareholder?.totalDividendReceivedBdt || 0)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 tabular-nums-bn">
                      পেআউট সংখ্যা: {toBengaliDigits(myDistributions.length)} বার
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-600 block">অফিশিয়াল স্টেটমেন্ট</span>
                      <p className="text-xs text-slate-500 mt-1">শেয়ারহোল্ডার ইক্যুইটি ও লভ্যাংশ সনদ</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCertModal(true)}
                      className="mt-3 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B162C] text-[#FDE68A] text-xs font-extrabold cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      সার্টিফিকেট প্রিন্ট করুন
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Personal Dividend Payouts */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-lg font-extrabold text-[#0B162C]">
                      আমার প্রাপ্ত লভ্যাংশের ইতিহাস ({toBengaliDigits(myDistributions.length)})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-2.5 px-2">কোড ও তারিখ</th>
                            <th className="py-2.5 px-2">বিবরণ ও সময়কাল</th>
                            <th className="py-2.5 px-2 text-right">প্রাপ্ত লভ্যাংশ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {myDistributions.map((d) => (
                            <tr key={d.id}>
                              <td className="py-3 px-2">
                                <span className="font-mono font-bold block">{d.distributionCode}</span>
                                <span className="text-slate-500 tabular-nums-bn">{toBengaliDigits(d.distributedDate)}</span>
                              </td>
                              <td className="py-3 px-2">
                                <span className="font-bold block text-[#0B162C]">{d.titleBn}</span>
                                <span className="text-slate-500">{d.periodBn} · {d.paymentMethodBn}</span>
                              </td>
                              <td className="py-3 px-2 text-right font-extrabold text-emerald-700 tabular-nums-bn">
                                {formatExactBdtBengali(d.dividendAmountBdt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Partner Cap Table Overview */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-lg font-extrabold text-[#0B162C]">
                      কর্পোরেট শেয়ার কাঠামো (Cap Table)
                    </h3>
                    <div className="space-y-2.5">
                      {allShareholders.map((s) => (
                        <div key={s.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-[#0B162C]">{s.nameBn}</span>
                            <span className="text-emerald-700 tabular-nums-bn">
                              {toBengaliDigits(s.sharePercent)}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#059669] rounded-full"
                              style={{ width: `${s.sharePercent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Company Cashflow Quick Summary */}
                    {transactions.length > 0 && (() => {
                      const summary = calculateErpAccountingSummary(transactions, []);
                      return (
                        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50">
                            <span className="text-slate-500 block">কোম্পানির মোট আয়</span>
                            <span className="font-extrabold text-emerald-700 tabular-nums-bn">
                              {formatExactBdtBengali(summary.totalIncomeBdt)}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50">
                            <span className="text-slate-500 block">মোট প্রকল্প ব্যয়</span>
                            <span className="font-extrabold text-rose-700 tabular-nums-bn">
                              {formatExactBdtBengali(summary.totalExpenseBdt)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {activeReceipt && (
        <MoneyReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}

      {selectedSlip && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setSelectedSlip(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border-2 border-[#0B162C]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-bold text-emerald-700">H &amp; H Homes — স্যালারি পে-স্লিপ</p>
                <h3 className="text-lg font-extrabold text-[#0B162C]">{selectedSlip.salaryMonth}</h3>
                <p className="text-xs font-mono text-slate-500">{selectedSlip.slipNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlip(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 cursor-pointer no-print"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">নাম</span>
                <span className="font-extrabold">{selectedSlip.staffNameBn}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">মূল + ভাতা</span>
                <span className="font-bold tabular-nums-bn">
                  {formatExactBdtBengali(selectedSlip.basicSalaryBdt + selectedSlip.allowanceBdt)}
                </span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-emerald-50 font-extrabold text-sm text-emerald-900">
                <span>নিট প্রদত্ত বেতন</span>
                <span className="tabular-nums-bn">{formatExactBdtBengali(selectedSlip.netSalaryBdt)}</span>
              </div>
            </div>
            <div className="flex justify-end no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0B162C] text-white text-xs font-extrabold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {showCertModal && myShareholder && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setShowCertModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border-2 border-[#0B162C]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b-2 border-[#0B162C] pb-4">
              <div>
                <p className="text-xs font-extrabold text-emerald-700">
                  H &amp; H Homes — শেয়ারহোল্ডার ইক্যুইটি সনদ
                </p>
                <h3 className="text-xl font-extrabold text-[#0B162C]">{myShareholder.nameBn}</h3>
                <p className="text-xs text-slate-500">
                  কোড: {myShareholder.shareholderCode} · রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="p-2 rounded-lg bg-slate-100 text-slate-700 cursor-pointer no-print"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">মোট শেয়ার</span>
                <span className="font-extrabold tabular-nums-bn">
                  {toBengaliDigits(myShareholder.totalShares)} টি ({toBengaliDigits(myShareholder.sharePercent)}%)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">পরিশোধিত মূলধন</span>
                <span className="font-extrabold tabular-nums-bn">
                  {formatExactBdtBengali(myShareholder.paidCapitalBdt)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">মোট প্রাপ্ত লভ্যাংশ</span>
                <span className="font-extrabold text-emerald-700 tabular-nums-bn">
                  {formatExactBdtBengali(myShareholder.totalDividendReceivedBdt)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">স্কোপ</span>
                <span className="font-bold">{myShareholder.projectScopeBn}</span>
              </div>
            </div>
            <div className="flex justify-end no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0B162C] text-white text-xs font-extrabold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                সার্টিফিকেট প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
