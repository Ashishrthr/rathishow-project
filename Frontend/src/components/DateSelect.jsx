import React, { useState } from 'react'
import Blurcircle from './Blurcircle'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DateSelect = ({datetime, id}) => {
    const [selected, setSelected] = useState(null)
    const nevigate = useNavigate()
    const onBookHandler = ()=>{
        if(!selected){
            return toast('Please select a date!')
        }
        nevigate(`/movies/${id}/${selected}`)
        scrollTo(0,0)
    }

  return (
    <div id='dateselect' className='pt-30'>
        <div className='relative flex flex-col md:flex-row justify-between items-center bg-primary/10 p-8 rounded-lg '>
            <Blurcircle top='-100px' left='-100px'/>
            <Blurcircle top='50px' right='-100px'/>
            <div className='pb-10'>
                <p className='font-semibold text-lg'>Choose Date</p>
                <div className='flex gap-4 items-center mt-5 text-sm'>
                    <ChevronLeftIcon className=' text-primary' width={28}/>
                    <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>
                        {Object.keys(datetime).map(date =>
                           <button onClick={()=>setSelected(date)} className={`flex flex-col items-center justify-center aspect-square w-14 h-14 rounded cursor-pointer ${selected === date ? 'bg-primary text-white' : 'border border-primary '}`}>
                                <span>{new Date(date).toLocaleDateString("en-US",{month:"short"})}</span>
                                <span>{new Date(date).getDate()}</span>
                            </button>
)}
                    </span>
                    <ChevronRightIcon width={28} className='text-primary'/>
                </div>
            </div>
                <button onClick={onBookHandler} className='bg-primary/80 hover:bg-primary-dull/90 px-10 py-2 rounded-full transition-all'>Book Now</button>
        </div>
    </div>
  )
}

export default DateSelect