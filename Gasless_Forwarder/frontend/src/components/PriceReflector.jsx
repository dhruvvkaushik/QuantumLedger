import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';


const PriceReflector = () => {
  const [isEth, setIsEth] = useState(true);
  const [priceData, setPriceData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gasPrice, setGasPrice] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [estimatedGasFee, setEstimatedGasFee] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coinId = isEth ? 'ethereum' : 'matic-network';
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`
        );
        const data = await response.json();
        
        const formattedData = data.prices.map(([timestamp, price]) => ({
          date: format(new Date(timestamp), 'MM/dd'),
          price: price.toFixed(2),
        }));
        
        setPriceData(formattedData);
        setCurrentPrice(data.prices[data.prices.length - 1][1].toFixed(2));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [isEth]);

  // Add new useEffect for gas price fetching
  useEffect(() => {
    const fetchGasPrice = async () => {
      try {
        // For ETH gas price
        const ethResponse = await fetch(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${import.meta.env.VITE_REACT_APP_ETHERSCAN_API_KEY}`);
        // 
        const ethData = await ethResponse.json();
        
        // For MATIC gas price
        const maticResponse = await fetch(`https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=${import.meta.env.VITE_REACT_APP_POLYGONSCAN_API_KEY}`);
        const maticData = await maticResponse.json();

        setGasPrice({
          eth: ethData.result.SafeGasPrice,
          matic: maticData.result.SafeGasPrice
        });
      } catch (error) {
        console.error('Error fetching gas prices:', error);
      }
    };

    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Add gas fee calculation function
  const calculateGasFee = (amount) => {
    if (!gasPrice || !amount) return;

    // Standard ERC20 transfer uses approximately 65,000 gas
    const standardGas = 65000;
    
    const ethGasFeeUSD = (standardGas * gasPrice.eth * 10 ** -9) * currentPrice;
    const maticGasFeeUSD = (standardGas * gasPrice.matic * 10 ** -9) * currentPrice;

    setEstimatedGasFee({
      eth: ethGasFeeUSD.toFixed(2),
      matic: maticGasFeeUSD.toFixed(2)
    });
  };

  // Add this after your existing JSX, before the closing div
  const renderGasCalculator = () => (
    <div className="mt-8 p-6 bg-gray-700 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Gas Fee Calculator</h2>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={transferAmount}
            onChange={(e) => {
              setTransferAmount(e.target.value);
              calculateGasFee(e.target.value);
            }}
            placeholder="Enter amount to transfer"
            className="px-4 py-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        
        {estimatedGasFee && (
          <div className="space-y-2">
            <div className="flex justify-between text-gray-300">
              <span>Estimated ETH Gas Fee:</span>
              <span>${estimatedGasFee.eth}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Estimated MATIC Gas Fee:</span>
              <span>${estimatedGasFee.matic}</span>
            </div>
            <div className="flex justify-between text-green-400 font-bold">
              <span>Potential Savings:</span>
              <span>${(estimatedGasFee.eth - estimatedGasFee.matic).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          {isEth ? 'Ethereum (ETH)' : 'Polygon (MATIC)'} Price
        </h1>
        <button
          onClick={() => setIsEth(!isEth)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
        >
          Switch to {isEth ? 'MATIC' : 'ETH'}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-300">Loading chart...</div>
      ) : (
        <>
          <div className="mb-4">
            <span className="text-3xl font-bold text-white">
              ${currentPrice}
            </span>
            <span className="ml-2 text-gray-400">USD</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#E5E7EB' }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {!loading && renderGasCalculator()}
    </div>
  );
};

export default PriceReflector;