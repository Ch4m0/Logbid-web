'use client'
import Header from './common/components/Header'
import Sidebar from './common/components/Sidebar'
import Breadcrumb from './common/components/Breadcrumb'
import { ChatBot } from '@/src/components/ChatBot'

import useAuthStore from '@/src/store/authStore'

const LogBiddLayout = ({ children }: { children: React.ReactNode }) => {
  // Solo usamos el store, no el hook completo para evitar peticiones duplicadas
  const user = useAuthStore((state) => state.user)

  return (
    <div className="w-full h-screen overflow-hidden">
      <Sidebar />
      <div className="ml-[18rem] flex flex-col h-screen">
        <Header />
        <Breadcrumb />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
      <ChatBot />
    </div>
  )
}

export default LogBiddLayout
