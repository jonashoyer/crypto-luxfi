// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.8.0;

contract Luxfi {
  
  string public name = "Luxfi";
  string public symbol = "LXI";
  uint256 public totalSupply = 1000000000000000000000000;
  uint8 public decimals = 18;

  address public owner;

  address[] public stakers;
  mapping(address => uint) public staking;
  mapping(address => bool) public isStaking;
  mapping(address => bool) public hasStaked;
  

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 _value  
  );

  event Approval(
    address indexed _owner,
    address indexed _spender,
    uint256 _value
  );

  mapping(address => uint256) public balanceOf;
  mapping(address => mapping(address => uint256)) public allowance;

  constructor() public {
    owner = msg.sender;
    balanceOf[msg.sender] = totalSupply;
  }

  function transfer(address _to, uint256 _value) public returns (bool success) {
    require(balanceOf[msg.sender] >= _value);
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  function approve(address _spender, uint256 _value) public returns (bool success) {
    allowance[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
    require(_value <= balanceOf[_from]);
    require(_value <= allowance[_from][msg.sender]);
    balanceOf[_from] -= _value;
    balanceOf[_to] += _value;
    allowance[_from][msg.sender] -= _value;
    emit Transfer(_from, _to, _value);
    return true;
  }


  function stake(uint _amount) public {
    require(_amount > 0, "amount cannot be 0");

    this.transferFrom(msg.sender, address(this), _amount);
    staking[msg.sender] += _amount;
    
    if (!isStaking[msg.sender]) {
      isStaking[msg.sender] = true;
      hasStaked[msg.sender] = true;
      stakers.push(msg.sender);
    }
  }

  function unstake(uint _amount) public {

    uint staked = staking[msg.sender];
    require(0 < staked, "staking balance cannot be 0");
    require(_amount <= staked, "amount unstaking cannot be more then staking");

    this.transfer(msg.sender, _amount);
    
    if (_amount == staked) {
      isStaking[msg.sender] = false;
      staking[msg.sender] = 0;
      return;
    }

    staking[msg.sender] -= _amount;

  }


  function issue() public {
    require(msg.sender == owner, "caller must be owner");

    for(uint i = 0; i < stakers.length; i++) {
      address addr = stakers[i];
      uint amount = staking[addr];
      if (amount <= 0) continue;
      this.transfer(addr, amount / 1000);
    }
  }
}