'use client'
import Header from './common/components/Header'
import Sidebar from './common/components/Sidebar'
import Footer from './common/components/Footer'
import { ChatBot } from '@/src/components/ChatBot'
import { useAuth } from '@/src/hooks/useAuth'

const LogBiddLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()

  return (
    <div className="w-full flex h-full min-h-screen">
      <Sidebar />
      <div className="w-full flex flex-col h-full min-h-screen">
        <Header />
        <main className="flex-1 p-8">{children}</main>
        <Footer />
      </div>
      <ChatBot />
    </div>
  )
}

export default LogBiddLayout
