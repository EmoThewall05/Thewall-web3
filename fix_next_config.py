path = 'next.config.js'
with open(path) as f:
    content = f.read()

old = """      'porto/internal': false,
      'porto': false,
      'crypto': false,"""

new = """      'porto/internal': false,
      'porto': false,
      'crypto': false,
      '@x402/evm/upto/client': false,
      '@x402/evm/exact/client': false,
      '@x402/core/client': false,
      '@x402/svm/exact/client': false,
      '@x402/evm': false,"""

if old not in content:
    print('[WARN] target block not found - manual check needed')
elif '@x402' in content:
    print('[SKIP] already patched')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] added x402 module fallbacks to next.config.js')
