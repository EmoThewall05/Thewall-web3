lines = [
'# ⬡ THE WALL — Web3 Wallet',
'',
'> **Protect your invisible valuable currencies.**',
'',
'

![Web3](https://img.shields.io/badge/Web3-Wallet-blueviolet?style=flat-square)

',
'

![Chains](https://img.shields.io/badge/Chains-37-cyan?style=flat-square)

',
'

![Gasless](https://img.shields.io/badge/Gasless-%E2%9C%93-green?style=flat-square)

',
'

![No Seed Phrase](https://img.shields.io/badge/No%20Seed%20Phrase-%E2%9C%93-orange?style=flat-square)

',
'

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)

',
'

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)

',
'

![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

',
'',
'Built by **Thewin (Dwin 05)** \u00b7 India \ud83c\uddee\ud83c\xxIN \u2192 Dubai',
'Built entirely on phone using **Termux + Acode**',
'',
'---',
'',
'## Live Demo',
'',
'**[thewall-web3.e-mobies.com](https://thewall-web3.e-mobies.com)**',
'',
'---',
]
content = '\n'.join(lines) + '\n'
with open('README.md', 'w', encoding='utf-8') as f:
    f.write(content)
print('wrote first section, size:', len(content))
