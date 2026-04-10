import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function WalletIndex({ wallets, filters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        amount: '',
        description: '',
    });

    const openDepositModal = (wallet) => {
        setSelectedWallet(wallet);
        setData('user_id', wallet.user_id);
        setIsModalOpen(true);
    };

    const closeDepositModal = () => {
        setIsModalOpen(false);
        setSelectedWallet(null);
        reset();
    };

    const submitDeposit = (e) => {
        e.preventDefault();
        post(route('admin.wallets.deposit'), {
            onSuccess: () => closeDepositModal(),
        });
    };

    return (
        <AdminLayout>
            <Head title="User Wallets" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Financial Ledgers</h1>
                        <p className="text-gray-500 font-medium">Overview of all user wallet balances.</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full xl:max-w-md">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                            defaultValue={filters?.search || ''}
                            onKeyUp={e => e.key === 'Enter' && router.get(route('admin.wallets.index'), { ...filters, search: e.target.value }, { preserveState: true })}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                        <input
                            type="date"
                            className="px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs text-gray-700"
                            defaultValue={filters?.start_date || ''}
                            onChange={e => router.get(route('admin.wallets.index'), { ...filters, start_date: e.target.value }, { preserveState: true })}
                        />
                        <span className="text-gray-400 font-black text-[10px] tracking-widest">TO</span>
                        <input
                            type="date"
                            className="px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs text-gray-700"
                            defaultValue={filters?.end_date || ''}
                            onChange={e => router.get(route('admin.wallets.index'), { ...filters, end_date: e.target.value }, { preserveState: true })}
                        />
                        <a
                            href={route('admin.wallets.index', { ...filters, export: 1 })}
                            className="shrink-0 flex items-center justify-center px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-black rounded-2xl transition-all uppercase tracking-widest text-[#10px]"
                        >
                            <span className="material-icons-outlined mr-2 text-sm">download</span>
                            CSV
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User</th>
                                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Available Balance</th>
                                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {wallets.data.map(wallet => (
                                <tr key={wallet.id} className="hover:bg-gray-50 group">
                                    <td className="px-10 py-6 flex items-center space-x-4">
                                        <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black text-xs">
                                            {wallet.user?.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{wallet.user?.name}</div>
                                            <div className="text-xs text-gray-400">{wallet.user?.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-5 text-right font-black text-emerald-600 text-xl tracking-tight">
                                        ${parseFloat(wallet.balance).toFixed(2)}
                                    </td>
                                    <td className="px-10 py-5 text-right">
                                        <button
                                            onClick={() => openDepositModal(wallet)}
                                            className="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 font-black rounded-xl transition-all uppercase tracking-widest text-[9px]"
                                        >
                                            <span className="material-icons-outlined mr-2 text-xs">add_circle</span>
                                            Deposit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {wallets.data.length === 0 && (
                        <div className="px-10 py-20 text-center">
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <span className="material-icons-outlined text-4xl text-gray-200">account_balance_wallet</span>
                                <p className="text-gray-400 font-bold text-sm tracking-tight uppercase">No wallets found</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Deposit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Manual Deposit</h3>
                                <p className="text-gray-500 font-medium text-sm">Add funds to {selectedWallet?.user?.name}'s wallet.</p>
                            </div>
                            <button onClick={closeDepositModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={submitDeposit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Deposit Amount ($)</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        onKeyDown={(e) => {
                                            if (e.key === '-' || e.key === 'e') e.preventDefault();
                                        }}
                                        className="w-full pl-12 pr-6 py-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-orange-500/20 font-black text-lg"
                                        placeholder="0.00"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.amount && <p className="mt-2 text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg inline-block">{errors.amount}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Transaction Note</label>
                                <textarea
                                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm min-h-[120px]"
                                    placeholder="Enter reason for direct deposit..."
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    required
                                />
                                {errors.description && <p className="mt-2 text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg inline-block">{errors.description}</p>}
                                <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider italic">* This note will be visible to the user.</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={closeDepositModal}
                                    className="flex-1 py-5 bg-gray-100 text-gray-500 hover:bg-gray-200 font-black rounded-3xl transition-all uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-[2] py-5 bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-500/30 font-black rounded-3xl transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : 'Confirm Deposit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
