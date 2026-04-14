'use client'

import { useState, useRef, useEffect } from 'react'

export default function EmowallChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages }),
      })

      const data = await response.json()
      
      // AI മറുപടി വരുന്നു 🦋
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Shields are flickering. Try again! 🦋" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#07080B] text-white p-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-[#FF5500] text-center mt-10 animate-pulse">
            Butterfly Guard Active. Ask me about your wallet! 🦋
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-[#FF5500]/20 ml-auto border-r-2 border-[#FF5500]' : 'bg-white/5 mr-auto border-l-2 border-white/20'}`}>
            <p className="text-sm">{m.content}</p>
          </div>
        ))}
        {loading && <div className="text-xs text-gray-500 animate-bounce">Scanning... 🦋</div>}
      </div>
      
      <div className="flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask Emowall AI..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 outline-none focus:border-[#FF5500]/50"
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          className="bg-[#FF5500] p-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
        >
          🦋
        </button>
      </div>
    </div>
  )
}
