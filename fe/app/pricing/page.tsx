import { PricingSectionDemo } from '@/components/ui/pricing-section-demo';
import FAQs from '@/components/FAQs';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';

const MOCK_TESTIMONIALS = [
  {
    id: 1,
    name: "Marcus Thorne",
    role: "Managing Director",
    company: "Capital Growth",
    content: "Ally has completely eliminated the 2-hour daily struggle of calendar management. By auditing my habits via WhatsApp, it's the best investment I've made in executive leverage this year.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Founder",
    company: "GreenScale",
    content: "The voice-to-action on Telegram is a game changer. I handle all my scheduling adjustments and focus-block audits while on the move. Simple, fast, and remarkably intuitive.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Alex Rivera",
    role: "CEO",
    company: "TechFlow",
    content: "We've integrated Ally across our entire leadership team. The coordination speed between our Google Calendars and the automated conflict resolution has been immediate and profound.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop",
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
        <PricingSectionDemo />
        
        <AnimatedTestimonials 
          title="The Standard for Strategic Execution"
          subtitle="Join thousands of leaders who have automated their scheduling to protect their most valuable work hours."
          badgeText="Verified Efficiency"
          testimonials={MOCK_TESTIMONIALS}
          autoRotateInterval={5000}
        />

        <FAQs />
    </div>
  );
}