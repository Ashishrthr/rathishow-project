import React from 'react'

const Title = ({text1, text2}) => {
  return (
    <div className='font-medium text-2xl'>
    <span>{text1} </span>
    <span className='text-primary underline'>{text2}</span>
    </div>
  )
}

export default Title