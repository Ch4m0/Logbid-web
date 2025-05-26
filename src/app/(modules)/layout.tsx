'use client'
import Header from './common/components/Header'
import Sidebar from './common/components/Sidebar'
import Footer from './common/components/Footer'

import useAuthStore from '@/src/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'

const LogBiddLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  return (
    <div className="w-full flex h-full min-h-screen">
      <Sidebar />
      <div className="w-full flex flex-col h-full min-h-screen">
        <Header />
        <main className="flex-1 p-8">{children}</main>
        <Footer />
      </div>
    </div>
  )
}

export default LogBiddLayout
