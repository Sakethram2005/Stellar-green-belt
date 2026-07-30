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
    Disputed,
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
    pub deadline:    u64,
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

    pub fn create_escrow(
        env:         Env,
        client:      Address,
        freelancer:  Address,
        token:       Address,
        amount:      i128,
        description: String,
        deadline:    u64,
    ) -> u64 {
        client.require_auth();
        assert!(amount > 0, "Amount must be positive");
        assert!(client != freelancer, "Client and freelancer must differ");

        let id: u64 = env.storage().instance()
            .get(&DataKey::NextId).unwrap_or(0u64);

        let deadline_ts = if deadline > 0 {
            env.ledger().timestamp() + deadline
        } else { 0u64 };

        let escrow = Escrow {
            id, client: client.clone(), freelancer: freelancer.clone(),
            amount, description, status: EscrowStatus::Active,
            created_at: env.ledger().timestamp(), deadline: deadline_ts, token,
        };

        env.storage().persistent().set(&DataKey::Escrow(id), &escrow);
        env.storage().instance().set(&DataKey::NextId, &(id + 1));

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("created")),
            (id, client, freelancer, amount),
        );
        id
    }

    pub fn fund_escrow(env: Env, client: Address, escrow_id: u64) {
        client.require_auth();
        let mut escrow: Escrow = env.storage().persistent()
            .get(&DataKey::Escrow(escrow_id)).expect("Escrow not found");
        assert!(escrow.client == client, "Not the escrow client");
        assert!(escrow.status == EscrowStatus::Active, "Escrow not Active");

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&client, &env.current_contract_address(), &escrow.amount);

        escrow.status = EscrowStatus::Funded;
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &escrow);
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("funded")),
            (escrow_id, escrow.amount),
        );
    }

    pub fn approve_escrow(env: Env, client: Address, escrow_id: u64) {
        client.require_auth();
        let mut escrow: Escrow = env.storage().persistent()
            .get(&DataKey::Escrow(escrow_id)).expect("Escrow not found");
        assert!(escrow.client == client, "Not the escrow client");
        assert!(escrow.status == EscrowStatus::Funded, "Escrow must be Funded");

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&env.current_contract_address(), &escrow.freelancer, &escrow.amount);

        escrow.status = EscrowStatus::Completed;
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &escrow);
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("approved")),
            (escrow_id, escrow.freelancer.clone(), escrow.amount),
        );
    }

    pub fn cancel_escrow(env: Env, client: Address, escrow_id: u64) {
        client.require_auth();
        let mut escrow: Escrow = env.storage().persistent()
            .get(&DataKey::Escrow(escrow_id)).expect("Escrow not found");
        assert!(escrow.client == client, "Not the escrow client");
        assert!(
            escrow.status == EscrowStatus::Active || escrow.status == EscrowStatus::Funded,
            "Cannot cancel"
        );
        if escrow.status == EscrowStatus::Funded {
            let token_client = token::Client::new(&env, &escrow.token);
            token_client.transfer(&env.current_contract_address(), &client, &escrow.amount);
        }
        escrow.status = EscrowStatus::Cancelled;
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &escrow);
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("cancelled")),
            (escrow_id, escrow.amount),
        );
    }

    pub fn raise_dispute(env: Env, caller: Address, escrow_id: u64) {
        caller.require_auth();
        let mut escrow: Escrow = env.storage().persistent()
            .get(&DataKey::Escrow(escrow_id)).expect("Escrow not found");
        assert!(
            caller == escrow.client || caller == escrow.freelancer,
            "Only client or freelancer can raise dispute"
        );
        assert!(escrow.status == EscrowStatus::Funded, "Can only dispute Funded escrow");
        escrow.status = EscrowStatus::Disputed;
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &escrow);
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("disputed")),
            (escrow_id, caller),
        );
    }

    pub fn claim_after_deadline(env: Env, freelancer: Address, escrow_id: u64) {
        freelancer.require_auth();
        let mut escrow: Escrow = env.storage().persistent()
            .get(&DataKey::Escrow(escrow_id)).expect("Escrow not found");
        assert!(escrow.freelancer == freelancer, "Not the freelancer");
        assert!(escrow.status == EscrowStatus::Funded, "Escrow must be Funded");
        assert!(escrow.deadline > 0, "No deadline set");
        assert!(env.ledger().timestamp() >= escrow.deadline, "Deadline not reached yet");

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&env.current_contract_address(), &freelancer, &escrow.amount);

        escrow.status = EscrowStatus::Completed;
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &escrow);
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("claimed")),
            (escrow_id, freelancer, escrow.amount),
        );
    }

    pub fn get_escrow(env: Env, escrow_id: u64) -> Escrow {
        env.storage().persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("Escrow not found")
    }

    pub fn get_next_id(env: Env) -> u64 {
        env.storage().instance()
            .get(&DataKey::NextId)
            .unwrap_or(0u64)
    }
}

#[cfg(test)]
mod test;