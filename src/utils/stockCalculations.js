// Constants
export const DEFAULT_STOCKS = [
  { symbol: 'TSLA', currentPrice: 0, avgCost: 210.19, qty: 181 },
  { symbol: 'TSLL', currentPrice: 0, avgCost: 13.70, qty: 2616 },
];

export const DEFAULT_TSLA_SIM = 2600;
export const DEFAULT_TARGET_VALUE = 1000000;
export const DEFAULT_TARGET_PNL = 100;

// Utility functions
export const formatCurrency = (value) => {
  if (!value) return "$0.00";
  return `$${parseFloat(value).toFixed(2).toLocaleString()}`;
};

export const calculateStockValues = (stocks, tslaPrice) => {
  if (tslaPrice === null || tslaPrice === "" || isNaN(tslaPrice)) {
    return { tsla: null, tsll: null, total: null };
  }

  const tsla = {
    ...stocks[0],
    simPrice: tslaPrice.toFixed(2),
    simPnl: (tslaPrice - stocks[0].avgCost) / stocks[0].avgCost,
    cost: stocks[0].avgCost * stocks[0].qty,
    currentMarketValue: stocks[0].currentPrice * stocks[0].qty,
    amount: tslaPrice * stocks[0].qty,
  };

  const tslaPercentChange = (tslaPrice - stocks[0].currentPrice) / stocks[0].currentPrice;
  const tsllPrice = stocks[1].currentPrice * (1 + 2 * tslaPercentChange);

  const tsll = {
    ...stocks[1],
    simPrice: tsllPrice.toFixed(2),
    simPnl: (tsllPrice - stocks[1].avgCost) / stocks[1].avgCost,
    cost: stocks[1].avgCost * stocks[1].qty,
    currentMarketValue: stocks[1].currentPrice * stocks[1].qty,
    amount: tsllPrice * stocks[1].qty,
  };

  const total = {
    amount: tsla.amount + tsll.amount,
    cost: tsla.cost + tsll.cost,
    currentMarketValue: tsla.currentMarketValue + tsll.currentMarketValue,
    pnl: (tsla.amount + tsll.amount - (tsla.cost + tsll.cost)) / (tsla.cost + tsll.cost),
  };

  return { tsla, tsll, total };
};

export const validateStockInput = (value) => {
  const numValue = parseFloat(value);
  return !isNaN(numValue) && numValue >= 0;
}; 