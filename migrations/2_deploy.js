const Luxfi = artifacts.require("Luxfi");
const Dai = artifacts.require("Dai");

module.exports = async function(deployer, network, accounts) {
	//deploy Token
	await deployer.deploy(Luxfi);
	const luxfi = await Luxfi.deployed();
	await luxfi.transfer(accounts[1], '1000000000000000000000000');
		
	await deployer.deploy(Dai);
	const dai = await Dai.deployed();
	await dai.transfer(accounts[1], '100000000000000000000')
	
};