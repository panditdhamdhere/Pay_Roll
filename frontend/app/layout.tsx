import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Global Payroll Protocol | Decentralized Salary Streaming',
  description: 'Stream salaries globally with auto-conversion and cross-chain settlements',
  keywords: ['payroll', 'crypto', 'defi', 'salary', 'streaming', 'web3'],
  authors: [{ name: 'Global Payroll Protocol Team' }],
  openGraph: {
    title: 'Global Payroll Protocol',
    description: 'Stream salaries globally with auto-conversion and cross-chain settlements',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Payroll Protocol',
    description: 'Stream salaries globally with auto-conversion and cross-chain settlements',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}