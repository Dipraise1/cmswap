// Real cryptocurrency token images from reliable web sources
export const TOKEN_IMAGES = {
  SOL: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  ETH: 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.png',
  USDC: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=025',
  BTC: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=025',
  USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=025',
  BNB: 'https://cryptologos.cc/logos/bnb-bnb-logo.png?v=025',
  ADA: 'https://cryptologos.cc/logos/cardano-ada-logo.png?v=025',
  DOGE: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png?v=025',
  MATIC: 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=025',
  DOT: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png?v=025',
  AVAX: 'https://cryptologos.cc/logos/avalanche-avax-logo.png?v=025',
  LINK: 'https://cryptologos.cc/logos/chainlink-link-logo.png?v=025',
  UNI: 'https://cryptologos.cc/logos/uniswap-uni-logo.png?v=025',
  LTC: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png?v=025',
  XRP: 'https://cryptologos.cc/logos/xrp-xrp-logo.png?v=025',
};

// Alternative high-quality sources from different CDNs
export const TOKEN_IMAGES_ALT = {
  SOL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
  ETH: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
  USDC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
  BTC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
  USDT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
  BNB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
  ADA: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png',
  DOGE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png',
  MATIC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
  DOT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png',
  AVAX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
  LINK: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png',
  UNI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png',
  LTC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2.png',
  XRP: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png',
};

// Get token image URL with fallback
export const getTokenImage = (symbol: string, useAlt: boolean = false): string => {
  const images = useAlt ? TOKEN_IMAGES_ALT : TOKEN_IMAGES;
  return images[symbol as keyof typeof images] || TOKEN_IMAGES.BTC;
};

// Get token image with multiple fallbacks
export const getTokenImageWithFallback = (symbol: string): string[] => {
  const primary = TOKEN_IMAGES[symbol as keyof typeof TOKEN_IMAGES];
  const secondary = TOKEN_IMAGES_ALT[symbol as keyof typeof TOKEN_IMAGES_ALT];
  
  const fallbacks = [];
  if (primary) fallbacks.push(primary);
  if (secondary && secondary !== primary) fallbacks.push(secondary);
  
  // Add generic fallback
  fallbacks.push(TOKEN_IMAGES.BTC);
  
  return fallbacks;
}; 