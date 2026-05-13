export const kConverter = (num)=>{
    if (num >= 1000){
        let knum = null
        if (num % 1000 == 0){
            knum = (num / 1000);}
        else{
            knum = (num / 1000).toFixed(1);
        }
    return `${knum}k`
    }
}