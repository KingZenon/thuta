import { ArrowLeft, Bath, BedDouble, Mail, MapPin, MoveDiagonal, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { money } from "@/components/PropertyCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Listing } from "@/types";

export function PropertyPage() {
  const { slug = "" } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.listing(slug).then(({ data }) => setListing(data)).catch((e: Error) => setError(e.message)); }, [slug]);
  if (error) return <main className="page container"><div className="notice error">{error}</div></main>;
  if (!listing) return <main className="page container"><p>Loading property…</p></main>;
  return <main className="detail-page container">
    <Button variant="ghost" asChild><Link to="/properties"><ArrowLeft size={17} /> Back to properties</Link></Button>
    <div className="detail-hero"><img src={listing.coverImageUrl} alt={listing.title} /><Badge className="image-badge">For {listing.purpose.toLowerCase()}</Badge></div>
    <div className="detail-layout"><article><div className="detail-heading"><div><p className="eyebrow"><span /> {listing.propertyType.toLowerCase()}</p><h1>{listing.title}</h1><p className="location"><MapPin size={17} /> {listing.addressLine}</p></div><div className="detail-price">{money(listing.priceAmount, listing.currency)}{listing.purpose === "RENT" && <small>per month</small>}</div></div><div className="detail-facts"><span><BedDouble /> <strong>{listing.bedrooms ?? 0}</strong> bedrooms</span><span><Bath /> <strong>{listing.bathrooms ?? 0}</strong> bathrooms</span><span><MoveDiagonal /> <strong>{listing.areaValue.toLocaleString()}</strong> {listing.areaUnit.toLowerCase()}</span></div><div className="description"><h2>About this property</h2><p>{listing.description}</p></div></article><aside className="contact-card"><span className="verified"><ShieldCheck /> Reviewed listing</span><h3>Interested in this place?</h3><p>Contact {listing.owner?.displayName ?? "the property owner"} directly to learn more.</p>{listing.contactPhone && <Button size="lg" asChild><a href={`tel:${listing.contactPhone}`}><Phone /> {listing.contactPhone}</a></Button>}{listing.contactEmail && <Button size="lg" variant="outline" asChild><a href={`mailto:${listing.contactEmail}`}><Mail /> Send an email</a></Button>}<small>Always verify property details before making payments.</small></aside></div>
  </main>;
}
