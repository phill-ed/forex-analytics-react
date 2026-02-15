import { useState } from 'react'
import { Newspaper, Calendar, Filter, TrendingUp, TrendingDown, Minus, Banknote, AlertTriangle, Clock } from 'lucide-react'

interface NewsItem {
  id: number
  title: string
  source: string
  time: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  impact: 'high' | 'medium' | 'low'
  category: string
}

interface EconomicEvent {
  id: number
  event: string
  time: string
  country: string
  currency: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  actual?: string
  forecast?: string
  previous?: string
}

const NewsFeed = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'calendar'>('news')
  const [impactFilter, setImpactFilter] = useState<'all' | 'HIGH' | 'MEDIUM' | 'LOW'>('all')
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all')
  
  // Sample news data
  const newsItems: NewsItem[] = [
    { id: 1, title: 'Fed signals potential rate cuts in Q2 as inflation cools', source: 'Reuters', time: '2 hours ago', sentiment: 'bullish', impact: 'high', category: 'Central Bank' },
    { id: 2, title: 'ECB maintains benchmark interest rates at current levels', source: 'Bloomberg', time: '3 hours ago', sentiment: 'neutral', impact: 'high', category: 'Central Bank' },
    { id: 3, title: 'US Dollar weakens amid ongoing trade negotiations', source: 'Forex Factory', time: '4 hours ago', sentiment: 'bearish', impact: 'medium', category: 'Fundamental' },
    { id: 4, title: 'Japanese Yen strengthens on higher than expected CPI', source: 'Investing.com', time: '5 hours ago', sentiment: 'bullish', impact: 'high', category: 'Economy' },
    { id: 5, title: 'EUR/USD consolidates near monthly highs ahead of ECB meeting', source: 'DailyFX', time: '6 hours ago', sentiment: 'neutral', impact: 'low', category: 'Technical' },
    { id: 6, title: 'UK employment data beats expectations, GBP rallies', source: 'FX Street', time: '7 hours ago', sentiment: 'bullish', impact: 'medium', category: 'Economy' },
    { id: 7, title: 'Australian Dollar falls on weaker than expected retail sales', source: 'TradingView', time: '8 hours ago', sentiment: 'bearish', impact: 'medium', category: 'Economy' },
    { id: 8, title: 'Swiss Franc strengthens as safe-haven demand increases', source: 'Reuters', time: '9 hours ago', sentiment: 'neutral', impact: 'low', category: 'Fundamental' },
  ]
  
  // Sample economic events
  const economicEvents: EconomicEvent[] = [
    { id: 1, event: 'US Initial Jobless Claims', time: 'Today 14:30 GMT', country: 'US', currency: 'USD', impact: 'HIGH', actual: '218K', forecast: '210K', previous: '212K' },
    { id: 2, event: 'ECB Interest Rate Decision', time: 'Today 14:15 GMT', country: 'EU', currency: 'EUR', impact: 'HIGH', actual: '4.50%', forecast: '4.50%', previous: '4.50%' },
    { id: 3, event: 'FOMC Meeting Minutes', time: 'Today 18:00 GMT', country: 'US', currency: 'USD', impact: 'HIGH' },
    { id: 4, event: 'UK GDP Growth Rate', time: 'Tomorrow 09:00 GMT', country: 'UK', currency: 'GBP', impact: 'HIGH', forecast: '0.0%', previous: '-0.1%' },
    { id: 5, event: 'Japanese CPI', time: 'Tomorrow 01:30 GMT', country: 'JP', currency: 'JPY', impact: 'MEDIUM', forecast: '2.8%', previous: '2.7%' },
    { id: 6, event: 'German ZEW Economic Sentiment', time: 'Tomorrow 10:00 GMT', country: 'DE', currency: 'EUR', impact: 'MEDIUM', forecast: '15.0', previous: '12.5' },
    { id: 7, event: 'Australian Employment Change', time: 'Tomorrow 02:30 GMT', country: 'AU', currency: 'AUD', impact: 'MEDIUM', forecast: '25K', previous: '15K' },
    { id: 8, event: 'Swiss National Bank Interest Rate', time: 'Tomorrow 08:30 GMT', country: 'CH', currency: 'CHF', impact: 'HIGH', forecast: '1.75%', previous: '1.75%' },
    { id: 9, event: 'Canada Retail Sales', time: 'Tomorrow 13:30 GMT', country: 'CA', currency: 'CAD', impact: 'LOW', forecast: '0.3%', previous: '-0.2%' },
    { id: 10, event: 'New Zealand GDP', time: 'Tomorrow 22:45 GMT', country: 'NZ', currency: 'NZD', impact: 'MEDIUM', forecast: '0.1%', previous: '-0.3%' },
  ]
  
  // Central Bank Rates (sample data)
  const centralBankRates = [
    { bank: 'Federal Reserve (Fed)', rate: '4.50%', change: '+0.00%', trend: 'stable', flag: '🇺🇸' },
    { bank: 'European Central Bank (ECB)', rate: '4.50%', change: '+0.00%', trend: 'stable', flag: '🇪🇺' },
    { bank: 'Bank of England (BoE)', rate: '5.25%', change: '+0.00%', trend: 'stable', flag: '🇬🇧' },
    { bank: 'Bank of Japan (BoJ)', rate: '0.10%', change: '+0.10%', trend: 'up', flag: '🇯🇵' },
    { bank: 'Swiss National Bank (SNB)', rate: '1.75%', change: '+0.00%', trend: 'stable', flag: '🇨🇭' },
    { bank: 'Reserve Bank of Australia (RBA)', rate: '4.35%', change: '+0.00%', trend: 'stable', flag: '🇦🇺' },
    { bank: 'Bank of Canada (BoC)', rate: '5.00%', change: '+0.00%', trend: 'stable', flag: '🇨🇦' },
    { bank: 'RBNZ', rate: '5.50%', change: '+0.00%', trend: 'stable', flag: '🇳🇿' },
  ]
  
  // Inflation data
  const inflationData = [
    { country: 'United States', inflation: '3.2%', trend: 'down', previous: '3.4%', flag: '🇺🇸' },
    { country: 'Euro Area', inflation: '2.6%', trend: 'down', previous: '2.9%', flag: '🇪🇺' },
    { country: 'United Kingdom', inflation: '4.0%', trend: 'down', previous: '4.2%', flag: '🇬🇧' },
    { country: 'Japan', inflation: '2.8%', trend: 'up', previous: '2.7%', flag: '🇯🇵' },
    { country: 'Australia', inflation: '4.1%', trend: 'down', previous: '4.3%', flag: '🇦🇺' },
    { country: 'Canada', inflation: '3.1%', trend: 'down', previous: '3.3%', flag: '🇨🇦' },
  ]
  
  // Filter functions
  const filteredNews = newsItems.filter(item => {
    if (impactFilter !== 'all' && item.impact !== impactFilter.toLowerCase()) return false
    if (sentimentFilter !== 'all' && item.sentiment !== sentimentFilter) return false
    return true
  })
  
  const filteredEvents = economicEvents.filter(event => {
    if (impactFilter !== 'all' && event.impact !== impactFilter) return false
    return true
  })
  
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp size={16} className="text-green-400" />
      case 'bearish': return <TrendingDown size={16} className="text-red-400" />
      default: return <Minus size={16} className="text-gray-400" />
    }
  }
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'bg-red-500'
      case 'MEDIUM': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('news')}
          className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
        >
          <Newspaper size={18} />
          News Feed
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
        >
          <Calendar size={18} />
          Economic Calendar
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm text-gray-400">Impact:</span>
          {(['all', 'HIGH', 'MEDIUM', 'LOW'] as const).map(impact => (
            <button
              key={impact}
              onClick={() => setImpactFilter(impact)}
              className={`filter-button ${impactFilter === impact ? 'active' : ''}`}
            >
              {impact === 'all' ? 'All' : impact}
            </button>
          ))}
        </div>
        
        {activeTab === 'news' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sentiment:</span>
            {(['all', 'bullish', 'neutral', 'bearish'] as const).map(sentiment => (
              <button
                key={sentiment}
                onClick={() => setSentimentFilter(sentiment)}
                className={`filter-button ${sentimentFilter === sentiment ? 'active' : ''}`}
              >
                {sentiment === 'all' ? 'All' : sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Content */}
      {activeTab === 'news' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* News Feed */}
          <div className="news-section">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📰 Latest Forex News
            </h3>
            <div className="space-y-3">
              {filteredNews.map(item => (
                <div key={item.id} className="news-item-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`impact-dot ${getImpactColor(item.impact.toUpperCase())}`} />
                        <span className="text-xs text-gray-400">{item.category}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{item.source}</span>
                      </div>
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} /> {item.time}
                        </span>
                        <span className={`sentiment-badge ${item.sentiment}`}>
                          {getSentimentIcon(item.sentiment)}
                          <span className="ml-1 capitalize">{item.sentiment}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Central Bank Rates */}
          <div className="space-y-6">
            <div className="rates-card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🏦 Central Bank Interest Rates
              </h3>
              <div className="space-y-3">
                {centralBankRates.map((bank, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{bank.flag}</span>
                      <div>
                        <div className="font-medium text-sm">{bank.bank}</div>
                        <div className="text-xs text-gray-500">{bank.change} this year</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-400">{bank.rate}</div>
                      <div className={`text-xs ${bank.trend === 'up' ? 'text-green-400' : bank.trend === 'down' ? 'text-red-400' : 'text-gray-500'}`}>
                        {bank.trend === 'up' ? '↑ Raised' : bank.trend === 'down' ? '↓ Cut' : '→ Stable'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Inflation Data */}
            <div className="rates-card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                📊 Inflation Data (CPI)
              </h3>
              <div className="space-y-3">
                {inflationData.map((data, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{data.flag}</span>
                      <span className="font-medium">{data.country}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{data.inflation}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Prev: {data.previous}</span>
                        <span className={`flex items-center gap-1 ${data.trend === 'down' ? 'text-green-400' : 'text-red-400'}`}>
                          {data.trend === 'down' ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                          {data.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📅 Economic Calendar
          </h3>
          <div className="space-y-3">
            {filteredEvents.map(event => (
              <div key={event.id} className="calendar-event-card">
                <div className="flex items-center gap-4">
                  <div className={`impact-indicator ${getImpactColor(event.impact)}`}>
                    {event.impact === 'HIGH' ? '🔴' : event.impact === 'MEDIUM' ? '🟡' : '🟢'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.event}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">{event.currency}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {event.time}
                      </span>
                      <span>{event.country}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {event.actual && (
                      <div className={`font-bold ${parseFloat(event.actual) > parseFloat(event.previous || '0') ? 'text-green-400' : 'text-red-400'}`}>
                        {event.actual}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Forecast: {event.forecast || '—'}
                    </div>
                    {event.previous && (
                      <div className="text-xs text-gray-600">
                        Prev: {event.previous}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
              <p>No events match your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NewsFeed
