const Luxfi = artifacts.require("Luxfi");
const LuxTrophy = artifacts.require("LuxTrophy");

module.exports = async function(deployer, network, accounts) {

	//deploy Token
	await deployer.deploy(Luxfi, 'Luxfi', 'LXI', 18, "10000000000000000000000000", "2000000000000000000000000");
	await Luxfi.deployed();

	await deployer.deploy(LuxTrophy, 'LuxTrophy', 'LXY', 'http://127.0.0.1:3001/trophies/');

	
};