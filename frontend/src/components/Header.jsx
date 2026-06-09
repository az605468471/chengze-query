import { useTranslation } from 'react-i18next'
import { useState, useEffect, memo } from 'react'
import LanguageSwitcher from './LanguageSwitcher'

const Header = memo(function Header() {
  const { t } = useTranslation()
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert(t('wallet.installMetaMask'))
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      setWalletAddress(accounts[0])
    } catch (error) {
      console.error(t('wallet.connectError'), error)
      alert(t('wallet.connectError'))
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress('')
  }

  useEffect(() => {
    // 检查是否已连接
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          })
          if (accounts.length > 0) {
            setWalletAddress(accounts[0])
          }
        } catch (error) {
          console.error(t('wallet.checkError'), error)
        }
      }
    }
    checkWallet()
  }, [])

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h1 className="text-xl font-bold text-white">{t('header.systemName')}</h1>
            <p className="text-sm text-gray-400">{t('header.systemDesc')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          
          {/* 钱包连接按钮 */}
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <div className="bg-gray-700 px-3 py-2 rounded-lg text-sm text-gray-300">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
              <button
                onClick={disconnectWallet}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                {t('wallet.disconnect')}
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <span className="text-sm">💰</span>
              {isConnecting ? t('wallet.connecting') : t('wallet.connect')}
            </button>
          )}
          
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-lg">📁</span>
          </a>
        </div>
      </div>
    </header>
  )
})

export default Header
