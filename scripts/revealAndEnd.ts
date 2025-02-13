import { ethers } from "hardhat";

async function main() {
    // The actual bid amount and the secret used for encryption
    const bidAmount = ethers.utils.parseEther("0.1"); 
    const secret = "SecretPhrase"; // Must match what was used in submission

    // Get the deployed contract instance
    const MyBid = await ethers.getContractFactory("MyBid");
    const myBid = await MyBid.attach("0xMyBidAddressHere"); // Replace with the address where MyBid was deployed

    // Reveal the bid
    await myBid.revealBid(bidAmount, secret);
    console.log("Bid revealed");

    // End the auction (this should only be called after the reveal period)
    await myBid.endAuction();
    console.log("Auction ended");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });