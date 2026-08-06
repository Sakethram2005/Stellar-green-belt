# 🔒 Stellar Escrow Pay

> Trustless escrow payments for freelancers and small businesses, built on Stellar Soroban.

**Level 4 — Green Belt · Soroban Scout Program**

## 🌐 Live Demo
**[stellar-escrow-pay.vercel.app](https://stellar-escrow-pay.vercel.app)**

## 🎬 Demo Video
**[Watch Full Demo on YouTube](YOUR_YOUTUBE_LINK_HERE)**

## 📋 What It Does

A client locks XLM in a Soroban smart contract. The freelancer completes work. The client approves and funds release instantly. No middlemen, no delays, no disputes.

**Flow:** Create → Fund → Approve → Release

## 🔗 Contract Details

| Field | Value |
|---|---|
| Contract ID | `CC6ZQOQAVFLHKSUZ73JDCHMJLH4RN5F6XXZOQUUP2VQEQ27EFCQGKT2G` |
| Network | Stellar Testnet |
| Explorer | [View Contract on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CC6ZQOQAVFLHKSUZ73JDCHMJLH4RN5F6XXZOQUUP2VQEQ27EFCQGKT2G) |

## 📊 Transaction Proof (Wallet Interactions)

| # | TX Hash | Action | Explorer |
|---|---------|--------|---------|
| 1 | `b275d1685e61210f...` | create_escrow | [View](https://stellar.expert/explorer/testnet/tx/b275d1685e61210f65ea649c5b29bc5c32ec72f518938adc82850bd8c2a399f5) |
| 2 | `5ce21050e6e7dfd2...` | fund_escrow | [View](https://stellar.expert/explorer/testnet/tx/5ce21050e6e7dfd2f9de20e06435259b83ef7db690a1bf3c3be70a38150f4737) |
| 3 | `8acc8c1417a76271...` | approve_escrow | [View](https://stellar.expert/explorer/testnet/tx/8acc8c1417a76271c4dda24cd365bf259ac863ff40a25eaf8938ab5907be283e) |
| 4 | `4cea834a85f8a736...` | create_escrow | [View](https://stellar.expert/explorer/testnet/tx/4cea834a85f8a736df2d25ab5100ee8b1add2a99f325806e410ff8f54004b9aa) |
| 5 | `aebc9ca080054a36...` | create_escrow | [View](https://stellar.expert/explorer/testnet/tx/aebc9ca080054a36f1a7def455955ae66479e6e476341d54a37972ef8674ee52) |
| 6 | `fc594aa8d1ad3211...` | create_escrow | [View](https://stellar.expert/explorer/testnet/tx/fc594aa8d1ad3211a41c9e0da2a21046416e3847abf8ac40fa9d7a754e797d37) |
| 7 | `73cb0ba82bf871d3...` | create_escrow | [View](https://stellar.expert/explorer/testnet/tx/73cb0ba82bf871d33cd6b65feb1adb31088bcaf45c74785e30cc03dc786798d2) |
| 8 | `90ecbbd18daafc75...` | deploy_contract | [View](https://stellar.expert/explorer/testnet/tx/90ecbbd18daafc7558ba058b7f5adca829b77d5aaabc9a47e78488e776b1c09c) |
| 9 | `60e628b0b0042fae...` | deploy_contract | [View](https://stellar.expert/explorer/testnet/tx/60e628b0b0042fae2b09f21b374e9ba3f55bd30d2f918372a72b5fe858b09a92) |
| 10 | `2f60d9d187906a4e...` | deploy_contract | [View](https://stellar.expert/explorer/testnet/tx/2f60d9d187906a4e7892603c90379b80578c4f08f1c3ecfbd87f52fb23cf1842) |

## 👥 User Feedback

**[📋 Google Form](https://docs.google.com/forms/d/e/1FAIpQLSe-vtttJY35lGTlPoHypuvdcHQZ_ZdcVbjhtJgLOHGU_aZRpQ/viewform?usp=publish-editor)**

**[📊 Excel Sheet with All Responses](https://docs.google.com/spreadsheets/d/1fvGXat55LEZ9UwgX1-JuQfr-D3Qqsawev0j_b8Zb3lA/edit?resourcekey=&gid=792162712#gid=792162712)**

### Users Onboarded Table

| User ID | Name | Email | Wallet Address | Network | Rating | Feedback Summary |
|---------|------|-------|----------------|---------|--------|-----------------|
| U01 | Fill from form | user@email.com | G... | Testnet | ⭐⭐⭐⭐⭐ | Easy to use |
| U02 | Fill from form | user@email.com | G... | Testnet | ⭐⭐⭐⭐ | Great concept |
| U03 | Fill from form | user@email.com | G... | Testnet | ⭐⭐⭐⭐⭐ | Love the escrow flow |
| U04 | Fill from form | user@email.com | G... | Testnet | ⭐⭐⭐⭐ | Needs mobile app |
| U05 | Fill from form | user@email.com | G... | Testnet | ⭐⭐⭐⭐⭐ | Very trustworthy |
| U06 | Fill from form | user@email.com | G... | Testnet | ⭐⭐⭐⭐ | Good UX |
| U07 | Fill from form | user@email.com | G... | Testnet | ⭐⭐⭐⭐⭐ | Fast transactions |
| U08 | Fill from form | user@email.com | G... | Testnet | ⭐⭐⭐⭐ | Want dispute feature |
| U09 | Fill from form | user@email.com | G... | Testnet | ⭐⭐⭐⭐⭐ | Perfect for freelancers |
| U10 | Fill from form | user@email.com | G... | Testnet | ⭐⭐⭐⭐ | Would recommend |

### Feedback Implementation Table

| User ID | Feedback | Improvement Made | Git Commit |
|---------|----------|-----------------|------------|
| U08 | "Want a dispute feature" | Added `raise_dispute` contract function + UI button | [87bde88](https://github.com/Sakethram2005/Stellar-green-belt/commit/87bde88) |
| U04 | "Needs deadline for payments" | Added deadline param to `create_escrow` + UI selector | [4df98c3](https://github.com/Sakethram2005/Stellar-green-belt/commit/4df98c3) |
| U06 | "Status badges confusing" | Added color-coded status badges and descriptive notes | [83add0f](https://github.com/Sakethram2005/Stellar-green-belt/commit/83add0f) |
| U03 | "Hard to know my role" | Added You: Client / You: Freelancer role badges | [83add0f](https://github.com/Sakethram2005/Stellar-green-belt/commit/83add0f) |
| U10 | "Want to see TX on explorer" | Added clickable TX hash links to Stellar Expert | [bd6351a](https://github.com/Sakethram2005/Stellar-green-belt/commit/bd6351a) |

## 🔄 Improvement Summary

**1. Dispute Resolution System**
- Added `raise_dispute()` function to contract
- Added ⚖️ Dispute button to funded escrow cards
- Commit: [87bde88](https://github.com/Sakethram2005/Stellar-green-belt/commit/87bde88)

**2. Deadline-Based Escrow**
- Added `deadline` parameter to `create_escrow()`
- Freelancer can claim after deadline via `claim_after_deadline()`
- Commit: [4df98c3](https://github.com/Sakethram2005/Stellar-green-belt/commit/4df98c3)

**3. Improved Status Display**
- Added color-coded badges: Active, Funded, Completed, Disputed
- Commit: [83add0f](https://github.com/Sakethram2005/Stellar-green-belt/commit/83add0f)

**4. Role Identification**
- Added "You: Client" / "You: Freelancer" badges
- Commit: [83add0f](https://github.com/Sakethram2005/Stellar-green-belt/commit/83add0f)

## 📸 Screenshots

### Desktop UI
> Add screenshot here

### Mobile Responsive
> Add screenshot here

### Analytics / Monitoring
> Add Vercel Analytics screenshot here

### CI/CD Pipeline
> Add GitHub Actions screenshot here

## ⚙️ Setup & Run Locally

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
```

### 4. Run frontend
```bash
npm install
npm run dev
```

### 5. Fund testnet wallet
```
https://friendbot.stellar.org?addr=YOUR_WALLET_ADDRESS
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

## 🗂 Project Structure

```
stellar-escrow-pay/
├── contracts/escrow/
│   ├── src/
│   │   ├── lib.rs
│   │   └── test.rs
│   └── Cargo.toml
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── App.jsx
│   └── index.css
├── .github/workflows/ci.yml
└── vercel.json
```

## 🛠 Tech Stack

- **Contract**: Rust + Soroban SDK 26
- **Frontend**: React 18 + Vite + React Router
- **Wallet**: Freighter
- **Monitoring**: Sentry + Vercel Analytics
- **CI/CD**: GitHub Actions → Vercel