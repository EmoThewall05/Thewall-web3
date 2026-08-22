import os

path = os.path.expanduser('~/Thewall-web3/app/page.tsx')
with open(path, 'r') as f:
    lines = f.readlines()

idx = 715  # line 716, 0-indexed
assert lines[idx].strip() == '</div>}', f"Unexpected content at line 716: {lines[idx]!r}"

indent = lines[idx][:len(lines[idx]) - len(lines[idx].lstrip())]
lines.insert(idx, indent + "</div>\n")

with open(path, 'w') as f:
    f.writelines(lines)

print("[OK] Added closing </div> for bottom wrapper card")
