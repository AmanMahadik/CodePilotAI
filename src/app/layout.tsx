import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/supabase/auth-context';
import AppLayout from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'CodePilot AI — Engineering Workspace',
  description:
    'Autonomous AI Software Engineering Assistant with multi-agent code analysis, OWASP security scanning, and repository-grounded chat.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
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
