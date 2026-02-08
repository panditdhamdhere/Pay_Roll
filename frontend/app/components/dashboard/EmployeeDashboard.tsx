'use client';

import { formatEther } from 'viem';
import { Wallet, TrendingUp, Clock } from 'lucide-react';
import { useGetEmployeeStreams } from '@/hooks/usePayrollStream';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StreamCard } from '@/components/StreamCard';

interface EmployeeDashboardProps {
    address: `0x${string}`;
}

export function EmployeeDashboard({ address }: EmployeeDashboardProps) {
    const { data: streamIds, isLoading } = useGetEmployeeStreams(address);

    const stats = [
        {
            title: 'Active Streams',
            value: streamIds?.length || 0,
            icon: TrendingUp,
            color: 'text-green-600',
        },
        {
            title: 'Available to Claim',
            value: '$0',
            icon: Wallet,
            color: 'text-blue-600',
        },
        {
            title: 'Total Earned',
            value: '$0',
            icon: Clock,
            color: 'text-purple-600',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Your Salary Streams</h2>
                <p className="text-muted-foreground">
                    View and claim your streaming salary payments
                </p>
            </div>

            {/* Streams List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-20 bg-muted rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : streamIds && streamIds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {streamIds.map((streamId) => (
                        <StreamCard key={streamId.toString()} streamId={streamId} isEmployer={false} />
                    ))}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardHeader className="text-center py-12">
                        <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <CardTitle>No active streams</CardTitle>
                        <CardDescription>
                            You don't have any active salary streams yet
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}
