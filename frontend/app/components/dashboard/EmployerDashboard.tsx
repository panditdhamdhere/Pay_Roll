'use client';

import { useState } from 'react';
import { formatEther, parseEther } from 'viem';
import { Plus, Users, DollarSign, Activity } from 'lucide-react';
import { useGetEmployerStreams } from '@/hooks/usePayrollStream';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateStreamDialog } from '@/components/CreateStreamDialog';
import { StreamCard } from '@/components/StreamCard';

interface EmployerDashboardProps {
    address: `0x${string}`;
}

export function EmployerDashboard({ address }: EmployerDashboardProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const { data: streamIds, isLoading } = useGetEmployerStreams(address);

    const stats = [
        {
            title: 'Active Streams',
            value: streamIds?.length || 0,
            icon: Activity,
            color: 'text-blue-600',
        },
        {
            title: 'Total Employees',
            value: streamIds?.length || 0,
            icon: Users,
            color: 'text-green-600',
        },
        {
            title: 'Monthly Cost',
            value: '$0',
            icon: DollarSign,
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Your Payroll Streams</h2>
                    <p className="text-muted-foreground">
                        Manage employee salaries and payment streams
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Stream
                </Button>
            </div>

            {/* Streams List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
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
                        <StreamCard key={streamId.toString()} streamId={streamId} isEmployer={true} />
                    ))}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardHeader className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <CardTitle>No streams yet</CardTitle>
                        <CardDescription>
                            Create your first payroll stream to start paying employees
                        </CardDescription>
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            className="mt-4 mx-auto"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Stream
                        </Button>
                    </CardHeader>
                </Card>
            )}

            {/* Create Stream Dialog */}
            <CreateStreamDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
        </div>
    );
}