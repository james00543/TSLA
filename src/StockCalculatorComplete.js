import React, { useState, useEffect, useMemo } from 'react';
import {
  DEFAULT_STOCKS,
  DEFAULT_TSLA_SIM,
  DEFAULT_TARGET_VALUE,
  DEFAULT_TARGET_PNL,
  formatCurrency,
  calculateStockValues,
  validateStockInput
} from './utils/stockCalculations';

const FINNHUB_TOKEN = process.env.REACT_APP_FINNHUB_API_KEY;

const EnhancedStockCalculatorWithRESTAPI = () => {
  const [stocks, setStocks] = useState(DEFAULT_STOCKS);
  const [tslaSim, setTslaSim] = useState(DEFAULT_TSLA_SIM);
  const [inputTslaSim, setInputTslaSim] = useState(tslaSim);
  const [targetValue, setTargetValue] = useState(DEFAULT_TARGET_VALUE);
  const [targetPnL, setTargetPnL] = useState(DEFAULT_TARGET_PNL);
  const [goalSeekResult, setGoalSeekResult] = useState(null);
  const [goalSeekMode, setGoalSeekMode] = useState('amount');
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stock prices using REST API
  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!FINNHUB_TOKEN) {
          throw new Error('Finnhub API key is not configured. Please check your environment variables.');
        }

        const stockSymbols = ['TSLA', 'TSLL'];
        const stockPromises = stockSymbols.map(symbol =>
          fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_TOKEN}`)
            .then(res => {
              if (!res.ok) {
                throw new Error(`Failed to fetch data for ${symbol}`);
              }
              return res.json();
            })
            .then(data => {
              if (!data.c) {
                throw new Error(`Invalid data received for ${symbol}`);
              }
              return { symbol, currentPrice: data.c };
            })
        );

        const stockData = await Promise.all(stockPromises);

        setStocks(stocks.map(stock => {
          const updatedStock = stockData.find(s => s.symbol === stock.symbol);
          return updatedStock ? { ...stock, currentPrice: updatedStock.currentPrice } : stock;
        }));

        // Calculate current portfolio value
        const totalPortfolioValue = stockData.reduce((acc, stock) => {
          const matchingStock = stocks.find(s => s.symbol === stock.symbol);
          return acc + (stock.currentPrice * matchingStock.qty);
        }, 0);
        setPortfolioValue(totalPortfolioValue);

      } catch (err) {
        console.error('Failed to fetch stock data:', err);
        setError(err.message || 'Failed to fetch stock data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, []);

  const handleStockChange = (index, field, value) => {
    if (!validateStockInput(value)) return;

    const newStocks = [...stocks];
    newStocks[index][field] = parseFloat(value);
    setStocks(newStocks);
  };

  // Memoize the calculation function
  const calculateValues = useMemo(() => {
    return (tslaPrice) => calculateStockValues(stocks, tslaPrice);
  }, [stocks]);

  const runGoalSeek = () => {
    let low = 0;
    let high = 10000;
    let mid;
    let result;
    const tolerance = 0.00001;
    let iterations = 0;
    const maxIterations = 10000;
  
    while (high - low > tolerance && iterations < maxIterations) {
      mid = (low + high) / 2;
      result = calculateValues(mid);
  
      if (goalSeekMode === 'amount') {
        if (result.total.amount > targetValue) {
          high = mid;
        } else {
          low = mid;
        }
      } else {
        if ((result.total.pnl * 100) > targetPnL) {
          high = mid;
        } else {
          low = mid;
        }
      }
  
      iterations++;
    }
  
    setGoalSeekResult({
      tsla: {
        simPrice: result.tsla.simPrice ? parseFloat(result.tsla.simPrice).toFixed(2) : 0,
        avgCost: result.tsla.avgCost ? parseFloat(result.tsla.avgCost).toFixed(2) : 0,
        simPnl: result.tsla.simPnl ? (result.tsla.simPnl * 100).toFixed(2) : 0,
        cost: result.tsla.cost ? parseFloat(result.tsla.cost).toFixed(2) : 0,
        currentMarketValue: result.tsla.currentMarketValue ? parseFloat(result.tsla.currentMarketValue).toFixed(2) : 0,
        amount: result.tsla.amount ? parseFloat(result.tsla.amount).toFixed(2) : 0,
      },
      tsll: {
        simPrice: result.tsll.simPrice ? parseFloat(result.tsll.simPrice).toFixed(2) : 0,
        avgCost: result.tsll.avgCost ? parseFloat(result.tsll.avgCost).toFixed(2) : 0,
        simPnl: result.tsll.simPnl ? (result.tsll.simPnl * 100).toFixed(2) : 0,
        cost: result.tsll.cost ? parseFloat(result.tsll.cost).toFixed(2) : 0,
        currentMarketValue: result.tsll.currentMarketValue ? parseFloat(result.tsll.currentMarketValue).toFixed(2) : 0,
        amount: result.tsll.amount ? parseFloat(result.tsll.amount).toFixed(2) : 0,
      },
      total: {
        cost: result.total.cost ? parseFloat(result.total.cost).toFixed(2) : 0,
        currentMarketValue: result.total.currentMarketValue ? parseFloat(result.total.currentMarketValue).toFixed(2) : 0,
        amount: result.total.amount ? parseFloat(result.total.amount).toFixed(2) : 0,
        pnl: result.total.pnl ? (result.total.pnl * 100).toFixed(2) : 0,
      }
    });
  };

  const { tsla, tsll, total } = calculateValues(tslaSim);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Stock Portfolio Simulator */}
      <div className="section bg-blue-50 p-4 rounded-md mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Tesla Stock Portfolio Simulator with Leveraged ETF</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading stock data...</span>
          </div>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">TSLA Simulated Price:</label>
            <input
              type="number"
              value={inputTslaSim || ''}
              onChange={(e) => setInputTslaSim(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
            />
            <button
              onClick={() => setTslaSim(inputTslaSim)}
              className="w-full mt-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Submit
            </button>
          </>
        )}
      </div>

      {/* Stock Details Table with Inline Editing */}
      <div className="section bg-gray-50 p-4 rounded-md mb-8 overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4">Stock Details</h2>
        <table className="min-w-full border-collapse border border-gray-300 divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 border border-gray-300 text-center">Symbol</th>
              <th className="px-2 py-2 border border-gray-300 text-center">Market Price</th>
              <th className="px-2 py-2 border border-gray-300 text-center">Avg Cost</th>
              <th className="px-2 py-2 border border-gray-300 text-center">Quantity</th>
              <th className="px-2 py-2 border border-gray-300 text-center">Cost</th>
              <th className="px-2 py-2 border border-gray-300 text-center">Current Market Value</th>
              <th className="px-2 py-2 border border-gray-300 text-center">Sim Price</th>
              <th className="px-2 py-2 border border-gray-300 text-center">Sim P&L %</th>
              <th className="px-2 py-2 border border-gray-300 text-center">Simulated Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-center">
            {[tsla, tsll].map((stock, index) => (
              <tr key={stock.symbol}>
                <td className="px-2 py-2 border border-gray-300">{stock.symbol}</td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(stock.currentPrice)}</td>
                <td className="px-2 py-2 border border-gray-300">
                  <input
                    type="number"
                    value={stock.avgCost}
                    onChange={(e) => handleStockChange(index, 'avgCost', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded-md text-center"
                  />
                </td>
                <td className="px-2 py-2 border border-gray-300">
                  <input
                    type="number"
                    value={stock.qty}
                    onChange={(e) => handleStockChange(index, 'qty', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded-md text-center"
                  />
                </td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(stock.cost)}</td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(stock.currentMarketValue)}</td>
                <td className="px-2 py-2 border border-gray-300"> {`$${parseFloat(stock.simPrice).toFixed(2)}`}</td>
                <td className="px-2 py-2 border border-gray-300">{(stock.simPnl * 100).toFixed(2)}%</td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(stock.amount)}</td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="px-2 py-2 border border-gray-300" colSpan={4}>Total:</td>
              <td className="px-2 py-2 border border-gray-300">{formatCurrency(total.cost)}</td>
              <td className="px-2 py-2 border border-gray-300">{formatCurrency(total.currentMarketValue)}</td>
              <td className="px-2 py-2 border border-gray-300" colSpan={1}></td>
                <td className="px-2 py-2 border border-gray-300" colSpan={1}>
                {(total.pnl * 100).toFixed(2)}%
                </td>
              <td className="px-2 py-2 border border-gray-300">{formatCurrency(total.amount)}</td>
            </tr>
          </tbody>
        </table>

      </div>

      {/* Goal Seek Section */}
      <div className="section bg-blue-50 p-4 rounded-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Goal Seek</h2>
        <div className="flex justify-center mb-4">
          <label className="mr-4">
            <input
              type="radio"
              value="amount"
              checked={goalSeekMode === 'amount'}
              onChange={() => setGoalSeekMode('amount')}
              className="mr-2"
            />
            Target Total Amount
          </label>
          <label>
            <input
              type="radio"
              value="pnl"
              checked={goalSeekMode === 'pnl'}
              onChange={() => setGoalSeekMode('pnl')}
              className="mr-2"
            />
            Target P&L Percentage
          </label>
        </div>

        {goalSeekMode === 'amount' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Total Amount:</label>
            <input
              type="number"
              value={targetValue || ''}
              onChange={(e) => setTargetValue(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target P&L Percentage:</label>
            <input
              type="number"
              value={targetPnL || ''}
              onChange={(e) => setTargetPnL(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        <button
          onClick={runGoalSeek}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Solve
        </button>
      </div>

      {/* Goal Seek Results Table */}
      {goalSeekResult && (
        <div className="section bg-gray-50 p-4 rounded-md mb-8 overflow-x-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Goal Seek Results</h2>
          <table className="min-w-full border-collapse border border-gray-300 divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 border border-gray-300 text-center">Symbol</th>
                <th className="px-2 py-2 border border-gray-300 text-center">Market Price</th>
                <th className="px-2 py-2 border border-gray-300 text-center">Avg Cost</th>
                <th className="px-2 py-2 border border-gray-300 text-center">Cost</th>
                <th className="px-2 py-2 border border-gray-300 text-center">Current Market Value</th>
                <th className="px-2 py-2 border border-gray-300 text-center">Sim Price</th>
                <th className="px-2 py-2 border border-gray-300 text-center">Sim P&L %</th>
                <th className="px-2 py-2 border border-gray-300 text-center">Simulated Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-center">
              <tr>
                <td className="px-2 py-2 border border-gray-300">TSLA</td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(stocks[0].currentPrice)}</td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(goalSeekResult.tsla.avgCost)}</td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(goalSeekResult.tsla.cost)}</td>
                <td className="px-2 py-2 border border-gray-300">
                  {formatCurrency(stocks[0].currentPrice * stocks[0].qty)}
                </td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(goalSeekResult.tsla.simPrice)}</td>
                <td className="px-2 py-2 border border-gray-300">{goalSeekResult.tsla.simPnl}%</td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(goalSeekResult.tsla.amount)}</td>
              </tr>
              <tr>
                <td className="px-2 py-2 border border-gray-300">TSLL</td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(stocks[1].currentPrice)}</td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(goalSeekResult.tsll.avgCost)}</td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(goalSeekResult.tsll.cost)}</td>
                <td className="px-2 py-2 border border-gray-300">
                  {formatCurrency(stocks[1].currentPrice * stocks[1].qty)}
                </td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(goalSeekResult.tsll.simPrice)}</td>
                <td className="px-2 py-2 border border-gray-300">{goalSeekResult.tsll.simPnl}%</td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(goalSeekResult.tsll.amount)}</td>
              </tr>
              <tr className="font-bold">
                <td className="px-2 py-2 border border-gray-300" colSpan={3}>Total:</td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(goalSeekResult.total.cost)}</td>
                <td className="px-2 py-2 border border-gray-300">
                  {formatCurrency(stocks[0].currentPrice * stocks[0].qty + stocks[1].currentPrice * stocks[1].qty)}
                </td>
                <td className="px-2 py-2 border border-gray-300" colSpan={1}></td>
                <td className="px-2 py-2 border border-gray-300" colSpan={1}>
                  {goalSeekResult.total.pnl}%
                </td>
                <td className="px-2 py-2 border border-gray-300">{formatCurrency(goalSeekResult.total.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EnhancedStockCalculatorWithRESTAPI;