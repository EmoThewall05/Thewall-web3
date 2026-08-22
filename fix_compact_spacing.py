path_css = 'app/page.module.css'
with open(path_css) as f:
    css = f.read()

old_css = '''.loginCard {
  width: 100%;
  max-width: 420px;
  background: rgba(7,13,20,0.9);
  border: 1px solid var(--border-bright);
  border-radius: 16px;
  padding: 32px 28px;
  box-shadow: 0 0 60px rgba(0,179,247,0.08);
}
.logo {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}'''

new_css = '''.loginCard {
  width: 100%;
  max-width: 420px;
  background: rgba(7,13,20,0.9);
  border: 1px solid var(--border-bright);
  border-radius: 16px;
  padding: 20px 20px;
  box-shadow: 0 0 60px rgba(0,179,247,0.08);
}
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}'''

if old_css not in css:
    print('[FAIL] css marker not found')
else:
    css = css.replace(old_css, new_css)
    with open(path_css, 'w') as f:
        f.write(css)
    print('[OK] css spacing reduced')

path_tsx = 'app/page.tsx'
with open(path_tsx) as f:
    tsx = f.read()

replacements = [
    ("marginBottom:14}}>\n            {[{icon:'👑',label:'PREMIUM ACCESS'",
     "marginBottom:8}}>\n            {[{icon:'👑',label:'PREMIUM ACCESS'"),
    ("marginBottom:8}}>— SELECT CHAIN —",
     "marginBottom:6}}>— SELECT CHAIN —"),
    ("gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}",
     "gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}"),
    ("padding:'10px 12px',borderRadius:10,border:'1px solid #ffd70033'",
     "padding:'8px 10px',borderRadius:10,border:'1px solid #ffd70033'"),
    ("width:'100%',padding:'14px',marginBottom:10,background:'linear-gradient(135deg,#ffd700,#b8860b)'",
     "width:'100%',padding:'12px',marginBottom:8,background:'linear-gradient(135deg,#ffd700,#b8860b)'"),
    ("<div style={{marginBottom:10}}>\n            <SmartWalletConnect",
     "<div style={{marginBottom:8}}>\n            <SmartWalletConnect"),
    ("padding:'14px',marginBottom:12,borderRadius:10,border:'1px solid #ffd70044'",
     "padding:'10px',marginBottom:8,borderRadius:10,border:'1px solid #ffd70044'"),
    ("padding:'12px',borderRadius:10,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)'}}>\n            <div style={{textAlign:'center',fontSize:'0.72rem'",
     "padding:'10px',borderRadius:10,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)'}}>\n            <div style={{textAlign:'center',fontSize:'0.72rem'"),
]

count = 0
for old, new in replacements:
    if old in tsx:
        tsx = tsx.replace(old, new)
        count += 1
    else:
        print(f'[SKIP] not found: {old[:50]}...')

with open(path_tsx, 'w') as f:
    f.write(tsx)
print(f'[OK] {count}/{len(replacements)} tsx spacing tweaks applied')
