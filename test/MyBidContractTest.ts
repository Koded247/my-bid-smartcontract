import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("MyNFT and MyBid Contract Tests", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployContractsFixture() {
    const [owner, bidder1, bidder2] = await ethers.getSigners();

    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy("MyNFT", "NFT");
    await myNFT.deployed();

    const MyBid = await ethers.getContractFactory("MyBid");
    const myBid = await MyBid.deploy(myNFT.address);
    await myBid.deployed();

    return { myNFT, myBid, owner, bidder1, bidder2 };
  }

  describe("MyNFT", function () {
    it("Should mint an NFT", async function () {
      const { myNFT, owner } = await loadFixture(deployContractsFixture);
      
      await myNFT.connect(owner).safeMint(owner.address, 1);
      expect(await myNFT.ownerOf(1)).to.equal(owner.address);
    });

    it("Should approve a bidder", async function () {
      const { myNFT, owner, bidder1 } = await loadFixture(deployContractsFixture);
      
      await myNFT.connect(owner).safeMint(owner.address, 1);
      await myNFT.connect(owner).approveBidder(bidder1.address, 1);
      
      expect(await myNFT.getApproved(1)).to.equal(bidder1.address);
    });
  });

  describe("MyBid", function () {
    it("Should create an auction", async function () {
      const { myNFT, myBid, owner } = await loadFixture(deployContractsFixture);
      
      await myNFT.connect(owner).safeMint(owner.address, 1);
      const minBid = ethers.utils.parseEther("0.01");
      const deadline = (await time.latest()) + 86400; // One day from now

      await myBid.connect(owner).createAuction(1, minBid, deadline);
      const auction = await myBid.auction();
      expect(auction.itemID).to.equal(1);
      expect(auction.minBid).to.equal(minBid);
      expect(auction.deadline).to.be.closeTo(deadline, 10); // Allow for some time discrepancy
    });

    it("Should submit and reveal a bid", async function () {
      const { myNFT, myBid, owner, bidder1 } = await loadFixture(deployContractsFixture);
      
      await myNFT.connect(owner).safeMint(owner.address, 1);
      const minBid = ethers.utils.parseEther("0.01");
      const deadline = (await time.latest()) + 86400; // One day from now
      
      await myBid.connect(owner).createAuction(1, minBid, deadline);
      
      const bidAmount = ethers.utils.parseEther("0.02");
      const secret = "secret";
      const encryptedBid = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${bidAmount.toString()}${secret}`));
      
      await expect(myBid.connect(bidder1).submitEncryptedBid(encryptedBid, { value: bidAmount }))
        .to.emit(myBid, "BidSubmitted")
        .withArgs(bidder1.address, encryptedBid);
      
      await time.increaseTo(deadline + 1); // Move time forward past the auction deadline
      
      await expect(myBid.connect(bidder1).revealBid(bidAmount, secret))
        .to.emit(myBid, "BidRevealed")
        .withArgs(bidder1.address, bidAmount);
    });

    it("Should end the auction and transfer NFT", async function () {
      const { myNFT, myBid, owner, bidder1 } = await loadFixture(deployContractsFixture);
      
      await myNFT.connect(owner).safeMint(owner.address, 1);
      const minBid = ethers.utils.parseEther("0.01");
      const deadline = (await time.latest()) + 86400; // One day from now
      
      await myBid.connect(owner).createAuction(1, minBid, deadline);
      
      const bidAmount = ethers.utils.parseEther("0.02");
      const secret = "secret";
      const encryptedBid = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${bidAmount.toString()}${secret}`));
      
      await myBid.connect(bidder1).submitEncryptedBid(encryptedBid, { value: bidAmount });
      
      await time.increaseTo(deadline + 1); // Move time forward past the auction deadline
      await myBid.connect(bidder1).revealBid(bidAmount, secret);
      
      await time.increaseTo(deadline + 86400 + 1); // Move time past reveal deadline
      
      await expect(myBid.connect(owner).endAuction())
        .to.emit(myBid, "AuctionEnded")
        .withArgs(bidder1.address, bidAmount);
      
      await expect(myBid.connect(owner).transferItemAndFunds())
        .to.emit(myNFT, "Transfer")
        .withArgs(owner.address, bidder1.address, 1);
    });
  });
});