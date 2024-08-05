import * as fs from "fs";
import { createJupiterApiClient } from "../src/index";
import {
  Connection,
  Keypair,
  VersionedTransaction,
  PublicKey,
} from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import bs58 from "bs58";
import { transactionSenderAndConfirmationWaiter } from "./utils/transactionSender";
import { getSignature } from "./utils/getSignature";
import { getKeypairFromEnvironment } from "@solana-developers/node-helpers";
import WebSocket from "ws";

import {
  connection,
  WalletType,
  tokenAddress,
  minAmount,
  maxAmount,
  tokenDecimal,
  walletCount,
  adminPrivateKey,
  adminWallet,
  ApiKey,
  Chain,
  devMode,
} from "./config";

import { Telegraf } from "telegraf";
const bot = new Telegraf("");
let trading = false;
let startTrade = false;
let loopCnt = 0;
let index = 0;
let sindex = 0;
let volumeMaking = true;

const getTransactions = async (address: any, numTx: any) => {
  const pubKey = new PublicKey(address);
  let transactionList = await connection.getSignaturesForAddress(pubKey, { limit: numTx });
  transactionList.forEach(async (transaction, i) => {
    console.log(`Transaction No: ${i + 1}`);
    console.log(`Signature: ${transaction.signature}`);
    console.log(`Status: ${transaction.confirmationStatus}`);
    console.log(("-").repeat(20));
    var myHeaders = new Headers();
    myHeaders.append("x-api-key", "Z0WX_VJTxRLiw1WK");

    await fetch(`https://api.shyft.to/sol/v1/transaction/parsed?network=mainnet-beta&txn_signature=${transaction.signature}`, {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    })
      .then(response => response.text())
      .then(result => check(result))
      .catch(error => console.log('error', error));
  })
}

const check = async(result: any) => {
  const transactionDetails = JSON.parse(result);
  // Extract value using dot notation
  try {
    const inMint = transactionDetails.result.actions[0].info.swaps[0].in.token_address;
    console.log("Output Mint 1:", inMint);
  
    const inAmount = transactionDetails.result.actions[0].info.swaps[0].in.amount;
    console.log("Output Mint 1:", inAmount);

    const solPrice = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    )
      .then((response) => response.json())
      .then((data) => data.solana.usd);

    if (inMint == "So11111111111111111111111111111111111111112" && inAmount * solPrice >= 100) {
      console.log("buy with more than 100$");
      startTrade = true;
    }
  } catch(err) {
    console.log(err);
  }
}

export async function swap() {
  console.log("swap");
  loopCnt = 0
  index = 0
  sindex = 0
  while (volumeMaking) {

    // if(startTrade == false)
    //   getTransactions(tokenAddress, 10);
    // if (startTrade)
    

    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log(startTrade);
    console.log(loopCnt);
    if (loopCnt < 10) {
      await buy(index, tokenAddress, 0.001);
      index = index + 1;
    }

    if (loopCnt >= 10 && loopCnt < 20) {
      await sell(sindex, tokenAddress, 0.01);
      sindex = sindex + 1;
    }

    loopCnt = loopCnt + 1;
    if (loopCnt >= 30){
      index = 0;
      sindex = 0;
      loopCnt = 0;
    }
    
    // if (loopCnt == 14 ||
    //   loopCnt == 16 ||
    //   loopCnt == 18 ||
    //   loopCnt == 20 ||
    //   loopCnt == 22
    // )
    // if (loopCnt == 1)
    //   sell(tokenAddress, 0.0001);
    //   const wallets: WalletType[] = JSON.parse(
    //     fs.readFileSync("addresses.json", "utf-8")
    //   );
    //   console.log(wallets[index].secretKey);
    //   const jupiterQuoteApi = createJupiterApiClient();
    //   const wallet = new Wallet(
    //     Keypair.fromSecretKey(Buffer.from(wallets[index].secretKey, "base64"))
    //   );
    //   console.log("Wallet:", wallet.publicKey.toBase58());

    //   // Make sure that you are using your own RPC endpoint.
    //   // const connection = new Connection(
    //   //   "https://neat-hidden-sanctuary.solana-mainnet.discover.quiknode.pro/2af5315d336f9ae920028bbb90a73b724dc1bbed/"
    //   // );

    //   // get quote
    //   const quote = await jupiterQuoteApi.quoteGet({
    //     inputMint: "So11111111111111111111111111111111111111112",
    //     outputMint: tokenAddress,
    //     amount: 100,
    //     slippageBps: 50,
    //     onlyDirectRoutes: false,
    //     asLegacyTransaction: false,
    //   });

    //   if (!quote) {
    //     console.error("unable to quote");
    //     continue;
    //   }

    //   // Get serialized transaction
    //   const swapResult = await jupiterQuoteApi.swapPost({
    //     swapRequest: {
    //       quoteResponse: quote,
    //       userPublicKey: wallet.publicKey.toBase58(),
    //       dynamicComputeUnitLimit: true,
    //       prioritizationFeeLamports: "auto",
    //       // prioritizationFeeLamports: {
    //       //   autoMultiplier: 2,
    //       // },
    //     },
    //   });

    //   console.dir(swapResult, { depth: null });

    //   // Serialize the transaction
    //   const swapTransactionBuf = Buffer.from(
    //     swapResult.swapTransaction,
    //     "base64"
    //   );
    //   var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    //   // Sign the transaction
    //   transaction.sign([wallet.payer]);
    //   const signature = getSignature(transaction);

    //   // We first simulate whether the transaction would be successful
    //   const { value: simulatedTransactionResponse } =
    //     await connection.simulateTransaction(transaction, {
    //       replaceRecentBlockhash: true,
    //       commitment: "processed",
    //     });
    //   const { err, logs } = simulatedTransactionResponse;

    //   if (err) {
    //     // Simulation error, we can check the logs for more details
    //     // If you are getting an invalid account error, make sure that you have the input mint account to actually swap from.
    //     console.error("Simulation Error:");
    //     console.error({ err, logs });
    //     continue;
    //   }

    //   const serializedTransaction = Buffer.from(transaction.serialize());
    //   const blockhash = transaction.message.recentBlockhash;

    //   const transactionResponse = await transactionSenderAndConfirmationWaiter({
    //     connection,
    //     serializedTransaction,
    //     blockhashWithExpiryBlockHeight: {
    //       blockhash,
    //       lastValidBlockHeight: swapResult.lastValidBlockHeight,
    //     },
    //   });

    //   // If we are not getting a response back, the transaction has not confirmed.
    //   if (!transactionResponse) {
    //     console.error("Transaction not confirmed");
    //     continue;
    //   }

    //   if (transactionResponse.meta?.err) {
    //     console.error(transactionResponse.meta?.err);
    //   }

    //   console.log(`https://solscan.io/tx/${signature}`);
    //   appendToHistory(wallet.publicKey.toBase58(), signature);
  }
}
function appendToHistory(walletAddress: any, txHash: any) {
  const historyPath = "history.json";
  let history = [];

  try {
    // Try to read the existing history file
    const historyRaw = fs.readFileSync(historyPath, { encoding: "utf8" });
    history = JSON.parse(historyRaw);
  } catch (error) {
    // If there's an error (e.g., file doesn't exist), start with an empty history array
    console.log(
      "No existing history found or error reading file. Starting fresh."
    );
  }

  // Append the new record
  history.push({ walletAddress, txHash });

  // Save the updated history back to the file
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2)); // Pretty print the JSON
}

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

export async function buy(index: any, tokenAddress: any, amount: any) {
  console.log("buy");

  const jupiterQuoteApi = createJupiterApiClient();
  // const wallet = new Wallet(adminWallet);
  const wallets: WalletType[] = JSON.parse(
    fs.readFileSync("addresses.json", "utf-8")
  );
  const wallet = new Wallet(
    Keypair.fromSecretKey(Buffer.from(wallets[index].secretKey, "base64"))
  );
  console.log("Wallet:", wallet.publicKey.toBase58());

  // Make sure that you are using your own RPC endpoint.
  const connection = new Connection(devMode ? "https://api.devnet.solana.com" : "https://crimson-attentive-wildflower.solana-mainnet.quiknode.pro/c3753ccd2b30edb095ceb7806396d68701523fa2/");

  const tokenMintAddress = new PublicKey(tokenAddress);
  const tokenAccountInfo =
    await connection.getParsedAccountInfo(tokenMintAddress);
  const tokenData = tokenAccountInfo.value?.data;
  console.log(tokenData);
  let decimal = 8;
  if (
    typeof tokenData === "object" &&
    tokenData !== null &&
    "parsed" in tokenData &&
    "info" in tokenData.parsed
  ) {
    const parsedData = tokenData.parsed.info;
    decimal = parsedData.decimals;
  } else {
    console.log("Token data is empty or not in the expected format.");
    return;
  }

  const amountBig = 1e6//Math.floor(amount * Math.pow(10, decimal));
  console.log(tokenAddress, amountBig);
  // get quote
  const quote = await jupiterQuoteApi.quoteGet({
    inputMint: "So11111111111111111111111111111111111111112",
    outputMint: tokenAddress,
    amount: amountBig,
    slippageBps: 50,
    onlyDirectRoutes: false,
    asLegacyTransaction: false,
  });

  if (!quote) {
    // ctx.reply("Error occured: unable to quote");
    return;
  }

  // Get serialized transaction
  const swapResult = await jupiterQuoteApi.swapPost({
    swapRequest: {
      quoteResponse: quote,
      userPublicKey: wallet.publicKey.toBase58(),
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
      // prioritizationFeeLamports: {
      //   autoMultiplier: 2,
      // },
    },
  });

  console.dir(swapResult, { depth: null });

  // Serialize the transaction
  const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, "base64");
  var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

  // Sign the transaction
  transaction.sign([wallet.payer]);
  const signature = getSignature(transaction);

  // We first simulate whether the transaction would be successful
  const { value: simulatedTransactionResponse } =
    await connection.simulateTransaction(transaction, {
      replaceRecentBlockhash: true,
      commitment: "processed",
    });
  const { err, logs } = simulatedTransactionResponse;

  if (err) {
    // Simulation error, we can check the logs for more details
    // If you are getting an invalid account error, make sure that you have the input mint account to actually swap from.
    // ctx.reply("Simulation Error:");
    console.error({ err, logs });
    return;
  }

  const serializedTransaction = Buffer.from(transaction.serialize());
  const blockhash = transaction.message.recentBlockhash;

  const transactionResponse = await transactionSenderAndConfirmationWaiter({
    connection,
    serializedTransaction,
    blockhashWithExpiryBlockHeight: {
      blockhash,
      lastValidBlockHeight: swapResult.lastValidBlockHeight,
    },
  });

  // If we are not getting a response back, the transaction has not confirmed.
  if (!transactionResponse) {
    // ctx.reply("Transaction not confirmed");
    return;
  }

  if (transactionResponse.meta?.err) {
    console.error(transactionResponse.meta?.err);
  }

  // ctx.reply(
  //   `Buy completed.\nYou can check here : https://solscan.io/tx/${signature}`
  // );
  // appendToHistory(wallet.publicKey.toBase58(), signature);
}

export async function sell(index: any, tokenAddress: any, amount: any) {
  console.log("sell");
  const jupiterQuoteApi = createJupiterApiClient();
  // const wallet = new Wallet(adminWallet);
  const wallets: WalletType[] = JSON.parse(
    fs.readFileSync("addresses.json", "utf-8")
  );
  const wallet = new Wallet(
    Keypair.fromSecretKey(Buffer.from(wallets[index].secretKey, "base64"))
  );
  // console.log("Wallet:", wallet.publicKey.toBase58());

  // Make sure that you are using your own RPC endpoint.
  const connection = new Connection(devMode ? "https://api.devnet.solana.com" : "https://crimson-attentive-wildflower.solana-mainnet.quiknode.pro/c3753ccd2b30edb095ceb7806396d68701523fa2/");
  const tokenMintAddress = new PublicKey(tokenAddress);
  const tokenAccountInfo =
    await connection.getParsedAccountInfo(tokenMintAddress);
  const tokenData = tokenAccountInfo.value?.data;
  console.log(tokenData);
  let decimal = 8;
  if (
    typeof tokenData === "object" &&
    tokenData !== null &&
    "parsed" in tokenData &&
    "info" in tokenData.parsed
  ) {
    const parsedData = tokenData.parsed.info;
    decimal = parsedData.decimals;
  } else {
    console.log("Token data is empty or not in the expected format.");
    return;
  }

  const balance = await getSPLTokenBalance(connection, wallet.publicKey.toBase58(), tokenAddress)
  console.log(balance)
  if (balance == 0)
      return

  const amountBig = Math.floor(amount * Math.pow(10, decimal));
  const quote = await jupiterQuoteApi.quoteGet({
    inputMint: tokenAddress,
    outputMint: "So11111111111111111111111111111111111111112",
    amount: balance,
    // slippageBps: 50,
    onlyDirectRoutes: false,
    asLegacyTransaction: false,
  });

  if (!quote) {
    // ctx.reply("Error occured: unable to quote");
    return;
  }

  // Get serialized transaction
  const swapResult = await jupiterQuoteApi.swapPost({
    swapRequest: {
      quoteResponse: quote,
      userPublicKey: wallet.publicKey.toBase58(),
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
      // prioritizationFeeLamports: {
      //   autoMultiplier: 2,
      // },
    },
  });

  console.dir(swapResult, { depth: null });

  // Serialize the transaction
  const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, "base64");
  var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

  // Sign the transaction
  transaction.sign([wallet.payer]);
  const signature = getSignature(transaction);

  // We first simulate whether the transaction would be successful
  const { value: simulatedTransactionResponse } =
    await connection.simulateTransaction(transaction, {
      replaceRecentBlockhash: true,
      commitment: "processed",
    });
  const { err, logs } = simulatedTransactionResponse;

  if (err) {
    // Simulation error, we can check the logs for more details
    // If you are getting an invalid account error, make sure that you have the input mint account to actually swap from.
    // ctx.reply("Simulation Error:");
    console.error({ err, logs });
    return;
  }

  const serializedTransaction = Buffer.from(transaction.serialize());
  const blockhash = transaction.message.recentBlockhash;

  const transactionResponse = await transactionSenderAndConfirmationWaiter({
    connection,
    serializedTransaction,
    blockhashWithExpiryBlockHeight: {
      blockhash,
      lastValidBlockHeight: swapResult.lastValidBlockHeight,
    },
  });

  // If we are not getting a response back, the transaction has not confirmed.
  if (!transactionResponse) {
    // ctx.reply("Transaction not confirmed");
    return;
  }

  if (transactionResponse.meta?.err) {
    console.error(transactionResponse.meta?.err);
  }

  // ctx.reply(
  //   `Sell completed.\nYou can check here : https://solscan.io/tx/${signature}`
  // );
  // appendToHistory(wallet.publicKey.toBase58(), signature);
}

async function getSPLTokenBalance(connection: any, walletAddress: string, tokenAddress: string): Promise<number> {
  // Connection to the Solana RPC server

  try {
      // The public key for the wallet you're checking
      const walletPublicKey = new PublicKey(walletAddress);

      // SPL token mint address on Solana Mainnet Beta
      const splTokenAddress = new PublicKey(tokenAddress); // Replace with actual USDEBT mint address

      // Get the associated token accounts for the wallet
      const tokenAccounts = await connection.getTokenAccountsByOwner(walletPublicKey, {
          mint: splTokenAddress
      });

      if (tokenAccounts.value.length === 0) {
          console.log("No Token account found for this wallet.");
          return 0;
      }

      // Assuming the first account is the USDEBT account (might have multiple token accounts)
      const splAccountInfo = await connection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);

      console.log(`Token Balance: ${splAccountInfo.value.amount}`);
      return Number(splAccountInfo.value.amount);
  } catch (error) {
      console.error("Failed to fetch balance", error);
      return 0;
  }
}

bot.start(async (ctx) => {
  if (trading == false) {
    ctx.reply("Welcome to your Telegram bot!");
  } else {
    ctx.reply("Bot is operating");
  }
});

bot.command("VolumeStart", async (ctx) => {
  ctx.reply("VolumeMaking is started.");
  swap();
});

bot.command("VolumeStop", async (ctx) => {
  ctx.reply("Please wait. VolumeMaking is stopping.");
  volumeMaking = false
});

bot.launch();
