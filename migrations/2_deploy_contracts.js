var EtherBidCore = artifacts.require("./EtherBidCore.sol");

module.exports = function(deployer) {
  deployer.deploy(EtherBidCore);
};