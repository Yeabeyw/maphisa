import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, User, Check, X, AlertCircle, Timer, Bell, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listServices, getBookedSlots, createBooking, getUserBookings, rescheduleBooking, cancelBooking, addToWaitlist } from "@/lib/admin.functions";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — Maphisa's Barber Shop" },
      { name: "description", content: "View your bookings, check availability, and manage your appointments." },
      { property: "og:title", content: "Bookings — Maphisa's" },
      { property: "og:description", content: "Manage your barber shop appointments." },
    ],
  }),
  component: Bookings,
});

// Time slots configuration
const TIME_SLOTS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00"
];

function Bookings() {
  const qc = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string>("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Fetch services from database
  const list = useServerFn(listServices);
  const { data: servicesData } = useQuery({ queryKey: ["services"], queryFn: () => list() });
  const rawServices = servicesData?.services || [];
  const services = rawServices.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i);

  // Fetch booked slots for selected date
  const getSlots = useServerFn(getBookedSlots);
  const { data: bookedSlotsData } = useQuery({
    queryKey: ["bookedSlots", selectedDate],
    queryFn: () => getSlots({ data: { date: selectedDate } }),
    enabled: !!selectedDate,
  });
  const bookedSlots = bookedSlotsData?.bookedSlots || [];

  // Fetch user bookings by phone number
  const getUserBookingsFn = useServerFn(getUserBookings);
  const { data: userBookingsData, refetch: refetchUserBookings } = useQuery({
    queryKey: ["userBookings", customerPhone],
    queryFn: () => getUserBookingsFn({ data: { phone: customerPhone } }),
    enabled: customerPhone.length >= 8,
  });
  const myBookings = userBookingsData?.bookings || [];

  // Set default service when services load
  useEffect(() => {
    if (services.length > 0 && !selectedService) {
      setSelectedService(services[0].name);
    }
  }, [services, selectedService]);

  const getServiceDuration = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName);
    return service ? service.duration_minutes : 30;
  };

  const getAvailableSlots = () => {
    const duration = getServiceDuration(selectedService);
    const slotsNeeded = Math.ceil(duration / 30); // 30-minute intervals
    
    return TIME_SLOTS.filter((slot, index) => {
      // Check if this slot and required subsequent slots are not booked
      for (let i = 0; i < slotsNeeded; i++) {
        const slotToCheck = TIME_SLOTS[index + i];
        if (!slotToCheck || bookedSlots.includes(slotToCheck)) {
          return false;
        }
      }
      return true;
    });
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
  };

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: () => {
      const service = services.find(s => s.name === selectedService);
      return createBooking({
        data: {
          service_id: service?.id || "",
          booking_date: selectedDate,
          booking_time: selectedSlot,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || undefined,
          notes: notes || undefined,
        },
      });
    },
    onSuccess: () => {
      setShowBookingForm(false);
      setSelectedSlot("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setNotes("");
      qc.invalidateQueries({ queryKey: ["bookedSlots", selectedDate] });
      refetchUserBookings();
      setNotification({
        type: 'success',
        message: 'Booking confirmed! You will receive a confirmation email shortly.',
      });
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error: any) => {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to create booking. Please try again.',
      });
      setTimeout(() => setNotification(null), 5000);
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if slot is still available
    if (bookedSlots.includes(selectedSlot)) {
      setNotification({
        type: 'error',
        message: 'This time slot is no longer available. Please select another time.'
      });
      return;
    }

    createBookingMutation.mutate();
  };

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) => cancelBooking({ data: { booking_id: bookingId } }),
    onSuccess: () => {
      refetchUserBookings();
      qc.invalidateQueries({ queryKey: ["bookedSlots", selectedDate] });
      setNotification({
        type: 'success',
        message: 'Booking cancelled successfully.',
      });
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error: any) => {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to cancel booking.',
      });
      setTimeout(() => setNotification(null), 5000);
    },
  });

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  // Reschedule booking mutation
  const rescheduleBookingMutation = useMutation({
    mutationFn: (data: { bookingId: string; newDate: string; newTime: string }) =>
      rescheduleBooking({
        data: {
          booking_id: data.bookingId,
          new_date: data.newDate,
          new_time: data.newTime,
        },
      }),
    onSuccess: () => {
      setShowRescheduleForm(false);
      setRescheduleBookingId("");
      refetchUserBookings();
      qc.invalidateQueries({ queryKey: ["bookedSlots", selectedDate] });
      setNotification({
        type: 'success',
        message: 'Booking rescheduled successfully!',
      });
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error: any) => {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to reschedule booking.',
      });
      setTimeout(() => setNotification(null), 5000);
    },
  });

  const handleRescheduleBooking = (bookingId: string) => {
    setRescheduleBookingId(bookingId);
    setShowRescheduleForm(true);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rescheduleBookingMutation.mutate({
      bookingId: rescheduleBookingId,
      newDate: selectedDate,
      newTime: selectedSlot,
    });
  };

  // Waitlist mutation
  const waitlistMutation = useMutation({
    mutationFn: () => {
      const service = services.find(s => s.name === selectedService);
      return addToWaitlist({
        data: {
          service_id: service?.id || "",
          preferred_date: selectedDate,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || undefined,
        },
      });
    },
    onSuccess: () => {
      setShowWaitlistForm(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setNotification({
        type: 'success',
        message: 'Added to waitlist! We will contact you when a slot becomes available.',
      });
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error: any) => {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to add to waitlist.',
      });
      setTimeout(() => setNotification(null), 5000);
    },
  });

  const isLateArrival = (bookingDate: string, bookingTime: string) => {
    const now = new Date();
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const gracePeriodMinutes = 15; // 15-minute grace period
    const lateThreshold = new Date(bookingDateTime.getTime() + gracePeriodMinutes * 60000);
    return now > lateThreshold;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pt-20 pb-16">
      <section className="mb-10">
        <p className="font-mono-label text-primary mb-2">— Bookings</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold max-w-4xl leading-[1.1]">Schedule your appointment.</h1>
      </section>

      {notification && (
        <div className={`mb-6 p-4 rounded-sm border ${notification.type === 'success' ? 'border-primary bg-primary/10' : 'border-red-500 bg-red-500/10'}`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <Check className="h-5 w-5 text-primary" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
            <p className={notification.type === 'success' ? 'text-primary' : 'text-red-500'}>{notification.message}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Booking Section */}
        <div className="space-y-6">
          <div className="rounded-sm border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-bold mb-4">Book a Slot</h2>
            
            <div className="space-y-4">
              <div>
                <label className="font-mono-label text-muted-foreground block mb-2">Select Service</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                  disabled={services.length === 0}
                >
                  {services.map(service => (
                    <option key={service.id} value={service.name}>{service.name} ({service.duration_minutes} min) - M{Number(service.price_maloti).toFixed(0)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono-label text-muted-foreground block mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-mono-label text-muted-foreground block mb-2">Available Time Slots</label>
                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {getAvailableSlots().map(slot => (
                    <button
                      key={slot}
                      onClick={() => handleSlotSelect(slot)}
                      className={`h-10 rounded-sm border text-sm font-medium transition-colors ${
                        selectedSlot === slot
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:border-primary'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {getAvailableSlots().length === 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">No available slots for this service on the selected date.</p>
                    <button
                      onClick={() => setShowWaitlistForm(true)}
                      className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      <Bell className="h-4 w-4" /> Join waitlist
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showBookingForm && (
            <div className="rounded-sm border border-border bg-card p-6 animate-in slide-in-from-top-2">
              <h3 className="font-display text-xl font-bold mb-4">Complete Your Booking</h3>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="font-mono-label text-muted-foreground block mb-2">Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="font-mono-label text-muted-foreground block mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                    placeholder="+266 XXXX XXXX"
                  />
                </div>
                <div>
                  <label className="font-mono-label text-muted-foreground block mb-2">Email (optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="font-mono-label text-muted-foreground block mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-sm border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Any special requests?"
                  />
                </div>
                <div className="p-3 bg-secondary rounded-sm">
                  <p className="text-sm"><strong>Service:</strong> {selectedService}</p>
                  <p className="text-sm"><strong>Date:</strong> {selectedDate}</p>
                  <p className="text-sm"><strong>Time:</strong> {selectedSlot}</p>
                  <p className="text-sm"><strong>Duration:</strong> {getServiceDuration(selectedService)} minutes</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={createBookingMutation.isPending}
                    className="flex-1 h-11 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all disabled:opacity-50"
                  >
                    {createBookingMutation.isPending ? 'Creating...' : 'Confirm Booking'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingForm(false);
                      setSelectedSlot("");
                    }}
                    className="h-11 rounded-sm border border-border px-4 text-sm font-semibold hover:border-primary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {showWaitlistForm && (
            <div className="rounded-sm border border-border bg-card p-6 animate-in slide-in-from-top-2">
              <h3 className="font-display text-xl font-bold mb-4">Join Waitlist</h3>
              <form onSubmit={(e) => { e.preventDefault(); waitlistMutation.mutate(); }} className="space-y-4">
                <div>
                  <label className="font-mono-label text-muted-foreground block mb-2">Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="font-mono-label text-muted-foreground block mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                    placeholder="+266 XXXX XXXX"
                  />
                </div>
                <div>
                  <label className="font-mono-label text-muted-foreground block mb-2">Email (optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={waitlistMutation.isPending}
                    className="flex-1 h-11 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all disabled:opacity-50"
                  >
                    {waitlistMutation.isPending ? 'Adding...' : 'Join Waitlist'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWaitlistForm(false)}
                    className="h-11 rounded-sm border border-border px-4 text-sm font-semibold hover:border-primary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {showRescheduleForm && (
            <div className="rounded-sm border border-border bg-card p-6 animate-in slide-in-from-top-2">
              <h3 className="font-display text-xl font-bold mb-4">Reschedule Booking</h3>
              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label className="font-mono-label text-muted-foreground block mb-2">Select New Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-mono-label text-muted-foreground block mb-2">Select New Time</label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {getAvailableSlots().map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`h-10 rounded-sm border text-sm font-medium transition-colors ${
                          selectedSlot === slot
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-primary'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={rescheduleBookingMutation.isPending}
                    className="flex-1 h-11 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all disabled:opacity-50"
                  >
                    {rescheduleBookingMutation.isPending ? 'Rescheduling...' : 'Confirm Reschedule'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRescheduleForm(false);
                      setRescheduleBookingId("");
                      setSelectedSlot("");
                    }}
                    className="h-11 rounded-sm border border-border px-4 text-sm font-semibold hover:border-primary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* My Bookings Section */}
        <div className="rounded-sm border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-bold mb-4">My Bookings</h2>
          
          <div className="mb-4">
            <label className="font-mono-label text-muted-foreground block mb-2">Enter your phone number to view bookings</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
              placeholder="+266 XXXX XXXX"
            />
          </div>
          
          {customerPhone.length < 8 ? (
            <p className="text-muted-foreground text-sm">Enter your phone number to view your bookings.</p>
          ) : myBookings.length === 0 ? (
            <p className="text-muted-foreground">No bookings found. Book your first appointment!</p>
          ) : (
            <div className="space-y-4">
              {myBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={() => handleCancelBooking(booking.id)}
                  onReschedule={() => handleRescheduleBooking(booking.id)}
                  isLate={isLateArrival(booking.booking_date, booking.booking_time)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel, onReschedule, isLate }: { booking: any; onCancel: () => void; onReschedule: () => void; isLate: boolean }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
      const diff = bookingDateTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Session started");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [booking.booking_date, booking.booking_time]);

  return (
    <div className={`p-4 rounded-sm border ${isLate ? 'border-red-500 bg-red-500/5' : 'border-border bg-secondary'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-display text-lg font-bold">{booking.services?.name || booking.service}</h3>
          <p className="text-sm text-muted-foreground">{booking.customer_name || booking.customerName}</p>
        </div>
        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${
          booking.status === 'confirmed' ? 'bg-primary/10 text-primary' : 'bg-muted'
        }`}>
          {booking.status}
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {booking.booking_date || booking.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {booking.booking_time || booking.time}
        </span>
      </div>

      {booking.status === 'confirmed' && (
        <div className="flex items-center gap-2 text-sm mb-3">
          <Timer className="h-4 w-4 text-primary" />
          <span className={isLate ? 'text-red-500 font-medium' : 'text-primary'}>
            {isLate ? '⚠️ Late arrival - Please reschedule' : `Time remaining: ${timeLeft}`}
          </span>
        </div>
      )}

      {isLate && (
        <div className="mb-3 p-2 bg-red-500/10 rounded-sm">
          <p className="text-xs text-red-500">
            You have arrived late for your appointment. Please contact us to reschedule.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onReschedule}
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Reschedule
        </button>
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
