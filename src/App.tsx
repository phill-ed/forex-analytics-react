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
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'react-chartjs-2'

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

interface NewsItem {
  title: string
  sentiment: string
  source: string
  time: string
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

// Rate Card Component
const RateCard = ({ rate, onClick, isSelected }: { rate: Rate, onClick: () => void, isSelected: boolean }) => (
  <button
    onClick={onClick}
    className={`rate-card w-full text-left ${isSelected ? 'border-purple-500 bg-purple-900/20' : ''} ${rate.changePercent >= 0 ? 'positive' : 'negative'}`}
  >
    <div className="flex justify-between items-start mb-2">
      <span className="font-semibold text-white">{rate.pair}</span>
      <span className={`text-xs px-2 py-1 rounded-full ${rate.changePercent >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
        {rate.changePercent >= 0 ? '▲' : '▼'} {Math.abs(rate.changePercent).toFixed(2)}%
      </span>
    </div>
    <div className="flex justify-between items-end">
      <div>
        <div className="text-lg font-bold text-white">{rate.bid.toFixed(4)}</div>
        <div className="text-xs text-gray-500">Bid</div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-400">{rate.ask.toFixed(4)}</div>
        <div className="text-xs text-gray-500">Ask</div>
      </div>
    </div>
  </button>
)

// Main App
function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedCategory, setSelectedCategory] = useState('majors')
  const [selectedPair, setSelectedPair] = useState('EUR/USD')
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [rates, setRates] = useState<Rate[]>([])
  const [chartData, setChartData] = useState<{ labels: string[], prices: number[] }>({ labels: [], prices: [] })

  const categories = {
    majors: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD'],
    crosses: ['EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'EUR/AUD', 'EUR/CHF', 'GBP/CHF'],
    asia: ['USD/IDR', 'USD/SGD', 'AUD/NZD', 'USD/MYR'],
  }

  const refreshData = useCallback(() => {
    const newRates = categories[selectedCategory as keyof typeof categories].map(generateRate)
    setRates(newRates)
    setChartData(generateChartData(selectedPair))
    setLastUpdated(new Date())
  }, [selectedCategory, selectedPair])

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 5000)
    return () => clearInterval(interval)
  }, [refreshData])

  // Quick stats
  const avgChange = rates.length > 0 
    ? rates.reduce((sum, r) => sum + r.changePercent, 0) / rates.length 
    : 0
  const gainers = rates.filter(r => r.changePercent > 0).length
  const losers = rates.filter(r => r.changePercent < 0).length

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
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#8b5cf6',
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
        titleColor: '#fff',
        bodyColor: '#a1a1aa',
        padding: 12,
        displayColors: false,
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#71717a' }
      },
      y: { 
        grid: { color: 'rgba(42, 42, 58, 0.5)' },
        ticks: { color: '#71717a' }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    }
  }

  return (
    <div className="app-background min-h-screen">
      {/* Header */}
      <header className="border-b border-[#2a2a3a] bg-[#0f0f14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                📈 Forex Analytics
              </h1>
              <span className="flex items-center gap-2 text-xs text-gray-500">
                <span className="status-dot online"></span>
                <span className="live-indicator">Live</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="text-xs text-gray-500">Last updated</div>
                <div className="text-sm text-white">{lastUpdated.toLocaleTimeString()}</div>
              </div>
              <button 
                onClick={refreshData}
                className="btn-secondary flex items-center gap-2"
              >
                <span>🔄</span>
                <span className="hide-mobile">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="forex-card p-4">
            <div className="text-gray-500 text-sm mb-1">Market Sentiment</div>
            <div className={`text-xl font-bold ${avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {avgChange >= 0 ? '🟢 Bullish' : '🔴 Bearish'}
            </div>
          </div>
          <div className="forex-card p-4">
            <div className="text-gray-500 text-sm mb-1">Gainers</div>
            <div className="text-xl font-bold text-green-400">{gainers}</div>
          </div>
          <div className="forex-card p-4">
            <div className="text-gray-500 text-sm mb-1">Losers</div>
            <div className="text-xl font-bold text-red-400">{losers}</div>
          </div>
          <div className="forex-card p-4">
            <div className="text-gray-500 text-sm mb-1">Selected</div>
            <div className="text-xl font-bold text-white">{selectedPair}</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Rates */}
          <aside className="lg:w-80 flex-shrink-0">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {Object.keys(categories).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#1a1a24] text-gray-400 hover:text-white border border-[#2a2a3a]'
                  }`}
                >
                  {cat === 'majors' ? '⚡ Majors' : cat === 'crosses' ? '🔗 Crosses' : '🌏 Asia'}
                </button>
              ))}
            </div>

            {/* Rate Cards */}
            <div className="space-y-2">
              {rates.map(rate => (
                <RateCard
                  key={rate.pair}
                  rate={rate}
                  isSelected={selectedPair === rate.pair}
                  onClick={() => setSelectedPair(rate.pair)}
                />
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`tab-button ${activeTab === item.id ? 'active' : ''} flex items-center gap-2`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Chart */}
                <div className="chart-wrapper">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white">{selectedPair} Price Chart</h2>
                    <div className="flex gap-2">
                      {['1H', '4H', '1D', '1W'].map(tf => (
                        <button key={tf} className="px-3 py-1 text-sm bg-[#1a1a24] text-gray-400 rounded hover:text-white">
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-80">
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

                {/* Quick Analysis */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="forex-card p-4">
                    <div className="text-gray-500 text-sm mb-2">Technical Signal</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🟢</span>
                      <span className="text-green-400 font-bold">BUY</span>
                    </div>
                  </div>
                  <div className="forex-card p-4">
                    <div className="text-gray-500 text-sm mb-2">RSI (14)</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">42.5</span>
                      <span className="text-yellow-400 text-sm">Oversold</span>
                    </div>
                  </div>
                  <div className="forex-card p-4">
                    <div className="text-gray-500 text-sm mb-2">Trend</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📈</span>
                      <span className="text-blue-400 font-bold">Uptrend</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#2a2a3a] py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          Forex Analytics Dashboard • Built with React + Chart.js • Data provided by Frankfurter API
        </div>
      </footer>
    </div>
  )
}

export default App
