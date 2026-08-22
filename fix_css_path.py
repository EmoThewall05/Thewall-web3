path = 'app/layout.tsx'
with open(path) as f:
    content = f.read()

old = "import '@account-kit/react/dist/styles.css'"
new = "import '@account-kit/react/styles.css'"

if old in content:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] fixed styles.css path')
else:
    print('[SKIP] old import not found')
