import React, { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Banknote,
  Briefcase,
  CheckCircle2,
  PlusCircle,
  Printer,
  Users,
  X,
} from 'lucide-react';
import {
  FinancialAccountItem,
  SalaryPaymentItem,
  StaffMemberItem,
} from '../../types';
import {
  calculateMonthlyPayrollSummary,
  formatExactBdtBengali,
  toBengaliDigits,
} from '../../utils/bengaliLogic';

interface StaffPayrollModuleProps {
  staffMembers: StaffMemberItem[];
  salaryPayments: SalaryPaymentItem[];
  accounts: FinancialAccountItem[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}

const DEPARTMENTS = [
  'সকল বিভাগ',
  'হিসাব ও অর্থ',
  'প্রকৌশল ও সাইট',
  'বিক্রয় ও বিপণন',
  'আইনি ও দলিল',
  'প্রশাসন ও এইচআর',
];

export const StaffPayrollModule: React.FC<StaffPayrollModuleProps> = ({
  staffMembers,
  salaryPayments,
  accounts,
  onRefresh,
  onNotify,
}) => {
  const [selectedDept, setSelectedDept] = useState('সকল বিভাগ');

  // Payroll Runner State
  const [salaryMonth, setSalaryMonth] = useState('নভেম্বর ২০২৬');
  const [targetStaffId, setTargetStaffId] = useState<string>('0');
  const [payrollAccountId, setPayrollAccountId] = useState<string>(
    accounts[1]?.id ? String(accounts[1].id) : String(accounts[0]?.id || 2)
  );
  const [deductionBdt, setDeductionBdt] = useState('0');
  const [processingPayroll, setProcessingPayroll] = useState(false);

  // Add Staff Form State
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [stName, setStName] = useState('');
  const [stDesignation, setStDesignation] = useState('');
  const [stDept, setStDept] = useState('প্রকৌশল ও সাইট');
  const [stPhone, setStPhone] = useState('');
  const [stEmail, setStEmail] = useState('');
  const [stBasic, setStBasic] = useState('35000');
  const [stAllowance, setStAllowance] = useState('10000');
  const [stBank, setStBank] = useState('');
  const [addingStaff, setAddingStaff] = useState(false);

  // Printable Payslip Modal
  const [selectedSlip, setSelectedSlip] = useState<SalaryPaymentItem | null>(null);

  const payrollSummary = useMemo(
    () => calculateMonthlyPayrollSummary(staffMembers),
    [staffMembers]
  );

  const filteredStaff = useMemo(() => {
    if (selectedDept === 'সকল বিভাগ') return staffMembers;
    return staffMembers.filter((s) => s.departmentBn === selectedDept);
  }, [staffMembers, selectedDept]);

  const presentCount = useMemo(
    () => staffMembers.filter((s) => s.attendanceStatusBn === 'উপস্থিত').length,
    [staffMembers]
  );

  const handleToggleAttendance = async (st: StaffMemberItem, nextAttendance: string) => {
    const res = await fetch(`/api/admin/staff/${st.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendanceStatusBn: nextAttendance }),
    });
    if (res.ok) {
      onNotify(`${st.nameBn}-এর হাজিরা স্ট্যাটাস '${nextAttendance}' করা হয়েছে।`);
      await onRefresh();
    }
  };

  const handleRunPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingPayroll(true);
    try {
      const selectedAcc = accounts.find((a) => String(a.id) === payrollAccountId);
      const res = await fetch('/api/admin/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: Number(targetStaffId || 0),
          salaryMonth: salaryMonth.trim(),
          deductionBdt: Number(deductionBdt || 0),
          accountId: Number(payrollAccountId || 2),
          paymentMethodBn: selectedAcc
            ? `ব্যাংক ট্রান্সফার (${selectedAcc.accountNameBn})`
            : 'ব্যাংক ট্রান্সফার',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const count = Array.isArray(data.slips) ? data.slips.length : 1;
        onNotify(
          `${salaryMonth} মাসের ${toBengaliDigits(count)} জন স্টাফের বেতন পরিশোধ ও লেজার ভাউচার সম্পন্ন হয়েছে।`
        );
        await onRefresh();
      } else {
        const err = await res.json();
        onNotify(err.error || 'বেতন প্রক্রিয়া সম্পন্ন হয়নি।');
      }
    } finally {
      setProcessingPayroll(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stName.trim() || !stDesignation.trim() || !stBasic) return;
    setAddingStaff(true);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameBn: stName.trim(),
          designationBn: stDesignation.trim(),
          departmentBn: stDept,
          phone: stPhone.trim(),
          email: stEmail.trim(),
          basicSalaryBdt: Number(stBasic),
          allowanceBdt: Number(stAllowance || 0),
          bankAccountBn: stBank.trim(),
        }),
      });
      if (res.ok) {
        setStName('');
        setStDesignation('');
        setStPhone('');
        setStEmail('');
        setStBank('');
        setShowAddStaff(false);
        onNotify('নতুন কর্মকর্তা/কর্মচারী এইচআর ডাটাবেসে যুক্ত হয়েছেন।');
        await onRefresh();
      } else {
        const err = await res.json();
        onNotify(err.error || 'স্টাফ যোগ করা যায়নি।');
      }
    } finally {
      setAddingStaff(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HR & Payroll KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B162C] text-white p-5 rounded-2xl border border-[#0B162C]">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-bold">মাসিক মোট বেতন বাজেট</span>
            <Banknote className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold mt-2 tabular-nums-bn">
            {formatExactBdtBengali(payrollSummary.totalNetPayableBdt)}
          </p>
          <p className="text-xs text-slate-300 mt-1 tabular-nums-bn">
            মূল বেতন {formatExactBdtBengali(payrollSummary.totalBasicSalaryBdt)} + ভাতা{' '}
            {formatExactBdtBengali(payrollSummary.totalAllowanceBdt)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-bold">সক্রিয় কর্মকর্তা ও স্টাফ</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B162C] mt-2 tabular-nums-bn">
            {toBengaliDigits(payrollSummary.activeStaffCount)} জন
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums-bn">
            আজ উপস্থিত: {toBengaliDigits(presentCount)} জন
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-bold">কার্যকর বিভাগ সংখ্যা</span>
            <Briefcase className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B162C] mt-2 tabular-nums-bn">
            {toBengaliDigits(Object.keys(payrollSummary.byDepartment).length)}টি বিভাগ
          </p>
          <p className="text-xs text-slate-500 mt-1">হিসাব, প্রকৌশল, বিক্রয়, আইনি ও এইচআর</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold">ইস্যুকৃত পে-স্লিপ</span>
            <BadgeCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-800 mt-2 tabular-nums-bn">
            {toBengaliDigits(salaryPayments.length)}টি স্লিপ
          </p>
          <p className="text-xs text-slate-500 mt-1">স্বয়ংক্রিয় লেজার পোস্টিং</p>
        </div>
      </div>

      {/* Monthly Payroll Processor */}
      <form
        onSubmit={handleRunPayroll}
        className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4"
      >
        <div>
          <h3 className="text-lg font-extrabold text-[#0B162C]">
            মাসিক বেতন ও ভাতা পরিশোধ (Payroll Run)
          </h3>
          <p className="text-xs text-slate-500">
            বেতন পরিশোধ করলে নির্বাচিত ব্যাংক অ্যাকাউন্ট থেকে টাকা সমন্বয় হয়ে স্যালারি পে-স্লিপ এবং ব্যয় ভাউচার তৈরি হবে।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          <div>
            <label className="block text-xs font-bold mb-1">বেতনের মাস *</label>
            <input
              type="text"
              required
              value={salaryMonth}
              onChange={(e) => setSalaryMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">কার বেতন দেবেন?</label>
            <select
              value={targetStaffId}
              onChange={(e) => setTargetStaffId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="0">সকল সক্রিয় স্টাফ ({toBengaliDigits(staffMembers.length)} জন)</option>
              {staffMembers.map((st) => (
                <option key={st.id} value={String(st.id)}>
                  {st.nameBn} ({formatExactBdtBengali(st.basicSalaryBdt + st.allowanceBdt)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">প্রদানের ব্যাংক/ক্যাশ</label>
            <select
              value={payrollAccountId}
              onChange={(e) => setPayrollAccountId(e.target.value)}
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
            <label className="block text-xs font-bold mb-1">কর্তন / অ্যাডভান্স সমন্বয় (BDT)</label>
            <input
              type="number"
              min="0"
              value={deductionBdt}
              onChange={(e) => setDeductionBdt(e.target.value)}
              disabled={targetStaffId === '0'}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold disabled:bg-slate-100"
            />
          </div>
          <button
            type="submit"
            disabled={processingPayroll}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{processingPayroll ? 'প্রক্রিয়াধীন...' : 'বেতন পরিশোধ করুন'}</span>
          </button>
        </div>
      </form>

      {/* Staff Directory & Live Attendance Toggle */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-[#0B162C]">
              স্টাফ ও কর্মচারী তালিকা, হাজিরা ও বেতন কাঠামো
            </h3>
            <p className="text-xs text-slate-500">
              স্টাফরা `#staff` লিংকে নিজের ইমেইল/মোবাইল এবং পাসওয়ার্ড <code className="font-mono font-bold">123456</code> দিয়ে লগিন করে পে-স্লিপ দেখতে পারবেন।
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddStaff((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B162C] hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            নতুন স্টাফ নিয়োগ এন্ট্রি
          </button>
        </div>

        {/* Department Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                selectedDept === dept
                  ? 'bg-white text-[#0B162C] shadow-xs'
                  : 'text-slate-600 hover:text-[#0B162C]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {showAddStaff && (
          <form
            onSubmit={handleAddStaff}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
          >
            <h4 className="text-sm font-extrabold text-[#0B162C]">নতুন স্টাফের তথ্য যোগ করুন</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={stName}
                  onChange={(e) => setStName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">পদবী *</label>
                <input
                  type="text"
                  required
                  value={stDesignation}
                  onChange={(e) => setStDesignation(e.target.value)}
                  placeholder="সাইট অ্যাসিস্ট্যান্ট ইঞ্জিনিয়ার"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">বিভাগ</label>
                <select
                  value={stDept}
                  onChange={(e) => setStDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                >
                  {DEPARTMENTS.filter((d) => d !== 'সকল বিভাগ').map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">মোবাইল</label>
                <input
                  type="text"
                  value={stPhone}
                  onChange={(e) => setStPhone(e.target.value)}
                  placeholder="01711000299"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">ইমেইল</label>
                <input
                  type="email"
                  value={stEmail}
                  onChange={(e) => setStEmail(e.target.value)}
                  placeholder="emp@hhhomesbd.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">মূল বেতন (BDT) *</label>
                <input
                  type="number"
                  required
                  value={stBasic}
                  onChange={(e) => setStBasic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">ভাতা (Allowance)</label>
                <input
                  type="number"
                  value={stAllowance}
                  onChange={(e) => setStAllowance(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">বেতন ব্যাংক/ওয়ালেট নং</label>
                <input
                  type="text"
                  value={stBank}
                  onChange={(e) => setStBank(e.target.value)}
                  placeholder="ইসলামী ব্যাংক #2050..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={addingStaff}
                className="px-4 py-2 rounded-lg bg-[#059669] text-white text-xs font-extrabold cursor-pointer disabled:opacity-60"
              >
                {addingStaff ? 'সংরক্ষণ হচ্ছে...' : 'স্টাফ সংরক্ষণ করুন'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddStaff(false)}
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
                <th className="py-3 px-3">আইডি ও নাম</th>
                <th className="py-3 px-3">বিভাগ ও যোগাযোগ</th>
                <th className="py-3 px-3 text-right">মূল + ভাতা</th>
                <th className="py-3 px-3 text-right">মোট মাসিক বেতন</th>
                <th className="py-3 px-3 text-right">দৈনিক হাজিরা স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <span className="font-mono text-xs font-bold text-emerald-700 block">
                      {st.employeeCode}
                    </span>
                    <span className="font-extrabold text-sm text-[#0B162C] block">{st.nameBn}</span>
                    <span className="text-xs text-slate-500">{st.designationBn}</span>
                  </td>
                  <td className="py-3 px-3 text-xs">
                    <p className="font-bold text-[#0B162C]">{st.departmentBn}</p>
                    <p className="text-slate-500">
                      {st.phone} · {st.email}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-right text-xs tabular-nums-bn text-slate-600">
                    {formatExactBdtBengali(st.basicSalaryBdt)} + {formatExactBdtBengali(st.allowanceBdt)}
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-[#0B162C] tabular-nums-bn">
                    {formatExactBdtBengali(st.basicSalaryBdt + st.allowanceBdt)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                      {(['উপস্থিত', 'ছুটিতে', 'অনুপস্থিত'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleToggleAttendance(st, status)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                            st.attendanceStatusBn === status
                              ? status === 'উপস্থিত'
                                ? 'bg-emerald-600 text-white'
                                : status === 'ছুটিতে'
                                ? 'bg-amber-600 text-white'
                                : 'bg-rose-600 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paid Salary Slips Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-lg font-extrabold text-[#0B162C]">
          ইস্যুকৃত মাসিক স্যালারি পে-স্লিপ ({toBengaliDigits(salaryPayments.length)})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-2.5 px-3">স্লিপ নং</th>
                <th className="py-2.5 px-3">স্টাফ ও বিভাগ</th>
                <th className="py-2.5 px-3">বেতনের মাস ও তারিখ</th>
                <th className="py-2.5 px-3 text-right">নিট প্রদত্ত বেতন</th>
                <th className="py-2.5 px-3 text-right">পে-স্লিপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salaryPayments.map((slip) => (
                <tr key={slip.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold">{slip.slipNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#0B162C] block">{slip.staffNameBn}</span>
                    <span className="text-slate-500">{slip.departmentBn}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold block">{slip.salaryMonth}</span>
                    <span className="text-slate-500 tabular-nums-bn">{toBengaliDigits(slip.paidDate)}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-emerald-700 tabular-nums-bn">
                    {formatExactBdtBengali(slip.netSalaryBdt)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedSlip(slip)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0B162C] text-[#0B162C] hover:text-white font-bold transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      স্লিপ প্রিন্ট
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Official Payslip Modal */}
      {selectedSlip && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setSelectedSlip(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border-2 border-[#0B162C] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b-2 border-[#0B162C] pb-3">
              <div>
                <p className="text-xs font-bold text-emerald-700">H &amp; H Homes — স্যালারি পে-স্লিপ</p>
                <h3 className="text-lg font-extrabold text-[#0B162C]">
                  {selectedSlip.salaryMonth} — বেতন বিবরণী
                </h3>
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
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">কর্মকর্তা / কর্মচারী</span>
                <span className="font-extrabold text-[#0B162C]">{selectedSlip.staffNameBn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">বিভাগ</span>
                <span className="font-bold">{selectedSlip.departmentBn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">মূল বেতন</span>
                <span className="font-bold tabular-nums-bn">{formatExactBdtBengali(selectedSlip.basicSalaryBdt)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">বাড়িভাড়া ও অন্যান্য ভাতা</span>
                <span className="font-bold tabular-nums-bn">{formatExactBdtBengali(selectedSlip.allowanceBdt)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">কর্তন / সমন্বয়</span>
                <span className="font-bold text-rose-700 tabular-nums-bn">
                  - {formatExactBdtBengali(selectedSlip.deductionBdt)}
                </span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-lg font-extrabold text-sm text-emerald-900">
                <span>নিট পরিশোধিত বেতন</span>
                <span className="tabular-nums-bn">{formatExactBdtBengali(selectedSlip.netSalaryBdt)}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                মাধ্যম: {selectedSlip.paymentMethodBn} · তারিখ: {toBengaliDigits(selectedSlip.paidDate)}
              </p>
            </div>

            <div className="flex justify-end no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0B162C] text-white text-xs font-extrabold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                পে-স্লিপ প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
