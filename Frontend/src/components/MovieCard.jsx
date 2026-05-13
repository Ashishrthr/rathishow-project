import { StarIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TimeFormat from '../lib/TimeFormat';
import { useAppContext } from '../context/AppContext';



const MovieCard = ({movie}) => {
  const { image_base_url } = useAppContext()
    const nevigate = useNavigate();
  return (
    <div className='flex flex-col justify-between p-3 w-66 rounded-lg bg-gray-800 hover:-translate-y-1 transition'>
        <img className='w-full h-52 object-cover object-bottom-right rounded-lg cursor-pointer' src={image_base_url+movie.backdrop_path} alt="" onClick={()=>{nevigate(`/movies/${movie.id}`); scrollTo(0,0);}}/>
        <p className='font-semibold mt-2 truncate'>{movie.title}</p>
        <p className='text-gray-400 mt-2 text-sm'>{new Date(movie.release_date).getFullYear()} - {movie.genres.slice(0,2).map(genre => genre.name).join(' | ')} - {TimeFormat(movie.runtime)}</p>
        <div className='flex justify-between items-center mt-5 pb-3'>
            <button onClick={()=>{nevigate(`/movies/${movie._id}`); scrollTo(0,0);}} className="px-4 py-2 text-xs font-medium rounded-full bg-primary hover:bg-primary-dull transition cursor-pointer">Buy Ticket</button>
            <p className='flex items-center gap-1'><StarIcon className='w-4 h-4 text-primary fill-primary'/>{movie.vote_average.toFixed(1)}</p>
        </div>
    </div>
  )
}

export default MovieCard