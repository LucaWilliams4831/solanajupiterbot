  import {
    Connection,
    Keypair,
  } from '@solana/web3.js';
  import bs58 from "bs58";
  export const devMode = false;
  export const adminPrivateKey = ''
  export const adminWallet =  Keypair.fromSecretKey(bs58.decode(adminPrivateKey));
  export const connection = new Connection(!devMode? 'https://crimson-attentive-wildflower.solana-mainnet.quiknode.pro/c3753ccd2b30edb095ceb7806396d68701523fa2/' : 'https://solana-devnet.g.alchemy.com/v2/6Y0EFRTX1kn0CH2cLDm-qsW5oGlQv5S7', 'confirmed');
  export const walletCount = 10; //new wallet count
  export const tokenAddress = devMode ? '6nNmjAAsR57NbRZeWnRaYhoKj2Uyn4yLQaKyyLTJGYrx' : 'HSUCkxv8XCbPSXuVYxai21eSgM1k6WV5nnS8tqyXgWcc';
  export const tokenDecimal = devMode? 9 : 8;
  export const minAmount = 2;
  export const maxAmount = 10;
  export const minTime  = 6; //10min7/10
  export const maxTime  = 36  //1hr/100
  export const buyWeight  = 0.8
  export interface WalletType {
    publicKey: string;
    secretKey: string;
    amount: Number;
    usdebt: Number;
  }
  export const ApiKey = '3e27d04db0d4418bbac06869cc39634f';
  export const Chain = 'solana';
  

  
