import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8)
});

export const listingSchema = z.object({
  purpose: z.enum(["SALE", "RENT"]),
  propertyType: z.enum(["HOUSE", "CONDO", "APARTMENT", "LAND", "COMMERCIAL"]),
  title: z.string().trim().min(8).max(120),
  description: z.string().trim().min(40).max(5000),
  priceAmount: z.coerce.number().int().positive(),
  currency: z.enum(["MMK", "USD"]),
  city: z.enum(["YANGON", "MANDALAY", "BAGO"]),
  township: z.string().trim().min(2).max(80),
  addressLine: z.string().trim().min(5).max(200),
  bedrooms: z.coerce.number().int().min(0).max(100).nullable().optional(),
  bathrooms: z.coerce.number().int().min(0).max(100).nullable().optional(),
  areaValue: z.coerce.number().int().positive(),
  areaUnit: z.enum(["SQFT", "SQM", "ACRE"]),
  contactPhone: z.string().trim().max(40).nullable().optional(),
  contactEmail: z.union([z.email(), z.literal("")]).nullable().optional(),
  coverImageUrl: z.url()
}).refine((value) => value.contactPhone || value.contactEmail, {
  message: "Provide at least one contact method.",
  path: ["contactPhone"]
});

export const moderationSchema = z.object({
  status: z.enum(["PUBLISHED", "REJECTED", "ARCHIVED"]),
  rejectionReason: z.string().trim().min(5).max(500).optional()
}).refine((value) => value.status !== "REJECTED" || value.rejectionReason, {
  message: "A rejection reason is required.",
  path: ["rejectionReason"]
});
