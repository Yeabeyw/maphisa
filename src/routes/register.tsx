import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { User, Mail, Phone, Lock, ArrowRight } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Maphisa's Barber Shop" },
      { name: "description", content: "Create your account to book appointments and manage your profile." },
      { property: "og:title", content: "Register — Maphisa's" },
      { property: "og:description", content: "Join Maphisa's Barber Shop today." },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      // Check if passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Sign up user with Firebase
      const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Update user profile
      await updateProfile(user, { displayName: data.name });

      // Create user profile in Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        id: user.uid,
        full_name: data.name,
        phone: data.phone,
        email: data.email,
        role: 'customer',
        created_at: new Date().toISOString()
      });

      return { user };
    },
    onSuccess: (data: any) => {
      console.log("Registration success:", data);
      setNotification({
        type: 'success',
        message: 'Registration successful! Please sign in with your credentials.',
      });
      setTimeout(() => {
        setNotification(null);
        navigate({ to: "/auth", replace: true });
      }, 2000);
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      setNotification({
        type: 'error',
        message: error.message || 'Registration failed. Please try again.',
      });
      setTimeout(() => setNotification(null), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ name, email, phone, password, confirmPassword });
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join Maphisa's Barber Shop today</p>
        </div>

        {notification && (
          <div className={`mb-6 p-4 rounded-sm border ${notification.type === 'success' ? 'border-primary bg-primary/10' : 'border-red-500 bg-red-500/10'}`}>
            <p className={notification.type === 'success' ? 'text-primary' : 'text-red-500'}>{notification.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono-label text-muted-foreground block mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-11 rounded-sm border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label className="font-mono-label text-muted-foreground block mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 rounded-sm border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="font-mono-label text-muted-foreground block mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full h-11 rounded-sm border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
                placeholder="+266 XXXX XXXX"
              />
            </div>
          </div>

          <div>
            <label className="font-mono-label text-muted-foreground block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full h-11 rounded-sm border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
                placeholder="Min 8 characters"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Password must be at least 8 characters</p>
          </div>

          <div>
            <label className="font-mono-label text-muted-foreground block mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full h-11 rounded-sm border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-11 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/auth" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
