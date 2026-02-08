// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Test} from "forge-std/Test.sol";
import {PayrollStream} from "../src/PayrollStream.sol";
import {PayrollErrors} from "../src/utils/PayrollErrors.sol";

contract PayrollStreamTest is Test {
    PayrollStream public payroll;

    address public protocolTreasury = address(0x1);
    address public employer = address(0x2);
    address public employee = address(0x3);
    address public depositToken = address(0x4);
    address public paymentToken = address(0x5);

    uint256 public constant ANNUAL_SALARY = 100_000 ether;
    uint256 public constant ONE_YEAR = 365 days;

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

    function setUp() public {
        payroll = new PayrollStream(protocolTreasury);

        vm.label(protocolTreasury, "Treasury");
        vm.label(employer, "Employer");
        vm.label(employee, "Employee");
    }

    function test_Constructor() public view {
        assertEq(payroll.protocolTreasury(), protocolTreasury);
        assertFalse(payroll.paused());
    }

    function test_CreateStream() public {
        vm.startPrank(employer);

        uint256 startTime = block.timestamp + 1 days;

        uint256 streamId = payroll.createStream(
            employee,
            ANNUAL_SALARY,
            depositToken,
            paymentToken,
            startTime,
            ONE_YEAR
        );

        assertEq(streamId, 1);

        PayrollStream.Stream memory stream = payroll.getStream(streamId);
        assertEq(stream.employer, employer);
        assertEq(stream.employee, employee);
        assertEq(stream.salary, ANNUAL_SALARY);
        assertTrue(stream.active);

        vm.stopPrank();
    }

    function test_DepositToStream() public {
        vm.startPrank(employer);

        uint256 streamId = payroll.createStream(
            employee,
            ANNUAL_SALARY,
            depositToken,
            paymentToken,
            block.timestamp,
            ONE_YEAR
        );

        payroll.depositToStream(streamId, ANNUAL_SALARY);

        PayrollStream.Stream memory stream = payroll.getStream(streamId);
        assertEq(stream.depositedAmount, ANNUAL_SALARY);

        vm.stopPrank();
    }

    function test_GetClaimableAmount() public {
        vm.startPrank(employer);
        uint256 startTime = block.timestamp;

        uint256 streamId = payroll.createStream(
            employee,
            ANNUAL_SALARY,
            depositToken,
            paymentToken,
            startTime,
            ONE_YEAR
        );

        payroll.depositToStream(streamId, ANNUAL_SALARY);
        vm.stopPrank();

        assertEq(payroll.getClaimableAmount(streamId), 0);

        vm.warp(startTime + 1 days);
        uint256 claimable = payroll.getClaimableAmount(streamId);
        assertGt(claimable, 0);
    }

    function test_PauseStream() public {
        vm.startPrank(employer);

        uint256 streamId = payroll.createStream(
            employee,
            ANNUAL_SALARY,
            depositToken,
            paymentToken,
            block.timestamp,
            ONE_YEAR
        );

        payroll.pauseStream(streamId);

        PayrollStream.Stream memory stream = payroll.getStream(streamId);
        assertTrue(stream.paused);

        vm.stopPrank();
    }
}
