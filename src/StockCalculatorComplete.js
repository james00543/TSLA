import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

const EnhancedStockCalculator = () => {
  const [stocks, setStocks] = useState([
    { symbol: 'TSLA', currentPrice: 229.81, avgCost: 210.19, qty: 181 },
    { symbol: 'TSLL', currentPrice: 10.89, avgCost: 13.70, qty: 2500 },
  ]);

  const [indices, setIndices] = useState([
    { symbol: 'Nasdaq', currentPrice: 17683.98, change: 0.65 },
    { symbol: 'S&P', currentPrice: 5626.02, change: 0.54 },
    { symbol: 'Dow', currentPrice: 41393.78, change: 0.72 },
    { symbol: '10-Year Treasury', currentPrice: 3.65, change: -3.0, unit: 'bps' },
  ]);

  const [tslaSim, setTslaSim] = useState(2393); // Example simulated price for TSLA
  const [targetValue, setTargetValue] = useState(1000000);
  const [goalSeekResult, setGoalSeekResult] = useState(null);

  const calculateValues = (tslaPrice) => {
    const tsla = {
      ...stocks[0],
      simPrice: tslaPrice,
      simPnl: (tslaPrice - stocks[0].avgCost) / stocks[0].avgCost,
      cost: stocks[0].avgCost * stocks[0].qty,
      amount: tslaPrice * stocks[0].qty,
    };

    const tsllPrice = stocks[1].currentPrice * 2 * (1 + (tslaPrice - stocks[0].currentPrice) / stocks[0].currentPrice);
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
    let high = 10000;
    let mid;
    let result;

    while (high - low > 0.01) {
      mid = (low + high) / 2;
      result = calculateValues(mid);

      if (result.total.amount > targetValue) {
        high = mid;
      } else {
        low = mid;
      }
    }

    setGoalSeekResult({
      tslaPrice: mid.toFixed(2),
      tsllPrice: result.tsll.simPrice.toFixed(2),
      totalAmount: result.total.amount.toFixed(2),
    });
  };

  const handleStockChange = (index, field, value) => {
    const newStocks = [...stocks];
    newStocks[index][field] = parseFloat(value);
    setStocks(newStocks);
  };

  const { tsla, tsll, total } = calculateValues(tslaSim);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Ticker Section */}
      <div className="bg-gray-900 text-white py-4 mb-4">
        <div className="grid grid-cols-2 gap-4 px-4">
          {indices.map((index) => (
            <div key={index.symbol} className="flex justify-between items-center">
              <div className="flex items-center">
                <ArrowUpDown className={`mr-2 ${index.change > 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className="font-bold">{index.symbol}</span>
              </div>
              <div className="text-right">
                <div>{index.currentPrice.toFixed(2)}{index.unit ? '%' : ''}</div>
                <div className={`text-sm ${index.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {index.change > 0 ? `+${index.change.toFixed(2)}%` : `${index.change.toFixed(2)}%`}
                </div>
              </div>
            </div>
          ))}
          {stocks.map((stock) => (
            <div key={stock.symbol} className="flex justify-between items-center">
              <div className="flex items-center">
                <ArrowUpDown className={`mr-2 ${stock.currentPrice > stock.avgCost ? 'text-green-500' : 'text-red-500'}`} />
                <span className="font-bold">{stock.symbol}</span>
              </div>
              <div className="text-right">
                <div>${stock.currentPrice.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Stock Portfolio Simulator</h1>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">TSLA Simulated Price:</label>
        <input
          type="number"
          value={tslaSim}
          onChange={(e) => setTslaSim(Number(e.target.value))}
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Total Amount:</label>
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(Number(e.target.value))}
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
          <div className="mt-4 bg-white p-4 rounded-md">
            <h3 className="font-bold text-lg mb-2">Result:</h3>
            <p>
              <strong>TSLA Price:</strong> ${goalSeekResult.tslaPrice}
            </p>
            <p>
              <strong>TSLL Price:</strong> ${goalSeekResult.tsllPrice}
            </p>
            <p>
              <strong>Total Amount:</strong> ${goalSeekResult.totalAmount}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedStockCalculator;