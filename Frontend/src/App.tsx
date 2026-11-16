import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Aside from "./components/Aside/Aside";
import Bills from "./pages/Bills";
import Customers from "./pages/Customers";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Maintenance from "./pages/Maintenance";
import POS from "./pages/POS";

export default function App() {
  const { pathname } = useLocation();
  const isLoginPage = pathname.toLowerCase() === "/login";

  if (isLoginPage) {
    return <Routes><Route path="/Login" element={<Login />} /></Routes>;
  }

  return (
    <div className="app-shell">
      <Aside />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/POS" element={<POS />} />
        <Route path="/Inventory" element={<Inventory />} />
        <Route path="/Bills" element={<Bills />} />
        <Route path="/Customers" element={<Customers />} />
        <Route path="/Maintenance" element={<Maintenance />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
