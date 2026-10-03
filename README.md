# TRACEGUARD AI

An Ethereum investigation MVP: **From Victim Wallet to VASP — Automatically.**

## Run locally (Node.js 20.19+ or 22+)

```bash
npm install
cp .env.example .env
npm run dev:api
```

In a second terminal:

```bash
npm run dev
```

Open the Vite URL shown in the terminal. Click **Load demo investigation**. No blockchain or AI credentials are required. In Windows PowerShell use `Copy-Item .env.example .env` instead of `cp` if needed.

For one process serving the production frontend and Express API:

```bash
npm run build
npm start
```

Open `http://localhost:3001`. `npm test` runs meaningful trace and API regression tests.

## Demo script (3 minutes)

1. Click **Load demo investigation** or trace `0x1111111111111111111111111111111111111111` in demo mode.
2. Show the 3-hop graph: 2.4 ETH → 2.39 ETH → 2.35 ETH; two intermediaries; fictional Example VASP Exchange.
3. Select a node or an edge to inspect full address/hash, timestamp, block, and gas.
4. Explain the 80/100 score: 35 rapid movement + 30 intermediaries + 0 splitting + 15 rapid multi-hop sequence. This is a heuristic, not a fraud probability. VASP identity and large value are not scored as suspicious by themselves.
5. Open Transaction timeline, then Intelligence & actions.
6. Generate report. Download the HTML report and open it, then choose **Print / Save as PDF**.

## Architecture

- React + Vite + TypeScript + Tailwind CSS, Framer Motion, Lucide, Recharts, React Flow.
- Node.js + Express for local/server deployments. `server/worker.ts` is a small deployment adapter for the hosted Site; both call the exact same API handler.
- `shared/engine.ts`: sequential logical agents, chronological breadth-first bounded trace, exact dataset attribution, risk, and local evidence summary.
- `shared/demo.ts`: deterministic fictional fixture. The frontend can run this engine if offline or backend unavailable after the app has loaded. No external fonts or media are required. Loading the application for the first time still requires the local server or a network connection; no service worker is included.
- `server/provider.ts`: `EthereumProvider`; `BlockchainProvider` also defines transaction lookup, token transfers, and block timestamps.
- `shared/knownEntities.json`: source-labeled fictional demo VASP. Live attribution deliberately has no labels until a verified/authorized dataset is configured. A real trace may therefore return no known VASP.
- `shared/report.ts`: escaped printable evidence report. API serves reports from server memory; frontend also downloads the current result for offline use.

## Optional live blockchain configuration

Set `BLOCKCHAIN_API_KEY` to an Etherscan V2 API key in `.env` (or secure hosting runtime settings). `BLOCKCHAIN_RPC_URL` is optional HTTPS Ethereum RPC for individual transaction/block lookup. RPC alone cannot enumerate a wallet's complete transaction history, so live tracing requires the indexed API key.

Live trace scope is successful **external native ETH transfers**, maximum 3 hops, 24 expansions, 20 outgoing candidates per wallet, 100 total transfers, and up to the latest 100 transactions per address from Etherscan. Internal transfers, ERC-20 tracing, bridges and attribution clustering are not included. The provider's token-transfer method is implemented but not part of this MVP trace. Results are not a complete historical analysis. Verify the provider's rate and plan availability before a live demonstration.

Official provider endpoint documentation: https://docs.etherscan.io/api-reference/endpoint/txlist

## Optional AI configuration

Set `LLM_API_KEY`, `LLM_BASE_URL` (OpenAI-compatible `/v1` base), and `LLM_MODEL` on the backend. Keys are never sent to the browser. The LLM receives measured evidence and selects supported interpretation IDs. The backend validates those choices before rendering them with deterministic facts. It cannot add fabricated names, transaction hashes, ownership claims or locations. Without a configured/working LLM, the UI says **Evidence-based local summary**. No AI API was available during development; external calls need validation with your chosen credentials.

## API

- `POST /api/investigations` and `POST /api/trace`: `{wallet, mode: "demo"|"live", complaintId?, description?, maxHops?}`
- `GET /api/investigations`
- `GET /api/investigations/:id`
- `GET /api/wallet/:address`
- `GET /api/transactions/:hash?mode=demo|live`
- `POST /api/report`: `{id}` → printable HTML
- `GET /api/health`

Server memory retains at most 100 investigations; browser history retains up to 50 for the current page session. Refresh/restarts can clear records. No database or authentication is implemented. The hosted Site is private by default. In-memory rate limiting is an MVP safeguard (40 requests/minute/client per process/isolate), not a distributed abuse-control system.

## Evidence boundaries

A connected chronological path does not prove the same funds were forwarded. Address labels do not prove ownership or wrongdoing. The nearest VASP is the shortest matched path **within the explored data and bounds**, not a global guarantee. The displayed receipt is the selected path's single transfer, not total recovered or exchange-wide funds. Demo evidence is fictional and is never linked as genuine explorer evidence.

## Future adapters

Add source-provenance records for licensed/official labels and isolate them from demo labels. Additional chains require their own provider and normalization logic. SAHYOG/NCRP are not connected. Production work would require durable evidence retention, access control, global rate limits and expanded transaction coverage.
