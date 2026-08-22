path = 'components/SmartWalletConnect.tsx'
with open(path) as f:
    content = f.read()

old = '''  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy') || wallets[0]
      if (embeddedWallet?.address) {
        onConnect(embeddedWallet.address, user?.email?.address)
      }
    }
  }, [ready, authenticated, wallets, user])'''

new = '''  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy') || wallets[0]
      if (embeddedWallet?.address) {
        fetch('/api/wallet/track-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: embeddedWallet.address }),
        }).catch(() => {})
        onConnect(embeddedWallet.address, user?.email?.address)
      }
    }
  }, [ready, authenticated, wallets, user])'''

if old not in content:
    print('[FAIL] block not found')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] signup tracking added')
