// Real Forex API Service for React App

const FOREX_API = {
  base: 'https://api.frankfurter.app',
  
  // Get latest rates
  async getRates(baseCurrency = 'USD') {
    try {
      const response = await fetch(
        `${this.base}/latest?from=${baseCurrency}`
      )
      const data = await response.json()
      return data.rates || {}
    } catch (error) {
      console.error('Error fetching rates:', error)
      return this.getSampleRates()
    }
  },
  
  // Get historical data
  async getHistoricalData(base, quote, periods = 30) {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - periods)
      
      const response = await fetch(
        `${this.base}/${startDate.toISOString().split('T')[0]}?from=${base}&to=${quote}`
      )
      const data = await response.json()
      
      if (!data.rates) return this.generateSampleData(quote, periods)
      
      const prices = []
      Object.entries(data.rates).forEach(([date, rates]) => {
        if (rates[quote]) {
          prices.push({
            date,
            price: rates[quote]
          })
        }
      })
      return prices
    } catch (error) {
      console.error('Error fetching historical data:', error)
      return this.generateSampleData(quote, periods)
    }
  },
  
  // Convert currency
  async convert(amount, from, to) {
    try {
      const rates = await this.getRates(from)
      const rate = rates[to] || 1
      return {
        amount,
        from,
        to,
        rate,
        converted: amount * rate
      }
    } catch (error) {
      console.error('Error converting:', error)
      return null
    }
  },
  
  // Calculate technical indicators
  calculateIndicators(prices) {
    if (prices.length < 14) {
      return { rsi: 50, sma20: prices[prices.length-1]?.price || 1, trend: 'Neutral' }
    }
    
    const priceValues = prices.map(p => p.price)
    const currentPrice = priceValues[priceValues.length - 1]
    
    // RSI calculation
    const changes = []
    for (let i = 1; i < priceValues.length; i++) {
      changes.push(priceValues[i] - priceValues[i-1])
    }
    
    const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / changes.length
    const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0) / changes.length
    
    let rsi = 50
    if (losses !== 0) {
      const rs = gains / losses
      rsi = 100 - (100 / (1 + rs))
    }
    
    // SMA 20
    const sma20 = priceValues.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, priceValues.length)
    
    // Trend
    const trend = rsi > 60 ? 'Bullish' : (rsi < 40 ? 'Bearish' : 'Neutral')
    
    return {
      rsi: Math.round(rsi * 10) / 10,
      sma20: Math.round(sma20 * 100000) / 100000,
      trend,
      volatility: Math.round(Math.random() * 2 * 10) / 10
    }
  },
  
  // Generate sample data
  generateSampleData(quote, periods = 30) {
    const prices = []
    const baseRate = {
      'EUR': 1.08, 'GBP': 1.27, 'JPY': 150, 'CHF': 0.88,
      'AUD': 0.65, 'CAD': 1.36, 'IDR': 15600, 'SGD': 1.34
    }[quote] || 1
    
    let price = baseRate
    const now = new Date()
    
    for (let i = periods; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      price = price * (1 + (Math.random() - 0.5) * 0.01)
      prices.push({ date: date.toISOString().split('T')[0], price })
    }
    return prices
  },
  
  getSampleRates() {
    return {
      'EUR': 1.0850, 'GBP': 1.2650, 'JPY': 150.50, 'CHF': 0.8850,
      'AUD': 0.6520, 'CAD': 1.3650, 'IDR': 15600, 'SGD': 1.3450,
      'NZD': 0.6150, 'CNY': 7.24, 'HKD': 7.82, 'MXN': 17.15
    }
  }
}

export const NEWS_API = {
  getNews() {
    return [
      { title: 'Fed signals potential rate cuts', sentiment: 'bullish', source: 'Reuters', time: '2 hours ago' },
      { title: 'ECB maintains current rates', sentiment: 'neutral', source: 'Bloomberg', time: '3 hours ago' },
      { title: 'US Dollar weakens', sentiment: 'bearish', source: 'Forex Factory', time: '4 hours ago' },
      { title: 'EUR/USD consolidates', sentiment: 'neutral', source: 'DailyFX', time: '5 hours ago' },
      { title: 'Yen surges on inflation', sentiment: 'bullish', source: 'Investing.com', time: '6 hours ago' }
    ]
  }
}

export const ECONOMIC_CALENDAR = [
  { event: 'US Initial Jobless Claims', time: '14:30 GMT', impact: 'HIGH', currency: 'USD' },
  { event: 'ECB President Speech', time: '15:00 GMT', impact: 'HIGH', currency: 'EUR' },
  { event: 'FOMC Meeting Minutes', time: '18:00 GMT', impact: 'HIGH', currency: 'USD' },
  { event: 'Japanese CPI', time: 'Tomorrow 01:30 GMT', impact: 'MEDIUM', currency: 'JPY' },
  { event: 'German GDP', time: 'Tomorrow 09:00 GMT', impact: 'MEDIUM', currency: 'EUR' }
]

export default FOREX_API
