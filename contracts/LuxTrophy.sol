// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/presets/ERC721PresetMinterPauserAutoId.sol";


contract LuxTrophy is ERC721PresetMinterPauserAutoId {

  constructor(
    string memory name,
    string memory symbol,
    string memory baseURI
  )
    ERC721PresetMinterPauserAutoId(name, symbol, baseURI)
  { }
}