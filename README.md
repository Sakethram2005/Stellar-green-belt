# 🔒 Stellar Escrow Pay

> Trustless escrow payments for freelancers and small businesses, built on Stellar Soroban.

**Level 4 — Green Belt · Soroban Scout Program**

## 🌐 Live Demo
[> [Vercel URL]](https://stellar-escrow-ofnfjwr1c-thammandra-saketh-ram.vercel.app/)

## 📋 What It Does

A client locks XLM in a Soroban smart contract. The freelancer completes work. The client approves delivery and the contract releases funds instantly. No middlemen, no disputes, no delayed payments.

**Flow:** Create → Fund → Approve → Release

## 🔗 Contract

| Field | Value |
|---|---|
| Contract ID | `CC6ZQOQAVFLHKSUZ73JDCHMJLH4RN5F6XXZOQUUP2VQEQ27EFCQGKT2G` |
| Network | Stellar Testnet |
| Token | XLM (native SAC) |
| Explorer | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID_HERE) |

## 📸 Screenshots

### Desktop UI
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6d64c09c-c2af-4832-9f11-e055a95f670f" />


### Mobile Responsive
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/00203c7d-6d44-421b-9f87-e9164e639693" />

### CI/CD Pipeline
> Add GitHub Actions screenshot

## ⚙️ Setup

### Prerequisites
- Node.js 20+
- Rust + `wasm32-unknown-unknown` target
- Freighter browser extension (testnet mode)

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/stellar-escrow-pay.git
cd stellar-escrow-pay
```

### 2. Contract tests
```bash
cd contracts/escrow
cargo test --features testutils
```

### 3. Deploy contract
```bash
stellar contract build
stellar contract deploy \
  --wasm contracts/escrow/target/wasm32v1-none/release/escrow_contract.wasm \
  --source-account YOUR_KEY \
  --network testnet
```

### 4. Configure environment
```bash
cp .env.example .env
# Edit .env with your CONTRACT_ID, SENTRY_DSN, GOOGLE_FORM_URL
```

### 5. Run frontend
```bash
npm install
npm run dev
```

Open http://localhost:5173

## 🧪 Test Output

```
running 7 tests
test test::test_create_escrow ... ok
test test::test_fund_escrow ... ok
test test::test_approve_releases_funds ... ok
test test::test_cancel_active_escrow ... ok
test test::test_cancel_funded_escrow_refunds_client ... ok
test test::test_cannot_approve_unfunded_escrow ... ok
test test::test_multiple_escrows_increment_id ... ok

test result: ok. 7 passed; 0 failed
```

## 📊 Monitoring & Analytics

- **Vercel Analytics** — page views, unique visitors, performance metrics
- **Sentry** — error tracking, session replay, performance monitoring

## 👥 User Onboarding

| User | Wallet | TX Hash |
|------|--------|---------|
| User 1 | G... | hash... |
| User 2 | G... | hash... |
| ... | ... | ... |

## 💬 User Feedback Summary

Collected via Google Form from 10+ users:
- "Easy to use, connected wallet in under a minute"
- "Great for freelance payments, love the transparency"
- Add more responses here

## 🗂 Project Structure

```
stellar-escrow-pay/
├── contracts/escrow/
│   ├── src/
│   │   ├── lib.rs     # Escrow contract: create, fund, approve, cancel
│   │   └── test.rs    # 7 unit tests
│   └── Cargo.toml
├── src/
│   ├── components/    # ConnectWallet, EscrowCard, CreateEscrow, etc.
│   ├── hooks/         # useFreighter, useEscrowList
│   ├── lib/           # soroban.js, config.js, format.js
│   ├── pages/         # Home, Dashboard
│   ├── App.jsx
│   └── index.css
├── .github/workflows/ci.yml
├── .env.example
└── vercel.json
```

## 🛠 Tech Stack

- **Contract**: Rust + Soroban SDK 22
- **Frontend**: React 18 + Vite + React Router
- **Wallet**: Freighter
- **Monitoring**: Sentry + Vercel Analytics
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel
