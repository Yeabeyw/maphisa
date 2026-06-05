import { createFileRoute } from "@tanstack/react-router";
import { Award, Target, Heart, Sparkles } from "lucide-react";
import interior from "@/assets/shop-interior.jpg";
import maphisa from "@/assets/Maphisa.jpeg";
import taperFade from "@/assets/Taper fade.jpeg";
import baldHaircut from "@/assets/Bald haircut.jpeg";
import baldHaircutDesign from "@/assets/Bald haircut &design.jpeg";
import mohawkDesign from "@/assets/Mohawk & design.jpeg";
import shortHairBleach from "@/assets/Short hair & bleach+design.jpeg";
import childHaircut1 from "@/assets/Child Haircut1.jpeg";
import childHaircut2 from "@/assets/Child haircut 2.jpeg";
import ladiesHaircut from "@/assets/Ladies  haircut.jpeg";
import barber1 from "@/assets/barber-1.jpg";
import barber2 from "@/assets/barber-2.jpg";
import barber3 from "@/assets/barber-3.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Maphisa's Barber Shop" },
      { name: "description", content: "Three generations of craft. Discover the story, mission and certifications behind Maphisa's Barber Shop in Leribe." },
      { property: "og:title", content: "About — Maphisa's Barber Shop" },
      { property: "og:description", content: "The story behind the chair. Craft, community, and the perfect line." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-20 pb-16">
      <section className="mb-10">
        <p className="font-mono-label text-primary mb-2">— Our story</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold max-w-4xl leading-[1.1]">Built on craft. Sharpened by community.</h1>
      </section>

      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <img src={interior} alt="Interior of Maphisa's Barber Shop" loading="lazy" width={1600} height={1000} className="rounded-sm w-full object-cover h-80 object-cover" />
        <div className="flex flex-col justify-center space-y-4">
          <p className="text-base leading-relaxed text-muted-foreground">
            Maphisa's Barber Shop began with just two haircut machines while I was still in school in December 2022. With a passion for barbering and a determination to succeed, I started offering services wherever I could, working outside formal business premises and building my skills one client at a time.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            By the end of 2023, I had saved enough to purchase my own barbering equipment and establish a small shack-based barbershop. Throughout 2024, I continued growing the business, serving more clients and improving the quality of my services.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            Social media played a major role in the journey. Through platforms such as Facebook and TikTok, I was able to showcase my work, connect with new clients, and build a reputation within the community. As more people shared their positive experiences, the business continued to grow and gain recognition.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            Today, Maphisa's Barber Shop stands as a testament to hard work, consistency, and a passion for helping people look and feel their best. What started with two machines and a dream has grown into a trusted grooming destination, and the journey is still continuing.
          </p>
          <div className="pt-2">
            <p className="text-base leading-relaxed text-muted-foreground font-semibold mb-1">Professional Qualifications</p>
            <p className="text-base leading-relaxed text-muted-foreground">
              I hold qualifications in Cosmetology and Beauty, providing a strong foundation in grooming, personal care, and professional client service. This training, combined with hands-on experience, enables me to deliver quality barbering services with confidence and professionalism.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <p className="font-mono-label text-primary mb-3">— Our work</p>
        <h2 className="font-display text-3xl font-bold mb-6">Recent cuts & styles</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <img src={taperFade} alt="Taper Fade" loading="lazy" className="rounded-sm w-full h-48 object-cover" />
          <img src={baldHaircut} alt="Bald Haircut" loading="lazy" className="rounded-sm w-full h-48 object-cover" />
          <img src={baldHaircutDesign} alt="Bald Haircut with Design" loading="lazy" className="rounded-sm w-full h-48 object-cover" />
          <img src={mohawkDesign} alt="Mohawk with Design" loading="lazy" className="rounded-sm w-full h-48 object-cover" />
          <img src={shortHairBleach} alt="Short Hair with Bleach" loading="lazy" className="rounded-sm w-full h-48 object-cover" />
          <img src={childHaircut1} alt="Child Haircut 1" loading="lazy" className="rounded-sm w-full h-48 object-cover" />
          <img src={childHaircut2} alt="Child Haircut 2" loading="lazy" className="rounded-sm w-full h-48 object-cover" />
          <img src={ladiesHaircut} alt="Ladies Haircut" loading="lazy" className="rounded-sm w-full h-48 object-cover" />
          <img src={barber1} alt="Barber at work 1" loading="lazy" className="rounded-sm w-full h-48 object-cover" />
          <img src={barber2} alt="Barber at work 2" loading="lazy" className="rounded-sm w-full h-48 object-cover" />
          <img src={barber3} alt="Barber at work 3" loading="lazy" className="rounded-sm w-full h-48 object-cover" />
          <img src={interior} alt="Shop Interior" loading="lazy" className="rounded-sm w-full h-48 object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 mb-12">
        <div className="rounded-sm border border-border bg-card p-8 md:p-10">
          <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-center">
            <img src={maphisa} alt="Maphisa - Founder" loading="lazy" className="rounded-sm w-full h-80 object-cover" />
            <div>
              <p className="font-mono-label text-primary mb-2">— Founder</p>
              <h2 className="font-display text-3xl font-bold mb-4">Maphisa</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                The founder and master barber behind Maphisa's Barber Shop. With qualifications in Cosmetology and Beauty, combined with years of hands-on experience, Maphisa brings precision, creativity, and passion to every cut.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                From starting with two machines in school to building a trusted grooming destination, Maphisa's dedication to craft and community continues to drive the business forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4 mb-12">
        {[
          { icon: Target, t: "Our Mission", d: "Deliver the sharpest cut in the district — every chair, every time, without compromise." },
          { icon: Heart, t: "Our Vision", d: "A barber shop that doubles as a sanctuary. Where men slow down, take care, and feel seen." },
          { icon: Sparkles, t: "Why Us", d: "Passion-driven service. Qualified in Cosmetology and Beauty. Built from the ground up through dedication, skill, and consistency. Trusted by a growing community and committed to helping every client leave looking their best." },
        ].map((c) => (
          <div key={c.t} className="rounded-sm border border-border bg-card p-6">
            <c.icon className="h-7 w-7 text-primary mb-3" />
            <h3 className="font-display text-xl font-bold mb-2">{c.t}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.d}</p>
          </div>
        ))}
      </section>

      <section className="bg-card border-y border-border/40 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-mono-label text-primary mb-2 text-center">— Awards & certifications</p>
          <h2 className="font-display text-3xl font-bold text-center mb-8">Recognised craft.</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Best Barber Shop · Leribe 2024",
              "Master Barber Certified · SA Academy",
              "Top 10 African Grooming '23",
              "Featured · GQ South Africa",
            ].map((a) => (
              <div key={a} className="rounded-sm border border-border p-4 text-center">
                <Award className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}