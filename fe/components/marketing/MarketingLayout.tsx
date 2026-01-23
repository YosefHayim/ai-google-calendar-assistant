'use client'

import React from 'react'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'

interface MarketingLayoutProps {
  children: React.ReactNode
}

const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <Footer />
    </div>
  )
}

export default MarketingLayout
