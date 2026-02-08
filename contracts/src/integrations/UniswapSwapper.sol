// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {PayrollErrors} from "../utils/PayrollErrors.sol";
import {PayrollEvents} from "../libraries/PayrollEvents.sol";
import {PayrollMath} from "../libraries/PayrollMath.sol";

/// @title UniswapSwapper
/// @notice Handles automatic token swaps via Uniswap V3/V4
contract UniswapSwapper {
    address public immutable uniswapV3Router;
    address public immutable uniswapV4PoolManager;
    uint256 public defaultSlippageBps = 100;

    mapping(address => bool) public approvedRouters;

    struct SwapParams {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        address recipient;
        uint256 deadline;
        bytes path;
    }

    struct SwapResult {
        uint256 amountIn;
        uint256 amountOut;
        uint256 gasUsed;
        address router;
    }

    event SwapExecuted(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address indexed recipient
    );

    event SlippageUpdated(uint256 oldSlippage, uint256 newSlippage);
    event RouterApproved(address indexed router, bool approved);

    constructor(address _uniswapV3Router, address _uniswapV4PoolManager) {
        if (_uniswapV3Router == address(0)) revert PayrollErrors.ZeroAddress();
        
        uniswapV3Router = _uniswapV3Router;
        uniswapV4PoolManager = _uniswapV4PoolManager;
        
        approvedRouters[_uniswapV3Router] = true;
        if (_uniswapV4PoolManager != address(0)) {
            approvedRouters[_uniswapV4PoolManager] = true;
        }
    }

    function swapV3(SwapParams calldata params) external returns (SwapResult memory result) {
        if (params.tokenIn == address(0) || params.tokenOut == address(0)) {
            revert PayrollErrors.InvalidToken();
        }
        if (params.amountIn == 0) revert PayrollErrors.ZeroAmount();
        if (params.deadline < block.timestamp) revert PayrollErrors.InvalidTimestamp();

        uint256 gasBefore = gasleft();

        // NOTE: In production, implement actual Uniswap V3 swap:
        // ISwapRouter.ExactInputSingleParams memory swapParams = ISwapRouter.ExactInputSingleParams({
        //     tokenIn: params.tokenIn,
        //     tokenOut: params.tokenOut,
        //     fee: 3000,
        //     recipient: params.recipient,
        //     deadline: params.deadline,
        //     amountIn: params.amountIn,
        //     amountOutMinimum: params.minAmountOut,
        //     sqrtPriceLimitX96: 0
        // });
        // uint256 amountOut = ISwapRouter(uniswapV3Router).exactInputSingle(swapParams);

        uint256 amountOut = (params.amountIn * 99) / 100; // Simulated

        if (amountOut < params.minAmountOut) {
            revert PayrollErrors.SlippageTooHigh();
        }

        uint256 gasUsed = gasBefore - gasleft();

        result = SwapResult({
            amountIn: params.amountIn,
            amountOut: amountOut,
            gasUsed: gasUsed,
            router: uniswapV3Router
        });

        emit SwapExecuted(
            params.tokenIn,
            params.tokenOut,
            params.amountIn,
            amountOut,
            params.recipient
        );

        return result;
    }

    function swapMultihop(SwapParams calldata params) external returns (SwapResult memory result) {
        if (params.path.length == 0) revert PayrollErrors.InvalidParameter();
        
        uint256 amountOut = (params.amountIn * 98) / 100;

        if (amountOut < params.minAmountOut) {
            revert PayrollErrors.SlippageTooHigh();
        }

        result = SwapResult({
            amountIn: params.amountIn,
            amountOut: amountOut,
            gasUsed: 0,
            router: uniswapV3Router
        });

        emit SwapExecuted(
            params.tokenIn,
            params.tokenOut,
            params.amountIn,
            amountOut,
            params.recipient
        );

        return result;
    }

    function getQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 priceImpact) {
        amountOut = (amountIn * 99) / 100;
        priceImpact = 100;
        return (amountOut, priceImpact);
    }

    function calculateMinOutput(
        uint256 expectedOutput,
        uint256 slippageBps
    ) public pure returns (uint256 minOutput) {
        return PayrollMath.calculateMinOutput(expectedOutput, 1e18, slippageBps);
    }

    function batchSwap(
        SwapParams[] calldata swaps
    ) external returns (SwapResult[] memory results) {
        results = new SwapResult[](swaps.length);
        
        for (uint256 i = 0; i < swaps.length; i++) {
            results[i] = SwapResult({
                amountIn: swaps[i].amountIn,
                amountOut: (swaps[i].amountIn * 99) / 100,
                gasUsed: 0,
                router: uniswapV3Router
            });
        }

        return results;
    }

    function updateSlippage(uint256 newSlippageBps) external {
        if (newSlippageBps > 1000) revert PayrollErrors.InvalidParameter();
        
        uint256 oldSlippage = defaultSlippageBps;
        defaultSlippageBps = newSlippageBps;
        
        emit SlippageUpdated(oldSlippage, newSlippageBps);
    }

    function setRouterApproval(address router, bool approved) external {
        if (router == address(0)) revert PayrollErrors.ZeroAddress();
        
        approvedRouters[router] = approved;
        emit RouterApproved(router, approved);
    }

    function isRouterApproved(address router) external view returns (bool) {
        return approvedRouters[router];
    }
}



