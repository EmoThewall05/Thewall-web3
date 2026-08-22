import os

path = os.path.expanduser('~/Thewall-web3/app/page.tsx')
with open(path, 'r') as f:
    lines = f.readlines()

# Line 716 (1-indexed) = index 715, should be "        </div>}\n"
idx = 715
assert lines[idx].strip() == '</div>}', f"Unexpected content at line 716: {lines[idx]!r}"

indent = lines[idx][:len(lines[idx]) - len(lines[idx].lstrip())]
lines.insert(idx, indent + "</div>\n")

with open(path, 'w') as f:
    f.writelines(lines)

print("[OK] Inserted closing </div> for wrapper card before line 716")
