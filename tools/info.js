const Luxfi = artifacts.require('Luxfi');

module.exports = async function(callback) {
  
  const { address } = (await Luxfi.new());
  console.log({
    address
  })

  callback();
}