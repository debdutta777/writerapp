import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Writer Website',
  description: 'A platform for writers to create and share their novels',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <footer className="bg-gray-800 text-white py-6 text-center">
              <p>&copy; {new Date().getFullYear()} Writer Website. All rights reserved.</p>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
