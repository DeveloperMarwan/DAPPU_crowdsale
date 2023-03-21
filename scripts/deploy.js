// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const TOKEN_NAME = "Dapp University ICO"
  const TOKEN_SYMBOL = "DAPPICO"
  const MAX_TOKENS = "1000000";
  const ICO_PRICE = hre.ethers.utils.parseEther("0.025");

  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy(TOKEN_NAME, TOKEN_SYMBOL, MAX_TOKENS);
  await token.deployed();

  console.log(
    `Token deployed to ${token.address}`
  );

  const Crowdsale = await hre.ethers.getContractFactory("Crowdsale");
  const crowdsale = await Crowdsale.deploy(token.address, ICO_PRICE, hre.ethers.utils.parseEther(MAX_TOKENS));
  await crowdsale.deployed();

  console.log(
    `Crowdsale deployed to ${crowdsale.address}`
  );

  const txn = await token.transfer(crowdsale.address, hre.ethers.utils.parseEther(MAX_TOKENS));
  await txn.wait();
  console.log("Tokens transferred to Crowdsale contract");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
