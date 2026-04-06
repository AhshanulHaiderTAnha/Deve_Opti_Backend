import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';
import RichTextEditor from '@/Components/RichTextEditor';

export default function LegalDocumentIndex({ documents, currentType }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        type: currentType,
        title: '',
        content: '',
        position: 0,
        status: 'active',
    });

    const openCreateModal = () => {
        setEditData(null);
        reset({
            type: currentType,
            title: '',
            content: '',
            position: documents.length + 1,
            status: 'active',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (doc) => {
        setEditData(doc);
        setData({
            title: doc.title,
            content: doc.content,
            status: doc.status,
            position: doc.position,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editData) {
            put(route('admin.legal-documents.update', editData.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.legal-documents.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const deleteDoc = (id) => {
        Swal.fire({
            title: 'Delete this section?',
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
                router.delete(route('admin.legal-documents.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Document section has been removed.',
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

    const tabs = [
        { name: 'Terms of Service', value: 'terms', icon: 'description' },
        { name: 'Privacy Policy', value: 'privacy', icon: 'security' },
        { name: 'Cookie Policy', value: 'cookies', icon: 'cookie' },
    ];

    return (
        <AdminLayout>
            <Head title="Legal Documents" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Legal Documents</h1>
                        <p className="text-gray-500 font-medium tracking-tight">Manage the content and structure of your site's policies.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold flex items-center hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        <span className="material-icons-outlined mr-2">add</span>
                        Create Section
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 bg-gray-100 p-1.5 rounded-3xl w-fit border border-gray-200">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.value}
                            href={route('admin.legal-documents.index', { type: tab.value })}
                            className={`flex items-center px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${currentType === tab.value
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <span className="material-icons-outlined mr-2 text-lg">{tab.icon}</span>
                            {tab.name}
                        </Link>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                    {documents.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-icons-outlined text-4xl text-gray-200 mb-2">find_in_page</span>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No sections found for this document</p>
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <div key={doc.id} className="p-8 group hover:bg-gray-50/50 transition-all flex justify-between items-start gap-6">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center space-x-3">
                                        <span className="h-6 w-6 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-[10px] font-black border border-gray-200">
                                            {doc.position}
                                        </span>
                                        <h3 className="font-black text-gray-900 leading-tight">{doc.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${doc.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                    <div
                                        className="text-sm text-gray-500 font-medium leading-relaxed pl-9 prose prose-sm max-w-none line-clamp-2"
                                        dangerouslySetInnerHTML={{ __html: doc.content }}
                                    ></div>
                                </div>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <button onClick={() => openEditModal(doc)} className="h-10 w-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm">
                                        <span className="material-icons-outlined text-sm">edit</span>
                                    </button>
                                    <button onClick={() => deleteDoc(doc.id)} className="h-10 w-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm">
                                        <span className="material-icons-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
                        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                    {editData ? 'Edit Section' : 'Create New Section'}
                                </h2>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                    Document: {currentType.toUpperCase()}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all flex items-center justify-center">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Section Title</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm tracking-tight placeholder:text-gray-300"
                                    placeholder="e.g. 1. Introduction"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                />
                                {errors.title && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-1">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-black text-xs uppercase tracking-widest"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Display Order</label>
                                    <input
                                        type="number"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                        value={data.position}
                                        onChange={e => setData('position', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Content (HTML Support)</label>
                                <RichTextEditor
                                    value={data.content}
                                    onChange={val => setData('content', val)}
                                    placeholder="Enter the section content here..."
                                />
                                {errors.content && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-1">{errors.content}</p>}
                            </div>

                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 bg-white border border-gray-200 text-gray-400 font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center"
                                >
                                    {processing ? (
                                        <span className="material-icons-outlined animate-spin text-sm mr-2">sync</span>
                                    ) : (
                                        <span className="material-icons-outlined text-sm mr-2">{editData ? 'update' : 'add_task'}</span>
                                    )}
                                    {editData ? 'Update Section' : 'Create Section'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
