import React, { Component } from 'react'
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Aside from "./components/Aside/Aside";
import Home from "./pages/Home";
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Bills from './pages/Bills';
import Customers from './pages/Customers';
import Maintenance from './pages/Maintenance';

export class App extends Component {
  render() {
  return (
    <div className='col-span-4'>
      <Aside/>
      <Routes>
        <Route path="/Home" element={<Home />}/>
        <Route path="/POS" element={<POS />}/>
        <Route path="/Inventory" element={<Inventory />}/>
        <Route path="/Bills" element={<Bills />}/>
        <Route path="/Customers" element={<Customers />}/>
        <Route path="/Maintenance" element={<Maintenance />}/>
      </Routes>
    </div>
  );
}
}

export default App;
