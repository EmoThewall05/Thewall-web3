path = "lib/supabase.ts"
with open(path) as f:
    content = f.read()

old = """  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY"""

new = """  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY"""

if old not in content:
    print("[WARN] anchor not found — file may already differ")
else:
    content = content.replace(old, new, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] fallback to SUPABASE_URL added")
