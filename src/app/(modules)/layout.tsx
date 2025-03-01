'use client'
import Header from './common/components/Header'
import Sidebar from './common/components/Sidebar'

import useAuthStore from '@/src/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'

const LogBiddLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  return (
    <div className="w-full flex h-full">
      <Sidebar />
      <div className=" w-full flex flex-col h-full">
        <Header />
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}

export default LogBiddLayout
