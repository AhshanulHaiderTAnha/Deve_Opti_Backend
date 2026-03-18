import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function SupportTicketIndex({ tickets, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.support-tickets.index'), {
            search: searchQuery,
            status: statusFilter
        }, { preserveState: true });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-sky-50 text-sky-600 border-sky-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'closed': return 'bg-gray-50 text-gray-500 border-gray-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-rose-600 bg-rose-50';
            case 'medium': return 'text-orange-600 bg-orange-50';
            case 'low': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <AdminLayout>
            <Head title="Support Tickets" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900">Support Center</h1>
                        <p className="text-gray-500 font-medium">Manage and respond to customer tickets.</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">search</span>
                            <input 
                                type="text"
                                placeholder="Search by Ticket ID, Subject or User..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select 
                            className="px-6 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs uppercase tracking-widest"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <button type="submit" className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
                            Filter
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-left">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ticket / User</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Subject</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Priority</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Activity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {tickets.data.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-900 text-sm tracking-tight">{ticket.ticket_id}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{ticket.user?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="max-w-xs truncate font-bold text-gray-700 text-sm">
                                            {ticket.subject}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-gray-400">
                                            {new Date(ticket.last_reply_at || ticket.updated_at).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Link 
                                            href={route('admin.support-tickets.show', ticket.id)}
                                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm"
                                        >
                                            <span className="material-icons-outlined text-sm mr-2">forum</span>
                                            View Thread
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center py-4">
                    <div className="flex space-x-1">
                        {tickets.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => router.visit(link.url)}
                                disabled={!link.url || link.active}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                    link.active ? 'bg-gray-900 text-white' : 
                                    !link.url ? 'text-gray-300 opacity-50 cursor-not-allowed' :
                                    'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 shadow-sm border border-transparent'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
