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

  const exportToJSON = () => {
    setExporting(true)
    try {
      const report = {
        contractAddress,
        timestamp: new Date().toISOString(),
        language: i18n.language,
        data: data
      }
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `defi-report-${contractAddress.slice(0, 8)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('JSON export error:', error)
      alert(t('export.error'))
    } finally {
      setExporting(false)
    }
  }

  const exportToCSV = () => {
    setExporting(true)
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // 标题行
      const currentLang = i18n.language
      const headers = [
        currentLang === 'zh' ? '项目' : currentLang === 'ja' ? '項目' : currentLang === 'ko' ? '항목' : 'Item',
        currentLang === 'zh' ? '值' : currentLang === 'ja' ? '値' : currentLang === 'ko' ? '값' : 'Value'
      ]
      csvContent += headers.join(",") + "\r\n"
      
      // 合约信息
      if (data.contractInfo) {
        csvContent += `${t('contract.name')},${data.contractInfo.name || '-'}\r\n`
        csvContent += `${t('contract.symbol')},${data.contractInfo.symbol || '-'}\r\n`
        csvContent += `${t('contract.decimals')},${data.contractInfo.decimals || '-'}\r\n`
        csvContent += `${t('contract.totalSupply')},${data.contractInfo.totalSupply || '-'}\r\n`
      }
      
      // 风险评分
      if (data.riskScore) {
        csvContent += `${t('contract.score')},${data.riskScore.score}\r\n`
        csvContent += `${t('contract.level')},${data.riskScore.level}\r\n`
      }
      
      // 流动性
      if (data.liquidity) {
        csvContent += `${t('poolReserves')},$${data.liquidity.totalReservesUSD || 0}\r\n`
      }
      
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `defi-report-${contractAddress.slice(0, 8)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('CSV export error:', error)
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PDF 导出 */}
        <button
          onClick={exportToPDF}
          disabled={exporting}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <span>📄</span>
          {exporting ? t('export.exporting') : t('export.pdf')}
        </button>
        
        {/* JSON 导出 */}
        <button
          onClick={exportToJSON}
          disabled={exporting}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <span>📋</span>
          {exporting ? t('export.exporting') : t('export.json')}
        </button>
        
        {/* CSV 导出 */}
        <button
          onClick={exportToCSV}
          disabled={exporting}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <span>📈</span>
          {exporting ? t('export.exporting') : t('export.csv')}
        </button>
      </div>
      
      <p className="text-gray-400 text-sm mt-4">
        {t('export.description')}
      </p>
    </div>
  )
})

export default ExportReport
