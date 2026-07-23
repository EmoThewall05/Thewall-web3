const n = require('@reown/appkit/networks');
const keys = Object.keys(n).filter(k => k !== 'AVAILABLE_NAMESPACES' && typeof n[k] === 'object' && n[k] !== null);
const testPattern = /test|sepolia|goerli|devnet|kovan|rinkeby|mumbai|fuji|chapel|preview|staging/i;
const mainnets = keys.filter(function(k) { return testPattern.test(k) === false; });
console.log('total objects:', keys.length);
console.log('mainnets (approx):', mainnets.length);
