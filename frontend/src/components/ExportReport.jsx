import { useTranslation } from 'react-i18next'
import { useState, memo } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const ExportReport = memo(function ExportReport({ data, contractAddress }) {
  const { t, i18n } = useTranslation()
  const [exporting, setExporting] = useState(false)

  const exportToPDF = async () => {
    setExporting(true)
    try {
      const doc = new jsPDF()
      const currentLang = i18n.language
      
      // 标题
      doc.setFontSize(20)
      doc.text(currentLang === 'zh' ? 'DeFi 项目分析报告' : 
              currentLang === 'ja' ? 'DeFi プロジェクト分析レポート' :
              currentLang === 'ko' ? 'DeFi 프로젝트 분석 보고서' :
              'DeFi Project Analysis Report', 14, 22)
      
      // 合约地址
      doc.setFontSize(12)
      doc.text(`${t('contract.name')}: ${contractAddress}`, 14, 35)
      
      // 风险评分
      if (data.riskScore) {
        doc.setFontSize(14)
        doc.text(t('risk.foundRisks'), 14, 50)
        
        const riskData = [
          [t('contract.score'), data.riskScore.score],
          [t('contract.level'), data.riskScore.level],
          [t('contract.risks'), data.riskScore.risks?.length || 0]
        ]
        
        doc.autoTable({
          startY: 55,
          head: [[currentLang === 'zh' ? '项目' : currentLang === 'ja' ? '項目' : currentLang === 'ko' ? '항목' : 'Item', 
                  currentLang === 'zh' ? '值' : currentLang === 'ja' ? '値' : currentLang === 'ko' ? '값' : 'Value']],
          body: riskData,
        })
      }
      
      // 合约信息
      if (data.contractInfo) {
        doc.setFontSize(14)
        doc.text(t('results.contractInfo'), 14, doc.lastAutoTable.finalY + 15)
        
        const contractData = [
          [t('contract.name'), data.contractInfo.name || '-'],
          [t('contract.symbol'), data.contractInfo.symbol || '-'],
          [t('contract.decimals'), data.contractInfo.decimals || '-'],
          [t('contract.totalSupply'), data.contractInfo.totalSupply || '-'],
          [t('contract.verified'), data.contractInfo.verified ? t('contract.verified') : t('contract.unverified')],
        ]
        
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 20,
          head: [[currentLang === 'zh' ? '属性' : currentLang === 'ja' ? '属性' : currentLang === 'ko' ? '속성' : 'Property', 
                  currentLang === 'zh' ? '值' : currentLang === 'ja' ? '値' : currentLang === 'ko' ? '값' : 'Value']],
          body: contractData,
        })
      }
      
      // 流动性信息
      if (data.liquidity) {
        doc.setFontSize(14)
        doc.text(t('results.liquidity'), 14, doc.lastAutoTable.finalY + 15)
        
        const liquidityData = [
          [t('poolReserves'), `$${data.liquidity.totalReservesUSD || 0}`],
          [t('poolShare'), `${data.liquidity.poolShare || 0}%`],
        ]
        
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 20,
          head: [[currentLang === 'zh' ? '指标' : currentLang === 'ja' ? '指標' : currentLang === 'ko' ? '지표' : 'Metric', 
                  currentLang === 'zh' ? '值' : currentLang === 'ja' ? '値' : currentLang === 'ko' ? '값' : 'Value']],
          body: liquidityData,
        })
      }
      
      // 保存PDF
      doc.save(`defi-report-${contractAddress.slice(0, 8)}.pdf`)
    } catch (error) {
      console.error('PDF export error:', error)
      alert(t('export.error'))
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
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 min-w-[200px]"
        >
          <span>📄</span>
          {exporting ? t('export.exporting') : t('export.pdf')}
        </button>
      </div>
      
      <p className="text-gray-400 text-sm mt-4 text-center">
        {t('export.description')}
      </p>
    </div>
  )
})

export default ExportReport
