import React from 'react'
import { assets } from '../../assets/assets'
import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, PlusSquareIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const AdminSidebar = () => {
    const { user } = useAppContext()

    const adminNavLinks = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboardIcon },
        { name: 'Add Shows', path: '/admin/add-shows', icon: PlusSquareIcon },
        { name: 'List Shows', path: '/admin/list-shows', icon: ListIcon },
        { name: 'List Bookings', path: '/admin/list-bookings', icon: ListCollapseIcon },
    ]



    return (
        <div className='h-[calc(100vh-64px)] pt-8 max-w-13 md:max-w-60 flex flex-col items-center w-full border-r border-r-gray-400/30 bg-transparent text-sm'>
            <div className='w-full'>
                <img className='w-9 h-9 md:w-14 md:h-14 rounded-full mx-auto' src={user.imageUrl} alt="" />
                <p className='text-center mt-2 text-base max-md:hidden'>{user.firstName} {user.lastName}</p>
            </div>
            <div className='w-full pt-8'>
                {adminNavLinks.map((link, index)=>(
                    <NavLink end to={link.path} key={index} className={({isActive})=> `relative flex items-center min-md:pl-10 gap-2 w-full py-2.5 text-gray-400 max-md:justify-center ${ isActive && 'bg-primary/15 text-primary group'} `}>
                        {({isActive})=>(
                        <>
                        <link.icon  className='w-5 h-5'/>
                        <p className='max-md:hidden'>{link.name}</p>
                        <span className={`w-1.5 h-10 rounded-l right-0 absolute ${isActive && 'bg-primary'}`}/>
                        </>
                    )}
                    </NavLink>
                ))}
            </div>
        </div>
    )
}

export default AdminSidebar