import React, { Component } from "react";
import "./Aside.css";
import Navbar from "../Navbar/Navbar";
import UserProfile from "../UserProfile/UserProfile";
import sendalLogo from "../../assets/sendal-logo.png";

export class aside extends Component {
  render() {
    return (
      <aside className="flex flex-col justify-between h-dvh bg-[#0F172B] max-w-xs p-x-3 text-blue-50">
        <div>
          <div id="logo" className="box-card">
            <img
              src={sendalLogo}
              alt="Sendal Logo"
              className="w-20 rounded-full m-1"
            />
            <p className="pr-3 pt-4">سندال . . قدها وقدود</p>
          </div>

          <Navbar />
        </div>
        <UserProfile />
      </aside>
    );
  }
}

export default aside;
