import React from 'react';
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3';
import LuxfiContract from './build/contracts/Luxfi.json';

const ZERO_ADDRESS = '0x0';

const App = props => {

  const [web3, setWeb3] = React.useState(null);
  const [accounts, setAccounts] = React.useState(null);
  const [totalSupply, setTotalSupply] = React.useState(null);
  const [gasPrice, setGasPrice] = React.useState(null);

  const [targetAddress, setTargetAddress] = React.useState('');
  const [targetInfo, setTargetInfo] = React.useState(null);

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

  console.log(luxfi?.methods);

  React.useEffect(() => {
    if (!web3 || !luxfi) return;
    (async () => {
      const accounts = [...(await web3.eth.getAccounts()), '0x6256b0B2a64b7DFedc3e5950a59274c87C92F537'];
      
      const balances = await Promise.all(accounts.map(web3.eth.getBalance));
      const staking = await Promise.all(accounts.map(addr => luxfi.methods.staking(addr).call()));
      const balanceOf = await Promise.all(accounts.map(addr => luxfi.methods.balanceOf(addr).call()));

      console.log(balances);

      setAccounts(accounts.map((address, i) => ({ address, eth: balances[i], staking: staking[i], lxi: balanceOf[i] })));
    })();

    (async () => {
      const gasPrice = await web3.eth.getGasPrice();
      setGasPrice(gasPrice);
    })()

  }, [web3, luxfi]);

  const onStake = async () => {
    const [{ address: from }] = accounts;
    await luxfi.methods.stake(web3.utils.toWei('100', 'ether')).send({ from });
  }

  const onIssue = async () => {
    const [{ address: from }] = accounts;
    const result = await luxfi.methods.issue().send({ from });
    console.log(result);
  }

  const onSeed = async () => {
    const [{ address: from }] = accounts;
    const result = await luxfi.methods.seed(from, web3.utils.toWei('1000', 'ether')).send({ from });
    console.log(result);
  }

  const onTargetGet = async () => {
    const addr = targetAddress;
    const staking = await luxfi.methods.staking(addr).call();
    const balance = await luxfi.methods.balanceOf(addr).call();
    setTargetInfo(`Balance: ${web3.utils.fromWei(balance, 'ether')}, Staking: ${staking}`);
  }

  if (!web3) return null;

  return (
    <Web3ReactProvider getLibrary={web3}>
      <h3>Luxfi <small>#{LuxfiContract.networks['5777'].address}</small></h3>
      <h3>Gas: {gasPrice && web3.utils.fromWei(gasPrice, 'gwei')} Gwei</h3>
      <div>
        <input value={targetAddress} onChange={e => setTargetAddress(e.target.value)} />
        <button onClick={onTargetGet}>Get</button>
        <p>{targetInfo}</p>
      </div>

      <div>
        <button onClick={onStake}>Stake!</button>
        <button onClick={onIssue}>Issue!</button>
        <button onClick={onSeed}>Seed!</button>
      </div>
      {(accounts || []).map(({ address, eth, lxi, staking }) => (
        <div key={address} style={{ display: 'flex', gap: 12}}>
          <h3>{address}</h3>
          <h4>{web3.utils.fromWei(eth, 'ether')} ETH</h4>
          <h4>{web3.utils.fromWei(lxi, 'ether')} LXI</h4>
          <h4>({web3.utils.fromWei(staking, 'ether')} LXI)</h4>
        </div>
      ))
      }

    </Web3ReactProvider>
  )
}

export default App;
