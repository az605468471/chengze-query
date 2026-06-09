import { useTranslation } from 'react-i18next';

function ContractInfo({ contract }) {
  const { t } = useTranslation();
  
  if (!contract) return null;

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">{t('results.contractInfo')}</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Name</span>
          <span className="text-white text-sm font-medium">{contract.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Compiler</span>
          <span className="text-white text-sm">{contract.compiler}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Verified</span>
          <span className={`text-sm ${contract.verified ? 'text-green-500' : 'text-red-500'}`}>
            {contract.verified ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Optimization</span>
          <span className="text-white text-sm">{contract.optimization ? 'Yes' : 'No'}</span>
        </div>
      </div>
      
      <a
        href={contract.url}
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
