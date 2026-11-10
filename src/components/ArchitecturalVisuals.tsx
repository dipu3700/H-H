import React from 'react';
import signatureTowerImg from '../assets/images/hh_signature_tower_1794297797561.jpg';
import greenLandPlotImg from '../assets/images/hh_green_land_plot_1794297798550.jpg';
import duplexVillaLandImg from '../assets/images/hh_duplex_villa_land_1794297801362.jpg';
import commercialSquareImg from '../assets/images/hh_commercial_square_1794297799604.jpg';
import luxuryInteriorImg from '../assets/images/hh_luxury_apartment_interior_1794297802463.jpg';

export const REAL_ESTATE_IMAGES = {
  signatureTower: signatureTowerImg,
  greenLandPlot: greenLandPlotImg,
  duplexVillaLand: duplexVillaLandImg,
  commercialSquare: commercialSquareImg,
  luxuryInterior: luxuryInteriorImg,
};

export function resolveImageUrl(raw?: string): string {
  if (!raw) return signatureTowerImg;
  if (raw.includes('hh_signature_tower') || raw.includes('signature')) return signatureTowerImg;
  if (raw.includes('hh_green_land_plot') || raw.includes('green') || raw.includes('township')) return greenLandPlotImg;
  if (raw.includes('hh_duplex_villa_land') || raw.includes('duplex') || raw.includes('villa')) return duplexVillaLandImg;
  if (raw.includes('hh_commercial_square') || raw.includes('commercial')) return commercialSquareImg;
  if (raw.includes('hh_luxury_apartment_interior') || raw.includes('interior') || raw.includes('penthouse')) return luxuryInteriorImg;
  return raw;
}

export function HHLogo({
  variant = 'dark',
  className = '',
}: {
  variant?: 'light' | 'dark';
  className?: string;
}) {
  const titleColor = variant === 'light' ? 'text-white' : 'text-[#0F172A]';
  const subColor = variant === 'light' ? 'text-emerald-300' : 'text-[#059669]';

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-3 select-none ${className}`}>
      <svg
        viewBox="0 0 88 88"
        className="w-9 h-9 sm:w-12 sm:h-12 md:w-13 md:h-13 shrink-0 drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="H & H Homes লোগো"
      >
        <defs>
          <linearGradient id="hhGoldGrad" x1="0" y1="0" x2="88" y2="88" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="55%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="hhEmeraldGrad" x1="0" y1="0" x2="88" y2="88" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <rect
          x="3"
          y="3"
          width="82"
          height="82"
          rx="18"
          fill="#0B192C"
          stroke="url(#hhEmeraldGrad)"
          strokeWidth="2.5"
        />
        {/* Architectural Roofline Crest */}
        <path
          d="M15 33L44 13L73 33"
          stroke="url(#hhGoldGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left 'H' Architectural Pillar */}
        <rect x="20" y="34" width="6.5" height="31" rx="1.5" fill="#FFFFFF" />
        <rect x="33" y="34" width="6.5" height="31" rx="1.5" fill="#FFFFFF" />
        <rect x="25" y="46.5" width="9" height="5.5" fill="url(#hhEmeraldGrad)" />

        {/* Center '&' Golden Divider Dot */}
        <circle cx="44" cy="49.5" r="2.6" fill="#FDE68A" />

        {/* Right 'H' Architectural Pillar */}
        <rect x="48.5" y="34" width="6.5" height="31" rx="1.5" fill="url(#hhGoldGrad)" />
        <rect x="61.5" y="34" width="6.5" height="31" rx="1.5" fill="url(#hhGoldGrad)" />
        <rect x="53.5" y="46.5" width="9" height="5.5" fill="url(#hhEmeraldGrad)" />

        {/* Base Foundation Line */}
        <line x1="16" y1="70" x2="72" y2="70" stroke="url(#hhGoldGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <text
          x="44"
          y="81"
          textAnchor="middle"
          fill="#FDE68A"
          fontSize="9.5"
          fontWeight="800"
          fontFamily="Plus Jakarta Sans, sans-serif"
          letterSpacing="0.8"
        >
          H &amp; H HOMES
        </text>
      </svg>
      <div className="flex flex-col min-w-0">
        <span
          className={`text-base sm:text-xl md:text-2xl font-extrabold tracking-tight leading-none truncate ${titleColor}`}
        >
          H &amp; H Homes
        </span>
        <span className={`text-[10px] sm:text-xs font-semibold mt-0.5 sm:mt-1 tracking-wide truncate ${subColor}`}>
          এইচ অ্যান্ড এইচ হোমস · বনশ্রী, ঢাকা
        </span>
      </div>
    </div>
  );
}

export interface PhotoCollectionItem {
  id: string;
  titleBn: string;
  subtitleBn: string;
  category: 'building' | 'land' | 'interior';
  imageUrl: string;
  locationBn: string;
  tagBn: string;
}

export const REAL_ESTATE_PHOTO_COLLECTION: PhotoCollectionItem[] = [
  {
    id: 'photo-building-1',
    titleBn: 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার (১৪ তলা আবাসিক ভবন)',
    subtitleBn: 'আধুনিক গ্লাস ফ্যাসাদ, ডাবল-হাইট লবি ও রুফটপ গার্ডেনসহ লাক্সারি অ্যাপার্টমেন্ট ভবন',
    category: 'building',
    imageUrl: signatureTowerImg,
    locationBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা',
    tagBn: 'আধুনিক ভবনের ছবি',
  },
  {
    id: 'photo-land-1',
    titleBn: 'এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ ও রেডি আবাসিক প্লট',
    subtitleBn: '৪০ ফুট প্রশস্ত পাকা রাস্তা, সীমানা প্রাচীর ও প্রাকৃতিক লেকপাড়ের নিষ্কণ্টক আবাসিক জমি',
    category: 'land',
    imageUrl: greenLandPlotImg,
    locationBn: 'বসুন্ধরা আবাসিক এলাকা, ঢাকা',
    tagBn: 'বসুন্ধরা আবাসিক জমি',
  },
  {
    id: 'photo-land-2',
    titleBn: 'দক্ষিণমুখী কর্নার প্লট ও ডুপ্লেক্স ভিলা ল্যান্ড (বসুন্ধরা)',
    subtitleBn: 'তাৎক্ষণিক বাড়ি নির্মাণের উপযোগী উঁচু ভিটা, বিদ্যুৎ ও ড্রেনেজ সুবিধাসহ প্রিমিয়াম প্লট',
    category: 'land',
    imageUrl: duplexVillaLandImg,
    locationBn: 'ব্লক: আই, বসুন্ধরা আবাসিক এলাকা, ঢাকা',
    tagBn: 'বসুন্ধরা কর্নার প্লট',
  },
  {
    id: 'photo-building-2',
    titleBn: 'এইচ অ্যান্ড এইচ কমার্শিয়াল স্কয়ার ও কর্পোরেট ভবন',
    subtitleBn: 'মেইন রোড সংলগ্ন আধুনিক শপিং প্লাজা, ব্যাংক ও কর্পোরেট অফিস স্পেস',
    category: 'building',
    imageUrl: commercialSquareImg,
    locationBn: 'বনশ্রী মেইন অ্যাভিনিউ, ঢাকা',
    tagBn: 'বাণিজ্যিক ভবন',
  },
  {
    id: 'photo-interior-1',
    titleBn: 'প্রিমিয়াম ফ্ল্যাট ইন্টেরিয়র ও প্রশস্ত ড্রয়িং-ডাইনিং',
    subtitleBn: 'মার্বেল ফ্লোরিং, প্যানোরামিক স্লাইডিং গ্লাস ও প্রাকৃতিক আলো-বাতাসপূর্ণ ফ্ল্যাট ডিজাইন',
    category: 'interior',
    imageUrl: luxuryInteriorImg,
    locationBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা',
    tagBn: 'ফ্ল্যাট ইন্টেরিয়র',
  },
];

const THEME_PHOTO_MAP: Record<string, { url: string; badgeText: string }> = {
  hero_3d_twin_towers: {
    url: signatureTowerImg,
    badgeText: 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার',
  },
  hero_3d_green_township: {
    url: greenLandPlotImg,
    badgeText: 'বসুন্ধরা আবাসিক প্লট প্রকল্প',
  },
  hero_3d_sky_penthouse: {
    url: luxuryInteriorImg,
    badgeText: 'লাক্সারি ফ্ল্যাট ও পেন্টহাউস ইন্টেরিয়র',
  },
  hero_3d_royal_commercial: {
    url: commercialSquareImg,
    badgeText: 'আধুনিক বাণিজ্যিক ভবন ও অফিস স্পেস',
  },
  project_3d_township: {
    url: greenLandPlotImg,
    badgeText: 'বসুন্ধরা রেডি আবাসিক প্লট প্রজেক্ট',
  },
  project_3d_twin_towers: {
    url: signatureTowerImg,
    badgeText: '১৪ তলা লাক্সারি আবাসিক ভবন',
  },
  project_3d_commercial_tower: {
    url: commercialSquareImg,
    badgeText: 'বাণিজ্যিক কমপ্লেক্স ও কর্পোরেট টাওয়ার',
  },
  project_3d_palace_residency: {
    url: duplexVillaLandImg,
    badgeText: 'বনশ্রী প্রিমিয়াম রেসিডেন্সি ও ভিলা',
  },
  prop_3d_villa_plot_a: {
    url: duplexVillaLandImg,
    badgeText: 'দক্ষিণমুখী আবাসিক ভিলা প্লট (বসুন্ধরা)',
  },
  prop_3d_lakeview_plot_b: {
    url: greenLandPlotImg,
    badgeText: 'লেকভিউ কর্নার প্লট (বসুন্ধরা)',
  },
  prop_3d_commercial_plot_c: {
    url: commercialSquareImg,
    badgeText: 'বাণিজ্যিক প্লট (বসুন্ধরা মেইন অ্যাভিনিউ)',
  },
  prop_3d_apartment_royal: {
    url: signatureTowerImg,
    badgeText: 'দক্ষিণমুখী লাক্সারি অ্যাপার্টমেন্ট ভবন',
  },
  prop_3d_penthouse_duplex: {
    url: luxuryInteriorImg,
    badgeText: 'ডুপ্লেক্স পেন্টহাউস ও ফ্ল্যাট ইন্টেরিয়র',
  },
  prop_3d_ready_condo: {
    url: signatureTowerImg,
    badgeText: 'রেডি ফ্ল্যাট ও আধুনিক ভবন',
  },
  prop_3d_commercial_suite: {
    url: commercialSquareImg,
    badgeText: 'কর্পোরেট অফিস ফ্লোর ও কমার্শিয়াল স্পেস',
  },
  gallery_3d_twin_night: {
    url: signatureTowerImg,
    badgeText: 'এইচ অ্যান্ড এইচ সিগনেচার বিল্ডিং',
  },
  gallery_3d_duplex_villa: {
    url: duplexVillaLandImg,
    badgeText: 'ডুপ্লেক্স ভিলা ও বসুন্ধরা আবাসিক প্লট',
  },
  gallery_3d_grand_lobby: {
    url: luxuryInteriorImg,
    badgeText: 'লাক্সারি ফ্ল্যাট ড্রয়িং ও ডাইনিং',
  },
  gallery_3d_rooftop_pool: {
    url: signatureTowerImg,
    badgeText: 'আধুনিক ভবনের এক্সটেরিয়র ভিউ',
  },
  gallery_3d_master_suite: {
    url: luxuryInteriorImg,
    badgeText: 'মাস্টার স্যুইট ও ফ্ল্যাট ইন্টেরিয়র',
  },
  gallery_3d_commercial_atrium: {
    url: commercialSquareImg,
    badgeText: 'বাণিজ্যিক ভবন ও শপিং প্লাজা',
  },
  video_3d_tower_walkthrough: {
    url: signatureTowerImg,
    badgeText: 'আবাসিক ভবন প্রজেক্ট ওয়াকথ্রু',
  },
  video_3d_township_drone: {
    url: greenLandPlotImg,
    badgeText: 'বসুন্ধরা আবাসিক জমি ও প্লট ড্রোন ভিউ',
  },
  video_3d_interior_tour: {
    url: luxuryInteriorImg,
    badgeText: 'রেডি ফ্ল্যাট ইন্টেরিয়র ট্যুর',
  },
  video_3d_engineering_qc: {
    url: commercialSquareImg,
    badgeText: 'ইঞ্জিনিয়ারিং ও নির্মাণ গুণগত মান',
  },
};

export function ArchitecturalRender({
  theme = 'hero_3d_twin_towers',
  className = 'w-full h-full',
  label,
  hideBadge = false,
}: {
  theme?: string;
  className?: string;
  label?: string;
  hideBadge?: boolean;
}) {
  const isDirectUrl =
    theme.startsWith('http://') ||
    theme.startsWith('https://') ||
    theme.startsWith('/src/assets/') ||
    theme.startsWith('/assets/') ||
    theme.startsWith('/images/') ||
    theme.startsWith('data:');

  const mapped = THEME_PHOTO_MAP[theme] || THEME_PHOTO_MAP.hero_3d_twin_towers;
  const initialResolved = resolveImageUrl(isDirectUrl ? theme : mapped.url);
  const badge = label || mapped.badgeText;

  const [imgSrc, setImgSrc] = React.useState<string>(initialResolved);
  const [loadFailed, setLoadFailed] = React.useState<boolean>(false);

  React.useEffect(() => {
    setImgSrc(resolveImageUrl(isDirectUrl ? theme : mapped.url));
    setLoadFailed(false);
  }, [theme, isDirectUrl, mapped.url]);

  const handleError = () => {
    if (!loadFailed) {
      if (theme.includes('green') || theme.includes('township') || theme.includes('land') || theme.includes('lakeview')) {
        setImgSrc('/images/hh_green_land_plot.jpg');
      } else if (theme.includes('duplex') || theme.includes('villa')) {
        setImgSrc('/images/hh_duplex_villa_land.jpg');
      } else if (theme.includes('commercial')) {
        setImgSrc('/images/hh_commercial_square.jpg');
      } else if (theme.includes('interior') || theme.includes('penthouse') || theme.includes('suite')) {
        setImgSrc('/images/hh_luxury_apartment_interior.jpg');
      } else {
        setImgSrc('/images/hh_signature_tower.jpg');
      }
      setLoadFailed(true);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-[#0B192C] via-[#1E293B] to-[#064E3B] select-none ${className}`}
    >
      <img
        src={imgSrc}
        alt={badge}
        loading="lazy"
        onError={handleError}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-transparent to-[#0F172A]/15 pointer-events-none" />
      {!hideBadge && (
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-[#0F172A]/80 text-white border border-white/20 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}

export function ExecutivePortrait({
  theme = 'portrait_chairman',
  className = 'w-full h-full',
}: {
  theme?: string;
  className?: string;
}) {
  const isFemale =
    theme.includes('arch') || theme.includes('crm') || theme.includes('doctor');

  const bgMap: Record<string, { bg1: string; bg2: string; suit: string; tie: string; accent: string }> = {
    portrait_chairman: {
      bg1: '#0B162C',
      bg2: '#1E3A8A',
      suit: '#0F172A',
      tie: '#C6A15B',
      accent: '#FDE68A',
    },
    portrait_md: {
      bg1: '#064E3B',
      bg2: '#0F766E',
      suit: '#1E293B',
      tie: '#10B981',
      accent: '#6EE7B7',
    },
    portrait_director_arch: {
      bg1: '#31102F',
      bg2: '#701A75',
      suit: '#4A044E',
      tie: '#F59E0B',
      accent: '#FDE68A',
    },
    portrait_director_fin: {
      bg1: '#0F172A',
      bg2: '#1E40AF',
      suit: '#172554',
      tie: '#38BDF8',
      accent: '#BAE6FD',
    },
    portrait_director_legal: {
      bg1: '#18181B',
      bg2: '#3F3F46',
      suit: '#09090B',
      tie: '#F8FAFC',
      accent: '#E4E4E7',
    },
    portrait_director_crm: {
      bg1: '#042F2E',
      bg2: '#115E59',
      suit: '#134E4A',
      tie: '#FBBF24',
      accent: '#FEF08A',
    },
  };

  const cfg = bgMap[theme] || bgMap.portrait_chairman;

  return (
    <div className={`relative overflow-hidden bg-[#0B162C] select-none ${className}`}>
      <svg
        viewBox="0 0 320 360"
        className="w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`pbg-${theme}`} x1="0" y1="0" x2="320" y2="360" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={cfg.bg1} />
            <stop offset="100%" stopColor={cfg.bg2} />
          </linearGradient>
        </defs>
        <rect width="320" height="360" fill={`url(#pbg-${theme})`} />
        <circle cx="160" cy="145" r="115" fill={cfg.accent} fillOpacity="0.08" stroke={cfg.accent} strokeOpacity="0.25" strokeWidth="1.5" />
        <circle cx="160" cy="145" r="88" fill={cfg.accent} fillOpacity="0.08" />

        <path
          d="M42 360C42 278 92 242 160 242C228 242 278 278 278 360H42Z"
          fill={cfg.suit}
          stroke={cfg.accent}
          strokeWidth="2"
        />
        <polygon points="130,242 160,295 190,242" fill="#FFFFFF" />
        <polygon points="152,258 168,258 174,345 160,356 146,345" fill={cfg.tie} />

        <rect x="142" y="205" width="36" height="45" rx="12" fill="#F1C27D" />
        <ellipse cx="160" cy="148" rx="52" ry="62" fill="#F5CBA7" />

        {isFemale ? (
          <path
            d="M102 155C102 100 128 74 160 74C192 74 218 100 218 155C218 195 206 235 195 252H125C114 235 102 195 102 155Z"
            fill={cfg.suit}
            fillOpacity="0.35"
          />
        ) : (
          <path
            d="M108 136C108 96 130 78 160 78C190 78 212 96 212 136C202 112 184 102 160 102C136 102 118 112 108 136Z"
            fill={theme === 'portrait_chairman' ? '#334155' : '#0F172A'}
          />
        )}

        <rect x="124" y="132" width="30" height="18" rx="4" fill="none" stroke="#9A7432" strokeWidth="2.5" />
        <rect x="166" y="132" width="30" height="18" rx="4" fill="none" stroke="#9A7432" strokeWidth="2.5" />
        <line x1="154" y1="140" x2="166" y2="140" stroke="#9A7432" strokeWidth="2.5" />
        <circle cx="139" cy="141" r="3.2" fill="#0F172A" />
        <circle cx="181" cy="141" r="3.2" fill="#0F172A" />

        {theme === 'portrait_chairman' ? (
          <path
            d="M118 168C122 198 140 212 160 212C180 212 198 198 202 168C190 182 176 186 160 186C144 186 130 182 118 168Z"
            fill="#475569"
            fillOpacity="0.75"
          />
        ) : null}
        <path
          d="M144 176Q160 188 176 176"
          stroke="#7C2D12"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        <circle cx="204" cy="296" r="8" fill="#FDE68A" stroke="#9A7432" strokeWidth="2" />
      </svg>
    </div>
  );
}

export function BlueprintDiagram({
  titleBn,
  specsBn,
  isLand = false,
}: {
  titleBn: string;
  specsBn: string;
  isLand?: boolean;
}) {
  return (
    <div className="relative w-full h-full min-h-[280px] bg-[#0B1F3A] text-white p-6 rounded-xl border border-slate-700 overflow-hidden">
      <svg
        viewBox="0 0 600 320"
        className="w-full h-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="cadGrid3D" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#38BDF8" strokeWidth="0.4" strokeOpacity="0.3" />
          </pattern>
        </defs>
        <rect width="600" height="320" fill="url(#cadGrid3D)" />
        <rect x="24" y="20" width="552" height="280" fill="none" stroke="#38BDF8" strokeWidth="2" />

        {isLand ? (
          <g stroke="#FDE68A" strokeWidth="2" fill="#0284C7" fillOpacity="0.18">
            <rect x="60" y="45" width="480" height="185" />
            <line x1="220" y1="45" x2="220" y2="230" strokeDasharray="6 4" />
            <line x1="380" y1="45" x2="380" y2="230" strokeDasharray="6 4" />
            <rect x="60" y="242" width="480" height="38" fill="#1E293B" stroke="#38BDF8" />
            <text x="300" y="266" textAnchor="middle" fill="#FDE68A" fontSize="15" fontWeight="700" stroke="none">
              প্রশস্ত ৪০ ফুট অভ্যন্তরীণ অ্যাভিনিউ সড়ক (প্লট লেআউট)
            </text>
            <text x="140" y="140" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="700" stroke="none">
              প্লট এ-১১
            </text>
            <text x="300" y="135" textAnchor="middle" fill="#34D399" fontSize="17" fontWeight="700" stroke="none">
              নির্বাচিত আবাসিক প্লট
            </text>
            <text x="460" y="140" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="700" stroke="none">
              প্লট এ-১৩
            </text>
          </g>
        ) : (
          <g stroke="#38BDF8" strokeWidth="2" fill="#0EA5E9" fillOpacity="0.14">
            <rect x="60" y="40" width="190" height="115" />
            <rect x="250" y="40" width="150" height="115" />
            <rect x="400" y="40" width="140" height="115" />
            <rect x="60" y="155" width="270" height="120" stroke="#FDE68A" />
            <rect x="330" y="155" width="210" height="120" />
            <text x="155" y="102" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="700" stroke="none">
              মাস্টার বেড (১৬×১৪)
            </text>
            <text x="325" y="102" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="700" stroke="none">
              বেডরুম-২ (১৪×১২)
            </text>
            <text x="470" y="102" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="700" stroke="none">
              বেডরুম-৩ (১২×১২)
            </text>
            <text x="195" y="220" textAnchor="middle" fill="#FDE68A" fontSize="16" fontWeight="700" stroke="none">
              গ্র্যান্ড ড্রয়িং ও ডাইনিং (২৪×১৬)
            </text>
            <text x="435" y="220" textAnchor="middle" fill="#34D399" fontSize="15" fontWeight="700" stroke="none">
              কিচেন ও দক্ষিণমুখী বারান্দা
            </text>
          </g>
        )}
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-[#BAE6FD]">
        <span className="font-bold text-[#FDE68A]">লেআউট ব্লু-প্রিন্ট: {titleBn}</span>
        <span>{specsBn}</span>
      </div>
    </div>
  );
}
