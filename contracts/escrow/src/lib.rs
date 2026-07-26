#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token,
    Address, Env, String, symbol_short,
};

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum EscrowStatus {
    Active,
    Funded,
    Completed,
    Cancelled,
}

#[contracttype]
#[derive(Clone)]
pub struct Escrow {
    pub id:          u64,
    pub client:      Address,
    pub freelancer:  Address,
    pub amount:      i128,
    pub description: String,
    pub status:      EscrowStatus,
    pub created_at:  u64,
    pub token:       Address,
}

#[contracttype]
pub enum DataKey {
    Escrow(u64),
    NextId,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {

    // ── 1. Create escrow (does NOT transfer funds yet) ────────────────────────
    pub fn create_escrow(
        env:         Env,
        client:      Address,
        freelancer:  Address,
        token:       Address,
        amount:      i128,
        description: String,
    ) -> u64 {
        client.require_auth();

        assert!(amount > 0,           "Amount must be positive");
        assert!(client != freelancer, "Client and freelancer must differ");

        let id: u64 = env.storage().instance()
            .get(&DataKey::NextId)
            .unwrap_or(0u64);

        let escrow = Escrow {
            id,
            client:     client.clone(),
            freelancer: freelancer.clone(),
            amount,
            description,
            status:     EscrowStatus::Active,
            created_at: env.ledger().timestamp(),
            token,
        };

        env.storage().persistent()
            .set(&DataKey::Escrow(id), &escrow);

        env.storage().instance()
            .set(&DataKey::NextId, &(id + 1));

        // Emit creation event
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("created")),
            (id, client, freelancer, amount),
        );

        id
    }

    // ── 2. Fund escrow (client transfers XLM to contract) ────────────────────
    pub fn fund_escrow(
        env:       Env,
        client:    Address,
        escrow_id: u64,
    ) {
        client.require_auth();

        let mut escrow: Escrow = env.storage().persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found");

        assert!(escrow.client == client,                "Not the escrow client");
        assert!(escrow.status == EscrowStatus::Active,  "Escrow not in Active state");

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &client,
            &env.current_contract_address(),
            &escrow.amount,
        );

        escrow.status = EscrowStatus::Funded;
        env.storage().persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("funded")),
            (escrow_id, escrow.amount),
        );
    }

    // ── 3. Approve delivery → releases funds to freelancer ───────────────────
    pub fn approve_escrow(
        env:       Env,
        client:    Address,
        escrow_id: u64,
    ) {
        client.require_auth();

        let mut escrow: Escrow = env.storage().persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found");

        assert!(escrow.client == client,                "Not the escrow client");
        assert!(escrow.status == EscrowStatus::Funded,  "Escrow must be funded before approving");

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.freelancer,
            &escrow.amount,
        );

        escrow.status = EscrowStatus::Completed;
        env.storage().persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("approved")),
            (escrow_id, escrow.freelancer.clone(), escrow.amount),
        );
    }

    // ── 4. Cancel escrow → refund to client ──────────────────────────────────
    pub fn cancel_escrow(
        env:       Env,
        client:    Address,
        escrow_id: u64,
    ) {
        client.require_auth();

        let mut escrow: Escrow = env.storage().persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found");

        assert!(escrow.client == client, "Not the escrow client");
        assert!(
            escrow.status == EscrowStatus::Active || escrow.status == EscrowStatus::Funded,
            "Cannot cancel completed or already cancelled escrow"
        );

        // Only refund if funded
        if escrow.status == EscrowStatus::Funded {
            let token_client = token::Client::new(&env, &escrow.token);
            token_client.transfer(
                &env.current_contract_address(),
                &client,
                &escrow.amount,
            );
        }

        escrow.status = EscrowStatus::Cancelled;
        env.storage().persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("cancelled")),
            (escrow_id, escrow.amount),
        );
    }

    // ── Read: get escrow by ID ────────────────────────────────────────────────
    pub fn get_escrow(env: Env, escrow_id: u64) -> Escrow {
        env.storage().persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found")
    }

    // ── Read: get total escrow count ──────────────────────────────────────────
    pub fn get_next_id(env: Env) -> u64 {
        env.storage().instance()
            .get(&DataKey::NextId)
            .unwrap_or(0u64)
    }
}

#[cfg(test)]
mod test;
