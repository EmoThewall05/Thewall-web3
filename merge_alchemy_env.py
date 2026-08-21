import re
with open('.env.vercel.production') as f:
    vercel_env = f.read()
with open('.env.local') as f:
    local_env = f.read()

for key in ['NEXT_PUBLIC_ALCHEMY_API_KEY', 'NEXT_PUBLIC_GAS_POLICY_ID']:
    if key in local_env:
        continue
    match = re.search(rf'{key}="?([^"\n]+)"?', vercel_env)
    if match and match.group(1) != '[SENSITIVE]':
        local_env += f'\n{key}="{match.group(1)}"\n'
        print(f'[OK] merged {key}')
    else:
        print(f'[WARN] {key} not found or sensitive-masked, add manually')

with open('.env.local', 'w') as f:
    f.write(local_env)
