import { useState, useEffect, useCallback } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'react-chartjs-2'

// Import components
import TechnicalAnalysis from './components/TechnicalAnalysis'
import TradingTools from './components/TradingTools'
import NewsFeed from './components/NewsFeed'
import Watchlist from './components/Watchlist'
import WebScraper from './components/WebScraper'
import PortfolioTracker from './components/PortfolioTracker'
import MultiTimeframeAnalysis from './components/MultiTimeframeAnalysis'

// Register ChartJS
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, ChartTooltip, Legend, Filler
)

// Types
interface Rate {
  pair: string
  bid: number
  ask: number
  change: number
  changePercent: number
}

// Generate random rate
const generateRate = (pair: string): Rate => {
  const base: Record<string, number> = {
    'EUR/USD': 1.0850, 'GBP/USD': 1.2650, 'USD/JPY': 150.50, 'USD/CHF': 0.8850,
    'AUD/USD': 0.6550, 'USD/CAD': 1.3550, 'NZD/USD': 0.6050, 'EUR/GBP': 0.8580,
    'EUR/JPY': 163.20, 'GBP/JPY': 190.50, 'EUR/CHF': 0.9600, 'AUD/JPY': 98.50,
    'USD/IDR': 15650, 'USD/SGD': 1.3450, 'AUD/NZD': 1.0850
  }
  const price = base[pair] || 1.0
  const spread = pair.includes('JPY') ? 0.02 : pair.includes('IDR') ? 20 : 0.0002
  const change = (Math.random() - 0.5) * price * 0.003
  return {
    pair,
    bid: price + change,
    ask: price + change + spread,
    change: change,
    changePercent: (change / price) * 100
  }
}

// Generate chart data
const generateChartData = (pair: string) => {
  const base = pair.includes('JPY') ? 150 : pair.includes('IDR') ? 15600 : 1.08
  const labels = Array.from({ length: 24 }, (_, i) => `${i + 9}:00`)
  const prices = Array.from({ length: 24 }, () => base + (Math.random() - 0.5) * base * 0.01)
  return { labels, prices }
}

// Navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'analysis', label: 'Analysis', icon: '📈' },
  { id: 'tools', label: 'Tools', icon: '🧮' },
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'watchlist', label: 'Watchlist', icon: '⭐' },
  { id: 'portfolio', label: 'Portfolio', icon: '💼' },
  { id: 'scraper', label: 'Scraper', icon: '🕷️' },
]

// Main App
function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedPair, setSelectedPair] = useState('EUR/USD')
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [rates, setRates] = useState<Rate[]>([])
  const [chartData, setChartData] = useState<{ labels: string[], prices: number[] }>({ labels: [], prices: [] })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'EUR/GBP', 'EUR/JPY']

  const refreshData = useCallback(() => {
    const newRates = pairs.map(generateRate)
    setRates(newRates)
    setChartData(generateChartData(selectedPair))
    setLastUpdated(new Date())
  }, [selectedPair])

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 5000)
    return () => clearInterval(interval)
  }, [refreshData])

  // Quick stats
  const gainers = rates.filter(r => r.changePercent > 0).length
  const losers = rates.filter(r => r.changePercent < 0).length
  const selectedRate = rates.find(r => r.pair === selectedPair)

  // Chart config
  const lineChartData = {
    labels: chartData.labels,
    datasets: [{
      label: selectedPair,
      data: chartData.prices,
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a24',
        borderColor: '#2a2a3a',
        borderWidth: 1,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#71717a' } },
      y: { grid: { color: 'rgba(42, 42, 58, 0.5)' }, ticks: { color: '#71717a' } }
    },
  }

  return (
    <div className="app-background min-h-screen flex">
      {/* Left Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#0f0f14] border-r border-[#2a2a3a] flex flex-col transition-all duration-300 fixed h-full z-50`}>
        {/* Logo */}
        <div className="p-4 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl">
              📈
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-white">Forex</h1>
                <p className="text-xs text-gray-500">Analytics Pro</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-[#1a1a24] hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-[#2a2a3a]">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1a1a24] rounded-lg text-gray-400 hover:text-white"
          >
            <span>{sidebarCollapsed ? '→' : '←'}</span>
            {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Top Header */}
        <header className="h-16 bg-[#0f0f14]/80 backdrop-blur-xl border-b border-[#2a2a3a] sticky top-0 z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              {navItems.find(n => n.id === activeTab)?.icon} {navItems.find(n => n.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Pair Selector */}
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-2 text-white"
            >
              {pairs.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
            
            {/* Refresh */}
            <button onClick={refreshData} className="btn-secondary flex items-center gap-2">
              🔄 Refresh
            </button>
            
            {/* Time */}
            <div className="text-right">
              <div className="text-xs text-gray-500">Last updated</div>
              <div className="text-sm text-white">{lastUpdated.toLocaleTimeString()}</div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                <div className="forex-card p-4">
                  <div className="text-gray-500 text-sm mb-1">Gainers</div>
                  <div className="text-2xl font-bold text-green-400">{gainers}</div>
                </div>
                <div className="forex-card p-4">
                  <div className="text-gray-500 text-sm mb-1">Losers</div>
                  <div className="text-2xl font-bold text-red-400">{losers}</div>
                </div>
                <div className="forex-card p-4">
                  <div className="text-gray-500 text-sm mb-1">{selectedPair}</div>
                  <div className="text-2xl font-bold text-white">{selectedRate?.bid.toFixed(4) || '—'}</div>
                </div>
                <div className="forex-card p-4">
                  <div className="text-gray-500 text-sm mb-1">Signal</div>
                  <div className="text-2xl font-bold text-green-400">BUY</div>
                </div>
              </div>

              {/* Main Chart */}
              <div className="chart-wrapper">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">{selectedPair} Price Chart</h3>
                  <div className="flex gap-2">
                    {['1H', '4H', '1D', '1W'].map(tf => (
                      <button key={tf} className="px-3 py-1 text-sm bg-[#1a1a24] text-gray-400 rounded hover:text-white">
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                      <XAxis dataKey="labels" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '8px' }} />
                      <Line dataKey="data" stroke="#8b5cf6" fill="rgba(139, 92, 246, 0.1)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Live Rates Grid */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Live Rates</h3>
                <div className="grid grid-cols-4 gap-4">
                  {rates.map(rate => (
                    <button
                      key={rate.pair}
                      onClick={() => setSelectedPair(rate.pair)}
                      className={`rate-card text-left ${selectedPair === rate.pair ? 'border-purple-500' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-white">{rate.pair}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${rate.changePercent >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                          {rate.changePercent >= 0 ? '▲' : '▼'} {Math.abs(rate.changePercent).toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-lg font-bold text-white">{rate.bid.toFixed(4)}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other Tabs */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <TechnicalAnalysis pair={selectedPair} timeframe="1h" />
              <MultiTimeframeAnalysis />
            </div>
          )}

          {activeTab === 'tools' && <TradingTools />}
          {activeTab === 'news' && <NewsFeed pair={selectedPair} />}
          {activeTab === 'watchlist' && <Watchlist />}
          {activeTab === 'portfolio' && <PortfolioTracker />}
          {activeTab === 'scraper' && <WebScraper />}
        </div>
      </main>
    </div>
  )
}

export default App
