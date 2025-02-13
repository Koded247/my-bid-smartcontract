// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}


    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }


    function approveBidder(address bidder, uint256 tokenId) public onlyOwner {
        approve(bidder, tokenId);
    }


    function setApprovalForAllBidder(address bidder, bool approved) public onlyOwner {
        setApprovalForAll(bidder, approved);
    }
}