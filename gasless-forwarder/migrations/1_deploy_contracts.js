module.exports = function (deployer) {
  deployer.deploy(TestToken, 1000000); // Deploy TestToken with an initial supply of 1,000,000 tokens
  deployer.deploy(Forwarder); // Deploy the Forwarder contract
};