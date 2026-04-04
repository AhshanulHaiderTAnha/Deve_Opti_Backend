import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ReferralsIndex({ users, filters, globalStats }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [minReferrals, setMinReferrals] = useState(filters?.min_referrals || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.referrals.index'), {
            search: search || undefined,
            min_referrals: minReferrals || undefined,
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setMinReferrals('');
        router.get(route('admin.referrals.index'));
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Referral Management</h1>
                        <p className="text-gray-500 mt-1">Track referral activity, commissions, and network growth</p>
                    </div>
                    <a
                        href={route('admin.referrals.export', { ...filters })}
                        className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <span className="material-icons-outlined text-lg mr-2">download</span>
                        Export CSV
                    </a>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Referred Users</p>
                                <p className="text-3xl font-black text-gray-900 mt-2">{globalStats?.total_referred_users || 0}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <span className="material-icons-outlined text-blue-600">people</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Referrers</p>
                                <p className="text-3xl font-black text-gray-900 mt-2">{globalStats?.total_active_referrers || 0}</p>
                            </div>
                            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <span className="material-icons-outlined text-green-600">group_add</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Commissions Paid</p>
                                <p className="text-3xl font-black text-orange-600 mt-2">${Number(globalStats?.total_referral_earnings || 0).toFixed(2)}</p>
                            </div>
                            <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center">
                                <span className="material-icons-outlined text-orange-600">monetization_on</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <form onSubmit={handleFilter} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Search</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email, or referral code..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                            />
                        </div>
                        <div className="w-40">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Min Referrals</label>
                            <input
                                type="number"
                                value={minReferrals}
                                onChange={(e) => setMinReferrals(e.target.value)}
                                placeholder="e.g. 5"
                                min="0"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                            />
                        </div>
                        <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-sm">
                            <span className="material-icons-outlined text-sm mr-1 align-middle">filter_list</span>
                            Filter
                        </button>
                        {(filters?.search || filters?.min_referrals) && (
                            <button type="button" onClick={clearFilters} className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-semibold">
                                Clear
                            </button>
                        )}
                    </div>
                </form>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Referral Code</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Direct Referrals</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Total Earned</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users?.data?.length > 0 ? users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-orange-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-400">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-mono font-bold">
                                                {user.referral_code || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center h-8 w-8 bg-blue-50 text-blue-700 rounded-full text-sm font-black">
                                                {user.direct_referrals_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-black text-orange-600">
                                                ${Number(user.total_referral_earned || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-green-50 text-green-700' :
                                                    user.status === 'suspended' ? 'bg-red-50 text-red-700' :
                                                        'bg-gray-50 text-gray-600'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === 'active' ? 'bg-green-500' :
                                                        user.status === 'suspended' ? 'bg-red-500' :
                                                            'bg-gray-400'
                                                    }`}></span>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={route('admin.referrals.show', user.id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-bold transition-all"
                                            >
                                                <span className="material-icons-outlined text-sm mr-1">visibility</span>
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <span className="material-icons-outlined text-5xl text-gray-200 mb-3 block">group_off</span>
                                            <p className="text-gray-400 font-medium">No referral activity found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users?.links && users.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Showing <span className="font-bold">{users.from}</span> to <span className="font-bold">{users.to}</span> of <span className="font-bold">{users.total}</span>
                            </p>
                            <div className="flex gap-1">
                                {users.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${link.active ? 'bg-orange-500 text-white' :
                                                link.url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
