import * as fs from "fs";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  transfer,
} from "@solana/spl-token";
import {
  Account,
  Keypair,
  PublicKey,
  Connection,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  sendAndConfirmTransaction
} from "@solana/web3.js";

import { Wallet } from "@project-serum/anchor";

import {
  connection,
  adminWallet,
  walletCount,
  WalletType,
  tokenAddress,
  minAmount,
  maxAmount,
  tokenDecimal,
  adminPrivateKey,
} from "./config";

// async function getWalletBalance(adminPrivateKey: string, connection: Connection): Promise<number> {
//   const adminPublicKey = Keypair.fromSecretKey(Buffer.from(adminPrivateKey, 'base64')).publicKey;

//   const balance = await connection.getBalance(adminPublicKey);
//   return balance / Math.pow(10, 9); // Convert lamports to SOL
// }

async function generateSolanaWallets(
  walletCount: number
): Promise<WalletType[]> {
  const wallets: WalletType[] = [];

  for (let i = 0; i < walletCount; i++) {
    const keypair = Keypair.generate();
    wallets.push({
      publicKey: keypair.publicKey.toBase58(),
      secretKey: Buffer.from(keypair.secretKey).toString("base64"),
      amount: 0,
      usdebt: 0,
    });
  }

  return wallets;
}
async function saveWalletsToFile(wallets: WalletType[]) {
  const jsonData = JSON.stringify(wallets, null, 2);
  fs.writeFileSync("addresses.json", jsonData);
}

async function sendFundsToWallets(wallets: WalletType[]) {
  const connection = new Connection("https://crimson-attentive-wildflower.solana-mainnet.quiknode.pro/c3753ccd2b30edb095ceb7806396d68701523fa2/");

  const adminPublicKey = adminWallet.publicKey;
  console.log("admin wallet ", adminPublicKey);

  // Get SOL price
  const solPrice = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  )
    .then((response) => response.json())
    .then((data) => data.solana.usd);

  // Calculate funds to send to each wallet
  // const minAmount = minAmount; // $10
  // const maxAmount = 100; // $100
  console.log("sol Price ", solPrice);
  // const usdebtMintAddress = new PublicKey(tokenAddress); // Ensure this is the correct USDEBT mint address
  // const usdebtAmountToSend = 0.0001; // USDEBT has 6 decimal places

  // const amountToSend = usdebtAmountToSend * Math.pow(10, tokenDecimal);

  for (const wallet of wallets) {
    const recipient = Keypair.fromSecretKey(
      Buffer.from(wallet.secretKey, "base64")
    );
    try {
      //const amount = Math.random() * (maxAmount - minAmount) + minAmount;
      const amount = (Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount);

      const lamports = 1e7//Math.floor(amount / solPrice * 1e9); // Convert SOL to lamports
      console.log(lamports);
      wallet.amount = lamports * 1e-9;
      console.log(adminPublicKey)
      console.log(recipient.publicKey)
      console.log(lamports)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: adminPublicKey,
          toPubkey: recipient.publicKey,
          lamports,
        })
      );

      while (true) {
        try {
          await connection.sendTransaction(transaction, [adminWallet]);
          break;
        } catch (error) {
          console.log("send fund error, retry until success");
          console.log(error);
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
      console.log(
        `Sent $${amount} = ${wallet.amount}SOL to ${wallet.publicKey}`
      );

      // try {
      //   // Get recent blockhash
      //   const { blockhash } = await connection.getRecentBlockhash();

      //   // Create a new transaction
      //   const transaction = new Transaction({
      //     feePayer: adminPublicKey,
      //     recentBlockhash: blockhash,
      //   });
      //   // Build the transaction
      //   transaction.add(
      //     // Transfer instruction
      //     SystemProgram.transfer({
      //       fromPubkey: adminPublicKey,
      //       toPubkey: recipient.publicKey,
      //       lamports,
      //     })
      //   );

      //   // Sign transaction
      //   transaction.recentBlockhash = blockhash;
      //   transaction.sign(adminWallet);

      //   // Send transaction
      //   const signature = await sendAndConfirmTransaction(connection, transaction, [adminWallet]);

      //   console.log('Transaction successful with signature:', signature);
      // } catch (error) {
      //   console.error('Error sending SOL:', error);
      // }

      // const destPublicKey = new PublicKey(wallet.publicKey);
      // // Ensure the admin's USDEBT token account and the recipient's token account exist
      // const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, adminWallet, usdebtMintAddress, adminPublicKey);
      // console.log("fromTokenAccont ", fromTokenAccount.address)
      // const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, adminWallet, usdebtMintAddress, recipient.publicKey);
      // console.log("toTokenAccount ", toTokenAccount.address)

      // // Transfer USDEBT
      // await transfer(connection, adminWallet, fromTokenAccount.address, toTokenAccount.address, adminPublicKey, 500, [adminWallet, recipient]);
      // console.log(`Sent ${usdebtAmountToSend} USDEBT to ${wallet.publicKey}`);

      // Delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error("Failed to send USDEBT:", error);
    }

    // await sleep(5000);
  }
}

async function main() {
  try {
    const wallets = await generateSolanaWallets(walletCount);
    await saveWalletsToFile(wallets);
    // const wallets: WalletType[] = JSON.parse(fs.readFileSync('addresses.json', 'utf-8'));
    console.log(`${walletCount} wallets generated and saved to addresses.json`);
    await sendFundsToWallets(wallets);
  } catch (error) {
    console.error("Error generating Solana wallets:", error);
  }
}

main().then(() => {
  console.log("Finished");
});
