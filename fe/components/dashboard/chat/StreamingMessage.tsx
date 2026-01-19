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
    <div className="flex w-full mb-2 justify-start">
      <div className="max-w-[85%] md:max-w-[75%] flex flex-col items-start">
        <div
          className="px-4 py-3 rounded-md rounded-tl-none text-sm leading-relaxed bg-background dark:bg-secondary border border-border text-foreground shadow-sm"
          dir={content ? textDirection : undefined}
        >
          {showToolIndicator && (
            <div className="flex items-center gap-3">
              {/* Mini pulsing orb with spinner */}
              <div className="relative w-6 h-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {getToolDisplayName(currentTool)}
              </span>
            </div>
          )}

          {content && (
            <div className={cn('prose prose-sm max-w-none prose-zinc dark:prose-invert', isRTL && 'text-right')}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}

          {isStreaming && content && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse rounded-sm" />}

          {isStreaming && !content && !currentTool && (
            <div className="flex items-center gap-3">
              {/* Mini pulsing orb */}
              <div className="relative w-6 h-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-primary to-orange-600 animate-pulse shadow-lg shadow-primary/40" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Ally is thinking...</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-primary/60 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-primary/60 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-1 h-1 bg-primary/60 rounded-full animate-bounce [animation-delay:0.3s]" />
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
