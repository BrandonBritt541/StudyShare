import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StudyShare - Campus Textbook & Supplies Marketplace',
  description: 'Buy and sell used textbooks and school supplies on your campus',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
