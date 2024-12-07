import React, { useState, useMemo } from 'react'
import {
    Card,
    CardBody,
    Tab,
    Tabs,
    Input,
    Chip
} from "@nextui-org/react"
import { Transaction } from '@/types/extraTypes'
import { FaStripe, FaPaypal } from 'react-icons/fa'
import { SiRazorpay } from "react-icons/si"

export default function PaymentsList({
    transactions,
    type = 'user'
}: {
    transactions?: Transaction[];
    type?: 'user' | 'vendor'
}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTab, setSelectedTab] = useState<string>('all')

    const getPaymentIcon = (method: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            'stripe': <FaStripe className="text-blue-500" />,
            'razorpay': <SiRazorpay className="text-blue-600" />,
            'paypal': <FaPaypal className="text-blue-400" />
        }
        return iconMap[method.toLowerCase()] || null
    }

    const processedTransactions = useMemo(() => {
        const filteredTransactions = (transactions || [])

            .filter(transaction =>
                transaction.bookingId!.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(transaction =>
                selectedTab === 'all' ||
                (selectedTab === 'credit' && transaction.transactionType === 'credit') ||
                (selectedTab === 'debit' && transaction.transactionType === 'debit')
            )

        return filteredTransactions.reduce((acc, transaction) => {
            const date = new Date(transaction.createdAt).toLocaleDateString()
            if (!acc[date]) {
                acc[date] = []
            }
            acc[date].push(transaction)
            return acc
        }, {} as Record<string, Transaction[]>)
    }, [transactions, searchTerm, selectedTab])

    const totalAmount = useMemo(() => {
        return Object.values(processedTransactions)
            .flat()
            .reduce((sum, transaction) =>
                transaction.transactionType === 'credit'
                    ? sum + transaction.amount
                    : sum - transaction.amount,
                0
            )
    }, [processedTransactions])

    return (
        <div className="space-y-6">
            <Card className="w-full">
                <CardBody >
                    <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between mb-4">
                        {type === 'user' ? (
                            <h1 className="text-2xl font-semibold text-gray-800 px-2">My Transactions</h1>
                        ) : (
                            <h1 className="text-2xl font-semibold text-gray-800 px-2">Vendor Transactions</h1>
                        )}
                        <div className="w-full lg:w-1/3 md:w-1/2 sm:w-full">
                            <Input
                                label="Search Transactions"
                                variant="bordered"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 rounded-xl"
                            />
                        </div>
                    </div>
                    <Tabs
                        aria-label="Transaction types"
                        selectedKey={selectedTab}
                        onSelectionChange={(key) => setSelectedTab(key as string)}
                        className="flex flex-wrap justify-center"
                    >
                        <Tab key="all" title="All Transactions" />
                        <Tab key="credit" title="Credits" />
                        <Tab key="debit" title="Debits" />
                    </Tabs>
                    <div className="flex justify-center m-4">
                        <Chip
                            color={totalAmount > 0 ? 'success' : 'danger'}
                            variant="solid"
                        >
                            Total Amount: ₹{Math.abs(totalAmount).toFixed(2)}
                        </Chip>
                    </div>


                    {Object.entries(processedTransactions).length > 0 ? (
                        Object.entries(processedTransactions).map(([date, dayTransactions]) => (
                            <div key={date} className="mb-4">
                                <h3 className="text-lg font-semibold mb-2 px-2">{date}</h3>
                                {dayTransactions.map((transaction) => (
                                    <div
                                        key={transaction._id}
                                        className="flex items-center justify-between p-3 border-b hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {getPaymentIcon(transaction.paymentMethod)}
                                            <div>
                                                <p className="font-medium">{transaction.description}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(transaction.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`font-semibold ${transaction.transactionType === 'credit'
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                            }`}>
                                            {transaction.transactionType === 'credit' ? '+ ' : '- '}
                                            ₹{Math.abs(transaction.amount).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            No transactions found
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}