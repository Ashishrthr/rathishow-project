 const DateFormat = (datetime) => {
    const date = new Date(datetime)
    const localTime = date.toLocaleString("en-US", {
        weekday : 'short',
        month : 'long',
        hour : 'numeric',
        minute : 'numeric',
        day : 'numeric'
    })
    return localTime
 }

 export default DateFormat