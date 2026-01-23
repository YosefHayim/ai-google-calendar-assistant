'use client'

import { ArrowLeft, ChevronDown, Phone, ShieldCheck } from 'lucide-react'
import React, { useState } from 'react'

import { AllyLogo } from '@/components/shared/logo'
import { BackgroundPattern1 } from '@/components/shared/BackgroundPattern1'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { useRouter } from 'next/navigation'

interface Country {
  name: string
  code: string
  dialCode: string
}

const countries: Country[] = [
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'Australia', code: 'AU', dialCode: '+61' },
  { name: 'Germany', code: 'DE', dialCode: '+49' },
  { name: 'France', code: 'FR', dialCode: '+33' },
  { name: 'Italy', code: 'IT', dialCode: '+39' },
  { name: 'Spain', code: 'ES', dialCode: '+34' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41' },
  { name: 'Japan', code: 'JP', dialCode: '+81' },
  { name: 'South Korea', code: 'KR', dialCode: '+82' },
  { name: 'Singapore', code: 'SG', dialCode: '+65' },
  { name: 'India', code: 'IN', dialCode: '+91' },
  { name: 'China', code: 'CN', dialCode: '+86' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966' },
  { name: 'Israel', code: 'IL', dialCode: '+972' },
  { name: 'Brazil', code: 'BR', dialCode: '+55' },
  { name: 'Mexico', code: 'MX', dialCode: '+52' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27' },
]

const PhoneRegistrationPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber) return

    setIsLoading(true)
    const fullNumber = `${selectedCountry.dialCode}${phoneNumber.replace(/\D/g, '')}`

    setTimeout(() => {
      setIsLoading(false)
      localStorage.setItem('temp_reg_phone', fullNumber)
      router.push('/otp-verification')
    }, 1500)
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <BackgroundPattern1 className="flex flex-1 flex-col items-center justify-center pb-0 pt-0">
        <div className="relative z-10 w-full max-w-md px-6">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-primary/20 bg-primary/10 text-primary shadow-xl shadow-primary/10">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="mb-4 text-4xl font-medium leading-tight tracking-tight text-foreground">
              Secure your <span className="italic text-primary">Office.</span>
            </h1>
            <p className="text-lg font-medium leading-relaxed text-muted-foreground">
              Ally uses 2FA for all executive accounts. Enter your mobile number to establish your secure identity.
            </p>
          </div>

          <form onSubmit={handleSendOTP} className="space-y-2">
            <div className="flex flex-col gap-2">
              <div className="group relative flex items-stretch overflow-hidden rounded-2xl bg-muted bg-secondary shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <div className="relative flex items-center border-r bg-secondary/30 bg-secondary/50">
                  <select
                    className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const country = countries.find((c) => c.code === e.target.value)
                      if (country) setSelectedCountry(country)
                    }}
                  >
                    {countries
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.dialCode})
                        </option>
                      ))}
                  </select>
                  <div className="pointer-events-none flex items-center gap-2 px-4 py-5">
                    <span className="min-w-[3rem] text-center text-lg font-bold text-foreground">
                      {selectedCountry.dialCode}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                    <Phone size={16} />
                  </div>
                  <Input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="555-000-0000"
                    className="h-full w-full border-0 bg-transparent py-5 pl-11 pr-4 text-xl font-medium shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>
              <p className="pl-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                International Carrier Rates May Apply
              </p>
            </div>

            <InteractiveHoverButton
              text={isLoading ? 'Sending Protocol...' : 'Send Verification Code'}
              className="h-16 w-full text-lg shadow-xl shadow-primary/20"
              disabled={isLoading || !phoneNumber}
            />
          </form>

          <Button
            onClick={() => router.push('/register')}
            variant="ghost"
            className="mt-8 w-full text-sm font-medium text-muted-foreground hover:text-foreground hover:text-primary-foreground"
          >
            <ArrowLeft size={16} />
            Back to registration
          </Button>
        </div>
      </BackgroundPattern1>

      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 select-none items-center gap-2 text-foreground opacity-30">
        <AllyLogo className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-[0.3em]">Ally Protocol Security</span>
      </div>
    </div>
  )
}

export default PhoneRegistrationPage
