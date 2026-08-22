path = 'app/providers.tsx'
with open(path) as f:
    content = f.read()

old = '''        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },'''

new = '''        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },'''

if old not in content:
    print('[FAIL] block not found')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] fixed embeddedWallets config shape')
