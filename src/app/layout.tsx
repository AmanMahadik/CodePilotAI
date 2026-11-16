import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/supabase/auth-context';
import AppLayout from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'CodePilot AI — Engineering Workspace',
  description:
    'Autonomous AI Software Engineering Assistant built for MIT Academy of Engineering, Pune. Aman Atmaram Mahadik (PRN: 202502100006, Roll No: 68, Batch B3).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-[#e6edf3] font-sans antialiased">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
