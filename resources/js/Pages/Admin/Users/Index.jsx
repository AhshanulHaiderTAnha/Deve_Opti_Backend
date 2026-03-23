import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function UserIndex({ users, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        status: 'active',
        role: 'user',
    });

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setData({
                name: user.name,
                email: user.email,
                password: '',
                status: user.status,
                role: user.role || 'user',
            });
        } else {
            setEditingUser(null);
            reset();
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingUser) {
            patch(route('admin.users.update', editingUser.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const toggleStatus = (user) => {
        if (confirm(`Are you sure you want to ${user.status === 'active' ? 'suspend' : 'activate'} this user?`)) {
            patch(route('admin.users.status', user.id));
        }
    };

    const applyFilters = (newFilters) => {
        router.get(route('admin.users.index'), { ...filters, ...newFilters }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title="Users Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Users Management</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage accounts, permissions, and security status.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95"
                    >
                        <span className="material-icons-outlined mr-2">person_add</span>
                        ADD NEW USER
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col xl:flex-row items-center gap-4">
                    <div className="relative flex-1 group w-full xl:w-auto">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-orange-500 transition-colors">
                            <span className="material-icons-outlined text-xl">search</span>
                        </span>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all outline-none text-sm"
                            placeholder="Search by name or email..."
                            defaultValue={filters.search}
                            onKeyUp={(e) => e.key === 'Enter' && applyFilters({ search: e.target.value })}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                        <select 
                            className="py-3 px-4 bg-slate-50 border-0 rounded-xl text-slate-700 font-black tracking-wide focus:ring-2 focus:ring-orange-500/20 outline-none text-xs uppercase"
                            defaultValue={filters.date_filter || ''}
                            onChange={(e) => applyFilters({ date_filter: e.target.value })}
                        >
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="last_7_days">Last 7 Days</option>
                            <option value="last_30_days">Last 30 Days</option>
                            <option value="this_month">This Month</option>
                        </select>

                        <select 
                            className="py-3 px-4 bg-slate-50 border-0 rounded-xl text-slate-700 font-black tracking-wide focus:ring-2 focus:ring-orange-500/20 outline-none text-xs uppercase"
                            defaultValue={filters.sort_by || ''}
                            onChange={(e) => applyFilters({ sort_by: e.target.value })}
                        >
                            <option value="">Newest First</option>
                            <option value="highest_earning">Highest Earning</option>
                            <option value="highest_deposit">Highest Deposits</option>
                            <option value="highest_withdrawal">Highest Withdraws</option>
                        </select>

                        <a
                            href={route('admin.users.export', filters)}
                            className="flex items-center justify-center shrink-0 px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 font-black tracking-widest uppercase text-xs rounded-xl transition-all h-full"
                        >
                            <span className="material-icons-outlined text-sm mr-2">download</span>
                            Export CSV
                        </a>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-[0.1em] font-black">
                                <th className="px-8 py-5 border-b border-slate-50">User Profile</th>
                                <th className="px-8 py-5 border-b border-slate-50">Verification</th>
                                <th className="px-8 py-5 border-b border-slate-50">Financial Stats</th>
                                <th className="px-8 py-5 border-b border-slate-50 text-center">Account Status</th>
                                <th className="px-8 py-5 border-b border-slate-50 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-lg border-2 border-white shadow-sm mr-4 shrink-0 overflow-hidden">
                                                {user.profile_image_url ? (
                                                    <img src={user.profile_image_url} alt={user.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    user.name[0]
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-slate-900 truncate">{user.name}</span>
                                                <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black border ${user.kyc_status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            user.kyc_status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                            <span className="material-icons-outlined text-[14px] mr-1">
                                                {user.kyc_status === 'approved' ? 'verified' : user.kyc_status === 'pending' ? 'hourglass_top' : 'help_outline'}
                                            </span>
                                            {(user.kyc_status || 'NOT SUBMITTED').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                                <span className="text-emerald-500 mr-2 w-16">Deposits:</span> ${parseFloat(user.total_deposits).toFixed(2)}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                                <span className="text-rose-500 mr-2 w-16">Withdraw:</span> ${parseFloat(user.total_withdrawals).toFixed(2)}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                                <span className="text-sky-500 mr-2 w-16">Earnings:</span> ${parseFloat(user.total_commissions).toFixed(2)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col items-center">
                                            <button
                                                onClick={() => toggleStatus(user)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center transition-all ${user.status === 'active'
                                                    ? 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-100'
                                                    : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
                                                    }`}
                                            >
                                                <span className={`h-1.5 w-1.5 rounded-full mr-2 ${user.status === 'active' ? 'bg-green-500' : 'bg-rose-500'}`}></span>
                                                {user.status.toUpperCase()}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-2">
                                        <button
                                            onClick={() => openModal(user)}
                                            className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                                        >
                                            <span className="material-icons-outlined">edit_note</span>
                                        </button>
                                        <Link
                                            href={route('admin.users.show', user.id)}
                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all inline-block"
                                        >
                                            <span className="material-icons-outlined">visibility</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Total Records: <span className="text-slate-900">{users.total}</span>
                    </p>
                    <div className="flex space-x-2">
                        {/* Pagination would be populated here by standard Inertia components */}
                    </div>
                </div>
            </div>

            {/* Add/Edit User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">{editingUser ? 'Edit Profile' : 'Add New User'}</h3>
                                <p className="text-slate-400 text-sm font-medium">{editingUser ? `Updating ${editingUser.name}` : 'Create a new administrative or customer account'}</p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-white rounded-2xl text-slate-400 transition-all">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 ml-1">PROFILE NAME</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                                        placeholder="John Doe"
                                        required
                                    />
                                    {errors.name && <p className="text-rose-500 text-[10px] font-bold ml-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 ml-1">SYSTEM ROLE</label>
                                    <select
                                        value={data.role}
                                        onChange={e => setData('role', e.target.value)}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-orange-500/20 transition-all outline-none appearance-none"
                                    >
                                        <option value="user">Normal User</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-700 ml-1">EMAIL ADDRESS</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                                    placeholder="user@example.com"
                                    required
                                />
                                {errors.email && <p className="text-rose-500 text-[10px] font-bold ml-1">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-700 ml-1">PASSWORD {editingUser && '(Leave blank to keep current)'}</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                                    placeholder="••••••••"
                                    required={!editingUser}
                                />
                                {errors.password && <p className="text-rose-500 text-[10px] font-bold ml-1">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-700 ml-1">ACCOUNT STATUS</label>
                                <div className="flex space-x-3">
                                    {['active', 'suspended', 'inactive'].map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setData('status', status)}
                                            className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${data.status === status
                                                ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm'
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-4 text-sm font-black text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-4 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-lg shadow-orange-100 transition-all disabled:opacity-50"
                                >
                                    {processing ? 'PROCESSING...' : (editingUser ? 'SAVE CHANGES' : 'CREATE ACCOUNT')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
