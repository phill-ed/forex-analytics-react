import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Activity, Clock, Globe, 
  Flame, ArrowUp, ArrowDown, AlertCircle, Star,
  Calendar, BarChart3
} from 'lucide-react'

// Generate random market data
const generateMarketData = () => {
  const pairs = [
    { pair: 'EUR/USD', base: 1.0850 },
    { pair: 'GBP/USD', base: 1.2650 },
    { pair: 'USD/JPY', base: 150.50 },
    { pair: 'USD/CHF', base: 0.8850 },
    { pair: 'AUD/USD', base: 0.6520 },
    { pair: 'USD/CAD', base: 1.3650 },
    { pair: 'NZD/USD', base: 0.6080 },
    { pair: 'EUR/GBP', base: 0.8580 },
    { pair: 'EUR/JPY', base: 163.50 },
    { pair: 'GBP/JPY', base: 190.50 },
    { pair: 'AUD/JPY', base: 98.20 },
    { pair: 'XAU/USD', base: 2020.00 }
  ]
  
  return pairs.map(({ pair, base }) => {
    const change = (Math.random() - 0.5) * 0.02
    const changePercent = (change / base) * 100
    const spread = pair.includes('JPY') || pair.includes('XAU') ? 0.3 : 0.0002
    
    return {
      pair,
      bid: base + change,
      ask: base + change + spread,
      change: changePercent,
      high: base + Math.abs(change) * 1.5,
      low: base - Math.abs(change) * 1.5,
      volume: Math.floor(Math.random() * 100) + 20
    }
  })
}

// Market Sessions Data
const marketSessions = [
  { 
    name: 'Sydney', 
    region: 'Asia-Pacific',
    open: '22:00 GMT', 
    close: '07:00 GMT',
    status: 'closed' as const,
    flag: '🇦🇺'
  },
  { 
    name: 'Tokyo', 
    region: 'Asia',
    open: '00:00 GMT', 
    close: '09:00 GMT',
    status: 'closed' as const,
    flag: '🇯🇵'
  },
  { 
    name: 'London', 
    region: 'Europe',
    open: '08:00 GMT', 
    close: '17:00 GMT',
    status: 'closed' as const,
    flag: '🇬🇧'
  },
  { 
    name: 'New York', 
    region: 'Americas',
    open: '13:00 GMT', 
    close: '22:00 GMT',
    status: 'closed' as const,
    flag: '🇺🇸'
  }
]

// Check current market session status
const getMarketStatus = () => {
  const now = new Date()
  const hours = now.getUTCHours()
  
  // Simple check based on UTC hour
  if (hours >= 22 || hours < 7) return 'Sydney'
  if (hours >= 0 && hours < 9) return 'Tokyo'
  if (hours >= 8 && hours < 17) return 'London'
  if (hours >= 13 && hours < 22) return 'New York'
  return 'Off-hours'
}

// Generate correlation matrix
const generateCorrelationMatrix = () => {
  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD']
  const correlations: Record<string, Record<string, number>> = {}
  
  pairs.forEach(pair1 => {
    correlations[pair1] = {}
    pairs.forEach(pair2 => {
      if (pair1 === pair2) {
        correlations[pair1][pair2] = 1
      } else {
        // Generate realistic correlation values
        let correlation: number
        if ((pair1.includes('EUR') && pair2.includes('EUR')) || 
            (pair1.includes('USD') && pair2.includes('USD'))) {
          correlation = 0.7 + Math.random() * 0.25
        } else if (pair1.includes('JPY') || pair2.includes('JPY')) {
          correlation = -0.3 + Math.random() * 0.4
        } else {
          correlation = -0.5 + Math.random() * 0.8
        }
        correlations[pair1][pair2] = Math.round(correlation * 100) / 100
      }
    })
  })
  
  return { pairs, correlations }
}

const getCorrelationColor = (value: number) => {
  if (value >= 0.7) return 'bg-green-600'
  if (value >= 0.3) return 'bg-green-400'
  if (value >= 0) return 'bg-green-800'
  if (value >= -0.3) return 'bg-red-800'
  if (value >= -0.7) return 'bg-red-400'
  return 'bg-red-600'
}

const MarketOverview = () => {
  const [marketData, setMarketData] = useState(generateMarketData())
  const [activeSession, setActiveSession] = useState(getMarketStatus())
  const [correlationData, setCorrelationData] = useState(generateCorrelationMatrix())
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(generateMarketData())
      setActiveSession(getMarketStatus())
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Calculate overview stats
  const gainers = marketData.filter(m => m.change > 0).sort((a, b) => b.change - a.change).slice(0, 3)
  const losers = marketData.filter(m => m.change < 0).sort((a, b) => a.change - b.change).slice(0, 3)
  
  const avgChange = marketData.reduce((acc, m) => acc + m.change, 0) / marketData.length
  const totalVolume = marketData.reduce((acc, m) => acc + m.volume, 0)
  
  // Market sentiment (based on USD strength)
  const usdPairs = marketData.filter(m => m.pair.startsWith('USD'))
  const usdStrength = usdPairs.reduce((acc, m) => acc + m.change, 0) / usdPairs.length
  const sentiment = usdStrength > 0.5 ? 'bullish' : usdStrength < -0.5 ? 'bearish' : 'neutral'
  
  // Volatility indicator
  const volatility = marketData.reduce((acc, m) => acc + Math.abs(m.change), 0) / marketData.length
  const volatilityLevel = volatility > 0.5 ? 'high' : volatility > 0.2 ? 'medium' : 'low'
  
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="overview-card">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className="text-blue-400" />
            <span className="text-gray-400 text-sm">Market Sentiment</span>
          </div>
          <div className={`text-2xl font-bold capitalize ${
            sentiment === 'bullish' ? 'text-green-400' : 
            sentiment === 'bearish' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {sentiment === 'bullish' ? '🐂 Bullish' : 
             sentiment === 'bearish' ? '🐻 Bearish' : '⚖️ Neutral'}
          </div>
          <div className="text-xs text-gray-500 mt-1">USD Strength: {usdStrength > 0 ? '+' : ''}{usdStrength.toFixed(2)}%</div>
        </div>
        
        <div className="overview-card">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={18} className="text-orange-400" />
            <span className="text-gray-400 text-sm">Volatility</span>
          </div>
          <div className={`text-2xl font-bold capitalize ${
            volatilityLevel === 'high' ? 'text-red-400' : 
            volatilityLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {volatilityLevel}
          </div>
          <div className="text-xs text-gray-500 mt-1">Avg Change: {volatility.toFixed(2)}%</div>
        </div>
        
        <div className="overview-card">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={18} className="text-purple-400" />
            <span className="text-gray-400 text-sm">Active Session</span>
          </div>
          <div className="text-2xl font-bold text-white">{activeSession}</div>
          <div className="text-xs text-gray-500 mt-1">{new Date().toUTCString().slice(0, -7)}</div>
        </div>
        
        <div className="overview-card">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={18} className="text-cyan-400" />
            <span className="text-gray-400 text-sm">Market Trend</span>
          </div>
          <div className={`text-2xl font-bold ${avgChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {avgChange > 0 ? '📈 Bullish' : '📉 Bearish'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Daily Avg: {avgChange > 0 ? '+' : ''}{avgChange.toFixed(3)}%</div>
        </div>
      </div>
      
      {/* Market Sessions */}
      <div className="chart-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🌍 Market Sessions
          <span className="text-sm font-normal text-gray-400 ml-2">
            Active: <span className="text-green-400">{activeSession}</span>
          </span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {marketSessions.map(session => (
            <div 
              key={session.name} 
              className={`session-card ${session.status}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{session.flag}</span>
                <span className="font-semibold">{session.name}</span>
              </div>
              <div className="text-sm text-gray-400">
                {session.open} - {session.close}
              </div>
              <div className={`mt-2 text-xs ${
                activeSession === session.name ? 'text-green-400' : 'text-gray-500'
              }`}>
                {activeSession === session.name ? '● OPEN' : '○ Closed'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Movers */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gainers */}
        <div className="chart-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-400">
            <ArrowUp size={20} /> Top Gainers
          </h3>
          <div className="space-y-3">
            {gainers.map((m, i) => (
              <div key={m.pair} className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-800/50">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-green-400">#{i + 1}</span>
                  <span className="font-medium">{m.pair}</span>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">+{m.change.toFixed(2)}%</div>
                  <div className="text-xs text-gray-500">{m.bid.toFixed(5)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Losers */}
        <div className="chart-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-400">
            <ArrowDown size={20} /> Top Losers
          </h3>
          <div className="space-y-3">
            {losers.map((m, i) => (
              <div key={m.pair} className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg border border-red-800/50">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-red-400">#{i + 1}</span>
                  <span className="font-medium">{m.pair}</span>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-bold">{m.change.toFixed(2)}%</div>
                  <div className="text-xs text-gray-500">{m.bid.toFixed(5)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* All Pairs Table */}
      <div className="chart-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          💹 All Markets
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-3">Pair</th>
                <th className="pb-3">Bid</th>
                <th className="pb-3">Ask</th>
                <th className="pb-3">Change</th>
                <th className="pb-3">High</th>
                <th className="pb-3">Low</th>
                <th className="pb-3">Volume</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map(m => (
                <tr key={m.pair} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 font-medium">{m.pair}</td>
                  <td className="py-3 font-mono">{m.bid.toFixed(m.pair.includes('JPY') || m.pair.includes('XAU') ? 2 : 5)}</td>
                  <td className="py-3 font-mono">{m.ask.toFixed(m.pair.includes('JPY') || m.pair.includes('XAU') ? 2 : 5)}</td>
                  <td className={`py-3 font-bold ${m.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {m.change >= 0 ? '+' : ''}{m.change.toFixed(2)}%
                  </td>
                  <td className="py-3 font-mono text-gray-400">{m.high.toFixed(5)}</td>
                  <td className="py-3 font-mono text-gray-400">{m.low.toFixed(5)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${m.volume}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{m.volume}M</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Correlation Matrix */}
      <div className="chart-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🔗 Currency Correlation Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2"></th>
                {correlationData.pairs.map(p => (
                  <th key={p} className="p-2 text-sm text-gray-400">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlationData.pairs.map(pair1 => (
                <tr key={pair1}>
                  <td className="p-2 text-sm font-medium">{pair1}</td>
                  {correlationData.pairs.map(pair2 => {
                    const value = correlationData.correlations[pair1][pair2]
                    return (
                      <td key={pair2} className="p-1">
                        <div 
                          className={`w-full h-8 flex items-center justify-center text-xs font-bold rounded ${getCorrelationColor(value)}`}
                          title={`${pair1} vs ${pair2}: ${value}`}
                        >
                          {value.toFixed(2)}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-600 rounded"></span> Strong Positive
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-800 rounded"></span> Weak Positive
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-800 rounded"></span> Weak Negative
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-600 rounded"></span> Strong Negative
          </span>
        </div>
      </div>
    </div>
  )
}

export default MarketOverview
