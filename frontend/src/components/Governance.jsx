import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function Governance({ data }) {
  const { t } = useTranslation();
  
  if (!data) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('results.governance')}
        </h3>
        <p className="text-gray-400">No governance data available</p>
      </div>
    );
  }
  
  // 计算治理机制得分
  const daoScore = data.hasDAO ? 25 : 0;
  const multisigScore = data.hasMultisig ? 25 : 0;
  const upgradeableScore = !data.isUpgradeable ? 25 : 0; // 不可升级更安全
  const permissionsScore = data.hasPermissions ? 25 : 0;
  
  const totalScore = daoScore + multisigScore + upgradeableScore + permissionsScore;
  
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
        {t('results.governance')}
      </h3>
      
      {/* 评分概览 */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">{t('governance.score')}</span>
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
            <span className="text-white font-medium">{t('governance.dao')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.hasDAO ? '✅ 有 DAO 治理，去中心化决策' : '⚠️ 无 DAO 治理，中心化决策'}
            </p>
          </div>
          <span className={`font-bold ${data.hasDAO ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.hasDAO ? '+25' : '0'}
          </span>
        </div>
        
        {/* 多签机制 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('governance.multisig')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.hasMultisig ? '✅ 有多签机制，增加安全性' : '⚠️ 无多签，单点控制风险'}
            </p>
          </div>
          <span className={`font-bold ${data.hasMultisig ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.hasMultisig ? '+25' : '0'}
          </span>
        </div>
        
        {/* 可升级性 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('governance.upgradeable')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.isUpgradeable ? '⚠️ 合约可升级，存在变更风险' : '✅ 合约不可升级，代码不可变'}
            </p>
          </div>
          <span className={`font-bold ${!data.isUpgradeable ? 'text-green-400' : 'text-yellow-400'}`}>
            {!data.isUpgradeable ? '+25' : '0'}
          </span>
        </div>
        
        {/* 权限控制 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('governance.permissions')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.hasPermissions ? '✅ 权限控制合理，风险较低' : '⚠️ 权限控制不当，风险较高'}
            </p>
          </div>
          <span className={`font-bold ${data.hasPermissions ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.hasPermissions ? '+25' : '0'}
          </span>
        </div>
      </div>
      
      {/* 出处链接 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">{t('results.source')}</span>
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
