import React from 'react';
import {
  X,
  Building2,
  MapPin,
  Ruler,
  Wallet,
  CheckCircle2,
  Printer,
  Eye,
  Compass,
  ShieldCheck,
  Sparkles,
  FileText,
} from 'lucide-react';
import { ProjectItem, PropertyItem } from '../types';
import { formatExactBdtBengali, toBengaliDigits } from '../utils/bengaliLogic';
import { ArchitecturalRender, HHLogo } from './ArchitecturalVisuals';

export interface ViewerTarget {
  type: 'project' | 'property';
  project?: ProjectItem;
  property?: PropertyItem;
}

export const ProjectPropertyViewerModal: React.FC<{
  target: ViewerTarget | null;
  allProjects: ProjectItem[];
  allProperties: PropertyItem[];
  onSelectTarget: (next: ViewerTarget) => void;
  onClose: () => void;
  contextLabelBn?: string;
  onActionClick?: (target: ViewerTarget) => void;
  actionButtonLabelBn?: string;
}> = ({
  target,
  allProjects,
  allProperties,
  onSelectTarget,
  onClose,
  contextLabelBn = 'প্রজেক্ট ও প্রপার্টি বিস্তারিত ভিউ',
  onActionClick,
  actionButtonLabelBn,
}) => {
  if (!target) return null;

  const isProject = target.type === 'project' && target.project;
  const project = target.project;
  const property = target.property;

  // Find related properties when viewing a project
  const relatedProperties = project
    ? allProperties.filter(
        (prop) =>
          prop.projectId === project.id ||
          (project.areaBn.includes('বসুন্ধরা') && prop.areaBn.includes('বসুন্ধরা')) ||
          (project.areaBn.includes('বনশ্রী') && prop.areaBn.includes('বনশ্রী'))
      )
    : [];

  // Find parent project when viewing a property
  const parentProject = property
    ? allProjects.find((p) => p.id === property.projectId) ||
      allProjects.find((p) =>
        property.areaBn.includes('বসুন্ধরা')
          ? p.areaBn.includes('বসুন্ধরা')
          : p.areaBn.includes('বনশ্রী')
      )
    : undefined;

  let parsedSpecs: { label: string; value: string }[] = [];
  if (project?.specificationsJson) {
    try {
      const parsed = JSON.parse(project.specificationsJson);
      if (Array.isArray(parsed)) parsedSpecs = parsed;
    } catch {
      parsedSpecs = [];
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[#071120]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={isProject ? project?.nameBn : property?.titleBn}
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden border-2 border-[#0B192C] shadow-2xl my-auto">
        {/* Top Bar */}
        <div className="bg-[#0B192C] text-white px-5 py-3.5 border-b border-[#C6A15B]/40 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-xs">
              <Building2 className="w-4 h-4 text-emerald-400" />
              {contextLabelBn}
            </span>
            <span className="text-xs text-[#FDE68A] font-bold">
              {isProject ? 'মাস্টার প্রজেক্ট ফাইল' : `প্রপার্টি কোড: ${property?.propertyCode}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#FDE68A]" />
              <span>তথ্যপত্র প্রিন্ট করুন</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="p-2 rounded-xl text-white/75 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-5 sm:p-8 space-y-6 bg-white text-[#0F172A] max-h-[85vh] overflow-y-auto">
          {/* Header Banner & Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-6 rounded-2xl overflow-hidden border-2 border-[#0B192C]/15 shadow-md min-h-[250px] relative">
              <ArchitecturalRender
                theme={
                  isProject
                    ? project?.imageType || 'project_3d_township'
                    : property?.imageType || 'prop_3d_villa_plot_a'
                }
                label={isProject ? project?.statusBn : property?.statusBn}
              />
            </div>

            <div className="lg:col-span-6 flex flex-col justify-between bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 space-y-4">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-[#0B192C] text-[#FDE68A] text-xs font-extrabold">
                    {isProject ? project?.categoryBn : property?.categoryBn}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-extrabold">
                    {isProject ? project?.statusBn : property?.statusBn}
                  </span>
                  {!isProject && property?.propertyCode && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-mono text-xs font-extrabold">
                      {property.propertyCode}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] leading-snug">
                  {isProject ? project?.nameBn : property?.titleBn}
                </h2>

                <p className="text-sm text-slate-600 flex items-center gap-1.5 font-semibold">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isProject
                      ? `${project?.locationBn} (${project?.areaBn})`
                      : `${property?.locationBn} (${property?.areaBn})`}
                  </span>
                </p>

                <p className="text-sm text-slate-700 leading-relaxed pt-1">
                  {isProject
                    ? project?.descriptionBn ||
                      'H & H Homes-এর আধুনিক নগর পরিকল্পনা ও শতভাগ নিষ্কণ্টক দলিলের নিশ্চয়তায় গড়ে ওঠা সিগনেচার প্রকল্প।'
                    : property?.descriptionBn ||
                      'প্রশস্ত সংযোগ সড়ক, আধুনিক নাগরিক সুবিধা এবং সহজ কিস্তি সুবিধায় বুকিংযোগ্য প্রিমিয়াম প্রপার্টি।'}
                </p>
              </div>

              {/* Key Financial / Size Strip */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {isProject ? 'প্লট / ফ্ল্যাটের আকার' : 'প্রপার্টির আকার'}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-[#0B192C] flex items-center gap-1.5 mt-0.5">
                    <Ruler className="w-4 h-4 text-emerald-600 shrink-0" />
                    {isProject ? project?.sizeSummaryBn : property?.sizeBn}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 block">
                    {isProject ? 'মূল্য ও বিনিয়োগ' : 'নির্ধারিত মূল্য'}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-emerald-800 flex items-center gap-1.5 mt-0.5">
                    <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                    {isProject
                      ? project?.priceSummaryBn
                      : property?.priceDisplayBn ||
                        formatExactBdtBengali(property?.priceBdt || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Specifications Grid */}
          {isProject && project ? (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-[#0B192C] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>প্রকল্পের বিস্তারিত তথ্য ও প্রকৌশল স্পেসিফিকেশন</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block font-semibold">প্রকল্প জোন</span>
                  <span className="font-extrabold text-sm text-[#0B192C]">{project.areaBn}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block font-semibold">বুকিং স্ট্যাটাস</span>
                  <span className="font-extrabold text-sm text-emerald-700">
                    {project.availabilityBn || 'বুকিং চলছে'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block font-semibold">
                    প্রাক্কলিত প্রজেক্ট বাজেট
                  </span>
                  <span className="font-extrabold text-sm text-[#0B192C]">
                    {formatExactBdtBengali(project.totalBudgetBdt || 95000000)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block font-semibold">প্রধান কার্যালয়</span>
                  <span className="font-extrabold text-sm text-[#0B192C]">
                    রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা
                  </span>
                </div>
              </div>

              {parsedSpecs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {parsedSpecs.map((sp, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#F8F6F0] border border-[#C6A15B]/30 flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-slate-600">{sp.label}:</span>
                      <span className="text-xs font-extrabold text-[#0B192C]">{sp.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Related Units / Properties in this Project */}
              <div className="pt-2 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-base font-extrabold text-[#0B192C]">
                    এই প্রকল্পের অন্তর্গত প্লট ও ফ্ল্যাট তালিকা ({toBengaliDigits(relatedProperties.length)}টি ইউনিট)
                  </h4>
                  <span className="text-xs text-slate-500 font-semibold">
                    যেকোনো ইউনিটে ক্লিক করে বিস্তারিত তফসিল দেখুন
                  </span>
                </div>

                {relatedProperties.length === 0 ? (
                  <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">
                    এই প্রকল্পে বর্তমানে কোনো পৃথক ইউনিট তালিকাভুক্ত নেই।
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#0B192C] text-white">
                          <th className="py-2.5 px-3 font-bold">কোড</th>
                          <th className="py-2.5 px-3 font-bold">প্রপার্টি শিরোনাম</th>
                          <th className="py-2.5 px-3 font-bold">ব্লক / প্লট ও আকার</th>
                          <th className="py-2.5 px-3 font-bold text-right">নির্ধারিত মূল্য</th>
                          <th className="py-2.5 px-3 font-bold text-right no-print">ভিউ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {relatedProperties.map((unit) => (
                          <tr key={unit.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono font-extrabold text-emerald-700">
                              {unit.propertyCode}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#0B192C]">{unit.titleBn}</td>
                            <td className="py-3 px-3 text-slate-600">
                              {unit.blockNo} · {unit.plotNo} ({unit.sizeBn})
                            </td>
                            <td className="py-3 px-3 text-right font-extrabold text-[#0B192C]">
                              {unit.priceDisplayBn}
                            </td>
                            <td className="py-3 px-3 text-right no-print">
                              <button
                                type="button"
                                onClick={() =>
                                  onSelectTarget({ type: 'property', property: unit })
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                প্রপার্টি ভিউ
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
          ) : property ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-extrabold text-[#0B192C] flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  <span>প্রপার্টি তফসিল, ফ্লোর প্ল্যান ও আর্থিক বিবরণী</span>
                </h3>
                {parentProject && (
                  <button
                    type="button"
                    onClick={() => onSelectTarget({ type: 'project', project: parentProject })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0B192C] text-[#0B192C] hover:text-[#FDE68A] text-xs font-extrabold transition-colors cursor-pointer no-print"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    মূল প্রজেক্ট দেখুন: {parentProject.nameBn}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block font-semibold">ব্লক ও প্লট/ইউনিট</span>
                  <span className="font-extrabold text-sm text-[#0B192C]">
                    {property.blockNo} · {property.plotNo}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block font-semibold">আয়তন (Sqft)</span>
                  <span className="font-extrabold text-sm text-[#0B192C]">
                    {toBengaliDigits(property.sqft || 3600)} বর্গফুট
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs text-emerald-800 block font-semibold">বুকিং মানি</span>
                  <span className="font-extrabold text-sm text-emerald-700">
                    {property.bookingDisplayBn ||
                      formatExactBdtBengali(property.bookingAmountBdt)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-xs text-amber-900 block font-semibold">কিস্তি ও পেমেন্ট</span>
                  <span className="font-extrabold text-sm text-amber-800">
                    {property.paymentPlanBn}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#C6A15B]/40 space-y-1.5">
                <span className="text-xs font-extrabold text-[#9A7432] uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  লেআউট ও প্রকৌশল বৈশিষ্ট্য (Floor Plan &amp; Plot Specifications)
                </span>
                <p className="text-sm font-bold text-[#0B192C]">
                  {property.floorPlanSpecs ||
                    'প্রশস্ত সংযোগ সড়ক, রাজউক ও বিএনবিসি নীতিমালা অনুযায়ী নির্মিত এবং তাৎক্ষণিক রেজিস্ট্রেশন উপযোগী।'}
                </p>
              </div>
            </div>
          ) : null}

          {/* Footer Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <HHLogo variant="dark" />
              <div className="text-xs text-slate-600">
                <p className="font-extrabold text-[#0B192C]">
                  প্রধান কার্যালয়: রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।
                </p>
                <p className="text-emerald-700 font-bold">
                  ল্যান্ড প্রজেক্ট জোন: বসুন্ধরা আবাসিক এলাকা, ঢাকা
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 no-print">
              {onActionClick && actionButtonLabelBn && (
                <button
                  type="button"
                  onClick={() => onActionClick(target)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionButtonLabelBn}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-slate-800 text-[#FDE68A] font-extrabold text-sm transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
