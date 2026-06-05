import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Snowflake, Sun, Calendar, Tag, ArrowRight, Clock } from "lucide-react";
import { getSeasonalPackages } from "@/lib/admin.functions";

export const Route = createFileRoute("/seasonal-packages")({
  head: () => ({
    meta: [
      { title: "Seasonal Packages — Maphisa's Barber Shop" },
      { name: "description", content: "Special seasonal packages and limited-time offers for premium grooming." },
      { property: "og:title", content: "Seasonal Packages — Maphisa's" },
      { property: "og:description", content: "Exclusive seasonal offers." },
    ],
  }),
  component: SeasonalPackages,
});

function SeasonalPackages() {
  const getPackages = useServerFn(getSeasonalPackages);
  const { data: packagesData } = useQuery({ queryKey: ["seasonalPackages"], queryFn: () => getPackages() });
  const packages = packagesData?.packages || [];

  // Mock data for display if no database data
  const mockPackages = [
    {
      id: 1,
      name: "Summer Fresh Package",
      description: "Complete summer grooming: haircut + beard trim + facial treatment",
      price: 250,
      original_price: 300,
      services: ["Haircut", "Beard Trim", "Facial Treatment"],
      duration: "90 min",
      season: "Summer",
      end_date: "2024-03-31",
      icon: Sun,
    },
    {
      id: 2,
      name: "Winter Warm-Up Package",
      description: "Stay sharp this winter: hot towel shave + hair treatment + scalp massage",
      price: 280,
      original_price: 350,
      services: ["Hot Towel Shave", "Hair Treatment", "Scalp Massage"],
      duration: "75 min",
      season: "Winter",
      end_date: "2024-09-30",
      icon: Snowflake,
    },
    {
      id: 3,
      name: "Complete Grooming Experience",
      description: "The full works: haircut + shave + facial + hair treatment",
      price: 400,
      original_price: 500,
      services: ["Haircut", "Hot Towel Shave", "Facial", "Hair Treatment"],
      duration: "120 min",
      season: "All Year",
      end_date: "2024-12-31",
      icon: Calendar,
    },
  ];

  const displayPackages = packages.length > 0 ? packages : mockPackages;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-16">
      <section className="mb-12">
        <p className="font-mono-label text-primary mb-4">— Special Offers</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold max-w-4xl leading-[1]">Seasonal Packages</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Exclusive limited-time packages curated for each season. Get more value with our bundled services.
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPackages.map((pkg: any) => {
          const Icon = pkg.icon || Tag;
          return (
            <div key={pkg.id} className="rounded-sm border border-border bg-card overflow-hidden hover:border-primary transition-colors">
              <div className="bg-primary/10 p-6">
                <Icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-primary">M{pkg.price}</span>
                  {pkg.original_price && (
                    <span className="text-sm text-muted-foreground line-through">M{pkg.original_price}</span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Valid until {new Date(pkg.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Includes:</p>
                  <div className="flex flex-wrap gap-2">
                    {pkg.services?.map((service: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-secondary text-xs rounded-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to="/bookings"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all"
                >
                  Book Package <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-16 rounded-sm border border-border bg-card p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Tag className="h-12 w-12 text-primary mb-4" />
            <h2 className="font-display text-3xl font-bold mb-4">Custom Package?</h2>
            <p className="text-muted-foreground mb-6">
              Want to create your own package? Contact us and we'll create a custom bundle tailored to your needs.
            </p>
            <a
              href="https://wa.me/26656831486"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all"
            >
              Contact Us <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="text-center md:text-right">
            <p className="font-display text-4xl font-bold text-primary mb-2">Save up to 30%</p>
            <p className="text-muted-foreground">With our seasonal packages</p>
          </div>
        </div>
      </section>
    </div>
  );
}
