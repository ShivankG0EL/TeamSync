import { createOrUpdateUser, findUserByEmail } from '../db/userModel';

export const authOptions = {
  // Configure your authentication providers here
  providers: [
    // Your providers configuration
  ],
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }) {
      // Initial sign in
      if (user) {
        // Store the id in the token
        token.id = user.id || user._id;
        token.userId = user.id || user._id; // Add another reference for clarity
        token.role = user.role || 'user';
      }
      
      // Update session
      if (trigger === 'update' && session) {
        if (session.role) token.role = session.role;
        if (session.id) token.id = session.id;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        // Explicitly set both id properties for maximum compatibility
        session.user.id = token.id || token.userId || token.sub;
        session.user.userId = token.id || token.userId || token.sub;
        session.user.role = token.role || 'user';
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        // Create or update user in database when they sign in
        if (user && user.email) {
          const dbUser = await createOrUpdateUser({
            email: user.email,
            name: user.name || profile?.name,
            image: user.image,
            provider: account?.provider ? account.provider.charAt(0).toUpperCase() + account.provider.slice(1) : undefined,
            isVerified: true
          });
          
          // Ensure the user object has an id property
          if (dbUser && !user.id) {
            user.id = dbUser._id.toString();
          }
        }
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};
