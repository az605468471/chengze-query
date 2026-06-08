import { useTranslation } from 'react-i18next';

function ContractSecurity({ data }) {
  const { t } = useTranslation();
  
  if (!data) {
    return null;
  }
  
  const securityChecks = data.securityChecks || {};
  
  const securityItems = [
    {
      key: 'hasOwner',
      label: 'Owner 权限',
      hasRisk: securityChecks.hasOwner,
      riskText: '存在管理员权限',
      safeText: '无管理员权限',
      description: 'Owner 可修改合约参数、暂停交易、转移权限等',
      severity: 'high',
      icon: '👑'
    },
    {
      key: 'hasMint',
      label: '增发功能',
      hasRisk: securityChecks.hasMint,
      riskText: '可无限增发',
      safeText: '无增发功能',
      description: '可无限增发代币，导致代币贬值',
      severity: 'high',
      icon: '🖨️'
    },
    {
      key: 'hasPause',
      label: '暂停功能',
      hasRisk: securityChecks.hasPause,
      riskText: '可暂停交易',
      safeText: '无暂停功能',
      description: '可暂停所有交易，可能被恶意使用',
      severity: 'medium',
      icon: '⏸️'
    },
    {
      key: 'hasBlacklist',
      label: '黑名单机制',
      hasRisk: securityChecks.hasBlacklist,
      riskText: '存在黑名单机制',
      safeText: '无黑名单机制',
      description: '可限制特定地址交易，可能被恶意使用',
      severity: 'medium',
      icon: '🚫'
    },
    {
      key: 'hasMaxTx',
      label: '交易限制',
      hasRisk: securityChecks.hasMaxTx,
      riskText: '有交易限额',
      safeText: '无交易限额',
      description: '限制单笔交易最大数量，防止大额交易',
      severity: 'low',
      icon: '📊'
    },
    {
      key: 'hasAntiBot',
      label: '防机器人',
      hasRisk: securityChecks.hasAntiBot,
      riskText: '有防机器人机制',
      safeText: '无防机器人机制',
      description: '防止机器人抢跑交易，保护普通用户',
      severity: 'info',
      icon: '🤖'
    },
    {
      key: 'hasFee',
      label: '手续费',
      hasRisk: securityChecks.hasFee,
      riskText: '有手续费机制',
      safeText: '无手续费机制',
      description: '交易需支付手续费，需确认费率是否合理',
      severity: 'low',
      icon: '💰'
    },
    {
      key: 'hasReflection',
      label: '分红机制',
      hasRisk: securityChecks.hasReflection,
      riskText: '有分红机制',
      safeText: '无分红机制',
      description: '持有代币可获得分红，通常为交易手续费分成',
      severity: 'info',
      icon: '🔄'
    }
  ];
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        {t('results.contractSecurity') || '合约安全分析'}
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
                    {item.hasRisk ? '风险' : '安全'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{item.description}</p>
              </div>
              <a 
                href={data.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs ml-2 whitespace-nowrap"
              >
                查看代码 →
              </a>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">数据来源：{data.source}</p>
            <p className="text-xs text-gray-500">通过合约源代码分析检测</p>
          </div>
          <a 
            href={data.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            查看完整代码 →
          </a>
        </div>
      </div>
    </div>
  );
}

export default ContractSecurity;
