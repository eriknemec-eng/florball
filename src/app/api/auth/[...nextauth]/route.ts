import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb, saveDb } from '@/lib/db';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'E-mail a heslo',
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Heslo", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const db = await getDb();
        let user = db.users.find(u => u.email === credentials.email);
        
        if (user) {
          if (user.passwordHash) {
             const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
             if (isValid) {
                 return { id: user.uid, email: user.email, name: user.name };
             }
             throw new Error("Špatné heslo");
          } else {
             // Ošetření jen a pouze tvé defaultní email adresy
             if (user.email === 'erik.nemec@me.com' && !user.passwordHash) {
                user.passwordHash = await bcrypt.hash(credentials.password, 10);
                await saveDb(db);
                return { id: user.uid, email: user.email, name: user.name };
             }
             throw new Error("Uživatel s tímto heslem nemá účet nebo se hlásí jinak.");
          }
        } else {
          throw new Error("Uživatel nenalezen. Zaregistrujte se prosím.");
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (!user.email) return false;
      
      const db = await getDb();
      let dbUser = db.users.find(u => u.email === user.email);
      let isNew = false;
      
      if (!dbUser) {
         dbUser = {
            uid: user.id || Math.random().toString(36).slice(2),
            email: user.email,
            name: user.name || user.email.split('@')[0],
            role: user.email === 'erik.nemec@me.com' ? 'admin' : 'player',
            isSubscriber: false,
            hasPaid: false,
            position: 'player'
         };
         db.users.push(dbUser);
         isNew = true;
      } else {
         // Auto upgrade na admina pokud to je správný mail
         if (dbUser.email === 'erik.nemec@me.com' && dbUser.role !== 'admin') {
            dbUser.role = 'admin';
            isNew = true;
         }
      }
      
      if (isNew) {
         await saveDb(db);
      }
      
      return true;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback_secret_pro_testovani_vyvoje'
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
