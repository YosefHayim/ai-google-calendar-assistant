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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <BackgroundPattern1 className="flex flex-1 flex-col items-center justify-center pb-0 pt-0">
        <div className="relative z-10 w-full max-w-md px-6">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-primary/20 bg-primary/10 text-primary shadow-xl shadow-primary/10">
              {isSuccess ? <CheckCircle2 className="h-10 w-10 text-emerald-500" /> : <Lock className="h-10 w-10" />}
            </div>
            <h1 className="mb-4 text-4xl font-medium tracking-tight text-foreground">
              {isSuccess ? 'Identity Verified' : 'Verify Protocol'}
            </h1>
            <p className="text-lg font-medium leading-relaxed text-muted-foreground">
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
                      className="h-16 w-12 rounded-xl text-center text-3xl font-bold focus:ring-4 focus:ring-primary/10 sm:h-20 sm:w-14"
                    />
                  ))}
                </div>

                <div className="space-y-2 text-center">
                  <InteractiveHoverButton
                    text={isVerifying ? 'Verifying...' : 'Verify Identity'}
                    className="h-16 w-full text-lg shadow-xl shadow-primary/20"
                    disabled={isVerifying || otp.join('').length < 6}
                  />

                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Didn&apos;t receive code?{' '}
                      {canResend ? (
                        <Button onClick={handleResend} type="button" variant="link" className="h-auto p-0 font-bold">
                          Send again
                        </Button>
                      ) : (
                        <span className="italic text-muted-foreground">
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
                className="mt-12 w-full text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground hover:text-primary-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Edit Phone Number
              </Button>
            </>
          )}
        </div>
      </BackgroundPattern1>

      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 select-none items-center gap-2 text-foreground opacity-30">
        <AllyLogo className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-[0.3em]">Encrypted Session Active</span>
      </div>
    </div>
  )
}

export default OTPVerificationPage
