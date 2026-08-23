path = "app/api/copytrade/become-leader/route.ts"
with open(path) as f:
    content = f.read()

old = """    const { wallet_address, display_name } = await req.json()

    if (!wallet_address) {
      return NextResponse.json({ error: 'wallet_address required' }, { status: 400 })
    }"""

new = """    const { wallet_address: raw_address, display_name } = await req.json()

    if (!raw_address) {
      return NextResponse.json({ error: 'wallet_address required' }, { status: 400 })
    }
    const wallet_address = raw_address.toLowerCase()"""

if old not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(old, new, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] lowercase normalization added")
