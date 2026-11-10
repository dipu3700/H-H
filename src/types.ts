export type Language = 'bn' | 'en';

export interface CustomerUser {
  id: number;
  uid: string;
  email: string;
  name: string;
  phone: string;
  nidNumber: string;
  addressBn: string;
  role: string;
}

export interface SiteSettings {
  id: number;
  companyNameBn: string;
  companyNameEn: string;
  taglineBn: string;
  taglineAltBn: string;
  taglineEn: string;
  heroHeadlineBn: string;
  heroSubtitleBn: string;
  aboutIntroBn: string;
  missionBn: string;
  visionBn: string;
  coreValuesBn: string;
  officeAddressBn: string;
  phone: string;
  whatsapp: string;
  email: string;
  officeHoursBn: string;
  seoTitle: string;
  seoDescription: string;
}

export interface HeroSlideItem {
  id: number;
  badgeBn: string;
  titleBn: string;
  subtitleBn: string;
  highlightStatsBn: string;
  ctaPrimaryBn: string;
  ctaSecondaryBn: string;
  visualTheme: string;
  projectSlug: string;
  accentColor: string;
  displayOrder: number;
  publishedOnWeb: number;
}

export interface BoardMemberItem {
  id: number;
  nameBn: string;
  designationBn: string;
  roleKey: 'chairman' | 'md' | 'director' | string;
  qualificationBn: string;
  experienceBn: string;
  messageBn: string;
  quoteBn: string;
  email: string;
  phone: string;
  portraitTheme: string;
  displayOrder: number;
  publishedOnWeb: number;
}

export interface ProjectItem {
  id: number;
  slug: string;
  nameBn: string;
  nameEn: string;
  categoryBn: string;
  statusBn: string;
  areaBn: string;
  locationBn: string;
  sizeSummaryBn: string;
  priceSummaryBn: string;
  availabilityBn: string;
  descriptionBn: string;
  specificationsJson: string;
  lat: string;
  lng: string;
  imageType: string;
  featured: number;
  publishedOnWeb: number;
  totalBudgetBdt: number;
}

export interface PropertyItem {
  id: number;
  propertyCode: string;
  projectId: number | null;
  titleBn: string;
  titleEn: string;
  categoryBn: string;
  propertyType: 'land' | 'apartment' | 'commercial' | string;
  areaBn: string;
  locationBn: string;
  blockNo: string;
  plotNo: string;
  sizeBn: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  priceBdt: number;
  priceDisplayBn: string;
  bookingAmountBdt: number;
  bookingDisplayBn: string;
  paymentPlanBn: string;
  statusBn: string;
  descriptionBn: string;
  floorPlanSpecs: string;
  lat: string;
  lng: string;
  imageType: string;
  publishedOnWeb: number;
}

export interface BookingItem {
  id: number;
  bookingNumber: string;
  propertyId: number;
  userUid: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  nidNumber: string;
  addressBn: string;
  paymentPlanChoice: string;
  totalPriceBdt: number;
  bookingMoneyBdt: number;
  paidAmountBdt: number;
  dueAmountBdt: number;
  nextInstallmentDate: string;
  statusBn: string;
  notesBn: string;
  createdAt: string;
}

export interface PaymentItem {
  id: number;
  receiptNumber: string;
  bookingId: number;
  userUid: string;
  installmentNo: number;
  titleBn: string;
  amountBdt: number;
  dueDate: string;
  paidDate: string;
  paymentMethodBn: string;
  statusBn: string;
}

export interface ErpTransactionItem {
  id: number;
  voucherNo: string;
  transactionDate: string;
  type: 'income' | 'expense' | string;
  categoryBn: string;
  projectId: number;
  projectNameBn: string;
  titleBn: string;
  amountBdt: number;
  paymentMethodBn: string;
  referenceNo: string;
  recordedByBn: string;
  notesBn: string;
  createdAt: string;
}

export interface InquiryItem {
  id: number;
  name: string;
  phone: string;
  email: string;
  propertyCategoryBn: string;
  propertyId: number;
  message: string;
  statusBn: string;
  createdAt: string;
}

export interface ComplaintItem {
  id: number;
  userUid: string;
  customerName: string;
  subjectBn: string;
  messageBn: string;
  statusBn: string;
  resolutionBn: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  userUid: string;
  titleBn: string;
  messageBn: string;
  isRead: number;
  createdAt: string;
}

export interface GalleryItem {
  id: number;
  titleBn: string;
  categoryBn: string;
  mediaType: 'image' | 'video' | string;
  visualTheme: string;
  captionBn: string;
  durationBn: string;
  publishedOnWeb: number;
}

export interface TestimonialItem {
  id: number;
  customerNameBn: string;
  roleOrProfessionBn: string;
  projectNameBn: string;
  propertyUnitBn: string;
  reviewBn: string;
  rating: number;
  isVideoReview: number;
  videoDurationBn: string;
  videoTheme: string;
  approved: number;
}

export interface ArticleItem {
  id: number;
  slug: string;
  titleBn: string;
  categoryBn: string;
  publishedDateBn: string;
  summaryBn: string;
  contentBn: string;
  visualTheme: string;
}
