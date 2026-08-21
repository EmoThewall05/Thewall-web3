path = 'next.config.js'
with open(path) as f:
    content = f.read()

old = "'@x402/evm': false,"
new = "'@x402/evm': false,\n      'accounts': false,"

if old not in content:
    print('[WARN] target not found')
elif "'accounts': false" in content:
    print('[SKIP] already patched')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] added accounts fallback')
