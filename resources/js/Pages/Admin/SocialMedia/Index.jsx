import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function SocialMediaIndex({ socialMedia }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        url: '',
        icon: '',
        status: 'active',
        position: 0,
    });

    const openCreateModal = () => {
        setEditData(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditData(item);
        setData({
            name: item.name,
            url: item.url,
            icon: item.icon,
            status: item.status,
            position: item.position,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editData) {
            put(route('admin.social-media.update', editData.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.social-media.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const deleteItem = (id) => {
        Swal.fire({
            title: 'Delete this Social Media?',
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
                router.delete(route('admin.social-media.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Social Media has been removed.',
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

    return (
        <AdminLayout>
            <Head title="Social Media Management" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Social Media Management</h1>
                        <p className="text-gray-500 font-medium">Manage social media links for the frontend.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold flex items-center hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        <span className="material-icons-outlined mr-2">add</span>
                        Add Social Media
                    </button>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                    {socialMedia.map((item) => (
                        <div key={item.id} className="p-6 group hover:bg-gray-50/50 transition-all flex justify-between items-center gap-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <span className="material-icons-outlined text-2xl">{item.icon || 'share'}</span>
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-black text-gray-900 leading-tight">{item.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium truncate max-w-xs">{item.url}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-xs font-black text-gray-300 uppercase tracking-widest">Pos: {item.position}</span>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(item)} className="h-10 w-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm">
                                        <span className="material-icons-outlined text-sm">edit</span>
                                    </button>
                                    <button onClick={() => deleteItem(item.id)} className="h-10 w-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm">
                                        <span className="material-icons-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {socialMedia.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons-outlined text-gray-300 text-4xl">share</span>
                            </div>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No social media links found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
                        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                {editData ? 'Edit Social Media' : 'Add Social Media'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Platform Name</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                    placeholder="e.g. Facebook"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">URL</label>
                                <input
                                    type="url"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                    placeholder="https://..."
                                    value={data.url}
                                    onChange={e => setData('url', e.target.value)}
                                />
                                {errors.url && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.url}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Icon Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                        placeholder="e.g. facebook"
                                        value={data.icon}
                                        onChange={e => setData('icon', e.target.value)}
                                    />
                                    <p className="text-[10px] text-gray-400 ml-1">Use Material Icon strings</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Position</label>
                                    <input
                                        type="number"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                        value={data.position}
                                        onChange={e => setData('position', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                <select
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg shadow-gray-200"
                                >
                                    {editData ? 'Update' : 'Add Platform'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
