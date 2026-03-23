import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function WithdrawalIndex({ withdrawals, filters }) {
    const [actionData, setActionData] = useState({ type: null, withdrawal: null });
    const { data, setData, post, processing, reset, errors } = useForm({
        admin_transaction_id: '',
        admin_comments: ''
    });

    const openModal = (type, withdrawal) => {
        setActionData({ type, withdrawal });
        reset();
    };

    const closeModal = () => {
        setActionData({ type: null, withdrawal: null });
        reset();
    };

    const submitAction = (e) => {
        e.preventDefault();
        const { type, withdrawal } = actionData;
        
        if (type === 'approve') {
            post(route('admin.withdrawals.approve', withdrawal.id), {
                onSuccess: () => closeModal()
            });
        } else if (type === 'reject') {
            post(route('admin.withdrawals.reject', withdrawal.id), {
                onSuccess: () => closeModal()
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Withdrawal Requests" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Withdrawal Requests</h1>
                        <p className="text-gray-500 font-medium">Review and process user cash-outs.</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full xl:w-1/3">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search by name, email, or tx ID..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                            defaultValue={filters?.search || ''}
                            onKeyUp={e => e.key === 'Enter' && router.get(route('admin.withdrawals.index'), { ...filters, search: e.target.value }, { preserveState: true })}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                        <select
                            className="px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs uppercase tracking-wider text-gray-700 appearance-none min-w-[120px]"
                            defaultValue={filters?.status || ''}
                            onChange={e => router.get(route('admin.withdrawals.index'), { ...filters, status: e.target.value }, { preserveState: true })}
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <input 
                            type="date"
                            className="px-3 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs text-gray-700"
                            defaultValue={filters?.start_date || ''}
                            onChange={e => router.get(route('admin.withdrawals.index'), { ...filters, start_date: e.target.value }, { preserveState: true })}
                        />
                        <span className="text-gray-400 font-black text-[10px] tracking-widest px-1">TO</span>
                        <input 
                            type="date"
                            className="px-3 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs text-gray-700"
                            defaultValue={filters?.end_date || ''}
                            onChange={e => router.get(route('admin.withdrawals.index'), { ...filters, end_date: e.target.value }, { preserveState: true })}
                        />
                        <a
                            href={route('admin.withdrawals.index', { ...filters, export: 1 })}
                            className="shrink-0 flex items-center justify-center px-5 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-black rounded-2xl transition-all uppercase tracking-widest text-[#10px]"
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
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Gateway / Account</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {withdrawals.data.map(w => (
                                <tr key={w.id} className="hover:bg-gray-50 group">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-gray-900 text-sm">{w.user?.name}</div>
                                        <div className="text-xs text-gray-400">{w.user?.email}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm text-gray-600 font-medium">{w.payment_gateway_info}</div>
                                        {w.admin_transaction_id && <div className="text-[10px] font-mono text-emerald-600 mt-1">Paid Tx: {w.admin_transaction_id}</div>}
                                    </td>
                                    <td className="px-8 py-5 text-red-600 font-black text-sm">
                                        ${parseFloat(w.amount).toFixed(2)}
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            w.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            w.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                            {w.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {w.status === 'pending' && (
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => openModal('approve', w)} className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                                    <span className="material-icons-outlined text-sm">check_circle</span>
                                                </button>
                                                <button onClick={() => openModal('reject', w)} className="h-8 w-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors">
                                                    <span className="material-icons-outlined text-sm">cancel</span>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Modal */}
            {actionData.type && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-2">
                                {actionData.type === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">
                                {actionData.type === 'approve' 
                                    ? `Enter the transaction ID to confirm you have paid $${actionData.withdrawal.amount}. The user's wallet will be deducted immediately.`
                                    : 'Please provide a reason to the user for rejecting this withdrawal. The funds will remain in their wallet.'}
                            </p>

                            <form onSubmit={submitAction} className="space-y-4">
                                {actionData.type === 'approve' ? (
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Transaction ID (Proof of Pay)</label>
                                        <input 
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm"
                                            value={data.admin_transaction_id}
                                            onChange={e => setData('admin_transaction_id', e.target.value)}
                                            required
                                        />
                                        {errors.admin_transaction_id && <p className="text-red-500 text-xs">{errors.admin_transaction_id}</p>}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Rejection Reason</label>
                                        <textarea 
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm"
                                            rows="3"
                                            value={data.admin_comments}
                                            onChange={e => setData('admin_comments', e.target.value)}
                                            required
                                        ></textarea>
                                        {errors.admin_comments && <p className="text-red-500 text-xs">{errors.admin_comments}</p>}
                                    </div>
                                )}
                                
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={closeModal} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl text-sm hover:bg-gray-200">
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className={`px-6 py-3 font-bold rounded-2xl text-sm text-white ${actionData.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                                    >
                                        {actionData.type === 'approve' ? 'Confirm Payment' : 'Submit Rejection'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
