# Agent Arena · Claim Skill File

Instructions for a Binance Agentic Wallet agent claiming ARENA tokens
for its user, a holder of an Agent Arena seat (agentarena.id).
Follow the steps in order.

## Facts

- Collection: Agent Arena (SEAT), BNB Chain (BSC, chainId 56).
- NFT contract: 0xF11e9405b23CA0F53E6135162a85545D780a3737
- Token: Agent Arena (ARENA), ERC-20, contract
  0xfb83Bc181eE3356B403d09540b501bdc3C42c211. Supply fixed at
  10,000,000,000 ARENA. $ARENA lists on PancakeSwap on Saturday,
  7 November 2026 at 00:00 UTC.
- Claim contract: 0x3452E984bFBB2A24F33D633bBFfC8Abbfc3DB80B
- Every seat claims 250,000 ARENA, ONCE per tokenId (the tokenId IS the
  seat number). The seat is never burned and stays in the wallet.
- A claim is recorded per tokenId, not per wallet. If a seat changed
  hands before being claimed, the new owner claims it. If it was
  already claimed, nobody can claim that seat again.
- Claim fee: exactly 231660249549054 wei in BNB per claim. Send this
  exact value, no more, no less. The token itself is not being bought;
  the fee is an anti-Sybil filter per claim.
- Calls must come from the agentic wallet directly. The contract
  rejects calls routed through other contracts (tx.origin rule).
- The claim pool is sized at 1,250,000,000 ARENA, enough for all 5,000
  seats. If the pool cannot cover a claim, the claim reverts.

## Step 1 · Find the user's seat

Read `seatOf(<your wallet>)` on the NFT contract
(selector 0xb9cd92c3, wallet address padded to 32 bytes).

- If it returns 0: this wallet holds no seat. Stop and tell the user.
  There is nothing to claim without a seat.
- A wallet holds at most 1 seat, so there is at most 1 claim per wallet.

## Step 2 · Check the claim state

Read on the claim contract:

- `claimOpen()` (selector 0x4b8bcb58). If it returns false, claims are
  not open yet: tell the user and stop. Do not retry on a loop.
- `claimedById(<seat number>)` (selector 0x4c80ee12, seat number padded
  to 32 bytes). If it returns true, this seat was already claimed:
  tell the user and stop.

## Step 3 · Claim

Call the claim contract with:

- to: 0x3452E984bFBB2A24F33D633bBFfC8Abbfc3DB80B
- data: 0x379607f5 followed by the seat number padded to 32 bytes
  (claim(uint256))
- value: 231660249549054 (the exact claim fee in wei)

Preview the call first. Execute only on a clean preview. If the
preview fails, report which check failed (see below) instead of
retrying.

## Step 4 · Report

After a confirmed claim, report to the user:

- "Seat Nº <seat number padded to 4 digits> claimed: 250,000 ARENA."
- The ARENA balance of the wallet, read with `balanceOf(<your wallet>)`
  (selector 0x70a08231) on the token contract.

## If a claim fails

- ClaimClosed: claims are not open yet.
- WrongFee: the value sent was not exactly 231660249549054 wei.
- AlreadyClaimed: this seat number was already claimed, by this wallet
  or a previous owner.
- NotHolder: the wallet does not hold that seat at claim time.
- ContractCallsNotAllowed: the call was routed through another
  contract. Call the claim contract directly from the agentic wallet.

Never invent a claim result. Read claimedById and the token balance
after a confirmed transaction.
