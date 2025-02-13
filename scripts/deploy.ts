import { ethers } from "hardhat";

async function main() {
  
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy("KODED NFT", "K-NFT"); 
    await myNFT.deployed();
    console.log("MyNFT deployed to:", myNFT.address);


    const MyBid = await ethers.getContractFactory("MyBid");
    const myBid = await MyBid.deploy(myNFT.address);
    await myBid.deployed();
    console.log("MyBid deployed to:", myBid.address);

    await myNFT.safeMint(myBid.address, 1); 
    console.log("NFT with ID 1 minted to MyBid contract.");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });