import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  sepolia,
  base,
  arbitrum,
  optimism,
  polygon,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Global Payroll Protocol',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    sepolia,
    base,
    arbitrum,
    optimism,
    polygon,
  ],
  ssr: true, // Enable for Next.js SSR
});

// Contract addresses by chain
export const CONTRACTS = {
  [sepolia.id]: {
    PayrollStream: process.env.NEXT_PUBLIC_PAYROLL_STREAM_SEPOLIA || '',
    UniswapSwapper: process.env.NEXT_PUBLIC_UNISWAP_SWAPPER_SEPOLIA || '',
    YellowBridge: process.env.NEXT_PUBLIC_YELLOW_BRIDGE_SEPOLIA || '',
  },
  [base.id]: {
    PayrollStream: process.env.NEXT_PUBLIC_PAYROLL_STREAM_BASE || '',
    UniswapSwapper: process.env.NEXT_PUBLIC_UNISWAP_SWAPPER_BASE || '',
    YellowBridge: process.env.NEXT_PUBLIC_YELLOW_BRIDGE_BASE || '',
  },
  [arbitrum.id]: {
    PayrollStream: process.env.NEXT_PUBLIC_PAYROLL_STREAM_ARBITRUM || '',
    UniswapSwapper: process.env.NEXT_PUBLIC_UNISWAP_SWAPPER_ARBITRUM || '',
    YellowBridge: process.env.NEXT_PUBLIC_YELLOW_BRIDGE_ARBITRUM || '',
  },
} as const;

// Supported tokens by chain
export const TOKENS = {
  [sepolia.id]: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    DAI: '0x68194a729C2450ad26072b3D33ADaCbcef39D574',
    USDT: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
  },
  [base.id]: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  },
  [arbitrum.id]: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
} as const;