
'use client';

import React from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#030303]">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MarketingLayout;
