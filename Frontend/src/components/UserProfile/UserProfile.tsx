import React, { Component } from 'react'
import user_img from "../../assets/user-img.png"

export class UserProfile extends Component {
  render() {
    return (
      <div id='user-profile'>
        <img src={user_img} alt="user-img" />
        <div id='username'>Yahia</div>
      </div>
    )
  }
}

export default UserProfile
