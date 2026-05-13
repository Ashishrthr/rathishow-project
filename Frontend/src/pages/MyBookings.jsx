import React, { useEffect, useState } from 'react'
import Blurcircle from '../components/Blurcircle'
import Loading from '../components/Loading'
import TimeFormat from '../lib/TimeFormat'
import DateFormat from '../lib/DateFormat'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyBookings = () => {
    const {axios, getToken, image_base_url, user} = useAppContext()
    const currency = import.meta.env.VITE_CURRENCY
    const [isLoading, setIsLoading] = useState(true)
    const [bookings, setBookings] = useState([])

    const getMyBookings = async () => {
        try{
            const {data} = await axios.get('/api/role/bookings/userBookings',{headers:{Authorization:`Bearer ${await getToken()}`}})
            if(data.Success) { 
                setIsLoading(false)  
                
            if(data.userBookings.length === 0){
                return toast("You have no Bookings")}
            else{
                setBookings(data.userBookings);
            }
            
            }
            else{
                toast("Something Wrong!")
        }}
        catch(error){
            console.log(error);
            
        }
        
    
    }
    useEffect(() => {
        if(user){
        getMyBookings();}
    },[user])
    return !isLoading ? (
        <div className='mt-30 md:mt-40 px-6 md:px-16 lg:px-40 relative min-h-[80vh]'>
            <Blurcircle top='100px' left='100px' />
            <div>
                <Blurcircle bottom='0' right='500px' />
            </div>
            <h1 className='text-lg font-semibold text-gray-300 mb-10'>My Bookings</h1>
            {bookings.map((item, idx) => (
                <div className='flex flex-col md:flex-row justify-between p-2 bg-primary/10 rounded-lg border border-primary/10 mt-5 max-w-3xl'>
                    <div className='flex flex-row justify-center'>
                        <img className='aspect-video object-cover object-bottom h-auto rounded max-w-36 md:max-w-45' src={image_base_url+item.show.movie.poster_path} alt="" />
                        <div className='flex flex-col p-4'>
                            <p className='md:text-lg text-[16px] font-semibold'>{item.show.movie.title}</p>
                            <p className='text-xs font-light text-gray-300'>{TimeFormat(item.show.movie.runtime)}</p>
                            <p className='text-sm text-gray-300 mt-4'>{DateFormat(item.show.showDateTime)}</p>

                        </div>
                    </div>
                    <div className='flex md:flex-col flex-row md:items-end mt-5 text-right mr-3 justify-between'>
                        <div className='flex items-center gap-4 mb-4'>
                            <p className='text-2xl font-semibold'>{currency}{item.amount}</p>
                            {!item.isPaid && <button className='bg-primary px-4 py-1.5 rounded-full hover:bg-primary-dull cursor-pointer active:scale-95 text-sm font-medium'>Pay Now</button>}
                        </div>
                        <div className='text-sm text-gray-400'>
                            <p>Total Tickets:<span className='text-white'> {item.bookedSeats.length}</span></p>
                            <p>Seat Number:<span className='text-white'> {item.bookedSeats.map(sn => sn).join(',')}</span></p>
                        </div>
                    </div>
                </div>
            ))}

        </div>
    ) : <Loading />
}

export default MyBookings