"use client";

import { Check, Globe, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";

import { AllyLogo } from "../shared/logo";
import { Button } from "@/components/ui/button";
import type { SupportedEventLanguage } from "@/types/api";
import { toast } from "sonner";
import { useUpdateGapSettings } from "@/hooks/queries/gaps";

const SUPPORTED_LANGUAGES: {
  code: SupportedEventLanguage;
  name: string;
  nativeName: string;
  flag: string;
}[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
];

type LanguageOnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export const LanguageOnboardingModal: React.FC<
  LanguageOnboardingModalProps
> = ({ isOpen, onClose, onComplete }) => {
  const [selectedLanguages, setSelectedLanguages] = useState<
    SupportedEventLanguage[]
  >(["en"]);
  const { mutate: updateSettings, isPending } = useUpdateGapSettings();

  const toggleLanguage = (code: SupportedEventLanguage) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(code)) {
        if (prev.length === 1) return prev;
        return prev.filter((l) => l !== code);
      }
      return [...prev, code];
    });
  };

  const handleSave = () => {
    updateSettings(
      {
        eventLanguages: selectedLanguages,
        languageSetupComplete: true,
      },
      {
        onSuccess: () => {
          toast.success("Language preferences saved");
          onComplete();
        },
        onError: () => {
          toast.error("Failed to save language preferences");
        },
      }
    );
  };

  const handleSkip = () => {
    updateSettings(
      {
        eventLanguages: ["en"],
        languageSetupComplete: true,
      },
      {
        onSuccess: () => {
          toast.info("Defaulted to English. You can change this in Settings.");
          onComplete();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20">
              <AllyLogo />
            </div>
            <div>
              <DialogTitle className="text-xl">
                Calendar Language Setup
              </DialogTitle>
              <DialogDescription className="mt-1">
                Help Ally understand your calendar better
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Select the language(s) you use when writing your calendar event
            titles. This helps Ally accurately detect gaps in your schedule.
          </p>

          <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguages.includes(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => toggleLanguage(lang.code)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                    ${
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }
                  `}
                >
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${isSelected ? "bg-primary border-primary" : "border-zinc-300 dark:border-zinc-600"}
                    `}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {lang.name}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 ml-2 text-sm">
                      {lang.nativeName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedLanguages.length === 0 && (
            <p className="text-xs text-red-500">
              Please select at least one language
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isPending}
            className="flex-1"
          >
            Skip (use English)
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || selectedLanguages.length === 0}
            className="flex-1"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
