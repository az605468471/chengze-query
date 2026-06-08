import { useTranslation } from 'react-i18next';

function TeamBackground({ data }) {
  const { t } = useTranslation();
  
  if (!data) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('results.teamBackground') || '团队与背景'}
        </h3>
        <p className="text-gray-400">No team background data available</p>
      </div>
    );
  }
  
  // 计算团队背景得分
  const teamScore = data.teamVerified ? 25 : 0;
  const advisorScore = data.hasAdvisors ? 25 : 0;
  const partnerScore = data.partners.length > 0 ? 25 : 0;
  const communityScore = data.communityActivity > 70 ? 25 : data.communityActivity > 50 ? 15 : 0;
  
  const totalScore = teamScore + advisorScore + partnerScore + communityScore;
  
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
        {t('results.teamBackground') || '团队与背景'}
      </h3>
      
      {/* 评分概览 */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">团队背景评分</span>
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
        {/* 团队验证 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">团队验证</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.teamVerified ? '✅ 团队成员已验证，背景可查' : '⚠️ 团队未验证，匿名风险'}
            </p>
          </div>
          <span className={`font-bold ${data.teamVerified ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.teamVerified ? '+25' : '0'}
          </span>
        </div>
        
        {/* 顾问团队 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">顾问团队</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.hasAdvisors ? '✅ 有知名顾问，行业影响力' : '⚠️ 无顾问团队，缺乏行业背书'}
            </p>
          </div>
          <span className={`font-bold ${data.hasAdvisors ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.hasAdvisors ? '+25' : '0'}
          </span>
        </div>
        
        {/* 合作伙伴 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">合作伙伴</span>
            <p className="text-gray-400 text-sm mt-1">
              {data.partners.length > 0 
                ? `✅ 有 ${data.partners.length} 个合作伙伴` 
                : '⚠️ 无合作伙伴，生态支持弱'}
            </p>
          </div>
          <span className={`font-bold ${data.partners.length > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.partners.length > 0 ? '+25' : '0'}
          </span>
        </div>
        
        {/* 社区活跃度 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">社区活跃度</span>
            <p className="text-gray-400 text-sm mt-1">
              活跃度：<span className={
                data.communityActivity > 70 ? 'text-green-400' : 
                data.communityActivity > 50 ? 'text-yellow-400' : 'text-red-400'
              }>{data.communityActivity}%</span>
              {data.communityActivity > 70 ? ' - 高度活跃' : data.communityActivity > 50 ? ' - 一般' : ' - 冷清'}
            </p>
          </div>
          <span className={`font-bold ${data.communityActivity > 70 ? 'text-green-400' : data.communityActivity > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {data.communityActivity > 70 ? '+25' : data.communityActivity > 50 ? '+15' : '0'}
          </span>
        </div>
      </div>
      
      {/* 团队详情 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h4 className="text-white font-medium mb-3">团队成员</h4>
        <div className="space-y-2">
          {data.teamMembers?.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <div>
                <span className="text-white">{member.name}</span>
                <span className="text-gray-400 text-sm ml-2">{member.role}</span>
              </div>
              <a 
                href={member.linkedin || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                LinkedIn →
              </a>
            </div>
          ))}
        </div>
      </div>
      
      {/* 合作伙伴详情 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h4 className="text-white font-medium mb-3">合作伙伴</h4>
        <div className="flex flex-wrap gap-2">
          {data.partners?.map((partner, index) => (
            <span key={index} className="px-3 py-1 bg-gray-700 rounded-full text-gray-300 text-sm">
              {partner}
            </span>
          ))}
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
            {data.source || '项目官网'} →
          </a>
        </div>
      </div>
    </div>
  );
}

export default TeamBackground;
