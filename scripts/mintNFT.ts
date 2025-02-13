import { ethers } from "hardhat";

async function main() {
    // Address to which you want to mint the NFT
    const receiverAddress = "0xYourReceiverAddressHere"; // Replace with the address that should receive the NFT
    const tokenId = 2; // Next available token ID

    // Get the deployed contract instance
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.attach("0xMyNFTAddressHere"); // Replace with the address where MyNFT was deployed

    // Mint the NFT
    await myNFT.safeMint(receiverAddress, tokenId);
    console.log(`NFT with ID ${tokenId} minted to ${receiverAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });