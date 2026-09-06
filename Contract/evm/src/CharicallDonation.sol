// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CharicallDonation
/// @notice On-chain donation ledger for Charicall causes. Totals per cause are tracked in wei.
/// @dev `CauseClosed` fires exactly once when a cause first reaches or exceeds its funding target.
contract CharicallDonation {
    struct Cause {
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 withdrawnAmount;
        bool goalReachedEmitted;
    }

    address public owner;

    mapping(uint256 causeId => Cause) public causes;

    /// @notice Emitted for every donation received for a cause.
    event Donation(uint256 indexed causeId, address indexed donor, uint256 amount, uint256 newTotalRaised);

    /// @notice Emitted once when `raisedAmount` first meets or exceeds `targetAmount` for a cause.
    /// @param causeId The cause identifier.
    /// @param totalRaised The cumulative amount raised at the time the goal was met (may exceed target).
    /// @param targetAmount The funding goal for the cause.
    event CauseClosed(uint256 indexed causeId, uint256 totalRaised, uint256 targetAmount);

    /// @notice Emitted when funds raised for a cause are withdrawn by the owner.
    /// @param causeId The cause the withdrawal is drawn against.
    /// @param to The recipient of the funds.
    /// @param amount The amount withdrawn in this call.
    /// @param totalWithdrawn The cumulative amount withdrawn for this cause after this call.
    event Withdrawal(uint256 indexed causeId, address indexed to, uint256 amount, uint256 totalWithdrawn);

    /// @notice Emitted when contract ownership is transferred.
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error ZeroTarget();
    error CauseAlreadyExists();
    error UnknownCause();
    error ZeroDonation();
    error ZeroAddress();
    error InsufficientCauseBalance();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Registers a new cause with a funding target (wei).
    function createCause(uint256 causeId, uint256 targetAmountWei) external onlyOwner {
        if (targetAmountWei == 0) revert ZeroTarget();
        Cause storage c = causes[causeId];
        if (c.targetAmount != 0) revert CauseAlreadyExists();
        c.targetAmount = targetAmountWei;
    }

    /// @notice Accepts a native-token donation for a cause and emits `CauseClosed` when the goal is first reached.
    function donate(uint256 causeId) external payable {
        if (msg.value == 0) revert ZeroDonation();
        Cause storage c = causes[causeId];
        if (c.targetAmount == 0) revert UnknownCause();

        c.raisedAmount += msg.value;
        emit Donation(causeId, msg.sender, msg.value, c.raisedAmount);

        if (!c.goalReachedEmitted && c.raisedAmount >= c.targetAmount) {
            c.goalReachedEmitted = true;
            emit CauseClosed(causeId, c.raisedAmount, c.targetAmount);
        }
    }

    /// @notice Withdraws funds raised for a specific cause (e.g. for off-chain disbursement workflows).
    /// @dev Capped at that cause's undrawn balance (`raisedAmount - withdrawnAmount`) so withdrawals
    ///      can always be attributed to, and audited against, the cause that raised them.
    function withdraw(uint256 causeId, uint256 amount, address payable to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        Cause storage c = causes[causeId];
        if (c.targetAmount == 0) revert UnknownCause();

        uint256 available = c.raisedAmount - c.withdrawnAmount;
        if (amount > available) revert InsufficientCauseBalance();

        c.withdrawnAmount += amount;
        emit Withdrawal(causeId, to, amount, c.withdrawnAmount);

        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    /// @notice Transfers contract ownership to a new address.
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
