path = "app/page.tsx"
with open(path) as f:
    content = f.read()

anchor = "  const [copyTradeChatLoading, setCopyTradeChatLoading] = useState(false)"
new_state = anchor + """
  const [becomeLeaderOpen, setBecomeLeaderOpen] = useState(false)
  const [becomeLeaderName, setBecomeLeaderName] = useState('')
  const [becomeLeaderLoading, setBecomeLeaderLoading] = useState(false)
  const [becomeLeaderStatus, setBecomeLeaderStatus] = useState('')
  const [browseLeadersOpen, setBrowseLeadersOpen] = useState(false)
  const [leadersList, setLeadersList] = useState<any[]>([])
  const [leadersLoading, setLeadersLoading] = useState(false)"""

if "becomeLeaderOpen" in content:
    print("[SKIP] state already exists")
elif anchor not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(anchor, new_state, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] leader state added")
