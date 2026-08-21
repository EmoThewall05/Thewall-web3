import re
key_value = input().strip()
with open('.env.local') as f:
    content = f.read()
if 'NEXT_PUBLIC_ALCHEMY_API_KEY' not in content:
    content += f'\nNEXT_PUBLIC_ALCHEMY_API_KEY="{key_value}"\n'
    with open('.env.local', 'w') as f:
        f.write(content)
    print('[OK] added ALCHEMY_API_KEY')
else:
    print('[SKIP] already present')
