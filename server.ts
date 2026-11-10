import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { db } from './src/db/index.ts';
import {
  siteSettings,
  heroSlides,
  boardMembers,
  projects,
  properties,
  inquiries,
  complaints,
  galleryItems,
  testimonials,
  articles,
} from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import {
  getPublicBootstrapData,
  createBookingRecord,
  approveOrUpdateBooking,
  payInstallmentRecord,
  getCustomerPortalData,
  getAdminErpData,
  getOrCreateUser,
  registerCustomerAccount,
  loginCustomerWithPassword,
  togglePublicWebsiteVisibility,
  createErpTransactionRecord,
  createAdminMoneyReceiptRecord,
} from './src/db/repository.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  validateBookingApplication,
  validateCustomerSignup,
} from './src/utils/bengaliLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // Public Bootstrap Endpoint
  app.get('/api/bootstrap', async (_req, res) => {
    try {
      const data = await getPublicBootstrapData();
      res.json(data);
    } catch (error: any) {
      console.error('Error in /api/bootstrap:', error);
      res.status(500).json({ error: error.message || 'তথ্য লোড করতে সমস্যা হয়েছে।' });
    }
  });

  // Customer Sign-Up with Password
  app.post('/api/customer/register', async (req, res) => {
    try {
      const { name, phone, email, password, confirmPassword, nidNumber, addressBn } = req.body;
      const validation = validateCustomerSignup({
        name: String(name || ''),
        phone: String(phone || ''),
        email: String(email || ''),
        password: String(password || ''),
        confirmPassword: typeof confirmPassword === 'string' ? confirmPassword : String(password || ''),
      });

      if (!validation.valid) {
        return res.status(400).json({ error: validation.errorBn });
      }

      const customer = await registerCustomerAccount({
        name: String(name),
        phone: String(phone),
        email: String(email),
        password: String(password),
        nidNumber: String(nidNumber || ''),
        addressBn: String(addressBn || ''),
      });

      res.status(201).json({ customer });
    } catch (error: any) {
      console.error('Error in POST /api/customer/register:', error);
      res.status(400).json({ error: error.message || 'গ্রাহক সাইন আপ করতে সমস্যা হয়েছে।' });
    }
  });

  // Customer Login with Mobile/Email + Password
  app.post('/api/customer/login', async (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ error: 'অনুগ্রহ করে মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড লিখুন।' });
      }
      const customer = await loginCustomerWithPassword({
        identifier: String(identifier),
        password: String(password),
      });
      res.json({ customer });
    } catch (error: any) {
      console.error('Error in POST /api/customer/login:', error);
      res.status(401).json({ error: error.message || 'লগইন করতে সমস্যা হয়েছে।' });
    }
  });

  // Sync Authenticated User Profile to PostgreSQL
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'লগইন আবশ্যক।' });
      }
      const userRecord = await getOrCreateUser(
        req.user.uid,
        req.user.email || 'customer@hhhomesbd.com',
        req.user.name || req.body?.name
      );
      res.json({ user: userRecord });
    } catch (error: any) {
      console.error('Error in /api/auth/sync:', error);
      res.status(500).json({ error: error.message || 'ব্যবহারকারী সিঙ্ক করতে সমস্যা হয়েছে।' });
    }
  });

  // Submit Inquiry
  app.post('/api/inquiries', async (req, res) => {
    try {
      const { name, phone, email, propertyCategoryBn, propertyId, message } = req.body;
      if (!name || !phone || !message) {
        return res.status(400).json({ error: 'অনুগ্রহ করে নাম, মোবাইল নম্বর এবং বার্তা পূরণ করুন।' });
      }
      const inserted = await db
        .insert(inquiries)
        .values({
          name: String(name).trim(),
          phone: String(phone).trim(),
          email: String(email || '').trim(),
          propertyCategoryBn: String(propertyCategoryBn || 'সাধারণ জিজ্ঞাসা'),
          propertyId: Number(propertyId || 0),
          message: String(message).trim(),
          statusBn: 'নতুন',
        })
        .returning();

      res.status(201).json({ inquiry: inserted[0] });
    } catch (error: any) {
      console.error('Error in POST /api/inquiries:', error);
      res.status(500).json({ error: 'আপনার বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' });
    }
  });

  // Submit Customer Testimonial
  app.post('/api/testimonials', async (req, res) => {
    try {
      const {
        customerNameBn,
        roleOrProfessionBn,
        projectNameBn,
        propertyUnitBn,
        reviewBn,
        rating,
        isVideoReview,
        videoDurationBn,
      } = req.body;
      if (!customerNameBn || !projectNameBn || !reviewBn) {
        return res.status(400).json({ error: 'অনুগ্রহ করে নাম, প্রজেক্ট এবং আপনার মতামত লিখুন।' });
      }
      const inserted = await db
        .insert(testimonials)
        .values({
          customerNameBn: String(customerNameBn).trim(),
          roleOrProfessionBn: String(roleOrProfessionBn || 'সম্মানিত গ্রাহক').trim(),
          projectNameBn: String(projectNameBn).trim(),
          propertyUnitBn: String(propertyUnitBn || 'বরাদ্দকৃত ইউনিট').trim(),
          reviewBn: String(reviewBn).trim(),
          rating: Math.min(5, Math.max(1, Number(rating || 5))),
          isVideoReview: isVideoReview === 0 ? 0 : 1,
          videoDurationBn: String(videoDurationBn || '০২:৩০ মিনিট'),
          videoTheme: 'cust_video_nrb_uk',
          approved: 0,
        })
        .returning();

      res.status(201).json({ testimonial: inserted[0] });
    } catch (error: any) {
      console.error('Error in POST /api/testimonials:', error);
      res.status(500).json({ error: 'মতামত জমা দিতে সমস্যা হয়েছে।' });
    }
  });

  // Create Property Booking Application
  app.post('/api/bookings', async (req, res) => {
    try {
      const {
        propertyId,
        userUid,
        customerName,
        customerPhone,
        customerEmail,
        nidNumber,
        addressBn,
        paymentPlanChoice,
        notesBn,
      } = req.body;

      const validation = validateBookingApplication({
        customerName: String(customerName || ''),
        customerPhone: String(customerPhone || ''),
        customerEmail: String(customerEmail || ''),
        nidNumber: String(nidNumber || ''),
        addressBn: String(addressBn || ''),
      });

      if (!validation.valid) {
        return res.status(400).json({ error: validation.errorBn });
      }

      const booking = await createBookingRecord({
        propertyId: Number(propertyId),
        userUid: String(userUid || 'demo-customer'),
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        customerEmail: String(customerEmail).trim(),
        nidNumber: String(nidNumber).trim(),
        addressBn: String(addressBn).trim(),
        paymentPlanChoice: String(paymentPlanChoice || '৩৬ মাসিক কিস্তি'),
        notesBn: String(notesBn || ''),
      });

      res.status(201).json({ booking });
    } catch (error: any) {
      console.error('Error in POST /api/bookings:', error);
      res.status(400).json({ error: error.message || 'বুকিং সম্পন্ন করতে সমস্যা হয়েছে।' });
    }
  });

  // Customer Portal Data
  app.get('/api/portal', async (req, res) => {
    try {
      const userUid = String(req.query.uid || 'demo-customer');
      const data = await getCustomerPortalData(userUid);
      res.json(data);
    } catch (error: any) {
      console.error('Error in GET /api/portal:', error);
      res.status(500).json({ error: error.message || 'পোর্টালের তথ্য লোড করতে সমস্যা হয়েছে।' });
    }
  });

  // Pay Installment from Customer Portal
  app.post('/api/portal/pay', async (req, res) => {
    try {
      const { paymentId, paymentMethodBn } = req.body;
      const updated = await payInstallmentRecord(
        Number(paymentId),
        String(paymentMethodBn || 'ব্যাংক ট্রান্সফার / অনলাইন পেমেন্ট')
      );
      res.json({ payment: updated });
    } catch (error: any) {
      console.error('Error in POST /api/portal/pay:', error);
      res.status(400).json({ error: error.message || 'পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে।' });
    }
  });

  // Submit Complaint / Support Ticket from Customer Portal
  app.post('/api/portal/complaints', async (req, res) => {
    try {
      const { userUid, customerName, subjectBn, messageBn } = req.body;
      if (!subjectBn || !messageBn) {
        return res.status(400).json({ error: 'অনুগ্রহ করে বিষয় এবং বিস্তারিত বিবরণ লিখুন।' });
      }
      const inserted = await db
        .insert(complaints)
        .values({
          userUid: String(userUid || 'demo-customer'),
          customerName: String(customerName || 'সম্মানিত গ্রাহক'),
          subjectBn: String(subjectBn).trim(),
          messageBn: String(messageBn).trim(),
          statusBn: 'প্রক্রিয়াধীন',
          resolutionBn: '',
        })
        .returning();

      res.status(201).json({ complaint: inserted[0] });
    } catch (error: any) {
      console.error('Error in POST /api/portal/complaints:', error);
      res.status(500).json({ error: 'অভিযোগ জমা দিতে সমস্যা হয়েছে।' });
    }
  });

  // Admin ERP & CMS Data
  app.get('/api/admin/erp', async (_req, res) => {
    try {
      const data = await getAdminErpData();
      res.json(data);
    } catch (error: any) {
      console.error('Error in GET /api/admin/erp:', error);
      res.status(500).json({ error: error.message || 'অ্যাডমিন তথ্য লোড করতে সমস্যা হয়েছে।' });
    }
  });

  // Toggle Public Website Selection
  app.post('/api/admin/toggle-web', async (req, res) => {
    try {
      const { entity, id, publishedOnWeb } = req.body;
      const result = await togglePublicWebsiteVisibility({
        entity,
        id: Number(id),
        publishedOnWeb: Number(publishedOnWeb),
      });
      res.json(result);
    } catch (error: any) {
      console.error('Error in POST /api/admin/toggle-web:', error);
      res.status(400).json({ error: error.message || 'পরিবর্তন সংরক্ষণে সমস্যা হয়েছে।' });
    }
  });

  // Add ERP Accounting Transaction
  app.post('/api/admin/erp/transactions', async (req, res) => {
    try {
      const {
        type,
        categoryBn,
        projectId,
        projectNameBn,
        titleBn,
        amountBdt,
        paymentMethodBn,
        referenceNo,
        recordedByBn,
        notesBn,
        transactionDate,
      } = req.body;

      if (!titleBn || !amountBdt) {
        return res.status(400).json({ error: 'ভাউচারের বিবরণ এবং টাকার পরিমাণ আবশ্যক।' });
      }

      const tx = await createErpTransactionRecord({
        type: type === 'expense' ? 'expense' : 'income',
        categoryBn: String(categoryBn || 'সাধারণ হিসাব'),
        projectId: Number(projectId || 0),
        projectNameBn: String(projectNameBn || 'সাধারণ কর্পোরেট হিসাব'),
        titleBn: String(titleBn),
        amountBdt: Number(amountBdt),
        paymentMethodBn: String(paymentMethodBn || 'ব্যাংক ট্রান্সফার'),
        referenceNo: String(referenceNo || ''),
        recordedByBn: String(recordedByBn || 'প্রধান হিসাবরক্ষক'),
        notesBn: String(notesBn || ''),
        transactionDate: String(transactionDate || ''),
      });

      res.status(201).json({ transaction: tx });
    } catch (error: any) {
      console.error('Error in POST /api/admin/erp/transactions:', error);
      res.status(400).json({ error: error.message || 'ভাউচার সংরক্ষণে সমস্যা হয়েছে।' });
    }
  });

  // Admin Issue Official Money Receipt
  app.post('/api/admin/payments/receipt', async (req, res) => {
    try {
      const { bookingId, titleBn, amountBdt, paymentMethodBn, paidDate } = req.body;
      if (!titleBn || !amountBdt) {
        return res.status(400).json({ error: 'মানি রিসিটের বিবরণ এবং টাকার পরিমাণ আবশ্যক।' });
      }
      const receipt = await createAdminMoneyReceiptRecord({
        bookingId: bookingId ? Number(bookingId) : undefined,
        titleBn: String(titleBn),
        amountBdt: Number(amountBdt),
        paymentMethodBn: String(paymentMethodBn || 'ব্যাংক ট্রান্সফার / পে-অর্ডার'),
        paidDate: String(paidDate || ''),
      });
      res.status(201).json({ payment: receipt });
    } catch (error: any) {
      console.error('Error in POST /api/admin/payments/receipt:', error);
      res.status(400).json({ error: error.message || 'মানি রিসিট তৈরিতে সমস্যা হয়েছে।' });
    }
  });

  // Admin Add or Update Board Member
  app.post('/api/admin/board', async (req, res) => {
    try {
      const {
        nameBn,
        designationBn,
        roleKey,
        qualificationBn,
        experienceBn,
        messageBn,
        quoteBn,
        email,
        phone,
        portraitTheme,
        publishedOnWeb,
      } = req.body;

      if (!nameBn || !designationBn) {
        return res.status(400).json({ error: 'পরিচালকের নাম ও পদবী আবশ্যক।' });
      }

      const inserted = await db
        .insert(boardMembers)
        .values({
          nameBn: String(nameBn).trim(),
          designationBn: String(designationBn).trim(),
          roleKey: String(roleKey || 'director'),
          qualificationBn: String(qualificationBn || 'উচ্চশিক্ষিত ও অভিজ্ঞ নেতৃত্ব').trim(),
          experienceBn: String(experienceBn || '১৫+ বছরের অভিজ্ঞতা').trim(),
          messageBn: String(messageBn || '').trim(),
          quoteBn: String(quoteBn || '').trim(),
          email: String(email || '').trim(),
          phone: String(phone || '').trim(),
          portraitTheme: String(portraitTheme || 'portrait_director_fin'),
          displayOrder: 7,
          publishedOnWeb: publishedOnWeb === 0 ? 0 : 1,
        })
        .returning();

      res.status(201).json({ member: inserted[0] });
    } catch (error: any) {
      console.error('Error in POST /api/admin/board:', error);
      res.status(500).json({ error: 'পরিচালনা পর্ষদের সদস্য যোগ করতে সমস্যা হয়েছে।' });
    }
  });

  app.put('/api/admin/board/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { nameBn, designationBn, qualificationBn, experienceBn, messageBn, quoteBn, phone, email } = req.body;
      const updated = await db
        .update(boardMembers)
        .set({
          ...(nameBn ? { nameBn: String(nameBn).trim() } : {}),
          ...(designationBn ? { designationBn: String(designationBn).trim() } : {}),
          ...(qualificationBn ? { qualificationBn: String(qualificationBn).trim() } : {}),
          ...(experienceBn ? { experienceBn: String(experienceBn).trim() } : {}),
          ...(messageBn !== undefined ? { messageBn: String(messageBn).trim() } : {}),
          ...(quoteBn !== undefined ? { quoteBn: String(quoteBn).trim() } : {}),
          ...(phone !== undefined ? { phone: String(phone).trim() } : {}),
          ...(email !== undefined ? { email: String(email).trim() } : {}),
        })
        .where(eq(boardMembers.id, id))
        .returning();

      res.json({ member: updated[0] });
    } catch (error: any) {
      console.error('Error in PUT /api/admin/board/:id:', error);
      res.status(500).json({ error: 'তথ্য আপডেটে সমস্যা হয়েছে।' });
    }
  });

  // Admin Add & Update Hero Slide
  app.post('/api/admin/slides', async (req, res) => {
    try {
      const { badgeBn, titleBn, subtitleBn, highlightStatsBn, visualTheme } = req.body;
      if (!titleBn) {
        return res.status(400).json({ error: 'স্লাইডের শিরোনাম আবশ্যক।' });
      }
      const inserted = await db
        .insert(heroSlides)
        .values({
          badgeBn: String(badgeBn || 'H & H Homes এক্সক্লুসিভ প্রজেক্ট').trim(),
          titleBn: String(titleBn).trim(),
          subtitleBn: String(subtitleBn || 'পরিকল্পিত আবাসিক জমি ও আধুনিক ফ্ল্যাটের বিশ্বস্ত প্রতিষ্ঠান।').trim(),
          highlightStatsBn: String(highlightStatsBn || 'সহজ কিস্তি সুবিধা · ১০০% নিষ্কণ্টক দলিল').trim(),
          ctaPrimaryBn: 'প্রজেক্ট দেখুন',
          ctaSecondaryBn: 'বুকিং করুন',
          visualTheme: String(visualTheme || 'hero_3d_twin_towers'),
          projectSlug: 'hh-signature-tower',
          accentColor: '#10B981',
          displayOrder: 5,
          publishedOnWeb: 1,
        })
        .returning();

      res.status(201).json({ slide: inserted[0] });
    } catch (error: any) {
      console.error('Error in POST /api/admin/slides:', error);
      res.status(500).json({ error: 'নতুন স্লাইড যোগ করতে সমস্যা হয়েছে।' });
    }
  });

  app.put('/api/admin/slides/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { badgeBn, titleBn, subtitleBn, highlightStatsBn, visualTheme } = req.body;
      const updated = await db
        .update(heroSlides)
        .set({
          ...(badgeBn ? { badgeBn: String(badgeBn).trim() } : {}),
          ...(titleBn ? { titleBn: String(titleBn).trim() } : {}),
          ...(subtitleBn ? { subtitleBn: String(subtitleBn).trim() } : {}),
          ...(highlightStatsBn ? { highlightStatsBn: String(highlightStatsBn).trim() } : {}),
          ...(visualTheme ? { visualTheme: String(visualTheme).trim() } : {}),
        })
        .where(eq(heroSlides.id, id))
        .returning();
      res.json({ slide: updated[0] });
    } catch (error: any) {
      console.error('Error in PUT /api/admin/slides/:id:', error);
      res.status(500).json({ error: 'স্লাইড আপডেট করতে সমস্যা হয়েছে।' });
    }
  });

  // Admin Approve or Cancel Booking
  app.post('/api/admin/bookings/:id/decision', async (req, res) => {
    try {
      const bookingId = Number(req.params.id);
      const action = req.body.action === 'cancel' ? 'cancel' : 'approve';
      const updated = await approveOrUpdateBooking(bookingId, action);
      res.json({ booking: updated });
    } catch (error: any) {
      console.error('Error in POST /api/admin/bookings/:id/decision:', error);
      res.status(400).json({ error: error.message || 'বুকিং স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।' });
    }
  });

  // Admin Update Site Settings / CMS Content & SEO
  app.put('/api/admin/settings', async (req, res) => {
    try {
      const existing = await db.select().from(siteSettings);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'সেটিংস পাওয়া যায়নি।' });
      }
      const id = existing[0].id;
      const {
        companyNameBn,
        companyNameEn,
        taglineBn,
        heroHeadlineBn,
        heroSubtitleBn,
        aboutIntroBn,
        missionBn,
        visionBn,
        officeAddressBn,
        phone,
        whatsapp,
        email,
        officeHoursBn,
        seoTitle,
        seoDescription,
      } = req.body;

      const updated = await db
        .update(siteSettings)
        .set({
          ...(companyNameBn ? { companyNameBn } : {}),
          ...(companyNameEn ? { companyNameEn } : {}),
          ...(taglineBn ? { taglineBn } : {}),
          ...(heroHeadlineBn ? { heroHeadlineBn } : {}),
          ...(heroSubtitleBn ? { heroSubtitleBn } : {}),
          ...(aboutIntroBn ? { aboutIntroBn } : {}),
          ...(missionBn ? { missionBn } : {}),
          ...(visionBn ? { visionBn } : {}),
          ...(officeAddressBn ? { officeAddressBn } : {}),
          ...(phone ? { phone } : {}),
          ...(whatsapp ? { whatsapp } : {}),
          ...(email ? { email } : {}),
          ...(officeHoursBn ? { officeHoursBn } : {}),
          ...(seoTitle ? { seoTitle } : {}),
          ...(seoDescription ? { seoDescription } : {}),
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, id))
        .returning();

      res.json({ settings: updated[0] });
    } catch (error: any) {
      console.error('Error in PUT /api/admin/settings:', error);
      res.status(500).json({ error: 'সেটিংস সংরক্ষণে সমস্যা হয়েছে।' });
    }
  });

  // Admin Add & Update Project
  app.post('/api/admin/projects', async (req, res) => {
    try {
      const {
        nameBn,
        nameEn,
        categoryBn,
        statusBn,
        areaBn,
        locationBn,
        sizeSummaryBn,
        priceSummaryBn,
        availabilityBn,
        descriptionBn,
        lat,
        lng,
        imageType,
        totalBudgetBdt,
        publishedOnWeb,
      } = req.body;

      if (!nameBn || !locationBn) {
        return res.status(400).json({ error: 'প্রজেক্টের নাম ও অবস্থান আবশ্যক।' });
      }

      const slug = `hh-project-${Date.now()}`;
      const inserted = await db
        .insert(projects)
        .values({
          slug,
          nameBn: String(nameBn).trim(),
          nameEn: String(nameEn || nameBn).trim(),
          categoryBn: String(categoryBn || 'আবাসিক জমি'),
          statusBn: String(statusBn || 'চলমান'),
          areaBn: String(areaBn || 'বনশ্রী, ঢাকা'),
          locationBn: String(locationBn).trim(),
          sizeSummaryBn: String(sizeSummaryBn || '৩ ও ৫ কাঠা'),
          priceSummaryBn: String(priceSummaryBn || 'আলোচনা সাপেক্ষে'),
          availabilityBn: String(availabilityBn || 'বুকিং চলছে'),
          descriptionBn: String(descriptionBn || ''),
          specificationsJson: JSON.stringify([
            { label: 'প্রকল্পের ধরন', value: String(categoryBn || 'আবাসিক প্রকল্প') },
            { label: 'অবস্থান', value: String(locationBn) },
            { label: 'আকার', value: String(sizeSummaryBn || 'পরিকল্পিত ইউনিট') },
          ]),
          lat: String(lat || '23.7619'),
          lng: String(lng || '90.4315'),
          imageType: String(
            imageType || (categoryBn === 'ফ্ল্যাট' ? 'project_3d_twin_towers' : 'project_3d_township')
          ),
          featured: 1,
          publishedOnWeb: publishedOnWeb === 0 ? 0 : 1,
          totalBudgetBdt: Number(totalBudgetBdt || 80000000),
        })
        .returning();

      res.status(201).json({ project: inserted[0] });
    } catch (error: any) {
      console.error('Error in POST /api/admin/projects:', error);
      res.status(500).json({ error: 'নতুন প্রজেক্ট যোগ করতে সমস্যা হয়েছে।' });
    }
  });

  app.put('/api/admin/projects/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const {
        nameBn,
        categoryBn,
        statusBn,
        areaBn,
        locationBn,
        sizeSummaryBn,
        priceSummaryBn,
        availabilityBn,
        descriptionBn,
        imageType,
      } = req.body;
      const updated = await db
        .update(projects)
        .set({
          ...(nameBn ? { nameBn: String(nameBn).trim() } : {}),
          ...(categoryBn ? { categoryBn: String(categoryBn).trim() } : {}),
          ...(statusBn ? { statusBn: String(statusBn).trim() } : {}),
          ...(areaBn ? { areaBn: String(areaBn).trim() } : {}),
          ...(locationBn ? { locationBn: String(locationBn).trim() } : {}),
          ...(sizeSummaryBn ? { sizeSummaryBn: String(sizeSummaryBn).trim() } : {}),
          ...(priceSummaryBn ? { priceSummaryBn: String(priceSummaryBn).trim() } : {}),
          ...(availabilityBn ? { availabilityBn: String(availabilityBn).trim() } : {}),
          ...(descriptionBn !== undefined ? { descriptionBn: String(descriptionBn).trim() } : {}),
          ...(imageType ? { imageType: String(imageType).trim() } : {}),
        })
        .where(eq(projects.id, id))
        .returning();
      res.json({ project: updated[0] });
    } catch (error: any) {
      console.error('Error in PUT /api/admin/projects/:id:', error);
      res.status(500).json({ error: 'প্রজেক্ট আপডেট করতে সমস্যা হয়েছে।' });
    }
  });

  // Admin Add & Update Property
  app.post('/api/admin/properties', async (req, res) => {
    try {
      const {
        propertyCode,
        projectId,
        titleBn,
        categoryBn,
        propertyType,
        areaBn,
        locationBn,
        blockNo,
        plotNo,
        sizeBn,
        bedrooms,
        bathrooms,
        sqft,
        priceBdt,
        priceDisplayBn,
        bookingAmountBdt,
        bookingDisplayBn,
        paymentPlanBn,
        descriptionBn,
        floorPlanSpecs,
        imageType,
        publishedOnWeb,
      } = req.body;

      if (!titleBn || !priceBdt) {
        return res.status(400).json({ error: 'প্রপার্টির শিরোনাম ও মূল্য আবশ্যক।' });
      }

      const code = propertyCode || `HH-P-${Math.floor(100 + Math.random() * 900)}`;
      const inserted = await db
        .insert(properties)
        .values({
          propertyCode: String(code).trim(),
          projectId: Number(projectId || 1),
          titleBn: String(titleBn).trim(),
          titleEn: String(titleBn).trim(),
          categoryBn: String(categoryBn || 'আবাসিক জমি'),
          propertyType: String(propertyType || 'land'),
          areaBn: String(areaBn || 'বনশ্রী, ব্লক-সি, ঢাকা'),
          locationBn: String(locationBn || 'রোড: ৪, ব্লক: সি, বনশ্রী, ঢাকা'),
          blockNo: String(blockNo || 'ব্লক-সি'),
          plotNo: String(plotNo || 'প্লট-০১'),
          sizeBn: String(sizeBn || '৫ কাঠা'),
          bedrooms: Number(bedrooms || 0),
          bathrooms: Number(bathrooms || 0),
          sqft: Number(sqft || 3600),
          priceBdt: Number(priceBdt),
          priceDisplayBn: String(priceDisplayBn || `৳ ${Number(priceBdt).toLocaleString('en-IN')}`),
          bookingAmountBdt: Number(bookingAmountBdt || 500000),
          bookingDisplayBn: String(bookingDisplayBn || '৳ ৫ লক্ষ'),
          paymentPlanBn: String(paymentPlanBn || 'এককালীন ও ৩৬ মাসের কিস্তি'),
          statusBn: 'বুকিং চলছে',
          descriptionBn: String(descriptionBn || 'H & H Homes-এর পরিকল্পিত প্রপার্টি।'),
          floorPlanSpecs: String(floorPlanSpecs || 'মানসম্মত লেআউট ও প্রশস্ত সংযোগ সড়ক'),
          lat: '23.7619',
          lng: '90.4315',
          imageType: String(
            imageType || (propertyType === 'apartment' ? 'prop_3d_apartment_royal' : 'prop_3d_villa_plot_a')
          ),
          publishedOnWeb: publishedOnWeb === 0 ? 0 : 1,
        })
        .returning();

      res.status(201).json({ property: inserted[0] });
    } catch (error: any) {
      console.error('Error in POST /api/admin/properties:', error);
      res.status(500).json({ error: 'নতুন প্রপার্টি যোগ করতে সমস্যা হয়েছে।' });
    }
  });

  app.put('/api/admin/properties/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const {
        titleBn,
        categoryBn,
        areaBn,
        locationBn,
        sizeBn,
        priceBdt,
        priceDisplayBn,
        bookingAmountBdt,
        bookingDisplayBn,
        statusBn,
        descriptionBn,
        imageType,
      } = req.body;
      const updated = await db
        .update(properties)
        .set({
          ...(titleBn ? { titleBn: String(titleBn).trim() } : {}),
          ...(categoryBn ? { categoryBn: String(categoryBn).trim() } : {}),
          ...(areaBn ? { areaBn: String(areaBn).trim() } : {}),
          ...(locationBn ? { locationBn: String(locationBn).trim() } : {}),
          ...(sizeBn ? { sizeBn: String(sizeBn).trim() } : {}),
          ...(priceBdt ? { priceBdt: Number(priceBdt) } : {}),
          ...(priceDisplayBn ? { priceDisplayBn: String(priceDisplayBn).trim() } : {}),
          ...(bookingAmountBdt ? { bookingAmountBdt: Number(bookingAmountBdt) } : {}),
          ...(bookingDisplayBn ? { bookingDisplayBn: String(bookingDisplayBn).trim() } : {}),
          ...(statusBn ? { statusBn: String(statusBn).trim() } : {}),
          ...(descriptionBn !== undefined ? { descriptionBn: String(descriptionBn).trim() } : {}),
          ...(imageType ? { imageType: String(imageType).trim() } : {}),
        })
        .where(eq(properties.id, id))
        .returning();
      res.json({ property: updated[0] });
    } catch (error: any) {
      console.error('Error in PUT /api/admin/properties/:id:', error);
      res.status(500).json({ error: 'প্রপার্টি আপডেট করতে সমস্যা হয়েছে।' });
    }
  });

  // Admin Add / Delete Gallery Item
  app.post('/api/admin/gallery', async (req, res) => {
    try {
      const { titleBn, categoryBn, mediaType, visualTheme, captionBn, durationBn } = req.body;
      if (!titleBn) {
        return res.status(400).json({ error: 'গ্যালারি আইটেমের শিরোনাম দিন।' });
      }
      const inserted = await db
        .insert(galleryItems)
        .values({
          titleBn: String(titleBn).trim(),
          categoryBn: String(categoryBn || 'ভবনের ছবি'),
          mediaType: String(mediaType || 'image'),
          visualTheme: String(visualTheme || (mediaType === 'video' ? 'video_3d_tower_walkthrough' : 'gallery_3d_twin_night')),
          captionBn: String(captionBn || ''),
          durationBn: String(durationBn || (mediaType === 'video' ? '০৩:৩০ মিনিট' : '')),
          publishedOnWeb: 1,
        })
        .returning();
      res.status(201).json({ item: inserted[0] });
    } catch (error: any) {
      console.error('Error in POST /api/admin/gallery:', error);
      res.status(500).json({ error: 'গ্যালারি আইটেম যোগ করতে সমস্যা হয়েছে।' });
    }
  });

  app.delete('/api/admin/gallery/:id', async (req, res) => {
    try {
      await db.delete(galleryItems).where(eq(galleryItems.id, Number(req.params.id)));
      res.json({ ok: true });
    } catch (error: any) {
      console.error('Error in DELETE /api/admin/gallery/:id:', error);
      res.status(500).json({ error: 'গ্যালারি আইটেম মুছতে সমস্যা হয়েছে।' });
    }
  });

  // Admin Approve / Delete Testimonial
  app.post('/api/admin/testimonials/:id/approve', async (req, res) => {
    try {
      const updated = await db
        .update(testimonials)
        .set({ approved: 1 })
        .where(eq(testimonials.id, Number(req.params.id)))
        .returning();
      res.json({ testimonial: updated[0] });
    } catch (error: any) {
      console.error('Error in POST /api/admin/testimonials/:id/approve:', error);
      res.status(500).json({ error: 'টেস্টিমোনিয়াল অনুমোদনে সমস্যা হয়েছে।' });
    }
  });

  app.delete('/api/admin/testimonials/:id', async (req, res) => {
    try {
      await db.delete(testimonials).where(eq(testimonials.id, Number(req.params.id)));
      res.json({ ok: true });
    } catch (error: any) {
      console.error('Error in DELETE /api/admin/testimonials/:id:', error);
      res.status(500).json({ error: 'টেস্টিমোনিয়াল মুছতে সমস্যা হয়েছে।' });
    }
  });

  // Admin Add Blog/News Article
  app.post('/api/admin/articles', async (req, res) => {
    try {
      const { titleBn, categoryBn, summaryBn, contentBn } = req.body;
      if (!titleBn || !contentBn) {
        return res.status(400).json({ error: 'প্রবন্ধের শিরোনাম ও বিস্তারিত বিবরণ আবশ্যক।' });
      }
      const inserted = await db
        .insert(articles)
        .values({
          slug: `article-${Date.now()}`,
          titleBn: String(titleBn).trim(),
          categoryBn: String(categoryBn || 'কোম্পানি ঘোষণা'),
          publishedDateBn: 'নভেম্বর ২০২৬',
          summaryBn: String(summaryBn || titleBn).trim(),
          contentBn: String(contentBn).trim(),
          visualTheme: 'guide_land',
        })
        .returning();
      res.status(201).json({ article: inserted[0] });
    } catch (error: any) {
      console.error('Error in POST /api/admin/articles:', error);
      res.status(500).json({ error: 'সংবাদ প্রকাশ করতে সমস্যা হয়েছে।' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`H & H Homes server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
