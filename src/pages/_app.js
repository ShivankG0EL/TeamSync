import { SessionProvider } from 'next-auth/react';
import { ReduxProvider } from '@/redux/provider';
import '@/styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ReduxProvider>
        <Component {...pageProps} />
      </ReduxProvider>
    </SessionProvider>
  );
}
