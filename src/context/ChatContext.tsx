'use client'

import React, { createContext, useContext, useState } from 'react'
import { Message, ChatContextType } from '@/src/types/chat'
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState('')

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      createdAt: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are Leo, LogBid's AI logistics expert. You have years of experience in international logistics and freight forwarding.
            Your personality is professional, friendly, and solution-oriented. You always introduce yourself as Leo from LogBid.
            
            You help users with:
            - Understanding shipping routes and options
            - Explaining logistics terms and documentation
            - Providing cost estimates and timeframes
            - Answering questions about customs and regulations
            - Helping with the bidding process
            
            Be professional but friendly. Keep responses concise but informative.
            If you're not sure about specific prices or times, say so and provide general guidance instead.
            
            Always maintain a helpful and knowledgeable tone while being approachable and clear in your explanations.`
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: "user",
            content: input
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      const assistantMessage: Message = {
        id: uuidv4(),
        content: response.choices[0].message.content || 'I apologize, I could not generate a response.',
        role: 'assistant',
        createdAt: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: uuidv4(),
        content: 'I apologize, but I encountered an error. Please try again.',
        role: 'assistant',
        createdAt: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        input,
        setInput,
        handleSubmit,
        handleInputChange
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 