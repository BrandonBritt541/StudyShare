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
  title: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['textbook', 'lab_supplies', 'calculator', 'electronics', 'notebook', 'other']),
  quality: z.enum(['new', 'like_new', 'good', 'fair']),
  priceCents: z.number().int().min(0),
  courseCode: z.string().max(20).optional(),
  courseTitle: z.string().max(100).optional(),
  professor: z.string().max(100).optional(),
  major: z.string().max(100).optional(),
  images: z.array(z.string()).max(6),
});

// Message Schemas
export const messageSchema = z.object({
  body: z.string().min(1).max(5000),
});

// Alert Schemas
export const alertSchema = z.object({
  queryText: z.string().min(1).max(200),
  expiresAt: z.date(),
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
