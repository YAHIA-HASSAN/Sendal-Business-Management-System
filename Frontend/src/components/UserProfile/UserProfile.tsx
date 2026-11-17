import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import userImg from "../../assets/user-img.png";
import logoutImg from "../../assets/switch.png";
import "./UserProfile.css";

export default function UserProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  function handleLogout() { logout(); navigate("/Login", { replace: true }); }
  return (
    <div id="user-profile" className="nav-user-card">
      <img src={userImg} alt="" className="w-10 rounded-full" />
      <div id="username" className="grow px-3 py-1"><span>{user?.name}</span><small>{user?.role === "admin" ? "مدير" : "بائع"}</small></div>
      <button type="button" className="icon cursor-pointer border-0 bg-transparent" onClick={handleLogout} aria-label="تسجيل الخروج">
        <img src={logoutImg} alt="" />
      </button>
    </div>
  );
}
