const Luxfi = artifacts.require("Luxfi");

module.exports = async function(deployer, network, accounts) {

	//deploy Token
	await deployer.deploy(Luxfi, 'Luxfi', 'LXI', 18, "10000000000000000000000000", "2000000000000000000000000");
	await Luxfi.deployed();
	
};