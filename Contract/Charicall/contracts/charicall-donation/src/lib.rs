#![no_std]

//! Port of the EVM `CharicallDonation` contract to Soroban.
//!
//! Differences from the EVM version follow from how Soroban works rather than
//! Solidity: there is no native "payable" call, so donations move funds via a
//! configured Stellar Asset Contract (SAC) token using `require_auth` on the
//! donor, and every mutating entrypoint returns a `Result<_, Error>` instead
//! of reverting with a custom error type.

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol};

const DAY_IN_LEDGERS: u32 = 17280;
const INSTANCE_BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;
const CAUSE_BUMP_AMOUNT: u32 = 90 * DAY_IN_LEDGERS;
const CAUSE_LIFETIME_THRESHOLD: u32 = CAUSE_BUMP_AMOUNT - DAY_IN_LEDGERS;

const DONATION_TOPIC: Symbol = symbol_short!("donation");
const CLOSED_TOPIC: Symbol = symbol_short!("closed");
const WITHDRAW_TOPIC: Symbol = symbol_short!("withdraw");
const OWNER_TOPIC: Symbol = symbol_short!("owner_chg");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Cause {
    pub target_amount: i128,
    pub raised_amount: i128,
    pub withdrawn_amount: i128,
    pub goal_reached: bool,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Owner,
    Token,
    Cause(u64),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    ZeroTarget = 3,
    CauseAlreadyExists = 4,
    UnknownCause = 5,
    ZeroDonation = 6,
    ZeroWithdrawal = 7,
    InsufficientCauseBalance = 8,
}

#[contract]
pub struct CharicallDonation;

#[contractimpl]
impl CharicallDonation {
    /// One-time setup: records the contract owner and the SAC token used for donations.
    pub fn initialize(env: Env, owner: Address, token: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Owner) {
            return Err(Error::AlreadyInitialized);
        }
        owner.require_auth();

        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        Ok(())
    }

    /// Registers a new cause with a funding target, denominated in the donation token's base units.
    pub fn create_cause(env: Env, cause_id: u64, target_amount: i128) -> Result<(), Error> {
        Self::require_owner(&env)?;
        if target_amount <= 0 {
            return Err(Error::ZeroTarget);
        }

        let key = DataKey::Cause(cause_id);
        if env.storage().persistent().has(&key) {
            return Err(Error::CauseAlreadyExists);
        }

        let cause = Cause {
            target_amount,
            raised_amount: 0,
            withdrawn_amount: 0,
            goal_reached: false,
        };
        env.storage().persistent().set(&key, &cause);
        env.storage()
            .persistent()
            .extend_ttl(&key, CAUSE_LIFETIME_THRESHOLD, CAUSE_BUMP_AMOUNT);
        Ok(())
    }

    /// Pulls `amount` of the donation token from `donor` into the contract and credits `cause_id`.
    /// Emits a `donation` event on every call, and a `closed` event exactly once, the first time
    /// the cause's raised amount meets or exceeds its target.
    pub fn donate(env: Env, donor: Address, cause_id: u64, amount: i128) -> Result<(), Error> {
        donor.require_auth();
        if amount <= 0 {
            return Err(Error::ZeroDonation);
        }

        let key = DataKey::Cause(cause_id);
        let mut cause: Cause = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::UnknownCause)?;

        let token_client = token::Client::new(&env, &Self::token(&env)?);
        token_client.transfer(&donor, &env.current_contract_address(), &amount);

        cause.raised_amount += amount;
        env.events().publish(
            (DONATION_TOPIC, cause_id, donor),
            (amount, cause.raised_amount),
        );

        if !cause.goal_reached && cause.raised_amount >= cause.target_amount {
            cause.goal_reached = true;
            env.events().publish(
                (CLOSED_TOPIC, cause_id),
                (cause.raised_amount, cause.target_amount),
            );
        }

        env.storage().persistent().set(&key, &cause);
        env.storage()
            .persistent()
            .extend_ttl(&key, CAUSE_LIFETIME_THRESHOLD, CAUSE_BUMP_AMOUNT);
        Ok(())
    }

    /// Sends `amount` of a cause's undrawn balance (`raised_amount - withdrawn_amount`) to `to`.
    pub fn withdraw(env: Env, cause_id: u64, amount: i128, to: Address) -> Result<(), Error> {
        Self::require_owner(&env)?;
        if amount <= 0 {
            return Err(Error::ZeroWithdrawal);
        }

        let key = DataKey::Cause(cause_id);
        let mut cause: Cause = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::UnknownCause)?;

        let available = cause.raised_amount - cause.withdrawn_amount;
        if amount > available {
            return Err(Error::InsufficientCauseBalance);
        }

        cause.withdrawn_amount += amount;
        env.storage().persistent().set(&key, &cause);
        env.storage()
            .persistent()
            .extend_ttl(&key, CAUSE_LIFETIME_THRESHOLD, CAUSE_BUMP_AMOUNT);

        env.events().publish(
            (WITHDRAW_TOPIC, cause_id, to.clone()),
            (amount, cause.withdrawn_amount),
        );

        let token_client = token::Client::new(&env, &Self::token(&env)?);
        token_client.transfer(&env.current_contract_address(), &to, &amount);
        Ok(())
    }

    /// Transfers contract ownership to a new address.
    pub fn transfer_ownership(env: Env, new_owner: Address) -> Result<(), Error> {
        let previous_owner = Self::require_owner(&env)?;
        env.storage().instance().set(&DataKey::Owner, &new_owner);
        env.events()
            .publish((OWNER_TOPIC,), (previous_owner, new_owner));
        Ok(())
    }

    pub fn get_cause(env: Env, cause_id: u64) -> Result<Cause, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Cause(cause_id))
            .ok_or(Error::UnknownCause)
    }

    pub fn get_owner(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Owner)
            .ok_or(Error::NotInitialized)
    }

    fn token(env: &Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Token)
            .ok_or(Error::NotInitialized)
    }

    /// Loads the owner, requires their auth, and returns the (pre-call) owner address.
    fn require_owner(env: &Env) -> Result<Address, Error> {
        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .ok_or(Error::NotInitialized)?;
        owner.require_auth();
        Ok(owner)
    }
}

mod test;
