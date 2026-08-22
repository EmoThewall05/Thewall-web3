import os

path = os.path.expanduser('~/Thewall-web3/app/page.module.css')
with open(path, 'r') as f:
    content = f.read()

old_logo = """.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}"""

new_logo = """.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  margin-bottom: 14px;
}"""

assert content.count(old_logo) == 1, f"old_logo block not found or not unique! Found {content.count(old_logo)} times"
content = content.replace(old_logo, new_logo, 1)

old_hexlogo = """.hexLogo {
  width: 96px;
  height: 96px;
  object-fit: contain;
  animation: float 3s ease-in-out infinite, glowPulse 2.5s ease-in-out infinite;
  line-height: 1;
}"""

new_hexlogo = """.hexLogo {
  width: 130px;
  height: 130px;
  object-fit: contain;
  animation: float 3s ease-in-out infinite, glowPulse 2.5s ease-in-out infinite;
  line-height: 1;
}"""

assert content.count(old_hexlogo) == 1, f"old_hexLogo block not found or not unique! Found {content.count(old_hexlogo)} times"
content = content.replace(old_hexlogo, new_hexlogo, 1)

with open(path, 'w') as f:
    f.write(content)

print("[OK] Logo centered above title + size increased to 130px")
