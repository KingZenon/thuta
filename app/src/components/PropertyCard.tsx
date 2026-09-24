import { ArrowUpRight, Bath, BedDouble, MapPin, MoveDiagonal } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/types";

export const money = (amount: number, currency: string) => `${new Intl.NumberFormat("en-US").format(amount)} ${currency}`;

export function PropertyCard({ listing }: { listing: Listing }) {
  return <Link to={`/properties/${listing.slug}`} className="property-card">
    <div className="card-image-wrap">
      <img src={listing.coverImageUrl} alt={listing.title} className="card-image" />
      <Badge className="image-badge">For {listing.purpose === "SALE" ? "sale" : "rent"}</Badge>
      <span className="card-arrow"><ArrowUpRight size={18} /></span>
    </div>
    <div className="card-body">
      <div className="card-price">{money(listing.priceAmount, listing.currency)}{listing.purpose === "RENT" && <small> / month</small>}</div>
      <h3>{listing.title}</h3>
      <p className="location"><MapPin size={15} /> {listing.township}, {listing.city[0] + listing.city.slice(1).toLowerCase()}</p>
      <div className="facts">
        <span><BedDouble size={16} /> {listing.bedrooms ?? 0} beds</span>
        <span><Bath size={16} /> {listing.bathrooms ?? 0} baths</span>
        <span><MoveDiagonal size={16} /> {listing.areaValue.toLocaleString()} {listing.areaUnit.toLowerCase()}</span>
      </div>
    </div>
  </Link>;
}
