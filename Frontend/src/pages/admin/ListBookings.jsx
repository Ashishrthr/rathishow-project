import React, { useEffect, useState } from 'react'
import Title from '../../components/admin/Title'
import Loading from '../../components/Loading';
import DateFormat from '../../lib/DateFormat';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ListBookings = () => {
  const {axios, getToken, user} = useAppContext()
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
    const currency = import.meta.env.VITE_CURRENCY

    const getAllBookings = async ()=>{
      try {
        const {data} = await axios.get('/api/role/admin/all_bookings',{headers: {Authorization:`Bearer ${await getToken()}`}})
        if(data.Success){
        setBookings(data.Bookings);
        setIsLoading(false);
        console.log(data.Bookings);
        
        }
        else{
          toast.error(data.message)
        }
        
      } catch (error) {
        toast.error("Error fetch data", error)
      }
    }
    useEffect(()=>{
      if(user){
      getAllBookings()}
    },[user])
  return !isLoading ? (
    <div>
      <Title text1={'List'} text2={"Bookings"} />
      <div className='max-w-4xl mt-6 overflow-x-auto'>
        <table className='w-full text-nowrap overflow-hidden rounded-md'>
          <thead>
            <tr className='bg-primary/20 text-left text-white font-medium'>
              <th className='p-2 font-medium pl-5'>User Name</th>
              <th className='p-2 font-medium'>Movie Name</th>
              <th className='p-2 font-medium'>Show Time</th>
              <th className='p-2 font-medium'>Seats</th>
              <th className='p-2 font-medium'>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((item, index) => (
              <tr key={index} className='bg-primary/5 border-b border-primary/10 even:bg-primary/10'>
                <td className='p-2 min-w-45 pl-5'>{item.user}</td>
                <td className='p-2 text-gray-300'>{item.show.movie.title}</td>
                <td className='p-2 text-gray-300'>{DateFormat(item.show.showDateTime)}</td>
                <td className='p-2 text-gray-300'>{item.bookedSeats.map(seat => seat).join(',')}</td>
                <td className='p-2 text-gray-300'>{currency} {item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : <Loading />
}

export default ListBookings