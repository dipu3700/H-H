import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Phone,
  Building2,
  FileCheck2,
  QrCode,
  Award,
} from 'lucide-react';
import {
  formatExactBdtBengali,
  formatReceiptAmountInWordsBn,
  toBengaliDigits,
} from '../utils/bengaliLogic';
import { HHLogo } from './ArchitecturalVisuals';

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

type ReceiptCopyType = 'গ্রাহক কপি (CUSTOMER COPY)' | 'অফিস কপি (OFFICE COPY)' | 'হিসাব বিভাগ কপি (ACCOUNTS COPY)';

export const MoneyReceiptModal: React.FC<{
  receipt: MoneyReceiptData | null;
  onClose: () => void;
}> = ({ receipt, onClose }) => {
  const [copyType, setCopyType] = useState<ReceiptCopyType>('গ্রাহক কপি (CUSTOMER COPY)');

  if (!receipt) return null;

  const amountWordsBn = formatReceiptAmountInWordsBn(receipt.amountBdt);
  const formattedAmountBn = formatExactBdtBengali(receipt.amountBdt);
  const issueDateDisplay = toBengaliDigits(
    receipt.issueDate || new Date().toISOString().split('T')[0]
  );

  const totalContractBdt =
    typeof receipt.totalPriceBdt === 'number' && receipt.totalPriceBdt > 0
      ? receipt.totalPriceBdt
      : 0;
  const cumulativePaidBdt =
    typeof receipt.totalPaidBdt === 'number' && receipt.totalPaidBdt >= receipt.amountBdt
      ? receipt.totalPaidBdt
      : receipt.amountBdt;
  const previousPaidBdt = Math.max(0, cumulativePaidBdt - receipt.amountBdt);
  const remainingDueBdt =
    typeof receipt.dueAmountBdt === 'number'
      ? receipt.dueAmountBdt
      : totalContractBdt > 0
      ? Math.max(0, totalContractBdt - cumulativePaidBdt)
      : 0;
  const paidPercentage =
    totalContractBdt > 0
      ? Math.min(100, Math.round((cumulativePaidBdt / totalContractBdt) * 100))
      : 100;

  const verificationCode = `HH-VRF-${receipt.receiptNumber.replace(/[^A-Z0-9]/gi, '').slice(-8).toUpperCase()}`;

  const handleDownloadReceiptHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>অফিশিয়াল মানি রিসিট - ${receipt.receiptNumber} | H & H Homes</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body {
      font-family: 'Hind Siliguri', sans-serif;
      background: #e2e8f0;
      margin: 0;
      padding: 28px 16px;
      color: #0f172a;
    }
    .receipt-sheet {
      max-width: 880px;
      margin: 0 auto;
      background: #ffffff;
      border: 3px solid #0B192C;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(11, 25, 44, 0.18);
      position: relative;
    }
    .top-gold-bar {
      height: 6px;
      background: linear-gradient(90deg, #0B192C 0%, #10B981 35%, #C6A15B 70%, #0B192C 100%);
    }
    .header {
      background: linear-gradient(135deg, #071120 0%, #0B192C 60%, #06392F 100%);
      color: #ffffff;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #C6A15B;
    }
    .brand-title {
      font-size: 30px;
      font-weight: 700;
      margin: 0;
      color: #ffffff;
      letter-spacing: 0.5px;
    }
    .brand-bn {
      font-size: 15px;
      color: #FDE68A;
      font-weight: 700;
      margin-top: 2px;
    }
    .reg-badges {
      margin-top: 8px;
      display: inline-block;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(198,161,91,0.45);
      color: #A7F3D0;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }
    .office-info {
      text-align: right;
      font-size: 13px;
      line-height: 1.65;
      color: #E2E8F0;
    }
    .voucher-strip {
      background: #F8FAFC;
      padding: 14px 32px;
      border-bottom: 2px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .voucher-title-pill {
      background: #0B192C;
      color: #FDE68A;
      padding: 6px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
      border: 1px solid #C6A15B;
    }
    .copy-pill {
      background: #ECFDF5;
      color: #047857;
      border: 1.5px solid #10B981;
      padding: 5px 14px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
    }
    .content {
      padding: 26px 32px 30px 32px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      padding: 12px 16px;
    }
    .meta-item span {
      display: block;
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
    }
    .meta-item strong {
      font-size: 14px;
      color: #0F172A;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .box-card {
      background: #ffffff;
      border: 1.5px solid #CBD5E1;
      border-radius: 10px;
      padding: 14px 18px;
    }
    .box-head {
      font-size: 12px;
      font-weight: 700;
      color: #047857;
      text-transform: uppercase;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .row-line {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 3px 0;
    }
    .row-line span:first-child { color: #475569; font-weight: 600; }
    .row-line span:last-child { color: #0F172A; font-weight: 700; text-align: right; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0;
    }
    th, td {
      border: 1.5px solid #CBD5E1;
      padding: 12px 14px;
      text-align: left;
      font-size: 14px;
    }
    th {
      background: #0B192C;
      color: #ffffff;
      font-weight: 700;
      font-size: 13px;
    }
    .words-banner {
      background: linear-gradient(90deg, #ECFDF5 0%, #F0FDF4 100%);
      border: 2px solid #10B981;
      border-radius: 12px;
      padding: 16px 22px;
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .balance-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 16px;
    }
    .bal-card {
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 10px 12px;
      text-align: center;
    }
    .footer-auth {
      display: grid;
      grid-template-columns: 1.2fr 2.8fr;
      gap: 24px;
      margin-top: 34px;
      padding-top: 20px;
      border-top: 2px dashed #CBD5E1;
      align-items: end;
    }
    .signatures {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      text-align: center;
    }
    .sig-line {
      border-top: 1.5px solid #334155;
      padding-top: 7px;
      font-size: 12px;
      font-weight: 700;
      color: #1E293B;
    }
    .terms-bar {
      background: #F1F5F9;
      border-top: 1px solid #CBD5E1;
      padding: 10px 32px;
      font-size: 11.5px;
      color: #475569;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none !important; }
      .receipt-sheet { box-shadow: none; border-width: 2px; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width:880px;margin:0 auto 14px auto;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-weight:700;color:#0B192C;">H &amp; H Homes · অফিশিয়াল মানি রিসিট ভাউচার (${receipt.receiptNumber})</span>
    <button onclick="window.print()" style="background:#059669;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;">প্রিন্ট / PDF সেভ করুন (Print)</button>
  </div>
  <div class="receipt-sheet">
    <div class="top-gold-bar"></div>
    <div class="header">
      <div>
        <h1 class="brand-title">H &amp; H Homes</h1>
        <div class="brand-bn">এইচ অ্যান্ড এইচ হোমস · রিয়েল এস্টেট অ্যান্ড ল্যান্ড ডেভেলপমেন্ট</div>
        <div class="reg-badges">REHAB Member · RAJUK Enlisted · RJSC Reg: C-184920/BD</div>
      </div>
      <div class="office-info">
        <div><strong>প্রধান কার্যালয়:</strong> রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।</div>
        <div><strong>ল্যান্ড প্রজেক্ট জোন:</strong> বসুন্ধরা আবাসিক এলাকা, ঢাকা</div>
        <div><strong>হটলাইন:</strong> +৮৮০ ১৭১১-২২৩৩৪৪ · <strong>ইমেইল:</strong> info@hhhomesbd.com</div>
      </div>
    </div>

    <div class="voucher-strip">
      <div class="voucher-title-pill">অফিশিয়াল মানি রিসিট · MONEY RECEIPT</div>
      <div style="font-size:13px;font-weight:700;color:#334155;">ভেরিফিকেশন কোড: <span style="font-family:monospace;color:#0B192C;">${verificationCode}</span></div>
      <div class="copy-pill">${copyType}</div>
    </div>

    <div class="content">
      <div class="meta-grid">
        <div class="meta-item">
          <span>মানি রিসিট / ভাউচার নং</span>
          <strong style="font-family:monospace;">${receipt.receiptNumber}</strong>
        </div>
        <div class="meta-item">
          <span>ইস্যু তারিখ (Issue Date)</span>
          <strong>${issueDateDisplay}</strong>
        </div>
        <div class="meta-item">
          <span>বুকিং / বরাদ্দ ফাইল নং</span>
          <strong style="font-family:monospace;">${receipt.bookingNumber || 'HH-BK-2026-0101'}</strong>
        </div>
        <div class="meta-item">
          <span>পেমেন্ট স্ট্যাটাস</span>
          <strong style="color:#047857;">✓ ${receipt.statusBn} (Verified)</strong>
        </div>
      </div>

      <div class="grid-2">
        <div class="box-card">
          <div class="box-head">১. গ্রাহকের তথ্য (Received With Thanks From)</div>
          <div class="row-line"><span>গ্রাহকের নাম:</span><span>${receipt.customerName}</span></div>
          <div class="row-line"><span>মোবাইল নম্বর:</span><span>${receipt.customerPhone || '+৮৮০ ১৭১১-২২৩৩৪৪'}</span></div>
          <div class="row-line"><span>জাতীয় পরিচয়পত্র (NID):</span><span>${receipt.nidNumber || 'ভেরিফাইড ফাইল'}</span></div>
          <div class="row-line"><span>ঠিকানা:</span><span>${receipt.customerAddressBn || 'ঢাকা, বাংলাদেশ'}</span></div>
        </div>
        <div class="box-card">
          <div class="box-head">২. বরাদ্দকৃত প্রজেক্ট ও প্রপার্টি তফসিল (Property Schedule)</div>
          <div class="row-line"><span>প্রজেক্ট / প্রপার্টি:</span><span>${receipt.propertyTitleBn}</span></div>
          <div class="row-line"><span>প্রপার্টি কোড ও আকার:</span><span>${receipt.propertyCode || 'HH-L-101'} ${receipt.propertySizeBn ? `(${receipt.propertySizeBn})` : ''}</span></div>
          <div class="row-line"><span>প্রকল্পের অবস্থান:</span><span>${receipt.propertyLocationBn || 'বসুন্ধরা আবাসিক এলাকা, ঢাকা'}</span></div>
          <div class="row-line"><span>অফিস ঠিকানা:</span><span>রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।</span></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:60px;text-align:center;">ক্রমিক</th>
            <th>পেমেন্টের বিবরণ ও হিসাবের খাত (Particulars)</th>
            <th>পরিশোধের মাধ্যম (Payment Mode)</th>
            <th>রেফারেন্স / চেক / পে-অর্ডার</th>
            <th style="text-align:right;">টাকার পরিমাণ (BDT)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align:center;font-weight:700;">০১</td>
            <td>
              <div style="font-weight:700;font-size:15px;color:#0B192C;">${receipt.paymentTitleBn}</div>
              <div style="font-size:12px;color:#64748B;">প্রজেক্ট: ${receipt.propertyTitleBn}</div>
            </td>
            <td style="font-weight:600;">${receipt.paymentMethodBn}</td>
            <td style="font-family:monospace;font-weight:700;">${receipt.referenceNo || receipt.receiptNumber}</td>
            <td style="text-align:right;font-weight:700;font-size:17px;color:#0B192C;">${formattedAmountBn}</td>
          </tr>
        </tbody>
      </table>

      <div class="words-banner">
        <div>
          <div style="font-size:12px;color:#065F46;font-weight:700;text-transform:uppercase;">কথায় (Amount in Words):</div>
          <div style="font-size:16px;font-weight:700;color:#0F172A;margin-top:2px;">${amountWordsBn}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;color:#065F46;font-weight:700;">সর্বমোট প্রাপ্ত টাকা (Net Received)</div>
          <div style="font-size:24px;font-weight:700;color:#047857;">${formattedAmountBn}</div>
        </div>
      </div>

      ${
        totalContractBdt > 0
          ? `<div class="balance-grid">
              <div class="bal-card"><div style="font-size:11px;color:#64748B;font-weight:600;">মোট চুক্তিমূল্য</div><div style="font-size:14px;font-weight:700;margin-top:2px;">${formatExactBdtBengali(totalContractBdt)}</div></div>
              <div class="bal-card"><div style="font-size:11px;color:#64748B;font-weight:600;">পূর্ববর্তী জমা</div><div style="font-size:14px;font-weight:700;margin-top:2px;">${formatExactBdtBengali(previousPaidBdt)}</div></div>
              <div class="bal-card" style="background:#ECFDF5;border-color:#6EE7B7;"><div style="font-size:11px;color:#065F46;font-weight:600;">মোট পরিশোধিত (${toBengaliDigits(paidPercentage)}%)</div><div style="font-size:14px;font-weight:700;color:#047857;margin-top:2px;">${formatExactBdtBengali(cumulativePaidBdt)}</div></div>
              <div class="bal-card" style="background:#FFFBEB;border-color:#FCD34D;"><div style="font-size:11px;color:#92400E;font-weight:600;">অবশিষ্ট বকেয়া</div><div style="font-size:14px;font-weight:700;color:#B45309;margin-top:2px;">${formatExactBdtBengali(remainingDueBdt)}</div></div>
            </div>`
          : ''
      }

      <div class="footer-auth">
        <div style="display:flex;align-items:center;gap:12px;background:#F8FAFC;border:1px solid #CBD5E1;padding:10px 12px;border-radius:10px;">
          <div style="font-size:11px;line-height:1.45;color:#334155;">
            <strong style="color:#0B192C;display:block;">ডিজিটাল ইআরপি ভেরিফাইড</strong>
            কোড: ${verificationCode}<br/>
            তারিখ: ${issueDateDisplay}
          </div>
        </div>
        <div class="signatures">
          <div class="sig-line">গ্রাহকের স্বাক্ষর</div>
          <div class="sig-line">ক্যাশ ও একাউন্টস</div>
          <div class="sig-line">অভ্যন্তরীণ অডিট</div>
          <div class="sig-line" style="color:#047857;">অনুমোদিত স্বাক্ষর · H &amp; H Homes</div>
        </div>
      </div>
    </div>

    <div class="terms-bar">
      <span>বিঃদ্রঃ চেক/পে-অর্ডার/ব্যাংক ড্রাফট নগদায়ন সাপেক্ষে এই মানি রিসিট চূড়ান্ত বলে গণ্য হবে।</span>
      <span>প্রধান কার্যালয়: রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।</span>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HH-Money-Receipt-${receipt.receiptNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#071120]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`মানি রিসিট ${receipt.receiptNumber}`}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full max-h-[94vh] sm:max-h-[92vh] flex flex-col overflow-hidden border-t-2 sm:border-2 border-[#0B192C] shadow-2xl sm:my-auto">
        {/* Top Action & Copy Selector Bar (Hidden in Print) */}
        <div className="bg-[#0B192C] text-white px-3.5 sm:px-5 pt-2.5 pb-3 sm:py-3.5 border-b border-[#C6A15B]/40 flex flex-col gap-2 shrink-0 no-print">
          <div className="w-10 h-1.5 bg-white/25 rounded-full mx-auto sm:hidden" />
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-[11px] sm:text-xs">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span className="truncate">মানি রিসিট · {receipt.receiptNumber}</span>
              </span>

              {/* Copy Type Switcher */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl overflow-x-auto no-scrollbar">
                {(
                  [
                    'গ্রাহক কপি (CUSTOMER COPY)',
                    'অফিস কপি (OFFICE COPY)',
                    'হিসাব বিভাগ কপি (ACCOUNTS COPY)',
                  ] as ReceiptCopyType[]
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCopyType(type)}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                      copyType === type
                        ? 'bg-[#C6A15B] text-[#0B192C]'
                        : 'text-white/75 hover:text-white'
                    }`}
                  >
                    {type.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleDownloadReceiptHtml}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>রিসিট ডাউনলোড করুন</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#C6A15B] hover:bg-[#d4b06a] text-[#0B192C] text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>প্রিন্ট / PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="রিসিট বন্ধ করুন"
                className="p-1.5 sm:p-2 rounded-xl text-white/75 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Top Gold-Emerald Decorative Rule */}
        <div className="h-1.5 bg-gradient-to-r from-[#0B192C] via-emerald-500 to-[#C6A15B] shrink-0" />

        {/* Printable Official Corporate Money Receipt Body */}
        <div className="p-3.5 sm:p-8 space-y-4 sm:space-y-5 bg-white text-[#0F172A] relative overflow-y-auto flex-1">
          {/* Executive Corporate Letterhead */}
          <div className="bg-gradient-to-r from-[#071120] via-[#0B192C] to-[#06392F] text-white p-4 sm:p-6 rounded-2xl border-b-4 border-[#C6A15B] flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 shadow-md">
            <div className="space-y-1.5">
              <HHLogo variant="light" />
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/10 border border-[#C6A15B]/40 text-[#FDE68A] text-[10px] sm:text-[11px] font-bold">
                  <Award className="w-3 h-3 text-emerald-400 shrink-0" />
                  REHAB &amp; RAJUK তালিকাভুক্ত রিয়েল এস্টেট ডেভেলপার
                </span>
                <span className="text-[10px] sm:text-[11px] text-emerald-300 font-mono font-bold">
                  RJSC Reg: C-184920/BD
                </span>
              </div>
            </div>

            <div className="text-xs md:text-right space-y-1 text-slate-200 border-t md:border-t-0 pt-2.5 md:pt-0 border-white/15">
              <p className="font-extrabold text-white flex md:justify-end items-center gap-1.5 text-xs sm:text-sm sm:whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span>প্রধান কার্যালয়: রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।</span>
              </p>
              <p className="text-[#FDE68A] font-bold flex md:justify-end items-center gap-1.5 text-xs sm:whitespace-nowrap">
                <Building2 className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
                <span>ল্যান্ড প্রজেক্ট জোন: বসুন্ধরা আবাসিক এলাকা, ঢাকা</span>
              </p>
              <p className="flex md:justify-end items-center gap-1.5 text-white/90 text-xs sm:whitespace-nowrap">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+৮৮০ ১৭১১-২২৩৩৪৪ · info@hhhomesbd.com</span>
              </p>
            </div>
          </div>

          {/* Voucher Title & Copy Type Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="px-3.5 py-1.5 rounded-lg bg-[#0B192C] text-[#FDE68A] font-extrabold text-xs sm:text-sm tracking-wide border border-[#C6A15B]">
                অফিশিয়াল মানি রিসিট · MONEY RECEIPT
              </span>
              <span className="text-xs font-bold text-slate-600 hidden sm:inline">
                ভাউচার ভেরিফিকেশন: <strong className="font-mono text-[#0B192C]">{verificationCode}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-400 text-emerald-800 font-extrabold text-xs">
                {copyType}
              </span>
            </div>
          </div>

          {/* Receipt Serial, Date, Booking Ref & Status Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-[11px] font-bold uppercase">
                মানি রিসিট / ভাউচার নং
              </span>
              <span className="font-mono font-extrabold text-[#0B192C] text-sm sm:text-base">
                {receipt.receiptNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-bold uppercase">
                ইস্যু তারিখ (Issue Date)
              </span>
              <span className="font-extrabold text-[#0B192C] text-sm sm:text-base">
                {issueDateDisplay}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-bold uppercase">
                বরাদ্দ / বুকিং ফাইল নং
              </span>
              <span className="font-mono font-extrabold text-[#0B192C] text-sm">
                {receipt.bookingNumber || receipt.referenceNo || 'HH-BK-2026-0101'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-bold uppercase">
                পেমেন্ট ও লেজার স্ট্যাটাস
              </span>
              <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {receipt.statusBn} (Verified)
              </span>
            </div>
          </div>

          {/* 2-Column Payer & Property Allotment Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-300 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-xs font-extrabold text-emerald-800 uppercase">
                  ১. গ্রাহকের বিবরণ (Received With Thanks From)
                </span>
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold">গ্রাহকের নাম:</span>
                  <span className="font-extrabold text-[#0B192C] text-right">
                    {receipt.customerName}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold">মোবাইল নম্বর:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {receipt.customerPhone || '+৮৮০ ১৭১১-২২৩৩৪৪'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold">জাতীয় পরিচয়পত্র (NID):</span>
                  <span className="font-bold text-slate-800 text-right">
                    {receipt.nidNumber || 'রেকর্ডভুক্ত গ্রাহক ফাইল'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold">বর্তমান ঠিকানা:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {receipt.customerAddressBn || 'ঢাকা, বাংলাদেশ'}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Schedule Box */}
            <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-300 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-xs font-extrabold text-emerald-800 uppercase">
                  ২. বরাদ্দকৃত প্রপার্টি তফসিল (Property Schedule)
                </span>
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold">প্রকল্প / প্রপার্টি:</span>
                  <span className="font-extrabold text-[#0B192C] text-right">
                    {receipt.propertyTitleBn}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold">ইউনিট কোড ও আকার:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {receipt.propertyCode || 'HH-L-101'}{' '}
                    {receipt.propertySizeBn ? `· ${receipt.propertySizeBn}` : ''}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold">প্রপার্টির অবস্থান:</span>
                  <span className="font-bold text-emerald-800 text-right">
                    {receipt.propertyLocationBn || 'বসুন্ধরা আবাসিক এলাকা, ঢাকা'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-semibold">প্রধান কার্যালয়:</span>
                  <span className="font-bold text-slate-800 text-right">
                    রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Payment Particulars Table */}
          <div className="overflow-x-auto border-2 border-[#0B192C]/20 rounded-xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#0B192C] text-white">
                  <th className="py-3 px-3 font-bold text-center w-14">ক্রমিক</th>
                  <th className="py-3 px-4 font-bold">
                    পেমেন্টের বিবরণ ও খাত (Particulars of Payment)
                  </th>
                  <th className="py-3 px-4 font-bold">পরিশোধের মাধ্যম (Mode)</th>
                  <th className="py-3 px-4 font-bold">রেফারেন্স / চেক নং</th>
                  <th className="py-3 px-4 font-bold text-right">টাকার পরিমাণ (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-white">
                  <td className="py-4 px-3 text-center font-extrabold text-slate-700">০১</td>
                  <td className="py-4 px-4">
                    <p className="font-extrabold text-[#0B192C] text-sm sm:text-base">
                      {receipt.paymentTitleBn}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      প্রকল্প: {receipt.propertyTitleBn} ({receipt.propertyCode || 'HH-L-101'})
                    </p>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800">{receipt.paymentMethodBn}</td>
                  <td className="py-4 px-4 font-mono font-bold text-slate-700">
                    {receipt.referenceNo || receipt.receiptNumber}
                  </td>
                  <td className="py-4 px-4 text-right font-extrabold text-base sm:text-lg text-[#0B192C] tabular-nums">
                    {formattedAmountBn}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Check-Protect Amount in Words & Net Received Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border-2 border-emerald-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                কথায় (Amount in Words):
              </span>
              <p className="text-sm sm:text-base font-extrabold text-[#0B192C]">
                {amountWordsBn}
              </p>
            </div>
            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
              <span className="text-[11px] font-extrabold text-emerald-800 uppercase block">
                সর্বমোট প্রাপ্ত টাকা (Net Received)
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 tabular-nums">
                {formattedAmountBn}
              </p>
            </div>
          </div>

          {/* Account Ledger & Balance Progress Breakdown */}
          {totalContractBdt > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                <span className="text-[#0B192C] uppercase">
                  বরাদ্দকৃত প্রপার্টির কিস্তি ও বকেয়া হিসাব বিবরণী (Account Ledger Summary)
                </span>
                <span className="text-emerald-700">
                  পরিশোধের হার: {toBengaliDigits(paidPercentage)}% সম্পন্ন
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
                  style={{ width: `${paidPercentage}%` }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-semibold">
                    মোট চুক্তিমূল্য
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#0B192C]">
                    {formatExactBdtBengali(totalContractBdt)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-semibold">
                    পূর্ববর্তী জমা
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-700">
                    {formatExactBdtBengali(previousPaidBdt)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] text-emerald-800 block font-semibold">
                    সর্বমোট পরিশোধিত
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                    {formatExactBdtBengali(cumulativePaidBdt)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-[11px] text-amber-800 block font-semibold">
                    অবশিষ্ট বকেয়া
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-amber-700">
                    {formatExactBdtBengali(remainingDueBdt)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Digital QR Verification, Official Corporate Seal & 4-Column Signatures */}
          <div className="pt-4 border-t-2 border-dashed border-slate-300 grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
            {/* Digital QR & Official Seal Badge */}
            <div className="lg:col-span-5 flex items-center gap-3.5 bg-slate-50 border border-slate-200 rounded-xl p-3">
              {/* Crisp Stylized QR Matrix SVG */}
              <div className="w-16 h-16 rounded-lg bg-white border border-slate-300 p-1.5 shrink-0 flex items-center justify-center">
                <QrCode className="w-12 h-12 text-[#0B192C]" />
              </div>
              <div className="text-[11px] space-y-0.5 leading-snug">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-extrabold text-[10px]">
                  ERP VERIFIED SEAL
                </span>
                <p className="font-extrabold text-[#0B192C]">H &amp; H Homes Digital Ledger</p>
                <p className="font-mono text-slate-600">ID: {verificationCode}</p>
                <p className="text-slate-500">
                  {receipt.recordedByBn || 'ক্যাশ ও একাউন্টস বিভাগ · বনশ্রী'}
                </p>
              </div>
            </div>

            {/* 4 Official Signature Columns */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-bold text-slate-700 pt-6">
              <div className="border-t-2 border-slate-400 pt-2">গ্রাহকের স্বাক্ষর</div>
              <div className="border-t-2 border-slate-400 pt-2">ক্যাশ ও একাউন্টস</div>
              <div className="border-t-2 border-slate-400 pt-2">অভ্যন্তরীণ অডিট</div>
              <div className="border-t-2 border-emerald-700 pt-2 text-emerald-800 font-extrabold">
                অনুমোদিত স্বাক্ষর · H &amp; H Homes
              </div>
            </div>
          </div>

          {/* Corporate Terms Footer */}
          <div className="bg-slate-100 rounded-xl px-4 py-2.5 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong>বিঃদ্রঃ</strong> চেক / পে-অর্ডার / ব্যাংক ট্রান্সফার নগদায়ন সাপেক্ষে এই মানি রিসিট চূড়ান্ত বলে গণ্য হবে।
            </span>
            <span className="font-bold text-[#0B192C]">
              প্রধান কার্যালয়: রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
