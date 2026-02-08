'use client';

import { useState, useEffect } from 'react';
import { formatEther, formatUnits } from 'viem';
import { Pause, Play, Wallet, Clock, DollarSign } from 'lucide-react';
import {
    useGetStream,
    useGetClaimableAmount,
    useClaimSalary,
    usePauseStream,
    useResumeStream,
} from '@/hooks/usePayrollStream';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDistance } from 'date-fns';

interface StreamCardProps {
    streamId: bigint;
    isEmployer: boolean;
}

export function StreamCard({ streamId, isEmployer }: StreamCardProps) {
    const { data: stream, refetch: refetchStream } = useGetStream(streamId);
    const { data: claimableAmount, refetch: refetchClaimable } = useGetClaimableAmount(streamId);
    const { claimSalary, isLoading: isClaiming } = useClaimSalary();
    const { pauseStream, isLoading: isPausing } = usePauseStream();
    const { resumeStream, isLoading: isResuming } = useResumeStream();

    const [displayClaimable, setDisplayClaimable] = useState('0');

    // Update claimable amount every second for smooth animation
    useEffect(() => {
        if (!stream || !stream.active || stream.paused) return;

        const interval = setInterval(() => {
            const now = BigInt(Math.floor(Date.now() / 1000));
            const timeElapsed = now - stream.lastClaimTime;
            const perSecondRate = stream.salary / BigInt(365 * 24 * 60 * 60);
            const estimated = timeElapsed * perSecondRate;

            setDisplayClaimable(formatEther(estimated));
        }, 1000);

        return () => clearInterval(interval);
    }, [stream]);

    if (!stream) {
        return null;
    }

    const handleClaim = async () => {
        await claimSalary(streamId);
        refetchStream();
        refetchClaimable();
    };

    const handlePause = async () => {
        await pauseStream(streamId);
        refetchStream();
    };

    const handleResume = async () => {
        await resumeStream(streamId);
        refetchStream();
    };

    const annualSalary = formatEther(stream.salary);
    const monthlySalary = (Number(annualSalary) / 12).toFixed(2);
    const totalClaimed = formatEther(stream.totalClaimed);
    const deposited = formatEther(stream.depositedAmount);
    const progress = stream.depositedAmount > 0n
        ? (Number(stream.totalClaimed) / Number(stream.depositedAmount)) * 100
        : 0;

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                        {isEmployer ? `Employee ${stream.employee.slice(0, 6)}...` : `Employer ${stream.employer.slice(0, 6)}...`}
                    </CardTitle>
                    <Badge variant={stream.active ? (stream.paused ? 'secondary' : 'default') : 'destructive'}>
                        {stream.active ? (stream.paused ? 'Paused' : 'Active') : 'Ended'}
                    </Badge>
                </div>
                <CardDescription>
                    Annual Salary: ${Number(annualSalary).toLocaleString()}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            Monthly
                        </p>
                        <p className="text-sm font-semibold">${monthlySalary}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Claimed
                        </p>
                        <p className="text-sm font-semibold">${Number(totalClaimed).toLocaleString()}</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Claimable Amount (Employee Only) */}
                {!isEmployer && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Available to Claim</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ${Number(displayClaimable).toFixed(4)}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {isEmployer ? (
                        <>
                            {stream.paused ? (
                                <Button
                                    onClick={handleResume}
                                    disabled={isResuming || !stream.active}
                                    className="flex-1"
                                    variant="outline"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Resume
                                </Button>
                            ) : (
                                <Button
                                    onClick={handlePause}
                                    disabled={isPausing || !stream.active}
                                    className="flex-1"
                                    variant="outline"
                                >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button
                            onClick={handleClaim}
                            disabled={isClaiming || !stream.active || stream.paused || Number(displayClaimable) === 0}
                            className="flex-1"
                        >
                            <Wallet className="w-4 h-4 mr-2" />
                            Claim Salary
                        </Button>
                    )}
                </div>

                {/* Timestamps */}
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>Started: {formatDistance(new Date(Number(stream.startTime) * 1000), new Date(), { addSuffix: true })}</p>
                    {stream.endTime > 0n && (
                        <p>Ends: {formatDistance(new Date(Number(stream.endTime) * 1000), new Date(), { addSuffix: true })}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}