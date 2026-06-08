import { useTranslation } from 'react-i18next';

function PriceHistory({ data }) {
  const { t } = useTranslation();
  
  if (!data) {
    return null;
  }
  
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        {t('results.priceHistory') || '价格历史'}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">5分钟</div>
          <div className={`text-lg font-semibold ${data.priceChange5m >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data.priceChange5m >= 0 ? '+' : ''}{data.priceChange5m.toFixed(2)}%
          </div>
          <div className="text-gray-400 text-xs mt-1">
            交易量: ${formatNumber(data.volume5m)}
          </div>
          <div className="text-gray-400 text-xs">
            交易: {data.txns5m.buys} 买 / {data.txns5m.sells} 卖
          </div>
        </div>
        
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">1小时</div>
          <div className={`text-lg font-semibold ${data.priceChange1h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data.priceChange1h >= 0 ? '+' : ''}{data.priceChange1h.toFixed(2)}%
          </div>
          <div className="text-gray-400 text-xs mt-1">
            交易量: ${formatNumber(data.volume1h)}
          </div>
          <div className="text-gray-400 text-xs">
            交易: {data.txns1h.buys} 买 / {data.txns1h.sells} 卖
          </div>
        </div>
        
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">6小时</div>
          <div className={`text-lg font-semibold ${data.priceChange6h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data.priceChange6h >= 0 ? '+' : ''}{data.priceChange6h.toFixed(2)}%
          </div>
          <div className="text-gray-400 text-xs mt-1">
            交易量: ${formatNumber(data.volume6h)}
          </div>
          <div className="text-gray-400 text-xs">
            交易: {data.txns6h.buys} 买 / {data.txns6h.sells} 卖
          </div>
        </div>
        
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">24小时</div>
          <div className={`text-lg font-semibold ${data.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data.priceChange24h >= 0 ? '+' : ''}{data.priceChange24h.toFixed(2)}%
          </div>
          <div className="text-gray-400 text-xs mt-1">
            交易量: ${formatNumber(data.volume24h)}
          </div>
          <div className="text-gray-400 text-xs">
            交易: {data.txns24h.buys} 买 / {data.txns24h.sells} 卖
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceHistory;
