from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'admin', views.AdminViewSet, basename='admin')
router.register(r'bookings', views.bookingViewSet, basename='bookings')
router.register(r'user', views.favoriteViewset, basename='favorites')



urlpatterns = [
    # path('users', views.index),
    path('users/view', views.get_users),
    path('show/nowplaying', views.nowPlayingShow),
    path('show/add', views.addShow),
    path('show/<int:movieId>', views.get_added_showdetail, name= 'get-added-showdetail'),
    path('show/all', views.get_added_showdetails, name= 'get-added-showdetails'),
    path("clerk/webhook/", views.clerk_webhook, name="clerk_webhook"),
    path('auth/', include('rest_framework.urls'), name='rest_framework'),
    path('role/', include(router.urls))

]
