import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

const createSendSolTransaction = async (
  fromWalletPublicKey: string,
  toWalletPublicKey: string,
  data: string,
  lamports: number,
  connection: Connection,
) => {
  const fromWallet = new PublicKey(fromWalletPublicKey);
  const toWallet = new PublicKey(toWalletPublicKey);
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromWallet,
      toPubkey: toWallet,
      lamports,
    }),
  );

  transaction.add(
    new TransactionInstruction({
      keys: [{ pubkey: fromWallet, isSigner: true, isWritable: true }],
      data: Buffer.from(data, 'utf-8'),
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    }),
  );

  transaction.feePayer = fromWallet;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  return transaction;
};

export default createSendSolTransaction;
