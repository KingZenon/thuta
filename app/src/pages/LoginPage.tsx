import { Building2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("owner@myproperty.demo");
  const [password, setPassword] = useState("Demo123!");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try { const user = await login(email, password); navigate(user.role === "ADMIN" ? "/admin" : "/dashboard"); }
    catch (err) { setError(err instanceof Error ? err.message : "Sign in failed"); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-visual"><Link to="/" className="brand light-brand"><span className="brand-mark"><Building2 /></span> Settla</Link><div><p className="eyebrow light"><span /> Welcome back</p><h1>Your next<br /><em>move starts here.</em></h1><p>Manage your properties or review the latest submissions.</p></div></section><section className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><p className="eyebrow"><span /> Account access</p><h2>Sign in to Settla</h2><p>Use one of the demo roles to explore the workflow.</p>{error && <div className="notice error">{error}</div>}<label><span>Email address</span><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label><span>Password</span><div className="password-input"><Input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShow(!show)} aria-label="Toggle password visibility">{show ? <EyeOff /> : <Eye />}</button></div></label><Button size="lg" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button><div className="demo-accounts"><strong>Demo accounts</strong><button type="button" onClick={() => { setEmail("owner@myproperty.demo"); setPassword("Demo123!"); }}><span>Property owner</span><small>owner@myproperty.demo</small></button><button type="button" onClick={() => { setEmail("admin@myproperty.demo"); setPassword("Demo123!"); }}><span>Administrator</span><small>admin@myproperty.demo</small></button></div><Link to="/" className="back-link">← Back to property search</Link></form></section></main>;
}
