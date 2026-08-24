path = "app/page.tsx"
with open(path) as f:
    content = f.read()

old1 = """<div className={styles.treasuryCard}><div className={styles.treasuryIcon}>🌟</div><div><div className={styles.treasuryLabel}>SOLANA</div><div className={styles.treasuryAddr}>{SOL_WALLET}</div></div><button className={styles.copyBtn} onClick={()=>navigator.clipboard.writeText(SOL_WALLET)}>📋</button></div>"""

new1 = """<div className={styles.treasuryCard}><div className={styles.treasuryIcon}>🌟</div><div><div className={styles.treasuryLabel}>SOLANA</div><div className={styles.treasuryAddr}>{user?.solAddress || 'Not connected'}</div></div>{user?.solAddress&&<button className={styles.copyBtn} onClick={()=>navigator.clipboard.writeText(user.solAddress!)}>📋</button>}</div>"""

if "user?.solAddress || 'Not connected'" in content:
    print("[SKIP] already updated")
elif old1 not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(old1, new1, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] Solana address display now uses user.solAddress")
