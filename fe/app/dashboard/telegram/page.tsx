'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowUpRight, CheckCircle2, Copy, ExternalLink, MessageCircle, Shield, Smartphone, Zap } from 'lucide-react'
import { TelegramIcon } from '@/components/shared/Icons'
import { toast } from 'sonner'

const TELEGRAM_BOT_USERNAME = '@AllySyncBot'
const TELEGRAM_BOT_LINK = 'https://t.me/AllySyncBot'

const TELEGRAM_COMMANDS = [
  { command: '/start', description: 'Start the bot and authenticate' },
  { command: '/help', description: 'Show all available commands' },
  { command: '/today', description: "View today's schedule" },
  { command: '/week', description: "View this week's events" },
  { command: '/new', description: 'Create a new event' },
  { command: '/profile', description: 'Switch AI agent profile' },
  { command: '/settings', description: 'Adjust bot settings' },
  { command: '/language', description: 'Change language (English/Hebrew)' },
]

const TELEGRAM_FEATURES = [
  {
    icon: Zap,
    title: 'Voice Messages',
    description: 'Send voice notes and Ally will transcribe and execute your commands',
    color: 'green',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First',
    description: "Manage your calendar from anywhere with Telegram's mobile app",
    color: 'purple',
  },
  {
    icon: MessageCircle,
    title: 'Natural Language',
    description: 'Just type naturally - "Schedule lunch with Sarah tomorrow at noon"',
    color: 'orange',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: "End-to-end encryption with Telegram's secure messaging",
    color: 'blue',
  },
]

const GETTING_STARTED_STEPS = [
  { step: 1, title: 'Open Telegram', description: `Search for ${TELEGRAM_BOT_USERNAME} or click the button above` },
  { step: 2, title: 'Start the Bot', description: 'Send /start to begin and authenticate your account' },
  { step: 3, title: 'Start Chatting', description: 'Ask Ally to schedule events, check your calendar, and more' },
]

function getFeatureColorClasses(color: string) {
  const colorMap: Record<string, { bg: string; icon: string }> = {
    green: { bg: 'bg-green-100 dark:bg-green-900/50', icon: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', icon: 'text-purple-600 dark:text-purple-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/50', icon: 'text-orange-600 dark:text-orange-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', icon: 'text-blue-600 dark:text-blue-400' },
  }
  return colorMap[color] || colorMap.blue
}

export default function TelegramPage() {
  const [isConnected] = useState(true)

  const handleCopyBotUsername = () => {
    navigator.clipboard.writeText(TELEGRAM_BOT_USERNAME)
    toast.success('Bot username copied!')
  }

  const handleOpenTelegram = () => {
    window.open(TELEGRAM_BOT_LINK, '_blank')
  }

  return (
    <div className="flex-1 h-full overflow-auto">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <TelegramIcon className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Telegram Integration</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">
            Connect with Ally directly through Telegram for seamless calendar management on the go.
          </p>
        </header>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <MessageCircle className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Telegram Bot</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Interact with Ally via Telegram messages</p>
              </div>
            </div>
            {isConnected ? (
              <Badge className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg mb-4">
            <Input
              value={TELEGRAM_BOT_USERNAME}
              readOnly
              className="flex-1 font-mono bg-transparent border-0 focus-visible:ring-0"
            />
            <Button variant="ghost" size="icon" onClick={handleCopyBotUsername}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={handleOpenTelegram}>
              Open in Telegram
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Click the button above or search for {TELEGRAM_BOT_USERNAME} in Telegram to start chatting with Ally.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GETTING_STARTED_STEPS.map((item) => (
              <div key={item.step} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{item.step}</span>
                </div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{item.title}</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Available Commands</h3>
          <div className="space-y-3">
            {TELEGRAM_COMMANDS.map((item) => (
              <div
                key={item.command}
                className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
              >
                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">{item.command}</code>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{item.description}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Telegram Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TELEGRAM_FEATURES.map((feature) => {
              const colors = getFeatureColorClasses(feature.color)
              return (
                <div key={feature.title} className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <feature.icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{feature.title}</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Need Help?</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Having trouble connecting? Check our documentation or contact support.
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/contact" className="flex items-center gap-2">
                Contact Support
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
