import React, { Component } from 'react'
import Navbar from '../Navbar/Navbar'
import UserProfile from '../UserProfile/UserProfile'

export class aside extends Component {
  render() {
    return (
      <div>
        <Navbar/>

        <UserProfile/>
      </div>
    )
  }
}

export default aside
