import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ReferralShow({ referralData, performance, earnings }) {
    const { user, stats, referral_tree, recent_earnings } = referralData;

    const UserCard = ({ user, level }) => (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${level === 1 ? 'bg-blue-500' : level === 2 ? 'bg-indigo-500' : 'bg-purple-500'
                }`}>
                {user.name[0]}
            </div>
            <div>
                <Link href={route('admin.users.show', user.id)} className="text-sm font-bold text-gray-900 hover:text-orange-600 transition-colors">
                    {user.name}
                </Link>
                <p className="text-xs text-gray-400">{user.email}</p>
                <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold ${user.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                    }`}>
                    {user.status}
                </span>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('admin.referrals.index')} className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
                            <span className="material-icons-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Referral Details</h1>
                            <p className="text-gray-500 mt-1">Network and earnings for <span className="font-bold text-gray-700">{user.name}</span></p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-mono font-bold border border-gray-200">
                            CODE: {user.referral_code}
                        </span>
                        <Link
                            href={route('admin.users.show', user.id)}
                            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-sm shadow-orange-200"
                        >
                            <span className="material-icons-outlined text-sm mr-2">person</span>
                            View Profile
                        </Link>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Network</p>
                        <p className="text-3xl font-black text-gray-900 mt-2">{stats.total_referrals}</p>
                        <div className="mt-4 flex items-center text-xs text-gray-500">
                            <span className="font-bold text-blue-600">{stats.level_1_count}</span>&nbsp;L1 ·&nbsp;
                            <span className="font-bold text-indigo-600">{stats.level_2_count}</span>&nbsp;L2 ·&nbsp;
                            <span className="font-bold text-purple-600">{stats.level_3_count}</span>&nbsp;L3
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Earned</p>
                        <p className="text-3xl font-black text-orange-600 mt-2">${stats.total_earned.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">L1 Commission (5%)</p>
                        <p className="text-xl font-bold text-gray-900 mt-2">${stats.level_1_earned.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">L2/L3 (3% & 1%)</p>
                        <p className="text-xl font-bold text-gray-900 mt-2">${(stats.level_2_earned + stats.level_3_earned).toFixed(2)}</p>
                    </div>
                </div>

                {/* Team Performance Monitoring */}
                <div className="bg-white rounded-[2.5rem] border border-orange-100 p-10 shadow-xl shadow-orange-50/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                            <span className="material-icons-outlined text-9xl text-orange-500">query_stats</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center relative z-10">
                        <span className="material-icons-outlined mr-3 text-orange-500">monitoring</span>
                        Team Performance Monitoring (3 Levels)
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Team Deposits</p>
                            <p className="text-4xl font-black text-emerald-600 tracking-tight">${Number(performance.total_team_deposits).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            <p className="text-xs text-slate-400">Total approved deposits across the entire network</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Team Withdrawals</p>
                            <p className="text-4xl font-black text-rose-600 tracking-tight">${Number(performance.total_team_withdrawals).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            <p className="text-xs text-slate-400">Total processed withdrawals by team members</p>
                        </div>
                        <div className="space-y-2 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Team Profit</p>
                            <p className={`text-4xl font-black tracking-tight ${performance.net_team_profit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                ${Number(performance.net_team_profit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">Difference between team inflow and outflow</p>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center">
                                <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Members: {performance.total_team_size}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Members: {performance.active_team_members}</span>
                            </div>
                        </div>
                        <div className="flex items-center text-xs font-black text-orange-600 uppercase tracking-widest">
                            <span className="material-icons-outlined text-sm mr-2">info</span>
                            Real-time Network Audit
                        </div>
                    </div>
                </div>

                {/* Referral Tree Visualization */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm overflow-x-auto">
                    <h2 className="text-lg font-black text-gray-900 mb-8 flex items-center">
                        <span className="material-icons-outlined mr-2 text-orange-500">account_tree</span>
                        Referral Network (3 Levels)
                    </h2>

                    <div className="flex space-x-12 min-w-max">
                        {/* Level 1 */}
                        <div className="w-80 space-y-4">
                            <div className="flex items-center space-x-2 mb-6">
                                <span className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">L1</span>
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Direct Referrals</h3>
                                <span className="ml-auto text-xs font-bold text-gray-500">{referral_tree.level_1.length} users</span>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto space-y-3 custom-scrollbar pr-2">
                                {referral_tree.level_1.length > 0 ? referral_tree.level_1.map(u => (
                                    <UserCard key={u.id} user={u} level={1} />
                                )) : <p className="text-sm text-gray-400 italic">No direct referrals</p>}
                            </div>
                        </div>

                        {/* Level 2 */}
                        <div className="w-80 space-y-4 border-l border-gray-100 pl-12">
                            <div className="flex items-center space-x-2 mb-6">
                                <span className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">L2</span>
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Tier 2 Network</h3>
                                <span className="ml-auto text-xs font-bold text-gray-500">{referral_tree.level_2.length} users</span>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto space-y-3 custom-scrollbar pr-2">
                                {referral_tree.level_2.length > 0 ? referral_tree.level_2.map(u => (
                                    <UserCard key={u.id} user={u} level={2} />
                                )) : <p className="text-sm text-gray-400 italic">No level 2 referrals</p>}
                            </div>
                        </div>

                        {/* Level 3 */}
                        <div className="w-80 space-y-4 border-l border-gray-100 pl-12">
                            <div className="flex items-center space-x-2 mb-6">
                                <span className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs">L3</span>
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Tier 3 Network</h3>
                                <span className="ml-auto text-xs font-bold text-gray-500">{referral_tree.level_3.length} users</span>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto space-y-3 custom-scrollbar pr-2">
                                {referral_tree.level_3.length > 0 ? referral_tree.level_3.map(u => (
                                    <UserCard key={u.id} user={u} level={3} />
                                )) : <p className="text-sm text-gray-400 italic">No level 3 referrals</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Earnings History */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-black text-gray-900 flex items-center">
                            <span className="material-icons-outlined mr-2 text-green-500">receipt_long</span>
                            Earnings History
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Source User</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Level</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Rate</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Deposit Amount</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Earned</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {earnings.data.length > 0 ? earnings.data.map((earning) => (
                                    <tr key={earning.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(earning.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={route('admin.users.show', earning.referred_user_id)} className="text-sm font-bold text-gray-900 hover:text-orange-600">
                                                {earning.referred_user?.name}
                                            </Link>
                                            <p className="text-xs text-gray-400">{earning.referred_user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-black ${earning.level === 1 ? 'bg-blue-50 text-blue-600' :
                                                earning.level === 2 ? 'bg-indigo-50 text-indigo-600' :
                                                    'bg-purple-50 text-purple-600'
                                                }`}>
                                                L{earning.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-500">
                                            {Number(earning.commission_rate).toFixed(0)}%
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                                            ${Number(earning.deposit_amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-black text-green-600">
                                                +${Number(earning.earned_amount).toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">No commission earnings recorded yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {earnings.links && earnings.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Showing <span className="font-bold">{earnings.from}</span> to <span className="font-bold">{earnings.to}</span> of <span className="font-bold">{earnings.total}</span>
                            </p>
                            <div className="flex gap-1">
                                {earnings.links.map((link, i) => (
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
