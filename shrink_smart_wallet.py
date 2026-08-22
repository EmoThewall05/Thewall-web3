path = 'app/page.tsx'
with open(path) as f:
    content = f.read()

old = "<div style={{marginBottom:6,padding:1,borderRadius:10,border:'1px solid rgba(0,255,136,0.35)',background:'rgba(0,255,136,0.05)'}}>"
new = "<div style={{marginBottom:6,padding:'10px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#00ff88,#00b368)',boxShadow:'0 0 20px rgba(0,255,136,0.25)'}}>"

if old not in content:
    print('[WARN] target block not found - manual check needed')
elif new in content:
    print('[SKIP] already patched')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] SmartWalletConnect wrapper styled to match SIGN UP/LOGIN button look')
