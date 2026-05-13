import { createContext, useContext, useEffect, useState } from "react"
import axios from 'axios'
import { useAuth, useUser } from "@clerk/clerk-react"
import { useLocation, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
export const AppContext = createContext()

export const AppProvider = ({ children })=> {
    const [isAdmin, setIsAdmin] = useState(false)
    const [shows, setShows] = useState([])
    const [favoriteMovies, setFavoriteMovies] = useState([])
    const nevigate =   useNavigate()
    const image_base_url = import.meta.env.VITE_TMDB_IMG_BASE_URL
    const {user} = useUser()
    const {getToken} = useAuth()
    const location = useLocation()

    const fetchIsAdmin = async ()=>{
        try{
            const {data} = await axios.get('/api/role/admin/is_admin', {headers : {Authorization: `Bearer ${await getToken()}`,'Content-Type': 'application/json'}})
            setIsAdmin(data.is_admin)
            if (!data.is_admin && location.pathname.startsWith('/admin')){
                nevigate('/') 
                toast.error('You are not authorized to access admin dashboard')
            }}
            catch(error){
            console.error(error)
        }
    }
    const  fetchUserData   =  async  ()=>{
        try{
            await axios.get('/api/users/view')
        }
        catch (error) {
            console.error(error)
    }
}
    const fetchShows = async ()=>{
        try {
            const {data} = await axios.get('/api/show/all')
            if(data.Success){
                setShows(data.shows)
            }
            else{
                toast.error(data.message)
            }
        } 
        catch (error) {
            console.error(error)
        }
    }
    const fetchFavoriteMovies = async ()=>{
        try {
            const {data} = await axios.get('/api/role/user/favorites', {headers : {Authorization: `Bearer ${await getToken()}`}})
            if(data.Success){
                
                setFavoriteMovies(data.movies)
            }
            }
        catch (error) {
            console.error(error)
        }
    }
    useEffect(()=>{
        fetchShows()
        fetchUserData()
    },[])

    useEffect(()=>{
        if(user){
            fetchIsAdmin()
            fetchFavoriteMovies()
        }
    },[user])

    const value = {
        axios,
        fetchIsAdmin,
        user, getToken, nevigate, isAdmin, shows,
        fetchFavoriteMovies, favoriteMovies, image_base_url
    }
    return(
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    )
}


export const useAppContext = ()=> useContext(AppContext)