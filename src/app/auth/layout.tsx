'use client'
import Footer from '../(modules)/common/components/Footer'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <main className="flex-1 flex justify-center">{children}</main>
      <Footer />
    </div>
  )
}

export default AuthLayout
