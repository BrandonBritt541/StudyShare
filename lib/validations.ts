import { z } from 'zod';

// Authentication Schemas
export const signUpSchema = z.object({
  email: z.string().email().endsWith('.edu', { message: 'Only .edu emails are allowed' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

// Profile Schemas
export const profileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastInitial: z.string().max(1).optional(),
  major: z.string().optional(),
  collegeYear: z.enum(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']).optional(),
  gradYear: z.number().min(2000).max(2100).optional(),
});

// Listing Schemas
export const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['textbook', 'lab_supplies', 'calculator', 'electronics', 'notebook', 'other'], {
    errorMap: () => ({ message: 'Invalid item type' }),
  }),
  quality: z.enum(['new', 'like_new', 'good', 'fair'], {
    errorMap: () => ({ message: 'Invalid condition' }),
  }),
  priceCents: z.number().int().min(0, 'Price must be 0 or more'),
  courseCode: z.string().max(20).optional(),
  courseTitle: z.string().max(100).optional(),
  professor: z.string().max(100).optional(),
  major: z.string().max(100).optional(),
  imageUrls: z.array(z.string().url()).min(1, 'At least 1 image is required').max(6, 'Maximum 6 images allowed'),
});

// Message Schemas
export const messageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty').max(5000),
});

// Alert Schemas
export const alertSchema = z.object({
  queryText: z.string().min(1, 'Search term required').max(200),
});

// Referral Schemas
export const referralSchema = z.object({
  referralCode: z.string().length(5),
});

// Report Schemas
export const reportSchema = z.object({
  category: z.enum(['inappropriate_content', 'scam', 'harassment', 'other']),
  notes: z.string().max(1000).optional(),
  targetType: z.enum(['listing', 'user', 'message']),
  targetId: z.string().uuid(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type AlertInput = z.infer<typeof alertSchema>;
export type ReferralInput = z.infer<typeof referralSchema>;
export type ReportInput = z.infer<typeof reportSchema>;

// Filter Schemas for Search
export const listingFiltersSchema = z.object({
  types: z.array(z.enum(['textbook', 'lab_supplies', 'calculator', 'electronics', 'notebook', 'other'])).optional(),
  major: z.string().optional(),
  courseCode: z.string().optional(),
  professor: z.string().optional(),
  qualities: z.array(z.enum(['new', 'like_new', 'good', 'fair'])).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  sortBy: z.enum(['relevance', 'newest', 'price_asc', 'price_desc']).default('newest'),
  page: z.number().min(1).default(1),
  search: z.string().optional(),
});

export type ListingFilters = z.infer<typeof listingFiltersSchema>;
