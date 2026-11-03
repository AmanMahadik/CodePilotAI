import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/supabase/auth-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'CodePilot AI — Autonomous AI Software Engineering Assistant',
  description:
    'An AI mentor that reviews student and early-career code the way a senior engineer would, at scale, with explanations attached. MIT Academy of Engineering, Pune.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-brand-600/30 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
