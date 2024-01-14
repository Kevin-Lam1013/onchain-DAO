const hre = require("hardhat");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // Deploy the NFT Contract
  const nftContract = await hre.ethers.deployContract("CryptoDevsNFT");
  await nftContract.waitForDeployment();
  console.log("CryptoDevsNFT deployed to : ", nftContract.target);

  // Deploy the Fake Marketplace Contract
  const fakeMarketplaceContract = await hre.ethers.deployContract(
    "FakeMarketplace"
  );
  await fakeMarketplaceContract.waitForDeployment();
  console.log("FakeMarketplace deployed to : ", fakeMarketplaceContract.target);

  // Deploy the DAO Contract
  const amount = hre.ethers.parseEther("0.05");
  const daoContract = await hre.ethers.deployContract(
    "CryptoDevsDAO",
    [fakeMarketplaceContract.target, nftContract.target],
    { value: amount }
  );
  await daoContract.waitForDeployment();
  console.log("CryptoDevsDAO deployed to : ", daoContract.target);

  // Sleep for 30 seconds to let Etherscan catch up with the deployments
  await sleep(30 * 1000);

  // Verify the NFT contract
  await hre.run("verify:verify", {
    address: nftContract.target,
    constructorArguments: [],
  });

  // Verify the Fake Marketplace Contract
  await hre.run("verify:verify", {
    address: fakeMarketplaceContract.target,
    constructorArguments: [],
  });

  // Verify the DAO Contract
  await hre.run("verify:verify", {
    address: daoContract.target,
    constructorArguments: [fakeMarketplaceContract.target, nftContract.target],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
