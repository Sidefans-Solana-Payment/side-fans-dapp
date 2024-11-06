import { Connection } from '@solana/web3.js';

const POLLING_INTERVAL = 1000; // one second
const MAX_POLLS = 30;

/**
 * Polls for transaction signature statuses
 * @param   {String}     signature  a transaction signature
 * @param   {Connection} connection an RPC connection
 * @param   {Function}   createLog  a function to create log
 * @returns
 */
const pollSignatureStatus = async (
  signature: string,
  connection: Connection,
): Promise<void> => {
  let count = 0;

  const interval = setInterval(async () => {
    // Failed to confirm transaction in time
    if (count === MAX_POLLS) {
      clearInterval(interval);
      return;
    }

    const { value } = await connection.getSignatureStatus(signature);
    const confirmationStatus = value?.confirmationStatus;

    if (confirmationStatus) {
      const hasReachedSufficientCommitment = confirmationStatus === 'confirmed' || confirmationStatus === 'finalized';

      if (hasReachedSufficientCommitment) {
        clearInterval(interval);
        return;
      }
    }

    count++;
  }, POLLING_INTERVAL);
};

export default pollSignatureStatus;
