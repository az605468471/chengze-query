import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const PaymentPage = () => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('USDT');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  // BSC 收款钱包地址
  const PAYMENT_WALLET = '0x105071cFde8Fbf8D9b2f869409d6380A42037685';

  const plans = [
    {
      id: 'single',
      name: '单次查询',
      price: '1.99',
      description: '单次完整分析',
      queries: 1,
      priceUSD: 1.99,
    },
    {
      id: 'pack10',
      name: '10次套餐',
      price: '15',
      description: '省 $4.9，有效期30天',
      queries: 10,
      priceUSD: 15,
      discount: '25%',
    },
    {
      id: 'pack50',
      name: '50次套餐',
      price: '50',
      description: '省 $49.5，有效期90天',
      queries: 50,
      priceUSD: 50,
      discount: '50%',
    },
  ];

  const paymentMethods = [
    { id: 'USDT', name: 'USDT (BEP-20)', icon: '💵' },
    { id: 'USDC', name: 'USDC (BEP-20)', icon: '💰' },
    { id: 'BNB', name: 'BNB', icon: '🟡' },
  ];

  const handlePayment = async () => {
    if (!selectedPlan) {
      alert('请选择套餐');
      return;
    }

    setLoading(true);
    
    // 这里将来需要集成 Web3 钱包
    // 目前显示支付信息
    const plan = plans.find(p => p.id === selectedPlan);
    
    // 模拟生成交易哈希（实际使用时需要真实交易）
    const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
    setTxHash(mockTxHash);
    
    // 这里将来需要：
    // 1. 连接钱包（MetaMask/Trust Wallet）
    // 2. 发送交易到 PAYMENT_WALLET
    // 3. 等待交易确认
    // 4. 验证支付并激活套餐
    
    alert(`请将 ${plan.price} ${paymentMethod} 转账到：\n${PAYMENT_WALLET}\n\n交易哈希：${mockTxHash}`);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          💎 选择套餐
        </h1>
        
        {/* 套餐选择 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`bg-gray-800 rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'border-2 border-gray-700 hover:border-gray-600'
              }`}
            >
              {plan.discount && (
                <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-3">
                  省 {plan.discount}
                </span>
              )}
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                ${plan.price}
              </div>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
              <div className="text-gray-300">
                <span className="font-medium">{plan.queries} 次</span> 查询
              </div>
            </div>
          ))}
        </div>

        {/* 支付方式选择 */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">选择支付方式</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === method.id
                    ? 'border-blue-500 bg-gray-700'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-2">{method.icon}</div>
                <div className="text-white font-medium">{method.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 支付信息 */}
        {selectedPlan && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">支付详情</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">套餐</span>
                <span className="text-white">{plans.find(p => p.id === selectedPlan)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">金额</span>
                <span className="text-white font-bold">
                  {plans.find(p => p.id === selectedPlan)?.price} {paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">收款钱包</span>
                <span className="text-white text-sm break-all">{PAYMENT_WALLET}</span>
              </div>
            </div>
          </div>
        )}

        {/* 支付按钮 */}
        <button
          onClick={handlePayment}
          disabled={!selectedPlan || loading}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
            !selectedPlan || loading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          }`}
        >
          {loading ? '处理中...' : '确认支付'}
        </button>

        {/* 交易哈希 */}
        {txHash && (
          <div className="mt-6 bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-2">交易哈希:</p>
            <p className="text-white text-sm break-all">{txHash}</p>
          </div>
        )}

        {/* 提示信息 */}
        <div className="mt-8 bg-yellow-900/30 border border-yellow-700 rounded-xl p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">⚠️ 注意事项</h3>
          <ul className="text-yellow-200 text-sm space-y-1">
            <li>• 请确保在 BSC 链上转账</li>
            <li>• 转账后请等待交易确认</li>
            <li>• 如有问题请联系客服</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;