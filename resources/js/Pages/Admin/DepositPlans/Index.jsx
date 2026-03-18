import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function DepositPlanIndex({ plans, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        duration: '',
        duration_type: 'days',
        status: 'published',
        image: null,
        benefits: [''],
        levels: [{ min_amount: '', max_amount: '', profit_value: '', profit_type: 'percentage' }],
    });

    const openModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setData({
                name: plan.name,
                duration: plan.duration,
                duration_type: plan.duration_type,
                status: plan.status,
                image: null,
                benefits: plan.benefits?.length > 0 ? plan.benefits.map(b => b.benefit_text) : [''],
                levels: plan.levels?.length > 0 ? plan.levels.map(l => ({
                    min_amount: l.min_amount,
                    max_amount: l.max_amount,
                    profit_value: l.profit_value,
                    profit_type: l.profit_type
                })) : [{ min_amount: '', max_amount: '', profit_value: '', profit_type: 'percentage' }],
            });
        } else {
            setEditingPlan(null);
            reset();
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const addBenefit = () => setData('benefits', [...data.benefits, '']);
    const removeBenefit = (index) => {
        const newBenefits = [...data.benefits];
        newBenefits.splice(index, 1);
        setData('benefits', newBenefits);
    };
    const handleBenefitChange = (index, value) => {
        const newBenefits = [...data.benefits];
        newBenefits[index] = value;
        setData('benefits', newBenefits);
    };

    const addLevel = () => setData('levels', [...data.levels, { min_amount: '', max_amount: '', profit_value: '', profit_type: 'percentage' }]);
    const removeLevel = (index) => {
        const newLevels = [...data.levels];
        newLevels.splice(index, 1);
        setData('levels', newLevels);
    };
    const handleLevelChange = (index, field, value) => {
        const newLevels = [...data.levels];
        newLevels[index] = { ...newLevels[index], [field]: value };
        setData('levels', newLevels);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingPlan) {
            router.post(route('admin.deposit-plans.update', editingPlan.id), {
                _method: 'PATCH',
                ...data
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.deposit-plans.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const deletePlan = (id) => {
        if (confirm('Are you sure you want to delete this deposit plan?')) {
            router.delete(route('admin.deposit-plans.destroy', id), { preserveScroll: true });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.deposit-plans.index'), { search: searchQuery }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title="Deposit Plan Management" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900">Deposit Plans</h1>
                        <p className="text-gray-500 font-medium">Configure investment tiers and dynamic levels.</p>
                    </div>
                    <button 
                        onClick={() => openModal()}
                        className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center shadow-lg transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-icons-outlined mr-2 text-xl">add_card</span>
                        New Plan
                    </button>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">search</span>
                        <input 
                            type="text"
                            placeholder="Search plans..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.data.map((plan) => (
                        <div key={plan.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="h-16 w-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                                        {plan.image_url ? (
                                            <img src={plan.image_url} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="material-icons-outlined text-gray-300 transform scale-125">account_balance</span>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => openModal(plan)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                                            <span className="material-icons-outlined text-sm">edit</span>
                                        </button>
                                        <button onClick={() => deletePlan(plan.id)} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                            <span className="material-icons-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-500 transition-colors uppercase tracking-tight">{plan.name}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                        {plan.duration} {plan.duration_type} Plan • {plan.levels_count} {plan.levels_count === 1 ? 'Tier' : 'Tiers'}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-[2rem] space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <span>Profit Structure</span>
                                        <span className={`px-2 py-0.5 rounded-full ${plan.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>{plan.status}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {plan.levels?.slice(0, 3).map((level, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-gray-500">${level.min_amount} - ${level.max_amount}</span>
                                                <span className="text-orange-600">{level.profit_type === 'percentage' ? `${level.profit_value}%` : `$${level.profit_value}`}</span>
                                            </div>
                                        ))}
                                        {plan.levels_count > 3 && <p className="text-[10px] text-gray-400 font-bold text-center pt-1 border-t border-gray-100">+{plan.levels_count - 3} more tiers</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center py-4">
                    <div className="flex space-x-1">
                        {plans.links.map((link, i) => (
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
                    <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h2 className="text-xl font-black tracking-tight">{editingPlan ? 'Edit Deposit Plan' : 'New Deposit Plan'}</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure multi-tiered profit levels</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-all">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={submit} className="flex flex-col max-h-[85vh]">
                            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Plan Name</label>
                                                <input type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" value={data.name} onChange={e => setData('name', e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Duration</label>
                                                    <input type="number" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" value={data.duration} onChange={e => setData('duration', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Scale</label>
                                                    <select className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" value={data.duration_type} onChange={e => setData('duration_type', e.target.value)}>
                                                        <option value="hours">Hours</option>
                                                        <option value="days">Days</option>
                                                        <option value="weeks">Weeks</option>
                                                        <option value="months">Months</option>
                                                        <option value="years">Years</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center pl-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Levels / Tiers</label>
                                                <button type="button" onClick={addLevel} className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 transition-colors">+ Add Tier</button>
                                            </div>
                                            <div className="space-y-3">
                                                {data.levels.map((level, index) => (
                                                    <div key={index} className="grid grid-cols-1 md:grid-cols-9 gap-3 items-center bg-gray-50 p-4 rounded-3xl group animate-in slide-in-from-left-2 duration-200">
                                                        <div className="md:col-span-2">
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">$</span>
                                                                <input type="number" placeholder="Min" className="w-full pl-8 pr-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs" value={level.min_amount} onChange={e => handleLevelChange(index, 'min_amount', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">$</span>
                                                                <input type="number" placeholder="Max" className="w-full pl-8 pr-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs" value={level.max_amount} onChange={e => handleLevelChange(index, 'max_amount', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <input type="number" step="0.01" placeholder="Profit" className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs text-orange-600" value={level.profit_value} onChange={e => handleLevelChange(index, 'profit_value', e.target.value)} />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <select className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs" value={level.profit_type} onChange={e => handleLevelChange(index, 'profit_type', e.target.value)}>
                                                                <option value="percentage">% Pct</option>
                                                                <option value="fixed">$ Fixed</option>
                                                            </select>
                                                        </div>
                                                        {data.levels.length > 1 && (
                                                            <button type="button" onClick={() => removeLevel(index)} className="h-10 w-10 text-gray-400 hover:text-rose-500 transition-colors">
                                                                <span className="material-icons-outlined text-sm">remove_circle_outline</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center pl-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Benefits</label>
                                                <button type="button" onClick={addBenefit} className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 transition-colors">+ Add Row</button>
                                            </div>
                                            <div className="space-y-2">
                                                {data.benefits.map((benefit, index) => (
                                                    <div key={index} className="flex space-x-2 items-center">
                                                        <input type="text" placeholder="Ex: Priority Support" className="flex-1 px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-xs" value={benefit} onChange={e => handleBenefitChange(index, e.target.value)} />
                                                        {data.benefits.length > 1 && (
                                                            <button type="button" onClick={() => removeBenefit(index)} className="h-10 w-10 text-gray-300 hover:text-rose-500 transition-colors">
                                                                <span className="material-icons-outlined text-sm">close</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Plan Badge</label>
                                            <div className="relative aspect-square w-full bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all hover:border-orange-500/50">
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setData('image', e.target.files[0])} />
                                                {data.image ? (
                                                    <img src={URL.createObjectURL(data.image)} className="h-full w-full object-contain p-8" />
                                                ) : editingPlan?.image_url ? (
                                                    <img src={editingPlan.image_url} className="h-full w-full object-contain p-8" />
                                                ) : (
                                                    <div className="text-center text-gray-300">
                                                        <span className="material-icons-outlined text-4xl mb-2">diamond</span>
                                                        <p className="text-[10px] font-black uppercase">Upload Icon</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Visibility</label>
                                            <select className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold" value={data.status} onChange={e => setData('status', e.target.value)}>
                                                <option value="published">Published</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-gray-50 bg-white flex space-x-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">Cancel</button>
                                <button type="submit" disabled={processing} className="flex-[2] py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all">
                                    {editingPlan ? 'Update Plan' : 'Save Plan Configuration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
