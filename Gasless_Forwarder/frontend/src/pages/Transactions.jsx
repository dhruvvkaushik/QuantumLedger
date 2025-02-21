import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../context/Web3Context';
import { Search, Filter } from 'lucide-react';

export default function Transactions() {
  const { web3, account, forwarder } = useContext(Web3Context);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const fetchDetailedTransactions = async () => {
      if (forwarder && account) {
        try {
          const events = await forwarder.getPastEvents('TransactionForwarded', {
            fromBlock: 0,
            toBlock: 'latest'
          });

          const detailedTxs = await Promise.all(
            events.map(async (event) => {
              const block = await web3.eth.getBlock(event.blockNumber);
              const receipt = await web3.eth.getTransactionReceipt(event.transactionHash);
              
              return {
                hash: event.transactionHash,
                from: event.returnValues.from,
                to: event.returnValues.to,
                value: web3.utils.fromWei(event.returnValues.value, 'ether'),
                timestamp: new Date(block.timestamp * 1000).toLocaleString(),
                gasUsed: receipt.gasUsed,
                status: receipt.status ? 'Success' : 'Failed',
                blockNumber: event.blockNumber
              };
            })
          );

          setTransactions(detailedTxs);
          setFilteredTransactions(detailedTxs);
        } catch (error) {
          console.error('Error fetching transactions:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDetailedTransactions();
  }, [forwarder, account, web3]);

  useEffect(() => {
    const filtered = transactions.filter(tx => 
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

  const getStatusColor = (status) => {
    return status === 'Success' ? 'success' : 'error';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 rounded-lg p-3 pl-10 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
              <Filter className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hash</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value (ETH)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gas Used</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.hash} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                        <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                          {`${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${tx.from.substring(0, 6)}...${tx.from.substring(tx.from.length - 4)}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${tx.to.substring(0, 6)}...${tx.to.substring(tx.to.length - 4)}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.value}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.gasUsed}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}