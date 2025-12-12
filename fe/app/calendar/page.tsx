"use client";

import { CalendarView } from "@/components/calendar/calendar-view";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";

export default function CalendarPage() {
  const { isOpen, isMobile } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className={cn("flex-1 overflow-y-auto transition-all duration-300", !isMobile && isOpen && "ml-64")}>
        <CalendarView />
      </main>
    </div>
  );
}
