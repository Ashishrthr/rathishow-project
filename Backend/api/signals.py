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


@receiver(post_save, sender=Booking)
def schedule_delete_booking(sender, instance, created, **kwargs):
    if created:
        schedule_delete_unpaid(instance.id, delay=600)
        return print("booking",instance.id, "created")
    else:
        print("payment updated")
    

@receiver(post_save, sender=shows)
def schedule_delete_show(sender, instance, created, **kwargs):

    if created:

        ist = pytz.timezone("Asia/Kolkata")

        showTime = datetime.fromisoformat(
            str(instance.showDateTime)
        ).astimezone(ist)

        subject = "🎬 New Show Added"

        context = {
            "movie_name": instance.movie.title,
            "movie_date": showTime.strftime("%d-%m-%Y"),
            "movie_time": showTime.strftime("%I:%M %p"),
        }

        html_content = render_to_string(
            "emailtemplate.html",
            context
        )

        text_content = strip_tags(html_content)

        logo_path = os.path.join(
            settings.BASE_DIR,
            "api",
            "static",
            "logo",
            "logo.png"
        )

        # SMALLER IMAGE SIZE
        poster_url = (
            f"https://image.tmdb.org/t/p/w300"
            f"{instance.movie.poster_path}"
        )

        # LOOP WITHOUT LOADING FULL LIST INTO RAM
        users = Users.objects.values_list(
            "email",
            flat=True
        )

        for user_email in users:

            try:

                emails = EmailMultiAlternatives(
                    subject,
                    text_content,
                    settings.DEFAULT_FROM_EMAIL,
                    [user_email],
                )

                emails.attach_alternative(
                    html_content,
                    "text/html"
                )

                # LOGO
                try:

                    with open(logo_path, "rb") as f:

                        logo = MIMEImage(f.read())

                        logo.add_header(
                            "Content-ID",
                            "<logo_cid>"
                        )

                        logo.add_header(
                            "Content-Disposition",
                            "inline",
                            filename="logo.png"
                        )

                        emails.attach(logo)

                except Exception as e:

                    print("logo failed", str(e))

                # POSTER
                try:

                    response = requests.get(
                        poster_url,
                        timeout=2,
                        stream=True
                    )

                    if response.status_code == 200:

                        poster = MIMEImage(
                            response.content
                        )

                        poster.add_header(
                            "Content-ID",
                            "<poster_cid>"
                        )

                        poster.add_header(
                            "Content-Disposition",
                            "inline",
                            filename="poster.jpg"
                        )

                        emails.attach(poster)

                    response.close()

                except Exception as e:

                    print("poster failed", str(e))

                # SEND
                emails.send(fail_silently=True)

                print(
                    "emailsent successfully to",
                    user_email
                )

                # IMPORTANT MEMORY CLEANUP
                del emails

            except Exception as e:

                print(
                    "email failed",
                    str(e)
                )

    else:

        print(instance.id, "updated show's seats")
        


@receiver(post_delete, sender=Booking)
def check_delete(sender, instance, **kwargs):
    print(instance, "deleted")

