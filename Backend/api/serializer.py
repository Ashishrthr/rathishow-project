from rest_framework import serializers
from .models import Users , Movies, shows, Booking

class RshowUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'
class RshowMoviesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movies
        fields = '__all__'
class RshowShowsSerializer(serializers.ModelSerializer):
    movie = RshowMoviesSerializer()
    class Meta:
        model = shows
        fields = '__all__'
class RshowBookingSerializer(serializers.ModelSerializer):
    show = RshowShowsSerializer()
    class Meta:
        model = Booking
        fields = "__all__"
