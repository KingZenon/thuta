# Myanmar Property Portal — Product & Engineering Specification

Status: Draft for implementation  
Target: Web-first MVP, followed by mobile  
Last updated: 2026-09-12

## 1. Product summary

Build a public property marketplace for Myanmar where people can browse homes and commercial properties for sale or rent in Yangon, Mandalay, and Bago. Any registered user can publish and manage a listing. Browsing and searching are public; authentication is required only for listing management and account features.

The product will be delivered as three separate repositories:

| Repository | Purpose | Primary stack |
| --- | --- | --- |
| `app` | Public website and account/listing management UI | TypeScript, React, Vite, React Router, TanStack Query, shadcn/ui |
| `api` | REST API, authentication, business rules, image metadata, persistence | TypeScript, Node.js, Express, Prisma ORM 7, SQLite |
| `mobile` | Native iOS/Android client, implemented after the web MVP | TypeScript, React Native, Expo, Expo Router, TanStack Query |

The API is the source of truth. Web and mobile clients must share the same documented HTTP contract, but they remain independently deployable and must not import source files from one another.

## 2. Goals

- Let anyone search and inspect active listings without an account.
- Support listings in Yangon, Mandalay, and Bago for sale or rent.
- Allow any authenticated user to create, edit, publish, unpublish, and delete their own listings.
- Provide strong search and filters suitable for a property portal.
- Present realistic seed data with high-quality, properly licensed property photos.
- Deliver a responsive, accessible web experience first.
- Establish a stable API contract that can support an Expo mobile app later.
- Keep local setup simple with SQLite and repository-specific environment examples.

## 3. Non-goals for the MVP

- Agent subscriptions, paid promotion, payments, or commissions.
- In-app chat, appointment scheduling, mortgage calculations, or e-signatures.
- Automated property valuation or recommendations.
- Multi-country coverage or locations outside Yangon, Mandalay, and Bago.
- A full agency/office hierarchy or team accounts.
- Social login, passwordless login, or identity verification.
- Offline mobile behavior beyond normal client-side query caching.
- A production content-management system.

## 4. Users and permissions

### Visitor

- View the home page, search results, and listing details.
- Filter, sort, paginate, and share listing URLs.
- See listing contact details and initiate a phone or email action.
- Register or sign in.

### Registered user

- All visitor capabilities.
- Create and manage their own listings.
- Upload, order, caption, and remove listing photos.
- Save drafts, publish eligible listings, and mark listings as sold or rented.
- View a dashboard of their listings and statuses.
- Edit their profile and contact details.

### Administrator

An administrator role should exist in the data model and authorization layer even if the first UI is minimal.

- View and manage all users and listings.
- Unpublish or archive inappropriate listings.
- Restore an archived listing when appropriate.

Ownership and administrator checks must always be enforced by the API, never only by the client.

## 5. Core product flows

### Public discovery

1. A visitor opens the home page.
2. They choose Buy or Rent, select a city, and optionally provide a keyword.
3. Search results show photo cards, price, purpose, property type, location, bedrooms, bathrooms, and area.
4. The visitor refines results with filters and sorting.
5. Selecting a result opens a stable, shareable listing detail URL.

### Account creation and sign-in

1. A visitor registers with name, email, phone number, and password.
2. The API validates and normalizes the submitted values and stores a password hash.
3. The user is signed in and can open their dashboard.
4. Existing users can sign in and sign out.

Email verification and password reset may be introduced after MVP; the API and UI should not falsely claim those workflows exist before they are implemented.

### Publishing a listing

1. An authenticated user starts a new draft.
2. They enter purpose, property type, title, description, price, address/location, attributes, and contact preferences.
3. They add at least one photo and choose a cover image.
4. They preview the listing.
5. The API validates completeness and publishes it.
6. The listing becomes visible in public search.

### Listing lifecycle

`DRAFT` -> `PUBLISHED` -> `SOLD` or `RENTED` -> `ARCHIVED`

- A draft is visible only to its owner and administrators.
- A published listing is publicly searchable.
- Sold/rented listings have a public detail page but are excluded from default search.
- Archived listings are hidden from public access.
- A user can unpublish a published listing back to draft.
- Hard deletion should be restricted to drafts with no audit value; other deletion actions should archive records.

## 6. Web information architecture

### Public routes

| Route | Purpose |
| --- | --- |
| `/` | Home page with Buy/Rent search, city shortcuts, featured/recent properties |
| `/properties` | Search results with URL-backed filters, sorting, and pagination |
| `/properties/:slug` | Listing detail page |
| `/sign-in` | Sign-in form |
| `/register` | Registration form |

### Authenticated routes

| Route | Purpose |
| --- | --- |
| `/dashboard` | Account overview and listing counts |
| `/dashboard/listings` | Current user's listings with status filters |
| `/dashboard/listings/new` | Create listing flow |
| `/dashboard/listings/:id/edit` | Edit owned listing |
| `/dashboard/profile` | Profile and contact details |

### Administrator routes

| Route | Purpose |
| --- | --- |
| `/admin/listings` | Search and moderate all listings |
| `/admin/users` | Search users and inspect account status |

The web layout must be responsive from 360 px upward. Search state must live in query parameters so filtered result pages are shareable and browser navigation works naturally.

## 7. Search and filtering

### Search inputs

- Purpose: `SALE` or `RENT`.
- City: Yangon, Mandalay, or Bago.
- Township.
- Free-text query across title, description, township, and address text.
- Property type.
- Minimum and maximum price.
- Minimum bedrooms and bathrooms.
- Minimum and maximum floor area.
- Furnishing status.
- Amenities.

### Sorting

- Newest first (default).
- Price low to high.
- Price high to low.
- Largest area first.

### Pagination

- Use page-number pagination for the MVP.
- Default page size: 20; maximum: 50.
- Responses return `page`, `pageSize`, `totalItems`, and `totalPages`.
- Invalid or unsupported filter values return a clear `400` response rather than being silently accepted.

SQLite FTS5 is preferred for text search if available in the selected SQLite runtime. A documented `LIKE`-based fallback is acceptable for local environments without FTS5. Structured filters must use indexed columns.

## 8. Listing fields and validation

### Required to save a draft

- Purpose.
- Property type.
- Title.
- City.

### Required to publish

- All draft-required fields.
- Description.
- Price and currency.
- Township and address text.
- Floor area and area unit.
- At least one photo with exactly one cover photo.
- Contact name and at least one contact method: phone or email.

### Supported values

| Field | MVP values |
| --- | --- |
| Purpose | `SALE`, `RENT` |
| Property type | `HOUSE`, `CONDO`, `APARTMENT`, `LAND`, `COMMERCIAL` |
| City | `YANGON`, `MANDALAY`, `BAGO` |
| Currency | `MMK`, `USD` |
| Area unit | `SQFT`, `SQM`, `ACRE` |
| Furnishing | `UNFURNISHED`, `SEMI_FURNISHED`, `FULLY_FURNISHED` |
| Status | `DRAFT`, `PUBLISHED`, `SOLD`, `RENTED`, `ARCHIVED` |

Additional fields:

- Bedrooms and bathrooms: nullable non-negative integers.
- Latitude and longitude: nullable; no interactive map is required in MVP.
- Amenities: controlled values such as parking, lift, security, generator, balcony, garden, air conditioning, and water supply.
- Price display note: optional text for values such as negotiable or per month; numeric price remains mandatory.
- Slug: API-generated from title with a uniqueness suffix.
- Published, created, and updated timestamps.

Prices must be stored as integers in the currency's smallest practical unit. For the MVP, MMK and USD listing prices are entered and stored as whole currency units; floating-point storage is prohibited.

## 9. Data model and Prisma ORM

All primary keys are UUID strings. Timestamps are stored as UTC ISO 8601 strings. SQLite foreign keys must be enabled.

Prisma ORM 7 is the required database toolkit. The API repository must use:

- Prisma ORM and Prisma Client pinned to the same `7.x` release in the lockfile.
- The ESM-first `prisma-client` generator with an explicit output directory such as `src/generated/prisma`; generated client code is not hand-edited.
- `@prisma/adapter-better-sqlite3` for the local SQLite connection, passed explicitly to the `PrismaClient` constructor.
- A root-level `prisma.config.ts` containing the schema path, migration path, seed command, and `DATABASE_URL` loaded from the environment.
- A `prisma/schema.prisma` datasource with `provider = "sqlite"`; the connection URL belongs in `prisma.config.ts`, not the schema file.
- Prisma Migrate for all schema changes. Migration SQL must be committed and reviewed before it is applied outside local development.
- A singleton Prisma Client per API process, with explicit connection cleanup during graceful shutdown.

Application modules must access Prisma through a small database service/repository boundary so persistence details do not leak into HTTP handlers and a later PostgreSQL migration remains manageable. Raw SQL is allowed only for a measured need such as FTS5 search or SQLite-specific operational settings; it must be parameterized, isolated, documented, and covered by integration tests.

### `users`

- `id` primary key
- `email` unique, normalized to lowercase
- `password_hash`
- `display_name`
- `phone`
- `role` (`USER`, `ADMIN`)
- `status` (`ACTIVE`, `SUSPENDED`)
- `created_at`, `updated_at`

### `listings`

- `id` primary key
- `owner_id` foreign key to `users`
- `slug` unique
- `status`, `purpose`, `property_type`
- `title`, `description`
- `price_amount`, `currency`, `price_note`
- `city`, `township`, `address_line`
- `latitude`, `longitude`
- `bedrooms`, `bathrooms`
- `area_value`, `area_unit`
- `furnishing`
- `contact_name`, `contact_phone`, `contact_email`
- `published_at`, `created_at`, `updated_at`, `archived_at`

### `listing_photos`

- `id` primary key
- `listing_id` foreign key to `listings`
- `storage_key`
- `url`
- `alt_text`
- `width`, `height`
- `sort_order`
- `is_cover`
- `created_at`

Enforce a unique photo order per listing. Business logic must enforce exactly one cover photo for a published listing.

### `amenities`

- `id` primary key
- `key` unique
- `label`

### `listing_amenities`

- `listing_id` foreign key
- `amenity_id` foreign key
- composite primary key on both columns

### `refresh_tokens`

- `id` primary key
- `user_id` foreign key
- `token_hash`
- `expires_at`, `revoked_at`, `created_at`
- optional client metadata such as `user_agent`

Create Prisma schema indexes for public status/published date, city, purpose, property type, price, bedrooms, area, owner/status, and all foreign keys. Schema changes must use committed Prisma migrations; `prisma db push` is permitted only for disposable local prototyping and must not be part of shared, CI, staging, or production workflows.

## 10. API contract

Base path: `/api/v1`  
Content type: JSON except image upload requests  
Specification: committed OpenAPI 3.1 document in the `api` repository

### Authentication

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Create an account |
| `POST` | `/auth/login` | Public | Start a session |
| `POST` | `/auth/refresh` | Refresh token | Rotate access credentials |
| `POST` | `/auth/logout` | Authenticated | Revoke current refresh token |
| `GET` | `/auth/me` | Authenticated | Return current user |

Use short-lived JWT access tokens and rotating, revocable refresh tokens. For the browser, the refresh token must be stored in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie in production. The web client must keep the access token in memory, not local storage. The later native app should store refresh credentials using Expo SecureStore. Passwords must be hashed with Argon2id or bcrypt using an appropriate work factor.

### Listings

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/listings` | Public | Search published listings |
| `GET` | `/listings/:slug` | Public | Read a public listing |
| `POST` | `/listings` | Authenticated | Create a draft |
| `GET` | `/me/listings` | Authenticated | List owned listings of all statuses |
| `GET` | `/me/listings/:id` | Owner | Read an owned listing |
| `PATCH` | `/me/listings/:id` | Owner | Edit an owned listing |
| `POST` | `/me/listings/:id/publish` | Owner | Validate and publish |
| `POST` | `/me/listings/:id/unpublish` | Owner | Return to draft |
| `POST` | `/me/listings/:id/close` | Owner | Mark sold or rented |
| `DELETE` | `/me/listings/:id` | Owner | Delete eligible draft or archive listing |

### Photos

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/me/listings/:id/photos` | Owner | Upload one or more photos |
| `PATCH` | `/me/listings/:id/photos/:photoId` | Owner | Update alt text/order/cover selection |
| `DELETE` | `/me/listings/:id/photos/:photoId` | Owner | Remove a photo |

The initial implementation may store uploads on a local filesystem in development, behind a `PhotoStorage` interface. Production must use object storage and persist only keys/URLs and metadata in SQLite. Validate MIME type from file content, cap file size and count, generate safe filenames, and create normalized display variants. Do not accept SVG uploads.

### Reference and administration

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/locations` | Public | Return supported cities and townships |
| `GET` | `/amenities` | Public | Return filter/form options |
| `GET` | `/admin/listings` | Admin | Search all listings |
| `PATCH` | `/admin/listings/:id/status` | Admin | Moderate listing status |
| `GET` | `/admin/users` | Admin | Search users |
| `PATCH` | `/admin/users/:id/status` | Admin | Suspend or reactivate a user |

### Response conventions

Successful single-resource responses use `{ "data": ... }`. Collections use `{ "data": [...], "meta": ... }`. Errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request could not be validated.",
    "fields": {
      "priceAmount": "Must be greater than zero."
    },
    "requestId": "..."
  }
}
```

Use stable machine-readable error codes. Never return stack traces or sensitive database errors.

## 11. Web application specification

### Foundation

- TypeScript with strict mode.
- React with Vite.
- React Router for routing.
- TanStack Query for server state.
- React Hook Form plus Zod for forms and client-side validation.
- shadcn/ui initialized using preset `b7ClNFsdU` (equivalent intended initialization: `npx shadcn@latest init --preset b7ClNFsdU`).
- Generated shadcn components are owned by the `app` repository and may be adapted to the product.
- A small typed API client generated from, or verified against, the API's OpenAPI document.

### Visual direction

- Trustworthy, modern property-marketplace aesthetic.
- Photo-led cards with a restrained neutral palette and one clear brand accent.
- Strong hierarchy for price, location, and core property facts.
- No generic dashboard look on public pages.
- Consistent skeleton, empty, error, and loading states.
- Images preserve aspect ratio, reserve layout space, lazy-load below the fold, and use descriptive alt text.

### Key components

- Site header and mobile navigation.
- Buy/Rent segmented search control.
- Search filter bar and mobile filter sheet.
- Applied-filter chips and clear-all action.
- Listing card and responsive listing grid.
- Photo gallery/lightbox.
- Price and property-facts summary.
- Listing form with logical sections and photo ordering.
- Dashboard listing table/cards.
- Confirmation dialogs for destructive or lifecycle actions.
- Toasts plus inline field errors where appropriate.

### SEO and sharing

- Unique title and description for home, results, and listing detail pages.
- Canonical URL for listing pages.
- Open Graph metadata using the cover photo.
- JSON-LD using the closest applicable schema.org types.
- Human-readable listing slugs.
- A generated sitemap for published listings is desirable for MVP; server-side rendering is deferred unless discoverability testing shows the SPA is insufficient.

## 12. Mobile application follow-on

The `mobile` repository starts only after the web MVP API contract is stable.

- Expo managed workflow and TypeScript.
- Expo Router for file-based navigation.
- TanStack Query and the same generated API contract used by the web app.
- Native search/filter screens, listing detail, authentication, dashboard, and listing creation/editing.
- Expo ImagePicker for listing photos and SecureStore for refresh credentials.
- Deep links for listing URLs.
- Camera, photo library, and notification permissions requested only when needed.
- Push notifications, maps, and offline listing drafts are post-MVP.

The mobile app should match product tokens and behavior, not attempt to reuse DOM components from the web repository.

## 13. Seed data and photography

The API repository must include a deterministic seed command that creates:

- At least 2 demo users plus 1 administrator.
- At least 24 published listings: a minimum of 8 per city.
- A meaningful mix of sale and rent listings in every city.
- All five property types represented across the dataset.
- Plausible Myanmar township names, prices, descriptions, amenities, and contact data.
- At least 3 photos per listing and one explicit cover photo.
- A small number of draft, sold, rented, and archived records for dashboard and moderation testing.

Photography requirements:

- Use real, high-resolution property photos with explicit permission for reuse, such as appropriately licensed Unsplash images or commissioned/project-owned assets.
- Record source URL, creator name, source page, and license/usage note in seed metadata or a seed asset manifest.
- Download and pin approved seed assets for repeatable local development; do not rely on volatile random-photo endpoints at runtime.
- Match photos plausibly to the listing type and description; do not present identifiable private residences as if they are actual properties for sale.
- Mark every seeded listing clearly as demo content in its description.
- Use local placeholder assets in automated tests so tests never depend on external networks.

## 14. Accessibility, localization, and formatting

- Meet WCAG 2.2 AA for color contrast, keyboard access, labels, focus indication, dialogs, and error feedback.
- Every meaningful listing image requires useful alt text; decorative imagery uses empty alt text.
- Support browser zoom and text reflow without lost actions or content.
- Format numbers and dates through `Intl`, using Myanmar locale conventions where practical.
- The MVP interface language is English. All user-facing strings must be centralized so Burmese localization can be added without restructuring components.
- Store canonical values such as enums and currency codes; localize display labels in clients.

## 15. Security and abuse controls

- Validate all request inputs at the API boundary with shared server schemas.
- Use parameterized database queries through the selected query layer.
- Apply authentication and authorization middleware to every protected route.
- Rate-limit registration, login, refresh, uploads, and write endpoints.
- Configure CORS with an explicit allowlist and credential rules.
- Use Helmet and secure cookie settings in production.
- Reject unsupported content types and enforce JSON/body/upload size limits.
- Strip image metadata where practical and never serve uploaded files with executable content types.
- Avoid exposing user email addresses unless the listing owner intentionally selects email as a contact method.
- Log authentication and moderation events without logging passwords, tokens, or sensitive payloads.
- Store secrets only in environment variables; commit `.env.example`, never real credentials.
- Dependency and source security checks must run in CI.

## 16. Reliability and performance

- Public read endpoints target a p95 response time below 500 ms with the seeded dataset in a normal production environment, excluding image transfer.
- Search should return the first result payload within 1 second under normal broadband conditions.
- Use responsive image variants and modern formats where supported.
- Add HTTP caching headers for public listing reads and long-lived immutable caching for versioned images.
- Enable SQLite WAL mode, a busy timeout, and graceful shutdown.
- Run migrations before serving traffic and back up the database before production migrations.
- Return a request ID in API responses and structured logs.
- Provide `/health/live` and `/health/ready`; readiness checks database access.

SQLite is acceptable for the initial single-instance deployment. Horizontal API scaling or sustained concurrent write pressure requires a documented migration plan to PostgreSQL before scaling beyond SQLite's operational limits.

## 17. Repository conventions

Each repository is independently initialized, versioned, tested, and deployed. The parent folder is not required to be a Git repository.

### `app`

- `src/components`, including shadcn primitives under `src/components/ui`
- `src/features` grouped by domain
- `src/routes`
- `src/lib` for API/query/config utilities
- `src/styles`
- `tests` for integration/end-to-end support as appropriate

### `api`

- `src/modules` grouped by domain
- `src/http` for server composition and middleware
- `src/db` for the Prisma Client lifecycle and database helpers
- `src/generated/prisma` for generated Prisma Client output
- `src/storage` for the photo storage abstraction
- `prisma/schema.prisma`, `prisma/migrations`, and `prisma/seed.ts`
- `prisma.config.ts` at the repository root
- `openapi/openapi.yaml`
- `tests`

### `mobile`

- `app` for Expo Router screens
- `src/components`
- `src/features`
- `src/lib`
- `src/theme`
- `assets`

Use the same formatter and lint philosophy in all repositories. Exact package versions and package manager must be recorded by lockfiles when implementation begins. Cross-repository API changes follow this order: update OpenAPI, validate/generate clients, implement API, then update consumers.

## 18. Configuration

Expected API environment variables:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `APP_ORIGIN`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_TTL`
- `REFRESH_TOKEN_TTL`
- storage provider and provider-specific values

Expected web environment variables:

- `VITE_API_BASE_URL`

Expected mobile environment variables:

- `EXPO_PUBLIC_API_BASE_URL`

Every repository must fail fast with a readable error when required configuration is missing.

For local API development, `DATABASE_URL` uses a SQLite file URL. Its exact relative location must be documented with regard to `prisma.config.ts` so developers and CI consistently target the intended database file.

## 19. Testing strategy

### API

- Unit tests for validation, permissions, lifecycle transitions, and search parsing.
- Integration tests against a unique temporary SQLite database created by applying real Prisma migrations.
- Tests must generate Prisma Client before type checking or running integration tests.
- Contract tests that validate responses against OpenAPI.
- Upload tests for size, type, ownership, ordering, and cover-photo rules.

### Web

- Component tests for forms, filters, cards, and error states.
- Integration tests for URL-backed search and authentication-aware navigation.
- End-to-end tests for public search, registration/login, create/edit/publish, and ownership enforcement.
- Automated accessibility checks on core pages, backed by keyboard/manual checks.

### Mobile

- Added in the mobile phase for navigation, authentication persistence, search, details, and listing management.

Tests must use isolated data and must not mutate the developer's normal database.

## 20. Delivery phases

### Phase 0 — Contracts and foundations

- Initialize the three independent repositories.
- Select package manager and pin runtime versions.
- Configure Prisma ORM 7, its SQLite driver adapter, schema, generated-client output, migrations, and deterministic seed command.
- Define OpenAPI, shared enums, linting, formatting, CI, and environment examples.
- Initialize shadcn/ui in `app` with preset `b7ClNFsdU`.

### Phase 1 — API and seed content

- Authentication and authorization.
- Listing lifecycle, search, filters, photos, locations, and amenities.
- Migrations, deterministic seeds, health checks, OpenAPI, and API tests.

### Phase 2 — Public web experience

- Home, search results, listing detail, responsive navigation, SEO metadata, and accessibility.

### Phase 3 — Web account experience

- Registration/sign-in, dashboard, profile, listing editor, photo management, lifecycle actions, and basic admin moderation.

### Phase 4 — Hardening and web launch

- End-to-end and accessibility testing, performance pass, image optimization, security review, backups, deployment documentation, and production seed/demo-content policy.

### Phase 5 — Expo mobile app

- Native implementation against the stable v1 API, followed by store-readiness work.

## 21. MVP acceptance criteria

The web MVP is complete when all of the following are true:

- A visitor can search published properties by purpose and city and combine all documented filters.
- Search filters survive refresh, can be shared as a URL, and support empty/error/loading states.
- Listing detail pages show a working gallery, accurate property facts, description, location, price, and selected contact methods.
- A user can register, sign in, remain signed in via refresh rotation, and sign out.
- An authenticated user can create a draft, upload and order photos, select a cover, preview, publish, edit, unpublish, close, and archive their own listing.
- A user cannot read private drafts or mutate another user's listing, including by calling the API directly.
- Seed data meets the volume, location, variety, attribution, and photo requirements in this specification.
- Core flows work at mobile, tablet, and desktop widths and pass the agreed accessibility checks.
- API inputs, errors, pagination, and authentication behavior match the committed OpenAPI document.
- Prisma migrations and the Prisma seed command succeed from a clean SQLite database.
- Automated test suites and repository CI checks pass.
- Setup instructions allow a new developer to run the API and web app locally without undocumented steps.

## 22. Decisions to confirm before implementation

These choices do not block this specification, but they must be resolved during Phase 0 and documented in the relevant repository:

- Brand name, logo, color palette, and preferred English/Burmese typography.
- Exact township list and whether Bago means Bago city only or the wider Bago Region.
- Default currency and whether rental price periods require a structured field (`MONTH`, `YEAR`) rather than display text.
- Production hosting, object-storage provider, email provider, and domain.
- Whether contact phone numbers are visible immediately or behind an explicit reveal action.
- Whether public sold/rented listing pages remain indexed by search engines.

## 23. Definition of done for each repository

A repository change is done only when implementation, migrations where applicable, tests, documentation, environment examples, lint/type checks, and relevant accessibility/security considerations are complete. Generated artifacts must be reproducible, and no repository may depend on uncommitted files from another repository.
