import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './i18n'
import Home from './pages/Home'
import Payment from './pages/Payment'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

function App() {
  const { t } = useTranslation()
  
  // 更新页面标题
  useEffect(() => {
    document.title = t('header.systemName') + ' - ' + t('title')
  }, [t])
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/address/:address" element={<Home />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </Router>
  )
}

export default App