import { ArrowUpRight, Building2, Clock3, Eye, Plus, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth";
import { money } from "@/components/PropertyCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Listing } from "@/types";

export function DashboardPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [notice, setNotice] = useState("");
  const load = () => api.myListings().then(({ data }) => setListings(data));
  useEffect(() => { load().catch(() => undefined); }, []);
  async function submit(id: string) { try { await api.submitListing(id); setNotice("Listing submitted for administrator review."); await load(); } catch (e) { setNotice(e instanceof Error ? e.message : "Could not submit"); } }
  const published = listings.filter((x) => x.status === "PUBLISHED").length;
  const review = listings.filter((x) => x.status === "PENDING_REVIEW").length;
  return <main className="page container dashboard">
    <div className="dashboard-head"><div><p className="eyebrow"><span /> Owner workspace</p><h1>Good to see you, {user?.displayName?.split(" ")[0]}.</h1><p>Keep your property details fresh and follow every review.</p></div><Button size="lg" asChild><Link to="/dashboard/new"><Plus /> Add a property</Link></Button></div>
    {notice && <div className="notice success">{notice}</div>}
    <div className="stat-grid"><article><span className="stat-icon"><Building2 /></span><div><small>All properties</small><strong>{listings.length}</strong></div></article><article><span className="stat-icon"><Eye /></span><div><small>Published</small><strong>{published}</strong></div></article><article><span className="stat-icon"><Clock3 /></span><div><small>In review</small><strong>{review}</strong></div></article></div>
    <section className="dashboard-panel"><div className="panel-head"><div><h2>Your properties</h2><p>Draft, submit, and track each listing.</p></div></div>{listings.length === 0 ? <div className="empty-small"><p>You have no properties yet.</p><Button asChild><Link to="/dashboard/new">Create the first one</Link></Button></div> : <div className="listing-table">{listings.map((item) => <article key={item.id}><img src={item.coverImageUrl} alt="" /><div className="listing-main"><div><Badge className={`status ${item.status.toLowerCase()}`}>{item.status.replace("_", " ")}</Badge><h3>{item.title}</h3><p>{item.township}, {item.city} · {money(item.priceAmount, item.currency)}</p>{item.rejectionReason && <small className="rejection">Review note: {item.rejectionReason}</small>}</div></div><div className="row-actions">{["DRAFT", "REJECTED"].includes(item.status) && <Button size="sm" onClick={() => submit(item.id)}><Send size={15} /> Submit</Button>}{item.status === "PUBLISHED" && <Button size="sm" variant="outline" asChild><Link to={`/properties/${item.slug}`}>View <ArrowUpRight size={15} /></Link></Button>}</div></article>)}</div>}</section>
  </main>;
}
