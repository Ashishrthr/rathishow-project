from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.db.models import Q
from datetime import datetime
import uuid
# user 
class MyUserManager(BaseUserManager):

    def create_user(self,email, clerk_id, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        if not clerk_id:
            raise ValueError("Clerk ID is required")
        email = self.normalize_email(email)
        user = self.model(clerk_id=clerk_id, email=email,  **extra_fields)
        user.set_password(password or '')  # passwordless
        user.save(using=self._db)
        return user

    def create_superuser(self, email, clerk_id='user_31jWRLHzdWJOMzKmfRgbL9p112T',  password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user( email, clerk_id , password, **extra_fields)
        
            
# User model

class Users(AbstractBaseUser, PermissionsMixin):
    clerk_id = models.CharField(primary_key=True, default='')
    name = models.CharField(max_length = 50)
    email = models.EmailField(unique=True)
    image_url = models.URLField(default='')
    has_image = models.BooleanField(default=False)
    phone_numbers = models.JSONField(default=list, blank=True,null=True)
    created_at = models.BigIntegerField(blank=True, null=True)
    updated_at = models.BigIntegerField(blank=True,null=True)
    password_enabled = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    backup_code_enabled = models.BooleanField(default=False)
    last_sign_in_at = models.BigIntegerField(blank=True, null=True)
    passkeys = models.JSONField(default=list,blank=True, null=True)
    verification = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)



    objects = MyUserManager()

    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.name or self.email.split('@')[0]


   


# Create your models here.
class Movies(models.Model):
    id = models.IntegerField(unique=True)
    _id = models.CharField(primary_key=True, max_length=50)
    title =  models.CharField(max_length=100)
    overview = models.CharField()
    poster_path = models.CharField()
    backdrop_path = models.CharField()
    genres = models.JSONField(default=list)
    casts = models.JSONField(default=list)
    release_date = models.DateField()
    original_language = models.CharField()
    tagline = models.CharField(default='') 
    vote_average = models.FloatField()
    vote_count = models.IntegerField()
    runtime = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
        

class shows(models.Model):
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        movie = models.ForeignKey(Movies, on_delete=models.CASCADE, related_name='movie')
        showDateTime = models.CharField(blank=True,null=True)
        showPrice = models.IntegerField()
        occupiedSeats= models.JSONField(default=dict)
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)



class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.CharField()
    show = models.ForeignKey(shows, on_delete=models.CASCADE , related_name='show')
    amount = models.IntegerField(default=0)
    bookedSeats = models.JSONField(default=list)
    isPaid = models.BooleanField(default=False)
    paymentLink = models.CharField(default='')
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True)