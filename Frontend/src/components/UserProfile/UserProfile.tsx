import { Component } from 'react'
import user_img from "../../assets/user-img.png"
import logout_img from "../../assets/switch.png"
import './UserProfile.css'
import { NavLink } from 'react-router-dom'

export class UserProfile extends Component {
  render() {
    return (
      <div id='user-profile' className='nav-user-card'>
        <img src={user_img} alt="user-img" className='w-10 rounded-full' />
        <div id='username' className='px-3 py-1 grow' >نوح</div>
        <NavLink to="/Login" className='icon'>
          <img src={logout_img} alt="Logout" />
        </NavLink>
      </div>
    )
  }
}

export default UserProfile
