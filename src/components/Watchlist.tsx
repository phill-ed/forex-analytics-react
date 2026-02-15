import { useState, useEffect } from 'react'
import { Star, Bell, BellOff, Trash2, Plus, AlertTriangle, TrendingUp, TrendingDown, X } from 'lucide-react'

interface WatchlistItem {
  pair: string
  bid: number
  ask: number
  change: number
}

interface PriceAlert {
  id: number
  pair: string
  targetPrice: number
  direction: 'above' | 'below'
  currentPrice: number
  active: boolean
  createdAt: string
}

interface Position {
  id: number
  pair: string
  type: 'buy' | 'sell'
  openPrice: number
  currentPrice: number
  lots: number
  profit: number
  openTime: string
}

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [selectedPair, setSelectedPair] = useState('EUR/USD')
  const [newAlertPrice, setNewAlertPrice] = useState('')
  const [newAlertDirection, setNewAlertDirection] = useState<'above' | 'below'>('above')
  const [activeTab, setActiveTab] = useState<'watchlist' | 'alerts' | 'positions'>('watchlist')
  
  // Available pairs
  const availablePairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
    'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'XAU/USD'
  ]
  
  // Generate initial watchlist data
  const generatePairData = (pair: string): WatchlistItem => {
    const baseRates: Record<string, number> = {
      'EUR/USD': 1.0850, 'GBP/USD': 1.2650, 'USD/JPY': 150.50,
      'USD/CHF': 0.8850, 'AUD/USD': 0.6520, 'USD/CAD': 1.3650,
      'NZD/USD': 0.6080, 'EUR/GBP': 0.8580, 'EUR/JPY': 163.50,
      'GBP/JPY': 190.50, 'AUD/JPY': 98.20, 'XAU/USD': 2020.00
    }
    
    const base = baseRates[pair] || 1.0
    const change = (Math.random() - 0.5) * 2
    const spread = pair.includes('JPY') || pair.includes('XAU') ? 0.05 : 0.0002
    
    return {
      pair,
      bid: base + (change / 100),
      ask: base + (change / 100) + spread,
      change
    }
  }
  
  // Initialize watchlist
  useEffect(() => {
    const initialList = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'EUR/GBP', 'XAU/USD'].map(generatePairData)
    setWatchlist(initialList)
    
    // Sample positions
    setPositions([
      { id: 1, pair: 'EUR/USD', type: 'buy', openPrice: 1.0820, currentPrice: 1.0850, lots: 0.5, profit: 15.00, openTime: '2h ago' },
      { id: 2, pair: 'GBP/USD', type: 'sell', openPrice: 1.2680, currentPrice: 1.2650, lots: 0.3, profit: 9.00, openTime: '4h ago' },
      { id: 3, pair: 'XAU/USD', type: 'buy', openPrice: 2010.00, currentPrice: 2020.00, lots: 0.1, profit: 100.00, openTime: '1d ago' },
    ])
    
    // Sample alerts
    setAlerts([
      { id: 1, pair: 'EUR/USD', targetPrice: 1.0900, direction: 'above', currentPrice: 1.0850, active: true, createdAt: '1h ago' },
      { id: 2, pair: 'GBP/USD', targetPrice: 1.2500, direction: 'below', currentPrice: 1.2650, active: true, createdAt: '3h ago' },
    ])
  }, [])
  
  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist(prev => prev.map(item => {
        const change = (Math.random() - 0.5) * 0.0002
        const newBid = item.bid + change
        return {
          ...item,
          bid: newBid,
          ask: newBid + (item.pair.includes('JPY') || item.pair.includes('XAU') ? 0.05 : 0.0002),
          change: item.change + (Math.random() - 0.5) * 0.1
        }
      }))
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Add to watchlist
  const addToWatchlist = (pair: string) => {
    if (watchlist.find(w => w.pair === pair)) return
    setWatchlist(prev => [...prev, generatePairData(pair)])
  }
  
  // Remove from watchlist
  const removeFromWatchlist = (pair: string) => {
    setWatchlist(prev => prev.filter(w => w.pair !== pair))
  }
  
  // Toggle favorite (star)
  const toggleFavorite = (pair: string) => {
    // In a real app, this would save to local storage
    console.log('Toggle favorite:', pair)
  }
  
  // Add new alert
  const addAlert = () => {
    if (!newAlertPrice) return
    
    const alert: PriceAlert = {
      id: Date.now(),
      pair: selectedPair,
      targetPrice: parseFloat(newAlertPrice),
      direction: newAlertDirection,
      currentPrice: watchlist.find(w => w.pair === selectedPair)?.bid || 0,
      active: true,
      createdAt: 'Just now'
    }
    
    setAlerts(prev => [...prev, alert])
    setShowAlertModal(false)
    setNewAlertPrice('')
  }
  
  // Toggle alert
  const toggleAlert = (id: number) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    ))
  }
  
  // Delete alert
  const deleteAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }
  
  // Calculate total P&L
  const totalPnL = positions.reduce((acc, p) => acc + p.profit, 0)
  const winRate = 66 // Sample win rate
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`tab-button ${activeTab === 'watchlist' ? 'active' : ''}`}
        >
          <Star size={18} />
          Watchlist
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
        >
          <Bell size={18} />
          Price Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`tab-button ${activeTab === 'positions' ? 'active' : ''}`}
        >
          📊 Positions
        </button>
      </div>
      
      {/* Content */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          {/* Add Pair */}
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="input-field"
            >
              {availablePairs.filter(p => !watchlist.find(w => w.pair === p)).map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
            <button
              onClick={() => addToWatchlist(selectedPair)}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus size={18} />
              Add to Watchlist
            </button>
          </div>
          
          {/* Watchlist Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3"></th>
                  <th className="pb-3">Pair</th>
                  <th className="pb-3">Bid</th>
                  <th className="pb-3">Ask</th>
                  <th className="pb-3">Change</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map(item => (
                  <tr key={item.pair} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3">
                      <button
                        onClick={() => toggleFavorite(item.pair)}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        <Star size={18} />
                      </button>
                    </td>
                    <td className="py-3 font-medium">{item.pair}</td>
                    <td className="py-3 font-mono">{item.bid.toFixed(item.pair.includes('JPY') || item.pair.includes('XAU') ? 3 : 5)}</td>
                    <td className="py-3 font-mono">{item.ask.toFixed(item.pair.includes('JPY') || item.pair.includes('XAU') ? 3 : 5)}</td>
                    <td className={`py-3 font-bold ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPair(item.pair)
                            setShowAlertModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"
                          title="Set Alert"
                        >
                          <Bell size={16} />
                        </button>
                        <button
                          onClick={() => removeFromWatchlist(item.pair)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {watchlist.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Star size={48} className="mx-auto mb-4 opacity-50" />
              <p>Your watchlist is empty</p>
              <p className="text-sm">Add currency pairs to track</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Create Alert Button */}
          <button
            onClick={() => setShowAlertModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Create New Alert
          </button>
          
          {/* Alerts List */}
          <div className="space-y-3">
            {alerts.map(alert => {
              const currentPrice = watchlist.find(w => w.pair === alert.pair)?.bid || alert.currentPrice
              const distance = Math.abs(alert.targetPrice - currentPrice)
              const percentAway = (distance / currentPrice) * 100
              
              return (
                <div key={alert.id} className={`alert-card ${alert.active ? 'active' : 'inactive'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        className={`p-2 rounded-full ${alert.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}
                      >
                        {alert.active ? <Bell size={18} /> : <BellOff size={18} />}
                      </button>
                      <div>
                        <div className="font-medium">{alert.pair}</div>
                        <div className="text-sm text-gray-400">
                          Alert when price goes {alert.direction} <span className="text-blue-400">{alert.targetPrice.toFixed(5)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Created: {alert.createdAt}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{currentPrice.toFixed(5)}</div>
                      <div className="text-sm text-gray-400">
                        {percentAway.toFixed(3)}% away
                      </div>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="text-gray-500 hover:text-red-400 mt-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${alert.direction === 'above' ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(percentAway * 10, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          
          {alerts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Bell size={48} className="mx-auto mb-4 opacity-50" />
              <p>No price alerts set</p>
              <p className="text-sm">Create an alert to get notified</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'positions' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="summary-card">
              <div className="text-gray-400 text-sm mb-1">Open Positions</div>
              <div className="text-2xl font-bold">{positions.length}</div>
            </div>
            <div className="summary-card">
              <div className="text-gray-400 text-sm mb-1">Total P&L</div>
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${totalPnL.toFixed(2)}
              </div>
            </div>
            <div className="summary-card">
              <div className="text-gray-400 text-sm mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-blue-400">{winRate}%</div>
            </div>
            <div className="summary-card">
              <div className="text-gray-400 text-sm mb-1">Total Profit</div>
              <div className="text-2xl font-bold text-green-400">+$124.00</div>
            </div>
          </div>
          
          {/* Positions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3">Pair</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Open Price</th>
                  <th className="pb-3">Current</th>
                  <th className="pb-3">Lots</th>
                  <th className="pb-3">P&L</th>
                  <th className="pb-3">Open Time</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => (
                  <tr key={pos.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 font-medium">{pos.pair}</td>
                    <td className="py-3">
                      <span className={`position-type ${pos.type}`}>
                        {pos.type === 'buy' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {pos.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 font-mono">{pos.openPrice.toFixed(5)}</td>
                    <td className="py-3 font-mono">{pos.currentPrice.toFixed(5)}</td>
                    <td className="py-3">{pos.lots}</td>
                    <td className={`py-3 font-bold ${pos.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pos.profit >= 0 ? '+' : ''}${pos.profit.toFixed(2)}
                    </td>
                    <td className="py-3 text-gray-400">{pos.openTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {positions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
              <p>No open positions</p>
              <p className="text-sm">This is a demo placeholder</p>
            </div>
          )}
        </div>
      )}
      
      {/* Alert Modal */}
      {showAlertModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Create Price Alert</h3>
              <button onClick={() => setShowAlertModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Currency Pair</label>
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="input-field"
                >
                  {watchlist.map(pair => (
                    <option key={pair.pair} value={pair.pair}>{pair.pair}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Price</label>
                <input
                  type="number"
                  value={newAlertPrice}
                  onChange={(e) => setNewAlertPrice(e.target.value)}
                  placeholder={watchlist.find(w => w.pair === selectedPair)?.bid.toFixed(5)}
                  className="input-field"
                  step="0.00001"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Alert When Price Goes</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewAlertDirection('above')}
                    className={`flex-1 p-3 rounded-lg border ${newAlertDirection === 'above' ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-gray-700 text-gray-400'}`}
                  >
                    <TrendingUp size={20} className="mx-auto mb-1" />
                    Above
                  </button>
                  <button
                    onClick={() => setNewAlertDirection('below')}
                    className={`flex-1 p-3 rounded-lg border ${newAlertDirection === 'below' ? 'border-red-500 bg-red-500/20 text-red-400' : 'border-gray-700 text-gray-400'}`}
                  >
                    <TrendingDown size={20} className="mx-auto mb-1" />
                    Below
                  </button>
                </div>
              </div>
              
              <button onClick={addAlert} className="btn-primary w-full">
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Watchlist
