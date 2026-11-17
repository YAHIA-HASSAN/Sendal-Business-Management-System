import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import "./App.css";
import Aside from "./components/Aside/Aside";
import Bills from "./pages/Bills";
import Customers from "./pages/Customers";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import POS from "./pages/POS";
import Users from "./pages/Users";
import { useAuth } from "./auth/AuthContext";

export default function App() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  if (pathname.toLowerCase() === "/login") return user ? <Navigate to="/Home" replace /> : <Login />;
  if (!user) return <Navigate to="/Login" replace state={{ from: pathname }} />;

  const adminOnly = (element: ReactNode) => user.role === "admin" ? element : <Navigate to="/Home" replace />;
  return (
    <div className="app-shell">
      <Aside />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/POS" element={<POS />} />
        <Route path="/Inventory" element={adminOnly(<Inventory />)} />
        <Route path="/Bills" element={<Bills />} />
        <Route path="/Customers" element={<Customers />} />
        <Route path="/Users" element={adminOnly(<Users />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
