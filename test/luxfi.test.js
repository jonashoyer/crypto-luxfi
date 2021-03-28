import { EVM_REVERT, wait, ether, tokens } from './helpers'

const Luxfi = artifacts.require('Luxfi');
const Dai = artifacts.require('Dai');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Luxfi', ([owner, user]) => {
  let luxfi, dai;

  beforeEach(async () => {
    luxfi = await Luxfi.new()
    dai = await Dai.new();

    await luxfi.transfer(user, ether('1000000'));
    await dai.transfer(user, ether('1000000'));
  })


  describe('Luxfi deployment', async () => {
    it('has a name', async () => {
      const name = await luxfi.name();
      assert.equal(name, 'Luxfi')
    })

    it('contract has tokens', async () => {
      const balance = await luxfi.balanceOf(user);
      assert.equal(balance, ether('1000000'))
    })

    it('staking', async () => {

      const balance = await luxfi.balanceOf(user);
      assert.equal(balance, ether('1000000'), 'user before balance');

      await luxfi.approve(luxfi.address, ether('1000000'), { from: user });
      await luxfi.stake(ether('1000000'), { from: user });

      const outBalance = await luxfi.balanceOf(user);
      assert.equal(outBalance, ether('0'), 'user after balance');

      const luxfiBalance = await luxfi.balanceOf(luxfi.address);
      assert.equal(luxfiBalance, ether('1000000'), 'contract balance');

      const stakingBalance = await luxfi.staking(user);
      assert.equal(stakingBalance, ether('1000000'), 'staking balance');

      const isStaking = await luxfi.isStaking(user);
      assert.equal(isStaking, true, 'is staking');

      const hasStaked = await luxfi.hasStaked(user);
      assert.equal(hasStaked, true, 'has staked');

    })

    it('issue', async () => {
      const balance = await luxfi.balanceOf(user);
      assert.equal(balance, ether('1000000'), 'user before balance');

      await luxfi.approve(luxfi.address, ether('1000000'), { from: user });
      await luxfi.stake(ether('1000000'), { from: user });

      const outBalance = await luxfi.balanceOf(user);
      assert.equal(outBalance, ether('0'), 'user after balance');

      await luxfi.issue({ from: owner });

      const out2Balance = await luxfi.balanceOf(user);
      assert.equal(out2Balance, ether(1000000 / 1000), 'user after issue');

    })

    it('issue non owner', async () => {

      await luxfi.issue({ from: user }).should.be.rejected;

    })

    it('unstake', async () => {

      await luxfi.approve(luxfi.address, ether('1000000'), { from: user });
      await luxfi.stake(ether('1000000'), { from: user });
      await luxfi.unstake(ether('300000'), { from: user });

      const out2Balance = await luxfi.balanceOf(user);
      assert.equal(out2Balance, ether('300000'), 'user after unstake');

      const luxfiBalance = await luxfi.balanceOf(luxfi.address);
      assert.equal(luxfiBalance, ether('700000'), 'luxfi after unstake');


    })

    it('unstake over draw', async () => {
      await luxfi.approve(luxfi.address, ether('10000'), { from: user });
      await luxfi.stake(ether('10000'), { from: user });
      await luxfi.unstake(ether('50000'), { from: user }).should.be.rejected;
    })

  })

  describe('Dai deployment', async () => {
    it('has a name', async () => {
      const name = await dai.name();
      assert.equal(name, 'Mock Dai')
    })

    it('contract has tokens', async () => {
      const balance = await dai.balanceOf(user);
      assert.equal(balance, ether('1000000'))
    })

  })
})