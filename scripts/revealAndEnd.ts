import { ethers } from "hardhat";

async function main() {
   
    const bidAmount = ethers.utils.parseEther("0.1"); 
    const secret = "SecretPhrase";

    const MyBid = await ethers.getContractFactory("MyBid");
    const myBid = await MyBid.attach("0xMyBidAddressHere"); 


    await myBid.revealBid(bidAmount, secret);
    console.log("Bid revealed");

    await myBid.endAuction();
    console.log("Auction ended");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });