import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/dbConfig";
import Member from "@/lib/dbmodels/member";
import Leader from "@/lib/dbmodels/leader";
import Admin from "@/lib/dbmodels/admin";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          return null;
        }

        try {
          await connectDB();
          
          // Find user based on role
          let user;
          const { email, role } = credentials;
          
          if (role === 'member') {
            user = await Member.findOne({ email });
          } else if (role === 'leader') {
            user = await Leader.findOne({ email });
          } else if (role === 'admin') {
            user = await Admin.findOne({ email });
          }
          
          // If no user found or password doesn't match
          if (!user || !(await user.comparePassword(credentials.password))) {
            return null;
          }
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: role,
            image: user.avatar || null
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
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
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
