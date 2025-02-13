// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract MyBid is Ownable {
    using SafeMath for uint256;

    // parameters
    struct Auction {
        address seller;
        uint256 itemID; 
        uint256 minBid;
        uint256 deadline;
        uint256 revealDeadline;
        bool ended;
        address highestBidder;
        uint256 highestBid;
    }

    // struct
    struct Bid {
        bytes32 encryptedBid; 
        uint256 deposit;
        bool revealed;
    }

    // State variables
    Auction public auction;
    mapping(address => Bid) public bids;
    mapping(address => uint256) public refunds;

    // Address of the ERC721 contract
    IERC721 public nftContractAddress;

    // Events
    event AuctionCreated(uint256 itemID, uint256 minBid, uint256 deadline);
    event BidSubmitted(address bidder, bytes32 encryptedBid);
    event BidRevealed(address bidder, uint256 bid);
    event AuctionEnded(address winner, uint256 highestBid);
    event FundsTransferred(address seller, uint256 amount);

    // Constructor with added parameter for NFT contract address
    constructor(address _nftContractAddress) {
        nftContractAddress = IERC721(_nftContractAddress);
    }

    // Constructor to initialize the auction 
    function createAuction(uint256 _itemID, uint256 _minBid, uint256 _deadline) external onlyOwner {
        if (_deadline <= block.timestamp) {
            revert("Deadline must be in the future");
        }
        auction = Auction({
            seller: msg.sender,
            itemID: _itemID,
            minBid: _minBid,
            deadline: _deadline,
            revealDeadline: _deadline + 1 days, 
            ended: false,
            highestBidder: address(0),
            highestBid: 0
        });
        emit AuctionCreated(_itemID, _minBid, _deadline);
    }

    // Submit an encrypted bid with a deposit
    function submitEncryptedBid(bytes32 _encryptedBid) external payable {
        if (block.timestamp >= auction.deadline) {
            revert("Auction has ended");
        }
        if (msg.value < auction.minBid) {
            revert("Deposit must cover minimum bid");
        }
        if (bids[msg.sender].deposit != 0) {
            revert("Bid already submitted");
        }

        bids[msg.sender] = Bid({
            encryptedBid: _encryptedBid,
            deposit: msg.value,
            revealed: false
        });
        emit BidSubmitted(msg.sender, _encryptedBid);
    }

    // Reveal the actual bid
    function revealBid(uint256 _bid, bytes32 _secret) external {
        if (block.timestamp < auction.deadline) {
            revert("Auction is still ongoing");
        }
        if (block.timestamp >= auction.revealDeadline) {
            revert("Reveal period has ended");
        }

        Bid storage bid = bids[msg.sender];
        if (bid.deposit == 0) {
            revert("No bid submitted");
        }
        if (bid.revealed) {
            revert("Bid already revealed");
        }

        // Verify the encrypted bid
        bytes32 hashedBid = keccak256(abi.encodePacked(_bid, _secret));
        if (hashedBid != bid.encryptedBid) {
            revert("Invalid bid reveal");
        }

        bid.revealed = true;
        if (_bid > auction.highestBid && _bid >= auction.minBid) {
            // Refund the previous highest bidder
            if (auction.highestBidder != address(0)) {
                refunds[auction.highestBidder] = refunds[auction.highestBidder].add(bids[auction.highestBidder].deposit);
            }
            auction.highestBidder = msg.sender;
            auction.highestBid = _bid;
        } else {
            // Refund the bidder if their bid is not the highest
            refunds[msg.sender] = refunds[msg.sender].add(bid.deposit);
        }
        emit BidRevealed(msg.sender, _bid);
    }

    // End.. pick winner
    function endAuction() external onlyOwner {
        if (block.timestamp < auction.revealDeadline) {
            revert("Reveal period not ended");
        }
        if (auction.ended) {
            revert("Auction already ended");
        }

        auction.ended = true;
        emit AuctionEnded(auction.highestBidder, auction.highestBid);
    }

    // Transfer funds to seller and transfer the NFT
    function transferItemAndFunds() external onlyOwner {
        if (!auction.ended) {
            revert("Auction not ended");
        }
        if (auction.highestBidder == address(0)) {
            revert("No winner");
        }

        uint256 amount = auction.highestBid;
        (bool sent, ) = auction.seller.call{value: amount}("");
        if (!sent) {
            revert("Failed to send Ether to seller");
        }
        emit FundsTransferred(auction.seller, amount);

        // Transfer the NFT to the highest bidder
        try nftContractAddress.transferFrom(auction.seller, auction.highestBidder, auction.itemID) {
            // NFT transfer was successful
        } catch {
            // Handle the case where transfer fails
            revert("NFT transfer failed");
        }
    }

    // Withdraw refunds for non-winning bidders
    function withdrawRefund() external {
        uint256 refund = refunds[msg.sender];
        if (refund == 0) {
            revert("No refund available");
        }

        refunds[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: refund}("");
        if (!sent) {
            revert("Failed to send refund");
        }
    }

    // Fallback function to prevent accidental Ether transfers
    receive() external payable {
        revert("Direct payments not allowed");
    }
}