import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, RefreshCw, Settings, 
  Bell, Plus, X, Clock, Globe, AlertTriangle
} from 'lucide-react'

// Currency pairs
const CURRENCY_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'EUR/CHF', 'AUD/JPY', 'EUR/AUD', 'GBP/CHF'
]

// Sample correlation data (simulated)
const generateCorrelation = (pair1: string, pair2: string): number => {
  // Generate consistent correlation based on pair names
  const base = Math.sin((pair1.charCodeAt(0) + pair2.charCodeAt(0)) * 12345) * 0.5 + 0.5
  
  // Related pairs have higher correlation
  const baseCurrency1 = pair1.split('/')[0]
  const baseCurrency2 = pair2.split('/')[0]
  
  if (baseCurrency1 === baseCurrency2) {
    return Math.min(0.95, base + 0.3)
  }
  
  // USD pairs often move inversely
  if ((baseCurrency1 === 'USD' || baseCurrency2 === 'USD')) {
    return Math.max(-0.3, base - 0.4)
  }
  
  return Math.max(-0.8, Math.min(0.9, base))
}

// Sample price data
const generatePrice = (pair: string): { bid: number, ask: number, change: number } => {
  const base: Record<string, number> = {
    'EUR/USD': 1.0850, 'GBP/USD': 1.2650, 'USD/JPY': 150.50, 'USD/CHF': 0.8850,
    'AUD/USD': 0.6550, 'USD/CAD': 1.3550, 'NZD/USD': 0.6050, 'EUR/GBP': 0.8580,
    'EUR/JPY': 163.20, 'GBP/JPY': 190.50, 'EUR/CHF': 0.9600, 'AUD/JPY': 98.50,
    'EUR/AUD': 1.6550, 'GBP/CHF': 1.1180
  }
  
  const price = base[pair] || 1.0
  const spread = pair.includes('JPY') ? 0.02 : 0.0002
  const change = (Math.random() - 0.5) * price * 0.005
  
  return {
    bid: price + change,
    ask: price + change + spread,
    change: change / price * 100
  }
}

// Market sessions
const MARKET_SESSIONS = [
  { 
    name: 'Sydney', 
    open: '22:00', 
    close: '07:00', 
    timezone: 'UTC',
    flag: '🇦🇺',
    color: 'bg-blue-500'
  },
  { 
    name: 'Tokyo', 
    open: '00:00', 
    close: '09:00', 
    timezone: 'UTC',
    flag: '🇯🇵',
    color: 'bg-red-500'
  },
  { 
    name: 'London', 
    open: '08:00', 
    close: '17:00', 
    timezone: 'UTC',
    flag: '🇬🇧',
    color: 'bg-purple-500'
  },
  { 
    name: 'New York', 
    open: '13:00', 
    close: '22:00', 
    timezone: 'UTC',
    flag: '🇺🇸',
    color: 'bg-green-500'
  },
]

// Price alert type
interface PriceAlert {
  id: number
  pair: string
  targetPrice: number
  condition: 'above' | 'below'
  createdAt: Date
  triggered: boolean
}

// Watchlist item
interface WatchlistItem {
  id: number
  pair: string
  addedAt: Date
}

const Watchlist = () => {
  const [prices, setPrices] = useState<Record<string, { bid: number, ask: number, change: number }>>({})
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    { id: 1, pair: 'EUR/USD', targetPrice: 1.0900, condition: 'above', createdAt: new Date(), triggered: false },
    { id: 2, pair: 'GBP/USD', targetPrice: 1.2500, condition: 'below', createdAt: new Date(), triggered: false },
    { id: 3, pair: 'USD/JPY', targetPrice: 152.00, condition: 'above', createdAt: new Date(), triggered: false },
  ])
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { id: 1, pair: 'EUR/USD', addedAt: new Date() },
    { id: 2, pair: 'GBP/USD', addedAt: new Date() },
    { id: 3, pair: 'USD/JPY', addedAt: new Date() },
  ])
  const [newAlertPair, setNewAlertPair] = useState('EUR/USD')
  const [newAlertPrice, setNewAlertPrice] = useState('')
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above')
  const [showAddAlert, setShowAddAlert] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Update prices every few seconds
  useEffect(() => {
    const updatePrices = () => {
      const newPrices: Record<string, { bid: number, ask: number, change: number }> = {}
      CURRENCY_PAIRS.forEach(pair => {
        newPrices[pair] = generatePrice(pair)
      })
      setPrices(newPrices)
      setLastUpdate(new Date())
      
      // Check alerts
      setAlerts(prev => prev.map(alert => {
        const price = newPrices[alert.pair]
        if (!price) return alert
        
        const shouldTrigger = alert.condition === 'above' 
          ? price.bid >= alert.targetPrice 
          : price.bid <= alert.targetPrice
          
        if (shouldTrigger && !alert.triggered) {
          return { ...alert, triggered: true }
        }
        return alert
      }))
    }

    updatePrices()
    const interval = setInterval(updatePrices, 5000)
    return () => clearInterval(interval)
  }, [])

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const getCurrentSession = () => {
    const hour = currentTime.getUTCHours()
    
    if (hour >= 22 || hour < 7) return 'Sydney'
    if (hour >= 0 && hour < 9) return 'Tokyo'
    if (hour >= 8 && hour < 17) return 'London'
    return 'New York'
  }

  const addToWatchlist = (pair: string) => {
    if (!watchlist.find(w => w.pair === pair)) {
      setWatchlist([...watchlist, { id: Date.now(), pair, addedAt: new Date() }])
    }
  }

  const removeFromWatchlist = (id: number) => {
    setWatchlist(watchlist.filter(w => w.id !== id))
  }

  const addAlert = () => {
    if (!newAlertPrice) return
    
    setAlerts([...alerts, {
      id: Date.now(),
      pair: newAlertPair,
      targetPrice: parseFloat(newAlertPrice),
      condition: newAlertCondition,
      createdAt: new Date(),
      triggered: false
    }])
    
    setNewAlertPrice('')
    setShowAddAlert(false)
  }

  const removeAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  const getCorrelationColor = (value: number): string => {
    if (value >= 0.7) return 'bg-green-600'
    if (value >= 0.3) return 'bg-green-400'
    if (value >= 0) return 'bg-green-300'
    if (value >= -0.3) return 'bg-red-300'
    if (value >= -0.7) return 'bg-red-400'
    return 'bg-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Market Sessions */}
      <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🌍 Market Sessions (UTC)
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MARKET_SESSIONS.map(session => {
            const isActive = getCurrentSession() === session.name
            return (
              <div 
                key={session.name}
                className={`p-4 rounded-lg border ${
                  isActive 
                    ? 'bg-gray-800 border-purple-500' 
                    : 'bg-gray-900/50 border-gray-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{session.flag}</span>
                  <span className="font-medium text-white">{session.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${session.color} ${isActive ? 'animate-pulse' : 'opacity-50'}`}></div>
                  <span className={`text-sm ${isActive ? 'text-green-400' : 'text-gray-500'}`}>
                    {isActive ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {session.open} - {session.close}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-800">
          <span className="text-purple-400 font-medium">Current Session: </span>
          <span className="text-white">{getCurrentSession()}</span>
          <span className="text-gray-500 text-sm ml-2">
            ({currentTime.toLocaleTimeString()} UTC)
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Watchlist */}
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              ⭐ Watchlist
            </h3>
            <select 
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              onChange={(e) => addToWatchlist(e.target.value)}
              value=""
            >
              <option value="" disabled>Add pair...</option>
              {CURRENCY_PAIRS.filter(p => !watchlist.find(w => w.pair === p)).map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {watchlist.map(item => {
              const price = prices[item.pair]
              return (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
                >
                  <div>
                    <span className="font-medium text-white">{item.pair}</span>
                    {price && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Bid:</span>
                        <span className="text-white font-mono">{price.bid.toFixed(4)}</span>
                        <span className={`text-xs ${price.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {price.change >= 0 ? '▲' : '▼'} {Math.abs(price.change).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromWatchlist(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Price Alerts */}
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              🔔 Price Alerts
            </h3>
            <button
              onClick={() => setShowAddAlert(true)}
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          {/* Add Alert Form */}
          {showAddAlert && (
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg space-y-3">
              <div className="flex gap-2">
                <select
                  value={newAlertPair}
                  onChange={(e) => setNewAlertPair(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
                >
                  {CURRENCY_PAIRS.map(pair => (
                    <option key={pair} value={pair}>{pair}</option>
                  ))}
                </select>
                <select
                  value={newAlertCondition}
                  onChange={(e) => setNewAlertCondition(e.target.value as 'above' | 'below')}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Target price"
                  value={newAlertPrice}
                  onChange={(e) => setNewAlertPrice(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
                />
                <button
                  onClick={addAlert}
                  className="px-4 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddAlert(false)}
                  className="px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {alerts.map(alert => {
              const price = prices[alert.pair]
              return (
                <div 
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    alert.triggered 
                      ? 'bg-green-900/30 border-green-800' 
                      : 'bg-gray-800/50 border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {alert.triggered ? (
                      <Bell size={18} className="text-green-400 animate-pulse" />
                    ) : (
                      <Bell size={18} className="text-gray-500" />
                    )}
                    <div>
                      <div className="text-white font-medium">{alert.pair}</div>
                      <div className="text-sm text-gray-400">
                        {alert.condition === 'above' ? '↑' : '↓'} {alert.targetPrice.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🔗 Currency Correlation Matrix
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Last update:</span>
            <span className="text-white">{lastUpdate.toLocaleTimeString()}</span>
            <button className="p-1 hover:bg-gray-700 rounded">
              <RefreshCw size={14} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2"></th>
                {CURRENCY_PAIRS.slice(0, 8).map(pair => (
                  <th key={pair} className="p-2 text-xs text-gray-400 font-normal rotate-45 origin-left">
                    {pair}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CURRENCY_PAIRS.slice(0, 8).map((pair1, i) => (
                <tr key={pair1}>
                  <td className="p-2 text-xs text-gray-400 font-normal text-right pr-4">{pair1}</td>
                  {CURRENCY_PAIRS.slice(0, 8).map((pair2, j) => {
                    const corr = i === j ? 1 : generateCorrelation(pair1, pair2)
                    return (
                      <td key={pair2} className="p-1">
                        <div 
                          className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                            getCorrelationColor(corr)
                          } ${i === j ? 'ring-2 ring-white/30' : ''}`}
                          title={`${pair1} vs ${pair2}: ${corr.toFixed(2)}`}
                        >
                          {corr.toFixed(1)}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-gray-400">Negative (-1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-gray-400">Neutral (0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-400">Positive (+1)</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Active Alerts</div>
          <div className="text-2xl font-bold text-white">
            {alerts.filter(a => !a.triggered).length}
          </div>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Triggered Today</div>
          <div className="text-2xl font-bold text-green-400">
            {alerts.filter(a => a.triggered).length}
          </div>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Watchlist Pairs</div>
          <div className="text-2xl font-bold text-white">{watchlist.length}</div>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Session</div>
          <div className="text-2xl font-bold text-purple-400">{getCurrentSession()}</div>
        </div>
      </div>
    </div>
  )
}

export default Watchlist
