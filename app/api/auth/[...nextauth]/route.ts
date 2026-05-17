import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Моковые данные для защиты и MVP презентации
        if (
          credentials?.username === "admin" &&
          credentials?.password === "admin"
        ) {
          return {
            id: "1",
            name: "Комплаенс Офицер",
            email: "admin@university.edu",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-key-change-in-prod",
});

export { handler as GET, handler as POST };
