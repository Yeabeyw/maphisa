import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Scissors, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Maphisa's Barber Shop" },
      { name: "description", content: "Sign in or create an account to book your chair at Maphisa's." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    console.log('Auth page useEffect - user:', user ? 'signed in' : 'not signed in');
    if (user) {
      console.log('Navigating to dashboard...');
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    console.log('Attempting to sign in with email:', email);
    try {
      if (mode === "signup") {
        console.log('Creating new account...');
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Account created, UID:', newUser.uid);
        await updateProfile(newUser, { displayName: fullName });
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'profiles', newUser.uid), {
          id: newUser.uid,
          full_name: fullName,
          phone,
          email,
          role: 'customer',
          created_at: new Date().toISOString()
        });
        
        console.log('Profile created, navigating to dashboard');
        navigate({ to: "/dashboard", replace: true });
      } else {
        console.log('Signing in existing user...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Sign in successful, UID:', userCredential.user.uid);
        // Firebase auth state change will trigger navigation via useEffect
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-sm border border-border bg-card p-8 md:p-10">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <Scissors className="h-5 w-5 text-primary" />
          <span className="font-display text-xl font-bold">Maphisa<span className="text-primary">'s</span></span>
        </Link>
        <h1 className="font-display text-3xl font-bold mb-2">
          {mode === "signin" ? "Welcome back." : "Create an account."}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signin" ? "Sign in to manage your bookings." : "Save your details for one-tap booking."}
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <Field label="Full name" value={fullName} onChange={setFullName} required />
              <Field label="Phone" value={phone} onChange={setPhone} type="tel" required placeholder="+266..." />
            </>
          )}
          <Field label="Email" value={email} onChange={setEmail} type="email" required />
          <Field label="Password" value={password} onChange={setPassword} type="password" required minLength={8} placeholder="Min 8 characters" />
          <p className="text-xs text-muted-foreground">Password must be at least 8 characters</p>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-primary">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-sm bg-primary text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-muted-foreground">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
            className="text-primary font-medium hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder, minLength }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; minLength?: number }) {
  return (
    <div>
      <label className="font-mono-label text-muted-foreground block mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}