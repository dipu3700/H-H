import React, { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Building2, ExternalLink } from 'lucide-react';
import { ProjectItem } from '../types';
import { ArchitecturalRender } from './ArchitecturalVisuals';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const ProjectMarkerItem: React.FC<{
  project: ProjectItem;
  isSelected: boolean;
  onSelect: (project: ProjectItem) => void;
  onClose: () => void;
  onViewProject: (project: ProjectItem) => void;
}> = ({ project, isSelected, onSelect, onClose, onViewProject }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const lat = parseFloat(project.lat) || 23.8103;
  const lng = parseFloat(project.lng) || 90.4125;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat, lng }}
        onClick={() => onSelect(project)}
        title={project.nameBn}
      >
        <Pin
          background={isSelected ? '#C6A15B' : '#101C32'}
          borderColor={'#C6A15B'}
          glyphColor={isSelected ? '#101C32' : '#C6A15B'}
          scale={isSelected ? 1.25 : 1.05}
        />
      </AdvancedMarker>
      {isSelected && marker && (
        <InfoWindow anchor={marker} maxWidth={290} onCloseClick={onClose}>
          <div className="p-1 text-[#101C32] font-bengali">
            <div className="h-28 w-full rounded-lg overflow-hidden mb-2">
              <ArchitecturalRender theme={project.imageType} label={project.nameBn} />
            </div>
            <div className="text-xs text-[#172A45]/75 mb-0.5">
              {project.categoryBn} · {project.statusBn}
            </div>
            <h4 className="font-bold text-base text-[#101C32]">{project.nameBn}</h4>
            <p className="text-xs text-[#172A45] mt-1">{project.locationBn}</p>
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => onViewProject(project)}
                className="px-3 py-1.5 bg-[#101C32] text-white text-xs font-semibold rounded-lg hover:bg-[#172A45] transition-colors whitespace-nowrap"
              >
                বিস্তারিত দেখুন
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 border border-[#C6A15B] text-[#101C32] text-xs font-semibold rounded-lg hover:bg-[#F8F6F0] transition-colors inline-flex items-center gap-1 whitespace-nowrap"
              >
                <Navigation className="w-3 h-3" />
                দিকনির্দেশনা
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const ProjectMapSection: React.FC<{
  projects: ProjectItem[];
  onSelectProjectForBrochure: (project: ProjectItem) => void;
}> = ({ projects, onSelectProjectForBrochure }) => {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    projects[0] || null
  );

  const defaultCenter = { lat: 23.8103, lng: 90.4125 };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left Interactive Directory */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        {projects.map((project) => {
          const active = selectedProject?.id === project.id;
          const lat = parseFloat(project.lat) || 23.8103;
          const lng = parseFloat(project.lng) || 90.4125;
          return (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedProject(project);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                active
                  ? 'bg-[#101C32] text-white border-[#C6A15B] shadow-sm'
                  : 'bg-white text-[#101C32] border-slate-200 hover:border-[#C6A15B]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className={`text-xs ${
                      active ? 'text-[#C6A15B]' : 'text-slate-500'
                    }`}
                  >
                    {project.categoryBn} · {project.statusBn}
                  </div>
                  <h3 className="text-lg font-bold mt-0.5">{project.nameBn}</h3>
                  <p
                    className={`text-sm mt-1 flex items-center gap-1.5 ${
                      active ? 'text-slate-200' : 'text-slate-600'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
                    <span>{project.locationBn}</span>
                  </p>
                </div>
                <Building2
                  className={`w-5 h-5 shrink-0 ${
                    active ? 'text-[#C6A15B]' : 'text-[#101C32]/40'
                  }`}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-current/10 text-xs">
                <span>আকার: {project.sizeSummaryBn}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProjectForBrochure(project);
                    }}
                    className={`font-semibold underline underline-offset-4 ${
                      active ? 'text-[#C6A15B]' : 'text-[#101C32]'
                    }`}
                  >
                    ব্রোশিওর ও বিবরণ
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center gap-1 font-semibold ${
                      active ? 'text-white' : 'text-[#172A45]'
                    }`}
                  >
                    <span>গুগল ম্যাপস</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Google Maps Container (Explicit height required per CF2) */}
      <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm min-h-[440px] h-[460px] relative">
        {MAPS_API_KEY ? (
          <APIProvider apiKey={MAPS_API_KEY} libraries={['marker']} language="bn" region="BD">
            <Map
              mapId="DEMO_MAP_ID"
              defaultZoom={11}
              defaultCenter={defaultCenter}
              gestureHandling="cooperative"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              {projects.map((proj) => (
                <ProjectMarkerItem
                  key={proj.id}
                  project={proj}
                  isSelected={selectedProject?.id === proj.id}
                  onSelect={(p) => setSelectedProject(p)}
                  onClose={() => setSelectedProject(null)}
                  onViewProject={(p) => onSelectProjectForBrochure(p)}
                />
              ))}
            </Map>
          </APIProvider>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#101C32] text-white">
            <MapPin className="w-10 h-10 text-[#C6A15B] mb-3" />
            <h4 className="text-lg font-bold">প্রজেক্ট লোকেশন ম্যাপ</h4>
            <p className="text-sm text-slate-300 max-w-md mt-1">
              বাম পাশের তালিকা থেকে প্রজেক্ট নির্বাচন করে সরাসরি গুগল ম্যাপস দিকনির্দেশনা দেখুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
