#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Events},
    Env,
};

fn create_token_contract<'a>(env: &Env, admin: &Address) -> (Address, token::Client<'a>, token::StellarAssetClient<'a>) {
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let address = sac.address();
    (
        address.clone(),
        token::Client::new(env, &address),
        token::StellarAssetClient::new(env, &address),
    )
}

struct TestCtx<'a> {
    env: Env,
    contract_id: Address,
    client: CharicallDonationClient<'a>,
    owner: Address,
    token: token::Client<'a>,
    token_admin: token::StellarAssetClient<'a>,
}

fn setup<'a>() -> TestCtx<'a> {
    let env = Env::default();
    env.mock_all_auths();

    let owner = Address::generate(&env);
    let token_admin_address = Address::generate(&env);
    let (token_id, token, token_admin) = create_token_contract(&env, &token_admin_address);

    let contract_id = env.register(CharicallDonation, ());
    let client = CharicallDonationClient::new(&env, &contract_id);
    client.initialize(&owner, &token_id);

    TestCtx {
        env,
        contract_id,
        client,
        owner,
        token,
        token_admin,
    }
}

const CAUSE_ID: u64 = 1;
const TARGET: i128 = 1_000_000;

#[test]
fn create_cause_registers_target() {
    let ctx = setup();
    ctx.client.create_cause(&CAUSE_ID, &TARGET);

    let cause = ctx.client.get_cause(&CAUSE_ID);
    assert_eq!(cause.target_amount, TARGET);
    assert_eq!(cause.raised_amount, 0);
    assert_eq!(cause.withdrawn_amount, 0);
    assert!(!cause.goal_reached);
}

#[test]
fn create_cause_rejects_zero_target() {
    let ctx = setup();
    let result = ctx.client.try_create_cause(&CAUSE_ID, &0);
    assert_eq!(result, Err(Ok(Error::ZeroTarget)));
}

#[test]
fn create_cause_rejects_duplicate() {
    let ctx = setup();
    ctx.client.create_cause(&CAUSE_ID, &TARGET);
    let result = ctx.client.try_create_cause(&CAUSE_ID, &TARGET);
    assert_eq!(result, Err(Ok(Error::CauseAlreadyExists)));
}

#[test]
fn donate_moves_tokens_and_updates_raised_amount() {
    let ctx = setup();
    ctx.client.create_cause(&CAUSE_ID, &TARGET);

    let donor = Address::generate(&ctx.env);
    ctx.token_admin.mint(&donor, &TARGET);

    ctx.client.donate(&donor, &CAUSE_ID, &(TARGET / 2));

    assert_eq!(ctx.token.balance(&donor), TARGET / 2);
    assert_eq!(ctx.token.balance(&ctx.contract_id), TARGET / 2);

    let cause = ctx.client.get_cause(&CAUSE_ID);
    assert_eq!(cause.raised_amount, TARGET / 2);
    assert!(!cause.goal_reached);
}

#[test]
fn donate_rejects_zero_amount() {
    let ctx = setup();
    ctx.client.create_cause(&CAUSE_ID, &TARGET);
    let donor = Address::generate(&ctx.env);

    let result = ctx.client.try_donate(&donor, &CAUSE_ID, &0);
    assert_eq!(result, Err(Ok(Error::ZeroDonation)));
}

#[test]
fn donate_rejects_unknown_cause() {
    let ctx = setup();
    let donor = Address::generate(&ctx.env);
    ctx.token_admin.mint(&donor, &TARGET);

    let result = ctx.client.try_donate(&donor, &999, &TARGET);
    assert_eq!(result, Err(Ok(Error::UnknownCause)));
}

// `closed` events carry a 2-element topic tuple `(CLOSED_TOPIC, cause_id)`, while `donation`
// events carry a 3-element one `(DONATION_TOPIC, cause_id, donor)` - topic arity is enough to
// tell them apart without decoding `Val`s back to `Symbol`. `events().all()` only reflects the
// most recent top-level invocation, so this must be read right after each call, not accumulated.
fn closed_events_emitted(ctx: &TestCtx) -> usize {
    ctx.env
        .events()
        .all()
        .iter()
        .filter(|(contract_id, topics, _)| *contract_id == ctx.contract_id && topics.len() == 2)
        .count()
}

#[test]
fn donate_emits_closed_event_exactly_once() {
    let ctx = setup();
    ctx.client.create_cause(&CAUSE_ID, &TARGET);

    let donor = Address::generate(&ctx.env);
    ctx.token_admin.mint(&donor, &(TARGET * 2));

    ctx.client.donate(&donor, &CAUSE_ID, &TARGET);
    assert_eq!(closed_events_emitted(&ctx), 1, "closed must fire when the goal is first met");
    assert!(ctx.client.get_cause(&CAUSE_ID).goal_reached);

    ctx.client.donate(&donor, &CAUSE_ID, &(TARGET / 10));
    assert_eq!(closed_events_emitted(&ctx), 0, "closed must not fire again on later donations");
}

#[test]
fn withdraw_transfers_up_to_cause_balance() {
    let ctx = setup();
    ctx.client.create_cause(&CAUSE_ID, &TARGET);

    let donor = Address::generate(&ctx.env);
    ctx.token_admin.mint(&donor, &TARGET);
    ctx.client.donate(&donor, &CAUSE_ID, &TARGET);

    let recipient = Address::generate(&ctx.env);
    ctx.client.withdraw(&CAUSE_ID, &(TARGET / 2), &recipient);

    assert_eq!(ctx.token.balance(&recipient), TARGET / 2);
    let cause = ctx.client.get_cause(&CAUSE_ID);
    assert_eq!(cause.withdrawn_amount, TARGET / 2);
}

#[test]
fn withdraw_rejects_amount_beyond_available_balance() {
    let ctx = setup();
    ctx.client.create_cause(&CAUSE_ID, &TARGET);

    let donor = Address::generate(&ctx.env);
    ctx.token_admin.mint(&donor, &TARGET);
    ctx.client.donate(&donor, &CAUSE_ID, &TARGET);

    let recipient = Address::generate(&ctx.env);
    let result = ctx
        .client
        .try_withdraw(&CAUSE_ID, &(TARGET + 1), &recipient);
    assert_eq!(result, Err(Ok(Error::InsufficientCauseBalance)));
}

#[test]
fn withdraw_does_not_drain_other_causes() {
    let ctx = setup();
    let other_cause_id = 2u64;
    ctx.client.create_cause(&CAUSE_ID, &TARGET);
    ctx.client.create_cause(&other_cause_id, &TARGET);

    let donor = Address::generate(&ctx.env);
    ctx.token_admin.mint(&donor, &(TARGET * 2));
    ctx.client.donate(&donor, &CAUSE_ID, &TARGET);
    ctx.client.donate(&donor, &other_cause_id, &TARGET);

    let recipient = Address::generate(&ctx.env);
    let result = ctx
        .client
        .try_withdraw(&other_cause_id, &(TARGET + 1), &recipient);
    assert_eq!(result, Err(Ok(Error::InsufficientCauseBalance)));

    ctx.client.withdraw(&CAUSE_ID, &TARGET, &recipient);
    let other_cause = ctx.client.get_cause(&other_cause_id);
    assert_eq!(other_cause.withdrawn_amount, 0);
}

#[test]
fn transfer_ownership_updates_owner() {
    let ctx = setup();
    let new_owner = Address::generate(&ctx.env);

    ctx.client.transfer_ownership(&new_owner);
    assert_eq!(ctx.client.get_owner(), new_owner);

    // The old owner can no longer authorize owner-gated calls once auths aren't mocked
    // for them specifically; here we just confirm the stored owner changed.
    let _ = ctx.owner;
}

#[test]
fn initialize_rejects_double_call() {
    let ctx = setup();
    let other_token_admin = Address::generate(&ctx.env);
    let (other_token_id, _, _) = create_token_contract(&ctx.env, &other_token_admin);

    let result = ctx.client.try_initialize(&ctx.owner, &other_token_id);
    assert_eq!(result, Err(Ok(Error::AlreadyInitialized)));
}
