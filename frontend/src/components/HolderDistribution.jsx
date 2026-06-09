import { useTranslation } from 'react-i18next';

function HolderDistribution({ holders }) {
  const { t } = useTranslation();
  
  if (!holders) return null;

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">{t('results.holderDistribution')}</h3>
      
      <div className="space-y-2">
        {holders.top10?.map((holder, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-gray-400 w-8 text-sm">#{holder.rank}</span>
            <span className="text-gray-300 font-mono text-xs flex-1 truncate">
              {holder.address}
            </span>
            <span className="text-white font-semibold text-sm">{holder.percentage}%</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-sm">
          Total Holders: <span className="text-white">{holders.totalHolders}</span>
        </p>
      </div>
      
      <a
        href={holders.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm"
      >
        {t('results.viewOnExplorer')} →
      </a>
    </div>
  );
}

export default HolderDistribution;
