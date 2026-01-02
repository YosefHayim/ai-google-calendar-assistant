'use client'

'use client'

import { ArrowLeft, ChevronDown, Phone, ShieldCheck } from 'lucide-react'
import React, { useState } from 'react'

import { AllyLogo } from '@/components/shared/logo'
import { BackgroundPattern1 } from '@/components/shared/BackgroundPattern1'
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
    <div className="min-h-screen bg-white dark:bg-[#030303] flex flex-col relative overflow-hidden">
      <BackgroundPattern1 className="flex-1 flex flex-col items-center justify-center pt-0 pb-0">
        <div className="w-full max-w-md px-6 relative z-10">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-xl shadow-primary/10 border border-primary/20">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-4 leading-tight">
              Secure your <span className="text-primary italic">Office.</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium leading-relaxed">
              Ally uses 2FA for all executive accounts. Enter your mobile number to establish your secure identity.
            </p>
          </div>

          <form onSubmit={handleSendOTP} className="space-y-2">
            <div className="flex flex-col gap-2">
              <div className="relative group bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-stretch focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden shadow-sm">
                <div className="relative border-r border-zinc-200 dark:border-zinc-800 flex items-center bg-zinc-100/50 dark:bg-zinc-800/30">
                  <select
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
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
                  <div className="px-4 py-5 flex items-center gap-2 pointer-events-none">
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 min-w-[3rem] text-center">
                      {selectedCountry.dialCode}
                    </span>
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>

                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="555-000-0000"
                    className="w-full h-full bg-transparent py-5 pl-11 pr-4 text-xl outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-medium"
                  />
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest pl-2">
                International Carrier Rates May Apply
              </p>
            </div>

            <InteractiveHoverButton
              text={isLoading ? 'Sending Protocol...' : 'Send Verification Code'}
              className="w-full h-16 text-lg shadow-xl shadow-primary/20"
              disabled={isLoading || !phoneNumber}
            />
          </form>

          <button
            onClick={() => router.push('/register')}
            className="mt-8 flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 w-full transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to registration
          </button>
        </div>
      </BackgroundPattern1>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30 select-none text-zinc-900 dark:text-white">
        <AllyLogo className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Ally Protocol Security</span>
      </div>
    </div>
  )
}

export default PhoneRegistrationPage
