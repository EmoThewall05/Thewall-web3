import os

path = os.path.expanduser('~/Thewall-web3/app/page.tsx')
with open(path, 'r') as f:
    lines = f.readlines()

# Line 715 (1-indexed) = index 714, should be "        </div>}\n"
idx = 714
assert lines[idx].strip() == '</div>}', f"Unexpected content at line 715: {lines[idx]!r}"

# Insert an extra closing </div> before it to close our new wrapper
indent = lines[idx][:len(lines[idx]) - len(lines[idx].lstrip())]
lines.insert(idx, indent + "</div>\n")

with open(path, 'w') as f:
    f.writelines(lines)

print("[OK] Added closing </div> for bottom wrapper card")
