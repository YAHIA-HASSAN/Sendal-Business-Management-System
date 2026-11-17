import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user } = useAuth();
  const links: Array<[string, string]> = [["/Home", "الرئيسية"], ["/Bills", "الفواتير"], ["/Customers", "العملاء"]];
  if (user?.role === "admin") links.push(["/Inventory", "المخزن"], ["/Expenses", "المصروفات"], ["/Users", "المستخدمون"]);
  return (
    <nav className="side-nav" aria-label="التنقل الرئيسي">
      <NavLink to="/POS" className="side-new-invoice">فاتورة جديدة <span aria-hidden="true">＋</span></NavLink>
      <ul>
        {links.map(([to, label]) => <li key={to}><NavLink to={to} className={({ isActive }) => isActive ? "side-nav-link active" : "side-nav-link"}>{label}</NavLink></li>)}
      </ul>
    </nav>
  );
}
