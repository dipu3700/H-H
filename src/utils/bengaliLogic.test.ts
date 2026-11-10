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

