import { ethers } from "hardhat";



async function main() {
 
    const tokenId = 1; 
    const minBid = ethers.utils.parseEther("0.01"); 
    const deadline = Math.floor(Date.now() / 1000) + 86400; 


    const MyBid = await ethers.getContractFactory("MyBid");
    const myBid = await MyBid.attach("0xMyBidAddressHere"); 

    await myBid.createAuction(tokenId, minBid, deadline);
    console.log(`Auction created for token ID ${tokenId} with minimum bid of ${ethers.utils.formatEther(minBid)} ETH`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });