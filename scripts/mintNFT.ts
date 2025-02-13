import { ethers } from "hardhat";

async function main() {

    const receiverAddress = "0xYourReceiverAddressHere"; 
    const tokenId = 2; 

    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.attach("0xMyNFTAddressHere"); 

    await myNFT.safeMint(receiverAddress, tokenId);
    console.log(`NFT with ID ${tokenId} minted to ${receiverAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });