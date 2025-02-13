import { ethers } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers/lib.esm/utils";         



async function main() {

    const bidAmount = ethers.utils.parseEther("0.1"); 
    const secret = "SecretPhrase";
    const encryptedBid = keccak256(toUtf8Bytes(`${bidAmount.toString()}${secret}`));

 
    const MyBid = await ethers.getContractFactory("MyBid");
    const myBid = await MyBid.attach("0xMyBidAddressHere"); 

    await myBid.submitEncryptedBid(encryptedBid, { value: bidAmount });
    console.log(`Bid submitted with deposit of ${ethers.utils.formatEther(bidAmount)} ETH`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);        process.exit(1);
    });