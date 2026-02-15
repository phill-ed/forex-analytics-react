import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js'
import { 
  Globe, TrendingUp, TrendingDown, Filter, RefreshCw, 
  Calendar, Building2, BarChart3, ExternalLink, Search,
  ChevronDown, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

// News API - using free APIs
const NEWS_SOURCES = [
  { id: 'forexfactory', name: 'Forex Factory', url: 'https://www.forexfactory.com', category: 'forex' },
  { id: 'investing', name: 'Investing.com', url: 'https://www.investing.com', category: 'forex' },
  { id: 'reuters', name: 'Reuters', url: 'https://www.reuters.com', category: 'general' },
  { id: 'bloomberg', name: 'Bloomberg', url: 'https://www.bloomberg.com', category: 'general' },
  { id: 'fxstreet', name: 'FXStreet', url: 'https://www.fxstreet.com', category: 'forex' },
]

// Economic Calendar Events
const ECONOMIC_EVENTS = [
  { id: 1, time: '01:00', event: 'ECB President Lagarde Speaks', impact: 'high', currency: 'EUR', actual: '-', forecast: '-', previous: '-' },
  { id: 2, time: '01:30', event: 'Germany CPI Flash YoY', impact: 'high', currency: 'EUR', actual: '2.4%', forecast: '2.5%', previous: '2.6%' },
  { id: 3, time: '02:00', event: 'UK GDP MoM', impact: 'high', currency: 'GBP', actual: '0.2%', forecast: '0.1%', previous: '0.1%' },
  { id: 4, time: '03:30', event: 'Australia Employment Change', impact: 'high', currency: 'AUD', actual: '35.5K', forecast: '20.0K', previous: '18.5K' },
  { id: 5, time: '05:00', event: 'Japan Consumer Confidence', impact: 'medium', currency: 'JPY', actual: '38.2', forecast: '39.0', previous: '39.2' },
  { id: 6, time: '07:00', event: 'Germany Trade Balance', impact: 'medium', currency: 'EUR', actual: '18.2B', forecast: '17.5B', previous: '17.8B' },
  { id: 7, time: '08:30', event: 'UK Industrial Production MoM', impact: 'medium', currency: 'GBP', actual: '0.2%', forecast: '0.1%', previous: '-0.1%' },
  { id: 8, time: '09:00', event: 'EU GDP Growth QoQ', impact: 'high', currency: 'EUR', actual: '0.3%', forecast: '0.2%', previous: '0.2%' },
  { id: 9, time: '10:00', event: 'US NFIB Small Business Optimism', impact: 'medium', currency: 'USD', actual: '93.8', forecast: '94.0', previous: '93.7' },
  { id: 10, time: '11:00', event: 'US JOLTS Job Openings', impact: 'high', currency: 'USD', actual: '8.79M', forecast: '8.70M', previous: '8.85M' },
  { id: 11, time: '13:30', event: 'US PPI MoM', impact: 'high', currency: 'USD', actual: '0.4%', forecast: '0.3%', previous: '0.2%' },
  { id: 12, time: '15:00', event: 'US Michigan Consumer Sentiment', impact: 'high', currency: 'USD', actual: '71.2', forecast: '72.0', previous: '73.2' },
]

// Central Bank Rates
const CENTRAL_BANKS = [
  { bank: 'Federal Reserve', rate: '4.50%', change: '0.00%', date: '2024-01-31', trend: 'stable' },
  { bank: 'European Central Bank', rate: '4.50%', change: '0.00%', date: '2024-01-25', trend: 'stable' },
  { bank: 'Bank of England', rate: '5.25%', change: '0.00%', date: '2024-02-01', trend: 'stable' },
  { bank: 'Bank of Japan', rate: '-0.10%', change: '0.00%', date: '2024-01-23', trend: 'stable' },
  { bank: 'Reserve Bank of Australia', rate: '4.35%', change: '+0.25%', date: '2024-02-06', trend: 'up' },
  { bank: 'Swiss National Bank', rate: '1.75%', change: '0.00%', date: '2024-03-21', trend: 'stable' },
  { bank: 'Bank of Canada', rate: '5.00%', change: '0.00%', date: '2024-03-06', trend: 'stable' },
  { bank: 'Reserve Bank of NZ', rate: '5.50%', change: '0.00%', date: '2024-02-28', trend: 'stable' },
]

// Inflation Data
const INFLATION_DATA = [
  { country: 'US', rate: '3.2%', previous: '3.4%', trend: 'down', target: '2.0%' },
  { country: 'EU', rate: '2.6%', previous: '2.8%', trend: 'down', target: '2.0%' },
  { country: 'UK', rate: '3.9%', previous: '4.0%', trend: 'down', target: '2.0%' },
  { country: 'Japan', rate: '2.6%', previous: '2.7%', trend: 'down', target: '2.0%' },
  { country: 'Australia', rate: '4.1%', previous: '4.3%', trend: 'down', target: '2-3%' },
  { country: 'Canada', rate: '2.9%', previous: '3.1%', trend: 'down', target: '2.0%' },
  { country: 'Switzerland', rate: '1.6%', previous: '1.7%', trend: 'down', target: '2.0%' },
  { country: 'China', rate: '0.8%', previous: '0.5%', trend: 'up', target: '3.0%' },
]

// Sentiment keywords for forex news
const SENTIMENT_KEYWORDS = {
  positive: ['bullish', 'rise', 'gain', 'profit', 'growth', 'increase', 'surge', 'rally', 'improve', 'strong', 'positive', 'higher', 'beat', 'exceed'],
  negative: ['bearish', 'fall', 'drop', 'loss', 'decline', 'decrease', 'plunge', 'weaken', 'weak', 'negative', 'lower', 'miss', 'below', 'concern'],
  neutral: ['stable', 'unchanged', 'steady', 'flat', 'hold', 'maintain', 'unchanged']
}

// Simple sentiment analysis function
const analyzeSentiment = (text: string): { sentiment: 'positive' | 'negative' | 'neutral', score: number } => {
  const lowerText = text.toLowerCase()
  let positiveCount = 0
  let negativeCount = 0
  
  SENTIMENT_KEYWORDS.positive.forEach(word => {
    if (lowerText.includes(word)) positiveCount++
  })
  
  SENTIMENT_KEYWORDS.negative.forEach(word => {
    if (lowerText.includes(word)) negativeCount++
  })
  
  const total = positiveCount + negativeCount
  if (total === 0) return { sentiment: 'neutral', score: 0 }
  
  const score = (positiveCount - negativeCount) / total
  if (score > 0.2) return { sentiment: 'positive', score }
  if (score < -0.2) return { sentiment: 'negative', score }
  return { sentiment: 'neutral', score }
}

// Sample news with sentiment
const SAMPLE_NEWS = [
  { id: 1, title: 'Fed Signals Rates Could Stay Higher for Longer Amid Strong Economic Data', source: 'Reuters', time: '2h ago', sentiment: 'negative', impact: 'high', category: 'central-bank', url: '#' },
  { id: 2, title: 'EUR/USD Rises to 1.0850 as Eurozone CPI Shows Signs of Cooling', source: 'FXStreet', time: '3h ago', sentiment: 'positive', impact: 'high', category: 'forex', url: '#' },
  { id: 3, title: 'Japan Trade Deficit Narrows as Exports Surge', source: 'Bloomberg', time: '4h ago', sentiment: 'neutral', impact: 'medium', category: 'economy', url: '#' },
  { id: 4, title: 'UK Services PMI Beats Expectations, Boosting GBP', source: 'Investing.com', time: '5h ago', sentiment: 'positive', impact: 'medium', category: 'forex', url: '#' },
  { id: 5, title: 'Australian Employment Jumps, RBA Rate Cuts Delay Expected', source: 'Reuters', time: '6h ago', sentiment: 'neutral', impact: 'high', category: 'central-bank', url: '#' },
  { id: 6, title: 'China Manufacturing PMI Contracts, Raising Growth Concerns', source: 'Reuters', time: '7h ago', sentiment: 'negative', impact: 'high', category: 'economy', url: '#' },
  { id: 7, title: 'Swiss Franc Strengthens as Safe-Haven Demand Increases', source: 'FXStreet', time: '8h ago', sentiment: 'positive', impact: 'medium', category: 'forex', url: '#' },
  { id: 8, title: 'Canadian Dollar Weakens After Bank of Canada Holds Rates', source: 'Bloomberg', time: '9h ago', sentiment: 'negative', impact: 'medium', category: 'central-bank', url: '#' },
]

interface NewsFeedProps {
  pair?: string
}

const NewsFeed = ({ pair = 'EUR/USD' }: NewsFeedProps) => {
  const [activeTab, setActiveTab] = useState<'news' | 'calendar' | 'banks' | 'inflation'>('news')
  const [news, setNews] = useState(SAMPLE_NEWS)
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all')
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setLastUpdate(new Date())
      setIsLoading(false)
    }, 1000)
  }

  const filteredNews = news.filter(item => {
    if (filter !== 'all' && item.sentiment !== filter) return false
    if (impactFilter !== 'all' && item.impact !== impactFilter) return false
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const sentimentCounts = {
    all: news.length,
    positive: news.filter(n => n.sentiment === 'positive').length,
    negative: news.filter(n => n.sentiment === 'negative').length,
    neutral: news.filter(n => n.sentiment === 'neutral').length,
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-900/30 border-green-800'
      case 'negative': return 'text-red-400 bg-red-900/30 border-red-800'
      default: return 'text-gray-400 bg-gray-800/30 border-gray-700'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      default: return 'text-green-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'news', label: '📰 News', icon: Globe },
            { id: 'calendar', label: '📅 Calendar', icon: Calendar },
            { id: 'banks', label: '🏦 Banks', icon: Building2 },
            { id: 'inflation', label: '📊 Inflation', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <tab.icon size={16} />
                {tab.label}
              </span>
            </button>
          ))}
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          <span className="text-sm text-gray-400">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </button>
      </div>

      {/* News Tab */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            {/* Sentiment Filter */}
            <div className="flex gap-2">
              {(['all', 'positive', 'neutral', 'negative'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-lg capitalize transition-all ${
                    filter === s 
                      ? s === 'positive' ? 'bg-green-600' : s === 'negative' ? 'bg-red-600' : s === 'neutral' ? 'bg-gray-600' : 'bg-purple-600'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {s} ({sentimentCounts[s]})
                </button>
              ))}
            </div>
          </div>

          {/* Impact Filter */}
          <div className="flex gap-2 items-center">
            <Filter size={16} className="text-gray-500" />
            <span className="text-gray-400 text-sm">Impact:</span>
            {(['all', 'high', 'medium', 'low'] as const).map(impact => (
              <button
                key={impact}
                onClick={() => setImpactFilter(impact)}
                className={`px-3 py-1 rounded-full text-sm capitalize transition-all ${
                  impactFilter === impact 
                    ? impact === 'high' ? 'bg-red-600' : impact === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {impact}
              </button>
            ))}
          </div>

          {/* News List */}
          <div className="space-y-3">
            {filteredNews.map(item => (
              <a
                key={item.id}
                href={item.url}
                className="block p-4 bg-gray-900/50 hover:bg-gray-800/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-gray-500">{item.source}</span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">{item.time}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getImpactColor(item.impact)} bg-gray-800`}>
                        {item.impact}
                      </span>
                    </div>
                    <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <div className={`px-3 py-1 rounded-lg border ${getSentimentColor(item.sentiment)}`}>
                    {item.sentiment === 'positive' ? <TrendingUp size={18} /> : 
                     item.sentiment === 'negative' ? <TrendingDown size={18} /> : 
                     <span className="text-sm">—</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Economic Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📅 Today's Economic Events
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> High
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Medium
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span> Low
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Event</th>
                  <th className="pb-3 pr-4">Currency</th>
                  <th className="pb-3 pr-4">Impact</th>
                  <th className="pb-3 pr-4">Actual</th>
                  <th className="pb-3 pr-4">Forecast</th>
                  <th className="pb-3">Previous</th>
                </tr>
              </thead>
              <tbody>
                {ECONOMIC_EVENTS.map(event => (
                  <tr key={event.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 pr-4 text-gray-400 font-mono">{event.time}</td>
                    <td className="py-3 pr-4 text-white">{event.event}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-1 bg-gray-800 rounded text-white font-medium">{event.currency}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.impact === 'high' ? 'bg-red-900/50 text-red-400' :
                        event.impact === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-green-900/50 text-green-400'
                      }`}>
                        {event.impact.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`font-mono ${
                        event.actual !== '-' && event.forecast !== '-' && event.actual !== event.forecast
                          ? parseFloat(event.actual) > parseFloat(event.forecast) ? 'text-green-400' : 'text-red-400'
                          : 'text-white'
                      }`}>
                        {event.actual}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400 font-mono">{event.forecast}</td>
                    <td className="py-3 text-gray-500 font-mono">{event.previous}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Central Banks Tab */}
      {activeTab === 'banks' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🏦 Central Bank Interest Rates
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CENTRAL_BANKS.map(bank => (
              <div key={bank.bank} className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{bank.bank}</span>
                  {bank.trend === 'up' ? (
                    <TrendingUp size={18} className="text-green-400" />
                  ) : bank.trend === 'down' ? (
                    <TrendingDown size={18} className="text-red-400" />
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{bank.rate}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`${bank.change.startsWith('+') ? 'text-green-400' : bank.change.startsWith('-') ? 'text-red-400' : 'text-gray-500'}`}>
                    {bank.change} change
                  </span>
                  <span className="text-gray-500">{bank.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inflation Tab */}
      {activeTab === 'inflation' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📊 Global Inflation Rates
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                  <th className="pb-3 pr-4">Country</th>
                  <th className="pb-3 pr-4">Current Rate</th>
                  <th className="pb-3 pr-4">Previous</th>
                  <th className="pb-3 pr-4">Trend</th>
                  <th className="pb-3">Target</th>
                </tr>
              </thead>
              <tbody>
                {INFLATION_DATA.map(country => (
                  <tr key={country.country} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 pr-4 text-white font-medium">{country.country}</td>
                    <td className="py-3 pr-4">
                      <span className="text-white font-mono font-bold">{country.rate}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400 font-mono">{country.previous}</td>
                    <td className="py-3 pr-4">
                      {country.trend === 'down' ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <TrendingDown size={16} /> Down
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400">
                          <TrendingUp size={16} /> Up
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-gray-500">{country.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsFeed
