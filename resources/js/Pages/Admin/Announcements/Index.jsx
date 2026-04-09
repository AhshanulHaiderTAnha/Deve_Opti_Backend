import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function AnnouncementIndex({ announcements, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const deleteAnnouncement = (id) => {
        Swal.fire({
            title: 'Delete this announcement?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!',
            customClass: {
                popup: 'rounded-[1.5rem]',
                confirmButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3',
                cancelButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.announcements.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Announcement has been removed.',
                            icon: 'success',
                            confirmButtonColor: '#f59e0b',
                            customClass: {
                                popup: 'rounded-[1.5rem]',
                                confirmButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3'
                            }
                        });
                    }
                });
            }
        });
    };

    const defaultStartDate = new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0];
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(filters?.start_date || defaultStartDate);
    const [endDate, setEndDate] = useState(filters?.end_date || defaultEndDate);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.announcements.index'), { search: searchQuery, start_date: startDate, end_date: endDate }, { preserveState: true });
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
        window.location.href = route('admin.announcements.export', { search: searchQuery, start_date: startDate, end_date: endDate });
    };

    const types = [
        { value: 'update', label: 'Update', color: 'bg-blue-100 text-blue-600', icon: 'system_update' },
        { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-100 text-orange-600', icon: 'settings' },
        { value: 'promotion', label: 'Promotion', color: 'bg-pink-100 text-pink-600', icon: 'card_giftcard' },
        { value: 'news', label: 'News', color: 'bg-green-100 text-green-600', icon: 'article' },
        { value: 'alert', label: 'Alert', color: 'bg-rose-100 text-rose-600', icon: 'notification_important' },
    ];

    return (
        <AdminLayout>
            <Head title="Announcements & News" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900">Announcements & News</h1>
                        <p className="text-gray-500 font-medium">Push platform updates, maintenance notices, and news to users.</p>
                    </div>
                    <Link
                        href={route('admin.announcements.create')}
                        className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center shadow-lg transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-icons-outlined mr-2 text-xl">add_alert</span>
                        Post News
                    </Link>
                </div>

                <div className="bg-white p-4 flex flex-col xl:flex-row gap-4 xl:items-center justify-between rounded-3xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2 flex-col md:flex-row w-full">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">search</span>
                            <input
                                type="text"
                                placeholder="Search news..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
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

                <div className="grid grid-cols-1 gap-6">
                    {announcements.data.length > 0 ? announcements.data.map((ann) => {
                        const typeInfo = types.find(t => t.value === ann.type) || types[3];
                        return (
                            <div key={ann.id} className={`bg-white rounded-[2rem] border ${ann.is_pinned ? 'border-orange-200' : 'border-gray-100'} shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}>
                                {ann.is_pinned && (
                                    <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-widest animate-pulse">
                                        Pinned
                                    </div>
                                )}
                                <div className="p-8 flex items-start space-x-6">
                                    <div className={`h-14 w-14 ${typeInfo.color} rounded-2xl flex items-center justify-center shrink-0`}>
                                        <span className="material-icons-outlined text-2xl">{typeInfo.icon}</span>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${typeInfo.color}`}>
                                                {typeInfo.label}
                                            </span>
                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                                {new Date(ann.created_at).toLocaleDateString()}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ann.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {ann.status}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-500 transition-colors uppercase tracking-tight">{ann.title}</h3>
                                        <div 
                                            className="text-gray-500 text-sm line-clamp-2 font-medium prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: ann.content }}
                                        />
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <Link href={route('admin.announcements.edit', ann.id)} className="p-3 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                                            <span className="material-icons-outlined">edit</span>
                                        </Link>
                                        <button onClick={() => deleteAnnouncement(ann.id)} className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                            <span className="material-icons-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="bg-white p-20 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center">
                                <span className="material-icons-outlined text-4xl text-gray-300">announcement</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">No Announcements Found</h3>
                                <p className="text-gray-500 font-medium">Get started by posting your first platform update.</p>
                            </div>
                            <Link href={route('admin.announcements.create')} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">
                                Post News Now
                            </Link>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {announcements.links.length > 3 && (
                    <div className="flex justify-center py-4">
                        <div className="flex space-x-1">
                            {announcements.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => router.visit(link.url)}
                                    disabled={!link.url || link.active}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${link.active ? 'bg-gray-900 text-white' :
                                            !link.url ? 'text-gray-300 opacity-50 cursor-not-allowed' :
                                                'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
