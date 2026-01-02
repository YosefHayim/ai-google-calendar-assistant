'use client';

import MarketingLayout from '@/components/marketing/MarketingLayout';
import Link from 'next/link';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Users, Target, Heart, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
            About <span className="text-primary">Ally</span>
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            We're building the future of calendar management with AI-powered intelligence
            that understands how you work.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-medium text-zinc-900 dark:text-zinc-100 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-4">
                We believe everyone deserves a personal assistant that understands their schedule,
                respects their time, and helps them focus on what matters most.
              </p>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                Ally combines cutting-edge AI with intuitive design to create a calendar
                experience that feels like having a dedicated secretary at your fingertips.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <Users className="w-8 h-8 text-primary mb-4" />
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">10k+</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">Active Users</div>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <Target className="w-8 h-8 text-primary mb-4" />
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">99%</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">Accuracy Rate</div>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <Heart className="w-8 h-8 text-primary mb-4" />
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">4.9</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">User Rating</div>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <Zap className="w-8 h-8 text-primary mb-4" />
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">5hrs</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">Saved Weekly</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-medium text-zinc-900 dark:text-zinc-100 mb-12 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">Privacy First</h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                Your data belongs to you. We use industry-leading encryption and never sell your information.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">Speed Matters</h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                Every interaction is optimized for speed. Schedule in seconds, not minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">User Focused</h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                Every feature we build starts with understanding our users' real needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-medium text-zinc-900 dark:text-zinc-100 mb-6">
            Join us on our mission
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8">
            Experience the future of calendar management today.
          </p>
          <Link href="/register">
            <InteractiveHoverButton
              text="Get Started"
              className="h-14 px-8 text-lg"
            />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
