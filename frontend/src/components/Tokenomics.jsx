import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function Tokenomics({ tokenomics }) {
  const { t } = useTranslation();
  
  if (!tokenomics) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('results.tokenomics')}
        </h3>
        <p className="text-gray-400">{t('tokenomics.noData')}</p>
      </div>
    );
  }
  
  // 计算销毁机制得分
  const burnScore = tokenomics.hasBurn ? 20 : 0;
  const deflationScore = tokenomics.isDeflationary ? 20 : 0;
  const fairLaunchScore = tokenomics.fairLaunch ? 20 : 0;
  const vestingScore = tokenomics.hasVesting ? 20 : 0;
  const utilityScore = tokenomics.hasUtility ? 20 : 0;
  
  const totalScore = burnScore + deflationScore + fairLaunchScore + vestingScore + utilityScore;
  
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
        {t('results.tokenomics')}
      </h3>
      
      {/* 评分概览 */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">{t('tokenomics.score')}</span>
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
        {/* 销毁机制 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('tokenomics.burnMechanism')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {tokenomics.hasBurn ? t('tokenomics.burnYes') : t('tokenomics.burnNo')}
            </p>
          </div>
          <span className={`font-bold ${tokenomics.hasBurn ? 'text-green-400' : 'text-red-400'}`}>
            {tokenomics.hasBurn ? '+20' : '0'}
          </span>
        </div>
        
        {/* 通缩模型 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('tokenomics.inflationModel')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {tokenomics.isDeflationary ? t('tokenomics.deflationYes') : t('tokenomics.deflationNo')}
            </p>
          </div>
          <span className={`font-bold ${tokenomics.isDeflationary ? 'text-green-400' : 'text-yellow-400'}`}>
            {tokenomics.isDeflationary ? '+20' : '0'}
          </span>
        </div>
        
        {/* 公平启动 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('tokenomics.fairLaunch')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {tokenomics.fairLaunch ? t('tokenomics.fairLaunchYes') : t('tokenomics.fairLaunchNo')}
            </p>
          </div>
          <span className={`font-bold ${tokenomics.fairLaunch ? 'text-green-400' : 'text-yellow-400'}`}>
            {tokenomics.fairLaunch ? '+20' : '0'}
          </span>
        </div>
        
        {/* 解锁机制 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('tokenomics.vestingSchedule')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {tokenomics.hasVesting ? t('tokenomics.vestingYes') : t('tokenomics.vestingNo')}
            </p>
          </div>
          <span className={`font-bold ${tokenomics.hasVesting ? 'text-green-400' : 'text-yellow-400'}`}>
            {tokenomics.hasVesting ? '+20' : '0'}
          </span>
        </div>
        
        {/* 实用性 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('tokenomics.utility')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {tokenomics.hasUtility ? t('tokenomics.utilityYes') : t('tokenomics.utilityNo')}
            </p>
          </div>
          <span className={`font-bold ${tokenomics.hasUtility ? 'text-green-400' : 'text-yellow-400'}`}>
            {tokenomics.hasUtility ? '+20' : '0'}
          </span>
        </div>
      </div>
      
      {/* 出处链接 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">{t('results.source')}</span>
          <a 
            href={tokenomics.sourceUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {tokenomics.source || 'BSCScan'} →
          </a>
        </div>
      </div>
    </div>
  );
}

export default Tokenomics;
