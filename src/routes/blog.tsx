import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, ArrowRight, Scissors } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Hair Care Tips — Maphisa's Barber Shop" },
      { name: "description", content: "Expert hair care tips, grooming advice, and style inspiration." },
      { property: "og:title", content: "Hair Care Tips — Maphisa's" },
      { property: "og:description", content: "Expert grooming advice from our barbers." },
    ],
  }),
  component: Blog,
});

const blogPosts = [
  {
    id: 1,
    title: "5 Tips for Maintaining Your Fade Between Cuts",
    excerpt: "Learn how to keep your fade looking fresh between barber visits with these simple maintenance tips.",
    content: "Keeping your fade looking sharp between appointments doesn't have to be difficult. Here are five essential tips...",
    date: "2024-01-15",
    readTime: "5 min read",
    category: "Hair Care",
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=600&fit=crop",
    link: "https://culturedgrooming.com/how-to-maintain-a-fade/",
  },
  {
    id: 2,
    title: "The Ultimate Guide to Beard Care",
    excerpt: "From washing to trimming, discover the complete routine for a healthy, well-groomed beard.",
    content: "A well-maintained beard requires consistent care. This guide covers everything you need to know...",
    date: "2024-01-10",
    readTime: "7 min read",
    category: "Beard Care",
    image: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800&h=600&fit=crop",
    link: "https://livebearded.com/blogs/do-better/beard-care-guide/",
  },
  {
    id: 3,
    title: "Choosing the Right Hairstyle for Your Face Shape",
    excerpt: "Find out which hairstyles complement your face shape for the most flattering look.",
    content: "Your face shape plays a crucial role in determining which hairstyles will look best on you...",
    date: "2024-01-05",
    readTime: "6 min read",
    category: "Styling",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop",
    link: "https://therighthairstyles.com/ai-hairstyle-changer-male/",
  },
  {
    id: 4,
    title: "Summer vs Winter Hair Care: What Changes?",
    excerpt: "Adapt your hair care routine to the seasons for healthier, better-looking hair year-round.",
    content: "Your hair's needs change with the seasons. Here's how to adjust your routine...",
    date: "2024-01-01",
    readTime: "4 min read",
    category: "Seasonal Care",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop",
    link: "https://www.changeshairstudio.ca/post/protecting-your-hair-in-summer-vs-winter-seasonal-hair-care-guide",
  },
  {
    id: 5,
    title: "Understanding Hair Products: Gels, Pomades, and More",
    excerpt: "A comprehensive guide to hair styling products and when to use each one.",
    content: "With so many hair products available, it can be overwhelming to choose the right one...",
    date: "2023-12-28",
    readTime: "8 min read",
    category: "Products",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop",
    link: "https://theglossylocks.com/difference-between-hair-gel-and-pomade/",
  },
  {
    id: 6,
    title: "The Benefits of Regular Scalp Massages",
    excerpt: "Discover how scalp massages can improve hair health and reduce stress.",
    content: "Scalp massages offer numerous benefits beyond just relaxation. Here's why you should incorporate them...",
    date: "2023-12-20",
    readTime: "5 min read",
    category: "Hair Health",
    image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop",
    link: "https://www.verywellhealth.com/scalp-massage-8623993",
  },
];

function Blog() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-16">
      <section className="mb-12">
        <p className="font-mono-label text-primary mb-4">— Hair Care Tips</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold max-w-4xl leading-[1]">Expert Grooming Advice</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Tips, tricks, and advice from our experienced barbers to help you look your best every day.
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <a key={post.id} href={post.link} target="_blank" rel="noopener noreferrer" className="group rounded-sm border border-border bg-card overflow-hidden hover:border-primary transition-colors block">
            <div className="aspect-video overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="px-2 py-1 rounded-sm bg-secondary">{post.category}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              <span className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Read More <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </a>
        ))}
      </div>

      <section className="mt-16 rounded-sm border border-border bg-card p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Scissors className="h-12 w-12 text-primary mb-4" />
            <h2 className="font-display text-3xl font-bold mb-4">Want More Tips?</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for exclusive hair care tips, special offers, and grooming advice delivered to your inbox.
            </p>
            <form className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="h-11 rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
          <div className="text-center md:text-right">
            <p className="font-display text-4xl font-bold text-primary mb-2">500+</p>
            <p className="text-muted-foreground">Happy subscribers</p>
          </div>
        </div>
      </section>
    </div>
  );
}
