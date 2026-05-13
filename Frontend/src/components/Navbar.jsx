import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { useAppContext } from '../context/AppContext'

const Navbar = () => {
    const {favoriteMovies} = useAppContext()
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useUser();
    const clerk = useClerk();
    const navigate = useNavigate()
    
    return (
        <div className='fixed top-0 left-0 flex items-center justify-between py-5 px-6 md:px-14 lg:px-36 w-full z-50'>
            <Link to='/' className='max-md:flex-1 max-lg:mr-2'>
                <img className='w-36 h-auto' src={assets.logo} alt="" />
            </Link>
            <div className={`flex md:flex-row items-center justify-center gap-5 lg:gap-6 xl:gap-8 backdrop-blur min-md:rounded-full md:bg-white/10 py-3 md:px-8 md:border border-gray-300/20 max-md:absolute flex-col max-md:top-0 max-md:left-0 max-md:h-screen max-md:font-medium max-md:text-lg overflow-hidden duration-100 ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>
                <XIcon className='md:hidden w-6 h-6 absolute top-6 right-6 cursor-pointer' onClick={() => setIsOpen(!isOpen)} />
                <Link onClick={() => {setIsOpen(false); scrollTo(0,0)}} to='/'>Home</Link>
                <Link onClick={() => {setIsOpen(false); scrollTo(0,0)}} to='/movies'>Movies</Link>
                <Link onClick={() => {setIsOpen(false); scrollTo(0,0)}} to='/'>Theaters</Link>
                <Link onClick={() => {setIsOpen(false); scrollTo(0,0)}} to='/'>Releases</Link>
                {favoriteMovies.length > 0 &&<Link onClick={() => {setIsOpen(false); scrollTo(0,0)}} to='/favourites'>Favourites</Link>}
            </div>
            <div className='flex items-center gap-6 lg:gap-8'>
                <SearchIcon  className='w-6 h-6 max-md:hidden max-lg:ml-2 cursor-pointer' />
              {
                user ? (
                   <UserButton>
                    <UserButton.MenuItems >
                        <UserButton.Action label='My Bookings' labelIcon={<TicketPlus width={15} height={15} color='#ffffff9e' className='translate-y-[1px]'/>} className='flex items-center' onClick={()=>{navigate('/my-bookings')}}/>
                    </UserButton.MenuItems>
                   </UserButton> 
                ) : (

                    <button onClick={()=>{clerk.openSignIn()}} className='px-5 py-2 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull rounded-full transition font-medium cursor-pointer max-sm:text-[14px]' >Login</button>
                )
              }
            </div>
            <MenuIcon className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer' onClick={() => { setIsOpen(true) }} />
        </div>
    )
}

export default Navbar