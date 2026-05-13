import React from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'

const HeroSection = () => {
  return (
    <div className='bg-[url("/src/assets/bgc.png")] bg-cover bg-center h-screen flex flex-col items-start justify-center gap-4 px-6 md:px-14 lg:px-36'>
        <img src={assets.marvelLogo} alt="" />
        <h1 className='text-5xl md:text-[70px] max-w-110 md:leading-18 font-semibold'>Guardian <br /> of the Galaxy</h1>
        <div className='flex items-center gap-4 text-gray-300'>
           <span>Action | Adventure | Sci-Fi</span> 
           <div className='flex items-center gap-1'>
           <CalendarIcon className='w-4.5 h-4.5'/> 2018
           </div>
           <div className="flex items-center gap-1">
            <ClockIcon className='w-4.5 h-4.5' /> 2h 8m
           </div>
        </div>
        <p className='max-w-md text-gray-300'>In a post-apocalyptic world where cities ride on wheels and consume each other to survive, two people meet in London and try to stop a conspiracy.</p>
        <button className='flex items-center px-6 py-3 sm:px-7 bg-primary hover:bg-primary-dull rounded-full transition font-medium cursor-pointer text-sm gap-1'>Explore More <ArrowRight className='w-5 h-5'/></button>
    </div>
  )
}

export default HeroSection