import React from 'react';
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3';
import LuxfiContract from './build/contracts/Luxfi.json';

const App = props => {

  const [web3, setWeb3] = React.useState(null);
  const [accounts, setAccounts] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      
      if (window.ethereum) {
        window.ethereum.enable();
        return setWeb3(new Web3(window.ethereum));
      }

      if (window.web3) {
        return setWeb3(new Web3(window.web3.currentProvider));
      }

      return setWeb3(new Web3('http://127.0.0.1:7545'));
    })();

  }, []);

  const luxfi = React.useMemo(() => {
    if (!web3) return null;
    return new web3.eth.Contract(LuxfiContract.abi, LuxfiContract.networks['5777'].address);
  }, [web3]);

  React.useEffect(() => {
    if (!web3) return;
    (async () => {
      const accounts = await web3.eth.getAccounts();
      
      const balances = await Promise.all(accounts.map(web3.eth.getBalance));

      setAccounts(accounts.map((address, i) => ({ address, balance: balances[i] })));
    })();

  }, [web3, luxfi]);

  const onStake = async () => {
    const [{ address: from }] = accounts;
    const result = await luxfi.methods.stake('100').send({ from })
      .on('transactionHash', function (hash) {
        console.log(hash);
      })
      .on('receipt', function (receipt) {
        console.log(receipt);
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        console.log(confirmationNumber, receipt);
      })
      .on('error', console.error);
  }

  if (!web3) return null;

  return (
    <Web3ReactProvider getLibrary={web3}>
      <h3>Luxfi <small>#{LuxfiContract.networks['5777'].address}</small></h3>
      <button onClick={onStake}>Stake!</button>
      {(accounts || []).map(({ address, balance }) => (
        <div key={address}>
          <h3>{address}</h3>
          <h4>{balance}</h4>
        </div>
      ))
      }

    </Web3ReactProvider>
  )
}

export default App;
