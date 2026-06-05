import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle, Clock, Phone, Calendar, CreditCard, Scissors } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Maphisa's Barber Shop" },
      { name: "description", content: "Frequently asked questions about bookings, services, and policies." },
      { property: "og:title", content: "FAQ — Maphisa's" },
      { property: "og:description", content: "Find answers to common questions." },
    ],
  }),
  component: FAQ,
});

const faqCategories = [
  {
    icon: Calendar,
    title: "Bookings",
    questions: [
      {
        q: "How do I book an appointment?",
        a: "You can book an appointment through our website by visiting the Bookings page, selecting your preferred service, date, and time slot. You can also call us at +266 62895913 or WhatsApp us at +266 56831486."
      },
      {
        q: "How far in advance should I book?",
        a: "We recommend booking at least 2-3 days in advance, especially for weekend appointments. However, you can book up to 30 days in advance."
      },
      {
        q: "What if I'm late for my appointment?",
        a: "We have a 15-minute grace period. If you arrive more than 15 minutes late, we may need to reschedule your appointment to accommodate other customers."
      },
      {
        q: "Can I cancel or reschedule my booking?",
        a: "Yes, you can cancel or reschedule your booking through the Bookings page by entering your phone number. We recommend giving at least 24 hours notice for cancellations."
      },
      {
        q: "What happens if I miss my appointment?",
        a: "If you miss your appointment without notice, you may still be charged. Please contact us as soon as possible if you need to cancel."
      },
    ],
  },
  {
    icon: Scissors,
    title: "Services",
    questions: [
      {
        q: "What services do you offer?",
        a: "We offer a full range of services including haircuts, beard trims, hot towel shaves, hair coloring, kids' haircuts, ladies' haircuts, and premium grooming treatments. See our Services page for the full menu and prices."
      },
      {
        q: "How long does a typical haircut take?",
        a: "Most haircuts take between 30-45 minutes. More complex styles or services like hair coloring may take longer."
      },
      {
        q: "Do you offer hair coloring services?",
        a: "Yes, we offer hair coloring, including black dye, colorful dyes, and grey blending. Prices vary depending on the service."
      },
      {
        q: "Do you cut children's hair?",
        a: "Yes, we offer kids' haircuts for children under 12. Our barbers are patient and experienced with children."
      },
      {
        q: "Do you offer ladies' haircuts?",
        a: "Yes, we offer professional haircuts and styling for ladies."
      },
    ],
  },
  {
    icon: Clock,
    title: "Hours & Locations",
    questions: [
      {
        q: "What are your working hours?",
        a: "Summer hours (October-March): Monday-Saturday 6am-8pm, Sunday 1pm-8pm. Winter hours (April-September): Monday-Saturday 8am-7pm, Sunday 1pm-7pm."
      },
      {
        q: "Where are you located?",
        a: "We have three locations across Leribe district: Leribe, Maputsoe, and Mohalalitoe."
      },
      {
        q: "Are you open on public holidays?",
        a: "We may have special hours on public holidays. Please contact us to confirm our schedule."
      },
    ],
  },
  {
    icon: CreditCard,
    title: "Payments & Pricing",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept cash, Ecocash, and M-Pesa. Online payments are coming soon."
      },
      {
        q: "How much does a haircut cost?",
        a: "Prices vary by service. Basic haircuts start from M20, while more complex services like hair coloring start from M170. See our Services page for detailed pricing."
      },
      {
        q: "Do you offer discounts?",
        a: "Yes, we offer loyalty points for repeat customers. Earn 10 points per booking, and 100 points = M10 discount. We also have special promotions from time to time."
      },
      {
        q: "Do you have a membership program?",
        a: "Yes, we offer membership plans with exclusive benefits. Visit our Membership page for more details."
      },
    ],
  },
  {
    icon: Phone,
    title: "Contact & Support",
    questions: [
      {
        q: "How can I contact you?",
        a: "You can reach us by phone at +266 62895913, WhatsApp at +266 56831486, or email at Maphisankosi57@gmail.com. You can also message us on social media."
      },
      {
        q: "Do you respond to WhatsApp messages?",
        a: "Yes, we actively monitor our WhatsApp and typically respond within a few hours during business hours."
      },
      {
        q: "Can I request a specific barber?",
        a: "Yes, you can request a specific barber when booking. We'll do our best to accommodate your preference based on availability."
      },
    ],
  },
];

function FAQ() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-16">
      <section className="mb-12">
        <p className="font-mono-label text-primary mb-4">— Help Center</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold max-w-4xl leading-[1]">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Find answers to common questions about bookings, services, payments, and more.
        </p>
      </section>

      <div className="space-y-12">
        {faqCategories.map((category, categoryIndex) => (
          <section key={categoryIndex} className="border-t border-border/40 pt-12">
            <div className="flex items-center gap-3 mb-8">
              <category.icon className="h-8 w-8 text-primary" />
              <h2 className="font-display text-3xl font-bold">{category.title}</h2>
            </div>

            <div className="space-y-6">
              {category.questions.map((item, questionIndex) => (
                <div key={questionIndex} className="rounded-sm border border-border bg-card p-6">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{item.q}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-16 rounded-sm border border-border bg-card p-8 text-center">
        <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Still have questions?</h2>
        <p className="text-muted-foreground mb-6">
          Can't find the answer you're looking for? Please reach out to our team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:+26662895913"
            className="inline-flex h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all"
          >
            Call Us
          </a>
          <a
            href="https://wa.me/26656831486"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-sm border border-border px-6 text-sm font-semibold hover:border-primary transition-colors"
          >
            WhatsApp Us
          </a>
        </div>
      </section>
    </div>
  );
}
