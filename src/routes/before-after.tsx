import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, ZoomIn, Download, User, X } from "lucide-react";
import { useState } from "react";
import baldHaircutBefore from "@/assets/Before and After/Bald haircut + Design Before.jpeg";
import baldHaircutAfter from "@/assets/Before and After/Bald haircut + Design After.jpeg";
import mohawkDesignBefore from "@/assets/Before and After/Mohawk  & design Before.jpeg";
import mohawkDesignAfter from "@/assets/Before and After/Mohawk  & design After.jpeg";
import taperFadeBefore from "@/assets/Before and After/Taper fade Before .jpeg";
import taperFadeAfter from "@/assets/Before and After/Taper fade After.jpeg";

export const Route = createFileRoute("/before-after")({
  head: () => ({
    meta: [
      { title: "Before & After — Maphisa's Barber Shop" },
      { name: "description", content: "See our transformations. Real results from real customers at Maphisa's Barber Shop." },
      { property: "og:title", content: "Before & After — Maphisa's" },
      { property: "og:description", content: "Real transformations. Real results." },
    ],
  }),
  component: BeforeAfter,
});

const transformations = [
  {
    id: 1,
    before: baldHaircutBefore,
    after: baldHaircutAfter,
    title: "Bald Haircut with Design",
    description: "Clean bald cut with artistic design work",
    customer: "Thabo M.",
    service: "Bald Haircut + Design",
    date: "2024-01-15",
  },
  {
    id: 2,
    before: mohawkDesignBefore,
    after: mohawkDesignAfter,
    title: "Mohawk with Design",
    description: "Bold mohawk style with intricate design",
    customer: "Sipho D.",
    service: "Mohawk & Design",
    date: "2024-01-10",
  },
  {
    id: 3,
    before: taperFadeBefore,
    after: taperFadeAfter,
    title: "Taper Fade",
    description: "Perfect taper fade with clean lines",
    customer: "Lebo K.",
    service: "Taper Fade",
    date: "2024-01-05",
  },
];

function BeforeAfter() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string } | null>(null);

  const current = transformations[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? transformations.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === transformations.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-16">
      <section className="mb-12">
        <p className="font-mono-label text-primary mb-4">— Transformations</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold max-w-4xl leading-[1]">Before & After Gallery</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Real results from real customers. See the difference a skilled barber can make.
        </p>
      </section>

      {/* Featured Transformation */}
      <section className="mb-16">
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Before */}
            <div className="relative aspect-square">
              <img
                src={current.before}
                alt="Before"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-sm text-sm font-medium">
                Before
              </div>
            </div>
            {/* After */}
            <div className="relative aspect-square">
              <img
                src={current.after}
                alt="After"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-sm text-sm font-medium">
                After
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">{current.title}</h2>
                <p className="text-muted-foreground">{current.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  className="h-10 w-10 rounded-sm border border-border flex items-center justify-center hover:border-primary transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="h-10 w-10 rounded-sm border border-border flex items-center justify-center hover:border-primary transition-colors"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {current.customer}
              </span>
              <span>{current.service}</span>
              <span>{new Date(current.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section>
        <h2 className="font-display text-3xl font-bold mb-8">More Transformations</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transformations.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`group cursor-pointer rounded-sm border overflow-hidden transition-all ${
                index === currentIndex ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary'
              }`}
            >
              <div className="grid grid-cols-2 aspect-square">
                <img src={item.before} alt="Before" className="w-full h-full object-cover" />
                <img src={item.after} alt="After" className="w-full h-full object-cover" />
              </div>
              <div className="p-4 bg-card">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.service}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="mt-16 rounded-sm border border-border bg-card p-8 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Want Your Own Transformation?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Book an appointment today and let our skilled barbers work their magic on your hair.
        </p>
        <a
          href="/bookings"
          className="inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-8 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all"
        >
          Book Your Transformation <ArrowRight className="h-4 w-4" />
        </a>
      </section>
    </div>
  );
}
