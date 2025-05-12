import React, { useState, useEffect } from 'react';
import { Card, Title, AreaChart, BarChart, Select, SelectItem } from '@tremor/react';

const ALPHA_VANTAGE_KEY = process.env.REACT_APP_ALPHA_VANTAGE_KEY;

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('1M');

  const calculateMovingAverage = (data, period) => {
    return data.map((item, index) => {
      if (index < period - 1) return null;
      const sum = data.slice(index - period + 1, index + 1).reduce((acc, curr) => acc + curr.price, 0);
      return sum / period;
    });
  };

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Alpha Vantage returns up to 100 days for free tier (compact)
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        const data = await response.json();
        if (!data['Time Series (Daily)']) {
          throw new Error(data['Error Message'] || data['Note'] || 'Invalid data received');
        }
        // Parse and sort by date ascending
        const allDates = Object.keys(data['Time Series (Daily)']).sort();
        // Filter by time range
        const endDate = new Date(allDates[allDates.length - 1]);
        let startDate = new Date(endDate);
        switch (timeRange) {
          case '1W':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '1M':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
          case '3M':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
          case '1Y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
          default:
            startDate.setMonth(endDate.getMonth() - 1);
        }
        const filteredDates = allDates.filter(dateStr => {
          const d = new Date(dateStr);
          return d >= startDate && d <= endDate;
        });
        const formattedData = filteredDates.map(dateStr => {
          const d = data['Time Series (Daily)'][dateStr];
          return {
            date: dateStr,
            price: parseFloat(d['5. adjusted close']),
            volume: parseInt(d['6. volume'], 10),
            high: parseFloat(d['2. high']),
            low: parseFloat(d['3. low'])
          };
        });
        // Calculate moving averages
        const ma20 = calculateMovingAverage(formattedData, 20);
        const ma50 = calculateMovingAverage(formattedData, 50);
        const dataWithMA = formattedData.map((item, index) => ({
          ...item,
          ma20: ma20[index],
          ma50: ma50[index],
        }));
        setChartData(dataWithMA);
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistoricalData();
  }, [symbol, timeRange]);

  if (isLoading) {
    return (
      <Card className="mt-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading chart data...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <Title>{symbol} Price History</Title>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
          className="w-32"
        >
          <SelectItem value="1W">1 Week</SelectItem>
          <SelectItem value="1M">1 Month</SelectItem>
          <SelectItem value="3M">3 Months</SelectItem>
          <SelectItem value="1Y">1 Year</SelectItem>
        </Select>
      </div>
      
      <AreaChart
        className="h-72 mt-4"
        data={chartData}
        index="date"
        categories={["price", "ma20", "ma50"]}
        colors={["blue", "green", "red"]}
        valueFormatter={(number) => `$${number ? number.toFixed(2) : ''}`}
        yAxisWidth={60}
        showLegend={true}
        showGridLines={true}
        showAnimation={true}
      />

      <div className="mt-4">
        <Title className="text-sm mb-2">Volume</Title>
        <BarChart
          className="h-32"
          data={chartData}
          index="date"
          categories={["volume"]}
          colors={["gray"]}
          valueFormatter={(number) => number ? number.toLocaleString() : ''}
          showLegend={false}
          showGridLines={false}
          showAnimation={true}
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Price</span>
          <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
          <span>20-day MA</span>
          <div className="w-3 h-3 bg-red-500 rounded-full ml-4"></div>
          <span>50-day MA</span>
        </div>
      </div>
    </Card>
  );
};

export default StockChart; 