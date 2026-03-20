import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function AnnouncementIndex({ announcements, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        content: '',
        type: 'news',
        is_pinned: false,
        status: 'published',
    });

    const openModal = (announcement = null) => {
        if (announcement) {
            setEditingAnnouncement(announcement);
            setData({
                title: announcement.title,
                content: announcement.content,
                type: announcement.type,
                is_pinned: announcement.is_pinned === 1 || announcement.is_pinned === true,
                status: announcement.status,
            });
        } else {
            setEditingAnnouncement(null);
            reset();
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingAnnouncement) {
            router.post(route('admin.announcements.update', editingAnnouncement.id), {
                _method: 'PATCH',
                ...data
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.announcements.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

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

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.announcements.index'), { search: searchQuery }, { preserveState: true });
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
                    <button 
                        onClick={() => openModal()}
                        className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center shadow-lg transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-icons-outlined mr-2 text-xl">add_alert</span>
                        Post News
                    </button>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">search</span>
                        <input 
                            type="text"
                            placeholder="Search news..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {announcements.data.map((ann) => {
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
                                        <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-500 transition-colors">{ann.title}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 font-medium">{ann.content}</p>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <button onClick={() => openModal(ann)} className="p-3 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                                            <span className="material-icons-outlined">edit</span>
                                        </button>
                                        <button onClick={() => deleteAnnouncement(ann.id)} className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                            <span className="material-icons-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                <div className="flex justify-center py-4">
                    <div className="flex space-x-1">
                        {announcements.links.map((link, i) => (
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h2 className="text-xl font-black tracking-tight">{editingAnnouncement ? 'Edit Announcement' : 'Post New News'}</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Direct communication to all users</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-all">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Type</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                    >
                                        {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Title</label>
                                <input 
                                    type="text" 
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="Brief title for the news..."
                                />
                                {errors.title && <p className="text-red-500 text-[10px] font-bold pl-1 uppercase">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Content</label>
                                <textarea 
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium h-32 resize-none"
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    placeholder="Detail what is happening..."
                                />
                                {errors.content && <p className="text-red-500 text-[10px] font-bold pl-1 uppercase">{errors.content}</p>}
                            </div>

                            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-2xl">
                                <input 
                                    type="checkbox" 
                                    id="is_pinned"
                                    className="h-5 w-5 rounded text-orange-500 focus:ring-orange-500/20 border-gray-300"
                                    checked={data.is_pinned}
                                    onChange={e => setData('is_pinned', e.target.checked)}
                                />
                                <label htmlFor="is_pinned" className="text-xs font-bold text-gray-600 cursor-pointer uppercase tracking-widest">Pin this to top of user feeds</label>
                            </div>

                            <div className="flex space-x-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">Cancel</button>
                                <button type="submit" disabled={processing} className="flex-[2] py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all">
                                    {editingAnnouncement ? 'Update Announcement' : 'Post Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
