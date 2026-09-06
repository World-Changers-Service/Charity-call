# Soroban Project

## Project Structure

This repository uses the recommended structure for a Soroban project:
```text
.
├── contracts
│   ├── hello-world           # Starter scaffold contract
│   │   ├── src
│   │   │   ├── lib.rs
│   │   │   └── test.rs
│   │   └── Cargo.toml
│   └── charicall-donation    # On-chain donation ledger for Charicall causes
│       ├── src
│       │   ├── lib.rs
│       │   └── test.rs
│       └── Cargo.toml
├── Cargo.toml
└── README.md
```

- New Soroban contracts can be put in `contracts`, each in their own directory.
- `charicall-donation` is the real contract: it tracks a funding target per cause, accepts donations in a configured Stellar Asset Contract (SAC) token, and lets the owner withdraw funds already raised for a specific cause (capped at that cause's undrawn balance). Build/test it with `cd contracts/charicall-donation && make`.
- `hello-world` is the starter scaffold left over from `stellar contract init` and isn't part of the donation flow.
- Contracts should have their own `Cargo.toml` files that rely on the top-level `Cargo.toml` workspace for their dependencies.
- Frontend libraries can be added to the top-level directory as well. If you initialized this project with a frontend template via `--frontend-template` you will have those files already included.
