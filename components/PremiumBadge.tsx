export default function PremiumBadge({ isPremium, size = 'md' }: { isPremium: boolean; size?: 'sm' | 'md' }) {
  if (!isPremium) return null
  const pad = size === 'sm' ? '2px 8px' : '3px 10px'
  const font = size === 'sm' ? '0.62rem' : '0.7rem'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: pad,
      borderRadius: 999,
      background: 'linear-gradient(135deg, rgba(0,255,136,0.18), rgba(0,204,102,0.10))',
      border: '1px solid rgba(0,255,136,0.4)',
      color: '#00ff88',
      fontFamily: 'monospace',
      fontSize: font,
      fontWeight: 700,
      letterSpacing: '0.02em',
      boxShadow: '0 0 8px rgba(0,255,136,0.15)'
    }}>
      <span style={{fontSize: font}}>⭐</span>
      PREMIUM
    </span>
  )
}
