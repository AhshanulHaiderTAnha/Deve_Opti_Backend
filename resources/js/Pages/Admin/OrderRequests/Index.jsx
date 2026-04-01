import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ orderRequests }) {
    const { data: requests, links } = orderRequests;

    const handleUpdateStatus = (id, status) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${status} this order request?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#ef4444',
            confirmButtonText: `Yes, ${status} it!`,
            cancelButtonText: 'No, cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admin.order-requests.status', id), { status }, {
                    onSuccess: () => {
                        Swal.fire(
                            'Updated!',
                            `Order request has been ${status}.`,
                            'success'
                        );
                    }
                });
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'cancelled': return 'bg-slate-50 text-slate-400 border-slate-100';
            default: return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    return (
        <AdminLayout>
            <Head title="Order Requests" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">ORDER REQUESTS</h1>
                        <p className="text-slate-500 font-medium mt-3">Review and manage incoming order requests from customers.</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">Customer</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">Request Details</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 text-center">Status</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">Date</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {requests.length > 0 ? requests.map((request) => (
                                    <tr key={request.id} className="hover:bg-slate-50/40 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black mr-4 border border-slate-200">
                                                    {request.user.name[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{request.user.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{request.user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="max-w-md bg-slate-50 p-3 rounded-2xl border border-slate-100 text-slate-600 font-medium leading-relaxed italic">
                                                "{request.order_request_data}"
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border-2 shadow-sm ${getStatusColor(request.status)}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full mr-2 ${request.status === 'pending' ? 'bg-amber-400' :
                                                    request.status === 'approved' ? 'bg-emerald-400' :
                                                        request.status === 'rejected' ? 'bg-rose-400' : 'bg-slate-300'
                                                    }`}></span>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-bold">{new Date(request.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="text-[10px] text-slate-400 font-black uppercase">{new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {request.status === 'pending' && (
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() => handleUpdateStatus(request.id, 'approved')}
                                                        className="h-10 w-10 flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 rounded-xl transition-all shadow-sm hover:shadow-emerald-200"
                                                        title="Approve Request"
                                                    >
                                                        <span className="material-icons-outlined text-xl">check</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(request.id, 'rejected')}
                                                        className="h-10 w-10 flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-100 rounded-xl transition-all shadow-sm hover:shadow-rose-200"
                                                        title="Reject Request"
                                                    >
                                                        <span className="material-icons-outlined text-xl">close</span>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4 border border-slate-100">
                                                    <span className="material-icons-outlined text-4xl text-slate-200">shopping_basket</span>
                                                </div>
                                                <h3 className="text-lg font-black text-slate-300 uppercase tracking-widest">No order requests yet</h3>
                                                <p className="text-slate-400 text-sm font-medium mt-1">Pending requests from customers will appear here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {links.length > 3 && (
                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-center space-x-2">
                            {links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${link.active
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                        : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
