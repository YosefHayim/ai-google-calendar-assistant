"use client";

import { AllyLogo, BetaBadge } from "@/components/shared/logo";
import { TelegramIcon, WhatsAppIcon } from "@/components/shared/Icons";

import Link from "next/link";
import { Mail } from "lucide-react";
import React from "react";

// Custom Discord Icon since it's sometimes missing from standard sets or varies in naming
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Product",
      links: [
        { name: "Pricing", href: "/pricing" },
        { name: "Executive Power", href: "/pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", href: "#" },
        { name: "Change Log", href: "/changelog" },
      ],
    },
  ];

  return (
    <footer className="bg-white dark:bg-[#030303] border-t border-zinc-200 dark:border-zinc-800 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-zinc-900">
                <AllyLogo className="w-4 h-4" />
              </div>
              <span className="font-medium text-lg tracking-tight flex items-center text-zinc-900 dark:text-zinc-100">
                Ally <BetaBadge />
              </span>
            </Link>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 leading-relaxed">
              The executive-grade AI assistant designed for business owners to defend their deep work. From Free Exploratory access to{" "}
              <b>Unlimited Executive Power</b>. Built on the Ally Neural Protocol.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md text-zinc-500 hover:text-primary transition-colors"
                title="Discord"
              >
                <DiscordIcon className="w-5 h-5" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md text-zinc-500 hover:text-primary transition-colors"
                title="Telegram"
              >
                <TelegramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md text-zinc-500 hover:text-primary transition-colors"
                title="WhatsApp"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@getally.ai"
                className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md text-zinc-500 hover:text-primary transition-colors"
                title="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-6 uppercase text-[10px] tracking-widest">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-zinc-400">© {currentYear} Ally Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[10px] font-medium text-emerald-500 uppercase tracking-tight">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational • High-Performance Engine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
