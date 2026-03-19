import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function PaymentMethodIndex({ methods }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        image: null,
        status: 'active',
        details: [{ label: '', value: '', note: '' }],
    });

    const openModal = (method = null) => {
        if (method) {
            setEditingMethod(method);
            setData({
                name: method.name,
                status: method.status,
                image: null,
                details: method.details.map(d => ({ label: d.label, value: d.value, note: d.note || '' })),
            });
        } else {
            setEditingMethod(null);
            reset();
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const addDetailField = () => {
        setData('details', [...data.details, { label: '', value: '', note: '' }]);
    };

    const removeDetailField = (index) => {
        const newDetails = [...data.details];
        newDetails.splice(index, 1);
        setData('details', newDetails);
    };

    const handleDetailChange = (index, field, value) => {
        const newDetails = [...data.details];
        newDetails[index][field] = value;
        setData('details', newDetails);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingMethod) {
            router.post(route('admin.payment-methods.update', editingMethod.id), {
                _method: 'PATCH',
                ...data
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.payment-methods.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const deleteMethod = (id) => {
        Swal.fire({
            title: 'Delete Gateway?',
            text: "Are you sure you want to delete this payment gateway? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Delete',
            background: '#ffffff',
            borderRadius: '1.25rem'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.payment-methods.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Payment gateway has been deleted successfully.',
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
            <Head title="Payment Methods" />

            <div className="space-y-6 text-gray-900">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Payment Gateways</h1>
                        <p className="text-gray-500 font-medium">Configure supported payment methods and wallet details.</p>
                    </div>
                    <button 
                        onClick={() => openModal()}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center shadow-lg shadow-orange-100 transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-icons-outlined mr-2">add_card</span>
                        Add Method
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {methods.map((method) => (
                        <div key={method.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1 group">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 overflow-hidden">
                                        {method.logo_url ? (
                                            <img src={method.logo_url} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="material-icons-outlined text-orange-400 text-3xl">account_balance_wallet</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black tracking-tight">{method.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                            method.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            {method.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(method)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                                        <span className="material-icons-outlined text-sm">edit</span>
                                    </button>
                                    <button onClick={() => deleteMethod(method.id)} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                        <span className="material-icons-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-8 flex-1 bg-gray-50/30 space-y-4">
                                {method.details.map((detail, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{detail.label}</p>
                                        <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-center justify-between">
                                            <code className="text-xs font-bold text-gray-600 truncate">{detail.value}</code>
                                            <button onClick={() => navigator.clipboard.writeText(detail.value)} className="hover:text-orange-500">
                                                <span className="material-icons-outlined text-sm">content_copy</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {method.details.length === 0 && (
                                    <p className="text-center text-xs text-gray-400 italic py-4">No account details added.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-xl font-black tracking-tight">
                                {editingMethod ? 'Edit Gateway' : 'New Gateway'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={submit} className="flex flex-col max-h-[85vh]">
                            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Method Name</label>
                                        <input 
                                            type="text"
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="e.g., Binance Pay"
                                        />
                                        {errors.name && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.name}</p>}
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
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Logo / Icon</label>
                                    <div className="relative h-24 w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all hover:border-orange-500/50">
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setData('image', e.target.files[0])} />
                                        {data.image ? (
                                            <div className="flex items-center space-x-4">
                                                <img src={URL.createObjectURL(data.image)} className="h-16 w-16 rounded-xl object-cover" />
                                                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Change Icon</span>
                                            </div>
                                        ) : (
                                            <div className="text-center flex space-x-3 items-center">
                                                <span className="material-icons-outlined text-gray-300">image</span>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Upload Icon</p>
                                            </div>
                                        )}
                                    </div>
                                    {errors.image && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.image}</p>}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Account Details & Wallets</label>
                                        <button type="button" onClick={addDetailField} className="text-orange-500 text-[10px] font-black uppercase flex items-center hover:text-orange-600">
                                            <span className="material-icons-outlined text-sm mr-1">add_circle</span> Add Field
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {data.details.map((detail, index) => (
                                            <div key={index} className="p-6 bg-gray-50 rounded-[2rem] space-y-4 relative group/detail">
                                                <button type="button" onClick={() => removeDetailField(index)} className="absolute top-4 right-4 text-gray-300 hover:text-rose-500 transition-colors">
                                                    <span className="material-icons-outlined text-sm">remove_circle</span>
                                                </button>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Label</label>
                                                        <input 
                                                            type="text"
                                                            className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 text-xs font-bold"
                                                            value={detail.label}
                                                            onChange={e => handleDetailChange(index, 'label', e.target.value)}
                                                            placeholder="e.g., Wallet Address"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Value</label>
                                                        <input 
                                                            type="text"
                                                            className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 text-xs font-bold"
                                                            value={detail.value}
                                                            onChange={e => handleDetailChange(index, 'value', e.target.value)}
                                                            placeholder="e.g., 0x..."
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Instructions / Note</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 text-xs font-bold"
                                                        value={detail.note}
                                                        onChange={e => handleDetailChange(index, 'note', e.target.value)}
                                                        placeholder="e.g., Network: TRC20"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 border-t border-gray-50 bg-white">
                                <button 
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-5 bg-gray-900 hover:bg-black text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all disabled:opacity-50"
                                >
                                    {editingMethod ? 'Save Changes' : 'Initialize Gateway'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
