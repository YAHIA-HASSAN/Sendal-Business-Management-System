import { Component } from "react";
import "./Aside.css";
import Navbar from "../Navbar/Navbar";
import UserProfile from "../UserProfile/UserProfile";
import sendalLogo from "../../assets/sendal-logo.png";

export class aside extends Component {
  render() {
    return (
      <aside className="flex w-64 shrink-0 flex-col justify-between min-h-0 h-dvh overflow-hidden bg-[#0F172B] max-w-xs px-3 text-blue-50">
        <div>
          <div id="logo" className="nav-user-card">
            <img
              src={sendalLogo}
              alt="Sendal Logo"
              className="w-20 rounded-full m-1"
            />
            <p className="w-full h-full text-center flex-wrap">سندال . . قدها وقدود</p>
          </div>

          <Navbar />
        </div>
        <UserProfile />
      </aside>
    );
  }
}

export default aside;
