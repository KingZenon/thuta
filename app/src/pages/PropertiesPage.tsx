import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Listing } from "@/types";

export function PropertiesPage() {
  const [params, setParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true); setError("");
    api.listings(`?${params}`).then(({ data }) => setListings(data)).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, [params]);
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next); };

  return <main className="page container">
    <div className="page-title"><p className="eyebrow"><span /> Property search</p><h1>Find a place that feels right.</h1><p>{loading ? "Searching…" : `${listings.length} properties found`}</p></div>
    <div className="filter-bar">
      <label><span>Purpose</span><select value={params.get("purpose") ?? ""} onChange={(e) => update("purpose", e.target.value)}><option value="">Buy & rent</option><option value="SALE">Buy</option><option value="RENT">Rent</option></select></label>
      <label><span>City</span><select value={params.get("city") ?? ""} onChange={(e) => update("city", e.target.value)}><option value="">Everywhere</option><option value="YANGON">Yangon</option><option value="MANDALAY">Mandalay</option><option value="BAGO">Bago</option></select></label>
      <label className="grow"><span>Keyword</span><div className="icon-input"><Search size={17} /><Input value={params.get("q") ?? ""} onChange={(e) => update("q", e.target.value)} placeholder="Township or property" /></div></label>
      <Button variant="outline"><SlidersHorizontal size={17} /> More filters</Button>
    </div>
    {error && <div className="notice error">{error}. Make sure the API is running at port 4000.</div>}
    {!loading && !error && listings.length === 0 && <div className="empty-showcase"><Search size={36} /><h3>No places match yet</h3><p>Try broadening the city or purpose filters.</p><Button onClick={() => setParams({})}>Clear filters</Button></div>}
    <div className="property-grid">{listings.map((listing) => <PropertyCard listing={listing} key={listing.id} />)}</div>
  </main>;
}
