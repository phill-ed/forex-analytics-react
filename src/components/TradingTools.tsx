import { useState } from 'react'
import { Calculator, TrendingUp, TrendingDown, DollarSign, Percent, AlertTriangle, Wallet } from 'lucide-react'

interface CalculatorInput {
  id: string
  label: string
  type: 'number' | 'select'
  options?: { value: string; label: string }[]
  defaultValue: string | number
  step?: string
  prefix?: string
  suffix?: string
}

const TradingTools = () => {
  const [activeTool, setActiveTool] = useState('position-size')
  
  const tools = [
    { id: 'position-size', name: 'Position Size', icon: <Calculator size={20} /> },
    { id: 'risk-reward', name: 'Risk/Reward', icon: <TrendingUp size={20} /> },
    { id: 'pip-value', name: 'Pip Value', icon: <DollarSign size={20} /> },
    { id: 'margin', name: 'Margin', icon: <Wallet size={20} /> },
    { id: 'lot-size', name: 'Lot Size', icon: <Percent size={20} /> }
  ]
  
  const renderToolContent = () => {
    switch (activeTool) {
      case 'position-size':
        return <PositionSizeCalculator />
      case 'risk-reward':
        return <RiskRewardCalculator />
      case 'pip-value':
        return <PipValueCalculator />
      case 'margin':
        return <MarginCalculator />
      case 'lot-size':
        return <LotSizeCalculator />
      default:
        return <PositionSizeCalculator />
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Tool Selection */}
      <div className="flex flex-wrap gap-2">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`tool-tab ${activeTool === tool.id ? 'active' : ''}`}
          >
            {tool.icon}
            <span>{tool.name}</span>
          </button>
        ))}
      </div>
      
      {/* Calculator Content */}
      <div className="calculator-card">
        {renderToolContent()}
      </div>
      
      {/* Quick Reference */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="info-card">
          <h4 className="font-semibold mb-2 text-blue-400">📏 Standard Lots</h4>
          <ul className="text-sm space-y-1 text-gray-400">
            <li>1 Standard Lot = 100,000 units</li>
            <li>1 Mini Lot = 10,000 units</li>
            <li>1 Micro Lot = 1,000 units</li>
            <li>1 Nano Lot = 100 units</li>
          </ul>
        </div>
        
        <div className="info-card">
          <h4 className="font-semibold mb-2 text-green-400">⚖️ Recommended Risk</h4>
          <ul className="text-sm space-y-1 text-gray-400">
            <li>Conservative: 0.5-1% per trade</li>
            <li>Moderate: 1-2% per trade</li>
            <li>Aggressive: 2-5% per trade</li>
            <li>Never risk more than 5%</li>
          </ul>
        </div>
        
        <div className="info-card">
          <h4 className="font-semibold mb-2 text-purple-400">🎯 R:R Ratio</h4>
          <ul className="text-sm space-y-1 text-gray-400">
            <li>Minimum: 1:1 (break even)</li>
            <li>Good: 1:2 (positive expectancy)</li>
            <li>Recommended: 1:2 or better</li>
            <li>Great: 1:3+ (high profit)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Position Size Calculator
const PositionSizeCalculator = () => {
  const [accountBalance, setAccountBalance] = useState(10000)
  const [riskPercent, setRiskPercent] = useState(1)
  const [stopLoss, setStopLoss] = useState(20)
  const [pair, setPair] = useState('EUR/USD')
  const [result, setResult] = useState<{ lots: number; units: number; riskAmount: number } | null>(null)
  
  const calculate = () => {
    // Pip value calculation (simplified)
    const isJPY = pair.includes('JPY')
    const pipSize = isJPY ? 0.01 : 0.0001
    const pipValue = 10 // $10 per standard lot for major pairs
    
    const riskAmount = accountBalance * (riskPercent / 100)
    const pipsRisked = stopLoss
    
    // Calculate lot size
    const standardLots = riskAmount / (pipsRisked * pipValue)
    const units = standardLots * 100000
    
    setResult({
      lots: standardLots,
      units: units,
      riskAmount: riskAmount
    })
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Calculator className="text-blue-400" /> Position Size Calculator
      </h3>
      <p className="text-gray-400 text-sm">Calculate the optimal lot size based on your account balance and risk tolerance.</p>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="input-group">
          <label>Account Balance ($)</label>
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(Number(e.target.value))}
          />
        </div>
        
        <div className="input-group">
          <label>Risk Percentage (%)</label>
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(Number(e.target.value))}
            step="0.1"
          />
        </div>
        
        <div className="input-group">
          <label>Stop Loss (pips)</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(Number(e.target.value))}
          />
        </div>
        
        <div className="input-group">
          <label>Currency Pair</label>
          <select value={pair} onChange={(e) => setPair(e.target.value)}>
            <option value="EUR/USD">EUR/USD</option>
            <option value="GBP/USD">GBP/USD</option>
            <option value="USD/JPY">USD/JPY</option>
            <option value="USD/CHF">USD/CHF</option>
            <option value="AUD/USD">AUD/USD</option>
            <option value="USD/CAD">USD/CAD</option>
            <option value="NZD/USD">NZD/USD</option>
          </select>
        </div>
      </div>
      
      <button onClick={calculate} className="btn-calculate">
        Calculate Position Size
      </button>
      
      {result && (
        <div className="result-box">
          <div className="result-item">
            <span className="result-label">Position Size</span>
            <span className="result-value text-blue-400">{result.lots.toFixed(2)} lots</span>
          </div>
          <div className="result-item">
            <span className="result-label">Units</span>
            <span className="result-value">{result.units.toLocaleString()}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Risk Amount</span>
            <span className="result-value text-red-400">${result.riskAmount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Risk/Reward Calculator
const RiskRewardCalculator = () => {
  const [entryPrice, setEntryPrice] = useState(1.0850)
  const [stopLoss, setStopLoss] = useState(1.0820)
  const [takeProfit, setTakeProfit] = useState(1.0920)
  const [result, setResult] = useState<{ riskPips: number; rewardPips: number; rrRatio: number; recommendation: string } | null>(null)
  
  const calculate = () => {
    const isJPY = entryPrice > 100
    const pipSize = isJPY ? 0.01 : 0.0001
    
    const riskPips = Math.abs(entryPrice - stopLoss) / pipSize
    const rewardPips = Math.abs(takeProfit - entryPrice) / pipSize
    const rrRatio = riskPips > 0 ? rewardPips / riskPips : 0
    
    let recommendation = ''
    if (rrRatio >= 2) {
      recommendation = '✅ Excellent! Ratio ≥ 2:1 - Good for trading'
    } else if (rrRatio >= 1.5) {
      recommendation = '👍 Good ratio - Consider 2:1 for better results'
    } else if (rrRatio >= 1) {
      recommendation = '⚠️ Minimum acceptable - Aim for 2:1 or better'
    } else {
      recommendation = '❌ Poor ratio - Not recommended, look for better setups'
    }
    
    setResult({ riskPips, rewardPips, rrRatio, recommendation })
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <TrendingUp className="text-green-400" /> Risk/Reward Calculator
      </h3>
      <p className="text-gray-400 text-sm">Calculate your risk/reward ratio to ensure favorable trade setups.</p>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="input-group">
          <label>Entry Price</label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            step="0.00001"
          />
        </div>
        
        <div className="input-group">
          <label className="text-red-400">Stop Loss</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(Number(e.target.value))}
            step="0.00001"
          />
        </div>
        
        <div className="input-group">
          <label className="text-green-400">Take Profit</label>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(Number(e.target.value))}
            step="0.00001"
          />
        </div>
      </div>
      
      <button onClick={calculate} className="btn-calculate">
        Calculate R:R Ratio
      </button>
      
      {result && (
        <div className="result-box">
          <div className="result-item">
            <span className="result-label">Risk</span>
            <span className="result-value text-red-400">{result.riskPips.toFixed(1)} pips</span>
          </div>
          <div className="result-item">
            <span className="result-label">Reward</span>
            <span className="result-value text-green-400">{result.rewardPips.toFixed(1)} pips</span>
          </div>
          <div className="result-item">
            <span className="result-label">R:R Ratio</span>
            <span className="result-value text-blue-400">1:{result.rrRatio.toFixed(2)}</span>
          </div>
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-sm">{result.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Pip Value Calculator
const PipValueCalculator = () => {
  const [pair, setPair] = useState('EUR/USD')
  const [lotSize, setLotSize] = useState(1)
  const [accountCurrency, setAccountCurrency] = useState('USD')
  const [result, setResult] = useState<{ pipValue: number; pipValueInAccount: number } | null>(null)
  
  const calculate = () => {
    // Base pip values per standard lot
    const pipValues: Record<string, number> = {
      'EUR/USD': 10, 'GBP/USD': 10, 'USD/JPY': 10, 'USD/CHF': 10,
      'AUD/USD': 10, 'USD/CAD': 10, 'NZD/USD': 10,
      'EUR/GBP': 10, 'EUR/JPY': 1000, 'GBP/JPY': 1000,
      'AUD/JPY': 1000, 'NZD/JPY': 1000
    }
    
    const basePipValue = pipValues[pair] || 10
    const pipValue = basePipValue * lotSize
    
    // Simplified conversion (would need actual rates in production)
    let pipValueInAccount = pipValue
    if (accountCurrency !== 'USD') {
      pipValueInAccount = pipValue * 0.95 // Simplified rate
    }
    
    setResult({ pipValue, pipValueInAccount })
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <DollarSign className="text-yellow-400" /> Pip Value Calculator
      </h3>
      <p className="text-gray-400 text-sm">Calculate the monetary value of a pip for your trade size.</p>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="input-group">
          <label>Currency Pair</label>
          <select value={pair} onChange={(e) => setPair(e.target.value)}>
            <option value="EUR/USD">EUR/USD</option>
            <option value="GBP/USD">GBP/USD</option>
            <option value="USD/JPY">USD/JPY</option>
            <option value="USD/CHF">USD/CHF</option>
            <option value="AUD/USD">AUD/USD</option>
            <option value="USD/CAD">USD/CAD</option>
            <option value="EUR/JPY">EUR/JPY</option>
            <option value="GBP/JPY">GBP/JPY</option>
            <option value="AUD/JPY">AUD/JPY</option>
          </select>
        </div>
        
        <div className="input-group">
          <label>Lot Size</label>
          <input
            type="number"
            value={lotSize}
            onChange={(e) => setLotSize(Number(e.target.value))}
            step="0.01"
          />
        </div>
        
        <div className="input-group">
          <label>Account Currency</label>
          <select value={accountCurrency} onChange={(e) => setAccountCurrency(e.target.value)}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
        </div>
      </div>
      
      <button onClick={calculate} className="btn-calculate">
        Calculate Pip Value
      </button>
      
      {result && (
        <div className="result-box">
          <div className="result-item">
            <span className="result-label">Pip Value (per lot)</span>
            <span className="result-value text-green-400">${result.pipValue.toFixed(2)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Total Pip Value</span>
            <span className="result-value text-blue-400">${result.pipValueInAccount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Margin Calculator
const MarginCalculator = () => {
  const [pair, setPair] = useState('EUR/USD')
  const [lotSize, setLotSize] = useState(1)
  const [leverage, setLeverage] = useState(100)
  const [result, setResult] = useState<{ requiredMargin: number; usableMargin: number } | null>(null)
  
  const calculate = () => {
    // Contract size (standard lot)
    const contractSize = 100000
    
    // Get base currency
    const baseCurrency = pair.split('/')[0]
    
    // Simplified margin calculation
    const marginPerLot = contractSize / leverage
    const requiredMargin = marginPerLot * lotSize
    
    // For demo, assume account in USD
    let marginInUSD = requiredMargin
    if (baseCurrency !== 'USD') {
      // Simplified conversion
      marginInUSD = requiredCurrency * 1.1
    }
    
    setResult({
      requiredMargin: marginInUSD,
      usableMargin: 10000 - marginInUSD // Assuming $10k account
    })
  }
  
  // Need to fix the margin calculation
  const requiredCurrency = pair.includes('JPY') ? lotSize * 100000 / leverage : lotSize * 100000 / leverage
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Wallet className="text-purple-400" /> Margin Calculator
      </h3>
      <p className="text-gray-400 text-sm">Calculate the required margin for your trades based on leverage.</p>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="input-group">
          <label>Currency Pair</label>
          <select value={pair} onChange={(e) => setPair(e.target.value)}>
            <option value="EUR/USD">EUR/USD</option>
            <option value="GBP/USD">GBP/USD</option>
            <option value="USD/JPY">USD/JPY</option>
            <option value="USD/CHF">USD/CHF</option>
            <option value="AUD/USD">AUD/USD</option>
            <option value="EUR/GBP">EUR/GBP</option>
            <option value="EUR/JPY">EUR/JPY</option>
          </select>
        </div>
        
        <div className="input-group">
          <label>Lot Size</label>
          <input
            type="number"
            value={lotSize}
            onChange={(e) => setLotSize(Number(e.target.value))}
            step="0.01"
          />
        </div>
        
        <div className="input-group">
          <label>Leverage</label>
          <select value={leverage} onChange={(e) => setLeverage(Number(e.target.value))}>
            <option value="10">1:10</option>
            <option value="20">1:20</option>
            <option value="50">1:50</option>
            <option value="100">1:100</option>
            <option value="200">1:200</option>
            <option value="500">1:500</option>
          </select>
        </div>
      </div>
      
      <button onClick={calculate} className="btn-calculate">
        Calculate Margin
      </button>
      
      {result && (
        <div className="result-box">
          <div className="result-item">
            <span className="result-label">Required Margin</span>
            <span className="result-value text-yellow-400">${result.requiredMargin.toFixed(2)}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Usable Margin</span>
            <span className="result-value text-green-400">${result.usableMargin.toFixed(2)}</span>
          </div>
          <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle size={16} />
              <span className="text-sm">High leverage increases both profits and losses</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Lot Size Calculator
const LotSizeCalculator = () => {
  const [accountBalance, setAccountBalance] = useState(10000)
  const [riskAmount, setRiskAmount] = useState(100)
  const [entryPrice, setEntryPrice] = useState(1.0850)
  const [stopLossPrice, setStopLossPrice] = useState(1.0820)
  const [result, setResult] = useState<{ lots: number; standardLots: number; miniLots: number; microLots: number } | null>(null)
  
  const calculate = () => {
    const isJPY = entryPrice > 100
    const pipSize = isJPY ? 0.01 : 0.0001
    
    const pipsAtRisk = Math.abs(entryPrice - stopLossPrice) / pipSize
    
    if (pipsAtRisk === 0) return
    
    // Pip value per standard lot
    const pipValuePerLot = 10 // For USD pairs
    
    const standardLots = riskAmount / (pipsAtRisk * pipValuePerLot)
    
    setResult({
      lots: standardLots,
      standardLots: Math.floor(standardLots),
      miniLots: Math.floor((standardLots - Math.floor(standardLots)) * 10),
      microLots: Math.round((standardLots % 0.1) * 100)
    })
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Percent className="text-cyan-400" /> Lot Size Calculator
      </h3>
      <p className="text-gray-400 text-sm">Convert your risk amount to different lot sizes.</p>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="input-group">
          <label>Account Balance ($)</label>
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(Number(e.target.value))}
          />
        </div>
        
        <div className="input-group">
          <label>Risk Amount ($)</label>
          <input
            type="number"
            value={riskAmount}
            onChange={(e) => setRiskAmount(Number(e.target.value))}
          />
        </div>
        
        <div className="input-group">
          <label>Entry Price</label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            step="0.00001"
          />
        </div>
        
        <div className="input-group">
          <label className="text-red-400">Stop Loss Price</label>
          <input
            type="number"
            value={stopLossPrice}
            onChange={(e) => setStopLossPrice(Number(e.target.value))}
            step="0.00001"
          />
        </div>
      </div>
      
      <button onClick={calculate} className="btn-calculate">
        Calculate Lot Size
      </button>
      
      {result && (
        <div className="result-box">
          <div className="result-item">
            <span className="result-label">Exact Lot Size</span>
            <span className="result-value text-blue-400">{result.lots.toFixed(4)} lots</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Standard</div>
              <div className="text-xl font-bold text-green-400">{result.standardLots}</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Mini</div>
              <div className="text-xl font-bold text-blue-400">{result.miniLots}</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Micro</div>
              <div className="text-xl font-bold text-purple-400">{result.microLots}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradingTools
