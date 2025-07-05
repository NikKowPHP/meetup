import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'
import { supabase } from '../../../lib/auth/supabaseClient'

export default NextAuth({
  providers: [
    // Configure authentication providers here
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  }),
  secret: process.env.NEXTAUTH_SECRET,
})