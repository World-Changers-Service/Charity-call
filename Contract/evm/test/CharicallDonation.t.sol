// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, Vm} from "forge-std/Test.sol";
import {CharicallDonation} from "../src/CharicallDonation.sol";

contract Rejector {
    receive() external payable {
        revert("nope");
    }
}

contract CharicallDonationTest is Test {
    CharicallDonation internal donation;
    address internal owner = address(0xA11CE);
    address internal donor = address(0xD00d);
    address internal stranger = address(0xBEEF);

    uint256 internal constant CAUSE_ID = 1;
    uint256 internal constant TARGET = 1 ether;

    event Donation(uint256 indexed causeId, address indexed donor, uint256 amount, uint256 newTotalRaised);
    event CauseClosed(uint256 indexed causeId, uint256 totalRaised, uint256 targetAmount);
    event Withdrawal(uint256 indexed causeId, address indexed to, uint256 amount, uint256 totalWithdrawn);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function setUp() public {
        vm.prank(owner);
        donation = new CharicallDonation();
        vm.prank(owner);
        donation.createCause(CAUSE_ID, TARGET);
    }

    function test_emitsCauseClosed_whenTotalMeetsTarget() public {
        vm.deal(donor, TARGET);

        vm.expectEmit(true, true, true, true);
        emit CauseClosed(CAUSE_ID, TARGET, TARGET);

        vm.prank(donor);
        donation.donate{value: TARGET}(CAUSE_ID);
    }

    function test_emitsCauseClosed_whenTotalExceedsTargetInOneDonation() public {
        uint256 over = TARGET + 0.5 ether;
        vm.deal(donor, over);

        vm.expectEmit(true, true, true, true);
        emit CauseClosed(CAUSE_ID, over, TARGET);

        vm.prank(donor);
        donation.donate{value: over}(CAUSE_ID);
    }

    function test_emitsCauseClosed_onlyOnce_afterGoalReached() public {
        vm.deal(donor, 10 ether);

        vm.prank(donor);
        donation.donate{value: TARGET}(CAUSE_ID);

        vm.recordLogs();
        vm.prank(donor);
        donation.donate{value: 0.1 ether}(CAUSE_ID);
        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 causeClosedSig = keccak256("CauseClosed(uint256,uint256,uint256)");

        for (uint256 i = 0; i < logs.length; i++) {
            assertFalse(logs[i].topics[0] == causeClosedSig, "CauseClosed must not fire twice");
        }
    }

    function test_partialDonations_thenCauseClosed() public {
        vm.deal(donor, TARGET);

        vm.prank(donor);
        donation.donate{value: TARGET / 2}(CAUSE_ID);

        vm.expectEmit(true, true, true, true);
        emit CauseClosed(CAUSE_ID, TARGET, TARGET);

        vm.prank(donor);
        donation.donate{value: TARGET / 2}(CAUSE_ID);
    }

    // --- createCause ---

    function test_createCause_revertsForNonOwner() public {
        vm.prank(stranger);
        vm.expectRevert(CharicallDonation.NotOwner.selector);
        donation.createCause(2, TARGET);
    }

    function test_createCause_revertsForZeroTarget() public {
        vm.prank(owner);
        vm.expectRevert(CharicallDonation.ZeroTarget.selector);
        donation.createCause(2, 0);
    }

    function test_createCause_revertsIfCauseAlreadyExists() public {
        vm.prank(owner);
        vm.expectRevert(CharicallDonation.CauseAlreadyExists.selector);
        donation.createCause(CAUSE_ID, TARGET);
    }

    // --- donate ---

    function test_donate_revertsForZeroValue() public {
        vm.prank(donor);
        vm.expectRevert(CharicallDonation.ZeroDonation.selector);
        donation.donate{value: 0}(CAUSE_ID);
    }

    function test_donate_revertsForUnknownCause() public {
        vm.deal(donor, 1 ether);
        vm.prank(donor);
        vm.expectRevert(CharicallDonation.UnknownCause.selector);
        donation.donate{value: 1 ether}(999);
    }

    // --- withdraw ---

    function test_withdraw_revertsForNonOwner() public {
        vm.deal(donor, TARGET);
        vm.prank(donor);
        donation.donate{value: TARGET}(CAUSE_ID);

        vm.prank(stranger);
        vm.expectRevert(CharicallDonation.NotOwner.selector);
        donation.withdraw(CAUSE_ID, TARGET, payable(stranger));
    }

    function test_withdraw_revertsForZeroAddress() public {
        vm.deal(donor, TARGET);
        vm.prank(donor);
        donation.donate{value: TARGET}(CAUSE_ID);

        vm.prank(owner);
        vm.expectRevert(CharicallDonation.ZeroAddress.selector);
        donation.withdraw(CAUSE_ID, TARGET, payable(address(0)));
    }

    function test_withdraw_revertsForUnknownCause() public {
        vm.prank(owner);
        vm.expectRevert(CharicallDonation.UnknownCause.selector);
        donation.withdraw(999, 1, payable(owner));
    }

    function test_withdraw_revertsWhenExceedingCauseBalance() public {
        vm.deal(donor, TARGET);
        vm.prank(donor);
        donation.donate{value: TARGET}(CAUSE_ID);

        vm.prank(owner);
        vm.expectRevert(CharicallDonation.InsufficientCauseBalance.selector);
        donation.withdraw(CAUSE_ID, TARGET + 1, payable(owner));
    }

    function test_withdraw_transfersFundsAndEmitsEvent() public {
        vm.deal(donor, TARGET);
        vm.prank(donor);
        donation.donate{value: TARGET}(CAUSE_ID);

        uint256 balanceBefore = owner.balance;

        vm.expectEmit(true, true, true, true);
        emit Withdrawal(CAUSE_ID, owner, TARGET, TARGET);

        vm.prank(owner);
        donation.withdraw(CAUSE_ID, TARGET, payable(owner));

        assertEq(owner.balance, balanceBefore + TARGET);
        (,, uint256 withdrawnAmount,) = donation.causes(CAUSE_ID);
        assertEq(withdrawnAmount, TARGET);
    }

    function test_withdraw_allowsPartialThenRemainingWithdrawal() public {
        vm.deal(donor, TARGET);
        vm.prank(donor);
        donation.donate{value: TARGET}(CAUSE_ID);

        vm.prank(owner);
        donation.withdraw(CAUSE_ID, TARGET / 2, payable(owner));

        vm.prank(owner);
        vm.expectRevert(CharicallDonation.InsufficientCauseBalance.selector);
        donation.withdraw(CAUSE_ID, TARGET, payable(owner));

        vm.prank(owner);
        donation.withdraw(CAUSE_ID, TARGET / 2, payable(owner));

        (,, uint256 withdrawnAmount,) = donation.causes(CAUSE_ID);
        assertEq(withdrawnAmount, TARGET);
    }

    function test_withdraw_doesNotDrainOtherCauses() public {
        uint256 otherCauseId = 2;
        vm.prank(owner);
        donation.createCause(otherCauseId, TARGET);

        vm.deal(donor, TARGET * 2);
        vm.startPrank(donor);
        donation.donate{value: TARGET}(CAUSE_ID);
        donation.donate{value: TARGET}(otherCauseId);
        vm.stopPrank();

        vm.prank(owner);
        vm.expectRevert(CharicallDonation.InsufficientCauseBalance.selector);
        donation.withdraw(otherCauseId, TARGET + 1, payable(owner));

        vm.prank(owner);
        donation.withdraw(CAUSE_ID, TARGET, payable(owner));

        (,, uint256 otherWithdrawn,) = donation.causes(otherCauseId);
        assertEq(otherWithdrawn, 0);
    }

    function test_withdraw_revertsWhenRecipientRejectsEther() public {
        vm.deal(donor, TARGET);
        vm.prank(donor);
        donation.donate{value: TARGET}(CAUSE_ID);

        Rejector rejector = new Rejector();

        vm.prank(owner);
        vm.expectRevert(CharicallDonation.TransferFailed.selector);
        donation.withdraw(CAUSE_ID, TARGET, payable(address(rejector)));
    }

    // --- transferOwnership ---

    function test_transferOwnership_revertsForNonOwner() public {
        vm.prank(stranger);
        vm.expectRevert(CharicallDonation.NotOwner.selector);
        donation.transferOwnership(stranger);
    }

    function test_transferOwnership_revertsForZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(CharicallDonation.ZeroAddress.selector);
        donation.transferOwnership(address(0));
    }

    function test_transferOwnership_updatesOwnerAndEmitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit OwnershipTransferred(owner, stranger);

        vm.prank(owner);
        donation.transferOwnership(stranger);

        assertEq(donation.owner(), stranger);

        vm.prank(owner);
        vm.expectRevert(CharicallDonation.NotOwner.selector);
        donation.createCause(3, TARGET);
    }
}
