import React from 'react';
import { X, Download, Printer, CheckCircle2, ShieldCheck, MapPin, Phone } from 'lucide-react';
import {
  formatExactBdtBengali,
  formatReceiptAmountInWordsBn,
  toBengaliDigits,
} from '../utils/bengaliLogic';
import { NazihaLogo } from './ArchitecturalVisuals';

export interface MoneyReceiptData {
  receiptNumber: string;
  issueDate: string;
  bookingNumber?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  nidNumber?: string;
  customerAddressBn?: string;
  propertyTitleBn: string;
  propertyCode?: string;
  propertyLocationBn?: string;
  propertySizeBn?: string;
  paymentTitleBn: string;
  paymentMethodBn: string;
  referenceNo?: string;
  amountBdt: number;
  totalPriceBdt?: number;
  totalPaidBdt?: number;
  dueAmountBdt?: number;
  statusBn: string;
  recordedByBn?: string;
}

export const MoneyReceiptModal: React.FC<{
  receipt: MoneyReceiptData | null;
  onClose: () => void;
}> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const amountWordsBn = formatReceiptAmountInWordsBn(receipt.amountBdt);
  const formattedAmountBn = formatExactBdtBengali(receipt.amountBdt);

  const handleDownloadReceiptHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>মানি রিসিট - ${receipt.receiptNumber} | H & H Homes</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
    body {
      font-family: 'Hind Siliguri', sans-serif;
      background: #f1f5f9;
      margin: 0;
      padding: 24px;
      color: #0f172a;
    }
    .receipt-box {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 3px solid #0B192C;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
    }
    .header {
      background: #0B192C;
      color: #ffffff;
      padding: 24px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 4px solid #10B981;
    }
    .brand-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      color: #ffffff;
    }
    .brand-sub {
      font-size: 14px;
      color: #6EE7B7;
      margin: 4px 0 0 0;
    }
    .office-info {
      text-align: right;
      font-size: 13px;
      line-height: 1.6;
      color: #E2E8F0;
    }
    .badge-bar {
      background: #ECFDF5;
      padding: 12px 30px;
      border-bottom: 1px solid #A7F3D0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      font-size: 15px;
    }
    .content {
      padding: 28px 30px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .info-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 14px 18px;
    }
    .info-label {
      font-size: 12px;
      color: #64748B;
      font-weight: 600;
    }
    .info-val {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0;
    }
    th, td {
      border: 1px solid #CBD5E1;
      padding: 12px 14px;
      text-align: left;
      font-size: 14px;
    }
    th {
      background: #0B192C;
      color: #ffffff;
      font-weight: 700;
    }
    .amount-highlight {
      background: #ECFDF5;
      border: 2px solid #10B981;
      border-radius: 12px;
      padding: 16px 20px;
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
      margin-top: 48px;
      padding-top: 16px;
      text-align: center;
    }
    .sig-line {
      border-top: 1.5px dashed #475569;
      padding-top: 8px;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width:820px;margin:0 auto 16px auto;text-align:right;">
    <button onclick="window.print()" style="background:#059669;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;">প্রিন্ট করুন (Print Receipt)</button>
  </div>
  <div class="receipt-box">
    <div class="header">
      <div>
        <h1 class="brand-title">H &amp; H Homes</h1>
        <p class="brand-sub">এইচ অ্যান্ড এইচ হোমস · অফিশিয়াল মানি রিসিট (MONEY RECEIPT)</p>
      </div>
      <div class="office-info">
        <div><strong>প্রধান কার্যালয়:</strong> রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।</div>
        <div><strong>জমির প্রকল্প:</strong> বসুন্ধরা আবাসিক এলাকা, ঢাকা</div>
        <div><strong>হটলাইন:</strong> +৮৮০ ১৭১১-২২৩৩৪৪ | info@hhhomesbd.com</div>
      </div>
    </div>
    <div class="badge-bar">
      <span>রিসিট নং: ${receipt.receiptNumber}</span>
      <span>তারিখ: ${toBengaliDigits(receipt.issueDate || new Date().toISOString().split('T')[0])}</span>
      <span style="color:#047857;">স্ট্যাটাস: ${receipt.statusBn}</span>
    </div>
    <div class="content">
      <div class="grid-2">
        <div class="info-card">
          <div class="info-label">গ্রাহকের নাম ও তথ্য</div>
          <div class="info-val">${receipt.customerName}</div>
          ${receipt.customerPhone ? `<div style="font-size:13px;margin-top:4px;">মোবাইল: ${receipt.customerPhone}</div>` : ''}
          ${receipt.nidNumber ? `<div style="font-size:13px;">NID: ${receipt.nidNumber}</div>` : ''}
          ${receipt.customerAddressBn ? `<div style="font-size:13px;">ঠিকানা: ${receipt.customerAddressBn}</div>` : ''}
        </div>
        <div class="info-card">
          <div class="info-label">প্রজেক্ট ও প্রপার্টির বিবরণ</div>
          <div class="info-val">${receipt.propertyTitleBn}</div>
          ${receipt.propertyCode ? `<div style="font-size:13px;margin-top:4px;">কোড: ${receipt.propertyCode} ${receipt.propertySizeBn ? `· আকার: ${receipt.propertySizeBn}` : ''}</div>` : ''}
          ${receipt.propertyLocationBn ? `<div style="font-size:13px;">লোকেশন: ${receipt.propertyLocationBn}</div>` : ''}
          ${receipt.bookingNumber ? `<div style="font-size:13px;">বুকিং নং: ${receipt.bookingNumber}</div>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>পেমেন্টের বিবরণ (Particulars)</th>
            <th>পরিশোধের মাধ্যম</th>
            <th>রেফারেন্স / নোট</th>
            <th style="text-align:right;">পরিমাণ (BDT)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${receipt.paymentTitleBn}</strong></td>
            <td>${receipt.paymentMethodBn}</td>
            <td>${receipt.referenceNo || receipt.receiptNumber}</td>
            <td style="text-align:right;font-weight:700;font-size:16px;">${formattedAmountBn}</td>
          </tr>
        </tbody>
      </table>

      <div class="amount-highlight">
        <div>
          <div style="font-size:12px;color:#065F46;font-weight:700;">কথায় (In Words):</div>
          <div style="font-size:16px;font-weight:700;color:#0F172A;">${amountWordsBn}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;color:#065F46;font-weight:700;">সর্বমোট প্রাপ্ত টাকা</div>
          <div style="font-size:22px;font-weight:700;color:#047857;">${formattedAmountBn}</div>
        </div>
      </div>

      ${
        typeof receipt.totalPriceBdt === 'number' && receipt.totalPriceBdt > 0
          ? `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:16px;text-align:center;">
              <div class="info-card"><div class="info-label">মোট চুক্তিমূল্য</div><div class="info-val">${formatExactBdtBengali(receipt.totalPriceBdt)}</div></div>
              <div class="info-card"><div class="info-label">মোট পরিশোধিত</div><div class="info-val" style="color:#047857;">${formatExactBdtBengali(receipt.totalPaidBdt || receipt.amountBdt)}</div></div>
              <div class="info-card"><div class="info-label">অবশিষ্ট বকেয়া</div><div class="info-val" style="color:#B45309;">${formatExactBdtBengali(receipt.dueAmountBdt || 0)}</div></div>
            </div>`
          : ''
      }

      <div class="signatures">
        <div class="sig-line">গ্রাহকের স্বাক্ষর</div>
        <div class="sig-line">${receipt.recordedByBn || 'ক্যাশ ও হিসাব বিভাগ'}</div>
        <div class="sig-line">অনুমোদিত স্বাক্ষর · H &amp; H Homes</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Money-Receipt-${receipt.receiptNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`মানি রিসিট ${receipt.receiptNumber}`}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden border-2 border-[#0B192C] shadow-2xl my-auto">
        {/* Top Action Bar (Hidden in Print) */}
        <div className="bg-slate-100 px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>অফিশিয়াল ডিজিটাল মানি রিসিট · {receipt.receiptNumber}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadReceiptHtml}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>রিসিট ডাউনলোড করুন</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B192C] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="রিসিট বন্ধ করুন"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Money Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-white text-[#0F172A]">
          {/* Letterhead */}
          <div className="bg-[#0B192C] text-white p-5 sm:p-6 rounded-2xl border-b-4 border-emerald-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <NazihaLogo variant="light" />
              <p className="text-xs text-emerald-300 font-bold mt-2 tracking-wider uppercase">
                অফিশিয়াল মানি রিসিট · OFFICIAL MONEY RECEIPT
              </p>
            </div>
            <div className="text-xs sm:text-right space-y-1 text-slate-200">
              <p className="font-bold text-white flex sm:justify-end items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>অফিস: রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।</span>
              </p>
              <p className="text-emerald-300 font-semibold">
                জমির প্রকল্প: বসুন্ধরা আবাসিক এলাকা, ঢাকা
              </p>
              <p className="flex sm:justify-end items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+৮৮০ ১৭১১-২২৩৩৪৪ · info@hhhomesbd.com</span>
              </p>
            </div>
          </div>

          {/* Receipt Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-xs">মানি রিসিট নং</span>
              <span className="font-mono font-extrabold text-[#0F172A]">
                {receipt.receiptNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">ইস্যু তারিখ</span>
              <span className="font-extrabold text-[#0F172A]">
                {toBengaliDigits(receipt.issueDate || new Date().toISOString().split('T')[0])}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">বুকিং / রেফারেন্স</span>
              <span className="font-mono font-bold text-[#0F172A]">
                {receipt.bookingNumber || receipt.referenceNo || 'সরাসরি ভাউচার'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">পেমেন্ট স্ট্যাটাস</span>
              <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {receipt.statusBn}
              </span>
            </div>
          </div>

          {/* Customer & Property Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-sm">
              <span className="text-xs font-bold text-emerald-700 uppercase">
                গ্রাহকের তথ্য (Received From)
              </span>
              <p className="text-base font-extrabold text-[#0F172A]">{receipt.customerName}</p>
              {receipt.customerPhone && (
                <p className="text-xs text-slate-600">মোবাইল: {receipt.customerPhone}</p>
              )}
              {receipt.nidNumber && (
                <p className="text-xs text-slate-600">NID: {receipt.nidNumber}</p>
              )}
              {receipt.customerAddressBn && (
                <p className="text-xs text-slate-600">ঠিকানা: {receipt.customerAddressBn}</p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-sm">
              <span className="text-xs font-bold text-emerald-700 uppercase">
                প্রজেক্ট ও প্রপার্টির বিবরণ (Property Details)
              </span>
              <p className="text-base font-extrabold text-[#0F172A]">
                {receipt.propertyTitleBn}
              </p>
              {receipt.propertyCode && (
                <p className="text-xs text-slate-600">
                  কোড: {receipt.propertyCode}{' '}
                  {receipt.propertySizeBn ? `· আকার: ${receipt.propertySizeBn}` : ''}
                </p>
              )}
              {receipt.propertyLocationBn && (
                <p className="text-xs text-slate-600">লোকেশন: {receipt.propertyLocationBn}</p>
              )}
            </div>
          </div>

          {/* Payment Particulars Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#0B192C] text-white">
                  <th className="py-3 px-4 font-bold">পেমেন্টের বিবরণ (Particulars)</th>
                  <th className="py-3 px-4 font-bold">পরিশোধের মাধ্যম</th>
                  <th className="py-3 px-4 font-bold text-right">টাকার পরিমাণ (BDT)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200 bg-white">
                  <td className="py-4 px-4">
                    <p className="font-extrabold text-[#0F172A]">{receipt.paymentTitleBn}</p>
                    {receipt.referenceNo && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        রেফারেন্স: {receipt.referenceNo}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700">
                    {receipt.paymentMethodBn}
                  </td>
                  <td className="py-4 px-4 text-right font-extrabold text-lg text-[#0F172A] tabular-nums">
                    {formattedAmountBn}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in Words & Total Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-emerald-50 border-2 border-emerald-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 block">
                কথায় (Amount in Words):
              </span>
              <p className="text-base font-extrabold text-[#0F172A] mt-0.5">{amountWordsBn}</p>
            </div>
            <div className="sm:text-right">
              <span className="text-xs font-bold text-emerald-800 block">প্রাপ্ত মোট টাকা</span>
              <p className="text-2xl font-extrabold text-emerald-700 tabular-nums">
                {formattedAmountBn}
              </p>
            </div>
          </div>

          {/* Optional Booking Balance Breakdown */}
          {typeof receipt.totalPriceBdt === 'number' && receipt.totalPriceBdt > 0 && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">মোট চুক্তিমূল্য</span>
                <span className="text-sm font-extrabold text-[#0F172A]">
                  {formatExactBdtBengali(receipt.totalPriceBdt)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-800 block">মোট পরিশোধিত</span>
                <span className="text-sm font-extrabold text-emerald-700">
                  {formatExactBdtBengali(receipt.totalPaidBdt ?? receipt.amountBdt)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-xs text-amber-800 block">অবশিষ্ট বকেয়া</span>
                <span className="text-sm font-extrabold text-amber-700">
                  {formatExactBdtBengali(receipt.dueAmountBdt ?? 0)}
                </span>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs font-bold text-slate-600">
            <div className="border-t border-dashed border-slate-400 pt-2">গ্রাহকের স্বাক্ষর</div>
            <div className="border-t border-dashed border-slate-400 pt-2">
              {receipt.recordedByBn || 'ক্যাশ ও হিসাব বিভাগ'}
            </div>
            <div className="border-t border-dashed border-slate-400 pt-2 text-[#0F172A]">
              অনুমোদিত স্বাক্ষর · H &amp; H Homes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
