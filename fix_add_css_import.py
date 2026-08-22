path = 'app/layout.tsx'
with open(path) as f:
    content = f.read()

if "@account-kit/react/dist/styles.css" not in content:
    content = content.replace(
        "import './globals.css'",
        "import './globals.css'\nimport '@account-kit/react/dist/styles.css'"
    )
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] added Account Kit CSS import')
else:
    print('[SKIP] already present')
