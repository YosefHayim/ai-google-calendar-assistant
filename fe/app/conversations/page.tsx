"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { useState } from "react";

// Mock conversation data - in production, this would come from an API
const mockConversations = [
  {
    id: "1",
    query: "What meetings do I have today?",
    response: "You have 3 meetings scheduled for today...",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "2",
    query: "Schedule a meeting with John tomorrow at 2 PM",
    response: "I've scheduled a meeting with John for tomorrow at 2:00 PM...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "3",
    query: "Who is Tyler Durden?",
    response: "Tyler Durden is a fictional character from the novel and film 'Fight Club'...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

export default function ConversationsPage() {
  const { isOpen, isMobile } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const filteredConversations = mockConversations.filter(
    (conv) => conv.query.toLowerCase().includes(searchQuery.toLowerCase()) || conv.response.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = mockConversations.find((c) => c.id === selectedConversation);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className={cn("flex-1 overflow-y-auto", !isMobile && isOpen && "ml-64")}>
        <div className="container mx-auto max-w-7xl space-y-6 p-6">
          <div>
            <h1 className="text-3xl font-bold">Conversations</h1>
            <p className="text-muted-foreground">View and manage your past conversations with CAL AI</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Conversation List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>

              <div className="space-y-2">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <Card
                      key={conversation.id}
                      className={cn("cursor-pointer transition-colors hover:bg-accent", selectedConversation === conversation.id && "border-primary bg-accent")}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{conversation.query}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{formatTimestamp(conversation.timestamp)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement delete
                              alert("Delete functionality coming soon");
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No conversations found</p>
                      {searchQuery && <p className="text-sm mt-2">Try a different search term</p>}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Conversation Details */}
            <div className="lg:col-span-2">
              {selectedConv ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Conversation Details</CardTitle>
                        <CardDescription>{formatTimestamp(selectedConv.timestamp)}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // TODO: Implement delete
                          alert("Delete functionality coming soon");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Your Query</h3>
                      <p className="rounded-lg bg-muted p-3">{selectedConv.query}</p>
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">AI Response</h3>
                      <p className="rounded-lg bg-muted p-3">{selectedConv.response}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <MessageSquare className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm mt-2">Choose a conversation from the list to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
