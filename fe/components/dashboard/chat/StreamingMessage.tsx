'use client'

import React, { useMemo } from 'react'
import { cn, getTextDirection } from '@/lib/utils'

import { Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface StreamingMessageProps {
  content: string
  currentTool: string | null
  isStreaming: boolean
}

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  parse_event_text: 'Understanding your request...',
  pre_create_validation: 'Validating event details...',
  insert_event_direct: 'Creating your event...',
  get_event_direct: 'Fetching event details...',
  update_event: 'Updating your event...',
  delete_event: 'Deleting event...',
  summarize_events: 'Summarizing events...',
  create_event_handoff: 'Processing event creation...',
  update_event_handoff: 'Processing event update...',
  delete_event_handoff: 'Processing event deletion...',
  register_user_handoff: 'Setting up your account...',
  generate_google_auth_url: 'Generating authentication link...',
}

function getToolDisplayName(tool: string): string {
  return TOOL_DISPLAY_NAMES[tool] || `Working on: ${tool.replaceAll('_', ' ')}...`
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({ content, currentTool, isStreaming }) => {
  const showToolIndicator = isStreaming && currentTool && !content
  const textDirection = useMemo(() => getTextDirection(content), [content])
  const isRTL = textDirection === 'rtl'

  return (
    <div className="mb-2 flex w-full justify-start">
      <div className="flex max-w-[85%] flex-col items-start md:max-w-[75%]">
        <div
          className="rounded-md rounded-tl-none border-border bg-background bg-secondary px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm"
          dir={content ? textDirection : undefined}
        >
          {showToolIndicator && (
            <div className="flex items-center gap-3">
              {/* Mini pulsing orb with spinner */}
              <div className="relative flex h-6 w-6 items-center justify-center">
                <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20" />
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{getToolDisplayName(currentTool)}</span>
            </div>
          )}

          {content && (
            <div className={cn('prose prose-sm prose-zinc prose-invert max-w-none', isRTL && 'text-right')}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}

          {isStreaming && content && <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-primary" />}

          {isStreaming && !content && !currentTool && (
            <div className="flex items-center gap-3">
              {/* Mini pulsing orb */}
              <div className="relative flex h-6 w-6 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                <div className="relative h-4 w-4 animate-pulse rounded-full bg-gradient-to-br from-primary to-orange-600 shadow-lg shadow-primary/40" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Ally is thinking...</span>
                <div className="flex gap-1">
                  <div className="h-1 w-1 animate-bounce rounded-full bg-primary/60" />
                  <div className="h-1 w-1 animate-bounce rounded-full bg-primary/60 [animation-delay:0.15s]" />
                  <div className="h-1 w-1 animate-bounce rounded-full bg-primary/60 [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StreamingMessage
