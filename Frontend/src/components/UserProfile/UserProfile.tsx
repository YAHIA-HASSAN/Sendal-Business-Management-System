import React, { Component } from 'react'
import user_img from "../../assets/user-img.png"
import './UserProfile.css'

export class UserProfile extends Component {
  render() {
    return (
      <div id='user-profile' className='box-card'>
        <img src={user_img} alt="user-img" className='w-10 rounded-full' />
        <div id='username' className='px-3 py-1' >نوح</div>
      </div>
    )
  }
}

export default UserProfile
