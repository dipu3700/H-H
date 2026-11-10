import {
  canBookProperty,
  generateBookingNumber,
  generateReceiptNumber,
  generateVoucherNumber,
  calculateInstallmentPlan,
  toEnglishDigits,
  validateBookingApplication,
  validateCustomerSignup,
} from './bengaliLogic.ts';

const STORAGE_KEY = 'hh_homes_cloudflare_db_v1';

interface StandaloneDbState {
  users: any[];
  settings: any;
  heroSlides: any[];
  boardMembers: any[];
  projects: any[];
  properties: any[];
  bookings: any[];
  payments: any[];
  erpTransactions: any[];
  inquiries: any[];
  complaints: any[];
  notifications: any[];
  gallery: any[];
  testimonials: any[];
  articles: any[];
}

function getInitialSeedState(): StandaloneDbState {
  return {
    users: [
      {
        id: 1,
        uid: 'demo-customer',
        name: 'আলহাজ্ব আরিফুর রহমান',
        phone: '01711223344',
        email: 'customer@hhhomesbd.com',
        passwordHash: '123456',
        nidNumber: '1992123456789',
        addressBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।',
        role: 'customer',
      },
    ],
    settings: {
      id: 1,
      companyNameBn: 'H & H Homes',
      companyNameEn: 'H & H Homes',
      taglineBn: 'স্বপ্নের ঠিকানা, আস্থার বন্ধন',
      taglineAltBn: 'আবাসিক জমি ও আধুনিক ফ্ল্যাটের বিশ্বস্ত প্রতিষ্ঠান',
      taglineEn: 'H & H Homes — Trusted Real Estate in Banasree, Dhaka',
      heroHeadlineBn: 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার',
      heroSubtitleBn:
        'প্রধান কার্যালয়: রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা। বসুন্ধরায় নিষ্কণ্টক আবাসিক প্লট এবং বনশ্রীতে আধুনিক অ্যাপার্টমেন্ট।',
      aboutIntroBn:
        'H & H Homes (এইচ অ্যান্ড এইচ হোমস) বসুন্ধরা আবাসিক এলাকায় পরিকল্পিত আবাসিক জমির প্লট এবং বনশ্রীতে আধুনিক অ্যাপার্টমেন্ট ভবন নির্মাণে স্বচ্ছতা, গুণগত মান এবং নির্ধারিত সময়ে হস্তান্তরে অঙ্গীকারবদ্ধ।',
      missionBn:
        'পরিকল্পিত নগরায়ন, মানসম্মত নির্মাণশৈলী এবং স্বচ্ছ লেনদেনের মাধ্যমে প্রতিটি পরিবারের জন্য নিরাপদ জমি ও ফ্ল্যাট নিশ্চিত করা।',
      visionBn:
        'আস্থা, স্থাপত্য নান্দনিকতা এবং গ্রাহককেন্দ্রিক সেবার মাধ্যমে দেশের শীর্ষস্থানীয় আবাসন প্রতিষ্ঠানে পরিণত হওয়া।',
      coreValuesBn:
        'স্বচ্ছ দলিল ও নামজারি · আধুনিক ভবন নির্মাণ · নির্ধারিত সময়ে হস্তান্তর · সহজ কিস্তি সুবিধা · দীর্ঘমেয়াদি গ্রাহক সেবা',
      officeAddressBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।',
      phone: '+৮৮০ ১৭১১-২২৩৩৪৪',
      whatsapp: '+৮৮০ ১৭১১-২২৩৩৪৪',
      email: 'info@hhhomesbd.com',
      officeHoursBn: 'শনিবার – বৃহস্পতিবার: সকাল ১০:০০টা – সন্ধ্যা ৮:০০টা',
      seoTitle: 'H & H Homes | এইচ অ্যান্ড এইচ হোমস — রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা',
      seoDescription:
        'বসুন্ধরায় পরিকল্পিত আবাসিক জমি এবং বনশ্রীতে আধুনিক ফ্ল্যাটের নিশ্চয়তায় আপনার পাশে H & H Homes (অফিস: রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা)।',
    },
    heroSlides: [
      {
        id: 1,
        badgeBn: 'H & H Homes',
        titleBn: 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার',
        subtitleBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা',
        highlightStatsBn: '১৮৫০–২৮৫০ বর্গফুট ফ্ল্যাট',
        ctaPrimaryBn: 'বিস্তারিত',
        ctaSecondaryBn: 'যোগাযোগ',
        visualTheme: 'hero_3d_twin_towers',
        projectSlug: 'hh-signature-tower',
        accentColor: '#10B981',
        displayOrder: 1,
        publishedOnWeb: 1,
      },
      {
        id: 2,
        badgeBn: 'H & H Homes',
        titleBn: 'এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ',
        subtitleBn: 'বসুন্ধরা আবাসিক এলাকা, ঢাকা',
        highlightStatsBn: '৩, ৫ ও ১০ কাঠা রেডি প্লট',
        ctaPrimaryBn: 'বিস্তারিত',
        ctaSecondaryBn: 'যোগাযোগ',
        visualTheme: 'hero_3d_green_township',
        projectSlug: 'hh-green-township',
        accentColor: '#059669',
        displayOrder: 2,
        publishedOnWeb: 1,
      },
      {
        id: 3,
        badgeBn: 'H & H Homes',
        titleBn: 'এইচ অ্যান্ড এইচ কমার্শিয়াল স্কয়ার',
        subtitleBn: 'বনশ্রী মেইন অ্যাভিনিউ, ঢাকা',
        highlightStatsBn: '৮০০–৬৫০০ বর্গফুট কমার্শিয়াল ফ্লোর',
        ctaPrimaryBn: 'বিস্তারিত',
        ctaSecondaryBn: 'যোগাযোগ',
        visualTheme: 'hero_3d_royal_commercial',
        projectSlug: 'hh-commercial-square',
        accentColor: '#D97706',
        displayOrder: 3,
        publishedOnWeb: 1,
      },
    ],
    boardMembers: [
      {
        id: 1,
        nameBn: 'আলহাজ্ব প্রকৌশলী মাহমুদুর রহমান চৌধুরী',
        designationBn: 'মাননীয় চেয়ারম্যান, H & H Homes',
        roleKey: 'chairman',
        qualificationBn: 'বিএসসি ইঞ্জিনিয়ার (সিভিল, বুয়েট), ফেলো — আইইবি (IEB)',
        experienceBn: '২৬+ বছরের আবাসন, স্ট্রাকচারাল ইঞ্জিনিয়ারিং ও নগরায়ন অভিজ্ঞতা',
        quoteBn:
          '“মানুষ সারা জীবনের সঞ্চয় দিয়ে একটি নিরাপদ জমি বা ফ্ল্যাটের স্বপ্ন দেখে। H & H Homes-এ আমরা সেই আস্থার শতভাগ মর্যাদা রক্ষায় অঙ্গীকারবদ্ধ।”',
        messageBn:
          'H & H Homes (অফিস: রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা)-এর পক্ষ থেকে আপনাকে আন্তরিক শুভেচ্ছা। বসুন্ধরায় আমাদের আবাসিক জমি এবং বনশ্রীতে আধুনিক ভবন প্রকল্পে আমরা সর্বোচ্চ মানের নির্মাণ সামগ্রী এবং শতভাগ স্বচ্ছ আইনগত দলিল প্রক্রিয়া অনুসরণ করি।',
        email: 'chairman@hhhomesbd.com',
        phone: '+৮৮০ ১৭১১-০০১১০০',
        portraitTheme: 'portrait_chairman',
        displayOrder: 1,
        publishedOnWeb: 1,
      },
      {
        id: 2,
        nameBn: 'মোঃ তানভীর আহমেদ হাসান',
        designationBn: 'ব্যবস্থাপনা পরিচালক (MD), H & H Homes',
        roleKey: 'md',
        qualificationBn: 'এমবিএ (রিয়েল এস্টেট ফাইন্যান্স ও স্ট্র্যাটেজিক ম্যানেজমেন্ট)',
        experienceBn: '১৯+ বছরের রিয়েল এস্টেট ডেভেলপমেন্ট ও ল্যান্ড ব্যাংকিং অভিজ্ঞতা',
        quoteBn:
          '“নির্ধারিত সময়ে প্রজেক্ট হস্তান্তর, নিষ্কণ্টক দলিল এবং ডিজিটাল গ্রাহক সেবাই H & H Homes-এর মূল শক্তি।”',
        messageBn:
          'সম্মানিত গ্রাহক, আমাদের অনলাইন পোর্টালের মাধ্যমে আপনি যেকোনো স্থান থেকে বসুন্ধরার জমির প্লট ও বনশ্রীর ফ্ল্যাটের বিস্তারিত তথ্য, কিস্তির হিসাব এবং অফিশিয়াল মানি রিসিট গ্রহণ করতে পারবেন।',
        email: 'md@hhhomesbd.com',
        phone: '+৮৮০ ১৭১১-২২৩৩৪৪',
        portraitTheme: 'portrait_md',
        displayOrder: 2,
        publishedOnWeb: 1,
      },
      {
        id: 3,
        nameBn: 'স্থপতি ফারহানা ইয়াসমিন চৌধুরী',
        designationBn: 'পরিচালক (স্থাপত্য ও ভবন পরিকল্পনা)',
        roleKey: 'director',
        qualificationBn: 'বি.আর্ক (স্থাপত্য বিভাগ), সদস্য — আইএবি (IAB)',
        experienceBn: '১৫+ বছরের আধুনিক ভবন ও ল্যান্ডস্কেপ ডিজাইন অভিজ্ঞতা',
        quoteBn: '“প্রতিটি ভবনের নকশায় প্রাকৃতিক আলো-বাতাস ও আধুনিক নান্দনিকতার মেলবন্ধনই আমাদের লক্ষ্য।”',
        messageBn:
          'আমাদের স্থাপত্য টিম প্রতিটি প্লট ও অ্যাপার্টমেন্ট এমনভাবে পরিকল্পনা করে যাতে সর্বোচ্চ ক্রস-ভেন্টিলেশন ও নাগরিক স্বাচ্ছন্দ্য নিশ্চিত হয়।',
        email: 'architect@hhhomesbd.com',
        phone: '+৮৮০ ১৭১১-৩৩৪৪৫৫',
        portraitTheme: 'portrait_director_arch',
        displayOrder: 3,
        publishedOnWeb: 1,
      },
      {
        id: 4,
        nameBn: 'ড. কামরুল হাসান এফসিএ (FCA)',
        designationBn: 'পরিচালক (অর্থ ও হিসাবরক্ষণ)',
        roleKey: 'director',
        qualificationBn: 'চার্টার্ড অ্যাকাউন্ট্যান্ট (FCA)',
        experienceBn: '২২+ বছরের কর্পোরেট ফাইন্যান্স ও ইআরপি হিসাব ব্যবস্থাপনা',
        quoteBn: '“শতভাগ নির্ভুল হিসাবরক্ষণ এবং গ্রাহকের প্রতিটি টাকার স্বচ্ছ রিসিট সংরক্ষণ আমাদের ভিত্তি।”',
        messageBn:
          'H & H Homes-এর প্রতিটি আর্থিক লেনদেন আধুনিক ইআরপি (ERP) সফটওয়্যারের মাধ্যমে সংরক্ষিত হয়, যা গ্রাহকের বিনিয়োগকে রাখে সম্পূর্ণ নিরাপদ।',
        email: 'finance@hhhomesbd.com',
        phone: '+৮৮০ ১৭১১-৪৪৫৫৬৬',
        portraitTheme: 'portrait_director_fin',
        displayOrder: 4,
        publishedOnWeb: 1,
      },
    ],
    projects: [
      {
        id: 1,
        slug: 'hh-green-township',
        nameBn: 'এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ',
        nameEn: 'H & H Bashundhara Green Township',
        categoryBn: 'আবাসিক জমি',
        statusBn: 'চলমান',
        areaBn: 'বসুন্ধরা আবাসিক এলাকা, ঢাকা',
        locationBn: 'বসুন্ধরা আবাসিক এলাকা, ঢাকা',
        sizeSummaryBn: '৩, ৫ ও ১০ কাঠা রেডি প্লট',
        priceSummaryBn: 'কাঠা প্রতি ৯ লক্ষ টাকা থেকে শুরু',
        availabilityBn: 'প্লট বুকিং চলছে',
        descriptionBn:
          'বসুন্ধরা আবাসিক এলাকায় ৪০ ও ৬০ ফুট প্রশস্ত পাকা সড়ক, বাউন্ডারি ওয়াল, কৃত্রিম লেক এবং পূর্ণাঙ্গ নাগরিক সুবিধাসম্বলিত নিষ্কণ্টক আবাসিক জমি ও প্লট প্রকল্প।',
        specificationsJson: JSON.stringify([
          { label: 'প্রকল্পের ধরন', value: 'পরিকল্পিত আবাসিক ও বাণিজ্যিক প্লট প্রকল্প' },
          { label: 'অবস্থান', value: 'বসুন্ধরা আবাসিক এলাকা, ঢাকা' },
          { label: 'অভ্যন্তরীণ সড়ক', value: '২৫ ফুট, ৪০ ফুট ও ৬০ ফুট প্রশস্ত পিচঢালা সড়ক' },
          { label: 'প্লটের আকার', value: '৩ কাঠা, ৫ কাঠা এবং ১০ কাঠা' },
          { label: 'পেমেন্ট সুবিধা', value: 'এককালীন ও ৩৬/৬০ মাসের সহজ কিস্তি সুবিধা' },
        ]),
        lat: '23.8191',
        lng: '90.4526',
        imageType: 'project_3d_township',
        featured: 1,
        publishedOnWeb: 1,
        totalBudgetBdt: 120000000,
      },
      {
        id: 2,
        slug: 'hh-signature-tower',
        nameBn: 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার',
        nameEn: 'H & H Signature Tower',
        categoryBn: 'ফ্ল্যাট',
        statusBn: 'চলমান',
        areaBn: 'বনশ্রী, ব্লক-সি, ঢাকা',
        locationBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা',
        sizeSummaryBn: '১৮৫০ – ২৮৫০ বর্গফুট লাক্সারি অ্যাপার্টমেন্ট',
        priceSummaryBn: '৳ ১.৪৮ কোটি থেকে শুরু',
        availabilityBn: 'সীমিত সংখ্যক ফ্ল্যাট উন্মুক্ত',
        descriptionBn:
          'বনশ্রীর ব্লক সি-তে আধুনিক গ্লাস ফ্যাসাদ, রুফটপ গার্ডেন, ডাবল-হাইট গ্র্যান্ড রিসেপশন লবি এবং ২৪/৭ নিরাপত্তাসম্পন্ন ১৪ তলা আবাসিক ভবন।',
        specificationsJson: JSON.stringify([
          { label: 'ভবনের উচ্চতা', value: 'বেজমেন্ট + গ্রাউন্ড + ১৪ তলা আবাসিক ভবন' },
          { label: 'অ্যাপার্টমেন্ট সাইজ', value: '১৮৫০, ২২৫০ ও ২৮৫০ বর্গফুট' },
          { label: 'বেডরুম ও বাথরুম', value: '৩ ও ৪ বেডরুম, প্রশস্ত ড্রয়িং-ডাইনিং ও বারান্দা' },
          { label: 'অ্যামেনিটিজ', value: 'রুফটপ গার্ডেন, জিমনেসিয়াম, কমিউনিটি হল ও ২টি লিফট' },
          { label: 'নিরাপত্তা ব্যবস্থা', value: '২৪/৭ সিসিটিভি নজরদারি ও ফুল ব্যাকআপ জেনারেটর' },
        ]),
        lat: '23.7619',
        lng: '90.4315',
        imageType: 'project_3d_twin_towers',
        featured: 1,
        publishedOnWeb: 1,
        totalBudgetBdt: 185000000,
      },
      {
        id: 3,
        slug: 'hh-commercial-square',
        nameBn: 'এইচ অ্যান্ড এইচ কমার্শিয়াল স্কয়ার',
        nameEn: 'H & H Commercial Square',
        categoryBn: 'কমার্শিয়াল স্পেস',
        statusBn: 'আসন্ন',
        areaBn: 'বনশ্রী মেইন অ্যাভিনিউ',
        locationBn: 'ব্লক-সি মেইন রোড, বনশ্রী, ঢাকা',
        sizeSummaryBn: '৮০০ – ৬৫০০ বর্গফুট শোরুম ও অফিস',
        priceSummaryBn: 'বিনিয়োগ ও প্রি-বুকিং উন্মুক্ত',
        availabilityBn: 'প্রি-বুকিং চলছে',
        descriptionBn:
          'বনশ্রী প্রধান সড়ক সংলগ্ন আধুনিক গ্লাস ও কম্পোজিট ফ্যাসাদের বাণিজ্যিক শপিং প্লাজা ও কর্পোরেট অফিস ভবন।',
        specificationsJson: JSON.stringify([
          { label: 'প্রকল্পের ধরন', value: 'কর্পোরেট টাওয়ার ও শপিং কমপ্লেক্স' },
          { label: 'ইউনিট সাইজ', value: '৮০০ বর্গফুট থেকে ৬৫০০ বর্গফুট কলাম-ফ্রি ফ্লোর' },
          { label: 'লিফট ও পার্কিং', value: 'হাই-স্পিড লিফট ও ডাবল বেজমেন্ট কার পার্কিং' },
        ]),
        lat: '23.7638',
        lng: '90.4295',
        imageType: 'project_3d_commercial_tower',
        featured: 1,
        publishedOnWeb: 1,
        totalBudgetBdt: 240000000,
      },
      {
        id: 4,
        slug: 'hh-banasree-residency',
        nameBn: 'এইচ অ্যান্ড এইচ বনশ্রী সিরিন রেসিডেন্সি',
        nameEn: 'H & H Banasree Serene Residency',
        categoryBn: 'ফ্ল্যাট',
        statusBn: 'সম্পন্ন',
        areaBn: 'বনশ্রী, ব্লক-সি, ঢাকা',
        locationBn: 'রোড: ৪ সংলগ্ন, ব্লক: সি, বনশ্রী, ঢাকা',
        sizeSummaryBn: '১৭৫০ – ২৪৫০ বর্গফুট রেডি ফ্ল্যাট',
        priceSummaryBn: 'তাৎক্ষণিক হস্তান্তরযোগ্য',
        availabilityBn: 'মাত্র ২টি রেডি ফ্ল্যাট অবশিষ্ট',
        descriptionBn:
          'সম্পূর্ণ প্রস্তুত লাক্সারি ফ্ল্যাট ও ডুপ্লেক্স আবাসিক ভবন—এক্ষুনি বসবাসের উপযোগী।',
        specificationsJson: JSON.stringify([
          { label: 'ভবনের ধরন', value: 'জি + ৯ তলা রেডি অ্যাপার্টমেন্ট ভবন' },
          { label: 'ইউনিট সাইজ', value: '১৭৫০ বর্গফুট ও ২৪৫০ বর্গফুট' },
          { label: 'বিশেষ সুবিধা', value: 'রুফটপ ল্যান্ডস্কেপ গার্ডেন, প্রেয়ার হল ও কার পার্কিং' },
        ]),
        lat: '23.7612',
        lng: '90.4302',
        imageType: 'project_3d_palace_residency',
        featured: 1,
        publishedOnWeb: 1,
        totalBudgetBdt: 95000000,
      },
    ],
    properties: [
      {
        id: 1,
        propertyCode: 'HH-L-101',
        projectId: 1,
        titleBn: 'এইচ অ্যান্ড এইচ বসুন্ধরা টাউনশিপ — দক্ষিণমুখী আবাসিক প্লট (ব্লক-আই)',
        titleEn: 'H & H Bashundhara Township — South Facing Villa Land Plot',
        categoryBn: 'আবাসিক জমি',
        propertyType: 'land',
        areaBn: 'বসুন্ধরা আবাসিক এলাকা, ঢাকা',
        locationBn: 'ব্লক-আই, বসুন্ধরা আবাসিক এলাকা, ঢাকা',
        blockNo: 'ব্লক-আই',
        plotNo: 'প্লট-১২',
        sizeBn: '৫ কাঠা (৩,৬০০ বর্গফুট)',
        bedrooms: 0,
        bathrooms: 0,
        sqft: 3600,
        priceBdt: 4500000,
        priceDisplayBn: '৳ ৪৫ লক্ষ (কাঠা প্রতি ৯ লক্ষ)',
        bookingAmountBdt: 500000,
        bookingDisplayBn: '৳ ৫ লক্ষ',
        paymentPlanBn: 'এককালীন অথবা ৩৬/৬০ মাসের সহজ কিস্তি সুবিধা',
        statusBn: 'বুকিং চলছে',
        descriptionBn:
          'বসুন্ধরা আবাসিক এলাকায় ৪০ ফুট প্রশস্ত পাকা সড়কের পাশে দক্ষিণমুখী ৫ কাঠার নিষ্কণ্টক আবাসিক জমি। এক্ষুনি বাউন্ডারি ও বাড়ি নির্মাণের উপযোগী।',
        floorPlanSpecs:
          'প্রস্থ: ৪৫ ফুট × দৈর্ঘ্য: ৮০ ফুট | সম্মুখ সড়ক: ৪০ ফুট প্রশস্ত | দিক: দক্ষিণমুখী | লোকেশন: বসুন্ধরা আবাসিক এলাকা',
        lat: '23.8191',
        lng: '90.4526',
        imageType: 'prop_3d_villa_plot_a',
        publishedOnWeb: 1,
      },
      {
        id: 2,
        propertyCode: 'HH-L-102',
        projectId: 1,
        titleBn: 'এইচ অ্যান্ড এইচ বসুন্ধরা টাউনশিপ — লেকভিউ কর্নার প্লট (ব্লক-এম)',
        titleEn: 'H & H Bashundhara Township — Lakeview Corner Land Plot',
        categoryBn: 'আবাসিক জমি',
        propertyType: 'land',
        areaBn: 'বসুন্ধরা আবাসিক এলাকা, ঢাকা',
        locationBn: 'ব্লক-এম (লেকভিউ জোন), বসুন্ধরা আবাসিক এলাকা, ঢাকা',
        blockNo: 'ব্লক-এম',
        plotNo: 'প্লট-০৪',
        sizeBn: '৩ কাঠা (২,১৬০ বর্গফুট)',
        bedrooms: 0,
        bathrooms: 0,
        sqft: 2160,
        priceBdt: 2850000,
        priceDisplayBn: '৳ ২৮.৫০ লক্ষ',
        bookingAmountBdt: 300000,
        bookingDisplayBn: '৳ ৩ লক্ষ',
        paymentPlanBn: 'এককালীন অথবা ৩৬ মাসের কিস্তি সুবিধা',
        statusBn: 'বুকিং চলছে',
        descriptionBn:
          'বসুন্ধরা আবাসিক এলাকায় লেক ও পার্কের ঠিক সামনে পূর্ব-দক্ষিণ কর্নার ৩ কাঠার আবাসিক প্লট। উঁচু ভরাটকৃত রেডি জমি।',
        floorPlanSpecs:
          'প্রস্থ: ৩৬ ফুট × দৈর্ঘ্য: ৬০ ফুট | সম্মুখ সড়ক: ৩০ ফুট ও ২৫ ফুট কর্নার | দিক: পূর্ব-দক্ষিণ লেকভিউ | বসুন্ধরা',
        lat: '23.8215',
        lng: '90.4552',
        imageType: 'prop_3d_lakeview_plot_b',
        publishedOnWeb: 1,
      },
      {
        id: 3,
        propertyCode: 'HH-L-103',
        projectId: 1,
        titleBn: 'বসুন্ধরা মেইন অ্যাভিনিউ — ৬০ ফুট রোড সংলগ্ন বাণিজ্যিক প্লট (ব্লক-সি)',
        titleEn: 'Bashundhara Main Avenue — Commercial Land Plot',
        categoryBn: 'বাণিজ্যিক জমি',
        propertyType: 'land',
        areaBn: 'বসুন্ধরা আবাসিক এলাকা, ঢাকা',
        locationBn: 'ব্লক-সি মেইন অ্যাভিনিউ, বসুন্ধরা আবাসিক এলাকা, ঢাকা',
        blockNo: 'ব্লক-সি',
        plotNo: 'প্লট-০১',
        sizeBn: '১০ কাঠা (৭,২০০ বর্গফুট)',
        bedrooms: 0,
        bathrooms: 0,
        sqft: 7200,
        priceBdt: 11000000,
        priceDisplayBn: '৳ ১.১০ কোটি',
        bookingAmountBdt: 1500000,
        bookingDisplayBn: '৳ ১৫ লক্ষ',
        paymentPlanBn: 'এককালীন অথবা ৩৬ মাসের বিশেষ বাণিজ্যিক কিস্তি',
        statusBn: 'বুকিং চলছে',
        descriptionBn:
          'বসুন্ধরা ৬০ ফুট মেইন অ্যাভিনিউ সংলগ্ন বহুতল বাণিজ্যিক ভবন, হাসপাতাল, স্কুল বা শোরুম নির্মাণের উপযোগী ১০ কাঠার প্রাইম জমি।',
        floorPlanSpecs:
          'প্রস্থ: ৬০ ফুট × দৈর্ঘ্য: ১২০ ফুট | সম্মুখ সড়ক: ৬০ ফুট মেইন রোড | ধরন: ১০০% বাণিজ্যিক অনুমোদিত | বসুন্ধরা',
        lat: '23.8165',
        lng: '90.4480',
        imageType: 'prop_3d_commercial_plot_c',
        publishedOnWeb: 1,
      },
      {
        id: 4,
        propertyCode: 'HH-A-201',
        projectId: 2,
        titleBn: 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার — লাক্সারি ফ্যামিলি ফ্ল্যাট (৪র্থ তলা)',
        titleEn: 'H & H Signature Tower — Luxury Family Apartment',
        categoryBn: 'ফ্ল্যাট',
        propertyType: 'apartment',
        areaBn: 'বনশ্রী, ব্লক-সি, ঢাকা',
        locationBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা',
        blockNo: 'ব্লক-সি',
        plotNo: 'ফ্ল্যাট-৪এ',
        sizeBn: '১৮৫০ বর্গফুট',
        bedrooms: 3,
        bathrooms: 4,
        sqft: 1850,
        priceBdt: 14800000,
        priceDisplayBn: '৳ ১.৪৮ কোটি',
        bookingAmountBdt: 1500000,
        bookingDisplayBn: '৳ ১৫ লক্ষ',
        paymentPlanBn: 'বুকিং মানি + ২৪/৩৬ মাসের কিস্তি সুবিধা',
        statusBn: 'বুকিং চলছে',
        descriptionBn:
          '৩টি প্রশস্ত বেডরুম, ৪টি বাথরুম, ফরমাল লিভিং, ডাইনিং, ৩টি দক্ষিণমুখী বারান্দা এবং ডেডিকেটেড কার পার্কিংসহ আধুনিক ফ্ল্যাট।',
        floorPlanSpecs:
          'মাস্টার বেড: ১৬×১৪ ফুট | চাইল্ড বেড: ১৪×১২ ফুট | গেস্ট বেড: ১২×১২ ফুট | ড্রয়িং ও ডাইনিং: ২৪×১৬ ফুট | বারান্দা: ৩টি',
        lat: '23.7619',
        lng: '90.4315',
        imageType: 'prop_3d_apartment_royal',
        publishedOnWeb: 1,
      },
      {
        id: 5,
        propertyCode: 'HH-A-202',
        projectId: 2,
        titleBn: 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার — ডুপ্লেক্স পেন্টহাউস স্যুইট',
        titleEn: 'H & H Signature Tower — Duplex Penthouse',
        categoryBn: 'ফ্ল্যাট',
        propertyType: 'apartment',
        areaBn: 'বনশ্রী, ব্লক-সি, ঢাকা',
        locationBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা',
        blockNo: 'ব্লক-সি',
        plotNo: 'পেন্টহাউস-১৪বি',
        sizeBn: '২৮৫০ বর্গফুট',
        bedrooms: 4,
        bathrooms: 5,
        sqft: 2850,
        priceBdt: 23500000,
        priceDisplayBn: '৳ ২.৩৫ কোটি',
        bookingAmountBdt: 2500000,
        bookingDisplayBn: '৳ ২৫ লক্ষ',
        paymentPlanBn: 'এককালীন অথবা ২৪ মাসের বিশেষ কিস্তি সুবিধা',
        statusBn: 'বুকিং চলছে',
        descriptionBn:
          'ডাবল-হাইট গ্লাস সিলিং, প্রাইভেট রুফটপ টেরেস গার্ডেন, ৪টি রাজকীয় বেডরুম এবং ২টি ভিআইপি কার পার্কিংসহ পেন্টহাউস।',
        floorPlanSpecs:
          '৪ বেডরুম | ৫ বাথরুম | ডাবল-হাইট ফ্যামিলি লাউঞ্জ | প্রাইভেট স্কাই ডেক | ২টি পার্কিং',
        lat: '23.7621',
        lng: '90.4318',
        imageType: 'prop_3d_penthouse_duplex',
        publishedOnWeb: 1,
      },
      {
        id: 6,
        propertyCode: 'HH-A-203',
        projectId: 4,
        titleBn: 'এইচ অ্যান্ড এইচ বনশ্রী রেসিডেন্সি — ১০০% রেডি ফ্ল্যাট (৩য় তলা)',
        titleEn: 'H & H Banasree Residency — Ready Flat (3rd Floor)',
        categoryBn: 'ফ্ল্যাট',
        propertyType: 'apartment',
        areaBn: 'বনশ্রী, ব্লক-সি, ঢাকা',
        locationBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা',
        blockNo: 'ব্লক-সি',
        plotNo: 'ইউনিট-৩এ',
        sizeBn: '১৭৫০ বর্গফুট',
        bedrooms: 3,
        bathrooms: 3,
        sqft: 1750,
        priceBdt: 15500000,
        priceDisplayBn: '৳ ১.৫৫ কোটি',
        bookingAmountBdt: 2000000,
        bookingDisplayBn: '৳ ২০ লক্ষ',
        paymentPlanBn: '১০০% রেডি ফ্ল্যাট — তাৎক্ষণিক হস্তান্তর ও ব্যাংক লোন সুবিধা',
        statusBn: 'বুকিং চলছে',
        descriptionBn:
          'মার্বেল ফ্লোর ফিনিশিং, আধুনিক কিচেন ক্যাবিনেট ও প্রশস্ত বারান্দাসহ ১০০% প্রস্তুত ৩ বেডরুমের ফ্ল্যাট।',
        floorPlanSpecs:
          '৩ বেডরুম | ৩ বাথরুম | ফরমাল লিভিং | ডাইনিং স্পেস | মডার্ন কিচেন | ১টি কার পার্কিং',
        lat: '23.7612',
        lng: '90.4302',
        imageType: 'prop_3d_ready_condo',
        publishedOnWeb: 1,
      },
    ],
    bookings: [
      {
        id: 1,
        bookingNumber: 'HH-BK-2026-0101',
        propertyId: 1,
        userUid: 'demo-customer',
        customerName: 'আলহাজ্ব আরিফুর রহমান',
        customerPhone: '01711223344',
        customerEmail: 'customer@hhhomesbd.com',
        nidNumber: '1992123456789',
        addressBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।',
        paymentPlanChoice: '৩৬ মাসিক কিস্তি',
        totalPriceBdt: 4500000,
        bookingMoneyBdt: 500000,
        paidAmountBdt: 611111,
        dueAmountBdt: 3888889,
        nextInstallmentDate: '2026-12-05',
        statusBn: 'অনুমোদিত',
        notesBn: 'বসুন্ধরা ব্লক-আই ৫ কাঠা আবাসিক প্লট বরাদ্দ।',
      },
      {
        id: 2,
        bookingNumber: 'HH-BK-2026-0102',
        propertyId: 4,
        userUid: 'demo-customer',
        customerName: 'ডা. মাহবুব আলম',
        customerPhone: '01819556677',
        customerEmail: 'mahbub@example.com',
        nidNumber: '1985443322110',
        addressBn: 'বনশ্রী, ঢাকা',
        paymentPlanChoice: '২৪ মাসিক কিস্তি',
        totalPriceBdt: 14800000,
        bookingMoneyBdt: 1500000,
        paidAmountBdt: 1500000,
        dueAmountBdt: 13300000,
        nextInstallmentDate: '2026-12-10',
        statusBn: 'অনুমোদিত',
        notesBn: 'সিগনেচার টাওয়ার ৪র্থ তলা ফ্ল্যাট বুকিং।',
      },
    ],
    payments: [
      {
        id: 1,
        receiptNumber: 'HH-MR-2026-0101',
        bookingId: 1,
        userUid: 'demo-customer',
        installmentNo: 0,
        titleBn: 'বুকিং মানি (প্রাথমিক জমা) — বসুন্ধরা প্লট-১২',
        amountBdt: 500000,
        dueDate: '2026-10-05',
        paidDate: '2026-10-05',
        paymentMethodBn: 'ব্যাংক পে-অর্ডার (ইসলামী ব্যাংক পিএলসি)',
        statusBn: 'পরিশোধিত',
      },
      {
        id: 2,
        receiptNumber: 'HH-MR-2026-0102',
        bookingId: 1,
        userUid: 'demo-customer',
        installmentNo: 1,
        titleBn: '১ম মাসিক কিস্তি — বসুন্ধরা প্লট-১২',
        amountBdt: 111111,
        dueDate: '2026-11-05',
        paidDate: '2026-11-05',
        paymentMethodBn: 'ব্যাংক ট্রান্সফার (সিটি ব্যাংক)',
        statusBn: 'পরিশোধিত',
      },
      {
        id: 3,
        receiptNumber: 'HH-MR-2026-0103',
        bookingId: 1,
        userUid: 'demo-customer',
        installmentNo: 2,
        titleBn: '২য় মাসিক কিস্তি — বসুন্ধরা প্লট-১২',
        amountBdt: 111111,
        dueDate: '2026-12-05',
        paidDate: '',
        paymentMethodBn: 'ব্যাংক ট্রান্সফার / অনলাইন পেমেন্ট',
        statusBn: 'বকেয়া',
      },
      {
        id: 4,
        receiptNumber: 'HH-MR-2026-0104',
        bookingId: 2,
        userUid: 'demo-customer',
        installmentNo: 0,
        titleBn: 'বুকিং মানি — সিগনেচার টাওয়ার (ফ্ল্যাট-৪এ)',
        amountBdt: 1500000,
        dueDate: '2026-10-12',
        paidDate: '2026-10-12',
        paymentMethodBn: 'আরটিজিএস (RTGS) ব্যাংক ট্রান্সফার',
        statusBn: 'পরিশোধিত',
      },
    ],
    erpTransactions: [
      {
        id: 1,
        voucherNo: 'HH-VCH-2026-1001',
        transactionDate: '2026-10-05',
        type: 'income',
        categoryBn: 'বুকিং ও ডাউন পেমেন্ট আদায়',
        projectId: 1,
        projectNameBn: 'এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ',
        titleBn: 'বসুন্ধরা ব্লক-আই, প্লট-১২ এর বুকিং মানি ও ১ম কিস্তি জমা',
        amountBdt: 611111,
        paymentMethodBn: 'ব্যাংক পে-অর্ডার (ইসলামী ব্যাংক পিএলসি)',
        referenceNo: 'HH-MR-2026-0101',
        recordedByBn: 'ড. কামরুল হাসান এফসিএ',
        notesBn: 'গ্রাহকের মানি রিসিট ইস্যু করা হয়েছে এবং লেজারে পোস্টিং সম্পন্ন।',
      },
      {
        id: 2,
        voucherNo: 'HH-VCH-2026-1002',
        transactionDate: '2026-10-12',
        type: 'income',
        categoryBn: 'ফ্ল্যাট বুকিং ও কিস্তি আদায়',
        projectId: 2,
        projectNameBn: 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার',
        titleBn: 'ফ্ল্যাট-৪এ এর বুকিং মানি আদায়',
        amountBdt: 1500000,
        paymentMethodBn: 'আরটিজিএস (RTGS) ব্যাংক ট্রান্সফার — সিটি ব্যাংক',
        referenceNo: 'HH-MR-2026-0104',
        recordedByBn: 'প্রধান হিসাবরক্ষক',
        notesBn: 'বনশ্রী প্রজেক্ট একাউন্টে ক্রেডিট হয়েছে।',
      },
      {
        id: 3,
        voucherNo: 'HH-VCH-2026-1003',
        transactionDate: '2026-10-15',
        type: 'expense',
        categoryBn: 'ভূমি উন্নয়ন ও সড়ক নির্মাণ ব্যয়',
        projectId: 1,
        projectNameBn: 'এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ',
        titleBn: 'বসুন্ধরা ব্লক-আই ও ব্লক-এম এর অভ্যন্তরীণ সড়ক ও বাউন্ডারি নির্মাণ',
        amountBdt: 850000,
        paymentMethodBn: 'অ্যাকাউন্ট পেয়ি চেক',
        referenceNo: 'CHK-771209',
        recordedByBn: 'প্রকৌশল ও প্রকিউরমেন্ট বিভাগ',
        notesBn: 'প্রজেক্ট ইঞ্জিনিয়ারের বিল যাচাইপূর্বক অনুমোদিত।',
      },
      {
        id: 4,
        voucherNo: 'HH-VCH-2026-1004',
        transactionDate: '2026-10-20',
        type: 'expense',
        categoryBn: 'নির্মাণ সামগ্রী (রড, সিমেন্ট ও স্টোন চিপস)',
        projectId: 2,
        projectNameBn: 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার',
        titleBn: 'বিএসআরএম (BSRM) রড ও সিমেন্ট ক্রয় (বনশ্রী সাইট)',
        amountBdt: 950000,
        paymentMethodBn: 'ব্যাংক ট্রান্সফার',
        referenceNo: 'INV-BSRM-2026-88',
        recordedByBn: 'প্রকিউরমেন্ট ম্যানেজার',
        notesBn: 'বনশ্রী সাইট স্টোরে মালামাল বুঝিয়ে নেওয়া হয়েছে।',
      },
    ],
    inquiries: [],
    complaints: [],
    notifications: [
      {
        id: 1,
        userUid: 'demo-customer',
        titleBn: 'স্বাগতম — H & H Homes গ্রাহক পোর্টাল',
        messageBn: 'আপনার বুকিংকৃত প্লট ও ফ্ল্যাটের কিস্তির হিসাব এবং অফিশিয়াল মানি রিসিট এখান থেকে ডাউনলোড করতে পারবেন।',
        isRead: 0,
      },
    ],
    gallery: [
      {
        id: 1,
        titleBn: 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার — ১৪ তলা আবাসিক ভবন',
        categoryBn: 'ভবন',
        mediaType: 'image',
        visualTheme: 'gallery_3d_twin_night',
        captionBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকায় নির্মিতব্য আধুনিক ১৪ তলা লাক্সারি অ্যাপার্টমেন্ট ভবন।',
        durationBn: '',
        publishedOnWeb: 1,
      },
      {
        id: 2,
        titleBn: 'এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ — প্রস্তুত আবাসিক প্লট',
        categoryBn: 'বসুন্ধরা জমি',
        mediaType: 'image',
        visualTheme: 'prop_3d_lakeview_plot_b',
        captionBn: 'বসুন্ধরা আবাসিক এলাকায় ৪০ ফুট প্রশস্ত পাকা রাস্তা ও সীমানা প্রাচীরসহ নিষ্কণ্টক আবাসিক প্লট।',
        durationBn: '',
        publishedOnWeb: 1,
      },
      {
        id: 3,
        titleBn: 'দক্ষিণমুখী কর্নার প্লট ও ডুপ্লেক্স ভিলা ল্যান্ড (বসুন্ধরা)',
        categoryBn: 'বসুন্ধরা জমি',
        mediaType: 'image',
        visualTheme: 'gallery_3d_duplex_villa',
        captionBn: 'বসুন্ধরায় তাৎক্ষণিক বাড়ি নির্মাণের উপযোগী ৫ কাঠা কর্নার প্লট ও ডুপ্লেক্স ভিলা জোন।',
        durationBn: '',
        publishedOnWeb: 1,
      },
      {
        id: 4,
        titleBn: 'এইচ অ্যান্ড এইচ কমার্শিয়াল স্কয়ার — বাণিজ্যিক ভবন',
        categoryBn: 'ভবন',
        mediaType: 'image',
        visualTheme: 'gallery_3d_commercial_atrium',
        captionBn: 'বনশ্রী মেইন অ্যাভিনিউতে আধুনিক গ্লাস ফ্যাসাদ বাণিজ্যিক ভবন ও অফিস স্পেস।',
        durationBn: '',
        publishedOnWeb: 1,
      },
      {
        id: 5,
        titleBn: 'লাক্সারি ফ্ল্যাট ইন্টেরিয়র ও ড্রয়িং-ডাইনিং ভিউ',
        categoryBn: 'ফ্ল্যাট ইন্টেরিয়র',
        mediaType: 'image',
        visualTheme: 'gallery_3d_grand_lobby',
        captionBn: 'প্রাকৃতিক আলো-বাতাসপূর্ণ প্রশস্ত ড্রয়িং, ডাইনিং ও মার্বেল ফ্লোর ফিনিশিং।',
        durationBn: '',
        publishedOnWeb: 1,
      },
    ],
    testimonials: [
      {
        id: 1,
        customerNameBn: 'প্রকৌশলী মোঃ মোস্তাফিজুর রহমান',
        roleOrProfessionBn: 'সিনিয়র সফটওয়্যার আর্কিটেক্ট',
        projectNameBn: 'এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ',
        propertyUnitBn: 'ব্লক-আই, প্লট-০৮ (৫ কাঠা দক্ষিণমুখী, বসুন্ধরা)',
        reviewBn:
          'বসুন্ধরায় H & H Homes-এর নিষ্কণ্টক প্লট এবং সহজ কিস্তি সুবিধা দেখে আমি ৫ কাঠার একটি প্লট বুকিং করি। প্রতিটি কিস্তির মানি রিসিট আমি অনলাইনে সাথে সাথে পেয়েছি।',
        rating: 5,
        isVideoReview: 1,
        videoDurationBn: '০২:৪৫ মিনিট',
        videoTheme: 'cust_video_nrb_uk',
        approved: 1,
      },
      {
        id: 2,
        customerNameBn: 'ডা. নুসরাত জাহান ও ডা. মাহবুব আলম',
        roleOrProfessionBn: 'বিশেষজ্ঞ চিকিৎসক দম্পতি, ঢাকা',
        projectNameBn: 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার',
        propertyUnitBn: 'ফ্ল্যাট-৭বি (২২৫০ বর্গফুট)',
        reviewBn:
          'বনশ্রীর রোড ৪, ব্লক সি-তে তাদের প্রজেক্টের ফ্লোর প্ল্যান, ক্রস-ভেন্টিলেশন এবং নির্মাণ কাজের গুণগত মান আমাদের মুগ্ধ করেছে।',
        rating: 5,
        isVideoReview: 1,
        videoDurationBn: '০৩:১৫ মিনিট',
        videoTheme: 'cust_video_doctor_couple',
        approved: 1,
      },
    ],
    articles: [
      {
        id: 1,
        slug: 'land-investment-guide-bangladesh',
        titleBn: 'বসুন্ধরায় আবাসিক প্লট ও বনশ্রীতে ফ্ল্যাট ক্রয়ের সুবিধা',
        categoryBn: 'প্রপার্টি আপডেট',
        publishedDateBn: 'নভেম্বর ২০২৬',
        summaryBn: 'বসুন্ধরা আবাসিক এলাকায় রেডি প্লট এবং বনশ্রীতে আধুনিক অ্যাপার্টমেন্ট প্রজেক্টের সর্বশেষ তথ্য।',
        contentBn:
          'H & H Homes বসুন্ধরা আবাসিক এলাকায় নিষ্কণ্টক প্লট এবং বনশ্রীর রোড ৪, ব্লক সি-তে আধুনিক আবাসিক ভবন নির্মাণ করছে।',
        visualTheme: 'guide_land',
      },
    ],
  };
}

function loadState(): StandaloneDbState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage read errors
  }
  const initial = getInitialSeedState();
  saveState(initial);
  return initial;
}

function saveState(state: StandaloneDbState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage write errors
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleStandaloneApiRequest(urlObj: URL, init?: RequestInit): Promise<Response> {
  const path = urlObj.pathname;
  const method = (init?.method || 'GET').toUpperCase();
  let body: any = {};
  if (init?.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = {};
    }
  }

  const state = loadState();

  // 1. GET /api/bootstrap
  if (path === '/api/bootstrap' && method === 'GET') {
    return jsonResponse({
      settings: state.settings,
      heroSlides: state.heroSlides.filter((s) => s.publishedOnWeb === 1),
      boardMembers: state.boardMembers.filter((b) => b.publishedOnWeb === 1),
      projects: state.projects.filter((p) => p.publishedOnWeb === 1),
      properties: state.properties.filter((p) => p.publishedOnWeb === 1),
      gallery: state.gallery.filter((g) => g.publishedOnWeb === 1),
      testimonials: state.testimonials.filter((t) => t.approved === 1),
      articles: state.articles,
    });
  }

  // 2. POST /api/customer/login
  if (path === '/api/customer/login' && method === 'POST') {
    const rawId = String(body.identifier || '').trim();
    const password = String(body.password || '');
    const cleanPhone = toEnglishDigits(rawId).replace(/[\s\-+]/g, '');
    const cleanEmail = rawId.toLowerCase();

    const matched = state.users.find((u) => {
      const uPhone = toEnglishDigits(u.phone || '').replace(/[\s\-+]/g, '');
      const uEmail = (u.email || '').toLowerCase();
      return uPhone === cleanPhone || uEmail === cleanEmail || u.uid === rawId;
    });

    if (!matched) {
      return jsonResponse(
        { error: 'এই মোবাইল নম্বর বা ইমেইলে কোনো গ্রাহক অ্যাকাউন্ট পাওয়া যায়নি। নতুন অ্যাকাউন্ট খুলতে সাইন আপ করুন।' },
        401
      );
    }
    if ((matched.passwordHash || '') !== password) {
      return jsonResponse({ error: 'পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' }, 401);
    }
    return jsonResponse({ customer: matched });
  }

  // 3. POST /api/customer/register
  if (path === '/api/customer/register' && method === 'POST') {
    const validation = validateCustomerSignup({
      name: String(body.name || ''),
      phone: String(body.phone || ''),
      email: String(body.email || ''),
      password: String(body.password || ''),
      confirmPassword:
        typeof body.confirmPassword === 'string' ? body.confirmPassword : String(body.password || ''),
    });
    if (!validation.valid) {
      return jsonResponse({ error: validation.errorBn }, 400);
    }

    const cleanPhone = toEnglishDigits(String(body.phone)).replace(/[\s\-+]/g, '');
    const cleanEmail = String(body.email).trim().toLowerCase();
    const exists = state.users.some(
      (u) => toEnglishDigits(u.phone || '').replace(/[\s\-+]/g, '') === cleanPhone || (u.email || '').toLowerCase() === cleanEmail
    );
    if (exists) {
      return jsonResponse(
        { error: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি গ্রাহক অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে লগইন করুন।' },
        400
      );
    }

    const newUser = {
      id: state.users.length + 1,
      uid: `cust-${Date.now()}`,
      name: String(body.name).trim(),
      phone: cleanPhone,
      email: cleanEmail,
      passwordHash: String(body.password),
      nidNumber: String(body.nidNumber || '').trim(),
      addressBn: String(body.addressBn || '').trim(),
      role: 'customer',
    };
    state.users.push(newUser);
    saveState(state);
    return jsonResponse({ customer: newUser }, 201);
  }

  // 4. GET /api/portal
  if (path === '/api/portal' && method === 'GET') {
    const uid = urlObj.searchParams.get('uid') || 'demo-customer';
    return jsonResponse({
      bookings: state.bookings.filter((b) => b.userUid === uid || b.userUid === 'demo-customer'),
      payments: state.payments.filter((p) => p.userUid === uid || p.userUid === 'demo-customer'),
      properties: state.properties,
      projects: state.projects,
      complaints: state.complaints.filter((c) => c.userUid === uid || c.userUid === 'demo-customer'),
      notifications: state.notifications.filter((n) => n.userUid === uid || n.userUid === 'demo-customer'),
    });
  }

  // 5. POST /api/portal/pay
  if (path === '/api/portal/pay' && method === 'POST') {
    const paymentId = Number(body.paymentId);
    const paymentMethodBn = String(body.paymentMethodBn || 'ব্যাংক ট্রান্সফার / অনলাইন পেমেন্ট');
    const payment = state.payments.find((p) => p.id === paymentId);
    if (!payment) {
      return jsonResponse({ error: 'কিস্তির তথ্য পাওয়া যায়নি।' }, 400);
    }
    const today = new Date().toISOString().split('T')[0];
    payment.statusBn = 'পরিশোধিত';
    payment.paidDate = today;
    payment.paymentMethodBn = paymentMethodBn;

    const booking = state.bookings.find((b) => b.id === payment.bookingId);
    if (booking) {
      booking.paidAmountBdt = Number(booking.paidAmountBdt || 0) + Number(payment.amountBdt);
      booking.dueAmountBdt = Math.max(0, Number(booking.totalPriceBdt) - booking.paidAmountBdt);
      state.erpTransactions.unshift({
        id: state.erpTransactions.length + 1,
        voucherNo: generateVoucherNumber(1050 + state.erpTransactions.length, 2026),
        transactionDate: today,
        type: 'income',
        categoryBn: 'কিস্তি আদায় (কাস্টমার পোর্টাল)',
        projectId: 1,
        projectNameBn: `বুকিং ${booking.bookingNumber}`,
        titleBn: `${payment.titleBn} আদায় — রিসিট ${payment.receiptNumber} (${booking.customerName})`,
        amountBdt: payment.amountBdt,
        paymentMethodBn,
        referenceNo: payment.receiptNumber,
        recordedByBn: 'কাস্টমার পোর্টাল অটো-ভাউচার',
        notesBn: 'গ্রাহক পোর্টালের মাধ্যমে অনলাইনে পরিশোধিত।',
      });
    }
    saveState(state);
    return jsonResponse({ payment });
  }

  // 6. POST /api/portal/complaints
  if (path === '/api/portal/complaints' && method === 'POST') {
    const complaint = {
      id: state.complaints.length + 1,
      userUid: String(body.userUid || 'demo-customer'),
      customerName: String(body.customerName || 'সম্মানিত গ্রাহক'),
      subjectBn: String(body.subjectBn || '').trim(),
      messageBn: String(body.messageBn || '').trim(),
      statusBn: 'প্রক্রিয়াধীন',
      resolutionBn: '',
    };
    state.complaints.unshift(complaint);
    saveState(state);
    return jsonResponse({ complaint }, 201);
  }

  // 7. POST /api/bookings
  if (path === '/api/bookings' && method === 'POST') {
    const validation = validateBookingApplication({
      customerName: String(body.customerName || ''),
      customerPhone: String(body.customerPhone || ''),
      customerEmail: String(body.customerEmail || ''),
      nidNumber: String(body.nidNumber || ''),
      addressBn: String(body.addressBn || ''),
    });
    if (!validation.valid) {
      return jsonResponse({ error: validation.errorBn }, 400);
    }

    const prop = state.properties.find((p) => p.id === Number(body.propertyId));
    if (!prop) {
      return jsonResponse({ error: 'প্রপার্টি খুঁজে পাওয়া যায়নি।' }, 400);
    }
    if (!canBookProperty(prop.statusBn)) {
      return jsonResponse({ error: 'দুঃখিত, এই প্রপার্টিটি ইতিমধ্যে সংরক্ষিত বা বিক্রিত হয়েছে।' }, 400);
    }

    const bookingNumber = generateBookingNumber(state.bookings.length + 105, 2026);
    const plan = calculateInstallmentPlan(
      prop.priceBdt,
      prop.bookingAmountBdt,
      String(body.paymentPlanChoice || '৩৬ মাসিক কিস্তি')
    );
    const today = new Date().toISOString().split('T')[0];

    const newBooking = {
      id: state.bookings.length + 1,
      bookingNumber,
      propertyId: prop.id,
      userUid: String(body.userUid || 'demo-customer'),
      customerName: String(body.customerName).trim(),
      customerPhone: String(body.customerPhone).trim(),
      customerEmail: String(body.customerEmail).trim(),
      nidNumber: String(body.nidNumber).trim(),
      addressBn: String(body.addressBn).trim(),
      paymentPlanChoice: String(body.paymentPlanChoice || '৩৬ মাসিক কিস্তি'),
      totalPriceBdt: prop.priceBdt,
      bookingMoneyBdt: prop.bookingAmountBdt,
      paidAmountBdt: prop.bookingAmountBdt,
      dueAmountBdt: Math.max(0, prop.priceBdt - prop.bookingAmountBdt),
      nextInstallmentDate: '2026-12-15',
      statusBn: 'অনুমোদনের অপেক্ষায়',
      notesBn: String(body.notesBn || ''),
    };

    prop.statusBn = 'সংরক্ষিত';
    state.bookings.unshift(newBooking);

    const receiptSeed = state.payments.length + 110;
    state.payments.push(
      {
        id: state.payments.length + 1,
        receiptNumber: generateReceiptNumber(receiptSeed, 2026),
        bookingId: newBooking.id,
        userUid: newBooking.userUid,
        installmentNo: 0,
        titleBn: `বুকিং মানি জমা — ${prop.titleBn}`,
        amountBdt: prop.bookingAmountBdt,
        dueDate: today,
        paidDate: today,
        paymentMethodBn: 'ব্যাংক ট্রান্সফার / পে-অর্ডার',
        statusBn: 'পরিশোধিত',
      },
      {
        id: state.payments.length + 2,
        receiptNumber: generateReceiptNumber(receiptSeed + 1, 2026),
        bookingId: newBooking.id,
        userUid: newBooking.userUid,
        installmentNo: 1,
        titleBn: '১ম মাসিক কিস্তি',
        amountBdt: plan.monthlyInstallmentBdt,
        dueDate: '2026-12-15',
        paidDate: '',
        paymentMethodBn: 'ব্যাংক ট্রান্সফার',
        statusBn: 'বকেয়া',
      }
    );

    saveState(state);
    return jsonResponse({ booking: newBooking }, 201);
  }

  // 8. POST /api/inquiries
  if (path === '/api/inquiries' && method === 'POST') {
    const inquiry = {
      id: state.inquiries.length + 1,
      name: String(body.name || '').trim(),
      phone: String(body.phone || '').trim(),
      email: String(body.email || '').trim(),
      propertyCategoryBn: String(body.propertyCategoryBn || 'সাধারণ জিজ্ঞাসা'),
      propertyId: Number(body.propertyId || 0),
      message: String(body.message || '').trim(),
      statusBn: 'নতুন',
    };
    state.inquiries.unshift(inquiry);
    saveState(state);
    return jsonResponse({ inquiry }, 201);
  }

  // 9. POST /api/testimonials
  if (path === '/api/testimonials' && method === 'POST') {
    const testimonial = {
      id: state.testimonials.length + 1,
      customerNameBn: String(body.customerNameBn || '').trim(),
      roleOrProfessionBn: String(body.roleOrProfessionBn || 'সম্মানিত গ্রাহক').trim(),
      projectNameBn: String(body.projectNameBn || '').trim(),
      propertyUnitBn: String(body.propertyUnitBn || 'বরাদ্দকৃত ইউনিট').trim(),
      reviewBn: String(body.reviewBn || '').trim(),
      rating: Number(body.rating || 5),
      isVideoReview: 0,
      videoDurationBn: '',
      videoTheme: 'cust_video_nrb_uk',
      approved: 1,
    };
    state.testimonials.unshift(testimonial);
    saveState(state);
    return jsonResponse({ testimonial }, 201);
  }

  // 10. GET /api/admin/erp
  if (path === '/api/admin/erp' && method === 'GET') {
    return jsonResponse({
      settings: state.settings,
      heroSlides: state.heroSlides,
      boardMembers: state.boardMembers,
      projects: state.projects,
      properties: state.properties,
      bookings: state.bookings,
      payments: state.payments,
      erpTransactions: state.erpTransactions,
      inquiries: state.inquiries,
      complaints: state.complaints,
      gallery: state.gallery,
      testimonials: state.testimonials,
      articles: state.articles,
      customers: state.users,
    });
  }

  // 11. POST /api/admin/toggle-web
  if (path === '/api/admin/toggle-web' && method === 'POST') {
    const { entity, id, publishedOnWeb } = body;
    const val = Number(publishedOnWeb) ? 1 : 0;
    const listMap: Record<string, any[]> = {
      project: state.projects,
      property: state.properties,
      board: state.boardMembers,
      slide: state.heroSlides,
      gallery: state.gallery,
    };
    const list = listMap[entity];
    if (list) {
      const target = list.find((item) => item.id === Number(id));
      if (target) target.publishedOnWeb = val;
      saveState(state);
    }
    return jsonResponse({ ok: true, publishedOnWeb: val });
  }

  // 12. POST /api/admin/erp/transactions
  if (path === '/api/admin/erp/transactions' && method === 'POST') {
    const tx = {
      id: state.erpTransactions.length + 1,
      voucherNo: generateVoucherNumber(1010 + state.erpTransactions.length, 2026),
      transactionDate: String(body.transactionDate || new Date().toISOString().split('T')[0]),
      type: body.type === 'expense' ? 'expense' : 'income',
      categoryBn: String(body.categoryBn || 'সাধারণ হিসাব'),
      projectId: Number(body.projectId || 0),
      projectNameBn: String(body.projectNameBn || 'সাধারণ কর্পোরেট হিসাব'),
      titleBn: String(body.titleBn || ''),
      amountBdt: Number(body.amountBdt || 0),
      paymentMethodBn: String(body.paymentMethodBn || 'ব্যাংক ট্রান্সফার'),
      referenceNo: String(body.referenceNo || ''),
      recordedByBn: String(body.recordedByBn || 'প্রধান হিসাবরক্ষক'),
      notesBn: String(body.notesBn || ''),
    };
    state.erpTransactions.unshift(tx);
    saveState(state);
    return jsonResponse({ transaction: tx }, 201);
  }

  // 13. POST /api/admin/payments/receipt
  if (path === '/api/admin/payments/receipt' && method === 'POST') {
    const receiptNumber = generateReceiptNumber(200 + state.payments.length, 2026);
    const today = String(body.paidDate || new Date().toISOString().split('T')[0]);
    const bookingRow =
      state.bookings.find((b) => b.id === Number(body.bookingId)) || state.bookings[0] || null;

    const newPayment = {
      id: state.payments.length + 1,
      receiptNumber,
      bookingId: bookingRow ? bookingRow.id : 1,
      userUid: bookingRow ? bookingRow.userUid : 'demo-customer',
      installmentNo: state.payments.length + 1,
      titleBn: String(body.titleBn || '').trim(),
      amountBdt: Number(body.amountBdt || 0),
      dueDate: today,
      paidDate: today,
      paymentMethodBn: String(body.paymentMethodBn || 'ব্যাংক ট্রান্সফার / পে-অর্ডার'),
      statusBn: 'পরিশোধিত',
    };
    state.payments.unshift(newPayment);

    if (bookingRow) {
      bookingRow.paidAmountBdt = Number(bookingRow.paidAmountBdt || 0) + newPayment.amountBdt;
      bookingRow.dueAmountBdt = Math.max(0, Number(bookingRow.totalPriceBdt || 0) - bookingRow.paidAmountBdt);
    }

    state.erpTransactions.unshift({
      id: state.erpTransactions.length + 1,
      voucherNo: generateVoucherNumber(1100 + state.erpTransactions.length, 2026),
      transactionDate: today,
      type: 'income',
      categoryBn: 'কিস্তি ও বুকিং আদায় (মানি রিসিট)',
      projectId: 1,
      projectNameBn: bookingRow ? `বুকিং ${bookingRow.bookingNumber}` : 'সরাসরি মানি রিসিট',
      titleBn: `${newPayment.titleBn} — রিসিট ${receiptNumber}`,
      amountBdt: newPayment.amountBdt,
      paymentMethodBn: newPayment.paymentMethodBn,
      referenceNo: receiptNumber,
      recordedByBn: 'হিসাব ও ক্যাশ বিভাগ',
      notesBn: 'অ্যাডমিন প্যানেল থেকে অফিশিয়াল মানি রিসিট ইস্যু করা হয়েছে।',
    });

    saveState(state);
    return jsonResponse({ payment: newPayment }, 201);
  }

  // 14. POST /api/admin/bookings/:id/decision
  const bookingDecisionMatch = path.match(/^\/api\/admin\/bookings\/(\d+)\/decision$/);
  if (bookingDecisionMatch && method === 'POST') {
    const id = Number(bookingDecisionMatch[1]);
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) return jsonResponse({ error: 'বুকিং খুঁজে পাওয়া যায়নি।' }, 404);

    const prop = state.properties.find((p) => p.id === booking.propertyId);
    if (body.action === 'cancel') {
      booking.statusBn = 'বাতিল';
      if (prop) prop.statusBn = 'বুকিং চলছে';
    } else {
      booking.statusBn = 'অনুমোদিত';
      if (prop) prop.statusBn = 'বিক্রিত';
    }
    saveState(state);
    return jsonResponse({ booking });
  }

  // 15. PUT /api/admin/settings
  if (path === '/api/admin/settings' && method === 'PUT') {
    state.settings = { ...state.settings, ...body };
    saveState(state);
    return jsonResponse({ settings: state.settings });
  }

  // 16. POST & PUT /api/admin/projects
  if (path === '/api/admin/projects' && method === 'POST') {
    const newProj = {
      id: state.projects.length + 1,
      slug: `hh-project-${Date.now()}`,
      nameBn: String(body.nameBn || '').trim(),
      nameEn: String(body.nameEn || body.nameBn || '').trim(),
      categoryBn: String(body.categoryBn || 'আবাসিক জমি'),
      statusBn: String(body.statusBn || 'চলমান'),
      areaBn: String(body.areaBn || 'বনশ্রী, ঢাকা'),
      locationBn: String(body.locationBn || '').trim(),
      sizeSummaryBn: String(body.sizeSummaryBn || '৩ ও ৫ কাঠা'),
      priceSummaryBn: String(body.priceSummaryBn || 'আলোচনা সাপেক্ষে'),
      availabilityBn: String(body.availabilityBn || 'বুকিং চলছে'),
      descriptionBn: String(body.descriptionBn || ''),
      specificationsJson: JSON.stringify([
        { label: 'প্রকল্পের ধরন', value: String(body.categoryBn || 'আবাসিক প্রকল্প') },
        { label: 'অবস্থান', value: String(body.locationBn || '') },
      ]),
      lat: String(body.lat || '23.7619'),
      lng: String(body.lng || '90.4315'),
      imageType: String(body.imageType || 'project_3d_twin_towers'),
      featured: 1,
      publishedOnWeb: body.publishedOnWeb === 0 ? 0 : 1,
      totalBudgetBdt: Number(body.totalBudgetBdt || 80000000),
    };
    state.projects.unshift(newProj);
    saveState(state);
    return jsonResponse({ project: newProj }, 201);
  }

  const projectPutMatch = path.match(/^\/api\/admin\/projects\/(\d+)$/);
  if (projectPutMatch && method === 'PUT') {
    const id = Number(projectPutMatch[1]);
    const proj = state.projects.find((p) => p.id === id);
    if (proj) {
      Object.assign(proj, body);
      saveState(state);
    }
    return jsonResponse({ project: proj });
  }

  // 17. POST & PUT /api/admin/properties
  if (path === '/api/admin/properties' && method === 'POST') {
    const newProp = {
      id: state.properties.length + 1,
      propertyCode: String(body.propertyCode || `HH-P-${100 + state.properties.length}`),
      projectId: Number(body.projectId || 1),
      titleBn: String(body.titleBn || '').trim(),
      titleEn: String(body.titleBn || '').trim(),
      categoryBn: String(body.categoryBn || 'আবাসিক জমি'),
      propertyType: String(body.propertyType || 'land'),
      areaBn: String(body.areaBn || 'বনশ্রী, ব্লক-সি, ঢাকা'),
      locationBn: String(body.locationBn || 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা'),
      blockNo: String(body.blockNo || 'ব্লক-সি'),
      plotNo: String(body.plotNo || 'প্লট-০১'),
      sizeBn: String(body.sizeBn || '৫ কাঠা'),
      bedrooms: Number(body.bedrooms || 0),
      bathrooms: Number(body.bathrooms || 0),
      sqft: Number(body.sqft || 3600),
      priceBdt: Number(body.priceBdt || 4500000),
      priceDisplayBn: String(body.priceDisplayBn || `৳ ${Number(body.priceBdt || 0).toLocaleString('en-IN')}`),
      bookingAmountBdt: Number(body.bookingAmountBdt || 500000),
      bookingDisplayBn: String(body.bookingDisplayBn || '৳ ৫ লক্ষ'),
      paymentPlanBn: String(body.paymentPlanBn || 'এককালীন ও ৩৬ মাসের কিস্তি'),
      statusBn: 'বুকিং চলছে',
      descriptionBn: String(body.descriptionBn || ''),
      floorPlanSpecs: String(body.floorPlanSpecs || ''),
      lat: '23.7619',
      lng: '90.4315',
      imageType: String(body.imageType || 'prop_3d_villa_plot_a'),
      publishedOnWeb: body.publishedOnWeb === 0 ? 0 : 1,
    };
    state.properties.unshift(newProp);
    saveState(state);
    return jsonResponse({ property: newProp }, 201);
  }

  const propPutMatch = path.match(/^\/api\/admin\/properties\/(\d+)$/);
  if (propPutMatch && method === 'PUT') {
    const id = Number(propPutMatch[1]);
    const prop = state.properties.find((p) => p.id === id);
    if (prop) {
      Object.assign(prop, body);
      saveState(state);
    }
    return jsonResponse({ property: prop });
  }

  // 18. Board, Slides, Gallery, Articles
  if (path === '/api/admin/board' && method === 'POST') {
    const member = {
      id: state.boardMembers.length + 1,
      ...body,
      publishedOnWeb: body.publishedOnWeb === 0 ? 0 : 1,
    };
    state.boardMembers.push(member);
    saveState(state);
    return jsonResponse({ member }, 201);
  }

  if (path === '/api/admin/slides' && method === 'POST') {
    const slide = {
      id: state.heroSlides.length + 1,
      ...body,
      publishedOnWeb: 1,
    };
    state.heroSlides.push(slide);
    saveState(state);
    return jsonResponse({ slide }, 201);
  }

  if (path === '/api/admin/gallery' && method === 'POST') {
    const item = {
      id: state.gallery.length + 1,
      ...body,
      publishedOnWeb: 1,
    };
    state.gallery.unshift(item);
    saveState(state);
    return jsonResponse({ item }, 201);
  }

  if (path === '/api/admin/articles' && method === 'POST') {
    const article = {
      id: state.articles.length + 1,
      slug: `article-${Date.now()}`,
      ...body,
      publishedDateBn: 'নভেম্বর ২০২৬',
      visualTheme: 'guide_land',
    };
    state.articles.unshift(article);
    saveState(state);
    return jsonResponse({ article }, 201);
  }

  return jsonResponse({ ok: true });
}

/**
 * Installs a transparent fetch wrapper so that when the app is deployed
 * to static hosts like Cloudflare Pages / Workers (https://h-h.najihabd.com/)
 * where the Express / PostgreSQL server is not running, all `/api/*` requests
 * automatically fall back to the persistent localStorage database.
 */
export function installCloudflareApiFallback() {
  if (typeof window === 'undefined') return;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    let urlObj: URL | null = null;
    try {
      urlObj = new URL(urlStr, window.location.origin);
    } catch {
      urlObj = null;
    }

    if (urlObj && urlObj.origin === window.location.origin && urlObj.pathname.startsWith('/api/')) {
      try {
        const response = await originalFetch(input, init);
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          return response;
        }
        // If server returned 4xx/5xx with valid JSON error from our Express backend, pass it through
        if (contentType.includes('application/json')) {
          return response;
        }
      } catch {
        // Network error — fall through to standalone handler
      }
      return handleStandaloneApiRequest(urlObj, init);
    }

    return originalFetch(input, init);
  };
}
