
import * as fs from 'fs';
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction, SystemProgram
} from '@solana/web3.js';

import {
  connection,
  WalletType,
  tokenAddress,
  minAmount,
  maxAmount,
  tokenDecimal
} from './config';


async function getUSDEBTBalance(walletAddress: string): Promise<Number> {
  // Connection to the Solana RPC server

  try {
    // The public key for the wallet you're checking
    const walletPublicKey = new PublicKey(walletAddress);

    // USDEBT token mint address on Solana Mainnet Beta
    const usdebtMintAddress = new PublicKey(tokenAddress); // Replace with actual USDEBT mint address

    // Get the associated token accounts for the wallet
    const tokenAccounts = await connection.getTokenAccountsByOwner(walletPublicKey, {
      mint: usdebtMintAddress
    });

    if (tokenAccounts.value.length === 0) {
      console.log("No USDEBT account found for this wallet.");
      return 0;
    }

    // Assuming the first account is the USDEBT account (might have multiple token accounts)
    const usdebtAccountInfo = await connection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);

    console.log(`USDEBT Balance: ${usdebtAccountInfo.value.amount}`);
    return Number(usdebtAccountInfo.value.amount);
  } catch (error) {
    console.error("Failed to fetch balance", error);
    return 0;
  }
}

async function getBalance(wallets: WalletType[]) {
  for (const wallet of wallets) {
    const balance = await connection.getBalance(new PublicKey(wallet.publicKey));
    wallet.amount = balance / Math.pow(10, 9); // Convert lamports to SOL
    wallet.usdebt = await getUSDEBTBalance(wallet.publicKey)
    await new Promise(resolve => setTimeout(resolve, 2000));

  }
  const jsonData = JSON.stringify(wallets, null, 2);
  fs.writeFileSync('balances.json', jsonData);
}

async function main() {
  try {
    const wallets: WalletType[] = JSON.parse(fs.readFileSync('addresses.json', 'utf-8'));
    await getBalance(wallets);
    console.log(`You can check balance.json`);
  } catch (error) {
    console.error('Error generating Solana wallets:', error);
  }
}

main().then(() => {
  console.log('Finished');
});
