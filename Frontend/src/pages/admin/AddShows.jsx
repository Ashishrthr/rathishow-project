import React, { useState, useEffect } from 'react'
import Title from '../../components/admin/Title'
import { CheckIcon, StarIcon, Trash2 } from 'lucide-react'
import { kConverter } from '../../lib/kConverter'
import Loading from '../../components/Loading'
import toast from 'react-hot-toast'
import { useAppContext } from '../../context/AppContext'

const AddShows = () => {
  const {axios, getToken, user, image_base_url} = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY

  const [nowPlayingMovies, setNowPlayingMovies] = useState([])
  const [selectedMovies, setSelectedMovies] = useState(null)
  const [ShowPrice, setShowPrice] = useState()
  const [DateTimeInput, setDateTimeInput] = useState('')
  const [DateTimeSelection, setDateTimeSelection] = useState({})
  const [addShow, setaddShow] = useState(false)

  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get('/api/show/nowplaying',{headers: {Authorization : `Bearer ${await getToken()}`}})
      if (data.success){
        
        setNowPlayingMovies(data.nowplaying)
      }
      else{
      console.log("now playing not fetch");
      }
    } catch (error) {
      console.error('Error Fetching Movies',error);
      
    }

  }
  const dateTimeAdd = () => {
    if (DateTimeInput) {
      console.log(DateTimeInput)
      const [date, time] = DateTimeInput.split('T');
      if (!date || !time) {
        toast('Please Select Date&Time !')
        return;
      }
      setDateTimeSelection(prev => {
        const times = prev[date] || [];
        if (!times.includes(time)) {
          toast.success('Date & TIme Added !')
          return { ...prev, [date]: [...times, time] }
        }
        return prev
      })
    }
    else {
      toast('Please Select Date&Time !')
    }
  }
  const abc = ()=>{
    console.log(DateTimeSelection)
  }
  const dateTimeRemove = (date, time) => {
    setDateTimeSelection(prev => {
      const filteredDateTime = prev[date].filter(t => t !== time)
      if (filteredDateTime.length === 0) {
        const { [date]:_, ...rest } = prev;
        
        return rest;
      }
      return {
        ...prev,
        [date]: filteredDateTime,
      }
    })
  }
  const handleSubmit = async ()=>{
    try {
      setaddShow(true)
      if (!selectedMovies || Object.keys(DateTimeSelection).length === 0 || !ShowPrice){
        return toast('Missing required fields')
      }
      const showInput = Object.entries(DateTimeSelection);
      const payload = {
        movieId : selectedMovies,
        showInput,
        ShowPrice : Number(ShowPrice)
        
      }
      console.log(payload);
      
      const {data} = await axios.post('/api/show/add',payload, {headers:{Authorization:`Bearer ${await getToken()}`}})
      if(data.Success){
        toast.success(data.message)
        setSelectedMovies(null)
        setDateTimeSelection({})
        setShowPrice('')
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      console.error("Submission error",error);
      toast.error('An error occurred. Please Try Again')
      
    }
    setaddShow(false)
  }
  useEffect(() => {
    if (user){
    fetchNowPlayingMovies();}
  }, [user]);

  return (nowPlayingMovies.length > 0) ? (
    <>
      <Title text1='Add' text2={'Shows'} />
      <p className='mt-10 text-lg font-medium'>Now Playing Movies</p>
      <div className='overflow-x-auto pb-4'>
        <div className="group flex flex-wrap gap-2 mt-4 w-max">
          {nowPlayingMovies.map(movie => (
            <div key={movie.id} className={`max-w-44 group-hover:not-hover:opacity-40 cursor-pointer hover:-translate-y-1 transition duration-300 rounded-lg overflow-hidden ${selectedMovies === movie.id &&  'bg-primary-dull/20'}`} onClick={() => {setSelectedMovies(movie.id), setToggle(!toggle)}}>
              <div className='relative  max-w-full'>
                <img src={image_base_url + movie.poster_path} alt="" className='w-full object-cover' />
                <div className='text-sm flex items-center justify-between p-2 text-gray-300'>
                  <p className='flex items-center'><span><StarIcon className='w-4 h-4 text-primary fill-primary' /></span><span>{movie.vote_average.toFixed(1)}/10</span></p>
                  <p>{kConverter(movie.vote_count)}</p>
                </div>
                { selectedMovies === movie.id && (
                  <div className='absolute top-2 right-2 w-fit bg-primary-dull'>
                    <CheckIcon className='w-4 h-4' />
                  </div>
                )}
                <div className='p-2'>
                  <p className='text-sm truncate font-medium p-1'>{movie.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Show Price Input */}
      <div className='mt-20'>
        <label className='block mb-2'>Show Price</label>
        <div className='inline-flex items-center gap-2 px-3 py-2 border border-primary/20 bg-primary/10 rounded-md'>
          <p className='text-sm text-gray-400'>{currency}</p>
          <input min={0} type="number" placeholder={`Enter Show Price`} className='text-sm rounded-lg outline-none placeholder:text-gray-400'value={ShowPrice} onChange={(e) => setShowPrice(e.target.value)} />
        </div>
      </div>
      {/* Select date and time */}
      <div className='mt-10'>
        <label className='block mb-2'>Select Date and Time</label>
        <div className='inline-flex items-center gap-2 px-3 py-2 border border-primary/20 bg-primary/10 rounded-md '>
          <input id='datetime-local' type="datetime-local" placeholder={`Select Date and Time`} className='text-sm text-gray-400 rounded-lg outline-none scheme-dark' value={DateTimeInput} onChange={(e) => setDateTimeInput(e.target.value)} />
          <button onClick={dateTimeAdd} className='text-xs p-2 bg-primary rounded-sm ms-2 active:scale-95 hover:bg-primary-dull transition-all cursor-pointer'>Add Time</button>
        </div>
      </div>
      {/* Selected date and time view port */}
      {Object.keys(DateTimeSelection).length > 0 && (
        <div className='my-4'>
          <p className='mb-2 block'>Selected Date&Time</p>
          {Object.entries(DateTimeSelection).map(([date, times]) => (
            <div className='block mb-2'>
              <p className='font-light py-2'> {date}</p>
              {times.map(time => (
                <div  className='inline-flex items-center gap-4 border border-primary p-2 mr-5 rounded-md text-sm'>{time}<Trash2 className='w-4 h-4 text-primary hover:text-primary-dull cursor-pointer' onClick={()=> dateTimeRemove(date, time)}/></div>
              ))}
            </div>
          ))}

        </div>
      )}


      <button className='bg-primary hover:bg-primary-dull py-2 px-5 mt-8 active:scale-95 rounded-sm transition-all cursor-pointer' onClick={handleSubmit}>Add Show</button>
    </>
  ) : (<Loading />)
}

export default AddShows