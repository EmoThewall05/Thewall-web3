import os

path = os.path.expanduser('~/Thewall-web3/app/page.tsx')
with open(path, 'r') as f:
    lines = f.readlines()

# Find start of Premium card block
start_idx = None
for i, l in enumerate(lines):
    if "border:`1px solid ${isPremium?" in l:
        start_idx = i
        break
assert start_idx is not None, "Start marker not found!"

# Find end of Buy Emo Coins block (emcBuyMsg line)
end_idx = None
for i, l in enumerate(lines):
    if "emcBuyMsg&&<div" in l:
        end_idx = i
        break
assert end_idx is not None, "End marker not found!"
assert end_idx > start_idx, "End before start, check markers!"

# Extract the block
block = lines[start_idx:end_idx+1]
print(f"[INFO] Extracted block: lines {start_idx+1} to {end_idx+1} ({len(block)} lines)")

# Remove block from original position
remaining = lines[:start_idx] + lines[end_idx+1:]

# Find insertion point: after "UniSwap V3 · Gasless" line (in Trade/Swap tab)
insert_idx = None
for i, l in enumerate(remaining):
    if "UniSwap V3 · Gasless" in l:
        insert_idx = i
        break
assert insert_idx is not None, "Insert marker not found!"

# Insert block right after that line
new_lines = remaining[:insert_idx+1] + block + remaining[insert_idx+1:]

with open(path, 'w') as f:
    f.writelines(new_lines)

print("[OK] Premium + Buy EMC block moved to Trade tab (after Swap section)")
