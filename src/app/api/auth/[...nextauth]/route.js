import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/dbConfig";
import Member from "@/lib/dbmodels/member";
import Leader from "@/lib/dbmodels/leader";
import Admin from "@/lib/dbmodels/admin";

const findUserByRole = async (email, role) => {
  let user = null;
  
  switch(role) {
    case "member":
      user = await Member.findOne({ email });
      break;
    case "leader":
      user = await Leader.findOne({ email });
      break;
    case "admin":
      user = await Admin.findOne({ email });
      break;
    default:
      throw new Error("Invalid role");
  }
  
  return user;
};

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        await connectDB();
        
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          throw new Error("Missing required credentials");
        }
        
        const user = await findUserByRole(credentials.email, credentials.role);
        
        if (!user) {
          throw new Error("User not found");
        }
        
        const isPasswordValid = await user.comparePassword(credentials.password);
        
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }
        
        // Update last login time
        user.lastLogin = new Date();
        await user.save();
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: credentials.role,
          company: user.company?.toString()
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.company = user.company;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.company = token.company;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
