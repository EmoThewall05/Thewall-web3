path_tsx = 'app/page.tsx'
with open(path_tsx) as f:
    tsx = f.read()

old_tsx = '<span className={styles.hexLogo}>⬡</span>'
new_tsx = '<img src="/butterfly.jpg" className={styles.hexLogo} alt="The Wall"/>'

if old_tsx not in tsx:
    print('[FAIL] tsx marker not found')
else:
    tsx = tsx.replace(old_tsx, new_tsx)
    with open(path_tsx, 'w') as f:
        f.write(tsx)
    print('[OK] page.tsx updated')

path_css = 'app/page.module.css'
with open(path_css) as f:
    css = f.read()

old_css = '''.hexLogo {
  font-size: 2.8rem;
  color: var(--cyan);
  animation: float 3s ease-in-out infinite;
  line-height: 1;
}'''

new_css = '''.hexLogo {
  width: 96px;
  height: 96px;
  object-fit: contain;
  animation: float 3s ease-in-out infinite, glowPulse 2.5s ease-in-out infinite;
  line-height: 1;
}
@keyframes glowPulse {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(0,255,136,0.35)) drop-shadow(0 0 12px rgba(255,215,0,0.2)); }
  50% { filter: drop-shadow(0 0 16px rgba(0,255,136,0.65)) drop-shadow(0 0 28px rgba(255,215,0,0.45)); }
}'''

if old_css not in css:
    print('[FAIL] css marker not found')
else:
    css = css.replace(old_css, new_css)
    with open(path_css, 'w') as f:
        f.write(css)
    print('[OK] page.module.css updated')
