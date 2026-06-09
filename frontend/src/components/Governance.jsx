import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function Governance({ governance }) {
  const { t } = useTranslation();
  
  if (!governance) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('results.governance')}
        </h3>
        <p className="text-gray-400">{t('governance.noData')}</p>
      </div>
    );
  }
  
  // 计算治理机制得分
  const daoScore = governance.hasDAO ? 25 : 0;
  const multisigScore = governance.hasMultisig ? 25 : 0;
  const upgradeableScore = !governance.isUpgradeable ? 25 : 0; // 不可升级更安全
  const permissionsScore = governance.hasPermissions ? 25 : 0;
  
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
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
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
              {governance.hasDAO ? t('governance.daoYes') : t('governance.daoNo')}
            </p>
          </div>
          <span className={`font-bold ${governance.hasDAO ? 'text-green-400' : 'text-yellow-400'}`}>
            {governance.hasDAO ? '+25' : '0'}
          </span>
        </div>
        
        {/* 多签机制 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('governance.multisig')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {governance.hasMultisig ? t('governance.multisigYes') : t('governance.multisigNo')}
            </p>
          </div>
          <span className={`font-bold ${governance.hasMultisig ? 'text-green-400' : 'text-yellow-400'}`}>
            {governance.hasMultisig ? '+25' : '0'}
          </span>
        </div>
        
        {/* 可升级性 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('governance.upgradeable')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {governance.isUpgradeable ? t('governance.upgradeableYes') : t('governance.upgradeableNo')}
            </p>
          </div>
          <span className={`font-bold ${!governance.isUpgradeable ? 'text-green-400' : 'text-yellow-400'}`}>
            {!governance.isUpgradeable ? '+25' : '0'}
          </span>
        </div>
        
        {/* 权限控制 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('governance.permissions')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {governance.hasPermissions ? t('governance.permissionsYes') : t('governance.permissionsNo')}
            </p>
          </div>
          <span className={`font-bold ${governance.hasPermissions ? 'text-green-400' : 'text-yellow-400'}`}>
            {governance.hasPermissions ? '+25' : '0'}
          </span>
        </div>
      </div>
      
      {/* 出处链接 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">{t('results.source')}</span>
          <a 
            href={governance.sourceUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {governance.source || 'BSCScan'} →
          </a>
        </div>
      </div>
    </div>
  );
}

export default Governance;
