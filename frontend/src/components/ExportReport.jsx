import { useTranslation } from 'react-i18next'
import { useState, memo } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const ExportReport = memo(function ExportReport({ contractData }) {
  const { t, i18n } = useTranslation()
  const [exporting, setExporting] = useState(false)
  const data = contractData
  const currentLang = i18n.language

  const exportToPDF = async () => {
    setExporting(true)
    try {
      // 检查 jsPDF 是否可用
      if (typeof jsPDF === 'undefined') {
        throw new Error('jsPDF library not loaded')
      }
      
      const doc = new jsPDF()
      const currentLang = i18n.language
      
      // 设置中文字体（如果支持）
      try {
        doc.setFont('helvetica')
      } catch (e) {
        console.log('Font setting error:', e)
      }
      
      // 标题
      doc.setFontSize(24)
      doc.setTextColor(59, 130, 246) // 蓝色
      const title = currentLang === 'zh' ? 'DeFi 项目分析报告' : 
                    currentLang === 'ja' ? 'DeFi プロジェクト分析レポート' :
                    currentLang === 'ko' ? 'DeFi 프로젝트 분석 보고서' :
                    'DeFi Project Analysis Report'
      doc.text(title, 14, 25)
      
      // 副标题
      doc.setFontSize(12)
      doc.setTextColor(107, 114, 128) // 灰色
      const subtitle = currentLang === 'zh' ? '全方位安全分析与风险评估' :
                       currentLang === 'ja' ? '包括的なセキュリティ分析とリスク評価' :
                       currentLang === 'ko' ? '포괄적인 보안 분석 및 리스크 평가' :
                       'Comprehensive Security Analysis & Risk Assessment'
      doc.text(subtitle, 14, 35)
      
      // 生成时间
      doc.setFontSize(10)
      const now = new Date()
      const dateStr = now.toLocaleDateString('zh-CN')
      doc.text(`${currentLang === 'zh' ? '生成时间' : currentLang === 'ja' ? '生成時間' : currentLang === 'ko' ? '생성 시간' : 'Generated'}: ${dateStr}`, 14, 45)
      
      // 分隔线
      doc.setDrawColor(229, 231, 235)
      doc.setLineWidth(0.5)
      doc.line(14, 50, 196, 50)
      
      let yPos = 60
      
      // 合约地址
      doc.setFontSize(14)
      doc.setTextColor(31, 41, 55) // 深灰色
      doc.text(currentLang === 'zh' ? '合约地址' : currentLang === 'ja' ? 'コントラクトアドレス' : currentLang === 'ko' ? '컨트랙트 주소' : 'Contract Address', 14, yPos)
      doc.setFontSize(11)
      doc.setTextColor(75, 85, 99)
      doc.text(contractData.address, 14, yPos + 8)
      
      yPos += 20
      
      // 风险评分卡片
      if (data.riskScore) {
        doc.setFillColor(239, 68, 68) // 红色背景
        doc.roundedRect(14, yPos, 182, 30, 3, 3, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(16)
        doc.text(`${currentLang === 'zh' ? '风险评分' : currentLang === 'ja' ? 'リスクスコア' : currentLang === 'ko' ? '리스크 점수' : 'Risk Score'}: ${data.riskScore.score}`, 24, yPos + 15)
        
        doc.setFontSize(12)
        const levelText = currentLang === 'zh' ? '风险等级' : currentLang === 'ja' ? 'リスクレベル' : currentLang === 'ko' ? '리스크 레벨' : 'Risk Level'
        doc.text(`${levelText}: ${data.riskScore.level}`, 140, yPos + 15)
        
        yPos += 40
        
        // 风险详情
        if (data.riskScore.risks && data.riskScore.risks.length > 0) {
          doc.setFontSize(14)
          doc.setTextColor(31, 41, 55)
          doc.text(currentLang === 'zh' ? '发现的风险项' : currentLang === 'ja' ? '発見されたリスク項目' : currentLang === 'ko' ? '발견된 리스크 항목' : 'Identified Risks', 14, yPos)
          
          const riskTableData = data.riskScore.risks.map((risk, index) => [
            index + 1,
            risk.title,
            risk.description || '-'
          ])
          
          doc.autoTable({
            startY: yPos + 5,
            head: [['#', currentLang === 'zh' ? '风险项' : currentLang === 'ja' ? 'リスク項目' : currentLang === 'ko' ? '리스크 항목' : 'Risk Item', 
                    currentLang === 'zh' ? '描述' : currentLang === 'ja' ? '説明' : currentLang === 'ko' ? '설명' : 'Description']],
            body: riskTableData,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [239, 68, 68] },
          })
          
          yPos = doc.lastAutoTable.finalY + 15
        }
      }
      
      // 合约信息
      if (data.contractInfo) {
        doc.setFontSize(14)
        doc.setTextColor(31, 41, 55)
        doc.text(currentLang === 'zh' ? '合约信息' : currentLang === 'ja' ? 'コントラクト情報' : currentLang === 'ko' ? '컨트랙트 정보' : 'Contract Information', 14, yPos)
        
        const contractData = [
          [currentLang === 'zh' ? '名称' : currentLang === 'ja' ? '名前' : currentLang === 'ko' ? '이름' : 'Name', data.contractInfo.name || '-'],
          [currentLang === 'zh' ? '代号' : currentLang === 'ja' ? 'シンボル' : currentLang === 'ko' ? '심볼' : 'Symbol', data.contractInfo.symbol || '-'],
          [currentLang === 'zh' ? '精度' : currentLang === 'ja' ? '精度' : currentLang === 'ko' ? '정밀도' : 'Decimals', data.contractInfo.decimals || '-'],
          [currentLang === 'zh' ? '总供应量' : currentLang === 'ja' ? '総供給量' : currentLang === 'ko' ? '총 공급량' : 'Total Supply', data.contractInfo.totalSupply || '-'],
          [currentLang === 'zh' ? '验证状态' : currentLang === 'ja' ? '検証状態' : currentLang === 'ko' ? '검증 상태' : 'Verification', 
           data.contractInfo.verified ? (currentLang === 'zh' ? '已验证' : currentLang === 'ja' ? '検証済み' : currentLang === 'ko' ? '검증됨' : 'Verified') : 
           (currentLang === 'zh' ? '未验证' : currentLang === 'ja' ? '未検証' : currentLang === 'ko' ? '미검증' : 'Unverified')],
        ]
        
        doc.autoTable({
          startY: yPos + 5,
          head: [[currentLang === 'zh' ? '属性' : currentLang === 'ja' ? '属性' : currentLang === 'ko' ? '속성' : 'Property', 
                  currentLang === 'zh' ? '值' : currentLang === 'ja' ? '値' : currentLang === 'ko' ? '값' : 'Value']],
          body: contractData,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246] },
        })
        
        yPos = doc.lastAutoTable.finalY + 15
      }
      
      // 流动性信息
      if (data.liquidity) {
        doc.setFontSize(14)
        doc.setTextColor(31, 41, 55)
        doc.text(currentLang === 'zh' ? '流动性分析' : currentLang === 'ja' ? '流動性分析' : currentLang === 'ko' ? '유동성 분석' : 'Liquidity Analysis', 14, yPos)
        
        const liquidityData = [
          [currentLang === 'zh' ? '总储备' : currentLang === 'ja' ? '総準備金' : currentLang === 'ko' ? '총 준비금' : 'Total Reserves', `$${data.liquidity.totalReservesUSD || 0}`],
          [currentLang === 'zh' ? '池份额' : currentLang === 'ja' ? 'プールシェア' : currentLang === 'ko' ? '풀 점유율' : 'Pool Share', `${data.liquidity.poolShare || 0}%`],
        ]
        
        doc.autoTable({
          startY: yPos + 5,
          head: [[currentLang === 'zh' ? '指标' : currentLang === 'ja' ? '指標' : currentLang === 'ko' ? '지표' : 'Metric', 
                  currentLang === 'zh' ? '值' : currentLang === 'ja' ? '値' : currentLang === 'ko' ? '값' : 'Value']],
          body: liquidityData,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [16, 185, 129] },
        })
        
        yPos = doc.lastAutoTable.finalY + 15
      }
      
      // 代币经济学
      if (data.tokenomics) {
        doc.setFontSize(14)
        doc.setTextColor(31, 41, 55)
        doc.text(currentLang === 'zh' ? '代币经济学' : currentLang === 'ja' ? 'トークン経済学' : currentLang === 'ko' ? '토큰 이코노미' : 'Tokenomics', 14, yPos)
        
        const tokenomicsData = [
          [currentLang === 'zh' ? '税率' : currentLang === 'ja' ? '税率' : currentLang === 'ko' ? '세율' : 'Tax Rate', `${data.tokenomics.taxRate || 0}%`],
          [currentLang === 'zh' ? '最大交易' : currentLang === 'ja' ? '最大取引' : currentLang === 'ko' ? '최대 거래' : 'Max Transaction', data.tokenomics.maxTransaction || '-'],
        ]
        
        doc.autoTable({
          startY: yPos + 5,
          head: [[currentLang === 'zh' ? '项目' : currentLang === 'ja' ? '項目' : currentLang === 'ko' ? '항목' : 'Item', 
                  currentLang === 'zh' ? '值' : currentLang === 'ja' ? '値' : currentLang === 'ko' ? '값' : 'Value']],
          body: tokenomicsData,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [168, 85, 247] },
        })
        
        yPos = doc.lastAutoTable.finalY + 15
      }
      
      // 检查是否需要新页面
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      // 页脚
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text(`${currentLang === 'zh' ? '承泽查询系统 - DeFi 安全分析平台' : currentLang === 'ja' ? '承泽クエリシステム - DeFi セキュリティ分析プラットフォーム' : currentLang === 'ko' ? '승택 쿼리 시스템 - DeFi 보안 분석 플랫폼' : 'Chengze Query System - DeFi Security Analysis Platform'}`, 14, 285)
      doc.text(`${currentLang === 'zh' ? '本报告仅供参考，不构成投资建议' : currentLang === 'ja' ? '本レポートは参考のみであり、投資助言ではありません' : currentLang === 'ko' ? '본 보고서는 참고용이며 투자 조언이 아닙니다' : 'This report is for reference only and does not constitute investment advice'}`, 14, 290)
      
      // 保存PDF
      doc.save(`defi-report-${data.address.slice(0, 8)}.pdf`)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('PDF export failed: ' + error.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>📊</span>
        {t('export.title')}
      </h3>
      
      <div className="flex justify-center">
        {/* PDF 导出 */}
        <button
          onClick={exportToPDF}
          disabled={exporting}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 min-w-[250px] shadow-lg hover:shadow-xl"
        >
          <span className="text-2xl">📄</span>
          <div className="text-left">
            <div className="text-lg font-semibold">
              {exporting ? t('export.exporting') : t('export.pdf')}
            </div>
            <div className="text-sm opacity-90">
              {t('export.description')}
            </div>
          </div>
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-gray-400 text-xs">
          {currentLang === 'zh' ? 'PDF 报告包含完整的分析数据，可保存和分享' :
           currentLang === 'ja' ? 'PDF レポートには完全な分析データが含まれ、保存・共有が可能です' :
           currentLang === 'ko' ? 'PDF 보고서는 완전한 분석 데이터를 포함하며 저장 및 공유가 가능합니다' :
           'PDF report contains complete analysis data, ready to save and share'}
        </p>
      </div>
    </div>
  )
})

export default ExportReport
