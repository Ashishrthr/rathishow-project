import React, { useState } from 'react'
import  ReactPlayer  from 'react-player'
import { dummyTrailers } from '../assets/assets'
import Blurcircle from './Blurcircle'
import { PlayCircleIcon } from 'lucide-react'

const TrailersSection = () => {
    const [currentTrailer, setcurrentTrailer] = useState(dummyTrailers[0])
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
        <p className='text-gray-200 text-lg font-semibold mx-auto max-w-[960px] '>Trailers</p>
        <div className='relative mt-6'>
            <Blurcircle top = "-40px" right='-100px'/>
           <ReactPlayer src={currentTrailer.videoUrl} width='960px' height='540px' className='w-full  mx-auto'/> 
        </div>
        <div className='max-w-3xl mx-auto grid grid-cols-4 gap-4 md:gap-8 mt-8 group'>
            {dummyTrailers.map(trailer => {
                return <div key={trailer.image} className='relative hover:-translate-y-1 group-hover:not-hover:opacity-60 cursor-pointer transition duration-300' onClick={()=> setcurrentTrailer(trailer)}>
                    <img src={trailer.image} alt="trailer" className='w-full h-full object-cover rounded-lg brightness-75'/>
                    <PlayCircleIcon strokeWidth={1.6} className='w-5 h-5 md:h-10 md:w-10 transform absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]'/>
                </div>
            })}

        </div>
    </div>
  )
}

export default TrailersSection