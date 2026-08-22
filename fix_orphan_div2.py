import os

path = os.path.expanduser('~/Thewall-web3/app/page.tsx')
with open(path, 'r') as f:
    lines = f.readlines()

# Line 921 (1-indexed) = index 920, should be the orphan "            </div>\n"
orphan_line_idx = 920
orphan_content = lines[orphan_line_idx]
assert orphan_content.strip() == '</div>', f"Unexpected content at line 921: {orphan_content!r}"

# Remove it
del lines[orphan_line_idx]

# Find the emcBuyMsg line in Trade tab and insert </div> right after it
insert_idx = None
for i, l in enumerate(lines):
    if "{emcBuyMsg&&<div" in l:
        insert_idx = i
        break
assert insert_idx is not None, "emcBuyMsg line not found!"

lines.insert(insert_idx + 1, "            </div>\n")

with open(path, 'w') as f:
    f.writelines(lines)

print("[OK] Moved orphan </div> from line 921 (Settings) to after emcBuyMsg (Trade tab)")
