path = 'components/SmartWalletConnect.tsx'
with open(path) as f:
    content = f.read()

old = """      style={{
        width: '100%',
        padding: '14px',
        borderRadius: 12,
        fontWeight: 700,
        border: '1px solid #00ff8855',
        background: '#00ff8811',
        color: '#00ff88',
        cursor: 'pointer',
        marginTop: 10,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.82rem'
      }}"""

new = """      style={{
        width: '100%',
        padding: '10px',
        borderRadius: 10,
        fontWeight: 700,
        border: 'none',
        background: 'transparent',
        color: '#0a1a10',
        cursor: 'pointer',
        marginTop: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.82rem'
      }}"""

if old not in content:
    print('[WARN] target block not found - manual check needed')
elif new in content:
    print('[SKIP] already patched')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] SmartWalletConnect text made black + padding tightened')
