import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fuel Calculator',
  description:
    'Quickly estimate your fuel costs for any trip. Built with Next.js and Tailwind CSS.',
  keywords: ['fuel calculator', 'gas cost', 'Next.js app', 'vehicle fuel consumption'],
  authors: [{ name: 'Valentyna Taranchuk' }],
  icons: {
    icon: '/icon-192.png',
    shortcut: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
