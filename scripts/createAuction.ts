import { ethers } from "hardhat";



async function main() {
    // The NFT token ID you want to auction
    const tokenId = 1; 
    const minBid = ethers.utils.parseEther("0.01"); // Minimum bid in ETH
    const deadline = Math.floor(Date.now() / 1000) + 86400; // One day from now in Unix timestamp

    // Get the deployed contract instance
    const MyBid = await ethers.getContractFactory("MyBid");
    const myBid = await MyBid.attach("0xMyBidAddressHere"); // Replace with the address where MyBid was deployed

    // Create the auction
    await myBid.createAuction(tokenId, minBid, deadline);
    console.log(`Auction created for token ID ${tokenId} with minimum bid of ${ethers.utils.formatEther(minBid)} ETH`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });