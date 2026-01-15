'use client'

import { ContactForm } from '@/components/contact/ContactForm'
import { Mail } from 'lucide-react'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { useTranslation } from 'react-i18next'

export default function ContactPage() {
  const { t } = useTranslation()

  return (
    <MarketingLayout>
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
                <ContactForm />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">{t('contact.emailUs')}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">{t('contact.emailUsDesc')}</p>
                <a href="mailto:hello@askally.io" className="text-sm text-primary hover:underline">
                  hello@askally.io
                </a>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">{t('contact.responseTime')}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('contact.responseTimeDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
