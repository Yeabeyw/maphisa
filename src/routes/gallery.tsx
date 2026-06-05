import { createFileRoute } from "@tanstack/react-router";
import { Download, ZoomIn } from "lucide-react";
import cutFade from "@/assets/cut-fade.jpg";
import cutShave from "@/assets/cut-shave.jpg";
import cutBeard from "@/assets/cut-beard.jpg";
import cutKids from "@/assets/cut-kids.jpg";
import interior from "@/assets/shop-interior.jpg";
import hero from "@/assets/hero-barber.jpg";
import barber1 from "@/assets/barber-1.jpg";
import barber2 from "@/assets/barber-2.jpg";
import barber3 from "@/assets/barber-3.jpg";
import taperFade from "@/assets/Taper fade.jpeg";
import baldHaircut from "@/assets/Bald haircut.jpeg";
import baldHaircutDesign from "@/assets/Bald haircut &design.jpeg";
import mohawkDesign from "@/assets/Mohawk & design.jpeg";
import shortHairBleach from "@/assets/Short hair & bleach+design.jpeg";
import childHaircut1 from "@/assets/Child Haircut1.jpeg";
import childHaircut2 from "@/assets/Child haircut 2.jpeg";
import ladiesHaircut from "@/assets/Ladies  haircut.jpeg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Maphisa's Barber Shop" },
      { name: "description", content: "Cuts, shaves, beard transformations and shop life. Browse our portfolio." },
      { property: "og:title", content: "Gallery — Maphisa's" },
      { property: "og:description", content: "The portfolio. Cuts, shaves, transformations." },
    ],
  }),
  component: Gallery,
});

const items = [
  { src: hero, title: "Hero Shot", desc: "Professional barber at work" },
  { src: cutFade, title: "Skin Fade", desc: "Precision fade cut" },
  { src: cutShave, title: "Hot Towel Shave", desc: "Traditional shaving experience" },
  { src: cutBeard, title: "Beard Trim", desc: "Expert beard grooming" },
  { src: barber1, title: "Barber at Work", desc: "Craft in action" },
  { src: cutKids, title: "Kids Cut", desc: "Patient cuts for children" },
  { src: interior, title: "Shop Interior", desc: "Our welcoming space" },
  { src: barber2, title: "Barber Station", desc: "Professional setup" },
  { src: barber3, title: "Team Work", desc: "Skilled barbers" },
  { src: taperFade, title: "Taper Fade", desc: "Clean taper fade style" },
  { src: baldHaircut, title: "Bald Haircut", desc: "Sleek bald cut" },
  { src: baldHaircutDesign, title: "Bald with Design", desc: "Creative bald cut with design" },
  { src: mohawkDesign, title: "Mohawk Design", desc: "Bold mohawk style" },
  { src: shortHairBleach, title: "Short Hair Bleach", desc: "Bleached short hair style" },
  { src: childHaircut1, title: "Child Cut 1", desc: "Stylish cut for kids" },
  { src: childHaircut2, title: "Child Cut 2", desc: "Fun kids hairstyle" },
  { src: ladiesHaircut, title: "Ladies Cut", desc: "Professional ladies styling" },
];

function Gallery() {
  const handleDownload = (src: string, title: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `${title}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        <p className="font-mono-label text-primary mb-4">— Portfolio</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold max-w-4xl leading-[1]">Recent work. Sharp angles. Real chairs.</h1>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <div key={i} className="group relative overflow-hidden rounded-sm border border-border bg-card">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  <h3 className="font-display text-lg font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-white/80">{item.desc}</p>
                </div>
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    onClick={() => handleDownload(item.src, item.title)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black backdrop-blur-sm transition-colors hover:bg-white"
                    title="Download image"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => window.open(item.src, '_blank')}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black backdrop-blur-sm transition-colors hover:bg-white"
                    title="View full size"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}