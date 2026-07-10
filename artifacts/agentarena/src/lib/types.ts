export type User = {
  id: string; // pubkey
  name: string;
  balance: number;
  avatar: string;
};

export type Tile = {
  id: string;
  boardId: string;
  x: number;
  y: number;
  ownerId: string | null;
  price: number;
  purchaseCount: number;
};

export type Board = {
  id: string;
  name: string;
  size: number; // e.g. 10 for 10x10
  basePrice: number;
  growthFactor: number; // multiplier per purchase, e.g. 1.1
  cutPercentage: number; // what % goes to previous owner
  totalVolume: number;
};

export type Activity = {
  id: string;
  boardId: string;
  tileId: string;
  buyerId: string;
  sellerId: string | null;
  price: number;
  timestamp: number;
};

export type WalletState = {
  connected: boolean;
  pubkey: string | null;
  balance: number;
  provider: 'phantom' | 'solflare' | 'backpack' | 'jupiter' | 'simulated' | null;
};
