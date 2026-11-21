import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toBengaliDigits,
  formatBdtInBengali,
  filterProperties,
  canBookProperty,
  generateBookingNumber,
  generateVoucherNumber,
  calculateInstallmentPlan,
  validateBookingApplication,
  validateCustomerSignup,
  calculateErpAccountingSummary,
  formatReceiptAmountInWordsBn,
  calculateAccountsLiquiditySummary,
  calculateProjectCostBreakdown,
  calculateShareDistribution,
  calculateMonthlyPayrollSummary,
} from './bengaliLogic.ts';

test('toBengaliDigits converts English digits and formats BDT in Bengali', () => {
  assert.equal(toBengaliDigits(2026), '২০২৬');
  assert.equal(formatBdtInBengali(4500000, 'bn'), '৳ ৪৫ লক্ষ');
  assert.equal(formatBdtInBengali(14800000, 'bn'), '৳ ১.৪৮ কোটি');
  assert.equal(formatBdtInBengali(14800000, 'en'), 'BDT 1.48 Crore');
  assert.equal(formatReceiptAmountInWordsBn(500000), '৫ লক্ষ টাকা মাত্র');
  assert.equal(formatReceiptAmountInWordsBn(14800000), '১ কোটি ৪৮ লক্ষ টাকা মাত্র');
});

test('filterProperties filters by category, area, project, and budget range', () => {
  const sample = [
    {
      id: 1,
      propertyCode: 'HH-L-101',
      projectId: 1,
      titleBn: 'প্লট ১',
      categoryBn: 'আবাসিক জমি',
      propertyType: 'land',
      areaBn: 'বসুন্ধরা আবাসিক এলাকা, ঢাকা',
      priceBdt: 4500000,
      statusBn: 'বুকিং চলছে',
    },
    {
      id: 2,
      propertyCode: 'HH-A-201',
      projectId: 2,
      titleBn: 'ফ্ল্যাট ১',
      categoryBn: 'ফ্ল্যাট',
      propertyType: 'apartment',
      areaBn: 'বনশ্রী, ব্লক-সি, ঢাকা',
      priceBdt: 14800000,
      statusBn: 'বুকিং চলছে',
    },
  ];

  const byCategory = filterProperties(sample, { categoryBn: 'ফ্ল্যাট' });
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].propertyCode, 'HH-A-201');

  const byBudget = filterProperties(sample, { maxBudget: 5000000 });
  assert.equal(byBudget.length, 1);
  assert.equal(byBudget[0].propertyCode, 'HH-L-101');
});

test('canBookProperty prevents double-booking of reserved or sold properties', () => {
  assert.equal(canBookProperty('বুকিং চলছে'), true);
  assert.equal(canBookProperty('সংরক্ষিত'), false);
  assert.equal(canBookProperty('বিক্রিত'), false);
});

test('generateBookingNumber and generateVoucherNumber create unique formatted IDs', () => {
  assert.equal(generateBookingNumber(42, 2026), 'HH-BK-2026-0042');
  assert.equal(generateVoucherNumber(7, 2026), 'HH-VCH-2026-0007');
});

test('calculateInstallmentPlan computes remaining principal and monthly installment', () => {
  const plan = calculateInstallmentPlan(4500000, 500000, '৩৬ মাসিক কিস্তি');
  assert.equal(plan.remainingPrincipalBdt, 4000000);
  assert.equal(plan.installmentCount, 36);
  assert.equal(plan.monthlyInstallmentBdt, 111111);
});

test('validateBookingApplication validates Bengali/English phone and NID', () => {
  const valid = validateBookingApplication({
    customerName: 'আরিফুর রহমান',
    customerPhone: '০১৭১১২২৩৩৪৪',
    customerEmail: 'arif@example.com',
    nidNumber: '১৯৯২১২৩৪৫৬৭৮৯',
    addressBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা',
  });
  assert.equal(valid.valid, true);

  const invalidPhone = validateBookingApplication({
    customerName: 'আরিফুর রহমান',
    customerPhone: '12345',
    customerEmail: 'arif@example.com',
    nidNumber: '1992123456789',
    addressBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা',
  });
  assert.equal(invalidPhone.valid, false);
});

test('validateCustomerSignup enforces password length and confirmation match', () => {
  const ok = validateCustomerSignup({
    name: 'তানভীর হাসান',
    phone: '01711223344',
    email: 'tanvir@hhhomesbd.com',
    password: 'secret123',
    confirmPassword: 'secret123',
  });
  assert.equal(ok.valid, true);

  const mismatch = validateCustomerSignup({
    name: 'তানভীর হাসান',
    phone: '01711223344',
    email: 'tanvir@hhhomesbd.com',
    password: 'secret123',
    confirmPassword: 'wrong',
  });
  assert.equal(mismatch.valid, false);
});

test('calculateErpAccountingSummary computes total income, expense, net profit, and receivables', () => {
  const summary = calculateErpAccountingSummary(
    [
      { type: 'income', amountBdt: 3500000 },
      { type: 'income', amountBdt: 1500000 },
      { type: 'expense', amountBdt: 1800000 },
    ],
    [
      { totalPriceBdt: 4500000, paidAmountBdt: 500000, dueAmountBdt: 4000000, statusBn: 'অনুমোদিত' },
      { totalPriceBdt: 2850000, paidAmountBdt: 0, dueAmountBdt: 2850000, statusBn: 'বাতিল' },
    ]
  );

  assert.equal(summary.totalIncomeBdt, 5000000);
  assert.equal(summary.totalExpenseBdt, 1800000);
  assert.equal(summary.netBalanceBdt, 3200000);
  assert.equal(summary.totalBookingContractBdt, 4500000);
  assert.equal(summary.totalReceivableBdt, 4000000);
});

test('calculateAccountsLiquiditySummary aggregates cash, bank, and MFS balances', () => {
  const liquidity = calculateAccountsLiquiditySummary([
    { accountType: 'cash', currentBalanceBdt: 450000 },
    { accountType: 'bank', currentBalanceBdt: 5200000 },
    { accountType: 'bank', currentBalanceBdt: 3800000 },
    { accountType: 'mfs', currentBalanceBdt: 150000 },
  ]);
  assert.equal(liquidity.cashTotalBdt, 450000);
  assert.equal(liquidity.bankTotalBdt, 9000000);
  assert.equal(liquidity.mfsTotalBdt, 150000);
  assert.equal(liquidity.totalLiquidityBdt, 9600000);
});

test('calculateProjectCostBreakdown splits direct construction cost and overhead per project', () => {
  const breakdown = calculateProjectCostBreakdown(
    [{ id: 1, nameBn: 'এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ', totalBudgetBdt: 10000000 }],
    [
      { type: 'income', projectId: 1, amountBdt: 4000000 },
      { type: 'expense', projectId: 1, categoryBn: 'নির্মাণ সামগ্রী', costCenterBn: 'নির্মাণ ব্যয়', amountBdt: 1500000 },
      { type: 'expense', projectId: 1, categoryBn: 'অফিস বেতন ও প্রশাসনিক ব্যয়', costCenterBn: 'প্রশাসনিক ব্যয়', amountBdt: 500000 },
    ]
  );
  assert.equal(breakdown.length, 1);
  assert.equal(breakdown[0].incomeBdt, 4000000);
  assert.equal(breakdown[0].directCostBdt, 1500000);
  assert.equal(breakdown[0].overheadCostBdt, 500000);
  assert.equal(breakdown[0].totalExpenseBdt, 2000000);
  assert.equal(breakdown[0].netProfitBdt, 2000000);
  assert.equal(breakdown[0].budgetUtilizationPct, 20);
});

test('calculateShareDistribution computes shareholder dividend allocations accurately', () => {
  const dist = calculateShareDistribution(2000000, [
    { id: 1, nameBn: 'মাহমুদুর রহমান', totalShares: 40, sharePercent: 40, statusBn: 'সক্রিয়' },
    { id: 2, nameBn: 'তানভীর আহমেদ', totalShares: 35, sharePercent: 35, statusBn: 'সক্রিয়' },
    { id: 3, nameBn: 'ড. কামরুল হাসান', totalShares: 25, sharePercent: 25, statusBn: 'সক্রিয়' },
  ]);
  assert.equal(dist.allocatedPercent, 100);
  assert.equal(dist.totalAllocatedDividendBdt, 2000000);
  assert.equal(dist.unallocatedProfitBdt, 0);
  assert.equal(dist.allocations[0].dividendAmountBdt, 800000);
  assert.equal(dist.allocations[1].dividendAmountBdt, 700000);
  assert.equal(dist.allocations[2].dividendAmountBdt, 500000);
});

test('calculateMonthlyPayrollSummary computes active headcount, allowances, deductions, and department totals', () => {
  const payroll = calculateMonthlyPayrollSummary(
    [
      { id: 1, departmentBn: 'হিসাব ও অর্থ', basicSalaryBdt: 50000, allowanceBdt: 15000, statusBn: 'সক্রিয়' },
      { id: 2, departmentBn: 'প্রকৌশল ও সাইট', basicSalaryBdt: 60000, allowanceBdt: 20000, statusBn: 'সক্রিয়' },
      { id: 3, departmentBn: 'বিক্রয় ও বিপণন', basicSalaryBdt: 30000, allowanceBdt: 5000, statusBn: 'অব্যাহতিপ্রাপ্ত' },
    ],
    { 1: 2000 }
  );
  assert.equal(payroll.activeStaffCount, 2);
  assert.equal(payroll.totalBasicSalaryBdt, 110000);
  assert.equal(payroll.totalAllowanceBdt, 35000);
  assert.equal(payroll.totalDeductionBdt, 2000);
  assert.equal(payroll.totalNetPayableBdt, 143000);
  assert.equal(payroll.byDepartment['হিসাব ও অর্থ'].netPayableBdt, 63000);
});


