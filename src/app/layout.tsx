import type { Metadata } from 'next';
import { ClientProviders } from './providers';
import './globals.css';
import { LayoutWrapper } from './components/layout-wrapper';

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
          <LayoutWrapper>{children}</LayoutWrapper>
        </ClientProviders>
      </body>
    </html>
  );
}
