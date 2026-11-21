import React, { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Building2,
  Landmark,
  Layers,
  PlusCircle,
  Printer,
  Search,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  BookingItem,
  ErpTransactionItem,
  FinancialAccountItem,
  ProjectItem,
} from '../../types';
import {
  calculateAccountsLiquiditySummary,
  calculateErpAccountingSummary,
  calculateProjectCostBreakdown,
  formatExactBdtBengali,
  toBengaliDigits,
} from '../../utils/bengaliLogic';

interface AccountsLedgerModuleProps {
  mode: 'accounts' | 'expenses';
  accounts: FinancialAccountItem[];
  transactions: ErpTransactionItem[];
  projects: ProjectItem[];
  bookings: BookingItem[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
  onPrintVoucher: (tx: ErpTransactionItem) => void;
}

const COST_CENTER_OPTIONS = [
  'নির্মাণ ও সাইট খরচ',
  'ভূমি উন্নয়ন ও নিবন্ধন',
  'বিক্রয় ও কিস্তি আদায়',
  'স্টাফ ও পেরোল বিভাগ',
  'অফিস ও প্রশাসনিক ব্যয়',
  'বিপণন ও বিজ্ঞাপন',
  'ইক্যুইটি ও শেয়ার লভ্যাংশ',
  'কর্পোরেট ট্রেজারি',
];

const CATEGORY_OPTIONS = [
  'বুকিং ও কিস্তি আদায়',
  'কমার্শিয়াল স্পেস বিক্রি আদায়',
  'ভূমি অধিগ্রহণ ও বালি ভরাট ব্যয়',
  'নির্মাণ সামগ্রী (রড, সিমেন্ট ও পাথর)',
  'অফিস বেতন ও প্রশাসনিক ব্যয়',
  'সাইট উন্নয়ন ও ইউটিলিটি',
  'আইনগত ও দলিল খরচ',
  'শেয়ারহোল্ডার মূলধন জমা',
];

export const AccountsLedgerModule: React.FC<AccountsLedgerModuleProps> = ({
  mode,
  accounts,
  transactions,
  projects,
  bookings,
  onRefresh,
  onNotify,
  onPrintVoucher,
}) => {
  // Voucher Entry Form State
  const [txType, setTxType] = useState<'income' | 'expense'>(
    mode === 'expenses' ? 'expense' : 'income'
  );
  const [txCategory, setTxCategory] = useState(
    mode === 'expenses' ? 'নির্মাণ সামগ্রী (রড, সিমেন্ট ও পাথর)' : 'বুকিং ও কিস্তি আদায়'
  );
  const [txCostCenter, setTxCostCenter] = useState(
    mode === 'expenses' ? 'নির্মাণ ও সাইট খরচ' : 'বিক্রয় ও কিস্তি আদায়'
  );
  const [txAccountId, setTxAccountId] = useState<string>(
    accounts[1]?.id ? String(accounts[1].id) : String(accounts[0]?.id || 1)
  );
  const [txProjectId, setTxProjectId] = useState<string>(
    projects[0]?.id ? String(projects[0].id) : '0'
  );
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txRef, setTxRef] = useState('');
  const [txMethod, setTxMethod] = useState('ব্যাংক ট্রান্সফার / পে-অর্ডার');
  const [txNotes, setTxNotes] = useState('');
  const [submittingTx, setSubmittingTx] = useState(false);

  // Add Bank/Cash Account State
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<'bank' | 'cash' | 'mfs'>('bank');
  const [accBankName, setAccBankName] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [accBranch, setAccBranch] = useState('বনশ্রী শাখা, ঢাকা');
  const [accOpeningBal, setAccOpeningBal] = useState('0');
  const [submittingAcc, setSubmittingAcc] = useState(false);

  // Inter-Account Transfer State
  const [showTransfer, setShowTransfer] = useState(false);
  const [fromAccId, setFromAccId] = useState<string>(String(accounts[0]?.id || 1));
  const [toAccId, setToAccId] = useState<string>(String(accounts[1]?.id || 2));
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  // Ledger Filter State
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(
    mode === 'expenses' ? 'expense' : 'all'
  );
  const [filterCostCenter, setFilterCostCenter] = useState<string>('সকল');
  const [filterProject, setFilterProject] = useState<string>('সকল');
  const [searchQuery, setSearchQuery] = useState('');

  const accountingSummary = useMemo(
    () => calculateErpAccountingSummary(transactions, bookings),
    [transactions, bookings]
  );

  const liquiditySummary = useMemo(
    () => calculateAccountsLiquiditySummary(accounts),
    [accounts]
  );

  const projectBreakdown = useMemo(
    () => calculateProjectCostBreakdown(projects, transactions),
    [projects, transactions]
  );

  const costCenterTotals = useMemo(() => {
    const map: Record<string, number> = {};
    let totalExp = 0;
    for (const tx of transactions) {
      if (tx.type !== 'expense') continue;
      const key = tx.costCenterBn || tx.categoryBn || 'অন্যান্য খরচ';
      map[key] = (map[key] || 0) + Number(tx.amountBdt || 0);
      totalExp += Number(tx.amountBdt || 0);
    }
    return Object.entries(map)
      .map(([name, amountBdt]) => ({
        name,
        amountBdt,
        sharePct: totalExp > 0 ? Math.round((amountBdt / totalExp) * 100) : 0,
      }))
      .sort((a, b) => b.amountBdt - a.amountBdt);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterCostCenter !== 'সকল' && (tx.costCenterBn || '') !== filterCostCenter) {
        return false;
      }
      if (filterProject !== 'সকল' && tx.projectNameBn !== filterProject) return false;
      if (q) {
        const hay =
          `${tx.voucherNo} ${tx.titleBn} ${tx.categoryBn} ${tx.projectNameBn} ${tx.referenceNo}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterCostCenter, filterProject, searchQuery]);

  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txAmount) return;
    setSubmittingTx(true);
    try {
      const selectedProj = projects.find((p) => String(p.id) === txProjectId);
      const selectedAcc = accounts.find((a) => String(a.id) === txAccountId);
      const res = await fetch('/api/admin/erp/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: txType,
          categoryBn: txCategory,
          costCenterBn: txCostCenter,
          accountId: Number(txAccountId || 0),
          projectId: selectedProj ? selectedProj.id : 0,
          projectNameBn: selectedProj ? selectedProj.nameBn : 'সাধারণ কর্পোরেট হিসাব',
          titleBn: txTitle.trim(),
          amountBdt: Number(txAmount),
          paymentMethodBn: selectedAcc ? selectedAcc.accountNameBn : txMethod,
          referenceNo: txRef.trim(),
          notesBn: txNotes.trim(),
        }),
      });
      if (res.ok) {
        setTxTitle('');
        setTxAmount('');
        setTxRef('');
        setTxNotes('');
        onNotify('নতুন আয়-ব্যয় ভাউচার লেজার ও অ্যাকাউন্ট ব্যালেন্সে সফলভাবে যুক্ত হয়েছে।');
        await onRefresh();
      } else {
        const err = await res.json();
        onNotify(err.error || 'ভাউচার সংরক্ষণ করা যায়নি।');
      }
    } finally {
      setSubmittingTx(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim() || !accBankName.trim()) return;
    setSubmittingAcc(true);
    try {
      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNameBn: accName.trim(),
          accountType: accType,
          bankNameBn: accBankName.trim(),
          accountNumber: accNumber.trim(),
          branchBn: accBranch.trim(),
          openingBalanceBdt: Number(accOpeningBal || 0),
        }),
      });
      if (res.ok) {
        setAccName('');
        setAccBankName('');
        setAccNumber('');
        setAccOpeningBal('0');
        setShowAddAccount(false);
        onNotify('নতুন ব্যাংক/ক্যাশ অ্যাকাউন্ট সফলভাবে যুক্ত হয়েছে।');
        await onRefresh();
      } else {
        const err = await res.json();
        onNotify(err.error || 'অ্যাকাউন্ট যোগ করতে সমস্যা হয়েছে।');
      }
    } finally {
      setSubmittingAcc(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(transferAmount || 0);
    if (!fromAccId || !toAccId || fromAccId === toAccId || amt <= 0) {
      onNotify('অনুগ্রহ করে ভিন্ন দুটি অ্যাকাউন্ট ও সঠিক টাকার পরিমাণ নির্বাচন করুন।');
      return;
    }
    setSubmittingTransfer(true);
    try {
      const res = await fetch('/api/admin/accounts/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: Number(fromAccId),
          toAccountId: Number(toAccId),
          amountBdt: amt,
          notesBn: transferNote.trim(),
        }),
      });
      if (res.ok) {
        setTransferAmount('');
        setTransferNote('');
        setShowTransfer(false);
        onNotify('অ্যাকাউন্ট ফান্ড ট্রান্সফার সম্পন্ন ও ব্যালেন্স আপডেট হয়েছে।');
        await onRefresh();
      } else {
        const err = await res.json();
        onNotify(err.error || 'ফান্ড ট্রান্সফার সম্পন্ন করা যায়নি।');
      }
    } finally {
      setSubmittingTransfer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Financial KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B162C] text-white p-5 rounded-2xl border border-[#0B162C]">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-bold">মোট ব্যাংক ও ক্যাশ স্থিতি</span>
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2 tabular-nums-bn">
            {formatExactBdtBengali(liquiditySummary.totalLiquidityBdt)}
          </p>
          <p className="text-xs text-slate-300 mt-1 tabular-nums-bn">
            ব্যাংক {formatExactBdtBengali(liquiditySummary.bankTotalBdt)} · ক্যাশ{' '}
            {formatExactBdtBengali(liquiditySummary.cashTotalBdt)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold">সর্বমোট আয় ও কিস্তি আদায়</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-800 mt-2 tabular-nums-bn">
            {formatExactBdtBengali(accountingSummary.totalIncomeBdt)}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums-bn">
            মোট চুক্তি মূল্য: {formatExactBdtBengali(accountingSummary.totalBookingContractBdt)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-bold">সর্বমোট ব্যয় ও অপারেশন খরচ</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-rose-700 mt-2 tabular-nums-bn">
            {formatExactBdtBengali(accountingSummary.totalExpenseBdt)}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums-bn">
            খরচ খাত: {toBengaliDigits(costCenterTotals.length)}টি বিভাগ
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-bold">নিট মুনাফা / উদ্বৃত্ত (আয়-ব্যয়)</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <p
            className={`text-2xl font-extrabold mt-2 tabular-nums-bn ${
              accountingSummary.netBalanceBdt >= 0 ? 'text-emerald-800' : 'text-rose-700'
            }`}
          >
            {formatExactBdtBengali(accountingSummary.netBalanceBdt)}
          </p>
          <p className="text-xs text-amber-700 font-semibold mt-1 tabular-nums-bn">
            গ্রাহক বকেয়া: {formatExactBdtBengali(accountingSummary.totalReceivableBdt)}
          </p>
        </div>
      </div>

      {/* Bank, Cash & MFS Accounts Portfolio */}
      {mode === 'accounts' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-[#0B162C]">
                কোম্পানির ব্যাংক, ক্যাশ ও এমএফএস অ্যাকাউন্ট ({toBengaliDigits(accounts.length)}টি)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                প্রতিটি ভাউচার, কিস্তি আদায়, বেতন ও লভ্যাংশ বিতরণের সাথে ব্যালেন্স স্বয়ংক্রিয়ভাবে হালনাগাদ হয়।
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowTransfer((prev) => !prev);
                  setShowAddAccount(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#0B162C] text-xs font-extrabold whitespace-nowrap cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4 text-emerald-700" />
                ফান্ড ট্রান্সফার
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddAccount((prev) => !prev);
                  setShowTransfer(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold whitespace-nowrap cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                নতুন অ্যাকাউন্ট যোগ
              </button>
            </div>
          </div>

          {/* Inter-Account Transfer Panel */}
          {showTransfer && (
            <form
              onSubmit={handleTransfer}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
            >
              <h4 className="text-sm font-extrabold text-[#0B162C]">
                ক্যাশ ও ব্যাংক অ্যাকাউন্টের মধ্যে ফান্ড ট্রান্সফার
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">উৎস অ্যাকাউন্ট</label>
                  <select
                    value={fromAccId}
                    onChange={(e) => setFromAccId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={String(a.id)}>
                        {a.accountNameBn} ({formatExactBdtBengali(a.currentBalanceBdt)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">গন্তব্য অ্যাকাউন্ট</label>
                  <select
                    value={toAccId}
                    onChange={(e) => setToAccId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={String(a.id)}>
                        {a.accountNameBn} ({formatExactBdtBengali(a.currentBalanceBdt)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">টাকার পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="100000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">মন্তব্য</label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="অফিস ক্যাশ রিফিল"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submittingTransfer}
                  className="px-4 py-2 rounded-lg bg-[#0B162C] text-white text-xs font-extrabold cursor-pointer disabled:opacity-60"
                >
                  {submittingTransfer ? 'প্রক্রিয়াধীন...' : 'ট্রান্সফার নিশ্চিত করুন'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransfer(false)}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          )}

          {/* Add New Account Form */}
          {showAddAccount && (
            <form
              onSubmit={handleAddAccount}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
            >
              <h4 className="text-sm font-extrabold text-[#0B162C]">নতুন ব্যাংক বা ক্যাশ অ্যাকাউন্ট নিবন্ধন</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">অ্যাকাউন্টের নাম *</label>
                  <input
                    type="text"
                    required
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="যেমন: ব্র্যাক ব্যাংক — বসুন্ধরা প্রকল্প"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ধরন</label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as 'bank' | 'cash' | 'mfs')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                  >
                    <option value="bank">ব্যাংক অ্যাকাউন্ট</option>
                    <option value="cash">অফিস ক্যাশ</option>
                    <option value="mfs">বিকাশ / নগদ (MFS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ব্যাংক / প্রতিষ্ঠানের নাম *</label>
                  <input
                    type="text"
                    required
                    value={accBankName}
                    onChange={(e) => setAccBankName(e.target.value)}
                    placeholder="ব্র্যাক ব্যাংক পিএলসি"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">অ্যাকাউন্ট নম্বর</label>
                  <input
                    type="text"
                    value={accNumber}
                    onChange={(e) => setAccNumber(e.target.value)}
                    placeholder="1504200019281"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">শাখা</label>
                  <input
                    type="text"
                    value={accBranch}
                    onChange={(e) => setAccBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">প্রারম্ভিক স্থিতি (BDT)</label>
                  <input
                    type="number"
                    value={accOpeningBal}
                    onChange={(e) => setAccOpeningBal(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submittingAcc}
                  className="px-4 py-2 rounded-lg bg-[#059669] text-white text-xs font-extrabold cursor-pointer disabled:opacity-60"
                >
                  {submittingAcc ? 'সংরক্ষণ হচ্ছে...' : 'অ্যাকাউন্ট সংরক্ষণ করুন'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAccount(false)}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-slate-600 cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          )}

          {/* Account Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map((acc) => {
              const Icon =
                acc.accountType === 'cash'
                  ? Wallet
                  : acc.accountType === 'mfs'
                  ? Smartphone
                  : Landmark;
              return (
                <div
                  key={acc.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold">{acc.accountCode}</span>
                      <Icon className="w-4 h-4 text-emerald-700 shrink-0" />
                    </div>
                    <h4 className="font-extrabold text-sm text-[#0B162C] leading-snug">
                      {acc.accountNameBn}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {acc.bankNameBn} · {acc.branchBn}
                    </p>
                    <p className="text-xs font-mono text-slate-500">নং: {acc.accountNumber}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">বর্তমান ব্যালেন্স</span>
                    <span className="text-base font-extrabold text-emerald-800 tabular-nums-bn">
                      {formatExactBdtBengali(acc.currentBalanceBdt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense & Project Profit-Loss Breakdown */}
      {mode === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Project Budget vs Actual P&L Table */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#0B162C]">
                  প্রকল্পভিত্তিক বাজেট, আয়-ব্যয় ও লাভ-ক্ষতি (Project P&amp;L)
                </h3>
                <p className="text-xs text-slate-500">
                  বসুন্ধরা প্লট ও বনশ্রী ভবন প্রকল্পগুলোর সরাসরি ও অফিস খরচ বিশ্লেষণ
                </p>
              </div>
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-2">প্রকল্পের নাম</th>
                    <th className="py-2.5 px-2 text-right">বাজেট</th>
                    <th className="py-2.5 px-2 text-right">মোট আয়</th>
                    <th className="py-2.5 px-2 text-right">মোট ব্যয়</th>
                    <th className="py-2.5 px-2 text-right">নিট অবস্থান</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectBreakdown.map((row) => (
                    <tr key={row.projectId} className="hover:bg-slate-50">
                      <td className="py-3 px-2 font-bold text-[#0B162C]">
                        <span className="block">{row.projectNameBn}</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          বাজেট ব্যবহার: {toBengaliDigits(row.budgetUtilizationPct)}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right tabular-nums-bn text-slate-600">
                        {formatExactBdtBengali(row.budgetBdt)}
                      </td>
                      <td className="py-3 px-2 text-right tabular-nums-bn font-bold text-emerald-700">
                        {formatExactBdtBengali(row.incomeBdt)}
                      </td>
                      <td className="py-3 px-2 text-right tabular-nums-bn font-bold text-rose-700">
                        {formatExactBdtBengali(row.totalExpenseBdt)}
                      </td>
                      <td
                        className={`py-3 px-2 text-right tabular-nums-bn font-extrabold ${
                          row.netProfitBdt >= 0 ? 'text-emerald-800' : 'text-rose-700'
                        }`}
                      >
                        {formatExactBdtBengali(row.netProfitBdt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Center Expense Distribution */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-extrabold text-[#0B162C]">খাত ও বিভাগভিত্তিক খরচ বিভাজন</h3>
            {costCenterTotals.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">এখনো কোনো খরচ এন্ট্রি হয়নি।</p>
            ) : (
              <div className="space-y-3">
                {costCenterTotals.map((cc) => (
                  <div key={cc.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700">{cc.name}</span>
                      <span className="text-[#0B162C] tabular-nums-bn">
                        {formatExactBdtBengali(cc.amountBdt)} ({toBengaliDigits(cc.sharePct)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-600 rounded-full transition-all"
                        style={{ width: `${Math.max(4, cc.sharePct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Income / Expense Voucher Entry Form */}
      <form
        onSubmit={handleAddVoucher}
        className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4"
      >
        <h3 className="text-lg font-extrabold text-[#0B162C]">
          নতুন আয় / ব্যয় ভাউচার এন্ট্রি (ক্যাশবুক ও কস্ট সেন্টার)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-xs font-bold mb-1">লেনদেনের ধরন *</label>
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value as 'income' | 'expense')}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs bg-white"
            >
              <option value="income">আয় / জমা (Credit)</option>
              <option value="expense">ব্যয় / খরচ (Debit)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">খরচ / আয়ের বিভাগ (Cost Center)</label>
            <select
              value={txCostCenter}
              onChange={(e) => setTxCostCenter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
            >
              {COST_CENTER_OPTIONS.map((cc) => (
                <option key={cc} value={cc}>
                  {cc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">হিসাবের খাত *</label>
            <select
              value={txCategory}
              onChange={(e) => setTxCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">ব্যাংক / ক্যাশ অ্যাকাউন্ট</label>
            <select
              value={txAccountId}
              onChange={(e) => setTxAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
            >
              {accounts.map((a) => (
                <option key={a.id} value={String(a.id)}>
                  {a.accountNameBn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">সংশ্লিষ্ট প্রজেক্ট</label>
            <select
              value={txProjectId}
              onChange={(e) => setTxProjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
            >
              {projects.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.nameBn}
                </option>
              ))}
              <option value="0">সাধারণ কর্পোরেট হিসাব</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-5">
            <label className="block text-xs font-bold mb-1">ভাউচারের বিবরণ *</label>
            <input
              type="text"
              required
              value={txTitle}
              onChange={(e) => setTxTitle(e.target.value)}
              placeholder="যেমন: বসুন্ধরা প্রকল্পের বালু ভরাট বা রড-সিমেন্ট ক্রয় বিল"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-bold mb-1">টাকার পরিমাণ (BDT) *</label>
            <input
              type="number"
              required
              min="1"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              placeholder="250000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold mb-1">রেফারেন্স / চেক নং</label>
            <input
              type="text"
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
              placeholder="CHK-99210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={submittingTx}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-sm cursor-pointer disabled:opacity-60"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>{submittingTx ? 'সংরক্ষণ...' : 'ভাউচার জমা'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filterable Corporate Ledger Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-extrabold text-[#0B162C]">
            কর্পোরেট লেজার ও ভাউচার স্টেটমেন্ট ({toBengaliDigits(filteredTransactions.length)}টি এন্ট্রি)
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['all', 'income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer ${
                    filterType === t
                      ? 'bg-white text-[#0B162C] shadow-xs'
                      : 'text-slate-600 hover:text-[#0B162C]'
                  }`}
                >
                  {t === 'all' ? 'সকল' : t === 'income' ? 'শুধু আয়' : 'শুধু ব্যয়'}
                </button>
              ))}
            </div>

            <select
              value={filterCostCenter}
              onChange={(e) => setFilterCostCenter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="সকল">সকল বিভাগ (Cost Center)</option>
              {COST_CENTER_OPTIONS.map((cc) => (
                <option key={cc} value={cc}>
                  {cc}
                </option>
              ))}
            </select>

            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white max-w-[180px]"
            >
              <option value="সকল">সকল প্রকল্প</option>
              {projects.map((p) => (
                <option key={p.id} value={p.nameBn}>
                  {p.nameBn}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ভাউচার বা বিবরণ খুঁজুন..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 text-xs font-bold">
                <th className="py-3 px-3">ভাউচার নং ও তারিখ</th>
                <th className="py-3 px-3">খাত ও বিভাগ</th>
                <th className="py-3 px-3">বিবরণ ও মাধ্যম</th>
                <th className="py-3 px-3 text-right">টাকার পরিমাণ</th>
                <th className="py-3 px-3 text-right">ভাউচার</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                    নির্বাচিত ফিল্টারের অধীনে কোনো লেনদেন পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-xs block text-[#0B162C]">
                        {tx.voucherNo}
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums-bn">
                        {toBengaliDigits(tx.transactionDate)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-xs block text-[#0B162C]">
                        {tx.categoryBn}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold block">
                        {tx.costCenterBn || 'সাধারণ'} · {tx.projectNameBn}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-xs text-[#0B162C]">{tx.titleBn}</p>
                      <p className="text-[11px] text-slate-500">
                        মাধ্যম: {tx.paymentMethodBn}
                        {tx.referenceNo ? ` · রেফ: ${tx.referenceNo}` : ''}
                      </p>
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-extrabold text-sm tabular-nums-bn ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'} {formatExactBdtBengali(tx.amountBdt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onPrintVoucher(tx)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0B162C] text-[#0B162C] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        প্রিন্ট
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
