import { useTranslation } from 'react-i18next'
import { useState, useEffect, memo } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import '../mobile.css'

const Header = memo(function Header() {
  const { t } = useTranslation()
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)

  // 检测可用的钱包
  const getAvailableWallets = () => {
    const wallets = []
    
    // MetaMask
    if (window.ethereum?.isMetaMask) {
      wallets.push({
        name: 'MetaMask',
        icon: '🦊',
        provider: window.ethereum
      })
    }
    
    // Trust Wallet
    if (window.ethereum?.isTrust) {
      wallets.push({
        name: 'Trust Wallet',
        icon: '🛡️',
        provider: window.ethereum
      })
    }
    
    // Coin98
    if (window.ethereum?.isCoin98) {
      wallets.push({
        name: 'Coin98',
        icon: '🌊',
        provider: window.ethereum
      })
    }
    
    // TP 钱包
    if (window.ethereum?.isTokenPocket) {
      wallets.push({
        name: 'TokenPocket',
        icon: '💎',
        provider: window.ethereum
      })
    }
    
    // OKX 钱包
    if (window.ethereum?.isOKExWallet) {
      wallets.push({
        name: 'OKX Wallet',
        icon: '⭕',
        provider: window.ethereum
      })
    }
    
    // imToken
    if (window.ethereum?.isImToken) {
      wallets.push({
        name: 'imToken',
        icon: '📱',
        provider: window.ethereum
      })
    }
    
    // MathWallet
    if (window.ethereum?.isMathWallet) {
      wallets.push({
        name: 'MathWallet',
        icon: '🧮',
        provider: window.ethereum
      })
    }
    
    // 其他 Web3 钱包
    if (window.ethereum && wallets.length === 0) {
      wallets.push({
        name: 'Web3 Wallet',
        icon: '🔗',
        provider: window.ethereum
      })
    }
    
    return wallets
  }

  const connectWallet = async (wallet) => {
    setIsConnecting(true)
    try {
      const accounts = await wallet.provider.request({
        method: 'eth_requestAccounts'
      })
      setWalletAddress(accounts[0])
      setShowWalletModal(false)
    } catch (error) {
      console.error('钱包连接失败:', error)
      alert(t('wallet.connectError'))
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress('')
  }

  useEffect(() => {
    const checkWallet = async () => {
      const wallets = getAvailableWallets()
      if (wallets.length > 0) {
        try {
          const accounts = await wallets[0].provider.request({
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

  const availableWallets = getAvailableWallets()

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h1 className="text-xl font-bold text-white">{t('header.systemName')}</h1>
            <p className="text-sm text-gray-400 hidden sm:block">{t('header.systemDesc')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          
          {/* 钱包连接按钮 */}
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <div className="bg-gray-700 px-3 py-2 rounded-lg text-sm text-gray-300 hidden sm:block">
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
              onClick={() => setShowWalletModal(true)}
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
            className="text-gray-400 hover:text-white transition-colors hidden sm:block"
          >
            <span className="text-lg">📁</span>
          </a>
        </div>
      </div>

      {/* 钱包选择模态框 */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {t('wallet.selectWallet')}
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {availableWallets.length > 0 ? (
                availableWallets.map((wallet, index) => (
                  <button
                    key={index}
                    onClick={() => connectWallet(wallet)}
                    disabled={isConnecting}
                    className="w-full flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <span className="text-xl">{wallet.icon}</span>
                    <span className="text-white">{wallet.name}</span>
                    {isConnecting && (
                      <div className="ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-4">{t('wallet.installMetaMask')}</p>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    安装 MetaMask →
                  </a>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-xs">
                支持主流 EVM 钱包连接
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
})

export default Header
