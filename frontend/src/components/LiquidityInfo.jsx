import { useTranslation } from 'react-i18next';

function LiquidityInfo({ liquidity }) {
  const { t } = useTranslation();
  
  if (!liquidity) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">{t('results.liquidity')}</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">DEX</span>
          <span className="text-white">{liquidity.dex}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Pair</span>
          <span className="text-white">{liquidity.baseToken}/{liquidity.quoteToken}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Price (USD)</span>
          <span className="text-white">${parseFloat(liquidity.priceUsd).toFixed(6)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Liquidity</span>
          <span className="text-white">${liquidity.liquidity.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">24h Volume</span>
          <span className="text-white">${liquidity.volume24h.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">24h Change</span>
          <span className={liquidity.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}>
            {liquidity.priceChange24h >= 0 ? '+' : ''}{liquidity.priceChange24h}%
          </span>
        </div>
      </div>
      
      <a
        href={liquidity.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm"
      >
        {t('results.viewOnExplorer')} →
      </a>
    </div>
  );
}

export default LiquidityInfo;
