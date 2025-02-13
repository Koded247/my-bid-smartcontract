import { ethers } from "hardhat";

async function main() {
    // Deploy MyNFT
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy("KODED NFT", "K-NFT"); // Deploy with name and symbol
    await myNFT.deployed();
    console.log("MyNFT deployed to:", myNFT.address);

    // Deploy MyBid with MyNFT's address
    const MyBid = await ethers.getContractFactory("MyBid");
    const myBid = await MyBid.deploy(myNFT.address);
    await myBid.deployed();
    console.log("MyBid deployed to:", myBid.address);

    // Optionally, mint some NFTs for testing
    // Here we mint an NFT to the MyBid contract for testing purposes
    await myNFT.safeMint(myBid.address, 1); // Mint token with ID 1 to MyBid contract for testing
    console.log("NFT with ID 1 minted to MyBid contract.");

    // Optionally, approve all tokens for MyBid to transfer if needed
    // await myNFT.setApprovalForAllBidder(myBid.address, true);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });