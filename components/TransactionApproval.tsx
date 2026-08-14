'use client'

import { useState, useEffect } from 'react'

interface Props {
  txId: string
  amount?: string
  to?: string
  email?: string
  onApproved: () => void
  onRejected: () => void
}

type Layer = 'totp' | 'phone' | 'email_otp' | 'biometric' | 'done'

export default function TransactionApproval({
  txId,
  amount,
  to,
  email,
  onApproved,
  onRejected,
}: Props) {
  const [layer, setLayer] = useState<Layer>('totp')
  const [totp, setTotp] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [phoneStatus, setPhoneStatus] = useState<'waiting' | 'approved' | 'rejected'>('waiting')
  const [hasBiometric, setHasBiometric] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(60)

  // 1. ബയോമെട്രിക് ഉണ്ടോ എന്ന് ചെക്ക് ചെയ്യുന്നു
  useEffect(() => {
    const checkBiometric = async () => {
      const available = await window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.()
      setHasBiometric(!!available)
    }
    checkBiometric()
  }, [])

  // 2. ട്രാൻസാക്ഷൻ റിക്വസ്റ്റ് ഉണ്ടാക്കുന്നു
  useEffect(() => {
    fetch('/api/auth/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txId, action: 'create', email, amount, to }),
    })
  }, [txId, email, amount, to])

  // 3. ഫോൺ അപ്രൂവലിന് വേണ്ടി പോളിംഗ് നടത്തുന്നു
  useEffect(() => {
    if (layer !== 'phone') return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/approve?txId=${txId}`)
        const data = await res.json()
        if (data.status === 'approved') {
          setPhoneStatus('approved')
          clearInterval(interval)
          setTimeout(() => {
            if (email) sendEmailOtp()
            setLayer('email_otp')
          }, 800)
        } else if (data.status === 'rejected') {
          onRejected()
        }
      } catch {}
    }, 2000)
    return () => clearInterval(interval)
  }, [layer, txId])

  const sendEmailOtp = async () => {
    try {
      await fetch('/api/auth/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'send_email_otp', email }),
      })
      setOtpSent(true)
    } catch {}
  }

  const handleTotp = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'totp', token: totp }),
      })
      const data = await res.json()
      if (data.valid) setLayer('phone')
      else setError('Invalid Authenticator Code 🦋')
    } catch {
      setError('Verification failed')
    }
    setLoading(false)
  }

  const handleEmailOtp = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'verify_email_otp', email, token: emailOtp }),
      })
      const data = await res.json()
      if (data.valid) {
        if (hasBiometric) setLayer('biometric')
        else { setLayer('done'); onApproved() }
      } else setError('Invalid Email OTP 🦋')
    } catch {
      setError('Email verification failed')
    }
    setLoading(false)
  }

  // 🚀 ബയോമെട്രിക് ലോജിക് (WebAuthn) - backend verify ചെയ്യുന്ന version
  const handleBiometric = async () => {
    setLoading(true)
    setError('')
    try {
      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required",
          rpId: window.location.hostname
        }
      }) as PublicKeyCredential | null

      if (!credential) {
        setError('Biometric verification cancelled. 🦋')
        setLoading(false)
        return
      }

      // Credential response backend-ലേക്ക് അയക്കുന്നു - server verify ചെയ്യും
      const assertionResponse = credential.response as AuthenticatorAssertionResponse
      const res = await fetch('/api/auth/webauthn-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txId,
          credentialId: credential.id,
          authenticatorData: Array.from(new Uint8Array(assertionResponse.authenticatorData)),
          clientDataJSON: Array.from(new Uint8Array(assertionResponse.clientDataJSON)),
          signature: Array.from(new Uint8Array(assertionResponse.signature)),
        }),
      })
      const data = await res.json()

      if (data.valid) {
        setLayer('done')
        setTimeout(() => onApproved(), 1000)
      } else {
        setError('Biometric verification failed. 🦋')
      }
    } catch (err: any) {
      console.error(err)
      setError('Biometric verification failed. Please try again. 🦋')
    }
    setLoading(false)
  }

  const s: Record<string, React.CSSProperties> = {
    wrap: { background: '#070d14', border: '1px solid rgba(0,179,247,0.3)', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%', fontFamily: 'monospace', color: '#e8f4fd' },
    title: { color: '#00b3f7', fontSize: '0.85rem', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 700 },
    step: { fontSize: '0.62rem', color: 'rgba(232,244,253,0.3)', marginBottom: 16 },
    info: { background: '#0c1520', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.72rem' },
    row: { display: 'flex', justifyContent: 'space-between', padding: '4px 0' },
    input: { width: '100%', padding: '12px', background: '#0c1520', border: '1px solid rgba(0,179,247,0.3)', borderRadius: 8, color: '#e8f4fd', fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '0.3em', textAlign: 'center', outline: 'none', marginBottom: 12 },
    btn: { width: '100%', padding: 13, background: '#00b3f7', border: 'none', borderRadius: 8, color: '#000', fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' },
    btnRed: { width: '100%', padding: 12, background: 'transparent', border: '1px solid rgba(255,68,102,0.4)', borderRadius: 8, color: '#ff4466', fontFamily: 'monospace', cursor: 'pointer', marginTop: 8, fontSize: '0.82rem' },
    error: { color: '#ff4466', fontSize: '0.72rem', textAlign: 'center', marginTop: 8 },
    layers: { display: 'flex', gap: 4, marginBottom: 16 },
    layerDotBase: { flex: 1, height: 3, borderRadius: 2 }
  }

  const currentIndex = { totp: 0, phone: 1, email_otp: 2, biometric: 3, done: 4 }[layer]

  return (
    <div style={s.wrap}>
      {/* പ്രോഗ്രസ് ബാർ */}
      <div style={s.layers}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ ...s.layerDotBase, background: i < currentIndex ? '#00ff88' : i === currentIndex ? '#00b3f7' : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>

      <div style={s.info}>
        <div style={s.row}><span>Amount</span><span>{amount || '0.00'}</span></div>
        <div style={s.row}><span>To</span><span>{to?.slice(0, 6)}...{to?.slice(-4)}</span></div>
      </div>

      {layer === 'totp' && (
        <>
          <div style={s.title}>🔢 LAYER 1 · AUTHENTICATOR</div>
          <input style={s.input} type="text" maxLength={6} value={totp} onChange={(e) => setTotp(e.target.value)} placeholder="000000" />
          <button style={s.btn} onClick={handleTotp} disabled={loading}>{loading ? 'Checking...' : 'Verify 🦋'}</button>
          <button style={s.btnRed} onClick={onRejected}>Cancel</button>
        </>
      )}

      {layer === 'phone' && (
        <div style={{ textAlign: 'center' }}>
          <div style={s.title}>📱 LAYER 2 · PHONE APPROVAL</div>
          <div style={{ fontSize: '3rem', margin: '20px 0' }}>{phoneStatus === 'waiting' ? '⏳' : '✅'}</div>
          <p>{phoneStatus === 'waiting' ? 'Check your mobile notification...' : 'Approved!'}</p>
        </div>
      )}

      {layer === 'email_otp' && (
        <>
          <div style={s.title}>📧 LAYER 3 · EMAIL OTP</div>
          <input style={s.input} type="text" maxLength={6} value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} placeholder="000000" />
          <button style={s.btn} onClick={handleEmailOtp} disabled={loading}>Verify OTP 🦋</button>
        </>
      )}

      {layer === 'biometric' && (
        <div style={{ textAlign: 'center' }}>
          <div style={s.title}>👆 LAYER 4 · BIOMETRIC</div>
          <div style={{ fontSize: '4rem', margin: '20px 0', cursor: 'pointer' }} onClick={handleBiometric}>👆</div>
          <button style={s.btn} onClick={handleBiometric} disabled={loading}>
            {loading ? 'Authenticating...' : 'Touch Sensor to Approve 🦋'}
          </button>
          {error && <div style={s.error}>{error}</div>}
        </div>
      )}

      {layer === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem' }}>✅</div>
          <h2 style={{ color: '#00ff88' }}>Success!</h2>
          <p>Transaction Authorized 🦋</p>
        </div>
      )}
      
      {error && layer !== 'biometric' && <div style={s.error}>{error}</div>}
    </div>
  )
}
