import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Instagram, Facebook } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Book & Contact — Maphisa's Barber Shop" },
      { name: "description", content: "Book a chair, message us on WhatsApp, or find our three locations across Leribe district." },
      { property: "og:title", content: "Book & Contact — Maphisa's" },
      { property: "og:description", content: "Book a chair or find us in Leribe, Maputsoe or Mohalalitoe." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-12">
        <p className="font-mono-label text-primary mb-4">— Pull up the chair</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold max-w-4xl leading-[1]">Book your cut. We'll handle the rest.</h1>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 grid lg:grid-cols-[1fr_1.2fr] gap-12">
        <div className="space-y-8">
          <div className="space-y-5">
            {[
              { icon: MapPin, label: "Locations", value: "Leribe · Maputsoe · Mohalalitoe", href: "https://maps.google.com/maps?q=-28.9125333,27.9172083" },
              { icon: Phone, label: "Phone", value: "+266 62895913", href: "tel:+26662895913" },
              { icon: MessageCircle, label: "WhatsApp", value: "Tap to chat", href: "https://wa.me/26656831486" },
              { icon: Mail, label: "Email", value: "Maphisankosi57@gmail.com", href: "mailto:Maphisankosi57@gmail.com" },
              { icon: Instagram, label: "Instagram", value: "@maphisa_barber", href: "https://www.instagram.com/maphisa_barber?igsh=MW5hdjJtdWI5YnRyag==" },
              { icon: Facebook, label: "Facebook", value: "Vict R. Guy", href: "https://www.facebook.com/vict.r.guy" },
              { icon: MessageCircle, label: "TikTok", value: "@maphisa.barber", href: "https://www.tiktok.com/@maphisa.barber" },
              { icon: Clock, label: "Hours", value: "Summer: Mon–Sat 6am–8pm · Sun 1pm–8pm | Winter: Mon–Sat 8am–7pm · Sun 1pm–7pm" },
            ].map((c) => (
              <a key={c.label} href={c.href ?? "#"} target={c.href?.startsWith('http') ? "_blank" : undefined} rel={c.href?.startsWith('http') ? "noopener noreferrer" : undefined} className="flex gap-4 p-4 rounded-sm border border-border bg-card hover:border-primary transition-colors">
                <c.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-mono-label text-muted-foreground mb-1">{c.label}</p>
                  <p className="font-medium">{c.value}</p>
                </div>
              </a>
            ))}
          </div>
          <div className="rounded-sm overflow-hidden border border-border h-72">
            <iframe
              title="Map to Maphisa's"
              src="https://maps.google.com/maps?q=-28.9125333,27.9172083&z=15&output=embed"
              className="w-full h-full border-0 grayscale contrast-125"
              loading="lazy"
            />
          </div>
        </div>

        <div className="rounded-sm border border-border bg-card p-8 md:p-10">
          <h2 className="font-display text-3xl font-bold mb-2">Request a booking</h2>
          <p className="text-sm text-muted-foreground mb-8">We'll confirm by WhatsApp within the hour during shop hours.</p>

          {sent ? (
            <div className="rounded-sm border border-primary bg-primary/10 p-6 text-center">
              <p className="font-display text-2xl mb-2">Request received.</p>
              <p className="text-sm text-muted-foreground">We'll be in touch shortly to lock your chair.</p>
            </div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                // In a real implementation, this would send an email with BCC
                // to tsepangtsehla31@gmail.com
                console.log("Form submitted with BCC to: tsepangtsehla31@gmail.com");
                setSent(true);
              }}
            >
              <input type="hidden" name="bcc" value="tsepangtsehla31@gmail.com" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name" name="name" required />
                <Field label="Phone" name="phone" type="tel" required />
              </div>
              <Field label="Email" name="email" type="email" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Service" name="service" placeholder="e.g. Skin Fade" required />
                <Field label="Preferred date" name="date" type="date" required />
              </div>
              <div>
                <label className="font-mono-label text-muted-foreground block mb-2">Notes</label>
                <textarea
                  name="notes"
                  rows={4}
                  className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="Anything we should know"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all"
              >
                Send request <Send className="h-4 w-4" />
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Online payments (Ecocash, M-Pesa) coming in the next release.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={name} className="font-mono-label text-muted-foreground block mb-2">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}