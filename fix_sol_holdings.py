path = "app/page.tsx"
with open(path) as f:
    content = f.read()

old = "{TOKENS.filter(t=>t.symbol!=='SOL'&&['ETH','ARB','MON','BASE','EMC'].includes(t.symbol)).map(token=>"
new = "{TOKENS.filter(t=>['ETH','SOL','ARB','MON','BASE','EMC'].includes(t.symbol)).map(token=>"

if new in content:
    print("[SKIP] already updated")
elif old not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(old, new, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] SOL added to Top Holdings list")
