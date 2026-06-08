import { useTranslation } from 'react-i18next';

function ContractInfo({ data }) {
  const { t } = useTranslation();
  
  if (!data) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">{t('results.contractInfo')}</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Name</span>
          <span className="text-white">{data.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Compiler</span>
          <span className="text-white">{data.compiler}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Verified</span>
          <span className={data.verified ? 'text-green-500' : 'text-red-500'}>
            {data.verified ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Optimization</span>
          <span className="text-white">{data.optimization ? 'Yes' : 'No'}</span>
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

export default ContractInfo;
