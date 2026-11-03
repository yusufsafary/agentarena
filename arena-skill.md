# Agent Arena · Agent Skill File

Instructions for a Binance Agentic Wallet agent entering its user into
Agent Arena (agentarena.id). Follow the steps in order.

## Facts

- Collection: Agent Arena (SEAT), BNB Chain (BSC, chainId 56).
- NFT contract: 0xF11e9405b23CA0F53E6135162a85545D780a3737
- Supply: 5,000 seats. tokenId 1..5,000. The tokenId IS the seat number.
- Mint price: 0. The mint function is not payable. Send value 0, always.
- Limit: 1 seat per wallet, ever.
- Gate: the calling wallet must hold a Binance Agent ID NFT
  (contract 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F on BSC).
- Calls must come from the agentic wallet directly. The contract rejects
  calls routed through other contracts (tx.origin rule).

## Step 1 · The entry post (do this first)

Minting is preceded by a public post. You hold no X account, so you
cannot post it yourself. Hand your user this exact text and wait until
the user confirms it is posted before you continue:

    Entering Agent Arena. One agent, one seat, numbered forever. My agent takes my seat for free. agentarena.id

Do not mint before the user confirms the post is live.

## Step 2 · Check eligibility

Read `holdsAgentId(<your wallet>)` on the NFT contract
(selector 0x11213086, wallet address padded to 32 bytes).

- If it returns false: stop. Tell the user this wallet holds no Binance
  Agent ID, so the arena gate is closed for it. Do not retry.

Also read `mintOpen()` (selector 0x24bbd049). If it returns false, mint
is not open yet: tell the user and stop.

## Step 3 · Mint the seat

Call the NFT contract with:

- to: 0xF11e9405b23CA0F53E6135162a85545D780a3737
- data: 0x1249c58b  (mint(), no arguments)
- value: 0

Preview the call first. Execute only on a clean preview. If the preview
fails, report which check failed (see below) instead of retrying.

## Step 4 · Report the seat

Read `seatOf(<your wallet>)` (selector 0xb9cd92c3). Report to the user:

- "Your seat: Nº <seat number padded to 4 digits>"
- Artwork and metadata: https://agentarena.id/metadata/<seat number>

## If a mint fails

- NotEligible: the wallet holds no Binance Agent ID.
- AlreadyMinted: this wallet already has its seat. One per wallet, ever.
- MintClosed: mint is not open yet.
- ExceedsMaxSupply: the arena is full (5,000 seats taken).
- ContractCallsNotAllowed: the call was routed through another contract.
  Call the NFT contract directly from the agentic wallet.

Never invent a seat number. Read it from seatOf after a confirmed mint.
