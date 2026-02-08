// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {Script} from "forge-std/Script.sol";
import {PayrollStream} from "../src/PayrollStream.sol";
import {UniswapSwapper} from "../src/integrations/UniswapSwapper.sol";
import {YellowBridge} from "../src/integrations/YellowBridge.sol";

contract DeployPayrollProtocol is Script {
    address constant UNISWAP_V3_ROUTER_MAINNET =
        0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address constant UNISWAP_V3_ROUTER_SEPOLIA =
        0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address constant UNISWAP_V3_ROUTER_BASE =
        0x2626664c2603336E57B271c5C0b26F421741e481;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying with:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        address protocolTreasury = deployer;
        PayrollStream payrollStream = new PayrollStream(protocolTreasury);
        console.log("PayrollStream:", address(payrollStream));

        address uniswapRouter = getUniswapRouter();
        UniswapSwapper uniswapSwapper = new UniswapSwapper(
            uniswapRouter,
            address(0)
        );
        console.log("UniswapSwapper:", address(uniswapSwapper));

        YellowBridge yellowBridge = new YellowBridge(deployer);
        console.log("YellowBridge:", address(yellowBridge));

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
        console.log("PayrollStream:", address(payrollStream));
        console.log("UniswapSwapper:", address(uniswapSwapper));
        console.log("YellowBridge:", address(yellowBridge));
    }

    function getUniswapRouter() internal view returns (address) {
        if (block.chainid == 1) return UNISWAP_V3_ROUTER_MAINNET;
        if (block.chainid == 11155111) return UNISWAP_V3_ROUTER_SEPOLIA;
        if (block.chainid == 8453) return UNISWAP_V3_ROUTER_BASE;
        return UNISWAP_V3_ROUTER_SEPOLIA;
    }
}
