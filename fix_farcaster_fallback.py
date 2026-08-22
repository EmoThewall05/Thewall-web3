path = 'next.config.js'
with open(path) as f:
    content = f.read()

old = "'accounts': false,\n    }"
new = "'accounts': false,\n      '@farcaster/miniapp-sdk': false,\n    }"

if old not in content:
    print('[FAIL] marker not found')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] added farcaster miniapp-sdk fallback')
