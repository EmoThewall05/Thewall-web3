import re

path = "components/EmowallButterfly.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add useAppKitAccount import
old_import = "import { useEffect, useRef, useState } from 'react'"
new_import = old_import + "\nimport { useAppKitAccount } from '@reown/appkit/react'"
if old_import not in content:
    raise SystemExit("❌ import line not found — file maybe changed")
content = content.replace(old_import, new_import, 1)

# 2. Add isConnected hook right after component function opens
old_fn = "export default function EmowallButterfly() {\n  const bfRef   = useRef<HTMLDivElement>(null)"
new_fn = "export default function EmowallButterfly() {\n  const { isConnected } = useAppKitAccount()\n  const bfRef   = useRef<HTMLDivElement>(null)"
if old_fn not in content:
    raise SystemExit("❌ function-open block not found — file maybe changed")
content = content.replace(old_fn, new_fn, 1)

# 3. Guard sendMsg() with login check
old_send = """  async function sendMsg() {
    const val=input.trim(); if (!val) return
    setInput('')
    setMsgs(p=>[...p,{role:'user',text:val}])
    setMsgs(p=>[...p,{role:'ai',text:'🦋 thinking...'}])"""

new_send = """  async function sendMsg() {
    const val=input.trim(); if (!val) return
    if (!isConnected) {
      setInput('')
      setMsgs(p=>[...p,{role:'user',text:val},{role:'ai',text:'🦋 Please connect your wallet first — tap Sign Up / Login to chat with me!'}])
      return
    }
    setInput('')
    setMsgs(p=>[...p,{role:'user',text:val}])
    setMsgs(p=>[...p,{role:'ai',text:'🦋 thinking...'}])"""

if old_send not in content:
    raise SystemExit("❌ sendMsg block not found — file maybe changed")
content = content.replace(old_send, new_send, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Patch applied successfully to", path)
