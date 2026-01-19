import type { Metadata } from 'next'

export const SITE_CONFIG = {
  name: 'Ask Ally',
  url: 'https://askally.io',
  description:
    'Ask Ally, the AI Google Calendar Assistant, is an AI-powered scheduling assistant that helps you manage your Google Calendar with natural language commands, voice input, and smart scheduling.',
  ogImage: 'https://askally.io/logo.svg',
  creator: '@askally_io',
  keywords: [
    'AI calendar assistant',
    'Google Calendar AI',
    'natural language scheduling',
    'voice calendar management',
    'AI secretary',
    'smart scheduling',
    'calendar automation',
    'productivity assistant',
    'time management AI',
    'calendar chatbot',
    'Telegram calendar bot',
    'WhatsApp calendar',
    'voice commands calendar',
  ],
}

export const BASE_METADATA: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} | AI Secretary for Your Google Calendar`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.creator,
  publisher: SITE_CONFIG.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} | AI Secretary for Your Google Calendar`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - AI Calendar Assistant`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} | AI Secretary for Your Google Calendar`,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: SITE_CONFIG.creator,
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  category: 'technology',
}

// Page-specific metadata generators
export const PAGE_METADATA = {
  home: {
    title: 'AI Secretary for Your Google Calendar',
    description:
      'Ask Ally, the AI Google Calendar Assistant, is your intelligent scheduling assistant. Manage Google Calendar with natural language, voice commands, and AI-powered scheduling. Available on web, Telegram, and WhatsApp.',
    keywords: [...SITE_CONFIG.keywords, 'home automation', 'personal assistant AI', 'calendar management app'],
  },
  pricing: {
    title: 'Pricing Plans',
    description:
      'Choose the perfect Ask Ally plan for your needs. Free tier for individuals, Pro for power users, and Enterprise for teams. AI calendar management made affordable.',
    keywords: ['Ask Ally pricing', 'calendar AI pricing', 'productivity tool pricing', 'AI assistant plans'],
  },
  about: {
    title: 'About Us',
    description:
      'Learn about Ask Ally, the AI Google Calendar Assistant, built to save you time. Our mission is to eliminate calendar chaos and give you back your most valuable resource: time.',
    keywords: ['about Ask Ally', 'AI calendar company', 'productivity startup', 'calendar automation team'],
  },
  help: {
    title: 'Help Center',
    description:
      'Get help with Ask Ally. Find answers to common questions about calendar integration, AI features, voice commands, account management, and troubleshooting.',
    keywords: [
      'Ask Ally help',
      'calendar AI support',
      'FAQ',
      'how to use Ask Ally',
      'troubleshooting',
      'calendar integration help',
    ],
  },
  blog: {
    title: 'Blog',
    description:
      'Tips, tutorials, and insights from the Ask Ally team. Learn productivity hacks, AI calendar features, time management strategies, and the latest updates.',
    keywords: ['Ask Ally blog', 'productivity tips', 'calendar management tips', 'AI assistant news'],
  },
  changelog: {
    title: 'Changelog',
    description:
      "See what's new in Ask Ally. Track our latest features, improvements, and bug fixes. Stay updated on the evolution of your AI calendar assistant.",
    keywords: ['Ask Ally changelog', 'product updates', 'new features', 'release notes'],
  },
  contact: {
    title: 'Contact Us',
    description:
      "Get in touch with the Ask Ally team. We're here to help with questions, feedback, partnership inquiries, and enterprise solutions.",
    keywords: ['contact Ask Ally', 'support', 'feedback', 'enterprise inquiries'],
  },
  privacy: {
    title: 'Privacy Policy',
    description:
      'Ask Ally Privacy Policy. Learn how we protect your data, handle calendar information, and ensure your privacy while using our AI assistant.',
    keywords: ['Ask Ally privacy', 'data protection', 'calendar data security', 'GDPR compliance'],
  },
  terms: {
    title: 'Terms of Service',
    description:
      'Ask Ally Terms of Service. Understand the terms and conditions for using our AI calendar assistant and related services.',
    keywords: ['Ask Ally terms', 'terms of service', 'user agreement', 'service conditions'],
  },
  waitinglist: {
    title: 'Join the Waiting List',
    description:
      'Be among the first to experience Ask Ally. Join our waiting list for early access to the AI-powered calendar assistant that will transform how you manage time.',
    keywords: ['Ask Ally waitlist', 'early access', 'beta signup', 'calendar AI preview'],
  },
  login: {
    title: 'Sign In',
    description:
      'Sign in to Ask Ally to access your AI calendar assistant. Manage your Google Calendar with natural language commands and voice input.',
    keywords: ['Ask Ally login', 'sign in', 'calendar assistant login'],
  },
  register: {
    title: 'Create Account',
    description:
      'Create your free Ask Ally account. Get started with AI-powered calendar management, natural language scheduling, and voice commands.',
    keywords: ['Ask Ally signup', 'create account', 'free calendar AI', 'register'],
  },
  compare: {
    title: 'Ask Ally vs Other Calendar Tools & Services',
    description:
      'Ask Ally, the AI Google Calendar Assistant, is a productivity SaaS tool - not an accessibility service or consulting firm. Compare Ask Ally to Calendly, Motion, Reclaim.ai and other calendar tools.',
    keywords: [
      'Ask Ally comparison',
      'Ask Ally vs Calendly',
      'Ask Ally vs Motion',
      'Ask Ally vs Reclaim',
      'AI calendar assistant comparison',
      'Google Calendar AI tools',
      'productivity calendar software',
      'calendar automation tools',
      'Ask Ally productivity tool',
      'AI scheduling assistant',
    ],
  },
}

// JSON-LD Structured Data helpers
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.svg`,
    description: SITE_CONFIG.description,
    sameAs: ['https://twitter.com/askally_io', 'https://t.me/AskAllyBot'],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@askally.io',
      contactType: 'customer support',
    },
  }
}

export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_CONFIG.name,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web, Telegram, WhatsApp',
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'Natural language calendar management',
      'Voice commands and input',
      'Google Calendar integration',
      'Multi-platform support (Web, Telegram, WhatsApp)',
      'AI-powered scheduling suggestions',
      'Gap recovery and time tracking',
      'Smart conflict detection',
      'Calendar analytics and insights',
    ],
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateArticleSchema(article: {
  title: string
  description: string
  datePublished: string
  dateModified?: string
  author: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.svg`,
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.image || SITE_CONFIG.ogImage,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': SITE_CONFIG.url,
    },
  }
}

export function generateWebPageSchema(page: { title: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: page.url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    provider: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
    },
  }
}

export function generateHowToSchema(steps: { name: string; text: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to use Ask Ally',
    description: 'Learn how to manage your Google Calendar with Ask Ally AI assistant',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }
}
