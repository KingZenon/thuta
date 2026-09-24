import { Check, Clock3, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Listing } from "@/types";

export function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const load = () => api.adminListings().then(({ data }) => setListings(data));
  useEffect(() => { load().catch(() => undefined); }, []);
  async function decide(id: string, status: "PUBLISHED" | "REJECTED") { try { await api.moderate(id, status, reason[id]); setNotice(status === "PUBLISHED" ? "Listing approved and published." : "Listing returned to its owner with feedback."); await load(); } catch (e) { setNotice(e instanceof Error ? e.message : "Decision failed"); } }
  const pending = listings.filter((x) => x.status === "PENDING_REVIEW");
  return <main className="page container dashboard"><div className="dashboard-head"><div><p className="eyebrow"><span /> Administrator</p><h1>Listing review</h1><p>Review owner submissions before they enter the public marketplace.</p></div><div className="admin-identity"><ShieldCheck /><span>Admin workspace<small>Moderation enabled</small></span></div></div>{notice && <div className="notice success">{notice}</div>}<div className="stat-grid admin-stats"><article><span className="stat-icon"><Clock3 /></span><div><small>Awaiting review</small><strong>{pending.length}</strong></div></article><article><span className="stat-icon"><Check /></span><div><small>Published</small><strong>{listings.filter((x) => x.status === "PUBLISHED").length}</strong></div></article></div><section className="dashboard-panel"><div className="panel-head"><div><h2>Review queue</h2><p>Check the property, owner, imagery, and contact information.</p></div></div>{pending.length === 0 ? <div className="empty-small"><ShieldCheck size={32} /><h3>The queue is clear</h3><p>There are no property submissions waiting for review.</p></div> : <div className="review-list">{pending.map((item) => <article key={item.id}><img src={item.coverImageUrl} alt={item.title} /><div className="review-copy"><Badge>Pending review</Badge><h3>{item.title}</h3><p>{item.description}</p><small>Submitted by <strong>{item.owner?.displayName}</strong> · {item.township}, {item.city}</small><Input placeholder="Reason required only when rejecting" value={reason[item.id] ?? ""} onChange={(e) => setReason({ ...reason, [item.id]: e.target.value })} /></div><div className="review-actions"><Button onClick={() => decide(item.id, "PUBLISHED")}><Check /> Approve</Button><Button variant="outline" onClick={() => decide(item.id, "REJECTED")} disabled={!reason[item.id]}><X /> Reject</Button></div></article>)}</div>}</section></main>;
}
