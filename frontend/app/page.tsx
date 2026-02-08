'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { EmployerDashboard } from '@/components/dashboard/EmployerDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Wallet, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center space-y-8 p-8 max-w-2xl">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Global Payroll Protocol
            </h1>
            <p className="text-xl text-muted-foreground">
              Stream salaries globally with real-time payments, auto-conversion, and cross-chain settlements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <TrendingUp className="w-8 h-8 mb-3 text-blue-600" />
              <h3 className="font-semibold mb-2">Real-time Streaming</h3>
              <p className="text-sm text-muted-foreground">
                Employees earn salary every second, claim anytime
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Wallet className="w-8 h-8 mb-3 text-purple-600" />
              <h3 className="font-semibold mb-2">Auto-Conversion</h3>
              <p className="text-sm text-muted-foreground">
                Automatic token swaps via Uniswap V4
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Users className="w-8 h-8 mb-3 text-pink-600" />
              <h3 className="font-semibold mb-2">Cross-Chain</h3>
              <p className="text-sm text-muted-foreground">
                Pay globally across 10+ chains via Yellow
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ConnectButton />
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>Built for HackMoney 2026</p>
            <div className="flex items-center justify-center gap-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                Uniswap V4
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                Yellow Network
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Global Payroll</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="employer" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="employer">
              <Briefcase className="w-4 h-4 mr-2" />
              Employer
            </TabsTrigger>
            <TabsTrigger value="employee">
              <Wallet className="w-4 h-4 mr-2" />
              Employee
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employer">
            <EmployerDashboard address={address!} />
          </TabsContent>

          <TabsContent value="employee">
            <EmployeeDashboard address={address!} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Built with ❤️ for HackMoney 2026 | Powered by Uniswap V4 & Yellow Network</p>
        </div>
      </footer>
    </div>
  );
}