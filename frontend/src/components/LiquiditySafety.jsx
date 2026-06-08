import { useTranslation } from 'react-i18next';

function LiquiditySafety({ data }) {
  const { t } = useTranslation();
  
  if (!data) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('results.liquiditySafety') || '流动性安全'}
        </h3>
        <p className="text-gray-400">No liquidity safety data available</p>
      </div>
    );
  }
  
  // 计算流动性安全得分
  const lockScore = data.lpLocked ? 25 : 0;
  const depthScore = data.liquidityDepth > 50000 ? 25 : data.liquidityDepth > 10000 ? 15 : 0;
  const rugPullScore = data.rugPullRisk < 30 ? 25 : data.rugPullRisk < 50 ? 15 : 0;
  const providerScore = data.providerType === 'community' ? 25 : data.providerType === 'protocol' ? 20 : 0;
  
  const totalScore = lockScore + depthScore + rugPullScore + providerScore;
  
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
  
  const getRiskColor = (risk) => {
    if (risk < 30) return 'text-green-400';
    if (risk < 50) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        {t('results.liquiditySafety') || '流动性安全'}
      </h3>
      
      {/* 评分概览 */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">流动性安全评分</span>
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
        {/* LP 锁定状态 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">LP 锁定状态</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.lpLocked ? '✅ 流动性已锁定，无法撤池跑路' : '❌ 流动性未锁定，存在撤池风险'}
            </p>
          </div>
          <span className={`font-bold ${data.lpLocked ? 'text-green-400' : 'text-red-400'}`}>
            {data.lpLocked ? '+25' : '0'}
          </span>
        </div>
        
        {/* 流动性深度 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">流动性深度</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.liquidityDepth > 50000 
                ? '✅ 流动性充足，滑点低' 
                : data.liquidityDepth > 10000 
                  ? '⚠️ 流动性一般，大额交易滑点较高' 
                  : '❌ 流动性不足，存在跑路风险'}
            </p>
          </div>
          <span className={`font-bold ${data.liquidityDepth > 50000 ? 'text-green-400' : data.liquidityDepth > 10000 ? 'text-yellow-400' : 'text-red-400'}`}>
            {data.liquidityDepth > 50000 ? '+25' : data.liquidityDepth > 10000 ? '+15' : '0'}
          </span>
        </div>
        
        {/* 跑路风险 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">跑路风险</span>
            <p className="text-gray-400 text-sm mt-1">
              风险指数：<span className={getRiskColor(data.rugPullRisk)}>{data.rugPullRisk}%</span>
              {data.rugPullRisk < 30 ? ' - 低风险' : data.rugPullRisk < 50 ? ' - 中风险' : ' - 高风险'}
            </p>
          </div>
          <span className={`font-bold ${getRiskColor(data.rugPullRisk)}`}>
            {data.rugPullRisk < 30 ? '+25' : data.rugPullRisk < 50 ? '+15' : '0'}
          </span>
        </div>
        
        {/* 流动性提供者 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">流动性提供者</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.providerType === 'community' 
                ? '✅ 社区提供流动性，去中心化程度高' 
                : data.providerType === 'protocol' 
                  ? '⚠️ 协议提供流动性，有一定中心化风险' 
                  : '❌ 项目方提供流动性，中心化风险高'}
            </p>
          </div>
          <span className={`font-bold ${data.providerType === 'community' ? 'text-green-400' : data.providerType === 'protocol' ? 'text-yellow-400' : 'text-red-400'}`}>
            {data.providerType === 'community' ? '+25' : data.providerType === 'protocol' ? '+20' : '0'}
          </span>
        </div>
      </div>
      
      {/* 流动性详情 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">流动性规模</span>
            <p className="text-white font-medium">${(data.liquidity || 0).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-400">24h 交易量</span>
            <p className="text-white font-medium">${(data.volume24h || 0).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-400">LP 锁定时间</span>
            <p className="text-white font-medium">{data.lockDuration || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-400">滑点预估</span>
            <p className="text-white font-medium">{data.slippage || 'N/A'}%</p>
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
            {data.source || 'DexScreener'} →
          </a>
        </div>
      </div>
    </div>
  );
}

export default LiquiditySafety;
