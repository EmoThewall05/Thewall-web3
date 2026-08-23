path = 'app/page.tsx'
with open(path) as f:
    lines = f.readlines()

func = '''  const sendCopyTradeMessage = useCallback(async () => {
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
      setCopyTradeChatLog(prev => [...prev, { role: 'assistant', content: data.reply || "\\ud83e\\udd8b I'm here \\u2014 ask me anything about copy trading!" }])
    } catch {
      setCopyTradeChatLog(prev => [...prev, { role: 'assistant', content: '\\ud83e\\udd8b My wings are resting for a moment. Please try again!' }])
    }
    setCopyTradeChatLoading(false)
  }, [copyTradeInput, copyTradeChatLog, copyTradeChatLoading])

'''

# Insert before line 333 (index 332)
target_idx = None
for i, line in enumerate(lines):
    if 'const fetchEmoBalance = useCallback' in line:
        target_idx = i
        break

if target_idx is None:
    print('[WARN] target line not found')
elif any('sendCopyTradeMessage' in l and 'useCallback' in l for l in lines):
    print('[SKIP] function already exists')
else:
    lines.insert(target_idx, func)
    with open(path, 'w') as f:
        f.writelines(lines)
    print('[OK] sendCopyTradeMessage function inserted before fetchEmoBalance')
