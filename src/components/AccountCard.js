import React from 'react';
import { Typography, Card, Space, Button, Divider, Radio, InputNumber, Tag } from 'antd';
import { SendOutlined } from '@ant-design/icons';

function AccountCard({ web3, luxfi, address, eth, lxi, stake, reward, trophyCount, trophies }) {


  const [inputNumber, setInputNumber] = React.useState(1);
  const [actionType, setActionType] = React.useState('stake');

  const onSubmit = () => {
    switch(actionType) {
      case 'stake':
        return luxfi.methods.createStake(web3.utils.toWei(inputNumber, 'ether')).send({ from: address });
      case 'withdraw':
        return luxfi.methods.removeStake(web3.utils.toWei(inputNumber, 'ether')).send({ from: address });
      case 'claim':
        return luxfi.methods.withdrawReward().send({ from: address });
      default:
        return;
    }
  }

  const inputNumberMax = React.useMemo(() => {
    switch(actionType) {
      case 'stake':
        return lxi;
      case 'withdraw':
        return stake;
      default:
        return 0;
    }
  }, [actionType, lxi, stake]);

  return (
    <Card title={`Account ${address.slice(0, 8)}`} style={{ width: 384 }}>
      <Space direction="vertical">
        <Typography.Text>{web3.utils.fromWei(eth, 'ether')} ETH, {web3.utils.fromWei(lxi, 'ether')} LXI</Typography.Text>
        <Typography.Text>Stake: {web3.utils.fromWei(stake, 'ether')} LXI</Typography.Text>
        <Typography.Text>Reward: {web3.utils.fromWei(reward, 'ether')} LXI</Typography.Text>

        <Radio.Group value={actionType} onChange={e => setActionType(e.target.value)} buttonStyle="solid" style={{ marginTop: 16 }}>
          <Radio.Button value="stake" disabled={lxi === '0'}>Stake</Radio.Button>
          <Radio.Button value="withdraw" disabled={stake === '0'}>Withdraw</Radio.Button>
          <Radio.Button value="claim" disabled={reward === '0'}>Claim Rewards</Radio.Button>
        </Radio.Group>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InputNumber
            style={{ width: '100%' }}
            value={inputNumber}
            disabled={inputNumberMax === 0}
            defaultValue="1"
            min="0"
            max={inputNumberMax}
            step="0.000000000000000001"
            onChange={v => setInputNumber(v)}
            stringMode
          />
          <Button type="primary" shape="round" icon={<SendOutlined />} size='small' onClick={onSubmit} />
        </div>

        <Divider plain orientation='left'>Trophies ({trophyCount})</Divider>
        <div>
          {trophies.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </Space>
    </Card>
  )
}

export default AccountCard;