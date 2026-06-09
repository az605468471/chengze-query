import { useState } from 'react'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import RiskScore from '../components/RiskScore'
import ContractInfo from '../components/ContractInfo'
import HolderDistribution from '../components/HolderDistribution'
import LiquidityInfo from '../components/LiquidityInfo'
import TransactionHistory from '../components/TransactionHistory'
import PriceHistory from '../components/PriceHistory'
import ContractSecurity from '../components/ContractSecurity'
import Tokenomics from '../components/Tokenomics'
import LiquiditySafety from '../components/LiquiditySafety'
import Governance from '../components/Governance'
import TeamBackground from '../components/TeamBackground'
import OnchainAnalysis from '../components/OnchainAnalysis'
import ExportReport from '../components/ExportReport'

export default function Home() {
  const [contractData, setContractData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SearchBar 
          onResults={setContractData}
          onLoading={setIsLoading}
        />
        
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">分析中...</p>
          </div>
        )}
        
        {contractData && !isLoading && (
          <>
            <div className="flex justify-end mb-4">
              <ExportReport contractData={contractData} />
            </div>
            <RiskScore score={contractData.riskScore?.score} risks={contractData.riskScore?.risks} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <ContractInfo contract={contractData.contractInfo} />
              <HolderDistribution holders={contractData.holderData} />
              <LiquidityInfo liquidity={contractData.liquidityData} />
              <TransactionHistory transactions={contractData.transactions} />
              <PriceHistory price={contractData.priceHistory} />
              <ContractSecurity security={contractData.contractSecurity} />
              <Tokenomics tokenomics={contractData.tokenomics} />
              <LiquiditySafety liquiditySafety={contractData.liquiditySafety} />
              <Governance governance={contractData.governance} />
              <TeamBackground team={contractData.teamBackground} />
              <OnchainAnalysis analysis={contractData.onchainAnalysis} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}