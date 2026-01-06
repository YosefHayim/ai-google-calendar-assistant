"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Check, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CinematicGlowToggle from "@/components/ui/cinematic-glow-toggle";
import { useGapSettings, useUpdateGapSettings } from "@/hooks/queries/gaps";
import type { SupportedEventLanguage } from "@/types/api";

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
];

const gapSettingsSchema = z.object({
  eventLanguages: z.array(z.string()).min(1, "Select at least one language"),
  autoGapAnalysis: z.boolean(),
});

type GapSettingsFormData = z.infer<typeof gapSettingsSchema>;

export const GapSettingsTab: React.FC = () => {
  const autoGapToggleId = React.useId();
  const { settings, isLoading } = useGapSettings();
  const { mutate: updateSettings, isPending } = useUpdateGapSettings();

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<GapSettingsFormData>({
    resolver: zodResolver(gapSettingsSchema),
    defaultValues: {
      eventLanguages: ["en"],
      autoGapAnalysis: true,
    },
  });

  const watchedAutoGap = watch("autoGapAnalysis");

  useEffect(() => {
    if (settings) {
      const langs = settings.eventLanguages || ["en"];
      setSelectedLanguages(langs);
      reset({
        eventLanguages: langs,
        autoGapAnalysis: settings.autoGapAnalysis,
      });
    }
  }, [settings, reset]);

  const toggleLanguage = (code: string) => {
    const newLangs = selectedLanguages.includes(code)
      ? selectedLanguages.filter((l) => l !== code)
      : [...selectedLanguages, code];

    if (newLangs.length === 0) return;

    setSelectedLanguages(newLangs);
    setValue("eventLanguages", newLangs, { shouldDirty: true });
  };

  const onSubmit = (data: GapSettingsFormData) => {
    updateSettings(
      {
        eventLanguages: data.eventLanguages as SupportedEventLanguage[],
        autoGapAnalysis: data.autoGapAnalysis,
        languageSetupComplete: true,
      },
      {
        onSuccess: () => {
          toast.success("Gap detection settings saved");
          reset(data);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </CardContent>
      </Card>
    );
  }

  const showLanguageWarning = !settings?.languageSetupComplete;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Calendar Event Languages
              </CardTitle>
              <CardDescription>
                Select the language(s) you use when writing calendar event
                titles for accurate gap detection.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {showLanguageWarning && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Language setup required
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Please select your calendar event language(s) for accurate
                    gap detection.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                I write my calendar events in:
              </Label>
              <div className="grid grid-cols-2 gap-2">
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
                          w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                          ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-zinc-300 dark:border-zinc-600"
                          }
                        `}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-lg">{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                          {lang.name}
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400 ml-1 text-xs">
                          ({lang.nativeName})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedLanguages.length === 0 && (
                <p className="text-xs text-red-500">
                  Select at least one language
                </p>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
              <div className="grid gap-0.5">
                <Label htmlFor={autoGapToggleId} className="font-medium">
                  Automatic Gap Analysis
                </Label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Automatically detect gaps in your calendar when you log in.
                </p>
              </div>
              <CinematicGlowToggle
                id={autoGapToggleId}
                checked={watchedAutoGap}
                onChange={(checked) =>
                  setValue("autoGapAnalysis", checked, { shouldDirty: true })
                }
              />
            </div>

            <Button
              type="submit"
              disabled={!isDirty || isPending || selectedLanguages.length === 0}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
