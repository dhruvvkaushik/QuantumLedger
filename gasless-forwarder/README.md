# README.md

# Gasless Forwarder

This project implements a gasless transaction forwarder that allows the transfer of ERC20 tokens from a sender to a receiver using a signed permit. The forwarder contract handles the token transfer while allowing the receiver to pay for the gas fees.

## Project Structure

```
gasless-forwarder
├── contracts
│   ├── TestToken.sol       # ERC20 token contract with permit functionality
│   └── Forwarder.sol       # Forwarder contract for gasless transactions
├── frontend
│   ├── src
│   │   ├── components
│   │   │   └── Loader.jsx  # Loader component for displaying loading state
│   │   ├── context
│   │   │   └── Web3Context.jsx # Context for managing web3 state
│   │   ├── pages
│   │   │   └── Dashboard.jsx # Dashboard for interacting with the forwarder
│   │   ├── contracts
│   │   │   ├── Forwarder.json # ABI and address for the Forwarder contract
│   │   │   └── TestToken.json # ABI and address for the TestToken contract
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # Entry point of the frontend application
│   ├── package.json         # Frontend npm configuration
│   └── vite.config.js       # Vite configuration for the frontend
├── test
│   ├── Forwarder.test.js    # Unit tests for the Forwarder contract
│   └── TestToken.test.js     # Unit tests for the TestToken contract
├── migrations
│   └── 1_deploy_contracts.js # Migration script for deploying contracts
├── truffle-config.js        # Truffle configuration for deploying contracts
├── package.json              # Root level npm configuration
└── README.md                 # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd gasless-forwarder
   ```

2. **Install dependencies:**
   - For the frontend:
     ```bash
     cd frontend
     npm install
     ```

   - For the smart contracts:
     ```bash
     npm install
     ```

3. **Deploy the contracts:**
   ```bash
   truffle migrate --network <network-name>
   ```

4. **Run the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## Usage

- Navigate to the dashboard to interact with the gasless token transfer functionality.
- Enter the token address, recipient address, and amount to initiate a transfer.
- The application will handle the signing of permits and execution of transfers.

## License

This project is licensed under the MIT License.