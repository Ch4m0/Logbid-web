'use client'

import { useState } from 'react'
import { useChat } from '@/src/context/ChatContext'
import { Message } from '@/src/types/chat'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Bot, X, Send, Loader2, MessageCircle, MessagesSquare } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, isLoading, input, handleSubmit, handleInputChange } = useChat()

  const MessageComponent = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user'
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div
          className={`max-w-[80%] p-4 rounded-lg ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <div className={`prose ${isUser ? 'text-white' : 'text-gray-800'} max-w-none`}>
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-4 right-4">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 relative"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <div className="relative">
              <Bot className="h-6 w-6" />
              <MessagesSquare className="h-3 w-3 absolute -top-1 -right-1 text-white animate-pulse" />
            </div>
          )}
        </Button>
        {!isOpen && (
          <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
            <span className="text-white text-xs">AI</span>
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-96 h-[600px] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
            <h2 className="text-lg font-semibold">Leo - LogBid Assistant</h2>
            <p className="text-sm text-blue-100">Your logistics expert, ready to help!</p>
            <p className="text-xs text-blue-200 mt-1">Powered by DeepSeek AI</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-4">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Hi! I&apos;m Leo, your LogBid logistics expert powered by DeepSeek AI. How can I assist you with your shipping needs today?
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageComponent key={message.id} message={message} />
              ))
            )}
            {isLoading && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
            <div className="flex space-x-2">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 min-h-[44px] max-h-32 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e as any)
                  }
                }}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-11 w-11 rounded-lg flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  )
} 