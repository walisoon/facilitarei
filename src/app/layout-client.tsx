'use client';

import { Inter } from 'next/font/google'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'
import { PageProvider } from '@/contexts/page-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

function RootLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className={cn(
        "transition-all duration-300",
        isOpen ? "lg:pl-64" : "lg:pl-20"
      )}>
        <Navbar />
        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900`}>
      <ThemeProvider>
        <SidebarProvider>
          <PageProvider>
            <RootLayoutContent>
              {children}
            </RootLayoutContent>
          </PageProvider>
        </SidebarProvider>
      </ThemeProvider>
    </body>
  );
}
