import './globals.css';
import { Inter } from 'next/font/google';
import { ReduxProvider } from '@/redux/provider';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'TeamSync',
  description: 'Team Management Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
