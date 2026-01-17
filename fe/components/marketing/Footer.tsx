'use client'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import { TelegramIcon, WhatsAppIcon } from '@/components/shared/Icons'

import Link from 'next/link'
import { Mail } from 'lucide-react'
import React from 'react'
import { SOCIAL_LINKS } from '@/lib/constants'
import { SystemStatus } from './SystemStatus'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { t } = useTranslation()

  const sections = [
    {
      title: t('footer.product'),
      links: [
        { name: t('footer.pricing'), href: '/pricing' },
        { name: t('footer.executivePower'), href: '/pricing' },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { name: t('footer.aboutUs'), href: '/about' },
        { name: t('footer.careers'), href: '/careers' },
        { name: t('footer.privacy'), href: '/privacy' },
        { name: t('footer.terms'), href: '/terms' },
      ],
    },
    {
      title: t('footer.resources'),
      links: [
        { name: t('footer.blog'), href: '/blog' },
        { name: t('footer.changeLog'), href: '/changelog' },
      ],
    },
  ]

  return (
    <footer className="bg-white dark:bg-[#030303] border-t border-zinc-200 dark:border-zinc-800 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-zinc-900">
                <AllyLogo className="w-4 h-4" />
              </div>
              <span className="font-medium text-lg tracking-tight flex items-center text-zinc-900 dark:text-zinc-100">
                Ally <BetaBadge />
              </span>
            </Link>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 leading-relaxed">{t('footer.description')}</p>
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL_LINKS.TELEGRAM_BOT}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md text-zinc-500 hover:text-[#0088cc] transition-colors"
                title={t('footer.chatOnTelegram')}
              >
                <TelegramIcon className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md text-zinc-500 hover:text-[#25D366] transition-colors"
                title="WhatsApp"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.EMAIL}
                className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md text-zinc-500 hover:text-primary transition-colors"
                title="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-6 uppercase text-xs tracking-widest">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-zinc-400">© {currentYear} Ally Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <SystemStatus />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
