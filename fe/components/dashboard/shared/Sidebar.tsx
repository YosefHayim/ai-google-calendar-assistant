"use client";

import { AllyLogo, BetaBadge } from "@/components/shared/logo";
import {
  BadgeCheck,
  BarChart2,
  Bell,
  Calendar,
  ChevronLeft,
  Clock,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/dateUtils";
import { CustomUser } from "@/types/api";
import Image from "next/image";
import Link from "next/link";
import { QuickEventDialog } from "@/components/dialogs/QuickEventDialog";
import UserProfileCard from "@/components/dashboard/shared/UserProfileCard";
import { useChatContext } from "@/contexts/ChatContext";
import { useUser } from "@/hooks/queries/auth/useUser";
import { toast } from "sonner";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onOpenSettings: () => void;
  onSignOut?: () => void;
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

const NavLink: React.FC<NavLinkProps> = ({
  href,
  activePath,
  isOpen,
  icon: Icon,
  id,
  onClick,
  children,
}) => {
  const isActive = activePath === href;
  return (
    <Link
      id={id}
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
        isActive
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
      } ${!isOpen ? "md:justify-center" : ""}`}
    >
      <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
      <span
        className={`text-sm whitespace-nowrap ${!isOpen ? "md:hidden" : ""}`}
      >
        {children}
      </span>
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onToggle,
  onOpenSettings,
  onSignOut,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: userData } = useUser({ customUser: true });
  const {
    conversations,
    isLoadingConversations,
    selectedConversationId,
    selectConversation,
    startNewConversation,
    refreshConversations,
    removeConversation,
    searchQuery,
    setSearchQuery,
    isSearching,
  } = useChatContext();

  const [conversationToDelete, setConversationToDelete] = useState<
    number | null
  >(null);
  const [localSearchValue, setLocalSearchValue] = useState(searchQuery);
  const [isQuickEventOpen, setIsQuickEventOpen] = useState(false);

  // Debounced search update (300ms delay)
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchValue(value);
    debouncedSetSearch(value);
  };

  const handleClearSearch = () => {
    setLocalSearchValue("");
    setSearchQuery("");
  };

  const navItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Assistant",
      id: "tour-assistant",
    },
    {
      href: "/dashboard/analytics",
      icon: BarChart2,
      label: "Intelligence",
      id: "tour-analytics",
    },
    {
      href: "/dashboard/gaps",
      icon: Target,
      label: "Gap Recovery",
      id: "tour-gaps",
    },
  ];

  // TanStack Query automatically fetches conversations on mount, no need to manually refetch

  const handleNewChat = () => {
    startNewConversation();
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
    onClose();
  };

  const handleSelectConversation = async (
    conversation: (typeof conversations)[0]
  ) => {
    await selectConversation(conversation);
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
    onClose();
  };

  const initiateDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setConversationToDelete(id);
  };

  const confirmDelete = async () => {
    if (conversationToDelete) {
      const success = await removeConversation(conversationToDelete);
      if (success) {
        toast.success("Conversation deleted");
      } else {
        toast.error("Failed to delete conversation");
      }
      setConversationToDelete(null);
    }
  };

  // Extract user data similar to UserProfileCard
  const isCustomUser =
    userData && ("avatar_url" in userData || "first_name" in userData);
  const customUser = isCustomUser ? (userData as CustomUser) : null;
  const standardUser =
    !isCustomUser && userData && "user_metadata" in userData ? userData : null;

  const firstName =
    customUser?.first_name ||
    (standardUser?.user_metadata as Record<string, any>)?.first_name ||
    "";
  const lastName =
    customUser?.last_name ||
    (standardUser?.user_metadata as Record<string, any>)?.last_name ||
    "";
  const avatarUrl =
    customUser?.avatar_url ||
    (standardUser?.user_metadata as Record<string, any>)?.avatar_url;
  const email = customUser?.email || standardUser?.email || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User";
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <>
      <Dialog
        open={!!conversationToDelete}
        onOpenChange={(open) => !open && setConversationToDelete(null)}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-zinc-100">
              Delete Conversation
            </DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete this conversation? This action
              cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConversationToDelete(null)}
              className="border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        id="tour-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${
          isOpen ? "w-64" : "w-0 md:w-20"
        }`}
      >
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <div
            className={`flex items-center p-4 border-b border-zinc-200 dark:border-zinc-800 ${isOpen ? "justify-between" : "justify-center"}`}
          >
            {isOpen && (
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-zinc-900">
                  <AllyLogo className="w-5 h-5" />
                </div>
                <span className="font-medium text-lg tracking-normal flex items-center text-zinc-900 dark:text-zinc-100">
                  Ally <BetaBadge />
                </span>
              </Link>
            )}
            <div className="flex items-center gap-1">
              {/* New Chat button */}
              <button
                onClick={handleNewChat}
                className="p-1.5 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
                title="New Chat"
              >
                <Plus className="w-5 h-5" />
              </button>
              {/* Toggle button for desktop */}
              <button
                onClick={onToggle}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hidden md:block"
              >
                {isOpen ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <LayoutDashboard className="w-5 h-5" />
                )}
              </button>
              {/* Close button for mobile */}
              {isOpen && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 md:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-4 space-y-2">
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

          {/* Quick Add Event Button */}
          {isOpen && (
            <div className="px-4 mt-4">
              <button
                onClick={() => setIsQuickEventOpen(true)}
                className="w-full flex items-center gap-3 p-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Quick Add Event</span>
              </button>
            </div>
          )}

          {/* Recent Chats */}
          {isOpen && (
            <div className="flex-1 mt-4 px-4 overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between mb-2 px-2">
                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Recent Chats
                </p>
              </div>

              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={localSearchValue}
                  onChange={handleSearchChange}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-8 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-md text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {localSearchValue && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {isLoadingConversations || isSearching ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse h-12 bg-zinc-100 dark:bg-zinc-800 rounded-md"
                    />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-4 text-zinc-400 dark:text-zinc-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">
                    {localSearchValue
                      ? "No matching conversations"
                      : "No conversations yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 flex-1 overflow-y-auto">
                  {conversations.slice(0, 15).map((conversation) => (
                    <div
                      key={conversation.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectConversation(conversation)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        handleSelectConversation(conversation)
                      }
                      className={`w-full text-left p-2 rounded-md transition-colors group cursor-pointer ${
                        selectedConversationId === conversation.id
                          ? "bg-zinc-100 dark:bg-zinc-800"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {conversation.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-zinc-400">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatRelativeDate(conversation.lastUpdated)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => initiateDelete(e, conversation.id)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Event Dialog */}
          <QuickEventDialog
            isOpen={isQuickEventOpen}
            onClose={() => setIsQuickEventOpen(false)}
            onEventCreated={() => {
              // Optionally refresh something after event creation
            }}
          />

          {/* Footer */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <div
              className={`flex items-center gap-2 ${!isOpen ? "md:justify-center" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <UserProfileCard isOpen={isOpen} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    suppressHydrationWarning
                  >
                    <MoreHorizontal className="w-5 h-5" />
                    <span className="sr-only">More options</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align={isOpen ? "end" : "center"}
                  className="min-w-[14rem] rounded-lg"
                >
                  {/* User Profile Section */}
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={fullName}
                          width={32}
                          height={32}
                          className="rounded-lg object-cover flex-shrink-0 h-8 w-8"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                            {initials}
                          </span>
                        </div>
                      )}
                      <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                        <span className="truncate font-medium">{fullName}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Upgrade to Pro */}
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer">
                      <Sparkles className="w-4 h-4" />
                      <span>Upgrade to Pro</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />

                  {/* Account Section */}
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer">
                      <BadgeCheck className="w-4 h-4" />
                      <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <CreditCard className="w-4 h-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />

                  {/* Settings */}
                  <DropdownMenuItem
                    id="tour-settings"
                    onClick={() => {
                      onOpenSettings();
                      onClose();
                    }}
                    className="cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>

                  {/* Log out */}
                  {onSignOut && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onSignOut}
                        className="cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
