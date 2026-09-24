import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { AdminPage } from "@/pages/AdminPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NewListingPage } from "@/pages/NewListingPage";
import { PropertiesPage } from "@/pages/PropertiesPage";
import { PropertyPage } from "@/pages/PropertyPage";

function PublicLayout() { return <><SiteHeader /><Outlet /><footer><div className="container footer-inner"><span>© 2026 Settla</span><span>Property, made personal.</span><span>Yangon · Mandalay · Bago</span></div></footer></>; }
function Guard({ role }: { role?: "USER" | "ADMIN" }) { const { user, loading } = useAuth(); if (loading) return <div className="route-loader">Loading…</div>; if (!user) return <Navigate to="/login" replace />; if (role && user.role !== role) return <Navigate to={user.role === "ADMIN" ? "/admin" : "/dashboard"} replace />; return <Outlet />; }

export default function App() {
  return <AuthProvider><Routes><Route element={<PublicLayout />}><Route index element={<HomePage />} /><Route path="properties" element={<PropertiesPage />} /><Route path="properties/:slug" element={<PropertyPage />} /><Route element={<Guard role="USER" />}><Route path="dashboard" element={<DashboardPage />} /><Route path="dashboard/new" element={<NewListingPage />} /></Route><Route element={<Guard role="ADMIN" />}><Route path="admin" element={<AdminPage />} /></Route></Route><Route path="login" element={<LoginPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></AuthProvider>;
}
