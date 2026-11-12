import React, { Component } from 'react'
import "./Navbar.css"
export class Navbar extends Component {
  render() {
    return (
        <nav>
          <ul>
            <li className="button justify-self-center">
              فاتورة جديدة +
              </li>
            <li>الفواتير</li>
            <li>المخزن</li>
            <li>العملاء</li>
            <li>العملاء</li>
          </ul>
        </nav>
    )
  }
}

export default Navbar