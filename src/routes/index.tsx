import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Scissors, Star, Clock, MapPin, ArrowRight, Award, Sparkles, Mail, Instagram, Facebook, X } from "lucide-react";
import { useState } from "react";
import heroImg from "@/assets/hero-barber.jpg";
import interior from "@/assets/shop-interior.jpg";
import cutFade from "@/assets/cut-fade.jpg";
import cutShave from "@/assets/cut-shave.jpg";
import cutBeard from "@/assets/cut-beard.jpg";
import cutKids from "@/assets/cut-kids.jpg";
import barber1 from "@/assets/Maphisa2.jpeg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maphisa's Barber Shop — Premium Cuts in Leribe" },
      { name: "description", content: "Master barbers, precision fades, hot-towel shaves and premium grooming in Leribe, Maputsoe & Mohalalitoe. Book your chair today." },
      { property: "og:title", content: "Maphisa's Barber Shop" },
      { property: "og:description", content: "Master barbers. Precision cuts. Built on craft." },
    ],
  }),
  component: Index,
});

const services = [
  { name: "Skin Fade", price: "M150", img: cutFade, time: "45 min" },
  { name: "Hot Towel Shave", price: "M180", img: cutShave, time: "40 min" },
  { name: "Beard Sculpt", price: "M120", img: cutBeard, time: "30 min" },
  { name: "Kids Cut", price: "M90", img: cutKids, time: "30 min" },
];

const testimonials = [
  { name: "Thabo M.", text: "Sharpest lineup in Leribe. I drive 40 minutes for this chair.", role: "Regular since 2022" },
  { name: "Lebo K.", text: "Maphisa treats every cut like art. Never disappointed.", role: "Wedding party of 6" },
  { name: "Sipho D.", text: "Hot towel shave is unmatched. Worth every loti.", role: "Maputsoe" },
];

function Index() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription in Firebase
    setNewsletterStatus({ type: 'success', message: 'Thank you for subscribing!' });
    setNewsletterEmail("");
    setTimeout(() => setNewsletterStatus(null), 5000);
  };

  return (
    <>
      {/* HERO */}
      <section className="relative h-[calc(100vh-5rem)] min-h-[640px] overflow-hidden">
        <img
          src={heroImg}
          alt="Precision skin fade at Maphisa's Barber Shop"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl h-full px-6 flex flex-col justify-end pb-24">
          <p className="font-mono-label text-primary mb-6 animate-fade-up">— Leribe · Maputsoe · Mohalalitoe</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] max-w-4xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
            The chair where <span className="text-primary italic">craft</span> meets the cut.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Master barbers. Precision fades. Traditional shaves. Built on three generations of obsession with the perfect line.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/contact" className="inline-flex h-14 items-center gap-2 rounded-sm bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[var(--shadow-emerald)]">
              Book Your Chair <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/services" className="inline-flex h-14 items-center gap-2 rounded-sm border border-border bg-background/40 backdrop-blur px-8 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary">
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-border/40 bg-card">
        <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { v: "12+", l: "Years of craft" },
            { v: "8,400", l: "Cuts delivered" },
            { v: "4.9★", l: "Avg. rating" },
            { v: "3", l: "Locations" },
          ].map((s) => (
            <div key={s.l} className="text-center md:text-left">
              <p className="font-display text-4xl font-bold text-primary">{s.v}</p>
              <p className="font-mono-label text-muted-foreground mt-2">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="font-mono-label text-primary mb-3">— Popular services</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold max-w-xl">Walk in plain. Walk out sharp.</h2>
          </div>
          <Link to="/services" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-2">
            See full menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div key={s.name} className="group relative overflow-hidden rounded-sm border border-border bg-card animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="aspect-[4/5] overflow-hidden">
                <img src={s.img} alt={s.name} loading="lazy" width={800} height={1000} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><Clock className="h-3 w-3" />{s.time}</div>
                <h3 className="font-display text-2xl font-semibold">{s.name}</h3>
                <p className="text-primary font-mono-label mt-2">{s.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED BARBER */}
      <section className="bg-card border-y border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img src={barber1} alt="Master barber Maphisa" loading="lazy" width={800} height={1000} className="rounded-sm object-cover w-full max-w-md" />
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-6 rounded-sm hidden md:block">
              <Award className="h-6 w-6 mb-2" />
              <p className="font-mono-label">Master Barber</p>
              <p className="font-display text-xl font-bold">Est. 2012</p>
            </div>
          </div>
          <div>
            <p className="font-mono-label text-primary mb-4">— Featured barber</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Meet Maphisa.</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Qualified in Cosmetology and Beauty. Built through hard work, quality service, and client trust. Every cut is delivered with skill, professionalism, and attention to detail.
            </p>
            <div className="flex gap-6 mb-8 text-sm">
              <div><p className="text-primary font-display text-2xl font-bold">12+</p><p className="text-muted-foreground">Years</p></div>
              <div><p className="text-primary font-display text-2xl font-bold">8k+</p><p className="text-muted-foreground">Clients</p></div>
              <div><p className="text-primary font-display text-2xl font-bold">4.9</p><p className="text-muted-foreground">Rating</p></div>
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
              Meet the whole team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <p className="font-mono-label text-primary mb-3">— What our chairs say</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Loyalty earned, one cut at a time.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <blockquote key={t.name} className="rounded-sm border border-border bg-card p-8 flex flex-col">
              <div className="flex gap-1 mb-4 text-primary">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-foreground/90 leading-relaxed flex-1">"{t.text}"</p>
              <footer className="mt-6 pt-6 border-t border-border">
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground font-mono-label mt-1">{t.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* NEWSLETTER SIGNUP */}
      <section className="bg-card border-y border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Mail className="h-12 w-12 text-primary mb-4" />
              <h2 className="font-display text-4xl font-bold mb-4">Stay in the loop</h2>
              <p className="text-muted-foreground text-lg">
                Get exclusive offers, grooming tips, and early access to promotions delivered to your inbox.
              </p>
            </div>
            <div>
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="flex-1 h-12 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="h-12 rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all"
                  >
                    Subscribe
                  </button>
                </div>
                {newsletterStatus && (
                  <p className={`text-sm ${newsletterStatus.type === 'success' ? 'text-primary' : 'text-red-500'}`}>
                    {newsletterStatus.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  No spam, ever. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL MEDIA FEED */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-12">
          <p className="font-mono-label text-primary mb-3">— Follow us</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">See our latest work</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <a
            href="https://www.instagram.com/maphisa_barber?igsh=MW5hdjJtdWI5YnRyag=="
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-sm border border-border bg-card p-6 hover:border-primary transition-colors"
          >
            <Instagram className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">Instagram</h3>
            <p className="text-sm text-muted-foreground mb-4">Daily cuts, fades, and behind-the-scenes content</p>
            <span className="text-sm font-semibold text-primary group-hover:underline">@maphisa_barber</span>
          </a>
          <a
            href="https://www.facebook.com/vict.r.guy"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-sm border border-border bg-card p-6 hover:border-primary transition-colors"
          >
            <Facebook className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">Facebook</h3>
            <p className="text-sm text-muted-foreground mb-4">Updates, events, and community engagement</p>
            <span className="text-sm font-semibold text-primary group-hover:underline">Vict R. Guy</span>
          </a>
          <a
            href="https://www.tiktok.com/@maphisa.barber"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-sm border border-border bg-card p-6 hover:border-primary transition-colors"
          >
            <X className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">TikTok</h3>
            <p className="text-sm text-muted-foreground mb-4">Quick tutorials, trends, and transformation videos</p>
            <span className="text-sm font-semibold text-primary group-hover:underline">@maphisa.barber</span>
          </a>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Follow us for daily inspiration, grooming tips, and exclusive offers
          </p>
        </div>
      </section>

      {/* FIND US */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-0 rounded-sm overflow-hidden border border-border">
          <div className="bg-card p-12 flex flex-col justify-center">
            <Sparkles className="h-8 w-8 text-primary mb-4" />
            <h2 className="font-display text-4xl font-bold mb-4">Pull up the chair.</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Three locations across the Leribe district. Walk-ins welcome — bookings get priority.
            </p>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3"><MapPin className="h-5 w-5 text-primary shrink-0" /><span>Leribe · Maputsoe · Mohalalitoe</span></div>
              <div className="flex gap-3"><Clock className="h-5 w-5 text-primary shrink-0" /><span>Mon–Sat 08:00 – 19:00 · Sun 09:00 – 14:00</span></div>
            </div>
            <Link to="/contact" className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all">
              Get directions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="aspect-video md:aspect-auto">
            <iframe
              title="Maphisa's Barber Shop location"
              src="https://maps.google.com/maps?q=-28.9125333,27.9172083&z=15&output=embed"
              className="w-full h-full border-0 grayscale contrast-125"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
