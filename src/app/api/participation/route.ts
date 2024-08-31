import { MintUsingBlink } from "@/contract/transaction";
import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS, InlineNextActionLink } from "@solana/actions";
import { PublicKey, Connection, clusterApiUrl, Transaction } from "@solana/web3.js";
var firstCall = 0;
export async function GET(req: Request) {
    const requestUrl = new URL(req.url);
  const iconURL = new URL("/participation.png", requestUrl.origin);
  const response: ActionGetResponse = {
    icon: '',
    description: 'Holders will share a fee',
    title: 'Mint participation NFT',
    label: 'Mint participation',
  }
  
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(req: Request) {
  
 const connection = new Connection(clusterApiUrl('devnet'));
  const requestBody: ActionPostRequest = await req.json();
      const requestUrl = new URL(req.url);

  const userPubkey = new PublicKey(requestBody.account);
  const iconURL = new URL("/participation.png", requestUrl.origin);

  if (firstCall == 0) {
  const fakeTx = new Transaction();
  fakeTx.feePayer = userPubkey;
  const bh = (await connection.getLatestBlockhash({commitment: 'finalized'})).blockhash;
  fakeTx.recentBlockhash = bh;


  const serializedFakeTX = fakeTx.serialize({
    requireAllSignatures: false,
    verifySignatures: false
  }).toString('base64');

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

    const response1: ActionPostResponse = {
      transaction: serializedFakeTX,
      message: "",
       links: {
          next: nextInlineActionMint
        }
    };
    firstCall++;
    return Response.json(response1, { headers: ACTIONS_CORS_HEADERS });
  }

  try {
    const mintResult = await MintUsingBlink(userPubkey, connection);

    if (mintResult.success && mintResult.transaction) {
      console.log("################################# POST INIT #################################");
      const response: ActionPostResponse = {
        transaction: mintResult.transaction.toString('base64'), 
        message: "Minted!",
       
      };
      return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
    } else {
      console.log(mintResult)
      return new Response(JSON.stringify({ error: "Failed to mint NFT1" }), { status: 500, headers: ACTIONS_CORS_HEADERS });
    }
  } catch (error) {
    console.error("Error minting NFT:", error);
    return new Response(JSON.stringify({ error: "Failed to mint NFT2" }), { status: 500, headers: ACTIONS_CORS_HEADERS });
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}
