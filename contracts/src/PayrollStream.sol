// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {PayrollErrors} from "./utils/PayrollErrors.sol";
import {PayrollEvents} from "./libraries/PayrollEvents.sol";
import {PayrollMath} from "./libraries/PayrollMath.sol";

/// @title PayrollStream
/// @notice Core contract for streaming payroll payments
contract PayrollStream {
    using PayrollMath for uint256;

    uint256 public constant PROTOCOL_FEE_BPS = 50;
    uint256 public constant MAX_SLIPPAGE_BPS = 500;
    uint256 public constant MIN_WITHDRAWAL_INTERVAL = 1 hours;

    uint256 private _streamIdCounter;
    address public protocolTreasury;
    bool public paused;

    struct Stream {
        address employer;
        address employee;
        uint256 salary;
        address depositToken;
        address paymentToken;
        uint256 startTime;
        uint256 endTime;
        uint256 lastClaimTime;
        uint256 totalClaimed;
        uint256 depositedAmount;
        bool active;
        bool paused;
    }

    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public employeeStreams;
    mapping(address => uint256[]) public employerStreams;
    mapping(address => uint256) public lastWithdrawalTime;

    modifier onlyEmployee(uint256 streamId) {
        if (streams[streamId].employee != msg.sender) {
            revert PayrollErrors.NotEmployee();
        }
        _;
    }

    modifier onlyEmployer(uint256 streamId) {
        if (streams[streamId].employer != msg.sender) {
            revert PayrollErrors.NotEmployer();
        }
        _;
    }

    modifier whenNotPaused() {
        if (paused) {
            revert PayrollErrors.ContractPaused();
        }
        _;
    }

    modifier whenPaused() {
        if (!paused) {
            revert PayrollErrors.ContractNotPaused();
        }
        _;
    }

    modifier validStream(uint256 streamId) {
        if (streams[streamId].employer == address(0)) {
            revert PayrollErrors.StreamNotFound();
        }
        _;
    }

    constructor(address _protocolTreasury) {
        if (_protocolTreasury == address(0)) {
            revert PayrollErrors.ZeroAddress();
        }
        protocolTreasury = _protocolTreasury;
        _streamIdCounter = 1;
    }

    function createStream(
        address employee,
        uint256 salary,
        address depositToken,
        address paymentToken,
        uint256 startTime,
        uint256 duration
    ) external whenNotPaused returns (uint256 streamId) {
        if (employee == address(0)) revert PayrollErrors.ZeroAddress();
        if (salary == 0) revert PayrollErrors.InvalidSalary();
        if (depositToken == address(0) || paymentToken == address(0)) {
            revert PayrollErrors.InvalidToken();
        }
        if (startTime < block.timestamp)
            revert PayrollErrors.InvalidTimestamp();

        streamId = _streamIdCounter++;
        uint256 endTime = duration == 0 ? 0 : startTime + duration;

        streams[streamId] = Stream({
            employer: msg.sender,
            employee: employee,
            salary: salary,
            depositToken: depositToken,
            paymentToken: paymentToken,
            startTime: startTime,
            endTime: endTime,
            lastClaimTime: startTime,
            totalClaimed: 0,
            depositedAmount: 0,
            active: true,
            paused: false
        });

        employeeStreams[employee].push(streamId);
        employerStreams[msg.sender].push(streamId);

        emit PayrollEvents.StreamCreated(
            streamId,
            msg.sender,
            employee,
            salary,
            depositToken,
            paymentToken,
            startTime,
            duration
        );

        return streamId;
    }

    function depositToStream(
        uint256 streamId,
        uint256 amount
    ) external whenNotPaused validStream(streamId) onlyEmployer(streamId) {
        if (amount == 0) revert PayrollErrors.ZeroAmount();

        Stream storage stream = streams[streamId];

        // NOTE: In production, add actual token transfer:
        // IERC20(stream.depositToken).safeTransferFrom(msg.sender, address(this), amount);

        stream.depositedAmount += amount;

        emit PayrollEvents.TreasuryDeposit(
            msg.sender,
            stream.depositToken,
            amount,
            block.timestamp
        );
    }

    function claimSalary(
        uint256 streamId
    )
        external
        whenNotPaused
        validStream(streamId)
        onlyEmployee(streamId)
        returns (uint256 claimed)
    {
        Stream storage stream = streams[streamId];

        if (!stream.active) revert PayrollErrors.StreamNotActive();
        if (stream.paused) revert PayrollErrors.StreamNotActive();

        if (
            block.timestamp <
            lastWithdrawalTime[msg.sender] + MIN_WITHDRAWAL_INTERVAL
        ) {
            revert PayrollErrors.WithdrawalTooFrequent();
        }

        uint256 accrued = PayrollMath.calculateAccrued(
            stream.salary,
            stream.startTime,
            stream.endTime,
            stream.lastClaimTime,
            block.timestamp
        );

        if (accrued == 0) revert PayrollErrors.NoPaymentDue();

        uint256 remaining = PayrollMath.calculateRemaining(
            stream.depositedAmount,
            stream.totalClaimed
        );

        if (remaining < accrued) revert PayrollErrors.InsufficientBalance();

        (uint256 fee, uint256 amountAfterFee) = PayrollMath.applyFee(
            accrued,
            PROTOCOL_FEE_BPS
        );

        stream.lastClaimTime = block.timestamp;
        stream.totalClaimed += accrued;
        lastWithdrawalTime[msg.sender] = block.timestamp;

        // NOTE: In production, add actual token transfers:
        // IERC20(stream.paymentToken).safeTransfer(protocolTreasury, fee);
        // IERC20(stream.paymentToken).safeTransfer(msg.sender, amountAfterFee);

        emit PayrollEvents.PaymentClaimed(
            streamId,
            msg.sender,
            amountAfterFee,
            stream.paymentToken,
            block.timestamp
        );

        emit PayrollEvents.ProtocolFeeCollected(
            stream.paymentToken,
            fee,
            protocolTreasury
        );

        return amountAfterFee;
    }

    function pauseStream(
        uint256 streamId
    ) external validStream(streamId) onlyEmployer(streamId) {
        Stream storage stream = streams[streamId];

        if (stream.paused) revert PayrollErrors.StreamNotActive();

        stream.paused = true;

        uint256 accrued = PayrollMath.calculateAccrued(
            stream.salary,
            stream.startTime,
            stream.endTime,
            stream.lastClaimTime,
            block.timestamp
        );

        emit PayrollEvents.StreamPaused(
            streamId,
            stream.employee,
            block.timestamp,
            accrued
        );
    }

    function resumeStream(
        uint256 streamId
    ) external validStream(streamId) onlyEmployer(streamId) {
        Stream storage stream = streams[streamId];

        if (!stream.paused) revert PayrollErrors.StreamNotActive();

        stream.paused = false;
        stream.lastClaimTime = block.timestamp;

        emit PayrollEvents.StreamResumed(
            streamId,
            stream.employee,
            block.timestamp
        );
    }

    function cancelStream(
        uint256 streamId
    ) external validStream(streamId) onlyEmployer(streamId) {
        Stream storage stream = streams[streamId];

        if (!stream.active) revert PayrollErrors.StreamNotActive();

        uint256 finalPayment = PayrollMath.calculateAccrued(
            stream.salary,
            stream.startTime,
            stream.endTime,
            stream.lastClaimTime,
            block.timestamp
        );

        stream.active = false;
        stream.endTime = block.timestamp;

        emit PayrollEvents.StreamCancelled(
            streamId,
            stream.employee,
            block.timestamp,
            finalPayment
        );
    }

    function getClaimableAmount(
        uint256 streamId
    ) external view returns (uint256 claimable) {
        Stream memory stream = streams[streamId];

        if (!stream.active || stream.paused) {
            return 0;
        }

        uint256 accrued = PayrollMath.calculateAccrued(
            stream.salary,
            stream.startTime,
            stream.endTime,
            stream.lastClaimTime,
            block.timestamp
        );

        uint256 remaining = PayrollMath.calculateRemaining(
            stream.depositedAmount,
            stream.totalClaimed
        );

        claimable = accrued > remaining ? remaining : accrued;

        (, uint256 afterFee) = PayrollMath.applyFee(
            claimable,
            PROTOCOL_FEE_BPS
        );

        return afterFee;
    }

    function getEmployeeStreams(
        address employee
    ) external view returns (uint256[] memory) {
        return employeeStreams[employee];
    }

    function getEmployerStreams(
        address employer
    ) external view returns (uint256[] memory) {
        return employerStreams[employer];
    }

    function getStream(uint256 streamId) external view returns (Stream memory) {
        return streams[streamId];
    }

    function emergencyPause() external {
        paused = true;
        emit PayrollEvents.EmergencyPause(msg.sender, block.timestamp);
    }

    function emergencyUnpause() external {
        paused = false;
        emit PayrollEvents.EmergencyUnpause(msg.sender, block.timestamp);
    }
}
