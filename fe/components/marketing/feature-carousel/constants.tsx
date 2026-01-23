import { AlertCircle, BarChart3, Calendar, Mic, NotebookTabs, Plane, ShieldCheck } from 'lucide-react'
import { WhatsAppIcon } from '@/components/shared/Icons'
import {
  SchedulingContent,
  WhatsAppContent,
  SummariesContent,
  LogisticsContent,
  FocusContent,
  ConflictContent,
  VoiceContent,
  IntelligenceContent,
} from './components/FeatureContents'

export interface FeatureItem {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  content: React.ReactNode
}

export const FEATURES: FeatureItem[] = [
  {
    id: 'scheduling',
    title: 'Intelligent Scheduling',
    description: 'Ally orchestrates complex meetings across teams and timezones with zero friction.',
    icon: Calendar,
    color: 'text-primary',
    content: <SchedulingContent />,
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Relay',
    description:
      "The world's most popular messenger, now your executive command line. Private, fast, and always accessible.",
    icon: WhatsAppIcon,
    color: 'text-primary',
    content: <WhatsAppContent />,
  },
  {
    id: 'summaries',
    title: 'Executive Digests',
    description: 'Turns hour-long transcripts into 5-minute actionable summaries and next steps.',
    icon: NotebookTabs,
    color: 'text-secondary',
    content: <SummariesContent />,
  },
  {
    id: 'logistics',
    title: 'Proactive Logistics',
    description: 'Monitors flights and car services, adjusting your schedule in real-time for delays.',
    icon: Plane,
    color: 'text-accent',
    content: <LogisticsContent />,
  },
  {
    id: 'focus',
    title: 'Focus Protection',
    description: 'Automatically shields your deep work sessions and blocks interruptions.',
    icon: ShieldCheck,
    color: 'text-primary',
    content: <FocusContent />,
  },
  {
    id: 'conflict',
    title: 'Conflict Arbitrator',
    description: 'Ally identifies calendar overlaps and proactively suggests logical resolutions.',
    icon: AlertCircle,
    color: 'text-destructive',
    content: <ConflictContent />,
  },
  {
    id: 'voice',
    title: 'Voice-to-Action',
    description: 'Record commands on the go. Ally executes complex tasks from simple audio.',
    icon: Mic,
    color: 'text-primary',
    content: <VoiceContent />,
  },
  {
    id: 'intelligence',
    title: 'Leverage Analytics',
    description: 'Quantify your impact with deep insights into your productivity patterns.',
    icon: BarChart3,
    color: 'text-foreground',
    content: <IntelligenceContent />,
  },
]
