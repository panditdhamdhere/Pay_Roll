'use client';

import { useState } from 'react';
import { parseEther, parseUnits } from 'viem';
import { useCreateStream } from '@/hooks/usePayrollStream';
import { TOKENS } from '@/config/wagmi';
import { useAccount } from 'wagmi';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface CreateStreamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateStreamDialog({ open, onOpenChange }: CreateStreamDialogProps) {
    const { chain } = useAccount();
    const { createStream, isLoading } = useCreateStream();

    const [formData, setFormData] = useState({
        employee: '',
        salary: '',
        depositToken: '',
        paymentToken: '',
        duration: '365', // days
    });

    const tokens = chain ? TOKENS[chain.id as keyof typeof TOKENS] : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.employee || !formData.salary || !formData.depositToken || !formData.paymentToken) {
            return;
        }

        try {
            const startTime = BigInt(Math.floor(Date.now() / 1000));
            const duration = BigInt(Number(formData.duration) * 24 * 60 * 60); // Convert days to seconds
            const salary = parseEther(formData.salary);

            await createStream({
                employee: formData.employee as `0x${string}`,
                salary,
                depositToken: formData.depositToken as `0x${string}`,
                paymentToken: formData.paymentToken as `0x${string}`,
                startTime,
                duration,
            });

            // Reset form and close dialog
            setFormData({
                employee: '',
                salary: '',
                depositToken: '',
                paymentToken: '',
                duration: '365',
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Error creating stream:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Create Payroll Stream</DialogTitle>
                    <DialogDescription>
                        Set up a new salary stream for an employee
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Employee Address */}
                    <div className="space-y-2">
                        <Label htmlFor="employee">Employee Wallet Address</Label>
                        <Input
                            id="employee"
                            placeholder="0x..."
                            value={formData.employee}
                            onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                            required
                        />
                    </div>

                    {/* Annual Salary */}
                    <div className="space-y-2">
                        <Label htmlFor="salary">Annual Salary (in tokens)</Label>
                        <Input
                            id="salary"
                            type="number"
                            step="0.01"
                            placeholder="100000"
                            value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Monthly: ${formData.salary ? (Number(formData.salary) / 12).toFixed(2) : '0'}
                        </p>
                    </div>

                    {/* Deposit Token */}
                    <div className="space-y-2">
                        <Label htmlFor="depositToken">Deposit Token (What you pay in)</Label>
                        <Select
                            value={formData.depositToken}
                            onValueChange={(value) => setFormData({ ...formData, depositToken: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                            <SelectContent>
                                {tokens && Object.entries(tokens).map(([symbol, address]) => (
                                    <SelectItem key={symbol} value={address}>
                                        {symbol}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payment Token */}
                    <div className="space-y-2">
                        <Label htmlFor="paymentToken">Payment Token (What employee receives)</Label>
                        <Select
                            value={formData.paymentToken}
                            onValueChange={(value) => setFormData({ ...formData, paymentToken: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                            <SelectContent>
                                {tokens && Object.entries(tokens).map(([symbol, address]) => (
                                    <SelectItem key={symbol} value={address}>
                                        {symbol}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration (days)</Label>
                        <Input
                            id="duration"
                            type="number"
                            placeholder="365"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            0 for indefinite duration
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="flex-1">
                            {isLoading ? 'Creating...' : 'Create Stream'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}