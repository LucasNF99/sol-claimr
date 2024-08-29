import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from  '@solana/spl-token';

export async function getEmptyTokenAccounts(user: PublicKey, connection: Connection, tokenProgram: typeof TOKEN_PROGRAM_ID){
  const response = connection.getTokenAccountsByOwner(user, {programId: tokenProgram}, "finalized");
  const accounts = (await response).value;
  const emptyAccounts: PublicKey[] = [];
  accounts.forEach(a => {
    let amount = a.account.data.readBigInt64LE(64);
    if(!amount){
      emptyAccounts.push(a.pubkey);
    }
  });
  return emptyAccounts;
}