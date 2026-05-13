import React from 'react'
import MovieCard from '../components/MovieCard'
import Blurcircle from '../components/Blurcircle'
import { useAppContext } from '../context/AppContext'

const Movies = () => {
  const {shows} = useAppContext()
  return shows.length > 0 ? (
    <div className='mt-40 mb-60 px-6 md:px-16 lg:px-36 overflow-hidden min-h-[80vh] relative'>
      <Blurcircle top='150px' left='0px'/>
      <Blurcircle bottom='100px' right='50px'/>
      <p className='text-lg font-semibold my-4'>Now Showing</p>
      <div className='flex flex-wrap max-sm:justify-center gap-4 lg:gap-8'>
        {shows.map(movie =>
          <MovieCard movie={movie} key={movie._id}/>
        )}
      </div>
    </div>
  ) : (
    <div className='flex justify-center items-center h-screen'>
      <h1 className='text-3xl font-bold text-center'>No Movies Available</h1>
    </div>
  )
}

export default Movies