import { Component } from "react";
import "./Purchase.css";
import { NavLink } from "react-router-dom";

export class Purchase extends Component {
  render() {
    return (
      <div id="purchase">
        <div>
          <h2>الفاتورة</h2>
        <div id="purchase-items">
          <div className="purchase-item">
           <div className="quantity">
            <input type="button" value="+" />
            <p>1</p>
            <input type="button" value="-" />
           </div>
           <div className="name"> شاشة ايفون 13</div>
           <div className="price"> 300</div>
          </div>
            <div className="purchase-item">
           <div className="quantity">
            <input type="button" value="+" />
            <p>1</p>
            <input type="button" value="-" />
           </div>
           <div className="name"> شاشة ايفون 13</div>
           <div className="price"> 300</div>
          </div>
        </div>
        </div>
        <NavLink id="purchase-pay" to="" className="button bottom-0 w-full">
          تأكيد الفاتورة
        </NavLink>
      </div>
    );
  }
}

export default Purchase;
