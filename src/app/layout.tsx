
import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'MILK',
  description: 'MILK: Market Insight, Liquidity & Knowledge. Modern trading dashboard by Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const heads = headers();
  const pathname = heads.get('x-next-pathname');
  const isLandingPage = pathname === '/';

  return (
    <html lang="en" className={isLandingPage ? '' : 'dark'}>
      <body className="font-body antialiased">
        <SidebarProvider>
          {children}
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
