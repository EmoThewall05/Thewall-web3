path = "app/page.tsx"
with open(path) as f:
    content = f.read()

anchor = "  const fetchLeaders = useCallback(async () => {"

new_func = """  const followLeader = useCallback(async () => {
    if (!user?.address || !followTarget || followLoading) return
    setFollowLoading(true)
    setFollowStatus('')
    try {
      const r = await fetch('/api/copytrade/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          follower_address: user.address,
          leader_address: followTarget.wallet_address,
          allocation_pct: followAllocation,
        }),
      })
      const d = await r.json()
      if (d.error) {
        setFollowStatus('❌ ' + d.error)
      } else if (d.already_following) {
        setFollowStatus('🦋 You are already following this leader!')
      } else {
        setFollowStatus('✅ Now following! Allocation: ' + followAllocation + '%')
        fetchLeaders()
      }
    } catch {
      setFollowStatus('❌ Something went wrong. Try again.')
    }
    setFollowLoading(false)
  }, [user, followTarget, followAllocation, followLoading, fetchLeaders])

"""

if "const followLeader = useCallback" in content:
    print("[SKIP] function already exists")
elif anchor not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(anchor, new_func + anchor, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] followLeader function added")
