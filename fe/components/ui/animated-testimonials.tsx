"use client";
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote, Star } from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Separator } from "@/components/ui/separator";

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface AnimatedTestimonialsProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  testimonials?: Testimonial[];
  autoRotateInterval?: number;
  className?: string;
}

export function AnimatedTestimonials({
  title = "Loved by the community",
  subtitle = "Don't just take our word for it. See what leaders and executives have to say about Ally.",
  badgeText = "Trusted by high-performers",
  testimonials = [],
  autoRotateInterval = 6000,
  className,
}: AnimatedTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  useEffect(() => {
    if (autoRotateInterval <= 0 || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [autoRotateInterval, testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} id="testimonials" className={`py-24 overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/10 ${className || ""}`}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div initial="hidden" animate={controls} variants={containerVariants} className="grid grid-cols-1 gap-16 w-full md:grid-cols-2 lg:gap-24">
          <motion.div variants={itemVariants} className="flex flex-col justify-center">
            <div className="space-y-2">
              {badgeText && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-primary/10 text-primary">
                  <Star className="mr-1 h-3.5 w-3.5 fill-primary" />
                  <span>{badgeText}</span>
                </div>
              )}

              <h2 className="text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl text-zinc-900 dark:text-zinc-100">{title}</h2>

              <p className="max-w-[600px] text-zinc-500 dark:text-zinc-400 md:text-xl/relaxed font-medium">{subtitle}</p>

              <div className="flex items-center gap-3 pt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      activeIndex === index ? "w-10 bg-primary" : "bg-zinc-300 dark:bg-zinc-700 w-2.5"
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative h-full min-h-[350px] md:min-h-[450px]">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 100 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  x: activeIndex === index ? 0 : 100,
                  scale: activeIndex === index ? 1 : 0.9,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ zIndex: activeIndex === index ? 10 : 0 }}
              >
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl p-8 md:p-10 h-full flex flex-col transition-all">
                  <div className="mb-6 flex gap-1">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                  </div>

                  <div className="relative mb-8 flex-1">
                    <Quote className="absolute -top-4 -left-4 h-12 w-12 text-primary/10 rotate-180" />
                    <p className="relative z-10 text-xl font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">"{testimonial.content}"</p>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-zinc-100 dark:border-zinc-800">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{testimonial.name}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-3xl bg-primary/5 -z-10 blur-2xl"></div>
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-3xl bg-primary/5 -z-10 blur-2xl"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
