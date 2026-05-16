from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from .models import Booking, shows,  Users
from .tasks import schedule_delete_unpaid
from datetime import datetime, timezone
import os
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
from django.templatetags.static import static
from email.mime.image import MIMEImage
from django.template.loader import render_to_string
import pytz
import requests
import resend


@receiver(post_save, sender=Booking)
def schedule_delete_booking(sender, instance, created, **kwargs):
    if created:
        schedule_delete_unpaid(instance.id, delay=600)
        return print("booking",instance.id, "created")
    else:
        print("payment updated")
    

# @receiver(post_save, sender=shows)
# def schedule_delete_show(sender, instance, created, **kwargs):
#     if created:
#         # Email to  be  sent  After Adding Show
        
#         ist = pytz.timezone("Asia/Kolkata")
#         users_email_list = list(Users.objects.values_list("email",flat=True))
#         logo_path = os.path.join(settings.BASE_DIR, 'api', 'static', 'logo', 'logo.png')
#         poster_path =  f"https://image.tmdb.org/t/p/w300{instance.movie.poster_path}"
#         showTime = datetime.fromisoformat(instance.showDateTime).astimezone(ist)
#         subject = "🎟️ New Show Added"
#         context = {
#             'movie_name' : instance.movie.title,
#             'movie_date' : showTime.strftime("%d-%m-%Y"),
#             'movie_time' : showTime.strftime("%I:%M")
#         }
#         with open(logo_path, 'rb') as f:
#             img1 = MIMEImage(f.read())
#             img1.add_header('Content-ID', '<logo_cid>')
#             img1.add_header('Content-Disposition', 'inline', filename='logo.png')
#             f.close()
#         if poster_path:
#             try:
#                 pimg =  requests.get(poster_path, timeout=  3)
#                 pimg.raise_for_status()
#                 poster_img  = pimg.content
#                 img2 = MIMEImage(poster_img)
#                 img2.add_header('Content-ID', '<poster_cid>')
#                 img2.add_header('Content-Disposition', 'inline', filename='poster.jpg')
#             except Exception as e:
#                 # if poster download fails, print and continue sending without poster
#                 print("Failed to download/attach poster:", str(e))
#         html_content =  render_to_string('emailtemp.html', context)
#         text_content = strip_tags(html_content)
#         for user_email in  users_email_list:
#             emails = EmailMultiAlternatives(
#                 subject,
#                 text_content,
#                 settings.DEFAULT_FROM_EMAIL,
#                 [user_email],
#             )
#             emails.attach_alternative(html_content, "text/html")
#             emails.attach(img1)
#             if poster_path:
#                 emails.attach(img2)
#             emails.send(fail_silently=False)
#             print("emaiilsent successfully  to  ",user_email)
        
#     else:
#         print(instance.id, "updated show's seats")
        
resend.api_key = os.getenv("RESEND_API_KEY")


@receiver(post_save, sender=shows)
def schedule_delete_show(sender, instance, created, **kwargs):

    if created:

        try:

            ist = pytz.timezone("Asia/Kolkata")

            showTime = datetime.fromisoformat(
                str(instance.showDateTime)
            ).astimezone(ist)

            movie_name = instance.movie.title
            movie_date = showTime.strftime("%d-%m-%Y")
            movie_time = showTime.strftime("%I:%M %p")

            poster_url = ""

            if instance.movie.poster_path:
                poster_url = f"https://image.tmdb.org/t/p/w300{instance.movie.poster_path}"

            html = f"""
            <div style="background:#0f0f0f;padding:30px;font-family:Arial;color:white">

                <h1 style="color:#ff4d4d;">
                    🎬 New Show Added
                </h1>

                <h2>{movie_name}</h2>

                <p>
                    <strong>Date:</strong> {movie_date}
                </p>

                <p>
                    <strong>Time:</strong> {movie_time}
                </p>

                <img 
                    src="{poster_url}" 
                    width="250"
                    style="border-radius:10px;margin-top:20px;"
                >

            </div>
            """

            users_email_list = Users.objects.values_list(
                "email",
                flat=True
            )

            for user_email in users_email_list:

                try:

                    resend.Emails.send({
                        "from": "RathiShow <onboarding@resend.dev>",
                        "to": user_email,
                        "subject": "🎬 New Show Added",
                        "html": html,
                    })

                    print("Email sent to", user_email)

                except Exception as e:

                    print("Failed for", user_email)
                    print(str(e))

        except Exception as e:

            print("Main Email Error")
            print(str(e))

    else:

        print(instance.id, "updated show's seats")




@receiver(post_delete, sender=Booking)
def check_delete(sender, instance, **kwargs):
    print(instance, "deleted")

