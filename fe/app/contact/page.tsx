'use client'

import { ContactForm } from '@/components/contact/ContactForm'
import { Mail } from 'lucide-react'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { useTranslation } from 'react-i18next'

export default function ContactPage() {
  const { t } = useTranslation()

  return (
    <MarketingLayout>
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-medium tracking-tight text-foreground dark:text-primary-foreground md:text-5xl">
              {t('contact.title')}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground dark:text-muted-foreground">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="rounded-2xl bg-background p-6 dark:bg-secondary md:p-8">
                <ContactForm />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-muted p-6 dark:bg-secondary">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-medium text-foreground dark:text-primary-foreground">
                  {t('contact.emailUs')}
                </h3>
                <p className="mb-3 text-sm text-muted-foreground dark:text-muted-foreground">
                  {t('contact.emailUsDesc')}
                </p>
                <a href="mailto:hello@askally.io" className="text-sm text-primary hover:underline">
                  hello@askally.io
                </a>
              </div>

              <div className="rounded-2xl bg-muted p-6 dark:bg-secondary">
                <h3 className="mb-2 font-medium text-foreground dark:text-primary-foreground">
                  {t('contact.responseTime')}
                </h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {t('contact.responseTimeDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
