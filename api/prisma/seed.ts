import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });
const password = "Demo123!";

const images = {
  condo: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267d?auto=format&fit=crop&w=1400&q=85",
  house: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
  apartment: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=85",
  commercial: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85"
};

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({ where: { email: "admin@myproperty.demo" }, update: {}, create: { email: "admin@myproperty.demo", passwordHash, displayName: "Demo Administrator", phone: "+95 9 770 000 001", role: "ADMIN" } });
  const owner = await prisma.user.upsert({ where: { email: "owner@myproperty.demo" }, update: {}, create: { email: "owner@myproperty.demo", passwordHash, displayName: "Thiri Aung", phone: "+95 9 770 000 002", role: "USER" } });
  const ownerTwo = await prisma.user.upsert({ where: { email: "owner2@myproperty.demo" }, update: {}, create: { email: "owner2@myproperty.demo", passwordHash, displayName: "Ko Min Thu", phone: "+95 9 770 000 003", role: "USER" } });

  await prisma.listing.deleteMany();
  await prisma.listing.createMany({ data: [
    { ownerId: owner.id, slug: "sunlit-condo-yankin-demo", status: "PUBLISHED", purpose: "SALE", propertyType: "CONDO", title: "Sunlit condo near Inya Lake", description: "Demo listing. A bright, carefully furnished corner residence with open city views, a generous living room, and convenient access to Yankin amenities.", priceAmount: 420000000, currency: "MMK", city: "YANGON", township: "Yankin", addressLine: "Near Inya Lake, Yankin Township", bedrooms: 3, bathrooms: 2, areaValue: 1650, areaUnit: "SQFT", contactPhone: owner.phone, contactEmail: owner.email, coverImageUrl: images.condo, submittedAt: new Date(), publishedAt: new Date() },
    { ownerId: ownerTwo.id, slug: "garden-house-chanmyathazi-demo", status: "PUBLISHED", purpose: "SALE", propertyType: "HOUSE", title: "Quiet garden house in Chanmyathazi", description: "Demo listing. A spacious family home with mature landscaping, shaded outdoor space, and flexible rooms for a home office or guest suite.", priceAmount: 780000000, currency: "MMK", city: "MANDALAY", township: "Chanmyathazi", addressLine: "South Chanmyathazi, Mandalay", bedrooms: 4, bathrooms: 3, areaValue: 3200, areaUnit: "SQFT", contactPhone: ownerTwo.phone, contactEmail: ownerTwo.email, coverImageUrl: images.house, submittedAt: new Date(), publishedAt: new Date() },
    { ownerId: owner.id, slug: "downtown-bago-apartment-demo", status: "PENDING_REVIEW", purpose: "RENT", propertyType: "APARTMENT", title: "Comfortable apartment in central Bago", description: "Demo listing. A practical, recently refreshed apartment close to daily conveniences with natural light and a well-proportioned main bedroom.", priceAmount: 950000, currency: "MMK", city: "BAGO", township: "Bago", addressLine: "Central Bago", bedrooms: 2, bathrooms: 1, areaValue: 980, areaUnit: "SQFT", contactPhone: owner.phone, contactEmail: owner.email, coverImageUrl: images.apartment, submittedAt: new Date() },
    { ownerId: owner.id, slug: "office-space-kamaryut-demo", status: "DRAFT", purpose: "RENT", propertyType: "COMMERCIAL", title: "Flexible office floor in Kamaryut", description: "Demo listing. A flexible office floor with meeting rooms, reliable natural light, and easy access to major transport routes in Kamaryut.", priceAmount: 2800000, currency: "MMK", city: "YANGON", township: "Kamaryut", addressLine: "Pyay Road, Kamaryut Township", bedrooms: 0, bathrooms: 2, areaValue: 2100, areaUnit: "SQFT", contactPhone: owner.phone, contactEmail: owner.email, coverImageUrl: images.commercial }
  ] });

  console.log("Seeded demo users and listings.");
  console.log(`Admin: ${admin.email} / ${password}`);
  console.log(`Owner: ${owner.email} / ${password}`);
  console.log(`Owner 2: ${ownerTwo.email} / ${password}`);
}

main().finally(() => prisma.$disconnect());
