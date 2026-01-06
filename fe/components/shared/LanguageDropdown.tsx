"use client";

import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageDropdownProps {
  className?: string;
  triggerClassName?: string;
  compact?: boolean;
}

export function LanguageDropdown({
  className,
  triggerClassName,
  compact = false,
}: LanguageDropdownProps) {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const currentLang = languages.find((l) => l.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
          "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          triggerClassName
        )}
      >
        <Globe className="h-4 w-4" />
        {!compact && (
          <span className="hidden sm:inline">{currentLang?.flag}</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("min-w-[180px]", className)}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "flex items-center justify-between gap-2 cursor-pointer",
              currentLanguage === lang.code && "bg-zinc-100 dark:bg-zinc-800"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </div>
            {currentLanguage === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
