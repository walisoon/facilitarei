import { Metadata } from 'next'
import { ClientLayout } from './layout-client'
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css'

export const metadata: Metadata = {
  title: 'Facilita Cred | Sistema de Correspondente Bancário',
  description: 'Sistema de gestão para correspondentes bancários - Facilita Cred',
  icons: {
    icon: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="h-full bg-gray-50">
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
