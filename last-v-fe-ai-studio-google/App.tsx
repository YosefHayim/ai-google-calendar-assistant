
import React, { useEffect } from 'react';
import { usePathname, useRouter } from './lib/router';
import RootLayout from './app/layout';
import DashboardLayout from './app/dashboard/layout';
import MarketingLayout from './components/MarketingLayout';

// Page Imports
import HomePage from './pages/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import PhoneRegistrationPage from './components/PhoneRegistrationPage';
import OTPVerificationPage from './components/OTPVerificationPage';
import WaitingListPage from './app/waitinglist/page';
import AboutPage from './pages/AboutPage';
import PricingPage from './app/pricing/page';
import ContactPage from './pages/ContactPage';
import ChangelogPage from './pages/ChangelogPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CareersPage from './pages/CareersPage';

// Dashboard Sub-page Imports
import DashboardPage from './app/dashboard/page';
import AnalyticsPage from './app/dashboard/analytics/page';
import IntegrationsPage from './app/dashboard/integrations/page';

/**
 * A helper component that performs a client-side redirect.
 */
const Redirect = ({ to }: { to: string }) => {
  const { push } = useRouter();
  const currentPath = usePathname();
  
  useEffect(() => {
    // Only redirect if we aren't already at the target destination
    if (currentPath !== to) {
      push(to);
    }
  }, [to, push, currentPath]);

  return null;
};

const App = () => {
  const pathname = usePathname();
  
  // Normalize the path by removing trailing slashes for consistent routing
  const normalizedPath = pathname.length > 1 && pathname.endsWith('/') 
    ? pathname.slice(0, -1) 
    : pathname;

  const renderContent = () => {
    // 1. Handle Dashboard Routes
    if (normalizedPath === '/dashboard' || normalizedPath.startsWith('/dashboard/')) {
      let pageComponent;
      
      switch (normalizedPath) {
        case '/dashboard':
          pageComponent = <DashboardPage />;
          break;
        case '/dashboard/analytics':
          pageComponent = <AnalyticsPage />;
          break;
        case '/dashboard/integrations':
          pageComponent = <IntegrationsPage />;
          break;
        default:
          // Fallback for invalid dashboard routes
          pageComponent = <Redirect to="/dashboard" />;
      }
      
      return <DashboardLayout>{pageComponent}</DashboardLayout>;
    }
    
    // 2. Handle Root Level Routes
    switch (normalizedPath) {
      case '/':
      case '':
        return (
          <MarketingLayout>
            <HomePage />
          </MarketingLayout>
        );
      case '/login':
        return <LoginPage />;
      case '/register':
        return <RegisterPage />;
      case '/phone-registration':
        return <PhoneRegistrationPage />;
      case '/otp-verification':
        return <OTPVerificationPage />;
      case '/waitinglist':
        return <WaitingListPage />;
      case '/about':
        return (
          <MarketingLayout>
            <AboutPage />
          </MarketingLayout>
        );
      case '/pricing':
        return (
          <MarketingLayout>
            <PricingPage />
          </MarketingLayout>
        );
      case '/contact':
        return (
          <MarketingLayout>
            <ContactPage />
          </MarketingLayout>
        );
      case '/changelog':
        return <ChangelogPage />;
      case '/careers':
        return (
          <MarketingLayout>
            <CareersPage />
          </MarketingLayout>
        );
      case '/terms':
        return (
          <MarketingLayout>
            <TermsPage />
          </MarketingLayout>
        );
      case '/privacy':
        return (
          <MarketingLayout>
            <PrivacyPage />
          </MarketingLayout>
        );
      default:
        // Global 404 Fallback
        return <Redirect to="/" />;
    }
  };

  return (
    <RootLayout>
      {renderContent()}
    </RootLayout>
  );
};

export default App;
