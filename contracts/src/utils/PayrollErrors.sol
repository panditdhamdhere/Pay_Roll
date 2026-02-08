// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/// @title PayrollErrors
/// @notice Custom errors for gas-efficient error handling (2026 best practice)
library PayrollErrors {
    // Access Control Errors
    error Unauthorized();
    error NotEmployee();
    error NotEmployer();
    error AlreadyEmployee();

    // Stream Errors
    error StreamNotActive();
    error StreamAlreadyActive();
    error InsufficientBalance();
    error NoPaymentDue();
    error StreamNotFound();
    error InvalidStreamDuration();
    error InvalidSalary();

    // Withdrawal Errors
    error WithdrawalFailed();
    error NothingToWithdraw();
    error WithdrawalTooFrequent();

    // Swap Errors
    error SwapFailed();
    error SlippageTooHigh();
    error InvalidToken();
    error InsufficientLiquidity();

    // Validation Errors
    error ZeroAddress();
    error ZeroAmount();
    error InvalidParameter();
    error ArrayLengthMismatch();

    // State Errors
    error ContractPaused();
    error ContractNotPaused();
    error AlreadyInitialized();

    // Yellow Integration Errors
    error YellowBridgeFailed();
    error CrossChainTransferFailed();
    error UnsupportedChain();

    // Time Errors
    error StreamNotStarted();
    error StreamEnded();
    error InvalidTimestamp();
}