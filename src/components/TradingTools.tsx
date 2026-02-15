import { useState, useEffect } from 'react'
import { 
  Calculator, TrendingUp, TrendingDown, Info, 
  RefreshCw, Settings, DollarSign, Percent, AlertTriangle
} from 'lucide-react'

// Calculator types
type CalculatorType = 'position' | 'risk' | 'pip' | 'margin' | 'lot'

// Currency pairs info
const PAIR_INFO: Record<string, { pip: number, lotSize: number, currency: string }> = {
  'EUR/USD': { pip: 0.0001, lotSize: 100000, currency: 'EUR' },
  'GBP/USD': { pip: 0.0001, lotSize: 100000, currency: 'GBP' },
  'USD/JPY': { pip: 0.01, lotSize: 100000, currency: 'JPY' },
  'USD/CHF': { pip: 0.0001, lotSize: 100000, currency: 'CHF' },
  'AUD/USD': { pip: 0.0001, lotSize: 100000, currency: 'AUD' },
  'USD/CAD': { pip: 0.0001, lotSize: 100000, currency: 'CAD' },
  'NZD/USD': { pip: 0.0001, lotSize: 100000, currency: 'NZD' },
  'EUR/JPY': { pip: 0.01, lotSize: 100000, currency: 'EUR' },
  'GBP/JPY': { pip: 0.01, lotSize: 100000, currency: 'GBP' },
}

interface CalculatorProps {
  type: CalculatorType
}

const PositionSizeCalculator = () => {
  const [accountBalance, setAccountBalance] = useState(10000)
  const [riskPercent, setRiskPercent] = useState(2)
  const [stopLoss, setStopLoss] = useState(50)
  const [pair, setPair] = useState('EUR/USD')
  const [result, setResult] = useState<{ units: number, lots: number, riskAmount: number } | null>(null)

  const calculate = () => {
    const info = PAIR_INFO[pair] || { pip: 0.0001, lotSize: 100000 }
    const riskAmount = accountBalance * (riskPercent / 100)
    const pipsValue = stopLoss * info.pip
    const units = Math.floor(riskAmount / pipsValue)
    const lots = units / info.lotSize

    setResult({
      units,
      lots: Math.round(lots * 100) / 100,
      riskAmount: Math.round(riskAmount * 100) / 100
    })
  }

  useEffect(calculate, [accountBalance, riskPercent, stopLoss, pair])

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Account Balance</label>
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Risk Percentage (%)</label>
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Stop Loss (Pips)</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Currency Pair</label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          >
            {Object.keys(PAIR_INFO).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-purple-900/30 rounded-lg border border-purple-800">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-gray-400 text-sm">Position Size</div>
              <div className="text-2xl font-bold text-white">{result.lots} Lots</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Units</div>
              <div className="text-2xl font-bold text-white">{result.units.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Risk Amount</div>
              <div className="text-2xl font-bold text-red-400">${result.riskAmount}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const RiskRewardCalculator = () => {
  const [entryPrice, setEntryPrice] = useState(1.0850)
  const [stopLoss, setStopLoss] = useState(1.0800)
  const [takeProfit, setTakeProfit] = useState(1.0950)
  const [lotSize, setLotSize] = useState(1)
  const [pair, setPair] = useState('EUR/USD')
  const [result, setResult] = useState<{ rr: number, profit: number, loss: number } | null>(null)

  const calculate = () => {
    const info = PAIR_INFO[pair] || { pip: 0.0001, lotSize: 100000 }
    const pipsToStop = Math.abs(entryPrice - stopLoss) / info.pip
    const pipsToTarget = Math.abs(takeProfit - entryPrice) / info.pip
    const rr = pipsToTarget / pipsToStop
    
    const pipsValue = info.pip * info.lotSize * lotSize
    const profit = pipsToTarget * pipsValue
    const loss = pipsToStop * pipsValue

    setResult({
      rr: Math.round(rr * 10) / 10,
      profit: Math.round(profit * 100) / 100,
      loss: Math.round(loss * 100) / 100
    })
  }

  useEffect(calculate, [entryPrice, stopLoss, takeProfit, lotSize, pair])

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Entry Price</label>
          <input
            type="number"
            step="0.0001"
            value={entryPrice}
            onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Stop Loss</label>
          <input
            type="number"
            step="0.0001"
            value={stopLoss}
            onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Take Profit</label>
          <input
            type="number"
            step="0.0001"
            value={takeProfit}
            onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Lot Size</label>
          <input
            type="number"
            step="0.01"
            value={lotSize}
            onChange={(e) => setLotSize(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
      </div>

      {result && (
        <div className="mt-4 space-y-3">
          <div className={`p-4 rounded-lg border ${
            result.rr >= 2 ? 'bg-green-900/30 border-green-800' :
            result.rr >= 1 ? 'bg-yellow-900/30 border-yellow-800' :
            'bg-red-900/30 border-red-800'
          }`}>
            <div className="text-center">
              <div className="text-gray-400 text-sm">Risk/Reward Ratio</div>
              <div className="text-3xl font-bold text-white">1:{result.rr}</div>
              <div className="text-sm text-gray-400 mt-1">
                {result.rr >= 2 ? '✅ Good risk/reward' : result.rr >= 1 ? '⚠️ Acceptable' : '❌ Poor risk/reward'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-900/30 rounded-lg border border-red-800 text-center">
              <div className="text-gray-400 text-sm">Potential Loss</div>
              <div className="text-xl font-bold text-red-400">-${result.loss}</div>
            </div>
            <div className="p-4 bg-green-900/30 rounded-lg border border-green-800 text-center">
              <div className="text-gray-400 text-sm">Potential Profit</div>
              <div className="text-xl font-bold text-green-400">+${result.profit}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const PipValueCalculator = () => {
  const [lotSize, setLotSize] = useState(1)
  const [pair, setPair] = useState('EUR/USD')
  const [accountCurrency, setAccountCurrency] = useState('USD')
  const [result, setResult] = useState<{ pipValue: number, perPip: number } | null>(null)

  const calculate = () => {
    const info = PAIR_INFO[pair] || { pip: 0.0001, lotSize: 100000 }
    const basePipValue = info.pip * info.lotSize * lotSize
    
    // Simplified conversion (in real app, would fetch actual rates)
    const rates: Record<string, number> = { EUR: 1.08, GBP: 1.27, JPY: 0.0067, CHF: 1.13, AUD: 0.66, CAD: 0.74, NZD: 0.61 }
    const conversion = accountCurrency === 'USD' ? 1 : (1 / (rates[info.currency] || 1))
    
    const perPip = basePipValue * conversion
    
    setResult({
      pipValue: perPip,
      perPip: Math.round(perPip * 100) / 100
    })
  }

  useEffect(calculate, [lotSize, pair, accountCurrency])

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Lot Size</label>
          <input
            type="number"
            step="0.01"
            value={lotSize}
            onChange={(e) => setLotSize(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Currency Pair</label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          >
            {Object.keys(PAIR_INFO).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Account Currency</label>
          <select
            value={accountCurrency}
            onChange={(e) => setAccountCurrency(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
        </div>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-800">
          <div className="text-center">
            <div className="text-gray-400 text-sm">Pip Value ({accountCurrency})</div>
            <div className="text-3xl font-bold text-white">${result.perPip}</div>
            <div className="text-sm text-gray-400 mt-1">
              Per 1 pip move at {lotSize} lots
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const MarginCalculator = () => {
  const [lotSize, setLotSize] = useState(1)
  const [leverage, setLeverage] = useState(100)
  const [pair, setPair] = useState('EUR/USD')
  const [result, setResult] = useState<{ required: number, effective: number } | null>(null)

  const calculate = () => {
    const info = PAIR_INFO[pair] || { lotSize: 100000 }
    const contractSize = info.lotSize * lotSize
    const required = contractSize / leverage
    const effective = contractSize

    setResult({
      required: Math.round(required * 100) / 100,
      effective: Math.round(effective * 100) / 100
    })
  }

  useEffect(calculate, [lotSize, leverage, pair])

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Lot Size</label>
          <input
            type="number"
            step="0.01"
            value={lotSize}
            onChange={(e) => setLotSize(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Leverage</label>
          <select
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="10">1:10</option>
            <option value="20">1:20</option>
            <option value="50">1:50</option>
            <option value="100">1:100</option>
            <option value="200">1:200</option>
            <option value="500">1:500</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Currency Pair</label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          >
            {Object.keys(PAIR_INFO).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-800 text-center">
            <div className="text-gray-400 text-sm">Required Margin</div>
            <div className="text-2xl font-bold text-white">${result.required.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-800 text-center">
            <div className="text-gray-400 text-sm">Position Value</div>
            <div className="text-2xl font-bold text-white">${result.effective.toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  )
}

const LotSizeCalculator = () => {
  const [accountBalance, setAccountBalance] = useState(10000)
  const [riskPercent, setRiskPercent] = useState(2)
  const [stopLossPips, setStopLossPips] = useState(50)
  const [pair, setPair] = useState('EUR/USD')
  const [result, setResult] = useState<{ lots: number, units: number, riskAmount: number } | null>(null)

  const calculate = () => {
    const info = PAIR_INFO[pair] || { pip: 0.0001, lotSize: 100000 }
    const riskAmount = accountBalance * (riskPercent / 100)
    const pipsValue = stopLossPips * info.pip * info.lotSize
    const lots = riskAmount / pipsValue

    setResult({
      lots: Math.round(lots * 100) / 100,
      units: Math.floor(lots * info.lotSize),
      riskAmount: Math.round(riskAmount * 100) / 100
    })
  }

  useEffect(calculate, [accountBalance, riskPercent, stopLossPips, pair])

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Account Balance</label>
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Risk Percentage (%)</label>
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Stop Loss (Pips)</label>
          <input
            type="number"
            value={stopLossPips}
            onChange={(e) => setStopLossPips(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Currency Pair</label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
          >
            {Object.keys(PAIR_INFO).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-green-900/30 rounded-lg border border-green-800">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-gray-400 text-sm">Recommended Lots</div>
              <div className="text-2xl font-bold text-white">{result.lots}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Units</div>
              <div className="text-2xl font-bold text-white">{result.units.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Risk Amount</div>
              <div className="text-2xl font-bold text-red-400">${result.riskAmount}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const TradingTools = () => {
  const [activeCalc, setActiveCalc] = useState<CalculatorType>('position')

  const calculators = [
    { id: 'position', label: '📊 Position Size', icon: Calculator, component: PositionSizeCalculator },
    { id: 'risk', label: '⚖️ Risk/Reward', icon: TrendingUp, component: RiskRewardCalculator },
    { id: 'pip', label: '💰 Pip Value', icon: DollarSign, component: PipValueCalculator },
    { id: 'margin', label: '🏦 Margin', icon: Percent, component: MarginCalculator },
    { id: 'lot', label: '📈 Lot Size', icon: TrendingDown, component: LotSizeCalculator },
  ]

  const ActiveComponent = calculators.find(c => c.id === activeCalc)?.component || PositionSizeCalculator

  return (
    <div className="space-y-6">
      {/* Calculator Tabs */}
      <div className="flex flex-wrap gap-2">
        {calculators.map(calc => (
          <button
            key={calc.id}
            onClick={() => setActiveCalc(calc.id as CalculatorType)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeCalc === calc.id 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <calc.icon size={18} />
            {calc.label}
          </button>
        ))}
      </div>

      {/* Calculator Content */}
      <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          {calculators.find(c => c.id === activeCalc)?.label}
        </h3>
        <ActiveComponent />
      </div>

      {/* Quick Reference */}
      <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-800">
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <Info size={16} className="text-gray-400" />
          Quick Reference
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="text-gray-400 mb-1">Standard Lot</div>
            <div className="text-white font-medium">100,000 units</div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="text-gray-400 mb-1">Mini Lot</div>
            <div className="text-white font-medium">10,000 units</div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="text-gray-400 mb-1">Micro Lot</div>
            <div className="text-white font-medium">1,000 units</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TradingTools
