import { useTranslation } from 'react-i18next';

function TeamBackground({ team }) {
  const { t } = useTranslation();
  
  if (!team) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('results.teamBackground')}
        </h3>
        <p className="text-gray-400">{t('team.noData')}</p>
      </div>
    );
  }
  
  // 计算团队背景得分
  const teamScore = team.teamVerified ? 25 : 0;
  const advisorScore = team.hasAdvisors ? 25 : 0;
  const partnerScore = team.partners.length > 0 ? 25 : 0;
  const communityScore = team.communityActivity > 70 ? 25 : team.communityActivity > 50 ? 15 : 0;
  
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
        {t('results.teamBackground')}
      </h3>
      
      {/* 评分概览 */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">{t('team.score')}</span>
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
            <span className="text-white font-medium">{t('team.verified')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {team.teamVerified ? t('team.verifiedYes') : t('team.verifiedNo')}
            </p>
          </div>
          <span className={`font-bold ${team.teamVerified ? 'text-green-400' : 'text-yellow-400'}`}>
            {team.teamVerified ? '+25' : '0'}
          </span>
        </div>
        
        {/* 顾问团队 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('team.advisors')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {team.hasAdvisors ? t('team.advisorsYes') : t('team.advisorsNo')}
            </p>
          </div>
          <span className={`font-bold ${team.hasAdvisors ? 'text-green-400' : 'text-yellow-400'}`}>
            {team.hasAdvisors ? '+25' : '0'}
          </span>
        </div>
        
        {/* 合作伙伴 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('team.partners')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {team.partners.length > 0 
                ? t('team.partnersYes', { count: team.partners.length }) 
                : t('team.partnersNo')}
            </p>
          </div>
          <span className={`font-bold ${team.partners.length > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
            {team.partners.length > 0 ? '+25' : '0'}
          </span>
        </div>
        
        {/* 社区活跃度 */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-white font-medium">{t('team.activity')}</span>
            <p className="text-gray-400 text-sm mt-1">
              {t('team.activityLevel')}：<span className={
                team.communityActivity > 70 ? 'text-green-400' : 
                team.communityActivity > 50 ? 'text-yellow-400' : 'text-red-400'
              }>{team.communityActivity}%</span>
              {team.communityActivity > 70 ? ` - ${t('team.activityHigh')}` : team.communityActivity > 50 ? ` - ${t('team.activityMedium')}` : ` - ${t('team.activityLow')}`}
            </p>
          </div>
          <span className={`font-bold ${team.communityActivity > 70 ? 'text-green-400' : team.communityActivity > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {team.communityActivity > 70 ? '+25' : team.communityActivity > 50 ? '+15' : '0'}
          </span>
        </div>
      </div>
      
      {/* 团队详情 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h4 className="text-white font-medium mb-3">{t('team.members')}</h4>
        <div className="space-y-2">
          {team.teamMembers?.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <div>
                <span className="text-white">{member.name}</span>
                <span className="text-gray-400 text-sm ml-2">{member.role}</span>
              </div>
              <a 
                href={member.linkedin || `https://bscscan.com/address/${member.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                BSCScan →
              </a>
            </div>
          ))}
        </div>
      </div>
      
      {/* 合作伙伴详情 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h4 className="text-white font-medium mb-3">{t('team.partners')}</h4>
        <div className="flex flex-wrap gap-2">
          {team.partners?.map((partner, index) => (
            <span key={index} className="px-3 py-1 bg-gray-700 rounded-full text-gray-300 text-sm">
              {partner}
            </span>
          ))}
        </div>
      </div>
      
      {/* 出处链接 */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">{t('results.source')}</span>
          <a 
            href={team.sourceUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {team.source || 'BSCScan'} →
          </a>
        </div>
      </div>
    </div>
  );
}

export default TeamBackground;
