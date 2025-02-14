import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';

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
    async signIn({ account, profile }) {
      if (!profile?.email) {
        return false;
      }
      return true;
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
