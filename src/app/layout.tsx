import type { Metadata } from 'next';
import { ClientProviders } from './providers';
import './globals.css';
import { Header } from './components/header';

export const metadata: Metadata = {
  title: 'AI Chat Assistant - Instacart',
  description: 'AI-powered chat interface built with Next.js 15 and OpenAI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <Header />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
