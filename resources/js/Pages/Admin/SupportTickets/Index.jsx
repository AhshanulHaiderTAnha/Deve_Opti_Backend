import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function SupportTicketIndex({ tickets, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // User search states
    const [userSearch, setUserSearch] = useState('');
    const [foundUsers, setFoundUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        user_id: '',
        subject: '',
        priority: 'medium',
        message: '',
        attachment: null
    });

    const searchUsers = async (query) => {
        if (query.length < 2) {
            setFoundUsers([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await axios.get(route('admin.users.search-ajax'), {
                params: { search: query }
            });
            setFoundUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const defaultStartDate = new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0];
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(filters?.start_date || defaultStartDate);
    const [endDate, setEndDate] = useState(filters?.end_date || defaultEndDate);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.support-tickets.index'), {
            search: searchQuery,
            status: statusFilter,
            start_date: startDate,
            end_date: endDate
        }, { preserveState: true });
    };

    const handleExport = (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            Swal.fire('Error', 'Please select both start and end dates for export.', 'error');
            return;
        }
        const diffTime = new Date(endDate).getTime() - new Date(startDate).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays > 15 || diffDays < 0) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Date Range',
                text: 'Export date range cannot exceed 15 days.',
                customClass: { confirmButton: 'bg-orange-500 rounded-xl px-6 py-2 text-white font-bold' }
            });
            return;
        }
        window.location.href = route('admin.support-tickets.export', { search: searchQuery, status: statusFilter, start_date: startDate, end_date: endDate });
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

    const submitTicket = (e) => {
        e.preventDefault();
        post(route('admin.support-tickets.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                setUserSearch('');
                setFoundUsers([]);
                setSelectedUser(null);
                Swal.fire({
                    title: 'Created!',
                    text: 'Support ticket has been created successfully.',
                    icon: 'success',
                    confirmButtonColor: '#f59e0b',
                    customClass: {
                        popup: 'rounded-[2rem]',
                        confirmButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3'
                    }
                });
            },
        });
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
                    <button
                        onClick={() => {
                            clearErrors();
                            reset();
                            setIsModalOpen(true);
                        }}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center shadow-lg shadow-orange-100 transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-icons-outlined mr-2">add</span>
                        Create Ticket
                    </button>
                </div>

                <div className="bg-white p-4 flex flex-col xl:flex-row gap-4 xl:items-center justify-between rounded-3xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-4 flex-col md:flex-row w-full flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
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
                            className="px-6 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs uppercase tracking-widest min-w-[140px]"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                            <input
                                type="date"
                                className="px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs text-gray-700"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                            <span className="text-gray-400 font-black text-[10px] tracking-widest px-1">TO</span>
                            <input
                                type="date"
                                className="px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs text-gray-700"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="submit" className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all whitespace-nowrap">
                                Filter
                            </button>
                            <button
                                onClick={handleExport}
                                type="button"
                                className="shrink-0 flex items-center justify-center px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-black rounded-2xl transition-all uppercase tracking-widest text-[#10px]"
                            >
                                <span className="material-icons-outlined mr-2 text-sm">download</span>
                                CSV
                            </button>
                        </div>
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
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${link.active ? 'bg-gray-900 text-white' :
                                    !link.url ? 'text-gray-300 opacity-50 cursor-not-allowed' :
                                        'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 shadow-sm border border-transparent'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Ticket Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Create New Ticket</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={submitTicket} className="flex flex-col max-h-[85vh]">
                            <div className="p-10 space-y-6 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Target User</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                                placeholder="Search by name or email..."
                                                value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : userSearch}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setUserSearch(val);
                                                    if (selectedUser) {
                                                        setSelectedUser(null);
                                                        setData('user_id', '');
                                                    }
                                                    searchUsers(val);
                                                }}
                                                readOnly={!!selectedUser}
                                            />
                                            {selectedUser && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedUser(null);
                                                        setUserSearch('');
                                                        setData('user_id', '');
                                                        setFoundUsers([]);
                                                    }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500"
                                                >
                                                    <span className="material-icons-outlined text-sm">cancel</span>
                                                </button>
                                            )}
                                        </div>

                                        {!selectedUser && foundUsers.length > 0 && (
                                            <div className="absolute z-[60] left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-50 overflow-hidden py-2 max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                                                {foundUsers.map(user => (
                                                    <button
                                                        key={user.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setData('user_id', user.id);
                                                            setFoundUsers([]);
                                                        }}
                                                        className="w-full px-6 py-3 text-left hover:bg-orange-50 group flex flex-col transition-colors border-b last:border-0 border-gray-50"
                                                    >
                                                        <span className="font-bold text-gray-900 text-xs tracking-tight group-hover:text-orange-600 transition-colors">{user.name}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user.email}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {isSearching && (
                                            <div className="absolute right-4 top-12">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                                            </div>
                                        )}
                                        {errors.user_id && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest pl-1">{errors.user_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Priority</label>
                                        <select
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold appearance-none"
                                            value={data.priority}
                                            onChange={e => setData('priority', e.target.value)}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                        {errors.priority && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest pl-1">{errors.priority}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Subject</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                        placeholder="Ticket Subject"
                                        value={data.subject}
                                        onChange={e => setData('subject', e.target.value)}
                                    />
                                    {errors.subject && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest pl-1">{errors.subject}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Message</label>
                                    <textarea
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm min-h-[150px] resize-none"
                                        placeholder="Ticket Message..."
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                    ></textarea>
                                    {errors.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest pl-1">{errors.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Attachment (Optional)</label>
                                    <div className="relative h-24 w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden transition-all hover:border-orange-500/50">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={e => setData('attachment', e.target.files[0])}
                                        />
                                        <div className="flex items-center space-x-3">
                                            <span className={`material-icons-outlined ${data.attachment ? 'text-emerald-500' : 'text-gray-300'}`}>
                                                {data.attachment ? 'check_circle' : 'cloud_upload'}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                {data.attachment ? data.attachment.name : 'Upload Attachment'}
                                            </span>
                                        </div>
                                    </div>
                                    {errors.attachment && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest pl-1">{errors.attachment}</p>}
                                </div>
                            </div>

                            <div className="p-10 border-t border-gray-50 bg-white">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-5 bg-gray-900 hover:bg-black text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all disabled:opacity-50"
                                >
                                    Create Support Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
