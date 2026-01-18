'use client'

import { IPhoneMockup } from '@/components/ui/iphone-mockup'

interface PhoneMockupProps {
  children: React.ReactNode
}

export const PhoneMockup = ({ children }: PhoneMockupProps) => (
  <div className="relative mx-auto">
    {/* Mobile scale */}
    <div className="sm:hidden">
      <IPhoneMockup
        model="15-pro"
        color="space-black"
        scale={0.45}
        screenBg="#0E1621"
        safeArea={false}
        showHomeIndicator={true}
        className="mx-auto"
      >
        <div className="h-full w-full">{children}</div>
      </IPhoneMockup>
    </div>
    {/* Tablet and desktop scale */}
    <div className="hidden sm:block">
      <IPhoneMockup
        model="15-pro"
        color="space-black"
        scale={0.68}
        screenBg="#0E1621"
        safeArea={false}
        showHomeIndicator={true}
        className="mx-auto"
      >
        <div className="h-full w-full">{children}</div>
      </IPhoneMockup>
    </div>
  </div>
)
