import { Building2, LayoutDashboard, LogOut, Menu, Plus } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/auth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, logout } = useAuth();
  return <header className="site-header">
    <div className="container nav-shell">
      <Link to="/" className="brand"><span className="brand-mark"><Building2 size={19} /></span><span>Settla</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <NavLink to="/properties">Explore homes</NavLink>
        <a href="/#cities">Locations</a>
        <a href="/#how">How it works</a>
      </nav>
      <div className="nav-actions">
        {user ? <>
          <Button variant="ghost" asChild><Link to={user.role === "ADMIN" ? "/admin" : "/dashboard"}><LayoutDashboard size={16} /> Dashboard</Link></Button>
          {user.role === "USER" && <Button asChild><Link to="/dashboard/new"><Plus size={16} /> List property</Link></Button>}
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out"><LogOut size={18} /></Button>
        </> : <>
          <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
          <Button asChild><Link to="/login">List your property</Link></Button>
        </>}
        <Button variant="ghost" size="icon" className="mobile-menu" aria-label="Open menu"><Menu /></Button>
      </div>
    </div>
  </header>;
}
