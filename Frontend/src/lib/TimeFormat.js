 const TimeFormat = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainder = (minutes % 60)
    return `${hours}h ${remainder}m`
 }
 export default TimeFormat