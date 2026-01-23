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
    <footer className="border-t bg-background pb-10 pt-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-background bg-secondary text-foreground">
                <AllyLogo className="h-4 w-4" />
              </div>
              <span className="flex items-center text-lg font-medium tracking-tight text-foreground">
                Ally <BetaBadge />
              </span>
            </Link>
            <p className="mb-8 max-w-sm leading-relaxed text-muted-foreground">{t('footer.description')}</p>
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL_LINKS.TELEGRAM_BOT}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-secondary p-2 text-muted-foreground transition-colors hover:text-[#0088cc]"
                title={t('footer.chatOnTelegram')}
              >
                <TelegramIcon className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.SLACK}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-secondary p-2 text-muted-foreground transition-colors hover:text-[#4A154B] hover:text-[#E01E5A]"
                title="Slack"
              >
                <SlackIcon className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-secondary p-2 text-muted-foreground transition-colors hover:text-[#25D366]"
                title="WhatsApp"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-6 text-xs font-medium uppercase tracking-widest text-foreground">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-border pt-10 md:flex-row">
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
