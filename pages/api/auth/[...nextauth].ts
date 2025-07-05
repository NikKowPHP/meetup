import NextAuth, { AuthOptions } from 'next-auth'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'
import { supabase } from '../../../lib/auth/supabaseClient'

export const authOptions: AuthOptions = {
  providers: [
    // Configure authentication providers here
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  }),
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)