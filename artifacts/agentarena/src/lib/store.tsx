import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Board, Tile, User, Activity, WalletState } from './types';
import { generateId, calculatePayout } from './utils';
import { toast } from 'sonner';
import {
  connectSolanaWallet,
  disconnectSolanaWallet,
  generateSimulatedPubkey,
  WalletProviderId,
} from './solana';

const INITIAL_BOARDS: Board[] = [
  { id: 'b1', name: 'The Pit', size: 10, basePrice: 1e8, growthFactor: 1.2, cutPercentage: 0.5, totalVolume: 0 },
  { id: 'b2', name: 'High Roller', size: 5, basePrice: 1e9, growthFactor: 1.5, cutPercentage: 0.8, totalVolume: 0 },
  { id: 'b3', name: 'Degens Only', size: 20, basePrice: 1e7, growthFactor: 1.05, cutPercentage: 0.2, totalVolume: 0 },
];

const MOCK_USERS: User[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `mock-${i}-${generateId()}`,
  name: `Anon ${Math.floor(Math.random() * 9000) + 1000}`,
  balance: 100 * 1e9,
  avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${i}`,
}));

function initTiles(boards: Board[]): Tile[] {
  const tiles: Tile[] = [];
  boards.forEach(b => {
    for (let y = 0; y < b.size; y++) {
      for (let x = 0; x < b.size; x++) {
        tiles.push({
          id: `${b.id}-${x}-${y}`,
          boardId: b.id,
          x,
          y,
          ownerId: null,
          price: b.basePrice,
          purchaseCount: 0,
        });
      }
    }
  });
  return tiles;
}

const EMPTY_WALLET: WalletState = {
  connected: false,
  pubkey: null,
  balance: 0,
  provider: null,
  isReal: false,
};

// Discriminated union so real connections can't accidentally pass provider: null
type ConnectSimulated = { kind: 'simulated' };
type ConnectReal = { kind: 'real'; provider: WalletProviderId };
type ConnectArgs = ConnectSimulated | ConnectReal;

type GameContextType = {
  wallet: WalletState;
  connectWallet: (provider: WalletState['provider'], isReal: boolean) => Promise<void>;
  disconnectWallet: () => void;
  boards: Board[];
  tiles: Tile[];
  activity: Activity[];
  buyTile: (tileId: string) => void;
  users: User[];
};

const GameContext = createContext<GameContextType | null>(null);

const STARTING_BALANCE = 50 * 1e9; // 50 simulated SOL in lamports

function addUserIfMissing(
  prev: User[],
  pubkey: string,
  balance: number,
  seed?: string
): User[] {
  if (prev.find(u => u.id === pubkey)) return prev;
  return [
    ...prev,
    {
      id: pubkey,
      name: 'You',
      balance,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed ?? 'you'}`,
    },
  ];
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(EMPTY_WALLET);

  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  // Refs so processPurchase always reads fresh state without stale closures
  const boardsRef = useRef<Board[]>(INITIAL_BOARDS);
  const walletRef = useRef<WalletState>(EMPTY_WALLET);
  useEffect(() => { boardsRef.current = boards; }, [boards]);
  useEffect(() => { walletRef.current = wallet; }, [wallet]);

  // Initialize from local storage or defaults
  useEffect(() => {
    let initialWallet: WalletState = EMPTY_WALLET;
    try {
      const savedWallet = localStorage.getItem('agentarena_wallet');
      if (savedWallet) {
        const parsed = JSON.parse(savedWallet) as WalletState;
        // Don't restore real wallet connections on page load — user must reconnect explicitly
        if (parsed.connected && !parsed.isReal) {
          initialWallet = parsed;
          setWallet(initialWallet);
        }
      }
    } catch {
      // fallback to empty wallet
    }

    if (initialWallet.connected && initialWallet.pubkey) {
      setUsers(prev => addUserIfMissing(prev, initialWallet.pubkey!, initialWallet.balance));
    }

    try {
      const savedTiles = localStorage.getItem('agentarena_tiles');
      setTiles(savedTiles ? JSON.parse(savedTiles) : initTiles(INITIAL_BOARDS));
    } catch {
      setTiles(initTiles(INITIAL_BOARDS));
    }

    try {
      const savedBoards = localStorage.getItem('agentarena_boards');
      if (savedBoards) setBoards(JSON.parse(savedBoards));
    } catch { /* fallback */ }

    try {
      const savedActivity = localStorage.getItem('agentarena_activity');
      if (savedActivity) setActivity(JSON.parse(savedActivity));
    } catch { /* fallback */ }
  }, []);

  // Persist to local storage on change (only for simulated wallets)
  useEffect(() => {
    if (tiles.length === 0) return;
    localStorage.setItem('agentarena_tiles', JSON.stringify(tiles));
    localStorage.setItem('agentarena_boards', JSON.stringify(boards));
    localStorage.setItem('agentarena_activity', JSON.stringify(activity.slice(0, 100)));
    if (!wallet.isReal) {
      localStorage.setItem('agentarena_wallet', JSON.stringify(wallet));
    }
  }, [tiles, boards, activity, wallet]);

  // Internal helper to resolve connect args cleanly
  const resolveConnectArgs = (
    provider: WalletState['provider'],
    isReal: boolean
  ): ConnectArgs => {
    if (!isReal || provider === 'simulated' || provider === null) {
      return { kind: 'simulated' };
    }
    return { kind: 'real', provider: provider as WalletProviderId };
  };

  const connectWallet = useCallback(async (
    provider: WalletState['provider'],
    isReal: boolean
  ) => {
    const args = resolveConnectArgs(provider, isReal);

    if (args.kind === 'simulated') {
      const pubkey = generateSimulatedPubkey();
      const newWallet: WalletState = {
        connected: true,
        pubkey,
        balance: STARTING_BALANCE,
        provider: 'simulated',
        isReal: false,
        devnetBalance: 0,
      };
      setWallet(newWallet);
      setUsers(prev => addUserIfMissing(prev, pubkey, STARTING_BALANCE));
      toast.success('Simulated wallet connected', {
        description: 'You have 50 SOL to play with. None of this is real.',
      });
      return;
    }

    // Real wallet connection via devnet
    const result = await connectSolanaWallet(args.provider);

    if (!result.ok) {
      // Wallet not installed or user rejected — fall back to simulation with accurate message
      const pubkey = generateSimulatedPubkey();
      const newWallet: WalletState = {
        connected: true,
        pubkey,
        balance: STARTING_BALANCE,
        provider,
        isReal: false,
        devnetBalance: 0,
      };
      setWallet(newWallet);
      setUsers(prev => addUserIfMissing(prev, pubkey, STARTING_BALANCE));

      if (result.reason === 'not_installed') {
        toast.info(`${provider} not detected`, {
          description: 'Running in simulated mode. Install the wallet extension to connect on devnet.',
        });
      } else if (result.reason === 'rejected') {
        toast.warning('Connection cancelled', {
          description: 'You rejected the wallet request. Running in simulated mode instead.',
        });
      } else {
        toast.info('Could not connect wallet', {
          description: 'Running in simulated mode.',
        });
      }
      return;
    }

    const newWallet: WalletState = {
      connected: true,
      pubkey: result.pubkey,
      balance: STARTING_BALANCE,
      provider,
      isReal: true,
      devnetBalance: result.devnetBalance,
    };

    setWallet(newWallet);
    setUsers(prev => addUserIfMissing(prev, result.pubkey, STARTING_BALANCE, result.pubkey));

    toast.success(`${provider} connected on Devnet`, {
      description: `${result.pubkey.slice(0, 6)}...${result.pubkey.slice(-6)} // Game balance is separate from on-chain SOL.`,
    });
  }, []);

  const disconnectWallet = useCallback(() => {
    if (wallet.isReal && wallet.provider && wallet.provider !== 'simulated') {
      disconnectSolanaWallet(wallet.provider as WalletProviderId).catch(() => {});
    }
    setWallet(EMPTY_WALLET);
    localStorage.removeItem('agentarena_wallet');
  }, [wallet]);

  const processPurchase = useCallback((tileId: string, buyerId: string) => {
    setTiles(prevTiles => {
      const tileIndex = prevTiles.findIndex(t => t.id === tileId);
      if (tileIndex === -1) return prevTiles;

      const tile = prevTiles[tileIndex];
      const board = boardsRef.current.find(b => b.id === tile.boardId);
      if (!board) return prevTiles;

      const newTiles = [...prevTiles];
      const previousOwnerId = tile.ownerId;
      const pricePaid = tile.price;

      newTiles[tileIndex] = {
        ...tile,
        ownerId: buyerId,
        price: Math.floor(tile.price * board.growthFactor),
        purchaseCount: tile.purchaseCount + 1,
      };

      setActivity(prev => [{
        id: generateId(),
        boardId: board.id,
        tileId,
        buyerId,
        sellerId: previousOwnerId,
        price: pricePaid,
        timestamp: Date.now(),
      }, ...prev].slice(0, 500));

      setBoards(prevBoards => prevBoards.map(b =>
        b.id === board.id ? { ...b, totalVolume: b.totalVolume + pricePaid } : b
      ));

      setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === buyerId) return { ...u, balance: u.balance - pricePaid };
        if (u.id === previousOwnerId) {
          const cut = calculatePayout(pricePaid, board.cutPercentage);
          return { ...u, balance: u.balance + cut };
        }
        return u;
      }));

      const currentWallet = walletRef.current;
      if (currentWallet.connected && buyerId === currentWallet.pubkey) {
        setWallet(w => ({ ...w, balance: w.balance - pricePaid }));
      }
      if (currentWallet.connected && previousOwnerId === currentWallet.pubkey) {
        const cut = calculatePayout(pricePaid, board.cutPercentage);
        setWallet(w => ({ ...w, balance: w.balance + cut }));
      }

      return newTiles;
    });
  }, []);

  const buyTile = (tileId: string) => {
    if (!wallet.connected || !wallet.pubkey) {
      toast.error("Connect your wallet first.");
      return;
    }

    const tile = tiles.find(t => t.id === tileId);
    if (!tile) return;
    if (wallet.balance < tile.price) {
      toast.error("Insufficient funds!", {
        description: `Need ${(tile.price / 1e9).toFixed(3)} SOL, you have ${(wallet.balance / 1e9).toFixed(3)} SOL.`,
      });
      return;
    }
    if (tile.ownerId === wallet.pubkey) {
      toast.warning("You already own this tile!");
      return;
    }

    processPurchase(tileId, wallet.pubkey);
    toast.success("Tile purchased!", {
      description: `Paid ${(tile.price / 1e9).toFixed(3)} SOL. Waiting for the next buyer...`,
    });
  };

  // Simulation loop — mock agents keep buying tiles so the arena stays alive
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    simRef.current = setInterval(() => {
      if (Math.random() > 0.3 && tiles.length > 0) {
        const randomBoard = boards[Math.floor(Math.random() * boards.length)];
        const boardTiles = tiles.filter(t => t.boardId === randomBoard.id);
        if (boardTiles.length === 0) return;

        const randomTile = boardTiles[Math.floor(Math.random() * boardTiles.length)];
        const randomUser = users[Math.floor(Math.random() * (users.length - 1))];

        if (randomUser && randomUser.balance >= randomTile.price && randomTile.ownerId !== randomUser.id) {
          processPurchase(randomTile.id, randomUser.id);
        }
      }
    }, 2000);

    return () => {
      if (simRef.current) clearInterval(simRef.current);
    };
  }, [tiles, users, boards, processPurchase]);

  return (
    <GameContext.Provider value={{ wallet, connectWallet, disconnectWallet, boards, tiles, activity, buyTile, users }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
