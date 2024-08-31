// @ts-nocheck
import { AnchorWallet } from "@solana/wallet-adapter-react"
import { ComputeBudgetProgram, Connection, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { AnchorProvider, setProvider } from "@coral-xyz/anchor"
import { active,mint,smint,getProgram, getProgramS } from "./instructions";
import * as anchor from '@project-serum/anchor';

const info = {
  TOKEN_METADATA_PROGRAM_ID: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
}

export const MintUsingBlink  = async (payerPublicKey: PublicKey, connection: Connection) => {
  

  if (!payerPublicKey || !connection) {
    return { success: false, error: "Public key or connection missing" };
  }

  const dummyWallet = {
      publicKey: payerPublicKey,
      signTransaction: () =>
          Promise.reject(new Error("Dummy wallet can't sign")),
      signAllTransactions: () =>
          Promise.reject(new Error("Dummy wallet can't sign")),
  };


  const provider = new AnchorProvider(
      connection,
      dummyWallet,
      { skipPreflight: true, maxRetries: 0 },
  );

  const program = await getProgramS(provider);

  const [TreasuryKey, bump] = await PublicKey.findProgramAddressSync(
    [Buffer.from("TRESURE_SEED")],
    program.programId
  );


  const [CollectionKey] = await PublicKey.findProgramAddressSync(
    [Buffer.from("collection")],
    program.programId
  );


  const [CmetadataAddress] = await PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), info.TOKEN_METADATA_PROGRAM_ID.toBuffer(), CollectionKey.toBuffer()],
    info.TOKEN_METADATA_PROGRAM_ID
  );
  const [CmasterEdition] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      CollectionKey.toBuffer(),
      Buffer.from("edition")
    ],
    info.TOKEN_METADATA_PROGRAM_ID
  );

  const [MintKey] = await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), payerPublicKey.toBuffer()],
    program.programId
  );

  const [metadataAddress] = await PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), info.TOKEN_METADATA_PROGRAM_ID.toBuffer(), MintKey.toBuffer()],
    info.TOKEN_METADATA_PROGRAM_ID
  );
  const [masterEdition] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      MintKey.toBuffer(),
      Buffer.from("edition")
    ],
    info.TOKEN_METADATA_PROGRAM_ID
  );
  const [delegate] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      CollectionKey.toBuffer(),
      Buffer.from("collection_authority"),
      TreasuryKey.toBuffer()
    ],
    info.TOKEN_METADATA_PROGRAM_ID
  );
  const MintTokenAccount = await getAssociatedTokenAddress(MintKey, payerPublicKey);

  try {
    const tx = new Transaction();
    const mint_ix = await smint(
      { bump },
      {
        payer: payerPublicKey,
        treasure: TreasuryKey,
        mint: MintKey,
        collectionMint: CollectionKey,
        tokenAccount: MintTokenAccount,
        masterEditionAccount: masterEdition,
        collectionMasterEdition: CmasterEdition,
        nftMetadata: metadataAddress,
        collectionMetadata: CmetadataAddress,
        delegate: delegate,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: info.TOKEN_METADATA_PROGRAM_ID,
      },
      provider
    );

    let cump_limit = ComputeBudgetProgram.setComputeUnitLimit({ units: 800_000 });
    tx.add(mint_ix).add(cump_limit);

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = payerPublicKey;
   
    const serializedTx = tx.serialize({requireAllSignatures: false, verifySignatures: false});
    return { success: true, transaction: serializedTx };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

