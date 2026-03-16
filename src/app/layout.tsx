import type { Metadata } from 'next';
import { ClientProviders } from './providers';
import './globals.css';
import { LayoutWrapper } from '@/app/components/layout/layout-wrapper';

export const metadata: Metadata = {
  title: 'Instacart Business Dashboard',
  description: 'Dashboard-first Instacart Business prototype built with Next.js and IDS components.',
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
