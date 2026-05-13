import React from 'react'

const Loading = () => {
  return (
    <div className='flex justify-center items-center h-[80vh]'>
        <div className='animate-spin rounded-full border-2 w-14 h-14 border-t-primary'></div>
    </div>
  )
}

export default Loading