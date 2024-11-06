import check from '@/assets/check.svg';
import close from '@/assets/close.svg';
import logo from '@/assets/logo.svg';
import sol from '@/assets/sol.svg';
import { PhantomProvider } from '@/types';
import { shortenAddress } from '@/utils/common';
import createSendSolTransaction from '@/utils/createSendSolTransaction';
import getProvider from '@/utils/getProvider';
import pollSignatureStatus from '@/utils/pollSignatureStatus';
import signAndSendTransaction from '@/utils/signAndSendTransaction';
import { useSearchParams } from '@@/exports';
import { Button } from '@headlessui/react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

const NETWORK = ''
const connection = new Connection(NETWORK);
const provider = getProvider();

const amountMap = {
  '1': 0.006,
  '5': 0.03,
  '15': 0.054
};

const targetAddress = "DBRfqy5nvEJffFgDVX1s7NaLVFrRyaWw3L4wF8EXMvQV"

export default function HomePage() {
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const userId = searchParams.get('userId');
  const count = searchParams.get('count');

  const [balance, setBalance] = useState<number>(0);
  const [isConnectedWallet, setIsConnectedWallet] = useState(false)
  const [isSubmittedTransaction, setIsSubmittedTransaction] = useState(false);

  const [isUserCancelled, setIsUserCancelled] = useState(false);

  const payAmount = useMemo(() => {
    if (!count) return null;

    if (typeof amountMap[count] === 'number') {
      return amountMap[count] as number;
    }

    return null;
  }, [count]);

  const isSufficientBalance = useMemo(() => {
    if (!payAmount || !isConnectedWallet) return true;

    return balance >= (payAmount * 1e9);
  }, [payAmount, balance, isConnectedWallet]);

  const sendSol = async (provider: PhantomProvider, publicKey: PublicKey, payAmount: number, orderId: string, userId: string, count: number) => {
    const transaction =  await createSendSolTransaction(
      publicKey.toBase58(),
      targetAddress,
      JSON.stringify({ orderId, userId, count }),
      payAmount * 1e9,
      connection,
    );
    const signature = await signAndSendTransaction(provider, transaction);
    await pollSignatureStatus(signature, connection);
  }

  useEffect(() => {
    if (!provider) return;

    provider.on('connect', async (publicKey: PublicKey) => {
      const x = await (connection as any).getBalance(publicKey);
      setIsConnectedWallet(true)
      setBalance(x as number);
    });

    provider.on('disconnect', () => {
      setIsConnectedWallet(false)
    });

    provider.on('accountChanged', (publicKey: PublicKey | null) => {
      if (!publicKey) {
        setIsConnectingWallet(true)
        provider.connect().catch((error: any) => {
          console.error(error);
          setIsConnectedWallet(false)
        }).finally(() => {
          setIsConnectingWallet(false)
        });
      } else {
        setIsConnectedWallet(false)
      }
    });

    return () => {
      provider.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!provider) return;

    setIsConnectingWallet(true);
    provider.connect().catch(() => {
        setIsUserCancelled(true);
        setIsConnectedWallet(false)
      })
      .finally(() => {
        setIsConnectingWallet(false);
      });
  }, []);

  useEffect(() => {
    console.log(isConnectedWallet, isSufficientBalance, provider, provider.publicKey, payAmount,  orderId,  userId, count)
    if (isConnectedWallet && isSufficientBalance && provider && provider.publicKey && payAmount && orderId && userId && count) {
      setIsSubmittingTransaction(true);
      sendSol(provider, provider.publicKey, payAmount, orderId, userId, Number(count)).then(() => {
        setIsSubmittedTransaction(true)
      }).catch((error) => {
        console.error(error);
        setIsSubmittingTransaction(false);
        setIsUserCancelled(true);
        }).finally(() => {
          setIsSubmittingTransaction(false)
      })
    }
  }, [isConnectedWallet, isSufficientBalance, payAmount, orderId, userId, count]);

  return (
    <div className="w-full h-full flex flex-col p-4 bg-background gap-4">
      <img className="w-full" src={logo} alt="" />
      <div className="flex flex-col flex-grow gap-4">
        <div className="flex h-14 gap-4 text-[16px]">
          <span className="flex items-center gap-2 w-[138px] h-15 bg-white pl-4 rounded-[16px]">
            <img className="w-6 h-6" src={sol} alt="sol" />
            <span>Solana</span>
          </span>
          <span className="h-15 bg-white flex-grow flex justify-center items-center rounded-[16px] px-4 py-2">
            {provider?.publicKey ? shortenAddress(provider?.publicKey.toBase58()) : '-'}
          </span>
        </div>
        <div className="w-full h-[130px] bg-white flex flex-col px-4 py-3 gap-2 rounded-[16px] ">
          <span className="font-bold">Business Type</span>
          <span className="text-gray">
            SideFans Gacha token purchase {payAmount ? `- ${payAmount} SOL` : '-'}
          </span>
        </div>
      </div>
      <footer className="flex flex-col w-full h-[176px] px-4 py-6 gap-2">
        {isUserCancelled && (
          <Button className="h-[60px] text-[20px] font-semibold rounded-[16px] flex items-center justify-center bg-transparent text-red border-[1px] border-red border-solid gap-2">
            <img src={check} />
            User rejected the request
          </Button>
        )}
        {isConnectingWallet && (
          <Button className="h-[60px] text-[20px] font-semibold rounded-[16px] flex items-center justify-center bg-gray_light text-gray">
            Connecting...
          </Button>
        )}
        {!isSufficientBalance && (
          <Button className="h-[60px] text-[20px] font-semibold rounded-[16px] flex items-center justify-center bg-transparent text-red border-[1px] border-red border-solid gap-2">
            <img src={close} alt="close" />
            Insufficient $SOL
          </Button>
        )}
        {isSubmittingTransaction && (
          <Button className="h-[60px] text-[20px] font-semibold rounded-[16px] flex items-center justify-center bg-gray_light text-gray">
            Pending...
          </Button>
        )}
        {isSubmittedTransaction && (
          <Button
            style={{
              background:
                'linear-gradient(109deg, #FFA244 14.81%, #FB2A7E 94.2%)',
            }}
            className="h-[60px] text-[20px] font-semibold rounded-[16px] flex items-center justify-center text-white"
          >
            Transaction submitted
          </Button>
        )}
        <a className="flex justify-center h-[60px] items-center text-[20px] text-orange font-semibold" href={process.env.TG_URL}>
          Back To SideFans
        </a>
      </footer>
    </div>
  );
}
