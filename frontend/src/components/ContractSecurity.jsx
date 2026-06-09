import { useTranslation } from 'react-i18next';

function ContractSecurity({ security }) {
  const { t } = useTranslation();
  
  if (!security) {
    return null;
  }
  
  const securityChecks = security.securityChecks || {};
  
  const securityItems = [
    {
      key: 'hasOwner',
      label: t('security.owner'),
      hasRisk: securityChecks.hasOwner,
      riskText: t('security.ownerRisk'),
      safeText: t('security.ownerSafe'),
      description: t('security.ownerDesc'),
      severity: 'high',
      icon: '👑'
    },
    {
      key: 'hasMint',
      label: t('security.mint'),
      hasRisk: securityChecks.hasMint,
      riskText: t('security.mintRisk'),
      safeText: t('security.mintSafe'),
      description: t('security.mintDesc'),
      severity: 'high',
      icon: '🖨️'
    },
    {
      key: 'hasPause',
      label: t('security.pause'),
      hasRisk: securityChecks.hasPause,
      riskText: t('security.pauseRisk'),
      safeText: t('security.pauseSafe'),
      description: t('security.pauseDesc'),
      severity: 'medium',
      icon: '⏸️'
    },
    {
      key: 'hasBlacklist',
      label: t('security.blacklist'),
      hasRisk: securityChecks.hasBlacklist,
      riskText: t('security.blacklistRisk'),
      safeText: t('security.blacklistSafe'),
      description: t('security.blacklistDesc'),
      severity: 'medium',
      icon: '🚫'
    },
    {
      key: 'hasMaxTx',
      label: t('security.maxTx'),
      hasRisk: securityChecks.hasMaxTx,
      riskText: t('security.maxTxRisk'),
      safeText: t('security.maxTxSafe'),
      description: t('security.maxTxDesc'),
      severity: 'low',
      icon: '📊'
    },
    {
      key: 'hasAntiBot',
      label: t('security.antiBot'),
      hasRisk: securityChecks.hasAntiBot,
      riskText: t('security.antiBotRisk'),
      safeText: t('security.antiBotSafe'),
      description: t('security.antiBotDesc'),
      severity: 'info',
      icon: '🤖'
    },
    {
      key: 'hasFee',
      label: t('security.fee'),
      hasRisk: securityChecks.hasFee,
      riskText: t('security.feeRisk'),
      safeText: t('security.feeSafe'),
      description: t('security.feeDesc'),
      severity: 'low',
      icon: '💰'
    },
    {
      key: 'hasReflection',
      label: t('security.reflection'),
      hasRisk: securityChecks.hasReflection,
      riskText: t('security.reflectionRisk'),
      safeText: t('security.reflectionSafe'),
      description: t('security.reflectionDesc'),
      severity: 'info',
      icon: '🔄'
    }
  ];
  
  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
        {t('results.contractSecurity')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {securityItems.map((item) => (
          <div 
            key={item.key} 
            className={`p-4 rounded-lg border ${
              item.hasRisk ? 
                (item.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                 item.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                 'bg-blue-500/10 border-blue-500/30') :
                'bg-green-500/10 border-green-500/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-white">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-medium ${
                    item.hasRisk ? 
                      (item.severity === 'high' ? 'text-red-400' :
                       item.severity === 'medium' ? 'text-yellow-400' :
                       'text-blue-400') :
                      'text-green-400'
                  }`}>
                    {item.hasRisk ? item.riskText : item.safeText}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.hasRisk ? 
                      (item.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                       item.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                       'bg-blue-500/20 text-blue-300') :
                      'bg-green-500/20 text-green-300'
                  }`}>
                    {item.hasRisk ? t('security.risk') : t('security.safe')}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{item.description}</p>
              </div>
              <a 
                href={security.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs ml-2 whitespace-nowrap"
              >
                {t('security.viewCode')} →
              </a>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{t('results.source')}：{security.source}</p>
            <p className="text-xs text-gray-500">{t('security.sourceDesc')}</p>
          </div>
          <a 
            href={security.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {t('security.viewFullCode')} →
          </a>
        </div>
      </div>
    </div>
  );
}

export default ContractSecurity;
