import React, { useState, useEffect } from 'react';
import { Card, Title, AreaChart } from '@tremor/react';

const StockChart = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchYahooIntraday = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = 'https://query1.finance.yahoo.com/v8/finance/chart/TSLA?interval=5m&range=1d';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch intraday data');
        }
        const data = await response.json();
        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const prices = result.indicators.quote[0].close;
        // Format data for chart
        const formattedData = timestamps.map((ts, idx) => {
          const date = new Date(ts * 1000);
          const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            time: timeLabel,
            price: prices[idx],
          };
        }).filter(point => point.price !== null);
        setChartData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchYahooIntraday();
  }, []);

  if (isLoading) {
    return (
      <Card className="mt-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading TSLA intraday chart...</span>
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
      <Title>TSLA Intraday Price (5m intervals, Today)</Title>
      <AreaChart
        className="h-72 mt-4"
        data={chartData}
        index="time"
        categories={["price"]}
        colors={["blue"]}
        valueFormatter={number => number ? `$${number.toFixed(2)}` : ''}
        yAxisWidth={60}
        showLegend={false}
        showGridLines={true}
        showAnimation={true}
      />
    </Card>
  );
};

export default StockChart; 