import threading
from .models import Booking, shows



'''def check_and_delete(instance_id, delay=60):
    try:
        obj = Booking.objects.get(id = instance_id)
        if not obj.isPaid:
            obj.delete()
            print('deleted')
    except Booking.DoesNotExist:
        pass
    threading.Timer'''


def schedule_delete_unpaid(booking_id, delay):  # delay in seconds
    def delete_task():
        try:
            booking = Booking.objects.get(id=booking_id)
            if not booking.isPaid:
                show = shows.objects.get(id = booking.show.id)
                occupiedseats = show.occupiedSeats
                booking.delete()
                for seat in booking.bookedSeats:
                    del occupiedseats[seat]
                show.occupiedSeats = occupiedseats
                show.save(update_fields=['occupiedSeats'])
        except Booking.DoesNotExist:
            pass  # already deleted

    # Run in background thread → won’t block Django request
    threading.Timer(delay, delete_task).start()