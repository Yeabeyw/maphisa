import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import cutFade from "@/assets/cut-fade.jpg";
import cutShave from "@/assets/cut-shave.jpg";
import cutBeard from "@/assets/cut-beard.jpg";
import cutKids from "@/assets/cut-kids.jpg";
import taperFade from "@/assets/Taper fade.jpeg";
import baldHaircut from "@/assets/Bald haircut.jpeg";
import mohawkDesign from "@/assets/Mohawk & design.jpeg";
import shortHairBleach from "@/assets/Short hair & bleach+design.jpeg";
import childHaircut1 from "@/assets/Child Haircut1.jpeg";
import childHaircut2 from "@/assets/Child haircut 2.jpeg";
import ladiesHaircut from "@/assets/Ladies  haircut.jpeg";
import braidingChild from "@/assets/Braiding child.jpeg";
import midFade from "@/assets/Mid-fade.jpeg";
import nails from "@/assets/Nails.jpeg";

interface Service {
  id: string;
  name: string;
  category?: string;
  description?: string;
  price_maloti: number;
  duration_minutes: number;
  active: boolean;
}

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Prices — Maphisa's Barber Shop" },
      { name: "description", content: "Full menu of cuts, beards, shaves and premium grooming. Transparent pricing. Book online." },
      { property: "og:title", content: "Services & Prices — Maphisa's" },
      { property: "og:description", content: "Cuts, shaves, beards, grooming. The full menu." },
    ],
  }),
  component: Services,
});

type Svc = { name: string; desc: string; time: string; price: string; img?: string };

// Image mapping for services
const serviceImages: Record<string, string> = {
  "Taper Fade": taperFade,
  "Mid Fade": midFade,
  "Bald Haircut": baldHaircut,
  "Bald Haircut & Design": baldHaircut,
  "Mohawk Haircut": mohawkDesign,
  "Mohawk & Design": mohawkDesign,
  "Short Hair": shortHairBleach,
  "Short Hair & Bleach + Design": shortHairBleach,
  "Haircut & Hairwash": cutFade,
  "Haircut & Black Dye + Hairwash": cutFade,
  "Beard Trim": cutBeard,
  "Beard Styling": cutBeard,
  "Hot Towel Shave": cutShave,
  "Straight Razor Shave": cutShave,
  "Kids Haircut": childHaircut1,
  "Kids Style": childHaircut2,
  "Braiding Child": braidingChild,
  "Ladies Haircut": ladiesHaircut,
  "Nails": nails,
};

function Services() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const q = query(
        collection(db, 'services'),
        where('active', '==', true)
      );
      const snapshot = await getDocs(q);
      const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      // Sort by category in JavaScript
      services.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
      return { services };
    }
  });

  if (isLoading) return <p className="text-muted-foreground">Loading services…</p>;
  if (error) return <p className="text-red-500">Error loading services: {error.message}</p>;
  if (!data?.services || data.services.length === 0) return <p className="text-muted-foreground">No services available at the moment.</p>;

  // Group services by category
  const groupedServices = data?.services.reduce((acc: Record<string, Service[]>, service: Service) => {
    const category = service.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {}) || {};

  const categories = Object.entries(groupedServices).map(([category, services], index) => ({
    title: category,
    tag: `Category 0${index + 1}`,
    items: services.map((s: Service) => ({
      name: s.name,
      desc: s.description || "",
      time: `${s.duration_minutes} min`,
      price: `M${Number(s.price_maloti).toFixed(0)}`,
      img: serviceImages[s.name],
    })),
  }));

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        <p className="font-mono-label text-primary mb-4">— Full menu</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold max-w-4xl leading-[1]">Every line. Every price. No surprises.</h1>
      </section>

      {categories.map((cat) => (
        <section key={cat.title} className="mx-auto max-w-7xl px-6 py-16 border-t border-border/40">
          <div className="grid md:grid-cols-[1fr_2fr] gap-10 mb-12">
            <div>
              <p className="font-mono-label text-primary mb-3">— {cat.tag}</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold">{cat.title}</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {cat.items.map((s: Svc) => (
              <div key={s.name} className="group flex gap-5 p-5 rounded-sm border border-border bg-card hover:border-primary transition-colors">
                {s.img ? (
                  <img src={s.img} alt={s.name} loading="lazy" width={160} height={160} className="h-28 w-28 rounded-sm object-cover shrink-0" />
                ) : (
                  <div className="h-28 w-28 rounded-sm bg-secondary grid place-items-center shrink-0 text-primary font-display text-3xl">
                    {s.name[0]}
                  </div>
                )}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold">{s.name}</h3>
                    <p className="text-primary font-mono-label whitespace-nowrap">{s.price}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 flex-1">{s.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" />{s.time}</span>
                    <Link to="/contact" className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Book <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}