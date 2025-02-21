const Forwarder = artifacts.require("Forwarder");
const TestToken = artifacts.require("TestToken");

module.exports = async function(deployer, network, accounts) {
  // Deploy Forwarder first
  await deployer.deploy(Forwarder);
  const forwarder = await Forwarder.deployed();
  console.log("Forwarder deployed at:", forwarder.address);

  // Deploy TestToken
  await deployer.deploy(TestToken);
  const testToken = await TestToken.deployed();
  console.log("TestToken deployed at:", testToken.address);

  // If we're on development network, set up test accounts with tokens
  if (network === 'development') {
    const mintAmount = web3.utils.toWei('10000', 'ether'); // 10000 tokens each
    
    // Mint tokens to test accounts
    for (let i = 1; i < 5; i++) {
      await testToken.mint(accounts[i], mintAmount);
      console.log(`Minted ${web3.utils.fromWei(mintAmount, 'ether')} TEST tokens to ${accounts[i]}`);
    }

    console.log('\nDeployment Summary:');
    console.log('-------------------');
    console.log(`Forwarder: ${forwarder.address}`);
    console.log(`TestToken: ${testToken.address}`);
    console.log(`Network: ${network}`);
    console.log('Test accounts funded with 10,000 TEST tokens each');
  }
};