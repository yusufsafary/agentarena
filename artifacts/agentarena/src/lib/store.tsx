import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Board, Tile, User, Activity, WalletState } from './types';
import { generateId, calculatePayout } from './utils';
import { toast } from 'sonner';

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

type GameContextType = {
  wallet: WalletState;
  connectWallet: (provider: WalletState['provider']) => void;
  disconnectWallet: () => void;
  boards: Board[];
  tiles: Tile[];
  activity: Activity[];
  buyTile: (tileId: string) => void;
  users: User[];
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    pubkey: null,
    balance: 0,
    provider: null,
  });

  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  // Refs so processPurchase always reads fresh state without stale closures
  const boardsRef = useRef<Board[]>(INITIAL_BOARDS);
  const walletRef = useRef<WalletState>({ connected: false, pubkey: null, balance: 0, provider: null });
  useEffect(() => { boardsRef.current = boards; }, [boards]);
  useEffect(() => { walletRef.current = wallet; }, [wallet]);

  // Initialize from local storage or defaults
  useEffect(() => {
    let initialWallet = {
      connected: false,
      pubkey: null,
      balance: 0,
      provider: null,
    };
    try {
      const savedWallet = localStorage.getItem('agentarena_wallet');
      if (savedWallet) {
        initialWallet = JSON.parse(savedWallet);
        setWallet(initialWallet);
      }
    } catch (e) {
      // fallback
    }

    if (initialWallet.connected && initialWallet.pubkey) {
      setUsers(prev => {
        if (!prev.find(u => u.id === initialWallet.pubkey)) {
          return [...prev, {
            id: initialWallet.pubkey!,
            name: 'You',
            balance: initialWallet.balance,
            avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=you`,
          }];
        }
        return prev;
      });
    }

    try {
      const savedTiles = localStorage.getItem('agentarena_tiles');
      if (savedTiles) {
        setTiles(JSON.parse(savedTiles));
      } else {
        setTiles(initTiles(INITIAL_BOARDS));
      }
    } catch (e) {
      setTiles(initTiles(INITIAL_BOARDS));
    }

    try {
      const savedBoards = localStorage.getItem('agentarena_boards');
      if (savedBoards) {
        setBoards(JSON.parse(savedBoards));
      }
    } catch (e) {
      // fallback
    }

    try {
      const savedActivity = localStorage.getItem('agentarena_activity');
      if (savedActivity) {
        setActivity(JSON.parse(savedActivity));
      }
    } catch (e) {
      // fallback
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (tiles.length > 0) {
      localStorage.setItem('agentarena_tiles', JSON.stringify(tiles));
      localStorage.setItem('agentarena_boards', JSON.stringify(boards));
      localStorage.setItem('agentarena_activity', JSON.stringify(activity.slice(0, 100))); // keep last 100
      localStorage.setItem('agentarena_wallet', JSON.stringify(wallet));
    }
  }, [tiles, boards, activity, wallet]);

  const connectWallet = (provider: WalletState['provider']) => {
    // In a real app, we'd interact with window.solana etc.
    // For now, simulate
    const newWallet = {
      connected: true,
      pubkey: `sim-${generateId()}${generateId()}`,
      balance: 50 * 1e9, // 50 SOL
      provider,
    };
    setWallet(newWallet);
    
    // Add current user to users list if not exists
    if (!users.find(u => u.id === newWallet.pubkey)) {
      setUsers(prev => [...prev, {
        id: newWallet.pubkey!,
        name: 'You',
        balance: newWallet.balance,
        avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=you`,
      }]);
    }
  };

  const disconnectWallet = () => {
    setWallet({ connected: false, pubkey: null, balance: 0, provider: null });
  };

  const processPurchase = useCallback((tileId: string, buyerId: string) => {
    setTiles(prevTiles => {
      const tileIndex = prevTiles.findIndex(t => t.id === tileId);
      if (tileIndex === -1) return prevTiles;

      const tile = prevTiles[tileIndex];
      // Use ref to always read fresh board data, avoiding stale closure bugs
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

      // Update Activity
      setActivity(prev => [{
        id: generateId(),
        boardId: board.id,
        tileId,
        buyerId,
        sellerId: previousOwnerId,
        price: pricePaid,
        timestamp: Date.now(),
      }, ...prev].slice(0, 500));

      // Update Board Volume (functional update — always fresh)
      setBoards(prevBoards => prevBoards.map(b =>
        b.id === board.id ? { ...b, totalVolume: b.totalVolume + pricePaid } : b
      ));

      // Update User Balances (functional update — always fresh)
      setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === buyerId) return { ...u, balance: u.balance - pricePaid };
        if (u.id === previousOwnerId) {
          const cut = calculatePayout(pricePaid, board.cutPercentage);
          return { ...u, balance: u.balance + cut };
        }
        return u;
      }));

      // Update player wallet balance via ref to avoid stale wallet closure
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
  }, []); // no stale closure deps — reads boards/wallet via refs

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

  // Simulation Loop
  const simRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    simRef.current = setInterval(() => {
      // ~70% chance every 2 seconds — keeps the arena active
      if (Math.random() > 0.3 && tiles.length > 0) {
        const randomBoard = boards[Math.floor(Math.random() * boards.length)];
        const boardTiles = tiles.filter(t => t.boardId === randomBoard.id);
        if (boardTiles.length === 0) return;
        
        // Pick a tile biased towards cheaper ones or already owned ones
        const randomTile = boardTiles[Math.floor(Math.random() * boardTiles.length)];
        const randomUser = users[Math.floor(Math.random() * (users.length - 1))]; // exclude 'You' if last
        
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
