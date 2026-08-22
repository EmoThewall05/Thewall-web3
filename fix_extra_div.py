path = 'app/page.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

# Find line with </div>} and remove ONE duplicate </div> right before it
for i, line in enumerate(lines):
    if line.strip() == '</div>}':
        # check previous two lines
        if lines[i-1].strip() == '</div>' and lines[i-2].strip() == '</div>':
            del lines[i-1]  # remove one extra </div>
            print(f"[OK] Removed 1 extra </div> at line {i}")
            break
else:
    print("[WARN] Pattern not found — no changes made")

with open(path, 'w') as f:
    f.writelines(lines)
