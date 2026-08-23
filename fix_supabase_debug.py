path = "lib/supabase.ts"
with open(path) as f:
    content = f.read()

old = """export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}"""

new = """export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      `Missing Supabase env vars: ${!url ? 'NEXT_PUBLIC_SUPABASE_URL ' : ''}${!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`.trim()
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}"""

if old not in content:
    print("[WARN] anchor not found — file may already differ")
else:
    content = content.replace(old, new, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] debug guard added")
