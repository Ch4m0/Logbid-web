import { ThemeProvider } from '@/src/components/theme-provider'
import { I18nProvider } from '@/src/components/I18nProvider'
import { cn } from '@/src/lib/utils'
import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import CustomDialog from './(modules)/common/components/CustomDialog'
import CustomDrawer from './(modules)/common/components/CustomDrawer'
import './globals.css'
import ReactQueryProvider from '@/src/ReactQueryProvider'
import { Toaster } from '@/src/components/ui/toaster'
import { ChatProvider } from '@/src/context/ChatContext'
import { NotificationProvider } from '@/src/components/NotificationProvider'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'LogBid',
  description: 'International logistics platform',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen h-full w-full flex flex-col items-center font-sans antialiased',
          fontSans.variable
        )}
      >
        <I18nProvider>
          <ChatProvider>
            <ReactQueryProvider>
              <NotificationProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem
                  disableTransitionOnChange
                >
                  {children}
                </ThemeProvider>
                <CustomDrawer />
                <CustomDialog />
                <Toaster />
              </NotificationProvider>
            </ReactQueryProvider>
          </ChatProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
