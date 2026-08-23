path = "app/page.tsx"
with open(path) as f:
    content = f.read()

anchor = "  const [leadersLoading, setLeadersLoading] = useState(false)"
new_state = anchor + """
  const [followTarget, setFollowTarget] = useState<any>(null)
  const [followAllocation, setFollowAllocation] = useState(10)
  const [followLoading, setFollowLoading] = useState(false)
  const [followStatus, setFollowStatus] = useState('')"""

if "followTarget" in content:
    print("[SKIP] follow state already exists")
elif anchor not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(anchor, new_state, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] follow state added")
