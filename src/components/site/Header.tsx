import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useCart } from "@/hooks/useCart";
import logo from "@/assets/Logo.jpeg";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/memberships", label: "Membership" },
  { to: "/seasonal-packages", label: "Packages" },
  { to: "/gallery", label: "Gallery" },
  { to: "/before-after", label: "Before & After" },
  { to: "/bookings", label: "Bookings" },
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useFirebaseAuth();
  const { count } = useCart();
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="Maphisa's Barber Shop Logo" className="h-10 w-10 object-contain transition-transform group-hover:scale-110" />
          <span className="font-display text-xl font-bold tracking-tight">
            Maphisa<span className="text-primary">'s</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/cart" className="relative text-muted-foreground hover:text-foreground p-2" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{count}</span>
            )}
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="text-xs font-medium text-primary hover:text-primary/80 px-2 py-1">Admin</Link>
              )}
              <Link to="/profile" className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1">
                Profile
              </Link>
              <Link to="/dashboard" className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1">
                Bookings
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1">
                Sign in
              </Link>
              <Link to="/register" className="text-xs font-medium text-primary hover:text-primary/80 px-2 py-1">
                Register
              </Link>
            </>
          )}
          <Link
            to={user ? "/book" : "/auth"}
            className="inline-flex h-9 items-center justify-center rounded-sm bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[var(--shadow-emerald)]"
          >
            Book
          </Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col p-6 gap-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="text-base font-medium text-primary">Admin</Link>
                )}
                <Link to="/profile" onClick={() => setOpen(false)} className="text-base font-medium text-muted-foreground">Profile</Link>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="text-base font-medium text-muted-foreground">My bookings</Link>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setOpen(false)} className="text-base font-medium text-muted-foreground">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-base font-medium text-primary">Register</Link>
              </>
            )}
            <Link
              to={user ? "/book" : "/auth"}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              Book a Chair
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}