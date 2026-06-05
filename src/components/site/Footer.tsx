import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import logo from "@/assets/Logo.jpeg";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card mt-32">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="Maphisa's Barber Shop Logo" className="h-8 w-8 object-contain" />
            <span className="font-display text-xl font-bold">Maphisa<span className="text-primary">'s</span> Barber Shop</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Where tradition meets precision. Master barbers serving Leribe, Maputsoe and Mohalalitoe with premium cuts, shaves and grooming since day one.
          </p>
          <div className="flex gap-3 mt-6">
            <a href="https://www.instagram.com/maphisa_barber?igsh=MW5hdjJtdWI5YnRyag==" target="_blank" rel="noopener noreferrer" className="h-10 w-10 grid place-items-center rounded-sm border border-border hover:border-primary hover:text-primary transition-colors" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
            <a href="https://www.facebook.com/vict.r.guy" target="_blank" rel="noopener noreferrer" className="h-10 w-10 grid place-items-center rounded-sm border border-border hover:border-primary hover:text-primary transition-colors" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
            <a href="https://wa.me/26656831486" className="h-10 w-10 grid place-items-center rounded-sm border border-border hover:border-primary hover:text-primary transition-colors" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
            <a href="https://www.tiktok.com/@maphisa.barber" target="_blank" rel="noopener noreferrer" className="h-10 w-10 grid place-items-center rounded-sm border border-border hover:border-primary hover:text-primary transition-colors" aria-label="TikTok"><MessageCircle className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <p className="font-mono-label text-primary mb-4">Visit</p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" /><span>Leribe / Maputsoe / Mohalalitoe</span></li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary" /><a href="tel:+26662895913" className="hover:text-primary">+266 62895913</a></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary" /><a href="mailto:Maphisankosi57@gmail.com" className="hover:text-primary">Maphisankosi57@gmail.com</a></li>
          </ul>
        </div>

        <div>
          <p className="font-mono-label text-primary mb-4">Hours</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex justify-between"><span>Summer (Mon–Sat)</span><span className="text-foreground">06:00 – 20:00</span></li>
            <li className="flex justify-between"><span>Summer (Sun)</span><span className="text-foreground">13:00 – 20:00</span></li>
            <li className="flex justify-between"><span>Winter (Mon–Sat)</span><span className="text-foreground">08:00 – 19:00</span></li>
            <li className="flex justify-between"><span>Winter (Sun)</span><span className="text-foreground">13:00 – 19:00</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Maphisa's Barber Shop. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/services" className="hover:text-foreground">Services</Link>
            <Link to="/seasonal-packages" className="hover:text-foreground">Packages</Link>
            <Link to="/bookings" className="hover:text-foreground">Bookings</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}