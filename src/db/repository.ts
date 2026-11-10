import { db } from './index.ts';
import {
  users,
  siteSettings,
  heroSlides,
  boardMembers,
  projects,
  properties,
  bookings,
  payments,
  erpTransactions,
  inquiries,
  complaints,
  notifications,
  galleryItems,
  testimonials,
  articles,
} from './schema.ts';
import { eq, desc, or } from 'drizzle-orm';
import {
  canBookProperty,
  generateBookingNumber,
  generateReceiptNumber,
  generateVoucherNumber,
  calculateInstallmentPlan,
  toEnglishDigits,
} from '../utils/bengaliLogic.ts';

let seedCompleted = false;

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  try {
    const adminEmails = ['info@hhhomesbd.com', 'admin@hhhomesbd.com'];
    const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'customer';

    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || email.split('@')[0] || 'গ্রাহক',
        role,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('ব্যবহারকারীর তথ্য সংরক্ষণে সমস্যা হয়েছে।', { cause: error });
  }
}

export async function registerCustomerAccount(input: {
  name: string;
  phone: string;
  email: string;
  password: string;
  nidNumber?: string;
  addressBn?: string;
}) {
  try {
    const cleanPhone = toEnglishDigits(input.phone).replace(/[\s\-+]/g, '');
    const cleanEmail = input.email.trim().toLowerCase();

    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, cleanEmail), eq(users.phone, cleanPhone)));

    if (existing.length > 0) {
      throw new Error('এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি গ্রাহক অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে লগইন করুন।');
    }

    const uid = `cust-${Date.now()}-${Math.floor(100 + Math.random() * 899)}`;
    const inserted = await db
      .insert(users)
      .values({
        uid,
        name: input.name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash: input.password,
        nidNumber: (input.nidNumber || '').trim(),
        addressBn: (input.addressBn || '').trim(),
        role: 'customer',
      })
      .returning();

    const u = inserted[0];
    return {
      id: u.id,
      uid: u.uid,
      name: u.name || 'গ্রাহক',
      phone: u.phone || '',
      email: u.email,
      nidNumber: u.nidNumber || '',
      addressBn: u.addressBn || '',
      role: u.role,
    };
  } catch (error: any) {
    console.error('Error in registerCustomerAccount:', error);
    throw new Error(error.message || 'গ্রাহক রেজিস্ট্রেশনে সমস্যা হয়েছে।', { cause: error });
  }
}

export async function loginCustomerWithPassword(input: { identifier: string; password: string }) {
  try {
    await ensureSeeded();
    const rawId = input.identifier.trim();
    const cleanPhone = toEnglishDigits(rawId).replace(/[\s\-+]/g, '');
    const cleanEmail = rawId.toLowerCase();

    const allUsers = await db.select().from(users);
    const matched = allUsers.find((u) => {
      const uPhone = toEnglishDigits(u.phone || '').replace(/[\s\-+]/g, '');
      const uEmail = (u.email || '').toLowerCase();
      return uPhone === cleanPhone || uEmail === cleanEmail || u.uid === rawId;
    });

    if (!matched) {
      throw new Error('এই মোবাইল নম্বর বা ইমেইলে কোনো গ্রাহক অ্যাকাউন্ট পাওয়া যায়নি। নতুন অ্যাকাউন্ট খুলতে সাইন আপ করুন।');
    }

    if ((matched.passwordHash || '') !== input.password) {
      throw new Error('পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।');
    }

    return {
      id: matched.id,
      uid: matched.uid,
      name: matched.name || 'গ্রাহক',
      phone: matched.phone || '',
      email: matched.email,
      nidNumber: matched.nidNumber || '',
      addressBn: matched.addressBn || '',
      role: matched.role,
    };
  } catch (error: any) {
    console.error('Error in loginCustomerWithPassword:', error);
    throw new Error(error.message || 'লগইন করতে সমস্যা হয়েছে।', { cause: error });
  }
}

export async function ensureSeeded() {
  if (seedCompleted) return;
  try {
    const existingSettings = await db.select().from(siteSettings);
    const checkProjects = await db.select().from(projects);
    const checkPayments = await db.select().from(payments);
    const hasOldBrandInProjects = checkProjects.some(
      (p) => p.nameBn.includes('নাজিহা') || (p.nameEn || '').toLowerCase().includes('naziha')
    );
    const landProjectNeedsBashundhara = checkProjects.some(
      (p) => p.categoryBn.includes('জমি') && !p.areaBn.includes('বসুন্ধরা')
    );
    const needsRebrand =
      hasOldBrandInProjects ||
      landProjectNeedsBashundhara ||
      checkPayments.length === 0 ||
      (existingSettings.length > 0 &&
        (existingSettings[0].companyNameBn !== 'H & H Homes' ||
          existingSettings[0].officeAddressBn !== 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।'));

    if (needsRebrand) {
      const safeClear = async (table: any) => {
        try {
          await db.delete(table);
        } catch (e) {
          console.warn('Warning clearing table during rebrand:', e);
        }
      };
      await safeClear(payments);
      await safeClear(bookings);
      await safeClear(properties);
      await safeClear(projects);
      await safeClear(heroSlides);
      await safeClear(boardMembers);
      await safeClear(galleryItems);
      await safeClear(testimonials);
      await safeClear(erpTransactions);
      await safeClear(articles);
      await safeClear(siteSettings);
    }

    // 1. Seed Demo Customer Account with Password for instant testing + real signup
    const existingDemoUser = await db.select().from(users).where(eq(users.uid, 'demo-customer'));
    if (existingDemoUser.length === 0) {
      await db.insert(users).values({
        uid: 'demo-customer',
        name: 'আলহাজ্ব আরিফুর রহমান',
        phone: '01711223344',
        email: 'customer@hhhomesbd.com',
        passwordHash: '123456',
        nidNumber: '1992123456789',
        addressBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।',
        role: 'customer',
      });
    } else if (needsRebrand) {
      await db
        .update(users)
        .set({
          email: 'customer@hhhomesbd.com',
          addressBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা।',
        })
        .where(eq(users.uid, 'demo-customer'));
    }

    // 2. Seed Site Settings
    const currentSettings = await db.select().from(siteSettings);
    if (currentSettings.length === 0) {
      await db.insert(siteSettings).values({
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
      });
    }

    // 3. Seed Hero Carousel Slides (Only Project Name & Photo for Banner)
    const existingSlides = await db.select().from(heroSlides);
    if (existingSlides.length === 0) {
      await db.insert(heroSlides).values([
        {
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
      ]);
    }

    // 4. Seed Board of Directors
    const existingBoard = await db.select().from(boardMembers);
    if (existingBoard.length === 0) {
      await db.insert(boardMembers).values([
        {
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
      ]);
    }

    // 5. Seed Projects (Land in Bashundhara, Buildings in Banasree)
    const existingProjects = await db.select().from(projects);
    let insertedProjects = existingProjects;
    if (existingProjects.length === 0) {
      insertedProjects = await db
        .insert(projects)
        .values([
          {
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
        ])
        .returning();
    }

    // 6. Seed Properties (Land Plots in Bashundhara & Apartment Buildings in Banasree)
    const existingProps = await db.select().from(properties);
    let insertedProperties = existingProps;
    if (existingProps.length === 0 && insertedProjects.length >= 2) {
      const p1 = insertedProjects[0].id;
      const p2 = insertedProjects[1].id;
      const p4 = insertedProjects[3]?.id || p2;

      insertedProperties = await db
        .insert(properties)
        .values([
          {
            propertyCode: 'HH-L-101',
            projectId: p1,
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
            propertyCode: 'HH-L-102',
            projectId: p1,
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
            propertyCode: 'HH-L-103',
            projectId: p1,
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
            propertyCode: 'HH-A-201',
            projectId: p2,
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
            propertyCode: 'HH-A-202',
            projectId: p2,
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
            propertyCode: 'HH-A-203',
            projectId: p4,
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
        ])
        .returning();
    }

    // 6B. Seed Demo Bookings & Verified Money Receipts so receipts work out-of-the-box
    const existingBookingsList = await db.select().from(bookings);
    if (existingBookingsList.length === 0 && insertedProperties.length >= 2) {
      const landProp = insertedProperties[0];
      const flatProp = insertedProperties[3] || insertedProperties[1];

      const insertedDemoBookings = await db
        .insert(bookings)
        .values([
          {
            bookingNumber: 'HH-BK-2026-0101',
            propertyId: landProp.id,
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
            bookingNumber: 'HH-BK-2026-0102',
            propertyId: flatProp.id,
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
        ])
        .returning();

      const bk1 = insertedDemoBookings[0];
      const bk2 = insertedDemoBookings[1];

      await db.insert(payments).values([
        {
          receiptNumber: 'HH-MR-2026-0101',
          bookingId: bk1.id,
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
          receiptNumber: 'HH-MR-2026-0102',
          bookingId: bk1.id,
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
          receiptNumber: 'HH-MR-2026-0103',
          bookingId: bk1.id,
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
          receiptNumber: 'HH-MR-2026-0104',
          bookingId: bk2.id,
          userUid: 'demo-customer',
          installmentNo: 0,
          titleBn: 'বুকিং মানি — সিগনেচার টাওয়ার (ফ্ল্যাট-৪এ)',
          amountBdt: 1500000,
          dueDate: '2026-10-12',
          paidDate: '2026-10-12',
          paymentMethodBn: 'আরটিজিএস (RTGS) ব্যাংক ট্রান্সফার',
          statusBn: 'পরিশোধিত',
        },
      ]);
    }

    // 7. Seed Photo Gallery (For Separate Gallery Page)
    const existingGallery = await db.select().from(galleryItems);
    if (existingGallery.length === 0) {
      await db.insert(galleryItems).values([
        {
          titleBn: 'এইচ অ্যান্ড এইচ সিগনেচার টাওয়ার — ১৪ তলা আবাসিক ভবন',
          categoryBn: 'ভবন',
          mediaType: 'image',
          visualTheme: 'gallery_3d_twin_night',
          captionBn: 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকায় নির্মিতব্য আধুনিক ১৪ তলা লাক্সারি অ্যাপার্টমেন্ট ভবন।',
          durationBn: '',
          publishedOnWeb: 1,
        },
        {
          titleBn: 'এইচ অ্যান্ড এইচ বসুন্ধরা গ্রিন টাউনশিপ — প্রস্তুত আবাসিক প্লট',
          categoryBn: 'বসুন্ধরা জমি',
          mediaType: 'image',
          visualTheme: 'prop_3d_lakeview_plot_b',
          captionBn: 'বসুন্ধরা আবাসিক এলাকায় ৪০ ফুট প্রশস্ত পাকা রাস্তা ও সীমানা প্রাচীরসহ নিষ্কণ্টক আবাসিক প্লট।',
          durationBn: '',
          publishedOnWeb: 1,
        },
        {
          titleBn: 'দক্ষিণমুখী কর্নার প্লট ও ডুপ্লেক্স ভিলা ল্যান্ড (বসুন্ধরা)',
          categoryBn: 'বসুন্ধরা জমি',
          mediaType: 'image',
          visualTheme: 'gallery_3d_duplex_villa',
          captionBn: 'বসুন্ধরায় তাৎক্ষণিক বাড়ি নির্মাণের উপযোগী ৫ কাঠা কর্নার প্লট ও ডুপ্লেক্স ভিলা জোন।',
          durationBn: '',
          publishedOnWeb: 1,
        },
        {
          titleBn: 'এইচ অ্যান্ড এইচ কমার্শিয়াল স্কয়ার — বাণিজ্যিক ভবন',
          categoryBn: 'ভবন',
          mediaType: 'image',
          visualTheme: 'gallery_3d_commercial_atrium',
          captionBn: 'বনশ্রী মেইন অ্যাভিনিউতে আধুনিক গ্লাস ফ্যাসাদ বাণিজ্যিক ভবন ও অফিস স্পেস।',
          durationBn: '',
          publishedOnWeb: 1,
        },
        {
          titleBn: 'লাক্সারি ফ্ল্যাট ইন্টেরিয়র ও ড্রয়িং-ডাইনিং ভিউ',
          categoryBn: 'ফ্ল্যাট ইন্টেরিয়র',
          mediaType: 'image',
          visualTheme: 'gallery_3d_grand_lobby',
          captionBn: 'প্রাকৃতিক আলো-বাতাসপূর্ণ প্রশস্ত ড্রয়িং, ডাইনিং ও মার্বেল ফ্লোর ফিনিশিং।',
          durationBn: '',
          publishedOnWeb: 1,
        },
      ]);
    }

    // 8. Seed Testimonials
    const existingTestimonials = await db.select().from(testimonials);
    if (existingTestimonials.length === 0) {
      await db.insert(testimonials).values([
        {
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
      ]);
    }

    // 9. Seed ERP Accounting Transactions
    const existingTransactions = await db.select().from(erpTransactions);
    if (existingTransactions.length === 0) {
      await db.insert(erpTransactions).values([
        {
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
      ]);
    }

    // 10. Seed Articles
    const existingArticles = await db.select().from(articles);
    if (existingArticles.length === 0) {
      await db.insert(articles).values([
        {
          slug: 'land-investment-guide-bangladesh',
          titleBn: 'বসুন্ধরায় আবাসিক প্লট ও বনশ্রীতে ফ্ল্যাট ক্রয়ের সুবিধা',
          categoryBn: 'প্রপার্টি আপডেট',
          publishedDateBn: 'নভেম্বর ২০২৬',
          summaryBn: 'বসুন্ধরা আবাসিক এলাকায় রেডি প্লট এবং বনশ্রীতে আধুনিক অ্যাপার্টমেন্ট প্রজেক্টের সর্বশেষ তথ্য।',
          contentBn:
            'H & H Homes বসুন্ধরা আবাসিক এলাকায় নিষ্কণ্টক প্লট এবং বনশ্রীর রোড ৪, ব্লক সি-তে আধুনিক আবাসিক ভবন নির্মাণ করছে।',
          visualTheme: 'guide_land',
        },
      ]);
    }

    seedCompleted = true;
  } catch (error) {
    console.error('Error seeding initial database content:', error);
  }
}

export async function getPublicBootstrapData() {
  try {
    await ensureSeeded();
    const [
      settingsRows,
      slideRows,
      boardRows,
      projectRows,
      propertyRows,
      galleryRows,
      testimonialRows,
      articleRows,
    ] = await Promise.all([
      db.select().from(siteSettings),
      db.select().from(heroSlides).where(eq(heroSlides.publishedOnWeb, 1)).orderBy(heroSlides.displayOrder),
      db.select().from(boardMembers).where(eq(boardMembers.publishedOnWeb, 1)).orderBy(boardMembers.displayOrder),
      db.select().from(projects).where(eq(projects.publishedOnWeb, 1)).orderBy(projects.id),
      db.select().from(properties).where(eq(properties.publishedOnWeb, 1)).orderBy(properties.id),
      db.select().from(galleryItems).where(eq(galleryItems.publishedOnWeb, 1)).orderBy(galleryItems.id),
      db.select().from(testimonials).where(eq(testimonials.approved, 1)).orderBy(testimonials.id),
      db.select().from(articles).orderBy(desc(articles.id)),
    ]);

    return {
      settings: settingsRows[0] || null,
      heroSlides: slideRows,
      boardMembers: boardRows,
      projects: projectRows,
      properties: propertyRows,
      gallery: galleryRows,
      testimonials: testimonialRows,
      articles: articleRows,
    };
  } catch (error) {
    console.error('Database query failed in getPublicBootstrapData:', error);
    throw new Error('ডেটাবেজ থেকে তথ্য লোড করতে সমস্যা হয়েছে।', { cause: error });
  }
}

export async function createBookingRecord(input: {
  propertyId: number;
  userUid: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  nidNumber: string;
  addressBn: string;
  paymentPlanChoice: string;
  notesBn?: string;
}) {
  try {
    const propRows = await db
      .select()
      .from(properties)
      .where(eq(properties.id, input.propertyId));

    if (propRows.length === 0) {
      throw new Error('প্রপার্টি খুঁজে পাওয়া যায়নি।');
    }

    const prop = propRows[0];
    if (!canBookProperty(prop.statusBn)) {
      throw new Error('দুঃখিত, এই প্রপার্টিটি ইতিমধ্যে সংরক্ষিত বা বিক্রিত হয়েছে। ডাবল বুকিং সম্ভব নয়।');
    }

    const existingBookings = await db.select().from(bookings);
    const nextSeq = existingBookings.length + 101 + Math.floor(Math.random() * 800);
    const bookingNumber = generateBookingNumber(nextSeq, 2026);

    const plan = calculateInstallmentPlan(
      prop.priceBdt,
      prop.bookingAmountBdt,
      input.paymentPlanChoice
    );

    const today = new Date().toISOString().split('T')[0];
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextInstallmentDate = nextDate.toISOString().split('T')[0];

    const insertedBooking = await db
      .insert(bookings)
      .values({
        bookingNumber,
        propertyId: prop.id,
        userUid: input.userUid,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        nidNumber: input.nidNumber,
        addressBn: input.addressBn,
        paymentPlanChoice: input.paymentPlanChoice,
        totalPriceBdt: prop.priceBdt,
        bookingMoneyBdt: prop.bookingAmountBdt,
        paidAmountBdt: prop.bookingAmountBdt,
        dueAmountBdt: Math.max(0, prop.priceBdt - prop.bookingAmountBdt),
        nextInstallmentDate,
        statusBn: 'অনুমোদনের অপেক্ষায়',
        notesBn: input.notesBn || '',
      })
      .returning();

    const booking = insertedBooking[0];

    await db
      .update(properties)
      .set({ statusBn: 'সংরক্ষিত' })
      .where(eq(properties.id, prop.id));

    const receiptSeed = existingBookings.length * 10 + 105 + Math.floor(Math.random() * 90);
    await db.insert(payments).values([
      {
        receiptNumber: generateReceiptNumber(receiptSeed, 2026),
        bookingId: booking.id,
        userUid: input.userUid,
        installmentNo: 0,
        titleBn: `বুকিং মানি জমা — ${prop.titleBn}`,
        amountBdt: prop.bookingAmountBdt,
        dueDate: today,
        paidDate: today,
        paymentMethodBn: 'ব্যাংক ট্রান্সফার / পে-অর্ডার',
        statusBn: 'পরিশোধিত',
      },
      {
        receiptNumber: generateReceiptNumber(receiptSeed + 1, 2026),
        bookingId: booking.id,
        userUid: input.userUid,
        installmentNo: 1,
        titleBn: '১ম মাসিক কিস্তি',
        amountBdt: plan.monthlyInstallmentBdt,
        dueDate: nextInstallmentDate,
        paidDate: '',
        paymentMethodBn: 'ব্যাংক ট্রান্সফার',
        statusBn: 'বকেয়া',
      },
      {
        receiptNumber: generateReceiptNumber(receiptSeed + 2, 2026),
        bookingId: booking.id,
        userUid: input.userUid,
        installmentNo: 2,
        titleBn: '২য় মাসিক কিস্তি',
        amountBdt: plan.monthlyInstallmentBdt,
        dueDate: '2027-01-01',
        paidDate: '',
        paymentMethodBn: 'ব্যাংক ট্রান্সফার',
        statusBn: 'বকেয়া',
      },
    ]);

    await db.insert(notifications).values({
      userUid: input.userUid,
      titleBn: `বুকিং ও মানি রিসিট প্রস্তুত (${bookingNumber})`,
      messageBn: `${prop.titleBn}-এর বুকিং সফলভাবে গৃহীত হয়েছে এবং বুকিং মানি রিসিট পোর্টালে যুক্ত হয়েছে।`,
      isRead: 0,
    });

    return booking;
  } catch (error: any) {
    console.error('Database query failed in createBookingRecord:', error);
    throw new Error(error.message || 'বুকিং তৈরিতে সমস্যা হয়েছে।', { cause: error });
  }
}

export async function approveOrUpdateBooking(bookingId: number, action: 'approve' | 'cancel') {
  try {
    const rows = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    if (rows.length === 0) {
      throw new Error('বুকিং খুঁজে পাওয়া যায়নি।');
    }
    const booking = rows[0];

    if (action === 'approve') {
      const newPaid = booking.bookingMoneyBdt;
      const newDue = Math.max(0, booking.totalPriceBdt - newPaid);

      const updated = await db
        .update(bookings)
        .set({
          statusBn: 'অনুমোদিত',
          paidAmountBdt: newPaid,
          dueAmountBdt: newDue,
        })
        .where(eq(bookings.id, bookingId))
        .returning();

      await db
        .update(properties)
        .set({ statusBn: 'বিক্রিত' })
        .where(eq(properties.id, booking.propertyId));

      const bookingPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.bookingId, bookingId));

      for (const p of bookingPayments) {
        if (p.installmentNo === 0) {
          await db
            .update(payments)
            .set({
              statusBn: 'পরিশোধিত',
              paidDate: new Date().toISOString().split('T')[0],
            })
            .where(eq(payments.id, p.id));
        }
      }

      const txCount = await db.select().from(erpTransactions);
      const voucherNo = generateVoucherNumber(1010 + txCount.length + Math.floor(Math.random() * 500), 2026);
      await db.insert(erpTransactions).values({
        voucherNo,
        transactionDate: new Date().toISOString().split('T')[0],
        type: 'income',
        categoryBn: 'বুকিং অনুমোদন ও ডাউন পেমেন্ট আদায়',
        projectId: 1,
        projectNameBn: 'প্রপার্টি বুকিং লেজার',
        titleBn: `বুকিং অনুমোদন (${booking.bookingNumber}) — গ্রাহক: ${booking.customerName}`,
        amountBdt: booking.bookingMoneyBdt,
        paymentMethodBn: 'ব্যাংক ট্রান্সফার / পে-অর্ডার',
        referenceNo: booking.bookingNumber,
        recordedByBn: 'ইআরপি অটো-লেজার',
        notesBn: `প্রপার্টি আইডি #${booking.propertyId} বিক্রিত হিসেবে চূড়ান্ত এবং বুকিং মানি জমা।`,
      });

      await db.insert(notifications).values({
        userUid: booking.userUid,
        titleBn: `বুকিং অনুমোদিত হয়েছে (${booking.bookingNumber})`,
        messageBn: `অভিনন্দন! আপনার বুকিং নং ${booking.bookingNumber} অ্যাডমিন কর্তৃক অনুমোদিত হয়েছে এবং বুকিং মানি রিসিট কাস্টমার পোর্টালে যুক্ত করা হয়েছে।`,
        isRead: 0,
      });

      return updated[0];
    } else {
      const updated = await db
        .update(bookings)
        .set({ statusBn: 'বাতিল' })
        .where(eq(bookings.id, bookingId))
        .returning();

      await db
        .update(properties)
        .set({ statusBn: 'বুকিং চলছে' })
        .where(eq(properties.id, booking.propertyId));

      await db.insert(notifications).values({
        userUid: booking.userUid,
        titleBn: `বুকিং বাতিল (${booking.bookingNumber})`,
        messageBn: `আপনার বুকিং নং ${booking.bookingNumber} বাতিল করা হয়েছে। বিস্তারিত জানতে আমাদের হটলাইনে যোগাযোগ করুন।`,
        isRead: 0,
      });

      return updated[0];
    }
  } catch (error: any) {
    console.error('Database query failed in approveOrUpdateBooking:', error);
    throw new Error(error.message || 'বুকিং আপডেটে সমস্যা হয়েছে।', { cause: error });
  }
}

export async function payInstallmentRecord(paymentId: number, paymentMethodBn: string) {
  try {
    const pRows = await db.select().from(payments).where(eq(payments.id, paymentId));
    if (pRows.length === 0) throw new Error('কিস্তির তথ্য পাওয়া যায়নি।');
    const payment = pRows[0];
    if (payment.statusBn === 'পরিশোধিত') {
      return payment;
    }

    const today = new Date().toISOString().split('T')[0];
    const updatedPayment = await db
      .update(payments)
      .set({
        statusBn: 'পরিশোধিত',
        paidDate: today,
        paymentMethodBn,
      })
      .where(eq(payments.id, paymentId))
      .returning();

    const bRows = await db.select().from(bookings).where(eq(bookings.id, payment.bookingId));
    if (bRows.length > 0) {
      const b = bRows[0];
      const newPaid = b.paidAmountBdt + payment.amountBdt;
      const newDue = Math.max(0, b.totalPriceBdt - newPaid);
      await db
        .update(bookings)
        .set({
          paidAmountBdt: newPaid,
          dueAmountBdt: newDue,
        })
        .where(eq(bookings.id, b.id));

      const txCount = await db.select().from(erpTransactions);
      const voucherNo = generateVoucherNumber(1050 + txCount.length + Math.floor(Math.random() * 500), 2026);
      await db.insert(erpTransactions).values({
        voucherNo,
        transactionDate: today,
        type: 'income',
        categoryBn: 'কিস্তি আদায় (কাস্টমার পোর্টাল)',
        projectId: 1,
        projectNameBn: `বুকিং ${b.bookingNumber}`,
        titleBn: `${payment.titleBn} আদায় — রিসিট ${payment.receiptNumber} (${b.customerName})`,
        amountBdt: payment.amountBdt,
        paymentMethodBn,
        referenceNo: payment.receiptNumber,
        recordedByBn: 'কাস্টমার পোর্টাল অটো-ভাউচার',
        notesBn: 'গ্রাহক পোর্টালের মাধ্যমে অনলাইনে পরিশোধিত।',
      });

      await db.insert(notifications).values({
        userUid: b.userUid,
        titleBn: `পেমেন্ট সম্পন্ন (${payment.receiptNumber})`,
        messageBn: `${payment.titleBn} বাবদ ৳ ${payment.amountBdt.toLocaleString('en-IN')} সফলভাবে পরিশোধিত হয়েছে। মানি রিসিট ডাউনলোডের জন্য প্রস্তুত।`,
        isRead: 0,
      });
    }

    return updatedPayment[0];
  } catch (error: any) {
    console.error('Database query failed in payInstallmentRecord:', error);
    throw new Error(error.message || 'পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে।', { cause: error });
  }
}

export async function getCustomerPortalData(userUid: string) {
  try {
    await ensureSeeded();
    const [allBookings, allPayments, allProperties, allProjects, allComplaints, allNotifications] =
      await Promise.all([
        db.select().from(bookings).orderBy(desc(bookings.id)),
        db.select().from(payments).orderBy(payments.installmentNo),
        db.select().from(properties),
        db.select().from(projects),
        db.select().from(complaints).orderBy(desc(complaints.id)),
        db.select().from(notifications).orderBy(desc(notifications.id)),
      ]);

    const userBookings = allBookings.filter(
      (b) => b.userUid === userUid || b.userUid === 'demo-customer'
    );
    const userPayments = allPayments.filter(
      (p) => p.userUid === userUid || p.userUid === 'demo-customer'
    );
    const userComplaints = allComplaints.filter(
      (c) => c.userUid === userUid || c.userUid === 'demo-customer'
    );
    const userNotifications = allNotifications.filter(
      (n) => n.userUid === userUid || n.userUid === 'demo-customer'
    );

    return {
      bookings: userBookings,
      payments: userPayments,
      properties: allProperties,
      projects: allProjects,
      complaints: userComplaints,
      notifications: userNotifications,
    };
  } catch (error) {
    console.error('Database query failed in getCustomerPortalData:', error);
    throw new Error('কাস্টমার পোর্টালের তথ্য লোড করতে সমস্যা হয়েছে।', { cause: error });
  }
}

export async function getAdminErpData() {
  try {
    await ensureSeeded();
    const [
      settingsRows,
      slideRows,
      boardRows,
      projectRows,
      propertyRows,
      bookingRows,
      paymentRows,
      transactionRows,
      inquiryRows,
      complaintRows,
      galleryRows,
      testimonialRows,
      articleRows,
      userRows,
    ] = await Promise.all([
      db.select().from(siteSettings),
      db.select().from(heroSlides).orderBy(heroSlides.displayOrder),
      db.select().from(boardMembers).orderBy(boardMembers.displayOrder),
      db.select().from(projects).orderBy(desc(projects.id)),
      db.select().from(properties).orderBy(desc(properties.id)),
      db.select().from(bookings).orderBy(desc(bookings.id)),
      db.select().from(payments).orderBy(desc(payments.id)),
      db.select().from(erpTransactions).orderBy(desc(erpTransactions.id)),
      db.select().from(inquiries).orderBy(desc(inquiries.id)),
      db.select().from(complaints).orderBy(desc(complaints.id)),
      db.select().from(galleryItems).orderBy(desc(galleryItems.id)),
      db.select().from(testimonials).orderBy(desc(testimonials.id)),
      db.select().from(articles).orderBy(desc(articles.id)),
      db.select().from(users).orderBy(desc(users.id)),
    ]);

    return {
      settings: settingsRows[0] || null,
      heroSlides: slideRows,
      boardMembers: boardRows,
      projects: projectRows,
      properties: propertyRows,
      bookings: bookingRows,
      payments: paymentRows,
      erpTransactions: transactionRows,
      inquiries: inquiryRows,
      complaints: complaintRows,
      gallery: galleryRows,
      testimonials: testimonialRows,
      articles: articleRows,
      customers: userRows.map((u) => ({
        id: u.id,
        uid: u.uid,
        name: u.name || 'গ্রাহক',
        phone: u.phone || '',
        email: u.email,
        nidNumber: u.nidNumber || '',
        addressBn: u.addressBn || '',
        role: u.role,
      })),
    };
  } catch (error) {
    console.error('Database query failed in getAdminErpData:', error);
    throw new Error('অ্যাডমিন প্যানেলের তথ্য লোড করতে সমস্যা হয়েছে।', { cause: error });
  }
}

export async function togglePublicWebsiteVisibility(input: {
  entity: 'project' | 'property' | 'board' | 'slide' | 'gallery';
  id: number;
  publishedOnWeb: number;
}) {
  try {
    const val = input.publishedOnWeb ? 1 : 0;
    if (input.entity === 'project') {
      await db.update(projects).set({ publishedOnWeb: val }).where(eq(projects.id, input.id));
    } else if (input.entity === 'property') {
      await db.update(properties).set({ publishedOnWeb: val }).where(eq(properties.id, input.id));
    } else if (input.entity === 'board') {
      await db.update(boardMembers).set({ publishedOnWeb: val }).where(eq(boardMembers.id, input.id));
    } else if (input.entity === 'slide') {
      await db.update(heroSlides).set({ publishedOnWeb: val }).where(eq(heroSlides.id, input.id));
    } else if (input.entity === 'gallery') {
      await db.update(galleryItems).set({ publishedOnWeb: val }).where(eq(galleryItems.id, input.id));
    }
    return { ok: true, publishedOnWeb: val };
  } catch (error: any) {
    console.error('Error in togglePublicWebsiteVisibility:', error);
    throw new Error('পাবলিক ওয়েবসাইট ভিজিবিলিটি আপডেট করতে সমস্যা হয়েছে।', { cause: error });
  }
}

export async function createErpTransactionRecord(input: {
  type: 'income' | 'expense';
  categoryBn: string;
  projectId?: number;
  projectNameBn?: string;
  titleBn: string;
  amountBdt: number;
  paymentMethodBn: string;
  referenceNo?: string;
  recordedByBn?: string;
  notesBn?: string;
  transactionDate?: string;
}) {
  try {
    const existing = await db.select().from(erpTransactions);
    const voucherNo = generateVoucherNumber(1001 + existing.length + Math.floor(Math.random() * 500), 2026);
    const inserted = await db
      .insert(erpTransactions)
      .values({
        voucherNo,
        transactionDate: input.transactionDate || new Date().toISOString().split('T')[0],
        type: input.type === 'expense' ? 'expense' : 'income',
        categoryBn: input.categoryBn.trim(),
        projectId: Number(input.projectId || 0),
        projectNameBn: (input.projectNameBn || 'সাধারণ কর্পোরেট হিসাব').trim(),
        titleBn: input.titleBn.trim(),
        amountBdt: Number(input.amountBdt),
        paymentMethodBn: (input.paymentMethodBn || 'ব্যাংক ট্রান্সফার').trim(),
        referenceNo: (input.referenceNo || '').trim(),
        recordedByBn: (input.recordedByBn || 'প্রধান হিসাবরক্ষক').trim(),
        notesBn: (input.notesBn || '').trim(),
      })
      .returning();

    return inserted[0];
  } catch (error: any) {
    console.error('Error in createErpTransactionRecord:', error);
    throw new Error('ইআরপি ভাউচার সংরক্ষণে সমস্যা হয়েছে।', { cause: error });
  }
}

export async function createAdminMoneyReceiptRecord(input: {
  bookingId?: number;
  titleBn: string;
  amountBdt: number;
  paymentMethodBn: string;
  paidDate?: string;
}) {
  try {
    const existingPayments = await db.select().from(payments);
    const receiptNumber = generateReceiptNumber(
      200 + existingPayments.length + Math.floor(Math.random() * 500),
      2026
    );
    const today = input.paidDate || new Date().toISOString().split('T')[0];

    let bookingRow: any = null;
    if (input.bookingId) {
      const bRows = await db.select().from(bookings).where(eq(bookings.id, Number(input.bookingId)));
      if (bRows.length > 0) bookingRow = bRows[0];
    }
    if (!bookingRow) {
      const allBookings = await db.select().from(bookings);
      bookingRow = allBookings[0] || null;
    }

    const inserted = await db
      .insert(payments)
      .values({
        receiptNumber,
        bookingId: bookingRow ? bookingRow.id : 1,
        userUid: bookingRow ? bookingRow.userUid : 'demo-customer',
        installmentNo: existingPayments.length + 1,
        titleBn: input.titleBn.trim(),
        amountBdt: Number(input.amountBdt),
        dueDate: today,
        paidDate: today,
        paymentMethodBn: (input.paymentMethodBn || 'ব্যাংক ট্রান্সফার / পে-অর্ডার').trim(),
        statusBn: 'পরিশোধিত',
      })
      .returning();

    if (bookingRow) {
      const newPaid = Number(bookingRow.paidAmountBdt || 0) + Number(input.amountBdt);
      const newDue = Math.max(0, Number(bookingRow.totalPriceBdt || 0) - newPaid);
      await db
        .update(bookings)
        .set({
          paidAmountBdt: newPaid,
          dueAmountBdt: newDue,
        })
        .where(eq(bookings.id, bookingRow.id));
    }

    const txCount = await db.select().from(erpTransactions);
    const voucherNo = generateVoucherNumber(1100 + txCount.length + Math.floor(Math.random() * 400), 2026);
    await db.insert(erpTransactions).values({
      voucherNo,
      transactionDate: today,
      type: 'income',
      categoryBn: 'কিস্তি ও বুকিং আদায় (মানি রিসিট)',
      projectId: 1,
      projectNameBn: bookingRow ? `বুকিং ${bookingRow.bookingNumber}` : 'সরাসরি মানি রিসিট',
      titleBn: `${input.titleBn.trim()} — রিসিট ${receiptNumber}`,
      amountBdt: Number(input.amountBdt),
      paymentMethodBn: (input.paymentMethodBn || 'ব্যাংক ট্রান্সফার').trim(),
      referenceNo: receiptNumber,
      recordedByBn: 'হিসাব ও ক্যাশ বিভাগ',
      notesBn: 'অ্যাডমিন প্যানেল থেকে অফিশিয়াল মানি রিসিট ইস্যু করা হয়েছে।',
    });

    return inserted[0];
  } catch (error: any) {
    console.error('Error in createAdminMoneyReceiptRecord:', error);
    throw new Error('মানি রিসিট তৈরিতে সমস্যা হয়েছে।', { cause: error });
  }
}

