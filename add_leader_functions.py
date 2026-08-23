path = "app/page.tsx"
with open(path) as f:
    content = f.read()

anchor = "  const sendCopyTradeMessage = useCallback(async () => {"

new_funcs = """  const becomeLeader = useCallback(async () => {
    if (!user?.address || becomeLeaderLoading) return
    setBecomeLeaderLoading(true)
    setBecomeLeaderStatus('')
    try {
      const r = await fetch('/api/copytrade/become-leader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: user.address, display_name: becomeLeaderName.trim() || null }),
      })
      const d = await r.json()
      if (d.error) {
        setBecomeLeaderStatus('❌ ' + d.error)
      } else if (d.already_leader) {
        setBecomeLeaderStatus('👑 You are already a Leader!')
      } else {
        setBecomeLeaderStatus('✅ You are now a Copy Trading Leader!')
      }
    } catch {
      setBecomeLeaderStatus('❌ Something went wrong. Try again.')
    }
    setBecomeLeaderLoading(false)
  }, [user, becomeLeaderName, becomeLeaderLoading])

  const fetchLeaders = useCallback(async () => {
    setLeadersLoading(true)
    try {
      const r = await fetch('/api/copytrade/leaders')
      const d = await r.json()
      setLeadersList(d.leaders || [])
    } catch {
      setLeadersList([])
    }
    setLeadersLoading(false)
  }, [])

"""

if "const becomeLeader = useCallback" in content:
    print("[SKIP] functions already exist")
elif anchor not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(anchor, new_funcs + anchor, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] becomeLeader + fetchLeaders functions added")
