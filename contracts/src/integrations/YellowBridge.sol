// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {PayrollErrors} from "../utils/PayrollErrors.sol";
import {PayrollEvents} from "../libraries/PayrollEvents.sol";

/// @title YellowBridge
/// @notice Integration with Yellow Network for cross-chain payroll
contract YellowBridge {
    address public immutable yellowSettlement;
    mapping(uint256 => bool) public supportedChains;
    mapping(uint256 => address) public chainBridges;
    uint256 private _bridgeNonce;
    mapping(bytes32 => CrossChainTransfer) public pendingTransfers;

    struct CrossChainTransfer {
        uint256 sourceChainId;
        uint256 destinationChainId;
        address sender;
        address recipient;
        address token;
        uint256 amount;
        uint256 timestamp;
        TransferStatus status;
        bytes32 yellowTxId;
    }

    enum TransferStatus {
        Pending,
        Confirmed,
        Failed,
        Cancelled
    }

    event CrossChainTransferInitiated(
        bytes32 indexed transferId,
        uint256 indexed destinationChainId,
        address indexed recipient,
        uint256 amount,
        bytes32 yellowTxId
    );

    event CrossChainTransferCompleted(
        bytes32 indexed transferId,
        bytes32 indexed yellowTxId,
        uint256 amount
    );

    event CrossChainTransferFailed(bytes32 indexed transferId, string reason);

    event ChainSupportUpdated(uint256 indexed chainId, bool supported);
    event BridgeAddressUpdated(uint256 indexed chainId, address bridgeAddress);

    constructor(address _yellowSettlement) {
        if (_yellowSettlement == address(0)) revert PayrollErrors.ZeroAddress();
        yellowSettlement = _yellowSettlement;

        _addSupportedChain(1, address(0));
        _addSupportedChain(42161, address(0));
        _addSupportedChain(8453, address(0));
        _addSupportedChain(10, address(0));
        _addSupportedChain(137, address(0));
    }

    function initiatePayment(
        uint256 destinationChainId,
        address recipient,
        address token,
        uint256 amount
    ) external returns (bytes32 transferId, bytes32 yellowTxId) {
        if (!supportedChains[destinationChainId]) {
            revert PayrollErrors.UnsupportedChain();
        }
        if (recipient == address(0)) revert PayrollErrors.ZeroAddress();
        if (amount == 0) revert PayrollErrors.ZeroAmount();

        transferId = keccak256(
            abi.encodePacked(
                block.chainid,
                destinationChainId,
                msg.sender,
                recipient,
                token,
                amount,
                _bridgeNonce++,
                block.timestamp
            )
        );

        yellowTxId = keccak256(abi.encodePacked(transferId, "YELLOW"));

        pendingTransfers[transferId] = CrossChainTransfer({
            sourceChainId: block.chainid,
            destinationChainId: destinationChainId,
            sender: msg.sender,
            recipient: recipient,
            token: token,
            amount: amount,
            timestamp: block.timestamp,
            status: TransferStatus.Pending,
            yellowTxId: yellowTxId
        });

        emit CrossChainTransferInitiated(
            transferId,
            destinationChainId,
            recipient,
            amount,
            yellowTxId
        );

        emit PayrollEvents.CrossChainPaymentInitiated(
            uint256(uint160(msg.sender)),
            destinationChainId,
            recipient,
            amount,
            yellowTxId
        );

        return (transferId, yellowTxId);
    }

    function completeTransfer(bytes32 transferId) external {
        CrossChainTransfer storage transfer = pendingTransfers[transferId];

        if (transfer.status != TransferStatus.Pending) {
            revert PayrollErrors.InvalidParameter();
        }

        transfer.status = TransferStatus.Confirmed;

        emit CrossChainTransferCompleted(
            transferId,
            transfer.yellowTxId,
            transfer.amount
        );

        emit PayrollEvents.CrossChainPaymentCompleted(
            uint256(uint160(transfer.sender)),
            transfer.sourceChainId,
            transfer.recipient,
            transfer.amount,
            transfer.yellowTxId
        );
    }

    function batchCrossChainPayment(
        uint256[] calldata destinationChainIds,
        address[] calldata recipients,
        address[] calldata tokens,
        uint256[] calldata amounts
    ) external returns (bytes32[] memory transferIds) {
        if (
            destinationChainIds.length != recipients.length ||
            recipients.length != tokens.length ||
            tokens.length != amounts.length
        ) {
            revert PayrollErrors.ArrayLengthMismatch();
        }

        transferIds = new bytes32[](destinationChainIds.length);

        for (uint256 i = 0; i < destinationChainIds.length; i++) {
            (bytes32 transferId, ) = initiatePayment(
                destinationChainIds[i],
                recipients[i],
                tokens[i],
                amounts[i]
            );
            transferIds[i] = transferId;
        }

        return transferIds;
    }

    function estimateFee(
        uint256 destinationChainId,
        uint256 amount
    ) external view returns (uint256 fee) {
        if (!supportedChains[destinationChainId]) {
            revert PayrollErrors.UnsupportedChain();
        }

        uint256 baseFee = 0.001 ether;
        uint256 percentFee = (amount * 10) / 10_000;
        fee = baseFee + percentFee;

        return fee;
    }

    function addSupportedChain(
        uint256 chainId,
        address bridgeAddress
    ) external {
        _addSupportedChain(chainId, bridgeAddress);
    }

    function removeSupportedChain(uint256 chainId) external {
        supportedChains[chainId] = false;
        emit ChainSupportUpdated(chainId, false);
    }

    function updateBridgeAddress(
        uint256 chainId,
        address bridgeAddress
    ) external {
        if (bridgeAddress == address(0)) revert PayrollErrors.ZeroAddress();

        chainBridges[chainId] = bridgeAddress;
        emit BridgeAddressUpdated(chainId, bridgeAddress);
    }

    function getTransfer(
        bytes32 transferId
    ) external view returns (CrossChainTransfer memory) {
        return pendingTransfers[transferId];
    }

    function isChainSupported(uint256 chainId) external view returns (bool) {
        return supportedChains[chainId];
    }

    function getBridgeAddress(uint256 chainId) external view returns (address) {
        return chainBridges[chainId];
    }

    function _addSupportedChain(
        uint256 chainId,
        address bridgeAddress
    ) internal {
        supportedChains[chainId] = true;
        if (bridgeAddress != address(0)) {
            chainBridges[chainId] = bridgeAddress;
        }
        emit ChainSupportUpdated(chainId, true);
    }
}
