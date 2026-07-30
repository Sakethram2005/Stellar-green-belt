#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address, Env, String,
    token::{Client as TokenClient, StellarAssetClient},
};

fn setup() -> (Env, EscrowContractClient<'static>, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_id.address();
    let user_client = Address::generate(&env);
    let user_freelancer = Address::generate(&env);
    let sac = StellarAssetClient::new(&env, &token_address);
    sac.mint(&user_client, &1_000_000_000i128);
    sac.mint(&user_freelancer, &100_000_000i128);
    (env, client, user_client, user_freelancer, token_address)
}

#[test]
fn test_create_escrow() {
    let (env, client, user_client, user_freelancer, token) = setup();
    let id = client.create_escrow(
        &user_client, &user_freelancer, &token,
        &100_000_000i128, &String::from_str(&env, "Logo design"), &0u64,
    );
    assert_eq!(id, 0);
    let escrow = client.get_escrow(&0);
    assert_eq!(escrow.id, 0);
    assert_eq!(escrow.status, EscrowStatus::Active);
    assert_eq!(escrow.amount, 100_000_000i128);
}

#[test]
fn test_fund_escrow() {
    let (env, client, user_client, user_freelancer, token) = setup();
    client.create_escrow(
        &user_client, &user_freelancer, &token,
        &100_000_000i128, &String::from_str(&env, "Website"), &0u64,
    );
    client.fund_escrow(&user_client, &0);
    let escrow = client.get_escrow(&0);
    assert_eq!(escrow.status, EscrowStatus::Funded);
}

#[test]
fn test_approve_releases_funds() {
    let (env, client, user_client, user_freelancer, token) = setup();
    client.create_escrow(
        &user_client, &user_freelancer, &token,
        &100_000_000i128, &String::from_str(&env, "Article"), &0u64,
    );
    client.fund_escrow(&user_client, &0);
    let token_client = TokenClient::new(&env, &token);
    let before = token_client.balance(&user_freelancer);
    client.approve_escrow(&user_client, &0);
    let escrow = client.get_escrow(&0);
    assert_eq!(escrow.status, EscrowStatus::Completed);
    assert_eq!(token_client.balance(&user_freelancer) - before, 100_000_000i128);
}

#[test]
fn test_cancel_active_escrow() {
    let (env, client, user_client, user_freelancer, token) = setup();
    client.create_escrow(
        &user_client, &user_freelancer, &token,
        &50_000_000i128, &String::from_str(&env, "Cancelled"), &0u64,
    );
    client.cancel_escrow(&user_client, &0);
    assert_eq!(client.get_escrow(&0).status, EscrowStatus::Cancelled);
}

#[test]
fn test_cancel_funded_refunds_client() {
    let (env, client, user_client, user_freelancer, token) = setup();
    client.create_escrow(
        &user_client, &user_freelancer, &token,
        &100_000_000i128, &String::from_str(&env, "Refund test"), &0u64,
    );
    client.fund_escrow(&user_client, &0);
    let token_client = TokenClient::new(&env, &token);
    let before = token_client.balance(&user_client);
    client.cancel_escrow(&user_client, &0);
    assert_eq!(token_client.balance(&user_client) - before, 100_000_000i128);
}

#[test]
fn test_cannot_approve_unfunded() {
    let (env, client, user_client, user_freelancer, token) = setup();
    client.create_escrow(
        &user_client, &user_freelancer, &token,
        &100_000_000i128, &String::from_str(&env, "Test"), &0u64,
    );
    let result = client.try_approve_escrow(&user_client, &0);
    assert!(result.is_err());
}

#[test]
fn test_raise_dispute() {
    let (env, client, user_client, user_freelancer, token) = setup();
    client.create_escrow(
        &user_client, &user_freelancer, &token,
        &100_000_000i128, &String::from_str(&env, "Dispute test"), &0u64,
    );
    client.fund_escrow(&user_client, &0);
    client.raise_dispute(&user_client, &0);
    assert_eq!(client.get_escrow(&0).status, EscrowStatus::Disputed);
}

#[test]
fn test_multiple_escrows() {
    let (env, client, user_client, user_freelancer, token) = setup();
    client.create_escrow(&user_client, &user_freelancer, &token, &10_000_000i128, &String::from_str(&env, "Job 1"), &0u64);
    client.create_escrow(&user_client, &user_freelancer, &token, &20_000_000i128, &String::from_str(&env, "Job 2"), &0u64);
    assert_eq!(client.get_next_id(), 2);
}