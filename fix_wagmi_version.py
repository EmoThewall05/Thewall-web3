import subprocess, json

with open('package.json') as f:
    pkg = json.load(f)

deps = pkg.get('dependencies', {})

changes = {
    'wagmi': '^2.15.6',
    '@wagmi/core': '^2.16.7',
    '@wagmi/connectors': '^5.7.10',
}

for name, version in changes.items():
    if name in deps:
        print(f'[OK] {name}: {deps[name]} -> {version}')
        deps[name] = version
    else:
        print(f'[WARN] {name} not found in dependencies')

pkg['dependencies'] = deps

with open('package.json', 'w') as f:
    json.dump(pkg, f, indent=2)
    f.write('\n')

print('[DONE] package.json updated')
