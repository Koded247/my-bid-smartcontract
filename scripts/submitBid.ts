// import { ethers } from "hardhat";
// import { keccak256, toUtf8Bytes } from "ethers/lib.esm/utils";         

// // "ethers/lib/utils"

// async function main() {
//     // The bid amount in ETH and a secret for encryption
//     const bidAmount = ethers.utils.parseEther("0.1"); 
//     const secret = "SecretPhrase"; // This should be kept secret by the bidder
//     const encryptedBid = keccak256(toUtf8Bytes(`${bidAmount.toString()}${secret}`));

//     // Get the deployed contract instance
//     const MyBid = await ethers.getContractFactory("MyBid");
//     const myBid = await MyBid.attach("0xMyBidAddressHere"); // Replace with the address where MyBid was deployed

//     // Submit the bid
//     await myBid.submitEncryptedBid(encryptedBid, { value: bidAmount });
//     console.log(`Bid submitted with deposit of ${ethers.utils.formatEther(bidAmount)} ETH`);
// }

// main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//         console.error(error);
//         process.exit(1);
//     });