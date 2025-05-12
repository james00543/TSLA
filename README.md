# Tesla Stock Portfolio Calculator

A React application that helps users calculate and simulate their Tesla ($TSLA) and TSLL (2x leveraged ETF) portfolio performance.

## Features

- Real-time stock price updates using Finnhub API
- Portfolio value calculation
- Price simulation for TSLA
- Automatic TSLL price calculation based on TSLA's performance (2x leverage)
- Goal seek functionality for target portfolio value or P&L percentage
- Input validation and error handling
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Finnhub API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd stock-calculator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Finnhub API key:
```
REACT_APP_FINNHUB_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Usage

1. **Portfolio Overview**
   - View current stock prices and portfolio value
   - Edit average cost and quantity for each position

2. **Price Simulation**
   - Enter a simulated TSLA price
   - View the corresponding TSLL price (2x leveraged)
   - See the impact on your portfolio value and P&L

3. **Goal Seek**
   - Choose between target portfolio value or P&L percentage
   - Enter your target value
   - Click "Run Goal Seek" to find the required TSLA price

## Technical Details

- Built with React and modern JavaScript (ES6+)
- Uses Tailwind CSS for styling
- Implements responsive design principles
- Includes error handling and loading states
- Optimized performance with memoization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Finnhub for providing the stock data API
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
