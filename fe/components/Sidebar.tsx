
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Plus, 
  Settings, 
  X, 
  ChevronLeft,
  LayoutDashboard,
  BarChart2,
  Share2
} from 'lucide-react';
import { AllyLogo, BetaBadge } from './logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onOpenSettings: () => void;
}

interface NavLinkProps {
  href: string;
  activePath: string;
  isOpen: boolean;
  icon: React.ElementType;
  id?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, activePath, isOpen, icon: Icon, id, onClick, children }) => {
  const isActive = activePath === href;
  return (
    <Link 
      id={id}
      href={href} 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${isActive ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'} ${!isOpen ? 'md:justify-center' : ''}`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
      <span className={`text-sm whitespace-nowrap ${!isOpen ? 'md:hidden' : ''}`}>{children}</span>
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onToggle, 
  onOpenSettings,
}) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Assistant', id: 'tour-assistant' },
    { href: '/dashboard/analytics', icon: BarChart2, label: 'Intelligence', id: 'tour-analytics' },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}
      <aside
        id="tour-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 md:w-20'
        }`}
      >
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <div className={`flex items-center p-4 border-b border-zinc-200 dark:border-zinc-800 ${isOpen ? 'justify-between' : 'justify-center'}`}>
            {isOpen && (
              <Link href="/" onClick={onClose} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-zinc-900">
                  <AllyLogo className="w-5 h-5" />
                </div>
                <span className="font-medium text-lg tracking-normal flex items-center text-zinc-900 dark:text-zinc-100">
                  Ally <BetaBadge />
                </span>
              </Link>
            )}
            {/* Toggle button for desktop */}
            <button onClick={onToggle} className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hidden md:block">
              {isOpen ? <ChevronLeft className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
            </button>
            {/* Close button for mobile */}
            {isOpen && (
                <button onClick={onClose} className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 md:hidden">
                    <X className="w-5 h-5" />
                </button>
            )}
          </div>
  
          {/* New Chat Button */}
          <div className="p-4">
            <button 
              onClick={() => {
                // Logic for new chat would go here
                onClose(); 
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-md bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors ${!isOpen ? 'md:justify-center' : ''}`}
            >
              <Plus className="w-5 h-5" />
              <span className={`font-bold text-sm whitespace-nowrap ${!isOpen ? 'md:hidden' : ''}`}>New Chat</span>
            </button>
          </div>
  
          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <NavLink 
                key={item.href} 
                href={item.href} 
                activePath={pathname} 
                isOpen={isOpen} 
                icon={item.icon} 
                id={item.id}
                onClick={onClose}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
  
          {/* Footer */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <button 
              id="tour-settings" 
              onClick={() => {
                onOpenSettings();
                onClose();
              }} 
              className={`w-full flex items-center gap-3 p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${!isOpen ? 'md:justify-center' : ''}`}
            >
              <Settings className="w-5 h-5" />
              <span className={`text-sm font-medium whitespace-nowrap ${!isOpen ? 'md:hidden' : ''}`}>Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
