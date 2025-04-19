import connectDB from '@/lib/dbConfig';
import Admin from '@/lib/dbmodels/admin';
import Leader from '@/lib/dbmodels/leader';
import Member from '@/lib/dbmodels/member';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          await connectDB();
          
          // Try to find user in all collections
          let user = null;
          let role = '';
          
          // Check Admin collection
          user = await Admin.findOne({ email: credentials.email });
          if (user) role = 'admin';
          
          // Check Leader collection if not found in Admin
          if (!user) {
            user = await Leader.findOne({ email: credentials.email });
            if (user) role = 'leader';
          }
          
          // Check Member collection if not found in Leader
          if (!user) {
            user = await Member.findOne({ email: credentials.email });
            if (user) role = 'member';
          }
          
          // Return null if user not found
          if (!user) {
            console.log('User not found');
            return null;
          }
          
          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            console.log('Invalid password');
            return null;
          }
          
          console.log(`User authenticated: ${user.name}, role: ${role}`);
          
          // Return user object for JWT token
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: role
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
};
