import React, { useEffect, useState } from 'react'
import Title from '../../components/admin/Title'
import { ChartLineIcon, LucideBadgeDollarSign, PlayCircleIcon, StarIcon, UsersIcon } from 'lucide-react';
import Loading from '../../components/Loading';
import { dummyDashboardData } from '../../assets/assets';
import Blurcircle from '../../components/Blurcircle';
import DateFormat from '../../lib/DateFormat';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const {axios, getToken, user, image_base_url} = useAppContext()
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUser: 0,
    activeShows: [],
  });
  const currency = import.meta.env.VITE_CURRENCY
  const dashboardCard = [
    { title: 'Total Bookings', value: dashboardData.totalBookings || '0', icon: ChartLineIcon },
    { title: 'Total Revenue', value: currency + ' ' + dashboardData.totalRevenue || '0', icon: LucideBadgeDollarSign },
    { title: 'Active Shows', value: dashboardData.activeShows.length || '0', icon: PlayCircleIcon },
    { title: 'Total Users', value: dashboardData.totalUser || '0', icon: UsersIcon },
  ]
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/role/admin/dashboard',{headers: {Authorization:`Bearer ${await getToken()}`}})
      if (data.Success){
        setDashboardData(data.dashboardData)
        setLoading(false)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Error fetching data', error)
    }

  }

  useEffect(() => {
    if (user){
      fetchDashboardData()}
  }, [user])
  return !loading ? (
    <>
      <Title text1={'Admin'} text2={'Dashboard'} />
      <div className='relative pt-8'>
        <Blurcircle top='0px' left='10%' />
        <div className='flex flex-wrap items-center w-full gap-4'>
          {dashboardCard.map((card, index) => (<div id={index} className='flex items-center justify-between gap-4 p-4 bg-primary/10 rounded-lg border border-primary/10 max-w-50 w-full'>
            <div>
              <p className='text-sm text-gray-300 mb-3'>{card.title}</p>
              <span className='text-xl font-medium'>{card.value}</span>
            </div>
            <card.icon className='w-6 h-6' />
          </div>
          ))}
        </div>
      </div>
      <p className='text-lg font-semibold mt-10'>Active Shows</p>
      <div className='relative mt-6 flex flex-wrap gap-6 max-w-5xl'>
        <Blurcircle top='100px' left='-10%'/>
        
          {dashboardData.activeShows.map((show,index)=>(
            <div key={index} className='w-55 border border-primary/10 bg-primary/10 rounded-lg pb-3 h-full overflow-hidden hover:-translate-y-1 transition duration-300'>
              <img className='w-full h-60 rounded-t-lg object-cover' src={image_base_url + show.movie.poster_path} alt="" />
              <p className='text-center truncate p-2'>{show.movie.title}</p>
              <div className='flex items-center justify-between px-4 py-3'>
                <span className='text-lg'>{currency} {show.showPrice}</span>
                <span className='flex items-center gap-2 text-gray-400 text-sm'><StarIcon className='w-5 h-5 fill-primary text-primary'/> {show.movie.vote_average.toFixed(1)}</span>
              </div>
              <p className='text-xs px-4 text-gray-400'>{DateFormat(show.showDateTime)}</p>
            </div>
          ))}
        

      </div>
    </>
  ) : <Loading />
}

export default Dashboard