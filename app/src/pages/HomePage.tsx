import { ArrowRight, Building2, CheckCircle2, Home, KeyRound, MapPin, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Listing } from "@/types";

const cities = [
  { name: "Yangon", copy: "Riverfront energy and modern city living", image: "https://images.unsplash.com/photo-1584897457027-5204f475a7e6?auto=format&fit=crop&w=1000&q=85" },
  { name: "Mandalay", copy: "Cultural heart, generous homes and new growth", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=85" },
  { name: "Bago", copy: "A calmer pace with room to breathe", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1000&q=85" }
];

export function HomePage() {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState("SALE");
  const [city, setCity] = useState("");
  const [q, setQ] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  useEffect(() => { api.listings().then(({ data }) => setListings(data.slice(0, 3))).catch(() => undefined); }, []);

  function search() {
    const params = new URLSearchParams({ purpose });
    if (city) params.set("city", city);
    if (q) params.set("q", q);
    navigate(`/properties?${params}`);
  }

  return <>
    <section className="hero">
      <div className="container hero-content">
        <p className="eyebrow"><span /> Property, made personal</p>
        <h1>Find the space<br />for your <em>next chapter.</em></h1>
        <p className="hero-lead">Explore thoughtfully listed homes and spaces across Myanmar's most vibrant cities.</p>
        <div className="search-panel">
          <div className="purpose-tabs">
            <button className={purpose === "SALE" ? "active" : ""} onClick={() => setPurpose("SALE")}>Buy</button>
            <button className={purpose === "RENT" ? "active" : ""} onClick={() => setPurpose("RENT")}>Rent</button>
          </div>
          <div className="search-row">
            <label><span>Location</span><select value={city} onChange={(e) => setCity(e.target.value)}><option value="">All cities</option><option value="YANGON">Yangon</option><option value="MANDALAY">Mandalay</option><option value="BAGO">Bago</option></select></label>
            <label className="grow"><span>What are you looking for?</span><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Condo, house, township…" onKeyDown={(e) => e.key === "Enter" && search()} /></label>
            <Button size="lg" onClick={search}><Search size={18} /> Search</Button>
          </div>
        </div>
      </div>
      <div className="hero-stat"><strong>150+</strong><span>verified places<br />across 3 cities</span></div>
    </section>

    <section className="section container">
      <div className="section-heading"><div><p className="eyebrow"><span /> Recently added</p><h2>Places worth<br />coming home to.</h2></div><Button variant="outline" asChild><Link to="/properties">Browse all properties <ArrowRight size={16} /></Link></Button></div>
      {listings.length ? <div className="property-grid">{listings.map((listing) => <PropertyCard listing={listing} key={listing.id} />)}</div> : <div className="empty-showcase"><Building2 size={36} /><h3>Your curated collection is loading</h3><p>Start the API and seed the database to see live properties here.</p><Button asChild><Link to="/properties">Open property search</Link></Button></div>}
    </section>

    <section className="city-section" id="cities"><div className="container"><p className="eyebrow light"><span /> Explore by city</p><h2>Three cities.<br /><em>Endless possibilities.</em></h2><div className="city-grid">{cities.map((item, index) => <Link className="city-card" to={`/properties?city=${item.name.toUpperCase()}`} key={item.name}><img src={item.image} alt={`${item.name} city`} /><div className="city-overlay"><span>0{index + 1}</span><div><h3>{item.name}</h3><p>{item.copy}</p></div><ArrowRight /></div></Link>)}</div></div></section>

    <section className="section container" id="how"><div className="section-heading"><div><p className="eyebrow"><span /> Made simple</p><h2>A better way to<br />find your place.</h2></div><p className="section-intro">Clear information, direct connections, and local focus—so you can move with confidence.</p></div><div className="benefit-grid"><article><Search /><span>01</span><h3>Search with clarity</h3><p>Filter by the details that matter, from city and price to space and property type.</p></article><article><ShieldCheck /><span>02</span><h3>Reviewed before live</h3><p>Every new listing enters an administrator review queue before appearing publicly.</p></article><article><KeyRound /><span>03</span><h3>Connect directly</h3><p>Reach property owners using the contact details they intentionally share.</p></article></div></section>

    <section className="cta"><div className="container cta-inner"><div><p className="eyebrow light"><span /> For property owners</p><h2>A great property<br />deserves to be seen.</h2><p>Create your listing in minutes, submit it for review, and connect with serious seekers.</p></div><Button size="lg" asChild><Link to="/login">List your property <ArrowRight /></Link></Button></div><div className="cta-watermark">SETTLA</div></section>
  </>;
}
