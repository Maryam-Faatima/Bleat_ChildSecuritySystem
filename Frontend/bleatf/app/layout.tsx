import type { Metadata } from 'next';
import { AuthProvider } from './context/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bleat - Child Security System',
  description: 'Keep your children safe with Bleat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
