path = "app/page.tsx"
with open(path) as f:
    content = f.read()

# Extract followLeader block
start_marker = "  const followLeader = useCallback(async () => {"
end_marker = "  }, [user, followTarget, followAllocation, followLoading, fetchLeaders])\n\n"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)
if start_idx == -1 or end_idx == -1:
    print("[WARN] could not locate followLeader block")
else:
    end_idx += len(end_marker)
    follow_block = content[start_idx:end_idx]
    # remove it from its current position
    content = content[:start_idx] + content[end_idx:]

    # find fetchLeaders block end to insert followLeader right after it
    fetch_start = content.find("  const fetchLeaders = useCallback(async () => {")
    fetch_end_marker = "  }, [])\n\n"
    fetch_end = content.find(fetch_end_marker, fetch_start)
    if fetch_start == -1 or fetch_end == -1:
        print("[WARN] could not locate fetchLeaders block to insert after")
    else:
        insert_pos = fetch_end + len(fetch_end_marker)
        content = content[:insert_pos] + follow_block + content[insert_pos:]
        with open(path, "w") as f:
            f.write(content)
        print("[OK] reordered followLeader after fetchLeaders")
