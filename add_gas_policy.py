key_value = input().strip()
with open('.env.local') as f:
    content = f.read()
if 'NEXT_PUBLIC_GAS_POLICY_ID' not in content:
    content += f'\nNEXT_PUBLIC_GAS_POLICY_ID="{key_value}"\n'
    with open('.env.local', 'w') as f:
        f.write(content)
    print('[OK] added GAS_POLICY_ID')
else:
    print('[SKIP] already present')
