const Luxfi = artifacts.require('Luxfi');

module.exports = async function(callback) {
  
  console.log('Issuing...');
  await Luxfi.issue();
  console.log('Issued!');

  callback();
}