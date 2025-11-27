"use client";

import { Brain, Calendar, Clock, Shield, Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AnimatedCircles } from "@/components/animated-circles";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Meteors } from "@/components/ui/meteors";
import { Navbar } from "@/components/navbar";
import { Particles } from "@/components/ui/particles";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { motion } from "framer-motion";

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      delay: 0.5 + i * 0.2,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  }),
};

const features = [
  {
    icon: Brain,
    title: "AI-Powered Scheduling",
    description: "Let AI understand your preferences and schedule meetings automatically",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get instant responses and smart suggestions for your calendar",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and protected with enterprise-grade security",
  },
  {
    icon: Clock,
    title: "Time Optimization",
    description: "AI analyzes your patterns to optimize your schedule for maximum productivity",
  },
  {
    icon: Sparkles,
    title: "Smart Reminders",
    description: "Never miss an important meeting with intelligent reminder system",
  },
  {
    icon: Calendar,
    title: "Multi-Calendar Sync",
    description: "Sync with Google Calendar, Outlook, and more seamlessly",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />

      {/* Hero Section with Aurora Background */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        <AuroraBackground className="min-h-[95vh]">
          <Particles className="absolute inset-0" quantity={150} color="#3b82f6" />
          <AnimatedCircles />
          <Meteors number={30} />
          
          <div className="relative z-10 container mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center">
              <motion.div
                custom={0}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 mb-8 shadow-lg"
              >
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Powered by Advanced AI</span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">Your AI Calendar</span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 animate-gradient">Assistant</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                Transform your calendar management with intelligent AI that understands your schedule, optimizes your time, and helps you stay organized
                effortlessly.
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link href="/register">
                  <RainbowButton size="lg" className="text-lg px-8 py-6 shadow-2xl">
                    Get Started Free
                  </RainbowButton>
                </Link>
                <Link href="/pricing">
                  <MagneticButton variant="outline" size="lg" className="text-lg px-8 py-6 bg-white/10 dark:bg-white/5 backdrop-blur-md border-white/20">
                    View Pricing
                  </MagneticButton>
                </Link>
              </motion.div>
            </div>
          </div>
        </AuroraBackground>
      </section>

      {/* Features Section with 3D Cards */}
      <section id="features" className="py-32 px-4 md:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you manage your calendar intelligently
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <CardContainer
                  key={index}
                  containerClassName="w-full"
                  className="w-full"
                >
                  <CardBody className="w-full">
                    <CardItem
                      translateZ="50"
                      className="w-full"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="w-full"
                      >
                        <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-700 bg-white/50 dark:bg-black/50 backdrop-blur-xl">
                          <CardHeader className="pb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/50">
                              <Icon className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-base leading-relaxed text-muted-foreground">
                              {feature.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section with Glassmorphism */}
      <section className="py-32 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-cyan-600/20 blur-3xl" />
        <Meteors number={15} />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }}
            className="bg-white/10 dark:bg-black/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 dark:border-white/10 shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
              Ready to Transform Your Calendar?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who are already using CAL AI to manage their schedules smarter.
            </p>
            <Link href="/register">
              <RainbowButton size="lg" className="text-lg px-10 py-7 shadow-2xl">
                Start Free Trial
              </RainbowButton>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
