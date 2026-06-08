import { ethers } from 'ethers';

// Web3 工具函数
export const getProvider = () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('请安装 MetaMask 或其他 Web3 钱包');
  }
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
};

export const connectWallet = async () => {
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    return accounts[0];
  } catch (error) {
    console.error('连接钱包失败:', error);
    throw error;
  }
};

export const disconnectWallet = () => {
  // MetaMask 没有断开连接的 API，只需清除本地状态
  return null;
};

export const getBalance = async (address) => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('获取余额失败:', error);
    throw error;
  }
};

export const getTokenBalance = async (tokenAddress, walletAddress) => {
  try {
    const provider = getProvider();
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
      provider
    );
    
    const [balance, decimals] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.decimals()
    ]);
    
    return ethers.utils.formatUnits(balance, decimals);
  } catch (error) {
    console.error('获取代币余额失败:', error);
    throw error;
  }
};

export const getNetwork = async () => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    return network;
  } catch (error) {
    console.error('获取网络信息失败:', error);
    throw error;
  }
};

export const switchToBSC = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x38' }], // BSC Mainnet
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x38',
          chainName: 'Binance Smart Chain',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
          },
          rpcUrls: ['https://bsc-dataseed.binance.org/'],
          blockExplorerUrls: ['https://bscscan.com/']
        }]
      });
    } else {
      throw error;
    }
  }
};