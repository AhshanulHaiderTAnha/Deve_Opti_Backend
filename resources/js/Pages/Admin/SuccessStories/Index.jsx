import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function SuccessStoryIndex({ stories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        designation: '',
        content: '',
        image: null,
        total_earned: '',
        time_period: '',
        status: 'published',
        position: 0,
    });

    const openCreateModal = () => {
        setEditData(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (story) => {
        setEditData(story);
        setData({
            name: story.name,
            designation: story.designation || '',
            content: story.content,
            image: null,
            total_earned: story.total_earned || '',
            time_period: story.time_period || '',
            status: story.status,
            position: story.position,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editData) {
            // Use POST with _method=PUT for multipart updates in Laravel
            const formData = new FormData();
            formData.append('_method', 'PUT');
            Object.keys(data).forEach(key => {
                if (data[key] !== null) formData.append(key, data[key]);
            });
            router.post(route('admin.success-stories.update', editData.id), formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.success-stories.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const deleteStory = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this success story!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!',
            customClass: {
                popup: 'rounded-[2rem]',
                confirmButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3',
                cancelButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.success-stories.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Success story has been deleted.',
                            icon: 'success',
                            confirmButtonColor: '#f59e0b',
                            customClass: {
                                popup: 'rounded-[2rem]',
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
            <Head title="Success Stories" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Success Stories</h1>
                        <p className="text-gray-500 font-medium">Manage and feature top user testimonials.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold flex items-center hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        <span className="material-icons-outlined mr-2">add</span>
                        Add New Story
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stories.data.map((story) => (
                        <div key={story.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-gray-100 transition-all duration-500">
                            <div className="relative h-48 bg-gray-100">
                                {story.image_url ? (
                                    <img src={story.image_url} alt={story.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300">
                                        <span className="material-icons-outlined text-4xl">photo</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(story)} className="h-10 w-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-gray-600 hover:text-orange-600 transition-colors shadow-sm">
                                        <span className="material-icons-outlined text-sm">edit</span>
                                    </button>
                                    <button onClick={() => deleteStory(story.id)} className="h-10 w-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors shadow-sm">
                                        <span className="material-icons-outlined text-sm">delete</span>
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${story.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                        }`}>
                                        {story.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 space-y-4">
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg leading-tight">{story.name}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{story.designation}</p>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-3 font-medium leading-relaxed">
                                    "{story.content}"
                                </p>
                                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-emerald-600 font-black text-sm">{story.total_earned}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Earnings</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-gray-900 font-black text-sm">{story.time_period}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Period</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
                        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                {editData ? 'Edit Success Story' : 'Add New Success Story'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                        placeholder="User Name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                        placeholder="e.g. Full-time Earner"
                                        value={data.designation}
                                        onChange={e => setData('designation', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Total Earned</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                        placeholder="e.g. $4,500+"
                                        value={data.total_earned}
                                        onChange={e => setData('total_earned', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Time Period</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                        placeholder="e.g. 3 months"
                                        value={data.time_period}
                                        onChange={e => setData('time_period', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="published">Published</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Order Position</label>
                                    <input
                                        type="number"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                        value={data.position}
                                        onChange={e => setData('position', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Story Content</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm h-32 resize-none"
                                    placeholder="The user's success story..."
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                ></textarea>
                                {errors.content && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.content}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">User Image</label>
                                <div className="flex items-center space-x-4">
                                    <div className="relative group flex-1">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            onChange={e => setData('image', e.target.files[0])}
                                        />
                                        <div className="w-full px-6 py-8 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center group-hover:bg-gray-50 transition-colors">
                                            <span className="material-icons-outlined text-gray-400 mb-2">cloud_upload</span>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                {data.image ? data.image.name : 'Click to upload user image'}
                                            </span>
                                        </div>
                                    </div>
                                    {editData?.image_url && !data.image && (
                                        <img src={editData.image_url} className="h-20 w-20 rounded-2xl object-cover border border-gray-100" />
                                    )}
                                </div>
                                {errors.image && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.image}</p>}
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
                                    {editData ? 'Update Story' : 'Save Story'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
