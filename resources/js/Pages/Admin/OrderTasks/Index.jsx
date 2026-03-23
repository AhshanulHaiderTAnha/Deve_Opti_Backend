import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function OrderTaskIndex({ tasks, commissionTiers, products }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        title: '',
        commission_type: 'tier',
        commission_tier_id: '',
        manual_commission_percent: '',
        required_orders: 25,
        status: 'active',
        product_ids: []
    });

    const openModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setData({
                title: task.title,
                commission_type: task.commission_type,
                commission_tier_id: task.commission_tier_id || '',
                manual_commission_percent: task.manual_commission_percent || '',
                required_orders: task.required_orders,
                status: task.status,
                product_ids: task.products.map(p => p.id)
            });
        } else {
            setEditingTask(null);
            reset();
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingTask) {
            router.post(route('admin.order-tasks.update', editingTask.id), {
                _method: 'PATCH',
                ...data
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Updated!', 'Task template has been updated.', 'success');
                }
            });
        } else {
            post(route('admin.order-tasks.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    Swal.fire('Created!', 'New task template created.', 'success');
                }
            });
        }
    };

    const deleteTask = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.order-tasks.destroy', id), {
                    onSuccess: () => Swal.fire('Deleted!', 'Task removed.', 'success')
                });
            }
        });
    };

    // Helper for multi-select
    const handleProductSelect = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        setData('product_ids', selectedOptions);
    };

    return (
        <AdminLayout>
            <Head title="Order Tasks Templates" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Task Templates</h1>
                        <p className="text-gray-500 font-medium text-sm text-neutral-400">Manage batches of product orders that users can grab and process.</p>
                    </div>
                    <button 
                        onClick={() => openModal()}
                        className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center shadow-lg transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-icons-outlined mr-2">add</span>
                        Create Task Template
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tasks.map((task) => (
                        <div key={task.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-start bg-gray-50/50">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{task.title}</h3>
                                    <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {task.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex space-x-1">
                                    <button onClick={() => openModal(task)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <span className="material-icons-outlined text-[20px]">edit</span>
                                    </button>
                                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                        <span className="material-icons-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 flex-1">
                                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                                    <span className="text-gray-500">Commission Type:</span>
                                    <span className="font-bold text-gray-900 uppercase tracking-wider">{task.commission_type}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                                    <span className="text-gray-500">Rate/Tier:</span>
                                    <span className="font-black text-orange-500 bg-orange-50 px-2 py-1 rounded">
                                        {task.commission_type === 'tier' ? task.tier?.name : `${task.manual_commission_percent}% (Manual)`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                                    <span className="text-gray-500">Required Orders to Finish:</span>
                                    <span className="font-bold text-blue-600">{task.required_orders} items</span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Product Pool ({task.products.length})</span>
                                    <div className="flex flex-wrap gap-2">
                                        {task.products.slice(0, 5).map(p => (
                                            <span key={p.id} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[10px] font-medium truncate max-w-[150px]">
                                                {p.title}
                                            </span>
                                        ))}
                                        {task.products.length > 5 && (
                                            <span className="bg-gray-100 text-gray-400 px-2 py-1 rounded-md text-[10px] font-bold">+{task.products.length - 5} more</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {tasks.length === 0 && (
                        <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100 border-dashed">
                            <span className="material-icons-outlined text-4xl text-gray-300 mb-3 block">inventory_2</span>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks templates created</h3>
                            <p className="text-gray-500 text-sm">Create a task template to group products for user order assignments.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-black text-gray-900 tracking-tight">{editingTask ? 'Edit Task Template' : 'Create Task Template'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-rose-500 transition-colors">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Task Title Name</label>
                                <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="e.g. VIP Shopper Pool A" />
                                {errors.title && <p className="text-red-500 text-xs font-bold">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commission Type</label>
                                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm" value={data.commission_type} onChange={e => setData('commission_type', e.target.value)}>
                                        <option value="tier">Commission Tier (Plan based)</option>
                                        <option value="manual">Manual Fixed %</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Required Orders to Complete</label>
                                    <input type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm" value={data.required_orders} onChange={e => setData('required_orders', e.target.value)} min="1" />
                                    {errors.required_orders && <p className="text-red-500 text-xs font-bold">{errors.required_orders}</p>}
                                </div>
                            </div>

                            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                {data.commission_type === 'tier' ? (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Commission Tier</label>
                                        <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm" value={data.commission_tier_id} onChange={e => setData('commission_tier_id', e.target.value)}>
                                            <option value="">-- Select a Tier --</option>
                                            {commissionTiers.map(tier => (
                                                <option key={tier.id} value={tier.id}>{tier.name} ({parseFloat(tier.commission_rate)}%)</option>
                                            ))}
                                        </select>
                                        {errors.commission_tier_id && <p className="text-red-500 text-xs font-bold">{errors.commission_tier_id}</p>}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Manual Commission Percent (%)</label>
                                        <input type="number" step="0.01" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm" value={data.manual_commission_percent} onChange={e => setData('manual_commission_percent', e.target.value)} placeholder="e.g. 5.5" />
                                        {errors.manual_commission_percent && <p className="text-red-500 text-xs font-bold">{errors.manual_commission_percent}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                                    <span>Select Products for this Task Pool</span>
                                    <span className="text-blue-500 font-black">{data.product_ids.length} selected</span>
                                </label>
                                <p className="text-[10px] text-gray-400 mb-1">Click the items below to add or remove them from the task.</p>
                                
                                <div className="w-full bg-white border border-gray-200 rounded-xl h-[18rem] overflow-y-auto custom-scrollbar shadow-inner">
                                    <div className="p-2 space-y-1">
                                        {products.map(product => {
                                            const isSelected = data.product_ids.includes(product.id);
                                            return (
                                                <label 
                                                    key={product.id} 
                                                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border ${
                                                        isSelected 
                                                        ? 'bg-orange-50 border-orange-200 text-orange-900' 
                                                        : 'bg-transparent border-transparent hover:bg-gray-50 text-gray-700'
                                                    }`}
                                                >
                                                    <div className="flex-shrink-0 mr-3">
                                                        <input 
                                                            type="checkbox" 
                                                            className="form-checkbox h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500 transition-all"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setData('product_ids', [...data.product_ids, product.id]);
                                                                } else {
                                                                    setData('product_ids', data.product_ids.filter(id => id !== product.id));
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate">{product.title}</p>
                                                        <p className="text-xs text-gray-500 truncate flex items-center mt-0.5">
                                                            <span className="font-black text-gray-900 mr-2">${product.price}</span>
                                                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold uppercase tracking-wider">{product.platform}</span>
                                                        </p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                        {products.length === 0 && (
                                            <div className="p-4 text-center text-sm text-gray-500">No products available.</div>
                                        )}
                                    </div>
                                </div>
                                {errors.product_ids && <p className="text-red-500 text-xs font-bold">{errors.product_ids}</p>}
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" className="form-checkbox h-5 w-5 text-orange-500 rounded border-gray-300" checked={data.status === 'active'} onChange={e => setData('status', e.target.checked ? 'active' : 'inactive')} />
                                    <span className="text-sm font-bold text-gray-700">Task Template is Active</span>
                                </label>
                            </div>

                            <button type="submit" disabled={processing} className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all disabled:opacity-50 mt-4">
                                {editingTask ? 'Save Changes' : 'Create Task'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
