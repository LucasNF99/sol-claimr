import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS, PostNextActionLink } from "@solana/actions";
import { PublicKey, Connection, clusterApiUrl, Transaction } from "@solana/web3.js";
import { createCloseAccountInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getEmptyTokenAccounts } from "../action/helpers";

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const iconURL = new URL("/claimer.png", requestUrl.origin);
  const openedAccounts = requestUrl.searchParams.get('openedAcc');

  const response: ActionGetResponse = {
    icon: iconURL.toString(),
    description: 'Close accounts',
    title: `You have ${openedAccounts} opened accounts`,
    label: '',
    links: {
      actions: [
        {
          href: req.url,
          label: `You have ${openedAccounts} opened accounts`
        },
      ]
    },
  }
  
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const requestBody: ActionPostRequest = await request.json();
  const userPublicKey = requestBody.account;

  const user = new PublicKey(userPublicKey);
  const connection = new Connection(clusterApiUrl('devnet'));
  const tx = new Transaction();

  let emptyTAs = await getEmptyTokenAccounts(user, connection, TOKEN_PROGRAM_ID);

  if (emptyTAs.length === 0) {
    let userAccounts = 'You have 0 open accounts!';
    return GET(request);
  }

  if (emptyTAs.length > 20) {
    console.log("User has more than 20 empty accounts!");
    emptyTAs = emptyTAs.slice(0, 21);
  }



  const ixs = emptyTAs.map(pks => createCloseAccountInstruction(pks, user, user, undefined, TOKEN_PROGRAM_ID));
  tx.add(...ixs);

  tx.feePayer = user;
  const bh = (await connection.getLatestBlockhash({commitment: 'finalized'})).blockhash;
  tx.recentBlockhash = bh;

  const serializedTX = tx.serialize({
    requireAllSignatures: false,
    verifySignatures: false
  }).toString('base64');

    const nextAction: PostNextActionLink = {
    type: "post",
    href: "/api/noaccounts"
  };

  const response: ActionPostResponse = {
    transaction: serializedTX,
    message: "Closing " + emptyTAs.length + " token accounts!",
    links: {
      next: nextAction
    }
  };
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS(request: Request) {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}
