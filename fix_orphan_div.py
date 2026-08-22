import os

path = os.path.expanduser('~/Thewall-web3/app/page.tsx')
with open(path, 'r') as f:
    content = f.read()

# The orphan </div> sits right after the profile card closes (right after
# the Solana address section's closing structure), on its own line.
# Unique anchor: it comes right before "<div style={s.card}><div style={{...s.label,marginBottom:12}}>WALLET STATS"
orphan_anchor = "</div>\n              <div style={s.card}><div style={{...s.label,marginBottom:12}}>WALLET STATS"
assert content.count(orphan_anchor) == 1, f"Anchor not found or not unique! Found {content.count(orphan_anchor)} times"

# Remove ONE of the two leading </div> before WALLET STATS (the orphan one)
fixed_removed = content.replace(orphan_anchor, "<div style={s.card}><div style={{...s.label,marginBottom:12}}>WALLET STATS", 1)

# Now insert that </div> into the Trade tab, right after the emcBuyMsg line
insert_anchor = "{emcBuyMsg&&<div style={{fontSize:'0.65rem',marginTop:8,color:emcBuyMsg.startsWith('✅')?'#00ff88':'#ff4466',...s.mono}}>{emcBuyMsg}</div>}"
assert fixed_removed.count(insert_anchor) == 1, f"Insert anchor not found or not unique! Found {fixed_removed.count(insert_anchor)} times"

fixed_final = fixed_removed.replace(insert_anchor, insert_anchor + "\n            </div>", 1)

with open(path, 'w') as f:
    f.write(fixed_final)

print("[OK] Orphan </div> moved from Settings to Trade tab (closes Buy EMC card)")
