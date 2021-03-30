import React from 'react';
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3';
import LuxfiContract from './build/contracts/Luxfi.json';
import { Layout, Menu, Typography, InputNumber } from 'antd';
import 'antd/dist/antd.css';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const App = props => {

  const [web3, setWeb3] = React.useState(null);
  
  const [accounts, setAccounts] = React.useState(null);
  const [contractStats, setContractStats] = React.useState(null); // totalRewards, totalStakes, totalSupply, cap

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
      const balanceOf = await Promise.all(accounts.map(addr => luxfi.methods.balanceOf(addr).call()));
      const stakeOf = await Promise.all(accounts.map(addr => luxfi.methods.stakeOf(addr).call()));
      const rewardOf = await Promise.all(accounts.map(addr => luxfi.methods.rewardOf(addr).call()));

      setAccounts(accounts.map((address, i) => ({
        address,
        eth: balances[i],
        stake: stakeOf[i],
        reward: rewardOf[i],
        lxi: balanceOf[i],
      })));

    })();

    (async () => {

      const totalRewards = await luxfi.methods.totalRewards().call();
      const totalSupply = await luxfi.methods.totalSupply().call();
      const totalStakes = await luxfi.methods.totalStakes().call();
      const burned = await luxfi.methods.balanceOf(ZERO_ADDRESS).call();

      setContractStats({
        totalRewards,
        totalSupply,
        totalStakes,
        burned,
      })

    })();

  }, [web3, luxfi]);

  const onStake = async (from) => {
    await luxfi.methods.createStake(web3.utils.toWei('100', 'ether')).send({ from });
  }

  const onWithdraw = async (from) => {
    await luxfi.methods.removeStake(web3.utils.toWei('100', 'ether')).send({ from });
  }

  const onClaimReward = async (from ) => {
    await luxfi.methods.withdrawReward().send({ from });
  }

  const onIssueReward = async () => {
    const [{ address: from }] = accounts;
    const result = await luxfi.methods.distributeRewards().send({ from });
  }

  if (!web3) return null;

  return (
    <Web3ReactProvider getLibrary={web3}>
      <Layout style={{ height: '100vh' }}>
        <Layout.Sider>
        <Typography.Title level={4} style={{ padding: '16px 0', margin: 0, textAlign: 'center', color: '#fff' }}>Luxfi</Typography.Title>
        <Menu theme="dark" mode='inline'>
          <Menu.Item> Option 1 </Menu.Item>
          <Menu.Item> Option 2 </Menu.Item>
        </Menu>
        </Layout.Sider>
        <Layout style={{ overflow: 'auto' }}>
          <Layout.Content style={{ minHeight: '100vh' }}>
          <InputNumber
            style={{
              width: 200,
            }}
            defaultValue="1"
            min="0"
            max="10"
            step="0.00000000000001"
            // onChange={onChange}
            stringMode
          />

          </Layout.Content>
          <Layout.Footer>
            Luxfi © {new Date().getFullYear()} Created by The Luxed Foundation
          </Layout.Footer>
        </Layout>
      </Layout>
      {/* <h3>Luxfi <small>{LuxfiContract.networks['5777'].address}</small></h3>
      {contractStats &&
        <div>
          <p>totalRewards: {web3.utils.fromWei(contractStats.totalRewards, 'ether')} LXI</p>
          <p>totalSupply: {web3.utils.fromWei(contractStats.totalSupply, 'ether')} LXI</p>
          <p>totalStakes: {web3.utils.fromWei(contractStats.totalStakes, 'ether')} LXI</p>
          <p>burned: {web3.utils.fromWei(contractStats.burned, 'ether')} LXI</p>
        </div>
      }

      <div>
        <button onClick={onIssueReward}>Issue Rewards!</button>
      </div>
      {(accounts || []).map(({ address, eth, lxi, stake, reward }) => (
        <div key={address} style={{ display: 'flex', gap: 12}}>
          <h3>{address.slice(0, 8)}</h3>
          <h4>{web3.utils.fromWei(eth, 'ether')} ETH</h4>
          <h4>{web3.utils.fromWei(lxi, 'ether')} LXI</h4>
          <h4>({web3.utils.fromWei(stake, 'ether')} LXI, {web3.utils.fromWei(reward, 'ether')} LXI)</h4>
          <button onClick={() => onStake(address)}>Stake</button>
          <button onClick={() => onWithdraw(address)}>Withdraw</button>
          <button onClick={() => onClaimReward(address)}>Claim Reward</button>
        </div>
      ))
      } */}

    </Web3ReactProvider>
  )
}

export default App;
