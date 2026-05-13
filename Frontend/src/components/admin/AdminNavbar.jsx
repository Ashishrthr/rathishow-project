import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const AdminNavbar = () => {
  return (
    <div className='px-6 md:px-10 h-16 border-b border-gray-300/30 flex items-center justify-between'>
        <Link to='/'>
        <img className='w-36 h-auto' src={assets.logo} alt="" />
        </Link>
        
    </div>
  )
}

export default AdminNavbar