import React from 'react';
import { X, Printer, Download, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { ProjectItem, PropertyItem, SiteSettings } from '../types';
import { NazihaLogo, ArchitecturalRender, BlueprintDiagram } from './ArchitecturalVisuals';
import { toBengaliDigits } from '../utils/bengaliLogic';

export const BrochureModal: React.FC<{
  project: ProjectItem | null;
  properties: PropertyItem[];
  settings: SiteSettings | null;
  onClose: () => void;
  onSelectProperty: (prop: PropertyItem) => void;
}> = ({ project, properties, settings, onClose, onSelectProperty }) => {
  if (!project) return null;

  let specs: { label: string; value: string }[] = [];
  try {
    specs = JSON.parse(project.specificationsJson || '[]');
  } catch {
    specs = [];
  }

  const projectProperties = properties.filter((p) => p.projectId === project.id);

  const handleDownloadHtmlBrochure = () => {
    const htmlContent = `<!doctype html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <title>${project.nameBn} — অফিশিয়াল ব্রোশিওর | H & H Homes</title>
  <link href="https://fonts.maateen.me/solaiman-lipi/font.css" rel="stylesheet" />
  <style>
    body { font-family: 'SolaimanLipi', sans-serif; color: #0F172A; background: #F8FAFC; margin: 0; padding: 32px; }
    .sheet { max-width: 840px; margin: 0 auto; background: #FFFFFF; border: 2px solid #059669; border-radius: 16px; overflow: hidden; }
    .header { background: #0B192C; color: #FFFFFF; padding: 32px; border-bottom: 4px solid #10B981; display: flex; justify-content: space-between; align-items: center; }
    .emerald { color: #34D399; }
    .body { padding: 32px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
    .box { background: #F8FAFC; padding: 16px; border-radius: 10px; border: 1px solid #E2E8F0; }
    .footer { background: #0F172A; color: #FFFFFF; padding: 24px 32px; font-size: 14px; }
    @media print { body { padding: 0; background: #FFF; } }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <h1 style="margin:0;font-size:28px;">H &amp; H Homes | এইচ অ্যান্ড এইচ হোমস</h1>
        <p class="emerald" style="margin:4px 0 0 0;">রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।</p>
      </div>
      <div style="text-align:right;">
        <div class="emerald" style="font-size:13px;">অফিশিয়াল প্রজেক্ট ব্রোশিওর</div>
        <div style="font-size:18px;font-weight:bold;">${project.nameBn}</div>
      </div>
    </div>
    <div class="body">
      <p style="color:#334155;font-size:14px;">বিভাগ: ${project.categoryBn} · স্ট্যাটাস: ${project.statusBn} · এলাকা: ${project.areaBn}</p>
      <h2 style="margin-top:4px;font-size:26px;">${project.nameBn} (${project.nameEn})</h2>
      <p style="line-height:1.7;">${project.descriptionBn}</p>
      <h3>প্রজেক্ট স্পেসিফিকেশন ও বৈশিষ্ট্য</h3>
      <div class="grid">
        ${specs.map((s) => `<div class="box"><strong>${s.label}:</strong><br/>${s.value}</div>`).join('')}
      </div>
      <h3>অবস্থান ও মূল্য সংক্ষেপ</h3>
      <div class="grid">
        <div class="box"><strong>অবস্থান:</strong><br/>${project.locationBn}<br/>স্থানাঙ্ক: ${project.lat}, ${project.lng}</div>
        <div class="box"><strong>আকার ও মূল্য:</strong><br/>আকার: ${project.sizeSummaryBn}<br/>মূল্য: ${project.priceSummaryBn}</div>
      </div>
    </div>
    <div class="footer">
      <strong>যোগাযোগ:</strong> ${settings?.officeAddressBn || 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।'} | ফোন: ${settings?.phone || '+৮৮০ ১৭১১-২২৩৩৪৪'} | ইমেইল: ${settings?.email || 'info@hhhomesbd.com'}
    </div>
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.slug}-brochure.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.nameBn} ব্রোশিওর`}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl">
        {/* Top Action Bar */}
        <div className="sticky top-0 z-20 bg-[#0B192C] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 no-print">
          <NazihaLogo variant="light" />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট / PDF সেভ করুন</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadHtmlBrochure}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ব্রোশিওর ডাউনলোড</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="ব্রোশিওর বন্ধ করুন"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Brochure Body */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Cover Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-64 md:h-80">
            <ArchitecturalRender theme={project.imageType} label={project.nameBn} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/45 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
              <div className="text-xs text-emerald-300 font-semibold mb-1">
                অফিশিয়াল প্রজেক্ট ব্রোশিওর · {project.categoryBn} · {project.statusBn}
              </div>
              <h2 className="text-2xl md:text-4xl font-bold">{project.nameBn}</h2>
              <p className="text-sm text-slate-200 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{project.locationBn}</span>
              </p>
            </div>
          </div>

          {/* Overview & Key Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-3">
              <h3 className="text-xl font-bold text-[#0F172A]">প্রজেক্ট পরিচিতি ও বিবরণ</h3>
              <p className="text-slate-700 leading-relaxed text-base">{project.descriptionBn}</p>
              <div className="pt-2 grid grid-cols-2 gap-3 text-sm">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500">আকার ও ধরন</div>
                  <div className="font-bold text-[#0F172A] mt-0.5">{project.sizeSummaryBn}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500">মূল্য ও পেমেন্ট</div>
                  <div className="font-bold text-[#0F172A] mt-0.5">{project.priceSummaryBn}</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-base text-[#0F172A] border-b border-slate-200 pb-2">
                প্রজেক্ট স্পেসিফিকেশন
              </h4>
              <ul className="space-y-2.5 text-sm">
                {specs.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-[#0F172A]">{item.label}: </span>
                      <span className="text-slate-700">{item.value}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Blueprint / Master Layout */}
          <BlueprintDiagram
            titleBn={project.nameBn}
            specsBn={`${project.sizeSummaryBn} · ${project.locationBn}`}
            isLand={project.categoryBn.includes('জমি')}
          />

          {/* Available Units inside this Project */}
          {projectProperties.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#0F172A]">
                এই প্রজেক্টের অন্তর্ভুক্ত প্রপার্টিসমূহ ({toBengaliDigits(projectProperties.length)}টি)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs text-slate-500">
                        কোড: {prop.propertyCode} · {prop.statusBn}
                      </div>
                      <div className="font-bold text-[#0F172A]">{prop.titleBn}</div>
                      <div className="text-xs text-slate-700 mt-0.5">
                        আকার: {prop.sizeBn} · মূল্য: {prop.priceDisplayBn}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectProperty(prop);
                      }}
                      className="px-3 py-1.5 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shrink-0 whitespace-nowrap no-print cursor-pointer"
                    >
                      বিস্তারিত
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Branded Contact Footer */}
          <div className="bg-[#0B192C] text-white p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-emerald-300 font-semibold">যোগাযোগ ও বুকিং তথ্য</div>
              <h4 className="text-lg font-bold mt-0.5">
                {settings?.companyNameBn || 'H & H Homes'} (এইচ অ্যান্ড এইচ হোমস)
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                ঠিকানা: {settings?.officeAddressBn || 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-lg border border-white/15">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{settings?.phone || '+৮৮০ ১৭১১-২২৩৩৪৪'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-lg border border-white/15">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{settings?.email || 'info@hhhomesbd.com'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
