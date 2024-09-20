import React, { useState, useEffect } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/react"

const FINNHUB_TOKEN = 'crir1c9r01qo3ctbp2agcrir1c9r01qo3ctbp2b0';  // Replace with your Finnhub API token

const EnhancedStockCalculatorWithRESTAPI = () => {
  const [stocks, setStocks] = useState([
    { symbol: 'TSLA', currentPrice: 0, avgCost: 210.19, qty: 181 },
    { symbol: 'TSLL', currentPrice: 0, avgCost: 13.70, qty: 2500 },
  ]);
  const [tslaSim, setTslaSim] = useState(2393); // Simulated price for TSLA
  const [targetValue, setTargetValue] = useState(1000000);
  const [goalSeekResult, setGoalSeekResult] = useState(null);
  const [error, setError] = useState(null);

  // Fetch stock prices using REST API
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const stockSymbols = ['TSLA', 'TSLL'];

        // Fetch prices for stocks
        const stockPromises = stockSymbols.map(symbol =>
          fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_TOKEN}`)
            .then(res => res.json())
            .then(data => ({ symbol, currentPrice: data.c }))
        );

        const stockData = await Promise.all(stockPromises);

        // Update state
        setStocks(stocks.map(stock => {
          const updatedStock = stockData.find(s => s.symbol === stock.symbol);
          return updatedStock ? { ...stock, currentPrice: updatedStock.currentPrice } : stock;
        }));

      } catch (err) {
        setError('Failed to fetch stock data.');
      }
    };

    fetchStockData();
  }, []);

  const calculateValues = (tslaPrice) => {
    const tsla = {
      ...stocks[0],
      simPrice: tslaPrice,
      simPnl: (tslaPrice - stocks[0].avgCost) / stocks[0].avgCost,
      cost: stocks[0].avgCost * stocks[0].qty,
      amount: tslaPrice * stocks[0].qty,
    };
  
    // Calculate the percentage change in TSLA price
    const tslaPercentChange = (tslaPrice - stocks[0].currentPrice) / stocks[0].currentPrice;
    
    // Apply 2x leverage for TSLL
    const tsllPrice = stocks[1].currentPrice * (1 + 2 * tslaPercentChange);
    
    const tsll = {
      ...stocks[1],
      simPrice: tsllPrice,
      simPnl: (tsllPrice - stocks[1].avgCost) / stocks[1].avgCost,
      cost: stocks[1].avgCost * stocks[1].qty,
      amount: tsllPrice * stocks[1].qty,
    };
  
    const total = {
      amount: tsla.amount + tsll.amount,
      cost: tsla.cost + tsll.cost,
      pnl: (tsla.amount + tsll.amount - (tsla.cost + tsll.cost)) / (tsla.cost + tsll.cost),
    };
  
    return { tsla, tsll, total };
  };

  const runGoalSeek = () => {
    let low = 0;
    let high = 10000; // Assuming TSLA won't go above $10,000
    let mid;
    let result;
  
    while (high - low > 0.00001) {
      mid = (low + high) / 2;
      result = calculateValues(mid);
  
      if (result.total.amount > targetValue) {
        high = mid;
      } else {
        low = mid;
      }
    }
  
    // Set the result with all calculated values for the Goal Seek
    setGoalSeekResult({
      tsla: {
        simPrice: mid.toFixed(2),
        avgCost: result.tsla.avgCost.toFixed(2),
        simPnl: (result.tsla.simPnl * 100).toFixed(2),
        cost: result.tsla.cost.toFixed(2),
        amount: result.tsla.amount.toFixed(2),
      },
      tsll: {
        simPrice: result.tsll.simPrice.toFixed(2),
        avgCost: result.tsll.avgCost.toFixed(2),
        simPnl: (result.tsll.simPnl * 100).toFixed(2),
        cost: result.tsll.cost.toFixed(2),
        amount: result.tsll.amount.toFixed(2),
      },
      total: {
        cost: result.total.cost.toFixed(2),
        amount: result.total.amount.toFixed(2),
      }
    });
  };

  const handleStockChange = (index, field, value) => {
    const newStocks = [...stocks];
    newStocks[index][field] = parseFloat(value);
    setStocks(newStocks);
  };

  const { tsla, tsll, total } = calculateValues(tslaSim);

// Handle number input for TSLA Simulated Price
const handleTslaSimChange = (e) => {
  const value = e.target.value;
  setTslaSim(value === "" ? "" : Number(value));  // If input is empty, set an empty string, else convert to a number
};

// Handle number input for Target Total Amount
const handleTargetValueChange = (e) => {
  const value = e.target.value;
  setTargetValue(value === "" ? "" : Number(value));  // If input is empty, set an empty string, else convert to a number
};
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Ticker Section */}
      <div className="bg-gray-900 text-white py-4 mb-4">
        <div className="grid grid-cols-2 gap-4 px-4">
          {stocks.map((stock) => (
            <div key={stock.symbol} className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-bold">{stock.symbol}</span>
              </div>
              <div className="text-right">
                <div>${stock.currentPrice.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Portfolio Simulator */}
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Stock Portfolio Simulator</h1>

    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        TSLA Simulated Price:
      </label>
      <input
      type="number"
      value={tslaSim === 0 ? "" : tslaSim}  // Display empty string when no value is entered
      onChange={handleTslaSimChange}  // Use the updated handler
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
    />
    </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Stock Details</h2>
        {stocks.map((stock, index) => (
          <div key={stock.symbol} className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-xl font-medium mb-3">{stock.symbol}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Cost:</label>
                <input
                  type="number"
                  value={stock.avgCost}
                  onChange={(e) => handleStockChange(index, 'avgCost', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity:</label>
                <input
                  type="number"
                  value={stock.qty}
                  onChange={(e) => handleStockChange(index, 'qty', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Results</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sim Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sim P&L %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[tsla, tsll].map((stock) => (
                <tr key={stock.symbol}>
                  <td className="px-6 py-4 whitespace-nowrap">{stock.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${stock.avgCost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${stock.simPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{(stock.simPnl * 100).toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">${stock.cost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${stock.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="px-6 py-4 whitespace-nowrap" colSpan={4}>
                  Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap">${total.cost.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">${total.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-xl font-semibold">Total P&L: {(total.pnl * 100).toFixed(2)}%</div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Goal Seek</h2>
        <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Target Total Amount:</label>
        <input
          type="number"
          value={targetValue === 0 ? "" : targetValue}  // If 0, show an empty string
          onChange={handleTargetValueChange}  // Attach the handler
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
        <button
          onClick={runGoalSeek}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Solve
        </button>
        {goalSeekResult && (
  <div className="mt-8">
    <h2 className="text-2xl font-bold mb-6 text-center">Goal Seek Results</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg Cost
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sim Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sim P&L %
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cost
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">TSLA</td>
            <td className="px-6 py-4 whitespace-nowrap">${goalSeekResult.tsla.avgCost}</td>
            <td className="px-6 py-4 whitespace-nowrap">${goalSeekResult.tsla.simPrice}</td>
            <td className="px-6 py-4 whitespace-nowrap">{goalSeekResult.tsla.simPnl}%</td>
            <td className="px-6 py-4 whitespace-nowrap">${goalSeekResult.tsla.cost}</td>
            <td className="px-6 py-4 whitespace-nowrap">${goalSeekResult.tsla.amount}</td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">TSLL</td>
            <td className="px-6 py-4 whitespace-nowrap">${goalSeekResult.tsll.avgCost}</td>
            <td className="px-6 py-4 whitespace-nowrap">${goalSeekResult.tsll.simPrice}</td>
            <td className="px-6 py-4 whitespace-nowrap">{goalSeekResult.tsll.simPnl}%</td>
            <td className="px-6 py-4 whitespace-nowrap">${goalSeekResult.tsll.cost}</td>
            <td className="px-6 py-4 whitespace-nowrap">${goalSeekResult.tsll.amount}</td>
          </tr>
          <tr className="font-bold">
            <td className="px-6 py-4 whitespace-nowrap" colSpan={4}>
              Total:
            </td>
            <td className="px-6 py-4 whitespace-nowrap">${goalSeekResult.total.cost}</td>
            <td className="px-6 py-4 whitespace-nowrap">${goalSeekResult.total.amount}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default EnhancedStockCalculatorWithRESTAPI;