import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    // Cada requisição que passa pelo middleware renova a sessão por mais
    // 4h a partir de agora; sem nenhuma requisição por 4h, o token expira
    // e a próxima visita exige login de novo.
    maxAge: 4 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "STUDENT";
      }
      return session;
    },
  },
};
