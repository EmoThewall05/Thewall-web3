path = 'components/SmartWalletConnect.tsx'
with open(path) as f:
    content = f.read()

old = """  return (
    <button
      onClick={openAuthModal}"""

new = """  return (
    <button
      onClick={() => {
        try {
          openAuthModal()
        } catch (e: any) {
          alert('Smart Wallet Error: ' + (e?.message || String(e)))
        }
      }}"""

if old not in content:
    print('[WARN] target not found')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] added error alert for debugging')
