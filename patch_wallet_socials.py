#!/usr/bin/env python3
"""
TheWall Web3 - Restore email/social login in AppKit config
Run this from ~/Thewall-web3
"""

path = 'app/context/wallet.tsx'

with open(path) as f:
    content = f.read()

old_block = """    themeMode: 'dark',
    themeVariables: { '--w3m-accent': '#FF5500' },
  })"""

new_block = """    themeMode: 'dark',
    themeVariables: { '--w3m-accent': '#FF5500' },
    features: {
      email: true,
      socials: ['google', 'x', 'discord', 'github', 'apple'],
      emailShowWallets: true,
    },
  })"""

if "features:" in content and "socials:" in content:
    print("[SKIP] features/socials config already present - no changes made")
elif old_block not in content:
    print("[WARN] target block not found - manual check needed, no changes made")
else:
    content = content.replace(old_block, new_block)
    with open(path, 'w') as f:
        f.write(content)
    print("[OK] restored email + social login (Google, X, Discord, GitHub, Apple) in wallet.tsx")
