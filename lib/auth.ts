import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// ถ้ากำหนด ALLOWED_EMAILS (คั่นด้วย comma) จะอนุญาตเฉพาะอีเมลในรายการ
// ถ้าเว้นว่าง ทุกบัญชี Google เข้าสู่ระบบได้
const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  callbacks: {
    signIn({ user }) {
      if (allowedEmails.length === 0) return true;
      return !!user.email && allowedEmails.includes(user.email.toLowerCase());
    },
  },
};
