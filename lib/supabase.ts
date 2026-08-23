import { createClient } from '@supabase/supabase-js'

// Server-side admin client (service role) - use only in API routes
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      `Missing Supabase env vars: ${!url ? 'NEXT_PUBLIC_SUPABASE_URL ' : ''}${!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`.trim()
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}
