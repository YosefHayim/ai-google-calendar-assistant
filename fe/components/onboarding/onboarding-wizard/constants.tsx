import React from 'react'
import { MessageSquare, BarChart3, Clock, Sparkles, CheckCircle } from 'lucide-react'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  content: string
  icon: React.ReactNode
  targetSelector?: string
  audioText: string
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Ally',
    description: 'Your AI-powered calendar assistant',
    content:
      'Ally helps you manage your calendar effortlessly using natural language. Just tell Ally what you need, and it handles the rest.',
    icon: <Sparkles className="w-8 h-8" />,
    audioText:
      "Welcome to Ally, your AI-powered calendar assistant! I'm here to help you manage your schedule effortlessly. Let me show you around.",
  },
  {
    id: 'chat',
    title: 'Chat with Ally',
    description: 'Natural language scheduling',
    content:
      'Simply type or speak naturally. Say things like "Schedule a meeting with John tomorrow at 2pm" or "What do I have next week?" Ally understands context and handles complex requests.',
    icon: <MessageSquare className="w-8 h-8" />,
    targetSelector: '[data-onboarding="chat-input"]',
    audioText:
      'The chat interface is your main way to interact with me. Just type naturally, like you would text a friend. Say things like "Schedule lunch with Sarah tomorrow" or "What meetings do I have this week?"',
  },
  {
    id: 'analytics',
    title: 'Track Your Time',
    description: 'Insights into your schedule',
    content:
      'View detailed analytics about how you spend your time. Understand your meeting patterns, find opportunities to optimize, and maintain a healthy work-life balance.',
    icon: <BarChart3 className="w-8 h-8" />,
    targetSelector: '[data-onboarding="analytics"]',
    audioText:
      'The analytics dashboard gives you powerful insights into how you spend your time. Track meeting patterns, identify busy periods, and optimize your schedule for better productivity.',
  },
  {
    id: 'gaps',
    title: 'Recover Lost Time',
    description: 'Find and fill schedule gaps',
    content:
      'Ally automatically identifies untracked time in your calendar. Review these gaps and quickly add events to keep an accurate record of your activities.',
    icon: <Clock className="w-8 h-8" />,
    targetSelector: '[data-onboarding="gaps"]',
    audioText:
      "Gap recovery is a unique feature that helps you track where your time goes. I'll identify periods that aren't accounted for in your calendar, so you can fill them in and maintain an accurate schedule.",
  },
  {
    id: 'complete',
    title: "You're All Set!",
    description: 'Start managing your calendar',
    content:
      "You're ready to use Ally! Remember, you can always access settings to customize your experience, connect additional calendars, or adjust notification preferences.",
    icon: <CheckCircle className="w-8 h-8" />,
    audioText:
      "Congratulations! You're all set to start using Ally. If you ever need help, just ask me. I'm here to make your calendar management effortless. Let's get started!",
  },
]
