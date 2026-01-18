'use client'

import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { AllyLogo } from '@/components/shared/logo'
import { BackgroundPattern1 } from '@/components/shared/BackgroundPattern1'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { useRouter } from 'next/navigation'

const OTPVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [timer, setTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const phone = typeof window !== 'undefined' ? localStorage.getItem('temp_reg_phone') : null

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1)
      }, 1000)
    } else {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [timer])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return

    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setIsSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }, 2000)
  }

  const handleResend = () => {
    if (!canResend) return
    setOtp(['', '', '', '', '', ''])
    setTimer(30)
    setCanResend(false)
    inputRefs.current[0]?.focus()
    // Simulate resend API call
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#030303] flex flex-col relative overflow-hidden">
      <BackgroundPattern1 className="flex-1 flex flex-col items-center justify-center pt-0 pb-0">
        <div className="w-full max-w-md px-6 relative z-10">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-xl shadow-primary/10 border border-primary/20">
              {isSuccess ? <CheckCircle2 className="w-10 h-10 text-emerald-500" /> : <Lock className="w-10 h-10" />}
            </div>
            <h1 className="text-4xl font-medium tracking-tight text-foreground dark:text-primary-foreground mb-4">
              {isSuccess ? 'Identity Verified' : 'Verify Protocol'}
            </h1>
            <p className="text-muted-foreground dark:text-muted-foreground text-lg font-medium leading-relaxed">
              {isSuccess
                ? 'Security handshake complete. Redirecting to your dashboard...'
                : `Enter the 6-digit code we sent to your device ending in ${phone?.slice(-4) || '...'}`}
            </p>
          </div>

          {!isSuccess && (
            <>
              <form onSubmit={handleVerify} className="space-y-2">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      required
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-16 sm:w-14 sm:h-20 rounded-xl text-center text-3xl font-bold focus:ring-4 focus:ring-primary/10"
                    />
                  ))}
                </div>

                <div className="space-y-2 text-center">
                  <InteractiveHoverButton
                    text={isVerifying ? 'Verifying...' : 'Verify Identity'}
                    className="w-full h-16 text-lg shadow-xl shadow-primary/20"
                    disabled={isVerifying || otp.join('').length < 6}
                  />

                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                      Didn&apos;t receive code?{' '}
                      {canResend ? (
                        <Button onClick={handleResend} type="button" variant="link" className="p-0 h-auto font-bold">
                          Send again
                        </Button>
                      ) : (
                        <span className="text-muted-foreground dark:text-zinc-600 italic">
                          Retry in 0:{timer.toString().padStart(2, '0')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </form>

              <Button
                onClick={() => router.push('/phone-registration')}
                variant="ghost"
                className="mt-12 w-full text-muted-foreground hover:text-foreground dark:hover:text-primary-foreground font-medium text-xs uppercase tracking-widest"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Edit Phone Number
              </Button>
            </>
          )}
        </div>
      </BackgroundPattern1>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30 select-none text-foreground dark:text-white">
        <AllyLogo className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-[0.3em]">Encrypted Session Active</span>
      </div>
    </div>
  )
}

export default OTPVerificationPage
