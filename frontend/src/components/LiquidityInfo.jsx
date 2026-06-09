import { useTranslation } from 'react-i18next';

function LiquidityInfo({ liquidity }) {
  const { t } = useTranslation();
  
  if (!liquidity) return null;

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">{t('results.liquidity')}</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">DEX</span>
          <span className="text-white text-sm font-medium">{liquidity.dex}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Pair</span>
          <span className="text-white text-sm">{liquidity.baseToken}/{liquidity.quoteToken}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Price (USD)</span>
          <span className="text-white text-sm font-medium">${parseFloat(liquidity.priceUsd).toFixed(6)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Liquidity</span>
          <span className="text-white text-sm font-medium">${liquidity.liquidity.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">24h Volume</span>
          <span className="text-white text-sm font-medium">${liquidity.volume24h.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">24h Change</span>
          <span className={`text-sm font-medium ${liquidity.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
