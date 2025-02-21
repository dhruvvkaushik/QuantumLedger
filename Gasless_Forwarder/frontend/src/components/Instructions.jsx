/* eslint-disable react/prop-types */
import {  Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

export default function Instructions() {
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h2 className="text-2xl font-bold text-gray-900">Project Setup Guide</h2>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
          <Section 
            title="1. Setup Local Blockchain"
            items={[
              { title: "Install Ganache globally", content: "npm install -g ganache" },
              { title: "Run Ganache", content: "ganache" },
              { title: "Copy the first two private keys from Ganache", content: "These will be used to import accounts into MetaMask" }
            ]}
          />

          <Section 
            title="2. MetaMask Setup"
            items={[
              { title: "Add Network to MetaMask", content: `Network Name: Localhost 8545\nRPC URL: http://127.0.0.1:8545\nChain ID: 1337\nCurrency Symbol: ETH` },
              { title: "Import the first account", content: "Click 'Import Account' in MetaMask and paste the first private key" },
              { title: "Import the second account", content: "Repeat the process with the second private key" }
            ]}
          />

          <Section 
            title="3. Project Setup"
            items={[
              { title: "Install dependencies in root directory", content: "npm install" },
              { title: "Deploy contracts", content: "truffle migrate --reset --network development" },
              { title: "Copy contract artifacts", content: "Copy Forwarder.json and TestToken.json from build/contracts to frontend/src/contracts/" }
            ]}
          />

          <Section 
            title="4. Frontend Setup"
            items={[
              { title: "Navigate to frontend directory", content: "cd frontend" },
              { title: "Install frontend dependencies", content: "npm install" },
              { title: "Start development server", content: "npm run dev" }
            ]}
          />

          <Section 
            title="5. Using the Application"
            items={[
              { title: "Connect both MetaMask accounts", content: "Switch between accounts in MetaMask to connect both" },
              { title: "Initiate transfer", content: "From the sender account, enter recipient address and amount, then sign the permit" },
              { title: "Complete transfer", content: "Switch to recipient account and execute the transfer" }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
            <pre className="bg-gray-100 p-3 rounded-md text-sm text-gray-600 font-mono whitespace-pre-wrap">
              {item.content}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}