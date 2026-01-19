'use client'

import { AllyLogo, BetaBadge } from '@/components/shared/logo'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { CustomUser, User } from '@/types/api'
import React, { useEffect, useState } from 'react'
import { TelegramIcon, WhatsAppIcon } from '@/components/shared/Icons'
import { usePathname, useRouter } from 'next/navigation'

import { AnimatedHamburger } from '@/components/ui/animated-hamburger'
import { Button } from '@/components/ui/button'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { LanguageDropdown } from '@/components/shared/LanguageDropdown'
import Link from 'next/link'
import { ThemeToggle } from '../ui/theme-toggle'
import { useAuthContext } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'

// Custom Discord Icon consistent with Footer
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z" />
  </svg>
)

function getUserInfo(user: User | CustomUser | null) {
  if (!user) return { name: '', initials: '', avatarUrl: '' }

  let firstName: string | null | undefined
  let lastName: string | null | undefined
  let userAvatarUrl: string | null | undefined

  if ('user_metadata' in user) {
    firstName = user.user_metadata?.first_name
    lastName = user.user_metadata?.last_name
    userAvatarUrl = user.user_metadata?.avatar_url
  } else {
    firstName = user.first_name
    lastName = user.last_name
    userAvatarUrl = user.avatar_url
  }

  const name = [firstName, lastName].filter(Boolean).join(' ') || user.email?.split('@')[0] || ''
  const initials =
    firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : name.slice(0, 2).toUpperCase()

  return { name, initials, avatarUrl: userAvatarUrl || '' }
}

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()
  const { isAuthenticated, user, isLoading } = useAuthContext()
  const { name, initials, avatarUrl } = getUserInfo(user)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    { name: t('navbar.home'), href: '/' },
    { name: t('navbar.about'), href: '/about' },
    { name: t('navbar.pricing'), href: '/pricing' },
    { name: t('navbar.contact'), href: '/contact' },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          isScrolled ? 'py-3 bg-background/80 backdrop-blur-md border-b border shadow-sm' : 'py-6 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-foreground dark:bg-background rounded-md flex items-center justify-center text-background dark:text-foreground shadow-sm group-hover:scale-110 transition-transform">
              <AllyLogo className="w-5 h-5" />
            </div>
            <span className="font-medium text-xl tracking-tight flex items-center text-foreground">
              Ally <BetaBadge />
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground dark:text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageDropdown />
            <ThemeToggle className="scale-90" />
            {isAuthenticated && !isLoading ? (
              <>
                <div className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt={name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[120px] truncate">
                    {name}
                  </span>
                </div>
                <Button onClick={() => router.push('/dashboard')} className="gap-2">
                  {t('navbar.dashboard', 'Dashboard')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary-foreground transition-colors"
                >
                  {t('navbar.login')}
                </Link>
                <InteractiveHoverButton
                  text={t('navbar.getStarted')}
                  className="w-40 h-10 text-sm"
                  onClick={() => router.push('/register')}
                />
              </>
            )}
          </div>

          {/* Mobile Toggle Section */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && !isLoading && (
              <Avatar className="h-7 w-7">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
            <LanguageDropdown compact />
            <ThemeToggle className="scale-75" />
            <AnimatedHamburger isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          </div>
        </div>
      </nav>

      {/* Mobile Side Navigation - Outside nav to avoid backdrop-blur inheritance */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[70] md:hidden"
            />

            {/* Left Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-sm z-[80] md:hidden shadow-2xl border-r flex flex-col p-6 pt-10 bg-[#ffffff] dark:bg-[#09090b]"
            >
              <div className="flex items-center mb-10">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-8 h-8 bg-secondary dark:bg-background rounded-md flex items-center justify-center text-white dark:text-foreground">
                    <AllyLogo className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-xl tracking-tight flex items-center text-foreground dark:text-primary-foreground">
                    Ally <BetaBadge />
                  </span>
                </Link>
              </div>

              <div className="flex flex-col gap-6 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-xl font-medium transition-colors ${
                      pathname === link.href ? 'text-primary' : 'text-foreground dark:text-primary-foreground'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Social Icons added above the separator */}
              <div className="flex items-center gap-4 mb-6">
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-secondary rounded-lg text-muted-foreground hover:text-primary transition-colors"
                  title="Discord"
                >
                  <DiscordIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-secondary rounded-lg text-muted-foreground hover:text-primary transition-colors"
                  title="Telegram"
                >
                  <TelegramIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://wa.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-secondary rounded-lg text-muted-foreground hover:text-primary transition-colors"
                  title="WhatsApp"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
                <a
                  href="mailto:hello@askally.io"
                  className="p-2.5 bg-secondary rounded-lg text-muted-foreground hover:text-primary transition-colors"
                  title="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>

              <div className="flex flex-col gap-4 pt-8 border-t border-zinc-100 ">
                {isAuthenticated && !isLoading ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarUrl} alt={name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground dark:text-primary-foreground truncate">
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        router.push('/dashboard')
                      }}
                      className="w-full h-14 text-lg gap-2"
                    >
                      {t('navbar.dashboard', 'Dashboard')}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <InteractiveHoverButton
                      text={t('navbar.login')}
                      className="w-full h-14 text-lg bg-primary text-black border-primary border-2"
                      dotClassName="bg-foreground group-hover:bg-foreground"
                      hoverContentClassName="text-primary"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        router.push('/login')
                      }}
                    />
                    <InteractiveHoverButton
                      text={t('navbar.getStarted')}
                      className="w-full h-14 text-lg"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        router.push('/register')
                      }}
                    />
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
