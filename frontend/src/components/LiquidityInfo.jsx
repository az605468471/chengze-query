import { useTranslation } from 'react-i18next';

function LiquidityInfo({ data }) {
  const { t } = useTranslation();
  
  if (!data) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">{t('results.liquidity')}</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">DEX</span>
          <span className="text-white">{data.dex}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Pair</span>
          <span className="text-white">{data.baseToken}/{data.quoteToken}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Price (USD)</span>
          <span className="text-white">${parseFloat(data.priceUsd).toFixed(6)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Liquidity</span>
          <span className="text-white">${data.liquidity.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">24h Volume</span>
          <span className="text-white">${data.volume24h.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">24h Change</span>
          <span className={data.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}>
            {data.priceChange24h >= 0 ? '+' : ''}{data.priceChange24h}%
          </span>
        </div>
      </div>
      
      <a
        href={data.url}
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
