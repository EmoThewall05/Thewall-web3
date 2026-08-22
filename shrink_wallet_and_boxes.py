path = 'app/page.tsx'
with open(path) as f:
    content = f.read()

changes = []

# 1. Shrink green wrapper padding
old1 = "<div style={{marginBottom:6,padding:'10px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#00ff88,#00b368)',boxShadow:'0 0 20px rgba(0,255,136,0.25)'}}>"
new1 = "<div style={{marginBottom:6,padding:'4px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#00ff88,#00b368)',boxShadow:'0 0 20px rgba(0,255,136,0.25)'}}>"

if old1 in content:
    content = content.replace(old1, new1)
    changes.append('[OK] green wrapper padding shrunk 10px -> 4px')
elif new1 in content:
    changes.append('[SKIP] green wrapper already patched')
else:
    changes.append('[WARN] green wrapper block not found')

# 2. Shrink premium/security box heights (reduce padding)
old2 = "<div style={{flex:1,padding:'5px 6px',borderRadius:8,border:'1px solid #ffd70044',background:'rgba(255,215,0,0.03)',textAlign:'center'}}>"
new2 = "<div style={{flex:1,padding:'3px 6px',borderRadius:8,border:'1px solid #ffd70044',background:'rgba(255,215,0,0.03)',textAlign:'center'}}>"

if old2 in content:
    content = content.replace(old2, new2)
    changes.append('[OK] premium box padding shrunk 5px -> 3px')
elif new2 in content:
    changes.append('[SKIP] premium box already patched')
else:
    changes.append('[WARN] premium box block not found')

old3 = "<div style={{flex:1,padding:'5px 6px',borderRadius:8,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)',textAlign:'center'}}>"
new3 = "<div style={{flex:1,padding:'3px 6px',borderRadius:8,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)',textAlign:'center'}}>"

if old3 in content:
    content = content.replace(old3, new3)
    changes.append('[OK] security box padding shrunk 5px -> 3px')
elif new3 in content:
    changes.append('[SKIP] security box already patched')
else:
    changes.append('[WARN] security box block not found')

with open(path, 'w') as f:
    f.write(content)

for c in changes:
    print(c)
