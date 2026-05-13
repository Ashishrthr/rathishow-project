
from django.shortcuts import render, get_object_or_404
import requests
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from .serializer import RshowUsersSerializer , RshowMoviesSerializer, RshowShowsSerializer, RshowBookingSerializer
from rest_framework.decorators import api_view, renderer_classes, permission_classes
from .models import Users , Movies, shows, Booking
from django.db.models import Q
from datetime import datetime, timezone
import os
from .permissions import IsAdminRole 
import razorpay
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
import pytz
from django.templatetags.static import static
from email.mime.image import MIMEImage
from django.template.loader import render_to_string

# Create your views here.

TMDB_SECRET_KEY = str(os.getenv('TMDB_SECRET_KEY'))
CLERK_SECRET_KEY = str(os.getenv('CLERK_SECRET_KEY'))
CLERK_PUBLIC_KEY = str(os.getenv('CLERK_PUBLIC_KEY')) 
def fetchApiData():
    api_endpoint = "https://api.clerk.com/v1/users"
    headers = {
        "Authorization": f"Bearer " + CLERK_SECRET_KEY,
        "X-Api-Key": CLERK_PUBLIC_KEY,
        "Content-Type": "application/json"
    }
    data = None
    error = None
    
    try:
        response = requests.get(api_endpoint, headers=headers)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        error = f"Error fetching data: {e}"
    
    if data is not None:
        return data
    
    return error


@api_view(['GET'])
def index(request):
    return Response({'message' : 'welcome to the RathiShow api Server'})


# _______________________________________get users from clerk and import in User Model ____________________
@api_view(['GET'])    
@permission_classes([AllowAny])
def get_users(request):
    data =  fetchApiData()
    excludeQuerySet = None
    forcheckemails= []
    if data is not None:
        for user_data in data:
            id = user_data.get('id')
            name = str(user_data.get('first_name'))  +' ' +  str(user_data.get('last_name'))
            email = user_data.get('email_addresses')[0]['email_address']
            image_url = user_data.get('image_url')
            has_image = user_data.get('has_image')
            phone_numbers = user_data.get('phone_numbers')
            created_at = user_data.get('created_at')
            updated_at = user_data.get('updated_at')
            password_enabled = user_data.get('password_enabled')
            two_factor_enabled = user_data.get('two_factor_enabled')
            backup_code_enabled = user_data.get('backup_code_enabled')
            last_sign_in_at = user_data.get('last_sign_in_at')
            passkeys = user_data.get('passkeys')
            verification = user_data.get('email_addresses')[0]['verification']
            admin_role = user_data.get('public_metadata', {}).get('role','') == 'admin'
            
                            
            # recover those data from clerk user api those email already exist and deleted too
            # recoveredUser = Users.objects.filter(Q(email=email) & Q(is_deleted=True))
            # if recoveredUser:
            #     recoveredUser.update(is_deleted= False, id= id, name=name, image_url=image_url, has_image=has_image,phone_numbers=phone_numbers,created_at=created_at,updated_at=updated_at,password_enabled=password_enabled,two_factor_enabled=two_factor_enabled,backup_code_enabled=backup_code_enabled,last_sign_in_at=last_sign_in_at,passkeys=passkeys,verification=verification,admin_role=admin_role)
            # else:
            user, created = Users.objects.update_or_create(
                email = email,
                clerk_id = id,
                defaults={
                'name' : name,
                'image_url' : image_url,
                'has_image' : has_image,
                'phone_numbers' : phone_numbers,
                'created_at' : created_at,
                'updated_at' : updated_at,
                'password_enabled': password_enabled,
                'two_factor_enabled' : two_factor_enabled,
                'backup_code_enabled':backup_code_enabled,
                'last_sign_in_at' : last_sign_in_at,
                'passkeys' : passkeys,
                'verification' : verification,
                'is_staff' : admin_role,
                }
            )
            forcheckemails.append(email)
        excludeQuerySet = Users.objects.exclude(email__in = forcheckemails)
        if excludeQuerySet:
            excludeQuerySet.delete()
        return Response({'message','fetch  Users  Success'})
    else:
        return Response({'message' , 'fetch data error',}, status=400)
    
    
#  fetch TMDB-now-playing api data 
@api_view(['GET'])
@permission_classes([IsAdminRole])
def nowPlayingShow(request):
    url_movie_list = "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1"
    
    headers = {
                "accept": "application/json",
                "Authorization": "Bearer " +  TMDB_SECRET_KEY
                }
    data = None

    try:
        response = requests.get(url_movie_list, headers=headers)
        response.raise_for_status()
        data = response.json()['results']
        return  Response({"success":True, 'nowplaying' : data})
# Process data
    except requests.exceptions.ConnectionError as e:
        error_message = str(e)  # Convert the ConnectionError object to a string
        return Response({"status": "error", "message": f"Connection failed: {error_message}"})
    




def getMovieDetails(id):
    url_movie_detailes = f"https://api.themoviedb.org/3/movie/{id}"
    headers = {
                "accept": "application/json",
                "Authorization": f"Bearer  {TMDB_SECRET_KEY}"
                }
    movie_data = None
    credit_data = None
    try:
        response1 = requests.get(url_movie_detailes, headers=headers)
        response1.raise_for_status()
        movie_data = response1.json()
    except :
        return Response({"error": requests.exceptions.ConnectionError})
    

    url_creditDetails = url_movie_detailes + '/credits'
    try:
        response2 = requests.get(url_creditDetails, headers=headers)
        response2.raise_for_status()
        credit_data = response2.json()
    except :
        return Response({"error": requests.exceptions.ConnectionError})
    cast_data = []
    for cast in credit_data.get('cast'):
        filtered_cast = {
            'name' : cast.get('name'),
            'profile_path' : cast.get('profile_path'),
            'character' : cast.get('character'),
        }
        cast_data.append(filtered_cast)

    
    return {
    "_id": movie_data.get('id'),
    "title": movie_data.get('title'),
    "overview": movie_data.get('overview'),
    "poster_path": movie_data.get('poster_path'),
    "backdrop_path": movie_data.get('backdrop_path'),
    "genres": movie_data.get('genres'),
    "casts": cast_data,
    "release_date": movie_data.get('release_date'),
    "original_language": movie_data.get('original_language'),
    "tagline": movie_data.get('tagline') or '',
    "vote_average": movie_data.get('vote_average'),
    "vote_count": movie_data.get('vote_count'),
    "runtime": movie_data.get('runtime'),
    }
    


@api_view(['POST'])  
@permission_classes([IsAdminRole])
def addShow(request):
    datarequested = request.data
    movieID = datarequested.get('movieId')
    ist = pytz.timezone("Asia/Kolkata")
    try:
        moviedetail = getMovieDetails(movieID)
        moviee, _ = Movies.objects.get_or_create(id = movieID,defaults=moviedetail)
        for [date_str, times] in datarequested.get('showInput'):
            for time_str in times:
                dt = datetime.strptime(f'{date_str} {time_str}', "%Y-%m-%d %H:%M")
                ist_dt = ist.localize(dt)
                convertedDT = ist_dt.astimezone(pytz.UTC).isoformat()
                show, created =  shows.objects.get_or_create(movie = moviee, showDateTime = convertedDT, showPrice = datarequested.get('ShowPrice'))
                
                    

        
        return Response({'Success' : True, 'message':'Show Added Successfully'})
        
    except Exception as  e:
        print(e)
        return Response({'Success' : False, 'message':'Error! Adding Show failed ! '})
   
    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_added_showdetail(request, movieId):
    try:
        showlist = shows.objects.filter(Q(showDateTime__gte=datetime.now().isoformat()) & Q(movie=movieId)).select_related("movie")
        movie = Movies.objects.get(id = movieId)
        dateTime = {}
        for show in showlist:
            showId = show.id
            date_time = show.showDateTime
            date = date_time.split("T")[0]
            if date in list(dateTime.keys()):
                dateTime.get(date).append({
                "time" : date_time,
                "showId" : showId
            })
            else:
                dateTime.update({date : [{
                "time" : date_time,
                "showId" : showId
            }]})
        
        return Response({"Success":True,"movie": RshowMoviesSerializer(movie).data,"Show_DateTime" :dateTime})
    except Exception as e:
        return Response({"Success":False,"message": str(e)})

                


@api_view(['GET'])
@permission_classes([AllowAny])
def get_added_showdetails(request):
    try:
        showlist = shows.objects.filter(showDateTime__gte=datetime.now().isoformat()).select_related("movie")
        addedMovies = []
        addedShows = []
        for show in showlist:
            if not show.movie in addedShows:
                addedShows.append(show.movie) 
                addedMovies.append(RshowMoviesSerializer(show.movie).data)  
        return Response({"Success": True,'shows': addedMovies,})
    
    except:
        return Response({'Success' : False, 'message':Exception})
    

    

    

# --------------------------------clerk webhook------------------------------------>



import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # Allow POST from Clerk (external service)
def clerk_webhook(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)

    try:
        payload = json.loads(request.body)
        event_type = payload.get("type")

        # Handle specific events
        if event_type == "user.created":
            clerk_user = payload["data"]
            # Save or update user in your DB
            # (e.g., via clerk_id, email, etc.)

        elif event_type == "user.deleted":
            clerk_id = payload["data"]["id"]
            # Delete or deactivate user

        return JsonResponse({"status": "success"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    








# <--------------------checkadminuser------------------>



from rest_framework import viewsets
from rest_framework.decorators import action
class AdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminRole]
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def is_admin(self, request):
        
        if request.user.is_staff and request.user.is_authenticated:
            return Response({"message":"Success","is_admin" : True})
        else:
            return Response({"message":"Unsuccess", "is_admin" : False})
        

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        try:
            bookings = Booking.objects.filter(isPaid = True)
            activeshows = shows.objects.filter(showDateTime__gte = str(datetime.now().isoformat())).select_related('movie')
            totalUsers = Users.objects.all().count()
            revenue = 0
            for booking in bookings:
                revenue += booking.amount
            dashboardData = {
                "totalBookings": bookings.count(),
                "totalRevenue": revenue,
                "totalUser": totalUsers,
                "activeShows" : RshowShowsSerializer(activeshows, many=True).data
            }
            return Response({"Success":True,"dashboardData":dashboardData})
        except Exception as e:
            return Response({"Success":False,"message":str(e)})
        
    @action(detail=False, methods=['get'])
    def show_all(self, request):
        try:
            all_shows = shows.objects.all()
            return Response({"Success":True,"Shows":RshowShowsSerializer(all_shows, many=True).data})
        except Exception as e:
            return Response({"Success":False,"message":str(e)})

    @action(detail=False, methods=['get'])
    def all_bookings(seld,request):
        try:
            bookings = Booking.objects.all()
            for booking in bookings:
                user = Users.objects.get(clerk_id = booking.user).name
                booking.user = user
            return Response({"Success":True,"Bookings":RshowBookingSerializer(bookings, many=True).data})
        except Exception as e:
                    return Response({"Success":False,"message":str(e)})
        



#   -------------------- Bookings related-------------------------
class bookingViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    client = razorpay.Client(auth=(os.getenv('RZR_KEY_ID'), os.getenv('RZR_SECRET_KEY')))

    @action(detail=False, methods=['get'])
    def userBookings(self, request):
        try:
            userId = request.user.clerk_id
            bookings = Booking.objects.filter(user = userId).select_related('show__movie').order_by('-created_at')
            return Response({"Success":True,"userBookings" : RshowBookingSerializer(bookings, many=True).data})
        except Exception as e:
            return Response({"Success":False,"message":str(e)})


    @action(detail=False, methods=["POST"])
    def create_booking(self, request):
        notAvailable = False
        showId = request.data.get('showId')
        selectedSeats = request.data.get("selectedSeats")
        try:
            show = shows.objects.get(id = showId)
        except Exception as e :
            print("msg:",e)
            return Response({"Success": False,"message":"unable to find show from server"})
        list_occupied_seats = list(show.occupiedSeats.keys())
        for seat in selectedSeats:
            if seat in list_occupied_seats:
                notAvailable = True 
        if notAvailable:
            return Response({"Success" : False, "message":"Selected Seats are not available"})
            # for seat in selectedSeats:
            #     occupiedSeats.update({seat : request.user.clerk_id})
        
            # show.occupiedSeats = occupiedSeats
            # show.save(update_fields=['occupiedSeats'])
        DATA = {
            "amount": int(show.showPrice) * len(selectedSeats) * 100,
            "currency": "INR",
            "payment_capture" : 1,
            
        }
        rzr_booking = bookingViewSet.client.order.create(data=DATA)
        
            
        return Response({"Success" : True, "response": {
        "order_id": rzr_booking["id"],
        "amount": rzr_booking["amount"],
        "currency": rzr_booking["currency"],
        "key": os.getenv('RZR_KEY_ID'),
        "movie_name": show.movie.title,
        "user_id": request.user.clerk_id,
        "callback_url" : os.getenv("RZR_CALLBACK_URL")
        }})
        
        
    @action(detail=False, methods=['post'])
    def verify_payment(self,request):
        import pytz
        ist = pytz.timezone("Asia/Kolkata")
        try:
            show = shows.objects.get(id = request.data.get("showId"))
            selectedSeats = request.data.get("selectedSeats")
            booking = Booking.objects.create(
                user = request.user.clerk_id,
                show = show,
                amount = int(show.showPrice) * len(selectedSeats),
                bookedSeats = selectedSeats
            )
            occupiedseats = show.occupiedSeats
            for seat in selectedSeats:
                occupiedseats.update({seat : request.user.clerk_id})
            show.occupiedSeats = occupiedseats
            show.save(update_fields=['occupiedSeats'])
        except Exception as e:
            print("msg:",e)
        if(request.data.get("razorpay_signature")):
            order_id = request.data.get("razorpay_order_id")
            payment_id = request.data.get("razorpay_payment_id")
            signature = request.data.get("razorpay_signature")
            bookingViewSet.client.utility.verify_payment_signature({
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature})
            booking.isPaid = True
            booking.save(update_fields=['isPaid'])
            user1 = get_object_or_404(Users, clerk_id = booking.user)
            date = datetime.fromisoformat(booking.show.showDateTime).astimezone(ist).date()
            time = datetime.fromisoformat(booking.show.showDateTime).astimezone(ist).strftime("%I:%M %p")
            

            subject = "🎟️ Your Tickets are Confirmed!"
            html_content = f"""
            <h2>Hi {user1.name or user1.email}</h2>
            <p>Your booking has been confirmed. Here are your ticket details:</p>
            <ul>
                <li><strong>Movie:</strong> {booking.show.movie.title}</li>
                <li><strong>Date & Time:</strong> {date} & {time}</li>
                <li><strong>Seats:</strong> {", ".join(booking.bookedSeats)}</li>
                <li><strong>Booking ID:</strong>{ booking.id}</li>
            </ul>
            <p>Enjoy your movie! 🍿</p>
            """
            text_content = strip_tags(html_content)
            emails = EmailMultiAlternatives(
                subject,
                text_content,
                settings.DEFAULT_FROM_EMAIL,
                [user1.email],
            )
            emails.attach_alternative(html_content, "text/html")
            emails.send() 
            return Response({"success": True, "message": "Payment verification Successfull","redirect": "/my-bookings"})  
        else:
            return Response({"success": False, "message": "Payment Failed","redirect": "/my-bookings","message2": " Booked your show for 10 minutes for verify payment"})




            
    @action(detail=True,methods=["GET"])
    def Seats(self, request, pk):
        show = get_object_or_404(shows, id= pk)
        if show:
            occupiedSeats = list(show.occupiedSeats.keys())
            return Response({"Success" : True, "seats": occupiedSeats})
        return Response({"Success" : False, "message": "show not available or not find in server"})
    


    
    
        # ___________________________________Favorites__________________________________________________
class favoriteViewset(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    @action(detail=False, methods=['put','post'])
    def update_favorite(self, request):
        try:
            movieId = request.data.get('movieId')
            userId = request.user.clerk_id
            user = requests.get("https://api.clerk.com/v1/users/"+userId,
            headers={
            "Authorization": "Bearer "+os.getenv('CLERK_SECRET_KEY')
            }
        )
            private_metadata = user.json().get("private_metadata")
            
            if not private_metadata.get('favorite'):
                private_metadata.update({'favorite': []})
           
            if not movieId in private_metadata.get("favorite"):
                private_metadata.get("favorite").append(movieId)

            else:
                private_metadata['favorite'] = list(filter(lambda x:  x != movieId, private_metadata.get("favorite")))
            updated_user = requests.patch("https://api.clerk.com/v1/users/"+userId,
            headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer "+os.getenv("CLERK_SECRET_KEY")
            },
            json={"private_metadata" : {'favorite':private_metadata['favorite']}})
            if updated_user.json()['private_metadata']['favorite'] > user.json()['private_metadata']['favorite']:
                return Response({'Success': True,'message':'Favorites Added Successfully'})
            else:
                return Response({"Success": True, "message": "Favorites Removed Successfully"})
        except :
            return Response({'Success': False,'message':"cant update! Something Wrong"})
        
    @action(detail=False, methods=['get'])
    def favorites(self, request):
        try:
            if request.user.is_authenticated:
                user = requests.get("https://api.clerk.com/v1/users/"+request.user.clerk_id,
                headers={
                    "Authorization": "Bearer "+os.getenv('CLERK_SECRET_KEY')

            }
        )
                fav_moviesList = user.json().get('private_metadata').get('favorite')
                if fav_moviesList:
                    fav_movies = Movies.objects.filter(id__in = fav_moviesList)
                    return Response({'Success': True,'movies':RshowMoviesSerializer(fav_movies,many=True).data})
                else:
                    return Response({'Success': True,'movies':[]})
            else:
                return Response({'Success': False,'message':"there is no Movie for Anonymous"})
        except Exception as e:
            return Response({'Success': False,'message':str(e)})
        
        


            





        



        

        


           
