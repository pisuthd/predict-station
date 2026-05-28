import { useState, useEffect, useCallback } from 'react';
import { SuiGrpcClient } from '@mysten/sui/grpc';

type Network = 'mainnet' | 'testnet';

interface TokenBalance {
  sui: string;
  wal: string;
}

interface UseTokenBalancesReturn {
  balances: TokenBalance;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const COIN_TYPES = {
  SUI: '0x2::sui::SUI',
  WAL: {
    mainnet: '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL',
    testnet: '0x8190b041122eb492bf63cb464476bd68c6b7e570a4079645a8b28732b6197a82::wal::WAL',
  },
};

const NETWORK_URLS = {
  mainnet: 'https://fullnode.mainnet.sui.io:443',
  testnet: 'https://fullnode.testnet.sui.io:443',
};

function formatBalance(bigintStr: string, decimals: number = 9): string {
  const num = BigInt(bigintStr);
  const divisor = BigInt(10 ** decimals);
  const wholePart = num / divisor;
  const fractionalPart = num % divisor;
  
  if (wholePart === BigInt(0) && fractionalPart === BigInt(0)) {
    return '0';
  }
  
  // Format with appropriate decimal places (max 4)
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.slice(0, 4).replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return wholePart.toString();
  }
  
  return `${wholePart}.${trimmedFractional}`;
}

export function useTokenBalances(
  address: string | null,
  network: Network
): UseTokenBalancesReturn {
  const [balances, setBalances] = useState<TokenBalance>({ sui: '0', wal: '0' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address) {
      setBalances({ sui: '0', wal: '0' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = new SuiGrpcClient({
        network,
        baseUrl: NETWORK_URLS[network],
      });

      // Fetch SUI balance
      const suiResponse = await client.getBalance({
        owner: address,
        coinType: COIN_TYPES.SUI,
      });

      // Fetch WAL balance
      const walCoinType = COIN_TYPES.WAL[network];
      const walResponse = await client.getBalance({
        owner: address,
        coinType: walCoinType,
      });

      setBalances({
        sui: formatBalance(suiResponse.balance.balance.toString()),
        wal: formatBalance(walResponse.balance.balance.toString()),
      });
    } catch (err) {
      console.error('Failed to fetch balances:', err);
      setError('Failed to fetch balances');
      setBalances({ sui: '0', wal: '0' });
    } finally {
      setIsLoading(false);
    }
  }, [address, network]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Auto-refresh every 30 seconds
  // useEffect(() => {
  //   if (!address) return;

  //   const interval = setInterval(fetchBalances, 30000);
  //   return () => clearInterval(interval);
  // }, [fetchBalances, address]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances,
  };
}