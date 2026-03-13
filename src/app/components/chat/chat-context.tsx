'use client';

import React, { createContext, useContext } from 'react';
import type { Message } from '@/app/components/chat/use-chat';

interface ChatContextType {
  messages: Message[];
}

const ChatContext = createContext<ChatContextType | null>(null);

interface ChatProviderProps {
  messages: Message[];
  children: React.ReactNode;
}

export function ChatProvider({ messages, children }: ChatProviderProps) {
  return <ChatContext.Provider value={{ messages }}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
