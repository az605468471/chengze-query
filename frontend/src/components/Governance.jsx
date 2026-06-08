import { useTranslation } from 'react-i18next';

function Governance({ data }) {
  const { t } = useTranslation();
  
  if (!data) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('results.governance') || '治理机制'}
        </h3>
        <p className="text-gray-400">No governance data available</p>
      </div>
    );
  }
  
  // 计算治理机制得分
  const daoScore = data.isDAO ? 25 : 0;
  const multisigScore = data.hasMultisig ? 25 : 0;
  const upgradeScore = data.upgradeable ? 0 : 25; // 不可升级更安全
  const permissionScore = data.permissionControlled ? 0 : 25; // 无权限控制更去中心化
  
  const totalScore = daoScore + multisigScore + upgradeScore + permissionScore;
  
  const getColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getBarColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        {t('results.governance') || '治理机制'}
      </h3>
      
      {/* 评分概览 */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">治理机制评分</span>
          <span className={`text-2xl font-bold ${getColor(totalScore)}`}>{totalScore}/100</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getBarColor(totalScore)}`}
            style={{ width: `${totalScore}%` }}
          />
        </div>
      </div>
      
      {/* 详细指标 */}
      <div className="space-y-4">
        {/* DAO 治理 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">DAO 治理</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.isDAO ? '✅ DAO 治理，社区决策' : '⚠️ 非 DAO 治理，中心化决策'}
            </p>
          </div>
          <span className={`font-bold ${data.isDAO ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.isDAO ? '+25' : '0'}
          </span>
        </div>
        
        {/* 多签机制 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">多签机制</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.hasMultisig ? '✅ 多签机制，资金安全有保障' : '⚠️ 无多签机制，资金风险较高'}
            </p>
          </div>
          <span className={`font-bold ${data.hasMultisig ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.hasMultisig ? '+25' : '0'}
          </span>
        </div>
        
        {/* 合约可升级性 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">合约可升级性</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.upgradeable ? '⚠️ 合约可升级，存在被恶意升级风险' : '✅ 合约不可升级，代码固定安全'}
            </p>
          </div>
          <span className={`font-bold ${data.upgradeable ? 'text-yellow-400' : 'text-green-400'}`}>
            {data.upgradeable ? '0' : '+25'}
          </span>
        </div>
        
        {/* 权限控制 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">权限控制</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.permissionControlled ? '⚠️ 存在权限控制，中心化风险' : '✅ 无权限控制，完全去中心化'}
            </p>
          </div>
          <span className={`font-bold ${data.permissionControlled ? 'text-yellow-400' : 'text-green-400'}`}>
            {data.permissionControlled ? '0' : '+25'}
          </span>
        </div>
      </div>
      
      {/* 治理详情 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">治理模式</span>
            <p className="text-white font-medium">{data.governanceType || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-400">投票机制</span>
            <p className="text-white font-medium">{data.votingMechanism || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-400">提案门槛</span>
            <p className="text-white font-medium">{data.proposalThreshold || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-400">投票周期</span>
            <p className="text-white font-medium">{data.votingPeriod || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      {/* 出处链接 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">数据来源</span>
          <a 
            href={data.sourceUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {data.source || 'BSCScan'} →
          </a>
        </div>
      </div>
    </div>
  );
}

export default Governance;
