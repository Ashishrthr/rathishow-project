from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Users,Movies,shows
from datetime import datetime, timezone
# from .models import userModel

# Register your models here.
# admin.site.register(userModel)

class UserAdmin(BaseUserAdmin):
    # The forms to add and change user instances

    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    list_display = ( 'name','email', 'is_staff', 'is_superuser',
         'formatted_last_sign_in_at')
    list_filter = ('is_staff', 'is_superuser', 'is_active',)
    fieldsets = (
        (None, {'fields': ('clerk_id', 'email', 'name', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'is_active')}),
        ('Security', {'fields': ('two_factor_enabled', 'backup_code_enabled', 'password_enabled')}),
        ('Timestamps', {'fields': ('formatted_created_at', 'formatted_updated_at', 'formatted_last_sign_in_at')}),
        ('Extra', {'fields': ('phone_numbers', 'passkeys', 'verification', 'image_url', 'has_image', )}),
    )
    readonly_fields = ('formatted_created_at','formatted_updated_at', 'formatted_last_sign_in_at',)
    # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'is_staff', 'is_superuser'),
        }),
    )
    search_fields = ('email','name')
    ordering = ('email',)
    filter_horizontal = ()

    def formatted_created_at(self,obj):
        if obj.created_at:
            try:
                # Convert milliseconds to datetime
                timestamp_sec = int(obj.created_at) / 1000
                dt = datetime.fromtimestamp(timestamp_sec, tz=timezone.utc)
                return dt.strftime('%Y-%m-%d %H:%M:%S')
            except Exception as e:
                return 'Invalid timestamp'
        return '-'
    formatted_created_at.short_description = 'Created At'
    
    def formatted_last_sign_in_at(self, obj):
        if obj.last_sign_in_at:
            try:
                timestamp_sec = int(obj.last_sign_in_at) / 1000
                dt = datetime.fromtimestamp(timestamp_sec, tz=timezone.utc)
                return dt.strftime('%Y-%m-%d %H:%M:%S')
            except Exception as e:
                return 'Invalid timestamp'
        return '-'
    formatted_last_sign_in_at.short_description = 'Last Sign-In'
    def formatted_updated_at(self, obj):
        if obj.updated_at:
            try:
                timestamp_sec = int(obj.updated_at) / 1000
                dt = datetime.fromtimestamp(timestamp_sec, tz=timezone.utc)
                return dt.strftime('%Y-%m-%d %H:%M:%S')
            except Exception as e:
                return 'Invalid timestamp'
        return '-'
    formatted_updated_at.short_description = 'Updated_at'
admin.site.register(Users, UserAdmin)
admin.site.register(Movies)
admin.site.register(shows)
