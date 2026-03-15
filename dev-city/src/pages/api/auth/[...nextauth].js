import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "MOCK_ID",
      clientSecret: process.env.GITHUB_SECRET || "MOCK_SECRET",
    }),
    CredentialsProvider({
      name: "Mock Identity",
      credentials: {
        username: { label: "GitHub Handle", type: "text", placeholder: "pixel_dev" }
      },
      async authorize(credentials) {
        if (!credentials?.username) {
          throw new Error('Username is required for mock login');
        }
        return { 
          id: "mock_" + Date.now(), 
          name: credentials.username, 
          email: `${credentials.username}@dev.city`, 
        };
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.githubUsername = profile.login;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.githubUsername = token.githubUsername;
      session.user.id = token.sub;
      return session;
    },
  },
};

export default NextAuth(authOptions);
