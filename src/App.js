import React from 'react';
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3';
import LuxfiContract from './build/contracts/Luxfi.json';
import LuxTrophyContract from './build/contracts/LuxTrophy.json';
import { Layout, Menu, Typography, Card, Space, Button, Divider, Form, Input, Tag } from 'antd';
import 'antd/dist/antd.css';
import AccountCard from './components/AccountCard';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const App = props => {

  const [web3, setWeb3] = React.useState(null);

  const [accounts, setAccounts] = React.useState(null);
  const [luxfiStats, setLuxfiStats] = React.useState(null); // totalRewards, totalStakes, totalSupply, cap
  const [luxTrophyStats, setLuxTrophyStats] = React.useState(null);

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

      const totalSupply = await luxTrophy.methods.totalSupply().call();

      setLuxTrophyStats({
        totalSupply
      })

    })();

    (async () => {
      const accounts = [...(await web3.eth.getAccounts()), '0x6256b0B2a64b7DFedc3e5950a59274c87C92F537'];

      const balances = await Promise.all(accounts.map(web3.eth.getBalance));
      const balanceOf = await Promise.all(accounts.map(addr => luxfi.methods.balanceOf(addr).call()));
      const stakeOf = await Promise.all(accounts.map(addr => luxfi.methods.stakeOf(addr).call()));
      const rewardOf = await Promise.all(accounts.map(addr => luxfi.methods.rewardOf(addr).call()));

      console.log(balances);

      const trophyBalanceOf = await Promise.all(accounts.map(addr => luxTrophy.methods.balanceOf(addr).call()));
      const trophiesOf = await Promise.all(accounts.map((addr, i) => {
        return Promise.all(Array(Number(trophyBalanceOf[i])).fill(0).map((_, i) => {
          return luxTrophy.methods.tokenOfOwnerByIndex(addr, i).call();
        }))
      }))


      setAccounts(accounts.map((address, i) => ({
        address,
        eth: balances[i],
        stake: stakeOf[i],
        reward: rewardOf[i],
        lxi: balanceOf[i],
        trophyCount: trophyBalanceOf[i],
        trophies: trophiesOf[i],
      })));

    })();

    (async () => {

      const totalRewards = await luxfi.methods.totalRewards().call();
      const totalSupply = await luxfi.methods.totalSupply().call();
      const totalStakes = await luxfi.methods.totalStakes().call();
      const burned = await luxfi.methods.balanceOf(ZERO_ADDRESS).call();

      setLuxfiStats({
        totalRewards,
        totalSupply,
        totalStakes,
        burned,
      })

    })();

  }, [web3, luxfi, luxTrophy]);


  const onIssueReward = async () => {
    const [{ address: from }] = accounts;
    const result = await luxfi.methods.distributeRewards().send({ from });
  }

  const createLuxTrophy = async ({ to, tokenId, dataType, data }) => {
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

            <Space direction="vertical">

              {luxfiStats &&
                <Card title="Luxfi - LXI" style={{ width: 384 }}>
                  <Space direction="vertical">
                    <Typography.Text>Total unclaimed rewards: {web3.utils.fromWei(luxfiStats.totalRewards, 'ether')} LXI</Typography.Text>
                    <Typography.Text>Total supply: {web3.utils.fromWei(luxfiStats.totalSupply, 'ether')} LXI</Typography.Text>
                    <Typography.Text>Total stakes: {web3.utils.fromWei(luxfiStats.totalStakes, 'ether')} LXI</Typography.Text>
                    <Typography.Text>Total burned: {web3.utils.fromWei(luxfiStats.burned, 'ether')} LXI</Typography.Text>
                  </Space>
                </Card>
              }

              {(accounts || []).map(props => (
                <AccountCard key={props.address} web3={web3} luxfi={luxfi} {...props} />
              ))}

              <Card title='Admin' style={{ width: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button onClick={() => onIssueReward()}>Issue Rewards!</Button>
                  <Divider plain orientation="left">Create LuxTrophy</Divider>
                  <Form
                    form={form}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={createLuxTrophy}
                    onValuesChange={onFormChange}
                  >
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
