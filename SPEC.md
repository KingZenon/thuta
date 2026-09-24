# Settla property portal — product features

This document tracks product behavior across the web, API, and future mobile client. Implementation details and technology choices live in `AGENTS.md` files. Current project behavior and setup live in the `README.md` files.

## Audience and locations

Settla helps people browse residential and commercial properties for sale or rent in Yangon, Mandalay, and Bago. Browsing is public. Listing management requires an account. The interface currently uses English and demo content.

## Current MVP behavior

- Visitors can view the home page, search published listings by purpose, city, or keyword, and open a listing detail page.
- Demo users can sign in. Owners can save listing drafts and submit them for administrator review. Administrators can publish, reject, or archive submitted listings. Only published listings appear in public search.
- Owners see their own listing statuses on a dashboard. Administrators have a review dashboard.
- Web visitors can choose light or dark mode. The choice persists in the browser; a first visit follows the system preference.

## Planned feature scope

- Registration, secure session refresh, profile and contact editing, and account recovery.
- Owner editing, unpublishing, closing, and archiving of listings, with clear status transitions and feedback.
- More search filters, sorting, pagination, shareable query state, and useful empty/loading/error states.
- Multiple listing photos with ordering, cover selection, accessible descriptions, and upload validation.
- A native mobile experience after the HTTP contract is stable.

These planned features are requirements for later work, not claims about the current application. See [app/SPEC.md](app/SPEC.md), [api/SPEC.md](api/SPEC.md), and [mobile/SPEC.md](mobile/SPEC.md) for project-specific behavior.

## Product rules

- Public search shows published listings only. Draft, pending review, rejected, and archived listings are private to their owner and administrators.
- Owners can manage only their own listings. Administrator moderation must be enforced by the API.
- Listings support sale or rent, a property type, price and currency, city and township, address, descriptive text, area, optional room counts, contact details, and an image.
- Invalid submissions receive useful field feedback. Listing URLs should remain stable and shareable.
- Core flows should work on mobile-sized screens and support keyboard use, labels, visible focus, and readable contrast.

## Public discovery requirements

A visitor should be able to choose Buy or Rent, select a city, enter a keyword, inspect matching cards, and open a stable listing URL. Result cards should show a photo, price, purpose, location, property type, and relevant property facts. A detail page should show accurate photos, description, price, location, and the seller's chosen contact methods.

Planned filters include township, property type, price range, minimum bedrooms and bathrooms, area range, furnishing, and amenities. Planned sort choices are newest, price ascending, price descending, and largest area. Filtered pages should be shareable and survive browser refresh and back/forward navigation. Pagination should make large result sets manageable. Unsupported filter values should produce clear feedback.

## Account and listing requirements

Registration should collect a display name, email, phone, and password. A signed-in owner should be able to create a draft, edit it, add and order photos, choose a cover photo, preview it, submit it for review, and see its status. Administrators should be able to approve, reject with a reason, and archive listings. Owners should be able to revise rejected listings. Later owner actions include unpublishing, marking a property sold or rented, and archiving it.

A draft needs purpose, property type, title, and city. Before submission, require a useful description, positive whole-unit price, currency, township, address, area and unit, contact name or owner identity, at least one contact method, and a cover image. Supported purpose values are sale and rent; property types are house, condo, apartment, land, and commercial; cities are Yangon, Mandalay, and Bago; currencies are MMK and USD. Bedrooms and bathrooms may be omitted or non-negative. Images need useful alternative text unless decorative.

Owner and administrator dashboards should show relevant listings and statuses. Visitors must not gain access to private drafts through the UI or direct API calls. Email verification and password reset should be presented only when their full workflows exist.

## Content and quality requirements

Demo listings should be clearly identified and use plausible local geography and pricing. Property photos should have known reuse rights and match the listing they illustrate. Published content must not imply a demo property is an actual available residence. Core flows should have understandable loading, empty, validation, and failure states. The interface should remain usable with keyboard navigation, browser zoom, and small screens, and should maintain readable contrast in both themes.
