export type Role = "USER" | "ADMIN";
export type User = { id: string; email: string; displayName: string; role: Role };

export type Listing = {
  id: string;
  slug: string;
  ownerId: string;
  owner?: { id: string; displayName: string; email: string };
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
  purpose: "SALE" | "RENT";
  propertyType: string;
  title: string;
  description: string;
  priceAmount: number;
  currency: "MMK" | "USD";
  city: "YANGON" | "MANDALAY" | "BAGO";
  township: string;
  addressLine: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaValue: number;
  areaUnit: "SQFT" | "SQM" | "ACRE";
  contactPhone?: string | null;
  contactEmail?: string | null;
  coverImageUrl: string;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListingInput = Omit<Listing, "id" | "slug" | "ownerId" | "owner" | "status" | "rejectionReason" | "createdAt" | "updatedAt">;
