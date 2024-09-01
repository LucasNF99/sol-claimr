import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  InlineNextActionLink,
  PostNextActionLink,
} from "@solana/actions";
import {
  PublicKey,
  Connection,
  clusterApiUrl,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { getEmptyTokenAccounts } from "./helpers";
import { createCloseAccountInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BlinksightsClient } from "blinksights-sdk";
import { MintUsingBlink } from "@/contract/transaction";

const BLINKSIGHTS_API = `${process.env.NEXT_PUBLIC_BLINKSIGHTS}`;
let firstCall = 0;
const client = new BlinksightsClient(BLINKSIGHTS_API);

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const iconURL = new URL("/claimer.png", requestUrl.origin);

  const response: ActionGetResponse = {
    icon: iconURL.toString(),
    description: "Close Token Accounts to get back your SOL",
    title: "SOLClaimr",
    label: "",
    links: {
      actions: [
        {
          href: req.url,
          label: "Check open accounts",
        },
      ],
    },
  };

  client.trackRenderV1(requestUrl.toString(), response);
  firstCall = 0;
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: ACTIONS_CORS_HEADERS,
  });
}

export async function POST(req: Request) {
  console.log(firstCall);

  const currentUrl = new URL(req.url);
  const baseUrl = `${currentUrl.origin}`;
  const requestBody: ActionPostRequest = await req.json();
  const userPublicKey = requestBody.account;
  const user = new PublicKey(userPublicKey);
  const connection = new Connection(clusterApiUrl("mainnet-beta"));
  console.log({connection})

  let emptyTAs = await getEmptyTokenAccounts(user, connection, TOKEN_PROGRAM_ID);
  if (!Array.isArray(emptyTAs)) {
    throw new Error("Failed to retrieve empty token accounts.");
  }

  if (firstCall === 0) {
    if(emptyTAs.length === 0){
      const fakeTx = new Transaction();
      fakeTx.feePayer = user;
      const bh = (await connection.getLatestBlockhash({ commitment: "finalized" })).blockhash;
      fakeTx.recentBlockhash = bh;

      const serializedFakeTX = fakeTx
        .serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
        .toString("base64");

      const nextActionError: PostNextActionLink = {
        type: "post",
        href: `${baseUrl}/api/noaccounts`,
      };

      const response0: ActionPostResponse = {
        transaction: serializedFakeTX,
        message: "No token accounts to close.",
        links: {
          next: nextActionError,
        },
      };

      firstCall++;
      client.trackActionV2(userPublicKey, currentUrl.toString());
      return Response.json(response0, { headers: ACTIONS_CORS_HEADERS });
    } else {
      const fakeTx = new Transaction();
      fakeTx.feePayer = user;
      const bh = (await connection.getLatestBlockhash({ commitment: "finalized" })).blockhash;
      fakeTx.recentBlockhash = bh;

      const serializedFakeTX = fakeTx
        .serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
        .toString("base64");

      const lamportsPerAccount = 2039280;
      const totalLamports = lamportsPerAccount * emptyTAs.length;
      const totalSOL = totalLamports / 1e9;
      const dynamicIconURL = `${baseUrl}/api/icon?count=${emptyTAs.length}&solClaim=${totalSOL}`;
      const nextInlineAction: InlineNextActionLink = {
        type: "inline",
        action: {
          icon: dynamicIconURL,
          description: `Close Token Accounts to get back your SOL`,
          label: `Claim my SOL`,
          title: `SOLClaimr`,
          type: "action",
        },
      };
      const response1: ActionPostResponse = {
        transaction: serializedFakeTX,
        message: "Accounts found to close.",
        links: {
          next: nextInlineAction,
        },
      };
       firstCall++;
       client.trackActionV2(userPublicKey, currentUrl.toString());
      return Response.json(response1, { headers: ACTIONS_CORS_HEADERS });
    }
  } else if (firstCall === 1) {
      const tx = new Transaction();
      const ixs = emptyTAs.map((pks) =>
        createCloseAccountInstruction(pks, user, user, undefined, TOKEN_PROGRAM_ID)
      );
      tx.add(...ixs);

      const lamportsPerAccount = 2039280;
      const totalLamports = lamportsPerAccount * emptyTAs.length;
      const ninePercentLamports = Math.floor(totalLamports * 0.09);
      const claimerWallet = new PublicKey("9AQjMebtWCRGrHi8oyYYXLByFF643KPXxTgX1j9qtnnG");

      const sendToMyWalletInstruction = SystemProgram.transfer({
        fromPubkey: user,
        lamports: ninePercentLamports,
        toPubkey: claimerWallet,
      });

      tx.add(sendToMyWalletInstruction);

      tx.feePayer = user;
      const bh = (await connection.getLatestBlockhash({ commitment: "finalized" })).blockhash;
      tx.recentBlockhash = bh;

      const serializedTX = tx
        .serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
        .toString("base64");

      const nextInlineActionMint: InlineNextActionLink = {
        action: {
          title: 'Mint participation NFT',
          icon: 'w',
          label: 'Mint participation',
          description: 'Holders will share a fee',
          type: 'action'
        },
        type: "inline"
      }
      const response2: ActionPostResponse = {
        transaction: serializedTX,
        message: "Closing " + emptyTAs.length + " token accounts!",
      };

      client.trackActionV2(userPublicKey, currentUrl.toString());
      firstCall++;
      return Response.json(response2, { headers: ACTIONS_CORS_HEADERS });
  } else if (firstCall === 2) {
    const mintResult = await MintUsingBlink(user, connection);
      if (mintResult.success && mintResult.transaction) {
      const response: ActionPostResponse = {
        transaction: mintResult.transaction.toString('base64'), 
        message: "Minted!",
       
      };
      client.trackActionV2(userPublicKey, currentUrl.toString());
      return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
    }
  }
  client.trackActionV2(userPublicKey, currentUrl.toString());
  return Response.json({ message: "Invalid operation." }, { headers: ACTIONS_CORS_HEADERS });

}

export async function OPTIONS(request: Request) {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}
