import React from 'react';
import { Card, Title, Metric, Text, Grid } from '@tremor/react';

const PortfolioAnalytics = ({ stocks, total }) => {
  // Calculate portfolio metrics
  const calculateMetrics = () => {
    const totalCost = stocks.reduce((acc, stock) => acc + (stock.avgCost * stock.qty), 0);
    const totalValue = stocks.reduce((acc, stock) => acc + (stock.currentPrice * stock.qty), 0);
    const totalPnL = ((totalValue - totalCost) / totalCost) * 100;
    
    // Calculate weighted average cost
    const weightedAvgCost = stocks.reduce((acc, stock) => {
      const positionValue = stock.avgCost * stock.qty;
      return acc + (positionValue / totalCost) * stock.avgCost;
    }, 0);

    // Calculate position weights
    const positionWeights = stocks.map(stock => ({
      symbol: stock.symbol,
      weight: ((stock.currentPrice * stock.qty) / totalValue) * 100
    }));

    return {
      totalCost,
      totalValue,
      totalPnL,
      weightedAvgCost,
      positionWeights
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="mt-8">
      <Title className="mb-4">Portfolio Analytics</Title>
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
        <Card>
          <Text>Total Cost Basis</Text>
          <Metric>${metrics.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Metric>
        </Card>
        <Card>
          <Text>Current Value</Text>
          <Metric>${metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Metric>
        </Card>
        <Card>
          <Text>Total P&L</Text>
          <Metric className={metrics.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}>
            {metrics.totalPnL.toFixed(2)}%
          </Metric>
        </Card>
        <Card>
          <Text>Weighted Avg Cost</Text>
          <Metric>${metrics.weightedAvgCost.toFixed(2)}</Metric>
        </Card>
      </Grid>

      <div className="mt-4">
        <Card>
          <Title className="mb-4">Position Allocation</Title>
          <div className="space-y-4">
            {metrics.positionWeights.map((position) => (
              <div key={position.symbol} className="flex items-center">
                <div className="w-24">{position.symbol}</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded-full">
                    <div
                      className="h-4 bg-blue-500 rounded-full"
                      style={{ width: `${position.weight}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-right">{position.weight.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <Title className="mb-4">Portfolio Insights</Title>
          <div className="space-y-2">
            <Text>
              • Your portfolio is {metrics.totalPnL >= 0 ? 'up' : 'down'} {Math.abs(metrics.totalPnL).toFixed(2)}% from cost basis
            </Text>
            <Text>
              • {metrics.positionWeights[0].symbol} represents {metrics.positionWeights[0].weight.toFixed(1)}% of your portfolio
            </Text>
            <Text>
              • {metrics.positionWeights[1].symbol} represents {metrics.positionWeights[1].weight.toFixed(1)}% of your portfolio
            </Text>
            {metrics.totalPnL < 0 && (
              <Text className="text-red-500">
                • Your portfolio is currently below cost basis. Consider reviewing your position sizes.
              </Text>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioAnalytics; 