import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FinancialSummaryCardProps {
    revenue: number;
    cost: number;
    margin: number;
    currency?: string;
}

export function FinancialSummaryCard({
    revenue,
    cost,
    margin,
    currency = 'USD',
}: FinancialSummaryCardProps) {
    const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;
    const isPositive = margin >= 0;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Revenue</span>
                    <span className="text-sm font-semibold">{formatCurrency(revenue)}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cost</span>
                    <span className="text-sm font-semibold">{formatCurrency(cost)}</span>
                </div>

                <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Margin</span>
                        <div className="flex items-center gap-2">
                            {isPositive ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(margin)}
                            </span>
                        </div>
                    </div>
                    <div className="mt-1 text-right">
                        <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {marginPercent.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
