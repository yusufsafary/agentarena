import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSol(lamports: number) {
  return (lamports / 1e9).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) + ' SOL';
}

export function formatAddress(address: string) {
  return address.slice(0, 4) + '...' + address.slice(-4);
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function calculatePayout(currentPrice: number, cutPercentage: number) {
  return Math.floor(currentPrice * cutPercentage);
}
