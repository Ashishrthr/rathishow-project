const Blurcircle = ({top = 'auto', right = 'auto', bottom = 'auto', left= 'auto'}) => {
  return (
    <div className='absolute -z-50 h-58 w-58 rounded-full bg-primary/30 blur-3xl'
    style={{top: top, left: left, right: right, bottom: bottom}}>
        
    </div>
  )
}

export default Blurcircle