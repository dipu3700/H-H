export interface PropertyFilterInput {
  categoryBn?: string;
  areaBn?: string;
  projectId?: number | string;
  minBudget?: number;
  maxBudget?: number;
  propertyType?: string;
}

export interface FilterableProperty {
  id: number;
  propertyCode: string;
  projectId: number | null;
  titleBn: string;
  categoryBn: string;
  propertyType: string;
  areaBn: string;
  priceBdt: number;
  statusBn: string;
}

const EN_TO_BN_DIGITS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const BN_TO_EN_DIGITS: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export function toBengaliDigits(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => EN_TO_BN_DIGITS[d] || d);
}

export function toEnglishDigits(input: string): string {
  return String(input).replace(/[০-৯]/g, (d) => BN_TO_EN_DIGITS[d] || d);
}

export function formatBdtInBengali(amountBdt: number, lang: 'bn' | 'en' = 'bn'): string {
  const absAmount = Math.abs(amountBdt);
  const sign = amountBdt < 0 ? '-' : '';
  if (lang === 'en') {
    if (absAmount >= 10000000) {
      const cr = (absAmount / 10000000).toFixed(2).replace(/\.00$/, '');
      return `${sign}BDT ${cr} Crore`;
    }
    if (absAmount >= 100000) {
      const lakh = (absAmount / 100000).toFixed(2).replace(/\.00$/, '');
      return `${sign}BDT ${lakh} Lakh`;
    }
    return `${sign}BDT ${absAmount.toLocaleString('en-IN')}`;
  }

  if (absAmount >= 10000000) {
    const cr = (absAmount / 10000000).toFixed(2).replace(/\.00$/, '');
    return `${sign}৳ ${toBengaliDigits(cr)} কোটি`;
  }
  if (absAmount >= 100000) {
    const lakh = (absAmount / 100000).toFixed(2).replace(/\.00$/, '');
    return `${sign}৳ ${toBengaliDigits(lakh)} লক্ষ`;
  }
  return `${sign}৳ ${toBengaliDigits(absAmount.toLocaleString('en-IN'))}`;
}

export function formatExactBdtBengali(amountBdt: number): string {
  const formatted = Math.abs(amountBdt).toLocaleString('en-IN');
  const sign = amountBdt < 0 ? '-' : '';
  return `${sign}৳ ${toBengaliDigits(formatted)}`;
}

export function filterProperties<T extends FilterableProperty>(
  items: T[],
  filters: PropertyFilterInput
): T[] {
  return items.filter((item) => {
    if (filters.categoryBn && filters.categoryBn !== 'সকল ধরন' && item.categoryBn !== filters.categoryBn) {
      return false;
    }
    if (filters.areaBn && filters.areaBn !== 'সকল এলাকা' && item.areaBn !== filters.areaBn) {
      return false;
    }
    if (filters.projectId && filters.projectId !== 'all' && Number(filters.projectId) > 0) {
      if (item.projectId !== Number(filters.projectId)) {
        return false;
      }
    }
    if (filters.propertyType && filters.propertyType !== 'all' && item.propertyType !== filters.propertyType) {
      return false;
    }
    if (typeof filters.minBudget === 'number' && filters.minBudget > 0) {
      if (item.priceBdt < filters.minBudget) {
        return false;
      }
    }
    if (typeof filters.maxBudget === 'number' && filters.maxBudget > 0) {
      if (item.priceBdt > filters.maxBudget) {
        return false;
      }
    }
    return true;
  });
}

export function canBookProperty(statusBn: string): boolean {
  return statusBn === 'বুকিং চলছে';
}

export function generateBookingNumber(sequenceSeed: number, year = 2026): string {
  const padded = String(sequenceSeed).padStart(4, '0');
  return `HH-BK-${year}-${padded}`;
}

export function generateReceiptNumber(sequenceSeed: number, year = 2026): string {
  const padded = String(sequenceSeed).padStart(4, '0');
  return `HH-MR-${year}-${padded}`;
}

export function generateVoucherNumber(sequenceSeed: number, year = 2026): string {
  const padded = String(sequenceSeed).padStart(4, '0');
  return `HH-VCH-${year}-${padded}`;
}

export interface InstallmentPlanResult {
  totalPriceBdt: number;
  bookingMoneyBdt: number;
  remainingPrincipalBdt: number;
  installmentCount: number;
  monthlyInstallmentBdt: number;
}

export function calculateInstallmentPlan(
  totalPriceBdt: number,
  bookingMoneyBdt: number,
  planChoice: string
): InstallmentPlanResult {
  const remainingPrincipalBdt = Math.max(0, totalPriceBdt - bookingMoneyBdt);
  let installmentCount = 1;
  if (planChoice.includes('৩৬') || planChoice.includes('36')) {
    installmentCount = 36;
  } else if (planChoice.includes('৬০') || planChoice.includes('60')) {
    installmentCount = 60;
  } else if (planChoice.includes('২৪') || planChoice.includes('24')) {
    installmentCount = 24;
  }

  const monthlyInstallmentBdt =
    installmentCount > 1 ? Math.round(remainingPrincipalBdt / installmentCount) : remainingPrincipalBdt;

  return {
    totalPriceBdt,
    bookingMoneyBdt,
    remainingPrincipalBdt,
    installmentCount,
    monthlyInstallmentBdt,
  };
}

export function validateBookingApplication(input: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  nidNumber: string;
  addressBn: string;
}): { valid: boolean; errorBn?: string } {
  if (!input.customerName || input.customerName.trim().length < 2) {
    return { valid: false, errorBn: 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।' };
  }
  const cleanPhone = toEnglishDigits(input.customerPhone).replace(/[\s\-+]/g, '');
  if (!/^(88)?01[3-9]\d{8}$/.test(cleanPhone)) {
    return { valid: false, errorBn: 'অনুগ্রহ করে সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: ০১৭XXXXXXXX)।' };
  }
  if (!input.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customerEmail.trim())) {
    return { valid: false, errorBn: 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।' };
  }
  const cleanNid = toEnglishDigits(input.nidNumber).replace(/\s/g, '');
  if (!/^\d{10,17}$/.test(cleanNid)) {
    return { valid: false, errorBn: 'অনুগ্রহ করে সঠিক জাতীয় পরিচয়পত্র (NID) নম্বর দিন (১০-১৭ সংখ্যা)।' };
  }
  if (!input.addressBn || input.addressBn.trim().length < 4) {
    return { valid: false, errorBn: 'অনুগ্রহ করে আপনার বর্তমান ঠিকানা লিখুন।' };
  }
  return { valid: true };
}

export function validateCustomerSignup(input: {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): { valid: boolean; errorBn?: string } {
  if (!input.name || input.name.trim().length < 2) {
    return { valid: false, errorBn: 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।' };
  }
  const cleanPhone = toEnglishDigits(input.phone).replace(/[\s\-+]/g, '');
  if (!/^(88)?01[3-9]\d{8}$/.test(cleanPhone)) {
    return { valid: false, errorBn: 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: ০১৭XXXXXXXX)।' };
  }
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return { valid: false, errorBn: 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন।' };
  }
  if (!input.password || input.password.length < 4) {
    return { valid: false, errorBn: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
  }
  if (typeof input.confirmPassword === 'string' && input.password !== input.confirmPassword) {
    return { valid: false, errorBn: 'পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।' };
  }
  return { valid: true };
}

export interface ErpAccountingSummary {
  totalIncomeBdt: number;
  totalExpenseBdt: number;
  netBalanceBdt: number;
  totalBookingContractBdt: number;
  totalCollectedFromBookingsBdt: number;
  totalReceivableBdt: number;
}

export function calculateErpAccountingSummary(
  transactions: Array<{ type: string; amountBdt: number }>,
  bookingsList: Array<{ totalPriceBdt: number; paidAmountBdt: number; dueAmountBdt: number; statusBn: string }>
): ErpAccountingSummary {
  let totalIncomeBdt = 0;
  let totalExpenseBdt = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncomeBdt += Number(tx.amountBdt || 0);
    } else if (tx.type === 'expense') {
      totalExpenseBdt += Number(tx.amountBdt || 0);
    }
  }

  let totalBookingContractBdt = 0;
  let totalCollectedFromBookingsBdt = 0;
  let totalReceivableBdt = 0;

  for (const b of bookingsList) {
    if (b.statusBn !== 'বাতিল') {
      totalBookingContractBdt += Number(b.totalPriceBdt || 0);
      totalCollectedFromBookingsBdt += Number(b.paidAmountBdt || 0);
      totalReceivableBdt += Number(b.dueAmountBdt || 0);
    }
  }

  return {
    totalIncomeBdt,
    totalExpenseBdt,
    netBalanceBdt: totalIncomeBdt - totalExpenseBdt,
    totalBookingContractBdt,
    totalCollectedFromBookingsBdt,
    totalReceivableBdt,
  };
}

export function formatReceiptAmountInWordsBn(amountBdt: number): string {
  const abs = Math.max(0, Math.round(Number(amountBdt || 0)));
  if (abs === 0) return 'শূন্য টাকা মাত্র';

  const crore = Math.floor(abs / 10000000);
  const remAfterCrore = abs % 10000000;
  const lakh = Math.floor(remAfterCrore / 100000);
  const remAfterLakh = remAfterCrore % 100000;
  const thousand = Math.floor(remAfterLakh / 1000);
  const remainder = remAfterLakh % 1000;

  const parts: string[] = [];
  if (crore > 0) parts.push(`${toBengaliDigits(crore)} কোটি`);
  if (lakh > 0) parts.push(`${toBengaliDigits(lakh)} লক্ষ`);
  if (thousand > 0) parts.push(`${toBengaliDigits(thousand)} হাজার`);
  if (remainder > 0) parts.push(`${toBengaliDigits(remainder)}`);

  return `${parts.join(' ')} টাকা মাত্র`;
}

export interface AccountBalanceSummary {
  totalLiquidityBdt: number;
  cashTotalBdt: number;
  bankTotalBdt: number;
  mfsTotalBdt: number;
}

export function calculateAccountsLiquiditySummary(
  accounts: Array<{ accountType: string; currentBalanceBdt: number }>
): AccountBalanceSummary {
  let cashTotalBdt = 0;
  let bankTotalBdt = 0;
  let mfsTotalBdt = 0;

  for (const acc of accounts) {
    const bal = Number(acc.currentBalanceBdt || 0);
    if (acc.accountType === 'cash') cashTotalBdt += bal;
    else if (acc.accountType === 'mfs') mfsTotalBdt += bal;
    else bankTotalBdt += bal;
  }

  return {
    totalLiquidityBdt: cashTotalBdt + bankTotalBdt + mfsTotalBdt,
    cashTotalBdt,
    bankTotalBdt,
    mfsTotalBdt,
  };
}

export interface ProjectCostBreakdownItem {
  projectId: number;
  projectNameBn: string;
  budgetBdt: number;
  incomeBdt: number;
  directCostBdt: number;
  overheadCostBdt: number;
  totalExpenseBdt: number;
  netProfitBdt: number;
  budgetUtilizationPct: number;
}

export function calculateProjectCostBreakdown(
  projectsList: Array<{ id: number; nameBn: string; totalBudgetBdt: number }>,
  transactions: Array<{
    type: string;
    projectId?: number;
    projectNameBn?: string;
    costCenterBn?: string;
    categoryBn?: string;
    amountBdt: number;
  }>
): ProjectCostBreakdownItem[] {
  return projectsList.map((proj) => {
    let incomeBdt = 0;
    let directCostBdt = 0;
    let overheadCostBdt = 0;

    for (const tx of transactions) {
      const matchesProject =
        Number(tx.projectId || 0) === proj.id ||
        (tx.projectNameBn || '').trim() === proj.nameBn.trim();
      if (!matchesProject) continue;

      const amt = Number(tx.amountBdt || 0);
      if (tx.type === 'income') {
        incomeBdt += amt;
      } else if (tx.type === 'expense') {
        const cc = `${tx.costCenterBn || ''} ${tx.categoryBn || ''}`;
        if (
          cc.includes('বেতন') ||
          cc.includes('অফিস') ||
          cc.includes('প্রশাসনিক') ||
          cc.includes('লভ্যাংশ')
        ) {
          overheadCostBdt += amt;
        } else {
          directCostBdt += amt;
        }
      }
    }

    const totalExpenseBdt = directCostBdt + overheadCostBdt;
    const budgetBdt = Number(proj.totalBudgetBdt || 0);
    const budgetUtilizationPct =
      budgetBdt > 0 ? Math.min(100, Math.round((totalExpenseBdt / budgetBdt) * 100)) : 0;

    return {
      projectId: proj.id,
      projectNameBn: proj.nameBn,
      budgetBdt,
      incomeBdt,
      directCostBdt,
      overheadCostBdt,
      totalExpenseBdt,
      netProfitBdt: incomeBdt - totalExpenseBdt,
      budgetUtilizationPct,
    };
  });
}

export interface ShareAllocationRow {
  shareholderId: number;
  nameBn: string;
  sharePercent: number;
  dividendAmountBdt: number;
  totalShares: number;
}

export interface ShareDistributionCalculation {
  totalProfitBdt: number;
  allocatedPercent: number;
  totalAllocatedDividendBdt: number;
  unallocatedProfitBdt: number;
  allocations: ShareAllocationRow[];
}

export function calculateShareDistribution(
  totalProfitBdt: number,
  shareholdersList: Array<{
    id: number;
    nameBn: string;
    totalShares: number;
    sharePercent: number;
    statusBn?: string;
  }>
): ShareDistributionCalculation {
  const cleanProfit = Math.max(0, Math.round(Number(totalProfitBdt || 0)));
  const activeHolders = shareholdersList.filter((s) => s.statusBn !== 'নিষ্ক্রিয়');

  let allocatedPercent = 0;
  let totalAllocatedDividendBdt = 0;

  const allocations: ShareAllocationRow[] = activeHolders.map((holder) => {
    const pct = Math.max(0, Number(holder.sharePercent || 0));
    allocatedPercent += pct;
    const dividendAmountBdt = Math.round((cleanProfit * pct) / 100);
    totalAllocatedDividendBdt += dividendAmountBdt;
    return {
      shareholderId: holder.id,
      nameBn: holder.nameBn,
      sharePercent: pct,
      dividendAmountBdt,
      totalShares: Number(holder.totalShares || 0),
    };
  });

  return {
    totalProfitBdt: cleanProfit,
    allocatedPercent: Math.round(allocatedPercent * 100) / 100,
    totalAllocatedDividendBdt,
    unallocatedProfitBdt: Math.max(0, cleanProfit - totalAllocatedDividendBdt),
    allocations,
  };
}

export interface PayrollSummaryResult {
  activeStaffCount: number;
  totalBasicSalaryBdt: number;
  totalAllowanceBdt: number;
  totalDeductionBdt: number;
  totalNetPayableBdt: number;
  byDepartment: Record<string, { count: number; netPayableBdt: number }>;
}

export function calculateMonthlyPayrollSummary(
  staffList: Array<{
    id: number;
    departmentBn: string;
    basicSalaryBdt: number;
    allowanceBdt: number;
    statusBn?: string;
  }>,
  deductionByStaffId: Record<number, number> = {}
): PayrollSummaryResult {
  let activeStaffCount = 0;
  let totalBasicSalaryBdt = 0;
  let totalAllowanceBdt = 0;
  let totalDeductionBdt = 0;
  const byDepartment: Record<string, { count: number; netPayableBdt: number }> = {};

  for (const st of staffList) {
    if (st.statusBn === 'অব্যাহতিপ্রাপ্ত') continue;
    activeStaffCount += 1;
    const basic = Math.max(0, Number(st.basicSalaryBdt || 0));
    const allow = Math.max(0, Number(st.allowanceBdt || 0));
    const ded = Math.max(0, Number(deductionByStaffId[st.id] || 0));
    const net = Math.max(0, basic + allow - ded);

    totalBasicSalaryBdt += basic;
    totalAllowanceBdt += allow;
    totalDeductionBdt += ded;

    const dept = st.departmentBn || 'সাধারণ বিভাগ';
    if (!byDepartment[dept]) {
      byDepartment[dept] = { count: 0, netPayableBdt: 0 };
    }
    byDepartment[dept].count += 1;
    byDepartment[dept].netPayableBdt += net;
  }

  return {
    activeStaffCount,
    totalBasicSalaryBdt,
    totalAllowanceBdt,
    totalDeductionBdt,
    totalNetPayableBdt: Math.max(0, totalBasicSalaryBdt + totalAllowanceBdt - totalDeductionBdt),
    byDepartment,
  };
}


