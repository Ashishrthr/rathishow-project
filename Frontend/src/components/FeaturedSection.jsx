import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Blurcircle from './Blurcircle'
import MovieCard from './MovieCard'
import { useAppContext } from '../context/AppContext'


const FeaturedSection = () => {
  const {shows} = useAppContext()
  const nevigate = useNavigate()
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 mb-10 overflow-hidden'>
      <div className='flex justify-between items-center relative pt-20 pb-10'>
        <Blurcircle top='0' right='-80px' />
        <p className='text-lg font-semibold text-gray-200'>Now Showing</p>
        <button onClick={() => { nevigate('/movies'); scrollTo(0, 0); }} className='flex items-center gap-2 text-gray-300 text-sm group cursor-pointer'>View All <ArrowRight className='w-4.5 h-4.5 group-hover:translate-x-0.5 transition' /></button>
      </div>
      <div className='flex flex-wrap max-md:justify-center gap-8 mt-8'>
        {shows.slice(0,4).map((show) => {
          return <MovieCard key={show._id} movie={show}/>
        })}
      </div>
      <div className='flex justify-center mt-20'>
        <button onClick={() => { nevigate('/movies'); scrollTo(0, 0); }} className='bg-primary hover:bg-primary-dull px-10 py-3 rounded-md font-medium text-sm cursor-pointer transition'> Show more</button>
      </div>
    </div>
  )
}

export default FeaturedSection