import os

path = os.path.expanduser('~/Thewall-web3/app/page.tsx')
with open(path, 'r') as f:
    content = f.read()

# ---------- 1. Insert ChainIcon component near top (after imports) ----------
chain_icon_component = '''
const ChainIcon = ({ id }: { id: string }) => {
  const s: React.CSSProperties = { width: 20, height: 20, flexShrink: 0 };
  switch (id) {
    case 'birth': // Bitcoin
      return (
        <svg style={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#f7931a"/><path fill="#fff" d="M21.9 14.3c.3-2-1.2-3-3.3-3.7l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.9-.2-1.3-.3l.7-2.7-1.6-.4-.7 2.7c-.4-.1-.7-.2-1-.2v-.1l-2.3-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8.9l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.2.6c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.8.5 4.9.3 5.8-2.2.7-2-.03-3.2-1.5-3.9 1.1-.2 1.9-1 2.1-2.5zm-3.7 5.3c-.5 2-3.9.9-5 .6l.9-3.6c1.1.3 4.6.8 4.1 3zm.5-5.3c-.5 1.8-3.3.9-4.2.7l.8-3.3c.9.2 3.9.6 3.4 2.6z"/></svg>
      );
    case 'earth': // Ethereum
      return (
        <svg style={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#627eea"/><path fill="#fff" fillOpacity=".8" d="M16.5 4v8.9l7.5 3.4z"/><path fill="#fff" d="M16.5 4 9 16.3l7.5-3.4z"/><path fill="#fff" fillOpacity=".8" d="M16.5 21.9v6.1l7.5-10.4z"/><path fill="#fff" d="M16.5 28v-6.1L9 17.6z"/><path fill="#fff" fillOpacity=".6" d="M16.5 20.5 24 16.3l-7.5-3.4z"/><path fill="#fff" fillOpacity=".9" d="M9 16.3l7.5 4.2v-7.6z"/></svg>
      );
    case 'soul': // Solana
      return (
        <svg style={s} viewBox="0 0 32 32"><defs><linearGradient id="solg" x1="0" y1="0" x2="32" y2="32"><stop offset="0" stopColor="#00ffa3"/><stop offset="1" stopColor="#dc1fff"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="#0a0a0a"/><path fill="url(#solg)" d="M9.3 20.1c.2-.2.5-.3.8-.3h13.4c.4 0 .6.5.3.8l-2.7 2.7c-.2.2-.5.3-.8.3H6.9c-.4 0-.6-.5-.3-.8l2.7-2.7z"/><path fill="url(#solg)" d="M9.3 8.9c.2-.2.5-.3.8-.3h13.4c.4 0 .6.5.3.8l-2.7 2.7c-.2.2-.5.3-.8.3H6.9c-.4 0-.6-.5-.3-.8l2.7-2.7z"/><path fill="url(#solg)" d="M22.7 14.5c-.2-.2-.5-.3-.8-.3H8.5c-.4 0-.6.5-.3.8l2.7 2.7c.2.2.5.3.8.3h13.4c.4 0 .6-.5.3-.8l-2.7-2.7z"/></svg>
      );
    case 'orbit': // Arbitrum
      return (
        <svg style={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#213147"/><path fill="#12aaff" d="M12.5 21.5 16 14.2l3.5 7.3h2.4L16 8.5l-5.9 13z"/><path fill="#fff" d="m14.7 18.3 1.3-3 1.3 3z"/><path fill="#9dcced" d="M9.3 21.5h2l.9-2h2.1l-1.9-4.2z"/></svg>
      );
    case 'moon': // Monad
      return (
        <svg style={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#200052"/><path fill="#836ef9" d="M16 7c-3.5 0-9 4-9 9s5.5 9 9 9 9-4 9-9-5.5-9-9-9zm0 15.5c-2 0-4.5-3.3-4.5-6.5S14 9.5 16 9.5s4.5 3.3 4.5 6.5-2.5 6.5-4.5 6.5z"/></svg>
      );
    case 'base': // Base
      return (
        <svg style={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#0052ff"/><path fill="#fff" d="M16 24.5c4.7 0 8.5-3.8 8.5-8.5S20.7 7.5 16 7.5c-4.4 0-8.1 3.4-8.5 7.7h11.6v1.6H7.5c.4 4.3 4.1 7.7 8.5 7.7z"/></svg>
      );
    default:
      return null;
  }
};
'''

marker = "if(screen==='login') return ("
assert content.count(marker) == 1, f"login marker not found or not unique! Found {content.count(marker)} times"
content = content.replace(marker, chain_icon_component + "\n  " + marker, 1)

# ---------- 2. Update chain array: remove emoji icon field ----------
old_array = """            {[
              {id:'birth',label:'BIRTH',sub:'Bitcoin (BTC)',icon:'₿',color:'#f7931a'},
              {id:'earth',label:'EARTH',sub:'Ethereum (ETH)',icon:'🌍',color:'#627eea'},
              {id:'soul',label:'SOUL',sub:'Solana (SOL)',icon:'🌟',color:'#9945ff'},
              {id:'orbit',label:'ORBIT',sub:'Arbitrum (ARB)',icon:'🪐',color:'#12aaff'},
              {id:'moon',label:'MOON',sub:'Monad (MON)',icon:'🌙',color:'#836ef9'},
              {id:'base',label:'BASE',sub:'Base',icon:'🔵',color:'#0052ff'},
            ].map(c=>("""

new_array = """            {[
              {id:'birth',label:'BIRTH',sub:'Bitcoin (BTC)',color:'#f7931a'},
              {id:'earth',label:'EARTH',sub:'Ethereum (ETH)',color:'#627eea'},
              {id:'soul',label:'SOUL',sub:'Solana (SOL)',color:'#9945ff'},
              {id:'orbit',label:'ORBIT',sub:'Arbitrum (ARB)',color:'#12aaff'},
              {id:'moon',label:'MOON',sub:'Monad (MON)',color:'#836ef9'},
              {id:'base',label:'BASE',sub:'Base',color:'#0052ff'},
            ].map(c=>("""

assert content.count(old_array) == 1, f"chain array not found or not unique! Found {content.count(old_array)} times"
content = content.replace(old_array, new_array, 1)

# ---------- 3. Update icon render: swap <span>{c.icon}</span> for <ChainIcon/> ----------
old_icon_render = '<span style={{fontSize:\'1.1rem\'}}>{c.icon}</span>'
new_icon_render = '<ChainIcon id={c.id}/>'

assert content.count(old_icon_render) == 1, f"icon render not found or not unique! Found {content.count(old_icon_render)} times"
content = content.replace(old_icon_render, new_icon_render, 1)

with open(path, 'w') as f:
    f.write(content)

print("[OK] Official brand SVG chain logos added (Bitcoin, Ethereum, Solana, Arbitrum, Monad, Base)")
