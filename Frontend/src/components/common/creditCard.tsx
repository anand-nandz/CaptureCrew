import { Card, CardBody } from "@nextui-org/react"
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CreditCardsProps {
    accountDetails?: {
        name?: string;
        walletBalance?: number;
        contactinfo?: string;
    };
    type?: 'user' | 'vendor';
}

export default function CreditCards({ accountDetails, type = 'user' }: CreditCardsProps) {
    const balance = accountDetails?.walletBalance || 0
    const clientName = accountDetails?.name || (type === 'user' ? 'User' : 'Vendor')

    return (
        <div className="space-y-6">
            <Card className="bg-black text-white w-full transform transition-transform hover:-translate-y-1">
                <CardBody className="p-6">
                    {/* Top Section */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-medium mb-1">{clientName}</h3>
                            <p className="text-xs opacity-70">{type === 'user' ? 'Personal Account' : 'Vendor Account'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs opacity-70 mb-1">Account Type</p>
                            <p className="text-sm capitalize">{type}</p>
                        </div>
                    </div>

                    {/* Balance Section */}
                    <div className="mb-6">
                        <p className="text-xs opacity-70 mb-2">Total Balance</p>
                        <div className="flex items-baseline justify-between">
                            <h3 className="text-2xl font-semibold">₹ {balance.toFixed(2)}</h3>
                            <div className="flex gap-2 text-sm">
                                <span className="flex items-center text-green-500">
                                    <TrendingUp className="h-4 w-4 mr-1" /> 23.65%
                                </span>
                                <span className="flex items-center text-red-500">
                                    <TrendingDown className="h-4 w-4 mr-1" /> 10.40%
                                </span>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}