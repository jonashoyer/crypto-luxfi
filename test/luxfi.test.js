import { EVM_REVERT, wait, ether, tokens } from './helpers'

const Luxfi = artifacts.require('Luxfi');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Luxfi', ([owner, user]) => {
  let luxfi;

  const cap = 10000000000;

  beforeEach(async () => {
    luxfi = await Luxfi.new('Luxfi', 'LXI', 18, String(cap), '2000000000');
  })


  describe('Luxfi deployment', async () => {
    it('name', async () => {
      const name = await luxfi.name();
      assert.equal(name, 'Luxfi')
    })

    it('symbol', async () => {
      const symbol = await luxfi.symbol();
      assert.equal(symbol, 'LXI');
    })

    it('user has tokens', async () => {
    await luxfi.transfer(user, '1000000000', { from: owner });
    const balance = await luxfi.balanceOf(user);
      assert.equal(balance, '1000000000')
    })

    it('owner has tokens', async () => {
      const balance = await luxfi.balanceOf(owner);
      assert.equal(balance, '2000000000'); 
    })

    it('createStake creates a stake.', async () => {
      await luxfi.transfer(user, 3, { from: owner });
      await luxfi.createStake(1, { from: user });

      assert.equal(await luxfi.balanceOf(user), 2);
      assert.equal(await luxfi.stakeOf(user), 1);
      assert.equal(
        await luxfi.totalSupply(), 
        String(cap - 1),
      );
      assert.equal(await luxfi.totalStakes(), 1);
  });

  it('rewards are distributed.', async () => {
    await luxfi.transfer(user, 100, { from: owner });
    await luxfi.createStake(100, { from: user });
    await luxfi.distributeRewards({ from: owner });
   
    assert.equal(await luxfi.rewardOf(user), 1);
    assert.equal(await luxfi.totalRewards(), 1);
  });

  it('rewards can be withdrawn.', async () => {
    await luxfi.transfer(user, 100, { from: owner });
    await luxfi.createStake(100, { from: user });
    await luxfi.distributeRewards({ from: owner });
    await luxfi.withdrawReward({ from: user });
   
    const existingStakes = 100;
    const mintedAndWithdrawn = 1;

    assert.equal(await luxfi.balanceOf(user), 1);
    assert.equal(await luxfi.stakeOf(user), 100);
    assert.equal(await luxfi.rewardOf(user), 0);
    assert.equal(
      await luxfi.totalSupply(),
      String(cap - existingStakes + mintedAndWithdrawn)
    );
    assert.equal(await luxfi.totalStakes(), 100);
    assert.equal(await luxfi.totalRewards(), 0);
  });

  })
})