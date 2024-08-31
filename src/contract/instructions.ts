import { TransactionInstruction,PublicKey } from "@solana/web3.js";

import { type Provider ,Program ,Idl} from '@coral-xyz/anchor';
import * as instructions from "./types";
import { SimpleMintIdl,type SimpleMint } from '../program';


const programIdS = new PublicKey('4jNNoXXRZA8ctduQWkea3TPxN2TLYCfJNxyjEPs5Bu7W');

export const getProgramS = (provider: Provider) => new Program(
    SimpleMintIdl as Idl,
    programIdS,
    provider,
) as unknown as Program<SimpleMint>;

export async function smint(
    args: instructions.SimpleMintNFTArgs,
    accounts: instructions.MintSimpleNFTAccount,
    provider: Provider
): Promise<TransactionInstruction> {
    const simpleProgram = getProgramS(provider);
    const ix = await simpleProgram.methods.mint(
        args.bump
    ).accountsStrict({
            payer: accounts.payer,
            treasure: accounts.treasure,
            mint: accounts.mint,
            collectionMint: accounts.collectionMint,
            tokenAccount: accounts.tokenAccount,
            masterEditionAccount: accounts.masterEditionAccount,
            collectionMasterEdition: accounts.collectionMasterEdition,
            nftMetadata: accounts.nftMetadata,
            collectionMetadata: accounts.collectionMetadata,
            delegate: accounts.delegate,
            associatedTokenProgram: accounts.associatedTokenProgram,
            rent: accounts.rent,
            systemProgram: accounts.systemProgram,
            tokenProgram: accounts.tokenProgram,
            metadataProgram: accounts.metadataProgram,
        }).instruction();
    return ix;
}