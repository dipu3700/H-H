import React, { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Coins,
  FileSpreadsheet,
  PieChart,
  PlusCircle,
  Printer,
  Users,
  X,
} from 'lucide-react';
import {
  FinancialAccountItem,
  ProjectItem,
  ShareDistributionItem,
  ShareholderItem,
} from '../../types';
import {
  calculateShareDistribution,
  formatExactBdtBengali,
  toBengaliDigits,
} from '../../utils/bengaliLogic';

interface ShareAccountingModuleProps {
  shareholders: ShareholderItem[];
  distributions: ShareDistributionItem[];
  accounts: FinancialAccountItem[];
  projects: ProjectItem[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}

export const ShareAccountingModule: React.FC<ShareAccountingModuleProps> = ({
  shareholders,
  distributions,
  accounts,
  projects,
  onRefresh,
  onNotify,
}) => {
  // Profit Distribution Calculator State
  const [distTitle, setDistTitle] = useState('২০২৬ ৪র্থ প্রান্তিক প্রজেক্ট মুনাফা লভ্যাংশ');
  const [distPeriod, setDistPeriod] = useState('অক্টোবর – ডিসেম্বর ২০২৬');
  const [distProject, setDistProject] = useState('সকল প্রকল্প সমন্বিত হিসাব');
  const [distProfit, setDistProfit] = useState('2000000');
  const [distAccountId, setDistAccountId] = useState<string>(
    accounts[1]?.id ? String(accounts[1].id) : String(accounts[0]?.id || 2)
  );
  const [distributing, setDistributing] = useState(false);

  // Add Shareholder Form State
  const [showAddHolder, setShowAddHolder] = useState(false);
  const [shName, setShName] = useState('');
  const [shRole, setShRole] = useState('শেয়ারহোল্ডার ও বিনিয়োগ অংশীদার');
  const [shPhone, setShPhone] = useState('');
  const [shEmail, setShEmail] = useState('');
  const [shNid, setShNid] = useState('');
  const [shShares, setShShares] = useState('500');
  const [shPercent, setShPercent] = useState('5');
  const [shCommittedCap, setShCommittedCap] = useState('5000000');
  const [shPaidCap, setShPaidCap] = useState('5000000');
  const [shScope, setShScope] = useState('H & H Homes কর্পোরেট ইক্যুইটি');
  const [addingHolder, setAddingHolder] = useState(false);

  // Printable Shareholder Certificate / Statement Modal
  const [selectedHolderForPrint, setSelectedHolderForPrint] = useState<ShareholderItem | null>(null);

  const equitySummary = useMemo(() => {
    let totalShares = 0;
    let totalPercent = 0;
    let totalCommitted = 0;
    let totalPaid = 0;
    let totalDividends = 0;

    for (const s of shareholders) {
      totalShares += Number(s.totalShares || 0);
      totalPercent += Number(s.sharePercent || 0);
      totalCommitted += Number(s.committedCapitalBdt || 0);
      totalPaid += Number(s.paidCapitalBdt || 0);
      totalDividends += Number(s.totalDividendReceivedBdt || 0);
    }
    return { totalShares, totalPercent, totalCommitted, totalPaid, totalDividends };
  }, [shareholders]);

  const previewCalc = useMemo(
    () => calculateShareDistribution(Number(distProfit || 0), shareholders),
    [distProfit, shareholders]
  );

  const handleDistributeDividends = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(distProfit || 0);
    if (!distTitle.trim() || amt <= 0) {
      onNotify('অনুগ্রহ করে লভ্যাংশের শিরোনাম ও বণ্টনযোগ্য মুনাফার পরিমাণ দিন।');
      return;
    }
    setDistributing(true);
    try {
      const selectedAcc = accounts.find((a) => String(a.id) === distAccountId);
      const res = await fetch('/api/admin/shareholders/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleBn: distTitle.trim(),
          periodBn: distPeriod.trim(),
          projectNameBn: distProject.trim(),
          totalProfitBdt: amt,
          accountId: Number(distAccountId || 2),
          paymentMethodBn: selectedAcc
            ? `ব্যাংক ট্রান্সফার (${selectedAcc.accountNameBn})`
            : 'ব্যাংক ট্রান্সফার',
        }),
      });
      if (res.ok) {
        onNotify('শেয়ার আনুপাতিক লভ্যাংশ সফলভাবে বিতরণ এবং লেজারে ব্যয় ভাউচার যুক্ত হয়েছে।');
        await onRefresh();
      } else {
        const err = await res.json();
        onNotify(err.error || 'লভ্যাংশ বিতরণ করা যায়নি।');
      }
    } finally {
      setDistributing(false);
    }
  };

  const handleAddShareholder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shName.trim() || !shPercent) return;
    setAddingHolder(true);
    try {
      const res = await fetch('/api/admin/shareholders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameBn: shName.trim(),
          designationOrRoleBn: shRole.trim(),
          phone: shPhone.trim(),
          email: shEmail.trim(),
          nidNumber: shNid.trim(),
          totalShares: Number(shShares || 0),
          sharePercent: Number(shPercent || 0),
          committedCapitalBdt: Number(shCommittedCap || 0),
          paidCapitalBdt: Number(shPaidCap || 0),
          projectScopeBn: shScope.trim(),
        }),
      });
      if (res.ok) {
        setShName('');
        setShPhone('');
        setShEmail('');
        setShNid('');
        setShowAddHolder(false);
        onNotify('নতুন শেয়ারহোল্ডার সফলভাবে ইক্যুইটি রেজিস্টারে যুক্ত হয়েছেন।');
        await onRefresh();
      } else {
        const err = await res.json();
        onNotify(err.error || 'শেয়ারহোল্ডার নিবন্ধন ব্যর্থ হয়েছে।');
      }
    } finally {
      setAddingHolder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Equity KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B162C] text-white p-5 rounded-2xl border border-[#0B162C]">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-bold">মোট পরিশোধিত শেয়ার মূলধন</span>
            <Coins className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold mt-2 tabular-nums-bn">
            {formatExactBdtBengali(equitySummary.totalPaid)}
          </p>
          <p className="text-xs text-slate-300 mt-1 tabular-nums-bn">
            প্রতিশ্রুত মূলধন: {formatExactBdtBengali(equitySummary.totalCommitted)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-bold">অংশীদার / শেয়ারহোল্ডার সংখ্যা</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B162C] mt-2 tabular-nums-bn">
            {toBengaliDigits(shareholders.length)} জন
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums-bn">
            মোট শেয়ার সংখ্যা: {toBengaliDigits(equitySummary.totalShares)} টি
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-bold">মোট বরাদ্দকৃত শেয়ার মালিকানা</span>
            <PieChart className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B162C] mt-2 tabular-nums-bn">
            {toBengaliDigits(equitySummary.totalPercent)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">আবণ্টনকৃত ইক্যুইটি হিসাব</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold">মোট লভ্যাংশ বিতরণ</span>
            <Award className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-800 mt-2 tabular-nums-bn">
            {formatExactBdtBengali(equitySummary.totalDividends)}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums-bn">
            মোট লেনদেন: {toBengaliDigits(distributions.length)}টি পেআউট
          </p>
        </div>
      </div>

      {/* Profit & Dividend Calculator + Posting Form */}
      <form
        onSubmit={handleDistributeDividends}
        className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-[#0B162C]">
              শেয়ার ভিত্তিক মুনাফা ও লভ্যাংশ বণ্টন ক্যালকুলেটর (Dividend Run)
            </h3>
            <p className="text-xs text-slate-500">
              মোট বণ্টনযোগ্য মুনাফা লিখলে প্রতিটি শেয়ারহোল্ডারের প্রাপ্য অংশ হিসাব হয়ে ব্যাংক থেকে পরিশোধ ও লেজারে পোস্ট হবে।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold mb-1">লভ্যাংশ ঘোষণার শিরোনাম *</label>
            <input
              type="text"
              required
              value={distTitle}
              onChange={(e) => setDistTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">অর্থবছর / সময়কাল</label>
            <input
              type="text"
              value={distPeriod}
              onChange={(e) => setDistPeriod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">সংশ্লিষ্ট প্রজেক্ট / খাত</label>
            <select
              value={distProject}
              onChange={(e) => setDistProject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
            >
              <option value="সকল প্রকল্প সমন্বিত হিসাব">সকল প্রকল্প সমন্বিত হিসাব</option>
              {projects.map((p) => (
                <option key={p.id} value={p.nameBn}>
                  {p.nameBn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">প্রদানের ব্যাংক/ক্যাশ অ্যাকাউন্ট</label>
            <select
              value={distAccountId}
              onChange={(e) => setDistAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
            >
              {accounts.map((a) => (
                <option key={a.id} value={String(a.id)}>
                  {a.accountNameBn}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold mb-1">মোট বণ্টনযোগ্য মুনাফা (BDT) *</label>
            <input
              type="number"
              required
              min="1000"
              value={distProfit}
              onChange={(e) => setDistProfit(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-extrabold text-emerald-800"
            />
          </div>
          <div className="lg:col-span-8 flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs space-y-0.5">
              <span className="text-slate-500 block">প্রাপ্য বণ্টনের প্রিভিউ ({toBengaliDigits(previewCalc.allocatedPercent)}% শেয়ার)</span>
              <span className="text-sm font-extrabold text-[#0B162C] tabular-nums-bn">
                মোট বরাদ্দ: {formatExactBdtBengali(previewCalc.totalAllocatedDividendBdt)}
              </span>
            </div>
            <button
              type="submit"
              disabled={distributing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              {distributing ? 'বণ্টন সম্পন্ন হচ্ছে...' : 'সকল শেয়ারহোল্ডারকে লভ্যাংশ প্রদান করুন'}
            </button>
          </div>
        </div>

        {/* Live Allocation Preview Strip */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-2 px-2">শেয়ারহোল্ডারের নাম</th>
                <th className="py-2 px-2 text-right">শেয়ার সংখ্যা</th>
                <th className="py-2 px-2 text-right">হিসাবের অংশ (%)</th>
                <th className="py-2 px-2 text-right">এই রাউন্ডে প্রাপ্য লভ্যাংশ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewCalc.allocations.map((row) => (
                <tr key={row.shareholderId}>
                  <td className="py-2.5 px-2 font-bold text-[#0B162C]">{row.nameBn}</td>
                  <td className="py-2.5 px-2 text-right tabular-nums-bn">{toBengaliDigits(row.totalShares)} টি</td>
                  <td className="py-2.5 px-2 text-right tabular-nums-bn font-bold">{toBengaliDigits(row.sharePercent)}%</td>
                  <td className="py-2.5 px-2 text-right tabular-nums-bn font-extrabold text-emerald-700">
                    {formatExactBdtBengali(row.dividendAmountBdt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </form>

      {/* Shareholder Registry */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-[#0B162C]">
              শেয়ারহোল্ডার ও পার্টনার রেজিস্টার ({toBengaliDigits(shareholders.length)} জন)
            </h3>
            <p className="text-xs text-slate-500">
              প্রতিটি শেয়ারহোল্ডার পোর্টাল লগিনের জন্য ডিফল্ট পাসওয়ার্ড <code className="font-mono font-bold">123456</code> দিয়ে `#shareholder` লিংকে প্রবেশ করতে পারবেন।
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddHolder((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B162C] hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            নতুন শেয়ারহোল্ডার নিবন্ধন
          </button>
        </div>

        {showAddHolder && (
          <form
            onSubmit={handleAddShareholder}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
          >
            <h4 className="text-sm font-extrabold text-[#0B162C]">নতুন শেয়ারহোল্ডার / পার্টনার তথ্য</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={shName}
                  onChange={(e) => setShName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">পদবী / ভূমিকা</label>
                <input
                  type="text"
                  value={shRole}
                  onChange={(e) => setShRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">প্রকল্প / ইক্যুইটি স্কোপ</label>
                <input
                  type="text"
                  value={shScope}
                  onChange={(e) => setShScope(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={shPhone}
                  onChange={(e) => setShPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">ইমেইল</label>
                <input
                  type="email"
                  value={shEmail}
                  onChange={(e) => setShEmail(e.target.value)}
                  placeholder="partner5@hhhomesbd.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">জাতীয় পরিচয়পত্র (NID)</label>
                <input
                  type="text"
                  value={shNid}
                  onChange={(e) => setShNid(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">মোট শেয়ার সংখ্যা</label>
                <input
                  type="number"
                  value={shShares}
                  onChange={(e) => setShShares(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">শেয়ার অংশ (%) *</label>
                <input
                  type="number"
                  required
                  value={shPercent}
                  onChange={(e) => setShPercent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">জমাকৃত মূলধন (BDT)</label>
                <input
                  type="number"
                  value={shPaidCap}
                  onChange={(e) => {
                    setShPaidCap(e.target.value);
                    setShCommittedCap(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={addingHolder}
                className="px-4 py-2 rounded-lg bg-[#059669] text-white text-xs font-extrabold cursor-pointer disabled:opacity-60"
              >
                {addingHolder ? 'সংরক্ষণ হচ্ছে...' : 'শেয়ারহোল্ডার সংরক্ষণ করুন'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddHolder(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-slate-600 cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 text-xs font-bold">
                <th className="py-3 px-3">আইডি ও শেয়ারহোল্ডার</th>
                <th className="py-3 px-3">ইক্যুইটি স্কোপ ও যোগাযোগ</th>
                <th className="py-3 px-3 text-right">শেয়ার / (%)</th>
                <th className="py-3 px-3 text-right">পরিশোধিত মূলধন</th>
                <th className="py-3 px-3 text-right">প্রাপ্ত লভ্যাংশ</th>
                <th className="py-3 px-3 text-right">সার্টিফিকেট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shareholders.map((sh) => (
                <tr key={sh.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <span className="font-mono text-xs font-bold text-emerald-700 block">
                      {sh.shareholderCode}
                    </span>
                    <span className="font-extrabold text-sm text-[#0B162C] block">{sh.nameBn}</span>
                    <span className="text-xs text-slate-500">{sh.designationOrRoleBn}</span>
                  </td>
                  <td className="py-3 px-3 text-xs">
                    <p className="font-semibold text-[#0B162C]">{sh.projectScopeBn}</p>
                    <p className="text-slate-500">
                      {sh.phone} · {sh.email}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums-bn">
                    <span className="font-extrabold text-[#0B162C] block">
                      {toBengaliDigits(sh.sharePercent)}%
                    </span>
                    <span className="text-xs text-slate-500">{toBengaliDigits(sh.totalShares)} শেয়ার</span>
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums-bn font-bold text-[#0B162C]">
                    {formatExactBdtBengali(sh.paidCapitalBdt)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums-bn font-extrabold text-emerald-700">
                    {formatExactBdtBengali(sh.totalDividendReceivedBdt)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedHolderForPrint(sh)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0B162C] text-[#0B162C] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      স্টেটমেন্ট
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dividend Distribution History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#0B162C]">
            ইতিপূর্বে বিতরণকৃত লভ্যাংশের তালিকা ({toBengaliDigits(distributions.length)})
          </h3>
          <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-2.5 px-3">কোড ও তারিখ</th>
                <th className="py-2.5 px-3">শিরোনাম ও সময়কাল</th>
                <th className="py-2.5 px-3">শেয়ারহোল্ডার (%)</th>
                <th className="py-2.5 px-3">পেমেন্ট মাধ্যম</th>
                <th className="py-2.5 px-3 text-right">প্রদত্ত লভ্যাংশ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {distributions.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold block">{d.distributionCode}</span>
                    <span className="text-slate-500 tabular-nums-bn">{toBengaliDigits(d.distributedDate)}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#0B162C] block">{d.titleBn}</span>
                    <span className="text-slate-500">{d.periodBn} · {d.projectNameBn}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#0B162C]">
                    {d.shareholderNameBn} ({toBengaliDigits(d.sharePercent)}%)
                  </td>
                  <td className="py-3 px-3 text-slate-600">{d.paymentMethodBn}</td>
                  <td className="py-3 px-3 text-right font-extrabold text-emerald-700 tabular-nums-bn">
                    {formatExactBdtBengali(d.dividendAmountBdt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Shareholder Statement / Equity Certificate Modal */}
      {selectedHolderForPrint && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setSelectedHolderForPrint(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border-2 border-[#0B162C] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b-2 border-[#0B162C] pb-4">
              <div>
                <p className="text-xs font-extrabold uppercase text-emerald-700">
                  H &amp; H Homes — শেয়ার ও ইক্যুইটি সার্টিফিকেট
                </p>
                <h3 className="text-xl font-extrabold text-[#0B162C] mt-0.5">
                  শেয়ারহোল্ডার মূলধন ও লভ্যাংশ বিবরণী
                </h3>
                <p className="text-xs text-slate-500">রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHolderForPrint(null)}
                className="p-2 rounded-lg bg-slate-100 text-slate-700 cursor-pointer no-print"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">শেয়ারহোল্ডার আইডি</span>
                <span className="font-mono font-bold text-[#0B162C]">{selectedHolderForPrint.shareholderCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block">পূর্ণ নাম ও ভূমিকা</span>
                <span className="font-extrabold text-[#0B162C]">{selectedHolderForPrint.nameBn}</span>
              </div>
              <div>
                <span className="text-slate-500 block">মোট শেয়ার ও শতাংশ</span>
                <span className="font-extrabold text-emerald-800 tabular-nums-bn">
                  {toBengaliDigits(selectedHolderForPrint.totalShares)} টি ({toBengaliDigits(selectedHolderForPrint.sharePercent)}%)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">ইক্যুইটি স্কোপ</span>
                <span className="font-bold text-[#0B162C]">{selectedHolderForPrint.projectScopeBn}</span>
              </div>
              <div>
                <span className="text-slate-500 block">পরিশোধিত মূলধন</span>
                <span className="font-extrabold text-[#0B162C] tabular-nums-bn">
                  {formatExactBdtBengali(selectedHolderForPrint.paidCapitalBdt)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">সর্বমোট প্রাপ্ত লভ্যাংশ</span>
                <span className="font-extrabold text-emerald-700 tabular-nums-bn">
                  {formatExactBdtBengali(selectedHolderForPrint.totalDividendReceivedBdt)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0B162C] text-white text-xs font-extrabold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                প্রিন্ট / পিডিএফ সংরক্ষণ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
