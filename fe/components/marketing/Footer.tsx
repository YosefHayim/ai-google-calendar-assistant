'use client'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import { SlackIcon, TelegramIcon, WhatsAppIcon } from '@/components/shared/Icons'

import Link from 'next/link'
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
        { name: 'Why Ally?', href: '/compare' },
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
    <footer className="bg-background dark:bg-[#030303] border-t border dark:border pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-secondary dark:bg-background rounded-md flex items-center justify-center text-white dark:text-foreground">
                <AllyLogo className="w-4 h-4" />
              </div>
              <span className="font-medium text-lg tracking-tight flex items-center text-foreground dark:text-primary-foreground">
                Ally <BetaBadge />
              </span>
            </Link>
            <p className="text-muted-foreground dark:text-muted-foreground max-w-sm mb-8 leading-relaxed">{t('footer.description')}</p>
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL_LINKS.TELEGRAM_BOT}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-secondary dark:bg-secondary rounded-md text-muted-foreground hover:text-[#0088cc] transition-colors"
                title={t('footer.chatOnTelegram')}
              >
                <TelegramIcon className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.SLACK}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-secondary dark:bg-secondary rounded-md text-muted-foreground hover:text-[#4A154B] dark:hover:text-[#E01E5A] transition-colors"
                title="Slack"
              >
                <SlackIcon className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-secondary dark:bg-secondary rounded-md text-muted-foreground hover:text-[#25D366] transition-colors"
                title="WhatsApp"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-medium text-foreground dark:text-primary-foreground mb-6 uppercase text-xs tracking-widest">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground dark:text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-zinc-100 dark:border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-muted-foreground">© {currentYear} Ally Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <SystemStatus />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
