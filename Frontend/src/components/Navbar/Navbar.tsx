import React, { Component } from "react";
import "./Navbar.css";
import { NavLink } from "react-router-dom";
export class Navbar extends Component {
  render() {
    return (
      <nav>
        <NavLink to="/POS">
          <div className="button justify-self-center m-4">فاتورة جديدة +</div>
        </NavLink>
        <ul>
          <NavLink to="/Home">
            <li>الرئيسية</li>
          </NavLink>
          <NavLink to="/Bills">
            <li>الفواتير</li>
          </NavLink>
          <NavLink to="/Inventory">
            <li>المخزن</li>
          </NavLink>
          <NavLink to="/Customers">
            <li>العملاء</li>
          </NavLink>
          <NavLink to="/Maintenance">
            <li>الصيانة</li>
          </NavLink>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
