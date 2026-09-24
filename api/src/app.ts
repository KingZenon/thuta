import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { requireAdmin, requireAuth, signToken } from "./auth.js";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { listingSchema, loginSchema, moderationSchema } from "./validation.js";

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: config.APP_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

const serializeListing = (listing: any) => ({
  ...listing,
  owner: listing.owner ? { id: listing.owner.id, displayName: listing.owner.displayName, email: listing.owner.email } : undefined
});

const slugify = (title: string) => `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${crypto.randomUUID().slice(0, 8)}`;

app.get("/health/live", (_req, res) => res.json({ status: "ok" }));
app.get("/health/ready", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ready" });
});

app.post("/api/v1/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Check your email and password." } });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || user.status !== "ACTIVE" || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." } });
  }
  const safeUser = { id: user.id, email: user.email, role: user.role as "USER" | "ADMIN", displayName: user.displayName };
  return res.json({ data: { accessToken: signToken(safeUser), user: safeUser } });
});

app.get("/api/v1/auth/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, displayName: true, role: true } });
  if (!user) return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found." } });
  return res.json({ data: user });
});

app.get("/api/v1/listings", async (req, res) => {
  const city = typeof req.query.city === "string" ? req.query.city : undefined;
  const purpose = typeof req.query.purpose === "string" ? req.query.purpose : undefined;
  const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;
  const listings = await prisma.listing.findMany({
    where: {
      status: "PUBLISHED",
      ...(city ? { city } : {}),
      ...(purpose ? { purpose } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { township: { contains: q } }, { description: { contains: q } }] } : {})
    },
    include: { owner: true },
    orderBy: { publishedAt: "desc" }
  });
  return res.json({ data: listings.map(serializeListing), meta: { totalItems: listings.length } });
});

app.get("/api/v1/listings/:slug", async (req, res) => {
  const listing = await prisma.listing.findFirst({ where: { slug: String(req.params.slug), status: "PUBLISHED" }, include: { owner: true } });
  if (!listing) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Listing not found." } });
  return res.json({ data: serializeListing(listing) });
});

app.get("/api/v1/me/listings", requireAuth, async (req, res) => {
  const listings = await prisma.listing.findMany({ where: { ownerId: req.user!.id }, orderBy: { updatedAt: "desc" } });
  return res.json({ data: listings });
});

app.post("/api/v1/listings", requireAuth, async (req, res) => {
  const parsed = listingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Check the listing details.", fields: parsed.error.flatten().fieldErrors } });
  const listing = await prisma.listing.create({ data: { ...parsed.data, slug: slugify(parsed.data.title), ownerId: req.user!.id, status: "DRAFT" } });
  return res.status(201).json({ data: listing });
});

app.patch("/api/v1/me/listings/:id", requireAuth, async (req, res) => {
  const parsed = listingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Check the listing details.", fields: parsed.error.flatten().fieldErrors } });
  const owned = await prisma.listing.findFirst({ where: { id: String(req.params.id), ownerId: req.user!.id } });
  if (!owned) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Listing not found." } });
  if (owned.status === "PENDING_REVIEW" || owned.status === "PUBLISHED") return res.status(409).json({ error: { code: "INVALID_STATE", message: "Unpublish or wait for review before editing." } });
  const listing = await prisma.listing.update({ where: { id: owned.id }, data: { ...parsed.data, status: "DRAFT", rejectionReason: null } });
  return res.json({ data: listing });
});

app.post("/api/v1/me/listings/:id/submit", requireAuth, async (req, res) => {
  const owned = await prisma.listing.findFirst({ where: { id: String(req.params.id), ownerId: req.user!.id } });
  if (!owned) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Listing not found." } });
  if (!["DRAFT", "REJECTED"].includes(owned.status)) return res.status(409).json({ error: { code: "INVALID_STATE", message: "Only drafts or rejected listings can be submitted." } });
  const listing = await prisma.listing.update({ where: { id: owned.id }, data: { status: "PENDING_REVIEW", submittedAt: new Date(), rejectionReason: null } });
  return res.json({ data: listing });
});

app.get("/api/v1/admin/listings", requireAuth, requireAdmin, async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const listings = await prisma.listing.findMany({ where: status ? { status } : undefined, include: { owner: true }, orderBy: { updatedAt: "desc" } });
  return res.json({ data: listings.map(serializeListing), meta: { totalItems: listings.length } });
});

app.patch("/api/v1/admin/listings/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const parsed = moderationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Check the moderation decision.", fields: parsed.error.flatten().fieldErrors } });
  const existing = await prisma.listing.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Listing not found." } });
  const listing = await prisma.listing.update({
    where: { id: existing.id },
    data: {
      status: parsed.data.status,
      rejectionReason: parsed.data.status === "REJECTED" ? parsed.data.rejectionReason : null,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : existing.publishedAt
    }
  });
  return res.json({ data: listing });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong." } });
});
