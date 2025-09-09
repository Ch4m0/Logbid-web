'use client'
import Header from './common/components/Header'
import Sidebar from './common/components/Sidebar'
import Breadcrumb from './common/components/Breadcrumb'
import { ChatBot } from '@/src/components/ChatBot'
import { useState } from 'react'
import useAuthStore from '@/src/store/authStore'

const LogBiddLayout = ({ children }: { children: React.ReactNode }) => {
  // Solo usamos el store, no el hook completo para evitar peticiones duplicadas
  const user = useAuthStore((state) => state.user)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="lg:ml-[16rem] flex flex-col h-screen transition-all duration-300">
        <Header onToggleSidebar={toggleSidebar} />
        <Breadcrumb />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <ChatBot />
    </div>
  )
}

export default LogBiddLayout
