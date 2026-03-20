import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function ActivityLogIndex({ logs, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.activity-logs.index'), { search: searchQuery }, { preserveState: true });
    };

    const deleteLog = (id) => {
        Swal.fire({
            title: 'Delete log entry?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.activity-logs.destroy', id), {
                    preserveScroll: true
                });
            }
        });
    };

    const clearOldLogs = () => {
        Swal.fire({
            title: 'Clear old logs?',
            text: "This will remove all logs older than 30 days.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, clear them!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.activity-logs.clear'), {}, {
                    preserveScroll: true
                });
            }
        });
    };

    const getActionColor = (action) => {
        const a = action.toLowerCase();
        if (a.includes('login')) return 'bg-blue-100 text-blue-600';
        if (a.includes('deposit')) return 'bg-green-100 text-green-600';
        if (a.includes('withdraw')) return 'bg-orange-100 text-orange-600';
        if (a.includes('password')) return 'bg-rose-100 text-rose-600';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <AdminLayout>
            <Head title="System Activity Logs" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900">Activity Logs</h1>
                        <p className="text-gray-500 font-medium">Monitor user interactions and system events.</p>
                    </div>
                    <button 
                        onClick={clearOldLogs}
                        className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold flex items-center transition-all"
                    >
                        <span className="material-icons-outlined mr-2 text-xl">auto_delete</span>
                        Clear 30d+ Logs
                    </button>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">search</span>
                        <input 
                            type="text"
                            placeholder="Search by user, email or action..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">IP Address</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            {log.user ? (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-bold">{log.user.name}</span>
                                                    <span className="text-gray-400 text-[10px]">{log.user.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">System / Guest</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-gray-500 text-xs min-w-[200px]">
                                            {log.details || '-'}
                                        </td>
                                        <td className="px-8 py-5 text-gray-400 font-mono text-[10px]">
                                            {log.ip_address}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 text-xs">{new Date(log.created_at).toLocaleDateString()}</span>
                                                <span className="text-gray-400 text-[10px]">{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button onClick={() => deleteLog(log.id)} className="h-10 w-10 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                                <span className="material-icons-outlined text-sm">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No activity logs found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-center py-4">
                    <div className="flex space-x-1">
                        {logs.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => router.visit(link.url)}
                                disabled={!link.url || link.active}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                    link.active ? 'bg-gray-900 text-white' : 
                                    !link.url ? 'text-gray-300 opacity-50 cursor-not-allowed' :
                                    'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600'
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
