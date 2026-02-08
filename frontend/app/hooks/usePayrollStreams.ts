'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PAYROLL_STREAM_ABI } from '@/config/abis';
import { CONTRACTS } from '@/config/wagmi';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook to create a new payroll stream
 */
export function useCreateStream() {
    const { chain } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [isLoading, setIsLoading] = useState(false);

    const createStream = async (params: {
        employee: `0x${string}`;
        salary: bigint;
        depositToken: `0x${string}`;
        paymentToken: `0x${string}`;
        startTime: bigint;
        duration: bigint;
    }) => {
        if (!chain) {
            toast.error('Please connect your wallet');
            return;
        }

        const contractAddress = CONTRACTS[chain.id as keyof typeof CONTRACTS]?.PayrollStream;
        if (!contractAddress) {
            toast.error('Contract not deployed on this network');
            return;
        }

        setIsLoading(true);
        try {
            const hash = await writeContractAsync({
                address: contractAddress as `0x${string}`,
                abi: PAYROLL_STREAM_ABI,
                functionName: 'createStream',
                args: [
                    params.employee,
                    params.salary,
                    params.depositToken,
                    params.paymentToken,
                    params.startTime,
                    params.duration,
                ],
            });

            toast.success('Stream created successfully!', {
                description: `Transaction: ${hash.slice(0, 10)}...`,
            });

            return hash;
        } catch (error) {
            console.error('Error creating stream:', error);
            toast.error('Failed to create stream');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { createStream, isLoading };
}

/**
 * Hook to get stream details
 */
export function useGetStream(streamId: bigint | undefined) {
    const { chain } = useAccount();

    const contractAddress = chain
        ? CONTRACTS[chain.id as keyof typeof CONTRACTS]?.PayrollStream
        : undefined;

    return useReadContract({
        address: contractAddress as `0x${string}`,
        abi: PAYROLL_STREAM_ABI,
        functionName: 'getStream',
        args: streamId !== undefined ? [streamId] : undefined,
        query: {
            enabled: !!contractAddress && streamId !== undefined,
            refetchInterval: 10000, // Refetch every 10 seconds
        },
    });
}

/**
 * Hook to get claimable amount for a stream
 */
export function useGetClaimableAmount(streamId: bigint | undefined) {
    const { chain } = useAccount();

    const contractAddress = chain
        ? CONTRACTS[chain.id as keyof typeof CONTRACTS]?.PayrollStream
        : undefined;

    return useReadContract({
        address: contractAddress as `0x${string}`,
        abi: PAYROLL_STREAM_ABI,
        functionName: 'getClaimableAmount',
        args: streamId !== undefined ? [streamId] : undefined,
        query: {
            enabled: !!contractAddress && streamId !== undefined,
            refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
        },
    });
}

/**
 * Hook to get employee streams
 */
export function useGetEmployeeStreams(address: `0x${string}` | undefined) {
    const { chain } = useAccount();

    const contractAddress = chain
        ? CONTRACTS[chain.id as keyof typeof CONTRACTS]?.PayrollStream
        : undefined;

    return useReadContract({
        address: contractAddress as `0x${string}`,
        abi: PAYROLL_STREAM_ABI,
        functionName: 'getEmployeeStreams',
        args: address ? [address] : undefined,
        query: {
            enabled: !!contractAddress && !!address,
        },
    });
}

/**
 * Hook to get employer streams
 */
export function useGetEmployerStreams(address: `0x${string}` | undefined) {
    const { chain } = useAccount();

    const contractAddress = chain
        ? CONTRACTS[chain.id as keyof typeof CONTRACTS]?.PayrollStream
        : undefined;

    return useReadContract({
        address: contractAddress as `0x${string}`,
        abi: PAYROLL_STREAM_ABI,
        functionName: 'getEmployerStreams',
        args: address ? [address] : undefined,
        query: {
            enabled: !!contractAddress && !!address,
        },
    });
}

/**
 * Hook to claim salary from a stream
 */
export function useClaimSalary() {
    const { chain } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [isLoading, setIsLoading] = useState(false);

    const claimSalary = async (streamId: bigint) => {
        if (!chain) {
            toast.error('Please connect your wallet');
            return;
        }

        const contractAddress = CONTRACTS[chain.id as keyof typeof CONTRACTS]?.PayrollStream;
        if (!contractAddress) {
            toast.error('Contract not deployed on this network');
            return;
        }

        setIsLoading(true);
        try {
            const hash = await writeContractAsync({
                address: contractAddress as `0x${string}`,
                abi: PAYROLL_STREAM_ABI,
                functionName: 'claimSalary',
                args: [streamId],
            });

            toast.success('Salary claimed!', {
                description: `Transaction: ${hash.slice(0, 10)}...`,
            });

            return hash;
        } catch (error) {
            console.error('Error claiming salary:', error);
            toast.error('Failed to claim salary');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { claimSalary, isLoading };
}

/**
 * Hook to deposit funds to a stream
 */
export function useDepositToStream() {
    const { chain } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [isLoading, setIsLoading] = useState(false);

    const deposit = async (streamId: bigint, amount: bigint) => {
        if (!chain) {
            toast.error('Please connect your wallet');
            return;
        }

        const contractAddress = CONTRACTS[chain.id as keyof typeof CONTRACTS]?.PayrollStream;
        if (!contractAddress) {
            toast.error('Contract not deployed on this network');
            return;
        }

        setIsLoading(true);
        try {
            const hash = await writeContractAsync({
                address: contractAddress as `0x${string}`,
                abi: PAYROLL_STREAM_ABI,
                functionName: 'depositToStream',
                args: [streamId, amount],
            });

            toast.success('Deposit successful!', {
                description: `Transaction: ${hash.slice(0, 10)}...`,
            });

            return hash;
        } catch (error) {
            console.error('Error depositing:', error);
            toast.error('Failed to deposit');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { deposit, isLoading };
}

/**
 * Hook to pause a stream
 */
export function usePauseStream() {
    const { chain } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [isLoading, setIsLoading] = useState(false);

    const pauseStream = async (streamId: bigint) => {
        if (!chain) {
            toast.error('Please connect your wallet');
            return;
        }

        const contractAddress = CONTRACTS[chain.id as keyof typeof CONTRACTS]?.PayrollStream;
        if (!contractAddress) {
            toast.error('Contract not deployed on this network');
            return;
        }

        setIsLoading(true);
        try {
            const hash = await writeContractAsync({
                address: contractAddress as `0x${string}`,
                abi: PAYROLL_STREAM_ABI,
                functionName: 'pauseStream',
                args: [streamId],
            });

            toast.success('Stream paused');
            return hash;
        } catch (error) {
            console.error('Error pausing stream:', error);
            toast.error('Failed to pause stream');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { pauseStream, isLoading };
}

/**
 * Hook to resume a stream
 */
export function useResumeStream() {
    const { chain } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [isLoading, setIsLoading] = useState(false);

    const resumeStream = async (streamId: bigint) => {
        if (!chain) {
            toast.error('Please connect your wallet');
            return;
        }

        const contractAddress = CONTRACTS[chain.id as keyof typeof CONTRACTS]?.PayrollStream;
        if (!contractAddress) {
            toast.error('Contract not deployed on this network');
            return;
        }

        setIsLoading(true);
        try {
            const hash = await writeContractAsync({
                address: contractAddress as `0x${string}`,
                abi: PAYROLL_STREAM_ABI,
                functionName: 'resumeStream',
                args: [streamId],
            });

            toast.success('Stream resumed');
            return hash;
        } catch (error) {
            console.error('Error resuming stream:', error);
            toast.error('Failed to resume stream');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { resumeStream, isLoading };
}