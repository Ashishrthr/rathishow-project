import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import Loading from '../components/Loading'
import isoTimeFormat from '../lib/isoTimeFormat'
import Blurcircle from '../components/Blurcircle'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'

const SeatLayout = () => {
  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H", "I"], ["J", "K", "L"]];
  const { id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [occupiedSeats, setoccupiedSeats] = useState([])
  const navigate = useNavigate()
  const { user, getToken, axios } = useAppContext()

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`)
      if (data.Success) {
        setShow(data)

      }

    } catch (error) {
      console.log(error);

    }
  }
  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(`/api/role/bookings/${selectedTime.showId}/Seats`, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.Success) {
        setoccupiedSeats((data.seats))
      }
      else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error);

    }
  }
  const bookTickets = async () => {
    try {
      if (!user) {
        return toast("Please Login to proceed")
      }

      if (!selectedTime || !selectedSeats.length) return toast.error("Please select a time and seats");
      const { data } = await axios.post("/api/role/bookings/create_booking/", { showId: selectedTime.showId, selectedSeats: selectedSeats }, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.Success) {
        const options = {
          "key": data.response.key, // Enter the Key ID generated from the Dashboard
          "amount": data.response.amount, // Amount is in currency subunits. 
          "currency": data.response.currency,
          "name": "RathiShow", //your business name
          "description": "Test Transaction",
          "image": assets.r_logo,
          "order_id": data.response.order_id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1

          "handler": async function (response) {
            // verify payment & create booking
            const verifyRes = await axios.post("/api/role/bookings/verify_payment/", {
              ...response,
              showId: selectedTime.showId,
              selectedSeats: selectedSeats
            }, { headers: { Authorization: `Bearer ${await getToken()}` } });

            if (verifyRes.data.success) {
              // 👇 redirect to mybookings
              toast.success(verifyRes.data.message)
              navigate(verifyRes.data.redirect)
            } else {
              toast.error(verifyRes.data.message);
              navigate(verifyRes.data.redirect)
            }
          },
          "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
            "name": user.fullName, //your customer's name
            "email": user.emailAddresses.emailAddress,
            "contact": "" //Provide the customer's phone number for better conversion rates 
          },
          "notes": {
            "address": "Razorpay Corporate Office",

          },
          "theme": {
            "color": "#3399cc"
          }
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
        rzp1.on('payment.failed', async function (response) {
          const fail = await axios.post('/api/role/bookings/verify_payment/', {
            ...response,
            showId: selectedTime.showId,
            selectedSeats: selectedSeats
          }, { headers: { Authorization: `Bearer ${await getToken()}` } });
          if (!fail.data.Success) {

            toast(fail.data.message, "\n\n", fail.data.message2,
              {
                duration: 6000,
              }
            );
          }
        });
      }
      else toast.error(data.message)

    }
    catch (error) {
      toast.error(error.message)
    }
  }
  const handleSeatClick = (seatId) => {

    if (!selectedTime) {
      return toast('Please select time first')
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
      return toast('You can select five seats only')
    }
    if (occupiedSeats.includes(seatId)) {
      return toast("This Seat already Booked!")
    }
    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId])
  }


  const renderSeats = (row, count = 9) => {
    return <div className='mt-2'>
      <div className='flex items-center justify-center gap-2 max-sm:gap-1'>
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          return <button key={seatId} onClick={() => handleSeatClick(seatId)} className={`border border-primary/30 h-4.5 md:h-6 lg:h-8 w-4.5 md:w-6 lg:w-8 rounded cursor-pointer 
            ${selectedSeats.includes(seatId) && 'bg-primary text-white'}
            ${occupiedSeats.includes(seatId) && 'opacity-50 bg-primary/50'}`}>{seatId}</button>
        })}
      </div>
    </div>

  }
  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats()
    }
  }, [selectedTime])

  useEffect(() => {

    getShow()
  }, [])

  return show ? (
    <div className='flex flex-col gap-4 md:flex-row px-6 md:px-16 lg:px-36 py-30 md:pt-50'>
      {/* Available Timings */}
      <div className='w-60 basis-[30%]  bg-primary/10 border border-primary/10 rounded-lg py-10 h-max max-md:mx-auto'>
        <p className='text-lg font-semibold px-6'>Available Timings</p>
        <div className="mt-5 space-y-1">
          {show.Show_DateTime[date].map((item) =>
            <div key={item.time} onClick={() => setSelectedTime(item)} className={`flex items-center px-6 gap-2 py-2 w-max ${selectedTime?.time === item.time ? 'bg-primary text-white' : 'hover:bg-primary/20 text-gray-50'} cursor-pointer rounded-r-md transition`}>
              <ClockIcon className='w-4 h-4' />
              <p className='text-sm'>{isoTimeFormat(item.time)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Seats layout */}

      <div className='relative md:basis-[70%] flex flex-col items-center max-md:mt-16 max-md:mx-auto '>
        <Blurcircle top='0px' left='-100px' />
        <Blurcircle bottom='0px' right='0px' />
        <h1 className='text-2xl font-semibold mb-5'>Select Your Seats</h1>
        <img src={assets.screenImage} alt="" />
        <p className='uppercase text-sm font-light text-gray-400'>screen side</p>
        <div className='mt-10 text-xs max-sm:text-[9px] text-gray-300'>
          <div>
            {groupRows[0].map(row => renderSeats(row))}
          </div>
          <div className='grid grid-cols-2 gap-5 md:gap-10 mt-10'>
            {groupRows.slice(1).map((group, idx) => {
              return <div key={idx}>
                {group.map(row => renderSeats(row))}
              </div>
            })}
          </div>
        </div>
        <button onClick={bookTickets} className='flex items-center gap-1 mt-20 px-10 py-3 bg-primary hover:bg-primary-dull rounded-full active:scale-95 transition text-sm font-medium'>Proceed to Checkout <ArrowRightIcon strokeWidth={3} className='w-4 h-4' /></button>
      </div>
    </div>
  ) :
    <Loading />
}

export default SeatLayout