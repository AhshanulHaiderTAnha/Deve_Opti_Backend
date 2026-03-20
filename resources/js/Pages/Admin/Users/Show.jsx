import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function UserShow({ user: userWrap, activities, wallet, deposits, withdrawals }) {
    const user = userWrap.data;

    return (
        <AdminLayout>
            <Head title={`User: ${user.name}`} />

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.users.index')}
                            className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-500 hover:shadow-sm transition-all"
                        >
                            <span className="material-icons-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                            <p className="text-slate-500 font-medium">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Main Info Card */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Account Profile</h3>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                    {user.status}
                                </span>
                            </div>
                            <div className="p-10 grid grid-cols-2 gap-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registration Name</p>
                                    <p className="text-slate-900 font-bold">{user.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</p>
                                    <p className="text-slate-900 font-bold">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</p>
                                    <p className="text-slate-900 font-bold">{user.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Account Role</p>
                                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-600 text-[10px] font-black uppercase tracking-wider">
                                        {user.roles?.[0] || 'User'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Log */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
                            <div className="p-10 border-b border-slate-50">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Login & Activity Logs</h3>
                                <p className="text-slate-400 text-xs font-medium mt-1">Showing the latest 5 registration and login entries.</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-50">
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event</th>
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Agent</th>
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {activities?.length > 0 ? activities.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-10 py-5">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${log.action === 'register' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-5 font-bold text-slate-700 text-sm tracking-tight">{log.ip_address}</td>
                                                <td className="px-10 py-5 max-w-[200px] truncate text-slate-400 text-[10px] font-medium" title={log.user_agent}>
                                                    {log.user_agent}
                                                </td>
                                                <td className="px-10 py-5 text-slate-400 text-[10px] font-bold">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="px-10 py-20 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="material-icons-outlined text-slate-200 text-5xl mb-4">history_toggle_off</span>
                                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No recent activity found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Deposits Table */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
                            <div className="p-10 border-b border-slate-50">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Deposit History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-50">
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan & Method</th>
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {deposits.data.length > 0 ? deposits.data.map((d) => (
                                            <tr key={d.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-10 py-5">
                                                    <div className="font-bold text-slate-700 text-sm">{d.deposit_plan?.name || 'Custom'}</div>
                                                    <div className="text-slate-400 text-[10px]">{d.payment_method?.name}</div>
                                                </td>
                                                <td className="px-10 py-5 text-emerald-600 font-black text-right tracking-tight">${parseFloat(d.amount).toFixed(2)}</td>
                                                <td className="px-10 py-5 text-center">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${d.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : d.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {d.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-5 text-slate-400 text-[10px] font-bold text-right">{new Date(d.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No deposits found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="p-5 flex flex-wrap justify-center gap-2 border-t border-slate-50">
                                    {deposits.links.map((link, i) => (
                                        <Link key={i} href={link.url || '#'} className={`px-3 py-1 rounded-lg text-xs font-bold ${link.active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Withdrawals Table */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
                            <div className="p-10 border-b border-slate-50">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Withdrawal History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-50">
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway Config</th>
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {withdrawals.data.length > 0 ? withdrawals.data.map((w) => (
                                            <tr key={w.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-10 py-5">
                                                    <div className="font-medium text-slate-600 text-xs">{w.payment_gateway_info}</div>
                                                </td>
                                                <td className="px-10 py-5 text-red-600 font-black text-right tracking-tight">${parseFloat(w.amount).toFixed(2)}</td>
                                                <td className="px-10 py-5 text-center">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${w.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : w.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {w.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-5 text-slate-400 text-[10px] font-bold text-right">{new Date(w.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No withdrawals found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="p-5 flex flex-wrap justify-center gap-2 border-t border-slate-50">
                                    {withdrawals.links.map((link, i) => (
                                        <Link key={i} href={link.url || '#'} className={`px-3 py-1 rounded-lg text-xs font-bold ${link.active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Cards */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        {/* Wallet Card */}
                        <div className="bg-emerald-500 rounded-[2.5rem] p-10 text-white shadow-xl shadow-emerald-100">
                            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                <span className="material-icons-outlined text-3xl">account_balance_wallet</span>
                            </div>
                            <h4 className="text-xl font-black tracking-tight mb-2">Wallet Balance</h4>
                            <p className="text-emerald-100 text-xs font-medium leading-relaxed mb-6">
                                The total approved funds currently available in this account.
                            </p>
                            <div className="text-5xl font-black tracking-tighter">
                                ${parseFloat(wallet?.balance || 0).toFixed(2)}
                            </div>
                        </div>

                        <div className="bg-orange-500 rounded-[2.5rem] p-10 text-white shadow-xl shadow-orange-100">
                            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                <span className="material-icons-outlined text-3xl">verified</span>
                            </div>
                            <h4 className="text-xl font-black tracking-tight mb-2">KYC Verification</h4>
                            <p className="text-orange-100 text-xs font-medium leading-relaxed mb-6">
                                Current verification status: <strong className="text-white uppercase">{user.kyc_status}</strong>.
                                Click below to review the documents and photos.
                            </p>
                            <Link
                                href={user.kyc?.id ? route('admin.kyc.show', user.kyc.id) : '#'}
                                className={`inline-flex items-center px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all ${user.kyc?.id
                                    ? 'bg-white text-orange-600 hover:bg-orange-50'
                                    : 'bg-white/50 text-white/50 cursor-not-allowed'
                                    }`}
                            >
                                <span className="material-icons-outlined text-sm mr-2">visibility</span>
                                {user.kyc?.id ? 'Review KYC' : 'No Submission'}
                            </Link>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm text-center">
                            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 font-black text-4xl border-2 border-slate-100 overflow-hidden">
                                {user.profile_image_url ? (
                                    <img src={user.profile_image_url} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    user.name?.[0]
                                )}
                            </div>
                            <h5 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">User Identifier</h5>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter mb-4">UID: {user.id.toString().padStart(6, '0')}</p>

                            <div className="pt-4 border-t border-slate-50 space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Update KYC Status</p>
                                <div className="flex flex-col space-y-2">
                                    {['pending', 'approved', 'rejected'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => router.patch(route('admin.users.kyc-status', user.id), { status: s })}
                                            className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${user.kyc_status === s
                                                ? 'bg-orange-50 border-orange-200 text-orange-600'
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
