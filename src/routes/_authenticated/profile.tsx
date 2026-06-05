import { createFileRoute } from "@tanstack/react-router";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { getMyBookings } from "@/lib/booking.functions";
import { Calendar, Clock, Star, Gift, User, Phone, Mail, Award, Camera, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Maphisa's Barber Shop" },
      { name: "description", content: "View your profile, booking history, and loyalty rewards." },
      { property: "og:title", content: "My Profile — Maphisa's" },
      { property: "og:description", content: "Manage your account and view rewards." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { user, profile } = useFirebaseAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { data: customerData } = useQuery({
    queryKey: ["customer", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    },
    enabled: !!user?.uid
  });

  const fetchBookings = useServerFn(getMyBookings);
  const { data: bookingsData } = useQuery({
    queryKey: ["customerBookings", user?.uid],
    queryFn: () => fetchBookings(),
    enabled: !!user?.uid,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["customerReviews", user?.uid],
    queryFn: async () => {
      // TODO: Implement Firestore reviews query
      return [];
    },
    enabled: !!user?.uid,
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.uid) throw new Error('User not authenticated');
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      // Update profile document
      await updateDoc(doc(db, 'profiles', user.uid), { photo_url: photoURL });
      
      return photoURL;
    },
    onSuccess: () => {
      // Invalidate customer query to refresh profile data
      window.location.reload();
    }
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingPhoto(true);
    try {
      await uploadPhotoMutation.mutateAsync(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-6">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  const customer = customerData || {};
  const bookings = bookingsData?.bookings || [];
  const reviews = reviewsData || [];

  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-16">
      <section className="mb-12">
        <p className="font-mono-label text-primary mb-4">— My Profile</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold max-w-4xl leading-[1]">Welcome back, {customer.full_name || user.email}</h1>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="space-y-6">
          <div className="rounded-sm border border-border bg-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                {customer.photo_url ? (
                  <img 
                    src={customer.photo_url} 
                    alt="Profile" 
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary/10 grid place-items-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 h-8 w-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4 text-white" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">{customer.full_name || "Customer"}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{customer.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Loyalty Points */}
          <div className="rounded-sm border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-6 w-6 text-primary" />
              <h3 className="font-display text-xl font-bold">Loyalty Points</h3>
            </div>
            <p className="text-4xl font-bold text-primary mb-2">{customer.loyalty_points || 0}</p>
            <p className="text-sm text-muted-foreground">Points earned from bookings</p>
            <div className="mt-4 p-3 bg-secondary rounded-sm">
              <p className="text-xs text-muted-foreground">
                Earn 10 points per booking. 100 points = M10 discount!
              </p>
            </div>
          </div>

          {/* Referral Code */}
          <div className="rounded-sm border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="h-6 w-6 text-primary" />
              <h3 className="font-display text-xl font-bold">Referral Program</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Share your referral code and earn 50 points per friend!</p>
            <div className="p-3 bg-secondary rounded-sm">
              <code className="text-sm font-mono">{user?.uid?.slice(0, 8).toUpperCase() || 'REFERRAL'}</code>
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-sm border border-border bg-card p-6">
            <h3 className="font-display text-2xl font-bold mb-6">Booking History</h3>
            
            {bookings.length === 0 ? (
              <p className="text-muted-foreground">No bookings yet. Book your first appointment!</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <div key={booking.id} className="p-4 rounded-sm border border-border bg-secondary">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{booking.services?.name || "Service"}</h4>
                        <p className="text-sm text-muted-foreground">M{Number(booking.services?.price_maloti || 0).toFixed(0)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-sm text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                        booking.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                        'bg-muted'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {booking.booking_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {booking.booking_time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="rounded-sm border border-border bg-card p-6">
            <h3 className="font-display text-2xl font-bold mb-6">My Reviews</h3>
            
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet. Share your experience!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="p-4 rounded-sm border border-border bg-secondary">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
