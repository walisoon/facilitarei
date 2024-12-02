import { Metadata } from 'next'
import { ClientLayout } from './layout-client'
import './globals.css'

export const metadata: Metadata = {
  title: 'Facilita Cred',
  description: 'Sistema para gestão de crédito e clientes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <ClientLayout>{children}</ClientLayout>
    </html>
  )
}
