'use client';

import MarketingLayout from '../components/MarketingLayout';
import BentoGridSection from '../components/BentoGridSection';
import Testimonials from '../components/Testimonials';
import FAQs from '../components/FAQs';
import UseCaseGrid from '../components/UseCaseGrid';
import { InteractiveHoverButton } from '../components/ui/interactive-hover-button';
import Link from 'next/link';
import { ArrowRight, Calendar, Mic, Sparkles, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-50" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Calendar Management
          </div>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
            Your Private
            <br />
            <span className="text-primary">AI Secretary</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 mb-12 max-w-2xl mx-auto font-medium">
            Manage your Google Calendar with natural voice commands.
            Schedule, reschedule, and optimize your time effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <InteractiveHoverButton
                text="Get Started Free"
                className="h-14 px-8 text-lg"
              />
            </Link>
            <Link href="/pricing">
              <button className="h-14 px-8 text-lg font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-2">
                View Pricing <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
              Everything you need to manage your time
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Ally combines AI intelligence with seamless calendar integration
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">Voice Commands</h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                Schedule meetings, set reminders, and manage your calendar using natural voice commands.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">Smart Scheduling</h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                AI-powered scheduling that finds the best times for your meetings and appointments.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">Time Optimization</h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                Analyze your schedule patterns and get insights to maximize productivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <BentoGridSection />

      {/* Use Cases */}
      <UseCaseGrid />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQs */}
      <FAQs />

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-6">
            Ready to transform your calendar experience?
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8">
            Join thousands of professionals who have simplified their scheduling with Ally.
          </p>
          <Link href="/register">
            <InteractiveHoverButton
              text="Start for Free"
              className="h-14 px-8 text-lg"
            />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
