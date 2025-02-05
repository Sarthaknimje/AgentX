// RSI calculation
export const calculateRSI = (prices, period = 14) => {
    if (!prices || prices.length < period) return 0;
  
    let gains = 0;
    let losses = 0;
  
    for (let i = 1; i < period; i++) {
      const difference = prices[i] - prices[i - 1];
      if (difference >= 0) {
        gains += difference;
      } else {
        losses -= difference;
      }
    }
  
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
  
    return rsi.toFixed(2);
  };
  
  // MACD calculation
  export const calculateMACD = (prices, shortPeriod = 12, longPeriod = 26) => {
    if (!prices || prices.length < longPeriod) return 0;
  
    const shortEMA = calculateEMA(prices, shortPeriod);
    const longEMA = calculateEMA(prices, longPeriod);
    const macd = shortEMA - longEMA;
  
    return macd.toFixed(2);
  };
  
  // Helper function for MACD
  const calculateEMA = (prices, period) => {
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
  
    return ema;
  };