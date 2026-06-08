import { useTranslation } from 'react-i18next';

function HolderDistribution({ data }) {
  const { t } = useTranslation();
  
  if (!data) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">{t('results.holderDistribution')}</h3>
      
      <div className="space-y-2">
        {data.top10?.map((holder, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-gray-400 w-8">#{holder.rank}</span>
            <span className="text-gray-300 font-mono text-sm flex-1 truncate">
              {holder.address}
            </span>
            <span className="text-white font-semibold">{holder.percentage}%</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-sm">
          Total Holders: <span className="text-white">{data.totalHolders}</span>
        </p>
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

export default HolderDistribution;
