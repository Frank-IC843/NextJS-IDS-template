import type { Metadata } from 'next';
import { ClientProviders } from './providers';
import './globals.css';
import { LayoutWrapper } from '@/app/components/layout/layout-wrapper';
import { OrderGuideNotifications } from '@/app/components/ui/order-guide-notification';

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
          <OrderGuideNotifications />
        </ClientProviders>
      </body>
    </html>
  );
}
