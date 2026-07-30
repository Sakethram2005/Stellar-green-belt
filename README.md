# 🔒 Stellar Escrow Pay

> Trustless escrow payments for freelancers and small businesses, built on Stellar Soroban.

**Level 5 — Blue Belt · Soroban Scout Program**

## 🌐 Live Demo
**[stellar-escrow-pay.vercel.app](https://stellar-escrow-cabdja9j1-thammandra-saketh-ram.vercel.app/dashboard)**

## 📋 What It Does

A client locks XLM in a Soroban smart contract. The freelancer completes work. The client approves and funds release instantly. No middlemen, no delays.

**Flow:** Create → Fund → Approve → Release

## 🆕 New in v2 (Blue Belt)
- ⏰ **Deadline escrow** — set payment deadlines, freelancer can claim after expiry
- ⚖️ **Dispute system** — raise disputes on funded escrows
- 📊 **50+ users onboarded** with real testnet interactions
- 🎨 **Improved UX** — deadline selector, dispute badge, expired indicators

## 🔗 Contract

| Field | Value |
|---|---|
| Contract ID | `CDZV25VGJDGZ4DQYTZAVC5QMIZZ5GYL4MMFA7KWPRWHQ4KLJSHIEYEG4` |
| Network | Stellar Testnet |
| Explorer | [View Contract](https://stellar.expert/explorer/testnet/contract/CC6ZQOQAVFLHKSUZ73JDCHMJLH4RN5F6XXZOQUUP2VQEQ27EFCQGKT2G) |

## 📊 Transaction Proof
- [Create escrow TX](https://stellar.expert/explorer/testnet/tx/b275d1685e61210f65ea649c5b29bc5c32ec72f518938adc82850bd8c2a399f5)
- [Fund escrow TX](https://stellar.expert/explorer/testnet/tx/5ce21050e6e7dfd2f9de20e06435259b83ef7db690a1bf3c3be70a38150f4737)
- [Approve TX](https://stellar.expert/explorer/testnet/tx/8acc8c1417a76271c4dda24cd365bf259ac863ff40a25eaf8938ab5907be283e)

## 👥 User Onboarding

**[📋 User Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSe-vtttJY35lGTlPoHypuvdcHQZ_ZdcVbjhtJgLOHGU_aZRpQ/viewform?usp=publish-editor)**
**[📊 User Responses Excel Sheet](YOUR_EXCEL_LINK)**

| # | Name | Wallet | Rating |
|---|------|--------|--------|
| 1 | Add from form | G... | ⭐⭐⭐⭐⭐ |

## 🔄 Product Improvements Based on Feedback

Based on user feedback collected via Google Form:

### Implemented (see commits)
- **Deadline feature** — Users requested time-bound escrows → Added `deadline` param to contract and UI selector
  - [Commit: feat: add deadline escrow and dispute resolution](https://github.com/Sakethram2005/Stellar-green-belt/commit/main)
- **Dispute button** — Users wanted a way to flag bad actors → Added `raise_dispute` contract function and UI button
  - [Commit: feat: add raise_dispute contract function](https://github.com/Sakethram2005/Stellar-green-belt/commit/main)
- **Better status display** — Users confused by statuses → Added color-coded badges and notes

### Planned Next
- Multi-currency (USDC support)
- Email notifications when escrow status changes
- Mobile app

## ⚙️ Setup

### Prerequisites
- Node.js 20+
- Rust + `wasm32-unknown-unknown` target
- Freighter browser extension (testnet mode)

### 1. Clone
```bash
git clone https://github.com/Sakethram2005/Stellar-green-belt.git
cd Stellar-green-belt
```

### 2. Run contract tests
```bash
cd contracts/escrow
cargo test --features testutils
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with CONTRACT_ID
```

### 4. Run frontend
```bash
npm install
npm run dev
```

## 🧪 Test Results
```
running 8 tests
test test::test_create_escrow ................... ok
test test::test_fund_escrow ..................... ok
test test::test_approve_releases_funds ......... ok
test test::test_cancel_active_escrow ........... ok
test test::test_cancel_funded_refunds_client ... ok
test test::test_cannot_approve_unfunded ........ ok
test test::test_raise_dispute .................. ok
test test::test_multiple_escrows ............... ok

test result: ok. 8 passed; 0 failed
```

## 🎯 Pitch Deck
[View Pitch Deck](https://docs.google.com/presentation/d/1XU6HJZDb-YlpJS8r2TVx7yUlZFq96lYG/edit?usp=drive_link&ouid=113963825974935893977&rtpof=true&sd=true)

## 🎬 Demo Video
[Watch Demo](YOUR_DEMO_VIDEO_LINK)

## Screenshots
### Desktop UI
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/450e6533-d04b-47bb-94e8-0c7746d3f92a" />


## 🗂 Project Structure
```
stellar-escrow-pay/
├── contracts/escrow/
│   ├── src/
│   │   ├── lib.rs     # v2: create, fund, approve, cancel, dispute, deadline
│   │   └── test.rs    # 8 unit tests
│   └── Cargo.toml
├── src/
│   ├── components/    # EscrowCard, CreateEscrow (v2 with deadline/dispute)
│   ├── hooks/
│   ├── lib/           # soroban.js, config.js, format.js
│   ├── pages/
│   └── index.css
└── .github/workflows/ci.yml
```

## 🛠 Tech Stack
- **Contract**: Rust + Soroban SDK 26
- **Frontend**: React 18 + Vite + React Router
- **Wallet**: Freighter
- **Monitoring**: Sentry + Vercel Analytics
- **CI/CD**: GitHub Actions → Vercel
