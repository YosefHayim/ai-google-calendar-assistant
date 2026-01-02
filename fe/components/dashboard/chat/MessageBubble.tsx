
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Role } from '@/types';

interface MessageBubbleProps {
  role: Role;
  content: string;
  timestamp: Date;
  hideTimestamp?: boolean; // Added to allow handling timestamp externally for custom layouts
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content, timestamp, hideTimestamp }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-3 rounded-md text-sm leading-relaxed transition-all duration-200
            ${isUser 
              ? 'bg-primary text-white rounded-tr-none shadow-md' 
              : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none shadow-sm'
            }`}
        >
          <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-zinc dark:prose-invert'}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
        {!hideTimestamp && (
          <span className="text-[10px] text-zinc-400 mt-1 px-1">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
