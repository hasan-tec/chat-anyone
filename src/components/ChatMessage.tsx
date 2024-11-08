import React from 'react';
import { User } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isCurrentUser: boolean;
  timestamp: string;
}

export function ChatMessage({ message, isCurrentUser, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2 rounded-2xl max-w-md break-words ${
            isCurrentUser
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
              : 'bg-white text-gray-800'
          }`}
        >
          {message}
        </div>
        <span className="text-xs text-gray-500 mt-1">{timestamp}</span>
      </div>
    </div>
  );
}