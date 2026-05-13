import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Blurcircle from '../components/Blurcircle'
import { ArrowRight, Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import TimeFormat from '../lib/TimeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import grey_profile from '../assets/proffile_grey.png'

const MovieDetails = () => {
  const {axios, getToken, image_base_url, shows, fetchFavoriteMovies, user, favoriteMovies} = useAppContext()
  const { id } = useParams()
  const nevigate = useNavigate()
  const [show, setShow] = useState(null);
  const getShow = async () => {
    const {data} = await axios.get(`/api/show/${id}`)

    
    if(data.Success){
    setShow({
      movie: data.movie,
      dateTime: data.Show_DateTime
    })}

  }
  const favoriteHandler = async () => {
    if (!user){return toast("Please Log in First !")}
    try {
      const payload = {movieId : show.movie.id}
      
      const { data } = await axios.post('/api/role/user/update_favorite/',payload,{headers: {Authorization:`Bearer ${await getToken()}`}})
      if (data.Success){
        await fetchFavoriteMovies()
        console.log(favoriteMovies);
        
        return toast.success(data.message)
      }
    } catch (error) {
      console.error(error)
    }
    }
  
  useEffect(() => {
    getShow()
  }, [id])
  return show ? (
    <div className='pt-30 md:pt-50 px-6 md:px-16 lg:px-24 xl:px-36'>
      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
        <img src={image_base_url+show.movie.poster_path} alt="" className='w-70 h-104 object-cover rounded-xl' />
        <div className='relative flex flex-col gap-3'>
          <Blurcircle top='-100px' left='-100px' />
          <p className='text-primary text-lg'>ENGLISH</p>
          <h1 className='text-4xl font-semibold max-w-70 text-balance'>{show.movie.title}</h1>
          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className='text-primary fill-primary w-4 h-5' />{show.movie.vote_average.toFixed(1)} User Rating
          </div>
          <p className='mt-2 text-gray-400 max-w-xl leading-tight'>{show.movie.overview}</p>
          <p className='text-gray-300'>{TimeFormat(show.movie.runtime)} - {show.movie.genres.map(genre => genre.name).join(', ')} - {show.movie.release_date.split("-")[0]}</p>
          <div className='flex items-center gap-4 mt-4'>
            <button className='bg-gray-800 hover:bg-gray-900 flex items-center gap-2 py-3 px-7 rounded-md text-sm font-medium transition cursor-pointer active:scale-95'><PlayCircleIcon className='w-4.5 h-4.5' />Watch Trailer</button>
            <a className='bg-primary hover:bg-primary-dull px-10 py-3 text-sm rounded-md font-medium transition cursor-pointer active:scale-95' href="#dateselect">Buy Tickets</a>
            <button onClick={favoriteHandler} className='bg-gray-700 p-3 rounded-full active:scale-95 transition cursor-pointer'><Heart className={`w-5 h-5 ${favoriteMovies.find(movie=> movie.id === parseInt(id)) ? 'fill-primary text-primary' : ''}`} /></button>
          </div>
        </div>
      </div>
      <p className='mt-20 text-lg font-medium'>Your Favourite Cast</p>
      <div className='overflow-x-auto no-scrollbar pt-8 pb-4'>
        <div className='flex items-center gap-4 w-max px-4'>
          {show.movie.casts.slice(0, 12).map((cast, index) =>
            <div key={index} className='flex flex-col items-center text-center'>
              <img className='w-20 h-20 object-cover rounded-full aspect-square text-[10px]' src={cast.profile_path ? image_base_url+cast.profile_path : grey_profile} alt="img not available" />
              <p className='text-gray-100 text-xs font-medium mt-3'>{cast.name}</p>
            </div>
          )}
        </div>
      </div>
      <DateSelect datetime={show.dateTime} id={id} />
      <div>
        <div className='flex justify-between items-center relative pt-20 pb-10'>
          <Blurcircle top='0' right='-100px' />
          <p className='text-lg font-semibold text-gray-200'>You May Also Like</p>
          <button onClick={() => { nevigate('/movies'); scrollTo(0, 0); }} className='flex items-center gap-2 text-gray-300 text-sm group cursor-pointer'>View All <ArrowRight className='w-4.5 h-4.5 group-hover:translate-x-0.5 transition' /></button>
        </div>
        <div className='flex flex-wrap max-md:justify-center gap-8 '>
          {shows.slice(0, 4).map((show) => {
            return <MovieCard key={show._id} movie={show} />
          })}
        </div>
        <div className='flex justify-center mt-20'>
        <button onClick={() => { nevigate('/movies'); scrollTo(0, 0); }} className='bg-primary hover:bg-primary-dull px-10 py-3 rounded-md font-medium text-sm cursor-pointer transition'> Show more</button>
      </div>
      </div>
    </div>
  ) : (
    <Loading />  )
}

export default MovieDetails