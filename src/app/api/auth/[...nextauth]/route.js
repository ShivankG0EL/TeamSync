import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { createOrUpdateUser, checkUserLoginType } from '@/lib/db/models/userModel';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (!profile?.email) {
        return false;
      }

      try {
        const { exists, type } = await checkUserLoginType(profile.email);
        const currentProvider = account.provider.charAt(0).toUpperCase() + account.provider.slice(1);

        // If user exists and trying to login with different provider
        if (exists && type !== 'Unknown' && type !== currentProvider) {
          return `/?error=wrong_provider&provider=${type}&email=${encodeURIComponent(profile.email)}`;
        }

        await createOrUpdateUser({
          email: profile.email,
          name: user.name,
          image: user.image,
          provider: currentProvider
        });
        return true;
      } catch (error) {
        console.error('Error in signIn:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/user/calendar')) {
        return `${baseUrl}${url}`;
      }
      return `${baseUrl}/user/calendar`;
    },
  },
});

export { handler as GET, handler as POST };
