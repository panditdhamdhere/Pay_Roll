// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/// @title PayrollEvents
/// @notice Centralized events for the payroll protocol
library PayrollEvents {
    // Employee Management
    event EmployeeAdded(
        address indexed employer,
        address indexed employee,
        uint256 indexed streamId,
        uint256 salary,
        address paymentToken,
        uint256 startTime
    );

    event EmployeeRemoved(
        address indexed employer,
        address indexed employee,
        uint256 indexed streamId,
        uint256 finalPayment
    );

    event SalaryUpdated(
        address indexed employee,
        uint256 indexed streamId,
        uint256 oldSalary,
        uint256 newSalary
    );

    // Stream Operations
    event StreamCreated(
        uint256 indexed streamId,
        address indexed employer,
        address indexed employee,
        uint256 salary,
        address depositToken,
        address paymentToken,
        uint256 startTime,
        uint256 duration
    );

    event StreamPaused(
        uint256 indexed streamId,
        address indexed employee,
        uint256 pausedAt,
        uint256 accruedAmount
    );

    event StreamResumed(
        uint256 indexed streamId,
        address indexed employee,
        uint256 resumedAt
    );

    event StreamCancelled(
        uint256 indexed streamId,
        address indexed employee,
        uint256 cancelledAt,
        uint256 finalPayment
    );

    // Payment Events
    event PaymentClaimed(
        uint256 indexed streamId,
        address indexed employee,
        uint256 amount,
        address token,
        uint256 timestamp
    );

    event BatchPaymentProcessed(
        address indexed employer,
        uint256 employeeCount,
        uint256 totalAmount,
        uint256 timestamp
    );

    // Swap Events
    event TokenSwapped(
        uint256 indexed streamId,
        address indexed fromToken,
        address indexed toToken,
        uint256 amountIn,
        uint256 amountOut,
        address swapRouter
    );

    event SlippageExceeded(
        uint256 indexed streamId,
        uint256 expectedAmount,
        uint256 actualAmount,
        uint256 slippageBps
    );

    // Treasury Events
    event TreasuryDeposit(
        address indexed employer,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    event TreasuryWithdrawal(
        address indexed employer,
        address indexed token,
        uint256 amount,
        address recipient,
        uint256 timestamp
    );

    // Cross-Chain Events
    event CrossChainPaymentInitiated(
        uint256 indexed streamId,
        uint256 indexed destinationChainId,
        address employee,
        uint256 amount,
        bytes32 bridgeTransactionId
    );

    event CrossChainPaymentCompleted(
        uint256 indexed streamId,
        uint256 indexed sourceChainId,
        address employee,
        uint256 amount,
        bytes32 bridgeTransactionId
    );

    // Protocol Events
    event ProtocolFeeUpdated(uint256 oldFee, uint256 newFee);
    event ProtocolFeeCollected(
        address indexed token,
        uint256 amount,
        address treasury
    );
    event EmergencyPause(address indexed caller, uint256 timestamp);
    event EmergencyUnpause(address indexed caller, uint256 timestamp);
}
