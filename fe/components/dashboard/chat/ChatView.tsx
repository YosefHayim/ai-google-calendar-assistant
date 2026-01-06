"use client";

import { AlertCircle } from "lucide-react";
import { Message } from "@/types";
import { MessageActions } from "./MessageActions";
import MessageBubble from "@/components/dashboard/chat/MessageBubble";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StreamingTypewriter } from "@/components/ui/streaming-typewriter";

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;
  error: string | null;
  isSpeaking: boolean;
  onResend: (text: string) => void;
  onEdit: (text: string) => void;
  onSpeak: (text: string) => void;
  onTypewriterComplete?: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  isStreaming,
  streamingMessageId,
  error,
  isSpeaking,
  onResend,
  onEdit,
  onSpeak,
  onTypewriterComplete,
  scrollRef,
}) => {
  return (
    <div className="h-full overflow-y-auto px-4 pt-24 pb-32">
      <div id="tour-chat-history overflow-y-auto h-[1000px]">
        {messages.map((msg) => {
          const isCurrentlyStreaming =
            msg.id === streamingMessageId && isStreaming;

          return (
            <div key={msg.id} className="group mb-8">
              {isCurrentlyStreaming ? (
                // Streaming message with typewriter effect
                <div className="flex w-full justify-start">
                  <div className="max-w-[85%] md:max-w-[75%] flex flex-col items-start">
                    <div className="px-4 py-3 rounded-md text-sm leading-relaxed bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none shadow-sm">
                      <StreamingTypewriter
                        text={msg.content}
                        isStreaming={isCurrentlyStreaming}
                        className="prose prose-sm max-w-none prose-zinc dark:prose-invert"
                        cursorChar="_"
                        cursorClassName="ml-0.5 text-primary animate-pulse"
                        onComplete={onTypewriterComplete}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Regular message
                <MessageBubble
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                  hideTimestamp={true}
                />
              )}
              <div
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[85%] md:max-w-[75%] w-full">
                  {!isCurrentlyStreaming && (
                    <MessageActions
                      msg={msg}
                      isSpeaking={isSpeaking}
                      onResend={onResend}
                      onEdit={onEdit}
                      onSpeak={onSpeak}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && !isStreaming && (
          <div className="flex justify-start mb-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-md rounded-tl-none shadow-sm max-w-[85%] md:max-w-[75%]">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-xs font-medium text-zinc-500 italic">
                  Ally is thinking...
                </span>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 text-red-600 px-4 py-2 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
};
