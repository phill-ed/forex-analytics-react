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
import { TrendingUp, TrendingDown, Minus, Activity, BarChart2 } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

// Generate sample OHLC data
const generateOHLC = (basePrice: number, count: number = 50) => {
  const data = []
  let price = basePrice
  for (let i = 0; i < count; i++) {
    const volatility = 0.002
    const open = price
    const change = (Math.random() - 0.5) * price * volatility
    const close = price + change
    const high = Math.max(open, close) + Math.random() * price * 0.001
    const low = Math.min(open, close) - Math.random() * price * 0.001
    data.push({ open, high, low, close, time: i })
    price = close
  }
  return data
}

// Calculate RSI
const calculateRSI = (prices: number[], period: number = 14) => {
  if (prices.length < period + 1) return 50
  
  let gains = 0
  let losses = 0
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1]
    if (change > 0) gains += change
    else losses -= change
  }
  
  const avgGain = gains / period
  const avgLoss = losses / period
  
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

// Calculate SMA
const calculateSMA = (prices: number[], period: number) => {
  const sma = []
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }
  return sma
}

// Calculate EMA
const calculateEMA = (prices: number[], period: number) => {
  const ema = []
  const multiplier = 2 / (period + 1)
  
  // Start with SMA
  let sum = prices.slice(0, period).reduce((a, b) => a + b, 0)
  let avg = sum / period
  
  for (let i = 0; i < period - 1; i++) {
    ema.push(null)
  }
  ema.push(avg)
  
  for (let i = period; i < prices.length; i++) {
    avg = (prices[i] - avg) * multiplier + avg
    ema.push(avg)
  }
  return ema
}

// Calculate MACD
const calculateMACD = (prices: number[]) => {
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)
  
  const macdLine = ema12.map((v, i) => (v && ema26[i]) ? v - ema26[i] : null)
  
  // Signal line (9-period EMA of MACD)
  const validMacd = macdLine.filter(v => v !== null) as number[]
  const signalLine = calculateEMA(validMacd, 9)
  
  // Histogram
  const histogram = macdLine.map((v, i) => {
    if (v === null) return null
    const signalIdx = macdLine.slice(0, i + 1).filter(x => x !== null).length - 1
    return signalIdx >= 0 && signalLine[signalIdx] ? v - signalLine[signalIdx] : null
  })
  
  return { macdLine, signalLine: [...Array(26).fill(null), ...signalLine], histogram }
}

// Calculate Bollinger Bands
const calculateBollingerBands = (prices: number[], period: number = 20) => {
  const sma = calculateSMA(prices, period)
  const upper = []
  const lower = []
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1)
    const mean = sma[i - period + 1]
    const variance = slice.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / period
    const stdDev = Math.sqrt(variance)
    upper.push(mean + 2 * stdDev)
    lower.push(mean - 2 * stdDev)
  }
  
  return { 
    middle: [...Array(period - 1).fill(null), ...sma],
    upper: [...Array(period - 1).fill(null), ...upper],
    lower: [...Array(period - 1).fill(null), ...lower]
  }
}

// Calculate Stochastic
const calculateStochastic = (ohlc: { high: number, low: number, close: number }[], period: number = 14) => {
  const k = []
  const d = []
  
  for (let i = period - 1; i < ohlc.length; i++) {
    const highs = ohlc.slice(i - period + 1, i + 1).map(c => c.high)
    const lows = ohlc.slice(i - period + 1, i + 1).map(c => c.low)
    const highestHigh = Math.max(...highs)
    const lowestLow = Math.min(...lows)
    const close = ohlc[i].close
    
    const kVal = highestLow === lowestLow ? 50 : ((close - lowestLow) / (highestHigh - lowestLow)) * 100
    k.push(kVal)
  }
  
  // D is 3-period SMA of K
  for (let i = 2; i < k.length; i++) {
    const dVal = (k[i] + k[i-1] + k[i-2]) / 3
    d.push(dVal)
  }
  
  return {
    k: [...Array(period + 1).fill(null), ...k],
    d: [...Array(period + 2).fill(null), ...d]
  }
}

// Detect candlestick patterns
const detectPattern = (ohlc: { open: number, high: number, low: number, close: number }[]) => {
  if (ohlc.length < 2) return null
  
  const last = ohlc[ohlc.length - 1]
  const prev = ohlc[ohlc.length - 2]
  
  const body = Math.abs(last.close - last.open)
  const upperWick = last.high - Math.max(last.open, last.close)
  const lowerWick = Math.min(last.open, last.close) - last.low
  const totalRange = last.high - last.low
  
  // Doji
  if (body < totalRange * 0.1 && (upperWick > body * 2 || lowerWick > body * 2)) {
    return { name: 'Doji', type: 'neutral' as const, description: 'Indecision in the market' }
  }
  
  // Hammer (bullish reversal)
  if (lowerWick > body * 2 && upperWick < body * 0.5 && last.close > last.open) {
    return { name: 'Hammer', type: 'bullish' as const, description: 'Potential bullish reversal' }
  }
  
  // Shooting Star (bearish reversal)
  if (upperWick > body * 2 && lowerWick < body * 0.5 && last.close < last.open) {
    return { name: 'Shooting Star', type: 'bearish' as const, description: 'Potential bearish reversal' }
  }
  
  // Bullish Engulfing
  if (prev.close < prev.open && last.close > last.open && last.close > prev.open && last.open < prev.close) {
    return { name: 'Bullish Engulfing', type: 'bullish' as const, description: 'Strong bullish reversal signal' }
  }
  
  // Bearish Engulfing
  if (prev.close > prev.open && last.close < last.open && last.close < prev.open && last.open > prev.close) {
    return { name: 'Bearish Engulfing', type: 'bearish' as const, description: 'Strong bearish reversal signal' }
  }
  
  return null
}

interface TechnicalAnalysisProps {
  pair: string
  timeframe: string
}

const TechnicalAnalysis = ({ pair, timeframe }: TechnicalAnalysisProps) => {
  const basePrice = pair.includes('JPY') ? 150.5 : 1.0850
  const ohlc = generateOHLC(basePrice)
  const prices = ohlc.map(d => d.close)
  
  // Calculate indicators
  const rsi = calculateRSI(prices)
  const sma20 = calculateSMA(prices, 20)
  const sma50 = calculateSMA(prices, 50)
  const macd = calculateMACD(prices)
  const bollinger = calculateBollingerBands(prices)
  const stochastic = calculateStochastic(ohlc)
  const pattern = detectPattern(ohlc)
  
  // Trend strength using ADX-like calculation
  const calculateTrendStrength = () => {
    const recentPrices = prices.slice(-20)
    const changes = recentPrices.map((p, i) => i > 0 ? p - recentPrices[i-1] : 0).filter(c => c !== 0)
    const positiveChanges = changes.filter(c => c > 0).reduce((a, b) => a + b, 0)
    const totalChange = Math.abs(changes.reduce((a, b) => a + b, 0))
    const strength = totalChange > 0 ? (positiveChanges / totalChange) * 100 : 50
    return strength
  }
  
  const trendStrength = calculateTrendStrength()
  const trendDirection = prices[prices.length - 1] > prices[prices.length - 20] ? 'bullish' : 'bearish'
  
  // Support/Resistance levels
  const currentPrice = prices[prices.length - 1]
  const support = {
    s1: currentPrice * 0.995,
    s2: currentPrice * 0.990,
    s3: currentPrice * 0.985
  }
  const resistance = {
    r1: currentPrice * 1.005,
    r2: currentPrice * 1.010,
    r3: currentPrice * 1.015
  }
  
  // Chart data for main price chart with indicators
  const chartData = {
    labels: ohlc.map((_, i) => i.toString()),
    datasets: [
      {
        label: 'Price',
        data: prices,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: 'SMA 20',
        data: [...Array(19).fill(null), ...sma20],
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: 'SMA 50',
        data: [...Array(49).fill(null), ...sma50],
        borderColor: '#8b5cf6',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: 'BB Upper',
        data: bollinger.upper,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false
      },
      {
        label: 'BB Lower',
        data: bollinger.lower,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderWidth: 1,
        pointRadius: 0,
        fill: '-1',
        backgroundColor: 'rgba(239, 68, 68, 0.05)'
      }
    ]
  }
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const, labels: { color: '#9ca3af' } }
    },
    scales: {
      x: { display: false },
      y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9ca3af' } }
    }
  }
  
  // MACD Chart
  const macdData = {
    labels: macd.macdLine.map((_, i) => i.toString()),
    datasets: [
      {
        label: 'MACD',
        data: macd.macdLine,
        borderColor: '#3b82f6',
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: 'Signal',
        data: macd.signalLine,
        borderColor: '#f59e0b',
        tension: 0.4,
        pointRadius: 0
      }
    ]
  }
  
  // Stochastic Chart
  const stochData = {
    labels: stochastic.k.map((_, i) => i.toString()),
    datasets: [
      {
        label: '%K',
        data: stochastic.k,
        borderColor: '#8b5cf6',
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: '%D',
        data: stochastic.d,
        borderColor: '#ec4899',
        tension: 0.4,
        pointRadius: 0
      }
    ]
  }
  
  const indicatorChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { 
        min: 0, max: 100,
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#9ca3af' }
      }
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Indicator Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="tech-card">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-blue-400" />
            <span className="text-gray-400 text-sm">RSI (14)</span>
          </div>
          <div className={`text-2xl font-bold ${rsi > 70 ? 'text-red-400' : rsi < 30 ? 'text-green-400' : 'text-white'}`}>
            {rsi.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'}
          </div>
        </div>
        
        <div className="tech-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-purple-400" />
            <span className="text-gray-400 text-sm">MACD</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {(macd.macdLine.filter(v => v !== null).slice(-1)[0] || 0).toFixed(5)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(macd.macdLine.filter(v => v !== null).slice(-1)[0] || 0) > 0 ? 'Bullish' : 'Bearish'}
          </div>
        </div>
        
        <div className="tech-card">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={16} className="text-green-400" />
            <span className="text-gray-400 text-sm">Stoch (14)</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stochastic.k.filter(v => v !== null).slice(-1)[0]?.toFixed(1) || '—'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stochastic.k.filter(v => v !== null).slice(-1)[0] > 80 ? 'Overbought' : 
             stochastic.k.filter(v => v !== null).slice(-1)[0] < 20 ? 'Oversold' : 'Neutral'}
          </div>
        </div>
        
        <div className="tech-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-amber-400" />
            <span className="text-gray-400 text-sm">Trend</span>
          </div>
          <div className="text-2xl font-bold text-white capitalize">{trendDirection}</div>
          <div className="text-xs text-gray-500 mt-1">
            Strength: {trendStrength.toFixed(0)}%
          </div>
        </div>
        
        <div className="tech-card">
          <div className="flex items-center gap-2 mb-2">
            <Minus size={16} className="text-cyan-400" />
            <span className="text-gray-400 text-sm">BB Position</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {currentPrice > (bollinger.upper[bollinger.upper.length-1] || 0) ? 'Above' :
             currentPrice < (bollinger.lower[bollinger.lower.length-1] || 0) ? 'Below' : 'Inside'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Bollinger Bands
          </div>
        </div>
      </div>
      
      {/* Pattern Detection */}
      {pattern && (
        <div className={`pattern-card ${pattern.type}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {pattern.type === 'bullish' ? '🟢' : pattern.type === 'bearish' ? '🔴' : '⚪'}
            </span>
            <div>
              <div className="font-bold text-lg">{pattern.name}</div>
              <div className="text-sm opacity-80">{pattern.description}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Chart with Indicators */}
      <div className="chart-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📈 Price Chart with SMA & Bollinger Bands
        </h3>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      {/* MACD & Stochastic */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="chart-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📊 MACD (12, 26, 9)
          </h3>
          <div className="h-40">
            <Line data={macdData} options={indicatorChartOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🎯 Stochastic Oscillator
          </h3>
          <div className="h-40">
            <Line data={stochData} options={indicatorChartOptions} />
          </div>
        </div>
      </div>
      
      {/* Support & Resistance */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="chart-card">
          <h3 className="text-lg font-semibold mb-4 text-red-400">🔴 Resistance Levels</h3>
          <div className="space-y-3">
            {Object.entries(resistance).map(([level, value]) => (
              <div key={level} className="flex justify-between items-center p-3 bg-red-900/30 rounded-lg border border-red-800">
                <span className="text-red-400 font-medium">R{level.replace('r', '')}</span>
                <span className="text-red-300 font-mono">{value.toFixed(5)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="chart-card">
          <h3 className="text-lg font-semibold mb-4 text-green-400">🟢 Support Levels</h3>
          <div className="space-y-3">
            {Object.entries(support).map(([level, value]) => (
              <div key={level} className="flex justify-between items-center p-3 bg-green-900/30 rounded-lg border border-green-800">
                <span className="text-green-400 font-medium">S{level.replace('s', '')}</span>
                <span className="text-green-300 font-mono">{value.toFixed(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicalAnalysis
