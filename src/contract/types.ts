import { PublicKey } from "@solana/web3.js";
import BN from "bn.js"; 

export type SimpleMintNFTArgs = {
  bump:number
  id:BN,
}

export interface MintSimpleNFTAccount {
  payer: PublicKey,
  admin: PublicKey,
  treasure: PublicKey,
  mint: PublicKey,
  collectionMint: PublicKey,
  tokenAccount: PublicKey,
  masterEditionAccount: PublicKey,
  collectionMasterEdition: PublicKey,
  nftMetadata: PublicKey,
  collectionMetadata: PublicKey,
  delegate: PublicKey,
  associatedTokenProgram: PublicKey,
  rent: PublicKey,
  systemProgram: PublicKey,
  tokenProgram: PublicKey,
  metadataProgram: PublicKey
}

