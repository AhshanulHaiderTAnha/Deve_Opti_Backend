import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function SellerIndex({ sellers, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSeller, setEditingSeller] = useState(null);

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        image: null,
        status: 'active',
    });

    const openModal = (seller = null) => {
        if (seller) {
            setEditingSeller(seller);
            setData({
                name: seller.name,
                email: seller.email,
                status: seller.status,
                image: null,
            });
        } else {
            setEditingSeller(null);
            reset();
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingSeller) {
            router.post(route('admin.sellers.update', editingSeller.id), {
                _method: 'PATCH',
                ...data
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.sellers.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const deleteSeller = (id) => {
        Swal.fire({
            title: 'Delete Seller?',
            text: "Are you sure you want to delete this seller? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Delete',
            background: '#ffffff',
            borderRadius: '1.25rem'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.sellers.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Seller has been deleted successfully.',
                            icon: 'success',
                            confirmButtonColor: '#e11d48'
                        });
                    }
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Sellers Management" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Sellers Catalog</h1>
                        <p className="text-gray-500 font-medium">Manage your platform's sellers and their basic information.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center shadow-lg shadow-orange-100 transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-icons-outlined mr-2">add</span>
                        Add New Seller
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:max-w-md">
                        <span className="material-icons-outlined absolute left-4 top-3.5 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search sellers by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 transition-all font-medium text-sm"
                            value={filters.search || ''}
                            onChange={e => router.get(route('admin.sellers.index'), { search: e.target.value }, { preserveState: true })}
                        />
                    </div>
                    <a
                        href={route('admin.sellers.export', filters)}
                        className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold rounded-xl transition-all uppercase tracking-wider text-xs"
                    >
                        <span className="material-icons-outlined mr-2 text-sm">download</span>
                        Export CSV
                    </a>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Seller</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sellers.data.map((seller) => (
                                <tr key={seller.id} className="hover:bg-orange-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 rounded-xl bg-orange-100/50 overflow-hidden mr-4 border border-orange-50 flex items-center justify-center">
                                                {seller.image_url ? (
                                                    <img src={seller.image_url} alt={seller.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="material-icons-outlined text-orange-400">storefront</span>
                                                )}
                                            </div>
                                            <span className="font-bold text-gray-900 tracking-tight">{seller.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-medium text-gray-500">{seller.email}</td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${seller.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                            {seller.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-2">
                                        <button
                                            onClick={() => openModal(seller)}
                                            className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                                        >
                                            <span className="material-icons-outlined">edit_note</span>
                                        </button>
                                        <button
                                            onClick={() => deleteSeller(seller.id)}
                                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                            <span className="material-icons-outlined">delete_outline</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                {editingSeller ? 'Edit Seller' : 'Add New Seller'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={submit} className="flex flex-col max-h-[85vh]">
                            {/* Scrollable Content Area */}
                            <div className="p-10 space-y-6 overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                    {errors.email && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</label>
                                    <select
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold appearance-none"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Profile Image</label>
                                    <div className="relative h-32 w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all hover:border-orange-500/50">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={e => setData('image', e.target.files[0])}
                                        />
                                        {data.image ? (
                                            <div className="flex items-center space-x-4">
                                                <img src={URL.createObjectURL(data.image)} className="h-20 w-20 rounded-xl object-cover" />
                                                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Change Image</span>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <span className="material-icons-outlined text-gray-300 text-3xl">cloud_upload</span>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Upload Photo</p>
                                            </div>
                                        )}
                                    </div>
                                    {errors.image && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.image}</p>}
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div className="p-10 border-t border-gray-50 bg-white">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-5 bg-gray-900 hover:bg-black text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all disabled:opacity-50"
                                >
                                    {editingSeller ? 'Update Seller' : 'Create Seller'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
