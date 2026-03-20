import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard({ stats, recentActivity }) {
    const statCards = [
        { label: 'Total Users', value: stats.total_users, icon: 'people', color: 'bg-orange-500' },
        { label: 'Total Sellers', value: stats.total_sellers, icon: 'storefront', color: 'bg-purple-500' },
        { label: 'Total Products', value: stats.total_products, icon: 'inventory_2', color: 'bg-blue-500' },
        { label: 'Support Tickets', value: stats.total_support_tickets, icon: 'history', color: 'bg-gray-700' },
        { label: 'Pending Tickets', value: stats.pending_support_tickets, icon: 'confirmation_number', color: 'bg-rose-500' },
        { label: 'Pending KYC', value: stats.pending_kyc, icon: 'hourglass_empty', color: 'bg-amber-500' },
        { label: 'Total Deposits', value: '$' + (parseFloat(stats.total_deposits) || 0).toFixed(2), icon: 'file_download', color: 'bg-teal-500' },
        { label: 'Total Withdrawals', value: '$' + (parseFloat(stats.total_withdrawals) || 0).toFixed(2), icon: 'file_upload', color: 'bg-indigo-500' },
        { label: 'Pending Deposits', value: stats.pending_deposits_count, icon: 'pending_actions', color: 'bg-amber-400' },
        { label: 'Pending Withdrawals', value: stats.pending_withdrawals_count, icon: 'hourglass_top', color: 'bg-red-400' },
        { label: 'This Month Deposits', value: '$' + (parseFloat(stats.this_month_deposits) || 0).toFixed(2), icon: 'trending_up', color: 'bg-emerald-400' },
        { label: 'This Month Withdrawals', value: '$' + (parseFloat(stats.this_month_withdrawals) || 0).toFixed(2), icon: 'trending_down', color: 'bg-rose-400' },
    ];

    return (
        <AdminLayout>
            <Head title="Dashboard" />

            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back to the Deve Opti admin panel.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat) => (
                        <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className={`${stat.color} p-3 rounded-xl text-white`}>
                                <span className="material-icons-outlined">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Recent KYC Submissions</h2>
                        <button className="text-blue-600 font-medium text-sm hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-3 font-semibold">User</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Submitted</th>
                                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentActivity.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{item.user_name}</span>
                                                <span className="text-xs text-gray-500">{item.user_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    item.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                {item.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.submitted}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                                <span className="material-icons-outlined text-xl">visibility</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {recentActivity.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-500">No recent activity found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
