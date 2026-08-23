path = "app/providers.tsx"
with open(path) as f:
    content = f.read()

old = """        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },"""

new = """        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },"""

if "solana:" in content and "createOnLogin" in content.split("solana:")[1][:100]:
    print("[SKIP] solana embedded wallet config already exists")
elif old not in content:
    print("[WARN] anchor not found — file may already differ")
else:
    content = content.replace(old, new, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] solana embedded wallet config added")
