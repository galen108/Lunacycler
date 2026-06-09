import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lunacycler — Lunar-Entrained Sleep',
  description: 'A phenomenological and chronobiological model of lunar-entrained sleep, based on research by Galen Tenney / Auralicode LLC.',
  keywords: ['sleep tracking', 'lunar cycle', 'chronobiology', 'circadian rhythm', 'moon phases'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
