export type Role = 'user' | 'assistant'

export interface Message {
  id: string
  content: string
  role: Role
  createdAt: Date
}

export interface ChatContextType {
  messages: Message[]
  isLoading: boolean
  input: string
  setInput: (input: string) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
} 