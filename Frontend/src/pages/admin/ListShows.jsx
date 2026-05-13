import React, { useEffect, useState } from 'react'
import Title from '../../components/admin/Title'
import Loading from '../../components/Loading'
import { dummyShowsData } from '../../assets/assets'
import DateFormat from '../../lib/DateFormat'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ListShows = () => {
  const {axios, getToken, user} = useAppContext()
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const currency = import.meta.env.VITE_CURRENCY
  const getAllShows = async () => {
    try {
      const {data} = await axios.get('/api/role/admin/show_all',{headers: {Authorization:`Bearer ${await getToken()}`}})
      if(data.Success){
        setShows(data.Shows);
        setLoading(false);

      }
    } catch (error) {
      toast.error('error fetching data',error);

    }
  }
  useEffect(() => {
    if(user){
    getAllShows();}

  }, [user]);
  return !loading ? (
    <div>
      <Title text1={'List'} text2={'Shows'} />
      <div className='max-w-4xl mt-6 overflow-x-auto'>
        <table className='w-full text-nowrap overflow-hidden rounded-md'>
          <thead>
            <tr className='bg-primary/20 text-left text-white'>
              <th className='p-2 font-medium pl-5'>Movie Name</th>
              <th className='p-2 font-medium'>Show Time</th>
              <th className='p-2 font-medium'>Total Bookings</th>
              <th className='p-2 font-medium'>Earnings</th>
            </tr>
          </thead>
          <tbody>
            {shows.map((show, index) => (
              <tr key={index} className='bg-primary/5 border-b border-primary/10 even:bg-primary/10'>
                <td className='p-2 min-w-45 pl-5'>{show.movie.title}</td>
                <td className='p-2 text-gray-300'>{DateFormat(show.showDateTime)}</td>
                <td className='p-2 text-gray-300'>{Object.keys(show.occupiedSeats).length}</td>
                <td className='p-2 text-gray-300'>{currency} {Object.keys(show.occupiedSeats).length * show.showPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : <Loading />
}

export default ListShows