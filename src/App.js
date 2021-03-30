import React from 'react';
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3';
import LuxfiContract from './build/contracts/Luxfi.json';
import LuxTrophyContract from './build/contracts/LuxTrophy.json';
import { Layout, Menu, Typography, InputNumber, Card, Space, Button, Col, Row, Divider, Form, Input, Radio } from 'antd';
import 'antd/dist/antd.css';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const App = props => {

  const [web3, setWeb3] = React.useState(null);

  const [accounts, setAccounts] = React.useState(null);
  const [contractStats, setContractStats] = React.useState(null); // totalRewards, totalStakes, totalSupply, cap

  const [form] = Form.useForm();
  const [dataType, setDataType] = React.useState('none');

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

  const luxTrophy = React.useMemo(() => {
    if (!web3) return null;
    return new web3.eth.Contract(LuxTrophyContract.abi, LuxTrophyContract.networks['5777'].address);
  }, [web3]);

  console.log(luxTrophy?.methods);

  React.useEffect(() => {
    if (!web3 || !luxfi || !luxTrophy) return;

    (async () => {
      const accounts = [...(await web3.eth.getAccounts()), '0x3A6C22188846CF7cc961c1209062565D2c11861d'];

      const balances = await Promise.all(accounts.map(web3.eth.getBalance));
      const balanceOf = await Promise.all(accounts.map(addr => luxfi.methods.balanceOf(addr).call()));
      const stakeOf = await Promise.all(accounts.map(addr => luxfi.methods.stakeOf(addr).call()));
      const rewardOf = await Promise.all(accounts.map(addr => luxfi.methods.rewardOf(addr).call()));

      const trophyBalanceOf = await Promise.all(accounts.map(addr => luxTrophy.methods.balanceOf(addr).call()));


      setAccounts(accounts.map((address, i) => ({
        address,
        eth: balances[i],
        stake: stakeOf[i],
        reward: rewardOf[i],
        lxi: balanceOf[i],
        trophy: trophyBalanceOf[i],
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

  const onClaimReward = async (from) => {
    await luxfi.methods.withdrawReward().send({ from });
  }

  const onIssueReward = async () => {
    const [{ address: from }] = accounts;
    const result = await luxfi.methods.distributeRewards().send({ from });
  }

  const createLuxTrophy = async ({to, tokenId, dataType, data}) => {
    const [{ address: from }] = accounts;
    // , tokenId, dataType !== 'none' ? data : undefined
    const result = await luxTrophy.methods.mint(to).send({ from });
  }

  const onFormChange = ({ dataType }) => {
    if (dataType) setDataType(dataType);
  }

  if (!web3) return null;

  console.log(accounts);

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
          <Layout.Content style={{ minHeight: '100vh', padding: '0 16px' }}>
            <Row>
              <Col span={12}>

                <Space direction="vertical">

                  {contractStats &&
                    <Card title="Luxfi - LXI" style={{ width: 384 }}>
                      <Space direction="vertical">
                        <Typography.Text>Total unclaimed rewards: {web3.utils.fromWei(contractStats.totalRewards, 'ether')} LXI</Typography.Text>
                        <Typography.Text>Total supply: {web3.utils.fromWei(contractStats.totalSupply, 'ether')} LXI</Typography.Text>
                        <Typography.Text>Total stakes: {web3.utils.fromWei(contractStats.totalStakes, 'ether')} LXI</Typography.Text>
                        <Typography.Text>Total burned: {web3.utils.fromWei(contractStats.burned, 'ether')} LXI</Typography.Text>
                      </Space>
                    </Card>
                  }

                  {(accounts || []).map(({ address, eth, lxi, stake, reward }) => (
                    <Card title={`Account ${address.slice(0, 8)}`} key={address} style={{ width: 384 }}>
                      <Space direction="vertical">
                        <Typography.Text>{web3.utils.fromWei(eth, 'ether')} ETH, {web3.utils.fromWei(lxi, 'ether')} LXI</Typography.Text>
                        <Typography.Text>Stake: {web3.utils.fromWei(stake, 'ether')} LXI</Typography.Text>
                        <Typography.Text>Reward: {web3.utils.fromWei(reward, 'ether')} LXI</Typography.Text>
                        <Space>
                          <Button disabled={lxi === '0'} onClick={() => onStake(address)}>Stake</Button>
                          <Button disabled={stake === '0'} onClick={() => onWithdraw(address)}>Withdraw</Button>
                          <Button disabled={reward === '0'} onClick={() => onClaimReward(address)}>Claim Reward</Button>
                        </Space>
                      </Space>
                    </Card>
                  ))}

                  <Card title='Admin' style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%'}}>
                      <Button onClick={() => onIssueReward()}>Issue Rewards!</Button>
                      <Divider />
                      <Form
                        form={form}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={createLuxTrophy}
                        onValuesChange={onFormChange}
                      >
                        <Form.Item label="Create LuxTrophy" />
                        <Form.Item label="To" name="to">
                          <Input placeholder="0x0" />
                        </Form.Item>
                        {/* <Form.Item label="Token Id" name="tokenId">
                          <Input placeholder="0" />
                        </Form.Item>
                        <Form.Item label="Data type" name="dataType">

                          <Radio.Group size="small" value={dataType}>
                            <Radio.Button value="none">None</Radio.Button>
                            <Radio.Button value="uint">Uint</Radio.Button>
                            <Radio.Button value="utf8">UTF-8</Radio.Button>
                            <Radio.Button value="bytes">Bytes</Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                        <Form.Item label="Data" name="data">
                          <Input type={dataType === 'uint' ? 'number' : 'text'} placeholder="data" disabled={dataType === 'none'} />
                        </Form.Item> */}
                        <Form.Item wrapperCol={{ span: 16, offset: 8 }}>
                          <Button type="primary" htmlType="submit">Create Token!</Button>
                        </Form.Item>
                      </Form>
                    </Space>
                  </Card>

                  {/* <InputNumber
                    style={{
                      width: 200,
                    }}
                    defaultValue="1"
                    min="0"
                    max="10"
                    step="0.000000000000000001"
                    // onChange={onChange}
                    stringMode
                  /> */}

                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical">
                  {(accounts || []).map(({ address, eth, lxi, stake, reward }) => (
                    <Card title={`Account ${address.slice(0, 8)}`} key={address} style={{ width: 384 }}>
                      <Space direction="vertical">
                        <Typography.Text>{web3.utils.fromWei(eth, 'ether')} ETH, {web3.utils.fromWei(lxi, 'ether')} LXI</Typography.Text>
                        <Typography.Text>Stake: {web3.utils.fromWei(stake, 'ether')} LXI</Typography.Text>
                        <Typography.Text>Reward: {web3.utils.fromWei(reward, 'ether')} LXI</Typography.Text>
                        <Space>
                          <Button disabled={lxi === '0'} onClick={() => onStake(address)}>Stake</Button>
                          <Button disabled={stake === '0'} onClick={() => onWithdraw(address)}>Withdraw</Button>
                          <Button disabled={reward === '0'} onClick={() => onClaimReward(address)}>Claim Reward</Button>
                        </Space>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </Col>
            </Row>
          </Layout.Content>
          <Layout.Footer>
            Luxfi © {new Date().getFullYear()} Created by The Luxed Foundation
          </Layout.Footer>
        </Layout>
      </Layout>

    </Web3ReactProvider>
  )
}

export default App;
