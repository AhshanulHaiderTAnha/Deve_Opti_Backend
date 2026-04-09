import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import QuillEditor from '@/Components/QuillEditor';

export default function Edit({ announcement }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        title: announcement.title || '',
        content: announcement.content || '',
        type: announcement.type || 'news',
        is_pinned: announcement.is_pinned === 1 || announcement.is_pinned === true,
        status: announcement.status || 'published',
    });

    const types = [
        { value: 'update', label: 'Update' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'promotion', label: 'Promotion' },
        { value: 'news', label: 'News' },
        { value: 'alert', label: 'Alert' },
    ];

    const submit = (e) => {
        e.preventDefault();
        // We use post with _method: 'PATCH' for inertia forms when handling multipart or just as a stable alternative
        post(route('admin.announcements.update', announcement.id));
    };

    return (
        <AdminLayout>
            <Head title={`Edit: ${announcement.title}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900">Edit Announcement</h1>
                        <p className="text-gray-500 font-medium">Update the details of this platform notice.</p>
                    </div>
                    <Link
                        href={route('admin.announcements.index')}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold flex items-center shadow-sm hover:bg-gray-50 transition-all"
                    >
                        <span className="material-icons-outlined mr-2">arrow_back</span>
                        Back to List
                    </Link>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                    <form onSubmit={submit} className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 border-l-4 border-orange-500 ml-1">Announcement Type</label>
                                <select
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold transition-all"
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                >
                                    {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 border-l-4 border-green-500 ml-1">Publishing Status</label>
                                <select
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold transition-all"
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                >
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 border-l-4 border-indigo-500 ml-1">Announcement Title</label>
                            <input
                                type="text"
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold transition-all"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                placeholder="Edit title..."
                            />
                            {errors.title && <p className="text-red-500 text-[10px] font-bold pl-1 uppercase tracking-wider">{errors.title}</p>}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 border-l-4 border-orange-500 ml-1">Detailed Content</label>
                            <div className="rounded-3xl overflow-hidden border border-gray-100 bg-gray-50">
                                <QuillEditor
                                    value={data.content}
                                    onChange={content => setData('content', content)}
                                    placeholder="Edit content..."
                                />
                            </div>
                            {errors.content && <p className="text-red-500 text-[10px] font-bold pl-1 uppercase tracking-wider">{errors.content}</p>}
                        </div>

                        <div className="flex items-center space-x-3 p-6 bg-orange-50/50 rounded-3xl border border-orange-100/50">
                            <input
                                type="checkbox"
                                id="is_pinned"
                                className="h-6 w-6 rounded-lg text-orange-500 focus:ring-orange-500/20 border-gray-300"
                                checked={data.is_pinned}
                                onChange={e => setData('is_pinned', e.target.checked)}
                            />
                            <label htmlFor="is_pinned" className="text-xs font-black text-gray-600 cursor-pointer uppercase tracking-widest">Keep this pinned to top</label>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex items-center justify-end space-x-4">
                            <Link 
                                href={route('admin.announcements.index')}
                                className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                            >
                                Cancel
                            </Link>
                            <button 
                                type="submit" 
                                disabled={processing} 
                                className="px-12 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-gray-200 transition-all disabled:opacity-50"
                            >
                                {processing ? 'Updating...' : 'Update Announcement'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
