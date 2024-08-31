import { MintUsingBlink } from "@/contract/transaction";
import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS } from "@solana/actions";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";


export async function GET(req: Request) {
    const requestUrl = new URL(req.url);
  const iconURL = new URL("/participation.png", requestUrl.origin);
  const response: ActionGetResponse = {
    icon: iconURL.toString(),
    description: 'Holders will share a fee',
    title: 'Mint participation NFT',
    label: 'Mint participation',
  }
  
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  
 const connection = new Connection(clusterApiUrl('devnet'));
  const requestBody: ActionPostRequest = await request.json();
  const userPubkey = new PublicKey(requestBody.account);

  try {
    const mintResult = await MintUsingBlink(userPubkey, connection);

    if (mintResult.success && mintResult.transaction) {
      console.log("################################# POST INIT #################################");
      const response: ActionPostResponse = {
        transaction: mintResult.transaction.toString('base64'), 
        message: "Minted!"
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
