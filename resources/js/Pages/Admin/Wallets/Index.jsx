import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function WalletIndex({ wallets, filters = {} }) {
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
                                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Last Updated</th>
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
                                    <td className="px-10 py-5 text-right text-xs font-bold text-gray-400">
                                        {new Date(wallet.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                </tr>
                            ))}
                            {wallets.data.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <span className="material-icons-outlined text-4xl text-gray-200">account_balance_wallet</span>
                                            <p className="text-gray-400 font-bold text-sm tracking-tight uppercase">No wallets found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
