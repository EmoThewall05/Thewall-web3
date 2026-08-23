path = 'app/page.tsx'
with open(path) as f:
    content = f.read()

changes = []

# 1. Add state hooks after emoBalance
old1 = "  const [emoBalance, setEmoBalance] = useState(0)"
new1 = """  const [emoBalance, setEmoBalance] = useState(0)
  const [copyTradeChatLog, setCopyTradeChatLog] = useState<{role:string;content:string}[]>([])
  const [copyTradeInput, setCopyTradeInput] = useState('')
  const [copyTradeChatLoading, setCopyTradeChatLoading] = useState(false)"""

if old1 in content:
    content = content.replace(old1, new1)
    changes.append('[OK] Copy trade state hooks added')
elif 'copyTradeChatLog' in content and 'useState<{role:string' in content:
    changes.append('[SKIP] State hooks already added')
else:
    changes.append('[WARN] emoBalance state line not found')

# 2. Add sendCopyTradeMessage function after fetchEmoBalance
old2 = "  const fetchEmoBalance = useCallback(async (address: string) => {"
if old2 in content:
    func = """  const sendCopyTradeMessage = useCallback(async () => {
    const text = copyTradeInput.trim()
    if (!text || copyTradeChatLoading) return
    const newLog = [...copyTradeChatLog, { role: 'user', content: text }]
    setCopyTradeChatLog(newLog)
    setCopyTradeInput('')
    setCopyTradeChatLoading(true)
    try {
      const res = await fetch('https://thewall-copytrading.meradivin.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: newLog }),
      })
      const data = await res.json()
      setCopyTradeChatLog(prev => [...prev, { role: 'assistant', content: data.reply || "🦋 I'm here — ask me anything about copy trading!" }])
    } catch {
      setCopyTradeChatLog(prev => [...prev, { role: 'assistant', content: '🦋 My wings are resting for a moment. Please try again!' }])
    }
    setCopyTradeChatLoading(false)
  }, [copyTradeInput, copyTradeChatLog, copyTradeChatLoading])

  const fetchEmoBalance = useCallback(async (address: string) => {"""
    if 'sendCopyTradeMessage' not in content:
        content = content.replace(old2, func)
        changes.append('[OK] sendCopyTradeMessage function added')
    else:
        changes.append('[SKIP] sendCopyTradeMessage already exists')
else:
    changes.append('[WARN] fetchEmoBalance function not found')

with open(path, 'w') as f:
    f.write(content)

for c in changes:
    print(c)
