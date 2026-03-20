import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function CommissionTierIndex({ tiers }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState(null);

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        name: '',
        min_amount: '',
        max_amount: '',
        commission_rate: '',
        description: '',
        icon: 'military_tech',
        status: 'active',
        sort_order: 0,
        benefits: [{ benefit: '', is_enabled: true }]
    });

    const openModal = (tier = null) => {
        if (tier) {
            setEditingTier(tier);
            setData({
                name: tier.name,
                min_amount: tier.min_amount,
                max_amount: tier.max_amount || '',
                commission_rate: tier.commission_rate,
                description: tier.description || '',
                icon: tier.icon || 'military_tech',
                status: tier.status,
                sort_order: tier.sort_order,
                benefits: tier.benefits.length > 0 ? tier.benefits.map(b => ({ benefit: b.benefit, is_enabled: b.is_enabled })) : [{ benefit: '', is_enabled: true }]
            });
        } else {
            setEditingTier(null);
            reset();
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const addBenefit = () => {
        setData('benefits', [...data.benefits, { benefit: '', is_enabled: true }]);
    };

    const removeBenefit = (index) => {
        const newBenefits = data.benefits.filter((_, i) => i !== index);
        setData('benefits', newBenefits);
    };

    const updateBenefit = (index, value) => {
        const newBenefits = [...data.benefits];
        newBenefits[index].benefit = value;
        setData('benefits', newBenefits);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingTier) {
            router.post(route('admin.commission-tiers.update', editingTier.id), {
                _method: 'PATCH',
                ...data
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Updated!', 'Tier has been updated.', 'success');
                }
            });
        } else {
            post(route('admin.commission-tiers.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    Swal.fire('Created!', 'New tier added.', 'success');
                }
            });
        }
    };

    const deleteTier = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.commission-tiers.destroy', id), {
                    onSuccess: () => Swal.fire('Deleted!', 'Tier removed.', 'success')
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Commission Tiers" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Commission Tiers</h1>
                        <p className="text-gray-500 font-medium text-sm text-neutral-400">Configure earning levels and platform commissions.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center shadow-lg transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-icons-outlined mr-2">add</span>
                        Create Tier
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tiers.map((tier) => (
                        <div key={tier.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all border-b-4 border-b-orange-500 transform hover:-translate-y-1">
                            <div className="p-8 space-y-6 flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                                        <span className="material-icons-outlined text-2xl">{tier.icon || 'military_tech'}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => openModal(tier)} className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
                                            <span className="material-icons-outlined">edit</span>
                                        </button>
                                        <button onClick={() => deleteTier(tier.id)} className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
                                            <span className="material-icons-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-gray-900">{tier.name}</h3>
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">
                                        ${tier.min_amount} - {tier.max_amount ? `$${tier.max_amount}` : 'Unlimited'}
                                    </p>
                                </div>

                                <div className="bg-orange-50/50 p-6 rounded-3xl text-center border border-orange-100">
                                    <span className="text-4xl font-black text-orange-500">{parseFloat(tier.commission_rate)}%</span>
                                    <p className="text-orange-400 font-black text-[10px] uppercase tracking-[0.2em] mt-2">{tier.description || 'PER ORDER'}</p>
                                </div>

                                <div className="space-y-3">
                                    {tier.benefits.map((benefit, i) => (
                                        <div key={i} className="flex items-center text-sm font-medium text-gray-600">
                                            <span className="material-icons-outlined text-green-500 text-lg mr-3">check_circle</span>
                                            {benefit.benefit}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center mt-auto">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tier.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {tier.status}
                                </span>
                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Order: {tier.sort_order}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 font-black tracking-tight">
                            <h2>{editingTier ? 'Edit Commission Tier' : 'Create New Tier'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-all font-black uppercase tracking-widest text-[10px]">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-8 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tier Name</label>
                                    <input type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. Platinum Tier" />
                                    {errors.name && <p className="text-red-500 text-[10px] font-bold pl-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Commission Rate (%)</label>
                                    <input type="number" step="0.01" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" value={data.commission_rate} onChange={e => setData('commission_rate', e.target.value)} placeholder="0.00" />
                                    {errors.commission_rate && <p className="text-red-500 text-[10px] font-bold pl-1">{errors.commission_rate}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Min Amount ($)</label>
                                    <input type="number" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" value={data.min_amount} onChange={e => setData('min_amount', e.target.value)} placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Max Amount ($ - blank for unlimited)</label>
                                    <input type="number" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" value={data.max_amount} onChange={e => setData('max_amount', e.target.value)} placeholder="Unlimited" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Icon (Material Icon Name)</label>
                                    <input type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" value={data.icon} onChange={e => setData('icon', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Sort Order</label>
                                    <input type="number" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" value={data.sort_order} onChange={e => setData('sort_order', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</label>
                                    <select className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" value={data.status} onChange={e => setData('status', e.target.value)}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Benefits / Features</label>
                                    <button type="button" onClick={addBenefit} className="text-orange-500 text-[10px] font-black uppercase tracking-widest hover:text-orange-600 transition-colors">+ Add Benefit</button>
                                </div>
                                <div className="space-y-3">
                                    {data.benefits.map((benefit, index) => (
                                        <div key={index} className="flex gap-4">
                                            <input type="text" className="flex-1 px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm" value={benefit.benefit} onChange={e => updateBenefit(index, e.target.value)} placeholder="Enter benefit text..." />
                                            <button type="button" onClick={() => removeBenefit(index)} className="p-4 text-gray-300 hover:text-rose-500 transition-colors">
                                                <span className="material-icons-outlined">remove_circle_outline</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={processing} className="w-full py-5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all disabled:opacity-50">
                                {editingTier ? 'Update Commission Tier' : 'Create Commission Tier'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
