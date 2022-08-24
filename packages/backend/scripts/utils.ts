// import { ethers } from "hardhat";
import { ethers } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import "dotenv/config";
import * as dotenv from 'dotenv';
import contracts from "./hardhat_contracts.json";

dotenv.config({ path: '../../.env' });

export function setupProvider (network: string) {
  if (network === "goerli") {
    return new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_GOERLI_API_KEY);
  }
}

export function setupWallet () {
  // This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
  // Do never expose your keys like this
  const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  return wallet;
}

export async function checkBalance (signer: ethers.Wallet)
{
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }
}

export function updateContractsJson () {
  const fs = require("fs");
  fs.copyFile("../frontend/contracts/hardhat_contracts.json", './scripts/hardhat_contracts.json', (err: any) => {
    if (err) throw err;
    console.log('contracts updated');
  });
}

export function getContract (contractName: string, chainId:string, signer: ethers.Wallet)
{
  // could get the contracts from the deployment folder
  const allContracts = contracts as any;
  const contractJson = allContracts[chainId][0].contracts[contractName];
  return new ethers.Contract(
    contractJson.address,
    contractJson.abi,
    signer
  );
}

export function getContractFromAddress (contractName: string, chainId:string, signer: ethers.Wallet, address: string) {
  const allContracts = contracts as any;
  const contractJson = allContracts[chainId][0].contracts[contractName];
  return new ethers.Contract(
    address,
    contractJson.abi,
    signer
  );
}

export async function reportGas(transactionReceipt: any) {
  const gasUsed = transactionReceipt.gasUsed;
  const effectiveGasPrice = transactionReceipt.effectiveGasPrice;
  const txFee = gasUsed.mul(effectiveGasPrice);
  console.log("Gas spent: ", gasUsed.toString(), " fee: ", txFee.toString());
}

export async function printPool (poolContract: any) {
  const open = await poolContract.openForBets();
  const hasResult = await poolContract.hasResult();
  let result = "undefined";
  if (hasResult) {
    const resultOption = await poolContract.getResult();
    const resultEncoded = await poolContract.getOptionName(resultOption.toString());
    result = ethers.utils.parseBytes32String(resultEncoded);
  }
  const totalAmount = await poolContract.totalAmount();
  const totalYield = await poolContract.getTotalYield();
  console.log("Pool ", poolContract.address, open, hasResult, result, ethers.utils.formatUnits(totalAmount, 6) , ethers.utils.formatUnits(totalYield, 6));
}

export async function getTokenContract (address: string, signer: ethers.Wallet) {
  const allContracts = contracts as any;
  const contractJson = allContracts['5'][0].contracts["MyToken"];
  return new ethers.Contract(
    address,
    contractJson.abi,
    signer
  );
}