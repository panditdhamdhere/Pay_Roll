// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/// @title PayrollMath
/// @notice Mathematical operations for payroll streaming calculations
library PayrollMath {
    uint256 private constant PRECISION = 1e18;
    uint256 private constant SECONDS_PER_YEAR = 365 days;
    uint256 private constant SECONDS_PER_MONTH = 30 days;

    /// @notice Calculate accrued payment for a streaming salary
    function calculateAccrued(
        uint256 salary,
        uint256 startTime,
        uint256 endTime,
        uint256 lastClaimTime,
        uint256 currentTime
    ) internal pure returns (uint256 accrued) {
        if (currentTime < startTime) {
            return 0;
        }

        uint256 effectiveEndTime = endTime == 0 ? currentTime : min(endTime, currentTime);
        uint256 effectiveStartTime = max(lastClaimTime, startTime);

        if (effectiveEndTime <= effectiveStartTime) {
            return 0;
        }

        uint256 timeElapsed = effectiveEndTime - effectiveStartTime;
        uint256 perSecondRate = (salary * PRECISION) / SECONDS_PER_YEAR;
        accrued = (perSecondRate * timeElapsed) / PRECISION;

        return accrued;
    }

    /// @notice Calculate total streamed amount from start to current time
    function calculateTotalStreamed(
        uint256 salary,
        uint256 startTime,
        uint256 currentTime
    ) internal pure returns (uint256 total) {
        if (currentTime <= startTime) {
            return 0;
        }

        uint256 timeElapsed = currentTime - startTime;
        uint256 perSecondRate = (salary * PRECISION) / SECONDS_PER_YEAR;
        total = (perSecondRate * timeElapsed) / PRECISION;

        return total;
    }

    /// @notice Calculate remaining balance in a stream
    function calculateRemaining(
        uint256 totalDeposited,
        uint256 alreadyClaimed
    ) internal pure returns (uint256 remaining) {
        if (totalDeposited <= alreadyClaimed) {
            return 0;
        }
        remaining = totalDeposited - alreadyClaimed;
        return remaining;
    }

    /// @notice Calculate pro-rated amount for partial period
    function calculateProRated(
        uint256 fullAmount,
        uint256 actualDuration,
        uint256 fullDuration
    ) internal pure returns (uint256 proRated) {
        if (fullDuration == 0) {
            return 0;
        }
        proRated = (fullAmount * actualDuration) / fullDuration;
        return proRated;
    }

    /// @notice Apply protocol fee to an amount
    function applyFee(
        uint256 amount,
        uint256 feeBps
    ) internal pure returns (uint256 fee, uint256 amountAfterFee) {
        fee = (amount * feeBps) / 10_000;
        amountAfterFee = amount - fee;
        return (fee, amountAfterFee);
    }

    /// @notice Calculate expected swap output with slippage
    function calculateMinOutput(
        uint256 amountIn,
        uint256 spotPrice,
        uint256 slippageBps
    ) internal pure returns (uint256 minAmountOut) {
        uint256 expectedOut = (amountIn * spotPrice) / PRECISION;
        uint256 slippage = (expectedOut * slippageBps) / 10_000;
        minAmountOut = expectedOut - slippage;
        return minAmountOut;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    function annualToMonthly(uint256 annualSalary) internal pure returns (uint256) {
        return annualSalary / 12;
    }

    function monthlyToAnnual(uint256 monthlySalary) internal pure returns (uint256) {
        return monthlySalary * 12;
    }

    function calculateDaysWorked(
        uint256 startTime,
        uint256 currentTime
    ) internal pure returns (uint256) {
                uint256 days;

        if (currentTime <= startTime) {
            return 0;
        }
        days = (currentTime - startTime) / 1 days;
        return days;
    }
}