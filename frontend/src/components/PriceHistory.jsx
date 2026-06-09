import { useTranslation } from 'react-i18next';

function PriceHistory({ price }) {
  const { t } = useTranslation();
  
  if (!price) {
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
        {t('priceHistory.title')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">{t('priceHistory.5m')}</div>
          <div className={`text-lg font-semibold ${price.priceChange5m >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {price.priceChange5m >= 0 ? '+' : ''}{price.priceChange5m.toFixed(2)}%
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {t('priceHistory.volume')}: ${formatNumber(price.volume5m)}
          </div>
          <div className="text-gray-400 text-xs">
            {t('priceHistory.trades')}: {price.txns5m.buys} {t('priceHistory.buy')} / {price.txns5m.sells} {t('priceHistory.sell')}
          </div>
        </div>
        
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">{t('priceHistory.1h')}</div>
          <div className={`text-lg font-semibold ${price.priceChange1h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {price.priceChange1h >= 0 ? '+' : ''}{price.priceChange1h.toFixed(2)}%
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {t('priceHistory.volume')}: ${formatNumber(price.volume1h)}
          </div>
          <div className="text-gray-400 text-xs">
            {t('priceHistory.trades')}: {price.txns1h.buys} {t('priceHistory.buy')} / {price.txns1h.sells} {t('priceHistory.sell')}
          </div>
        </div>
        
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">{t('priceHistory.6h')}</div>
          <div className={`text-lg font-semibold ${price.priceChange6h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {price.priceChange6h >= 0 ? '+' : ''}{price.priceChange6h.toFixed(2)}%
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {t('priceHistory.volume')}: ${formatNumber(price.volume6h)}
          </div>
          <div className="text-gray-400 text-xs">
            {t('priceHistory.trades')}: {price.txns6h.buys} {t('priceHistory.buy')} / {price.txns6h.sells} {t('priceHistory.sell')}
          </div>
        </div>
        
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">{t('priceHistory.24h')}</div>
          <div className={`text-lg font-semibold ${price.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {price.priceChange24h >= 0 ? '+' : ''}{price.priceChange24h.toFixed(2)}%
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {t('priceHistory.volume')}: ${formatNumber(price.volume24h)}
          </div>
          <div className="text-gray-400 text-xs">
            {t('priceHistory.trades')}: {price.txns24h.buys} {t('priceHistory.buy')} / {price.txns24h.sells} {t('priceHistory.sell')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceHistory;
