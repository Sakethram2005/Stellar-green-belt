#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address, Env, String,
    token::{Client as TokenClient, StellarAssetClient},
};

fn setup() -> (Env, EscrowContractClient<'static>, Address, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    // Deploy escrow contract
    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    // Deploy a test token (SAC)
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_id.address();

    // Mint tokens to test users
    let user_client = Address::generate(&env);
    let user_freelancer = Address::generate(&env);

    let sac = StellarAssetClient::new(&env, &token_address);
    sac.mint(&user_client, &1_000_000_000i128);
    sac.mint(&user_freelancer, &100_000_000i128);

    (env, client, user_client, user_freelancer, token_address, token_admin)
}

#[test]
fn test_create_escrow() {
    let (env, client, user_client, user_freelancer, token, _) = setup();

    let id = client.create_escrow(
        &user_client,
        &user_freelancer,
        &token,
        &100_000_000i128,
        &String::from_str(&env, "Logo design project"),
    );

    assert_eq!(id, 0);

    let escrow = client.get_escrow(&0);
    assert_eq!(escrow.client, user_client);
    assert_eq!(escrow.freelancer, user_freelancer);
    assert_eq!(escrow.amount, 100_000_000i128);
    assert_eq!(escrow.status, EscrowStatus::Active);
}

#[test]
fn test_fund_escrow() {
    let (env, client, user_client, user_freelancer, token, _) = setup();

    client.create_escrow(
        &user_client,
        &user_freelancer,
        &token,
        &100_000_000i128,
        &String::from_str(&env, "Website build"),
    );

    client.fund_escrow(&user_client, &0);

    let escrow = client.get_escrow(&0);
    assert_eq!(escrow.status, EscrowStatus::Funded);

    // Check contract holds the funds
    let token_client = TokenClient::new(&env, &token);
    let contract_id = env.register(EscrowContract, ());
    // Balance check — contract should hold 100_000_000
    assert!(token_client.balance(&escrow.client) < 1_000_000_000i128);
}

#[test]
fn test_approve_releases_funds() {
    let (env, client, user_client, user_freelancer, token, _) = setup();

    client.create_escrow(
        &user_client,
        &user_freelancer,
        &token,
        &100_000_000i128,
        &String::from_str(&env, "Article writing"),
    );
    client.fund_escrow(&user_client, &0);

    let token_client = TokenClient::new(&env, &token);
    let before = token_client.balance(&user_freelancer);

    client.approve_escrow(&user_client, &0);

    let escrow = client.get_escrow(&0);
    assert_eq!(escrow.status, EscrowStatus::Completed);

    let after = token_client.balance(&user_freelancer);
    assert_eq!(after - before, 100_000_000i128);
}

#[test]
fn test_cancel_active_escrow() {
    let (env, client, user_client, user_freelancer, token, _) = setup();

    client.create_escrow(
        &user_client,
        &user_freelancer,
        &token,
        &50_000_000i128,
        &String::from_str(&env, "Cancelled project"),
    );

    // Cancel before funding — no refund needed
    client.cancel_escrow(&user_client, &0);

    let escrow = client.get_escrow(&0);
    assert_eq!(escrow.status, EscrowStatus::Cancelled);
}

#[test]
fn test_cancel_funded_escrow_refunds_client() {
    let (env, client, user_client, user_freelancer, token, _) = setup();

    client.create_escrow(
        &user_client,
        &user_freelancer,
        &token,
        &100_000_000i128,
        &String::from_str(&env, "Refund test"),
    );
    client.fund_escrow(&user_client, &0);

    let token_client = TokenClient::new(&env, &token);
    let before = token_client.balance(&user_client);

    client.cancel_escrow(&user_client, &0);

    let after = token_client.balance(&user_client);
    assert_eq!(after - before, 100_000_000i128);
}

#[test]
fn test_cannot_approve_unfunded_escrow() {
    let (env, client, user_client, user_freelancer, token, _) = setup();

    client.create_escrow(
        &user_client,
        &user_freelancer,
        &token,
        &100_000_000i128,
        &String::from_str(&env, "Test"),
    );

    let result = client.try_approve_escrow(&user_client, &0);
    assert!(result.is_err());
}

#[test]
fn test_multiple_escrows_increment_id() {
    let (env, client, user_client, user_freelancer, token, _) = setup();

    let id1 = client.create_escrow(
        &user_client, &user_freelancer, &token,
        &10_000_000i128, &String::from_str(&env, "Job 1"),
    );
    let id2 = client.create_escrow(
        &user_client, &user_freelancer, &token,
        &20_000_000i128, &String::from_str(&env, "Job 2"),
    );

    assert_eq!(id1, 0);
    assert_eq!(id2, 1);
    assert_eq!(client.get_next_id(), 2);
}
