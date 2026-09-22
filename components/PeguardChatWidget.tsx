'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';

type ChatMsg = { role: 'user' | 'ai'; text: string };

export default function PeguardChatWidget() {
  const { address } = useAppKitAccount();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !address || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/p2p-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address, message: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: 'ai', text: data.error || 'Something went wrong.' }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
        setRemaining(data.remaining);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Network error. Try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00e5ff, #a855f7)',
          border: 'none',
          fontSize: 26,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
        aria-label="P2P Support Chat"
      >
        🦋
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 88,
            right: 20,
            zIndex: 9999,
            width: 320,
            maxHeight: 440,
            display: 'flex',
            flexDirection: 'column',
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #00e5ff22, #a855f722)',
              borderBottom: '1px solid #333',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            🦋 P2P Support {remaining !== null && `· ${remaining} left today`}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 && (
              <p style={{ color: '#888', fontSize: 13 }}>
                Ask me anything about P2P communities, trading, or how the process works.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? '#00e5ff33' : '#a855f733',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: 12,
                  fontSize: 13,
                  maxWidth: '85%',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && <div style={{ color: '#888', fontSize: 12 }}>Thinking...</div>}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: 'flex', borderTop: '1px solid #333', padding: 8, gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={address ? 'Type a message...' : 'Connect wallet first'}
              disabled={!address || loading}
              style={{
                flex: 1,
                background: '#151515',
                border: '1px solid #333',
                borderRadius: 8,
                padding: '8px 10px',
                color: '#fff',
                fontSize: 13,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!address || loading || !input.trim()}
              style={{
                background: '#00e5ff',
                border: 'none',
                borderRadius: 8,
                padding: '0 14px',
                color: '#000',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
