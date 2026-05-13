import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ClientShell } from './client-shell';

export const metadata: Metadata = {
  title: 'contextella · 관계의 결',
  description: 'read the grain of relationships',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1A2A6B',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
