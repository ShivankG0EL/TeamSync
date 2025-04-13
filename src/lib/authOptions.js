import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createOrUpdateUser, checkUserLoginType, getUserRole, findUserByEmail } from '@/lib/db/userModel';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await findUserByEmail(credentials.email);
          
          // Check if user exists
          if (!user || !user.password) {
            return null;
          }
          
          // Check if email is verified
          if (!user.isVerified) {
            throw new Error('Email not verified. Please verify your email before logging in.');
          }
          
          // Check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role
          };
        } catch (error) {
          console.error('Error in authorize:', error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account.provider === 'credentials') {
        return true;
      }
      
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
          provider: currentProvider,
          isVerified: true // OAuth users are considered verified
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
    async session({ session, token }) {
      // Add user role to the session
      if (session?.user?.email) {
        try {
          const userRole = await getUserRole(session.user.email);
          session.user.role = userRole || 'user';
        } catch (error) {
          console.error('Error fetching user role for session:', error);
          session.user.role = 'user'; // Default fallback
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
