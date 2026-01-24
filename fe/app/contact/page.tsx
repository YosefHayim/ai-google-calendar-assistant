'use client'

import { ContactForm } from '@/components/contact/ContactForm'
import { Clock, Mail, MessageSquare } from 'lucide-react'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { useTranslation } from 'react-i18next'

export default function ContactPage() {
  const { t } = useTranslation()

  return (
    <MarketingLayout>
      <section className="bg-muted px-6 py-16 dark:bg-secondary/30">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">{t('contact.title')}</h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                <h2 className="mb-6 text-xl font-semibold text-foreground">Send us a message</h2>
                <ContactForm />
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{t('contact.emailUs')}</h3>
                <p className="mb-3 text-sm text-muted-foreground">{t('contact.emailUsDesc')}</p>
                <a href="mailto:hello@askally.io" className="text-sm font-medium text-primary hover:underline">
                  hello@askally.io
                </a>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Clock className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{t('contact.responseTime')}</h3>
                <p className="text-sm text-muted-foreground">{t('contact.responseTimeDesc')}</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Community</h3>
                <p className="text-sm text-muted-foreground">Join our community for tips, updates, and discussions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
